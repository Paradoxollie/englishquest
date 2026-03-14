import Link from "next/link";
import { completeCourseAction, startCourseAction } from "@/app/cours/actions";
import { GameRecommendationCard } from "@/components/play/game-recommendation-card";
import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  GoldIcon,
  QuestIcon,
  TrophyIcon,
  XPIcon,
} from "@/components/ui/icons";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionState } from "@/lib/courses/mission-state";
import { getCourseVisualProfile } from "@/lib/courses/presentation";
import { getGameBySlug } from "@/lib/games/config";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

const statusStyles = {
  locked: "bg-slate-700",
  unlocked: "bg-cyan-600",
  in_progress: "bg-amber-600",
  completed: "bg-emerald-600",
} as const;

const statusLabels = {
  locked: "Verrouillee",
  unlocked: "Prete",
  in_progress: "En jeu",
  completed: "Validee",
} as const;

type CourseExperiencePanelProps = {
  entry: CourseRoadmapEntry;
  mission: CourseMissionPlan | null;
  previousEntry: CourseRoadmapEntry | null;
  nextEntry: CourseRoadmapEntry | null;
  missionState: CourseMissionState | null;
  isAuthenticated: boolean;
};

function formatChallengeProgress(
  score: number | null,
  direction: "higher" | "lower",
  gameSlug: string | null
) {
  if (score === null) {
    return null;
  }

  if (direction === "lower") {
    return `${(score / 1000).toFixed(1)} s`;
  }

  if (gameSlug === "flashback") {
    return `${score} mots`;
  }

  return `${score} pts`;
}

function buildGateMessage(entry: CourseRoadmapEntry, previousEntry: CourseRoadmapEntry | null) {
  if (entry.status !== "locked") {
    return null;
  }

  if (previousEntry) {
    return `Termine la mission ${previousEntry.courseId} pour ouvrir cette etape de campagne.`;
  }

  return "Cette mission est accessible des le debut de la campagne.";
}

