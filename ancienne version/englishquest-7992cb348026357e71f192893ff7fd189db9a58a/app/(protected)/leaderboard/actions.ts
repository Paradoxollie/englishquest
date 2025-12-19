"use server";

/**
 * Server actions to fetch leaderboard data for any game
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Difficulty } from "@/lib/profile/leveling";
import type { ShopItem } from "@/types/shop";

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  best_score: number;
  games_played: number;
  rank: number;
  equipped_avatar?: ShopItem | null;
  equipped_background?: ShopItem | null;
  equipped_title?: ShopItem | null;
}

export interface LeaderboardData {
  easy: LeaderboardEntry[];
  medium: LeaderboardEntry[];
  hard: LeaderboardEntry[];
}

/**
 * Get leaderboard data for a specific game
 */
export async function getGameLeaderboard(gameId: string): Promise<LeaderboardData> {
  const adminClient = createSupabaseAdminClient();

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const result: LeaderboardData = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const difficulty of difficulties) {
    // Get all scores for this game and difficulty
    const { data: scores, error } = await adminClient
      .from("game_scores")
      .select("user_id, score")
      .eq("game_id", gameId)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false });

    if (error || !scores || scores.length === 0) {
      continue;
    }

    // Get unique user IDs
    const userIds = [...new Set(scores.map((s) => s.user_id))];

    // Fetch usernames
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p.username])
    );

    // Fetch equipped items for all users
    const { data: equippedItems } = await adminClient
      .from("user_equipped_items")
      .select(`
        user_id,
        equipped_avatar:shop_items!equipped_avatar_id(*),
        equipped_background:shop_items!equipped_background_id(*),
        equipped_title:shop_items!equipped_title_id(*)
      `)
      .in("user_id", userIds);

    const equippedMap = new Map<string, { avatar?: ShopItem | null; background?: ShopItem | null; title?: ShopItem | null }>();
    if (equippedItems) {
      for (const item of equippedItems) {
        const avatar = Array.isArray(item.equipped_avatar) 
          ? item.equipped_avatar[0] 
          : item.equipped_avatar;
        const background = Array.isArray(item.equipped_background) 
          ? item.equipped_background[0] 
          : item.equipped_background;
        const title = Array.isArray(item.equipped_title) 
          ? item.equipped_title[0] 
          : item.equipped_title;
        equippedMap.set(item.user_id, { avatar, background, title });
      }
    }

    // Group by user_id and calculate best score and games played
    const userMap = new Map<
      string,
      { username: string; bestScore: number; gamesPlayed: number }
    >();

    for (const entry of scores) {
      const userId = entry.user_id;
      const score = entry.score;
      const username = profileMap.get(userId) || "Unknown";

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          username,
          bestScore: score,
          gamesPlayed: 1,
        });
      } else {
        const userData = userMap.get(userId)!;
        userData.bestScore = Math.max(userData.bestScore, score);
        userData.gamesPlayed += 1;
      }
    }

    // Convert to array and sort by best score
    const entries: LeaderboardEntry[] = Array.from(userMap.entries())
      .map(([userId, data]) => {
        const equipped = equippedMap.get(userId);
        return {
          user_id: userId,
          username: data.username,
          best_score: data.bestScore,
          games_played: data.gamesPlayed,
          rank: 0, // Will be set after sorting
          equipped_avatar: equipped?.avatar || null,
          equipped_background: equipped?.background || null,
          equipped_title: equipped?.title || null,
        };
      })
      .sort((a, b) => b.best_score - a.best_score)
      .slice(0, 5) // Top 5
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    result[difficulty] = entries;
  }

  return result;
}

