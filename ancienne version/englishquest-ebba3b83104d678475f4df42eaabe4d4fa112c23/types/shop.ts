/**
 * Types for the shop system (avatars, titles, backgrounds)
 */

export type ShopItemType = "avatar" | "title" | "background";

export interface ShopItem {
  id: string;
  item_type: ShopItemType;
  name: string;
  description: string | null;
  item_key: string;
  price_gold: number;
  required_level: number;
  display_order: number;
  image_url: string | null;
  color_theme: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserItem {
  id: string;
  user_id: string;
  shop_item_id: string;
  purchased_at: string;
  price_paid: number;
  shop_item?: ShopItem; // Joined data
}

export interface UserEquippedItems {
  user_id: string;
  equipped_avatar_id: string | null;
  equipped_title_id: string | null;
  equipped_background_id: string | null;
  updated_at: string;
  // Joined data
  equipped_avatar?: ShopItem | null;
  equipped_title?: ShopItem | null;
  equipped_background?: ShopItem | null;
}

export interface ShopPurchaseResult {
  success: boolean;
  error?: string;
  newGold?: number;
  purchasedItem?: ShopItem;
}

export interface EquipItemResult {
  success: boolean;
  error?: string;
}

