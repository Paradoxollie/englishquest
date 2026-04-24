import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Difficulty } from "@/lib/profile/leveling";
import type { ShopItem } from "@/types/shop";

type ScoreOrder = "asc" | "desc";

export interface LeaderboardBucket<TKey extends string> {
  key: TKey;
  difficulty?: Difficulty;
}

export interface PublicLeaderboardEntry {
  user_id: string;
  username: string;
  best_score: number;
  games_played: number;
  rank: number;
  max_score?: number;
  equipped_avatar?: ShopItem | null;
  equipped_background?: ShopItem | null;
  equipped_title?: ShopItem | null;
}

type ScoreRow = {
  user_id: string;
  score: number;
  max_score?: number | null;
};

type EquippedItemRow = {
  user_id: string;
  equipped_avatar?: ShopItem | ShopItem[] | null;
  equipped_background?: ShopItem | ShopItem[] | null;
  equipped_title?: ShopItem | ShopItem[] | null;
};

function createEmptyResult<TKey extends string>(
  buckets: readonly LeaderboardBucket<TKey>[]
): Record<TKey, PublicLeaderboardEntry[]> {
  const result = {} as Record<TKey, PublicLeaderboardEntry[]>;

  for (const bucket of buckets) {
    result[bucket.key] = [];
  }

  return result;
}

function firstItem(item: ShopItem | ShopItem[] | null | undefined): ShopItem | null {
  return Array.isArray(item) ? item[0] ?? null : item ?? null;
}

function isBetterScore(nextScore: number, currentScore: number, order: ScoreOrder) {
  return order === "asc" ? nextScore < currentScore : nextScore > currentScore;
}

export async function getGameLeaderboards<TKey extends string>({
  slug,
  buckets,
  scoreOrder = "desc",
  limit = 10,
  includeMaxScore = false,
  rowLimit = 1000,
}: {
  slug: string;
  buckets: readonly LeaderboardBucket<TKey>[];
  scoreOrder?: ScoreOrder;
  limit?: number;
  includeMaxScore?: boolean;
  rowLimit?: number;
}): Promise<Record<TKey, PublicLeaderboardEntry[]>> {
  const result = createEmptyResult(buckets);
  const adminClient = createSupabaseAdminClient();

  const { data: game, error: gameError } = await adminClient
    .from("games")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (gameError || !game) {
    console.error(`[leaderboard] Unable to resolve game "${slug}"`, gameError);
    return result;
  }

  for (const bucket of buckets) {
    let query = adminClient
      .from("game_scores")
      .select("user_id,score,max_score")
      .eq("game_id", game.id)
      .order("score", { ascending: scoreOrder === "asc" })
      .limit(rowLimit);

    if (bucket.difficulty) {
      query = query.eq("difficulty", bucket.difficulty);
    }

    const { data: scores, error: scoresError } = await query;

    if (scoresError || !scores || scores.length === 0) {
      if (scoresError) {
        console.error(
          `[leaderboard] Unable to fetch scores for "${slug}" (${bucket.key})`,
          scoresError
        );
      }
      continue;
    }

    const userStats = new Map<
      string,
      { bestScore: number; maxScore?: number; gamesPlayed: number }
    >();

    for (const scoreRow of scores as ScoreRow[]) {
      const current = userStats.get(scoreRow.user_id);

      if (!current) {
        userStats.set(scoreRow.user_id, {
          bestScore: scoreRow.score,
          maxScore: includeMaxScore ? scoreRow.max_score ?? undefined : undefined,
          gamesPlayed: 1,
        });
        continue;
      }

      userStats.set(scoreRow.user_id, {
        bestScore: isBetterScore(scoreRow.score, current.bestScore, scoreOrder)
          ? scoreRow.score
          : current.bestScore,
        maxScore:
          includeMaxScore && isBetterScore(scoreRow.score, current.bestScore, scoreOrder)
            ? scoreRow.max_score ?? undefined
            : current.maxScore,
        gamesPlayed: current.gamesPlayed + 1,
      });
    }

    const userIds = Array.from(userStats.keys());

    if (userIds.length === 0) {
      continue;
    }

    const [{ data: profiles, error: profilesError }, { data: equippedItems, error: equippedError }] =
      await Promise.all([
        adminClient.from("profiles").select("id, username").in("id", userIds),
        adminClient
          .from("user_equipped_items")
          .select(
            `
              user_id,
              equipped_avatar:shop_items!equipped_avatar_id(*),
              equipped_background:shop_items!equipped_background_id(*),
              equipped_title:shop_items!equipped_title_id(*)
            `
          )
          .in("user_id", userIds),
      ]);

    if (profilesError) {
      console.error(
        `[leaderboard] Unable to fetch profiles for "${slug}" (${bucket.key})`,
        profilesError
      );
    }

    if (equippedError) {
      console.error(
        `[leaderboard] Unable to fetch equipped items for "${slug}" (${bucket.key})`,
        equippedError
      );
    }

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile.username]));
    const equippedMap = new Map<
      string,
      { avatar?: ShopItem | null; background?: ShopItem | null; title?: ShopItem | null }
    >();

    for (const item of (equippedItems || []) as EquippedItemRow[]) {
      equippedMap.set(item.user_id, {
        avatar: firstItem(item.equipped_avatar),
        background: firstItem(item.equipped_background),
        title: firstItem(item.equipped_title),
      });
    }

    result[bucket.key] = Array.from(userStats.entries())
      .map(([userId, stats]) => {
        const equipped = equippedMap.get(userId);

        return {
          user_id: userId,
          username: profileMap.get(userId) || "Unknown",
          best_score: stats.bestScore,
          games_played: stats.gamesPlayed,
          rank: 0,
          max_score: stats.maxScore,
          equipped_avatar: equipped?.avatar || null,
          equipped_background: equipped?.background || null,
          equipped_title: equipped?.title || null,
        };
      })
      .sort((a, b) =>
        scoreOrder === "asc" ? a.best_score - b.best_score : b.best_score - a.best_score
      )
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }

  return result;
}
