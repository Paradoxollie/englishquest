"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDailyRequiredGames } from "@/lib/profile/daily-challenge";

export type UserHomeData = {
  currentCourse: {
    id: string;
    course_number: number;
    title: string;
    status: string;
  } | null;
  dailyStreak: number;
  gamesPlayedToday: number; // Keep for backward compat or just total count
  dailyPlayedGames: string[]; // Specific games played
  requiredGames: string[]; // Specific games required
  dailyGoalProgress: number; // 0-3
  lastPlayedDate: string | null;
};

/**
 * Calcule la série quotidienne basée sur les scores de jeux
 */
function calculateStreak(playedDates: string[]): number {
  if (playedDates.length === 0) return 0;

  // Trier les dates et enlever les doublons (un seul jeu par jour compte)
  const uniqueDates = Array.from(
    new Set(
      playedDates.map((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // Plus récent en premier

  if (uniqueDates.length === 0) return 0;

  // Vérifier si le dernier jour joué est aujourd'hui ou hier
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // Si le dernier jour joué n'est ni aujourd'hui ni hier, la série est rompue
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  // Compter les jours consécutifs
  let streak = uniqueDates[0] === todayStr ? 1 : 0;
  let currentDate = uniqueDates[0] === todayStr ? today : yesterday;

  for (let i = uniqueDates[0] === todayStr ? 1 : 0; i < uniqueDates.length; i++) {
    const dateStr = uniqueDates[i];
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    const expectedStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, "0")}-${String(expectedDate.getDate()).padStart(2, "0")}`;

    if (dateStr === expectedStr) {
      streak++;
      currentDate = expectedDate;
    } else {
      break;
    }
  }

  return streak;
}

export async function getUserHomeData(userId: string): Promise<UserHomeData> {
  const adminClient = createSupabaseAdminClient();

  // Fetch profile data including daily details
  const { data: profile } = await adminClient
    .from("profiles")
    .select("daily_games_count, daily_played_games, daily_streak, last_game_date")
    .eq("id", userId)
    .single();

  const today = new Date().toISOString().split('T')[0];
  const lastGameDate = profile?.last_game_date || null;

  // Verify dates for display consistency
  // If last game date is not today, the daily progress is 0.
  let dailyPlayedGames: string[] = [];
  if (lastGameDate === today) {
    dailyPlayedGames = profile?.daily_played_games || [];
  }

  const requiredGames = getDailyRequiredGames(new Date());

  // Calculate generic progress (count of required games played)
  const completedCount = requiredGames.filter(slug => dailyPlayedGames.includes(slug)).length;

  // Daily Streak
  const dailyStreak = profile?.daily_streak || 0;

  // Fetch current course status
  let currentCourse = null;

  try {
    // Search for course in progress
    const { data: inProgressCourse } = await adminClient
      .from("user_course_progress")
      .select(`
        status,
        course_id,
        courses:course_id (
          course_number,
          title
        )
      `)
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (inProgressCourse && inProgressCourse.courses && !Array.isArray(inProgressCourse.courses)) {
      const course = inProgressCourse.courses as any;
      currentCourse = {
        id: inProgressCourse.course_id,
        course_number: course.course_number,
        title: course.title,
        status: inProgressCourse.status,
      };
    } else {
      // If no course in progress, search for the first unlocked course
      const { data: unlockedCourse } = await adminClient
        .from("user_course_progress")
        .select(`
          status,
          course_id,
          courses:course_id (
            course_number,
            title
          )
        `)
        .eq("user_id", userId)
        .eq("status", "unlocked")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (unlockedCourse && unlockedCourse.courses && !Array.isArray(unlockedCourse.courses)) {
        const course = unlockedCourse.courses as any;
        currentCourse = {
          id: unlockedCourse.course_id,
          course_number: course.course_number,
          title: course.title,
          status: unlockedCourse.status,
        };
      }
    }
  } catch (error) {
    console.log("Course progress table might not exist yet");
  }

  return {
    currentCourse,
    dailyStreak,
    gamesPlayedToday: dailyPlayedGames.length,
    dailyPlayedGames,
    requiredGames,
    dailyGoalProgress: completedCount,
    lastPlayedDate: lastGameDate,
  };
}

