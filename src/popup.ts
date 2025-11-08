// 데이터 소스: 카테고리별 분할 JSON (emotion/animals/foods/objects/nature/symbols/hands/hearts/events 등)
type Emoji = { char: string; tags: string[]; category: string }; // category 한국어명 고정
type Kaomoji = { char: string; tags: string[] };
type Item = { char: string; tags: string[]; category?: string };

const CATEGORY_FILES: Record<string, string> = {
  "표정":      "/data/emoji/emotion.json",
  "손":    "/data/emoji/hands.json",
  "하트":      "/data/emoji/hearts.json",
  "동물":      "/data/emoji/animals.json",
  "음식":      "/data/emoji/foods.json",
  "사물":      "/data/emoji/objects.json",
  "자연":      "/data/emoji/nature.json",
  "기호":      "/data/emoji/symbols.json",
  "기타": "/data/emoji/events.json",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_FILES);

// Kaomoji 카테고리 (태그 기반)
const KAOMOJI_CATEGORIES = ["기쁨", "슬픔", "화남", "사랑", "파이팅", "당황", "무관심", "피곤"];

let EMOJIS: Emoji[] = [];            // 합쳐진 전체 이모지 (lazy)
let LOADED_CATS = new Set<string>(); // 로딩된 카테고리
let ACTIVE_CAT: string = "전체";      // "전체" 또는 특정 카테고리명

// Kaomoji는 동적 로드로 변경
let KAOMOJI: Kaomoji[] = [];

async function loadKaomoji(): Promise<Kaomoji[]> {
  const url = chrome.runtime.getURL("data/kaomoji.json");
  const res = await fetch(url);
  return await res.json();
}

// DOM
const $grid       = document.getElementById("grid") as HTMLDivElement;
const $gridScroll = document.getElementById("grid-scroll") as HTMLDivElement;
const $tabs       = Array.from(document.querySelectorAll<HTMLDivElement>(".tab"));
const $q          = document.getElementById("q") as HTMLInputElement;
const $toast      = document.getElementById("toast") as HTMLDivElement;
const $insertBtn  = document.getElementById("insertBtn") as HTMLButtonElement | null;
const $cats       = document.getElementById("cats") as HTMLDivElement;
const $themeToggle = document.getElementById("themeToggle") as HTMLButtonElement;
const $html       = document.documentElement;
const $addEmojiBtn = document.getElementById("addEmojiBtn") as HTMLButtonElement;
const $emojiModal = document.getElementById("emojiModal") as HTMLDivElement;
const $closeModal = document.getElementById("closeModal") as HTMLButtonElement;
const $cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;
const $saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const $emojiInput = document.getElementById("emojiInput") as HTMLInputElement;
const $tagsInput = document.getElementById("tagsInput") as HTMLInputElement;

let activeTab: "emoji" | "kaomoji" | "favorites" | "recent" = "emoji";

// 사용자 정의 이모티콘
let CUSTOM_EMOJIS: Item[] = [];
let CUSTOM_KAOMOJI: Item[] = [];

// 즐겨찾기 및 최근 사용 관리
function getFavorites(): Set<string> {
  const saved = localStorage.getItem("favorites");
  return saved ? new Set(JSON.parse(saved)) : new Set();
}

function setFavorites(favorites: Set<string>) {
  localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
}

function addToFavorites(char: string) {
  const favorites = getFavorites();
  favorites.add(char);
  setFavorites(favorites);
}

function removeFromFavorites(char: string) {
  const favorites = getFavorites();
  favorites.delete(char);
  setFavorites(favorites);
}

function isFavorite(char: string): boolean {
  return getFavorites().has(char);
}

function getRecent(): string[] {
  const saved = localStorage.getItem("recent");
  return saved ? JSON.parse(saved) : [];
}

function addToRecent(char: string) {
  const recent = getRecent();
  // 이미 있으면 제거
  const index = recent.indexOf(char);
  if (index > -1) {
    recent.splice(index, 1);
  }
  // 맨 앞에 추가
  recent.unshift(char);
  // 최대 50개만 유지
  const maxRecent = 50;
  if (recent.length > maxRecent) {
    recent.splice(maxRecent);
  }
  localStorage.setItem("recent", JSON.stringify(recent));
}

