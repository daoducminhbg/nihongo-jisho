'use client';

import { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Crop as CropIcon, SkipForward } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string, mimeType: string) => void;
  onSkip: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onSkip }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [isCropping, setIsCropping] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleCropConfirm = useCallback(() => {
    const image = imageRef.current;
    if (!image || !crop.width || !crop.height) return;

    setIsCropping(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCropping(false);
      return;
    }

    // Convert percentage crop to pixel values
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    let pixelX: number, pixelY: number, pixelWidth: number, pixelHeight: number;

    if (crop.unit === '%') {
      pixelX = (crop.x / 100) * image.width * scaleX;
      pixelY = (crop.y / 100) * image.height * scaleY;
      pixelWidth = (crop.width / 100) * image.width * scaleX;
      pixelHeight = (crop.height / 100) * image.height * scaleY;
    } else {
      pixelX = crop.x * scaleX;
      pixelY = crop.y * scaleY;
      pixelWidth = crop.width * scaleX;
      pixelHeight = crop.height * scaleY;
    }

    const sourceX = pixelX;
    const sourceY = pixelY;
    const sourceWidth = pixelWidth;
    const sourceHeight = pixelHeight;

    if (pixelWidth > 1600 || pixelHeight > 1600) {
      const scale = 1600 / Math.max(pixelWidth, pixelHeight);
      pixelWidth *= scale;
      pixelHeight *= scale;
    }

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      pixelWidth,
      pixelHeight
    );

    const mimeType = 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.85);
    const base64 = dataUrl.split(',')[1];

    setIsCropping(false);
    onCropComplete(base64, mimeType);
  }, [crop, onCropComplete]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        Chọn vùng chứa text tiếng Nhật để phân tích chính xác hơn
      </div>

      <div className="overflow-hidden rounded-lg border bg-muted/30">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          className="max-h-[60vh]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Ảnh cần cắt"
            className="max-h-[60vh] w-full object-contain"
          />
        </ReactCrop>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onSkip}
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Bỏ qua cắt
        </Button>
        <Button
          className="flex-1"
          onClick={handleCropConfirm}
          disabled={isCropping}
        >
          <CropIcon className="mr-2 h-4 w-4" />
          {isCropping ? 'Đang xử lý...' : 'Xác nhận cắt'}
        </Button>
      </div>
    </div>
  );
}
