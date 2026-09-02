'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import type { ScannedVocab, ScannedKanji, ScannedGrammar } from '../_types/scan.types';

type ItemType = 'vocab' | 'kanji' | 'grammar';

interface ScanResultItemProps {
  item: ScannedVocab | ScannedKanji | ScannedGrammar;
  type: ItemType;
  checked: boolean;
  onToggle: () => void;
}

export function ScanResultItem({ item, type, checked, onToggle }: ScanResultItemProps) {
  return (
    <Card size="sm" className="transition-colors data-[selected=true]:ring-2 data-[selected=true]:ring-primary/30" data-selected={checked}>
      <CardContent className="flex items-start gap-3">
        <Checkbox
          checked={checked}
          onCheckedChange={onToggle}
          className="mt-0.5 shrink-0"
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.isNew ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                Mới
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                {type === 'vocab'
                  ? `Đã học - Lần thứ ${((item as ScannedVocab).existingFrequency || 1) + 1}`
                  : 'Đã học'}
              </Badge>
            )}
            <JLPTBadge level={item.jlpt_level} />
          </div>

          {type === 'vocab' && <VocabDetails item={item as ScannedVocab} />}
          {type === 'kanji' && <KanjiDetails item={item as ScannedKanji} />}
          {type === 'grammar' && <GrammarDetails item={item as ScannedGrammar} />}
        </div>
      </CardContent>
    </Card>
  );
}

function VocabDetails({ item }: { item: ScannedVocab }) {
  const isConjugated = item.conjugated_form && item.conjugated_form !== item.word;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-bold text-foreground">{item.word}</span>
        {item.furigana && (
          <span className="text-sm font-medium text-muted-foreground">【{item.furigana}】</span>
        )}
        {isConjugated && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
            Trong câu: <span className="font-semibold">{item.conjugated_form}</span>
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-foreground/90">{item.meaning}</p>
      {item.word_type && (
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
          {item.word_type}
        </p>
      )}
    </div>
  );
}

function KanjiDetails({ item }: { item: ScannedKanji }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-bold font-japanese">{item.character}</span>
        <span className="text-sm font-bold text-primary tracking-wide">{item.han_viet}</span>
      </div>
      <p className="text-sm">{item.meaning}</p>
      <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        {item.onyomi && <span>音: {item.onyomi}</span>}
        {item.kunyomi && <span>訓: {item.kunyomi}</span>}
      </div>
      {item.example_words && item.example_words.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {item.example_words.slice(0, 2).map((ew, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              {ew.word}（{ew.furigana}）- {ew.meaning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function GrammarDetails({ item }: { item: ScannedGrammar }) {
  return (
    <div className="space-y-2">
      <p className="text-base font-bold text-primary">{item.title}</p>
      {item.structure && (
        <div className="inline-block px-2.5 py-1 rounded-md bg-muted text-xs font-mono font-medium text-primary border border-border/40">
          Cấu trúc: {item.structure}
        </div>
      )}
      <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line bg-muted/20 p-2.5 rounded-lg border border-border/30">
        {item.explanation}
      </div>
      {item.example_sentence && (
        <div className="rounded-lg bg-muted/40 p-2.5 text-xs space-y-1 border border-border/30">
          <p className="font-semibold text-foreground">{item.example_sentence}</p>
          {item.example_meaning && (
            <p className="text-muted-foreground">{item.example_meaning}</p>
          )}
        </div>
      )}
      {item.nuance && (
        <p className="text-xs text-amber-500/90 dark:text-amber-400/90 italic flex items-start gap-1.5">
          <span>💡</span> <span>{item.nuance}</span>
        </p>
      )}
    </div>
  );
}
