"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDailyChallengeState } from "@/lib/profile/daily-challenge";

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
  dailyGoalTarget: number;
  dailyGoalReached: boolean;
  dailyBonusXp: number;
  dailyBonusGold: number;
  dailyBonusClaimedToday: boolean;
  dailyChallengeLabel: string;
  nextRefreshLabel: string;
  lastPlayedDate: string | null;
};

export async function getUserHomeData(userId: string): Promise<UserHomeData> {
  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("daily_played_games, daily_streak, last_game_date, last_daily_bonus_date")
    .eq("id", userId)
    .single();

  const dailyChallenge = getDailyChallengeState(profile);

  return {
    currentCourse: null,
    dailyStreak: dailyChallenge.dailyStreak,
    gamesPlayedToday: dailyChallenge.dailyPlayedGames.length,
    dailyPlayedGames: dailyChallenge.dailyPlayedGames,
    requiredGames: dailyChallenge.requiredGames,
    dailyGoalProgress: dailyChallenge.dailyGoalProgress,
    dailyGoalTarget: dailyChallenge.dailyGoalTarget,
    dailyGoalReached: dailyChallenge.dailyGoalReached,
    dailyBonusXp: dailyChallenge.xpBonus,
    dailyBonusGold: dailyChallenge.goldBonus,
    dailyBonusClaimedToday: dailyChallenge.bonusClaimedToday,
    dailyChallengeLabel: dailyChallenge.challengeLabel,
    nextRefreshLabel: dailyChallenge.nextRefreshLabel,
    lastPlayedDate: profile?.last_game_date ?? null,
  };
}
