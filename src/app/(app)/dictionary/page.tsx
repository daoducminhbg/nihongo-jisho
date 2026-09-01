import { getVocabularies } from '@/features/dictionary/_actions/get-vocabularies';
import { VocabTable } from '@/features/dictionary/_components/vocab-table';
import { DictionaryNavTabs } from '@/components/shared/dictionary-nav-tabs';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DictionaryPage() {
  const result = await getVocabularies({ limit: 200 });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Từ điển Từ vựng
        </h1>
        <p className="text-muted-foreground mt-1">
          Kho từ vựng cá nhân được thu thập từ Anime, Manga & Game. Bạn có thể ẩn/hiện cột để tự kiểm tra trí nhớ.
        </p>
      </div>

      <DictionaryNavTabs />

      <VocabTable initialData={result.data} />
    </div>
  );
}
