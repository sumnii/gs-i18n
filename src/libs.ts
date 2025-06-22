import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import Ajv, { type JSONSchemaType } from "ajv";
import dotenv from "dotenv";
import type {
	GoogleSpreadsheet,
	GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import type { GsI18NConfigSchema } from "./__generated__/schema";
import gsI18nSchema from "./gs-i18n-schema.json";

dotenv.config();

export const spreadsheetDocId = process.env.SPREADSHEET_DOC_ID;
export const googleServiceAccountEmail =
	process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
export const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
export const sheetId = process.env.SHEET_ID;

export const NOT_AVAILABLE_CELL = "_N/A";

export interface GsI18nConfig {
	spreadsheet: {
		docId: string;
		sheetId: number;
	};
	googleServiceAccount: {
		email: string;
		privateKey: string;
	};
}

export function getConfigPath(): string {
	return path.join(process.cwd(), "gs-i18n.json");
}

export function configExists(): boolean {
	return fs.existsSync(getConfigPath());
}

export function loadConfig() {
	if (!configExists()) {
		throw new Error("gs-i18n.json 설정 파일을 찾을 수 없습니다.");
	}

	const ajv = new Ajv();

	const validate = ajv.compile(
		gsI18nSchema as unknown as JSONSchemaType<GsI18NConfigSchema>,
	);

	const configPath = getConfigPath();
	const configContent = fs.readFileSync(configPath, "utf-8");
	const config = JSON.parse(configContent);

	if (validate(config)) {
		return config;
	}

	throw new Error(
		`gs-i18n.json 설정 파일의 스키마가 유효하지 않습니다. ${JSON.stringify(validate.errors, null, 2)}`,
	);
}

export function createConfigTemplate(): string {
	const configTemplate = {
		$schema:
			"https://raw.githubusercontent.com/jgjgill/gs-i18n/main/src/gs-i18n-schema.json",
		spreadsheet: {
			docId: "YOUR_SPREADSHEET_ID",
			sheetId: 0,
		},
		googleServiceAccount: {
			email: "YOUR_SERVICE_ACCOUNT_EMAIL@project.iam.gserviceaccount.com",
			privateKey:
				"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
		},
	};

	return JSON.stringify(configTemplate, null, 2);
}

export function getSpreadsheetDocId(): string {
	const config = loadConfig();
	return config.spreadsheet.docId;
}

export function getSpreadsheetSheetId(): number {
	const config = loadConfig();
	return config.spreadsheet.sheetId;
}
export function getGoogleServiceAccountEmail(): string {
	const config = loadConfig();
	return config.googleServiceAccount.email;
}
export function getGooglePrivateKey(): string {
	const config = loadConfig();
	return config.googleServiceAccount.privateKey.replace(/\\n/g, "\n");
}

export async function runCommand(command: string) {
	return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}

			resolve({ stdout, stderr });
		});
	});
}

export async function addNewSheet(
	doc: GoogleSpreadsheet,
	title: string,
	sheetId: number,
	headerValues: string[],
): Promise<GoogleSpreadsheetWorksheet> {
	const sheet = await doc.addSheet({
		sheetId,
		title,
		headerValues,
	});

	return sheet;
}

export function getScannerInfo() {
	const cwd = process.cwd();
	const configFilePath = path.join(cwd, "i18next-scanner.config.cjs");
	const config = require(configFilePath);

        const loadPath: string = config.options.resource.loadPath;
        const localePath: string = loadPath.replace(/\/\{\{lng\}\}\/.*$/, "");
        const namespaces: string[] = config.options.ns;
        const languages: string[] = config.options.lngs;
        const columnKeyToHeader: Record<string, string> =
                config.options.metadata.columnKeyToHeader;
        const headerValues: string[] = Object.values(columnKeyToHeader);

        return {
                loadPath,
                localePath,
                namespaces,
                languages,
                columnKeyToHeader,
                headerValues,
        };
}
