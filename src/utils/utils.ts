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

  return list.filter(
    (it) =>
      it.char.includes(s) || it.tags.some((t) => t.toLowerCase().includes(s))
  );
}
