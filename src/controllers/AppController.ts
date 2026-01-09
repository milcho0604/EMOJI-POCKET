/**
 * 메인 애플리케이션 컨트롤러
 */
import { migrateLocalOnce } from '../services/storageService';
import { loadFromSync, setKaomoji } from '../core/state';
import { applyTheme, toggleTheme } from '../core/theme';
import { initLanguage, toggleLanguage } from '../core/language';
import { render, renderCats } from '../ui/renderer';
import { loadKaomoji, ensureCategoryLoaded } from '../services/categoryService';
import { openModal, setupModalEvents } from '../ui/ModalManager';
import {
  WindowManager,
  TabManager,
  SearchManager,
  ScrollManager,
  KeyboardManager,
} from '../ui';
import { StorageSyncManager } from './StorageSyncManager';

export class AppController {
  private windowManager: WindowManager;
  private tabManager: TabManager;
  private searchManager: SearchManager;
  private scrollManager: ScrollManager;
  private keyboardManager: KeyboardManager;
  private storageSyncManager: StorageSyncManager;

  private themeToggle: HTMLButtonElement;
  private languageToggle: HTMLButtonElement;
  private devBlogLink: HTMLButtonElement;
  private addEmojiBtn: HTMLButtonElement;

  constructor() {
    this.windowManager = new WindowManager();
    this.tabManager = new TabManager();
    this.searchManager = new SearchManager();
    this.scrollManager = new ScrollManager();
    this.keyboardManager = new KeyboardManager();
    this.storageSyncManager = new StorageSyncManager();

    this.themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
    this.languageToggle = document.getElementById('languageToggle') as HTMLButtonElement;
    this.devBlogLink = document.getElementById('dev-blog-link') as HTMLButtonElement;
    this.addEmojiBtn = document.getElementById('addEmojiBtn') as HTMLButtonElement;
  }

  async initialize(): Promise<void> {
    // 0) 기존 localStorage 값을 동기화로 1회 이관
    await migrateLocalOnce();

    // 1) 동기화 데이터 로드 → 캐시 반영 + 테마 적용
    await loadFromSync();
    applyTheme();

    // 2) 언어 초기화
    await initLanguage();

    // 3) Kaomoji 로드
    const kaomoji = await loadKaomoji();
    setKaomoji(kaomoji);

    // 4) UI 관리자들 초기화
    this.windowManager.initialize();
    this.tabManager.initialize();
    this.searchManager.initialize();
    this.scrollManager.initialize();
    this.keyboardManager.initialize();
    this.storageSyncManager.initialize();

    // 5) 기타 이벤트 리스너 설정
    this.setupEventListeners();

    // 6) UI 렌더 준비
    renderCats();

    // 초기 카테고리 로드
    await ensureCategoryLoaded('표정');
    await ensureCategoryLoaded('하트');

    render();
  }

  private setupEventListeners(): void {
    // 테마 토글
    this.themeToggle.addEventListener('click', () => toggleTheme());

    // 언어 토글
    this.languageToggle.addEventListener('click', () => toggleLanguage());

    // 개발자 블로그 링크
    this.devBlogLink.addEventListener('click', () => {
      window.open('https://velog.io/@milcho0604/posts', '_blank', 'noopener,noreferrer');
    });

    // 사용자 이모티콘 추가 버튼
    this.addEmojiBtn.addEventListener('click', () => openModal());

    // 모달 이벤트 설정
    setupModalEvents();
  }
}
