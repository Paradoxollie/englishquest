"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import type { ProfileRole } from "@/types/profile";

export type UpdateRoleState = {
  error?: string;
  success?: string;
};

export type UpdateStatsState = {
  error?: string;
  success?: string;
};

export type DeleteUserState = {
  error?: string;
  success?: string;
};

export async function updateUserRoleAction(
  prevState: UpdateRoleState,
  formData: FormData
): Promise<UpdateRoleState> {
  // Vérifier que l'utilisateur actuel est admin
  if (!(await isAdmin())) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  const userId = formData.get("userId")?.toString();
  const newRole = formData.get("newRole")?.toString();

  if (!userId || !newRole) {
    return { error: "Données manquantes." };
  }

  // Valider que le rôle est valide
  const validRoles: ProfileRole[] = ["student", "teacher", "admin"];
  if (!validRoles.includes(newRole as ProfileRole)) {
    return { error: "Rôle invalide." };
  }

  // Empêcher un utilisateur de se retirer lui-même le rôle admin
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === userId && newRole !== "admin") {
    // Vérifier si l'utilisateur est actuellement admin
    const adminClient = createSupabaseAdminClient();
    const { data: currentProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (currentProfile?.role === "admin") {
      return {
        error: "Vous ne pouvez pas retirer votre propre rôle admin. Demandez à un autre admin de le faire.",
      };
    }
  }

  // Mettre à jour le rôle avec le client admin
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role: newRole as ProfileRole })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return { error: "Erreur lors de la mise à jour du rôle." };
  }

  revalidatePath("/dashboard/users");
  return { success: `Rôle mis à jour avec succès : ${newRole}` };
}

export async function updateUserStatsAction(
  prevState: UpdateStatsState,
  formData: FormData
): Promise<UpdateStatsState> {
  // Vérifier que l'utilisateur actuel est admin
  if (!(await isAdmin())) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  const userId = formData.get("userId")?.toString();
  const xpStr = formData.get("xp")?.toString();
  const goldStr = formData.get("gold")?.toString();
  const levelStr = formData.get("level")?.toString();

  if (!userId) {
    return { error: "ID utilisateur manquant." };
  }

  // Les admins peuvent modifier les stats de n'importe quel utilisateur, y compris les leurs
  // La vérification admin a déjà été faite plus haut, donc on autorise la modification

  // Récupérer les valeurs actuelles de l'utilisateur pour les conserver si non modifiées
  const adminClient = createSupabaseAdminClient();
  const { data: currentProfile, error: fetchCurrentError } = await adminClient
    .from("profiles")
    .select("xp, gold, level")
    .eq("id", userId)
    .single();

  if (fetchCurrentError || !currentProfile) {
    console.error("Error fetching current profile:", fetchCurrentError);
    return { error: `Impossible de récupérer le profil : ${fetchCurrentError?.message || "Profil introuvable"}` };
  }

  // Parser les valeurs du formulaire - elles sont toujours envoyées
  let xp = currentProfile.xp ?? 0;
  let gold = currentProfile.gold ?? 0;
  let level = currentProfile.level ?? 1;

  if (xpStr !== null && xpStr !== undefined && xpStr !== "") {
    const parsedXp = parseInt(xpStr, 10);
    if (!isNaN(parsedXp) && parsedXp >= 0) {
      xp = parsedXp;
    }
  }

  if (goldStr !== null && goldStr !== undefined && goldStr !== "") {
    const parsedGold = parseInt(goldStr, 10);
    if (!isNaN(parsedGold) && parsedGold >= 0) {
      gold = parsedGold;
    }
  }

  if (levelStr !== null && levelStr !== undefined && levelStr !== "") {
    const parsedLevel = parseInt(levelStr, 10);
    if (!isNaN(parsedLevel) && parsedLevel >= 1) {
      level = parsedLevel;
    }
  }

  const updates = {
    xp: xp,
    gold: gold,
    level: level,
    updated_at: new Date().toISOString(),
  };

  console.log("Updating user stats:", { 
    userId, 
    current: { xp: currentProfile.xp, gold: currentProfile.gold, level: currentProfile.level },
    new: updates,
    formValues: { xpStr, goldStr, levelStr }
  });

  // Mettre à jour avec le client admin (bypass RLS)
  const { data: updatedData, error } = await adminClient
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("xp, gold, level")
    .single();

  if (error) {
    console.error("Error updating user stats:", {
      error,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      updates,
      userId,
    });
    return { 
      error: `Erreur lors de la mise à jour : ${error.message || error.code || "Erreur inconnue"}` 
    };
  }

  if (!updatedData) {
    console.error("Update succeeded but no data returned");
    return { error: "Mise à jour effectuée mais aucune donnée retournée." };
  }

  // Revalider les chemins pour forcer le rechargement des données
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/home");
  
  console.log("Stats updated successfully:", updatedData);
  return { 
    success: `Statistiques mises à jour ! XP: ${updatedData.xp}, Gold: ${updatedData.gold}, Level: ${updatedData.level}` 
  };
}

export async function deleteUserAction(
  prevState: DeleteUserState,
  formData: FormData
): Promise<DeleteUserState> {
  // Vérifier que l'utilisateur actuel est admin
  if (!(await isAdmin())) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  const userId = formData.get("userId")?.toString();

  if (!userId) {
    return { error: "ID utilisateur manquant." };
  }

  // Empêcher un utilisateur de supprimer son propre compte
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === userId) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  // Vérifier que l'utilisateur à supprimer n'est pas admin (sécurité supplémentaire)
  const adminClient = createSupabaseAdminClient();
  const { data: targetProfile } = await adminClient
    .from("profiles")
    .select("role, username")
    .eq("id", userId)
    .maybeSingle();

  if (!targetProfile) {
    return { error: "Utilisateur introuvable." };
  }

  if (targetProfile.role === "admin") {
    // Compter le nombre d'admins restants (en excluant celui qu'on veut supprimer)
    const { count } = await adminClient
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin")
      .neq("id", userId);

    if ((count || 0) < 1) {
      return {
        error: "Impossible de supprimer le dernier admin. Créez un autre admin d'abord.",
      };
    }
  }

  // Supprimer l'utilisateur (cela supprimera automatiquement le profil grâce à CASCADE)
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error("Error deleting user:", deleteError);
    return { error: "Erreur lors de la suppression du compte." };
  }

  revalidatePath("/dashboard/users");
  return {
    success: `Le compte "${targetProfile.username}" a été supprimé avec succès.`,
  };
}

