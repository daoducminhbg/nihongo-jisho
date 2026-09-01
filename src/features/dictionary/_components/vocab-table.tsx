'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { AudioButton } from './audio-button';
import { ColumnToggle, type ColumnOption } from './column-toggle';
import { EmptyState } from '@/components/shared/empty-state';
import { deleteDictionaryItem } from '../_actions/delete-item';
import { Search, Trash2, BookOpen, ChevronRight, Eye, EyeOff } from 'lucide-react';
import type { Vocabulary } from '@/types/database.types';

interface VocabTableProps {
  initialData: Vocabulary[];
  onRefresh?: () => void;
}

const DEFAULT_COLUMNS: ColumnOption[] = [
  { id: 'word', label: 'Từ vựng', visible: true },
  { id: 'furigana', label: 'Furigana', visible: true },
  { id: 'kanji', label: 'Hán tự', visible: true },
  { id: 'meaning', label: 'Nghĩa tiếng Việt', visible: true },
  { id: 'jlpt', label: 'JLPT', visible: true },
  { id: 'frequency', label: 'Tần suất', visible: true },
  { id: 'audio', label: 'Phát âm', visible: true },
  { id: 'actions', label: 'Thao tác', visible: true },
];

export function VocabTable({ initialData, onRefresh }: VocabTableProps) {
  const [data, setData] = useState<Vocabulary[]>(initialData);
  const [search, setSearch] = useState('');
  const [selectedJlpt, setSelectedJlpt] = useState<string>('ALL');
  const [columns, setColumns] = useState<ColumnOption[]>(DEFAULT_COLUMNS);
  const [selectedVocab, setSelectedVocab] = useState<Vocabulary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick visibility toggles (Hide all Furigana / Hide all Meaning for memory testing)
  const isFuriganaHidden = !columns.find((c) => c.id === 'furigana')?.visible;
  const isMeaningHidden = !columns.find((c) => c.id === 'meaning')?.visible;

  const handleToggleColumn = (id: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, visible: !col.visible } : col))
    );
  };

  const handleResetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
  };

  const isColVisible = (id: string) => {
    return columns.find((c) => c.id === id)?.visible ?? true;
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchJlpt = selectedJlpt === 'ALL' || item.jlpt_level === selectedJlpt;
      if (!matchJlpt) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase().trim();
      return (
        item.word.toLowerCase().includes(term) ||
        (item.furigana && item.furigana.toLowerCase().includes(term)) ||
        (item.kanji && item.kanji.toLowerCase().includes(term)) ||
        item.meaning.toLowerCase().includes(term)
      );
    });
  }, [data, search, selectedJlpt]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa từ này khỏi từ điển và bộ thẻ flashcard?')) return;

    setDeletingId(id);
    try {
      const res = await deleteDictionaryItem('vocab', id);
      if (res.success) {
        setData((prev) => prev.filter((item) => item.id !== id));
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || 'Không thể xóa từ vựng.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tra từ, furigana, kanji, nghĩa..."
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

        <div className="flex items-center gap-2">
          {/* Quick Memory Test buttons */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 text-xs"
            onClick={() => handleToggleColumn('furigana')}
          >
            {isFuriganaHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{isFuriganaHidden ? 'Hiện cách đọc' : 'Ẩn cách đọc'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 text-xs"
            onClick={() => handleToggleColumn('meaning')}
          >
            {isMeaningHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{isMeaningHidden ? 'Hiện nghĩa' : 'Ẩn nghĩa'}</span>
          </Button>

          <ColumnToggle
            columns={columns}
            onToggle={handleToggleColumn}
            onReset={handleResetColumns}
          />
        </div>
      </div>

      {/* Table Content */}
      {filteredData.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search ? 'Không tìm thấy từ nào' : 'Chưa có từ vựng nào'}
          description={
            search
              ? 'Thử thay đổi từ khóa hoặc bộ lọc cấp độ JLPT'
              : 'Hãy sử dụng tính năng AI Scanner để phân tích ảnh anime/game và thêm từ vựng mới.'
          }
        />
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {isColVisible('word') && <TableHead className="w-36 font-semibold">Từ vựng</TableHead>}
                {isColVisible('furigana') && <TableHead className="w-32 font-semibold">Furigana</TableHead>}
                {isColVisible('kanji') && <TableHead className="w-28 font-semibold">Hán tự</TableHead>}
                {isColVisible('meaning') && <TableHead className="min-w-48 font-semibold">Nghĩa tiếng Việt</TableHead>}
                {isColVisible('jlpt') && <TableHead className="w-20 text-center font-semibold">JLPT</TableHead>}
                {isColVisible('frequency') && <TableHead className="w-20 text-center font-semibold">Lần gặp</TableHead>}
                {isColVisible('audio') && <TableHead className="w-16 text-center font-semibold">Audio</TableHead>}
                {isColVisible('actions') && <TableHead className="w-16 text-right font-semibold"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedVocab(item)}
                >
                  {isColVisible('word') && (
                    <TableCell className="font-bold text-base font-japanese">
                      {item.word}
                    </TableCell>
                  )}
                  {isColVisible('furigana') && (
                    <TableCell className="text-sm text-muted-foreground font-japanese">
                      {item.furigana || '—'}
                    </TableCell>
                  )}
                  {isColVisible('kanji') && (
                    <TableCell className="text-sm font-japanese">
                      {item.kanji || '—'}
                    </TableCell>
                  )}
                  {isColVisible('meaning') && (
                    <TableCell className="text-sm">
                      {item.meaning}
                    </TableCell>
                  )}
                  {isColVisible('jlpt') && (
                    <TableCell className="text-center">
                      <JLPTBadge level={item.jlpt_level} />
                    </TableCell>
                  )}
                  {isColVisible('frequency') && (
                    <TableCell className="text-center text-xs font-mono text-muted-foreground">
                      {item.frequency || 1}
                    </TableCell>
                  )}
                  {isColVisible('audio') && (
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <AudioButton text={item.word} />
                    </TableCell>
                  )}
                  {isColVisible('actions') && (
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        disabled={deletingId === item.id}
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Xóa từ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Vocab Details Modal (Context Sentences & Metadata) */}
      {selectedVocab && (
        <Dialog open={!!selectedVocab} onOpenChange={(open) => !open && setSelectedVocab(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-baseline gap-3">
                <DialogTitle className="text-2xl font-bold font-japanese">
                  {selectedVocab.word}
                </DialogTitle>
                {selectedVocab.furigana && (
                  <span className="text-base text-muted-foreground font-japanese">
                    【{selectedVocab.furigana}】
                  </span>
                )}
                <JLPTBadge level={selectedVocab.jlpt_level} />
                <AudioButton text={selectedVocab.word} />
              </div>
              <DialogDescription className="text-base text-foreground font-medium pt-1">
                {selectedVocab.meaning}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {selectedVocab.word_type && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Từ loại:</span>{' '}
                  {selectedVocab.word_type}
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Câu ngữ cảnh trích xuất từ Anime/Game ({selectedVocab.context_sentences?.length || 0})
                </h4>

                {!selectedVocab.context_sentences || selectedVocab.context_sentences.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Chưa có câu ngữ cảnh nào được lưu cùng từ này.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedVocab.context_sentences.map((ctx, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-md bg-muted/50 border text-xs space-y-1"
                      >
                        <p className="font-medium font-japanese text-sm">{ctx.sentence}</p>
                        <p className="text-muted-foreground">{ctx.meaning}</p>
                        {ctx.source && (
                          <p className="text-[10px] text-muted-foreground/70 italic text-right">
                            Nguồn: {ctx.source}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
