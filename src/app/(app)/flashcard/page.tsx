import { getQueueStats } from '@/features/flashcard/_actions/get-review-stats';
import { DeckConfigForm } from '@/features/flashcard/_components/deck-config';
import { FlashcardNavTabs } from '@/components/shared/flashcard-nav-tabs';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FlashcardPage() {
  const { stats } = await getQueueStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Layers className="w-6 h-6 text-primary" />
          Học Flashcard (FSRS)
        </h1>
        <p className="text-muted-foreground mt-1">
          Hệ thống lặp lại ngắt quãng thông minh giúp bạn ghi nhớ từ vựng, Hán tự và ngữ pháp lâu dài.
        </p>
      </div>

      <FlashcardNavTabs />

      <DeckConfigForm
        initialCounts={{
          due: stats.dueCount,
          newCount: stats.newCount,
          total: stats.totalCards,
        }}
      />
    </div>
  );
}
