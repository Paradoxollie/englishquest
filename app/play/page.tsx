import Image from "next/image";
import Link from "next/link";
import { GameEmblem } from "@/components/play/game-emblem";
import { GameRecommendationCard } from "@/components/play/game-recommendation-card";
import { BookIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { games } from "@/lib/games/config";
import { getGamePresentation } from "@/lib/games/presentation";

export default async function PlayPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const recommendedCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const recommendedGameSlugs = new Set(roadmap.recommendedGameSlugs);
  const recommendedGames = games.filter((game) => recommendedGameSlugs.has(game.slug));
  const spotlightGames = (recommendedGames.length > 0 ? recommendedGames : games).slice(0, 3);
  const recommendedSelection =
    recommendedCourse && recommendedGames.length === 0 ? games.slice(0, 2) : recommendedGames;

  return (
    <div className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-x-clip bg-[#020617] text-white">
      <section className="relative min-h-[660px] overflow-hidden border-b-4 border-black md:min-h-[620px] 2xl:min-h-[740px]">
        <Image
          src="/game-art/englishquest-games-hero.png"
          alt="Illustration comic book du hub de jeux English Quest."
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-[#020617]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/40" />
        <div className="absolute inset-0 comic-dot-pattern-light opacity-25" />

        <div className="relative mx-auto flex min-h-[660px] max-w-[1460px] flex-col justify-end px-4 py-8 md:min-h-[620px] md:px-6 md:py-10 2xl:min-h-[740px] xl:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:items-end">
            <div className="max-w-4xl">
              <Image
                src="/game-art/logos/englishquest-games-logo.png"
                alt="English Quest Game Arena"
                width={760}
                height={241}
                priority
                className="mb-4 h-auto w-full max-w-[500px] md:max-w-[560px]"
              />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 text-outline">
                Salle de jeu
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-[1.02] text-white text-outline md:text-5xl 2xl:text-6xl">
                Des mini-jeux nerveux pour ancrer ton anglais.
              </h1>
              <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-lg">
                Chaque mode travaille une competence precise: vocabulaire, grammaire,
                reflexes, memoire ou saisie. Tu joues court, tu recommences vite, tu
                progresses sans perdre le fil du cours.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {recommendedCourse && (
                  <Link
                    href="#focus"
                    className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                  >
                    Jouer la selection
                  </Link>
                )}
                <Link
                  href="#catalogue"
                  className="comic-button inline-flex items-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Voir tous les jeux
                </Link>
                {recommendedCourse && (
                  <Link
                    href={`/cours/${recommendedCourse.courseId}`}
                    className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <BookIcon className="h-4 w-4" />
                    Reprendre le cours
                  </Link>
                )}
              </div>

              {!isLoggedIn && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/auth/signup"
                    className="comic-button whitespace-nowrap bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Creer mon compte
                  </Link>
                  <Link
                    href="/auth/login"
                    className="comic-button whitespace-nowrap bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    Se connecter
                  </Link>
                </div>
              )}

              <div className="mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="border-l-4 border-cyan-300 bg-black/50 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    Jeux
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">{games.length}</p>
                </div>
                <div className="border-l-4 border-emerald-300 bg-black/50 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    Mission
                  </p>
                  <p className="mt-2 truncate text-lg font-bold text-white">
                    {recommendedCourse ? `Cours ${recommendedCourse.courseId}` : "Libre"}
                  </p>
                </div>
                <div className="border-l-4 border-amber-300 bg-black/50 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                    Format
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">Express</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 pb-1">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200 text-outline">
                Picks du moment
              </p>
              {spotlightGames.map((game, index) => {
                const presentation = getGamePresentation(game);

                return (
                  <Link
                    key={game.slug}
                    href={`/play/${game.slug}`}
                    className="group grid min-h-[118px] grid-cols-[86px_minmax(0,1fr)] items-center gap-4 border-4 border-black bg-slate-950/85 p-3 shadow-[0_4px_0_#000] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1 md:grid-cols-[104px_minmax(0,1fr)]"
                  >
                    <GameEmblem game={game} priority={index === 0} className="h-20 w-20 md:h-24 md:w-24" />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.18em] text-outline"
                        style={{ color: presentation.secondary }}
                      >
                        {presentation.mode}
                      </p>
                      <p className="mt-2 truncate text-xl font-bold text-white text-outline">
                        {game.name}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-slate-200">
                        {presentation.hook}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {recommendedCourse && (
                <div className="border-4 border-black bg-emerald-950/80 p-4 shadow-[0_4px_0_#000] backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                    Mission du moment
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    Cours {recommendedCourse.courseId}: {recommendedCourse.title}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-relaxed text-emerald-50/90">
                    {recommendedCourse.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto max-w-[1460px] px-4 py-10 md:px-6 md:py-14 xl:px-10">
        {recommendedCourse && recommendedSelection.length > 0 && (
          <section id="focus" className="mb-12 md:mb-16">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 text-outline">
                  A jouer maintenant
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white text-outline md:text-4xl">
                  Une selection callee sur ta progression
                </h2>
              </div>
              <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-300 md:text-base">
                Ces jeux gardent la bonne notion active pendant que tu joues. Lance une
                manche, puis reviens au cours quand le reflexe commence a rentrer.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {recommendedSelection.map((game, index) => (
                <GameRecommendationCard
                  key={game.slug}
                  game={game}
                  badgeLabel="Choix du parcours"
                  ctaLabel="Jouer maintenant"
                  footerLabel="Parfait pour ton focus du moment"
                  priority={index < 2}
                  className={
                    recommendedSelection.length > 1 &&
                    recommendedSelection.length % 2 === 1 &&
                    game.slug === recommendedSelection[recommendedSelection.length - 1]?.slug
                      ? "md:col-span-2"
                      : ""
                  }
                />
              ))}
            </div>
          </section>
        )}

        <section id="catalogue">
          <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
                Catalogue complet
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white text-outline md:text-4xl">
                Choisis ton prochain terrain
              </h2>
            </div>
            <p className="max-w-3xl text-sm font-semibold leading-relaxed text-slate-300 md:text-base">
              Reflexes, vitesse, memoire ou vocabulaire: chaque carte ouvre un mode
              court, lisible et rejouable.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {games.map((game, index) => {
              const isRecommended = recommendedGameSlugs.has(game.slug);

              return (
                <GameRecommendationCard
                  key={game.slug}
                  game={game}
                  variant="showcase"
                  badgeLabel={isRecommended ? "Choix du parcours" : undefined}
                  ctaLabel="Entrer dans l'arene"
                  footerLabel={
                    isRecommended ? "Prioritaire pour ta mission du moment" : "Pret pour une partie libre"
                  }
                  priority={index < 2}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
