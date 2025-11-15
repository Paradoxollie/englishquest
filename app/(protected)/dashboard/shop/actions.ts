"use server";

/**
 * Server Actions for managing shop items (admin only)
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

export interface ShopItemActionResult {
  success: boolean;
  error?: string;
  itemId?: string;
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
    const supabase = await createSupabaseServerClient();

    console.log("Upload action called - Item ID:", itemId, "File type:", file.type, "File size:", file.size);

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF.",
      };
    }

    // Validate file size (max 5MB for our app, but Supabase free tier allows 50MB)
    const maxSize = 5 * 1024 * 1024; // 5MB (conservative limit)
    if (file.size > maxSize) {
      return {
        success: false,
        error: "L'image est trop grande. Taille maximum: 5MB. (Supabase permet jusqu'à 50MB sur le plan gratuit, mais nous limitons à 5MB pour optimiser les performances)",
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
        error: "Item introuvable",
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
    const fileExt = file.name.split(".").pop();
    const fileName = `${shopItem.item_type}/${itemId}.${fileExt}`;
    const filePath = `shop-items/${fileName}`;

    // Upload to Supabase Storage using admin client to bypass RLS
    console.log("Uploading to path:", filePath, "Size:", buffer.length, "bytes");
    
    // Try to delete existing file first if it exists (to avoid conflicts and save space)
    try {
      const { error: deleteError } = await adminClient.storage
        .from("custom-images")
        .remove([filePath]);
      if (deleteError) {
        // Ignore errors if file doesn't exist - this is normal
        console.log("No existing file to delete (this is OK)");
      } else {
        console.log("Deleted existing file before upload");
      }
    } catch (deleteError) {
      // Ignore errors - file might not exist
      console.log("Delete attempt completed (file may not have existed)");
    }
    
    const { data: uploadData, error: uploadError } = await adminClient.storage
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
        statusCode: (uploadError as any).statusCode,
      });
      
      // Provide more specific error messages
      let errorMessage = uploadError.message || "Erreur inconnue";
      
      // Check for common Supabase limits
      if (errorMessage.includes("413") || errorMessage.includes("too large") || errorMessage.includes("File size")) {
        errorMessage = "Le fichier est trop volumineux. Limite : 50 Mo (plan gratuit) ou 500 Go (plan Pro).";
      } else if (errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("too many")) {
        errorMessage = "Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.";
      } else if (errorMessage.includes("quota") || errorMessage.includes("storage")) {
        errorMessage = "Limite de stockage atteinte. Vérifiez votre quota Supabase (1 Go sur le plan gratuit).";
      } else if (errorMessage.includes("permission") || errorMessage.includes("policy") || errorMessage.includes("RLS")) {
        errorMessage = "Erreur de permissions. Vérifiez les politiques RLS dans Supabase.";
      }
      
      return {
        success: false,
        error: `Erreur lors de l'upload: ${errorMessage}`,
      };
    }

    console.log("Upload successful:", uploadData);

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
        error: "Erreur lors de la mise à jour de l'item",
      };
    }

    revalidatePath("/dashboard/shop");
    revalidatePath("/profile");

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

    const { error } = await adminClient
      .from("shop_items")
      .update({
        name,
        description: description || null,
        price_gold: priceGold,
        required_level: requiredLevel,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) {
      return {
        success: false,
        error: "Erreur lors de la mise à jour",
      };
    }

    revalidatePath("/dashboard/shop");
    revalidatePath("/profile");

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

    const itemType = formData.get("item_type") as "avatar" | "title" | "background";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceGold = parseInt(formData.get("price_gold") as string);
    const requiredLevel = parseInt(formData.get("required_level") as string);

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
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: "Erreur lors de la création",
      };
    }

    revalidatePath("/dashboard/shop");
    revalidatePath("/profile");

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

