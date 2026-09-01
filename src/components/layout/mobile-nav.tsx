'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScanLine, BookOpen, Search, Layers, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  pattern: RegExp | string;
}

const mobileNavItems: MobileNavItem[] = [
  {
    title: 'Scanner',
    href: '/scan',
    icon: ScanLine,
    pattern: '/scan',
  },
  {
    title: 'Từ điển',
    href: '/dictionary',
    icon: BookOpen,
    pattern: '/dictionary',
  },
  {
    title: 'Tìm kiếm',
    href: '/search',
    icon: Search,
    pattern: '/search',
  },
  {
    title: 'Flashcard',
    href: '/flashcard',
    icon: Layers,
    pattern: '/flashcard',
  },
  {
    title: 'Cài đặt',
    href: '/settings',
    icon: Settings,
    pattern: '/settings',
  },
];

export function MobileNav() {
  const pathname = usePathname();

  const isItemActive = (item: MobileNavItem) => {
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      aria-label="Điều hướng di động"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none py-1 relative active:scale-95',
                active
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-xs"
                />
              )}
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  active ? 'text-primary scale-110' : 'text-muted-foreground'
                )}
              />
              <span className="text-[11px] leading-none">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
