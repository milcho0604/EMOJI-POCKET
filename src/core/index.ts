/**
 * Core export
 */
export * from './state';
export * from './theme';
export * from './language';
export * from './constants';
export * from './types';

// 타입 명시적 export
export type { Emoji, Kaomoji, Item, ThemeMode, TabType } from './types';

// State export
export {
  EMOJIS,
  LOADED_CATS,
  ACTIVE_CAT,
  KAOMOJI,
  FAVORITES,
  RECENT,
  CUSTOM_EMOJIS,
  CUSTOM_KAOMOJI,
  THEME,
  SKIN_TONE_PREFERENCE,
  EMOJI_SKIN_TONES,
  activeTab,
  setEmojis,
  addEmojis,
  setLoadedCats,
  addLoadedCat,
  setActiveCat,
  setKaomoji,
  setFavorites,
  setRecent,
  setCustomEmojis,
  setCustomKaomoji,
  setTheme,
  setSkinTonePreference,
  setEmojiSkinTones,
  setActiveTab,
  loadFromSync
} from './state';

// Theme export
export { applyTheme, getTheme, setTheme as setThemeAction, toggleTheme } from './theme';

// Language export
export { initLanguage, updateLanguageButton, toggleLanguage } from './language';

// Constants export
export {
  CATEGORY_ORDER,
  CATEGORY_FILES,
  KAOMOJI_CATEGORIES,
  CATEGORY_I18N_KEYS,
  KAOMOJI_I18N_KEYS
} from './constants';
