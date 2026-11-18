import type { SupabaseClient } from "@supabase/supabase-js";
import { getLevelFromXP, XP_PER_LEVEL } from "@/lib/profile/economy";
import { formatGold } from "./format-gold";
import type { ShopItem } from "@/types/shop";

export type RewardPreview = Pick<ShopItem,
  "id" | "item_key" | "item_type" | "name" | "image_url" | "price_gold" | "required_level" | "display_order" | "collection_key"
>;

export function publicRewardPreviews(db: SupabaseClient) {
  return db.from("shop_items")
    .select("id, item_key, item_type, name, image_url, price_gold, required_level, display_order, collection_key")
    .eq("is_active", true).eq("is_public", true)
    .not("collection_key", "is", null).eq("is_collection_reward", false);
}

export function wardrobeItemHref(itemKey: string) {
  return `/profile?objet=${encodeURIComponent(itemKey)}#boutique`;
}

/** Un objet à portée du joueur, puis un objectif d'épargne ou de niveau. */
export function chooseRewardGoal(items: RewardPreview[], owned: ReadonlySet<string>, level: number, gold: number) {
  const unseen = items.filter((item) => item.image_url && item.price_gold > 0 && !owned.has(item.id));
  const byPrice = (a: RewardPreview, b: RewardPreview) => a.price_gold - b.price_gold || a.display_order - b.display_order;
  const unlocked = unseen.filter((item) => item.required_level <= level).sort(byPrice);
  const affordable = unlocked.filter((item) => item.price_gold <= gold);
  if (affordable.length) {
    return affordable.sort((a, b) => b.required_level - a.required_level || byPrice(a, b))[0];
  }
  return unlocked[0] ?? unseen.sort((a, b) => a.required_level - b.required_level || byPrice(a, b))[0] ?? null;
}

export function describeRewardGoal(item: RewardPreview, level: number, xp: number, gold: number) {
  const needsLevel = level < item.required_level;
  const missingGold = Math.max(0, item.price_gold - gold);
  // Le vestiaire fait foi si le niveau a été attribué manuellement.
  if (needsLevel && level !== getLevelFromXP(xp)) {
    return missingGold
      ? `Niveau ${item.required_level} requis. Il te manque aussi ${formatGold(missingGold)}.`
      : `Cet objet se débloque au niveau ${item.required_level}.`;
  }
  const missingXp = needsLevel ? Math.max(0, (item.required_level - 1) * XP_PER_LEVEL - xp) : 0;
  const needed = [
    missingXp > 0 && `${missingXp.toLocaleString("fr-FR")} XP`,
    missingGold > 0 && formatGold(missingGold),
  ].filter(Boolean).join(" et ");
  return needed ? `Encore ${needed} pour cet objet.` : "Tu peux l’acquérir dès maintenant.";
}

/** Un titre offert est un déblocage immédiat, même avec une bourse vide. */
export function chooseLevelUnlock(items: RewardPreview[]) {
  return items.find((item) => item.item_type === "title" && item.price_gold === 0)
    ?? items.find((item) => item.image_url)
    ?? items[0]
    ?? null;
}
