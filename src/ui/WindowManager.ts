/**
 * 창 관리 (새 창 열기)
 */
export class WindowManager {
  private openWindowBtn: HTMLButtonElement;

  constructor() {
    this.openWindowBtn = document.getElementById('openWindowBtn') as HTMLButtonElement;
  }

  initialize(): void {
    this.openWindowBtn.addEventListener('click', () => this.openNewWindow());
  }

  private async openNewWindow(): Promise<void> {
    try {
      await chrome.windows.create({
        url: chrome.runtime.getURL('index.html'),
        type: 'popup',
        width: 320,
        height: 565,
      });
    } catch (error) {
      console.error('Failed to open new window:', error);
    }
  }
}
