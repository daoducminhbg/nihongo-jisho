import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '@/components/layout/theme-provider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Nihongo Jisho - Học tiếng Nhật thông minh',
  description: 'Ứng dụng học tiếng Nhật thông minh từ Anime, Game & Manga',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nihongo Jisho',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
