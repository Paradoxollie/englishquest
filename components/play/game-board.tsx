import Link from "next/link";
import { getGameLeaderboards, getPersonalBests, type LeaderboardBucket } from "@/lib/games/leaderboard-service";
import type { Difficulty } from "@/lib/profile/leveling";
import { GameBoardView, type BoardBucketView } from "./game-board-view";

export type GameBoardBucket = { key: string; label: string; difficulty?: Difficulty };

/**
 * Classement d'un jeu pour la colonne latérale : top 10 par catégorie,
 * record personnel du joueur connecté. Composant serveur.
 */
export async function GameBoard({
  slug,
  buckets,
  scoreOrder = "desc",
  format = "points",
  userId,
  title,
}: {
  slug: string;
  buckets: GameBoardBucket[];
  scoreOrder?: "asc" | "desc";
  format?: "points" | "seconds";
  userId: string | null;
  title?: string;
}) {
  // Les pseudos des élèves ne s'affichent qu'aux joueurs connectés (page Confidentialité).
  if (!userId) {
    return (
      <section className="eq-card eq-game-board" aria-label={title ?? "Classement"}>
        <h3>{title ?? "Classement"}</h3>
        <p className="eq-muted eq-board-empty">
          Le classement est visible une fois connecté. Avec un compte, tes scores y entrent et te rapportent de
          l&apos;expérience.
        </p>
        <Link href="/auth/signup" className="eq-btn eq-btn-primary eq-btn-sm">
          Créer un compte gratuit
        </Link>
      </section>
    );
  }

  const serviceBuckets: LeaderboardBucket<string>[] = buckets.map((bucket) => ({
    key: bucket.key,
    difficulty: bucket.difficulty,
  }));

  let boards: Record<string, { user_id: string }[]> = {};
  let bests: Record<string, number | null> = {};
  try {
    const [boardResult, bestResult] = await Promise.all([
      getGameLeaderboards({ slug, buckets: serviceBuckets, scoreOrder, limit: 10 }),
      userId ? getPersonalBests({ slug, userId, buckets: serviceBuckets, scoreOrder }) : Promise.resolve({}),
    ]);
    boards = boardResult;
    bests = bestResult as Record<string, number | null>;
  } catch (error) {
    console.error(`[GameBoard] ${slug}`, error);
  }

  const view: BoardBucketView[] = buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    entries: (boards[bucket.key] ?? []) as BoardBucketView["entries"],
    personalBest: bests[bucket.key] ?? null,
  }));

  return <GameBoardView buckets={view} currentUserId={userId} format={format} title={title} />;
}
