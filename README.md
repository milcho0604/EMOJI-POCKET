# EMOJI-POCKET

[📢 크롬 확장팩 링크](https://chromewebstore.google.com/detail/%EC%9D%B4%EB%AA%A8%EC%A7%80-%ED%8F%AC%EC%BC%93/nopjdllffljcogdfcilmhhbjjjanoccj?hl=ko)

Chrome 브라우저 확장 프로그램용 이모지 및 카오모지(Kaomoji) 선택기입니다.

## 주요 기능

- 🎨 **다양한 이모지 카테고리**: 표정, 손, 하트, 동물, 음식, 사물, 자연, 기호, 기타 등(사용자 추가 가능!)
- 😊 **카오모지 지원**: 다양한 감정 표현 카오모지 제공
- ⭐ **즐겨찾기**: 자주 사용하는 이모지를 즐겨찾기에 추가
- 🕐 **최근 사용**: 최근에 사용한 이모지 목록 자동 저장
- 🔍 **검색 기능**: 이모지나 태그로 빠르게 검색
- 🌓 **다크/라이트 모드**: 테마 전환 지원
- ➕ **사용자 정의 이모지**: 직접 이모지와 카오모지를 추가 가능
- 📋 **클립보드 복사**: 클릭 한 번으로 클립보드에 복사
- 💾 **동기화**: Chrome 동기화 스토리지를 통한 계정 간 데이터 동기화

## 기술 스택

- **TypeScript**: 타입 안정성을 위한 TypeScript 사용
- **Vite**: 빠른 빌드 도구
- **Chrome Extension API**: Manifest V3 기반 확장 프로그램

## 설치 방법

### 개발 환경 설정

1. 저장소 클론:

```bash
git clone <repository-url>
cd EMOJI-POCKET
```

2. 의존성 설치:

```bash
pnpm install
```

3. 빌드:

```bash
pnpm run build
```

4. Chrome 확장 프로그램 로드:
   - Chrome에서 `chrome://extensions/` 접속
   - "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `dist` 폴더 선택

### 개발 모드

파일 변경 시 자동으로 빌드됩니다:

```bash
pnpm run dev
```

## 프로젝트 구조

```
ch-pop/
├── public/
│   ├── data/
│   │   ├── emoji/          # 카테고리별 이모지 데이터
│   │   │   ├── emotion.json
│   │   │   ├── hands.json
│   │   │   ├── hearts.json
│   │   │   ├── animals.json
│   │   │   ├── foods.json
│   │   │   ├── objects.json
│   │   │   ├── nature.json
│   │   │   ├── symbols.json
│   │   │   └── events.json
│   │   └── kaomoji.json    # 카오모지 데이터
│   ├── icons/
│   │   └── icon128.png
│   └── manifest.json       # Chrome 확장 프로그램 매니페스트
├── src/
│   └── popup.ts            # 메인 로직
├── index.html              # 팝업 HTML
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
└── package.json
```

## 사용 방법

1. **이모지 선택**: 팝업에서 원하는 이모지를 클릭하면 클립보드에 복사됩니다.
2. **검색**: 상단 검색창에 키워드를 입력하여 이모지를 검색할 수 있습니다.
3. **카테고리 필터**: 카테고리 버튼을 클릭하여 특정 카테고리의 이모지만 표시할 수 있습니다.
4. **즐겨찾기**: 이모지에 마우스를 올리면 나타나는 별 아이콘을 클릭하여 즐겨찾기에 추가할 수 있습니다.
5. **사용자 정의 이모지 추가**: "+ 사용자 이모티콘 추가" 버튼을 클릭하여 커스텀 이모지를 추가할 수 있습니다.
6. **테마 전환**: 우측 상단의 달/해 아이콘을 클릭하여 다크/라이트 모드를 전환할 수 있습니다.

## 데이터 형식

### 이모지 데이터

```json
{
  "char": "😀",
  "tags": ["grin", "smile", "happy", "기쁨", "웃음"],
  "category": "표정"
}
```

### 카오모지 데이터

```json
{
  "char": "(ᵔᵕᵔ)",
  "tags": ["기쁨", "웃음", "스마일", "smile", "happy"]
}
```

## 스크립트

- `pnpm run build`: 프로덕션 빌드
- `pnpm run dev`: 개발 모드 (파일 변경 감지)
- `pnpm run clean`: 빌드 결과물 삭제

## Chrome 확장 프로그램 권한

- `activeTab`: 현재 활성 탭 접근
- `scripting`: 스크립트 실행 (커서 위치에 삽입 기능)
- `storage`: Chrome 동기화 스토리지 사용
- `host_permissions`: 모든 HTTP/HTTPS 사이트 접근 (커서 삽입 기능용)

## 데이터 동기화

이 확장 프로그램은 Chrome의 동기화 스토리지를 사용하여 다음 데이터를 동기화합니다:

- 즐겨찾기 목록
- 최근 사용한 이모지 목록
- 사용자 정의 이모지 및 카오모지
- 테마 설정

## 라이선스

Creative Commons NonCommercial (CC BY-NC) - 상업적 이용 금지
