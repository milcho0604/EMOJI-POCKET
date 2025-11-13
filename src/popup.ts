// 데이터 소스: 카테고리별 분할 JSON (emotion/animals/foods/objects/nature/symbols/hands/hearts/events 등)
type Emoji = { char: string; tags: string[]; category: string }; // category 한국어명 고정
type Kaomoji = { char: string; tags: string[] };
type Item = { char: string; tags: string[]; category?: string };

const CATEGORY_FILES: Record<string, string> = {
  표정: '/data/emoji/emotion.json',
  손: '/data/emoji/hands.json',
  하트: '/data/emoji/hearts.json',
  동물: '/data/emoji/animals.json',
  음식: '/data/emoji/foods.json',
  사물: '/data/emoji/objects.json',
  자연: '/data/emoji/nature.json',
  기호: '/data/emoji/symbols.json',
  기타: '/data/emoji/events.json',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_FILES);

// Kaomoji 카테고리 (태그 기반)
const KAOMOJI_CATEGORIES = [
  '기쁨',
  '슬픔',
  '화남',
  '사랑',
  '파이팅',
  '당황',
  '무심',
  '피곤',
];

let EMOJIS: Emoji[] = []; // 합쳐진 전체 이모지 (lazy)
let LOADED_CATS = new Set<string>(); // 로딩된 카테고리
let ACTIVE_CAT: string = '전체'; // "전체" 또는 특정 카테고리명

// Kaomoji는 동적 로드로 변경
let KAOMOJI: Kaomoji[] = [];

// ======== [동기화 저장소 유틸 + 캐시] ========
type ThemeMode = 'light' | 'dark';

// 캐시 (렌더 성능 및 동기화 반영 용이)
let FAVORITES = new Set<string>();
let RECENT: string[] = [];
let CUSTOM_EMOJIS: Item[] = [];
let CUSTOM_KAOMOJI: Item[] = [];
let THEME: ThemeMode = 'light';

// storage helper
const syncGet = <T = any>(keys?: string[] | Record<string, any>) =>
  new Promise<T>((resolve, reject) => {
    chrome.storage.sync.get(keys as any, (res) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(res as T);
    });
  });

const syncSet = (items: Record<string, any>) =>
  new Promise<void>((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve();
    });
  });

// 기존 localStorage 데이터를 1회 동기화로 이관
async function migrateLocalOnce() {
  const flag = localStorage.getItem('__migrated_to_sync__');
  if (flag === '1') return;

  const lFav = localStorage.getItem('favorites');
  const lRecent = localStorage.getItem('recent');
  const lTheme = (localStorage.getItem('theme') as ThemeMode | null) || null;
  const lCustomEmojis = localStorage.getItem('customEmojis');
  const lCustomKaomoji = localStorage.getItem('customKaomoji');

  const payload: Record<string, any> = {};
  if (lFav) payload.favorites = JSON.parse(lFav);
  if (lRecent) payload.recent = JSON.parse(lRecent);
  if (lTheme) payload.theme = lTheme;
  if (lCustomEmojis) payload.customEmojis = JSON.parse(lCustomEmojis);
  if (lCustomKaomoji) payload.customKaomoji = JSON.parse(lCustomKaomoji);

  if (Object.keys(payload).length) {
    await syncSet(payload);
  }
  localStorage.setItem('__migrated_to_sync__', '1');
}

// 동기화 값 로드 → 캐시에 반영
async function loadFromSync() {
  const {
    favorites = [],
    recent = [],
    theme = 'light',
    customEmojis = [],
    customKaomoji = [],
  } = await syncGet<{
    favorites?: string[];
    recent?: string[];
    theme?: ThemeMode;
    customEmojis?: Item[];
    customKaomoji?: Item[];
  }>({
    favorites: [],
    recent: [],
    theme: 'light',
    customEmojis: [],
    customKaomoji: [],
  });

  FAVORITES = new Set<string>(favorites);
  RECENT = Array.isArray(recent) ? recent : [];
  CUSTOM_EMOJIS = Array.isArray(customEmojis) ? customEmojis : [];
  CUSTOM_KAOMOJI = Array.isArray(customKaomoji) ? customKaomoji : [];
  THEME = theme === 'dark' ? 'dark' : 'light';
}

