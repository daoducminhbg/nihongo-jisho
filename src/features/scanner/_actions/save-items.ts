'use server';

import { createClient } from '@/lib/supabase/server';
import type { ScannedVocab, ScannedKanji, ScannedGrammar } from '../_types/scan.types';

export async function saveScannedItems(items: {
  vocabularies: ScannedVocab[];
  kanjis: ScannedKanji[];
  grammars: ScannedGrammar[];
  contextSentence?: { sentence: string; meaning: string; source?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'Chưa đăng nhập' };

  const results = { vocab: 0, kanji: 0, grammar: 0, updated: 0 };

  // Save new vocabularies
  for (const v of items.vocabularies.filter(v => v.selected)) {
    if (v.isNew) {
      const { data: inserted } = await supabase.from('vocabularies').insert({
        user_id: user.id,
        word: v.word,
        furigana: v.furigana,
        kanji: v.kanji || null,
        meaning: v.meaning,
        word_type: v.word_type || null,
        jlpt_level: v.jlpt_level,
        context_sentences: items.contextSentence ? [items.contextSentence] : [],
        frequency: 1,
      }).select('id').single();

      if (inserted) {
        // Create SRS card for new vocab
        await supabase.from('srs_cards').insert({
          user_id: user.id,
          item_type: 'vocab',
          item_id: inserted.id,
          state: 'new',
          due: new Date().toISOString(),
          stability: 0,
          difficulty: 0,
        });
        results.vocab++;
      }
    } else if (v.existingId) {
      // Update frequency and add context sentence for existing vocab
      const { data: existing } = await supabase
        .from('vocabularies')
        .select('context_sentences, frequency')
        .eq('id', v.existingId)
        .single();

      if (existing) {
        const sentences = Array.isArray(existing.context_sentences)
          ? (existing.context_sentences as { sentence: string; meaning: string; source?: string }[])
          : [];
        if (items.contextSentence) {
          sentences.push(items.contextSentence);
        }
        await supabase.from('vocabularies').update({
          frequency: ((existing.frequency as number) || 1) + 1,
          context_sentences: sentences,
        }).eq('id', v.existingId);
        results.updated++;
      }
    }
  }

  // Save new kanjis
  for (const k of items.kanjis.filter(k => k.selected)) {
    if (k.isNew) {
      const { data: inserted } = await supabase.from('kanjis').insert({
        user_id: user.id,
        character: k.character,
        han_viet: k.han_viet || null,
        onyomi: k.onyomi || null,
        kunyomi: k.kunyomi || null,
        meaning: k.meaning,
        jlpt_level: k.jlpt_level,
        example_words: k.example_words || [],
      }).select('id').single();

      if (inserted) {
        await supabase.from('srs_cards').insert({
          user_id: user.id,
          item_type: 'kanji',
          item_id: inserted.id,
          state: 'new',
          due: new Date().toISOString(),
          stability: 0,
          difficulty: 0,
        });
        results.kanji++;
      }
    }
  }

  // Save new grammars
  for (const g of items.grammars.filter(g => g.selected)) {
    if (g.isNew) {
      const { data: inserted } = await supabase.from('grammars').insert({
        user_id: user.id,
        title: g.title,
        structure: g.structure || null,
        explanation: g.explanation,
        jlpt_level: g.jlpt_level,
        examples: g.example_sentence
          ? [{ sentence: g.example_sentence, meaning: g.example_meaning || '' }]
          : [],
        nuance: g.nuance || null,
      }).select('id').single();

      if (inserted) {
        await supabase.from('srs_cards').insert({
          user_id: user.id,
          item_type: 'grammar',
          item_id: inserted.id,
          state: 'new',
          due: new Date().toISOString(),
          stability: 0,
          difficulty: 0,
        });
        results.grammar++;
      }
    }
  }

  return {
    success: true as const,
    results,
    message: `Đã lưu ${results.vocab} từ vựng, ${results.kanji} kanji, ${results.grammar} ngữ pháp mới. Cập nhật ${results.updated} mục đã có.`,
  };
}
