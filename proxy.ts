import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/ads.txt" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot|txt)$/i)
  ) {
    return NextResponse.next();
  }

  const baseUrl = request.nextUrl.origin;

  fetch(`${baseUrl}/api/track-visit`, {
    method: "POST",
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
  }).catch(() => {
    return undefined;
  });

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
