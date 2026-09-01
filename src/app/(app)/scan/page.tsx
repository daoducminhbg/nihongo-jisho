'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUploader } from '@/features/scanner/_components/image-uploader';
import { ImageCropper } from '@/features/scanner/_components/image-cropper';
import { TextInput } from '@/features/scanner/_components/text-input';
import { ScanResults } from '@/features/scanner/_components/scan-results';
import { scanContent } from '@/features/scanner/_actions/scan-image';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Sparkles, AlertCircle, Scan, FileText } from 'lucide-react';
import type { ScanResult } from '@/features/scanner/_types/scan.types';

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // When an image is selected/pasted in ImageUploader
  const handleImageReady = (base64: string, mimeType: string) => {
    const dataUrl = `data:${mimeType};base64,${base64}`;
    setRawImageSrc(dataUrl);
    setCroppedImage({ base64, mimeType });
    setIsCropping(true);
    setError(null);
  };

  // When crop confirmed
  const handleCropComplete = async (croppedBase64: string, mimeType: string) => {
    setCroppedImage({ base64: croppedBase64, mimeType });
    setIsCropping(false);
    await runScan({ type: 'image', base64: croppedBase64, mimeType });
  };

  // When crop skipped
  const handleCropSkip = async () => {
    setIsCropping(false);
    if (croppedImage) {
      await runScan({ type: 'image', base64: croppedImage.base64, mimeType: croppedImage.mimeType });
    }
  };

  // When text submitted
  const handleTextSubmit = async (text: string) => {
    await runScan({ type: 'text', text });
  };

  const runScan = async (
    input: { type: 'text'; text: string } | { type: 'image'; base64: string; mimeType: string }
  ) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await scanContent(input);
      if (res.success) {
        setScanResult(res.data);
      } else {
        setError(res.error || 'Có lỗi xảy ra khi phân tích.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setRawImageSrc(null);
    setCroppedImage(null);
    setIsCropping(false);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Scanner
        </h1>
        <p className="text-muted-foreground mt-1">
          Trích xuất từ vựng, ngữ pháp và kanji từ ảnh Anime, Game hoặc văn bản tiếng Nhật bằng Gemini Flash AI tốc độ cao.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <Card className="py-12 border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <LoadingSpinner className="w-10 h-10 text-primary" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Gemini Flash AI đang phân tích...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Đang nhận diện ký tự, phân tích cú pháp, tra cứu âm Hán-Việt và đối chiếu với từ điển cá nhân của bạn.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results View */}
      {!isAnalyzing && scanResult && (
        <ScanResults
          initialResult={scanResult}
          onReset={handleReset}
          onSaved={() => {
            // Can optionally navigate or show persistent notification
          }}
        />
      )}

      {/* Input / Cropping View */}
      {!isAnalyzing && !scanResult && (
        <>
          {isCropping && rawImageSrc ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Khoanh vùng khung thoại</CardTitle>
                <CardDescription>
                  Kéo khung chọn đúng vị trí chữ tiếng Nhật để AI nhận diện tối ưu nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageCropper
                  imageSrc={rawImageSrc}
                  onCropComplete={handleCropComplete}
                  onSkip={handleCropSkip}
                />
              </CardContent>
            </Card>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'image' | 'text')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 max-w-xs mb-4">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Scan className="w-4 h-4" />
                  Ảnh chụp
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Văn bản
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tải ảnh Anime / Game</CardTitle>
                    <CardDescription>
                      Kéo thả ảnh chụp màn hình hoặc dán trực tiếp bằng phím tắt Ctrl + V
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUploader onImageReady={handleImageReady} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="text">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nhập câu tiếng Nhật</CardTitle>
                    <CardDescription>
                      Dán câu hoặc đoạn hội thoại bạn bắt gặp khi chơi game, xem anime
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TextInput onTextSubmit={handleTextSubmit} isLoading={isAnalyzing} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
