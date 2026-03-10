"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface UploadResult {
  success: boolean;
  error?: string;
  imageUrl?: string;
  itemId?: string;
}

export async function uploadCustomImageAction(
  file: File,
  itemType: "avatar" | "background"
): Promise<UploadResult> {
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

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format d'image non supporte. Utilisez JPG, PNG, WebP ou GIF.",
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "L'image est trop grande. Taille maximum: 5MB.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${itemType}_${Date.now()}.${fileExt}`;
    const filePath = `custom/${fileName}`;

    const { error: uploadError } = await supabase.storage
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

    const { data: urlData } = supabase.storage.from("custom-images").getPublicUrl(filePath);
    const imageUrl = urlData.publicUrl;

    const baseItemPayload = {
      item_type: itemType,
      name: itemType === "avatar" ? "Avatar personnalise" : "Background personnalise",
      description: "Element prive ajoute par l'utilisateur.",
      item_key: `custom_${itemType}_${user.id}_${Date.now()}`,
      price_gold: 0,
      required_level: 1,
      display_order: 9999,
      image_url: imageUrl,
      is_active: true,
    };

    let shopItem: any = null;
    let itemError: { message?: string } | null = null;

    ({ data: shopItem, error: itemError } = await adminClient
      .from("shop_items")
      .insert({
        ...baseItemPayload,
        owner_user_id: user.id,
        is_public: false,
      })
      .select()
      .single());

    if (
      itemError?.message?.includes("owner_user_id") ||
      itemError?.message?.includes("is_public")
    ) {
      ({ data: shopItem, error: itemError } = await adminClient
        .from("shop_items")
        .insert(baseItemPayload)
        .select()
        .single());
    }

    if (itemError || !shopItem) {
      await supabase.storage.from("custom-images").remove([filePath]);
      return {
        success: false,
        error: "Erreur lors de la creation de l'item",
      };
    }

    const { error: userItemError } = await adminClient.from("user_items").insert({
      user_id: user.id,
      shop_item_id: shopItem.id,
      price_paid: 0,
    });

    if (userItemError) {
      console.error("Error adding to user_items:", userItemError);
    }

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
    revalidatePath("/dashboard/shop");

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
