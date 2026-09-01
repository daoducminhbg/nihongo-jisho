'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Languages, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DictionaryNavTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: '/dictionary', label: 'Từ vựng', icon: BookOpen, exact: true },
    { href: '/dictionary/kanji', label: 'Kanji', icon: Languages },
    { href: '/dictionary/grammar', label: 'Ngữ pháp', icon: GraduationCap },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl w-fit border border-border/40 shadow-xs mb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={true}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors select-none z-10',
              active
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active && (
              <motion.div
                layoutId="dictTabIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 bg-background shadow-xs rounded-lg border border-border/40 -z-10"
              />
            )}
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
