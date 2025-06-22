import fs from "node:fs";
import path from "node:path";
import { each, fx, reduce } from "@fxts/core";
import type { GoogleSpreadsheet } from "google-spreadsheet";
import { loadSpreadsheetInfo } from "./googleSheets";
import { addNewSheet, getScannerInfo, getSpreadsheetSheetId } from "./libs";

type TranslationValue = string;
type LanguageCode = string;
type TranslationKey = string;

// 번역 데이터 타입 정의
interface TranslationsByLanguage {
	[language: LanguageCode]: TranslationValue;
}

interface TranslationKeyMap {
	[key: TranslationKey]: TranslationsByLanguage;
}

interface TranslationMap {
	[key: TranslationKey]: TranslationsByLanguage;
}

interface SheetRow {
	[columnName: string]: string;
}

/**
 * 시트에 사용될 row로 데이터 형식을 변환하는 함수
 * translatedMap으로 만들어진 데이터 형식을 변환시키는 작업을 진행
 * @example
 * { '키': '이름', '한글': '이름', '영어': '', '일본어': '' },
 * { '키': '이름_one', '한글': '_N/A', '영어': '', '일본어': '_N/A' },
 * { '키': '이름_other', '한글': '이름', '영어': '', '일본어': '' }
 */

function updateSheetRow(
	key: string,
	translations: TranslationsByLanguage,
): SheetRow {
	const { columnKeyToHeader } = getScannerInfo();

	const updatedRow = reduce(
		makeUpdateSheetRow,
		{ [columnKeyToHeader.key]: key },
		Object.entries(translations),
	);

	return updatedRow;
}

function makeUpdateSheetRow(
	result: SheetRow,
	language: [LanguageCode, TranslationValue],
): SheetRow {
	const { columnKeyToHeader } = getScannerInfo();
	const [key, value] = language;

	const header = columnKeyToHeader[key];

	if (header) {
		result[header] = value;
	}

	return result;
}

/**
 * 시트에 번역 객체 값들을 업데이트합니다.
 * @param doc - Google 스프레드시트 문서
 * @param translatedMap - 번역 데이터
 */

async function updateTranslationsFromKeyMapToSheet(
	doc: GoogleSpreadsheet,
	translatedMap: TranslationMap,
): Promise<void> {
	const title = "번역 시트";
	const { headerValues, columnKeyToHeader } = getScannerInfo();

	await doc.updateProperties({ title });

	const sheet =
		doc.sheetsById[getSpreadsheetSheetId()] ??
		(await addNewSheet(doc, title, getSpreadsheetSheetId(), headerValues));

	await sheet.setHeaderRow(headerValues);
	const rows = await sheet.getRows();

	const existKeys = reduce(
		(acc, row) => {
			const key = row.get(columnKeyToHeader.key);

			if (translatedMap[key]) {
				acc[key] = true;
			}

			return acc;
		},
		{} as Record<string, boolean>,
		rows,
	);

	const addedRows = fx(Object.entries(translatedMap))
		.filter(([key]) => !existKeys[key])
		.map(([key, translations]) => updateSheetRow(key, translations))
		.toArray();

	if (addedRows.length > 0) {
		await sheet.addRows(addedRows);
	}
}

/**
 * 데이터 관련 작업 함수
 * @param translatedKeyMap - 번역 키 맵
 * @param language - 언어 코드
 * @param json - JSON 데이터
 */

function gatherKeyMap(
	translatedKeyMap: TranslationKeyMap,
	language: string,
	json: Record<string, string>,
): void {
	each(([key, translated]) => {
		if (!translatedKeyMap[key]) {
			translatedKeyMap[key] = {};
		}

		translatedKeyMap[key][language] = translated;
	}, Object.entries(json));
}

/**
 * @description
 * 해당 파일 실행 함수
 * 폴더 및 파일을 생성하고 관련 로직을 진행
 */

export async function updateSheetFromJson(): Promise<void> {
	try {
                const { localePath, namespaces } = getScannerInfo();
                const translatedKeyMap: TranslationKeyMap = {};

		const doc = await loadSpreadsheetInfo();
		const languageFolders = await fs.promises.readdir(localePath);

                for (const language of languageFolders) {
                        for (const namespace of namespaces) {
                                const localeJsonFilePath = path.join(
                                        localePath,
                                        language,
                                        `${namespace}.json`,
                                );

                                try {
                                        const fileContent = await fs.promises.readFile(
                                                localeJsonFilePath,
                                                "utf8",
                                        );
                                        const json = JSON.parse(fileContent);

                                        gatherKeyMap(translatedKeyMap, language, json);
                                } catch (error) {
                                        if (
                                                (error as NodeJS.ErrnoException).code ===
                                                "ENOENT"
                                        ) {
                                                continue;
                                        }

                                        throw new Error(`Upload Content Error: ${error}`);
                                }
                        }
                }

		await updateTranslationsFromKeyMapToSheet(doc, translatedKeyMap);
	} catch (error) {
		throw new Error(`Upload Sheet Error: ${error}`);
	}
}
