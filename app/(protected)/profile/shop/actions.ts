"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCustomItemKey } from "@/lib/shop/visibility";
import type { EquipItemResult, ShopPurchaseResult } from "@/types/shop";

type PurchaseRpcResult = {
  success?: boolean;
  error?: string;
  newGold?: number;
};

function isMissingPurchaseRpc(error: { message?: string; code?: string } | null): boolean {
  if (!error) {
    return false;
  }

  return (
    error.code === "42883" ||
    error.message?.includes("purchase_shop_item") === true ||
    error.message?.includes("Could not find the function") === true
  );
}

export async function purchaseShopItemAction(
  shopItemId: string
): Promise<ShopPurchaseResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { data: shopItem, error: itemError } = await adminClient
      .from("shop_items")
      .select("*")
      .eq("id", shopItemId)
      .eq("is_active", true)
      .single();

    if (itemError || !shopItem) {
      return {
        success: false,
        error: "Item not found or not available",
      };
    }

    if (isCustomItemKey(shopItem.item_key)) {
      return {
        success: false,
        error: "Cet item personnalise n'est pas disponible a l'achat.",
      };
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("level, gold")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "Profile not found",
      };
    }

    const { data: existingItem } = await adminClient
      .from("user_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("shop_item_id", shopItemId)
      .maybeSingle();

    if (existingItem) {
      return {
        success: false,
        error: "Vous possedez deja cet item",
      };
    }

    if (profile.level < shopItem.required_level) {
      return {
        success: false,
        error: `Niveau ${shopItem.required_level} requis (vous etes niveau ${profile.level})`,
      };
    }

    if (profile.gold < shopItem.price_gold) {
      return {
        success: false,
        error: `Pas assez d'or. Necessaire: ${shopItem.price_gold}, Vous avez: ${profile.gold}`,
      };
    }

    const { data: rpcPurchase, error: rpcError } = await adminClient.rpc(
      "purchase_shop_item",
      {
        p_user_id: user.id,
        p_shop_item_id: shopItemId,
      }
    );

    if (!rpcError && rpcPurchase && typeof rpcPurchase === "object") {
      const purchaseResult = rpcPurchase as PurchaseRpcResult;

      if (purchaseResult.success) {
        return {
          success: true,
          newGold:
            typeof purchaseResult.newGold === "number"
              ? purchaseResult.newGold
              : profile.gold - shopItem.price_gold,
          purchasedItem: shopItem as any,
        };
      }

      if (purchaseResult.error) {
        return {
          success: false,
          error: purchaseResult.error,
        };
      }
    } else if (rpcError && !isMissingPurchaseRpc(rpcError)) {
      console.error("purchase_shop_item RPC failed:", rpcError);
      return {
        success: false,
        error: "Erreur lors de l'achat de l'item",
      };
    }

    const newGold = profile.gold - shopItem.price_gold;

    const { data: updatedProfiles, error: updateGoldError } = await adminClient
      .from("profiles")
      .update({
        gold: newGold,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("gold", profile.gold)
      .select("id");

    if (updateGoldError) {
      return {
        success: false,
        error: "Erreur lors de la mise a jour de l'or",
      };
    }

    if (!updatedProfiles?.length) {
      return {
        success: false,
        error: "Votre solde a change. Rechargez la page et recommencez.",
      };
    }

    const { error: insertItemError } = await adminClient.from("user_items").insert({
      user_id: user.id,
      shop_item_id: shopItemId,
      price_paid: shopItem.price_gold,
    });

    if (insertItemError) {
      await adminClient
        .from("profiles")
        .update({
          gold: profile.gold,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .eq("gold", newGold);

      return {
        success: false,
        error:
          insertItemError.code === "23505"
            ? "Vous possedez deja cet item."
            : "Erreur lors de l'achat de l'item",
      };
    }

    return {
      success: true,
      newGold,
      purchasedItem: shopItem as any,
    };
  } catch (error) {
    console.error("Error in purchaseShopItemAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

export async function equipItemAction(
  shopItemId: string | null,
  itemType: "avatar" | "title" | "background"
): Promise<EquipItemResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    if (shopItemId !== null && shopItemId !== undefined) {
      const { data: shopItem, error: shopItemError } = await adminClient
        .from("shop_items")
        .select("item_type, item_key, price_gold, is_active")
        .eq("id", shopItemId)
        .single();

      if (shopItemError || !shopItem) {
        return {
          success: false,
          error: "Item introuvable",
        };
      }

      if (!shopItem.is_active) {
        return {
          success: false,
          error: "Cet item n'est plus disponible",
        };
      }

      if (shopItem.item_type !== itemType) {
        return {
          success: false,
          error: "Type d'item incorrect",
        };
      }

      if (shopItem.price_gold > 0 || isCustomItemKey(shopItem.item_key)) {
        const { data: userItem, error: userItemError } = await adminClient
          .from("user_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("shop_item_id", shopItemId)
          .maybeSingle();

        if (userItemError) {
          return {
            success: false,
            error: "Impossible de verifier la possession de l'item",
          };
        }

        if (!userItem) {
          return {
            success: false,
            error: "Vous ne possedez pas cet item",
          };
        }
      }
    }

    const { data: equippedItems } = await adminClient
      .from("user_equipped_items")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const updateField =
      itemType === "avatar"
        ? "equipped_avatar_id"
        : itemType === "title"
          ? "equipped_title_id"
          : "equipped_background_id";

    const updateData: Record<string, string | null> = {
      [updateField]: shopItemId,
      updated_at: new Date().toISOString(),
    };

    if (equippedItems) {
      const { error: updateError } = await adminClient
        .from("user_equipped_items")
        .update(updateData)
        .eq("user_id", user.id);

      if (updateError) {
        return {
          success: false,
          error: `Erreur lors de l'equipement: ${updateError.message || "Erreur inconnue"}`,
        };
      }
    } else if (shopItemId !== null && shopItemId !== undefined) {
      const { error: insertError } = await adminClient
        .from("user_equipped_items")
        .insert({
          user_id: user.id,
          [updateField]: shopItemId,
        });

      if (insertError) {
        return {
          success: false,
          error: `Erreur lors de l'equipement: ${insertError.message || "Erreur inconnue"}`,
        };
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in equipItemAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}
