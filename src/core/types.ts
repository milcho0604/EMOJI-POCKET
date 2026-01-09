// 데이터 타입 정의
export type Emoji = { char: string; tags: string[]; category: string };
export type Kaomoji = { char: string; tags: string[] };
export type Item = { char: string; tags: string[]; category?: string };

// 테마 타입
export type ThemeMode = 'light' | 'dark';

// 탭 타입
export type TabType = 'emoji' | 'kaomoji' | 'favorites' | 'recent';
