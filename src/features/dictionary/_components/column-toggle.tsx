'use client';

import { Check, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ColumnOption {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnToggleProps {
  columns: ColumnOption[];
  onToggle: (id: string) => void;
  onReset?: () => void;
}

export function ColumnToggle({ columns, onToggle, onReset }: ColumnToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Columns3 className="h-4 w-4" />
            <span className="hidden sm:inline">Hiển thị cột</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Tùy chỉnh hiển thị</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={col.visible}
            onCheckedChange={() => onToggle(col.id)}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
        {onReset && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs font-normal text-muted-foreground h-8 px-2"
              onClick={onReset}
            >
              Hiện tất cả các cột
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