// 사용자 정의 이모티콘 관리
function getCustomEmojis(): Item[] {
  const saved = localStorage.getItem("customEmojis");
  return saved ? JSON.parse(saved) : [];
}

function getCustomKaomoji(): Item[] {
  const saved = localStorage.getItem("customKaomoji");
  return saved ? JSON.parse(saved) : [];
}

function saveCustomEmoji(char: string, tags: string[]) {
  const custom = getCustomEmojis();
  custom.push({ char, tags, category: "사용자" });
  localStorage.setItem("customEmojis", JSON.stringify(custom));
  CUSTOM_EMOJIS = custom;
}

function saveCustomKaomoji(char: string, tags: string[]) {
  const custom = getCustomKaomoji();
  custom.push({ char, tags });
  localStorage.setItem("customKaomoji", JSON.stringify(custom));
  CUSTOM_KAOMOJI = custom;
}

// 다크모드 관리
function getTheme(): "light" | "dark" {
  const saved = localStorage.getItem("theme") as "light" | "dark" | null;
  return saved || "light";
}

function setTheme(theme: "light" | "dark") {
  localStorage.setItem("theme", theme);
  $html.setAttribute("data-theme", theme);
  $themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
}

// 다크모드 초기화
setTheme(getTheme());

// 다크모드 토글 버튼
$themeToggle.addEventListener("click", toggleTheme);

function toast(msg: string) {
  $toast.textContent = msg;
  $toast.classList.add("show");
  setTimeout(() => $toast.classList.remove("show"), 800);
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  addToRecent(text); // 최근 사용 목록에 추가
  toast("복사됨");
  // 즐겨찾기 탭이나 최근 탭이면 다시 렌더링
  if (activeTab === "favorites" || activeTab === "recent") {
    render();
  }
}

// 검색 + 카테고리 필터
function filterItems(q: string, items: Item[], category?: string, isKaomoji: boolean = false) {
  const s = q.trim().toLowerCase();
  let list = items;

  if (category && category !== "전체") {
    if (isKaomoji) {
      // Kaomoji는 태그로 필터링
      list = list.filter((it) => it.tags.includes(category));
    } else {
      // Emoji는 category 필드로 필터링
      list = list.filter((it) => (it as Emoji).category === category);
    }
  }
  if (!s) return list;

  return list.filter((it) =>
    it.char.includes(s) || it.tags.some((t) => t.toLowerCase().includes(s))
  );
}


async function ensureAllItemsLoaded() {
  // 즐겨찾기나 최근 탭을 위해 모든 카테고리 로드
  if (!LOADED_CATS.has("표정")) {
    await ensureAllCategoriesLoaded();
  }
}

function getItemsForTab(): Item[] {
  if (activeTab === "emoji") {
    return [...EMOJIS, ...CUSTOM_EMOJIS];
  } else if (activeTab === "kaomoji") {
    return [...KAOMOJI, ...CUSTOM_KAOMOJI];
  } else if (activeTab === "favorites") {
    const favorites = getFavorites();
    const allItems = [...EMOJIS, ...KAOMOJI, ...CUSTOM_EMOJIS, ...CUSTOM_KAOMOJI];
    return allItems.filter(item => favorites.has(item.char));
  } else if (activeTab === "recent") {
    const recent = getRecent();
    const allItems = [...EMOJIS, ...KAOMOJI, ...CUSTOM_EMOJIS, ...CUSTOM_KAOMOJI];
    const itemMap = new Map<string, Item>();
    allItems.forEach(item => {
      if (!itemMap.has(item.char)) {
        itemMap.set(item.char, item);
      }
    });
    return recent.map(char => itemMap.get(char)).filter((item): item is Item => item !== undefined);
  }
  return [];
}

