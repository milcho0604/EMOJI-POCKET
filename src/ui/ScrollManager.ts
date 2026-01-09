/**
 * 가상 스크롤 관리
 */
import { render } from './renderer';

export class ScrollManager {
  private gridScroll: HTMLDivElement;
  private scrollTimeout: number = 0;

  constructor() {
    this.gridScroll = document.getElementById('grid-scroll') as HTMLDivElement;
  }

  initialize(): void {
    this.gridScroll.addEventListener('scroll', () => this.handleScroll());
  }

  private handleScroll(): void {
    // 디바운싱: 스크롤 멈춘 후 렌더링
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = window.setTimeout(() => {
      render();
    }, 16); // ~60fps
  }
}
