"use server";

import { appendReply, currentContactUser } from "@/lib/contact/server";
import { uuidPattern } from "@/lib/contact/receipts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function replyFromAccount(form: FormData) {
  const id = await currentContactUser();
  if (!id) return { error: "Connecte-toi pour répondre." };
  return appendReply(form, { id, team: false }, String(form.get("messageId") ?? ""));
}

export async function acknowledgeReply(messageId: string, notice: string) {
  if (!uuidPattern.test(messageId) || !uuidPattern.test(notice)) return false;
  const id = await currentContactUser();
  if (!id) return false;
  const { data } = await createSupabaseAdminClient().from("contact_messages")
    .update({ reply_notice: null, reply_acknowledged_at: new Date().toISOString() })
    .eq("id", messageId).eq("user_id", id).eq("reply_notice", notice).eq("replied", true).select("id").maybeSingle();
  return Boolean(data);
}
