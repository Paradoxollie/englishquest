import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { chapters } from "@/lib/courses/chapters";

/**
 * Le navigateur conserve le résultat signé pendant quatorze jours. Le serveur
 * l’utilise pour la carte invitée et le vérifie à nouveau au transfert sur un compte.
 */

export const PLACEMENT_MAX_AGE_SECONDS = 14 * 24 * 60 * 60;
export const PLACEMENT_COOKIE = "eq-placement";

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

function readSignedChapter(token: unknown, purpose: string, now: number): number | null {
  if (typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [chapterText, issuedText, signature] = parts;
  const chapterId = Number(chapterText);
  const issuedAt = Number(issuedText);
  if (!Number.isInteger(chapterId) || !chapters.some((chapter) => chapter.id === chapterId)) return null;
  if (!Number.isInteger(issuedAt) || issuedAt > now || now - issuedAt >= PLACEMENT_MAX_AGE_SECONDS * 1000) return null;
  const expected = Buffer.from(sign(`${purpose}${chapterText}.${issuedText}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  return chapterId;
}

export function readPlacementToken(token: unknown, now = Date.now()) {
  return readSignedChapter(token, "", now);
}

export function createPlacementStepToken(chapter: number, now = Date.now()) {
  const payload = `${chapter}.${now}`;
  return `${payload}.${sign("next-step:" + payload)}`;
}

export function readPlacementStepToken(token: unknown, now = Date.now()) {
  return readSignedChapter(token, "next-step:", now);
}
