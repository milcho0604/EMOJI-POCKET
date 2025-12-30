import type { ThemeMode } from './types';
import { THEME, setTheme as setThemeState } from './state';
import { syncSet } from './storage';

// ======== 테마 (캐시 기반 동기화) ========
export function applyTheme() {
  const $html = document.documentElement;
  const $themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;

  $html.setAttribute('data-theme', THEME);
  $themeToggle.textContent = THEME === 'dark' ? '☀️' : '🌙';
}

export function getTheme(): ThemeMode {
  return THEME;
}

export async function setTheme(theme: ThemeMode) {
  setThemeState(theme);
  applyTheme();
  await syncSet({ theme });
}

export async function toggleTheme() {
  const next: ThemeMode = getTheme() === 'dark' ? 'light' : 'dark';
  await setTheme(next);
}
