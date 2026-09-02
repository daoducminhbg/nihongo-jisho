'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateAnkiSchedule, formatInterval } from '../_lib/fsrs-engine';
import type { SRSCard } from '@/types/database.types';

export async function submitCardReview(
  cardId: string,
  rating: 1 | 2 | 3 | 4
): Promise<{
  success: boolean;
  card?: SRSCard;
  nextDue?: string;
  nextInterval?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    // Fetch existing card
    const { data: dbCard, error: fetchError } = await supabase
      .from('srs_cards')
      .select('*')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !dbCard) {
      return { success: false, error: 'Không tìm thấy thẻ học' };
    }

    const now = new Date();
    // Calculate new schedule using Anki SM-2 Github formula
    const updated = calculateAnkiSchedule(dbCard as SRSCard, rating, now);

    // Persist updated Anki card to database (only existing columns)
    const { error: updateError } = await supabase
      .from('srs_cards')
      .update({
        due: updated.due,
        stability: updated.stability,
        difficulty: updated.difficulty,
        elapsed_days: updated.elapsed_days,
        scheduled_days: updated.scheduled_days,
        reps: updated.reps,
        lapses: updated.lapses,
        state: updated.state,
        last_review: now.toISOString(),
      })
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating srs_cards row:', updateError);
      throw updateError;
    }

    const updatedDbCard: SRSCard = {
      ...(dbCard as SRSCard),
      due: updated.due,
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsed_days: updated.elapsed_days,
      scheduled_days: updated.scheduled_days,
      reps: updated.reps,
      lapses: updated.lapses,
      state: updated.state,
      last_review: now.toISOString(),
    };

    return {
      success: true,
      card: updatedDbCard,
      nextDue: updated.due,
      nextInterval: formatInterval(updated.due, now),
    };
  } catch (error) {
    console.error('Error submitting card review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi cập nhật tiến trình học',
    };
  }
}
