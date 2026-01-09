// 검색어 하이라이팅 유틸리티

/**
 * 텍스트에서 검색어를 찾아 하이라이트 태그로 감싸기
 * @param text 원본 텍스트
 * @param query 검색어
 * @returns 하이라이트가 적용된 HTML 문자열
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

/**
 * 태그 배열에서 검색어와 일치하는 부분 하이라이트
 * @param tags 태그 배열
 * @param query 검색어
 * @returns 하이라이트가 적용된 HTML 문자열
 */
export function highlightTags(tags: string[], query: string): string {
  if (!query.trim()) return tags.join(', ');

  const highlightedTags = tags.map(tag => {
    if (tag.toLowerCase().includes(query.toLowerCase())) {
      return highlightText(tag, query);
    }
    return tag;
  });

  return highlightedTags.join(', ');
}
