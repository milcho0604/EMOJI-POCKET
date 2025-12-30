import type { Item } from './types';
import { i18n } from './i18n/i18n';
import {
  EMOJIS,
  KAOMOJI,
  CUSTOM_EMOJIS,
  CUSTOM_KAOMOJI,
  ACTIVE_CAT,
  activeTab,
  setActiveCat,
} from './state';
import {
  CATEGORY_ORDER,
  KAOMOJI_CATEGORIES,
  CATEGORY_I18N_KEYS,
  KAOMOJI_I18N_KEYS,
} from './constants';
import { getFavorites, addToFavorites, removeFromFavorites, isFavorite } from './favorites';
import { getRecent } from './recent';
import { filterItems, copyToClipboard } from './utils';
import { ensureAllCategoriesLoaded, ensureCategoryLoaded } from './category';
import { resetFocus, setGridColumns } from './keyboard';
import { highlightTags } from './highlight';

// DOM 요소 참조
const $grid = document.getElementById('grid') as HTMLDivElement;
const $gridScroll = document.getElementById('grid-scroll') as HTMLDivElement;
const $q = document.getElementById('q') as HTMLInputElement;
const $cats = document.getElementById('cats') as HTMLDivElement;

// 탭별 아이템 가져오기
function getItemsForTab(): Item[] {
  if (activeTab === 'emoji') {
    return [...EMOJIS, ...CUSTOM_EMOJIS];
  } else if (activeTab === 'kaomoji') {
    return [...KAOMOJI, ...CUSTOM_KAOMOJI];
  } else if (activeTab === 'favorites') {
    const favorites = getFavorites();
    const allItems = [
      ...EMOJIS,
      ...KAOMOJI,
      ...CUSTOM_EMOJIS,
      ...CUSTOM_KAOMOJI,
    ];

    const byChar = new Map<string, Item>();
    for (const it of allItems) {
      if (!byChar.has(it.char)) {
        byChar.set(it.char, it);
      }
    }
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

async function ensureAllItemsLoaded() {
  if (!ensureCategoryLoaded) {
    await ensureAllCategoriesLoaded();
  }
}

export async function render() {
  // 즐겨찾기나 최근 탭이면 모든 카테고리 로드
  if (activeTab === 'favorites' || activeTab === 'recent') {
    await ensureAllItemsLoaded();
  }

  // 이모지 탭일 때 카테고리 로드
  if (activeTab === 'emoji') {
    if ($q.value.trim()) {
      await ensureAllCategoriesLoaded();
    } else {
      if (ACTIVE_CAT === '전체') {
        await ensureAllCategoriesLoaded();
      } else if (ACTIVE_CAT !== '추가') {
        await ensureCategoryLoaded(ACTIVE_CAT);
      }
    }
  }

  let list: Item[] = [];

  if (activeTab === 'favorites' || activeTab === 'recent') {
    list = getItemsForTab();
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

    if (!isKaomoji && ACTIVE_CAT !== '전체') {
      list = list.sort((a, b) => a.char.localeCompare(b.char));
    }
  }

  const favorites = getFavorites();
  const isKaomojiTab = activeTab === 'kaomoji';

  // 그리드 컬럼 수 설정 (키보드 네비게이션용)
  const cols = isKaomojiTab ? 3 : 8;
  setGridColumns(cols);

  // 포커스 초기화
  resetFocus();

  if (isKaomojiTab) {
    $grid.classList.add('kaomoji');
  } else {
    $grid.classList.remove('kaomoji');
  }

  const searchQuery = $q.value.trim();

  $grid.innerHTML = list
    .map((it, idx) => {
      const isFav = favorites.has(it.char);
      const cellClass = isKaomojiTab ? 'cell kaomoji' : 'cell';
      const content = isKaomojiTab
        ? `<span class="kaomoji-text">${it.char}</span>`
        : it.char;

      // 검색어 하이라이팅 적용
      const highlightedTags = highlightTags(it.tags || [], searchQuery);

      return `
        <div class="${cellClass}" data-i="${idx}" data-char="${it.char.replace(
        /"/g,
        '&quot;'
      )}" title="${highlightedTags}">
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

      if (activeTab === 'favorites' || activeTab === 'recent') {
        render();
      }
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

// 카테고리 바 렌더
export function renderCats() {
  const isKaomoji = activeTab === 'kaomoji';
  const all = isKaomoji
    ? ['전체', ...KAOMOJI_CATEGORIES]
    : ['전체', ...CATEGORY_ORDER];

  const i18nKeys = isKaomoji ? KAOMOJI_I18N_KEYS : CATEGORY_I18N_KEYS;

  $cats.innerHTML = all
    .map(
      (c) =>
        `<div class="cat ${
          c === ACTIVE_CAT ? 'active' : ''
        }" data-cat="${c}">${i18n.t(i18nKeys[c] || c)}</div>`
    )
    .join('');

  $cats.querySelectorAll<HTMLDivElement>('.cat').forEach((el) => {
    el.addEventListener('click', async () => {
      const next = el.dataset.cat!;
      const currentIsKaomoji = activeTab === 'kaomoji';

      if (currentIsKaomoji) {
        setActiveCat(next);
      } else {
        if (next === '전체') {
          await ensureAllCategoriesLoaded();
        } else if (next === '추가') {
          setActiveCat(next);
        } else {
          await ensureCategoryLoaded(next);
        }
        setActiveCat(next);
      }

      $cats
        .querySelectorAll('.cat')
        .forEach((x) => x.classList.remove('active'));
      el.classList.add('active');
      render();
      $gridScroll.scrollTo({ top: 0 });
    });
  });
}