// storage 변경 감지 → 캐시 갱신 → 필요시 재렌더
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;

  let needRender = false;

  if (changes.favorites) {
    const next = changes.favorites.newValue as string[] | undefined;
    FAVORITES = new Set(next || []);
    needRender = true;
  }
  if (changes.recent) {
    RECENT = (changes.recent.newValue as string[]) || [];
    needRender = true;
  }
  if (changes.customEmojis) {
    CUSTOM_EMOJIS = (changes.customEmojis.newValue as Item[]) || [];
    needRender = true;
  }
  if (changes.customKaomoji) {
    CUSTOM_KAOMOJI = (changes.customKaomoji.newValue as Item[]) || [];
    needRender = true;
  }
  if (changes.theme) {
    THEME = (changes.theme.newValue as ThemeMode) || 'light';
    applyTheme();
  }

  if (needRender) {
    render();
  }
});

// ======== DOM ========
const $grid = document.getElementById('grid') as HTMLDivElement;
const $gridScroll = document.getElementById('grid-scroll') as HTMLDivElement;
const $tabs = Array.from(document.querySelectorAll<HTMLDivElement>('.tab'));
const $q = document.getElementById('q') as HTMLInputElement;
const $toast = document.getElementById('toast') as HTMLDivElement;
const $insertBtn = document.getElementById(
  'insertBtn'
) as HTMLButtonElement | null;
const $cats = document.getElementById('cats') as HTMLDivElement;
const $themeToggle = document.getElementById(
  'themeToggle'
) as HTMLButtonElement;
const $html = document.documentElement;
const $addEmojiBtn = document.getElementById(
  'addEmojiBtn'
) as HTMLButtonElement;
const $emojiModal = document.getElementById('emojiModal') as HTMLDivElement;
const $closeModal = document.getElementById('closeModal') as HTMLButtonElement;
const $cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
const $saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const $emojiInput = document.getElementById('emojiInput') as HTMLInputElement;
const $tagsInput = document.getElementById('tagsInput') as HTMLInputElement;

let activeTab: 'emoji' | 'kaomoji' | 'favorites' | 'recent' = 'emoji';

// ======== 즐겨찾기/최근 (캐시 기반 동기화) ========
function getFavorites(): Set<string> {
  return FAVORITES;
}

async function setFavorites(next: Set<string>) {
  FAVORITES = new Set(next);
  await syncSet({ favorites: Array.from(FAVORITES) });
}

async function addToFavorites(char: string) {
  if (FAVORITES.has(char)) return;
  FAVORITES.add(char);
  await syncSet({ favorites: Array.from(FAVORITES) });
}

async function removeFromFavorites(char: string) {
  if (!FAVORITES.has(char)) return;
  FAVORITES.delete(char);
  await syncSet({ favorites: Array.from(FAVORITES) });
}

function isFavorite(char: string): boolean {
  return FAVORITES.has(char);
}

function getRecent(): string[] {
  return RECENT;
}

async function addToRecent(char: string) {
  const list = [...RECENT];
  const idx = list.indexOf(char);
  if (idx > -1) list.splice(idx, 1);
  list.unshift(char);
  const maxRecent = 50;
  if (list.length > maxRecent) list.splice(maxRecent);
  RECENT = list;
  await syncSet({ recent: list });
}

// ======== 사용자 정의 이모티콘 (캐시 기반 동기화) ========
function getCustomEmojis(): Item[] {
  return CUSTOM_EMOJIS;
}

function getCustomKaomoji(): Item[] {
  return CUSTOM_KAOMOJI;
}

async function saveCustomEmoji(char: string, tags: string[]) {
  const next = [...CUSTOM_EMOJIS, { char, tags, category: '사용자' }];
  CUSTOM_EMOJIS = next;
  await syncSet({ customEmojis: next });
}

async function saveCustomKaomoji(char: string, tags: string[]) {
  const next = [...CUSTOM_KAOMOJI, { char, tags }];
  CUSTOM_KAOMOJI = next;
  await syncSet({ customKaomoji: next });
}

// ======== 테마 (캐시 기반 동기화) ========
function applyTheme() {
  $html.setAttribute('data-theme', THEME);
  $themeToggle.textContent = THEME === 'dark' ? '☀️' : '🌙';
}

function getTheme(): ThemeMode {
  return THEME;
}

async function setTheme(theme: ThemeMode) {
  THEME = theme;
  applyTheme();
  await syncSet({ theme });
}

async function toggleTheme() {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark';
  await setTheme(next);
}

// 토스트
function toast(msg: string) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  setTimeout(() => $toast.classList.remove('show'), 800);
}

// 클립보드 복사
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  await addToRecent(text); // 최근 사용 목록에 추가 (동기화)
  toast('복사됨');
  if (activeTab === 'favorites' || activeTab === 'recent') {
    render();
  }
}

