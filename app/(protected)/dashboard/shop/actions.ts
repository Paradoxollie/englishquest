"use server";

/**
 * Server Actions for managing shop items (admin only)
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { COLLECTION_ALBUMS } from "@/lib/shop/collection";
import { isCustomItemKey } from "@/lib/shop/visibility";
import { isAdmin } from "@/lib/auth/roles";
import { revalidatePath, updateTag } from "next/cache";
import type { ShopItem } from "@/types/shop";

function albumFromForm(form: FormData) {
  const key = form.get("collection_key");
  return COLLECTION_ALBUMS.find(album => album.key === key)?.key ?? null;
}

function refreshShop() {
  updateTag("shop-catalogue");
  revalidatePath("/dashboard/shop");
  revalidatePath("/profile");
  revalidatePath("/collection");
}

export interface ShopItemActionResult {
  success: boolean;
  error?: string;
  itemId?: string;
}

/**
 * Get all shop items for admin dashboard (bypasses RLS)
 */
export async function getShopItemsAction(
  itemType: "avatar" | "title" | "background" | "ship_skin"
): Promise<{ success: boolean; items?: ShopItem[]; error?: string }> {
  try {
    if (!(await isAdmin())) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const adminClient = createSupabaseAdminClient();
    const { data: items, error } = await adminClient
      .from("shop_items")
      .select("*")
      .eq("item_type", itemType)
      .order("is_public", { ascending: false })
      .order("display_order");

    if (error) {
      return {
        success: false,
        error: error.message || "Erreur lors du chargement",
      };
    }

    return {
      success: true,
      items: items as ShopItem[],
    };
  } catch (error) {
    console.error("Error in getShopItemsAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

/**
 * Upload an image for a shop item
 */
export async function uploadShopItemImageAction(
  itemId: string,
  file: File
): Promise<ShopItemActionResult> {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const adminClient = createSupabaseAdminClient();

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF.",
      };
    }

    // Validate file size (max 5MB for our app)
    const maxSize = 5 * 1024 * 1024; // 5MB (conservative limit)
    if (file.size > maxSize) {
      return {
        success: false,
        error: "L’image dépasse la limite de 5 Mo.",
      };
    }

    // Get the shop item to check it exists
    const { data: shopItem } = await adminClient
      .from("shop_items")
      .select("id, item_type")
      .eq("id", itemId)
      .single();

    if (!shopItem) {
      return {
        success: false,
        error: "Pièce introuvable.",
      };
    }

    // Titles don't need images
    if (shopItem.item_type === "title") {
      return {
        success: false,
        error: "Les titres ne nécessitent pas d'image",
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileExt = file.type.split("/")[1].replace("jpeg", "jpg");
    const fileName = `${shopItem.item_type}/${itemId}.${fileExt}`;
    const filePath = `shop-items/${fileName}`;

    const { error: uploadError } = await adminClient.storage
      .from("custom-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
        cacheControl: "3600", // Cache for 1 hour
      });

    if (uploadError) {
      console.error("Upload error details:", {
        message: uploadError.message,
        error: uploadError,
      });
      
      // Provide more specific error messages
      let errorMessage = uploadError.message || "Erreur inconnue";
      
      // Check for common Supabase limits
      if (errorMessage.includes("413") || errorMessage.includes("too large") || errorMessage.includes("File size")) {
        errorMessage = "Le fichier dépasse la limite de 5 Mo.";
      } else if (errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("too many")) {
        errorMessage = "Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.";
      } else if (errorMessage.includes("quota") || errorMessage.includes("storage")) {
        errorMessage = "Limite de stockage atteinte. Vérifiez votre quota Supabase.";
      } else if (errorMessage.includes("permission") || errorMessage.includes("policy") || errorMessage.includes("RLS")) {
        errorMessage = "Erreur de permissions. Vérifiez les politiques RLS dans Supabase.";
      }
      
      return {
        success: false,
        error: `Erreur lors de l'upload: ${errorMessage}`,
      };
    }


    // Get public URL using admin client with cache busting
    // Add timestamp to force cache refresh
    const { data: urlData } = adminClient.storage
      .from("custom-images")
      .getPublicUrl(filePath);

    // Add cache busting parameter to force browser/CDN to reload
    const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update shop item with image URL
    const { error: updateError } = await adminClient
      .from("shop_items")
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (updateError) {
      return {
        success: false,
        error: "La fiche de la pièce n’a pas pu être mise à jour.",
      };
    }

    refreshShop();

    return {
      success: true,
      itemId,
    };
  } catch (error) {
    console.error("Error in uploadShopItemImageAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

/**
 * Update a shop item
 */
export async function updateShopItemAction(
  formData: FormData
): Promise<ShopItemActionResult> {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const adminClient = createSupabaseAdminClient();

    const itemId = formData.get("itemId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceGold = parseInt(formData.get("price_gold") as string);
    const requiredLevel = parseInt(formData.get("required_level") as string);
    const displayOrder = parseInt(formData.get("display_order") as string);
    if (!name.trim() || !Number.isSafeInteger(priceGold) || priceGold < 0 || !Number.isSafeInteger(requiredLevel) || requiredLevel < 1 || !Number.isSafeInteger(displayOrder)) {
      return { success: false, error: "Vérifie le nom, le prix, le niveau et l’ordre d’affichage." };
    }
    const { data: existing } = await adminClient.from("shop_items").select("item_key, owner_user_id, is_collection_reward").eq("id", itemId).maybeSingle();
    if (!existing) return { success: false, error: "Pièce introuvable." };
    const editable = !existing.owner_user_id && !isCustomItemKey(existing.item_key);
    const album = editable && !existing.is_collection_reward && formData.has("collection_key") ? { collection_key: albumFromForm(formData) } : {};
    const visibility = editable && formData.has("shop_visibility") ? { is_public: formData.get("shop_visibility") === "public", is_active: true } : {};

    const { error } = await adminClient
      .from("shop_items")
      .update({
        name,
        description: description || null,
        price_gold: existing.is_collection_reward ? 0 : priceGold,
        required_level: existing.is_collection_reward ? 1 : requiredLevel,
        display_order: displayOrder,
        ...album,
        ...visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour",
      };
    }

    refreshShop();

    return {
      success: true,
      itemId,
    };
  } catch (error) {
    console.error("Error in updateShopItemAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

/**
 * Create a new shop item
 */
export async function createShopItemAction(
  formData: FormData
): Promise<ShopItemActionResult> {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const adminClient = createSupabaseAdminClient();

    const itemType = formData.get("item_type") as "avatar" | "title" | "background" | "ship_skin";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceGold = parseInt(formData.get("price_gold") as string);
    const requiredLevel = parseInt(formData.get("required_level") as string);

    if (!["avatar", "background", "ship_skin", "title"].includes(itemType) || !name.trim() || !Number.isSafeInteger(priceGold) || priceGold < 0 || !Number.isSafeInteger(requiredLevel) || requiredLevel < 1) {
      return { success: false, error: "Vérifie la catégorie, le nom, le prix et le niveau." };
    }
    // Generate unique item_key
    const itemKey = `${itemType}_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

    const { data: newItem, error } = await adminClient
      .from("shop_items")
      .insert({
        item_type: itemType,
        name,
        description: description || null,
        item_key: itemKey,
        price_gold: priceGold,
        required_level: requiredLevel,
        display_order: 9999,
        collection_key: albumFromForm(formData),
        is_public: formData.get("shop_visibility") !== "archive",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating shop item:", error);
      return {
        success: false,
        error: error.message || "Erreur lors de la création. Vérifiez que le script de migration a été exécuté.",
      };
    }

    refreshShop();

    return {
      success: true,
      itemId: newItem.id,
    };
  } catch (error) {
    console.error("Error in createShopItemAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

