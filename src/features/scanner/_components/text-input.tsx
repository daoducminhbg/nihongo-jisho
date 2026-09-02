'use client';

import { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Languages, AlertTriangle } from 'lucide-react';

interface TextInputProps {
  onTextSubmit: (text: string) => void;
  isLoading?: boolean;
}

const MAX_LENGTH = 2000;
const JP_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

export function TextInput({ onTextSubmit, isLoading }: TextInputProps) {
  const [text, setText] = useState('');

  const hasJapanese = useMemo(() => JP_REGEX.test(text), [text]);
  const trimmed = text.trim();
  const showWarning = trimmed.length > 0 && !hasJapanese;

  const handleSubmit = () => {
    if (trimmed.length > 0) {
      onTextSubmit(trimmed);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="Dán hoặc nhập văn bản tiếng Nhật vào đây..."
        className="min-h-32 text-base"
        disabled={isLoading}
        maxLength={MAX_LENGTH}
      />

      {showWarning && (
        <div className="flex items-center gap-2 text-xs text-amber-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Không phát hiện ký tự tiếng Nhật. Kết quả có thể không chính xác.</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length}/{MAX_LENGTH} ký tự
        </span>

        <Button
          onClick={handleSubmit}
          disabled={trimmed.length === 0 || isLoading}
        >
          <Languages className="mr-2 h-4 w-4" />
          {isLoading ? 'Đang phân tích...' : 'Phân tích'}
        </Button>
      </div>
    </div>
  );
}
