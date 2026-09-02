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
 * Maps database SRSCard to ts-fsrs Card interface, restoring learning steps
 */
export function toFSRSCard(dbCard: SRSCard): Card {
  let state = State.New;
  if (dbCard.state === 'learning') state = State.Learning;
  else if (dbCard.state === 'review') state = State.Review;
  else if (dbCard.state === 'relearning') state = State.Relearning;

  const baseCard = createEmptyCard(new Date(dbCard.due));

  // Determine learning_steps:
  // If stored in database, use it directly.
  // Otherwise if in Learning state with stability >= 1.0, infer step 1.
  let learning_steps = dbCard.learning_steps ?? 0;
  if (learning_steps === 0 && state === State.Learning && dbCard.reps >= 1 && (dbCard.stability ?? 0) >= 1.0) {
    learning_steps = 1;
  }

  return {
    ...baseCard,
    due: new Date(dbCard.due),
    stability: dbCard.stability ?? 0,
    difficulty: dbCard.difficulty ?? 0,
    elapsed_days: dbCard.elapsed_days ?? 0,
    scheduled_days: dbCard.scheduled_days ?? 0,
    reps: dbCard.reps ?? 0,
    lapses: dbCard.lapses ?? 0,
    learning_steps,
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

/**
 * Checks if a card's due date is scheduled for tomorrow or later,
 * meaning it has graduated and leaves today's session queue.
 */
export function isGraduatedForToday(due: Date, now: Date = new Date()): boolean {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return due.getTime() >= tomorrow.getTime() || (due.getTime() - now.getTime()) >= 16 * 3600 * 1000;
}

export { Rating, State, createEmptyCard };
export type { Card, Grade };
