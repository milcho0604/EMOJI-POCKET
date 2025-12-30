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

// 사용자 정의 이모지 수정
export async function updateCustomEmoji(oldChar: string, newChar: string, tags: string[], category: string) {
  const next = CUSTOM_EMOJIS.map(item =>
    item.char === oldChar ? { char: newChar, tags, category } : item
  );
  setCustomEmojis(next);
  await syncSet({ customEmojis: next });
}

// 사용자 정의 카오모지 수정
export async function updateCustomKaomoji(oldChar: string, newChar: string, tags: string[]) {
  const next = CUSTOM_KAOMOJI.map(item =>
    item.char === oldChar ? { char: newChar, tags } : item
  );
  setCustomKaomoji(next);
  await syncSet({ customKaomoji: next });
}

// 사용자 정의 이모지 삭제
export async function deleteCustomEmoji(char: string) {
  const next = CUSTOM_EMOJIS.filter(item => item.char !== char);
  setCustomEmojis(next);
  await syncSet({ customEmojis: next });
}

// 사용자 정의 카오모지 삭제
export async function deleteCustomKaomoji(char: string) {
  const next = CUSTOM_KAOMOJI.filter(item => item.char !== char);
  setCustomKaomoji(next);
  await syncSet({ customKaomoji: next });
}

// 커스텀 이모티콘 여부 확인
export function isCustomEmoji(char: string): boolean {
  return CUSTOM_EMOJIS.some(item => item.char === char);
}

// 커스텀 카오모지 여부 확인
export function isCustomKaomoji(char: string): boolean {
  return CUSTOM_KAOMOJI.some(item => item.char === char);
}
