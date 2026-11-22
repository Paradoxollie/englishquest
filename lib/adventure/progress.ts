import "server-only";
import { cookies } from "next/headers";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { passages } from "./catalog";
import { scenes } from "./scenes";
import { readReceipts, receiptName, RECEIPT_AGE, signReceipt } from "./receipts";
import type { AccountDraft } from "./activities";

export async function getAdventureProgress() {
  const user = await getServerUser();
  const jar = await cookies();
  const stages = readReceipts(jar.getAll(), user?.id);
  let synced = false;
  if (user) {
    try {
      const db = createSupabaseAdminClient();
      const { data, error } = await db.from("adventure_checkpoints").select("mission,stage").eq("user_id", user.id);
      if (!error && data) {
        const remote = new Map(data.map(r => [Number(r.mission), Number(r.stage)]));
        synced = true;
        for (const { id } of passages) {
          const saved = remote.get(id) ?? 0;
          const local = stages[id - 1];
          if (local > saved) {
            const { error: syncError } = await db.rpc("keep_adventure_checkpoint", { p_user: user.id, p_mission: id, p_stage: local });
            if (syncError) synced = false;
          }
          stages[id - 1] = Math.min(scenes[id].length, Math.max(saved, local));
        }
      }
    } catch { /* The signed receipt keeps the pilot playable during an outage. */ }
  }
  const guestStages = user ? readReceipts(jar.getAll()) : stages;
  return { stages, synced, userId: user?.id, guestStages };
}

export async function getAccountDraft(id: number, userId: string | undefined, stage: number): Promise<AccountDraft> {
  if (userId) {
    try {
      const { data } = await createSupabaseAdminClient().from("adventure_checkpoints").select("draft,draft_version")
        .eq("user_id", userId).eq("mission", id).eq("stage", stage).maybeSingle();
      if (data) return { version: data.draft_version, data: data.draft };
    } catch { /* Local drafts cover an interrupted read. */ }
  }
  return { version: 0, data: null };
}

export async function keepCheckpoint(id: number, stage: number, userId?: string) {
  const jar = await cookies();
  const name = receiptName(id, stage, Boolean(userId));
  const options = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/quest" };
  jar.set(name, signReceipt(name, userId ?? "guest"), { ...options, maxAge: RECEIPT_AGE });
  // Two tabs can respond out of order. Each proof has its own name. The highest one wins.
  for (let older = 1; older < stage; older++) {
    const key = receiptName(id, older, Boolean(userId));
    if (jar.has(key)) jar.set(key, "", { ...options, maxAge: 0 });
  }
  if (!userId) return false;
  try {
    const { error } = await createSupabaseAdminClient().rpc("keep_adventure_checkpoint", { p_user: userId, p_mission: id, p_stage: stage });
    return !error;
  } catch { return false; }
}
