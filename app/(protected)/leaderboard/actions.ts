"use server";

/**
 * Server actions to fetch leaderboard data for any game
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";
import { getGameStandings, type BucketStandings, type PublicLeaderboardEntry } from "@/lib/games/leaderboard-service";
import { getServerUser } from "@/lib/supabase/auth-cache";

export type LeaderboardEntry = PublicLeaderboardEntry;

export interface LeaderboardData {
  slug: string;
  buckets: Record<string, BucketStandings>;
}

/**
 * Get leaderboard data for a game using its shared bucket & ordering configuration.
 */
export async function getGameLeaderboard(gameSlugOrId: string): Promise<LeaderboardData> {
  // Classements réservés aux joueurs connectés (page Confidentialité).
  const user = await getServerUser();
  if (!user) {
    return { slug: gameSlugOrId, buckets: {} };
  }

  let slug = gameSlugOrId;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gameSlugOrId)) {
    const adminClient = createSupabaseAdminClient();
    const { data: game } = await adminClient
      .from("games")
      .select("slug")
      .eq("id", gameSlugOrId)
      .maybeSingle();
    if (!game?.slug) {
      return { slug: gameSlugOrId, buckets: {} };
    }
    slug = game.slug;
  }

  const meta = getGameLeaderboardMeta(slug);
  const buckets = await getGameStandings({
    slug,
    buckets: meta.buckets.map((bucket) => ({
      key: bucket.key,
      difficulty: bucket.difficulty,
    })),
    userId: user.id,
    scoreOrder: meta.scoreOrder,
    limit: 10,
  });

  return { slug, buckets };
}
