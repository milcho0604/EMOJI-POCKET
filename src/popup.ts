import emojiData from "./data/src/data/emoji.json";
import kaomojiData from "./data/src/data/kaomoji.json";

const EMOJIS: { char: string; tags: string[] }[] = emojiData;
const KAOMOJI: { char: string; tags: string[] }[] = kaomojiData;

type Item = { char: string; tags: string[] };

const $grid = document.getElementById("grid") as HTMLDivElement;
const $tabs = Array.from(document.querySelectorAll<HTMLDivElement>(".tab"));
const $q = document.getElementById("q") as HTMLInputElement;
const $toast = document.getElementById("toast") as HTMLDivElement;
const $insertBtn = document.getElementById("insertBtn") as HTMLButtonElement;

let activeTab: "emoji" | "kaomoji" = "emoji";

function toast(msg: string) {
  $toast.textContent = msg;
  $toast.classList.add("show");
  setTimeout(() => $toast.classList.remove("show"), 800);
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  toast("복사됨");
}

function filterItems(q: string, items: Item[]) {
  const s = q.trim().toLowerCase();
  if (!s) return items;
  return items.filter((it) => it.char.includes(s) || it.tags.some(t => t.toLowerCase().includes(s)));
}

function render() {
  const items = activeTab === "emoji" ? EMOJIS : KAOMOJI;
  const list = filterItems($q.value, items);
  $grid.innerHTML = list
    .map((it, idx) => `<div class="cell" data-i="${idx}">${it.char}</div>`)
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
    render();
  });
});

// 검색
$q.addEventListener("input", render);

// (선택) 커서 위치에 삽입
$insertBtn.addEventListener("click", async () => {
  const selection = window.getSelection?.()?.toString() ?? "";
  const items = activeTab === "emoji" ? EMOJIS : KAOMOJI;
  const pick = filterItems($q.value, items)[0]?.char ?? (activeTab === "emoji" ? "😀" : "(ᵔᵕᵔ)");

  // chrome.scripting 사용(권한 필요). 권한이 없다면 무시.
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text: string) => {
        // 활성 입력창에 삽입 시도
        const el = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | HTMLElement | null);
        const isEditable =
          (el && ("value" in el || (el as HTMLElement).isContentEditable)) ? true : false;

        if (isEditable) {
          // input/textarea
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? input.value.length;
            const before = input.value.slice(0, start);
            const after = input.value.slice(end);
            input.value = before + text + after;
            const pos = start + text.length;
            input.setSelectionRange(pos, pos);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
          }
          // contentEditable
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

// 초기 렌더
render();
