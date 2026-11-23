import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function signature(id: string, key: string) {
  return createHmac("sha256", key).update("englishquest:contact:v1:" + id).digest("base64url");
}

export function receiptPath(id: string, key: string) {
  return "/contact/suivi#" + id + "." + signature(id, key);
}

export function parseReceipt(value: string) {
  const [id, proof, extra] = value.split(".");
  if (extra !== undefined || !uuidPattern.test(id) || !/^[A-Za-z0-9_-]{43}$/.test(proof ?? "")) return null;
  return { id, proof };
}

export function matchesReceipt(id: string, key: string, proof: string) {
  const expected = Buffer.from(signature(id, key));
  const received = Buffer.from(proof);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
