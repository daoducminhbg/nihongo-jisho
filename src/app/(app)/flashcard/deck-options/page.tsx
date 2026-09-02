import { FlashcardNavTabs } from '@/components/shared/flashcard-nav-tabs';
import { DeckOptionsView } from '@/features/flashcard/_components/deck-options-view';
import { Sliders } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DeckOptionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Sliders className="w-6 h-6 text-primary" />
          Tùy chọn Bộ thẻ (Deck Options)
        </h1>
        <p className="text-muted-foreground mt-1">
          Cài đặt chuyên sâu bước học, giới hạn hàng ngày, thuật toán FSRS và bộ đếm giờ kiểu Anki.
        </p>
      </div>

      <FlashcardNavTabs />

      <DeckOptionsView />
    </div>
  );
}
