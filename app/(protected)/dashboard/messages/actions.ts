"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";

export type MessageActionState = {
  error?: string;
  success?: string;
};

export async function markMessageAsReadAction(
  prevState: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  if (!(await isAdmin())) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  const messageId = formData.get("messageId")?.toString();

  if (!messageId) {
    return { error: "ID message manquant." };
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("contact_messages")
    .update({ read: true })
    .eq("id", messageId);

  if (error) {
    console.error("Error marking message as read:", error);
    return { error: "Erreur lors de la mise à jour du message." };
  }

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  return { success: "Message marqué comme lu." };
}

export async function deleteMessageAction(
  prevState: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  if (!(await isAdmin())) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  const messageId = formData.get("messageId")?.toString();

  if (!messageId) {
    return { error: "ID message manquant." };
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("contact_messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting message:", error);
    return { error: "Erreur lors de la suppression du message." };
  }

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  return { success: "Message supprimé." };
}

export async function replyToMessageAction(
  prevState: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  if (!(await isAdmin())) {
    return { error: "Vous n'avez pas les permissions nécessaires." };
  }

  const messageId = formData.get("messageId")?.toString();
  const reply = formData.get("reply")?.toString().trim();

  if (!messageId) {
    return { error: "ID message manquant." };
  }

  if (!reply || reply.length === 0) {
    return { error: "La réponse ne peut pas être vide." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Utilisateur non authentifié." };
  }

  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("contact_messages")
    .update({
      reply: reply,
      replied: true,
      replied_by: user.id,
      replied_at: new Date().toISOString(),
      read: true, // Marquer comme lu automatiquement quand on répond
    })
    .eq("id", messageId);

  if (error) {
    console.error("Error replying to message:", error);
    return { error: "Erreur lors de l'envoi de la réponse." };
  }

  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidatePath("/messages"); // Revalider aussi la page des utilisateurs
  return { success: "Réponse envoyée avec succès !" };
}


