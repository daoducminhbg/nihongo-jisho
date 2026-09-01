import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
  ScanLine,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  BrainCircuit,
} from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/scan');
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Dynamic Aurora & Mesh Gradient Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-center pink/rose glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-rose-600/30 via-pink-600/20 to-transparent blur-[140px] rounded-full" />
        {/* Left violet glow */}
        <div className="absolute top-1/4 -left-32 w-[550px] h-[550px] bg-gradient-to-tr from-purple-700/25 via-indigo-600/20 to-transparent blur-[130px] rounded-full" />
        {/* Right cyan glow */}
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-600/20 via-blue-600/15 to-transparent blur-[130px] rounded-full" />
        {/* Bottom subtle indigo glow */}
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[400px] bg-indigo-900/20 blur-[150px] rounded-full" />

        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

        {/* Japanese Watermark Kanji in backdrop */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 font-japanese text-[14rem] md:text-[20rem] font-bold text-white/[0.02] select-none tracking-widest pointer-events-none">
          日本語
        </div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent">
                語
              </span>
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Nihongo<span className="text-rose-400 font-extrabold">Jisho</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="text-slate-300 hover:text-white hover:bg-white/10" />
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/10 text-sm font-medium"
            >
              Đăng nhập
            </Button>
          </Link>
          <Link href="/login">
            <Button className="hidden sm:inline-flex bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm px-4 h-9 rounded-lg shadow-lg shadow-rose-500/25 border border-rose-400/30 transition-all">
              Bắt đầu miễn phí
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-cyan-500/10 border border-white/15 backdrop-blur-md shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-rose-300 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              Trợ lý EdTech AI • Học tiếng Nhật N5 lên N3 qua Anime & Game
            </span>
          </div>

          {/* Main Title with Glowing Gradient */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
                Nihongo
              </span>{' '}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]">
                Jisho
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-300/90 font-medium max-w-2xl mx-auto leading-relaxed">
              Biến mọi khung hình Anime, Manga và Game thành kho tàng kiến thức với{' '}
              <span className="text-white font-semibold underline decoration-rose-400/60 underline-offset-4">
                Gemini 3.6 Flash
              </span>{' '}
              & Thuật toán ôn tập ngắt quãng{' '}
              <span className="text-white font-semibold underline decoration-cyan-400/60 underline-offset-4">
                FSRS
              </span>
              .
            </p>
          </div>

          {/* Core Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs sm:text-sm font-medium text-slate-200 hover:border-rose-500/40 transition-colors shadow-inner">
              <ScanLine className="w-4 h-4 text-rose-400" />
              <span>AI phân tích thoại ảnh (Crop OCR)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs sm:text-sm font-medium text-slate-200 hover:border-cyan-500/40 transition-colors shadow-inner">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Từ điển cá nhân (Che cột kiểm tra)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-xs sm:text-sm font-medium text-slate-200 hover:border-indigo-500/40 transition-colors shadow-inner">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Flashcard FSRS chuẩn Anki</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base font-bold px-8 h-14 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white shadow-2xl shadow-rose-500/40 border border-rose-300/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
              >
                <span>Bắt đầu học ngay — Miễn phí 100%</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Social Proof / Guarantee */}
          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Không cần thẻ tín dụng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Đồng bộ đa thiết bị (PWA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>FSRS Spaced Repetition</span>
            </div>
          </div>
        </div>

        {/* 3 Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mt-16 md:mt-24 text-left">
          {/* Card 1 */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-rose-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 group-hover:scale-110 transition-transform">
              <ScanLine className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Khoanh vùng & Bóc tách câu thoại
            </h3>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Dán ảnh anime hoặc game, khoanh đúng bong bóng nhân vật. AI tự động tách từ vựng nguyên mẫu, kanji âm Hán-Việt và giải thích ngữ pháp kèm sắc thái slang.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Từ điển tương tác & Nét vẽ KanjiVG
            </h3>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Bật/Tắt ẩn cột Furigana và Nghĩa để tự kiểm tra trí nhớ. Khám phá thư viện chữ Hán với animation mô phỏng từng nét viết chuẩn mực kèm phát âm giọng bản xứ.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Flashcard FSRS Thuật Toán 2026
            </h3>
            <p className="text-sm text-slate-300/80 leading-relaxed">
              Thuật toán tối tân thay thế SM-2 của Anki. Hỗ trợ đổi chiều Nhật ➔ Việt hoặc Việt ➔ Nhật, hỗ trợ phím tắt Space/1-4 trên PC và cử chỉ vuốt chạm trên điện thoại.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-slate-400">
        <p>
          Nihongo Jisho © 2026 • Được xây dựng với Google Gemini 3.6 Flash & Supabase • 100% Miễn phí
        </p>
      </footer>
    </div>
  );
}
