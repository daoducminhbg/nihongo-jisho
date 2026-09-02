'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardFront } from './card-front';
import { CardBack } from './card-back';
import { RatingButtons } from './rating-buttons';
import { Button } from '@/components/ui/button';
import { submitCardReview } from '../_actions/update-card-review';
import { isGraduatedForToday, calculateAnkiSchedule } from '../_lib/fsrs-engine';
import { RotateCw, CheckCircle2, Clock, Zap, Sparkles } from 'lucide-react';
import type { FlashcardItem, CardDirection, SessionStats } from '../_types/flashcard.types';
import type { SRSCard } from '@/types/database.types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadDeckOptions } from '../_lib/deck-options-storage';

interface FlashcardViewerProps {
  cards: FlashcardItem[];
  direction: CardDirection;
  onFinish?: () => void;
}

interface LearningQueueItem {
  item: FlashcardItem;
  dueTime: number; // timestamp in ms
}

/**
 * Pure queue picker matching Anki priority:
 * 1. Due Learning cards (dueTime <= now)
 * 2. Due Review cards
 * 3. New cards
 * 4. Waiting on future learning cards (10m delay)
 */
function getNextCardFromQueues(
  newQ: FlashcardItem[],
  revQ: FlashcardItem[],
  learnQ: LearningQueueItem[],
  now: number
): {
  card: FlashcardItem | null;
  newQ: FlashcardItem[];
  revQ: FlashcardItem[];
  learnQ: LearningQueueItem[];
} {
  // 1. Ready learning card (dueTime <= now)
  const readyIdx = learnQ.findIndex((l) => l.dueTime <= now);
  if (readyIdx !== -1) {
    const card = learnQ[readyIdx].item;
    const nextLearnQ = learnQ.filter((_, idx) => idx !== readyIdx);
    return { card, newQ, revQ, learnQ: nextLearnQ };
  }

  // 2. Review card
  if (revQ.length > 0) {
    const [card, ...nextRevQ] = revQ;
    return { card, newQ, revQ: nextRevQ, learnQ };
  }

  // 3. New card
  if (newQ.length > 0) {
    const [card, ...nextNewQ] = newQ;
    return { card, newQ: nextNewQ, revQ, learnQ };
  }

  // 4. None ready
  return { card: null, newQ, revQ, learnQ };
}

