'use server';

import { createClient } from '@/lib/supabase/server';
import type { DeckConfig, FlashcardItem } from '../_types/flashcard.types';
import type { SRSCard, Vocabulary, Kanji, Grammar } from '@/types/database.types';

export async function getStudyCards(config: DeckConfig): Promise<{
  success: boolean;
  cards: FlashcardItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, cards: [], error: 'Chưa đăng nhập' };
    }

    let query = supabase
      .from('srs_cards')
      .select('*')
      .eq('user_id', user.id)
      .in('item_type', config.itemTypes);

    const now = new Date().toISOString();

    if (config.mode === 'due_only') {
      // Due review cards or learning cards
      query = query
        .in('state', ['learning', 'review', 'relearning'])
        .lte('due', now);
    } else if (config.mode === 'new_only') {
      // Only unstudied new cards
      query = query.eq('state', 'new');
    } else {
      // All cards that are due OR new
      query = query.or(`state.eq.new,and(due.lte.${now},state.in.(learning,review,relearning))`);
    }

    query = query.order('due', { ascending: true }).limit(config.limit || 30);

    const { data: srsData, error: srsError } = await query;
    if (srsError) throw srsError;

    const cards = (srsData as SRSCard[]) || [];
    if (cards.length === 0) {
      return { success: true, cards: [] };
    }

    // Split item_ids by type to fetch content
    const vocabIds = cards.filter((c) => c.item_type === 'vocab').map((c) => c.item_id);
    const kanjiIds = cards.filter((c) => c.item_type === 'kanji').map((c) => c.item_id);
    const grammarIds = cards.filter((c) => c.item_type === 'grammar').map((c) => c.item_id);

    const [vocabMap, kanjiMap, grammarMap] = await Promise.all([
      (async () => {
        if (vocabIds.length === 0) return new Map<string, Vocabulary>();
        let q = supabase.from('vocabularies').select('*').in('id', vocabIds);
        if (config.jlptLevels.length > 0) q = q.in('jlpt_level', config.jlptLevels);
        const { data } = await q;
        return new Map(((data as Vocabulary[]) || []).map(v => [v.id, v]));
      })(),
      (async () => {
        if (kanjiIds.length === 0) return new Map<string, Kanji>();
        let q = supabase.from('kanjis').select('*').in('id', kanjiIds);
        if (config.jlptLevels.length > 0) q = q.in('jlpt_level', config.jlptLevels);
        const { data } = await q;
        return new Map(((data as Kanji[]) || []).map(k => [k.id, k]));
      })(),
      (async () => {
        if (grammarIds.length === 0) return new Map<string, Grammar>();
        let q = supabase.from('grammars').select('*').in('id', grammarIds);
        if (config.jlptLevels.length > 0) q = q.in('jlpt_level', config.jlptLevels);
        const { data } = await q;
        return new Map(((data as Grammar[]) || []).map(g => [g.id, g]));
      })(),
    ]);

    // Assemble flashcard items
    const flashcardItems: FlashcardItem[] = [];

    for (const card of cards) {
      if (card.item_type === 'vocab') {
        const v = vocabMap.get(card.item_id);
        if (v) flashcardItems.push({ srsCard: card, itemType: 'vocab', vocab: v });
      } else if (card.item_type === 'kanji') {
        const k = kanjiMap.get(card.item_id);
        if (k) flashcardItems.push({ srsCard: card, itemType: 'kanji', kanji: k });
      } else if (card.item_type === 'grammar') {
        const g = grammarMap.get(card.item_id);
        if (g) flashcardItems.push({ srsCard: card, itemType: 'grammar', grammar: g });
      }
    }

    return {
      success: true,
      cards: flashcardItems,
    };
  } catch (error) {
    console.error('Error getting study cards:', error);
    return {
      success: false,
      cards: [],
      error: error instanceof Error ? error.message : 'Lỗi lấy thẻ ôn tập',
    };
  }
}
