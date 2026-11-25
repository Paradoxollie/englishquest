"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/classes/classes-data";
import { isValidClassCode, isUuid, normalizeClassCode } from "@/lib/classes/classes";
import { guestCredential, guestTokenFor, hashGuestToken } from "@/lib/classes/guests";
import { CLASS_GUEST_COOKIE } from "@/lib/classes/guest-cookie";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { gradeLiveAnswers } from "@/lib/classes/live-grading";
import { getCourseQuizPool } from "@/lib/courses/exercises-server";

export async function enterGuestClass(_previous: string, form: FormData): Promise<string> {
  if (await getViewer()) redirect("/rejoindre");
  const code = normalizeClassCode(form.get("code"));
  const name = String(form.get("nickname") ?? "").normalize("NFC").trim();
  const nonce = form.get("attempt");
  if (!isValidClassCode(code)) return "Recopie les six caractères du code donné par ton professeur.";
  if (!/^[\p{L}\p{N}][\p{L}\p{M}\p{N}'’ _-]{0,23}$/u.test(name)) return "Choisis un pseudo ou un prénom de 1 à 24 caractères, sans adresse e-mail.";
  if (!isUuid(nonce)) return "Recharge la page et réessaie.";
  const request = await headers();
  const network = (request.get("x-vercel-forwarded-for") ?? request.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const hour = Math.floor(Date.now() / 3_600_000);
  const token = guestTokenFor("entry", JSON.stringify([nonce, code, name, hour]));
  const db = createSupabaseAdminClient();
  const result = await db.rpc("enter_class_as_guest", { p_code: code, p_name: name, p_hash: hashGuestToken(token),
    p_bucket: guestTokenFor("failed-joins", hour + "|" + network) });
  if (result.error) return "La classe est momentanément indisponible. Réessaie.";
  if (!result.data?.classId) {
    switch (result.data?.error) {
      case "name": return "Ce pseudo est déjà pris dans cette classe. Ajoute un chiffre ou choisis-en un autre.";
      case "full": return "La classe est complète. Préviens ton professeur.";
      case "limited": return "Trop de codes incorrects ont été saisis. Vérifie le code avec ton professeur et réessaie plus tard.";
      default: return "Ce code ne correspond à aucune classe ouverte. Vérifie-le avec ton professeur.";
    }
  }
  const old = await guestCredential();
  if (old && old !== hashGuestToken(token)) {
    const revoked = await db.from("class_guests").update({ token_hash: null }).eq("token_hash", old);
    if (revoked.error) return "Réessaie pour changer de participation sur cet appareil.";
  }
  (await cookies()).set(CLASS_GUEST_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", expires: new Date(result.data.accessUntil) });
  redirect("/direct/" + result.data.classId);
}

export async function leaveGuestClass() {
  const credential = await guestCredential();
  if (credential) {
    const result = await createSupabaseAdminClient().from("class_guests").update({ token_hash: null }).eq("token_hash", credential);
    if (result.error) throw new Error("Impossible de fermer ta participation. Réessaie.");
  }
  (await cookies()).delete(CLASS_GUEST_COOKIE);
  redirect("/rejoindre");
}

export async function saveGuestHomework(assignment: string, course: number, answers: unknown[]): Promise<boolean> {
  if (!isUuid(assignment) || !Number.isInteger(course) || course < 1 || course > 50 || !Array.isArray(answers) || answers.length > 40) return false;
  const credential = await guestCredential();
  if (!credential || await getViewer()) return false;
  const marks = gradeLiveAnswers(getCourseQuizPool(course), answers).map(({ id, ok }) => ({ id, ok }));
  if (!marks.length) return false;
  const { data, error } = await createSupabaseAdminClient().rpc("save_guest_class_work", {
    p_hash: credential, p_assignment: assignment, p_course: course, p_marks: marks,
  });
  return !error && data === true;
}
