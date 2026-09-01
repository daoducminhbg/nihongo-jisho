'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers, Play, Sparkles, ArrowLeftRight } from 'lucide-react';
import type { CardDirection } from '../_types/flashcard.types';
import type { ItemType, JLPTLevel } from '@/lib/constants';

interface DeckConfigFormProps {
  initialCounts?: { due: number; newCount: number; total: number };
}

export function DeckConfigForm({ initialCounts }: DeckConfigFormProps) {
  const router = useRouter();

  const [itemTypes, setItemTypes] = useState<ItemType[]>(['vocab', 'kanji', 'grammar']);
  const [jlptLevels, setJlptLevels] = useState<JLPTLevel[]>(['N5', 'N4', 'N3']);
  const [direction, setDirection] = useState<CardDirection>('JP_TO_VN');
  const [mode, setMode] = useState<'due_only' | 'all' | 'new_only'>('due_only');
  const [limit, setLimit] = useState(20);

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
      limit: limit.toString(),
    });

    router.push(`/flashcard/study?${params.toString()}`);
  };

  return (
    <Card className="max-w-xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Cấu hình phiên học Flashcard
        </CardTitle>
        <CardDescription>
          Tùy chỉnh nội dung, chiều lật thẻ và thuật toán FSRS cho phiên ôn tập của bạn
        </CardDescription>
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

        {/* 4. Study Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">4. Chế độ học:</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: 'due_only',
                title: 'Đến hạn',
                desc: initialCounts ? `${initialCounts.due} thẻ` : 'Ôn tập',
              },
              {
                value: 'new_only',
                title: 'Thẻ mới',
                desc: initialCounts ? `${initialCounts.newCount} thẻ` : 'Học mới',
              },
              {
                value: 'all',
                title: 'Trộn tất cả',
                desc: 'Tối đa thẻ',
              },
            ].map((m) => (
              <label
                key={m.value}
                className={`p-2.5 rounded-lg border cursor-pointer text-center space-y-0.5 transition-all ${
                  mode === m.value
                    ? 'border-primary bg-primary/5 font-semibold text-primary'
                    : 'hover:bg-muted/40 text-muted-foreground'
                }`}
                onClick={() => setMode(m.value as any)}
              >
                <p className="text-xs font-bold">{m.title}</p>
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* 5. Limit */}
        <div className="flex items-center justify-between pt-2 border-t text-sm">
          <span className="text-muted-foreground font-medium">Số thẻ phiên này:</span>
          <div className="flex items-center gap-1.5">
            {[10, 20, 30, 50].map((num) => (
              <Button
                key={num}
                type="button"
                variant={limit === num ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setLimit(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <Button size="lg" className="w-full text-base font-bold shadow-md" onClick={handleStart}>
          <Play className="w-5 h-5 mr-2" />
          Bắt đầu học ngay
        </Button>
      </CardContent>
    </Card>
  );
}
