import { i18n } from '../i18n/i18n';
import { renderCats, render } from '../ui/renderer';

// ======== 언어 (i18n) ========
export async function initLanguage() {
  try {
    await i18n.loadLanguage();
    i18n.updatePageText();
    updateLanguageButton();
  } catch (error) {
    console.error('Failed to initialize language:', error);
  }
}

export function updateLanguageButton() {
  const $languageToggle = document.getElementById('languageToggle') as HTMLButtonElement;
  const langBtn = $languageToggle.querySelector('span');
  if (langBtn) {
    langBtn.textContent = i18n.t('language.current');
  }
}

export async function toggleLanguage() {
  i18n.toggleLanguage();
  await i18n.saveLanguage();
  i18n.updatePageText();
  updateLanguageButton();
  renderCats();
  render();
}
