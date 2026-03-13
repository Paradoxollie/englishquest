import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
import { GameRecommendationCard } from "@/components/play/game-recommendation-card";
import { BookIcon, GameIcon, QuestIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { games, difficultyColors } from "@/lib/games/config";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-4 md:p-8">
          <div
            className="comic-panel-dark mb-6 p-5 md:mb-10 md:p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
            }}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3 md:mb-6 md:gap-4">
                <div className="comic-panel border-2 border-black bg-gradient-to-br from-cyan-500 to-blue-600 p-3 md:border-4 md:p-4">
                  <GameIcon className="h-6 w-6 text-white text-outline md:h-8 md:w-8" />
                </div>
                <h1 className="min-w-0 flex-1 text-2xl font-bold leading-tight text-white text-outline md:text-5xl">
                  Choisis une pratique utile, pas juste un mini-jeu.
                </h1>
              </div>

              <p className="max-w-4xl text-sm font-semibold leading-relaxed text-slate-200 text-outline md:text-lg">
                Chaque jeu doit servir le parcours. La page recommande donc les formats les
                plus utiles pour la notion que tu travailles maintenant, sans surcharger la
                lecture.
              </p>

              {!isLoggedIn && (
                <p className="mt-3 text-xs font-bold text-amber-300 text-outline md:text-sm">
                  Connecte-toi pour relier tes jeux a tes cours, sauvegarder tes scores et
                  gagner XP + or.
                </p>
              )}
            </div>
          </div>

          {recommendedCourse && (
            <div
              className="comic-panel-dark mb-6 p-5 md:mb-10 md:p-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(99, 102, 241, 0.18) 100%)",
              }}
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="comic-panel border-2 border-black bg-emerald-600 p-3">
                      <QuestIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                        Recommande maintenant
                      </p>
                      <h2 className="text-2xl font-bold text-white text-outline">
                        Jeux lies au cours actif
                      </h2>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Cours de reference
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      Cours {recommendedCourse.courseId}: {recommendedCourse.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
                      {recommendedCourse.summary}
                    </p>
                  </div>

                  <Link
                    href={`/cours/${recommendedCourse.courseId}`}
                    className="comic-button inline-flex items-center gap-2 bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    <BookIcon className="h-4 w-4" />
                    Ouvrir le cours
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {recommendedGames.map((game) => (
                    <GameRecommendationCard
                      key={game.slug}
                      game={game}
                      badgeLabel="Focus"
                      ctaLabel="Jouer maintenant"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <div className="mb-6 flex flex-wrap justify-center gap-2 md:mb-8 md:gap-4">
              <Link
                href="/auth/signup"
                className="comic-button whitespace-nowrap border-2 border-black bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 md:border-4 md:px-6 md:py-3 md:text-base"
              >
                Creer mon compte
              </Link>
              <Link
                href="/auth/login"
                className="comic-button whitespace-nowrap border-2 border-black bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 md:border-4 md:px-6 md:py-3 md:text-base"
              >
                Se connecter
              </Link>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => {
              const isRecommended = recommendedGameSlugs.has(game.slug);

              return (
                <MotionCard key={game.slug}>
                  <Link href={`/play/${game.slug}`}>
                    <div
                      className="comic-card-dark flex h-full flex-col p-5 md:p-6"
                      style={{ background: game.gradient }}
                    >
                      <div className="relative z-10 flex h-full flex-col">
                        <div className="mb-4 flex items-start gap-3">
                          <div
                            className={`comic-panel ${game.iconBg} border-2 border-black p-3 text-xl md:border-4 md:text-2xl`}
                          >
                            {game.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="min-w-0 flex-1 text-xl font-bold leading-tight text-white text-outline md:text-2xl">
                                {game.name}
                              </h2>
                              {isRecommended && (
                                <span className="rounded-full border border-black/50 bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                                  Recommande
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full border border-black/50 px-3 py-1 text-[11px] font-bold text-white ${difficultyColors[game.difficulty]}`}
                              >
                                {game.difficulty === "easy"
                                  ? "Facile"
                                  : game.difficulty === "medium"
                                    ? "Moyen"
                                    : "Difficile"}
                              </span>
                              {game.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-white/12 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <p
                          className="mb-5 text-sm font-semibold leading-relaxed text-slate-200 text-outline md:text-base"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {game.description}
                        </p>

                        <div className="mt-auto">
                          <div className="comic-button border-2 border-black bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-center text-sm font-bold text-white text-outline hover:from-cyan-700 hover:to-blue-700 md:border-4">
                            Jouer -&gt;
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </MotionCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
