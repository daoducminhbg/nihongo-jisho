'use server';

import { createClient } from '@/lib/supabase/server';
import type { QueueSummary } from '../_types/flashcard.types';

export async function getQueueStats(): Promise<{
  success: boolean;
  stats: QueueSummary;
  error?: string;
}> {
  const defaultStats: QueueSummary = {
    dueCount: 0,
    newCount: 0,
    learningCount: 0,
    totalCards: 0,
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, stats: defaultStats, error: 'Chưa đăng nhập' };
    }

    const now = new Date().toISOString();

    // Due cards count
    const { count: dueCount } = await supabase
      .from('srs_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('state', ['learning', 'review', 'relearning'])
      .lte('due', now);

    // New cards count
    const { count: newCount } = await supabase
      .from('srs_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('state', 'new');

    // Learning cards count
    const { count: learningCount } = await supabase
      .from('srs_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('state', ['learning', 'relearning']);

    // Total cards count
    const { count: totalCards } = await supabase
      .from('srs_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return {
      success: true,
      stats: {
        dueCount: dueCount || 0,
        newCount: newCount || 0,
        learningCount: learningCount || 0,
        totalCards: totalCards || 0,
      },
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return {
      success: false,
      stats: defaultStats,
      error: error instanceof Error ? error.message : 'Lỗi lấy thống kê',
    };
  }
}
