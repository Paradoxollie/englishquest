import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Difficulty } from "@/lib/profile/leveling";
import type { ShopItem } from "@/types/shop";

type ScoreOrder = "asc" | "desc";

export interface LeaderboardBucket<TKey extends string> {
  key: TKey;
  difficulty?: Difficulty;
}

export interface BucketStandings {
  entries: PublicLeaderboardEntry[];
  totalPlayers: number;
  personalBest: number | null;
  myRank: number | null;
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

type RankedUserBucket = {
  totalPlayers: number;
  entries: PublicLeaderboardEntry[];
  personalBest: number | null;
  myRank: number | null;
};

async function computeBucketRanking<TKey extends string>({
  adminClient,
  gameId,
  slug,
  bucket,
  scoreOrder,
  limit,
  includeMaxScore,
  rowLimit,
  userId,
}: {
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  gameId: string;
  slug: string;
  bucket: LeaderboardBucket<TKey>;
  scoreOrder: ScoreOrder;
  limit: number;
  includeMaxScore: boolean;
  rowLimit: number;
  userId?: string | null;
}): Promise<RankedUserBucket> {
  const empty: RankedUserBucket = { totalPlayers: 0, entries: [], personalBest: null, myRank: null };
  // Une tranche des meilleurs scores peut ne contenir qu'un joueur très actif.
  // Parcourir toute l'histoire pour ne pas masquer les suivants ni sous-compter
  // les parties. rowLimit est la taille d'une page, pas un plafond d'historique.
  const pageSize = Math.max(1, Math.min(1000, Math.floor(rowLimit)));
  const scores: ScoreRow[] = [];
  let failed = false;

  for (let offset = 0; ; offset += pageSize) {
    let query = adminClient
      .from("game_scores")
      .select("user_id,score,max_score")
      .eq("game_id", gameId)
      .order("score", { ascending: scoreOrder === "asc" })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (bucket.difficulty) query = query.eq("difficulty", bucket.difficulty);
    const { data: page, error } = await query;
    if (error) {
      console.error(`[leaderboard] Unable to fetch scores for "${slug}" (${bucket.key})`, error);
      failed = true;
      break;
    }
    scores.push(...((page ?? []) as ScoreRow[]));
    if (!page || page.length < pageSize) break;
  }

  if (failed || scores.length === 0) {
    return empty;
  }

  const userStats = new Map<string, { bestScore: number; maxScore?: number; gamesPlayed: number }>();

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

  const allRanked = Array.from(userStats.entries()).sort(([leftId, left], [rightId, right]) => {
    const difference = scoreOrder === "asc" ? left.bestScore - right.bestScore : right.bestScore - left.bestScore;
    return difference || leftId.localeCompare(rightId);
  });

  const totalPlayers = allRanked.length;
  let personalBest: number | null = null;
  let myRank: number | null = null;

  if (userId) {
    const myIndex = allRanked.findIndex(([id]) => id === userId);
    if (myIndex >= 0) {
      myRank = myIndex + 1;
      personalBest = allRanked[myIndex][1].bestScore;
    }
  }

  const rankedStats = allRanked.slice(0, limit);
  const userIds = rankedStats.map(([id]) => id);

  if (userIds.length === 0) {
    return { totalPlayers, entries: [], personalBest, myRank };
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
    console.error(`[leaderboard] Unable to fetch profiles for "${slug}" (${bucket.key})`, profilesError);
  }
  if (equippedError) {
    console.error(`[leaderboard] Unable to fetch equipped items for "${slug}" (${bucket.key})`, equippedError);
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

  const entries = rankedStats
    .map(([id, stats]) => {
      const equipped = equippedMap.get(id);

      return {
        user_id: id,
        username: profileMap.get(id) || "Unknown",
        best_score: stats.bestScore,
        games_played: stats.gamesPlayed,
        rank: 0,
        max_score: stats.maxScore,
        equipped_avatar: equipped?.avatar || null,
        equipped_background: equipped?.background || null,
        equipped_title: equipped?.title || null,
      };
    })
    .sort((a, b) => (scoreOrder === "asc" ? a.best_score - b.best_score : b.best_score - a.best_score))
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return { totalPlayers, entries, personalBest, myRank };
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
    const ranked = await computeBucketRanking({
      adminClient,
      gameId: game.id,
      slug,
      bucket,
      scoreOrder,
      limit,
      includeMaxScore,
      rowLimit,
    });
    result[bucket.key] = ranked.entries;
  }

  return result;
}

/**
 * Classement complet d'un jeu par tranche : Top N, nombre total de joueurs,
 * record personnel et rang du joueur connecté (même s'il est hors du Top N).
 */
export async function getGameStandings<TKey extends string>({
  slug,
  buckets,
  userId,
  scoreOrder = "desc",
  limit = 10,
  includeMaxScore = false,
  rowLimit = 1000,
}: {
  slug: string;
  buckets: readonly LeaderboardBucket<TKey>[];
  userId?: string | null;
  scoreOrder?: ScoreOrder;
  limit?: number;
  includeMaxScore?: boolean;
  rowLimit?: number;
}): Promise<Record<TKey, BucketStandings>> {
  const result = {} as Record<TKey, BucketStandings>;
  for (const bucket of buckets) {
    result[bucket.key] = { entries: [], totalPlayers: 0, personalBest: null, myRank: null };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: game, error: gameError } = await adminClient
    .from("games")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (gameError || !game) {
    if (gameError) console.error(`[leaderboard] Unable to resolve game "${slug}"`, gameError);
    return result;
  }

  for (const bucket of buckets) {
    const ranked = await computeBucketRanking({
      adminClient,
      gameId: game.id,
      slug,
      bucket,
      scoreOrder,
      limit,
      includeMaxScore,
      rowLimit,
      userId,
    });
    result[bucket.key] = {
      entries: ranked.entries,
      totalPlayers: ranked.totalPlayers,
      personalBest: ranked.personalBest,
      myRank: ranked.myRank,
    };
  }

  return result;
}

/**
 * Record personnel d'un joueur par slug sur tous les jeux joués, en tenant
 * compte du sens de classement propre à chaque jeu (`asc` pour les temps).
 */
export async function getUserBestScoresBySlug(
  userId: string,
  scoreOrderBySlug: Record<string, ScoreOrder>
): Promise<Record<string, number>> {
  const adminClient = createSupabaseAdminClient();
  const result: Record<string, number> = {};
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await adminClient
      .from("game_scores")
      .select("score, games ( slug )")
      .eq("user_id", userId)
      .range(offset, offset + pageSize - 1);

    if (error || !data || data.length === 0) break;

    for (const row of data as Array<{ score: number; games: { slug: string } | Array<{ slug: string }> | null }>) {
      const game = Array.isArray(row.games) ? row.games[0] ?? null : row.games;
      const slug = game?.slug;
      if (!slug) continue;
      const order = scoreOrderBySlug[slug] ?? "desc";
      const existing = result[slug];
      if (existing === undefined || isBetterScore(row.score, existing, order)) {
        result[slug] = row.score;
      }
    }

    if (data.length < pageSize) break;
  }

  return result;
}

/**
 * Meilleur score personnel d'un joueur pour chaque tranche d'un jeu.
 * Null quand le joueur n'a pas encore de score dans cette tranche.
 */
export async function getPersonalBests<TKey extends string>({
  slug,
  userId,
  buckets,
  scoreOrder = "desc",
}: {
  slug: string;
  userId: string;
  buckets: readonly LeaderboardBucket<TKey>[];
  scoreOrder?: ScoreOrder;
}): Promise<Record<TKey, number | null>> {
  const result = {} as Record<TKey, number | null>;
  for (const bucket of buckets) {
    result[bucket.key] = null;
  }

  const adminClient = createSupabaseAdminClient();
  const { data: game } = await adminClient.from("games").select("id").eq("slug", slug).maybeSingle();
  if (!game) {
    return result;
  }

  for (const bucket of buckets) {
    let query = adminClient.from("game_scores").select("score")
      .eq("game_id", game.id).eq("user_id", userId)
      .order("score", { ascending: scoreOrder === "asc" }).limit(1);
    if (bucket.difficulty) query = query.eq("difficulty", bucket.difficulty);
    const { data: best, error } = await query.maybeSingle();
    if (!error && best) result[bucket.key] = best.score;
  }

  return result;
}
