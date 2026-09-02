'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { AudioButton } from './audio-button';
import { deleteDictionaryItem } from '../_actions/delete-item';
import { Trash2, Sparkles, BookOpen } from 'lucide-react';
import type { Grammar } from '@/types/database.types';

interface GrammarCardProps {
  grammar: Grammar;
  onDelete?: (id: string) => void;
}

export function GrammarCard({ grammar, onDelete }: GrammarCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa mẫu ngữ pháp "${grammar.title}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteDictionaryItem('grammar', grammar.id);
      if (res.success && onDelete) {
        onDelete(grammar.id);
      } else if (!res.success) {
        alert(res.error || 'Lỗi khi xóa ngữ pháp.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/40">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-japanese text-primary">
              {grammar.title}
            </h3>
            <JLPTBadge level={grammar.jlpt_level} />
          </div>
          {grammar.structure && (
            <p className="text-xs font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded inline-block">
              {grammar.structure}
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={isDeleting}
          onClick={handleDelete}
          title="Xóa ngữ pháp"
          aria-label="Xóa ngữ pháp"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 pt-1 space-y-3">
        {/* Explanation */}
        <p className="text-sm leading-relaxed text-foreground">
          {grammar.explanation}
        </p>

        {/* Nuance badge if available */}
        {grammar.nuance && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Sắc thái: {grammar.nuance}</span>
          </div>
        )}

        {/* Examples */}
        {grammar.examples && grammar.examples.length > 0 && (
          <div className="space-y-2 pt-1 border-t">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Câu ví dụ thực tế:
            </h4>
            <div className="space-y-1.5">
              {grammar.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-md bg-muted/40 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-japanese font-medium text-sm text-foreground">
                      {ex.sentence}
                    </p>
                    <AudioButton text={ex.sentence} size="icon" className="h-6 w-6 shrink-0" />
                  </div>
                  {ex.meaning && (
                    <p className="text-muted-foreground">{ex.meaning}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
