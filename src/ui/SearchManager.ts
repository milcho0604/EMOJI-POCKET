/**
 * 검색 관리
 */
import { render } from './renderer';
import {
  addSearchQuery,
  getSearchSuggestions,
  removeSearchQuery,
  clearSearchHistory,
} from '../services/searchHistoryService';
import { i18n } from '../i18n/i18n';

export class SearchManager {
  private searchInput: HTMLInputElement;
  private searchWrap: HTMLDivElement;
  private suggestionsPanel: HTMLDivElement;
  private suggestionList: HTMLDivElement;
  private clearHistoryButton: HTMLButtonElement;
  private saveTimerId: number | null = null;
  private blurTimerId: number | null = null;
  private currentSuggestions: string[] = [];
  private activeSuggestionIndex: number = -1;

  constructor() {
    this.searchInput = document.getElementById('q') as HTMLInputElement;
    this.searchWrap = document.querySelector('.search-wrap') as HTMLDivElement;
    this.suggestionsPanel = document.getElementById('searchSuggestions') as HTMLDivElement;
    this.suggestionList = document.getElementById('searchSuggestionList') as HTMLDivElement;
    this.clearHistoryButton = document.getElementById('clearSearchHistoryBtn') as HTMLButtonElement;
  }

  initialize(): void {
    this.searchInput.addEventListener('input', () => this.handleSearch());
    this.searchInput.addEventListener('focus', () => this.openSuggestions());
    this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.searchInput.addEventListener('blur', () => this.handleBlur());

    this.clearHistoryButton.addEventListener('click', () => {
      void this.handleClearAll();
    });
    this.suggestionList.addEventListener('click', (e) => {
      void this.handleSuggestionListClick(e);
    });
    document.addEventListener('mousedown', (e) => this.handleDocumentMouseDown(e));
  }

  private handleSearch(): void {
    this.openSuggestions(-1);
    this.schedulePersistSearch();
    void render();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.currentSuggestions.length) {
        this.openSuggestions(0);
        return;
      }
      this.setActiveSuggestion(this.activeSuggestionIndex + 1);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!this.currentSuggestions.length) {
        this.openSuggestions(0);
        return;
      }
      this.setActiveSuggestion(this.activeSuggestionIndex - 1);
      return;
    }

    if (e.key === 'Enter') {
      if (
        this.suggestionsPanel.classList.contains('show') &&
        this.activeSuggestionIndex >= 0 &&
        this.activeSuggestionIndex < this.currentSuggestions.length
      ) {
        e.preventDefault();
        void this.applySuggestion(this.currentSuggestions[this.activeSuggestionIndex]);
        return;
      }
      void this.persistSearch();
    }
    if (e.key === 'Escape') {
      this.hideSuggestions();
    }
  }

  private handleBlur(): void {
    if (this.blurTimerId !== null) {
      window.clearTimeout(this.blurTimerId);
    }
    this.blurTimerId = window.setTimeout(() => {
      this.hideSuggestions();
      this.blurTimerId = null;
      void this.persistSearch();
    }, 120);
  }

  private handleDocumentMouseDown(e: MouseEvent): void {
    const target = e.target as Node;
    if (!this.searchWrap.contains(target)) {
      this.hideSuggestions();
    }
  }

  private async handleSuggestionListClick(e: MouseEvent): Promise<void> {
    const target = e.target as HTMLElement;
    const deleteButton = target.closest('.search-suggestion-delete') as HTMLButtonElement | null;
    const valueButton = target.closest('.search-suggestion-value') as HTMLButtonElement | null;

    if (deleteButton?.dataset.query) {
      await removeSearchQuery(deleteButton.dataset.query);
      this.openSuggestions(-1);
      return;
    }

    if (valueButton?.dataset.query) {
      await this.applySuggestion(valueButton.dataset.query);
    }
  }

  private async handleClearAll(): Promise<void> {
    await clearSearchHistory();
    this.hideSuggestions();
  }

  private schedulePersistSearch(): void {
    if (this.saveTimerId !== null) {
      window.clearTimeout(this.saveTimerId);
    }
    this.saveTimerId = window.setTimeout(() => {
      this.saveTimerId = null;
      void this.persistSearch();
    }, 450);
  }

  private async persistSearch(): Promise<void> {
    const query = this.searchInput.value;
    await addSearchQuery(query);
    if (document.activeElement === this.searchInput) {
      this.openSuggestions(-1);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private async applySuggestion(query: string): Promise<void> {
    this.searchInput.value = query;
    await addSearchQuery(query);
    this.hideSuggestions();
    this.searchInput.focus();
    this.searchInput.setSelectionRange(query.length, query.length);
    void render();
  }

  private setActiveSuggestion(nextIndex: number): void {
    if (!this.currentSuggestions.length) {
      this.activeSuggestionIndex = -1;
      return;
    }

    if (nextIndex === -1) {
      this.activeSuggestionIndex = -1;
    } else if (nextIndex < 0) {
      this.activeSuggestionIndex = this.currentSuggestions.length - 1;
    } else {
      this.activeSuggestionIndex = nextIndex % this.currentSuggestions.length;
    }

    const rows = this.suggestionList.querySelectorAll<HTMLDivElement>('.search-suggestion-item');
    rows.forEach((row, idx) => {
      if (idx === this.activeSuggestionIndex) {
        row.classList.add('active');
        row.scrollIntoView({ block: 'nearest' });
      } else {
        row.classList.remove('active');
      }
    });
  }

  private openSuggestions(initialIndex: number = -1): void {
    const suggestions = getSearchSuggestions(this.searchInput.value);
    this.currentSuggestions = suggestions;
    if (!suggestions.length) {
      this.hideSuggestions();
      return;
    }

    const deleteLabel = this.escapeHtml(i18n.t('search.deleteOne'));
    this.suggestionList.innerHTML = suggestions
      .map((item) => {
        const escaped = this.escapeHtml(item);
        return `
          <div class="search-suggestion-item">
            <button type="button" class="search-suggestion-value" data-query="${escaped}">${escaped}</button>
            <button type="button" class="search-suggestion-delete" data-query="${escaped}" title="${deleteLabel}">✕</button>
          </div>
        `;
      })
      .join('');
    this.suggestionsPanel.classList.add('show');
    this.setActiveSuggestion(initialIndex);
  }

  private hideSuggestions(): void {
    this.currentSuggestions = [];
    this.activeSuggestionIndex = -1;
    this.suggestionsPanel.classList.remove('show');
    this.suggestionList.innerHTML = '';
  }

  focus(): void {
    this.searchInput.focus();
    this.searchInput.select();
  }
}
