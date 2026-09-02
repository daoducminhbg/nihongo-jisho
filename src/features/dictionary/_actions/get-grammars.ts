'use server';

import { createClient } from '@/lib/supabase/server';
import type { Grammar } from '@/types/database.types';

export interface GetGrammarsParams {
  jlpt?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getGrammars({
  jlpt,
  search,
  page = 1,
  limit = 50,
}: GetGrammarsParams = {}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Chưa đăng nhập', data: [], total: 0 };
    }

    let query = supabase
      .from('grammars')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (jlpt && jlpt !== 'ALL') {
      query = query.eq('jlpt_level', jlpt);
    }

    if (search && search.trim().length > 0) {
      const term = search.trim().replace(/[,%]/g, '');
      if (term.length > 0) {
        query = query.or(
          `title.ilike.%${term}%,structure.ilike.%${term}%,explanation.ilike.%${term}%`
        );
      }
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: (data as Grammar[]) || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching grammars:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi lấy dữ liệu ngữ pháp',
      data: [],
      total: 0,
    };
  }
}
