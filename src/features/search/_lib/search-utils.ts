import * as wanakana from 'wanakana';

/**
 * Normalizes query string:
 * - If input is Romaji (e.g. "taberu"), converts to Hiragana ("たべる")
 * - Returns both original and converted variants for matching
 */
export function normalizeSearchQuery(rawQuery: string): {
  original: string;
  hiragana: string;
  katakana: string;
} {
  const original = rawQuery.trim();
  const isRomaji = wanakana.isRomaji(original);

  const hiragana = isRomaji ? wanakana.toHiragana(original) : original;
  const katakana = isRomaji ? wanakana.toKatakana(original) : wanakana.toKatakana(hiragana);

  return {
    original,
    hiragana,
    katakana,
  };
}
