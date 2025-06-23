# scan-config

i18next-scanner 설정 파일 생성 기능은 프로젝트에 맞는 i18next-scanner 설정을 인터랙티브하게 생성해요. 이는 다국어 관리의 첫 번째 단계로, 프로젝트의 기본 구조를 설정해요.

## 기능 개요

다음 기능을 수행해요.

- 지원할 언어 선택 (다중 선택 가능)
- 기본 언어 설정
- i18next-scanner.config.cjs 파일 자동 생성
- 프로젝트에 최적화된 설정 적용

## 사용 방법

### 1. CLI 실행

```bash
npx gs-i18n
```

### 2. 메뉴에서 선택

```
? 원하는 작업을 선택하세요
  스프레드시트 정보 조회하기
❯ i18next-scanner 파일 생성하기
  ...
```

### 3. 언어 선택 (다중 선택)

```
? 지원할 언어를 선택하세요 (선택: 스페이스바)
◉ 한국어
◯ 영어 (미국)
◯ 일본어
◯ 중국어 (간체)
◯ 중국어 (번체)
◯ 프랑스어
◯ 독일어
```

::: tip 언어 선택
스페이스바로 여러 언어를 선택할 수 있어요. 엔터를 누르면 선택이 완료되어요.
:::

### 4. 기본 언어 설정

```
? 기본 언어를 선택하세요
❯ ko-KR
  en-US
  ja-JP
```

### 5. 설정 파일 생성 완료

```
설정 파일 생성 중... ✔
i18next-scanner 설정 파일이 생성되었습니다: /path/to/project/i18next-scanner.config.cjs
```

## 생성되는 설정 파일

`i18next-scanner.config.cjs` 파일이 프로젝트 루트에 생성되어요.

```javascript
// i18next-scanner 설정 파일
// 자동 생성됨: 2025-05-11T10:00:00.000Z

module.exports = {
  input: ["./src/**/*.{ts,tsx}", "!**/node_modules/**"],
  options: {
    defaultLng: "ko-KR",
    lngs: ["ko-KR", "en-US", "ja-JP"],
    ns: ["common"], // 여러 네임스페이스를 배열로 지정
    func: {
      list: ["i18next.t", "i18n.t", "t"],
      extensions: [".ts", ".tsx"],
    },
    resource: {
      loadPath: "./public/locales/{{lng}}/{{ns}}.json",
      savePath: "./public/locales/{{lng}}/{{ns}}.json",
    },
    defaultValue(lng, ns, key) {
      const keyAsDefaultValue = ["ko-KR"];
      if (keyAsDefaultValue.includes(lng)) {
        const separator = "~~";
        const value = key.includes(separator) ? key.split(separator)[1] : key;
        return value;
      }
      return "";
    },
    compatibilityJSON: "v4", // https://github.com/i18next/i18next-scanner/pull/252
    keySeparator: false,
    nsSeparator: false,
    prefix: "%{",
    suffix: "}",
    metadata: {
      columnKeyToHeader: {
        key: "키",
        "ko-KR": "ko-KR",
        "en-US": "en-US",
        "ja-JP": "ja-JP",
      },
    },
  },
};
```

## 설정 상세 설명

### input 설정

```javascript
input: ["./src/**/*.{ts,tsx}", "!**/node_modules/**"];
```

- `src` 폴더 아래의 모든 TypeScript/TSX 파일 스캔
- `node_modules` 폴더는 제외

### 언어 설정

```javascript
defaultLng: "ko-KR",
lngs: ["ko-KR", "en-US", "ja-JP"]
```

- 기본 언어와 지원 언어 목록
- Google Sheets 열 구조와 매핑

### 리소스 경로

```javascript
resource: {
  loadPath: "./public/locales/{{lng}}/{{ns}}.json",
  savePath: "./public/locales/{{lng}}/{{ns}}.json",
}
```

- 번역 파일 저장 위치
- `lng` 플레이스홀더는 언어 코드로 대체

### 메타데이터

```javascript
metadata: {
  columnKeyToHeader: {
    "key": "키",
    "ko-KR": "한국어",
    "en-US": "영어 (미국)",
    "ja-JP": "일본어"
  }
}
```

- Google Sheets 열 헤더 매핑
- 시트 구조와 코드를 연결하는 중요한 설정

## 주의사항

::: warning 기존 파일 존재할 때
이미 `i18next-scanner.config.cjs` 파일이 존재하는 경우, 생성을 취소해요. 기존 설정을 백업하거나 삭제한 후 다시 시도하세요.
:::

::: tip 설정 커스터마이징
생성된 설정 파일은 필요에 따라 수정할 수 있어요. 단, `metadata.columnKeyToHeader` 부분은 Google Sheets 구조와 일치해야 해요.
:::

## 다음 단계

설정 파일이 생성되었다면

1. [다국어 파일 스캔](/usage/scan)으로 진행하여 실제 번역 키를 추출하세요.
2. 또는 설정을 검토하고 필요한 경우 수정하세요.

## 관련 기능

- [scan](/usage/scan): 생성된 설정으로 번역 키 추출
- [upload](/usage/upload): 추출된 키를 스프레드시트에 업로드
- [info](/usage/info): 스프레드시트 연결 상태 확인
