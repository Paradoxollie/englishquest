import type { GameSessionSlug } from "./game-session-rules";

/** Only normal rounds on a public game page count. No identifier or score is sent. */
export function countGuestRound(game: GameSessionSlug, event: "started" | "finished") {
  if (typeof window === "undefined" || window.location?.pathname !== "/play/" + game) return false;
  void fetch("/api/parties-invitees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    referrerPolicy: "no-referrer",
    keepalive: true,
    body: JSON.stringify({ game, event }),
  }).catch(() => undefined);
  return true;
}
