<div align="center">

# 🎨 이모지 포켓 (Emoji Pocket)

**한 번의 클릭으로 이모지를 복사하세요!**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Download-blue?logo=googlechrome)](https://chromewebstore.google.com/detail/%EC%9D%B4%EB%AA%A8%EC%A7%80-%ED%8F%AC%EC%BC%93/nopjdllffljcogdfcilmhhbjjjanoccj?hl=ko)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/yourusername/emoji-pocket)
[![License](https://img.shields.io/badge/license-CC%20BY--NC-orange.svg)](LICENSE)

다양한 이모지와 카오모지를 한 곳에서 쉽게 찾고 복사할 수 있는 Chrome 확장 프로그램입니다.

[📥 설치하기](#-설치-방법) • [🚀 기능](#-주요-기능) • [💻 개발](#-개발-가이드) • [📖 사용법](#-사용-방법)

</div>

---

## 📑 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [설치 방법](#-설치-방법)
- [사용 방법](#-사용-방법)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 가이드](#-개발-가이드)
- [데이터 형식](#-데이터-형식)
- [권한 안내](#-권한-안내)
- [라이선스](#-라이선스)

---

## 🌟 소개

**이모지 포켓**은 메시지, 문서, 코드 등 어디서든 빠르게 이모지를 사용할 수 있도록 도와주는 Chrome 확장 프로그램입니다.

### 왜 이모지 포켓인가요?

- ✅ **빠른 검색**: 한글/영문 태그로 원하는 이모지를 즉시 찾기
- ✅ **스마트 관리**: 즐겨찾기와 최근 사용 내역으로 자주 쓰는 이모지 빠른 접근
- ✅ **커스터마이징**: 직접 이모지를 추가하고 카테고리 정리
- ✅ **동기화**: Chrome 계정으로 모든 기기에서 설정 공유
- ✅ **다크 모드**: 눈에 편안한 다크/라이트 테마 지원

---

## 🎯 주요 기능

### 📚 풍부한 이모지 컬렉션

9개의 카테고리로 정리된 수백 개의 이모지를 제공합니다:

| 카테고리 | 설명 | 예시 |
|---------|------|-----|
| 😊 표정 | 다양한 감정 표현 | 😀 😂 🥰 😎 🤔 |
| 👋 손 | 손 제스처 및 동작 | 👍 👋 🤝 ✌️ 🙏 |
| ❤️ 하트 | 사랑과 감정 표현 | ❤️ 💕 💖 💗 💝 |
| 🐶 동물 | 귀여운 동물 친구들 | 🐶 🐱 🐼 🦊 🐨 |
| 🍕 음식 | 맛있는 음식 이모지 | 🍕 🍔 🍜 🍰 ☕ |
| 📱 사물 | 일상 물건들 | 📱 💻 📚 ✏️ 🎮 |
| 🌸 자연 | 자연과 날씨 | 🌸 🌈 ⭐ 🌙 ☀️ |
| 🎵 기호 | 각종 기호 및 심볼 | 🎵 ✨ 💫 ⚡ 🔥 |
| 🎉 기타 | 이벤트 및 기타 | 🎉 🎂 🎁 🎈 🎊 |

### 😺 카오모지 (Kaomoji) 지원

감정별로 분류된 다양한 카오모지를 제공합니다:

```
기쁨: (ᵔᵕᵔ) (◕‿◕) ヽ(>∀<☆)ノ
슬픔: (╥﹏╥) (ಥ﹏ಥ) (ToT)
화남: (╯°□°)╯︵ ┻━┻ (ಠ益ಠ)
사랑: (♡˙︶˙♡) (´▽`ʃ♡ƪ) ♡〜٩( ˃́▿˂̀ )۶〜♡
응원: ٩(๑❛ᴗ❛๑)۶ ファイト〜! (ง •̀_•́)ง
```

### ⭐ 스마트 관리 기능

#### 즐겨찾기
- 자주 사용하는 이모지를 즐겨찾기에 추가
- 별(☆) 아이콘으로 간편하게 등록/해제
- 즐겨찾기 탭에서 한눈에 확인

#### 최근 사용
- 최근 사용한 이모지 50개 자동 저장
- 시간 순으로 정렬되어 표시
- 반복 사용 시 상단으로 자동 이동

#### 검색 기능
- 🔍 **태그 검색**: "하트", "웃음", "good" 등 한글/영문 태그로 검색
- 🎯 **문자 검색**: 이모지 자체로도 검색 가능
- ⚡ **실시간 필터링**: 입력과 동시에 결과 표시

### ➕ 사용자 정의 이모지

자신만의 이모지 라이브러리를 만들 수 있습니다:

1. **추가 기능**
   - 원하는 이모지나 카오모지 직접 추가
   - 커스텀 태그 설정으로 쉬운 검색
   - 원하는 카테고리에 분류

2. **관리**
   - "추가" 카테고리에서 모든 커스텀 이모지 확인
   - Chrome 동기화로 모든 기기에서 사용

### 🌓 테마 전환

- **라이트 모드**: 밝고 깔끔한 인터페이스
- **다크 모드**: 눈의 피로를 줄이는 어두운 테마
- 우측 상단 아이콘(🌙/☀️)으로 간편하게 전환
- 선택한 테마는 모든 기기에 동기화

### 💾 클라우드 동기화

Chrome 동기화 스토리지를 사용하여 다음 데이터가 자동으로 동기화됩니다:

- ⭐ 즐겨찾기 목록
- 🕐 최근 사용 내역
- ➕ 사용자 정의 이모지 & 카오모지
- 🌓 테마 설정

> 💡 **Tip**: 회사, 집, 노트북 등 어디서든 동일한 설정으로 사용할 수 있습니다!

---

## 📥 설치 방법

### Chrome 웹 스토어에서 설치 (권장)

1. [Chrome 웹 스토어](https://chromewebstore.google.com/detail/%EC%9D%B4%EB%AA%A8%EC%A7%80-%ED%8F%AC%EC%BC%93/nopjdllffljcogdfcilmhhbjjjanoccj?hl=ko) 방문
2. **"Chrome에 추가"** 버튼 클릭
3. 권한 확인 후 **"확장 프로그램 추가"** 클릭
4. 브라우저 우측 상단 확장 프로그램 아이콘에서 이모지 포켓 실행

### 개발자 모드로 설치

개발 버전을 사용하거나 소스코드를 수정하려면:

1. **저장소 클론**
   ```bash
   git clone https://github.com/yourusername/emoji-pocket.git
   cd emoji-pocket
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **프로젝트 빌드**
   ```bash
   pnpm run build
   ```

4. **Chrome에 로드**
   - Chrome 브라우저에서 `chrome://extensions/` 접속
   - 우측 상단 **"개발자 모드"** 토글 활성화
   - **"압축해제된 확장 프로그램을 로드합니다"** 클릭
   - 프로젝트의 `dist` 폴더 선택

---

## 📖 사용 방법

### 기본 사용법

1. **이모지 복사하기**
   - Chrome 툴바에서 이모지 포켓 아이콘 클릭
   - 원하는 이모지 클릭
   - 자동으로 클립보드에 복사됨
   - 토스트 메시지로 복사 확인

2. **이모지 검색하기**
   - 상단 검색창에 키워드 입력
   - 예: "하트", "웃음", "good", "love" 등
   - 실시간으로 결과 필터링

3. **카테고리 탐색**
   - 하단 카테고리 버튼 클릭
   - "전체" 버튼으로 모든 이모지 보기
   - 특정 카테고리만 필터링하여 보기

### 고급 기능

#### 즐겨찾기 사용

1. 이모지에 마우스 올리기
2. 우측 상단 별(☆) 아이콘 클릭
3. 즐겨찾기 탭(⭐)에서 확인
4. 해제: 별 아이콘 다시 클릭

#### 사용자 정의 이모지 추가

1. **"+ 사용자 이모티콘 추가"** 버튼 클릭
2. 모달 창이 열리면:
   - **이모티콘**: 추가할 이모지 입력 (예: 🎯)
   - **태그**: 검색 키워드 입력 (쉼표로 구분)
     - 예: `목표,타겟,goal,target`
   - **카테고리**: 분류할 카테고리 선택 (이모지 탭만)
3. **추가** 버튼 클릭
4. "추가" 카테고리에서 확인

> 💡 **팁**: 태그를 잘 설정하면 나중에 검색이 훨씬 쉬워집니다!

#### 카오모지 모드

1. 상단 **"카오모지"** 탭 클릭
2. 감정별 카테고리 선택
   - 기쁨, 슬픔, 화남, 사랑, 응원, 당황, 무심, 피곤
3. 원하는 카오모지 클릭하여 복사

#### 테마 변경

1. 우측 상단 테마 아이콘 클릭
   - 🌙 (라이트 모드일 때)
   - ☀️ (다크 모드일 때)
2. 즉시 테마 변경 및 저장

---

## 🛠 기술 스택

### 프론트엔드

- **TypeScript** `5.9.3` - 타입 안정성 보장
- **Vanilla JavaScript** - 프레임워크 없이 순수 JS로 구현
- **CSS Variables** - 테마 시스템 구현

### 빌드 도구

- **Vite** `7.1.12` - 빠른 개발 서버 및 번들링
- **pnpm** - 효율적인 패키지 관리

### Chrome API

- **Manifest V3** - 최신 Chrome 확장 프로그램 표준
- **Storage Sync API** - 클라우드 데이터 동기화
- **Scripting API** - 웹 페이지 스크립트 실행

### 개발 도구

- **@types/chrome** - Chrome API TypeScript 타입 정의
- **rimraf** - 빌드 결과물 정리

---

## 📂 프로젝트 구조

```
emoji-pocket/
│
├── 📁 public/                    # 정적 리소스
│   ├── 📁 data/                  # 이모지 데이터
│   │   ├── 📁 emoji/             # 카테고리별 이모지
│   │   │   ├── emotion.json      # 표정
│   │   │   ├── hands.json        # 손
│   │   │   ├── hearts.json       # 하트
│   │   │   ├── animals.json      # 동물
│   │   │   ├── foods.json        # 음식
│   │   │   ├── objects.json      # 사물
│   │   │   ├── nature.json       # 자연
│   │   │   ├── symbols.json      # 기호
│   │   │   └── events.json       # 기타
│   │   └── kaomoji.json          # 카오모지 데이터
│   ├── 📁 icons/                 # 확장 프로그램 아이콘
│   │   └── icon128.png
│   └── manifest.json             # Chrome 확장 매니페스트
│
├── 📁 src/                       # 소스 코드
│   └── popup.ts                  # 메인 애플리케이션 로직
│
├── 📁 dist/                      # 빌드 출력 (자동 생성)
│
├── index.html                    # 팝업 HTML
├── vite.config.ts                # Vite 설정
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 프로젝트 정보 및 의존성
├── CLAUDE.md                     # AI 개발 가이드
└── README.md                     # 이 파일
```

### 주요 파일 설명

| 파일 | 역할 |
|-----|------|
| `popup.ts` | 메인 로직 (이벤트 핸들링, 데이터 관리, UI 렌더링) |
| `index.html` | 팝업 UI 구조 및 스타일 |
| `manifest.json` | 확장 프로그램 메타데이터 및 권한 설정 |
| `vite.config.ts` | 빌드 설정 (파일 복사, 번들링) |

---

## 💻 개발 가이드

### 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/yourusername/emoji-pocket.git
cd emoji-pocket

# 2. 의존성 설치
pnpm install

# 3. 개발 모드 실행 (파일 변경 감지)
pnpm run dev
```

### 빌드 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm run build` | 프로덕션 빌드 (dist/ 생성) |
| `pnpm run dev` | 개발 모드 (파일 변경 시 자동 빌드) |
| `pnpm run clean` | 빌드 결과물 삭제 |

### 개발 워크플로우

1. **코드 수정**
   ```bash
   pnpm run dev
   ```

2. **Chrome에서 테스트**
   - `chrome://extensions/` 접속
   - 확장 프로그램 새로고침 버튼 클릭
   - 팝업 열어서 변경사항 확인

3. **빌드 확인**
   ```bash
   pnpm run build
   ```

### 새로운 이모지 카테고리 추가

1. **데이터 파일 생성**
   ```bash
   # public/data/emoji/에 새 JSON 파일 생성
   # 예: sports.json
   ```

2. **데이터 형식**
   ```json
   [
     {
       "char": "⚽",
       "tags": ["soccer", "football", "축구", "ball"]
     },
     {
       "char": "🏀",
       "tags": ["basketball", "농구", "ball"]
     }
   ]
   ```

3. **popup.ts 수정**
   ```typescript
   const CATEGORY_FILES = {
     // ... 기존 카테고리
     스포츠: '/data/emoji/sports.json',  // 추가
   };
   ```

4. **빌드 및 테스트**
   ```bash
   pnpm run build
   ```

### 커스텀 카오모지 카테고리 추가

1. **popup.ts에서 카테고리 추가**
   ```typescript
   const KAOMOJI_CATEGORIES = [
     '기쁨', '슬픔', '화남', '사랑',
     '응원', '당황', '무심', '피곤',
     '놀람',  // 새 카테고리 추가
   ];
   ```

2. **kaomoji.json에 태그 추가**
   ```json
   [
     {
       "char": "Σ(゚д゚;)",
       "tags": ["놀람", "shock", "surprise"]
     }
   ]
   ```

### 디버깅 팁

- **콘솔 확인**: 팝업에서 우클릭 → "검사" → Console 탭
- **Storage 확인**: DevTools → Application → Storage → chrome.storage.sync
- **네트워크**: DevTools → Network (데이터 로딩 확인)

---

## 📊 데이터 형식

### 이모지 데이터 (emoji/*.json)

```json
[
  {
    "char": "😀",
    "tags": [
      "grin",
      "smile",
      "happy",
      "기쁨",
      "웃음",
      "행복"
    ]
  },
  {
    "char": "😂",
    "tags": [
      "laugh",
      "joy",
      "tears",
      "웃음",
      "눈물",
      "재밌어"
    ]
  }
]
```

**필드 설명:**
- `char` *(string)*: 이모지 문자
- `tags` *(string[])*: 검색 태그 (한글/영문 혼용 가능)

> ⚠️ **주의**: `category` 필드는 런타임에 자동으로 추가되므로 JSON에 포함하지 않습니다.

### 카오모지 데이터 (kaomoji.json)

```json
[
  {
    "char": "(ᵔᵕᵔ)",
    "tags": [
      "기쁨",
      "웃음",
      "스마일",
      "smile",
      "happy",
      "cute"
    ]
  },
  {
    "char": "(╥﹏╥)",
    "tags": [
      "슬픔",
      "눈물",
      "울음",
      "sad",
      "cry",
      "tears"
    ]
  }
]
```

**필드 설명:**
- `char` *(string)*: 카오모지 문자열
- `tags` *(string[])*: 검색 태그 및 카테고리 (첫 번째 태그가 주 카테고리)

---

## 🔒 권한 안내

이모지 포켓이 요청하는 권한과 사용 목적:

| 권한 | 사용 목적 |
|------|----------|
| `activeTab` | 현재 활성 탭에 접근 (커서 삽입 기능용) |
| `scripting` | 웹 페이지에 스크립트 실행 (커서 위치 이모지 삽입) |
| `storage` | Chrome 동기화 스토리지 사용 (데이터 저장 및 동기화) |
| `host_permissions` | 모든 웹사이트 접근 (커서 삽입 기능 작동) |

### 개인정보 보호

- ✅ 모든 데이터는 Chrome 동기화 스토리지에만 저장
- ✅ 외부 서버로 데이터 전송 없음
- ✅ 웹 페이지 내용 읽기/수정 없음 (이모지 삽입 시에만 제한적 접근)
- ✅ 사용자 동의 없는 데이터 수집 없음

---

## 🤝 기여하기

이모지 포켓은 오픈소스 프로젝트입니다! 기여를 환영합니다.

### 기여 방법

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 이슈 제보

버그를 발견하셨거나 기능 제안이 있으신가요?

- [GitHub Issues](https://github.com/yourusername/emoji-pocket/issues)에 등록해주세요
- 명확한 제목과 상세한 설명을 포함해주세요
- 가능하다면 스크린샷이나 재현 방법을 첨부해주세요

---

## 📝 라이선스

이 프로젝트는 **Creative Commons NonCommercial (CC BY-NC)** 라이선스 하에 배포됩니다.

### 허용 사항

- ✅ 개인적 사용
- ✅ 수정 및 재배포
- ✅ 학습 목적 사용

### 제한 사항

- ❌ 상업적 이용 금지
- ❌ 무단 판매 금지

자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👨‍💻 개발자

**밀초 (Milcho)**

- 📧 Email: milcho0604@example.com
- 📝 Blog: [https://velog.io/@milcho0604/posts](https://velog.io/@milcho0604/posts)
- 💼 GitHub: [@milcho0604](https://github.com/milcho0604)

---

## 🙏 감사의 말

이 프로젝트는 다음의 도움으로 만들어졌습니다:

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- 그리고 이모지 포켓을 사용해주시는 모든 분들께 감사드립니다! 🙏

---

## ❓ FAQ

<details>
<summary><b>Q: 이모지가 복사되지 않아요</b></summary>

A: 다음을 확인해주세요:
- 클립보드 권한이 허용되어 있는지 확인
- 팝업 창이 활성화된 상태에서 클릭
- 브라우저를 최신 버전으로 업데이트
</details>

<details>
<summary><b>Q: 커서 삽입 기능이 작동하지 않아요</b></summary>

A:
- Chrome 확장 프로그램 권한이 허용되어 있는지 확인
- 일부 웹사이트는 보안상 삽입 기능이 제한될 수 있습니다
- 대신 클립보드 복사 후 붙여넣기를 사용해주세요
</details>

<details>
<summary><b>Q: 데이터가 동기화되지 않아요</b></summary>

A:
- Chrome에 로그인되어 있는지 확인
- Chrome 동기화가 활성화되어 있는지 확인 (설정 → 동기화)
- 네트워크 연결 상태 확인
</details>

<details>
<summary><b>Q: 나만의 이모지를 추가할 수 있나요?</b></summary>

A: 네! "+ 사용자 이모티콘 추가" 버튼을 클릭하여 원하는 이모지와 태그를 추가할 수 있습니다. 추가된 이모지는 "추가" 카테고리에서 확인할 수 있습니다.
</details>

<details>
<summary><b>Q: 다른 브라우저에서도 사용할 수 있나요?</b></summary>

A: 현재는 Chrome 및 Chromium 기반 브라우저(Edge, Brave 등)만 지원합니다. Firefox나 Safari는 아직 지원하지 않습니다.
</details>

---

<div align="center">

### ⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!

**Made with ❤️ by Milcho**

[⬆ 맨 위로 돌아가기](#-이모지-포켓-emoji-pocket)

</div>
