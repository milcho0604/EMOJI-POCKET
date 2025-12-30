// 가상 스크롤 (Virtual Scroll) 구현
// 보이는 영역만 렌더링하여 성능 향상

export interface VirtualScrollConfig {
  itemHeight: number; // 각 아이템의 높이
  containerHeight: number; // 컨테이너 높이
  overscan: number; // 추가로 렌더링할 아이템 수 (위아래)
}

export interface VirtualScrollState {
  scrollTop: number; // 현재 스크롤 위치
  visibleStart: number; // 보이는 영역의 시작 인덱스
  visibleEnd: number; // 보이는 영역의 끝 인덱스
}

/**
 * 현재 스크롤 위치에서 렌더링해야 할 아이템 범위 계산
 */
export function calculateVisibleRange(
  scrollTop: number,
  totalItems: number,
  itemsPerRow: number,
  config: VirtualScrollConfig
): { start: number; end: number; offsetY: number } {
  const { itemHeight, containerHeight, overscan } = config;

  // 보이는 행 수 계산
  const visibleRows = Math.ceil(containerHeight / itemHeight);

  // 현재 스크롤 위치에서 보이는 첫 번째 행
  const startRow = Math.floor(scrollTop / itemHeight);

  // overscan을 고려한 실제 렌더링 시작/끝 행
  const renderStartRow = Math.max(0, startRow - overscan);
  const renderEndRow = Math.min(
    Math.ceil(totalItems / itemsPerRow),
    startRow + visibleRows + overscan
  );

  // 행을 아이템 인덱스로 변환
  const start = renderStartRow * itemsPerRow;
  const end = Math.min(totalItems, renderEndRow * itemsPerRow);

  // 상단 offset (빈 공간)
  const offsetY = renderStartRow * itemHeight;

  return { start, end, offsetY };
}

/**
 * 전체 컨텐츠의 높이 계산
 */
export function calculateTotalHeight(
  totalItems: number,
  itemsPerRow: number,
  itemHeight: number
): number {
  const totalRows = Math.ceil(totalItems / itemsPerRow);
  return totalRows * itemHeight;
}
