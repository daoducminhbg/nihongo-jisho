'use server';

import { createClient } from '@/lib/supabase/server';
import {
  toFSRSCard,
  fromFSRSState,
  calculateNextSchedule,
  formatInterval,
  Rating,
  type Grade,
} from '../_lib/fsrs-engine';
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

    const fsrsCard = toFSRSCard(dbCard as SRSCard);
    const now = new Date();
    const scheduling = calculateNextSchedule(fsrsCard, now);

    // Map rating number (1-4) to Grade
    const gradeMap: Record<number, Grade> = {
      1: Rating.Again as Grade,
      2: Rating.Hard as Grade,
      3: Rating.Good as Grade,
      4: Rating.Easy as Grade,
    };

    const nextSchedule = scheduling[gradeMap[rating]];
    const updatedCard = nextSchedule.card;

    // Persist updated FSRS card to database
    const { error: updateError } = await supabase
      .from('srs_cards')
      .update({
        due: updatedCard.due.toISOString(),
        stability: updatedCard.stability,
        difficulty: updatedCard.difficulty,
        elapsed_days: updatedCard.elapsed_days,
        scheduled_days: updatedCard.scheduled_days,
        reps: updatedCard.reps,
        lapses: updatedCard.lapses,
        learning_steps: updatedCard.learning_steps,
        state: fromFSRSState(updatedCard.state),
        last_review: now.toISOString(),
      })
      .eq('id', cardId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    const updatedDbCard: SRSCard = {
      ...(dbCard as SRSCard),
      due: updatedCard.due.toISOString(),
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      elapsed_days: updatedCard.elapsed_days,
      scheduled_days: updatedCard.scheduled_days,
      reps: updatedCard.reps,
      lapses: updatedCard.lapses,
      learning_steps: updatedCard.learning_steps,
      state: fromFSRSState(updatedCard.state),
      last_review: now.toISOString(),
    };

    return {
      success: true,
      card: updatedDbCard,
      nextDue: updatedCard.due.toISOString(),
      nextInterval: formatInterval(updatedCard.due, now),
    };
  } catch (error) {
    console.error('Error submitting card review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi cập nhật tiến trình học',
    };
  }
}
