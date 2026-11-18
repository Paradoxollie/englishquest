import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const GUEST_PROOF_PREFIX = "eq-mission-";
export const GUEST_PROOF_SECONDS = 180 * 24 * 60 * 60;
const COURSE_NAME = /^eq-mission-([1-9]\d?)-(8|9|10)$/;

function signature(course: number, value: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Guest mission signing key unavailable");
  return createHmac("sha256", key).update(`guest-mission-v1:${course}:${value}`).digest("base64url");
}

/** A higher score survives even when a slower browser tab saves a lower one. */
export function signGuestScore(course: number, score: number, now = Date.now()) {
  const expiry = Math.floor(now / 1000) + GUEST_PROOF_SECONDS;
  const value = `${score}.${expiry.toString(36)}`;
  return `${value}.${signature(course, value)}`;
}

export function readGuestScores(items: { name: string; value: string }[], now = Date.now()) {
  const scores = new Map<number, number>();
  for (const { name, value } of items) {
    const parts = COURSE_NAME.exec(name);
    if (!parts) continue;
    const course = Number(parts[1]);
    if (course > 50) continue;
    const match = /^(8|9|10)\.([0-9a-z]{1,8})\.([\w-]{43})$/.exec(value);
    if (!match || match[1] !== parts[2] || Number.parseInt(match[2], 36) <= now / 1000) continue;
    const expected = signature(course, `${match[1]}.${match[2]}`);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(match[3]))) {
      scores.set(course, Math.max(scores.get(course) ?? 0, Number(match[1])));
    }
  }
  return scores;
}
