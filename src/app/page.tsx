import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, ScanLine, Layers } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/scan');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
          <span className="text-4xl">🐟</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Nihongo <span className="text-primary">Jisho</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Học tiếng Nhật thông minh từ Anime, Game & Manga
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <ScanLine className="h-4 w-4 text-primary" />
            <span>AI phân tích ảnh</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Từ điển cá nhân</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Layers className="h-4 w-4 text-primary" />
            <span>Flashcard FSRS</span>
          </div>
        </div>
        <div className="pt-6">
          <Link href="/login">
            <Button size="lg" className="text-base px-8 h-12 rounded-xl shadow-md">
              Bắt đầu học ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
