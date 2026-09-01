'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/features/scanner/_components/image-uploader';
import { searchByContext, type ContextSearchResult } from '../_actions/search-by-image';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { JLPTBadge } from '@/components/shared/jlpt-badge';
import { AudioButton } from '@/features/dictionary/_components/audio-button';
import { Camera, FileText, CheckCircle2, PlusCircle, AlertCircle } from 'lucide-react';

interface ImageSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageSearchModal({ open, onOpenChange }: ImageSearchModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [textInput, setTextInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContextSearchResult | null>(null);

  const handleImageReady = async (base64: string, mimeType: string) => {
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const res = await searchByContext({ type: 'image', base64, mimeType });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'Không thể tìm kiếm nội dung ảnh.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTextSearch = async () => {
    if (!textInput.trim()) return;
    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const res = await searchByContext({ type: 'text', text: textInput.trim() });
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'Không thể phân tích câu.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setTextInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="w-5 h-5 text-primary" />
            Tìm kiếm bằng Hình ảnh hoặc Câu văn
          </DialogTitle>
          <DialogDescription>
            AI sẽ quét câu/ảnh và tìm ra tất cả các từ vựng, kanji, ngữ pháp bạn ĐÃ TỪNG HỌC có mặt trong đó.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSearching && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <LoadingSpinner className="w-8 h-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              Đang phân tích hình ảnh/câu văn và đối chiếu kho từ điển của bạn...
            </p>
          </div>
        )}

        {!isSearching && !result && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'text')} className="w-full">
            <TabsList className="grid grid-cols-2 max-w-xs mb-3">
              <TabsTrigger value="image" className="gap-1.5 text-xs">
                <Camera className="w-3.5 h-3.5" />
                Ảnh Anime/Game
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Nhập câu
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image">
              <ImageUploader onImageReady={handleImageReady} />
            </TabsContent>

            <TabsContent value="text" className="space-y-3">
              <Textarea
                placeholder="Dán câu tiếng Nhật cần tra cứu..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-28 text-base"
              />
              <Button
                onClick={handleTextSearch}
                disabled={!textInput.trim()}
                className="w-full"
              >
                Phân tích & Tìm kiếm
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {!isSearching && result && (
          <div className="space-y-5">
            {/* Sentence box */}
            <div className="p-3.5 rounded-lg bg-muted/50 border space-y-1">
              <p className="text-base font-bold font-japanese leading-relaxed">
                {result.originalText}
              </p>
              <p className="text-xs text-muted-foreground">{result.translation}</p>
            </div>

            {/* Learned Items Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                Các mục bạn ĐÃ HỌC trong câu này:
              </h3>

              {result.matchedVocabularies.length === 0 &&
              result.matchedKanjis.length === 0 &&
              result.matchedGrammars.length === 0 ? (
                <p className="text-xs text-muted-foreground italic pl-5">
                  Chưa có từ/kanji/ngữ pháp nào trong câu này có trong kho của bạn.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                  {result.matchedVocabularies.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 rounded bg-green-500/10 border border-green-500/20 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-japanese text-sm">{v.word}</span>
                        <div className="flex items-center gap-1">
                          <JLPTBadge level={v.jlpt_level} />
                          <AudioButton text={v.word} size="icon" className="h-6 w-6" />
                        </div>
                      </div>
                      <p className="text-muted-foreground">{v.meaning}</p>
                    </div>
                  ))}

                  {result.matchedKanjis.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded bg-green-500/10 border border-green-500/20 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-japanese text-base">{k.character}</span>
                        <span className="font-bold uppercase text-primary">{k.han_viet}</span>
                      </div>
                      <p className="text-muted-foreground">{k.meaning}</p>
                    </div>
                  ))}

                  {result.matchedGrammars.map((g) => (
                    <div
                      key={g.id}
                      className="p-2 rounded bg-green-500/10 border border-green-500/20 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-japanese text-primary">{g.title}</span>
                        <JLPTBadge level={g.jlpt_level} />
                      </div>
                      <p className="text-muted-foreground line-clamp-1">{g.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Items Section */}
            {(result.newVocabularies.length > 0 ||
              result.newKanjis.length > 0 ||
              result.newGrammars.length > 0) && (
              <div className="space-y-3 pt-2 border-t">
                <h3 className="text-sm font-bold flex items-center gap-1.5 text-muted-foreground">
                  <PlusCircle className="w-4 h-4" />
                  Mục mới chưa có trong từ điển:
                </h3>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {result.newVocabularies.map((v, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-muted text-xs font-japanese"
                      title={v.meaning}
                    >
                      {v.word} ({v.meaning})
                    </span>
                  ))}
                  {result.newKanjis.map((k, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-muted text-xs font-japanese"
                      title={k.meaning}
                    >
                      {k.character} [{k.han_viet}]
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Tìm kiếm ảnh/câu khác
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
