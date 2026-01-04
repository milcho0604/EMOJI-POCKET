import type { Emoji, Kaomoji, Item, ThemeMode, TabType } from './types';
import { syncGet } from './storage';
import type { SkinToneType } from './skinTone';
import { SKIN_TONES } from './skinTone';

// ======== 전역 상태 ========
export let EMOJIS: Emoji[] = [];
export let LOADED_CATS = new Set<string>();
export let ACTIVE_CAT: string = '전체';
export let KAOMOJI: Kaomoji[] = [];

// 캐시 (렌더 성능 및 동기화 반영 용이)
export let FAVORITES = new Set<string>();
export let RECENT: string[] = [];
export let CUSTOM_EMOJIS: Item[] = [];
export let CUSTOM_KAOMOJI: Item[] = [];
export let THEME: ThemeMode = 'light';
export let SKIN_TONE_PREFERENCE: SkinToneType = SKIN_TONES.DEFAULT;
export let EMOJI_SKIN_TONES: Record<string, SkinToneType> = {};

export let activeTab: TabType = 'emoji';

// 상태 업데이트 함수들
export function setEmojis(emojis: Emoji[]) {
  EMOJIS = emojis;
}

export function addEmojis(emojis: Emoji[]) {
  EMOJIS = EMOJIS.concat(emojis);
}

export function setLoadedCats(cats: Set<string>) {
  LOADED_CATS = cats;
}

export function addLoadedCat(cat: string) {
  LOADED_CATS.add(cat);
}

export function setActiveCat(cat: string) {
  ACTIVE_CAT = cat;
}

export function setKaomoji(kaomoji: Kaomoji[]) {
  KAOMOJI = kaomoji;
}

export function setFavorites(favorites: Set<string>) {
  FAVORITES = favorites;
}

export function setRecent(recent: string[]) {
  RECENT = recent;
}

export function setCustomEmojis(emojis: Item[]) {
  CUSTOM_EMOJIS = emojis;
}

export function setCustomKaomoji(kaomoji: Item[]) {
  CUSTOM_KAOMOJI = kaomoji;
}

export function setTheme(theme: ThemeMode) {
  THEME = theme;
}

export function setSkinTonePreference(skinTone: SkinToneType) {
  SKIN_TONE_PREFERENCE = skinTone;
}

export function setEmojiSkinTones(skinTones: Record<string, SkinToneType>) {
  EMOJI_SKIN_TONES = skinTones;
}

export function setActiveTab(tab: TabType) {
  activeTab = tab;
}

// 동기화 값 로드 → 캐시에 반영
export async function loadFromSync() {
  const {
    favorites = [],
    recent = [],
    theme = 'light',
    customEmojis = [],
    customKaomoji = [],
    skinTonePreference = SKIN_TONES.DEFAULT,
    emojiSkinTones = {},
  } = await syncGet<{
    favorites?: string[];
    recent?: string[];
    theme?: ThemeMode;
    customEmojis?: Item[];
    customKaomoji?: Item[];
    skinTonePreference?: SkinToneType;
    emojiSkinTones?: Record<string, SkinToneType>;
  }>({
    favorites: [],
    recent: [],
    theme: 'light',
    customEmojis: [],
    customKaomoji: [],
    skinTonePreference: SKIN_TONES.DEFAULT,
    emojiSkinTones: {},
  });

  FAVORITES = new Set<string>(favorites);
  RECENT = Array.isArray(recent) ? recent : [];
  CUSTOM_EMOJIS = Array.isArray(customEmojis) ? customEmojis : [];
  CUSTOM_KAOMOJI = Array.isArray(customKaomoji) ? customKaomoji : [];
  THEME = theme === 'dark' ? 'dark' : 'light';
  SKIN_TONE_PREFERENCE = skinTonePreference || SKIN_TONES.DEFAULT;
  EMOJI_SKIN_TONES = emojiSkinTones || {};
}
