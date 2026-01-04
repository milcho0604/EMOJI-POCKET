import { i18n } from './i18n/i18n';
import type { Item, TabType } from './types';
import type { SkinToneType } from './skinTone';
import {
  setFavorites,
  setRecent,
  setCustomEmojis,
  setCustomKaomoji,
  setTheme,
  setSkinTonePreference,
  setEmojiSkinTones,
  setActiveTab,
  setActiveCat,
  setKaomoji,
  loadFromSync,
} from './state';
import { migrateLocalOnce } from './storage';
import { applyTheme, toggleTheme } from './theme';
import { initLanguage, toggleLanguage, updateLanguageButton } from './language';
import { render, renderCats } from './render';
import { loadKaomoji, ensureCategoryLoaded, ensureAllCategoriesLoaded } from './category';
import { openModal, setupModalEvents, closeModal } from './modal';
import { handleArrowKey, getFocusedChar } from './keyboard';
import { copyToClipboard } from './utils';

// DOM 요소
const $tabs = Array.from(document.querySelectorAll<HTMLDivElement>('.tab'));
const $q = document.getElementById('q') as HTMLInputElement;
const $themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
const $languageToggle = document.getElementById('languageToggle') as HTMLButtonElement;
const $devBlogLink = document.getElementById('dev-blog-link') as HTMLButtonElement;
const $addEmojiBtn = document.getElementById('addEmojiBtn') as HTMLButtonElement;
const $cats = document.getElementById('cats') as HTMLDivElement;

// storage 변경 감지 → 캐시 갱신 → 필요시 재렌더
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;

  let needRender = false;

  if (changes.favorites) {
    const next = changes.favorites.newValue as string[] | undefined;
    setFavorites(new Set(next || []));
    needRender = true;
  }
  if (changes.recent) {
    setRecent((changes.recent.newValue as string[]) || []);
    needRender = true;
  }
  if (changes.customEmojis) {
    setCustomEmojis((changes.customEmojis.newValue as Item[]) || []);
    needRender = true;
  }
  if (changes.customKaomoji) {
    setCustomKaomoji((changes.customKaomoji.newValue as Item[]) || []);
    needRender = true;
  }
  if (changes.theme) {
    setTheme(changes.theme.newValue || 'light');
    applyTheme();
  }
  if (changes.skinTonePreference) {
    setSkinTonePreference(changes.skinTonePreference.newValue as SkinToneType);
    needRender = true;
  }
  if (changes.emojiSkinTones) {
    setEmojiSkinTones((changes.emojiSkinTones.newValue as Record<string, SkinToneType>) || {});
    needRender = true;
  }
  if (changes.language) {
    i18n.setLanguage(changes.language.newValue);
    i18n.updatePageText();
    updateLanguageButton();
    renderCats();
    needRender = true;
  }

  if (needRender) {
    render();
  }
});

// 탭 전환
$tabs.forEach((t) => {
  t.addEventListener('click', async () => {
    $tabs.forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    const tab = (t.dataset.tab as TabType) ?? 'emoji';
    setActiveTab(tab);
    setActiveCat('전체');

    // 즐겨찾기나 최근 탭일 때는 카테고리 바 숨기기
    if (tab === 'favorites' || tab === 'recent') {
      $cats.style.display = 'none';
    } else {
      $cats.style.display = 'grid';
      renderCats();
    }

    // 사용자 이모티콘 추가 버튼 표시/숨기기
    if (tab === 'emoji' || tab === 'kaomoji') {
      $addEmojiBtn.style.display = 'block';
    } else {
      $addEmojiBtn.style.display = 'none';
    }

    await render();
  });
});

// 검색
$q.addEventListener('input', () => {
  render();
});

// 가상 스크롤: 스크롤 이벤트 처리
const $gridScroll = document.getElementById('grid-scroll') as HTMLDivElement;
let scrollTimeout: number;
$gridScroll.addEventListener('scroll', () => {
  // 디바운싱: 스크롤 멈춘 후 렌더링
  clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    render();
  }, 16); // ~60fps
});

// 테마 토글
$themeToggle.addEventListener('click', () => {
  toggleTheme();
});

// 언어 토글
$languageToggle.addEventListener('click', () => {
  toggleLanguage();
});

// 개발자 블로그 링크
$devBlogLink.addEventListener('click', () => {
  window.open(
    'https://velog.io/@milcho0604/posts',
    '_blank',
    'noopener,noreferrer'
  );
});

// 사용자 이모티콘 추가 버튼
$addEmojiBtn.addEventListener('click', () => openModal());

// 모달 이벤트 설정
setupModalEvents();

// ======== 키보드 네비게이션 ========
document.addEventListener('keydown', async (e) => {
  const $emojiModal = document.getElementById('emojiModal') as HTMLDivElement;
  const isModalOpen = $emojiModal.classList.contains('show');

  // 모달이 열려있으면 ESC만 처리
  if (isModalOpen) {
    if (e.key === 'Escape') {
      closeModal();
      e.preventDefault();
    }
    return;
  }

  // 검색창에 포커스되어 있으면 화살표 키만 처리
  const $q = document.getElementById('q') as HTMLInputElement;
  const isSearchFocused = document.activeElement === $q;

  if (isSearchFocused && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)) {
    return;
  }

  const cells = document.querySelectorAll<HTMLDivElement>('.cell');
  const totalItems = cells.length;

  if (totalItems === 0) return;

  switch (e.key) {
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      e.preventDefault();
      handleArrowKey(e.key as any, totalItems);
      break;

    case 'Enter':
      e.preventDefault();
      const char = getFocusedChar();
      if (char) {
        await copyToClipboard(char);
        render();
      }
      break;

    case 'Escape':
      e.preventDefault();
      $q.blur();
      break;
  }
});

// 검색창 포커스 단축키 (Ctrl+K 또는 Cmd+K)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const $q = document.getElementById('q') as HTMLInputElement;
    $q.focus();
    $q.select();
  }
});

// 초기화
(async function init() {
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

  // 4) UI 렌더 준비
  renderCats();

  // 초기 카테고리 로드
  await ensureCategoryLoaded('표정');
  await ensureCategoryLoaded('하트');

  render();
})();
