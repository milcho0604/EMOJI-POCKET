/**
 * 검색 관리
 */
import { render } from './renderer';
import { addSearchQuery, getSearchSuggestions } from '../services/searchHistoryService';

export class SearchManager {
  private searchInput: HTMLInputElement;
  private historyList: HTMLDataListElement;
  private saveTimerId: number | null = null;

  constructor() {
    this.searchInput = document.getElementById('q') as HTMLInputElement;
    this.historyList = document.getElementById('searchHistoryList') as HTMLDataListElement;
  }

  initialize(): void {
    this.searchInput.addEventListener('input', () => this.handleSearch());
    this.searchInput.addEventListener('focus', () => this.updateSuggestions());
    this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.searchInput.addEventListener('blur', () => {
      void this.persistSearch();
    });
    this.updateSuggestions();
  }

  private handleSearch(): void {
    this.updateSuggestions();
    this.schedulePersistSearch();
    void render();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      void this.persistSearch();
    }
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
    this.updateSuggestions();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private updateSuggestions(): void {
    const suggestions = getSearchSuggestions(this.searchInput.value);
    this.historyList.innerHTML = suggestions
      .map((item) => `<option value="${this.escapeHtml(item)}"></option>`)
      .join('');
  }

  focus(): void {
    this.searchInput.focus();
    this.searchInput.select();
  }
}