async function render() {
  // 즐겨찾기나 최근 탭이면 모든 카테고리 로드
  if (activeTab === "favorites" || activeTab === "recent") {
    await ensureAllItemsLoaded();
  }
  
  let list: Item[] = [];
  
  if (activeTab === "favorites" || activeTab === "recent") {
    list = getItemsForTab();
    // 검색 필터 적용
    const s = $q.value.trim().toLowerCase();
    if (s) {
      list = list.filter((it) =>
        it.char.includes(s) || it.tags.some((t) => t.toLowerCase().includes(s))
      );
    }
  } else {
    const items = getItemsForTab();
    const isKaomoji = activeTab === "kaomoji";
    list = filterItems($q.value, items, ACTIVE_CAT, isKaomoji);
  }

  const favorites = getFavorites();
  
  $grid.innerHTML = list
    .map((it, idx) => {
      const isFav = favorites.has(it.char);
      return `
        <div class="cell" data-i="${idx}" data-char="${it.char.replace(/"/g, '&quot;')}" title="${(it.tags || []).join(', ')}">
          ${it.char}
          <button class="favorite-btn ${isFav ? 'favorited' : ''}" data-char="${it.char.replace(/"/g, '&quot;')}" title="${isFav ? '즐겨찾기 제거' : '즐겨찾기 추가'}">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>
      `;
    })
    .join("");

  // 클릭-복사
  $grid.querySelectorAll<HTMLDivElement>(".cell").forEach((el) => {
    el.addEventListener("click", (e) => {
      // 즐겨찾기 버튼 클릭이면 복사하지 않음
      if ((e.target as HTMLElement).classList.contains("favorite-btn")) {
        return;
      }
      const idx = Number(el.dataset.i);
      const ch = list[idx].char;
      copyToClipboard(ch);
    });
  });

  // 즐겨찾기 버튼 클릭
  $grid.querySelectorAll<HTMLButtonElement>(".favorite-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const char = btn.dataset.char || "";
      if (isFavorite(char)) {
        removeFromFavorites(char);
        btn.classList.remove("favorited");
        btn.textContent = "☆";
        btn.title = "즐겨찾기 추가";
      } else {
        addToFavorites(char);
        btn.classList.add("favorited");
        btn.textContent = "⭐";
        btn.title = "즐겨찾기 제거";
      }
      // 즐겨찾기 탭이면 제거된 항목 숨기기
      if (activeTab === "favorites") {
        render();
      }
    });
  });
}

// 탭 전환
$tabs.forEach((t) => {
  t.addEventListener("click", async () => {
    $tabs.forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    activeTab = (t.dataset.tab as "emoji" | "kaomoji" | "favorites" | "recent") ?? "emoji";
    ACTIVE_CAT = "전체"; // 탭 전환 시 카테고리 초기화
    
    // 즐겨찾기나 최근 탭일 때는 카테고리 바 숨기기
    if (activeTab === "favorites" || activeTab === "recent") {
      $cats.style.display = "none";
    } else {
      $cats.style.display = "grid";
      renderCats(); // 카테고리 바 다시 렌더링
    }
    
    // 사용자 이모티콘 추가 버튼 표시/숨기기
    if (activeTab === "emoji" || activeTab === "kaomoji") {
      $addEmojiBtn.style.display = "block";
    } else {
      $addEmojiBtn.style.display = "none";
    }
    
    await render();
  });
});

// 검색
$q.addEventListener("input", () => {
  render(); // await 없이 호출 (비동기지만 즉시 실행)
});

// (선택) 커서 위치에 삽입
$insertBtn?.addEventListener("click", async () => {
  const selection = window.getSelection?.()?.toString() ?? "";
  let pick: string;
  
  if (activeTab === "favorites" || activeTab === "recent") {
    const list = getItemsForTab();
    const s = $q.value.trim().toLowerCase();
    const filtered = s ? list.filter((it) =>
      it.char.includes(s) || it.tags.some((t) => t.toLowerCase().includes(s))
    ) : list;
    pick = filtered[0]?.char ?? "😀";
  } else {
    const items = getItemsForTab();
    const isKaomoji = activeTab === "kaomoji";
    const filtered = filterItems($q.value, items, ACTIVE_CAT, isKaomoji);
    pick = filtered[0]?.char ?? (activeTab === "emoji" ? "😀" : "(ᵔᵕᵔ)");
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text: string) => {
        const el = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | HTMLElement | null);
        const isEditable = !!(el && ("value" in el || (el as HTMLElement).isContentEditable));
        if (isEditable) {
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            const input = el;
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? input.value.length;
            const before = input.value.slice(0, start);
            const after  = input.value.slice(end);
            input.value = before + text + after;
            const pos = start + text.length;
            input.setSelectionRange(pos, pos);
            input.dispatchEvent(new Event("input", { bubbles: true }));
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

    addToRecent(pick); // 최근 사용 목록에 추가
    toast("커서에 삽입됨");
    // 최근 탭이면 다시 렌더링
    if (activeTab === "recent") {
      render();
    }
  } catch {
    toast("권한 없음(복사만 가능)");
  }
});

