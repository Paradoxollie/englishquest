import type { Metadata } from "next";
import { HomeView } from "@/components/home/home-view";
import { RewardOnMount } from "@/components/rewards/reward-on-mount";
import { isAdminOrTeacher } from "@/lib/auth/roles";
import { getResolvedCourseMissionPlan } from "@/lib/courses/campaign-server";
import { getChapterForCourse } from "@/lib/courses/chapters";
import { lessons } from "@/lib/courses/lessons";
import { getUserCourseMissionState } from "@/lib/courses/mission-state";
import { isCoursePlacementSkip } from "@/lib/courses/mission-telemetry";
import { buildMissionSummary } from "@/lib/courses/mission-summary";
import { getUserCoursePractice } from "@/lib/courses/practice-server";
import { getUserCourseRoadmap } from "@/lib/courses/progress";
import { STARS_PER_MISSION, getMissionStars, sumStars } from "@/lib/courses/stars";
import { games, getGameBySlug } from "@/lib/games/config";
import { getPlacementStatus } from "@/lib/placement/placement";
import { loadBadgesWithSync } from "@/lib/profile/badges-server";
import { getDailyChallengeState } from "@/lib/profile/daily-challenge";
import { DAILY_CHALLENGE_REWARD, WELCOME_GOLD, getDailyStreakMultiplier, getLevelProgress } from "@/lib/profile/economy";
import { getWeeklyLeague } from "@/lib/profile/league-server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Le bonus de bienvenue s'affiche pendant les 24 premières heures, avant toute mission jouée. */
const WELCOME_WINDOW_MS = 24 * 60 * 60 * 1000;

function isNewAccount(createdAt: string | null | undefined, now = Date.now()) {
  const created = createdAt ? new Date(createdAt).getTime() : Number.NaN;
  return Number.isFinite(created) && now - created < WELCOME_WINDOW_MS;
}

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
  const [{ data: profile }, roadmap, canAccessTeachers, placement, practice, badges, league] = await Promise.all([
    adminClient
      .from("profiles")
      .select("username, xp, gold, daily_played_games, daily_streak, last_game_date, last_daily_bonus_date, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    getUserCourseRoadmap(user.id),
    isAdminOrTeacher(),
    getPlacementStatus(user.id),
    getUserCoursePractice(user.id),
    // Rattrape les badges gagnés hors des parties (test de niveau, mission validée depuis la carte).
    loadBadgesWithSync(user.id),
    getWeeklyLeague(user.id, { limit: 1, withProfiles: false }),
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

  const playedMissions = roadmap.entries.filter(
    (entry) => entry.status === "completed" && !isCoursePlacementSkip(entry.missionTelemetry)
  ).length;
  const showWelcomeGold = playedMissions === 0 && isNewAccount(profile?.created_at);

  const totalStars = sumStars(roadmap.entries.map((entry) => getMissionStars(entry, practice.get(entry.courseId))));
  const currentPracticeBest = currentCourse ? practice.get(currentCourse.courseId) ?? 0 : 0;
  const missionStars = currentCourse ? getMissionStars(currentCourse, currentPracticeBest) : null;

  return (
    <>
      <HomeView
        greetingLabel={greeting()}
        username={username}
        userId={user.id}
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
        welcomeGold={showWelcomeGold ? WELCOME_GOLD : null}
        latestBadges={badges.all.slice(0, 3)}
        badgeCount={badges.all.length}
        week={
          league.available
            ? { rank: league.me?.rank ?? null, xp: league.me?.xp ?? 0, totalPlayers: league.totalPlayers, resetLabel: league.resetLabel }
            : null
        }
        missionStars={missionStars}
        missionPracticeBest={currentPracticeBest}
        totalStars={totalStars}
        maxStars={roadmap.entries.length * STARS_PER_MISSION}
      />
      {badges.newlyEarned.length > 0 ? <RewardOnMount detail={{ badges: badges.newlyEarned }} /> : null}
    </>
  );
}