// 검색 + 카테고리 필터
function filterItems(
  q: string,
  items: Item[],
  category?: string,
  isKaomoji: boolean = false
) {
  const s = q.trim().toLowerCase();
  let list = items;

  if (category && category !== '전체') {
    if (isKaomoji) {
      // Kaomoji는 태그로 필터링
      list = list.filter((it) => it.tags.includes(category));
    } else {
      // Emoji는 category 필드로 필터링
      list = list.filter((it) => (it as Emoji).category === category);
    }
  }
  if (!s) return list;

  return list.filter(
    (it) =>
      it.char.includes(s) || it.tags.some((t) => t.toLowerCase().includes(s))
  );
}

async function ensureAllItemsLoaded() {
  // 즐겨찾기나 최근 탭을 위해 모든 카테고리 로드
  if (!LOADED_CATS.has('표정')) {
    await ensureAllCategoriesLoaded();
  }
}

// function getItemsForTab(): Item[] {
//   if (activeTab === "emoji") {
//     return [...EMOJIS, ...CUSTOM_EMOJIS];
//   } else if (activeTab === "kaomoji") {
//     return [...KAOMOJI, ...CUSTOM_KAOMOJI];
//   } else if (activeTab === "favorites") {
//     const favorites = getFavorites();
//     const allItems = [...EMOJIS, ...KAOMOJI, ...CUSTOM_EMOJIS, ...CUSTOM_KAOMOJI];
//     return allItems.filter(item => favorites.has(item.char));
//   } else if (activeTab === "recent") {
//     const recent = getRecent();
//     const allItems = [...EMOJIS, ...KAOMOJI, ...CUSTOM_EMOJIS, ...CUSTOM_KAOMOJI];
//     const itemMap = new Map<string, Item>();
//     allItems.forEach(item => {
//       if (!itemMap.has(item.char)) {
//         itemMap.set(item.char, item);
//       }
//     });
//     return recent.map(char => itemMap.get(char)).filter((item): item is Item => item !== undefined);
//   }
//   return [];
// }
function getItemsForTab(): Item[] {
  if (activeTab === 'emoji') {
    return [...EMOJIS, ...CUSTOM_EMOJIS];
  } else if (activeTab === 'kaomoji') {
    return [...KAOMOJI, ...CUSTOM_KAOMOJI];
  } else if (activeTab === 'favorites') {
    const favorites = getFavorites(); // Set<string>
    const allItems = [
      ...EMOJIS,
      ...KAOMOJI,
      ...CUSTOM_EMOJIS,
      ...CUSTOM_KAOMOJI,
    ];

    // ✅ char 기준으로 유니크 맵 구성
    const byChar = new Map<string, Item>();
    for (const it of allItems) {
      if (!byChar.has(it.char)) {
        byChar.set(it.char, it);
      }
    }
    // 즐겨찾기 대상만 반환 (중복 제거된 목록)
    return Array.from(byChar.values()).filter((it) => favorites.has(it.char));
  } else if (activeTab === 'recent') {
    const recent = getRecent();
    const allItems = [
      ...EMOJIS,
      ...KAOMOJI,
      ...CUSTOM_EMOJIS,
      ...CUSTOM_KAOMOJI,
    ];
    const itemMap = new Map<string, Item>();
    allItems.forEach((item) => {
      if (!itemMap.has(item.char)) {
        itemMap.set(item.char, item);
      }
    });
    return recent
      .map((char) => itemMap.get(char))
      .filter((item): item is Item => item !== undefined);
  }
  return [];
}

