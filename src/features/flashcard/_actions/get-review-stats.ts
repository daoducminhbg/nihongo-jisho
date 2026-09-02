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

    const [dueResult, newResult, learningResult, totalResult] = await Promise.all([
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).in('state', ['learning', 'review', 'relearning']).lte('due', now),
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('state', 'new'),
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).in('state', ['learning', 'relearning']),
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    return {
      success: true,
      stats: {
        dueCount: dueResult.count || 0,
        newCount: newResult.count || 0,
        learningCount: learningResult.count || 0,
        totalCards: totalResult.count || 0,
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
