/**
 * 검색 관리
 */
import { render } from './renderer';

export class SearchManager {
  private searchInput: HTMLInputElement;

  constructor() {
    this.searchInput = document.getElementById('q') as HTMLInputElement;
  }

  initialize(): void {
    this.searchInput.addEventListener('input', () => this.handleSearch());
  }

  private handleSearch(): void {
    render();
  }

  focus(): void {
    this.searchInput.focus();
    this.searchInput.select();
  }
}
