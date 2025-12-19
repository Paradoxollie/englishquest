"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PromoteAdminState = {
  error?: string;
  success?: string;
};

export async function promoteToAdminAction(
  prevState: PromoteAdminState,
  formData: FormData
): Promise<PromoteAdminState> {
  const username = formData.get("username")?.toString().trim().toLowerCase();

  if (!username) {
    return { error: "Le username est requis." };
  }

  // Utiliser le client admin pour contourner RLS
  const adminClient = createSupabaseAdminClient();

  // Trouver l'utilisateur
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
    return { error: `Aucun utilisateur trouvé avec le username "${username}".` };
  }

  // Mettre à jour le rôle
  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profile.id);

  if (updateError) {
    console.error("Error updating role:", updateError);
    return { error: "Erreur lors de la mise à jour du rôle." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/users");
  
  return { 
    success: `L'utilisateur "${profile.username}" a été promu admin avec succès !` 
  };
}


