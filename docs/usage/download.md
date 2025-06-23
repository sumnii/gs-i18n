# download

번역 다운로드 기능은 Google Sheets의 번역 데이터를 로컬 JSON 파일로 가져와요. 번역가가 작업한 내용을 애플리케이션에 적용하는 마지막 단계에요.

## 기능 개요

다음 기능을 수행해요.

- Google Sheets에서 모든 번역 데이터 읽기
- 언어별 JSON 파일 생성 또는 업데이트
- 파일 포맷 자동 정리

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
  다국어 코드 시트에 반영하기
❯ 시트 번역 내용 코드에 반영하기
  종료
```

### 3. 다운로드 실행

```
스프레드시트에서 번역 데이터를 다운로드하는 중...
번역 데이터가 성공적으로 다운로드되었습니다. ✔
모든 언어 파일이 업데이트되었습니다.
```

## 다운로드 프로세스

### 1. 스프레드시트 읽기

Google Sheets의 번역 시트에서 데이터를 읽어요.

| 키          | ko-KR       | en-US  | ja-JP       |
| ----------- | ----------- | ------ | ----------- |
| 안녕하세요. | 안녕하세요. | hello. | こんにちは. |

각 네임스페이스는 개별 시트로 관리돼요.

### 2. 데이터 변환

스프레드시트 데이터를 언어별 JSON 구조로 변환해요.

```javascript
{
  "ko-KR": {
    "안녕하세요.": "환영합니다",
  },
  "en-US": {
    "안녕하세요.": "hello",
  },
  "ja-JP": {
    "안녕하세요.": "こんにちは",
  }
}
```

### 3. JSON 파일 저장

각 언어별로 해당 JSON 파일에 반영되어요.

```
public/locales/
├── ko-KR/<namespace>.json
├── en-US/<namespace>.json
└── ja-JP/<namespace>.json
```

## 기술적 세부사항

### 다운로드 로직

```typescript
// 1. 스프레드시트에서 모든 행 읽기
const rows = await sheet.getRows();

// 2. 언어별 데이터 구조 생성
const languagesMap = rows.reduce((acc, row) => {
  const key = row.get(columnKeyToHeader.key);

  languages.forEach((language) => {
    const value = row.get(columnKeyToHeader[language]);

    if (!acc[language]) {
      acc[language] = {};
    }

    // 빈 값은 _N/A로 처리
    acc[language][key] = value || "_N/A";
  });

  return acc;
}, {});

// 3. 각 언어별 JSON 파일 저장
for (const [language, translations] of Object.entries(languagesMap)) {
  const filePath = path.join(localePath, language, `${namespace}.json`);
  const jsonString = JSON.stringify(translations, null, 2);
  await fs.promises.writeFile(filePath, jsonString, "utf-8");
}
```

### 에러 처리

다운로드 중 발생할 수 있는 에러들

1. **스프레드시트 접근 에러**

   - 연결 실패
   - 시트를 찾을 수 없음
   - 권한 부족

2. **파일 시스템 에러**
   - 디렉토리 생성 실패
   - 파일 쓰기 권한 없음
   - 디스크 공간 부족

## 주의사항

::: warning 로컬 변경사항 덮어쓰기
다운로드는 로컬 JSON 파일을 완전히 덮어요. 그래서 로컬에서 수동으로 수정한 내용은 사라지니 항상 스프레드시트를 통해 번역을 관리해 주세요.
:::

::: tip 번역 확인
시트에 "\_N/A"인 값은 누락되어요. 이는 번역가가 아직 작업하지 않은 항목이에요.
:::
