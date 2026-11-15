/**
 * Règles des sessions de partie (anti-triche de base), sans accès réseau.
 *
 * Une partie d'un joueur connecté commence par une session côté serveur
 * (table `game_sessions`). Le score n'est accepté qu'avec une session
 * inconnue de personne d'autre, du bon jeu, pas encore utilisée, et dont
 * l'âge mesuré par le serveur est compatible avec la durée annoncée.
 */

export const GAME_SESSION_SLUGS = [
  "enigma-scroll",
  "space-lex",
  "speed-verb-challenge",
  "wordfall",
  "flash-translation",
  "grammar-rush",
  "flashback",
] as const;

export type GameSessionSlug = (typeof GAME_SESSION_SLUGS)[number];

/** Démarrages de partie autorisés par minute et par joueur. */
export const SESSION_START_LIMIT_PER_MINUTE = 30;
/** Tolérance d'horloge entre le navigateur et le serveur. */
export const SESSION_CLOCK_TOLERANCE_MS = 3_000;
/** Au-delà, la session est périmée. */
export const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type SessionRejection =
  | "missing"
  | "invalid"
  | "unknown"
  | "foreign"
  | "wrong_game"
  | "used"
  | "too_fast"
  | "expired";

export type GameSessionRow = {
  id: string;
  user_id: string;
  game_slug: string;
  started_at: string;
  used_at: string | null;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGameSessionSlug(value: unknown): value is GameSessionSlug {
  return typeof value === "string" && (GAME_SESSION_SLUGS as readonly string[]).includes(value);
}

export function isSessionId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/**
 * Vérifie une ligne de session lue en base. `null` = session inconnue.
 * Ne marque rien : le passage à « utilisée » se fait ensuite de façon atomique.
 */
export function checkGameSession(
  row: GameSessionRow | null,
  expected: { userId: string; slug: GameSessionSlug; claimedDurationMs: number; nowMs: number }
): { ok: true; elapsedMs: number } | { ok: false; reason: SessionRejection } {
  if (!Number.isFinite(expected.claimedDurationMs) || expected.claimedDurationMs < 0) {
    return { ok: false, reason: "invalid" };
  }
  if (!row) return { ok: false, reason: "unknown" };
  if (row.user_id !== expected.userId) return { ok: false, reason: "foreign" };
  if (row.game_slug !== expected.slug) return { ok: false, reason: "wrong_game" };
  if (row.used_at) return { ok: false, reason: "used" };
  const startedAt = Date.parse(row.started_at);
  if (!Number.isFinite(startedAt)) return { ok: false, reason: "invalid" };
  const elapsedMs = expected.nowMs - startedAt;
  if (elapsedMs > SESSION_MAX_AGE_MS) return { ok: false, reason: "expired" };
  if (elapsedMs < expected.claimedDurationMs - SESSION_CLOCK_TOLERANCE_MS) return { ok: false, reason: "too_fast" };
  return { ok: true, elapsedMs };
}

export function sessionRejectionMessage(reason: SessionRejection): string {
  switch (reason) {
    case "missing":
    case "invalid":
    case "unknown":
    case "foreign":
    case "wrong_game":
      return "Partie introuvable : relance une partie pour enregistrer ton score.";
    case "used":
      return "Ce score a déjà été enregistré.";
    case "too_fast":
      return "Durée de partie incohérente : score non enregistré.";
    case "expired":
      return "Partie trop ancienne : relance une partie pour enregistrer ton score.";
  }
}
