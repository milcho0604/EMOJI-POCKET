import { RECENT, setRecent } from './state';
import { syncSet } from './storage';

// ======== 최근 사용 (캐시 기반 동기화) ========
export function getRecent(): string[] {
  return RECENT;
}

export async function addToRecent(char: string) {
  const list = [...RECENT];
  const idx = list.indexOf(char);
  if (idx > -1) list.splice(idx, 1);
  list.unshift(char);
  const maxRecent = 50;
  if (list.length > maxRecent) list.splice(maxRecent);
  setRecent(list);
  await syncSet({ recent: list });
}
