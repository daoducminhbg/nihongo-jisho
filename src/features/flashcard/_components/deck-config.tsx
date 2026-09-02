'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Layers, Play, ArrowLeftRight, Sparkles, Clock, BookOpen, Sliders } from 'lucide-react';
import type { CardDirection } from '../_types/flashcard.types';
import type { ItemType, JLPTLevel } from '@/lib/constants';

interface DeckConfigFormProps {
  initialCounts?: { due: number; newCount: number; learning?: number; total: number };
}

export function DeckConfigForm({ initialCounts }: DeckConfigFormProps) {
  const router = useRouter();

  const [itemTypes, setItemTypes] = useState<ItemType[]>(['vocab', 'kanji', 'grammar']);
  const [jlptLevels, setJlptLevels] = useState<JLPTLevel[]>(['N5', 'N4', 'N3', 'N2', 'N1']);
  const [direction, setDirection] = useState<CardDirection>('JP_TO_VN');
  const [mode, setMode] = useState<'all' | 'due_only' | 'new_only'>('all');
  const [newLimit, setNewLimit] = useState<number | 'all'>(20);
  const [reviewLimit, setReviewLimit] = useState<number | 'all'>('all');

  const toggleItemType = (type: ItemType) => {
    setItemTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1
          ? prev.filter((t) => t !== type)
          : prev
        : [...prev, type]
    );
  };

  const toggleJlpt = (level: JLPTLevel) => {
    setJlptLevels((prev) =>
      prev.includes(level)
        ? prev.length > 1
          ? prev.filter((l) => l !== level)
          : prev
        : [...prev, level]
    );
  };

  const handleStart = () => {
    const params = new URLSearchParams({
      types: itemTypes.join(','),
      jlpt: jlptLevels.join(','),
      direction,
      mode,
      newLimit: newLimit.toString(),
      reviewLimit: reviewLimit.toString(),
      limit: '50',
    });

    router.push(`/flashcard/study?${params.toString()}`);
  };

  const dueCount = initialCounts?.due ?? 0;
  const newCount = initialCounts?.newCount ?? 0;
  const learningCount = initialCounts?.learning ?? 0;

  return (
    <Card className="max-w-xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Cấu hình phiên học Flashcard (Anki)
          </CardTitle>
          <Link href="/flashcard/deck-options">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary gap-1 px-2.5">
              <Sliders className="w-3.5 h-3.5" />
              Tùy chọn bộ thẻ
            </Button>
          </Link>
        </div>
        <CardDescription>
          Hệ thống Spaced Repetition kiểu Anki: Hẹn giờ 1m - 10m trong ngày, ghi nhớ dài hạn sau khi tốt nghiệp
        </CardDescription>

        {/* Anki 3-Counter Badge Row */}
        {initialCounts && (
          <div className="grid grid-cols-3 gap-2 pt-3">
            <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Mới</span>
              <span className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{newCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Đang học</span>
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-300">{learningCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Đến hạn ôn</span>
              <span className="text-xl font-extrabold text-green-700 dark:text-green-300">{dueCount}</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 1. Item Types */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">1. Loại thẻ muốn học:</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'vocab', label: 'Từ vựng' },
              { id: 'kanji', label: 'Hán tự' },
              { id: 'grammar', label: 'Ngữ pháp' },
            ].map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                  itemTypes.includes(item.id as ItemType)
                    ? 'border-primary bg-primary/5 font-semibold text-primary'
                    : 'hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <Checkbox
                  checked={itemTypes.includes(item.id as ItemType)}
                  onCheckedChange={() => toggleItemType(item.id as ItemType)}
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Direction Toggle */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-primary" />
            2. Chiều lật thẻ:
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`p-3 rounded-lg border cursor-pointer transition-all text-center space-y-1 ${
                direction === 'JP_TO_VN'
                  ? 'border-primary bg-primary/5 font-semibold'
                  : 'hover:bg-muted/40 text-muted-foreground'
              }`}
              onClick={() => setDirection('JP_TO_VN')}
            >
              <p className="text-sm font-bold">Nhật ➔ Việt</p>
              <p className="text-xs text-muted-foreground">Nhìn tiếng Nhật đoán nghĩa</p>
            </label>

            <label
              className={`p-3 rounded-lg border cursor-pointer transition-all text-center space-y-1 ${
                direction === 'VN_TO_JP'
                  ? 'border-primary bg-primary/5 font-semibold'
                  : 'hover:bg-muted/40 text-muted-foreground'
              }`}
              onClick={() => setDirection('VN_TO_JP')}
            >
              <p className="text-sm font-bold">Việt ➔ Nhật</p>
              <p className="text-xs text-muted-foreground">Gợi nhớ chủ động tiếng Nhật</p>
            </label>
          </div>
        </div>

        {/* 3. JLPT Levels */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">3. Cấp độ JLPT:</Label>
          <div className="flex flex-wrap gap-2">
            {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((level) => (
              <Button
                key={level}
                type="button"
                variant={jlptLevels.includes(level) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleJlpt(level)}
                className="h-8 px-3"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* 4. Study Mode (Anki-style) */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">4. Chế độ học (Kiểu Anki):</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: 'all',
                title: 'Ôn tập + Thẻ mới',
                desc: 'Tiêu chuẩn Anki',
                icon: Sparkles,
              },
              {
                value: 'due_only',
                title: 'Chỉ ôn thẻ cũ',
                desc: `${dueCount} thẻ đến hạn`,
                icon: Clock,
              },
              {
                value: 'new_only',
                title: 'Chỉ học thẻ mới',
                desc: `${newCount} thẻ mới`,
                icon: BookOpen,
              },
            ].map((m) => (
              <label
                key={m.value}
                className={`p-2.5 rounded-lg border cursor-pointer text-center space-y-1 transition-all ${
                  mode === m.value
                    ? 'border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary/30'
                    : 'hover:bg-muted/40 text-muted-foreground'
                }`}
                onClick={() => setMode(m.value as any)}
              >
                <p className="text-xs font-bold leading-tight">{m.title}</p>
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* 5. New Cards Limit (when mode is 'all' or 'new_only') */}
        {mode !== 'due_only' && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/25 border">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Số lượng thẻ mới phiên này:</span>
              <span className="text-muted-foreground">Còn {newCount} thẻ mới trong kho</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[5, 10, 15, 20, 30, 50].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={newLimit === num ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium"
                  onClick={() => setNewLimit(num)}
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant={newLimit === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-3 text-xs font-medium"
                onClick={() => setNewLimit('all')}
              >
                Toàn bộ ({newCount})
              </Button>
            </div>
          </div>
        )}

        {/* 6. Review Limit (when mode is 'all' or 'due_only') */}
        {mode !== 'new_only' && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/25 border">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Giới hạn thẻ ôn tập đến hạn:</span>
              <span className="text-muted-foreground">Có {dueCount} thẻ đến hạn</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[20, 50, 100].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={reviewLimit === num ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium"
                  onClick={() => setReviewLimit(num)}
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant={reviewLimit === 'all' ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-3 text-xs font-medium"
                onClick={() => setReviewLimit('all')}
              >
                Tất cả ({dueCount})
              </Button>
            </div>
          </div>
        )}

        <Button size="lg" className="w-full text-base font-bold shadow-md" onClick={handleStart}>
          <Play className="w-5 h-5 mr-2" />
          Bắt đầu học ngay
        </Button>
      </CardContent>
    </Card>
  );
}
