import Link from "next/link";
import { PageHead } from "@/components/comic/page-head";
import { GameCard } from "@/components/play/game-card";
import { resolveArt } from "@/lib/art-server";
import { getGamePresentation } from "@/lib/games/presentation";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { buildGuestCourseRoadmap } from "@/lib/courses/progress";
import { getCachedUserCourseRoadmap } from "@/lib/courses/roadmap-cache";
import { games } from "@/lib/games/config";
import { getServerUser } from "@/lib/supabase/auth-cache";

export const metadata = {
  title: "Jeux",
  description:
    "Sept jeux pour s'entraîner en anglais : conjugaison, grammaire, vocabulaire, traduction, mémoire, orthographe. Parties courtes, scores et classements.",
};

export default async function PlayPage() {
  const user = await getServerUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getCachedUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;

  let missionGameSlug: string | null = null;
  let missionLabel: string | null = null;

  if (isLoggedIn && activeCourse) {
    const plan = getCourseMissionPlan(activeCourse);
    missionGameSlug = plan.primaryGameSlug;
    missionLabel = plan.gameChallengeCompact;
  }

  const missionGame = missionGameSlug ? games.find((game) => game.slug === missionGameSlug) ?? null : null;
  const otherGames = games.filter((game) => game.slug !== missionGame?.slug);

  return (
    <div>
      <PageHead
        caption="Salle d'entraînement"
        title="Sept jeux pour t'entraîner"
      >
        Des parties d&apos;une à cinq minutes sur les verbes irréguliers, le vocabulaire et la grammaire des cours.
      </PageHead>

      {missionGame && activeCourse ? (
        <section className="eq-container pt-10 md:pt-14">
          <div className="eq-surface grid gap-5 p-5 md:grid-cols-[1fr_minmax(280px,360px)] md:items-center md:p-6">
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
              </div>
            </div>
            <GameCard game={missionGame} compact missionLabel={missionLabel} highlighted />
          </div>
        </section>
      ) : null}

      <section className="eq-container eq-section pb-14 md:pb-20">
        {missionGame ? <h2 className="eq-h2">Les autres jeux</h2> : null}
        <div className={`eq-games-grid ${missionGame ? "mt-6" : ""}`}>
          {(missionGame ? otherGames : games).map((game, index) => (
            <GameCard
              key={game.slug}
              game={game}
              artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
              priority={index < 4}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
