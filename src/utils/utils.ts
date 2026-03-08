import type { Item, Emoji } from '../core/types';
import { CATEGORY_ORDER } from '../core/constants';
import { addToRecent } from '../services/recentService';

// 토스트 메시지 표시
export function toast(msg: string) {
  const $toast = document.getElementById('toast') as HTMLDivElement;
  $toast.textContent = msg;
  $toast.classList.add('show');
  setTimeout(() => $toast.classList.remove('show'), 800);
}

// 클립보드 복사
export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
  await addToRecent(text);
  toast('복사됨');
}

function splitQueryTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[\s,]+/)
    .map((it) => it.trim())
    .filter(Boolean);
}

function levenshteinWithin(a: string, b: string, maxDistance: number): number {
  const aLen = a.length;
  const bLen = b.length;

  if (Math.abs(aLen - bLen) > maxDistance) return maxDistance + 1;
  if (a === b) return 0;

  let prev = new Array<number>(bLen + 1);
  for (let j = 0; j <= bLen; j += 1) prev[j] = j;

  for (let i = 1; i <= aLen; i += 1) {
    const curr = new Array<number>(bLen + 1);
    curr[0] = i;
    let rowMin = curr[0];

    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
      if (curr[j] < rowMin) rowMin = curr[j];
    }

    if (rowMin > maxDistance) return maxDistance + 1;
    prev = curr;
  }

  return prev[bLen];
}

function getTokenScore(token: string, item: Item): number {
  let best = 0;

  const charLower = item.char.toLowerCase();
  if (charLower === token) best = Math.max(best, 420);
  else if (charLower.includes(token)) best = Math.max(best, 280);

  for (const tag of item.tags) {
    const t = tag.toLowerCase();
    if (t === token) {
      best = Math.max(best, 360);
      continue;
    }
    if (t.startsWith(token)) {
      best = Math.max(best, 260);
      continue;
    }
    if (t.includes(token)) {
      best = Math.max(best, 180);
      continue;
    }

    const dist = levenshteinWithin(token, t, 2);
    if (dist <= 2) {
      best = Math.max(best, 140 - dist * 30);
    }
  }

  return best;
}

// 검색 + 카테고리 필터
export function filterItems(
  q: string,
  items: Item[],
  category?: string,
  isKaomoji: boolean = false
) {
  const s = q.trim().toLowerCase();
  let list = items;

  if (category && category !== '전체') {
    if (category === '추가') {
      // '추가' 카테고리는 사용자 정의 항목만
      return list.filter((it) =>
        it.tags.some((tag) => tag === '추가' || tag === 'custom')
      );
    } else if (isKaomoji) {
      // Kaomoji는 태그로 필터링
      list = list.filter((it) => it.tags.includes(category));
    } else {
      // Emoji는 category 필드로 필터링
      list = list.filter((it) => (it as Emoji).category === category);
    }
  } else if (!isKaomoji && category === '전체') {
    // 전체 선택 시 카테고리 순서대로 정렬
    const categoryOrder = new Map(CATEGORY_ORDER.map((cat, idx) => [cat, idx]));
    list = list.sort((a, b) => {
      const catA = (a as Emoji).category || '';
      const catB = (b as Emoji).category || '';
      const orderA = categoryOrder.get(catA) ?? 999;
      const orderB = categoryOrder.get(catB) ?? 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.char.localeCompare(b.char);
    });
  }

  if (!s) return list;

  const tokens = splitQueryTokens(s);
  if (!tokens.length) return list;

  return list
    .map((item) => {
      let totalScore = 0;
      for (const token of tokens) {
        const tokenScore = getTokenScore(token, item);
        if (tokenScore <= 0) {
          return null;
        }
        totalScore += tokenScore;
      }
      return { item, score: totalScore };
    })
    .filter((it): it is { item: Item; score: number } => it !== null)
    .sort((a, b) => b.score - a.score || a.item.char.localeCompare(b.item.char))
    .map((it) => it.item);
}
