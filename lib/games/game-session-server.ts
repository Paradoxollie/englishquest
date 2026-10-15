"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  SESSION_START_LIMIT_PER_MINUTE,
  checkGameSession,
  isGameSessionSlug,
  isSessionId,
  sessionRejectionMessage,
  type GameSessionRow,
  type GameSessionSlug,
  type SessionRejection,
} from "@/lib/games/game-session-rules";

/**
 * Sessions de partie côté serveur (table `game_sessions`, migration
 * 2026-10-16_20). Aucun accès client à la table : tout passe par le rôle
 * service, après vérification de l'utilisateur.
 */

const ONE_MINUTE_MS = 60_000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Tant que la migration 2026-10-16_20 n'est pas appliquée, la table manque :
 * les scores restent acceptés (contrôle de vraisemblance seulement) au lieu
 * d'être tous refusés. Le résultat est gardé une minute.
 */
let tableCheck: { missing: boolean; at: number } | null = null;

function isMissingTable(error: unknown) {
  const value = error as { code?: string; message?: string } | null;
  return Boolean(
    value &&
      (value.code === "42P01" ||
        value.code === "PGRST205" ||
        /does not exist|could not find the table/i.test(value.message ?? ""))
  );
}

async function sessionsTableMissing() {
  if (tableCheck && Date.now() - tableCheck.at < ONE_MINUTE_MS) return tableCheck.missing;
  const probe = await createSupabaseAdminClient().from("game_sessions").select("id", { head: true }).limit(1);
  const missing = isMissingTable(probe.error);
  if (missing) console.warn("game_sessions absente : sessions de partie désactivées (migration 2026-10-16_20 à appliquer)");
  tableCheck = { missing, at: Date.now() };
  return missing;
}

export type StartGameSessionResult = { ok: true; sessionId: string } | { ok: false; error: string };

/** Démarre une partie pour le joueur connecté et renvoie l'identifiant de session. */
export async function startGameSession(slug: string): Promise<StartGameSessionResult> {
  if (!isGameSessionSlug(slug)) {
    return { ok: false, error: "Jeu inconnu." };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Connecte-toi pour enregistrer tes parties." };
    }

    const admin = createSupabaseAdminClient();
    const now = Date.now();
    const recent = await admin
      .from("game_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("started_at", new Date(now - ONE_MINUTE_MS).toISOString());
    if (recent.error) throw recent.error;
    const startedLastMinute = recent.count ?? (Array.isArray(recent.data) ? recent.data.length : 0);
    if (startedLastMinute >= SESSION_START_LIMIT_PER_MINUTE) {
      return { ok: false, error: "Trop de parties lancées en une minute. Attends un peu avant de rejouer." };
    }

    const inserted = await admin
      .from("game_sessions")
      .insert({ user_id: user.id, game_slug: slug, started_at: new Date(now).toISOString() })
      .select("id")
      .single();
    if (inserted.error || !inserted.data) throw inserted.error ?? new Error("Session non créée");

    // Ménage : les sessions de plus d'un jour ne servent plus.
    await admin
      .from("game_sessions")
      .delete()
      .eq("user_id", user.id)
      .lt("started_at", new Date(now - ONE_DAY_MS).toISOString())
      .then(
        () => undefined,
        () => undefined
      );

    return { ok: true, sessionId: String(inserted.data.id) };
  } catch (error) {
    console.error("startGameSession failed", error);
    return { ok: false, error: "La partie n'a pas pu être enregistrée sur le serveur." };
  }
}

export type ConsumeGameSessionResult = { ok: true } | { ok: false; reason: SessionRejection; error: string };

/**
 * Valide la session d'une partie terminée et la marque comme utilisée, une
 * seule fois : `update ... where used_at is null returning`. Appelée par les
 * actions de score, après l'authentification.
 */
export async function consumeGameSession(params: {
  sessionId: unknown;
  userId: string;
  slug: GameSessionSlug;
  claimedDurationMs: number;
}): Promise<ConsumeGameSessionResult> {
  const reject = (reason: SessionRejection): ConsumeGameSessionResult => ({
    ok: false,
    reason,
    error: sessionRejectionMessage(reason),
  });

  if (params.sessionId == null || params.sessionId === "") {
    return (await sessionsTableMissing()) ? { ok: true } : reject("missing");
  }
  if (!isSessionId(params.sessionId) || !params.userId || !isGameSessionSlug(params.slug)) return reject("invalid");
  const sessionId = params.sessionId;

  const admin = createSupabaseAdminClient();
  const found = await admin
    .from("game_sessions")
    .select("id, user_id, game_slug, started_at, used_at")
    .eq("id", sessionId)
    .maybeSingle();
  if (found.error) {
    if (isMissingTable(found.error)) return { ok: true };
    throw found.error;
  }

  const nowMs = Date.now();
  const check = checkGameSession((found.data as GameSessionRow | null) ?? null, {
    userId: params.userId,
    slug: params.slug,
    claimedDurationMs: params.claimedDurationMs,
    nowMs,
  });
  if (!check.ok) return reject(check.reason);

  // Marquage atomique : une seconde demande simultanée ne trouve plus de ligne.
  const claimed = await admin
    .from("game_sessions")
    .update({ used_at: new Date(nowMs).toISOString() })
    .eq("id", sessionId)
    .eq("user_id", params.userId)
    .eq("game_slug", params.slug)
    .is("used_at", null)
    .select("id")
    .maybeSingle();
  if (claimed.error) throw claimed.error;
  if (!claimed.data) return reject("used");
  return { ok: true };
}
