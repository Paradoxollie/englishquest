import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { chapters } from "@/lib/courses/chapters";

/**
 * Résultat du test de niveau passé sans compte. Le serveur le signe ; le
 * navigateur le garde et le renvoie à l'inscription, qui l'applique. La
 * signature empêche de s'inventer un niveau, la date limite évite qu'un vieux
 * résultat traîne. Aucun compte n'est créé et rien n'est écrit avant l'inscription.
 */

const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

function secret() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return `placement:${key}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createPlacementToken(chapterId: number, now = Date.now()) {
  const payload = `${chapterId}.${now}`;
  return `${payload}.${sign(payload)}`;
}

export function readPlacementToken(token: unknown, now = Date.now()): number | null {
  if (typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [chapterText, issuedText, signature] = parts;
  const chapterId = Number(chapterText);
  const issuedAt = Number(issuedText);
  if (!Number.isInteger(chapterId) || !chapters.some((chapter) => chapter.id === chapterId)) return null;
  if (!Number.isInteger(issuedAt) || issuedAt > now || now - issuedAt > MAX_AGE_MS) return null;
  const expected = Buffer.from(sign(`${chapterText}.${issuedText}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return chapterId;
}
