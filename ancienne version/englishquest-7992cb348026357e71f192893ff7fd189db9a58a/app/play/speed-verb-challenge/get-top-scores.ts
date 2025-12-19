"use server";

/**
 * Server functions to fetch top scores for Speed Verb Challenge
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

/**
 * Get top 3 global scores for each difficulty
 */
export async function getTopGlobalScores(): Promise<TopScoresByDifficulty> {
  const adminClient = createSupabaseAdminClient();

  // Get the Speed Verb Challenge game ID
  const { data: game } = await adminClient
    .from("games")
    .select("id")
    .eq("slug", "speed-verb-challenge")
    .single();

  if (!game) {
    return { easy: [], medium: [], hard: [] };
  }

  const gameId = game.id;
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const result: TopScoresByDifficulty = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const difficulty of difficulties) {
    // Get top scores for this difficulty, grouped by user (best score per user)
    const { data: scores } = await adminClient
      .from("game_scores")
      .select("user_id, score")
      .eq("game_id", gameId)
      .eq("difficulty", difficulty)
      .order("score", { ascending: false });

    if (!scores || scores.length === 0) {
      continue;
    }

    // Group by user_id and get best score per user
    const userBestScores = new Map<string, number>();
    for (const entry of scores) {
      const current = userBestScores.get(entry.user_id) ?? 0;
      userBestScores.set(entry.user_id, Math.max(current, entry.score));
    }

    // Get user IDs
    const userIds = Array.from(userBestScores.keys());

    if (userIds.length === 0) {
      continue;
    }

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

    // Create entries and sort by score
    const entries: TopScoreEntry[] = Array.from(userBestScores.entries())
      .map(([userId, score]) => {
        const equipped = equippedMap.get(userId);
        return {
          user_id: userId,
          username: profileMap.get(userId) || "Unknown",
          score,
          rank: 0, // Will be set after sorting
          equipped_avatar: equipped?.avatar || null,
          equipped_background: equipped?.background || null,
          equipped_title: equipped?.title || null,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    result[difficulty] = entries;
  }

  return result;
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

