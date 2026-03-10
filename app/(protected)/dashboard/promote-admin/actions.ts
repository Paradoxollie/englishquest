"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PromoteAdminState = {
  error?: string;
  success?: string;
};

export async function promoteToAdminAction(
  prevState: PromoteAdminState,
  formData: FormData
): Promise<PromoteAdminState> {
  const canManageAdmins = await isAdmin();

  if (!canManageAdmins) {
    return { error: "Acces refuse. Seuls les admins peuvent promouvoir un utilisateur." };
  }

  const username = formData.get("username")?.toString().trim().toLowerCase();

  if (!username) {
    return { error: "Le username est requis." };
  }

  const adminClient = createSupabaseAdminClient();

  const { data: profile, error: findError } = await adminClient
    .from("profiles")
    .select("id, username, role")
    .ilike("username", username)
    .maybeSingle();

  if (findError) {
    console.error("Error finding user:", findError);
    return { error: "Erreur lors de la recherche de l'utilisateur." };
  }

  if (!profile) {
    return { error: `Aucun utilisateur trouve avec le username "${username}".` };
  }

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Error updating role:", updateError);
    return { error: "Erreur lors de la mise a jour du role." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");

  return {
    success: `L'utilisateur "${profile.username}" a ete promu admin avec succes.`,
  };
}
