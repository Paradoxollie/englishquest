"use server";

/**
 * Server Actions for uploading custom images
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface UploadResult {
  success: boolean;
  error?: string;
  imageUrl?: string;
  itemId?: string;
}

/**
 * Upload a custom avatar or background image
 */
export async function uploadCustomImageAction(
  file: File,
  itemType: "avatar" | "background"
): Promise<UploadResult> {
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

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format d'image non supporté. Utilisez JPG, PNG, WebP ou GIF.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "L'image est trop grande. Taille maximum: 5MB.",
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${itemType}_${Date.now()}.${fileExt}`;
    const filePath = `custom/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("custom-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Erreur lors de l'upload de l'image",
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("custom-images")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Create shop item for the custom image
    const { data: shopItem, error: itemError } = await adminClient
      .from("shop_items")
      .insert({
        item_type: itemType,
        name: `Personnalisé - ${itemType === "avatar" ? "Avatar" : "Background"}`,
        description: "Image personnalisée",
        item_key: `custom_${itemType}_${user.id}_${Date.now()}`,
        price_gold: 0,
        required_level: 1,
        display_order: 9999,
        image_url: imageUrl,
        is_active: true,
      })
      .select()
      .single();

    if (itemError || !shopItem) {
      // Delete uploaded file if item creation fails
      await supabase.storage.from("custom-images").remove([filePath]);
      return {
        success: false,
        error: "Erreur lors de la création de l'item",
      };
    }

    // Add to user_items (free item)
    const { error: userItemError } = await adminClient
      .from("user_items")
      .insert({
        user_id: user.id,
        shop_item_id: shopItem.id,
        price_paid: 0,
      });

    if (userItemError) {
      console.error("Error adding to user_items:", userItemError);
      // Don't fail, item is still created
    }

    // Auto-equip the new item
    const { data: equippedItems } = await adminClient
      .from("user_equipped_items")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const updateField =
      itemType === "avatar" ? "equipped_avatar_id" : "equipped_background_id";

    if (equippedItems) {
      await adminClient
        .from("user_equipped_items")
        .update({
          [updateField]: shopItem.id,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      await adminClient.from("user_equipped_items").insert({
        user_id: user.id,
        [updateField]: shopItem.id,
      });
    }

    revalidatePath("/profile");

    return {
      success: true,
      imageUrl,
      itemId: shopItem.id,
    };
  } catch (error) {
    console.error("Error in uploadCustomImageAction:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite",
    };
  }
}

