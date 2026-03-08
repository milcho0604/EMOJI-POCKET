export interface Translation {
  [key: string]: string;
}

export interface Translations {
  ko: Translation;
  en: Translation;
}

export const translations: Translations = {
  ko: {
    // 탭
    'tab.emoji': 'Emoji',
    'tab.kaomoji': 'Kaomoji',
    'tab.favorites': '⭐',
    'tab.recent': '최근에 사용한 이모티콘',

    // 검색
    'search.placeholder': '검색 (예: heart, happy, (웃음))',
    'search.recentTitle': '최근 검색어',
    'search.clearAll': '전체 삭제',
    'search.deleteOne': '삭제',

    // 테마
    'theme.toggle': '다크모드 전환',

    // 창 관리
    'window.open': '새 창으로 열기',

    // 카테고리 - Emoji
    'category.all': '전체',
    'category.emotion': '표정',
    'category.hands': '손',
    'category.hearts': '하트',
    'category.animals': '동물',
    'category.foods': '음식',
    'category.objects': '사물',
    'category.nature': '자연',
    'category.symbols': '기호',
    'category.events': '기타',
    'category.custom': '추가',

    // 카테고리 - Kaomoji
    'kaomoji.joy': '기쁨',
    'kaomoji.sad': '슬픔',
    'kaomoji.angry': '화남',
    'kaomoji.love': '사랑',
    'kaomoji.cheer': '응원',
    'kaomoji.confused': '당황',
    'kaomoji.indifferent': '무심',
    'kaomoji.tired': '피곤',
    'kaomoji.custom': '추가',

    // 힌트
    'hint.click': '항목 클릭: 클립보드 복사',

    // 버튼
    'button.addEmoji': '+ 사용자 이모티콘 추가',
    'button.devBlog': '개발자 블로그',

    // 모달
    'modal.title.emoji': '이모티콘 추가',
    'modal.title.kaomoji': '이모티콘 추가',
    'modal.input.emoji': '이모티콘 (예: 😊)',
    'modal.input.kaomoji': '이모티콘 (예: (´• ω •`))',
    'modal.input.tags': '태그 (쉼표로 구분, 예: 기쁨,웃음,happy)',
    'modal.button.cancel': '취소',
    'modal.button.save': '저장',

    // 토스트
    'toast.copied': 'Copied',

    // 언어 전환
    'language.current': 'KO',
    'language.switch': '언어 전환 (한국어/English)',

    // 스킨톤
    'skinTone.setDefault': '기본값으로 설정',
  },
  en: {
    // Tabs
    'tab.emoji': 'Emoji',
    'tab.kaomoji': 'Kaomoji',
    'tab.favorites': '⭐',
    'tab.recent': 'Recently Used',

    // Search
    'search.placeholder': 'Search (e.g., happy, smile)',
    'search.recentTitle': 'Recent Searches',
    'search.clearAll': 'Clear all',
    'search.deleteOne': 'Delete',

    // Theme
    'theme.toggle': 'Toggle Dark Mode',

    // Window Management
    'window.open': 'Open in New Window',

    // Categories - Emoji
    'category.all': 'All',
    'category.emotion': 'Mood',
    'category.hands': 'Hand',
    'category.hearts': 'Heart',
    'category.animals': 'Pet',
    'category.foods': 'Food',
    'category.objects': 'Item',
    'category.nature': 'Plant',
    'category.symbols': 'Sign',
    'category.events': 'Event',
    'category.custom': 'Add',

    // Categories - Kaomoji
    'kaomoji.joy': 'Joy',
    'kaomoji.sad': 'Sad',
    'kaomoji.angry': 'Angry',
    'kaomoji.love': 'Love',
    'kaomoji.cheer': 'Cheer',
    'kaomoji.confused': 'Panic',
    'kaomoji.indifferent': 'Calm',
    'kaomoji.tired': 'Tired',
    'kaomoji.custom': 'Add',

    // Hint
    'hint.click': 'Click to copy to clipboard',

    // Buttons
    'button.addEmoji': '+ Add Custom Emoji',
    'button.devBlog': 'Developer Blog',

    // Modal
    'modal.title.emoji': 'Add Emoji',
    'modal.title.kaomoji': 'Add Kaomoji',
    'modal.input.emoji': 'Emoji (e.g., 😊)',
    'modal.input.kaomoji': 'Kaomoji (e.g., (´• ω •`))',
    'modal.input.tags': 'Tags (comma-separated, e.g., joy,smile,happy)',
    'modal.button.cancel': 'Cancel',
    'modal.button.save': 'Save',

    // Toast
    'toast.copied': 'Copied',

    // Language switch
    'language.current': 'EN',
    'language.switch': 'Switch Language (한국어/English)',

    // Skin Tone
    'skinTone.setDefault': 'Set as default',
  },
};