export function FlashcardViewer({ cards: initialCards, direction, onFinish }: FlashcardViewerProps) {
  const router = useRouter();
  const deckOptions = useRef(loadDeckOptions()).current;
  const [cardTimerSeconds, setCardTimerSeconds] = useState(0);

  // ── Initialize Anki Queues & First Card Synchronously ──
  const initialData = useRef(() => {
    const newQ = initialCards.filter((c) => c.srsCard.state === 'new');
    const revQ = initialCards.filter((c) => c.srsCard.state === 'review');
    const learnQ: LearningQueueItem[] = initialCards
      .filter((c) => c.srsCard.state === 'learning' || c.srsCard.state === 'relearning')
      .map((c) => ({
        item: c,
        dueTime: new Date(c.srsCard.due).getTime(),
      }));

    const first = getNextCardFromQueues(newQ, revQ, learnQ, Date.now());
    return {
      card: first.card,
      newQ: first.newQ,
      revQ: first.revQ,
      learnQ: first.learnQ,
    };
  }).current;

  const [activeCard, setActiveCard] = useState<FlashcardItem | null>(() => initialData().card);
  const [newQueue, setNewQueue] = useState<FlashcardItem[]>(() => initialData().newQ);
  const [reviewQueue, setReviewQueue] = useState<FlashcardItem[]>(() => initialData().revQ);
  const [learningQueue, setLearningQueue] = useState<LearningQueueItem[]>(() => initialData().learnQ);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [graduatedCount, setGraduatedCount] = useState(0);

  // Time ticker for countdown and checking due learning cards
  const [nowTime, setNowTime] = useState(() => Date.now());

  // Card timer
  useEffect(() => {
    setCardTimerSeconds(0);
  }, [activeCard?.srsCard.id]);

  useEffect(() => {
    if (!deckOptions.showTimer || !activeCard || (deckOptions.stopTimerOnAnswer && isFlipped)) return;
    const t = setInterval(() => {
      setCardTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [deckOptions.showTimer, deckOptions.stopTimerOnAnswer, activeCard, isFlipped]);

  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  // Ticker interval (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // If activeCard is null and a learning card becomes ready as time ticks
  useEffect(() => {
    if (!activeCard && learningQueue.length > 0) {
      const now = Date.now();
      const readyIdx = learningQueue.findIndex((l) => l.dueTime <= now);
      if (readyIdx !== -1) {
        const item = learningQueue[readyIdx].item;
        setLearningQueue((prev) => prev.filter((_, idx) => idx !== readyIdx));
        setActiveCard(item);
        setIsFlipped(false);
      }
    }
  }, [activeCard, learningQueue, nowTime]);

  // ── Action: Learn Ahead (học trước không cần đợi 10 phút) ──
  const handleLearnAhead = useCallback(() => {
    if (learningQueue.length === 0) return;
    const sorted = [...learningQueue].sort((a, b) => a.dueTime - b.dueTime);
    const earliestItem = sorted[0].item;
    setLearningQueue((prev) => prev.filter((l) => l.item.srsCard.id !== earliestItem.srsCard.id));
    setActiveCard(earliestItem);
    setIsFlipped(false);
  }, [learningQueue]);

  const handleFlip = useCallback(() => {
    if (activeCard && !isSubmitting) {
      setIsFlipped((prev) => !prev);
    }
  }, [activeCard, isSubmitting]);

  // ── Action: Rate Card (Optimistic 0ms Instant Progression) ──
  const handleRate = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!activeCard) return;

      const currentCard = activeCard;
      const now = new Date();

      // 1. Calculate schedule immediately on client (0ms lag)
      const scheduled = calculateAnkiSchedule(currentCard.srsCard, rating, now);
      const updatedCard: SRSCard = {
        ...currentCard.srsCard,
        due: scheduled.due,
        stability: scheduled.stability,
        difficulty: scheduled.difficulty,
        elapsed_days: scheduled.elapsed_days,
        scheduled_days: scheduled.scheduled_days,
        reps: scheduled.reps,
        lapses: scheduled.lapses,
        state: scheduled.state,
        last_review: now.toISOString(),
      };

      const nextDueDate = new Date(updatedCard.due);
      const graduated = isGraduatedForToday(nextDueDate);

      // 2. Update session stats immediately
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        again: rating === 1 ? prev.again + 1 : prev.again,
        hard: rating === 2 ? prev.hard + 1 : prev.hard,
        good: rating === 3 ? prev.good + 1 : prev.good,
        easy: rating === 4 ? prev.easy + 1 : prev.easy,
      }));

      let updatedLearningQ = [...learningQueue];

      if (graduated) {
        // Card graduated past today! Does NOT reappear in session today.
        setGraduatedCount((prev) => prev + 1);
      } else {
        // Still in learning phase for today (< 1m, 6m, 10m). Put into learningQueue with timestamp
        const updatedItem: FlashcardItem = {
          ...currentCard,
          srsCard: updatedCard,
        };
        updatedLearningQ.push({
          item: updatedItem,
          dueTime: nextDueDate.getTime(),
        });
      }

      // 3. Pick next card INSTANTLY
      const next = getNextCardFromQueues(newQueue, reviewQueue, updatedLearningQ, Date.now());

      setActiveCard(next.card);
      setNewQueue(next.newQ);
      setReviewQueue(next.revQ);
      setLearningQueue(next.learnQ);
      setIsFlipped(false);

      if (!next.card && next.learnQ.length === 0 && onFinish) {
        onFinish();
      }

      // 4. Save to database in background (Non-blocking!)
      submitCardReview(currentCard.srsCard.id, rating).catch((err) => {
        console.error('Background review save error:', err);
      });
    },
    [activeCard, learningQueue, newQueue, reviewQueue, onFinish]
  );

  // ── Auto-speak on flip ──
  useEffect(() => {
    if (isFlipped && activeCard && !deckOptions.noAutoPlayAudio) {
      let textToSpeak: string | null = null;

      if (activeCard.itemType === 'vocab') {
        textToSpeak = activeCard.vocab?.word || null;
      } else if (activeCard.itemType === 'grammar') {
        // Đọc câu ví dụ mẫu tiếng Nhật thay vì đọc tiêu đề chứa tiếng Việt
        const exampleSentence = activeCard.grammar?.examples?.[0]?.sentence;
        if (exampleSentence) {
          textToSpeak = exampleSentence;
        } else if (activeCard.grammar?.title) {
          textToSpeak = activeCard.grammar.title.replace(/\s*[\(\[（【].*?[\)\]）】]/g, '').trim() || null;
        }
      } else if (activeCard.itemType === 'kanji') {
        textToSpeak = activeCard.kanji?.character || null;
      }

      if (textToSpeak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang === 'ja-JP');
        if (jaVoice) utterance.voice = jaVoice;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isFlipped, activeCard]);

  // ── Keyboard Shortcuts (1, 2, 3, 4, Space) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && activeCard && !isSubmitting) {
        if (e.key === '1') handleRate(1);
        else if (e.key === '2') handleRate(2);
        else if (e.key === '3') handleRate(3);
        else if (e.key === '4') handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, activeCard, isSubmitting, handleFlip, handleRate]);

  // ── Anki Status Counts ──
  const activeIsNew = activeCard?.srsCard.state === 'new';
  const activeIsReview = activeCard?.srsCard.state === 'review';
  const activeIsLearning = activeCard && !activeIsNew && !activeIsReview;

  const currentNewCount = newQueue.length + (activeIsNew ? 1 : 0);
  const currentLearningCount = learningQueue.length + (activeIsLearning ? 1 : 0);
  const currentReviewCount = reviewQueue.length + (activeIsReview ? 1 : 0);

  const isSessionComplete =
    !activeCard && newQueue.length === 0 && reviewQueue.length === 0 && learningQueue.length === 0;

  // ── State 1: Session Completed Screen ──
  if (isSessionComplete) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Hoàn thành phiên học hôm nay!</h2>
          <p className="text-muted-foreground text-sm">
            Tất cả thẻ đã tốt nghiệp và được hẹn sang các ngày tiếp theo theo thuật toán Anki SM-2.
          </p>
        </div>

        {/* Anki Graduation Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          Đã hoàn tất {graduatedCount} thẻ xuất sắc
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 bg-muted/40 p-4 rounded-xl text-center">
          <div>
            <span className="text-xs text-muted-foreground">Học lại (1)</span>
            <p className="text-lg font-bold text-destructive">{stats.again}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Khó (2)</span>
            <p className="text-lg font-bold text-amber-500">{stats.hard}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Tốt (3)</span>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.good}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Dễ (4)</span>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.easy}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 w-full"
            onClick={() => {
              router.push('/flashcard');
              router.refresh();
            }}
          >
            Học thêm bộ khác
          </Button>
          <Button
            className="flex-1 w-full"
            onClick={() => {
              router.push('/flashcard/review');
              router.refresh();
            }}
          >
            Xem tiến độ học
          </Button>
        </div>
      </div>
    );
  }

  // ── State 2: Anki Waiting Screen (Tất cả từ mới đã học, đang đợi thẻ 10m đến hạn) ──
  if (!activeCard && learningQueue.length > 0) {
    const earliestTime = Math.min(...learningQueue.map((l) => l.dueTime));
    const secondsRemaining = Math.max(0, Math.ceil((earliestTime - nowTime) / 1000));
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    const formattedCountdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">Đang chờ nhịp ôn tập 10 phút</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Bạn đã nạp xong các từ mới! Có{' '}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {learningQueue.length} thẻ
            </span>{' '}
            đang được lùi lại để kiểm tra lại trí nhớ ngắn hạn trước khi tốt nghiệp.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="inline-flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-card border shadow-inner">
          <span className="text-xs text-muted-foreground font-medium">Thẻ tiếp theo sau</span>
          <span className="text-3xl font-mono font-extrabold text-primary tracking-wider mt-1">
            {formattedCountdown}
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            size="lg"
            className="w-full font-bold gap-2 shadow-md bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleLearnAhead}
          >
            <Zap className="w-4 h-4" />
            Ôn tập trước ngay (Learn Ahead)
          </Button>

          <Link href="/flashcard" className="block">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
              Tạm dừng phiên học
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── State 3: Active Card Studying ──
  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Anki Signature 3-Color Queue Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-muted/40 rounded-lg border border-border/40 text-xs">
        <div className="flex items-center gap-3">
          {/* Blue: New */}
          <div className="flex items-center gap-1.5" title="Thẻ mới">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="font-bold text-blue-600 dark:text-blue-400">{currentNewCount}</span>
            <span className="text-[10px] text-muted-foreground">mới</span>
          </div>

          {/* Red/Orange: Learning */}
          <div className="flex items-center gap-1.5" title="Thẻ đang học (hẹn giờ trong ngày)">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="font-bold text-amber-600 dark:text-amber-400">{currentLearningCount}</span>
            <span className="text-[10px] text-muted-foreground">đang học</span>
          </div>

          {/* Green: Review */}
          <div className="flex items-center gap-1.5" title="Thẻ đến hạn ôn tập">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            <span className="font-bold text-green-600 dark:text-green-400">{currentReviewCount}</span>
            <span className="text-[10px] text-muted-foreground">ôn tập</span>
          </div>
        </div>

        {/* Graduated Count & Optional Timer */}
        <div className="flex items-center gap-3">
          {deckOptions.showTimer && (
            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{cardTimerSeconds}s</span>
            </div>
          )}
          <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span>Đã xong: <strong className="text-foreground">{graduatedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Card with 3D Flip */}
      {activeCard && (
        <div className="perspective-1000 cursor-pointer select-none" onClick={handleFlip}>
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key={activeCard.srsCard.id + '-front'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                <CardFront item={activeCard} direction={direction} />
              </motion.div>
            ) : (
              <motion.div
                key={activeCard.srsCard.id + '-back'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
              >
                <CardBack item={activeCard} direction={direction} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Control / Rating Buttons */}
      <div className="pt-2 min-h-[90px] flex items-center justify-center">
        {!isFlipped ? (
          <Button size="lg" className="w-full max-w-xs shadow-md font-bold" onClick={handleFlip}>
            <RotateCw className="w-4 h-4 mr-2" />
            Lật xem mặt sau
          </Button>
        ) : (
          activeCard && (
            <RatingButtons
              srsCard={activeCard.srsCard}
              onRate={handleRate}
              disabled={isSubmitting}
            />
          )
        )}
      </div>
    </div>
  );
}
