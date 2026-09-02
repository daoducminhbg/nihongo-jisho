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
    graduatedCount: 0,
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

    const [dueResult, newResult, learningResult, graduatedResult, totalResult] = await Promise.all([
      // 1. Thẻ ôn tập định kỳ đã tốt nghiệp và đến hạn hôm nay
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('state', 'review')
        .lte('due', now),
      // 2. Thẻ mới chưa học lần nào
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('state', 'new'),
      // 3. Thẻ đang học (chu kỳ ngắn 1m - 10m trong ngày)
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('state', ['learning', 'relearning']),
      // 4. Thẻ đã tốt nghiệp (đang ghi nhớ dài hạn, hẹn ngày mai hoặc xa hơn)
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('state', 'review')
        .gt('due', now),
      // 5. Tổng số thẻ trong kho
      supabase.from('srs_cards').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    return {
      success: true,
      stats: {
        dueCount: dueResult.count || 0,
        newCount: newResult.count || 0,
        learningCount: learningResult.count || 0,
        graduatedCount: graduatedResult.count || 0,
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
