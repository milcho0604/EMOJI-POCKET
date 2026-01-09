import type { Item } from '../core/types';
import { i18n } from '../i18n/i18n';
import {
  EMOJIS,
  KAOMOJI,
  CUSTOM_EMOJIS,
  CUSTOM_KAOMOJI,
  ACTIVE_CAT,
  activeTab,
  setActiveCat,
} from '../core/state';
import {
  CATEGORY_ORDER,
  KAOMOJI_CATEGORIES,
  CATEGORY_I18N_KEYS,
  KAOMOJI_I18N_KEYS,
} from '../core/constants';
import { getFavorites, addToFavorites, removeFromFavorites, isFavorite } from '../services/favoritesService';
import { getRecent } from '../services/recentService';
import { filterItems, copyToClipboard } from '../utils/utils';
import { ensureAllCategoriesLoaded, ensureCategoryLoaded } from '../services/categoryService';
import { resetFocus, setGridColumns } from '../utils/keyboard';
import { calculateVisibleRange, calculateTotalHeight } from '../utils/virtualScroll';
import { supportsSkinTone, applySkinTone, getEmojiSkinTone } from '../services/skinToneService';
import { showSkinToneSelector, hideSkinToneSelector } from './SkinToneSelector';
import { SKIN_TONE_PREFERENCE, EMOJI_SKIN_TONES } from '../core/state';
import { isCustomEmoji, isCustomKaomoji, deleteCustomEmoji, deleteCustomKaomoji } from '../services/customService';
import { openModal } from './ModalManager';

// DOM 요소 참조
const $grid = document.getElementById('grid') as HTMLDivElement;
const $gridScroll = document.getElementById('grid-scroll') as HTMLDivElement;
const $q = document.getElementById('q') as HTMLInputElement;
const $cats = document.getElementById('cats') as HTMLDivElement;

