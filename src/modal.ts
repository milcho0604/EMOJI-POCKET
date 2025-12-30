import { i18n } from './i18n/i18n';
import type { Item } from './types';
import {
  CATEGORY_FILES,
  KAOMOJI_CATEGORIES,
  CATEGORY_I18N_KEYS,
  KAOMOJI_I18N_KEYS,
} from './constants';
import { activeTab } from './state';
import { saveCustomEmoji, saveCustomKaomoji, updateCustomEmoji, updateCustomKaomoji } from './custom';
import { toast } from './utils';
import { render } from './render';

// DOM 요소
const $emojiModal = document.getElementById('emojiModal') as HTMLDivElement;
const $emojiInput = document.getElementById('emojiInput') as HTMLInputElement;
const $tagsInput = document.getElementById('tagsInput') as HTMLInputElement;
const $categorySelect = document.getElementById(
  'categorySelect'
) as HTMLSelectElement;

// 편집 모드 상태
let editMode: 'add' | 'edit' = 'add';
let editingItem: Item | null = null;

// 모달 관리
export function openModal(mode: 'add' | 'edit' = 'add', item?: Item) {
  editMode = mode;
  editingItem = item || null;
  $emojiModal.classList.add('show');

  // 편집 모드일 때 기존 데이터 채우기
  if (mode === 'edit' && item) {
    $emojiInput.value = item.char;
    $tagsInput.value = item.tags.join(', ');
  } else {
    $emojiInput.value = '';
    $tagsInput.value = '';
  }

  // 모달 제목 업데이트
  const $modalTitle = document.getElementById('modalTitle');
  if ($modalTitle) {
    if (mode === 'edit') {
      $modalTitle.textContent = i18n.getCurrentLanguage() === 'ko' ? '이모티콘 수정' : 'Edit Emoji';
    } else if (activeTab === 'emoji') {
      $modalTitle.textContent = i18n.t('modal.title.emoji');
    } else if (activeTab === 'kaomoji') {
      $modalTitle.textContent = i18n.t('modal.title.kaomoji');
    }
  }

  // input placeholder 업데이트
  if (activeTab === 'emoji') {
    $emojiInput.placeholder = i18n.t('modal.input.emoji');
  } else if (activeTab === 'kaomoji') {
    $emojiInput.placeholder = i18n.t('modal.input.kaomoji');
  }

  // 카테고리 옵션 생성
  $categorySelect.style.display = 'block';
  if (activeTab === 'emoji') {
    $categorySelect.innerHTML =
      Object.keys(CATEGORY_FILES)
        .map((cat) => `<option value="${cat}">${i18n.t(CATEGORY_I18N_KEYS[cat] || cat)}</option>`)
        .join('') + `<option value="추가">${i18n.t('category.custom')}</option>`;

    // 편집 모드일 때 카테고리 선택
    if (mode === 'edit' && item?.category) {
      $categorySelect.value = item.category;
    }
  } else if (activeTab === 'kaomoji') {
    $categorySelect.innerHTML = KAOMOJI_CATEGORIES.map(
      (cat) => `<option value="${cat}">${i18n.t(KAOMOJI_I18N_KEYS[cat] || cat)}</option>`
    ).join('');
  } else {
    $categorySelect.style.display = 'none';
  }

  $emojiInput.focus();
}

export function closeModal() {
  $emojiModal.classList.remove('show');
  // 모달 닫을 때 검색창에 포커스
  const $q = document.getElementById('q') as HTMLInputElement;
  setTimeout(() => $q.focus(), 100);
}

export async function handleSave() {
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

  if (editMode === 'edit' && editingItem) {
    // 편집 모드
    if (activeTab === 'emoji') {
      const category = $categorySelect.value || '추가';
      await updateCustomEmoji(editingItem.char, char, tags, category);
      toast('이모티콘이 수정되었습니다');
    } else {
      const category = $categorySelect.value || '추가';
      const kamojiTags =
        category !== '추가' && !tags.includes(category)
          ? [category, ...tags]
          : tags;
      await updateCustomKaomoji(editingItem.char, char, kamojiTags);
      toast('Kaomoji가 수정되었습니다');
    }
  } else {
    // 추가 모드
    if (activeTab === 'emoji') {
      const category = $categorySelect.value || '추가';
      await saveCustomEmoji(char, tags, category);
      toast('이모티콘이 추가되었습니다');
    } else {
      const category = $categorySelect.value || '추가';
      const kamojiTags =
        category !== '추가' && !tags.includes(category)
          ? [category, ...tags]
          : tags;
      await saveCustomKaomoji(char, kamojiTags);
      toast('Kaomoji가 추가되었습니다');
    }
  }

  closeModal();
  render();
}

export function setupModalEvents() {
  const $closeModal = document.getElementById('closeModal') as HTMLButtonElement;
  const $cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;
  const $saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;

  $closeModal.addEventListener('click', closeModal);
  $cancelBtn.addEventListener('click', closeModal);
  $saveBtn.addEventListener('click', handleSave);

  // 모달 배경 클릭 시 닫기
  $emojiModal.addEventListener('click', (e) => {
    if (e.target === $emojiModal) {
      closeModal();
    }
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
}
