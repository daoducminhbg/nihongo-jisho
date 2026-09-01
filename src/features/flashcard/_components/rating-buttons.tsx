'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  toFSRSCard,
  calculateNextSchedule,
  formatInterval,
  Rating,
  type Grade,
} from '../_lib/fsrs-engine';
import type { SRSCard } from '@/types/database.types';

interface RatingButtonsProps {
  srsCard: SRSCard;
  onRate: (rating: 1 | 2 | 3 | 4) => void;
  disabled?: boolean;
}

export function RatingButtons({ srsCard, onRate, disabled }: RatingButtonsProps) {
  // Pre-calculate intervals for all 4 options
  const intervals = useMemo(() => {
    try {
      const fsrsCard = toFSRSCard(srsCard);
      const now = new Date();
      const scheduling = calculateNextSchedule(fsrsCard, now);

      return {
        again: formatInterval(scheduling[Rating.Again as Grade].card.due, now),
        hard: formatInterval(scheduling[Rating.Hard as Grade].card.due, now),
        good: formatInterval(scheduling[Rating.Good as Grade].card.due, now),
        easy: formatInterval(scheduling[Rating.Easy as Grade].card.due, now),
      };
    } catch {
      return {
        again: '< 1m',
        hard: '1d',
        good: '3d',
        easy: '7d',
      };
    }
  }, [srsCard]);

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-lg mx-auto">
      {/* Again Button */}
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => onRate(1)}
        className="flex flex-col h-auto py-2.5 px-1 border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-destructive transition-colors"
      >
        <span className="text-xs text-muted-foreground font-mono">{intervals.again}</span>
        <span className="text-sm font-bold mt-0.5">Học lại</span>
        <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">Phím 1</span>
      </Button>

      {/* Hard Button */}
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => onRate(2)}
        className="flex flex-col h-auto py-2.5 px-1 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors"
      >
        <span className="text-xs text-muted-foreground font-mono">{intervals.hard}</span>
        <span className="text-sm font-bold mt-0.5">Khó</span>
        <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">Phím 2</span>
      </Button>

      {/* Good Button */}
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => onRate(3)}
        className="flex flex-col h-auto py-2.5 px-1 border-green-500/30 hover:border-green-500 hover:bg-green-500/10 text-green-600 dark:text-green-400 transition-colors"
      >
        <span className="text-xs text-muted-foreground font-mono">{intervals.good}</span>
        <span className="text-sm font-bold mt-0.5">Tốt</span>
        <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">Phím 3</span>
      </Button>

      {/* Easy Button */}
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => onRate(4)}
        className="flex flex-col h-auto py-2.5 px-1 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
      >
        <span className="text-xs text-muted-foreground font-mono">{intervals.easy}</span>
        <span className="text-sm font-bold mt-0.5">Dễ</span>
        <span className="text-[10px] text-muted-foreground mt-0.5 opacity-60">Phím 4</span>
      </Button>
    </div>
  );
}
