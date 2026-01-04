// 스킨톤 선택기 UI 컴포넌트

import { getSkinToneOptions, applySkinTone, saveSkinTonePreference, supportsSkinTone } from './skinTone';
import type { SkinToneType } from './skinTone';
import { i18n } from './i18n/i18n';
import { copyToClipboard } from './utils';
import { setSkinTonePreference } from './state';

let activeSelectorCell: HTMLElement | null = null;

// 스킨톤 선택기 HTML 생성
function createSkinToneSelectorHTML(baseEmoji: string): string {
  const options = getSkinToneOptions();
  const lang = i18n.getLanguage();

  return `
    <div class="skin-tone-selector">
      <div class="skin-tone-options">
        ${options
          .map(
            (opt) => `
          <button
            class="skin-tone-option"
            data-tone="${opt.tone}"
            title="${opt.name[lang]}"
          >
            ${opt.emoji}
          </button>
        `
          )
          .join('')}
      </div>
      <div class="skin-tone-actions">
        <button class="skin-tone-set-default" data-i18n="skinTone.setDefault">
          ${lang === 'ko' ? '기본값으로 설정' : 'Set as default'}
        </button>
      </div>
    </div>
  `;
}

// 스킨톤 선택기 표시
export function showSkinToneSelector(cell: HTMLElement, emoji: string) {
  // 이미 표시 중이면 무시
  if (activeSelectorCell === cell) {
    return;
  }

  // 기존 선택기 제거
  hideSkinToneSelector();

  // 스킨톤을 지원하지 않는 이모지는 무시
  if (!supportsSkinTone(emoji)) {
    return;
  }

  // 선택기 HTML 생성 및 추가
  const selectorHTML = createSkinToneSelectorHTML(emoji);
  cell.insertAdjacentHTML('beforeend', selectorHTML);

  const selector = cell.querySelector('.skin-tone-selector') as HTMLElement;
  if (!selector) return;

  activeSelectorCell = cell;

  // 스킨톤 옵션 클릭 핸들러
  const options = selector.querySelectorAll<HTMLButtonElement>('.skin-tone-option');
  options.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const tone = btn.dataset.tone as SkinToneType;
      const emojiWithTone = applySkinTone(emoji, tone);

      // 클립보드에 복사
      await copyToClipboard(emojiWithTone);

      // 선택기 닫기
      hideSkinToneSelector();
    });
  });

  // 기본값 설정 버튼 핸들러
  const setDefaultBtn = selector.querySelector('.skin-tone-set-default') as HTMLButtonElement;
  if (setDefaultBtn) {
    setDefaultBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      // 현재 선택된 스킨톤 찾기
      const selectedOption = selector.querySelector('.skin-tone-option:hover') as HTMLButtonElement;
      if (selectedOption) {
        const tone = selectedOption.dataset.tone as SkinToneType;
        await saveSkinTonePreference(tone);
        setSkinTonePreference(tone);

        // 피드백 표시
        const lang = i18n.getLanguage();
        const toast = document.getElementById('toast') as HTMLDivElement;
        toast.textContent = lang === 'ko' ? '기본 스킨톤이 설정되었습니다' : 'Default skin tone set';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
      }

      hideSkinToneSelector();
    });
  }

  // 외부 클릭 시 선택기 닫기
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick);
  }, 0);
}

// 스킨톤 선택기 숨기기
export function hideSkinToneSelector() {
  if (activeSelectorCell) {
    const selector = activeSelectorCell.querySelector('.skin-tone-selector');
    if (selector) {
      selector.remove();
    }
    activeSelectorCell = null;
  }

  document.removeEventListener('click', handleOutsideClick);
}

// 외부 클릭 핸들러
function handleOutsideClick(e: Event) {
  const target = e.target as HTMLElement;

  // 선택기 내부 클릭이 아니면 닫기
  if (!target.closest('.skin-tone-selector') && !target.closest('.cell')) {
    hideSkinToneSelector();
  }
}

// 스킨톤 선택기 초기화 (이벤트 리스너 정리)
export function cleanupSkinToneSelector() {
  hideSkinToneSelector();
}
