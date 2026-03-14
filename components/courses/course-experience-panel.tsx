import Link from "next/link";
import { ArrowRightIcon, BookIcon, QuestIcon, TrophyIcon } from "@/components/ui/icons";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionState } from "@/lib/courses/mission-state";
import { getCourseVisualProfile } from "@/lib/courses/presentation";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

const statusLabels = {
  locked: "Verrouillee",
  unlocked: "Prete",
  in_progress: "Active",
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

function buildAdventureCopy(
  entry: CourseRoadmapEntry,
  mission: CourseMissionPlan,
  missionState: CourseMissionState | null,
  previousEntry: CourseRoadmapEntry | null,
  isAuthenticated: boolean
) {
  if (!isAuthenticated) {
    return {
      title: "Connexion requise pour la campagne",
      body: "Le cours reste libre d'acces. La progression aventure se debloque uniquement une fois connecte.",
      tone: "border-white/10 bg-slate-950/70 text-slate-100",
    };
  }

  if (entry.status === "completed") {
    return {
      title: "Mission deja validee",
      body: "Le cours reste consultable librement. Si tu veux faire avancer la campagne, retourne simplement sur la carte d'aventure.",
      tone: "border-emerald-400/25 bg-emerald-500/14 text-emerald-100",
    };
  }

  if (entry.status === "in_progress") {
    if (missionState?.readyToComplete) {
      return {
        title: "Mission prete a etre finalisee",
        body: "Le quiz et le defi jeu sont valides. Reviens sur la carte d'aventure pour debloquer la suite et toucher les recompenses.",
        tone: "border-emerald-400/25 bg-emerald-500/14 text-emerald-100",
      };
    }

    if (missionState?.quizPassed) {
      return {
        title: "Quiz valide, defi jeu en attente",
        body: `Il manque encore le score demande dans ${mission.primaryGameName ?? "le jeu recommande"} pour finaliser cette etape.`,
        tone: "border-amber-400/25 bg-amber-500/14 text-amber-100",
      };
    }

    return {
      title: "Mission en cours",
      body: "Lis le cours librement, descends jusqu'au quiz puis valide au moins 80% pour debloquer l'etape suivante du parcours.",
      tone: "border-cyan-400/25 bg-cyan-500/14 text-cyan-100",
    };
  }

  if (entry.status === "unlocked") {
    return {
      title: "Mission non lancee",
      body: "Tu peux lire ce cours tout de suite en mode libre. Pour qu'il compte dans la campagne, lance d'abord la mission depuis Aventure.",
      tone: "border-indigo-400/25 bg-indigo-500/14 text-indigo-100",
    };
  }

  return {
    title: "Mission verrouillee dans Aventure",
    body: previousEntry
      ? `Le cours est lisible ici, mais la campagne n'ouvrira cette etape qu'apres la mission ${previousEntry.courseId}.`
      : "Le cours reste lisible ici. La carte d'aventure decide seule quand une mission s'ouvre.",
    tone: "border-white/10 bg-slate-950/70 text-slate-100",
  };
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
  const isMissionTrackingEnabled = isAuthenticated && entry.status === "in_progress";
  const checkpointReached = missionState?.readingCheckpointReached ?? false;
  const quizPassed = missionState?.quizPassed ?? false;
  const gameReached = missionState?.gameChallengeReached ?? !mission.primaryGameSlug;
  const adventureCopy = buildAdventureCopy(
    entry,
    mission,
    missionState,
    previousEntry,
    isAuthenticated
  );

  const steps = [
    {
      label: "1. Lancer",
      value:
        entry.status === "in_progress" || entry.status === "completed"
          ? "Mission active"
          : "Depuis Aventure",
      tone:
        entry.status === "in_progress" || entry.status === "completed"
          ? "border-cyan-400/25 bg-cyan-500/14 text-cyan-100"
          : "border-white/10 bg-slate-950/70 text-slate-200",
    },
    {
      label: "2. Quiz",
      value: quizPassed ? "80% atteint" : "80% minimum",
      tone: quizPassed
        ? "border-indigo-400/25 bg-indigo-500/14 text-indigo-100"
        : "border-white/10 bg-slate-950/70 text-slate-200",
    },
    {
      label: "3. Jeu",
      value: gameReached ? "Defi atteint" : mission.gameChallengeCompact,
      tone: gameReached
        ? "border-amber-400/25 bg-amber-500/14 text-amber-100"
        : "border-white/10 bg-slate-950/70 text-slate-200",
    },
  ];

  return (
    <section className="mb-8 grid gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.72fr)]">
      <div
        className="comic-panel-dark relative overflow-hidden p-5 md:p-6"
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

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ background: `${profile.accent}22` }}
            >
              Cours libre
            </span>
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-bold text-white">
              {entry.levelLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-bold text-white">
              {entry.typeLabel}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-full border-2 border-black p-3" style={{ background: profile.rail }}>
              <BookIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                Avant le cours
              </p>
              <h2 className="text-2xl font-bold text-white text-outline md:text-3xl">
                Lis et revise librement
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-100 text-outline md:text-base">
            Ici, tu peux apprendre sans pression. Le cours et le quiz servent a t'entrainer.
            Le deverrouillage, les recompenses et la progression restent reserves au mode
            `Aventure`.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Duree</p>
              <p className="mt-1.5 text-sm font-bold text-white">{entry.estimatedMinutes} min</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Focus</p>
              <p className="mt-1.5 text-sm font-bold text-white">
                {entry.focusTags.slice(0, 2).join(" / ")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Jeu conseille</p>
              <p className="mt-1.5 text-sm font-bold text-white">
                {mission.primaryGameName ?? "Defi aventure"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="comic-panel border-2 border-black bg-slate-900/82 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full border-2 border-black bg-indigo-600 p-3">
              <QuestIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                Validation aventure
              </p>
              <h3 className="text-xl font-bold text-white text-outline">
                Ce qu'il faut faire
              </h3>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {steps.map((step) => (
              <div key={step.label} className={`rounded-2xl border p-3.5 ${step.tone}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{step.label}</p>
                <p className="mt-1.5 text-sm font-bold">{step.value}</p>
              </div>
            ))}
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${adventureCopy.tone}`}>
            <p className="text-sm font-bold">{adventureCopy.title}</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{adventureCopy.body}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/quest"
              className="comic-button inline-flex items-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Ouvrir Aventure
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            {mission.primaryGameSlug && (
              <Link
                href={`/play/${mission.primaryGameSlug}`}
                className="comic-button inline-flex items-center gap-2 bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700"
              >
                <TrophyIcon className="h-4 w-4" />
                Voir le defi
              </Link>
            )}
          </div>

          {nextEntry && (
            <p className="mt-4 text-sm font-semibold text-slate-300">
              Prochaine etape en aventure: mission {nextEntry.courseId} / {nextEntry.title}
            </p>
          )}
          {!isMissionTrackingEnabled && isAuthenticated && checkpointReached && (
            <p className="mt-4 text-sm font-semibold text-slate-300">
              Ce cours n'est pas lance dans la campagne pour l'instant. Les validations aventure ne
              s'activent qu'apres lancement depuis la carte.
            </p>
          )}
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Campagne: {statusLabels[entry.status]}
          </p>
        </div>
      </div>
    </section>
  );
}
