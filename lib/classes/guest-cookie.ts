import "server-only";
import { cookies } from "next/headers";

export const CLASS_GUEST_COOKIE = "eq-class-guest";

export async function clearClassGuestCookie() {
  const jar = await cookies();
  if (jar.has(CLASS_GUEST_COOKIE)) jar.delete(CLASS_GUEST_COOKIE);
}
