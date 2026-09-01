'use server';

import { createClient } from '@/lib/supabase/server';
import type { ItemType } from '@/lib/constants';

export async function deleteDictionaryItem(itemType: ItemType, id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const tableMap: Record<ItemType, string> = {
      vocab: 'vocabularies',
      kanji: 'kanjis',
      grammar: 'grammars',
    };

    const tableName = tableMap[itemType];

    // Delete associated SRS card first
    await supabase
      .from('srs_cards')
      .delete()
      .eq('user_id', user.id)
      .eq('item_type', itemType)
      .eq('item_id', id);

    // Delete the item
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi xóa mục',
    };
  }
}
