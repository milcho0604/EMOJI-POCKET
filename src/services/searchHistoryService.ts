import { SEARCH_HISTORY, setSearchHistory } from '../core/state';
import { syncSet } from './storageService';

const MAX_SEARCH_HISTORY = 12;
const MIN_QUERY_LENGTH = 2;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getSearchHistory(): string[] {
  return SEARCH_HISTORY;
}

export async function addSearchQuery(query: string): Promise<void> {
  const normalized = normalizeQuery(query);
  if (normalized.length < MIN_QUERY_LENGTH) return;

  const next = SEARCH_HISTORY.filter((it) => it !== normalized);
  next.unshift(normalized);
  if (next.length > MAX_SEARCH_HISTORY) next.length = MAX_SEARCH_HISTORY;

  setSearchHistory(next);
  await syncSet({ searchHistory: next });
}

export function getSearchSuggestions(query: string, limit = 6): string[] {
  const normalized = normalizeQuery(query);
  const source = SEARCH_HISTORY;

  if (!normalized) {
    return source.slice(0, limit);
  }

  const prefixMatches = source.filter((it) => it.startsWith(normalized));
  const includeMatches = source.filter(
    (it) => !it.startsWith(normalized) && it.includes(normalized)
  );
  return [...prefixMatches, ...includeMatches].slice(0, limit);
}
