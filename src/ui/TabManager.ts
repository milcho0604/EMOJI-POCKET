/**
 * 탭 전환 관리
 */
import { setActiveTab, setActiveCat } from '../core/state';
import { render, renderCats } from './renderer';
import type { TabType } from '../core/types';

export class TabManager {
  private tabs: HTMLDivElement[];
  private cats: HTMLDivElement;
  private addEmojiBtn: HTMLButtonElement;

  constructor() {
    this.tabs = Array.from(document.querySelectorAll<HTMLDivElement>('.tab'));
    this.cats = document.getElementById('cats') as HTMLDivElement;
    this.addEmojiBtn = document.getElementById('addEmojiBtn') as HTMLButtonElement;
  }

  initialize(): void {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.handleTabClick(tab));
    });
  }

  private async handleTabClick(tab: HTMLDivElement): Promise<void> {
    this.tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    const tabType = (tab.dataset.tab as TabType) ?? 'emoji';
    setActiveTab(tabType);
    setActiveCat('전체');

    // 즐겨찾기나 최근 탭일 때는 카테고리 바 숨기기
    if (tabType === 'favorites' || tabType === 'recent') {
      this.cats.style.display = 'none';
    } else {
      this.cats.style.display = 'grid';
      renderCats();
    }

    // 사용자 이모티콘 추가 버튼 표시/숨기기
    if (tabType === 'emoji' || tabType === 'kaomoji') {
      this.addEmojiBtn.style.display = 'block';
    } else {
      this.addEmojiBtn.style.display = 'none';
    }

    await render();
  }
}
