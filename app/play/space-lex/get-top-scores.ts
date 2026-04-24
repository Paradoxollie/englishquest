"use server";

/**
 * Server functions to fetch top scores for Lexicon Blaster
 * Note: This game has NO difficulty levels - all scores are global
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
    getGameLeaderboards,
    type PublicLeaderboardEntry,
} from "@/lib/games/leaderboard-service";
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

export interface LexiconBlasterLeaderboardEntry extends PublicLeaderboardEntry {
    max_score: number;
}

/**
 * Get top 3 global scores (no difficulty - single global leaderboard)
 */
export async function getTopGlobalScores(): Promise<TopScoreEntry[]> {
    return (await getLexiconBlasterLeaderboard(3)).map((entry) => ({
        user_id: entry.user_id,
        username: entry.username,
        score: entry.best_score,
        wave: entry.max_score || 1,
        rank: entry.rank,
        equipped_avatar: entry.equipped_avatar,
        equipped_background: entry.equipped_background,
        equipped_title: entry.equipped_title,
    }));
}

export async function getLexiconBlasterLeaderboard(
    limit = 10
): Promise<LexiconBlasterLeaderboardEntry[]> {
    const leaderboards = await getGameLeaderboards({
        slug: "space-lex",
        buckets: [{ key: "global" }],
        limit,
        includeMaxScore: true,
    });

    return leaderboards.global.map((entry) => ({
        ...entry,
        max_score: entry.max_score || 1,
    }));
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
