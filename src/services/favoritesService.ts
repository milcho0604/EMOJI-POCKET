import { FAVORITES, setFavorites } from '../core/state';
import { syncSet } from './storageService';

// ======== 즐겨찾기 (캐시 기반 동기화) ========
export function getFavorites(): Set<string> {
  return FAVORITES;
}

export async function saveFavorites(next: Set<string>) {
  setFavorites(new Set(next));
  await syncSet({ favorites: Array.from(FAVORITES) });
}

export async function addToFavorites(char: string) {
  if (FAVORITES.has(char)) return;
  FAVORITES.add(char);
  await syncSet({ favorites: Array.from(FAVORITES) });
}

export async function removeFromFavorites(char: string) {
  if (!FAVORITES.has(char)) return;
  FAVORITES.delete(char);
  await syncSet({ favorites: Array.from(FAVORITES) });
}

export function isFavorite(char: string): boolean {
  return FAVORITES.has(char);
}
