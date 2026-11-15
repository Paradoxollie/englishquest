import Image from "next/image";
import Link from "next/link";
import { GameCard } from "@/components/play/game-card";
import { ART } from "@/lib/art";
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

  const heroArt = resolveArt(ART.heroGames) ?? resolveArt(ART.heroHome);

  return (
    <div>
      <section className="eq-editorial-band">
        <div className="eq-container eq-split-hero">
          <div className="grid gap-4">
            <p className="eq-kicker">Arcade &amp; Entraînement</p>
            <h1 className="eq-h1">Sept jeux pour transformer la révision en réflexe</h1>
            <p className="eq-lead">
              Des parties d&apos;une à cinq minutes pour fixer les verbes irréguliers, le vocabulaire et la grammaire.
              Joue librement, ou relève le défi du chapitre en cours.
            </p>
            {!isLoggedIn ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/auth/signup" className="eq-btn eq-btn-gold">
                  Enregistrer mes scores
                </Link>
                <span className="text-xs font-semibold text-[var(--muted)]">
                  Jouable sans compte · Classements ouverts avec un compte gratuit
                </span>
              </div>
            ) : null}
          </div>

          {heroArt ? (
            <div className="eq-comic-panel">
              <div className="eq-comic-panel-media">
                <Image
                  src={heroArt}
                  alt="Salle de commande arcade English Quest"
                  fill
                  priority
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="object-cover object-[70%_center]"
                />
              </div>
              <div className="eq-comic-panel-bar">
                <span>
                  <strong>7 épreuves</strong> · 1 à 5 min
                </span>
                <span>Défis du jour · Scores &amp; Ligues</span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

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

      <section className="eq-container eq-section">
        <h2 className="eq-h2">{missionGame ? "Les autres jeux" : "Tous les jeux"}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(missionGame ? otherGames : games).map((game, index) => (
            <GameCard
              key={game.slug}
              game={game}
              artSrc={resolveArt(getGamePresentation(game).artworkSrc)}
              priority={index < 3}
            />
          ))}
        </div>
      </section>

      <section className="eq-container pb-12 md:pb-20">
        <div className="eq-surface grid gap-4 p-5 md:grid-cols-3 md:p-6">
          <div>
            <h3 className="eq-h3">Scores et classements</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Chaque jeu a son classement par difficulté. Un record personnel rapporte un bonus.
            </p>
          </div>
          <div>
            <h3 className="eq-h3">Expérience et or</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Les parties rapportent de l&apos;XP et un peu d&apos;or. L&apos;or achète des avatars et des titres.
            </p>
          </div>
          <div>
            <h3 className="eq-h3">Le défi du jour</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Trois jeux tirés au sort chaque jour. Les trois réussis, un bonus tombe et ta série continue.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
