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

    const now = new Date().toISOString();
    let cards: SRSCard[] = [];

    const baseQuery = () =>
      supabase
        .from('srs_cards')
        .select('*')
        .eq('user_id', user.id)
        .in('item_type', config.itemTypes);

    if (config.mode === 'all') {
      // Anki mode: Fetch Due reviews + New cards
      const newCardLimit =
        config.newLimit === 'all' ? 300 : (typeof config.newLimit === 'number' ? config.newLimit : (config.limit || 20));
      const reviewCardLimit =
        config.reviewLimit === 'all' ? 300 : (typeof config.reviewLimit === 'number' ? config.reviewLimit : 50);

      const [dueRes, newRes] = await Promise.all([
        baseQuery()
          .in('state', ['learning', 'review', 'relearning'])
          .lte('due', now)
          .order('due', { ascending: true })
          .limit(reviewCardLimit),
        newCardLimit > 0
          ? baseQuery()
              .eq('state', 'new')
              .order('created_at', { ascending: true })
              .limit(newCardLimit)
          : Promise.resolve({ data: [] as SRSCard[], error: null }),
      ]);

      if (dueRes.error) throw dueRes.error;
      if (newRes.error) throw newRes.error;

      // Anki queue order: Due reviews first, followed by New cards
      cards = [...((dueRes.data as SRSCard[]) || []), ...((newRes.data as SRSCard[]) || [])];
    } else if (config.mode === 'new_only') {
      // New cards only
      const newCardLimit =
        config.newLimit === 'all' ? 300 : (typeof config.newLimit === 'number' ? config.newLimit : (config.limit || 30));

      const { data, error } = await baseQuery()
        .eq('state', 'new')
        .order('created_at', { ascending: true })
        .limit(newCardLimit);

      if (error) throw error;
      cards = (data as SRSCard[]) || [];
    } else {
      // Due cards only
      const reviewCardLimit =
        config.reviewLimit === 'all' ? 300 : (typeof config.reviewLimit === 'number' ? config.reviewLimit : (config.limit || 50));

      const { data, error } = await baseQuery()
        .in('state', ['learning', 'review', 'relearning'])
        .lte('due', now)
        .order('due', { ascending: true })
        .limit(reviewCardLimit);

      if (error) throw error;
      cards = (data as SRSCard[]) || [];
    }

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
