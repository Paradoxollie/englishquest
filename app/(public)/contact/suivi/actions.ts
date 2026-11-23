"use server";

import { appendReply, readGuestThread } from "@/lib/contact/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uuidPattern } from "@/lib/contact/receipts";

export async function fetchGuestConversation(token: string) {
  const found = await readGuestThread(token);
  return found?.thread ?? null;
}

export async function replyFromGuest(form: FormData) {
  const found = await readGuestThread(String(form.get("receipt") ?? ""));
  if (!found) return { error: "Ce lien de suivi est indisponible." };
  return appendReply(form, { id: null, team: false, guestKey: found.key }, found.thread.id);
}

export async function confirmGuestRead(token: string, notice: string) {
  if (!uuidPattern.test(notice)) return false;
  const found = await readGuestThread(token);
  if (!found) return false;
  const { data } = await createSupabaseAdminClient().from("contact_messages")
    .update({ reply_notice: null, reply_acknowledged_at: new Date().toISOString() })
    .eq("id", found.thread.id).is("user_id", null).eq("reply_notice", notice).eq("replied", true).select("id").maybeSingle();
  return Boolean(data);
}
