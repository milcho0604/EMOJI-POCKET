// 카테고리 파일 매핑
export const CATEGORY_FILES: Record<string, string> = {
  표정: '/data/emoji/emotion.json',
  손: '/data/emoji/hands.json',
  하트: '/data/emoji/hearts.json',
  동물: '/data/emoji/animals.json',
  음식: '/data/emoji/foods.json',
  사물: '/data/emoji/objects.json',
  자연: '/data/emoji/nature.json',
  기호: '/data/emoji/symbols.json',
  기타: '/data/emoji/events.json',
};

export const CATEGORY_ORDER = [...Object.keys(CATEGORY_FILES), '추가'];

// Kaomoji 카테고리 (태그 기반)
export const KAOMOJI_CATEGORIES = [
  '기쁨',
  '슬픔',
  '화남',
  '사랑',
  '응원',
  '당황',
  '무심',
  '피곤',
  '추가',
];

// 카테고리 이름 매핑 (한국어 -> i18n 키)
export const CATEGORY_I18N_KEYS: Record<string, string> = {
  전체: 'category.all',
  표정: 'category.emotion',
  손: 'category.hands',
  하트: 'category.hearts',
  동물: 'category.animals',
  음식: 'category.foods',
  사물: 'category.objects',
  자연: 'category.nature',
  기호: 'category.symbols',
  기타: 'category.events',
  추가: 'category.custom',
};

export const KAOMOJI_I18N_KEYS: Record<string, string> = {
  전체: 'category.all',
  기쁨: 'kaomoji.joy',
  슬픔: 'kaomoji.sad',
  화남: 'kaomoji.angry',
  사랑: 'kaomoji.love',
  응원: 'kaomoji.cheer',
  당황: 'kaomoji.confused',
  무심: 'kaomoji.indifferent',
  피곤: 'kaomoji.tired',
  추가: 'kaomoji.custom',
};
