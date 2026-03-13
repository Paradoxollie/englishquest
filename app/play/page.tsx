import Link from "next/link";
import { GameCardArtwork, GameEmblem } from "@/components/play/game-emblem";
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
    <div className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-x-clip bg-gradient-to-br from-[#04070f] via-[#081425] to-[#140b08] comic-dot-pattern">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[10%] top-36 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-[36%] h-96 w-96 -translate-x-1/2 rounded-full bg-amber-400/7 blur-3xl" />
        <div className="absolute bottom-12 right-[14%] h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1460px] px-3 py-6 md:px-6 md:py-12 xl:px-10">
        <div className="comic-panel-dark w-full p-3 md:p-6">
          <section
            className="comic-panel-dark mb-6 overflow-hidden p-5 md:mb-8 md:p-8"
            style={{
              background:
                "linear-gradient(125deg, rgba(8, 18, 36, 0.98) 0%, rgba(12, 30, 54, 0.94) 48%, rgba(28, 14, 28, 0.94) 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-20 comic-speed-lines" />
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-cyan-300 via-cyan-500 to-red-500" />
            <div className="relative z-10 grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300 text-outline">
                  Salle de jeu
                </p>
                <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-white text-outline md:text-5xl">
                  Choisis ton mode d'attaque.
                </h1>
                <p className="mt-4 max-w-4xl text-sm font-semibold leading-relaxed text-slate-100 text-outline md:text-lg">
                  Entre dans l'arene, choisis ton defi et enchaine des manches courtes pour
                  faire monter ton anglais sans casser le rythme.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="comic-panel border-2 border-black bg-slate-950/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Jeux
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">{games.length}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      Facons de jouer des maintenant.
                    </p>
                  </div>
                  <div className="comic-panel border-2 border-black bg-slate-950/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Mission
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {recommendedCourse ? `Cours ${recommendedCourse.courseId}` : "Libre"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {recommendedCourse
                        ? recommendedCourse.title
                        : "Choisis ton prochain combat."}
                    </p>
                  </div>
                  <div className="comic-panel border-2 border-black bg-slate-950/60 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Rythme
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">Express</p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      Des manches nerveuses pour rester en feu.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {recommendedCourse && (
                    <Link
                      href="#focus"
                      className="comic-button inline-flex items-center gap-2 bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                    >
                      Jouer la selection du moment
                    </Link>
                  )}
                  <Link
                    href="#catalogue"
                    className="comic-button inline-flex items-center gap-2 bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Explorer tous les jeux
                  </Link>
                  {recommendedCourse && (
                    <Link
                      href={`/cours/${recommendedCourse.courseId}`}
                      className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                    >
                      <BookIcon className="h-4 w-4" />
                      Reprendre le cours
                    </Link>
                  )}
                </div>

                {!isLoggedIn && (
                  <div className="mt-5 flex flex-wrap gap-3">
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {spotlightGames.map((game, index) => {
                  const presentation = getGamePresentation(game);

                  return (
                    <Link
                      key={game.slug}
                      href={`/play/${game.slug}`}
                      className={`comic-panel group relative overflow-hidden border-2 border-black bg-slate-950/80 p-4 transition-transform duration-200 hover:-translate-y-1 ${
                        spotlightGames.length > 2 && index === spotlightGames.length - 1
                          ? "sm:col-span-2"
                          : ""
                      }`}
                    >
                      <div
                        className="absolute inset-y-0 left-0 w-2"
                        style={{
                          background: `linear-gradient(180deg, ${presentation.secondary} 0%, ${presentation.primary} 100%)`,
                        }}
                      />
                      <div
                        className="absolute inset-0 opacity-12"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 36%, rgba(255,255,255,0.02) 100%)",
                        }}
                      />
                      <div className="absolute inset-y-0 right-0 w-[34%] opacity-90 sm:w-[42%]">
                        <GameCardArtwork game={game} className="h-full w-full" />
                      </div>
                      <div className="absolute inset-0 opacity-15 comic-speed-lines" />
                      <div className="relative z-10 flex min-h-[138px] max-w-[74%] flex-col sm:min-h-[152px] sm:max-w-[70%]">
                        <div className="flex items-start gap-4">
                          <GameEmblem game={game} className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-200 text-outline">
                              {presentation.mode}
                            </p>
                            <p className="mt-2 text-lg font-bold leading-tight text-white text-outline">
                              {game.name}
                            </p>
                          </div>
                        </div>
                        <div className="mt-auto">
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300/90 text-outline">
                            {presentation.action}
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-100 text-outline">
                            {presentation.hook}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {recommendedCourse && (
                  <div className="comic-panel border-2 border-black bg-slate-950/70 p-5 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
                      Mission du moment
                    </p>
                    <p className="mt-2 text-xl font-bold text-white">
                      Cours {recommendedCourse.courseId}: {recommendedCourse.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
                      {recommendedCourse.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {recommendedCourse && recommendedSelection.length > 0 && (
            <section
              id="focus"
              className="comic-panel-dark mb-6 p-5 md:mb-8 md:p-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7, 14, 25, 0.98) 0%, rgba(5, 11, 20, 0.98) 100%)",
              }}
            >
              <div className="mb-6 h-2 w-32 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-indigo-500" />
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300 text-outline">
                    A jouer maintenant
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white text-outline md:text-3xl">
                    Tes meilleurs picks du moment
                  </h2>
                </div>
                <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-200">
                  Lance une partie qui colle a ta progression et garde la bonne notion en tete
                  pendant que tu joues.
                </p>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {recommendedSelection.map((game) => (
                  <GameRecommendationCard
                    key={game.slug}
                    game={game}
                    badgeLabel="Choix du parcours"
                    ctaLabel="Jouer maintenant"
                    footerLabel="Parfait pour ton focus du moment"
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

          <section
            id="catalogue"
            className="comic-panel-dark p-5 md:p-6"
            style={{
              background:
                "linear-gradient(180deg, rgba(5, 10, 19, 0.96) 0%, rgba(4, 8, 16, 0.99) 100%)",
            }}
          >
            <div className="mb-6 h-2 w-32 rounded-full bg-gradient-to-r from-cyan-300 via-cyan-500 to-indigo-500 md:mb-8" />
            <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 text-outline">
                  Catalogue complet
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white text-outline md:text-3xl">
                  Trouve ton prochain defi
                </h2>
              </div>
              <p className="max-w-3xl text-sm font-semibold leading-relaxed text-slate-300">
                Reflexes, vitesse, memoire ou vocabulaire: choisis le terrain qui te donne
                envie d'entrer en jeu.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {games.map((game) => {
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
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
