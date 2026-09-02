'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { KanjiStrokeViewer } from './kanji-stroke-viewer';
import { AudioButton } from './audio-button';
import { deleteDictionaryItem } from '../_actions/delete-item';
import { PenTool, Trash2, BookOpen } from 'lucide-react';
import type { Kanji } from '@/types/database.types';

interface KanjiCardProps {
  kanji: Kanji;
  onDelete?: (id: string) => void;
}

export function KanjiCard({ kanji, onDelete }: KanjiCardProps) {
  const [isStrokeOpen, setIsStrokeOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc muốn xóa chữ Kanji "${kanji.character}" (${kanji.han_viet})?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteDictionaryItem('kanji', kanji.id);
      if (res.success && onDelete) {
        onDelete(kanji.id);
      } else if (!res.success) {
        alert(res.error || 'Lỗi khi xóa Kanji.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40 cursor-pointer"
        onClick={() => setIsStrokeOpen(true)}
      >
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          {/* Top row: JLPT & Actions */}
          <div className="flex items-center justify-between">
            <JLPTBadge level={kanji.jlpt_level} />
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                title="Xóa Kanji"
                aria-label="Xóa Kanji"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Main Kanji Character & Hán-Việt */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold font-japanese leading-none text-foreground">
              {kanji.character}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                {kanji.han_viet || '—'}
              </span>
              <span className="text-sm text-foreground font-medium line-clamp-1">
                {kanji.meaning}
              </span>
            </div>
          </div>

          {/* Readings */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2 rounded">
            <div>
              <span className="text-muted-foreground font-medium">Âm On: </span>
              <span className="font-japanese font-medium">{kanji.onyomi || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Âm Kun: </span>
              <span className="font-japanese font-medium">{kanji.kunyomi || '—'}</span>
            </div>
          </div>

          {/* Bottom trigger for stroke order */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span className="flex items-center gap-1 text-primary">
              <PenTool className="w-3.5 h-3.5" />
              Xem nét viết
            </span>
            {kanji.example_words && kanji.example_words.length > 0 && (
              <span>{kanji.example_words.length} từ mẫu</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Kanji Stroke Order & Compound Words */}
      <Dialog open={isStrokeOpen} onOpenChange={setIsStrokeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-baseline justify-between pr-6">
              <div className="flex items-baseline gap-2">
                <DialogTitle className="text-3xl font-bold font-japanese">
                  {kanji.character}
                </DialogTitle>
                <span className="text-base font-bold uppercase text-primary">
                  {kanji.han_viet}
                </span>
                <JLPTBadge level={kanji.jlpt_level} />
              </div>
            </div>
            <DialogDescription className="text-sm text-foreground font-medium">
              {kanji.meaning}
            </DialogDescription>
          </DialogHeader>

          {/* Stroke order SVG viewer */}
          <div className="flex justify-center py-2">
            <KanjiStrokeViewer character={kanji.character} size={180} />
          </div>

          {/* Readings detail */}
          <div className="space-y-2 text-sm bg-muted/40 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Âm On (Katakana):</span>
              <span className="font-bold font-japanese">{kanji.onyomi || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Âm Kun (Hiragana):</span>
              <span className="font-bold font-japanese">{kanji.kunyomi || '—'}</span>
            </div>
          </div>

          {/* Example compound words */}
          {kanji.example_words && kanji.example_words.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Từ vựng mẫu thường gặp
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {kanji.example_words.map((ew, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-card border text-xs"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold font-japanese text-sm">{ew.word}</span>
                      <span className="text-muted-foreground font-japanese">({ew.furigana})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{ew.meaning}</span>
                      <AudioButton text={ew.word} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
