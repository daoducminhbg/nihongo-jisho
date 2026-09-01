import { getStudyCards } from '@/features/flashcard/_actions/get-due-cards';
import { FlashcardViewer } from '@/features/flashcard/_components/flashcard-viewer';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ItemType, JLPTLevel } from '@/lib/constants';
import type { CardDirection } from '@/features/flashcard/_types/flashcard.types';

export const dynamic = 'force-dynamic';

interface StudyPageProps {
  searchParams: Promise<{
    types?: string;
    jlpt?: string;
    direction?: string;
    mode?: string;
    limit?: string;
  }>;
}

export default async function FlashcardStudyPage({ searchParams }: StudyPageProps) {
  const params = await searchParams;

  const itemTypes: ItemType[] = params.types
    ? (params.types.split(',') as ItemType[])
    : ['vocab', 'kanji', 'grammar'];

  const jlptLevels: JLPTLevel[] = params.jlpt
    ? (params.jlpt.split(',') as JLPTLevel[])
    : ['N5', 'N4', 'N3'];

  const direction: CardDirection =
    params.direction === 'VN_TO_JP' ? 'VN_TO_JP' : 'JP_TO_VN';

  const mode = (params.mode as 'due_only' | 'all' | 'new_only') || 'due_only';
  const limit = params.limit ? parseInt(params.limit, 10) : 20;

  const { success, cards, error } = await getStudyCards({
    itemTypes,
    jlptLevels,
    direction,
    mode,
    limit,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center justify-between">
        <Link href="/flashcard">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Quay lại cấu hình
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground">
          Chế độ: {direction === 'JP_TO_VN' ? 'Nhật ➔ Việt' : 'Việt ➔ Nhật'}
        </span>
      </div>

      {(!success || cards.length === 0) ? (
        <EmptyState
          icon={Layers}
          title="Không có thẻ nào cần học"
          description={
            mode === 'due_only'
              ? 'Không có thẻ nào đến hạn ôn tập lúc này! Bạn có thể chọn học "Thẻ mới" hoặc "Trộn tất cả".'
              : 'Kho dữ liệu chưa có đủ thẻ cho bộ lọc đã chọn. Hãy quét thêm từ vựng từ anime/game bằng AI Scanner!'
          }
        >
          <div className="flex gap-3">
            <Link href="/flashcard">
              <Button variant="outline">Đổi cài đặt thẻ</Button>
            </Link>
            <Link href="/scan">
              <Button>Quét thêm từ vựng mới</Button>
            </Link>
          </div>
        </EmptyState>
      ) : (
        <FlashcardViewer cards={cards} direction={direction} />
      )}
    </div>
  );
}
