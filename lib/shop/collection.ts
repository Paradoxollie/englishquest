import type { ShopItem } from "@/types/shop";
import { isCustomItemKey } from "./visibility";

export const COLLECTION_ALBUMS = [
  { key: "depart", name: "Les quais de Londres", cover: "/art/collection/decor-quais.webp", description: "Un carnet dans le sac, la Tamise pour point de départ." },
  { key: "enquete", name: "Le bureau des enquêtes", cover: "/art/collection/decor-archives.webp", description: "Rejoins Maya et Sam aux archives, sur la piste du prochain indice." },
  { key: "studio", name: "Studio Minuit", cover: "/art/collection/decor-studio.webp", description: "Quand Londres s’endort, l’équipe du studio prend l’antenne." },
  { key: "aurore", name: "Sous les aurores", cover: "/art/collection/decor-observatoire.webp", description: "Destination le grand Nord, entre ciel polaire et observatoire." },
] as const;

type Collectible = Pick<ShopItem, "id" | "item_key" | "price_gold" | "required_level" | "is_active" | "is_public" | "collection_key" | "is_collection_reward">;

export function isPublicShopItem(item: Pick<Collectible, "item_key" | "is_active" | "is_public">) {
  return item.is_active && item.is_public !== false && !isCustomItemKey(item.item_key);
}

function ownsPiece(item: Collectible, ownedIds: ReadonlySet<string>, level: number) {
  return ownedIds.has(item.id) || (item.price_gold === 0 && level >= item.required_level);
}

export function getAlbumProgress(items: readonly Collectible[], ownedIds: ReadonlySet<string>, level: number, key: string) {
  const pieces = items.filter(item => item.collection_key === key && !item.is_collection_reward && isPublicShopItem(item));
  const owned = pieces.filter(item => ownsPiece(item, ownedIds, level)).length;
  return { owned, total: pieces.length, complete: pieces.length > 0 && owned === pieces.length };
}

export function isCollectionItemAvailable(item: Collectible, items: readonly Collectible[], ownedIds: ReadonlySet<string>, level: number) {
  if (ownedIds.has(item.id)) return true;
  if (!isPublicShopItem(item) || level < item.required_level) return false;
  if (item.is_collection_reward) {
    return Boolean(item.collection_key && getAlbumProgress(items, ownedIds, level, item.collection_key).complete);
  }
  return item.price_gold === 0;
}
