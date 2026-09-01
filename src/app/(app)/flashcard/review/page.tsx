import { getQueueStats } from '@/features/flashcard/_actions/get-review-stats';
import { ReviewDashboard } from '@/features/flashcard/_components/review-dashboard';
import { FlashcardNavTabs } from '@/components/shared/flashcard-nav-tabs';
import { RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FlashcardReviewPage() {
  const { stats } = await getQueueStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-primary" />
          Hàng đợi Ôn tập (Review Queue)
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi số lượng thẻ đến hạn theo ngày và tiến độ củng cố trí nhớ với mô hình FSRS.
        </p>
      </div>

      <FlashcardNavTabs />

      <ReviewDashboard stats={stats} />
    </div>
  );
}
