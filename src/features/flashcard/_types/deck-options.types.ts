export interface AnkiDeckOptions {
  // 1. Giới hạn hàng ngày (Daily Limits)
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  newCardsIgnoreReviewLimit: boolean;
  limitsStartFromTop: boolean;

  // 2. Thẻ Mới (New Cards)
  learningSteps: string; // e.g. "1m 10m"
  insertionOrder: 'sequential' | 'random'; // "Tuần tự (thẻ cũ nhất trước)" | "Ngẫu nhiên"

  // 3. Hỏng (Lapses)
  relearningSteps: string; // e.g. "10m"
  leechThreshold: number; // e.g. 8
  leechAction: 'tag_only' | 'suspend'; // "Chỉ gắn Nhãn" | "Tạm hoãn Thẻ"

  // 4. Thứ tự hiển thị (Display Order)
  newGatherPriority: 'deck' | 'ascending_pos' | 'descending_pos';
  newSortOrder: 'template_then_order' | 'type_order' | 'random';
  newReviewPriority: 'mix' | 'new_first' | 'review_first';
  interdayLearningPriority: 'mix' | 'before_review' | 'after_review';
  reviewSortOrder: 'due_date_then_random' | 'earliest_due' | 'random';

  // 5. FSRS
  fsrsEnabled: boolean;
  desiredRetention: number; // e.g. 85 or 90 (%)
  fsrsParameters: string;
  rescheduleCardsOnChange: boolean;
  checkHealthWhenOptimizing: boolean;

  // 6. Đang tạm hoãn (Burying)
  buryNewSiblings: boolean;
  buryReviewSiblings: boolean;
  buryInterdayLearningSiblings: boolean;

  // 7. Âm thanh (Audio)
  noAutoPlayAudio: boolean;
  skipQuestionOnReplay: boolean;

  // 8. Bộ hẹn giờ (Timer)
  maxAnswerSeconds: number; // e.g. 60
  showTimer: boolean;
  stopTimerOnAnswer: boolean;

  // 9. Tự động Nâng cao (Auto Advance)
  secondsToShowQuestion: number; // e.g. 0.0
  secondsToShowAnswer: number; // e.g. 0.0
  waitForAudio: boolean;
  questionAction: 'show_answer' | 'bury_card';
  answerAction: 'bury_card' | 'again' | 'good';

  // 10. Easy Days (Mon -> Sun load factor)
  easyDays: {
    mon: 'minimum' | 'reduced' | 'normal';
    tue: 'minimum' | 'reduced' | 'normal';
    wed: 'minimum' | 'reduced' | 'normal';
    thu: 'minimum' | 'reduced' | 'normal';
    fri: 'minimum' | 'reduced' | 'normal';
    sat: 'minimum' | 'reduced' | 'normal';
    sun: 'minimum' | 'reduced' | 'normal';
  };

  // 11. Nâng cao (Advanced)
  maxInterval: number; // e.g. 36500
  historicalRetention: number; // e.g. 90
  ignoreCardsReviewedBefore: string; // e.g. "1970-01-01"
  customScheduling: string;
}

export const DEFAULT_ANKI_OPTIONS: AnkiDeckOptions = {
  newCardsPerDay: 20,
  maxReviewsPerDay: 9999,
  newCardsIgnoreReviewLimit: true,
  limitsStartFromTop: true,

  learningSteps: '1m 10m',
  insertionOrder: 'sequential',

  relearningSteps: '10m',
  leechThreshold: 8,
  leechAction: 'tag_only',

  newGatherPriority: 'deck',
  newSortOrder: 'template_then_order',
  newReviewPriority: 'mix',
  interdayLearningPriority: 'mix',
  reviewSortOrder: 'due_date_then_random',

  fsrsEnabled: true,
  desiredRetention: 85,
  fsrsParameters:
    '0.2120, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.0010, 1.8722, 0.1666, 0.7960, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912',
  rescheduleCardsOnChange: false,
  checkHealthWhenOptimizing: true,

  buryNewSiblings: false,
  buryReviewSiblings: false,
  buryInterdayLearningSiblings: false,

  noAutoPlayAudio: false,
  skipQuestionOnReplay: false,

  maxAnswerSeconds: 60,
  showTimer: false,
  stopTimerOnAnswer: false,

  secondsToShowQuestion: 0.0,
  secondsToShowAnswer: 0.0,
  waitForAudio: true,
  questionAction: 'show_answer',
  answerAction: 'bury_card',

  easyDays: {
    mon: 'normal',
    tue: 'normal',
    wed: 'normal',
    thu: 'normal',
    fri: 'normal',
    sat: 'normal',
    sun: 'normal',
  },

  maxInterval: 36500,
  historicalRetention: 90,
  ignoreCardsReviewedBefore: '1970-01-01',
  customScheduling: '',
};
