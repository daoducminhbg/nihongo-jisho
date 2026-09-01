'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { AudioButton } from '@/features/dictionary/_components/audio-button';
import { EmptyState } from '@/components/shared/empty-state';
import { BookOpen, Languages, GraduationCap } from 'lucide-react';
import type { Vocabulary, Kanji, Grammar } from '@/types/database.types';

interface SearchResultsProps {
  vocabularies: Vocabulary[];
  kanjis: Kanji[];
  grammars: Grammar[];
  query: string;
}

export function SearchResults({
  vocabularies,
  kanjis,
  grammars,
  query,
}: SearchResultsProps) {
  const totalResults = vocabularies.length + kanjis.length + grammars.length;

  if (totalResults === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={`Không tìm thấy kết quả cho "${query}"`}
        description="Thử tìm bằng Romaji (ví dụ: taberu), Hiragana, Katakana, chữ Hán hoặc nghĩa tiếng Việt."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Tìm thấy {totalResults} kết quả cho &quot;{query}&quot;
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-md">
          <TabsTrigger value="all">Tất cả ({totalResults})</TabsTrigger>
          <TabsTrigger value="vocab">Từ vựng ({vocabularies.length})</TabsTrigger>
          <TabsTrigger value="kanji">Kanji ({kanjis.length})</TabsTrigger>
          <TabsTrigger value="grammar">Ngữ pháp ({grammars.length})</TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all" className="space-y-6 mt-4">
          {vocabularies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                Từ vựng ({vocabularies.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vocabularies.map((v) => (
                  <VocabResultCard key={v.id} vocab={v} />
                ))}
              </div>
            </div>
          )}

          {kanjis.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-primary" />
                Kanji ({kanjis.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {kanjis.map((k) => (
                  <KanjiResultCard key={k.id} kanji={k} />
                ))}
              </div>
            </div>
          )}

          {grammars.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" />
                Ngữ pháp ({grammars.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grammars.map((g) => (
                  <GrammarResultCard key={g.id} grammar={g} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Vocab Tab */}
        <TabsContent value="vocab" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vocabularies.map((v) => (
              <VocabResultCard key={v.id} vocab={v} />
            ))}
          </div>
        </TabsContent>

        {/* Kanji Tab */}
        <TabsContent value="kanji" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {kanjis.map((k) => (
              <KanjiResultCard key={k.id} kanji={k} />
            ))}
          </div>
        </TabsContent>

        {/* Grammar Tab */}
        <TabsContent value="grammar" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {grammars.map((g) => (
              <GrammarResultCard key={g.id} grammar={g} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VocabResultCard({ vocab }: { vocab: Vocabulary }) {
  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-3.5 flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-japanese">{vocab.word}</span>
            {vocab.furigana && (
              <span className="text-xs text-muted-foreground font-japanese">
                【{vocab.furigana}】
              </span>
            )}
            <JLPTBadge level={vocab.jlpt_level} />
          </div>
          <p className="text-sm line-clamp-1">{vocab.meaning}</p>
        </div>
        <AudioButton text={vocab.word} />
      </CardContent>
    </Card>
  );
}

function KanjiResultCard({ kanji }: { kanji: Kanji }) {
  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-3.5 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold font-japanese">{kanji.character}</span>
          <div className="space-y-0.5">
            <span className="text-sm font-bold uppercase text-primary">
              {kanji.han_viet || '—'}
            </span>
            <p className="text-xs text-muted-foreground line-clamp-1">{kanji.meaning}</p>
          </div>
        </div>
        <JLPTBadge level={kanji.jlpt_level} />
      </CardContent>
    </Card>
  );
}

function GrammarResultCard({ grammar }: { grammar: Grammar }) {
  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-3.5 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base font-bold font-japanese text-primary">
            {grammar.title}
          </span>
          <JLPTBadge level={grammar.jlpt_level} />
        </div>
        {grammar.structure && (
          <p className="text-xs font-mono text-muted-foreground">{grammar.structure}</p>
        )}
        <p className="text-sm line-clamp-2">{grammar.explanation}</p>
      </CardContent>
    </Card>
  );
}
