'use client';

import { useState, useEffect, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchResults } from '@/features/search/_components/search-results';
import { ImageSearchModal } from '@/features/search/_components/image-search-modal';
import { searchDictionary, type SearchAllResponse } from '@/features/search/_actions/fuzzy-search';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Search, Camera, Sparkles } from 'lucide-react';
import type { Vocabulary, Kanji, Grammar } from '@/types/database.types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute search on debounced query change
  useEffect(() => {
    if (!debouncedQuery) {
      setVocabularies([]);
      setKanjis([]);
      setGrammars([]);
      setHasSearched(false);
      return;
    }

    startTransition(async () => {
      const res = await searchDictionary(debouncedQuery);
      if (res.success) {
        setVocabularies(res.data.vocabularies);
        setKanjis(res.data.kanjis);
        setGrammars(res.data.grammars);
      }
      setHasSearched(true);
    });
  }, [debouncedQuery]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Tìm kiếm Từ điển
        </h1>
        <p className="text-muted-foreground mt-1">
          Tìm kiếm toàn diện trong kho Từ vựng, Kanji và Ngữ pháp của bạn bằng Romaji, Kana, chữ Hán, hoặc Nghĩa tiếng Việt.
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ từ (taberu / たべる / 食べる / ăn), âm Hán-Việt (THỰC)..."
            className="pl-10 pr-10 h-11 text-base shadow-sm"
            autoFocus
          />
          {isPending && (
            <div className="absolute right-3 top-3">
              <LoadingSpinner className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="h-11 gap-1.5 px-4 shrink-0"
          onClick={() => setIsImageSearchOpen(true)}
          title="Tìm kiếm bằng ảnh hoặc câu văn"
        >
          <Camera className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Tìm bằng ảnh</span>
        </Button>
      </div>

      {/* Quick Search Hints */}
      {!hasSearched && (
        <div className="p-4 rounded-lg bg-muted/40 border space-y-2 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Mẹo tìm kiếm thông minh:
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Hỗ trợ Romaji:</strong> Gõ <code className="bg-muted px-1 py-0.5 rounded">taberu</code> hệ thống sẽ tự tìm <code className="bg-muted px-1 py-0.5 rounded">食べる</code> và <code className="bg-muted px-1 py-0.5 rounded">たべる</code>.
            </li>
            <li>
              <strong>Tra cứu bằng âm Hán-Việt:</strong> Gõ <code className="bg-muted px-1 py-0.5 rounded">THỰC</code> để tìm chữ Hán <code className="bg-muted px-1 py-0.5 rounded">食</code>.
            </li>
            <li>
              <strong>Tìm kiếm bằng ảnh:</strong> Bấm nút <strong>&quot;Tìm bằng ảnh&quot;</strong> để dán ảnh anime/game hoặc câu tiếng Nhật dài, AI sẽ đối chiếu toàn bộ các từ bạn đã học có trong ảnh.
            </li>
          </ul>
        </div>
      )}

      {/* Search Results Display */}
      {hasSearched && (
        <SearchResults
          vocabularies={vocabularies}
          kanjis={kanjis}
          grammars={grammars}
          query={debouncedQuery}
        />
      )}

      {/* Image & Sentence Context Search Modal */}
      <ImageSearchModal
        open={isImageSearchOpen}
        onOpenChange={setIsImageSearchOpen}
      />
    </div>
  );
}
