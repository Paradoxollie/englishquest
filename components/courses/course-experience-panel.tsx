import Link from "next/link";
import { completeCourseAction, startCourseAction } from "@/app/cours/actions";
import { getGameBySlug } from "@/lib/games/config";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  GameIcon,
  GoldIcon,
  QuestIcon,
  XPIcon,
} from "@/components/ui/icons";

const statusStyles = {
  locked: "bg-slate-700",
  unlocked: "bg-cyan-600",
  in_progress: "bg-amber-600",
  completed: "bg-emerald-600",
} as const;

const statusLabels = {
  locked: "Verrouille",
  unlocked: "Pret",
  in_progress: "En cours",
  completed: "Termine",
} as const;

type CourseExperiencePanelProps = {
  entry: CourseRoadmapEntry;
  previousEntry: CourseRoadmapEntry | null;
  nextEntry: CourseRoadmapEntry | null;
  isAuthenticated: boolean;
};

function buildGateMessage(entry: CourseRoadmapEntry, previousEntry: CourseRoadmapEntry | null) {
  if (entry.status !== "locked") {
    return null;
  }

  if (previousEntry) {
    return `Termine le cours ${previousEntry.courseId} pour debloquer ce module dans le parcours principal.`;
  }

  return "Ce module fait partie du parcours principal et se debloque au fil de l'aventure.";
}

export function CourseExperiencePanel({
  entry,
  previousEntry,
  nextEntry,
  isAuthenticated,
}: CourseExperiencePanelProps) {
  const recommendedGames = entry.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));
  const gateMessage = buildGateMessage(entry, previousEntry);
  const canStart = isAuthenticated && entry.status === "unlocked";
  const canComplete = isAuthenticated && entry.status === "in_progress";

  return (
    <section className="comic-panel-dark mb-8 overflow-hidden p-6 md:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              {entry.levelLabel}
            </span>
            <span
              className={`comic-panel border-2 border-black px-3 py-1 text-xs font-bold text-white ${statusStyles[entry.status]}`}
            >
              {statusLabels[entry.status]}
            </span>
            <span className="comic-panel border-2 border-black bg-black/40 px-3 py-1 text-xs font-bold text-slate-200">
              {entry.typeLabel}
            </span>
            <span className="comic-panel border-2 border-black bg-indigo-700 px-3 py-1 text-xs font-bold text-white">
              {entry.estimatedMinutes} min
            </span>
          </div>

          <div className="comic-panel border-2 border-black bg-slate-900/70 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="comic-panel border-2 border-black bg-emerald-600 p-3">
                <BookIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                  Focus du cours
                </p>
                <h2 className="text-xl font-bold text-white text-outline">Ce que tu vas travailler</h2>
              </div>
            </div>
            <p className="text-slate-200 text-outline">{entry.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {entry.focusTags.map((tag) => (
                <span
                  key={tag}
                  className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="comic-panel border-2 border-black bg-slate-900/70 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Objectifs
              </p>
              <div className="space-y-3">
                {entry.learningGoals.map((goal) => (
                  <div key={goal} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full border-2 border-black bg-emerald-500 p-1">
                      <CheckIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200 text-outline">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="comic-panel border-2 border-black bg-slate-900/70 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                Recompenses parcours
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="comic-panel border-2 border-black bg-emerald-700/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <XPIcon className="h-4 w-4" />
                    <span>{entry.rewardXp} XP</span>
                  </div>
                </div>
                <div className="comic-panel border-2 border-black bg-amber-600/90 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <GoldIcon className="h-4 w-4" />
                    <span>{entry.rewardGold} or</span>
                  </div>
                </div>
              </div>

              {gateMessage && (
                <p className="mt-4 text-sm font-semibold text-amber-200 text-outline">
                  {gateMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="comic-panel border-2 border-black bg-slate-900/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="comic-panel border-2 border-black bg-purple-600 p-3">
                <QuestIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                  Action
                </p>
                <h3 className="text-lg font-bold text-white text-outline">Ta prochaine etape</h3>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-200 text-outline">
                  Connecte-toi pour sauvegarder ce cours dans ton parcours et debloquer la suite automatiquement.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/auth/signup"
                    className="comic-button bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Creer mon compte
                  </Link>
                  <Link
                    href="/auth/login"
                    className="comic-button bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    Me connecter
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {canStart && (
                  <form action={startCourseAction}>
                    <input type="hidden" name="courseNumber" value={entry.courseId} />
                    <button
                      type="submit"
                      className="comic-button w-full bg-cyan-600 px-4 py-3 text-sm font-bold text-white hover:bg-cyan-700"
                    >
                      Commencer ce cours
                    </button>
                  </form>
                )}

                {canComplete && (
                  <form action={completeCourseAction}>
                    <input type="hidden" name="courseNumber" value={entry.courseId} />
                    <button
                      type="submit"
                      className="comic-button w-full bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                    >
                      Marquer le cours comme termine
                    </button>
                  </form>
                )}

                {entry.status === "completed" && (
                  <div className="comic-panel border-2 border-black bg-emerald-700/40 p-4">
                    <p className="text-sm font-semibold text-slate-100 text-outline">
                      Ce cours est valide dans ton parcours. Tu peux le reviser autant que tu veux.
                    </p>
                  </div>
                )}

                {entry.status === "locked" && (
                  <div className="comic-panel border-2 border-black bg-slate-800 p-4">
                    <p className="text-sm font-semibold text-slate-200 text-outline">
                      Tu peux lire ce cours librement, mais la progression officielle reste sequencee.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {nextEntry && (
                <Link
                  href={`/cours/${nextEntry.courseId}`}
                  className="comic-button flex w-full items-center justify-center gap-2 bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                >
                  Voir la suite
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/quest"
                className="comic-button flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Revenir au parcours
              </Link>
            </div>
          </div>

          <div className="comic-panel border-2 border-black bg-slate-900/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="comic-panel border-2 border-black bg-cyan-600 p-3">
                <GameIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Jeux lies
                </p>
                <h3 className="text-lg font-bold text-white text-outline">Pratique conseillee</h3>
              </div>
            </div>

            <div className="space-y-3">
              {recommendedGames.map((game) => (
                <Link
                  key={game.slug}
                  href={`/play/${game.slug}`}
                  className="comic-panel flex items-center justify-between gap-3 border-2 border-black bg-slate-800 px-4 py-3 transition-transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`comic-panel border-2 border-black ${game.iconBg} p-2`}>
                      <span className="text-lg">{game.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white text-outline">{game.name}</p>
                      <p className="text-xs text-slate-300">{game.tags.slice(0, 2).join(" · ")}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-cyan-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
