'use server';

import { createClient } from '@/lib/supabase/server';
import type { ScannedVocab, ScannedKanji, ScannedGrammar } from '../_types/scan.types';

export async function saveScannedItems(items: {
  vocabularies: ScannedVocab[];
  kanjis: ScannedKanji[];
  grammars: ScannedGrammar[];
  contextSentence?: { sentence: string; meaning: string; source?: string };
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false as const, error: 'Chưa đăng nhập' };

    const results = { vocab: 0, kanji: 0, grammar: 0, updated: 0 };

    // --- Vocabularies ---
    const selectedVocab = items.vocabularies.filter(v => v.selected);
    const newVocab = selectedVocab.filter(v => v.isNew);
    const existingVocab = selectedVocab.filter(v => !v.isNew && v.existingId);

    // Batch insert new vocabularies
    if (newVocab.length > 0) {
      const { data: insertedVocab, error: vocabError } = await supabase
        .from('vocabularies')
        .insert(newVocab.map(v => ({
          user_id: user.id,
          word: v.word,
          furigana: v.furigana,
          kanji: v.kanji || null,
          meaning: v.meaning,
          word_type: v.word_type || null,
          jlpt_level: v.jlpt_level,
          context_sentences: items.contextSentence ? [items.contextSentence] : [],
          frequency: 1,
        })))
        .select('id');

      if (vocabError) throw vocabError;

      // Batch insert SRS cards for new vocab
      if (insertedVocab && insertedVocab.length > 0) {
        const now = new Date().toISOString();
        const { error: srsError } = await supabase.from('srs_cards').insert(
          insertedVocab.map(v => ({
            user_id: user.id,
            item_type: 'vocab' as const,
            item_id: v.id,
            state: 'new',
            due: now,
            stability: 0,
            difficulty: 0,
          }))
        );
        if (srsError) throw srsError;
        results.vocab = insertedVocab.length;
      }
    }

    // Update existing vocabularies (frequency + context)
    for (const v of existingVocab) {
      const { data: existing, error: fetchErr } = await supabase
        .from('vocabularies')
        .select('context_sentences, frequency')
        .eq('id', v.existingId!)
        .single();

      if (fetchErr || !existing) continue;

      const sentences = Array.isArray(existing.context_sentences)
        ? (existing.context_sentences as { sentence: string; meaning: string; source?: string }[])
        : [];
      if (items.contextSentence) {
        sentences.push(items.contextSentence);
      }
      await supabase.from('vocabularies').update({
        frequency: ((existing.frequency as number) || 1) + 1,
        context_sentences: sentences,
      }).eq('id', v.existingId!);
      results.updated++;
    }

    // --- Kanjis ---
    const selectedKanji = items.kanjis.filter(k => k.selected);
    const newKanji = selectedKanji.filter(k => k.isNew);
    
    if (newKanji.length > 0) {
      const { data: insertedKanji, error: kanjiError } = await supabase
        .from('kanjis')
        .insert(newKanji.map(k => ({
          user_id: user.id,
          character: k.character,
          han_viet: k.han_viet || null,
          onyomi: k.onyomi || null,
          kunyomi: k.kunyomi || null,
          meaning: k.meaning,
          jlpt_level: k.jlpt_level,
          example_words: k.example_words || [],
        })))
        .select('id');

      if (kanjiError) throw kanjiError;

      if (insertedKanji && insertedKanji.length > 0) {
        const now = new Date().toISOString();
        const { error: srsError } = await supabase.from('srs_cards').insert(
          insertedKanji.map(k => ({
            user_id: user.id,
            item_type: 'kanji' as const,
            item_id: k.id,
            state: 'new',
            due: now,
            stability: 0,
            difficulty: 0,
          }))
        );
        if (srsError) throw srsError;
        results.kanji = insertedKanji.length;
      }
    }

    // --- Grammars ---
    const selectedGrammar = items.grammars.filter(g => g.selected);
    const newGrammar = selectedGrammar.filter(g => g.isNew);

    if (newGrammar.length > 0) {
      const { data: insertedGrammar, error: grammarError } = await supabase
        .from('grammars')
        .insert(newGrammar.map(g => ({
          user_id: user.id,
          title: g.title,
          structure: g.structure || null,
          explanation: g.explanation,
          jlpt_level: g.jlpt_level,
          examples: g.example_sentence
            ? [{ sentence: g.example_sentence, meaning: g.example_meaning || '' }]
            : [],
          nuance: g.nuance || null,
        })))
        .select('id');

      if (grammarError) throw grammarError;

      if (insertedGrammar && insertedGrammar.length > 0) {
        const now = new Date().toISOString();
        const { error: srsError } = await supabase.from('srs_cards').insert(
          insertedGrammar.map(g => ({
            user_id: user.id,
            item_type: 'grammar' as const,
            item_id: g.id,
            state: 'new',
            due: now,
            stability: 0,
            difficulty: 0,
          }))
        );
        if (srsError) throw srsError;
        results.grammar = insertedGrammar.length;
      }
    }

    return {
      success: true as const,
      results,
      message: `Đã lưu ${results.vocab} từ vựng, ${results.kanji} kanji, ${results.grammar} ngữ pháp mới. Cập nhật ${results.updated} mục đã có.`,
    };
  } catch (error) {
    console.error('Save items error:', error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi lưu',
    };
  }
}
