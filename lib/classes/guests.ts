import "server-only";
import { createHash, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { courseLabel } from "./classes-data";
import { CLASS_GUEST_COOKIE } from "./guest-cookie";

export function guestTokenFor(purpose: string, input: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("La participation en classe est indisponible.");
  return createHmac("sha256", key).update("class-guest-v1|" + purpose + "|" + input).digest("hex");
}

export function hashGuestToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function guestCredential() {
  const value = (await cookies()).get(CLASS_GUEST_COOKIE)?.value;
  return value && /^[a-f0-9]{64}$/.test(value) ? hashGuestToken(value) : null;
}

export async function currentClassGuest() {
  const hash = await guestCredential();
  if (!hash) return null;
  const { data, error } = await createSupabaseAdminClient().from("class_guests")
    .select("id,class_id,nickname,classes!inner(name,code,archived_at)").eq("token_hash", hash)
    .gt("access_until", new Date().toISOString()).is("classes.archived_at", null).maybeSingle();
  if (error) throw new Error("La participation est momentanément indisponible.");
  if (!data) return null;
  const room = data.classes as unknown as { name: string; code: string };
  return { id: data.id as string, classId: data.class_id as string, name: data.nickname as string, className: room.name, code: room.code };
}

export async function guestAssignments(classId: string) {
  const { data, error } = await createSupabaseAdminClient().from("class_assignments")
    .select("id,course_id,due_date,note").eq("class_id", classId).order("created_at", { ascending: false });
  if (error) throw new Error("Les devoirs sont momentanément indisponibles.");
  return (data ?? []).map(row => ({ id: String(row.id), course: Number(row.course_id), title: courseLabel(row.course_id),
    note: row.note as string | null, due: row.due_date as string | null }));
}
