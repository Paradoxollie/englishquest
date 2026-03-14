"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import { ArrowRightIcon, QuestIcon } from "@/components/ui/icons";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import { getCourseVisualProfile } from "@/lib/courses/presentation";

type CourseLibraryExplorerProps = {
  entries: CourseRoadmapEntry[];
  missionPlans: Record<number, CourseMissionPlan>;
  recommendedCourseId: number | null;
  isAuthenticated: boolean;
};

const palierOptions = [
  { label: "Tous", value: "all" },
  { label: "A1", value: "1" },
  { label: "A2", value: "2" },
  { label: "B1", value: "3" },
  { label: "B2", value: "4" },
  { label: "C1", value: "5" },
];

const statusOptions = [
  { label: "Tous", value: "all" },
  { label: "Focus aventure", value: "recommended" },
  { label: "Mission active", value: "in_progress" },
];

export function CourseLibraryExplorer({
  entries,
  missionPlans,
  recommendedCourseId,
  isAuthenticated,
}: CourseLibraryExplorerProps) {
  const [search, setSearch] = useState("");
  const [palier, setPalier] = useState("all");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const mission = missionPlans[entry.courseId] ?? getCourseMissionPlan(entry);
    const matchesSearch =
      normalizedSearch.length === 0 ||
      entry.title.toLowerCase().includes(normalizedSearch) ||
      entry.summary.toLowerCase().includes(normalizedSearch) ||
      mission.objective.toLowerCase().includes(normalizedSearch) ||
      entry.focusTags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    const matchesPalier = palier === "all" || String(entry.palierId) === palier;

    const matchesStatus =
      status === "all" ||
      (status === "recommended" && entry.courseId === recommendedCourseId) ||
      (status === "in_progress" && entry.status === "in_progress");

    return matchesSearch && matchesPalier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div
        className="comic-panel-dark relative overflow-hidden p-5 md:p-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(5, 12, 24, 0.98) 0%, rgba(9, 18, 32, 0.97) 52%, rgba(7, 14, 26, 0.99) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-[0.12] comic-dot-pattern-light" />
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
          }}
        />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Recherche rapide
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                Trouve un cours libre en quelques secondes.
              </p>
            </div>

            {recommendedCourseId && (
              <Link
                href="/quest"
                className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <QuestIcon className="h-4 w-4" />
                Ouvrir Aventure
              </Link>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Rechercher une mission
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Present perfect, conditionnel, questions..."
                className="w-full rounded-xl border-2 border-black bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Niveau
              </span>
              <select
                value={palier}
                onChange={(event) => setPalier(event.target.value)}
                className="w-full rounded-xl border-2 border-black bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              >
                {palierOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Etat
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-xl border-2 border-black bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Bibliotheque active
          </p>
          <p className="text-sm font-semibold text-slate-200">
            {filteredEntries.length} missions affichees sur {entries.length}
          </p>
        </div>
        {!isAuthenticated && (
          <p className="text-sm font-semibold text-slate-400">
            En mode invite, les cours restent ouverts. La campagne ne se sauvegarde pas.
          </p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filteredEntries.map((entry) => {
          const mission = missionPlans[entry.courseId] ?? getCourseMissionPlan(entry);
          const profile = getCourseVisualProfile(entry.palierId);
          const isRecommended = entry.courseId === recommendedCourseId;
          const adventureStatus =
            entry.status === "in_progress"
              ? "Mission active"
              : entry.status === "completed"
                ? "Mission validee"
                : entry.status === "unlocked"
                  ? "Mission disponible"
                  : "Mission verrouillee";

          return (
            <Link
              key={entry.courseId}
              href={`/cours/${entry.courseId}`}
              className="group flex h-full min-w-0 flex-col"
            >
              <div className="comic-card-dark flex h-full min-w-0 flex-col p-3 md:p-4">
                <div
                  className="comic-panel relative overflow-hidden border-2 border-black p-4 md:p-5"
                  style={{ background: profile.cardBackground, minHeight: 242 }}
                >
                  <div className="absolute inset-y-0 left-0 w-2" style={{ background: profile.rail }} />
                  <div className="absolute inset-0 opacity-[0.16] comic-dot-pattern-light" />
                  <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                      background:
                        "repeating-linear-gradient(128deg, rgba(255, 255, 255, 0.08) 0 2px, transparent 2px 18px)",
                    }}
                  />
                  <div className="absolute right-4 top-1 text-6xl font-black tracking-[-0.08em] text-white/5">
                    {entry.courseId.toString().padStart(2, "0")}
                  </div>

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full border border-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                            style={{ background: `${profile.accent}22` }}
                          >
                            Cours {entry.courseId}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                            {entry.levelLabel.split(" - ")[0]}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                            Libre
                          </span>
                          {isRecommended && (
                            <span className="rounded-full border border-black/50 bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                              Conseille
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-xl font-bold leading-tight text-white text-outline md:text-2xl">
                          {entry.title}
                        </h3>
                      </div>

                    </div>

                    <p
                      className="mt-4 text-sm font-semibold leading-relaxed text-slate-100 text-outline"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {entry.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[11px] font-semibold text-slate-100">
                        {entry.estimatedMinutes} min
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[11px] font-semibold text-slate-100">
                        {mission.primaryGameName ?? "Jeu conseille"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/65 px-3 py-1 text-[11px] font-semibold text-slate-100">
                        {entry.typeLabel}
                      </span>
                    </div>

                    <div className="mt-auto border-t border-white/10 pt-4">
                      <p
                        className="text-sm font-semibold leading-relaxed text-slate-300"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        En aventure: {adventureStatus.toLowerCase()}. Defi associe:{" "}
                        {mission.primaryGameName ?? "aucun"}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 comic-panel border-2 border-black bg-slate-950/84 p-4">
                  <div className="flex flex-wrap gap-2">
                    {entry.focusTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/12 bg-slate-900/75 px-3 py-1 text-[11px] font-semibold text-slate-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                      Campagne: {adventureStatus}
                    </div>
                    <span
                      className="inline-flex items-center gap-2 text-sm font-bold"
                      style={{ color: profile.accent }}
                    >
                      Ouvrir le cours
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
