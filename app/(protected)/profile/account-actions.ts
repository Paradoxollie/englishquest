"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteAccountState = { error?: string };

const USER_TABLES = [
  "game_scores",
  "user_course_progress",
  "user_items",
  "user_equipped_items",
  "chapter_exams",
  "contact_messages",
  "site_visits",
] as const;

/**
 * Supprime définitivement le compte du joueur connecté : ses scores, sa
 * progression, ses objets, ses images, son profil, puis l'utilisateur lui-même.
 * Demandé par le RGPD (droit à l'effacement) et par la politique AdSense.
 */
export async function deleteOwnAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const confirmation = formData.get("confirmation");
  if (confirmation !== "SUPPRIMER") {
    return { error: "Écris SUPPRIMER en majuscules pour confirmer." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const admin = createSupabaseAdminClient();

  try {
    // Images envoyées par le joueur (bucket custom-images, dossier custom/<id>/).
    const { data: files } = await admin.storage.from("custom-images").list(`custom/${user.id}`);
    if (files && files.length > 0) {
      await admin.storage.from("custom-images").remove(files.map((file) => `custom/${user.id}/${file.name}`));
    }
  } catch (error) {
    console.error("deleteOwnAccount storage", error);
  }

  for (const table of USER_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    // 42P01 : table absente. 42703 : pas de colonne user_id. Dans les deux cas, rien à effacer.
    if (error && !["42P01", "42703"].includes(error.code)) {
      console.error(`deleteOwnAccount ${table}`, error);
    }
  }

  const { error: profileError } = await admin.from("profiles").delete().eq("id", user.id);
  if (profileError) {
    console.error("deleteOwnAccount profiles", profileError);
    return { error: "La suppression n'a pas abouti. Réessaie, ou écris-nous depuis la page Contact." };
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id);
  if (authError) {
    console.error("deleteOwnAccount auth", authError);
    return { error: "Le profil est effacé mais le compte de connexion résiste. Écris-nous, on termine à la main." };
  }

  await supabase.auth.signOut();
  redirect("/?compte=supprime");
}
