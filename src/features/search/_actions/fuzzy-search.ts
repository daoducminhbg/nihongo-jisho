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

    // Search across Vocabularies
    const vocabFilter = `word.ilike.%${original}%,word.ilike.%${hiragana}%,furigana.ilike.%${original}%,furigana.ilike.%${hiragana}%,meaning.ilike.%${original}%,kanji.ilike.%${original}%`;
    const { data: vocabData } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('user_id', user.id)
      .or(vocabFilter)
      .limit(30);

    // Search across Kanjis
    const kanjiFilter = `character.ilike.%${original}%,han_viet.ilike.%${original}%,meaning.ilike.%${original}%,onyomi.ilike.%${katakana}%,kunyomi.ilike.%${hiragana}%`;
    const { data: kanjiData } = await supabase
      .from('kanjis')
      .select('*')
      .eq('user_id', user.id)
      .or(kanjiFilter)
      .limit(30);

    // Search across Grammars
    const grammarFilter = `title.ilike.%${original}%,title.ilike.%${hiragana}%,structure.ilike.%${original}%,explanation.ilike.%${original}%`;
    const { data: grammarData } = await supabase
      .from('grammars')
      .select('*')
      .eq('user_id', user.id)
      .or(grammarFilter)
      .limit(30);

    const vocabularies = (vocabData as Vocabulary[]) || [];
    const kanjis = (kanjiData as Kanji[]) || [];
    const grammars = (grammarData as Grammar[]) || [];
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
