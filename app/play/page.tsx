import Link from "next/link";
import { MotionCard } from "@/components/ui/motion-card";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-7xl px-2 py-4 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-3 md:p-8">
          <div
            className="comic-panel-dark mb-6 p-4 md:mb-12 md:p-8"
            style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-4">
                <div className="comic-panel border-2 border-black bg-gradient-to-br from-cyan-500 to-blue-600 p-2 md:border-4 md:p-4">
                  <GameIcon className="h-5 w-5 text-white text-outline md:h-8 md:w-8" />
                </div>
                <h1 className="min-w-0 flex-1 break-words text-xl font-bold leading-tight text-white text-outline md:text-5xl md:leading-normal">
                  Choisis une pratique utile, pas juste un mini-jeu.
                </h1>
              </div>

              <p className="mb-3 break-words text-sm font-semibold leading-tight text-slate-200 text-outline md:mb-4 md:text-lg md:leading-normal">
                Chaque jeu doit servir le parcours. La page te recommande donc les formats les plus utiles pour la notion que tu travailles maintenant.
              </p>

              {!isLoggedIn && (
                <p className="break-words text-xs font-bold text-amber-300 text-outline md:text-sm">
                  Connecte-toi pour relier tes jeux a tes cours, sauvegarder tes scores et gagner XP + or.
                </p>
              )}
            </div>
          </div>

          {recommendedCourse && (
            <div
              className="comic-panel-dark mb-6 p-5 md:mb-10 md:p-6"
              style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(99, 102, 241, 0.18) 100%)" }}
            >
              <div className="grid gap-5 lg:grid-cols-[1.1fr_1.9fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="comic-panel border-2 border-black bg-emerald-600 p-3">
                      <QuestIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                        Recommande maintenant
                      </p>
                      <h2 className="text-2xl font-bold text-white text-outline">Jeux lies au cours actif</h2>
                    </div>
                  </div>

                  <div className="comic-panel border-2 border-black bg-slate-900/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cours de reference</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      Cours {recommendedCourse.courseId}: {recommendedCourse.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-300">
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

                <div className="grid gap-4 md:grid-cols-3">
                  {games
                    .filter((game) => recommendedGameSlugs.has(game.slug))
                    .map((game) => (
                      <Link
                        key={game.slug}
                        href={`/play/${game.slug}`}
                        className="comic-card-dark p-5 transition-transform duration-200 hover:scale-[1.02]"
                        style={{ background: game.gradient }}
                      >
                        <div className="relative z-10 flex h-full flex-col">
                          <div className="mb-3 flex items-center gap-3">
                            <div className={`comic-panel border-2 border-black ${game.iconBg} p-2`}>
                              <span className="text-xl">{game.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white text-outline">{game.name}</p>
                              <p className="text-[11px] text-slate-200">{game.tags.slice(0, 2).join(" · ")}</p>
                            </div>
                          </div>
                          <p className="mb-4 flex-grow text-sm font-semibold text-slate-200 text-outline">
                            {game.description}
                          </p>
                          <div className="comic-button bg-slate-900/80 px-3 py-2 text-center text-xs font-bold text-white">
                            Lancer ce jeu
                          </div>
                        </div>
                      </Link>
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

          <div className="grid gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {games.map((game) => {
              const isRecommended = recommendedGameSlugs.has(game.slug);

              return (
                <MotionCard key={game.slug}>
                  <Link href={`/play/${game.slug}`}>
                    <div className="comic-card-dark flex h-full flex-col p-4 md:p-6" style={{ background: game.gradient }}>
                      <div className="relative z-10 flex flex-grow flex-col">
                        <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                          <div className={`comic-panel ${game.iconBg} border-2 border-black p-2 text-lg md:border-4 md:p-3 md:text-2xl`}>
                            {game.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="min-w-0 flex-1 text-lg font-bold leading-tight text-white text-outline md:text-2xl">
                                {game.name}
                              </h2>
                              {isRecommended && (
                                <span className="comic-panel border-2 border-black bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white">
                                  Recommande
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex-grow">
                          <p className="mb-3 text-xs font-semibold leading-tight text-slate-200 text-outline md:mb-4 md:text-base md:leading-relaxed">
                            {game.description}
                          </p>

                          <div className="mb-3 flex flex-wrap gap-1.5 md:mb-4 md:gap-2">
                            {game.tags.map((tag, tagIndex) => {
                              const tagColors = [
                                "bg-cyan-600",
                                "bg-purple-600",
                                "bg-pink-600",
                                "bg-indigo-600",
                              ];

                              return (
                                <span
                                  key={tag}
                                  className={`comic-panel ${tagColors[tagIndex % tagColors.length]} border-2 border-black px-2 py-0.5 text-[10px] font-bold text-white text-outline md:px-3 md:py-1 md:text-xs`}
                                >
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="mb-3 md:mb-4">
                            <span
                              className={`comic-panel ${difficultyColors[game.difficulty]} border-2 border-black px-2 py-0.5 text-[10px] font-bold text-white text-outline md:px-3 md:py-1 md:text-xs`}
                            >
                              {game.difficulty === "easy"
                                ? "Facile"
                                : game.difficulty === "medium"
                                  ? "Moyen"
                                  : "Difficile"}
                            </span>
                          </div>

                          <div className="comic-button border-2 border-black bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2 text-center text-xs font-bold text-white text-outline hover:from-cyan-700 hover:to-blue-700 md:border-4 md:px-4 md:py-3 md:text-base">
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
