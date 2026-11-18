import type { ShopItem } from "@/types/shop";

export const DEFAULT_CHARACTER_FACE = "/art/personnages/maya-visage.webp";
const SAM_FACE = "/art/personnages/sam-visage.webp";

type CharacterRank = Pick<ShopItem, "required_level" | "price_gold" | "display_order">;

export function compareCharacterProgression(a: CharacterRank, b: CharacterRank) {
  return a.required_level - b.required_level || a.price_gold - b.price_gold || a.display_order - b.display_order;
}

/** Les deux portraits imposés par l’ancienne boutique étaient gratuits. */
export function starterReplacementKey(itemKey?: string | null) {
  if (itemKey === "avatar_default") return "eq_depart_sam";
  if (itemKey === "avatar_d_faut_femme_1763206735902") return "eq_depart_maya";
  return null;
}

export function characterFaceUrl(item?: { item_key?: string | null; image_url?: string | null } | null): string {
  const replacement = starterReplacementKey(item?.item_key);
  if (replacement) return replacement === "eq_depart_sam" ? SAM_FACE : DEFAULT_CHARACTER_FACE;
  return item?.image_url || DEFAULT_CHARACTER_FACE;
}

/** Une illustration du catalogue a un second cadrage. Les imports de l’admin gardent leur propre image. */
export function characterSilhouetteUrl(imageUrl?: string | null): string | null {
  if (!imageUrl || !/^\/art\/personnages\/[a-z0-9-]+-visage\.webp$/.test(imageUrl)) return null;
  return imageUrl.replace(/-visage\.webp$/, "-silhouette.webp");
}
