'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type User } from '@supabase/supabase-js';
import {
  Menu,
  ScanLine,
  BookOpen,
  Languages,
  GraduationCap,
  Search,
  Play,
  RotateCcw,
  Settings,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/layout/theme-toggle';

interface TopbarProps {
  user: User | null;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/scan')) return 'AI Scanner';
  if (pathname.startsWith('/dictionary/kanji')) return 'Từ điển Kanji';
  if (pathname.startsWith('/dictionary/grammar')) return 'Ngữ pháp';
  if (pathname.startsWith('/dictionary')) return 'Từ điển Từ vựng';
  if (pathname.startsWith('/search')) return 'Tìm kiếm';
  if (pathname.startsWith('/flashcard/review')) return 'Ôn tập';
  if (pathname.startsWith('/flashcard/study')) return 'Phiên học';
  if (pathname.startsWith('/flashcard')) return 'Flashcard';
  if (pathname.startsWith('/settings')) return 'Cài đặt';
  return 'Nihongo Jisho';
}

const navSections: NavSection[] = [
  {
    items: [
      {
        title: 'AI Scanner',
        href: '/scan',
        icon: ScanLine,
      },
    ],
  },
  {
    title: 'Từ điển',
    items: [
      {
        title: 'Từ vựng',
        href: '/dictionary',
        icon: BookOpen,
        exact: true,
      },
      {
        title: 'Kanji',
        href: '/dictionary/kanji',
        icon: Languages,
      },
      {
        title: 'Ngữ pháp',
        href: '/dictionary/grammar',
        icon: GraduationCap,
      },
    ],
  },
  {
    items: [
      {
        title: 'Tìm kiếm',
        href: '/search',
        icon: Search,
      },
    ],
  },
  {
    title: 'Flashcard',
    items: [
      {
        title: 'Học mới',
        href: '/flashcard',
        icon: Play,
        exact: true,
      },
      {
        title: 'Ôn tập',
        href: '/flashcard/review',
        icon: RotateCcw,
      },
    ],
  },
  {
    items: [
      {
        title: 'Cài đặt',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const title = getPageTitle(pathname);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      setOpen(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
  };

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const userEmail = user?.email || '';
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    userEmail.split('@')[0] ||
    'User';
  const userAvatar = user?.user_metadata?.avatar_url || '';
  const userInitials = (userName.slice(0, 2) || 'NJ').toUpperCase();

  return (
    <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      {/* Left: Drawer Trigger (Hamburger) */}
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[300px] p-0 flex flex-col justify-between">
            <div>
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="flex items-center gap-2.5 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-japanese font-bold text-lg border border-primary/20 shadow-sm">
                    語
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-base leading-tight">
                      Nihongo <span className="text-primary">Jisho</span>
                    </span>
                    <span className="text-[10px] font-normal text-muted-foreground">
                      Học tiếng Nhật thông minh
                    </span>
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menu điều hướng ứng dụng Nihongo Jisho
                </SheetDescription>
              </SheetHeader>

              {/* Navigation items in sheet */}
              <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
                {navSections.map((section, sIndex) => (
                  <div key={sIndex} className="space-y-1">
                    {section.title && (
                      <div className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item.href, item.exact);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-5 w-5 shrink-0',
                                active
                                  ? 'text-primary-foreground'
                                  : 'text-muted-foreground'
                              )}
                            />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: User Info & Sign out in sheet */}
            <div className="p-3 border-t border-border bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate text-foreground leading-tight">
                      {userName}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate leading-tight">
                      {userEmail}
                    </span>
                  </div>
                </div>
                <ThemeToggle className="h-8 w-8 shrink-0" />
              </div>

              <Separator />

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-base font-semibold truncate text-foreground">
          {title}
        </h1>
      </div>

      {/* Right: Theme Toggle & Avatar */}
      <div className="flex items-center gap-2">
        <ThemeToggle className="h-8 w-8" />
        <Avatar className="h-7 w-7">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
