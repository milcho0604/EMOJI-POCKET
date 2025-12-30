// 이모지 스킨톤 선택 기능

import { syncGet, syncSet } from './storage';

// 스킨톤 모디파이어 (Unicode Fitzpatrick Scale)
export const SKIN_TONES = {
  DEFAULT: '', // 기본 (노란색)
  LIGHT: '\u{1F3FB}', // 🏻 Light Skin Tone
  MEDIUM_LIGHT: '\u{1F3FC}', // 🏼 Medium-Light Skin Tone
  MEDIUM: '\u{1F3FD}', // 🏽 Medium Skin Tone
  MEDIUM_DARK: '\u{1F3FE}', // 🏾 Medium-Dark Skin Tone
  DARK: '\u{1F3FF}', // 🏿 Dark Skin Tone
} as const;

export type SkinToneType = typeof SKIN_TONES[keyof typeof SKIN_TONES];

// 스킨톤 이름 (한국어/영어)
export const SKIN_TONE_NAMES: Record<string, { ko: string; en: string }> = {
  [SKIN_TONES.DEFAULT]: { ko: '기본', en: 'Default' },
  [SKIN_TONES.LIGHT]: { ko: '밝음', en: 'Light' },
  [SKIN_TONES.MEDIUM_LIGHT]: { ko: '약간 밝음', en: 'Med-Light' },
  [SKIN_TONES.MEDIUM]: { ko: '중간', en: 'Medium' },
  [SKIN_TONES.MEDIUM_DARK]: { ko: '약간 어두움', en: 'Med-Dark' },
  [SKIN_TONES.DARK]: { ko: '어두움', en: 'Dark' },
};

// 스킨톤을 지원하는 이모지 패턴 (손, 사람 관련 이모지)
const SKIN_TONE_SUPPORTED_PATTERNS = [
  // 손 제스처
  '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
  // 손가락/손톱
  '💅', '🤳',
  // 신체 부위
  '💪', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁',
  // 사람 얼굴
  '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵',
  // 사람 직업/역할
  '👮', '🕵', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴', '👯', '🧖', '🧗', '🏇', '⛷', '🏂', '🏌', '🏄', '🚣', '🏊', '⛹', '🏋', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾', '🤹',
  // 사람 제스처
  '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷',
  // 사람 활동
  '🛀', '🛌',
  // 가족/커플
  '🧑‍🤝‍🧑', '👫', '👬', '👭',
];

// 스킨톤 지원 여부 확인
export function supportsSkinTone(emoji: string): boolean {
  // 기본 이모지 추출 (스킨톤 모디파이어 제거)
  const baseEmoji = emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');

  // ZWJ (Zero Width Joiner) 시퀀스 처리 (예: 👨‍👩‍👧‍👦)
  const firstEmoji = baseEmoji.split(/[\u{200D}]/u)[0];

  return SKIN_TONE_SUPPORTED_PATTERNS.some(pattern => firstEmoji.includes(pattern));
}

// 이모지에 스킨톤 적용
export function applySkinTone(emoji: string, skinTone: SkinToneType): string {
  if (!skinTone || skinTone === SKIN_TONES.DEFAULT) {
    // 기본 스킨톤: 기존 스킨톤 모디파이어 제거
    return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
  }

  // 기존 스킨톤 모디파이어 제거 후 새 스킨톤 적용
  const baseEmoji = emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');

  // ZWJ 시퀀스 처리: 각 사람 이모지에 스킨톤 적용
  const parts = baseEmoji.split(/(\u{200D})/u);
  const result = parts.map(part => {
    if (part === '\u{200D}') return part; // ZWJ는 그대로 유지

    // 스킨톤을 지원하는 이모지만 스킨톤 적용
    const firstChar = [...part][0];
    if (firstChar && SKIN_TONE_SUPPORTED_PATTERNS.some(p => firstChar.includes(p))) {
      // 첫 번째 문자 뒤에 스킨톤 삽입
      return [...part].map((char, idx) => {
        if (idx === 0 && SKIN_TONE_SUPPORTED_PATTERNS.some(p => char.includes(p))) {
          return char + skinTone;
        }
        return char;
      }).join('');
    }
    return part;
  }).join('');

  return result;
}

// 이모지에서 현재 스킨톤 추출
export function getCurrentSkinTone(emoji: string): SkinToneType {
  const match = emoji.match(/[\u{1F3FB}-\u{1F3FF}]/u);
  if (match) {
    return match[0] as SkinToneType;
  }
  return SKIN_TONES.DEFAULT;
}

// 사용자의 기본 스킨톤 설정 저장
export async function saveSkinTonePreference(skinTone: SkinToneType): Promise<void> {
  await syncSet({ skinTonePreference: skinTone });
}

// 사용자의 기본 스킨톤 설정 로드
export async function loadSkinTonePreference(): Promise<SkinToneType> {
  const data = await syncGet<{ skinTonePreference?: SkinToneType }>(['skinTonePreference']);
  return data.skinTonePreference || SKIN_TONES.DEFAULT;
}

// 스킨톤 선택기 UI용 샘플 이모지
export const SKIN_TONE_SAMPLE_EMOJI = '✋';

// 스킨톤 옵션 생성 (UI 렌더링용)
export function getSkinToneOptions(): Array<{ tone: SkinToneType; emoji: string; name: { ko: string; en: string } }> {
  return Object.values(SKIN_TONES).map(tone => ({
    tone,
    emoji: applySkinTone(SKIN_TONE_SAMPLE_EMOJI, tone),
    name: SKIN_TONE_NAMES[tone],
  }));
}
