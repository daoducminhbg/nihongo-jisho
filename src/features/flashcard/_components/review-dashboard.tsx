'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, BookOpen, Layers, Clock, Award } from 'lucide-react';
import type { QueueSummary } from '../_types/flashcard.types';

interface ReviewDashboardProps {
  stats: QueueSummary;
}

export function ReviewDashboard({ stats }: ReviewDashboardProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Call to Action */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Thuật toán FSRS Spaced Repetition
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
              {stats.dueCount > 0
                ? `Bạn có ${stats.dueCount} thẻ cần ôn hôm nay!`
                : 'Tuyệt vời! Bạn đã hoàn thành hết thẻ ôn tập hôm nay.'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              Ôn tập đều đặn đúng thời điểm giúp củng cố độ bền trí nhớ (Memory Stability) và tối ưu hóa thời gian học từ N5 lên N3.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {stats.dueCount > 0 ? (
              <Link href="/flashcard/study?mode=due_only">
                <Button size="lg" className="font-bold shadow-md gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Ôn tập ngay ({stats.dueCount})
                </Button>
              </Link>
            ) : (
              <Link href="/flashcard/study?mode=new_only">
                <Button size="lg" className="font-bold shadow-md gap-2">
                  <BookOpen className="w-5 h-5" />
                  Học thẻ mới ({stats.newCount})
                </Button>
              </Link>
            )}
            <Link href="/flashcard">
              <Button size="lg" variant="outline">
                Tùy chỉnh bộ thẻ
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Đến hạn hôm nay</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {stats.dueCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Cần ôn tập ngay</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Thẻ mới</span>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {stats.newCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Chưa từng học</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Đang học hôm nay</span>
              <RotateCcw className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400">
              {stats.learningCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Bước học 1m - 10m</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Đã tốt nghiệp</span>
              <Award className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-green-600 dark:text-green-400">
              {stats.graduatedCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Lên lịch ngày mai+</p>
          </CardContent>
        </Card>

        <Card className="border-muted bg-card col-span-2 md:col-span-1">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Tổng số thẻ</span>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.totalCards}
            </p>
            <p className="text-[11px] text-muted-foreground">Từ vựng, Kanji, Ngữ pháp</p>
          </CardContent>
        </Card>
      </div>

      {/* Algorithm Explainer Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cách hoạt động của hệ thống lặp lại ngắt quãng (FSRS)</CardTitle>
          <CardDescription>
            Khác với thuật toán SM-2 cũ của Anki năm 1987, FSRS là chuẩn hiện đại nhất 2025–2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <h4 className="font-semibold text-foreground">4 Nút đánh giá:</h4>
              <ul className="space-y-1">
                <li><strong className="text-destructive">1. Học lại (Again):</strong> Quên thẻ ➔ hệ thống sẽ lặp lại ngay trong phiên.</li>
                <li><strong className="text-amber-500">2. Khó (Hard):</strong> Nhớ nhưng mất nhiều thời gian ➔ giãn cách ngắn.</li>
                <li><strong className="text-green-600 dark:text-green-400">3. Tốt (Good):</strong> Nhớ chuẩn xác ➔ giãn khoảng cách tối ưu.</li>
                <li><strong className="text-blue-600 dark:text-blue-400">4. Dễ (Easy):</strong> Quá dễ ➔ kéo dài khoảng cách ôn tập rất xa.</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <h4 className="font-semibold text-foreground">Phím tắt thao tác nhanh:</h4>
              <ul className="space-y-1">
                <li>Phím <kbd className="px-1 py-0.5 bg-muted rounded border">Space</kbd> hoặc <kbd className="px-1 py-0.5 bg-muted rounded border">Enter</kbd>: Lật thẻ xem đáp án.</li>
                <li>Phím <kbd className="px-1 py-0.5 bg-muted rounded border">1</kbd>, <kbd className="px-1 py-0.5 bg-muted rounded border">2</kbd>, <kbd className="px-1 py-0.5 bg-muted rounded border">3</kbd>, <kbd className="px-1 py-0.5 bg-muted rounded border">4</kbd>: Đánh giá tương ứng với Again, Hard, Good, Easy.</li>
                <li>Hỗ trợ phát âm tiếng Nhật tự động và xem thứ tự nét viết Kanji ngay trên thẻ!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
