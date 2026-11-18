import type { ShopItem } from "@/types/shop";
import { characterFaceUrl } from "./characters";

export const CUSTOM_ITEM_KEY_PREFIX = "custom_";

export function isCustomItemKey(itemKey: string | null | undefined): boolean {
  return Boolean(itemKey?.startsWith(CUSTOM_ITEM_KEY_PREFIX));
}

/** Les objets officiels archivés restent visibles quand un joueur les porte. */
export function leaderboardItem(relation: ShopItem | ShopItem[] | null | undefined): ShopItem | null {
  const item = Array.isArray(relation) ? relation[0] : relation;
  if (!item || item.owner_user_id || isCustomItemKey(item.item_key)) return null;
  if (item.item_type === "avatar") {
    const face = characterFaceUrl(item);
    if (face !== item.image_url) return { ...item, image_url: face };
  }
  return item;
}