// 카오모지 판단 함수
function isKaomojiItem(char: string): boolean {
  return KAOMOJI.some(k => k.char === char) || CUSTOM_KAOMOJI.some(k => k.char === char);
}

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
  await ensureAllCategoriesLoaded();
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

  // 가상 스크롤 설정
  const ITEM_HEIGHT = isKaomojiTab ? 46 : 50; // 셀 높이 (height + gap)
  const CONTAINER_HEIGHT = 200; // grid-scroll의 max-height
  const OVERSCAN = 2; // 추가 렌더링 행 수

  const scrollTop = $gridScroll.scrollTop || 0;
  const totalItems = list.length;

  // 가상 스크롤: 보이는 영역만 렌더링
  const { start, end, offsetY } = calculateVisibleRange(
    scrollTop,
    totalItems,
    cols,
    {
      itemHeight: ITEM_HEIGHT,
      containerHeight: CONTAINER_HEIGHT,
      overscan: OVERSCAN,
    }
  );

  const visibleList = list.slice(start, end);
  const totalHeight = calculateTotalHeight(totalItems, cols, ITEM_HEIGHT);

  // 실제 렌더링되는 아이템들의 높이 계산
  const visibleRows = Math.ceil(visibleList.length / cols);
  const visibleHeight = visibleRows * ITEM_HEIGHT;

  // 상단과 하단 빈 공간 설정
  $grid.style.paddingTop = `${offsetY}px`;
  $grid.style.paddingBottom = `${Math.max(0, totalHeight - offsetY - visibleHeight)}px`;
  $grid.style.height = 'auto';

  $grid.innerHTML = visibleList
    .map((it, idx) => {
      const actualIdx = start + idx;
      const isFav = favorites.has(it.char);

      // 현재 아이템이 카오모지인지 확인 (최근/즐겨찾기 탭에서도 판단)
      const isKaomoji = isKaomojiTab || isKaomojiItem(it.char);

      // 스킨톤 지원 여부 및 저장된 스킨톤 적용 (이모지만)
      const supportsSkin = !isKaomoji && supportsSkinTone(it.char);

      // 개별 이모지에 저장된 스킨톤이 있으면 사용, 없으면 기본 스킨톤 사용
      let displayChar = it.char;
      if (supportsSkin) {
        const baseEmoji = it.char.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
        const savedSkinTone = getEmojiSkinTone(baseEmoji, EMOJI_SKIN_TONES);
        const skinToneToApply = savedSkinTone || SKIN_TONE_PREFERENCE;

        if (skinToneToApply) {
          displayChar = applySkinTone(it.char, skinToneToApply);
        }
      }

      // 커스텀 이모티콘 여부 확인
      const isCustom = isKaomoji ? isCustomKaomoji(it.char) : isCustomEmoji(it.char);

      // 셀 클래스 계산
      let cellClass = 'cell';
      if (isKaomoji) {
        cellClass += ' kaomoji';
        // 최근/즐겨찾기 탭일 때 카오모지가 충분한 공간을 차지하도록
        if (activeTab === 'favorites' || activeTab === 'recent') {
          cellClass += ' kaomoji-wide';
        }
      } else if (supportsSkin) {
        cellClass += ' has-skin-tone';
      }

      const content = isKaomoji
        ? `<span class="kaomoji-text">${it.char}</span>`
        : displayChar;

      // title에는 일반 텍스트로 태그 표시 (하이라이팅 없이)
      const plainTags = (it.tags || []).join(', ');

      return `
        <div class="${cellClass}" data-i="${actualIdx}" data-char="${it.char.replace(
        /"/g,
        '&quot;'
      )}" title="${plainTags}">
          ${content}
          <button class="favorite-btn ${
            isFav ? 'favorited' : ''
          }" data-char="${it.char.replace(/"/g, '&quot;')}" title="${
        isFav ? '즐겨찾기 제거' : '즐겨찾기 추가'
      }">
            ${isFav ? '⭐' : '☆'}
          </button>
          ${isCustom ? `
            <button class="edit-btn" data-char="${it.char.replace(/"/g, '&quot;')}" title="수정">
              ✏️
            </button>
            <button class="delete-btn" data-char="${it.char.replace(/"/g, '&quot;')}" title="삭제">
              🗑️
            </button>
          ` : ''}
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
      const ch = el.dataset.char || '';
      if (!ch) return;

      // 스킨톤 선택기가 열려있지 않은 경우에만 복사
      if (!el.querySelector('.skin-tone-selector')) {
        // 저장된 스킨톤 적용하여 복사
        let charToCopy = ch;
        const itemIsKaomoji = isKaomojiItem(ch);
        if (!itemIsKaomoji && supportsSkinTone(ch)) {
          const baseEmoji = ch.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
          const savedSkinTone = getEmojiSkinTone(baseEmoji, EMOJI_SKIN_TONES);
          const skinToneToApply = savedSkinTone || SKIN_TONE_PREFERENCE;

          if (skinToneToApply) {
            charToCopy = applySkinTone(ch, skinToneToApply);
          }
        }

        copyToClipboard(charToCopy);

        if (activeTab === 'favorites' || activeTab === 'recent') {
          render();
        }
      }
    });

    // 우클릭으로 스킨톤 선택기 열기
    el.addEventListener('contextmenu', (e) => {
      // 버튼 클릭 시 무시
      const target = e.target as HTMLElement;
      if (target.classList.contains('favorite-btn') ||
          target.classList.contains('edit-btn') ||
          target.classList.contains('delete-btn')) {
        return;
      }

      const ch = el.dataset.char || '';
      if (!ch) return;

      // 스킨톤을 지원하는 이모지만 처리
      const itemIsKaomoji = isKaomojiItem(ch);
      if (!itemIsKaomoji && supportsSkinTone(ch)) {
        e.preventDefault();
        e.stopPropagation();
        hideSkinToneSelector();
        showSkinToneSelector(el, ch);
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

  // 수정 버튼 클릭
  $grid.querySelectorAll<HTMLButtonElement>('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const char = btn.dataset.char || '';
      if (!char) return;

      // char로 아이템 찾기
      const item = list.find(it => it.char === char);
      if (item) {
        // 모달을 열고 편집 모드로 설정
        openModal('edit', item);
      }
    });
  });

  // 삭제 버튼 클릭
  $grid.querySelectorAll<HTMLButtonElement>('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const char = btn.dataset.char || '';

      // 삭제 확인
      const confirmed = confirm(`"${char}"를 삭제하시겠습니까?`);
      if (!confirmed) return;

      // 타입에 따라 삭제
      const itemIsKaomoji = isKaomojiItem(char);
      if (itemIsKaomoji || isCustomKaomoji(char)) {
        await deleteCustomKaomoji(char);
      } else {
        await deleteCustomEmoji(char);
      }

      // 재렌더링
      render();
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
