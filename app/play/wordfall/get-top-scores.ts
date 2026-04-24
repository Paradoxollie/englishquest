"use server";

/**
 * Server functions to fetch top scores for Wordfall
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

export interface TopScoresByMode {
  exact: TopScoreEntry[];
  free: TopScoreEntry[];
}

export interface WordfallLeaderboardData {
  exact: PublicLeaderboardEntry[];
  free: PublicLeaderboardEntry[];
}

/**
 * Map Wordfall mode to difficulty string
 */
function mapModeToDifficulty(mode: "exact" | "free"): Difficulty {
  return mode === "exact" ? "easy" : "hard";
}

/**
 * Get top 3 global scores for each mode
 */
export async function getTopGlobalScores(): Promise<TopScoresByMode> {
  const leaderboards = await getWordfallLeaderboards(3);

  return {
    exact: mapLeaderboardEntries(leaderboards.exact),
    free: mapLeaderboardEntries(leaderboards.free),
  };
}

export async function getWordfallLeaderboards(limit = 10): Promise<WordfallLeaderboardData> {
  return getGameLeaderboards({
    slug: "wordfall",
    buckets: [
      { key: "exact", difficulty: mapModeToDifficulty("exact") },
      { key: "free", difficulty: mapModeToDifficulty("free") },
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
 * Get user's personal best score for each mode
 */
export async function getUserPersonalBests(): Promise<{
  exact: number | null;
  free: number | null;
}> {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { exact: null, free: null };
  }

  // Get the Wordfall game ID
  const { data: game } = await adminClient
    .from("games")
    .select("id")
    .eq("slug", "wordfall")
    .single();

  if (!game) {
    return { exact: null, free: null };
  }

  const gameId = game.id;
  const modes: Array<"exact" | "free"> = ["exact", "free"];
  const result: { exact: number | null; free: number | null } = {
    exact: null,
    free: null,
  };

  for (const mode of modes) {
    const difficulty = mapModeToDifficulty(mode);
    
    const { data: bestScore } = await adminClient
      .from("game_scores")
      .select("score")
      .eq("user_id", user.id)
      .eq("game_id", gameId)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false })
      .limit(1)
      .maybeSingle();

    result[mode] = bestScore?.score ?? null;
  }

  return result;
}







