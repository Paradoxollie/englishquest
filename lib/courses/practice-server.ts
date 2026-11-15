import "server-only";

import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { PRACTICE_STAR_TARGET } from "@/lib/courses/stars";
import { isValidFocusResult } from "@/lib/games/grammar-rush";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Entraînement ciblé (troisième étoile de mission) : meilleur nombre de bonnes
 * réponses sur les questions d'un cours dans une partie de Grammar Rush.
 * Table public.course_practice (migration 2026-10-16_13).
 */

export type PracticeResult = {
  courseId: number;
  focusCorrect: number;
  best: number;
  target: number;
  /** Cinq bonnes réponses ciblées ou plus dans cette partie. */
  starReached: boolean;
  /** L'étoile n'était pas encore acquise avant cette partie. */
  newlyEarned: boolean;
};

/** Meilleur résultat par numéro de cours. Table absente ou erreur : aucun. */
export async function getUserCoursePractice(userId: string): Promise<Map<number, number>> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("course_practice").select("course_id, best_focus_correct").eq("user_id", userId);
    if (error) {
      if (error.code !== "42P01" && error.code !== "PGRST205") console.error("[practice] read failed", error);
      return new Map();
    }
    return new Map(
      ((data ?? []) as Array<{ course_id: number; best_focus_correct: number }>).map((row) => [row.course_id, row.best_focus_correct])
    );
  } catch (error) {
    console.error("[practice] read failed", error);
    return new Map();
  }
}

/**
 * Enregistre le résultat ciblé d'une partie. Vérifie que les nombres sont
 * cohérents avec la partie et que le cours est ouvert pour ce joueur.
 * Ne lève jamais d'erreur : en cas de problème, renvoie null.
 */
export async function recordGrammarRushPractice(
  userId: string,
  params: { focusCourseId: unknown; focusCorrect: unknown; correct: number; attempts: number }
): Promise<PracticeResult | null> {
  const courseId = Number(params.focusCourseId);
  const focusCorrect = Number(params.focusCorrect);
  if (!Number.isSafeInteger(courseId) || courseId < 1) return null;
  if (!isValidFocusResult({ focusCorrect, correct: params.correct, attempts: params.attempts })) return null;

  try {
    const roadmap = await getUserCourseRoadmap(userId);
    const entry = roadmap.entries.find((item) => item.courseId === courseId);
    if (!entry || entry.status === "locked") return null;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("record_course_practice", {
      p_user_id: userId,
      p_course_id: courseId,
      p_focus_correct: focusCorrect,
    });
    if (error || !data) {
      console.error("[practice] record failed", error ?? "Missing practice result");
      return null;
    }
    const result = data as { previousBest?: number; best?: number };
    const previousBest = Number(result.previousBest ?? 0);
    const best = Number(result.best ?? focusCorrect);
    return {
      courseId,
      focusCorrect,
      best,
      target: PRACTICE_STAR_TARGET,
      starReached: focusCorrect >= PRACTICE_STAR_TARGET,
      newlyEarned: focusCorrect >= PRACTICE_STAR_TARGET && previousBest < PRACTICE_STAR_TARGET,
    };
  } catch (error) {
    console.error("[practice] record failed", error);
    return null;
  }
}
