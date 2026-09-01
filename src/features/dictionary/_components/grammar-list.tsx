'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GrammarCard } from '@/features/dictionary/_components/grammar-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Search, GraduationCap } from 'lucide-react';
import type { Grammar } from '@/types/database.types';

interface GrammarListProps {
  initialGrammars: Grammar[];
}

export function GrammarList({ initialGrammars }: GrammarListProps) {
  const [grammars, setGrammars] = useState<Grammar[]>(initialGrammars);
  const [search, setSearch] = useState('');
  const [selectedJlpt, setSelectedJlpt] = useState('ALL');

  const filteredGrammars = useMemo(() => {
    return grammars.filter((g) => {
      const matchJlpt = selectedJlpt === 'ALL' || g.jlpt_level === selectedJlpt;
      if (!matchJlpt) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase().trim();
      return (
        g.title.toLowerCase().includes(term) ||
        (g.structure && g.structure.toLowerCase().includes(term)) ||
        g.explanation.toLowerCase().includes(term) ||
        (g.nuance && g.nuance.toLowerCase().includes(term))
      );
    });
  }, [grammars, search, selectedJlpt]);

  const handleDelete = (id: string) => {
    setGrammars((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm mẫu ngữ pháp, cấu trúc, giải thích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={selectedJlpt} onValueChange={(val) => setSelectedJlpt(val || 'ALL')}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue placeholder="JLPT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="N5">N5</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">
          Đang hiển thị {filteredGrammars.length} / {grammars.length} điểm ngữ pháp
        </div>
      </div>

      {/* Grid view */}
      {filteredGrammars.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={search ? 'Không tìm thấy ngữ pháp phù hợp' : 'Chưa có mẫu ngữ pháp nào'}
          description={
            search
              ? 'Thử thay đổi từ khóa hoặc bộ lọc cấp độ JLPT'
              : 'Hãy dùng AI Scanner để phân tích các câu anime/game có ngữ pháp mới.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGrammars.map((grammar) => (
            <GrammarCard key={grammar.id} grammar={grammar} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
