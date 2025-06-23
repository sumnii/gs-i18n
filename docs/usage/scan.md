# scan

다국어 파일 스캔 기능은 i18next-scanner를 실행하여 코드베이스에서 번역 키를 추출하고 JSON 파일을 생성해요. 이는 실제 번역 작업의 기반이 되어요.

## 기능 개요

다음 기능을 수행해요.

- 프로젝트 코드에서 번역 함수(t, i18n.t 등) 호출 감지
- 번역 키 자동 추출
- 언어별 JSON 파일 생성 또는 업데이트
- 기본값 설정 (설정에 따라)

## 사용 방법

### 1. CLI 실행

```bash
npx gs-i18n
```

### 2. 메뉴에서 선택

```
? 원하는 작업을 선택하세요
  스프레드시트 정보 조회하기
  i18next-scanner 파일 생성하기
❯ 다국어 관련 기본 파일 구성하기
  ...
```

### 3. 스캔 실행

```
다국어 스캔 실행 중...
설정 파일 사용: /path/to/project/i18next-scanner.config.cjs
i18next-scanner가 성공적으로 실행되었습니다. ✔
```

## 스캔 대상 코드 예시

### React 컴포넌트

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("안녕하세요.")}</h1>
    </div>
  );
}
```

## 생성되는 파일 구조

스캔 후 다음과 같은 파일이 생성되어요.

```
public/
└── locales/
    ├── ko-KR/
    │   └── <namespace>.json
    ├── en-US/
    │   └── <namespace>.json
    └── ja-JP/
        └── <namespace>.json
```

### 생성되는 JSON 예시 (ko-KR/<namespace>.json)

```json
{
  "안녕하세요.": "안녕하세요."
}
```

## 설정 파일 확인

스캔 기능은 `i18next-scanner.config.cjs` 파일을 사용해요.

```javascript
module.exports = {
  input: ["./src/**/*.{ts,tsx}", "!**/node_modules/**"],
  options: {
    func: {
      list: ["i18next.t", "i18n.t", "t"],
      extensions: [".ts", ".tsx"],
    },
    // ... 기타 설정
  },
};
```

::: warning 설정 파일 필수
`i18next-scanner.config.cjs` 파일이 없으면 스캔을 실행할 수 없어요. 먼저 [scan-config](/usage/scan-config) 기능을 통해 설정 파일을 생성해 주세요.
:::

## 주요 특징

### 1. 자동 키 추출

- 코드에서 사용된 모든 번역 키 자동 감지
- 중복 키 제거

### 2. 기본값 처리

- 기본 언어(defaultLng)의 경우 키 자체를 값으로 사용
- 다른 언어는 빈 문자열로 초기화
- 커스텀 기본값 규칙 적용 가능

### 3. 기존 번역 보존

- 이미 번역된 내용은 덮어쓰지 않음
- 새로운 키만 추가
- 삭제된 키는 유지 (수동 정리 필요)

## 다음 단계

번역 키 추출이 완료되었다면

1. [번역 업로드](/usage/upload)로 진행하여 키를 Google Sheets에 등록하세요.
2. 또는 생성된 JSON 파일을 검토하고 수정하세요.

## 관련 기능

- [scan-config](/usage/scan-config): i18next-scanner 설정 생성
- [upload](/usage/upload): 추출된 키를 스프레드시트에 업로드
- [download](/usage/download): 번역된 내용을 다운로드
