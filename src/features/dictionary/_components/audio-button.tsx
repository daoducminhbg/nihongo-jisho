'use client';

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AudioButton({ text, className, size = 'icon' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ Web Speech API.');
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Slightly slower for language learners

    // Try to find a Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja') || v.lang === 'ja-JP');
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn('h-8 w-8 text-muted-foreground hover:text-primary transition-colors', className)}
      onClick={handleSpeak}
      title="Nghe phát âm"
    >
      {isPlaying ? (
        <Volume2 className="h-4 w-4 animate-pulse text-primary" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span className="sr-only">Phát âm {text}</span>
    </Button>
  );
}
