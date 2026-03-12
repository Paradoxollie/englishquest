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
  gamesPlayedToday: number;
  dailyPlayedGames: string[];
  requiredGames: string[];
  dailyGoalProgress: number;
  lastPlayedDate: string | null;
};

export async function getUserHomeData(userId: string): Promise<UserHomeData> {
  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("daily_played_games, daily_streak, last_game_date")
    .eq("id", userId)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const lastGameDate = profile?.last_game_date || null;
  const dailyPlayedGames =
    lastGameDate === today ? profile?.daily_played_games || [] : [];
  const requiredGames = getDailyRequiredGames(new Date());
  const dailyGoalProgress = requiredGames.filter((slug) =>
    dailyPlayedGames.includes(slug)
  ).length;

  return {
    currentCourse: null,
    dailyStreak: profile?.daily_streak || 0,
    gamesPlayedToday: dailyPlayedGames.length,
    dailyPlayedGames,
    requiredGames,
    dailyGoalProgress,
    lastPlayedDate: lastGameDate,
  };
}
