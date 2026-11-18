import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicRewardPreviews, type RewardPreview } from "./reward-preview";

export async function getHomeCollectionChoices(userId: string) {
  const db = await createSupabaseServerClient();
  const [catalog, inventory] = await Promise.all([
    publicRewardPreviews(db).gt("price_gold", 0).not("image_url", "is", null),
    db.from("user_items").select("shop_item_id").eq("user_id", userId),
  ]);
  if (catalog.error || inventory.error) return null;
  return {
    items: (catalog.data ?? []) as RewardPreview[],
    ownedIds: new Set((inventory.data ?? []).map((row) => row.shop_item_id as string)),
  };
}
