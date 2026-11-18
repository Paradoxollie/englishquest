"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  SESSION_START_LIMIT_PER_MINUTE,
  isGameSessionSlug,
} from "@/lib/games/game-session-rules";

/**
 * Sessions de partie côté serveur (table `game_sessions`, migration
 * 2026-10-16_20). Aucun accès client à la table : tout passe par le rôle
 * service, après vérification de l'utilisateur.
 */

const ONE_MINUTE_MS = 60_000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type StartGameSessionResult = { ok: true; sessionId: string } | { ok: false; error: string; retryable?: boolean };

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
    return { ok: false, error: "La partie n'a pas pu être enregistrée sur le serveur.", retryable: true };
  }
}
