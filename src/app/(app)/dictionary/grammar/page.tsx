import { getGrammars } from '@/features/dictionary/_actions/get-grammars';
import { GrammarList } from '@/features/dictionary/_components/grammar-list';
import { DictionaryNavTabs } from '@/components/shared/dictionary-nav-tabs';
import { GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GrammarDictionaryPage() {
  const result = await getGrammars({ limit: 200 });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          Từ điển Ngữ pháp
        </h1>
        <p className="text-muted-foreground mt-1">
          Tổng hợp các cấu trúc ngữ pháp bạn đã học, kèm sắc thái bối cảnh (anime slang, khẩu ngữ, trang trọng) và câu ví dụ.
        </p>
      </div>

      <DictionaryNavTabs />

      <GrammarList initialGrammars={result.data} />
    </div>
  );
}