async function render() {
  // 즐겨찾기나 최근 탭이면 모든 카테고리 로드
  if (activeTab === 'favorites' || activeTab === 'recent') {
    await ensureAllItemsLoaded();
  }

  let list: Item[] = [];

  if (activeTab === 'favorites' || activeTab === 'recent') {
    list = getItemsForTab();
    // 검색 필터 적용
    const s = $q.value.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (it) =>
          it.char.includes(s) ||
          it.tags.some((t) => t.toLowerCase().includes(s))
      );
    }
  } else {
    const items = getItemsForTab();
    const isKaomoji = activeTab === 'kaomoji';
    list = filterItems($q.value, items, ACTIVE_CAT, isKaomoji);
  }

  const favorites = getFavorites();
  const isKaomojiTab = activeTab === 'kaomoji';

  // 그리드에 kaomoji 클래스 추가/제거
  if (isKaomojiTab) {
    $grid.classList.add('kaomoji');
  } else {
    $grid.classList.remove('kaomoji');
  }

  $grid.innerHTML = list
    .map((it, idx) => {
      const isFav = favorites.has(it.char);
      const cellClass = isKaomojiTab ? 'cell kaomoji' : 'cell';
      const content = isKaomojiTab
        ? `<span class="kaomoji-text">${it.char}</span>`
        : it.char;
      return `
        <div class="${cellClass}" data-i="${idx}" data-char="${it.char.replace(
        /"/g,
        '&quot;'
      )}" title="${(it.tags || []).join(', ')}">
          ${content}
          <button class="favorite-btn ${
            isFav ? 'favorited' : ''
          }" data-char="${it.char.replace(/"/g, '&quot;')}" title="${
        isFav ? '즐겨찾기 제거' : '즐겨찾기 추가'
      }">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>
      `;
    })
    .join('');

  // 클릭-복사
  $grid.querySelectorAll<HTMLDivElement>('.cell').forEach((el) => {
    el.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('favorite-btn')) {
        return;
      }
      const idx = Number(el.dataset.i);
      const ch = list[idx].char;
      copyToClipboard(ch);
    });
  });

  // 즐겨찾기 버튼 클릭
  $grid.querySelectorAll<HTMLButtonElement>('.favorite-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const char = btn.dataset.char || '';
      if (isFavorite(char)) {
        await removeFromFavorites(char);
        btn.classList.remove('favorited');
        btn.textContent = '☆';
        btn.title = '즐겨찾기 추가';
      } else {
        await addToFavorites(char);
        btn.classList.add('favorited');
        btn.textContent = '⭐';
        btn.title = '즐겨찾기 제거';
      }
      if (activeTab === 'favorites') {
        render();
      }
    });
  });
}

// 탭 전환
$tabs.forEach((t) => {
  t.addEventListener('click', async () => {
    $tabs.forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
    activeTab =
      (t.dataset.tab as 'emoji' | 'kaomoji' | 'favorites' | 'recent') ??
      'emoji';
    ACTIVE_CAT = '전체'; // 탭 전환 시 카테고리 초기화

    // 즐겨찾기나 최근 탭일 때는 카테고리 바 숨기기
    if (activeTab === 'favorites' || activeTab === 'recent') {
      $cats.style.display = 'none';
    } else {
      $cats.style.display = 'grid';
      renderCats(); // 카테고리 바 다시 렌더링
    }

    // 사용자 이모티콘 추가 버튼 표시/숨기기
    if (activeTab === 'emoji' || activeTab === 'kaomoji') {
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

// 테마 토글
$themeToggle.addEventListener('click', () => {
  toggleTheme();
});

// (선택) 커서 위치에 삽입
$insertBtn?.addEventListener('click', async () => {
  const selection = window.getSelection?.()?.toString() ?? '';
  let pick: string;

  if (activeTab === 'favorites' || activeTab === 'recent') {
    const list = getItemsForTab();
    const s = $q.value.trim().toLowerCase();
    const filtered = s
      ? list.filter(
          (it) =>
            it.char.includes(s) ||
            it.tags.some((t) => t.toLowerCase().includes(s))
        )
      : list;
    pick = filtered[0]?.char ?? '😀';
  } else {
    const items = getItemsForTab();
    const isKaomoji = activeTab === 'kaomoji';
    const filtered = filterItems($q.value, items, ACTIVE_CAT, isKaomoji);
    pick = filtered[0]?.char ?? (activeTab === 'emoji' ? '😀' : '(ᵔᵕᵔ)');
  }

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text: string) => {
        const el = document.activeElement as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLElement
          | null;
        const isEditable = !!(
          el &&
          ('value' in el || (el as HTMLElement).isContentEditable)
        );
        if (isEditable) {
          if (
            el instanceof HTMLInputElement ||
            el instanceof HTMLTextAreaElement
          ) {
            const input = el;
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? input.value.length;
            const before = input.value.slice(0, start);
            const after = input.value.slice(end);
            input.value = before + text + after;
            const pos = start + text.length;
            input.setSelectionRange(pos, pos);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
          }
          if ((el as HTMLElement).isContentEditable) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              sel.deleteFromDocument();
              sel.getRangeAt(0).insertNode(document.createTextNode(text));
              sel.collapseToEnd();
              return true;
            }
          }
        }
        return false;
      },
      args: [selection || pick],
    });

    await addToRecent(pick); // 최근 사용 목록에 동기화 반영
    toast('커서에 삽입됨');
    if (activeTab === 'recent') {
      render();
    }
  } catch {
    toast('권한 없음(복사만 가능)');
  }
});

