import "server-only";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { threadColumns, type ContactThread, type ReplyResult } from "./conversation";
import { matchesReceipt, parseReceipt, uuidPattern } from "./receipts";

export async function readGuestThread(token: string) {
  const receipt = parseReceipt(token);
  if (!receipt) return null;
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("contact_messages")
    .select(`guest_receipt_key, ${threadColumns}`).eq("id", receipt.id).is("user_id", null).maybeSingle();
  if (error) throw new Error("Contact indisponible");
  if (!data || !matchesReceipt(receipt.id, data.guest_receipt_key, receipt.proof)) return null;
  const { guest_receipt_key: key, ...thread } = data;
  return { key: key as string, thread: thread as ContactThread };
}

export async function currentContactUser() {
  const client = await createSupabaseServerClient();
  const { data: { user } } = await client.auth.getUser();
  return user?.id ?? null;
}

export async function appendReply(form: FormData, actor: { id: string | null; team: boolean; guestKey?: string }, messageId: string): Promise<ReplyResult> {
  const body = form.get("reply")?.toString().trim() ?? "";
  const requestId = form.get("requestId")?.toString() ?? "";
  if (!uuidPattern.test(messageId) || !uuidPattern.test(requestId)) return { error: "Échange indisponible." };
  if (!body || body.length > 3000) return { error: "Écris un message de 1 à 3 000 caractères." };
  const { data, error } = await createSupabaseAdminClient().rpc("append_contact_followup", {
    p_message_id: messageId, p_request_id: requestId, p_body: body, p_team: actor.team,
    p_actor: actor.id, p_guest_key: actor.guestKey ?? null,
  });
  if (error) return { error: "L’enregistrement a échoué. Réessaie dans un instant." };
  if (data === "rate_limited") return { error: "Tu as déjà ajouté trois messages dans cet échange cette heure-ci. Réessaie plus tard." };
  if (data !== "ok") return { error: "Impossible d’ajouter la réponse à cet échange." };
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
  revalidatePath("/messages");
  return { success: "Ta réponse est enregistrée dans cet échange." };
}
