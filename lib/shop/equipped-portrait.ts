import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getEquippedPortraitUrl(db: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await db.from("user_equipped_items")
    .select("equipped_avatar:shop_items!equipped_avatar_id(image_url)")
    .eq("user_id", userId).maybeSingle();
  const avatar = Array.isArray(data?.equipped_avatar) ? data.equipped_avatar[0] : data?.equipped_avatar;
  return avatar?.image_url ?? null;
}
