import type { ShopItem } from "@/types/shop";

export const CUSTOM_ITEM_KEY_PREFIX = "custom_";

export function isCustomItemKey(itemKey: string | null | undefined): boolean {
  return Boolean(itemKey?.startsWith(CUSTOM_ITEM_KEY_PREFIX));
}

/** Les tenues officielles archivées peuvent toujours être portées en classement. */
export function leaderboardItem(relation: ShopItem | ShopItem[] | null | undefined): ShopItem | null {
  const item = Array.isArray(relation) ? relation[0] : relation;
  return item && !item.owner_user_id && !isCustomItemKey(item.item_key) ? item : null;
}
