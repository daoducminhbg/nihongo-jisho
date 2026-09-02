import type { SRSCard } from '@/types/database.types';

export interface AnkiScheduleResult {
  state: 'new' | 'learning' | 'review' | 'relearning';
  stability: number; // Anki factor f (default 2500, min 1300)
  difficulty: number;
  scheduled_days: number; // Interval i in days
  elapsed_days: number;
  reps: number;
  lapses: number;
  due: string; // ISO date string
}

/**
 * Anki SM-2 Scheduler based on Anki's sched.py algorithm:
 * Reference: https://github.com/dae/anki/blob/24b451b0e4cfb50191e294052363a79f69f35c02/anki/sched.py
 *
 * Ratings:
 * 1 = Again (Fail)
 * 2 = Hard
 * 3 = Good (Pass)
 * 4 = Easy
 */
export function calculateAnkiSchedule(
  card: SRSCard,
  rating: 1 | 2 | 3 | 4,
  now: Date = new Date()
): AnkiScheduleResult {
  // Factor f: defaults to 2500 (250% ease), minimum 1300
  const f = card.stability && card.stability >= 1300 ? card.stability : 2500;
  const isNew = card.state === 'new';
  const isLearning = card.state === 'learning';
  const isRelearning = card.state === 'relearning';
  const reps = card.reps || 0;
  const lapses = card.lapses || 0;

  let nextDue = new Date(now);
  let nextState: 'new' | 'learning' | 'review' | 'relearning' = card.state;
  let nextFactor = f;
  let nextScheduledDays = card.scheduled_days || 0;
  let nextReps = reps + 1;
  let nextLapses = lapses;

  // ── CASE 1: New Card or Learning Step 0 (First encounter) ──
  if (isNew || (isLearning && reps === 0)) {
    if (rating === 1) {
      // Again: 1 minute
      nextDue = new Date(now.getTime() + 1 * 60 * 1000);
      nextState = 'learning';
      nextReps = 0;
      nextScheduledDays = 0;
    } else if (rating === 2) {
      // Hard: 6 minutes
      nextDue = new Date(now.getTime() + 6 * 60 * 1000);
      nextState = 'learning';
      nextReps = 0;
      nextScheduledDays = 0;
    } else if (rating === 3) {
      // Good: 10 minutes (Step 1)
      nextDue = new Date(now.getTime() + 10 * 60 * 1000);
      nextState = 'learning';
      nextReps = 1;
      nextScheduledDays = 0;
    } else {
      // Easy: Graduates immediately to Review (4 days)
      nextScheduledDays = 4;
      nextDue = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
      nextState = 'review';
      nextFactor = f + 150;
    }
  }
  // ── CASE 2: Learning Step 1 (Encountered again after 10m Good) ──
  else if (isLearning && reps >= 1) {
    if (rating === 1) {
      // Again: Reset to 1 minute
      nextDue = new Date(now.getTime() + 1 * 60 * 1000);
      nextState = 'learning';
      nextReps = 0;
      nextScheduledDays = 0;
    } else if (rating === 2) {
      // Hard: Repeat 6 minutes
      nextDue = new Date(now.getTime() + 6 * 60 * 1000);
      nextState = 'learning';
      nextScheduledDays = 0;
    } else if (rating === 3) {
      // Good: GRADUATES! (1 day)
      nextScheduledDays = 1;
      nextDue = new Date(now.getTime() + 1 * 24 * 3600 * 1000);
      nextState = 'review';
    } else {
      // Easy: Graduates with bonus (4 days)
      nextScheduledDays = 4;
      nextDue = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
      nextState = 'review';
      nextFactor = f + 150;
    }
  }
  // ── CASE 3: Relearning Card (Failed review) ──
  else if (isRelearning) {
    if (rating === 1) {
      nextDue = new Date(now.getTime() + 1 * 60 * 1000);
      nextState = 'relearning';
      nextReps = 0;
    } else if (rating === 2) {
      nextDue = new Date(now.getTime() + 6 * 60 * 1000);
      nextState = 'relearning';
    } else if (rating === 3) {
      // Good: Returns to review (1 day)
      nextScheduledDays = 1;
      nextDue = new Date(now.getTime() + 1 * 24 * 3600 * 1000);
      nextState = 'review';
    } else {
      nextScheduledDays = 2;
      nextDue = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
      nextState = 'review';
    }
  }
  // ── CASE 4: Review Card (Graduated - Anki Github SM-2 formula) ──
  else {
    const i = Math.max(1, card.scheduled_days || 1);
    const lastDue = card.due ? new Date(card.due) : now;
    const d = Math.max(0, (now.getTime() - lastDue.getTime()) / (24 * 3600 * 1000)); // Delay in days
    const m = 1.0; // Interval modifier
    const m4 = 1.3; // Easy modifier

    if (rating === 1) {
      // Fail: f' = max(1300, f - 200), drops to relearning 10m
      nextFactor = Math.max(1300, f - 200);
      nextLapses = lapses + 1;
      nextScheduledDays = 1;
      nextDue = new Date(now.getTime() + 10 * 60 * 1000); // 10 min relearning
      nextState = 'relearning';
      nextReps = 0;
    } else if (rating === 2) {
      // Hard: f' = max(1300, f - 150), i2 = max(i + 1, (i + d/4) * 1.2 * m)
      nextFactor = Math.max(1300, f - 150);
      const i2 = Math.max(i + 1, Math.round((i + d / 4) * 1.2 * m));
      nextScheduledDays = i2;
      nextDue = new Date(now.getTime() + i2 * 24 * 3600 * 1000);
      nextState = 'review';
    } else if (rating === 3) {
      // Good: f' = f, i3 = max(i2 + 1, (i + d/2) * (f / 1000) * m)
      nextFactor = f;
      const i2 = Math.max(i + 1, Math.round((i + d / 4) * 1.2 * m));
      const i3 = Math.max(i2 + 1, Math.round((i + d / 2) * (f / 1000) * m));
      nextScheduledDays = i3;
      nextDue = new Date(now.getTime() + i3 * 24 * 3600 * 1000);
      nextState = 'review';
    } else {
      // Easy: f' = max(1300, f + 150), i4 = max(i3 + 1, (i + d) * (f / 1000) * m * m4)
      nextFactor = Math.max(1300, f + 150);
      const i2 = Math.max(i + 1, Math.round((i + d / 4) * 1.2 * m));
      const i3 = Math.max(i2 + 1, Math.round((i + d / 2) * (f / 1000) * m));
      const i4 = Math.max(i3 + 1, Math.round((i + d) * (f / 1000) * m * m4));
      nextScheduledDays = i4;
      nextDue = new Date(now.getTime() + i4 * 24 * 3600 * 1000);
      nextState = 'review';
    }
  }

  return {
    state: nextState,
    stability: nextFactor,
    difficulty: card.difficulty || 0,
    scheduled_days: nextScheduledDays,
    elapsed_days: Math.round((now.getTime() - (card.last_review ? new Date(card.last_review).getTime() : now.getTime())) / (24 * 3600 * 1000)),
    reps: nextReps,
    lapses: nextLapses,
    due: nextDue.toISOString(),
  };
}

/**
 * Calculates all 4 schedules for a card (Again, Hard, Good, Easy)
 */
export function calculateNextSchedule(card: SRSCard, now: Date = new Date()) {
  return {
    1: calculateAnkiSchedule(card, 1, now),
    2: calculateAnkiSchedule(card, 2, now),
    3: calculateAnkiSchedule(card, 3, now),
    4: calculateAnkiSchedule(card, 4, now),
  };
}

/**
 * Formats time interval into human-friendly Vietnamese text:
 * e.g. "< 1 phút", "10 phút", "1 ngày", "3 ngày", "2 tuần"
 */
export function formatInterval(due: Date | string, now: Date = new Date()): string {
  const dueDate = typeof due === 'string' ? new Date(due) : due;
  const diffMs = dueDate.getTime() - now.getTime();
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
export function isGraduatedForToday(due: Date | string, now: Date = new Date()): boolean {
  const dueDate = typeof due === 'string' ? new Date(due) : due;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return dueDate.getTime() >= tomorrow.getTime() || (dueDate.getTime() - now.getTime()) >= 16 * 3600 * 1000;
}
