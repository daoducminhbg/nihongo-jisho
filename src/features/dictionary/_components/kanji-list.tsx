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
import { KanjiCard } from '@/features/dictionary/_components/kanji-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Search, Languages } from 'lucide-react';
import type { Kanji } from '@/types/database.types';

interface KanjiListProps {
  initialKanjis: Kanji[];
}

export function KanjiList({ initialKanjis }: KanjiListProps) {
  const [kanjis, setKanjis] = useState<Kanji[]>(initialKanjis);
  const [search, setSearch] = useState('');
  const [selectedJlpt, setSelectedJlpt] = useState('ALL');

  const filteredKanjis = useMemo(() => {
    return kanjis.filter((k) => {
      const matchJlpt = selectedJlpt === 'ALL' || k.jlpt_level === selectedJlpt;
      if (!matchJlpt) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase().trim();
      return (
        k.character.toLowerCase().includes(term) ||
        (k.han_viet && k.han_viet.toLowerCase().includes(term)) ||
        k.meaning.toLowerCase().includes(term) ||
        (k.onyomi && k.onyomi.toLowerCase().includes(term)) ||
        (k.kunyomi && k.kunyomi.toLowerCase().includes(term))
      );
    });
  }, [kanjis, search, selectedJlpt]);

  const handleDelete = (id: string) => {
    setKanjis((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm chữ Hán, âm Hán-Việt, On, Kun, nghĩa..."
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
          Đang hiển thị {filteredKanjis.length} / {kanjis.length} chữ Hán
        </div>
      </div>

      {/* Grid view */}
      {filteredKanjis.length === 0 ? (
        <EmptyState
          icon={Languages}
          title={search ? 'Không tìm thấy Kanji phù hợp' : 'Chưa có Kanji nào'}
          description={
            search
              ? 'Thử thay đổi từ khóa hoặc cấp độ JLPT'
              : 'Hãy sử dụng AI Scanner để phân tích các câu tiếng Nhật có chứa Kanji và lưu lại.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredKanjis.map((kanji) => (
            <KanjiCard key={kanji.id} kanji={kanji} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
