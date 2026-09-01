'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  isLoading?: boolean;
}

export function TextInput({ onTextSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed.length > 0) {
      onTextSubmit(trimmed);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Dán hoặc nhập văn bản tiếng Nhật vào đây..."
        className="min-h-32 text-base"
        disabled={isLoading}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length} ký tự
        </span>

        <Button
          onClick={handleSubmit}
          disabled={text.trim().length === 0 || isLoading}
        >
          <Languages className="mr-2 h-4 w-4" />
          {isLoading ? 'Đang phân tích...' : 'Phân tích'}
        </Button>
      </div>
    </div>
  );
}
