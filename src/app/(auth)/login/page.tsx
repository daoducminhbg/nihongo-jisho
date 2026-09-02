'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Languages,
} from 'lucide-react';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const urlError =
    searchParams.get('error') === 'auth_error'
      ? 'Đã xảy ra lỗi khi xác thực tài khoản. Vui lòng thử lại.'
      : null;
  const activeError = errorMessage ?? urlError;

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Địa chỉ email không hợp lệ.');
      return false;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return false;
    }
    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Email hoặc mật khẩu không chính xác.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.');
          } else {
            setErrorMessage(error.message || 'Đăng nhập thất bại.');
          }
          return;
        }

        router.push('/scan');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setErrorMessage('Email này đã được đăng ký tài khoản.');
          } else {
            setErrorMessage(error.message || 'Đăng ký thất bại.');
          }
          return;
        }

        if (data.session) {
          router.push('/scan');
        } else {
          setSuccessMessage(
            'Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác nhận kích hoạt tài khoản.'
          );
        }
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Đăng nhập Google thất bại.');
        setIsGoogleLoading(false);
      }
    } catch {
      setErrorMessage('Không thể kết nối đến Google. Vui lòng thử lại.');
      setIsGoogleLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-border/60 backdrop-blur-sm bg-card/95">
      <CardHeader className="text-center pb-4 pt-6 space-y-2">
        {/* Japanese-themed Brand Header */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm font-japanese font-bold text-2xl">
              語
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-foreground font-heading">
                  Nihongo Jisho
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-red-600 text-white dark:bg-red-500">
                  日本語
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium kanji-display">
                日本語辞書 • Anime & Manga OCR
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {isLogin ? 'Chào mừng bạn trở lại' : 'Tạo tài khoản mới'}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Học tiếng Nhật thông minh từ Anime, Game & Manga
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Notification Alerts */}
        {activeError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{activeError}</div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 font-normal gap-2 border-border/80 hover:bg-accent cursor-pointer"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <GoogleIcon />
          )}
          <span>Đăng nhập với Google</span>
        </Button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="w-full border-t border-border" />
          <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase tracking-wider">
            hoặc với email
          </span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Địa chỉ Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
                required
                className="pl-8 h-9 text-sm"
              />
              <Mail className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading || isGoogleLoading}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                className="pl-8 pr-8 h-9 text-sm"
              />
              <Lock className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5 text-left">
              <Label htmlFor="confirm-password" className="text-xs font-medium text-foreground">
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="new-password"
                  required
                  className="pl-8 pr-8 h-9 text-sm"
                />
                <Lock className="size-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 mt-2 font-medium cursor-pointer"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>{isLogin ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-4" />
                <span>{isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}</span>
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6 border-t border-border/40">
        <p className="text-xs text-muted-foreground text-center">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer ml-1"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
