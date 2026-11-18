import "server-only";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncBadgesSafely } from "@/lib/profile/badges-server";
import { getUserCourseRoadmap } from "./progress";
import { GUEST_PROOF_PREFIX, GUEST_PROOF_SECONDS, readGuestScores, signGuestScore } from "./guest-proof";

export async function getGuestScores() {
  return readGuestScores((await cookies()).getAll());
}

export async function keepGradedGuestScore(course: number, score: number) {
  const jar = await cookies();
  const best = Math.max(readGuestScores(jar.getAll()).get(course) ?? 0, score);
  jar.set(`${GUEST_PROOF_PREFIX}${course}-${best}`, signGuestScore(course, best), {
    httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: GUEST_PROOF_SECONDS,
  });
  for (let lower = 8; lower < best; lower += 1) {
    const name = `${GUEST_PROOF_PREFIX}${course}-${lower}`;
    if (jar.has(name)) jar.delete(name);
  }
}

/** Called only with the ID verified during signup/login or by auth.getUser(). */
export async function transferGuestScores(userId: string) {
  const jar = await cookies();
  const scores = readGuestScores(jar.getAll());
  if (scores.size === 0) return 0;
  await getUserCourseRoadmap(userId); // Ensure the catalogue and initial progress rows exist.
  const { error } = await createSupabaseAdminClient().rpc("import_guest_quiz_results", {
    p_user_id: userId,
    p_results: Array.from(scores, ([course, score]) => ({ course, score })),
  });
  if (error) throw error; // Keep the proofs on the device so a subsequent attempt can finish.
  for (const course of scores.keys()) {
    for (const score of [8, 9, 10]) {
      const name = `${GUEST_PROOF_PREFIX}${course}-${score}`;
      if (jar.has(name)) jar.delete(name);
    }
  }
  await syncBadgesSafely(userId);
  return scores.size;
}
