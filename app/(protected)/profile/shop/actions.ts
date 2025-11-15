"use server";

/**
 * Server Actions for the Shop System
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShopPurchaseResult, EquipItemResult } from "@/types/shop";

/**
 * Purchase a shop item
 */
export async function purchaseShopItemAction(
  shopItemId: string
): Promise<ShopPurchaseResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();

    // Get current user
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

    // Get the shop item
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

    // Get user profile to check level and gold
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

    // Check if user already owns this item
    const { data: existingItem } = await adminClient
      .from("user_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("shop_item_id", shopItemId)
      .maybeSingle();

    if (existingItem) {
      return {
        success: false,
        error: "Vous possédez déjà cet item",
      };
    }

    // Check level requirement
    if (profile.level < shopItem.required_level) {
      return {
        success: false,
        error: `Niveau ${shopItem.required_level} requis (vous êtes niveau ${profile.level})`,
      };
    }

    // Check if user has enough gold
    if (profile.gold < shopItem.price_gold) {
      return {
        success: false,
        error: `Pas assez d'or. Nécessaire: ${shopItem.price_gold}, Vous avez: ${profile.gold}`,
      };
    }

    // Start transaction: deduct gold and add item
    const newGold = profile.gold - shopItem.price_gold;

    // Update user gold
    const { error: updateGoldError } = await adminClient
      .from("profiles")
      .update({
        gold: newGold,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateGoldError) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour de l'or",
      };
    }

    // Add item to user_items
    const { error: insertItemError } = await adminClient
      .from("user_items")
      .insert({
        user_id: user.id,
        shop_item_id: shopItemId,
        price_paid: shopItem.price_gold,
      });

    if (insertItemError) {
      // Rollback: restore gold
      await adminClient
        .from("profiles")
        .update({
          gold: profile.gold,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      return {
        success: false,
        error: "Erreur lors de l'achat de l'item",
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

/**
 * Equip an item (avatar, title, or background)
 */
export async function equipItemAction(
  shopItemId: string | null,
  itemType: "avatar" | "title" | "background"
): Promise<EquipItemResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();

    // Get current user
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

    // If equipping an item (not null), verify user owns it or it's free
    // If shopItemId is null, we're unequipping (setting to null)
    if (shopItemId !== null && shopItemId !== undefined) {
      // Check if item exists and get its details
      const { data: shopItem, error: shopItemError } = await adminClient
        .from("shop_items")
        .select("item_type, price_gold, is_active")
        .eq("id", shopItemId)
        .single();

      console.log("Shop item check:", { shopItem, shopItemError, shopItemId });

      if (shopItemError || !shopItem) {
        console.error("Shop item not found:", shopItemError);
        return {
          success: false,
          error: "Item introuvable",
        };
      }

      // Check if item is active
      if (!shopItem.is_active) {
        return {
          success: false,
          error: "Cet item n'est plus disponible",
        };
      }

      // Verify item type matches
      if (shopItem.item_type !== itemType) {
        console.error("Item type mismatch:", { shopItemType: shopItem.item_type, requestedType: itemType });
        return {
          success: false,
          error: "Type d'item incorrect",
        };
      }

      // If item is not free, verify user owns it
      if (shopItem.price_gold > 0) {
        const { data: userItem, error: userItemError } = await adminClient
          .from("user_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("shop_item_id", shopItemId)
          .maybeSingle();

        console.log("User item check:", { userItem, userItemError, userId: user.id, shopItemId });

        if (userItemError) {
          console.error("Error checking user item:", userItemError);
        }

        if (!userItem) {
          return {
            success: false,
            error: "Vous ne possédez pas cet item",
          };
        }
      } else {
        // Item is free - no need to check ownership, it's available to everyone
        console.log("Item is free, allowing equip:", shopItemId);
      }
    }

    // Get or create user_equipped_items
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

    // Prepare update data - shopItemId can be null to unequip
    const updateData: any = {
      [updateField]: shopItemId, // Can be null
      updated_at: new Date().toISOString(),
    };

    if (equippedItems) {
      // Update existing record
      const { error: updateError } = await adminClient
        .from("user_equipped_items")
        .update(updateData)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating equipped items:", updateError);
        return {
          success: false,
          error: `Erreur lors de l'équipement: ${updateError.message || "Erreur inconnue"}`,
        };
      }
      console.log("Successfully updated equipped item:", { updateField, shopItemId, isNull: shopItemId === null });
    } else {
      // Create new record only if we're equipping something (not null)
      if (shopItemId !== null && shopItemId !== undefined) {
        const insertData: any = {
          user_id: user.id,
          [updateField]: shopItemId,
        };

        const { error: insertError } = await adminClient
          .from("user_equipped_items")
          .insert(insertData);

        if (insertError) {
          console.error("Error inserting equipped items:", insertError);
          return {
            success: false,
            error: `Erreur lors de l'équipement: ${insertError.message || "Erreur inconnue"}`,
          };
        }
        console.log("Successfully created equipped item:", { updateField, shopItemId });
      } else {
        // Trying to unequip when nothing is equipped - this is fine, just return success
        console.log("Nothing to unequip, user has no equipped items");
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

