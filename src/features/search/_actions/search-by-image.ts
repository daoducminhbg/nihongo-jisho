'use server';

import { createClient } from '@/lib/supabase/server';
import { analyzeJapanese } from '@/features/scanner/_lib/gemini-client';
import type { Vocabulary, Kanji, Grammar } from '@/types/database.types';

export interface ContextSearchResult {
  originalText: string;
  translation: string;
  matchedVocabularies: Vocabulary[];
  newVocabularies: { word: string; furigana: string; meaning: string; jlpt_level: string }[];
  matchedKanjis: Kanji[];
  newKanjis: { character: string; han_viet: string; meaning: string; jlpt_level: string }[];
  matchedGrammars: Grammar[];
  newGrammars: { title: string; explanation: string; jlpt_level: string }[];
}

export async function searchByContext(
  input: { type: 'text'; text: string } | { type: 'image'; base64: string; mimeType: string }
): Promise<{ success: boolean; data?: ContextSearchResult; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const geminiInput =
      input.type === 'text' ? input.text : { base64: input.base64, mimeType: input.mimeType };

    const parsed = await analyzeJapanese(geminiInput);

    // Query learned vocabularies matching words in this sentence
    const wordList = parsed.vocabularies.map((v) => v.word);
    const { data: matchedVocabData } = await supabase
      .from('vocabularies')
      .select('*')
      .eq('user_id', user.id)
      .in('word', wordList);

    const matchedVocabMap = new Map(
      ((matchedVocabData as Vocabulary[]) || []).map((v) => [v.word, v])
    );

    const matchedVocabularies: Vocabulary[] = [];
    const newVocabularies: ContextSearchResult['newVocabularies'] = [];

    for (const v of parsed.vocabularies) {
      const existing = matchedVocabMap.get(v.word);
      if (existing) {
        matchedVocabularies.push(existing);
      } else {
        newVocabularies.push({
          word: v.word,
          furigana: v.furigana,
          meaning: v.meaning,
          jlpt_level: v.jlpt_level,
        });
      }
    }

    // Query learned kanjis matching characters in this sentence
    const kanjiList = parsed.kanjis.map((k) => k.character);
    const { data: matchedKanjiData } = await supabase
      .from('kanjis')
      .select('*')
      .eq('user_id', user.id)
      .in('character', kanjiList);

    const matchedKanjiMap = new Map(
      ((matchedKanjiData as Kanji[]) || []).map((k) => [k.character, k])
    );

    const matchedKanjis: Kanji[] = [];
    const newKanjis: ContextSearchResult['newKanjis'] = [];

    for (const k of parsed.kanjis) {
      const existing = matchedKanjiMap.get(k.character);
      if (existing) {
        matchedKanjis.push(existing);
      } else {
        newKanjis.push({
          character: k.character,
          han_viet: k.han_viet,
          meaning: k.meaning,
          jlpt_level: k.jlpt_level,
        });
      }
    }

    // Query learned grammars matching patterns in this sentence
    const grammarList = parsed.grammars.map((g) => g.title);
    const { data: matchedGrammarData } = await supabase
      .from('grammars')
      .select('*')
      .eq('user_id', user.id)
      .in('title', grammarList);

    const matchedGrammarMap = new Map(
      ((matchedGrammarData as Grammar[]) || []).map((g) => [g.title, g])
    );

    const matchedGrammars: Grammar[] = [];
    const newGrammars: ContextSearchResult['newGrammars'] = [];

    for (const g of parsed.grammars) {
      const existing = matchedGrammarMap.get(g.title);
      if (existing) {
        matchedGrammars.push(existing);
      } else {
        newGrammars.push({
          title: g.title,
          explanation: g.explanation,
          jlpt_level: g.jlpt_level,
        });
      }
    }

    return {
      success: true,
      data: {
        originalText: parsed.original_text,
        translation: parsed.translation,
        matchedVocabularies,
        newVocabularies,
        matchedKanjis,
        newKanjis,
        matchedGrammars,
        newGrammars,
      },
    };
  } catch (error) {
    console.error('Error searching by image/context:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi phân tích tìm kiếm',
    };
  }
}
