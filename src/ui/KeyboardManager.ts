/**
 * 키보드 네비게이션 관리
 */
import { closeModal } from './ModalManager';
import { handleArrowKey, getFocusedChar } from '../utils/keyboard';
import { copyToClipboard } from '../utils/utils';
import { render } from './renderer';

export class KeyboardManager {
  private searchInput: HTMLInputElement;

  constructor() {
    this.searchInput = document.getElementById('q') as HTMLInputElement;
  }

  initialize(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keydown', (e) => this.handleSearchShortcut(e));
  }

  private async handleKeyDown(e: KeyboardEvent): Promise<void> {
    const emojiModal = document.getElementById('emojiModal') as HTMLDivElement;
    const isModalOpen = emojiModal.classList.contains('show');

    // 모달이 열려있으면 ESC만 처리
    if (isModalOpen) {
      if (e.key === 'Escape') {
        closeModal();
        e.preventDefault();
      }
      return;
    }

    // 검색창에 포커스되어 있으면 화살표 키만 처리
    const isSearchFocused = document.activeElement === this.searchInput;

    if (
      isSearchFocused &&
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(e.key)
    ) {
      return;
    }

    const cells = document.querySelectorAll<HTMLDivElement>('.cell');
    const totalItems = cells.length;

    if (totalItems === 0) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        handleArrowKey(e.key as any, totalItems);
        break;

      case 'Enter':
        e.preventDefault();
        const char = getFocusedChar();
        if (char) {
          await copyToClipboard(char);
          render();
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.searchInput.blur();
        break;
    }
  }

  private handleSearchShortcut(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.searchInput.focus();
      this.searchInput.select();
    }
  }
}
