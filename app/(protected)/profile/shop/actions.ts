"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EquipItemResult, ShopItemType, ShopPurchaseResult } from "@/types/shop";

async function currentUserId() {
  const client = await createSupabaseServerClient();
  const { data } = await client.auth.getUser();
  return data.user?.id;
}

export async function purchaseShopItemAction(shopItemId: string): Promise<ShopPurchaseResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { success: false, error: "Connecte-toi pour acheter cette pièce." };

    const { data, error } = await createSupabaseAdminClient().rpc("purchase_shop_item", {
      p_user_id: userId, p_shop_item_id: shopItemId,
    });
    if (error || !data) {
      console.error("Achat de collection indisponible", error?.code);
      return { success: false, error: "L’achat n’a pas pu être confirmé. Tu peux réessayer." };
    }
    const receipt: ShopPurchaseResult = data;
    if (receipt.success) revalidatePath("/profile");
    return receipt;
  } catch {
    return { success: false, error: "Impossible de confirmer l’achat pour le moment. Tu peux réessayer." };
  }
}

export async function equipItemAction(shopItemId: string | null, itemType: ShopItemType): Promise<EquipItemResult> {
  try {
    const userId = await currentUserId();
    if (!userId) return { success: false, error: "Connecte-toi pour modifier ta tenue." };
    const { data, error } = await createSupabaseAdminClient().rpc("equip_shop_item", {
      p_user_id: userId, p_shop_item_id: shopItemId, p_item_type: itemType,
    });
    if (error || !data) {
      console.error("Équipement de collection indisponible", error?.code);
      return { success: false, error: "L’équipement n’a pas pu être confirmé. Tu peux réessayer." };
    }
    const receipt: EquipItemResult = data;
    if (receipt.success) revalidatePath("/profile");
    return receipt;
  } catch {
    return { success: false, error: "Impossible de confirmer ce changement pour le moment. Tu peux réessayer." };
  }
}
