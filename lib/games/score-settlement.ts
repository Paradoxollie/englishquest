import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeGameRewards, FULL_REWARD_PLAYS_PER_DAY, XP_PER_LEVEL, type GameRewardResult } from "@/lib/profile/economy";
import type { Difficulty } from "@/lib/profile/leveling";
import { isSessionId, sessionRejectionMessage, type GameSessionSlug, type SessionRejection } from "./game-session-rules";

type GameResult = {
  userId: string;
  slug: GameSessionSlug;
  sessionId: string | null | undefined;
  score: number;
  maxScore: number | null;
  durationMs: number;
  difficulty: Difficulty;
  performance: number;
  recordEligible: boolean;
  focus?: { course: number | null; correct: number };
};

type ScoreReceipt = {
  rewards: GameRewardResult;
  playsToday: number;
  previousBest: number | null;
  isNewPersonalBest: boolean;
  isNewGlobalBest: boolean;
  level: number;
  previousLevel: number;
  savedAt: string;
  replayed: boolean;
};

export const interruptedGameSave = {
  success: false, retryable: true, error: "La sauvegarde a été interrompue. Réessaie avec cette partie.",
} as const;

export function gameAuthFailure(error: { name?: string; status?: number } | null) {
  if (error?.name === "AuthRetryableFetchError" || error?.status === 429 || (error?.status ?? 0) >= 500) {
    return interruptedGameSave;
  }
  return { success: false, error: "Connecte-toi pour enregistrer ton score." } as const;
}

/** Called after authentication and game-specific validation. PostgreSQL chooses
 * the appropriate reward from the existing economy while holding the record locks. */
export async function saveGameScore(game: GameResult): Promise<
  { ok: true; receipt: ScoreReceipt } | { ok: false; error: string; retryable?: boolean }
> {
  if (!isSessionId(game.sessionId)) return { ok: false, error: sessionRejectionMessage("missing") };
  function variants(playsToday: number) {
    const base = { playsToday, difficulty: game.difficulty, performance: game.performance };
    return {
      standard: computeGameRewards({ ...base, isNewPersonalBest: false, isNewGlobalBest: false }),
      personal: computeGameRewards({ ...base, isNewPersonalBest: true, isNewGlobalBest: false }),
      global: computeGameRewards({ ...base, isNewPersonalBest: true, isNewGlobalBest: true }),
    };
  }
  const interrupted = { ok: false, error: interruptedGameSave.error, retryable: true } as const;
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("finish_game_score", {
      p_user_id: game.userId, p_session_id: game.sessionId, p_slug: game.slug,
      p_score: game.score, p_max_score: game.maxScore, p_duration: game.durationMs,
      p_difficulty: game.difficulty, p_record_eligible: game.recordEligible,
      p_reward_options: { full: variants(0), reduced: variants(FULL_REWARD_PLAYS_PER_DAY) },
      p_full_plays: FULL_REWARD_PLAYS_PER_DAY, p_xp_level: XP_PER_LEVEL,
      p_context: { performance: game.performance, focus: game.focus ?? null },
    });
    if (error || !data) {
      console.error("Game score transaction failed", error?.code);
      return interrupted;
    }
    if (data.error) return { ok: false, error: sessionRejectionMessage(data.error as SessionRejection) };
    return { ok: true, receipt: data as ScoreReceipt };
  } catch {
    return interrupted;
  }
}
