'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { type User } from '@supabase/supabase-js';
import {
  ScanLine,
  BookOpen,
  Languages,
  GraduationCap,
  Search,
  Play,
  RotateCcw,
  Sliders,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/layout/theme-toggle';

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
      {
        title: 'Tùy chọn bộ thẻ',
        href: '/flashcard/deck-options',
        icon: Sliders,
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

interface SidebarProps {
  user: User | null;
  className?: string;
}

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
  };

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
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
    <TooltipProvider delay={200}>
      <aside
        className={cn(
          'hidden md:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-border bg-card transition-all duration-300 select-none',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          className
        )}
      >
        {/* App Logo & Collapse Toggle */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-border">
          <Link
            href="/scan"
            className={cn(
              'flex items-center gap-2.5 overflow-hidden font-bold transition-opacity hover:opacity-80',
              isCollapsed && 'justify-center w-full'
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-japanese font-bold text-lg border border-primary/20 shadow-sm">
              語
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground leading-tight">
                  Nihongo <span className="text-primary">Jisho</span>
                </span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  Học tiếng Nhật thông minh
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsCollapsed(true)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Thu gọn sidebar"
              aria-label="Thu gọn sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {section.title && (
                <div
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    isCollapsed ? 'sr-only' : 'block'
                  )}
                >
                  {section.title}
                </div>
              )}
              {section.title && isCollapsed && (
                <Separator className="my-1.5" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  const linkContent = (
                    <Link
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        'relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors z-10',
                        active
                          ? 'text-primary-foreground font-semibold'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
                        isCollapsed && 'justify-center px-0'
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebarActiveBackground"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-xs"
                        />
                      )}
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0 transition-colors',
                          active
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground'
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger render={linkContent} />
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Expand button if collapsed */}
        {isCollapsed && (
          <div className="p-2 flex justify-center border-t border-border">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsCollapsed(false)}
              className="text-muted-foreground hover:text-foreground"
              title="Mở rộng sidebar"
              aria-label="Mở rộng sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Footer: User profile & Theme toggle */}
        <div className="p-2.5 border-t border-border bg-card/50 space-y-2">
          <div
            className={cn(
              'flex items-center gap-2.5',
              isCollapsed ? 'flex-col justify-center' : 'justify-between'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2.5 overflow-hidden',
                isCollapsed && 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-foreground leading-tight">
                    {userName}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate leading-tight">
                    {userEmail}
                  </span>
                </div>
              )}
            </div>

            <div
              className={cn(
                'flex items-center gap-1',
                isCollapsed && 'flex-col'
              )}
            >
              <ThemeToggle className="h-8 w-8" />
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Đăng xuất"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <TooltipContent side="right">Đăng xuất</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
