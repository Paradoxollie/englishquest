import type { ShopItem, UserItem } from "@/types/shop";

export const CUSTOM_ITEM_KEY_PREFIX = "custom_";

export function isCustomItemKey(itemKey: string | null | undefined): boolean {
  return Boolean(itemKey?.startsWith(CUSTOM_ITEM_KEY_PREFIX));
}

export function isCustomShopItem(
  item: Pick<ShopItem, "item_key"> | null | undefined
): boolean {
  return isCustomItemKey(item?.item_key);
}

export function canAutoGrantShopItem(
  item: Pick<ShopItem, "item_key" | "price_gold"> | null | undefined
): boolean {
  if (!item) {
    return false;
  }

  return item.price_gold === 0 && !isCustomItemKey(item.item_key);
}

export function buildOwnedItemIdSet(
  userItems: Array<Pick<UserItem, "shop_item_id">>
): Set<string> {
  return new Set(userItems.map((item) => item.shop_item_id).filter(Boolean));
}

export function filterVisibleShopItems<T extends Pick<ShopItem, "id" | "item_key">>(
  items: T[],
  ownedItemIds: Set<string>
): T[] {
  return items.filter((item) => !isCustomItemKey(item.item_key) || ownedItemIds.has(item.id));
}
