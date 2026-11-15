"use server";

/**
 * Server actions to fetch leaderboard data for any game
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { getGameLeaderboards, type PublicLeaderboardEntry } from "@/lib/games/leaderboard-service";

export type LeaderboardEntry = PublicLeaderboardEntry;

export interface LeaderboardData {
  easy: LeaderboardEntry[];
  medium: LeaderboardEntry[];
  hard: LeaderboardEntry[];
}

/**
 * Get leaderboard data for a specific game using the shared paginated leaderboard service.
 */
export async function getGameLeaderboard(gameId: string): Promise<LeaderboardData> {
  // Classements réservés aux joueurs connectés (page Confidentialité).
  const user = await getServerUser();
  if (!user) {
    return { easy: [], medium: [], hard: [] };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: game } = await adminClient
    .from("games")
    .select("slug")
    .eq("id", gameId)
    .maybeSingle();

  if (!game?.slug) {
    return { easy: [], medium: [], hard: [] };
  }

  return getGameLeaderboards({
    slug: game.slug,
    buckets: [
      { key: "easy", difficulty: "easy" },
      { key: "medium", difficulty: "medium" },
      { key: "hard", difficulty: "hard" },
    ],
    scoreOrder: game.slug === "flash-translation" ? "asc" : "desc",
    limit: 10,
  });
}

