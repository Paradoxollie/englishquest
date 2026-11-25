"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startGameSession } from "@/lib/games/game-session-server";
import { countGuestRound } from "@/lib/games/guest-game-counts";
import { SESSION_CLOCK_TOLERANCE_MS, type GameSessionSlug } from "@/lib/games/game-session-rules";

type PendingSession = {
  promise: Promise<string | null>;
  /** Moment (horloge du navigateur) où le serveur a répondu. */
  resolvedAt: number | null;
};
type SaveResult = { success: boolean; retryable?: boolean };

/**
 * Session de partie côté serveur, pour les joueurs connectés uniquement.
 *
 * `begin()` au lancement d'une partie ; `finish(durationMs)` à la fin donne
 * l'identifiant à transmettre à l'action de score et la durée à annoncer.
 * Les invités n'enregistrent rien : aucune session n'est créée pour eux.
 */
export function useGameSession(slug: GameSessionSlug, isLoggedIn: boolean) {
  const pendingRef = useRef<PendingSession | null>(null);
  const countedGuestStart = useRef(false);
  const generation = useRef(0);
  const [retryScore, setRetryScore] = useState<(() => void) | null>(null);
  useEffect(() => () => { generation.current += 1; }, []);

  const begin = useCallback(() => {
    generation.current += 1;
    setRetryScore(null);
    if (!isLoggedIn) {
      countedGuestStart.current = countGuestRound(slug, "started");
      pendingRef.current = null;
      return;
    }
    const pending: PendingSession = { promise: Promise.resolve(null), resolvedAt: null };
    const open = () => startGameSession(slug).catch(() => ({ ok: false as const, retryable: true }));
    pending.promise = open()
      .then((result) => !result.ok && result.retryable ? open() : result)
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

  const finishGuest = useCallback(() => {
    if (countedGuestStart.current) {
      countedGuestStart.current = false;
      countGuestRound(slug, "finished");
    }
  }, [slug]);

  /** Abandon de la partie : la session reste inutilisée et périmera. */
  const cancel = useCallback(() => {
    countedGuestStart.current = false;
    generation.current += 1;
    setRetryScore(null);
    pendingRef.current = null;
  }, []);

  // Reuse the captured session and duration after a lost response. Only the
  // original promise delivers rewards or refreshes the leaderboard.
  const saveForRun = useCallback(<T extends SaveResult>(run: number, send: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve) => {
      const attempt = async (automatic: boolean) => {
        if (run === generation.current) setRetryScore(null);
        try {
          const result = await send();
          if (result.success || !result.retryable) {
            if (run === generation.current) resolve(result);
            return;
          }
        } catch {
          // A lost response may follow a committed transaction.
        }
        if (automatic) {
          window.setTimeout(() => void attempt(false), 600);
        } else if (run === generation.current) {
          let used = false;
          setRetryScore(() => () => {
            if (used || run !== generation.current) return;
            used = true;
            void attempt(false);
          });
        }
      };
      void attempt(true);
    });
  }, []);

  // Capture the finished round before waiting for its start request. A quick
  // replay may begin in the meantime and must get its own feedback and retry.
  const finish = useCallback(async (durationMs: number) => {
    const run = generation.current;
    const pending = pendingRef.current;
    pendingRef.current = null;
    const sessionId = pending ? await pending.promise : null;
    const duration = Math.max(0, Math.round(Number.isFinite(durationMs) ? durationMs : 0));
    const elapsed = pending?.resolvedAt == null
      ? duration : Math.round(performance.now() - pending.resolvedAt + SESSION_CLOCK_TOLERANCE_MS - 500);
    return {
      sessionId,
      durationMs: Math.max(0, Math.min(duration, elapsed)),
      save: <T extends SaveResult>(send: () => Promise<T>) => saveForRun(run, send),
    };
  }, [saveForRun]);

  return useMemo(() => ({ begin, finish, finishGuest, cancel, retryScore }), [begin, finish, finishGuest, cancel, retryScore]);
}
