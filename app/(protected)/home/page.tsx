import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import { getResolvedCourseMissionPlan } from "@/lib/courses/campaign-server";
import { getChapterForCourse } from "@/lib/courses/chapters";
import { lessons } from "@/lib/courses/lessons";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { buildMissionSummary } from "@/lib/courses/mission-summary";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { games, getGameBySlug } from "@/lib/games/config";
import { getPlacementStatus } from "@/lib/placement/placement";
import { getDailyChallengeState } from "@/lib/profile/daily-challenge";
import { DAILY_CHALLENGE_REWARD, getDailyStreakMultiplier, getLevelProgress } from "@/lib/profile/economy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Accueil" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function greeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hour12: false, timeZone: "Europe/Paris" }).format(date)
  );
  if (hour < 6) return "Bonne nuit";
  if (hour < 18) return "Bonjour";
  return "Bonsoir";
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminClient = createSupabaseAdminClient();
  const [{ data: profile }, roadmap, canAccessTeachers, placement] = await Promise.all([
    adminClient
      .from("profiles")
      .select("username, xp, gold, daily_played_games, daily_streak, last_game_date, last_daily_bonus_date")
      .eq("id", user.id)
      .maybeSingle(),
    getUserCourseRoadmap(user.id),
    isAdminOrTeacher(),
    getPlacementStatus(user.id),
  ]);

  const username = profile?.username ?? user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Joueur";
  const xp = profile?.xp ?? 0;
  const gold = profile?.gold ?? 0;
  const level = getLevelProgress(xp);
  const daily = getDailyChallengeState(profile);
  const streakMultiplier = getDailyStreakMultiplier(daily.dailyStreak);
  const dailyXp = Math.round(DAILY_CHALLENGE_REWARD.xp * streakMultiplier);

  const currentCourse = roadmap.currentCourse ?? roadmap.recommendedCourse ?? null;
  const [plan, missionState] = currentCourse
    ? await Promise.all([
        getResolvedCourseMissionPlan(currentCourse),
        currentCourse.status !== "locked" ? getUserCourseMissionState(user.id, currentCourse) : Promise.resolve(null),
      ])
    : [null, null];
  const mission =
    currentCourse && plan ? buildMissionSummary({ entry: currentCourse, plan, state: missionState, isLoggedIn: true }) : null;
  const chapter = currentCourse ? getChapterForCourse(currentCourse.courseId) : null;
  const courseTitle = currentCourse ? lessons[currentCourse.courseId]?.title ?? currentCourse.title : null;

  const dailyGames = daily.requiredGames
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));
  const nextDailyGame = dailyGames.find((game) => !daily.dailyPlayedGames.includes(game.slug)) ?? null;
  const otherGames = games.filter((game) => !daily.requiredGames.includes(game.slug)).slice(0, 3);

  return (
    <HomeView
      greetingLabel={greeting()}
      username={username}
      xp={xp}
      gold={gold}
      level={level}
      completedCount={roadmap.completedCount}
      totalCourses={roadmap.totalCourses}
      daily={daily}
      streakMultiplier={streakMultiplier}
      dailyXp={dailyXp}
      currentCourse={currentCourse}
      courseTitle={courseTitle}
      chapter={chapter}
      mission={mission}
      dailyGames={dailyGames}
      otherGames={otherGames}
      nextDailyGame={nextDailyGame}
      canAccessTeachers={canAccessTeachers}
      suggestPlacement={roadmap.completedCount === 0 && !placement.taken}
    />
  );
}
