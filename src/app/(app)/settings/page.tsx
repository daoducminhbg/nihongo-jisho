import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Settings, User, Key, Palette, Info, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Cài đặt & Thông tin
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tài khoản cá nhân, giao diện ứng dụng và cấu hình hệ thống học tập.
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Tài khoản cá nhân
          </CardTitle>
          <CardDescription>Thông tin tài khoản đang đăng nhập trên thiết bị này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-semibold text-foreground">{user?.email || 'Chưa xác định'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Mã người dùng (User ID):</span>
            <span className="font-mono text-xs text-muted-foreground truncate max-w-xs">
              {user?.id || '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Đăng nhập lần cuối:</span>
            <span className="text-xs text-muted-foreground">
              {user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString('vi-VN')
                : 'Mới đăng nhập'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Giao diện hiển thị
          </CardTitle>
          <CardDescription>Chuyển đổi chế độ Sáng / Tối hoặc theo hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Chế độ màu nền</p>
            <p className="text-xs text-muted-foreground">Tối ưu cho việc đọc Kanji ban đêm</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* System & Architecture Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Kiến trúc công nghệ (100% Free-tier)
          </CardTitle>
          <CardDescription>Các công nghệ tiên tiến đang vận hành ứng dụng này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-1.5 border-b text-xs">
            <span className="font-medium">AI Multimodal Engine:</span>
            <span className="text-primary font-bold">Google Gemini 3.6 Flash</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b text-xs">
            <span className="font-medium">Thuật toán Spaced Repetition:</span>
            <span className="text-primary font-bold">FSRS (Free Spaced Repetition Scheduler)</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b text-xs">
            <span className="font-medium">Cơ sở dữ liệu & Xác thực:</span>
            <span className="text-primary font-bold">Supabase PostgreSQL 16 + RLS</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b text-xs">
            <span className="font-medium">Dữ liệu thứ tự nét viết Kanji:</span>
            <span className="text-primary font-bold">Dự án mã nguồn mở KanjiVG</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-xs">
            <span className="font-medium">Giọng phát âm tiếng Nhật:</span>
            <span className="text-primary font-bold">Web Speech API (Native Browser ja-JP)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
