import Image from "next/image";
import Link from "next/link";
import { GameCard } from "@/components/play/game-card";
import { ART } from "@/lib/art";
import { resolveArt } from "@/lib/art-server";
import { getGamePresentation } from "@/lib/games/presentation";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getResolvedCourseMissionPlans } from "@/lib/courses/campaign-server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { games } from "@/lib/games/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Jeux",
  description:
    "Six jeux pour s'entraîner en anglais : conjugaison, vocabulaire, traduction, mémoire, orthographe. Parties courtes, scores et classements.",
};

export default async function PlayPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const activeCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;

  let missionGameSlug: string | null = null;
  let missionLabel: string | null = null;

  if (isLoggedIn && activeCourse) {
    const plans = await getResolvedCourseMissionPlans([activeCourse]);
    const plan = plans[activeCourse.courseId] ?? getCourseMissionPlan(activeCourse);
    missionGameSlug = plan.primaryGameSlug;
    missionLabel = plan.gameChallengeCompact;
  }

  const missionGame = missionGameSlug ? games.find((game) => game.slug === missionGameSlug) ?? null : null;
  const otherGames = games.filter((game) => game.slug !== missionGame?.slug);

  const heroArt = resolveArt(ART.heroGames) ?? resolveArt(ART.heroHome);

  return (
    <div>
      <section className="eq-hero">
        {heroArt ? (
          <div className="eq-hero-art">
            <Image src={heroArt} alt="" fill priority sizes="100vw" className="object-cover object-[65%_center]" />
          </div>
        ) : null}
        <div className="eq-container eq-hero-body">
          <div className="eq-reveal grid min-h-[380px] content-end gap-4 py-14 md:max-w-[620px] md:py-20">
            <h1 className="eq-h1">Les jeux</h1>
            <p className="eq-lead">
              Six façons de s&apos;entraîner, en parties de deux à cinq minutes. Chaque jeu
              travaille une compétence précise. Joue librement, ou vise l&apos;objectif de ta
              mission en cours.
            </p>
            {!isLoggedIn ? (
              <p className="text-sm text-[var(--muted)]">
                Tu peux jouer sans compte. Avec un compte, tes scores comptent pour les
                classements et pour ton parcours.
              </p>
            ) : null}
          </div>
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
                Pour valider la mission, il te reste le défi de jeu : {missionLabel}.
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(missionGame ? otherGames : games).map((game) => (
            <GameCard key={game.slug} game={game} artSrc={resolveArt(getGamePresentation(game).artworkSrc)} />
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
