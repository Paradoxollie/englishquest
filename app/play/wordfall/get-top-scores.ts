"use server";

/**
 * Server functions to fetch top scores for Wordfall
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

export interface TopScoresByMode {
  exact: TopScoreEntry[];
  free: TopScoreEntry[];
}

/**
 * Map Wordfall mode to difficulty string
 */
function mapModeToDifficulty(mode: "exact" | "free"): Difficulty {
  return mode === "exact" ? "easy" : "hard";
}

/**
 * Map difficulty string to Wordfall mode
 */
function mapDifficultyToMode(difficulty: Difficulty): "exact" | "free" {
  return difficulty === "easy" ? "exact" : "free";
}

/**
 * Get top 3 global scores for each mode
 */
export async function getTopGlobalScores(): Promise<TopScoresByMode> {
  const adminClient = createSupabaseAdminClient();

  // Get the Wordfall game ID
  const { data: game } = await adminClient
    .from("games")
    .select("id")
    .eq("slug", "wordfall")
    .single();

  if (!game) {
    return { exact: [], free: [] };
  }

  const gameId = game.id;
  const modes: Array<"exact" | "free"> = ["exact", "free"];
  const result: TopScoresByMode = {
    exact: [],
    free: [],
  };

  for (const mode of modes) {
    const difficulty = mapModeToDifficulty(mode);
    
    // Get top scores for this mode, grouped by user (best score per user)
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

    result[mode] = entries;
  }

  return result;
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

