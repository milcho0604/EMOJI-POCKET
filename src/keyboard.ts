// 키보드 네비게이션 관리

let focusedIndex = -1;
let gridColumns = 8; // 기본 이모지 그리드 컬럼 수

export function setGridColumns(cols: number) {
  gridColumns = cols;
}

export function getFocusedIndex(): number {
  return focusedIndex;
}

export function setFocusedIndex(index: number) {
  focusedIndex = index;
}

export function resetFocus() {
  focusedIndex = -1;
}

// 포커스 시각적 업데이트
export function updateFocusedCell() {
  const cells = document.querySelectorAll<HTMLDivElement>('.cell');

  // 모든 셀의 포커스 제거
  cells.forEach((cell) => cell.classList.remove('focused'));

  // 현재 포커스된 셀에 스타일 적용
  if (focusedIndex >= 0 && focusedIndex < cells.length) {
    const focusedCell = cells[focusedIndex];
    focusedCell.classList.add('focused');

    // 스크롤하여 보이게 하기
    focusedCell.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }
}

// 화살표 키 핸들러
export function handleArrowKey(
  key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight',
  totalItems: number
) {
  const cells = document.querySelectorAll<HTMLDivElement>('.cell');

  // 포커스가 없으면 첫 번째 아이템으로
  if (focusedIndex === -1) {
    focusedIndex = 0;
    updateFocusedCell();
    return;
  }

  const currentRow = Math.floor(focusedIndex / gridColumns);
  const currentCol = focusedIndex % gridColumns;

  switch (key) {
    case 'ArrowLeft':
      if (focusedIndex > 0) {
        focusedIndex--;
      }
      break;

    case 'ArrowRight':
      if (focusedIndex < totalItems - 1) {
        focusedIndex++;
      }
      break;

    case 'ArrowUp':
      if (currentRow > 0) {
        focusedIndex = Math.max(0, focusedIndex - gridColumns);
      }
      break;

    case 'ArrowDown':
      if (focusedIndex + gridColumns < totalItems) {
        focusedIndex = Math.min(totalItems - 1, focusedIndex + gridColumns);
      }
      break;
  }

  updateFocusedCell();
}

// 선택된 아이템의 문자 가져오기
export function getFocusedChar(): string | null {
  const cells = document.querySelectorAll<HTMLDivElement>('.cell');
  if (focusedIndex >= 0 && focusedIndex < cells.length) {
    return cells[focusedIndex].dataset.char || null;
  }
  return null;
}
