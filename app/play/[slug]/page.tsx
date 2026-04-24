import Link from "next/link";
import { notFound } from "next/navigation";
import { GameEmblem } from "@/components/play/game-emblem";
import { GameRecommendationCard } from "@/components/play/game-recommendation-card";
import { BookIcon, GameIcon, QuestIcon } from "@/components/ui/icons";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGuestCourseRoadmap, getUserCourseRoadmap } from "@/lib/courses/progress";
import { games, getGameBySlug, difficultyColors } from "@/lib/games/config";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [];
}

function pickAlternatives(currentSlug: string, recommendedSlugs: string[]) {
  const recommendedFirst = games.filter(
    (game) => game.slug !== currentSlug && recommendedSlugs.includes(game.slug)
  );
  const fallbackGames = games.filter(
    (game) => game.slug !== currentSlug && !recommendedSlugs.includes(game.slug)
  );

  return [...recommendedFirst, ...fallbackGames].slice(0, 3);
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);
  const roadmap = user ? await getUserCourseRoadmap(user.id) : buildGuestCourseRoadmap();
  const focusCourse = roadmap.currentCourse ?? roadmap.recommendedCourse;
  const alternatives = pickAlternatives(game.slug, roadmap.recommendedGameSlugs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/play"
            className="comic-button inline-flex items-center gap-2 bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-700"
          >
            Retour aux jeux
          </Link>
          {focusCourse && (
            <Link
              href={`/cours/${focusCourse.courseId}`}
              className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
            >
              Revenir au cours actif
            </Link>
          )}
        </div>

        <div className="comic-panel-dark mb-8 p-8">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <GameEmblem game={game} className="h-20 w-20 shrink-0 md:h-24 md:w-24" />
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`comic-panel ${difficultyColors[game.difficulty]} border-2 border-black px-3 py-1 text-sm font-bold text-white`}
                  >
                    {game.difficulty === "easy"
                      ? "Facile"
                      : game.difficulty === "medium"
                        ? "Moyen"
                        : "Difficile"}
                  </span>
                  <span className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-sm font-bold text-slate-100">
                    Route reservee
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white text-outline md:text-5xl">
                  {game.name}
                </h1>
                <p className="mt-3 text-lg font-semibold text-slate-300 text-outline">
                  {game.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="comic-panel border-2 border-black bg-slate-700 px-3 py-1 text-xs font-bold text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="comic-panel-dark mb-8 p-8"
          style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(239, 68, 68, 0.2) 100%)" }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="comic-panel border-2 border-black bg-amber-600 p-3">
                  <GameIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                    Etat du module
                  </p>
                  <h2 className="text-2xl font-bold text-white text-outline">
                    Cette route n'est pas ouverte
                  </h2>
                </div>
              </div>

              <p className="text-sm font-semibold leading-relaxed text-slate-100 text-outline">
                Le jeu existe dans le catalogue, mais cette route generique n'est pas le point d'entree final. Au lieu de bloquer l'utilisateur sur un simple "coming soon", on le renvoie maintenant vers des alternatives utiles pour continuer l'apprentissage.
              </p>

              {focusCourse && (
                <div className="comic-panel border-2 border-black bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cours actif</p>
                  <p className="mt-2 text-lg font-bold text-white">
                    Cours {focusCourse.courseId}: {focusCourse.title}
                  </p>
                </div>
              )}

              {!isLoggedIn && (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/auth/signup"
                    className="comic-button bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
                  >
                    Creer mon compte
                  </Link>
                  <Link
                    href="/auth/login"
                    className="comic-button bg-slate-800 px-5 py-3 font-bold text-white hover:bg-slate-700"
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="comic-panel border-2 border-black bg-indigo-600 p-3">
                  <QuestIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                    Alternatives immediates
                  </p>
                  <h3 className="text-xl font-bold text-white text-outline">
                    Continue sans casser la boucle
                  </h3>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {alternatives.map((alternative) => (
                  <GameRecommendationCard
                    key={alternative.slug}
                    game={alternative}
                    badgeLabel="Alternative"
                    ctaLabel="Jouer a la place"
                    className={
                      alternatives.length > 1 &&
                      alternatives.length % 2 === 1 &&
                      alternative.slug === alternatives[alternatives.length - 1]?.slug
                        ? "md:col-span-2"
                        : ""
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="comic-panel-dark p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="comic-panel border-2 border-black bg-cyan-600 p-3">
                <BookIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Recentrage
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  Utilise le catalogue de jeux et le cours actif comme points d'entree fiables.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/play"
                className="comic-button bg-cyan-600 px-5 py-3 font-bold text-white hover:bg-cyan-700"
              >
                Retour au catalogue
              </Link>
              <Link
                href={focusCourse ? `/cours/${focusCourse.courseId}` : "/quest"}
                className="comic-button bg-slate-800 px-5 py-3 font-bold text-white hover:bg-slate-700"
              >
                {focusCourse ? "Ouvrir le cours actif" : "Voir le parcours"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
