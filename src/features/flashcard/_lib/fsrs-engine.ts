import {
  fsrs,
  createEmptyCard,
  Rating,
  State,
  type Card,
  type RecordLogItem,
  type Grade,
} from 'ts-fsrs';
import type { SRSCard } from '@/types/database.types';

// Initialize FSRS with standard parameters
const scheduler = fsrs();

/**
 * Maps database SRSCard to ts-fsrs Card interface
 */
export function toFSRSCard(dbCard: SRSCard): Card {
  let state = State.New;
  if (dbCard.state === 'learning') state = State.Learning;
  else if (dbCard.state === 'review') state = State.Review;
  else if (dbCard.state === 'relearning') state = State.Relearning;

  const baseCard = createEmptyCard(new Date(dbCard.due));

  return {
    ...baseCard,
    due: new Date(dbCard.due),
    stability: dbCard.stability,
    difficulty: dbCard.difficulty,
    elapsed_days: dbCard.elapsed_days,
    scheduled_days: dbCard.scheduled_days,
    reps: dbCard.reps,
    lapses: dbCard.lapses,
    state,
    last_review: dbCard.last_review ? new Date(dbCard.last_review) : undefined,
  };
}

/**
 * Maps ts-fsrs Card state back to database SRSCard state string
 */
export function fromFSRSState(state: State): 'new' | 'learning' | 'review' | 'relearning' {
  switch (state) {
    case State.New:
      return 'new';
    case State.Learning:
      return 'learning';
    case State.Review:
      return 'review';
    case State.Relearning:
      return 'relearning';
    default:
      return 'review';
  }
}

/**
 * Calculates next schedule for all 4 ratings (Again, Hard, Good, Easy)
 */
export function calculateNextSchedule(card: Card, now: Date = new Date()): Record<Grade, RecordLogItem> {
  return scheduler.repeat(card, now);
}

/**
 * Formats time interval into human-friendly Vietnamese text:
 * e.g. "10 phút", "1 ngày", "3 ngày", "2 tuần"
 */
export function formatInterval(due: Date, now: Date = new Date()): string {
  const diffMs = due.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes <= 1) return '< 1 phút';
  if (diffMinutes < 60) return `${diffMinutes} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays === 1) return '1 ngày';
  if (diffDays < 30) return `${diffDays} ngày`;
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} tháng`;
  return `${(diffDays / 365).toFixed(1)} năm`;
}

export { Rating, State, createEmptyCard };
export type { Card, Grade };
