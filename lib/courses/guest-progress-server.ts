import "server-only";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncBadgesSafely } from "@/lib/profile/badges-server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "./progress";
import { applyPlacement } from "@/lib/placement/placement";
import { PLACEMENT_COOKIE, PLACEMENT_MAX_AGE_SECONDS, readPlacementToken } from "@/lib/placement/placement-token";
import { GUEST_PROOF_PREFIX, GUEST_PROOF_SECONDS, readGuestScores, signGuestScore } from "./guest-proof";

export async function getGuestScores() {
  return readGuestScores((await cookies()).getAll());
}

export async function getGuestProgress() {
  const items = (await cookies()).getAll();
  return { scores: readGuestScores(items), placementChapter: readPlacementToken(items.find((item) => item.name === PLACEMENT_COOKIE)?.value) };
}

export async function getGuestRoadmap() {
  const { scores, placementChapter } = await getGuestProgress();
  return buildGuestCourseRoadmap(scores, placementChapter ?? 1);
}

/** Also accepts a valid result saved by the previous version in localStorage. */
export async function keepGuestPlacement(token: unknown) {
  const chapter = readPlacementToken(token);
  if (chapter === null || typeof token !== "string") return null;
  const jar = await cookies();
  const previous = readPlacementToken(jar.getAll().find((c) => c.name === PLACEMENT_COOKIE)?.value);
  if (previous !== null && previous > chapter) return previous;
  const issued = Number(token.split(".")[1]);
  const maxAge = Math.ceil((issued + PLACEMENT_MAX_AGE_SECONDS * 1000 - Date.now()) / 1000);
  jar.set(PLACEMENT_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge });
  return chapter;
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
  const { scores, placementChapter } = await getGuestProgress();
  if (scores.size === 0 && placementChapter === null) return 0;
  const results = Array.from(scores, ([course, score]) => ({ course, score }));
  if (placementChapter !== null) {
    await applyPlacement(userId, placementChapter, results);
    jar.delete(PLACEMENT_COOKIE);
  } else {
    await getUserCourseRoadmap(userId);
    const { error } = await createSupabaseAdminClient().rpc("import_guest_quiz_results", { p_user_id: userId, p_results: results });
    if (error) throw error;
  }
  for (const course of scores.keys()) {
    for (const score of [8, 9, 10]) {
      const name = `${GUEST_PROOF_PREFIX}${course}-${score}`;
      if (jar.has(name)) jar.delete(name);
    }
  }
  await syncBadgesSafely(userId);
  return scores.size + Number(placementChapter !== null);
}
