"use server";

/**
 * Server functions to fetch top scores for Speed Verb Challenge
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getGameLeaderboards,
  type PublicLeaderboardEntry,
} from "@/lib/games/leaderboard-service";
import type { Difficulty } from "@/lib/profile/leveling";

import type { ShopItem } from "@/types/shop";

export interface TopScoreEntry {
  user_id: string;
  username: string;
  score: number;
  rank: number;
  equipped_avatar?: ShopItem | null;
  equipped_background?: ShopItem | null;
  equipped_title?: ShopItem | null;
}

export interface TopScoresByDifficulty {
  easy: TopScoreEntry[];
  medium: TopScoreEntry[];
  hard: TopScoreEntry[];
}

export interface SpeedVerbLeaderboardData {
  easy: PublicLeaderboardEntry[];
  medium: PublicLeaderboardEntry[];
  hard: PublicLeaderboardEntry[];
}

/**
 * Get top 3 global scores for each difficulty
 */
export async function getTopGlobalScores(): Promise<TopScoresByDifficulty> {
  const leaderboards = await getSpeedVerbLeaderboards(3);

  return {
    easy: mapLeaderboardEntries(leaderboards.easy),
    medium: mapLeaderboardEntries(leaderboards.medium),
    hard: mapLeaderboardEntries(leaderboards.hard),
  };
}

export async function getSpeedVerbLeaderboards(limit = 10): Promise<SpeedVerbLeaderboardData> {
  return getGameLeaderboards({
    slug: "speed-verb-challenge",
    buckets: [
      { key: "easy", difficulty: "easy" },
      { key: "medium", difficulty: "medium" },
      { key: "hard", difficulty: "hard" },
    ],
    limit,
  });
}

function mapLeaderboardEntries(entries: PublicLeaderboardEntry[]): TopScoreEntry[] {
  return entries.map((entry) => ({
    user_id: entry.user_id,
    username: entry.username,
    score: entry.best_score,
    rank: entry.rank,
    equipped_avatar: entry.equipped_avatar,
    equipped_background: entry.equipped_background,
    equipped_title: entry.equipped_title,
  }));
}

/**
 * Get user's personal best score for each difficulty
 */
export async function getUserPersonalBests(): Promise<{
  easy: number | null;
  medium: number | null;
  hard: number | null;
}> {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { easy: null, medium: null, hard: null };
  }

  // Get the Speed Verb Challenge game ID
  const { data: game } = await adminClient
    .from("games")
    .select("id")
    .eq("slug", "speed-verb-challenge")
    .single();

  if (!game) {
    return { easy: null, medium: null, hard: null };
  }

  const gameId = game.id;
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const result: { easy: number | null; medium: number | null; hard: number | null } = {
    easy: null,
    medium: null,
    hard: null,
  };

  for (const difficulty of difficulties) {
    const { data: bestScore } = await adminClient
      .from("game_scores")
      .select("score")
      .eq("user_id", user.id)
      .eq("game_id", gameId)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    result[difficulty] = bestScore?.score ?? null;
  }

  return result;
}
