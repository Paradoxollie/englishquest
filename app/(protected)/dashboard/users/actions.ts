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

  // Empêcher un utilisateur de modifier ses propres stats (sécurité)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === userId) {
    return { error: "Vous ne pouvez pas modifier vos propres statistiques." };
  }

  const updates: { xp?: number; gold?: number; level?: number } = {};

  if (xpStr !== null && xpStr !== undefined) {
    const xp = parseInt(xpStr, 10);
    if (isNaN(xp) || xp < 0) {
      return { error: "XP doit être un nombre positif." };
    }
    updates.xp = xp;
  }

  if (goldStr !== null && goldStr !== undefined) {
    const gold = parseInt(goldStr, 10);
    if (isNaN(gold) || gold < 0) {
      return { error: "Gold doit être un nombre positif." };
    }
    updates.gold = gold;
  }

  if (levelStr !== null && levelStr !== undefined) {
    const level = parseInt(levelStr, 10);
    if (isNaN(level) || level < 1) {
      return { error: "Level doit être un nombre supérieur à 0." };
    }
    updates.level = level;
  }

  if (Object.keys(updates).length === 0) {
    return { error: "Aucune valeur à mettre à jour." };
  }

  // Mettre à jour les stats avec le client admin
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user stats:", error);
    return { error: "Erreur lors de la mise à jour des statistiques." };
  }

  revalidatePath("/dashboard/users");
  const updatedFields = Object.keys(updates).join(", ");
  return { success: `Statistiques mises à jour : ${updatedFields}` };
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

