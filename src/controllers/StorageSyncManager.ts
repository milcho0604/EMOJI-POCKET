/**
 * Chrome Storage 동기화 관리
 */
import type { SkinToneType } from '../services/skinToneService';
import type { Item } from '../core/types';
import {
  setFavorites,
  setRecent,
  setCustomEmojis,
  setCustomKaomoji,
  setTheme,
  setSkinTonePreference,
  setEmojiSkinTones,
} from '../core/state';
import { applyTheme } from '../core/theme';
import { i18n } from '../i18n/i18n';
import { updateLanguageButton } from '../core/language';
import { render, renderCats } from '../ui/renderer';

export class StorageSyncManager {
  initialize(): void {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;

      let needRender = false;

      if (changes.favorites) {
        const next = changes.favorites.newValue as string[] | undefined;
        setFavorites(new Set(next || []));
        needRender = true;
      }

      if (changes.recent) {
        setRecent((changes.recent.newValue as string[]) || []);
        needRender = true;
      }

      if (changes.customEmojis) {
        setCustomEmojis((changes.customEmojis.newValue as Item[]) || []);
        needRender = true;
      }

      if (changes.customKaomoji) {
        setCustomKaomoji((changes.customKaomoji.newValue as Item[]) || []);
        needRender = true;
      }

      if (changes.theme) {
        setTheme(changes.theme.newValue || 'light');
        applyTheme();
      }

      if (changes.skinTonePreference) {
        setSkinTonePreference(changes.skinTonePreference.newValue as SkinToneType);
        needRender = true;
      }

      if (changes.emojiSkinTones) {
        setEmojiSkinTones(
          (changes.emojiSkinTones.newValue as Record<string, SkinToneType>) || {}
        );
        needRender = true;
      }

      if (changes.language) {
        i18n.setLanguage(changes.language.newValue);
        i18n.updatePageText();
        updateLanguageButton();
        renderCats();
        needRender = true;
      }

      if (needRender) {
        render();
      }
    });
  }
}
