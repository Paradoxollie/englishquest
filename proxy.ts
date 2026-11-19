import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { REQUEST_PATH_HEADER } from "@/lib/navigation/safe-next";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  function forwardPage() {
    const path = request.nextUrl.clone();
    path.searchParams.delete("_rsc");
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(REQUEST_PATH_HEADER, path.pathname + path.search);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/audio/") ||
    pathname.startsWith("/art/") ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/ads.txt" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|json|woff|woff2|ttf|eot|txt)$/i)
  ) {
    return NextResponse.next();
  }

  if (request.method !== "GET") return forwardPage();

  // Les préchargements de liens ne sont pas des visites.
  const purpose = `${request.headers.get("purpose") ?? ""} ${request.headers.get("sec-purpose") ?? ""}`;
  if (request.headers.get("next-router-prefetch") || /prefetch/i.test(purpose)) {
    return forwardPage();
  }

  // Le site lancé en local ne compte pas dans les visites de production.
  if (["localhost", "127.0.0.1", "::1"].includes(request.nextUrl.hostname)) {
    return forwardPage();
  }

  const baseUrl = request.nextUrl.origin;

  const trackPromise = fetch(`${baseUrl}/api/track-visit`, {
    method: "POST",
    signal: AbortSignal.timeout(2500),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.headers.get("user-agent") || "",
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      "x-vercel-forwarded-for": request.headers.get("x-vercel-forwarded-for") || "",
      "x-real-ip": request.headers.get("x-real-ip") || "",
      referer: request.headers.get("referer") || "",
    },
    body: JSON.stringify({
      path: pathname,
      referrer: request.headers.get("referer") || null,
    }),
  }).catch(() => undefined);

  if (typeof event?.waitUntil === "function") {
    event.waitUntil(trackPromise);
  }

  return forwardPage();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
