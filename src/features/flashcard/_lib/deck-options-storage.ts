'use client';

import { useState, useEffect } from 'react';
import { AnkiDeckOptions, DEFAULT_ANKI_OPTIONS } from '../_types/deck-options.types';

const STORAGE_KEY = 'anki_deck_options_v1';

export function loadDeckOptions(): AnkiDeckOptions {
  if (typeof window === 'undefined') return DEFAULT_ANKI_OPTIONS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ANKI_OPTIONS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ANKI_OPTIONS, ...parsed };
  } catch {
    return DEFAULT_ANKI_OPTIONS;
  }
}

export function saveDeckOptions(options: AnkiDeckOptions): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch (err) {
    console.error('Failed to save deck options to localStorage:', err);
  }
}

/**
 * Parses space-separated learning step string into array of minutes
 * e.g. "1m 10m" -> [1, 10]
 * e.g. "5m 15m 1d" -> [5, 15, 1440]
 */
export function parseStepsToMinutes(stepStr: string): number[] {
  const parts = stepStr.trim().split(/\s+/);
  const minutes: number[] = [];

  for (const part of parts) {
    const match = part.match(/^(\d+(?:\.\d+)?)([mhd])?$/i);
    if (!match) continue;
    const val = parseFloat(match[1]);
    const unit = (match[2] || 'm').toLowerCase();

    if (unit === 'm') minutes.push(val);
    else if (unit === 'h') minutes.push(val * 60);
    else if (unit === 'd') minutes.push(val * 1440);
  }

  return minutes.length > 0 ? minutes : [1, 10];
}

export function useDeckOptions() {
  const [options, setOptions] = useState<AnkiDeckOptions>(DEFAULT_ANKI_OPTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setOptions(loadDeckOptions());
    setIsLoaded(true);
  }, []);

  const updateOptions = (newOptions: Partial<AnkiDeckOptions>) => {
    setOptions((prev) => {
      const updated = { ...prev, ...newOptions };
      saveDeckOptions(updated);
      return updated;
    });
  };

  const resetToDefault = () => {
    setOptions(DEFAULT_ANKI_OPTIONS);
    saveDeckOptions(DEFAULT_ANKI_OPTIONS);
  };

  return {
    options,
    isLoaded,
    updateOptions,
    resetToDefault,
  };
}
