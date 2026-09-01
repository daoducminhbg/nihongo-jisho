'use client';

import { Card, CardContent } from '@/components/ui/card';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { AudioButton } from '@/features/dictionary/_components/audio-button';
import type { FlashcardItem, CardDirection } from '../_types/flashcard.types';

interface CardFrontProps {
  item: FlashcardItem;
  direction: CardDirection;
}

export function CardFront({ item, direction }: CardFrontProps) {
  const isJpToVn = direction === 'JP_TO_VN';

  return (
    <Card className="w-full min-h-[300px] flex flex-col justify-between p-6 shadow-md border-2 border-primary/20 bg-card">
      <CardContent className="p-0 flex flex-col items-center justify-center flex-1 text-center space-y-4">
        {/* Item Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2 py-0.5 rounded bg-muted">
            {item.itemType === 'vocab' && 'Từ vựng'}
            {item.itemType === 'kanji' && 'Hán tự'}
            {item.itemType === 'grammar' && 'Ngữ pháp'}
          </span>
          <JLPTBadge
            level={
              item.vocab?.jlpt_level ||
              item.kanji?.jlpt_level ||
              item.grammar?.jlpt_level ||
              null
            }
          />
        </div>

        {/* Vocab Front */}
        {item.itemType === 'vocab' && item.vocab && (
          <div className="space-y-3">
            {isJpToVn ? (
              <>
                <h2 className="text-4xl md:text-5xl font-bold font-japanese tracking-wide">
                  {item.vocab.word}
                </h2>
                <AudioButton text={item.vocab.word} size="default" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Nghĩa tiếng Việt:</p>
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  {item.vocab.meaning}
                </h2>
                {item.vocab.word_type && (
                  <span className="text-xs text-muted-foreground block">
                    ({item.vocab.word_type})
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Kanji Front */}
        {item.itemType === 'kanji' && item.kanji && (
          <div className="space-y-3">
            {isJpToVn ? (
              <h2 className="text-6xl md:text-7xl font-bold font-japanese">
                {item.kanji.character}
              </h2>
            ) : (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Âm Hán-Việt & Nghĩa:</span>
                <h2 className="text-3xl md:text-4xl font-bold text-primary uppercase">
                  {item.kanji.han_viet}
                </h2>
                <p className="text-lg text-foreground">{item.kanji.meaning}</p>
              </div>
            )}
          </div>
        )}

        {/* Grammar Front */}
        {item.itemType === 'grammar' && item.grammar && (
          <div className="space-y-3 max-w-md">
            {isJpToVn ? (
              <>
                <h2 className="text-2xl md:text-3xl font-bold font-japanese text-primary">
                  {item.grammar.title}
                </h2>
                {item.grammar.structure && (
                  <p className="text-xs font-mono bg-muted p-1 rounded inline-block text-muted-foreground">
                    {item.grammar.structure}
                  </p>
                )}
                {item.grammar.examples && item.grammar.examples.length > 0 && (
                  <div className="p-3 bg-muted/40 rounded-lg text-sm font-japanese text-left mt-2">
                    <p className="font-medium">{item.grammar.examples[0].sentence}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Ý nghĩa ngữ pháp:</p>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {item.grammar.explanation}
                </h2>
                {item.grammar.examples && item.grammar.examples.length > 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Ví dụ: &quot;{item.grammar.examples[0].meaning}&quot;
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>

      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        Bấm vào thẻ hoặc phím <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px]">Space</kbd> để lật thẻ
      </div>
    </Card>
  );
}
