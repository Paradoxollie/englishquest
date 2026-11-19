import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginForCurrentPage } from "@/lib/navigation/login-return";
import { PageHead } from "@/components/comic/page-head";
import { WeeklyLeagueSection } from "@/components/rewards/weekly-league";
import { games as gameCatalog } from "@/lib/games/config";
import { getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";
import { getGameStandings } from "@/lib/games/leaderboard-service";
import { getWeeklyLeague } from "@/lib/profile/league-server";
import { getServerUser } from "@/lib/supabase/auth-cache";
import { GameLeaderboard, type LeaderboardGameInfo } from "./components/game-leaderboard";

export const metadata: Metadata = { title: "Classements" };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string | string[] }>;
}) {
  const params = await searchParams;
  const user = await getServerUser();

  if (!user) {
    redirect(await loginForCurrentPage("/leaderboard"));
  }

  const requestedSlugRaw = Array.isArray(params.game) ? params.game[0] : params.game;
  const requestedGame = requestedSlugRaw ? gameCatalog.find((game) => game.slug === requestedSlugRaw) : undefined;
  const initialSlug = requestedGame?.slug ?? gameCatalog[0]?.slug ?? "";
  const initialMeta = getGameLeaderboardMeta(initialSlug);

  const [league, initialBuckets] = await Promise.all([
    getWeeklyLeague(user.id),
    initialSlug
      ? getGameStandings({
          slug: initialSlug,
          buckets: initialMeta.buckets.map((bucket) => ({
            key: bucket.key,
            difficulty: bucket.difficulty,
          })),
          userId: user.id,
          scoreOrder: initialMeta.scoreOrder,
          limit: 10,
        })
      : Promise.resolve({}),
  ]);

  const games: LeaderboardGameInfo[] = gameCatalog.map((game) => ({
    slug: game.slug,
    name: game.name,
    description: game.description,
  }));

  return (
    <div>
      <PageHead caption="Classements" title="Ligue et records">
        Chaque semaine, une ligue repart de zéro : l&apos;XP gagnée depuis lundi compte. En dessous, les records de
        chaque jeu.
      </PageHead>

      <div className="eq-container eq-section space-y-10">
        <WeeklyLeagueSection league={league} currentUserId={user.id} />

        <section className="eq-records eq-section-divider" aria-labelledby="records-title">
          <div className="eq-section-head">
            <div>
              <span className="eq-caption">Records par jeu</span>
              <h2 id="records-title" className="eq-h2">
                Les meilleurs scores
              </h2>
            </div>
          </div>
          <p className="eq-muted eq-records-note">
            Un classement pour chacun des neuf jeux. Seul ton meilleur score compte, et une partie enregistrée suffit
            pour y figurer.
          </p>
          <GameLeaderboard
            games={games}
            currentUserId={user.id}
            initialSlug={initialSlug}
            initialData={{ slug: initialSlug, buckets: initialBuckets }}
          />
        </section>
      </div>
    </div>
  );
}
