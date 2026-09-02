'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeSearchQuery } from '../_lib/search-utils';
import type { Vocabulary, Kanji, Grammar } from '@/types/database.types';

export interface SearchAllResponse {
  success: boolean;
  error?: string;
  data: {
    vocabularies: Vocabulary[];
    kanjis: Kanji[];
    grammars: Grammar[];
  };
  totalCount: number;
}

export async function searchDictionary(query: string): Promise<SearchAllResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      success: true,
      data: { vocabularies: [], kanjis: [], grammars: [] },
      totalCount: 0,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Chưa đăng nhập',
        data: { vocabularies: [], kanjis: [], grammars: [] },
        totalCount: 0,
      };
    }

    const { original, hiragana, katakana } = normalizeSearchQuery(trimmed);

    // Escape special chars for PostgREST
    const esc = (s: string) => s.replace(/[,%]/g, '');
    const safeOriginal = esc(original);
    const safeHiragana = esc(hiragana);
    const safeKatakana = esc(katakana);

    const [vocabResult, kanjiResult, grammarResult] = await Promise.all([
      supabase.from('vocabularies').select('*').eq('user_id', user.id)
        .or(`word.ilike.%${safeOriginal}%,word.ilike.%${safeHiragana}%,furigana.ilike.%${safeOriginal}%,furigana.ilike.%${safeHiragana}%,meaning.ilike.%${safeOriginal}%,kanji.ilike.%${safeOriginal}%`)
        .limit(30),
      supabase.from('kanjis').select('*').eq('user_id', user.id)
        .or(`character.ilike.%${safeOriginal}%,han_viet.ilike.%${safeOriginal}%,meaning.ilike.%${safeOriginal}%,onyomi.ilike.%${safeKatakana}%,kunyomi.ilike.%${safeHiragana}%`)
        .limit(30),
      supabase.from('grammars').select('*').eq('user_id', user.id)
        .or(`title.ilike.%${safeOriginal}%,title.ilike.%${safeHiragana}%,structure.ilike.%${safeOriginal}%,explanation.ilike.%${safeOriginal}%`)
        .limit(30),
    ]);

    const vocabularies = (vocabResult.data as Vocabulary[]) || [];
    const kanjis = (kanjiResult.data as Kanji[]) || [];
    const grammars = (grammarResult.data as Grammar[]) || [];
    const totalCount = vocabularies.length + kanjis.length + grammars.length;

    return {
      success: true,
      data: {
        vocabularies,
        kanjis,
        grammars,
      },
      totalCount,
    };
  } catch (error) {
    console.error('Error searching dictionary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi tìm kiếm',
      data: { vocabularies: [], kanjis: [], grammars: [] },
      totalCount: 0,
    };
  }
}
