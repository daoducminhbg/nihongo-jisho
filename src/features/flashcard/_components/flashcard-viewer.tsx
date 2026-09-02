'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardFront } from './card-front';
import { CardBack } from './card-back';
import { RatingButtons } from './rating-buttons';
import { Button } from '@/components/ui/button';
import { submitCardReview } from '../_actions/update-card-review';
import { RotateCw, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { FlashcardItem, CardDirection, SessionStats } from '../_types/flashcard.types';
import Link from 'next/link';

interface FlashcardViewerProps {
  cards: FlashcardItem[];
  direction: CardDirection;
  onFinish?: () => void;
}

export function FlashcardViewer({ cards: initialCards, direction, onFinish }: FlashcardViewerProps) {
  const [cards, setCards] = useState<FlashcardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const currentCard = cards[currentIndex];
  const isCompleted = currentIndex >= cards.length;

  const handleFlip = useCallback(() => {
    if (!isCompleted && !isSubmitting) {
      setIsFlipped((prev) => !prev);
    }
  }, [isCompleted, isSubmitting]);

  const handleRate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);

      try {
        await submitCardReview(currentCard.srsCard.id, rating);

        // Update session stats
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          again: rating === 1 ? prev.again + 1 : prev.again,
          hard: rating === 2 ? prev.hard + 1 : prev.hard,
          good: rating === 3 ? prev.good + 1 : prev.good,
          easy: rating === 4 ? prev.easy + 1 : prev.easy,
        }));

        // If rated "Again", re-insert the card at the end of the current session to learn again!
        if (rating === 1) {
          setCards((prev) => [...prev, currentCard]);
        }

        // Advance to next card
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } catch (err) {
        console.error('Error submitting review:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting]
  );

  // Auto-speak on flip
  useEffect(() => {
    if (isFlipped && currentCard) {
      let textToSpeak: string | null = null;

      if (currentCard.itemType === 'vocab') {
        textToSpeak = currentCard.vocab?.word || null;
      } else if (currentCard.itemType === 'grammar') {
        // Ưu tiên đọc câu ví dụ tiếng Nhật thay vì đọc tiêu đề có chứa tiếng Việt
        const exampleSentence = currentCard.grammar?.examples?.[0]?.sentence;
        if (exampleSentence) {
          textToSpeak = exampleSentence;
        } else if (currentCard.grammar?.title) {
          // Fallback: chỉ đọc phần tiếng Nhật, loại bỏ hoàn toàn phần giải thích tiếng Việt trong ngoặc
          textToSpeak = currentCard.grammar.title.replace(/\s*[\(\[（【].*?[\)\]）】]/g, '').trim() || null;
        }
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
  }, [isFlipped, currentCard]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && !isSubmitting) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate(1);
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate(2);
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate(3);
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate(4);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped, isSubmitting]);

  if (isCompleted) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Hoàn thành phiên ôn tập!</h2>
          <p className="text-sm text-muted-foreground">
            Bạn đã ôn tập tổng cộng {stats.total} lượt thẻ theo thuật toán FSRS.
          </p>
        </div>

        {/* Stats breakdown */}
        <div className="grid grid-cols-4 gap-2 bg-muted/40 p-3 rounded-lg text-center">
          <div>
            <span className="text-xs text-muted-foreground">Học lại</span>
            <p className="text-lg font-bold text-destructive">{stats.again}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Khó</span>
            <p className="text-lg font-bold text-amber-500">{stats.hard}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Tốt</span>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.good}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Dễ</span>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.easy}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/flashcard" className="flex-1">
            <Button variant="outline" className="w-full">
              Cấu hình phiên mới
            </Button>
          </Link>
          <Link href="/flashcard/review" className="flex-1">
            <Button className="w-full">
              Xem Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((currentIndex / cards.length) * 100));

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Thẻ {currentIndex + 1} / {cards.length}
          </span>
          <span>{progressPercent}% hoàn thành</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Card with 3D Flip */}
      <div className="perspective-1000 cursor-pointer" onClick={handleFlip}>
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_e, info) => {
                if (Math.abs(info.offset.x) > 40) {
                  handleFlip();
                }
              }}
            >
              <CardFront item={currentCard} direction={direction} />
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_e, info) => {
                if (info.offset.x > 70) {
                  handleRate(3); // Swipe right = Good
                } else if (info.offset.x < -70) {
                  handleRate(1); // Swipe left = Again
                }
              }}
            >
              <CardBack item={currentCard} direction={direction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Area */}
      <div className="pt-2 min-h-[90px] flex items-center justify-center">
        {!isFlipped ? (
          <Button size="lg" className="w-full max-w-xs shadow-md" onClick={handleFlip}>
            <RotateCw className="w-4 h-4 mr-2" />
            Lật xem mặt sau
          </Button>
        ) : (
          <RatingButtons
            srsCard={currentCard.srsCard}
            onRate={handleRate}
            disabled={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
