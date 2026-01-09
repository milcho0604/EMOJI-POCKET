# Source Code Structure

코드베이스가 유지보수하기 쉽도록 기능별로 분리되어 있습니다.

## 디렉토리 구조

```
src/
├── controllers/       # 애플리케이션 컨트롤러
│   ├── AppController.ts          # 메인 앱 컨트롤러 (초기화, 전체 흐름)
│   └── StorageSyncManager.ts     # Chrome Storage 동기화 관리
│
├── ui/               # UI 컴포넌트
│   ├── WindowManager.ts          # 새 창 열기
│   ├── TabManager.ts             # 탭 전환
│   ├── SearchManager.ts          # 검색
│   ├── ScrollManager.ts          # 가상 스크롤
│   ├── KeyboardManager.ts        # 키보드 네비게이션
│   ├── ModalManager.ts           # 모달 관리
│   ├── SkinToneSelector.ts       # 스킨톤 선택기
│   ├── renderer.ts               # 메인 렌더링 로직
│   └── index.ts                  # UI 컴포넌트 export
│
├── services/         # 비즈니스 로직/데이터 처리
│   ├── categoryService.ts        # 카테고리 로드
│   ├── customService.ts          # 커스텀 이모티콘 관리
│   ├── favoritesService.ts       # 즐겨찾기 관리
│   ├── recentService.ts          # 최근 사용 관리
│   ├── skinToneService.ts        # 스킨톤 처리
│   ├── storageService.ts         # Chrome Storage 유틸
│   └── index.ts                  # Services export
│
├── core/             # 핵심 상태/설정
│   ├── state.ts                  # 전역 상태 관리
│   ├── theme.ts                  # 테마 관리
│   ├── language.ts               # 언어 관리
│   ├── constants.ts              # 상수
│   ├── types.ts                  # 타입 정의
│   └── index.ts                  # Core export
│
├── utils/            # 유틸리티 함수
│   ├── utils.ts                  # 범용 유틸
│   ├── virtualScroll.ts          # 가상 스크롤 계산
│   ├── highlight.ts              # 검색 하이라이트
│   ├── keyboard.ts               # 키보드 유틸
│   └── index.ts                  # Utils export
│
├── i18n/             # 다국어
│   ├── i18n.ts                   # i18n 로직
│   └── translations.ts           # 번역 데이터
│
└── popup.ts          # 진입점 (9줄)
```

## 설계 원칙

### 1. 단일 책임 원칙 (Single Responsibility)
- 각 클래스/모듈은 하나의 역할만 수행
- 예: `TabManager`는 탭 전환만, `SearchManager`는 검색만 담당

### 2. 관심사의 분리 (Separation of Concerns)
- **controllers**: 앱 흐름 제어
- **ui**: 사용자 인터페이스
- **services**: 비즈니스 로직
- **core**: 핵심 상태/설정
- **utils**: 재사용 가능한 유틸리티

### 3. 의존성 방향
```
popup.ts
  └─> AppController
        ├─> UI Managers (WindowManager, TabManager, ...)
        ├─> StorageSyncManager
        └─> Services (categoryService, ...)
              └─> Core (state, types, ...)
```

## 주요 컴포넌트

### AppController
- 애플리케이션 초기화
- 모든 매니저 인스턴스화 및 초기화
- 전역 이벤트 리스너 설정

### UI Managers
각 UI 영역을 독립적으로 관리:
- 이벤트 리스너 설정
- DOM 조작
- 사용자 상호작용 처리

### Services
데이터 처리 및 비즈니스 로직:
- Chrome Storage 읽기/쓰기
- 데이터 변환 및 검증
- 상태 업데이트

### Core
애플리케이션 핵심:
- 전역 상태 (state.ts)
- 타입 정의 (types.ts)
- 상수 (constants.ts)

## import 규칙

```typescript
// 같은 디렉토리
import { something } from './module';

// 부모 디렉토리
import { something } from '../parent/module';

// index.ts를 통한 export
import { TabManager, SearchManager } from '../ui';
import * from '../services';
```

## 파일 추가 시 가이드

### 새 UI 컴포넌트 추가
1. `ui/` 디렉토리에 파일 생성
2. `ui/index.ts`에 export 추가
3. `AppController.ts`에서 초기화

### 새 서비스 추가
1. `services/` 디렉토리에 파일 생성
2. `services/index.ts`에 export 추가
3. 필요한 곳에서 import

### 새 타입 추가
1. `core/types.ts`에 타입 정의
2. `core/index.ts`에서 자동 export

## 빌드 및 테스트

```bash
# 빌드
pnpm run build

# 개발 모드 (watch)
pnpm run dev
```
