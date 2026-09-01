'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScanResultItem } from './scan-result-item';
import { saveScannedItems } from '../_actions/save-items';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Check, Bookmark, RotateCcw, AlertCircle } from 'lucide-react';
import type { ScanResult, ScannedVocab, ScannedKanji, ScannedGrammar } from '../_types/scan.types';

interface ScanResultsProps {
  initialResult: ScanResult;
  onReset: () => void;
  onSaved?: () => void;
}

export function ScanResults({ initialResult, onReset, onSaved }: ScanResultsProps) {
  const [vocabularies, setVocabularies] = useState<ScannedVocab[]>(initialResult.vocabularies);
  const [kanjis, setKanjis] = useState<ScannedKanji[]>(initialResult.kanjis);
  const [grammars, setGrammars] = useState<ScannedGrammar[]>(initialResult.grammars);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedVocabCount = vocabularies.filter(v => v.selected).length;
  const selectedKanjiCount = kanjis.filter(k => k.selected).length;
  const selectedGrammarCount = grammars.filter(g => g.selected).length;
  const totalSelected = selectedVocabCount + selectedKanjiCount + selectedGrammarCount;

  const handleToggleVocab = (index: number) => {
    setVocabularies(prev =>
      prev.map((v, i) => (i === index ? { ...v, selected: !v.selected } : v))
    );
  };

  const handleToggleKanji = (index: number) => {
    setKanjis(prev =>
      prev.map((k, i) => (i === index ? { ...k, selected: !k.selected } : k))
    );
  };

  const handleToggleGrammar = (index: number) => {
    setGrammars(prev =>
      prev.map((g, i) => (i === index ? { ...g, selected: !g.selected } : g))
    );
  };

  const handleSelectAllNew = () => {
    setVocabularies(prev => prev.map(v => ({ ...v, selected: !!v.isNew })));
    setKanjis(prev => prev.map(k => ({ ...k, selected: !!k.isNew })));
    setGrammars(prev => prev.map(g => ({ ...g, selected: !!g.isNew })));
  };

  const handleSelectAll = () => {
    setVocabularies(prev => prev.map(v => ({ ...v, selected: true })));
    setKanjis(prev => prev.map(k => ({ ...k, selected: true })));
    setGrammars(prev => prev.map(g => ({ ...g, selected: true })));
  };

  const handleDeselectAll = () => {
    setVocabularies(prev => prev.map(v => ({ ...v, selected: false })));
    setKanjis(prev => prev.map(k => ({ ...k, selected: false })));
    setGrammars(prev => prev.map(g => ({ ...g, selected: false })));
  };

  const handleSave = async () => {
    if (totalSelected === 0) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await saveScannedItems({
        vocabularies,
        kanjis,
        grammars,
        contextSentence: {
          sentence: initialResult.original_text,
          meaning: initialResult.translation,
        },
      });

      if (res.success) {
        setSaveSuccess(res.message || 'Đã lưu thành công vào kho cá nhân!');
        if (onSaved) onSaved();
      } else {
        setSaveError(res.error || 'Có lỗi xảy ra khi lưu');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Context Sentence Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Nội dung nhận diện
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-lg md:text-xl font-bold font-japanese leading-relaxed">
            {initialResult.original_text}
          </p>
          <Separator />
          <p className="text-sm md:text-base text-muted-foreground">
            {initialResult.translation}
          </p>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAllNew}>
            Chọn tất cả mới
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            Chọn tất cả
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
            Bỏ chọn
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Quét lại
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={totalSelected === 0 || isSaving}
            className="bg-primary text-primary-foreground font-medium"
          >
            {isSaving ? (
              <LoadingSpinner className="w-4 h-4 mr-1.5" />
            ) : (
              <Bookmark className="w-4 h-4 mr-1.5" />
            )}
            Lưu vào kho ({totalSelected})
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 rounded-md text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="vocab" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="vocab">
            Từ vựng ({vocabularies.length})
          </TabsTrigger>
          <TabsTrigger value="kanji">
            Kanji ({kanjis.length})
          </TabsTrigger>
          <TabsTrigger value="grammar">
            Ngữ pháp ({grammars.length})
          </TabsTrigger>
        </TabsList>

        {/* Vocab Tab */}
        <TabsContent value="vocab" className="space-y-3 mt-4">
          {vocabularies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Không tìm thấy từ vựng đặc trưng trong câu.
            </p>
          ) : (
            vocabularies.map((vocab, index) => (
              <ScanResultItem
                key={vocab.word + index}
                item={vocab}
                type="vocab"
                checked={!!vocab.selected}
                onToggle={() => handleToggleVocab(index)}
              />
            ))
          )}
        </TabsContent>

        {/* Kanji Tab */}
        <TabsContent value="kanji" className="space-y-3 mt-4">
          {kanjis.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Không có Kanji nào trong câu.
            </p>
          ) : (
            kanjis.map((kanji, index) => (
              <ScanResultItem
                key={kanji.character + index}
                item={kanji}
                type="kanji"
                checked={!!kanji.selected}
                onToggle={() => handleToggleKanji(index)}
              />
            ))
          )}
        </TabsContent>

        {/* Grammar Tab */}
        <TabsContent value="grammar" className="space-y-3 mt-4">
          {grammars.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Không nhận diện được điểm ngữ pháp trọng tâm.
            </p>
          ) : (
            grammars.map((grammar, index) => (
              <ScanResultItem
                key={grammar.title + index}
                item={grammar}
                type="grammar"
                checked={!!grammar.selected}
                onToggle={() => handleToggleGrammar(index)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
