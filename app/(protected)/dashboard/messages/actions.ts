"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/roles";
import { appendReply, currentContactUser } from "@/lib/contact/server";
import { receiptPath, uuidPattern } from "@/lib/contact/receipts";

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
  formData: FormData
): Promise<MessageActionState> {
  const id = await currentContactUser();
  if (!id) return { error: "Connecte-toi pour répondre." };
  // The transaction checks the current database role before reading or writing the conversation.
  return appendReply(formData, { id, team: true }, String(formData.get("messageId") ?? ""));
}

export async function getGuestReceipt(messageId: string) {
  if (!uuidPattern.test(messageId) || !(await isAdmin())) return { error: "Échange indisponible." };
  const { data, error } = await createSupabaseAdminClient().from("contact_messages")
    .select("id, guest_receipt_key").eq("id", messageId).is("user_id", null).maybeSingle();
  if (error || !data) return { error: "Lien indisponible." };
  return { path: receiptPath(data.id, data.guest_receipt_key) };
}


