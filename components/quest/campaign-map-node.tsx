import Link from "next/link";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import { getCourseVisualProfile } from "@/lib/courses/presentation";

type CampaignMapNodeProps = {
  entry: CourseRoadmapEntry;
  isCurrent: boolean;
  showConnector: boolean;
};

const statusLabel = {
  locked: "Verrouillee",
  unlocked: "Prete",
  in_progress: "Active",
  completed: "Validee",
} as const;

const stageStyles = {
  done: "border-emerald-400/25 bg-emerald-500/16 text-emerald-100",
  active: "border-cyan-400/25 bg-cyan-500/16 text-cyan-100",
  ready: "border-indigo-400/25 bg-indigo-500/14 text-indigo-100",
  pending: "border-white/10 bg-slate-950/65 text-slate-200",
  locked: "border-white/8 bg-slate-950/55 text-slate-500",
} as const;

export function CampaignMapNode({
  entry,
  isCurrent,
  showConnector,
}: CampaignMapNodeProps) {
  const mission = getCourseMissionPlan(entry);
  const profile = getCourseVisualProfile(entry.palierId);
  const numberLabel = entry.courseId.toString().padStart(2, "0");
  const stages =
    entry.status === "completed"
      ? [
          { label: "Cours", detail: "Lu", state: "done" as const },
          { label: "Quiz", detail: "Valide", state: "done" as const },
          { label: "Jeu", detail: mission.gameChallengeCompact, state: "done" as const },
        ]
      : entry.status === "in_progress"
        ? [
            { label: "Cours", detail: "En cours", state: "active" as const },
            { label: "Quiz", detail: "Ensuite", state: "pending" as const },
            { label: "Jeu", detail: mission.gameChallengeCompact, state: "pending" as const },
          ]
        : entry.status === "unlocked"
          ? [
              { label: "Cours", detail: "Pret", state: "ready" as const },
              { label: "Quiz", detail: "Apres le cours", state: "pending" as const },
              { label: "Jeu", detail: mission.gameChallengeCompact, state: "pending" as const },
            ]
          : [
              { label: "Cours", detail: "Bloque", state: "locked" as const },
              { label: "Quiz", detail: "Bloque", state: "locked" as const },
              { label: "Jeu", detail: "Bloque", state: "locked" as const },
            ];

  return (
    <div className="relative pl-16 md:pl-20">
      {showConnector && (
        <div
          className="absolute left-[1.08rem] top-12 h-[calc(100%-0.2rem)] w-[4px] rounded-full"
          style={{ background: profile.rail }}
        />
      )}

      <div
        className="absolute left-0 top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-black text-[11px] font-black text-white shadow-[0_6px_0_0_rgba(0,0,0,0.38)]"
        style={{ background: profile.rail }}
      >
        {numberLabel}
      </div>

      <Link
        href={`/cours/${entry.courseId}`}
        className="group block max-w-4xl"
      >
        <div
          className="comic-panel relative overflow-hidden border-2 border-black p-4 transition-transform duration-200 group-hover:-translate-y-1 md:p-5"
          style={{
            background: isCurrent ? profile.cardBackground : profile.cardBackgroundSoft,
            boxShadow: isCurrent ? `0 16px 42px ${profile.glow}` : undefined,
          }}
        >
          <div className="absolute inset-y-0 left-0 w-2" style={{ background: profile.rail }} />
          <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              background:
                "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
            }}
          />
          <div className="absolute right-4 top-1 text-6xl font-black tracking-[-0.08em] text-white/5">
            {numberLabel}
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full border border-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                    style={{ background: `${profile.accent}22` }}
                  >
                    Mission {numberLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                    {entry.levelLabel.split(" - ")[0]}
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-100">
                    {statusLabel[entry.status]}
                  </span>
                  {isCurrent && (
                    <span
                      className="rounded-full border border-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white"
                      style={{ background: profile.rail }}
                    >
                      En jeu
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold leading-tight text-white text-outline md:text-xl">
                  {entry.title}
                </h3>
                <p
                  className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-200 text-outline"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {mission.objective}
                </p>
              </div>

              <span
                className="shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: profile.accent }}
              >
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {stages.map((stage) => (
                <div
                  key={stage.label}
                  className={`rounded-2xl border p-3 ${stageStyles[stage.state]}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]">{stage.label}</p>
                  <p className="mt-1 text-sm font-bold">{stage.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                <span>{entry.estimatedMinutes} min</span>
                <span>{entry.rewardXp} XP</span>
                <span>{mission.primaryGameName ?? "Defi final"}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: profile.accent }}>
                Ouvrir la mission
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
