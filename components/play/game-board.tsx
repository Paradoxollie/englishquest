import Link from "next/link";
import { getGameLeaderboardMeta, type LeaderboardScoreFormat, type LeaderboardScoreOrder } from "@/lib/games/leaderboard-config";
import { getGameStandings, type BucketStandings, type LeaderboardBucket } from "@/lib/games/leaderboard-service";
import type { Difficulty } from "@/lib/profile/leveling";
import { GameBoardView, type BoardBucketView } from "./game-board-view";

export type GameBoardBucket = { key: string; label: string; difficulty?: Difficulty };

/**
 * Classement d'un jeu pour la colonne latérale : top 10 par catégorie,
 * record personnel et rang du joueur connecté. Composant serveur.
 */
export async function GameBoard({
  slug,
  buckets,
  scoreOrder,
  format,
  userId,
  title,
}: {
  slug: string;
  buckets?: GameBoardBucket[];
  scoreOrder?: LeaderboardScoreOrder;
  format?: LeaderboardScoreFormat;
  userId: string | null;
  title?: string;
}) {
  const meta = getGameLeaderboardMeta(slug);
  const resolvedBuckets = buckets ?? meta.buckets;
  const resolvedOrder = scoreOrder ?? meta.scoreOrder;
  const resolvedFormat = format ?? meta.format;
  const resolvedTitle = title ?? meta.boardTitle;

  // Les pseudos des élèves ne s'affichent qu'aux joueurs connectés (page Confidentialité).
  if (!userId) {
    return (
      <section className="eq-card eq-game-board" aria-label={resolvedTitle}>
        <h3>{resolvedTitle}</h3>
        <p className="eq-muted eq-board-empty">
          Le classement est visible une fois connecté. Avec un compte, tes scores y entrent et te rapportent de
          l&apos;expérience.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/auth/signup?next=/play/${slug}`} className="eq-btn eq-btn-primary eq-btn-sm">
            Créer un compte gratuit
          </Link>
          <Link href={`/auth/login?next=/play/${slug}`} className="eq-btn eq-btn-ghost eq-btn-sm">
            Se connecter
          </Link>
        </div>
      </section>
    );
  }

  const serviceBuckets: LeaderboardBucket<string>[] = resolvedBuckets.map((bucket) => ({
    key: bucket.key,
    difficulty: bucket.difficulty,
  }));

  let standings: Record<string, BucketStandings> = {};
  try {
    standings = await getGameStandings({
      slug,
      buckets: serviceBuckets,
      userId,
      scoreOrder: resolvedOrder,
      limit: 10,
    });
  } catch (error) {
    console.error(`[GameBoard] ${slug}`, error);
  }

  const view: BoardBucketView[] = resolvedBuckets.map((bucket) => {
    const bucketData = standings[bucket.key];
    return {
      key: bucket.key,
      label: bucket.label,
      entries: bucketData?.entries ?? [],
      personalBest: bucketData?.personalBest ?? null,
      myRank: bucketData?.myRank ?? null,
      totalPlayers: bucketData?.totalPlayers ?? 0,
    };
  });

  return (
    <GameBoardView
      slug={slug}
      buckets={view}
      currentUserId={userId}
      format={resolvedFormat}
      title={resolvedTitle}
    />
  );
}
