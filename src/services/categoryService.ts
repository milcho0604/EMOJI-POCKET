import type { Emoji, Kaomoji } from '../core/types';
import { CATEGORY_FILES, CATEGORY_ORDER } from '../core/constants';
import { LOADED_CATS, addEmojis, addLoadedCat } from '../core/state';

// 카테고리 JSON 로드
export async function loadCategory(cat: string): Promise<Emoji[]> {
  const path = CATEGORY_FILES[cat];
  if (!path) {
    throw new Error(`Category "${cat}" not found in CATEGORY_FILES`);
  }
  const url = chrome.runtime.getURL(path);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const data: Emoji[] = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid data format for category "${cat}"`);
  }
  return data.map((d) => ({ ...d, category: cat }));
}

export async function ensureCategoryLoaded(cat: string) {
  if (cat === '전체') return;
  if (LOADED_CATS.has(cat)) return;
  try {
    const part = await loadCategory(cat);
    addEmojis(part);
    addLoadedCat(cat);
  } catch (error) {
    console.error(`Failed to load category "${cat}":`, error);
  }
}

export async function ensureAllCategoriesLoaded() {
  const categoriesToLoad = CATEGORY_ORDER.filter(
    (c) => c !== '추가' && !LOADED_CATS.has(c)
  );
  const tasks = categoriesToLoad.map((c) => ensureCategoryLoaded(c));
  if (tasks.length) {
    await Promise.allSettled(tasks);
  }
}

// Kaomoji 로더
export async function loadKaomoji(): Promise<Kaomoji[]> {
  const url = chrome.runtime.getURL('data/kaomoji.json');
  const res = await fetch(url);
  return await res.json();
}
