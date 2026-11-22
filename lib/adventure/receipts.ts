import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { passages } from "./catalog";
import { scenes } from "./scenes";

export const RECEIPT_AGE = 180 * 24 * 3600;
export function receiptName(id: number, stage: number, signedIn: boolean) {
  return `${signedIn ? "eq-atlas1-a" : "eq-atlas2-g"}${id}-${stage}`;
}

export function legacyGuestReceiptName(id: number, stage: number) {
  return `eq-atlas1-g${id}-${stage}`;
}

function signature(name: string, owner: string, expiry: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Adventure signing key unavailable");
  return createHmac("sha256", key).update(`atlas-v1|${name}|${owner}|${expiry}`).digest("base64url");
}

export function signReceipt(name: string, owner: string, now = Date.now()) {
  const expiry = (Math.floor(now / 1000) + RECEIPT_AGE).toString(36);
  return `${expiry}.${signature(name, owner, expiry)}`;
}

export function readReceipts(items: { name: string; value: string }[], userId?: string, now = Date.now()) {
  const stages = passages.map(() => 0);
  for (const { name, value } of items) {
    const parts = /^eq-atlas(1-[ag]|2-g)([1-9]\d{0,2})-([1-9])$/.exec(name);
    if (!parts || (parts[1] === "1-a") !== Boolean(userId)) continue;
    const id = Number(parts[2]), stage = Number(parts[3]);
    const signed = /^([a-z0-9]{1,8})\.([\w-]{43})$/.exec(value);
    if (!scenes[id] || stage > scenes[id].length || !signed || parseInt(signed[1], 36) <= now / 1000) continue;
    if (timingSafeEqual(Buffer.from(signature(name, userId ?? "guest", signed[1])), Buffer.from(signed[2]))) {
      stages[id - 1] = Math.max(stages[id - 1], stage);
    }
  }
  return stages;
}
