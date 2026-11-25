import type { NextRequest } from "next/server";
import { isGameSessionSlug } from "@/lib/games/game-session-rules";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSiteOrigin } from "@/lib/navigation/request-origin";

export async function POST(request: NextRequest) {
  if (!isSiteOrigin(request, request.headers.get("origin")) ||
      request.headers.get("sec-fetch-site") === "cross-site") return new Response(null, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return new Response(null, { status: 415 });
  if (process.env.VERCEL_ENV !== "production" || /bot|crawler|spider|playwright|puppeteer|headless/i.test(request.headers.get("user-agent") ?? "")) {
    return new Response(null, { status: 204 });
  }
  const body = await request.json().catch(() => null);
  if (!isGameSessionSlug(body?.game) || (body.event !== "started" && body.event !== "finished")) return new Response(null, { status: 400 });
  const { error } = await createSupabaseAdminClient().rpc("count_guest_game", { p_slug: body.game, p_event: body.event });
  return new Response(null, { status: error ? 503 : 204 });
}