// 카테고리 바 렌더
function renderCats() {
  const isKaomoji = activeTab === "kaomoji";
  const all = isKaomoji 
    ? ["전체", ...KAOMOJI_CATEGORIES]
    : ["전체", ...CATEGORY_ORDER];
  
  $cats.innerHTML = all
    .map((c) => `<div class="cat ${c === ACTIVE_CAT ? "active" : ""}" data-cat="${c}">${c}</div>`)
    .join("");

  $cats.querySelectorAll<HTMLDivElement>(".cat").forEach((el) => {
    el.addEventListener("click", async () => {
      const next = el.dataset.cat!;
      const currentIsKaomoji = activeTab === "kaomoji";
      
      if (currentIsKaomoji) {
        // Kaomoji는 카테고리만 변경 (로드 불필요)
        ACTIVE_CAT = next;
      } else {
        // Emoji는 카테고리 로드 필요
        if (next === "전체") {
          await ensureAllCategoriesLoaded();
        } else {
          await ensureCategoryLoaded(next);
        }
        ACTIVE_CAT = next;
      }
      
      $cats.querySelectorAll(".cat").forEach((x) => x.classList.remove("active"));
      el.classList.add("active");
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
  if (cat === "전체") return;
  if (LOADED_CATS.has(cat)) return;
  const part = await loadCategory(cat);
  EMOJIS = EMOJIS.concat(part);
  LOADED_CATS.add(cat);
}

async function ensureAllCategoriesLoaded() {
  const tasks = CATEGORY_ORDER
    .filter((c) => !LOADED_CATS.has(c))
    .map((c) => ensureCategoryLoaded(c));
  if (tasks.length) await Promise.all(tasks);
}

// 모달 관리
function openModal() {
  $emojiModal.classList.add("show");
  $emojiInput.value = "";
  $tagsInput.value = "";
  $emojiInput.focus();
}

function closeModal() {
  $emojiModal.classList.remove("show");
}

$addEmojiBtn.addEventListener("click", openModal);
$closeModal.addEventListener("click", closeModal);
$cancelBtn.addEventListener("click", closeModal);

// 모달 배경 클릭 시 닫기
$emojiModal.addEventListener("click", (e) => {
  if (e.target === $emojiModal) {
    closeModal();
  }
});

// 저장 버튼
$saveBtn.addEventListener("click", () => {
  const char = $emojiInput.value.trim();
  const tagsStr = $tagsInput.value.trim();
  
  if (!char) {
    toast("이모티콘을 입력해주세요");
    return;
  }
  
  const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(t => t) : [];
  
  if (activeTab === "emoji") {
    saveCustomEmoji(char, tags);
    toast("이모티콘이 추가되었습니다");
  } else {
    saveCustomKaomoji(char, tags);
    toast("Kaomoji가 추가되었습니다");
  }
  
  closeModal();
  render();
});

// Enter 키로 저장
$emojiInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    $saveBtn.click();
  }
});

$tagsInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    $saveBtn.click();
  }
});

// 초기화
(async function init() {
  // Kaomoji 로드
  KAOMOJI = await loadKaomoji();
  
  // 사용자 정의 이모티콘 로드
  CUSTOM_EMOJIS = getCustomEmojis();
  CUSTOM_KAOMOJI = getCustomKaomoji();
  
  renderCats();
  // 초기에는 가벼운 카테고리만 선로드 (예: 표정, 하트)
  await ensureCategoryLoaded("표정");
  await ensureCategoryLoaded("하트");
  render();
})();