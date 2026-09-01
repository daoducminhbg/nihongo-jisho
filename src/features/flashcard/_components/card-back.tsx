'use client';

import { Card, CardContent } from '@/components/ui/card';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { AudioButton } from '@/features/dictionary/_components/audio-button';
import { Separator } from '@/components/ui/separator';
import { BookOpen } from 'lucide-react';
import type { FlashcardItem, CardDirection } from '../_types/flashcard.types';

interface CardBackProps {
  item: FlashcardItem;
  direction: CardDirection;
}

export function CardBack({ item, direction }: CardBackProps) {
  return (
    <Card className="w-full min-h-[300px] flex flex-col justify-between p-6 shadow-md border-2 border-primary/40 bg-card">
      <CardContent className="p-0 space-y-4 flex-1">
        {/* Item Type & JLPT */}
        <div className="flex items-center justify-between">
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

        {/* Vocab Back */}
        {item.itemType === 'vocab' && item.vocab && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl font-bold font-japanese">{item.vocab.word}</h2>
                {item.vocab.furigana && (
                  <span className="text-lg text-muted-foreground font-japanese">
                    【{item.vocab.furigana}】
                  </span>
                )}
              </div>
              <AudioButton text={item.vocab.word} size="default" />
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-lg font-bold text-primary">{item.vocab.meaning}</p>
              {item.vocab.word_type && (
                <p className="text-xs text-muted-foreground italic">{item.vocab.word_type}</p>
              )}
            </div>

            {item.vocab.context_sentences && item.vocab.context_sentences.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-muted/40 text-xs space-y-1">
                <p className="font-semibold text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Câu ngữ cảnh:
                </p>
                <p className="font-japanese font-medium text-sm">
                  {item.vocab.context_sentences[0].sentence}
                </p>
                <p className="text-muted-foreground">
                  {item.vocab.context_sentences[0].meaning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Kanji Back */}
        {item.itemType === 'kanji' && item.kanji && (
          <div className="space-y-3">
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold font-japanese">{item.kanji.character}</span>
              <div>
                <h2 className="text-2xl font-bold uppercase text-primary">
                  {item.kanji.han_viet}
                </h2>
                <p className="text-base text-foreground font-medium">{item.kanji.meaning}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-3 rounded-lg">
              <div>
                <span className="text-muted-foreground font-medium">Âm On (Katakana):</span>
                <p className="font-bold font-japanese text-sm mt-0.5">{item.kanji.onyomi || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Âm Kun (Hiragana):</span>
                <p className="font-bold font-japanese text-sm mt-0.5">{item.kanji.kunyomi || '—'}</p>
              </div>
            </div>

            {item.kanji.example_words && item.kanji.example_words.length > 0 && (
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold text-muted-foreground">Từ ghép mẫu:</p>
                <div className="space-y-1 text-xs">
                  {item.kanji.example_words.slice(0, 2).map((ew, i) => (
                    <div key={i} className="flex items-center justify-between text-muted-foreground">
                      <span className="font-japanese font-medium text-foreground">
                        {ew.word} ({ew.furigana})
                      </span>
                      <span>{ew.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grammar Back */}
        {item.itemType === 'grammar' && item.grammar && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-japanese text-primary">
                {item.grammar.title}
              </h2>
              {item.grammar.structure && (
                <p className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded inline-block">
                  {item.grammar.structure}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{item.grammar.explanation}</p>
              {item.grammar.nuance && (
                <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                  🎯 {item.grammar.nuance}
                </p>
              )}
            </div>

            {item.grammar.examples && item.grammar.examples.length > 0 && (
              <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <p className="font-japanese font-medium text-sm text-foreground">
                    {item.grammar.examples[0].sentence}
                  </p>
                  <AudioButton text={item.grammar.examples[0].sentence} size="icon" className="h-6 w-6" />
                </div>
                {item.grammar.examples[0].meaning && (
                  <p className="text-muted-foreground">{item.grammar.examples[0].meaning}</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