// 카테고리 바 렌더
function renderCats() {
  const isKaomoji = activeTab === 'kaomoji';
  const all = isKaomoji
    ? ['전체', ...KAOMOJI_CATEGORIES]
    : ['전체', ...CATEGORY_ORDER];

  $cats.innerHTML = all
    .map(
      (c) =>
        `<div class="cat ${
          c === ACTIVE_CAT ? 'active' : ''
        }" data-cat="${c}">${c}</div>`
    )
    .join('');

  $cats.querySelectorAll<HTMLDivElement>('.cat').forEach((el) => {
    el.addEventListener('click', async () => {
      const next = el.dataset.cat!;
      const currentIsKaomoji = activeTab === 'kaomoji';

      if (currentIsKaomoji) {
        // Kaomoji는 카테고리만 변경 (로드 불필요)
        ACTIVE_CAT = next;
      } else {
        // Emoji는 카테고리 로드 필요
        if (next === '전체') {
          await ensureAllCategoriesLoaded();
        } else {
          await ensureCategoryLoaded(next);
        }
        ACTIVE_CAT = next;
      }

      $cats
        .querySelectorAll('.cat')
        .forEach((x) => x.classList.remove('active'));
      el.classList.add('active');
      render();
      // 스크롤 상단 고정
      $gridScroll.scrollTo({ top: 0 });
    });
  });
}

// 카테고리 JSON 로드
async function loadCategory(cat: string): Promise<Emoji[]> {
  const path = CATEGORY_FILES[cat];
  const url = chrome.runtime.getURL(path);
  const res = await fetch(url);
  const data: Emoji[] = await res.json();
  // 안전하게 category 필드 보정
  return data.map((d) => ({ ...d, category: cat }));
}

async function ensureCategoryLoaded(cat: string) {
  if (cat === '전체') return;
  if (LOADED_CATS.has(cat)) return;
  const part = await loadCategory(cat);
  EMOJIS = EMOJIS.concat(part);
  LOADED_CATS.add(cat);
}

async function ensureAllCategoriesLoaded() {
  const tasks = CATEGORY_ORDER.filter((c) => !LOADED_CATS.has(c)).map((c) =>
    ensureCategoryLoaded(c)
  );
  if (tasks.length) await Promise.all(tasks);
}

// 모달 관리
function openModal() {
  $emojiModal.classList.add('show');
  $emojiInput.value = '';
  $tagsInput.value = '';
  $emojiInput.focus();
}

function closeModal() {
  $emojiModal.classList.remove('show');
}

$addEmojiBtn.addEventListener('click', openModal);
$closeModal.addEventListener('click', closeModal);
$cancelBtn.addEventListener('click', closeModal);

// 모달 배경 클릭 시 닫기
$emojiModal.addEventListener('click', (e) => {
  if (e.target === $emojiModal) {
    closeModal();
  }
});

// 저장 버튼
$saveBtn.addEventListener('click', async () => {
  const char = $emojiInput.value.trim();
  const tagsStr = $tagsInput.value.trim();

  if (!char) {
    toast('이모티콘을 입력해주세요');
    return;
  }

  const tags = tagsStr
    ? tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
    : [];

  if (activeTab === 'emoji') {
    await saveCustomEmoji(char, tags);
    toast('이모티콘이 추가되었습니다');
  } else {
    await saveCustomKaomoji(char, tags);
    toast('Kaomoji가 추가되었습니다');
  }

  closeModal();
  render();
});

// Enter 키로 저장
$emojiInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    $saveBtn.click();
  }
});

$tagsInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    $saveBtn.click();
  }
});

// 초기화
(async function init() {
  // 0) 기존 localStorage 값을 동기화로 1회 이관
  await migrateLocalOnce();

  // 1) 동기화 데이터 로드 → 캐시 반영 + 테마 적용
  await loadFromSync();
  applyTheme();

  // 2) Kaomoji 로드
  KAOMOJI = await loadKaomoji();

  // 3) UI 렌더 준비
  renderCats();
  await ensureCategoryLoaded('표정');
  await ensureCategoryLoaded('하트');
  render();
})();

// 원본 로직: Kaomoji 로더
async function loadKaomoji(): Promise<Kaomoji[]> {
  const url = chrome.runtime.getURL('data/kaomoji.json');
  const res = await fetch(url);
  return await res.json();
}
