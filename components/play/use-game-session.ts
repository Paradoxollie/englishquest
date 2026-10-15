"use client";

import { useCallback, useRef } from "react";
import { startGameSession } from "@/lib/games/game-session-server";
import { SESSION_CLOCK_TOLERANCE_MS, type GameSessionSlug } from "@/lib/games/game-session-rules";

type PendingSession = {
  promise: Promise<string | null>;
  /** Moment (horloge du navigateur) où le serveur a répondu. */
  resolvedAt: number | null;
};

/**
 * Session de partie côté serveur, pour les joueurs connectés uniquement.
 *
 * `begin()` au lancement d'une partie ; `finish(durationMs)` à la fin donne
 * l'identifiant à transmettre à l'action de score et la durée à annoncer.
 * Les invités n'enregistrent rien : aucune session n'est créée pour eux.
 */
export function useGameSession(slug: GameSessionSlug, isLoggedIn: boolean) {
  const pendingRef = useRef<PendingSession | null>(null);

  const begin = useCallback(() => {
    if (!isLoggedIn) {
      pendingRef.current = null;
      return;
    }
    const pending: PendingSession = { promise: Promise.resolve(null), resolvedAt: null };
    pending.promise = startGameSession(slug)
      .then((result) => {
        pending.resolvedAt = performance.now();
        return result.ok ? result.sessionId : null;
      })
      .catch(() => {
        pending.resolvedAt = performance.now();
        return null;
      });
    pendingRef.current = pending;
  }, [slug, isLoggedIn]);

  /**
   * Identifiant de la session en cours et durée à annoncer. La durée est
   * bornée par le temps écoulé depuis la réponse du serveur : un démarrage
   * lent ne fait pas refuser un score honnête.
   */
  const finish = useCallback(async (durationMs: number) => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    const sessionId = pending ? await pending.promise : null;
    const safeDuration = Math.max(0, Math.round(Number.isFinite(durationMs) ? durationMs : 0));
    if (!pending || pending.resolvedAt === null) {
      return { sessionId, durationMs: safeDuration };
    }
    const sinceServer = performance.now() - pending.resolvedAt + SESSION_CLOCK_TOLERANCE_MS - 500;
    return { sessionId, durationMs: Math.max(0, Math.min(safeDuration, Math.round(sinceServer))) };
  }, []);

  /** Abandon de la partie : la session reste inutilisée et périmera. */
  const cancel = useCallback(() => {
    pendingRef.current = null;
  }, []);

  return { begin, finish, cancel };
}
