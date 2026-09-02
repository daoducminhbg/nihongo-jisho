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

    const now = new Date();
    const nowStr = now.toISOString();

    // In Anki, cards in the intraday learning queue for today (1m - 10m steps)
    // belong to today's study session until next morning.
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);
    const endOfTodayStr = endOfToday.toISOString();

    let cards: SRSCard[] = [];

    const baseQuery = () =>
      supabase
        .from('srs_cards')
        .select('*')
        .eq('user_id', user.id)
        .in('item_type', config.itemTypes);

    if (config.mode === 'all') {
      // Anki mode: Fetch Due reviews + Intraday learning cards + New cards
      const newCardLimit =
        config.newLimit === 'all' ? 300 : (typeof config.newLimit === 'number' ? config.newLimit : (config.limit || 20));
      const reviewCardLimit =
        config.reviewLimit === 'all' ? 300 : (typeof config.reviewLimit === 'number' ? config.reviewLimit : 50);

      const [dueReviewsRes, learningRes, newRes] = await Promise.all([
        // 1. Due reviews: Graduated cards due today or earlier
        baseQuery()
          .eq('state', 'review')
          .lte('due', nowStr)
          .order('due', { ascending: true })
          .limit(reviewCardLimit),
        // 2. Intraday learning cards: Cards in 1m/10m steps for today
        baseQuery()
          .in('state', ['learning', 'relearning'])
          .lte('due', endOfTodayStr)
          .order('due', { ascending: true })
          .limit(100),
        // 3. New cards
        newCardLimit > 0
          ? baseQuery()
              .eq('state', 'new')
              .order('created_at', { ascending: true })
              .limit(newCardLimit)
          : Promise.resolve({ data: [] as SRSCard[], error: null }),
      ]);

      if (dueReviewsRes.error) throw dueReviewsRes.error;
      if (learningRes.error) throw learningRes.error;
      if (newRes.error) throw newRes.error;

      // Anki queue priority: Due reviews + Intraday learning + New cards
      cards = [
        ...((dueReviewsRes.data as SRSCard[]) || []),
        ...((learningRes.data as SRSCard[]) || []),
        ...((newRes.data as SRSCard[]) || []),
      ];
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
      // Due & Learning cards only
      const reviewCardLimit =
        config.reviewLimit === 'all' ? 300 : (typeof config.reviewLimit === 'number' ? config.reviewLimit : (config.limit || 50));

      const [dueReviewsRes, learningRes] = await Promise.all([
        baseQuery()
          .eq('state', 'review')
          .lte('due', nowStr)
          .order('due', { ascending: true })
          .limit(reviewCardLimit),
        baseQuery()
          .in('state', ['learning', 'relearning'])
          .lte('due', endOfTodayStr)
          .order('due', { ascending: true })
          .limit(100),
      ]);

      if (dueReviewsRes.error) throw dueReviewsRes.error;
      if (learningRes.error) throw learningRes.error;

      cards = [
        ...((dueReviewsRes.data as SRSCard[]) || []),
        ...((learningRes.data as SRSCard[]) || []),
      ];
    }

    if (cards.length === 0) {
      return { success: true, cards: [] };
    }

    // Split item_ids by type to fetch content
    const vocabIds = cards.filter((c) => c.item_type === 'vocab').map((c) => c.item_id);
    const kanjiIds = cards.filter((c) => c.item_type === 'kanji').map((c) => c.item_id);
    const grammarIds = cards.filter((c) => c.item_type === 'grammar').map((c) => c.item_id);

    const isAllJlpt = !config.jlptLevels || config.jlptLevels.length >= 5 || config.jlptLevels.length === 0;

    const [vocabMap, kanjiMap, grammarMap] = await Promise.all([
      (async () => {
        if (vocabIds.length === 0) return new Map<string, Vocabulary>();
        let q = supabase.from('vocabularies').select('*').in('id', vocabIds);
        if (!isAllJlpt) q = q.in('jlpt_level', config.jlptLevels);
        const { data } = await q;
        return new Map(((data as Vocabulary[]) || []).map(v => [v.id, v]));
      })(),
      (async () => {
        if (kanjiIds.length === 0) return new Map<string, Kanji>();
        let q = supabase.from('kanjis').select('*').in('id', kanjiIds);
        if (!isAllJlpt) q = q.in('jlpt_level', config.jlptLevels);
        const { data } = await q;
        return new Map(((data as Kanji[]) || []).map(k => [k.id, k]));
      })(),
      (async () => {
        if (grammarIds.length === 0) return new Map<string, Grammar>();
        let q = supabase.from('grammars').select('*').in('id', grammarIds);
        if (!isAllJlpt) q = q.in('jlpt_level', config.jlptLevels);
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
