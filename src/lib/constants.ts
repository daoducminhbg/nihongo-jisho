export const APP_NAME = 'Nihongo Jisho';
export const APP_DESCRIPTION = 'Ứng dụng học tiếng Nhật thông minh từ Anime, Game & Manga';

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JLPTLevel = (typeof JLPT_LEVELS)[number];

export const ITEM_TYPES = ['vocab', 'kanji', 'grammar'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const SRS_STATES = ['new', 'learning', 'review', 'relearning'] as const;
export type SRSState = (typeof SRS_STATES)[number];

export const JLPT_COLORS: Record<string, string> = {
  N5: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  N4: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  N3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  N2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  N1: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};
