import type { SRSCard, Vocabulary, Kanji, Grammar } from '@/types/database.types';
import type { ItemType, JLPTLevel } from '@/lib/constants';

export type CardDirection = 'JP_TO_VN' | 'VN_TO_JP';

export interface DeckConfig {
  itemTypes: ItemType[];
  jlptLevels: JLPTLevel[];
  direction: CardDirection;
  limit: number;
  mode: 'due_only' | 'all' | 'new_only';
  newLimit?: number | 'all';
  reviewLimit?: number | 'all';
}

export interface FlashcardItem {
  srsCard: SRSCard;
  itemType: ItemType;
  vocab?: Vocabulary;
  kanji?: Kanji;
  grammar?: Grammar;
}

export interface QueueSummary {
  dueCount: number;
  newCount: number;
  learningCount: number;
  graduatedCount: number;
  totalCards: number;
}

export interface SessionStats {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
}
