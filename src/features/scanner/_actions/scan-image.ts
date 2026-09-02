'use server';

import { createClient } from '@/lib/supabase/server';
import { analyzeJapanese } from '../_lib/gemini-client';
import type { ScanResult, ScannedVocab, ScannedKanji, ScannedGrammar } from '../_types/scan.types';

export async function scanContent(
  input: { type: 'text'; text: string } | { type: 'image'; base64: string; mimeType: string }
): Promise<{ success: true; data: ScanResult } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Chưa đăng nhập' };

    // Call Gemini
    const geminiInput = input.type === 'text'
      ? input.text
      : { base64: input.base64, mimeType: input.mimeType };

    const raw = await analyzeJapanese(geminiInput);

    // Check for duplicates in parallel
    const vocabWords = raw.vocabularies.map(v => v.word);
    const kanjiChars = raw.kanjis.map(k => k.character);
    const grammarTitles = raw.grammars.map(g => g.title);

    const [vocabResult, kanjiResult, grammarResult] = await Promise.all([
      vocabWords.length > 0
        ? supabase.from('vocabularies').select('id, word, frequency').eq('user_id', user.id).in('word', vocabWords)
        : Promise.resolve({ data: [] }),
      kanjiChars.length > 0
        ? supabase.from('kanjis').select('id, character').eq('user_id', user.id).in('character', kanjiChars)
        : Promise.resolve({ data: [] }),
      grammarTitles.length > 0
        ? supabase.from('grammars').select('id, title').eq('user_id', user.id).in('title', grammarTitles)
        : Promise.resolve({ data: [] })
    ]);

    const existingVocab = vocabResult.data;
    const existingVocabMap = new Map(
      (existingVocab || []).map(v => [v.word, { id: v.id as string, frequency: v.frequency as number }])
    );

    const vocabularies: ScannedVocab[] = raw.vocabularies.map(v => {
      const existing = existingVocabMap.get(v.word);
      return {
        ...v,
        isNew: !existing,
        existingId: existing?.id,
        existingFrequency: existing?.frequency,
        selected: !existing, // Auto-select new items
      };
    });

    const existingKanji = kanjiResult.data;
    const existingKanjiMap = new Map(
      (existingKanji || []).map(k => [k.character as string, k.id as string])
    );

    const kanjis: ScannedKanji[] = raw.kanjis.map(k => {
      const existingId = existingKanjiMap.get(k.character);
      return {
        ...k,
        isNew: !existingId,
        existingId: existingId || undefined,
        selected: !existingId,
      };
    });

    const existingGrammar = grammarResult.data;
    const existingGrammarMap = new Map(
      (existingGrammar || []).map(g => [g.title as string, g.id as string])
    );

    const grammars: ScannedGrammar[] = raw.grammars.map(g => {
      const existingId = existingGrammarMap.get(g.title);
      return {
        ...g,
        isNew: !existingId,
        existingId: existingId || undefined,
        selected: !existingId,
      };
    });

    return {
      success: true,
      data: {
        original_text: raw.original_text,
        translation: raw.translation,
        vocabularies,
        grammars,
        kanjis,
      },
    };
  } catch (error) {
    console.error('Scan error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Lỗi không xác định' };
  }
}
