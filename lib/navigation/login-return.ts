import "server-only";
import { headers } from "next/headers";
import { getSafeNextPath, REQUEST_PATH_HEADER, withNextParam } from "./safe-next";

export async function loginForCurrentPage(fallback?: string) {
  const path = (await headers()).get(REQUEST_PATH_HEADER);
  return withNextParam("/auth/login", getSafeNextPath(path) ?? getSafeNextPath(fallback));
}
