'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Play, RotateCcw, AlertCircle } from 'lucide-react';

interface KanjiStrokeViewerProps {
  character: string;
  className?: string;
  size?: number;
}

export function KanjiStrokeViewer({ character, className = '', size = 200 }: KanjiStrokeViewerProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchSvg = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const codePoint = character.codePointAt(0);
        if (!codePoint) throw new Error('Ký tự không hợp lệ');

        // KanjiVG filenames are 5-digit lowercase hex, e.g. 098df
        const hex = codePoint.toString(16).padStart(5, '0');
        const url = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hex}.svg`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Không tìm thấy dữ liệu nét vẽ cho chữ này');
        }

        const text = await response.text();
        if (isMounted) {
          // Process SVG: inject animation styles
          const processedSvg = processKanjiSvg(text, size);
          setSvgContent(processedSvg);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Lỗi tải nét vẽ');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSvg();
    return () => {
      isMounted = false;
    };
  }, [character, size]);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div
        className="relative border rounded-lg bg-card shadow-inner flex items-center justify-center overflow-hidden p-2"
        style={{ width: size + 16, height: size + 16 }}
      >
        {/* Subtle grid lines for calligraphy practice */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-px bg-muted-foreground/15 border-dashed border-b" />
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="h-full w-px bg-muted-foreground/15 border-dashed border-r" />
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <LoadingSpinner className="w-8 h-8 text-primary" />
            <span className="text-xs">Đang tải nét viết...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center text-center p-4 text-muted-foreground gap-2">
            <span className="text-4xl font-bold font-japanese">{character}</span>
            <span className="text-xs text-muted-foreground">{error}</span>
          </div>
        )}

        {svgContent && !isLoading && (
          <div
            key={animationKey}
            className="kanji-stroke-container z-10"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {svgContent && !isLoading && (
        <Button variant="outline" size="sm" onClick={handleReplay} className="gap-1.5 text-xs">
          <RotateCcw className="w-3.5 h-3.5" />
          Phát lại nét vẽ
        </Button>
      )}
    </div>
  );
}

/**
 * Parses KanjiVG SVG to add stroke order animations and styling
 */
function processKanjiSvg(rawSvg: string, targetSize: number): string {
  // Add styling to animate each path sequentially
  const styleInjection = `
    <style>
      path {
        stroke: var(--foreground, #111) !important;
        stroke-width: 3.5 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        animation: kanjiStroke 0.6s ease-in-out forwards;
        stroke-dasharray: 500;
        stroke-dashoffset: 500;
      }
      text {
        font-size: 8px !important;
        fill: #3b82f6 !important;
        font-family: sans-serif !important;
        font-weight: 600 !important;
        opacity: 0.8 !important;
      }
      @keyframes kanjiStroke {
        to {
          stroke-dashoffset: 0;
        }
      }
  `;

  // Inject delays per stroke path
  let strokeIndex = 0;
  const withDelays = rawSvg.replace(/<path[^>]+id="[^"]*-s(\d+)"[^>]*>/g, (match, p1) => {
    const strokeNum = parseInt(p1, 10);
    const delay = (strokeNum - 1) * 0.4;
    return match.replace(
      '<path',
      `<path style="animation-delay: ${delay}s; animation-fill-mode: forwards;"`
    );
  });

  // Inject style block inside <svg>
  let finalSvg = withDelays.replace(
    /<svg[^>]*>/,
    `$&${styleInjection}</style>`
  );

  // Set width & height
  finalSvg = finalSvg.replace(/width="[^"]*"/, `width="${targetSize}"`);
  finalSvg = finalSvg.replace(/height="[^"]*"/, `height="${targetSize}"`);

  return finalSvg;
}
