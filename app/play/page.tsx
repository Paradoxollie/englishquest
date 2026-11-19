import { publicPageMetadata } from "@/lib/site/metadata";
import { getGuestRoadmap } from "@/lib/courses/guest-progress-server";
import Link from "next/link";
import { PageHead } from "@/components/comic/page-head";
import { GameCard } from "@/components/play/game-card";
import { resolveArt } from "@/lib/art-server";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { games } from "@/lib/games/config";
import { formatLeaderboardScore, getGameLeaderboardMeta } from "@/lib/games/leaderboard-config";
import { getUserBestScoresBySlug } from "@/lib/games/leaderboard-service";
import { getGamePresentation } from "@/lib/games/presentation";
import { getServerUser } from "@/lib/supabase/auth-cache";

export const metadata = publicPageMetadata({
  path: "/play",
  title: "Jeux d’anglais gratuits",
  description: "Neuf jeux pour s'entraîner en anglais : conjugaison, grammaire, vocabulaire, traduction, mémoire, orthographe et compréhension orale. Parties courtes, scores et classements.",
});

export default async function PlayPage() {
  const user = await getServerUser();
  const isLoggedIn = Boolean(user);
  const scoreOrderBySlug = Object.fromEntries(
    games.map((game) => [game.slug, getGameLeaderboardMeta(game.slug).scoreOrder])
  );
  const [roadmap, bestBySlug] = await Promise.all([
    user ? getCachedUserCourseRoadmap(user.id) : getGuestRoadmap(),
    user ? getUserBestScoresBySlug(user.id, scoreOrderBySlug).catch(() => ({} as Record<string, number>)) : Promise.resolve({} as Record<string, number>),
  ]);
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;

  let missionGameSlug: string | null = null;
  let missionLabel: string | null = null;

  if ((isLoggedIn || roadmap.completedCount > 0) && activeCourse) {
    const plan = getCourseMissionPlan(activeCourse);
    missionGameSlug = plan.primaryGameSlug;
    missionLabel = plan.gameChallengeCompact;
  }

  const missionGame = missionGameSlug ? games.find((game) => game.slug === missionGameSlug) ?? null : null;

  return (
    <div>
      <PageHead
        caption="Salle d'entraînement"
        title="Neuf jeux pour t'entraîner"
      >
        Des parties courtes sur les verbes irréguliers, le vocabulaire, la grammaire, l&apos;orthographe et l&apos;écoute.
        {" "}
        <Link href="/leaderboard" className="eq-text-link">
          Voir la ligue et les classements →
        </Link>
      </PageHead>

      {missionGame && activeCourse ? (
        <section className="eq-container pt-10 md:pt-14">
          <div className="eq-surface grid grid-cols-[minmax(0,1fr)] gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:items-center md:p-6 [&>*]:min-w-0">
            <div>
              <p className="eq-chip eq-chip-gold w-fit">Mission en cours</p>
              <h2 className="eq-h2 mt-3">
                Cours {activeCourse.courseId} : {activeCourse.title}
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                Objectif ciblé sur cette notion : {missionLabel} dans {missionGame.name}.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/play/${missionGame.slug}`} className="eq-btn eq-btn-gold">
                  Lancer {missionGame.name}
                </Link>
                <Link href={`/cours/${activeCourse.courseId}`} className="eq-btn eq-btn-ghost">
                  Revoir le cours
                </Link>
                <Link href={`/leaderboard?game=${missionGame.slug}`} className="eq-btn eq-btn-ghost">
                  Classement
                </Link>
              </div>
            </div>
            <GameCard game={missionGame} compact missionLabel={missionLabel} highlighted />
          </div>
        </section>
      ) : null}

      <section className="eq-container eq-section pb-14 md:pb-20">
        {missionGame ? <h2 className="eq-h2">Tous les jeux</h2> : null}
        <div className={`eq-games-grid ${missionGame ? "mt-6" : ""}`}>
          {games.map((game, index) => {
            const isMissionGame = game.slug === missionGame?.slug;
            const rawBest = bestBySlug[game.slug];
            const bestLabel =
              typeof rawBest === "number"
                ? formatLeaderboardScore(getGameLeaderboardMeta(game.slug).format, rawBest)
                : null;
            return (
              <GameCard
                key={game.slug}
                game={game}
                missionLabel={isMissionGame ? missionLabel : null}
                personalBestLabel={bestLabel}
                highlighted={isMissionGame}
                artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
                priority={index === 0 && !missionGame}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
