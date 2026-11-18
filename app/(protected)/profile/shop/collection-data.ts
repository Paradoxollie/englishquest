import "server-only";
import { isCustomItemKey } from "@/lib/shop/visibility";
import { starterReplacementKey } from "@/lib/shop/characters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShopItem, ShopItemType } from "@/types/shop";

export type Equipment = Record<ShopItemType, string | null>;

export interface ProfileCollection {
  items: ShopItem[];
  ownedIds: string[];
  equipment: Equipment;
  unavailable: boolean;
}

const fields = "id,item_key,item_type,name,description,image_url,color_theme,price_gold,required_level,display_order,is_active,is_public,collection_key,is_collection_reward,created_at,updated_at";

function joinedItem(value: ShopItem | ShopItem[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function loadProfileCollection(userId: string): Promise<ProfileCollection> {
  const db = createSupabaseAdminClient();
  const [catalogue, ownership, worn] = await Promise.all([
    db.from("shop_items").select(fields).eq("is_public", true).eq("is_active", true),
    db.from("user_items").select(`shop_item_id,item:shop_items(${fields})`).eq("user_id", userId),
    db.from("user_equipped_items").select(`
      avatar:shop_items!equipped_avatar_id(${fields}),
      background:shop_items!equipped_background_id(${fields}),
      title:shop_items!equipped_title_id(${fields}),
      ship_skin:shop_items!equipped_ship_skin_id(${fields})
    `).eq("user_id", userId).maybeSingle(),
  ]);
  const items = new Map<string, ShopItem>();
  const byKey = new Map<string, ShopItem>();
  for (const item of catalogue.data ?? []) {
    if (!isCustomItemKey(item.item_key)) {
      items.set(item.id, item);
      byKey.set(item.item_key, item);
    }
  }
  function currentEdition(item: ShopItem | null | undefined) {
    const replacement = starterReplacementKey(item?.item_key);
    return (replacement && byKey.get(replacement)) || item;
  }
  const ownedIds = new Set<string>();
  for (const row of ownership.data ?? []) {
    const item = currentEdition(joinedItem(row.item));
    if (item) {
      ownedIds.add(item.id);
      items.set(item.id, item);
    }
  }
  const equipment: Equipment = { avatar: null, background: null, title: null, ship_skin: null };
  for (const type of Object.keys(equipment) as ShopItemType[]) {
    const item = currentEdition(joinedItem(worn.data?.[type]));
    if (item) {
      equipment[type] = item.id;
      items.set(item.id, item);
    }
  }
  return {
    items: [...items.values()].sort((a, b) =>
      Number(Boolean(b.collection_key)) - Number(Boolean(a.collection_key)) ||
      a.display_order - b.display_order || a.name.localeCompare(b.name, "fr")
    ),
    ownedIds: [...ownedIds],
    equipment,
    unavailable: Boolean(catalogue.error || ownership.error || worn.error),
  };
}
