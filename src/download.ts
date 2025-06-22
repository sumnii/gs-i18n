import fs from "node:fs";
import path from "node:path";
import { each, fx, reduce } from "@fxts/core";
import type {
	GoogleSpreadsheet,
	GoogleSpreadsheetRow,
} from "google-spreadsheet";
import { loadSpreadsheetInfo } from "./googleSheets";
import {
	NOT_AVAILABLE_CELL,
	addNewSheet,
	getScannerInfo,
	getSpreadsheetSheetId,
} from "./libs";

type LanguageMap = {
	[language: string]: {
		[key: string]: string;
	};
};

/**
 * 스프레드시트로부터 번역 데이터를 가져와 JSON 형태로 변환
 * @param doc 구글 스프레드시트 문서 객체
 * @returns 언어별 번역 데이터 매핑 객체
 */

async function fetchTranslationsFromSheetToJson(
	doc: GoogleSpreadsheet,
): Promise<LanguageMap> {
	if (getSpreadsheetSheetId() === undefined) {
		throw new Error("SHEET_ID is not defined");
	}

	const title = "번역 시트";
	const { headerValues } = getScannerInfo();

	const sheet =
		doc.sheetsById[getSpreadsheetSheetId()] ??
		(await addNewSheet(doc, title, getSpreadsheetSheetId(), headerValues));

	await sheet.setHeaderRow(headerValues);
	const rows = await sheet.getRows();

	const languagesMap = reduce(makeLanguagesMap, {}, rows);

	return languagesMap;
}

const makeLanguagesMap = (
	acc: LanguageMap,
	row: GoogleSpreadsheetRow,
): LanguageMap => {
	const { languages, columnKeyToHeader } = getScannerInfo();

	const key = row.get(columnKeyToHeader.key);

	each((language) => {
		const translatedExpression = row.get(columnKeyToHeader[language]);

		if (!acc[language]) {
			acc[language] = {};
		}

		if (translatedExpression === NOT_AVAILABLE_CELL) {
			return;
		}

		acc[language][key] = translatedExpression ?? "";
	}, languages);

	return acc;
};

export async function updateJsonFromSheet(): Promise<void> {
	try {
                const { localePath, namespaces } = getScannerInfo();

		const doc = await loadSpreadsheetInfo();
		const languagesMap = await fetchTranslationsFromSheetToJson(doc);

		const languageDirs = await fs.promises.readdir(localePath);

                await fx(languageDirs)
                        .filter((language) => languagesMap[language])
                        .toAsync()
                        .each(async (language) => {
                                for (const namespace of namespaces) {
                                        const localeJsonFilePath = path.join(
                                                localePath,
                                                language,
                                                `${namespace}.json`,
                                        );

                                        const jsonString = JSON.stringify(
                                                languagesMap[language],
                                                null,
                                                2,
                                        );
                                        fs.promises.writeFile(
                                                localeJsonFilePath,
                                                jsonString,
                                                "utf-8",
                                        );
                                }
                        });
	} catch (error) {
		throw new Error(`Download Error: ${error}`);
	}
}
