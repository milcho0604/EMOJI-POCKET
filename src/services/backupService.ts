import type { Item } from '../core/types';
import { CATEGORY_ORDER, KAOMOJI_CATEGORIES } from '../core/constants';
import { CUSTOM_EMOJIS, CUSTOM_KAOMOJI, setCustomEmojis, setCustomKaomoji } from '../core/state';
import { syncSet } from './storageService';

const BACKUP_FORMAT = 'emoji-pocket-custom-backup';
const BACKUP_VERSION = 1;

type BackupPayload = {
  format: string;
  version: number;
  exportedAt: string;
  customEmojis: Item[];
  customKaomoji: Item[];
};

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const normalized = tags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean);
  return Array.from(new Set(normalized));
}

function sanitizeEmojiItem(item: unknown): Item | null {
  if (!item || typeof item !== 'object') return null;
  const candidate = item as Partial<Item>;
  const char = typeof candidate.char === 'string' ? candidate.char.trim() : '';
  if (!char) return null;

  const tags = normalizeTags(candidate.tags);
  const category =
    typeof candidate.category === 'string' && CATEGORY_ORDER.includes(candidate.category)
      ? candidate.category
      : '추가';

  return { char, tags, category };
}

function sanitizeKaomojiItem(item: unknown): Item | null {
  if (!item || typeof item !== 'object') return null;
  const candidate = item as Partial<Item>;
  const char = typeof candidate.char === 'string' ? candidate.char.trim() : '';
  if (!char) return null;

  let tags = normalizeTags(candidate.tags);
  if (!tags.length) tags = ['추가'];
  if (!tags.some((tag) => KAOMOJI_CATEGORIES.includes(tag))) {
    tags = ['추가', ...tags];
  }

  return { char, tags };
}

function dedupeByChar(items: Item[]): Item[] {
  const map = new Map<string, Item>();
  for (const item of items) {
    if (!map.has(item.char)) {
      map.set(item.char, item);
    }
  }
  return Array.from(map.values());
}

export function createCustomDataBackup(): string {
  const payload: BackupPayload = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    customEmojis: CUSTOM_EMOJIS,
    customKaomoji: CUSTOM_KAOMOJI,
  };
  return JSON.stringify(payload, null, 2);
}

export async function restoreCustomDataBackup(raw: string): Promise<{
  customEmojiCount: number;
  customKaomojiCount: number;
}> {
  const parsed = JSON.parse(raw) as Partial<BackupPayload> & {
    customEmojis?: unknown[];
    customKaomoji?: unknown[];
  };

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file');
  }

  const sourceEmojis = Array.isArray(parsed.customEmojis) ? parsed.customEmojis : [];
  const sourceKaomoji = Array.isArray(parsed.customKaomoji) ? parsed.customKaomoji : [];

  const customEmojis = dedupeByChar(
    sourceEmojis
      .map((item) => sanitizeEmojiItem(item))
      .filter((item): item is Item => item !== null)
  );

  const customKaomoji = dedupeByChar(
    sourceKaomoji
      .map((item) => sanitizeKaomojiItem(item))
      .filter((item): item is Item => item !== null)
  );

  setCustomEmojis(customEmojis);
  setCustomKaomoji(customKaomoji);
  await syncSet({
    customEmojis,
    customKaomoji,
  });

  return {
    customEmojiCount: customEmojis.length,
    customKaomojiCount: customKaomoji.length,
  };
}
