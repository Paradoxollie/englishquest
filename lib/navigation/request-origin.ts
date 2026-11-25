import { SITE_URL } from "@/lib/site/config";

export function isSiteOrigin(request: Request, origin: string | null) {
  if (!origin) return false;
  const destination = new URL(request.url);
  if (origin === destination.origin) return true;
  // On a reverse proxy the server URL can differ from the browser's public address.
  if (origin === new URL(SITE_URL).origin && request.headers.get("sec-fetch-site") === "same-origin") return true;
  const localNames = ["localhost", "127.0.0.1", "[::1]"];
  if (!localNames.includes(destination.hostname)) return false;
  const port = destination.port ? ":" + destination.port : "";
  return localNames.some(host => origin === destination.protocol + "//" + host + port);
}
