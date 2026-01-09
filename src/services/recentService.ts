import { RECENT, setRecent } from '../core/state';
import { syncSet } from './storageService';

// ======== 최근 사용 (캐시 기반 동기화) ========
export function getRecent(): string[] {
  return RECENT;
}

export async function addToRecent(char: string) {
  // 스킨톤 모디파이어 제거하여 기본 이모지로 저장
  const baseChar = char.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');

  const list = [...RECENT];
  const idx = list.indexOf(baseChar);
  if (idx > -1) list.splice(idx, 1);
  list.unshift(baseChar);
  const maxRecent = 50;
  if (list.length > maxRecent) list.splice(maxRecent);
  setRecent(list);
  await syncSet({ recent: list });
}
