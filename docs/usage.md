# Usage

이 섹션에서는 gs-i18n의 사용법과 전체 워크플로우를 설명해요.

## 시작하기 전에

### 필수 준비사항

::: warning 중요
gs-i18n을 사용하기 전에 아래 준비사항을 완료해야 합니다.

참고하면 좋은 글: [자바스크립트로 구글 스프레드시트 활용하기](https://jgjgill-blog.netlify.app/post/google-spreadsheet-with-javascript/)
:::

#### 1. Google Cloud 설정

1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. Google Sheets API 활성화
3. 서비스 계정 생성 및 JSON 키 파일 다운로드

#### 2. Google Spreadsheet 생성

1. 새 Google Spreadsheet 생성
2. 스프레드시트 ID 복사 (URL에서 확인 가능)
3. 서비스 계정 이메일에 편집 권한 부여

#### 3. `gs-i18n.json` 설정

`gs-i18n.json` 파일은 CLI를 실행하게 되면 프로젝트 루트에 자동으로 생성되어요.

```json
{
  "$schema": "https://raw.githubusercontent.com/jgjgill/gs-i18n/main/gs-i18n-schema.json",
  "spreadsheet": {
    "docId": "YOUR_SPREADSHEET_ID",
    "sheetId": 0
  },
  "googleServiceAccount": {
    "email": "YOUR_SERVICE_ACCOUNT_EMAIL@project.iam.gserviceaccount.com",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
  }
}
```

## CLI 실행

gs-i18n은 두 가지 방식으로 실행할 수 있어요.

### npx 실행 (권장)

```bash
npx gs-i18n
```

### 전역 설치 후 실행

```bash
npm install -g gs-i18n
gs-i18n
```

## 메인 메뉴

CLI를 실행하면 다음과 같은 인터랙티브 메뉴가 표시되어요.

```
Google 스프레드시트 관리 도구

? 원하는 작업을 선택하세요
❯ 스프레드시트 정보 조회하기
  i18next-scanner 파일 생성하기
  다국어 관련 기본 파일 구성하기
  다국어 코드 시트에 반영하기
  시트 번역 내용 코드에 반영하기
  종료
```

## 전체 워크플로우

gs-i18n의 전체 워크플로우는 다음과 같아요.

### 1단계: 초기 설정

처음 gs-i18n을 사용할 때는 다음 순서를 따라주세요.

```bash
# 1. i18next-scanner 설정 파일 생성
npx gs-i18n
→ "i18next-scanner 파일 생성하기" 선택

# 2. 다국어 파일 구조 생성
npx gs-i18n
→ "다국어 관련 기본 파일 구성하기" 선택
```

### 2단계: 번역 관리 사이클

개발 중 반복적으로 실행되는 작업들

```bash
# 1. 코드 변경 후 스프레드시트에 업로드
npx gs-i18n
→ "다국어 코드 시트에 반영하기" 선택

# 2. (번역가가 Google Sheets에서 번역 작업)

# 3. 번역된 내용 다운로드
npx gs-i18n
→ "시트 번역 내용 코드에 반영하기" 선택
```

## 기능별 상세 안내

각 기능의 상세한 사용법은 다음 페이지에서 확인할 수 있어요.

- [스프레드시트 정보 조회](/usage/info)
- [i18next-scanner 설정 생성](/usage/scan-config)
- [다국어 파일 스캔](/usage/scan)
- [번역 업로드](/usage/upload)
- [번역 다운로드](/usage/download)

## 실제 사용 예시

### React 프로젝트에서의 활용

```tsx
// src/components/Header.tsx
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>
        {t("현재 언어: ")}
        {i18n.language}
      </h1>
      <h2>{t("안녕하세요.")}</h2>
    </div>
  );
}
```

위 코드를 작성하고 gs-i18n을 실행하면

1. `scan` 기능이 `현재 언어: `, `안녕하세요.` 키를 추출
2. `upload` 기능이 이 키들을 Google Sheets에 추가
3. 번역가가 각 언어별로 번역 진행
4. `download` 기능이 번역된 내용을 JSON 파일로 저장

## 파일 구조

gs-i18n 사용 후 생성되는 파일 구조

```
project/
├── gs-i18n.json                  # google-sheets 정보 설정
├── i18next-scanner.config.cjs    # scanner 설정
├── package.json
├── public/
│   └── locales/                 # 번역 파일
│       ├── ko-KR/
│       │   └── <namespace>.json
│       ├── en-US/
│       │   └── <namespace>.json
│       └── ja-JP/
│           └── <namespace>.json
└── src/
    └── components/              # React 컴포넌트
```

## 주의사항

::: tip 팁

- 작업 전 항상 스프레드시트 정보를 확인하여 연결 상태를 점검하세요.
- 새로운 언어 추가 시 scanner 설정을 업데이트해주세요.
  :::

::: warning 주의

- 스프레드시트 편집 중에는 업로드/다운로드를 피하세요.
- 민감한 정보가 포함된 번역은 별도로 관리하세요.
- `gs-i18n` 파일은 절대 git에 커밋하지 마세요.
  :::

## 다음 단계

기본적인 사용법을 이해했다면, 각 기능별 상세 페이지를 참고해주세요.
