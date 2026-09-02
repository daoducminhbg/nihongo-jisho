'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { RotateCcw } from 'lucide-react';

interface KanjiStrokeViewerProps {
  character: string;
  className?: string;
  size?: number;
}

/** Duration per stroke scales with path length: min 0.5s, max 1.4s */
const MIN_STROKE_DURATION = 0.5;
const MAX_STROKE_DURATION = 1.4;
/** Reference length to normalize stroke speed (~average KanjiVG path) */
const REF_PATH_LENGTH = 200;
/** Pause between strokes */
const PAUSE_BETWEEN = 0.35;
/** Smooth calligraphy-like easing */
const EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1.0)';

export function KanjiStrokeViewer({
  character,
  className = '',
  size = 200,
}: KanjiStrokeViewerProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  /** Monotonic counter – incrementing cancels any running sequence */
  const seqRef = useRef(0);

  // ── Fetch SVG from KanjiVG CDN ──
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cp = character.codePointAt(0);
        if (!cp) throw new Error('Ký tự không hợp lệ');

        const hex = cp.toString(16).padStart(5, '0');
        const url = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hex}.svg`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Không tìm thấy dữ liệu nét vẽ cho chữ này');

        let svg = await res.text();
        // Set target dimensions
        svg = svg.replace(/width="[^"]*"/, `width="${size}"`);
        svg = svg.replace(/height="[^"]*"/, `height="${size}"`);

        if (alive) setSvgContent(svg);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : 'Lỗi tải nét vẽ');
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [character, size]);

  // ── Core animation logic ──
  const animateStrokes = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const svg = el.querySelector('svg');
    if (!svg) return;

    // KanjiVG stroke paths have ids like "kvg:XXXXX-s1", "kvg:XXXXX-s2" …
    const paths = Array.from(
      svg.querySelectorAll<SVGPathElement>('path[id]')
    ).filter((p) => /-s\d+$/.test(p.id));

    // KanjiVG stroke number labels
    const texts = Array.from(svg.querySelectorAll<SVGTextElement>('text'));

    if (paths.length === 0) return;

    const seq = ++seqRef.current;
    setIsPlaying(true);

    // ── Reset every path to "hidden" (full dash offset) ──
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.transition = 'none';
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      p.style.stroke = 'var(--foreground, #1a1a1a)';
      p.style.strokeWidth = '3.5';
      p.style.strokeLinecap = 'round';
      p.style.strokeLinejoin = 'round';
      p.style.fill = 'none';
      p.style.opacity = '1';
    });

    // ── Hide all stroke-number labels ──
    texts.forEach((t) => {
      t.style.transition = 'none';
      t.style.opacity = '0';
      t.style.fill = '#3b82f6';
      t.style.fontSize = '8px';
      t.style.fontFamily = 'system-ui, sans-serif';
      t.style.fontWeight = '600';
    });

    // Force a reflow so the "reset" styles apply synchronously
    // before we start transitioning.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    svg.getBoundingClientRect();

    // ── Sequentially reveal strokes ──
    let idx = 0;

    const next = () => {
      if (seq !== seqRef.current) return;       // cancelled
      if (idx >= paths.length) {
        setIsPlaying(false);
        return;
      }

      const path = paths[idx];
      const len = path.getTotalLength();

      // Proportional duration: longer strokes take slightly longer
      const ratio = Math.min(Math.max(len / REF_PATH_LENGTH, 0.4), 1.6);
      const dur = MIN_STROKE_DURATION + (MAX_STROKE_DURATION - MIN_STROKE_DURATION) * ((ratio - 0.4) / 1.2);

      // Transition the dashoffset → 0  (draws the stroke)
      path.style.transition = `stroke-dashoffset ${dur.toFixed(2)}s ${EASE}`;
      requestAnimationFrame(() => {
        if (seq !== seqRef.current) return;
        path.style.strokeDashoffset = '0';
      });

      // Fade in the stroke number AFTER the stroke finishes drawing
      const label = texts[idx];
      const afterDraw = dur * 1000;
      const afterPause = (dur + PAUSE_BETWEEN) * 1000;

      setTimeout(() => {
        if (seq !== seqRef.current) return;
        if (label) {
          label.style.transition = 'opacity 0.25s ease';
          label.style.opacity = '0.85';
        }
      }, afterDraw);

      // Start the NEXT stroke after draw + pause
      idx++;
      setTimeout(() => {
        if (seq !== seqRef.current) return;
        next();
      }, afterPause);
    };

    // Kick off with a tiny delay so the reset reflow is visible
    requestAnimationFrame(next);
  }, []);

  // ── Auto-play when SVG first loads ──
  useEffect(() => {
    if (svgContent && !isLoading) {
      const t = setTimeout(animateStrokes, 120);
      return () => clearTimeout(t);
    }
  }, [svgContent, isLoading, animateStrokes]);

  // ── Replay handler ──
  const handleReplay = () => {
    seqRef.current++;          // cancel running animation
    animateStrokes();
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Canvas area */}
      <div
        className="relative border rounded-lg bg-card shadow-inner flex items-center justify-center overflow-hidden p-2"
        style={{ width: size + 16, height: size + 16 }}
      >
        {/* Calligraphy guide cross-hair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-px bg-muted-foreground/15" />
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="h-full w-px bg-muted-foreground/15" />
        </div>
        {/* Diagonal guides */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${size + 16} ${size + 16}`}
          preserveAspectRatio="none"
        >
          <line
            x1="0" y1="0" x2={size + 16} y2={size + 16}
            stroke="var(--muted-foreground)"
            strokeWidth="0.5"
            opacity="0.08"
            strokeDasharray="4 6"
          />
          <line
            x1={size + 16} y1="0" x2="0" y2={size + 16}
            stroke="var(--muted-foreground)"
            strokeWidth="0.5"
            opacity="0.08"
            strokeDasharray="4 6"
          />
        </svg>

        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <LoadingSpinner className="w-8 h-8 text-primary" />
            <span className="text-xs">Đang tải nét viết...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center text-center p-4 text-muted-foreground gap-2">
            <span className="text-4xl font-bold font-japanese">{character}</span>
            <span className="text-xs">{error}</span>
          </div>
        )}

        {svgContent && !isLoading && (
          <div
            ref={containerRef}
            className="kanji-stroke-container z-10"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Replay button */}
      {svgContent && !isLoading && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReplay}
          disabled={isPlaying}
          className="gap-1.5 text-xs"
          aria-label="Phát lại nét vẽ"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
          {isPlaying ? 'Đang vẽ...' : 'Phát lại nét vẽ'}
        </Button>
      )}
    </div>
  );
}
