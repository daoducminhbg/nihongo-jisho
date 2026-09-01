import { getKanjis } from '@/features/dictionary/_actions/get-kanjis';
import { KanjiList } from '@/features/dictionary/_components/kanji-list';
import { Languages } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function KanjiDictionaryPage() {
  const result = await getKanjis({ limit: 300 });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Languages className="w-6 h-6 text-primary" />
          Từ điển Kanji
        </h1>
        <p className="text-muted-foreground mt-1">
          Kho Hán tự cá nhân kèm âm Hán-Việt, âm On, âm Kun, nghĩa và animation thứ tự từng nét vẽ chuẩn KanjiVG.
        </p>
      </div>

      <KanjiList initialKanjis={result.data} />
    </div>
  );
}
