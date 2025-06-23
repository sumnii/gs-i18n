# upload

번역 업로드 기능은 로컬 JSON 파일의 번역 데이터를 Google Sheets에 동기화해요. 이를 통해 개발자가 추가한 새로운 번역 키를 번역가와 공유할 수 있어요.

## 기능 개요

다음 기능을 수행해요.

- 모든 언어의 JSON 파일을 읽어 번역 키 수집
- Google Sheets에 새로운 키 추가
- 기존 번역 값 유지
- 번역 시트 구조 자동 생성 (필요시)

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
  다국어 관련 기본 파일 구성하기
❯ 다국어 코드 시트에 반영하기
  ...
```

### 3. 업로드 실행

```
로컬 JSON 파일의 번역 데이터를 스프레드시트에 업로드하는 중...
번역 데이터가 성공적으로 업로드되었습니다. ✔
모든 번역 키가 스프레드시트에 반영되었습니다.
```

## 업로드 프로세스

### 1. JSON 파일 읽기

업로드 기능은 설정된 모든 언어의 JSON 파일을 읽어요.

```
public/locales/
├── ko-KR/<namespace>.json
├── en-US/<namespace>.json
└── ja-JP/<namespace>.json
```

### 2. 번역 키 매핑

각 JSON 파일에서 키와 값을 추출하여 매핑해요.

```javascript
// 내부 데이터 구조
{
  "안녕하세요.": {
    "ko-KR": "안녕하세요.",
    "en-US": "hello.",
    "ja-JP": "こんにちは."
  }
}
```

### 3. 스프레드시트 업데이트

Google Sheets에 다음과 같은 구조로 데이터가 추가되어요.

| 키          | ko-KR       | en-US  | ja-JP       |
| ----------- | ----------- | ------ | ----------- |
| 안녕하세요. | 안녕하세요. | hello. | こんにちは. |

네임스페이스별로 시트가 분리되어 작성돼요.

## 주요 특징

### 1. 안전한 동기화

- 기존 번역은 생략
- 새로운 키만 추가
- 빈 값은 빈 셀로 표시

### 2. 자동 시트 생성

- 번역 시트가 없으면 자동 생성
- 헤더 행 자동 설정
- 언어 열 자동 매핑

### 3. 중복 방지

- 이미 존재하는 키는 생략
- 대소문자 구분하여 처리
- 정확한 키 매칭

## 기술적 세부사항

### 업로드 로직

```typescript
// 1. 모든 JSON 파일에서 키 수집
const translatedKeyMap = {};
for (const language of languages) {
  const json = JSON.parse(fileContent);
  gatherKeyMap(translatedKeyMap, language, json);
}

// 2. 기존 키 확인
const existKeys = rows.reduce((acc, row) => {
  const key = row.get(columnKeyToHeader.key);
  if (translatedKeyMap[key]) {
    acc[key] = true;
  }
  return acc;
}, {});

// 3. 새로운 키만 추가
const addedRows = Object.entries(translatedKeyMap)
  .filter(([key]) => !existKeys[key])
  .map(([key, translations]) => updateSheetRow(key, translations));

if (addedRows.length > 0) {
  await sheet.addRows(addedRows);
}
```

### 에러 처리

업로드 중 발생할 수 있는 에러들

1. **JSON 파싱 에러**

   - 잘못된 JSON 형식
   - 파일 읽기 권한 문제

2. **스프레드시트 에러**
   - 연결 실패
   - 권한 부족
   - API 할당량 초과

## 주의사항

::: warning 대량 데이터 처리
많은 수의 번역 키를 업로드할 때는 시간이 걸릴 수 있어요. Google Sheets API의 속도 제한으로 인해 대량 업로드 시 지연이 발생할 수 있어요.
:::

::: tip 번역 작업 전 업로드
번역가가 작업을 시작하기 전에는 항상 최신 키를 업로드하여 동기화해 주세요. 이렇게 하면 번역 누락을 방지할 수 있어요.
:::

## 다음 단계

번역 키가 업로드되었다면

1. 번역가에게 작업 요청
2. 번역 완료 후 [다운로드](/usage/download)로 번역 내용 가져오기
3. 애플리케이션에서 번역 테스트

## 관련 기능

- [scan](/usage/scan): 번역 키 추출
- [download](/usage/download): 번역 내용 다운로드
- [info](/usage/info): 스프레드시트 상태 확인
