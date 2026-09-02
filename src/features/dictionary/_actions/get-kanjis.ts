'use server';

import { createClient } from '@/lib/supabase/server';
import type { Kanji } from '@/types/database.types';

export interface GetKanjisParams {
  jlpt?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getKanjis({
  jlpt,
  search,
  page = 1,
  limit = 50,
}: GetKanjisParams = {}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Chưa đăng nhập', data: [], total: 0 };
    }

    let query = supabase
      .from('kanjis')
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
          `character.ilike.%${term}%,han_viet.ilike.%${term}%,meaning.ilike.%${term}%,onyomi.ilike.%${term}%,kunyomi.ilike.%${term}%`
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
      data: (data as Kanji[]) || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching kanjis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi lấy dữ liệu kanji',
      data: [],
      total: 0,
    };
  }
}
