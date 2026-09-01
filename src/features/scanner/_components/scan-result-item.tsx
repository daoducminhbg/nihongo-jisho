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
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-lg font-bold">{item.word}</span>
        {item.furigana && (
          <span className="text-sm text-muted-foreground">【{item.furigana}】</span>
        )}
        {item.conjugated_form && (
          <span className="text-xs text-muted-foreground">
            → {item.conjugated_form}
          </span>
        )}
      </div>
      <p className="text-sm">{item.meaning}</p>
      {item.word_type && (
        <p className="text-xs text-muted-foreground">{item.word_type}</p>
      )}
    </div>
  );
}

function KanjiDetails({ item }: { item: ScannedKanji }) {
  return (
    <div className="space-y-0.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-bold">{item.character}</span>
        <span className="text-sm font-medium text-primary">{item.han_viet}</span>
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
    <div className="space-y-0.5">
      <p className="text-base font-bold">{item.title}</p>
      {item.structure && (
        <p className="text-sm font-mono text-primary">{item.structure}</p>
      )}
      <p className="text-sm">{item.explanation}</p>
      {item.example_sentence && (
        <div className="mt-1 rounded bg-muted/50 p-2 text-xs">
          <p className="font-medium">{item.example_sentence}</p>
          {item.example_meaning && (
            <p className="text-muted-foreground">{item.example_meaning}</p>
          )}
        </div>
      )}
      {item.nuance && (
        <p className="text-xs text-muted-foreground italic">🎯 {item.nuance}</p>
      )}
    </div>
  );
}
