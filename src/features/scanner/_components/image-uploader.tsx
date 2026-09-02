'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageReady: (base64: string, mimeType: string) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const compressImage = (file: File): Promise<{ base64: string; mimeType: string; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > 1600 || height > 1600) {
          const scale = 1600 / Math.max(width, height);
          width *= scale;
          height *= scale;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Không thể tạo canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.85);
        const base64 = dataUrl.split(',')[1];

        resolve({ base64, mimeType, dataUrl });
      };
      img.onerror = () => reject(new Error('Không thể tải ảnh'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
    reader.readAsDataURL(file);
  });
};

export function ImageUploader({ onImageReady }: ImageUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Chỉ hỗ trợ ảnh PNG, JPG, JPEG, WebP');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Ảnh quá lớn. Tối đa 10MB');
        return;
      }

      try {
        const { base64, mimeType, dataUrl } = await compressImage(file);
        setImagePreview(dataUrl);
        onImageReady(base64, mimeType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi xử lý ảnh');
      }
    },
    [onImageReady]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    },
    [processFile]
  );

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {!imagePreview ? (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Kéo thả ảnh vào đây hoặc bấm để chọn
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hỗ trợ PNG, JPG, WebP (tối đa 10MB)
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Hoặc dán ảnh từ clipboard (Ctrl+V)
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Ảnh đã tải lên"
              className="max-h-80 w-full object-contain bg-muted/30"
            />
          </div>
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
            aria-label="Xóa ảnh"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <ImageIcon className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
