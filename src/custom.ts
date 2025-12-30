import type { Item } from './types';
import { CUSTOM_EMOJIS, CUSTOM_KAOMOJI, setCustomEmojis, setCustomKaomoji } from './state';
import { syncSet } from './storage';

// ======== 사용자 정의 이모티콘 (캐시 기반 동기화) ========
export function getCustomEmojis(): Item[] {
  return CUSTOM_EMOJIS;
}

export function getCustomKaomoji(): Item[] {
  return CUSTOM_KAOMOJI;
}

export async function saveCustomEmoji(char: string, tags: string[], category: string) {
  const next = [...CUSTOM_EMOJIS, { char, tags, category }];
  setCustomEmojis(next);
  await syncSet({ customEmojis: next });
}

export async function saveCustomKaomoji(char: string, tags: string[]) {
  const next = [...CUSTOM_KAOMOJI, { char, tags }];
  setCustomKaomoji(next);
  await syncSet({ customKaomoji: next });
}
