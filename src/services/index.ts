/**
 * Services export
 */
export * from './categoryService';
export * from './customService';
export * from './favoritesService';
export * from './recentService';
export * from './skinToneService';
export * from './searchHistoryService';
export * from './backupService';
export * from './storageService';

// 타입 명시적 export
export type { SkinToneType } from './skinToneService';

// 함수 명시적 export
export { loadCategory, loadKaomoji, ensureCategoryLoaded, ensureAllCategoriesLoaded } from './categoryService';
export {
  getCustomEmojis,
  getCustomKaomoji,
  saveCustomEmoji,
  saveCustomKaomoji,
  updateCustomEmoji,
  updateCustomKaomoji,
  deleteCustomEmoji,
  deleteCustomKaomoji,
  isCustomEmoji,
  isCustomKaomoji
} from './customService';
export {
  getFavorites,
  saveFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite
} from './favoritesService';
export { getRecent, addToRecent } from './recentService';
export {
  getSearchHistory,
  addSearchQuery,
  getSearchSuggestions,
  removeSearchQuery,
  clearSearchHistory,
} from './searchHistoryService';
export { createCustomDataBackup, restoreCustomDataBackup } from './backupService';
export {
  SKIN_TONES,
  SKIN_TONE_NAMES,
  supportsSkinTone,
  applySkinTone,
  getCurrentSkinTone,
  saveSkinTonePreference,
  loadSkinTonePreference,
  saveEmojiSkinTone,
  loadEmojiSkinTones,
  getEmojiSkinTone,
  getSkinToneOptions
} from './skinToneService';
export { syncGet, syncSet, migrateLocalOnce } from './storageService';
