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

let activeTab: "emoji" | "kaomoji" = "emoji";

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
  toast("복사됨");
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


function render() {
  const items: Item[] = activeTab === "emoji" ? EMOJIS : KAOMOJI;
  const isKaomoji = activeTab === "kaomoji";
  const list = filterItems($q.value, items, ACTIVE_CAT, isKaomoji);

  $grid.innerHTML = list
    .map((it, idx) => `<div class="cell" data-i="${idx}" title="${(it.tags || []).join(', ')}">${it.char}</div>`)
    .join("");

  // 클릭-복사
  $grid.querySelectorAll<HTMLDivElement>(".cell").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.i);
      const ch = list[idx].char;
      copyToClipboard(ch);
    });
  });
}

// 탭 전환
$tabs.forEach((t) => {
  t.addEventListener("click", () => {
    $tabs.forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    activeTab = (t.dataset.tab as "emoji" | "kaomoji") ?? "emoji";
    ACTIVE_CAT = "전체"; // 탭 전환 시 카테고리 초기화
    renderCats(); // 카테고리 바 다시 렌더링
    render();
  });
});

// 검색
$q.addEventListener("input", render);

// (선택) 커서 위치에 삽입
$insertBtn?.addEventListener("click", async () => {
  const selection = window.getSelection?.()?.toString() ?? "";
  const items: Item[] = activeTab === "emoji" ? EMOJIS : KAOMOJI;
  const isKaomoji = activeTab === "kaomoji";
  const pick = filterItems($q.value, items, ACTIVE_CAT, isKaomoji)[0]?.char
             ?? (activeTab === "emoji" ? "😀" : "(ᵔᵕᵔ)");

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

    toast("커서에 삽입됨");
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

// 초기화
(async function init() {
  // Kaomoji 로드
  KAOMOJI = await loadKaomoji();
  
  renderCats();
  // 초기에는 가벼운 카테고리만 선로드 (예: 표정, 하트)
  await ensureCategoryLoaded("표정");
  await ensureCategoryLoaded("하트");
  render();
})();