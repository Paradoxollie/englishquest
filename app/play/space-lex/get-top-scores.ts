"use server";

/**
 * Server functions to fetch top scores for Lexicon Blaster
 * Note: This game has NO difficulty levels - all scores are global
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ShopItem } from "@/types/shop";

export interface TopScoreEntry {
    user_id: string;
    username: string;
    score: number;
    wave: number;
    rank: number;
    equipped_avatar?: ShopItem | null;
    equipped_background?: ShopItem | null;
    equipped_title?: ShopItem | null;
}

/**
 * Get top 3 global scores (no difficulty - single global leaderboard)
 */
export async function getTopGlobalScores(): Promise<TopScoreEntry[]> {
    const adminClient = createSupabaseAdminClient();

    // Get the Lexicon Blaster game ID
    const { data: game } = await adminClient
        .from("games")
        .select("id")
        .eq("slug", "space-lex")
        .single();

    if (!game) {
        return [];
    }

    const gameId = game.id;

    // Get all scores for this game (all difficulties combined)
    const { data: scores } = await adminClient
        .from("game_scores")
        .select("user_id, score, max_score")
        .eq("game_id", gameId)
        .order("score", { ascending: false });

    if (!scores || scores.length === 0) {
        return [];
    }

    // Group by user_id and get best score per user
    const userBestScores = new Map<string, { score: number; wave: number }>();
    for (const entry of scores) {
        const current = userBestScores.get(entry.user_id);
        if (!current || entry.score > current.score) {
            userBestScores.set(entry.user_id, {
                score: entry.score,
                wave: entry.max_score || 1,
            });
        }
    }

    // Get user IDs
    const userIds = Array.from(userBestScores.keys());

    if (userIds.length === 0) {
        return [];
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
        .map(([userId, data]) => {
            const equipped = equippedMap.get(userId);
            return {
                user_id: userId,
                username: profileMap.get(userId) || "Unknown",
                score: data.score,
                wave: data.wave,
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

    return entries;
}

/**
 * Get user's personal best score (no difficulty)
 */
export async function getUserPersonalBest(): Promise<{ score: number; wave: number } | null> {
    const supabase = await createSupabaseServerClient();
    const adminClient = createSupabaseAdminClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get the Lexicon Blaster game ID
    const { data: game } = await adminClient
        .from("games")
        .select("id")
        .eq("slug", "space-lex")
        .single();

    if (!game) {
        return null;
    }

    const { data: bestScore } = await adminClient
        .from("game_scores")
        .select("score, max_score")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .order("score", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (!bestScore) {
        return null;
    }

    return {
        score: bestScore.score,
        wave: bestScore.max_score || 1,
    };
}
