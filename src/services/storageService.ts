// Chrome storage 유틸리티 함수

export const syncGet = <T = any>(keys?: string[] | Record<string, any>) =>
  new Promise<T>((resolve, reject) => {
    chrome.storage.sync.get(keys as any, (res) => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve(res as T);
    });
  });

export const syncSet = (items: Record<string, any>) =>
  new Promise<void>((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      const err = chrome.runtime.lastError;
      err ? reject(err) : resolve();
    });
  });

// 기존 localStorage 데이터를 1회 동기화로 이관
export async function migrateLocalOnce() {
  const flag = localStorage.getItem('__migrated_to_sync__');
  if (flag === '1') return;

  const lFav = localStorage.getItem('favorites');
  const lRecent = localStorage.getItem('recent');
  const lTheme = localStorage.getItem('theme');
  const lCustomEmojis = localStorage.getItem('customEmojis');
  const lCustomKaomoji = localStorage.getItem('customKaomoji');

  const payload: Record<string, any> = {};
  if (lFav) payload.favorites = JSON.parse(lFav);
  if (lRecent) payload.recent = JSON.parse(lRecent);
  if (lTheme) payload.theme = lTheme;
  if (lCustomEmojis) payload.customEmojis = JSON.parse(lCustomEmojis);
  if (lCustomKaomoji) payload.customKaomoji = JSON.parse(lCustomKaomoji);

  if (Object.keys(payload).length) {
    await syncSet(payload);
  }
  localStorage.setItem('__migrated_to_sync__', '1');
}