export function CourseExperiencePanel({
  entry,
  mission: resolvedMission,
  previousEntry,
  nextEntry,
  missionState,
  isAuthenticated,
}: CourseExperiencePanelProps) {
  const mission = resolvedMission ?? getCourseMissionPlan(entry);
  const profile = getCourseVisualProfile(entry.palierId);
  const recommendedGames = entry.recommendedGameSlugs
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is NonNullable<typeof game> => Boolean(game));
  const primaryGame =
    recommendedGames.find((game) => game.slug === mission.primaryGameSlug) ??
    recommendedGames[0] ??
    null;
  const supportGames = recommendedGames
    .filter((game) => game.slug !== primaryGame?.slug)
    .slice(0, 1);
  const gateMessage = buildGateMessage(entry, previousEntry);
  const canStart = isAuthenticated && entry.status === "unlocked";
  const readingCheckpointReached = missionState?.readingCheckpointReached ?? false;
  const quizPassed = missionState?.quizPassed ?? false;
  const challengeReached = missionState?.gameChallengeReached ?? !mission.primaryGameSlug;
  const canComplete = isAuthenticated && entry.status === "in_progress" && Boolean(missionState?.readyToComplete);
  const bestGameScoreLabel = formatChallengeProgress(
    missionState?.bestGameScore ?? null,
    mission.scoreDirection,
    mission.primaryGameSlug
  );
  const quizProgressLabel =
    missionState?.quizScore != null && missionState?.quizTotal != null
      ? `${missionState.quizScore}/${missionState.quizTotal}`
      : "80% requis";
  const stageCards =
    entry.status === "completed"
      ? [
          { label: "Point", detail: "Atteint", tone: "border-emerald-400/25 bg-emerald-500/16 text-emerald-100" },
          { label: "Quiz", detail: "Valide", tone: "border-emerald-400/25 bg-emerald-500/16 text-emerald-100" },
          { label: "Jeu", detail: "Score atteint", tone: "border-emerald-400/25 bg-emerald-500/16 text-emerald-100" },
        ]
      : entry.status === "in_progress"
        ? [
            {
              label: "Point",
              detail: readingCheckpointReached ? "Atteint" : "Atteindre le quiz",
              tone: readingCheckpointReached
                ? "border-cyan-400/25 bg-cyan-500/16 text-cyan-100"
                : "border-white/10 bg-slate-950/65 text-slate-200",
            },
            {
              label: "Quiz",
              detail: quizPassed ? `Valide ${quizProgressLabel}` : quizProgressLabel,
              tone: quizPassed
                ? "border-indigo-400/25 bg-indigo-500/18 text-indigo-100"
                : "border-indigo-400/25 bg-indigo-500/14 text-indigo-100",
            },
            {
              label: "Jeu",
              detail: challengeReached ? "Score atteint" : mission.gameChallengeCompact,
              tone: challengeReached
                ? "border-amber-400/25 bg-amber-500/18 text-amber-100"
                : "border-amber-400/25 bg-amber-500/14 text-amber-100",
            },
          ]
        : entry.status === "unlocked"
          ? [
              { label: "Point", detail: "Descends jusqu'au quiz", tone: "border-cyan-400/25 bg-cyan-500/14 text-cyan-100" },
              { label: "Quiz", detail: "80% minimum", tone: "border-white/10 bg-slate-950/65 text-slate-200" },
              { label: "Jeu", detail: mission.gameChallengeCompact, tone: "border-white/10 bg-slate-950/65 text-slate-200" },
            ]
          : [
              { label: "Point", detail: "Bloque", tone: "border-white/8 bg-slate-950/55 text-slate-500" },
              { label: "Quiz", detail: "Bloque", tone: "border-white/8 bg-slate-950/55 text-slate-500" },
              { label: "Jeu", detail: "Bloque", tone: "border-white/8 bg-slate-950/55 text-slate-500" },
            ];

  return (
    <section className="comic-panel-dark mb-8 overflow-hidden p-5 md:p-6">
      <div
        className="comic-panel-dark relative mb-6 overflow-hidden p-5 md:p-6"
        style={{ background: profile.bannerBackground }}
      >
        <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            background:
              "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
          }}
        />
        <div className="absolute inset-y-0 left-0 w-3" style={{ background: profile.rail }} />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_0.98fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border border-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
                style={{ background: `${profile.accent}22` }}
              >
                Mission {entry.courseId}
              </span>
              <span
                className={`rounded-full border border-black/50 px-3 py-1 text-[11px] font-bold text-white ${statusStyles[entry.status]}`}
              >
                {statusLabels[entry.status]}
              </span>
              <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-bold text-white">
                {entry.levelLabel}
              </span>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
              Objectif de mission
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white text-outline md:text-3xl">
              {mission.objective}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-200 text-outline">
              Descends dans le cours jusqu'au point de passage, valide au moins 80% au quiz, puis
              décroche le score demandé dans le jeu pour débloquer la suite.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {entry.focusTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/12 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              {stageCards.map((stage) => (
                <div key={stage.label} className={`rounded-2xl border p-4 ${stage.tone}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{stage.label}</p>
                  <p className="mt-2 text-sm font-bold">{stage.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/72 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                Defi a valider
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {mission.primaryGameName ?? "Mode jeu"}
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-300">
                {mission.gameChallengeLabel}
              </p>
              {isAuthenticated && mission.primaryGameSlug && (
                <>
                  <p
                    className={`mt-3 text-xs font-bold uppercase tracking-[0.16em] ${
                      challengeReached ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {challengeReached ? "Defi atteint" : "Defi en attente"}
                  </p>
                  {bestGameScoreLabel && (
                    <p className="mt-2 text-xs font-semibold text-slate-300">
                      Meilleur score: {bestGameScoreLabel}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-5">
          <div
            className="comic-panel relative overflow-hidden border-2 border-black p-5"
            style={{ background: profile.cardBackgroundSoft }}
          >
            <div className="absolute inset-y-0 left-0 w-2" style={{ background: profile.rail }} />
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-full border-2 border-black p-2" style={{ background: profile.rail }}>
                  <BookIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                    Brief
                  </p>
                  <h3 className="text-lg font-bold text-white text-outline">Ce que tu dois maitriser</h3>
                </div>
              </div>

              <p className="text-sm font-semibold leading-relaxed text-slate-200 text-outline">
                {entry.summary}
              </p>

              <div className="mt-5 space-y-3">
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
          </div>

          <div className="comic-panel border-2 border-black bg-slate-900/78 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              Recompenses de mission
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-emerald-700/85 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <XPIcon className="h-4 w-4" />
                  <span>{entry.rewardXp} XP</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-amber-600/90 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <GoldIcon className="h-4 w-4" />
                  <span>{entry.rewardGold} or</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-indigo-700/85 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <TrophyIcon className="h-4 w-4" />
                  <span>{mission.gameChallengeCompact}</span>
                </div>
              </div>
            </div>

            {gateMessage && (
              <p className="mt-4 text-sm font-semibold text-amber-200 text-outline">
                {gateMessage}
              </p>
            )}

            {nextEntry && (
              <p className="mt-4 text-sm font-semibold text-slate-300 text-outline">
                Mission suivante: {nextEntry.courseId} / {nextEntry.title}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="comic-panel border-2 border-black bg-slate-900/78 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full border-2 border-black bg-purple-600 p-2">
                <QuestIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                  Action
                </p>
                <h3 className="text-lg font-bold text-white text-outline">Prochaine etape</h3>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-200 text-outline">
                  Connecte-toi pour sauvegarder la campagne, les validations et les unlocks.
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
                      className="comic-button w-full px-4 py-3 text-sm font-bold text-white"
                      style={{ background: profile.rail }}
                    >
                      Lancer la mission
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
                      Valider le cours et ouvrir la suite
                    </button>
                  </form>
                )}

                {isAuthenticated &&
                  entry.status === "in_progress" &&
                  mission.primaryGameSlug &&
                  (!quizPassed || !challengeReached) && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-950/25 p-4">
                      <p className="text-sm font-semibold text-slate-100 text-outline">
                        {!quizPassed
                          ? "Le quiz n'est pas encore valide. Il faut atteindre 80% minimum dans le point de passage."
                          : `Il te manque encore le defi jeu. Atteins ${mission.gameChallengeCompact} dans ${
                              mission.primaryGameName ?? "le mode recommande"
                            } pour valider la mission.`}
                      </p>
                    </div>
                  )}

                {entry.status === "completed" && (
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-950/30 p-4">
                    <p className="text-sm font-semibold text-slate-100 text-outline">
                      Mission validee. Tu peux revenir pour revoir le cours ou battre ton defi.
                    </p>
                  </div>
                )}

                {entry.status === "locked" && (
                  <div className="rounded-2xl border border-white/10 bg-slate-800/90 p-4">
                    <p className="text-sm font-semibold text-slate-200 text-outline">
                      Le contenu reste consultable, mais la campagne n'avance qu'une fois la mission precedente terminee.
                    </p>
                  </div>
                )}

                {entry.status === "unlocked" && (
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-4">
                    <p className="text-sm font-semibold text-slate-100 text-outline">
                      Lance cette mission, puis descends jusqu'au point de passage pour enclencher la validation.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {mission.primaryGameSlug && (
                <Link
                  href={`/play/${mission.primaryGameSlug}`}
                  className="comic-button flex w-full items-center justify-center gap-2 bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700"
                >
                  Voir le defi jeu
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              {nextEntry && (
                <Link
                  href={`/cours/${nextEntry.courseId}`}
                  className="comic-button flex w-full items-center justify-center gap-2 bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700"
                >
                  Voir la mission suivante
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/quest"
                className="comic-button flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Retour a la campagne
              </Link>
            </div>
          </div>

          {primaryGame && (
            <GameRecommendationCard
              game={primaryGame}
              badgeLabel="Defi principal"
              ctaLabel="Lancer le defi"
              footerLabel={mission.gameChallengeLabel}
              variant="compact"
            />
          )}

          {supportGames.map((game) => (
            <GameRecommendationCard
              key={game.slug}
              game={game}
              badgeLabel="Renfort"
              ctaLabel="Faire une manche"
              footerLabel="Session de renfort"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
