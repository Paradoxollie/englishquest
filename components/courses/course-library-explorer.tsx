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

function clampText(lines: number) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };
}

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
    <div className="space-y-8">
      <section className="border-4 border-black bg-slate-950 p-5 shadow-[0_4px_0_#000] md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
              Recherche rapide
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white text-outline md:text-3xl">
              Trouve une notion sans casser le rythme.
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
              Filtre par niveau, statut ou mot-cle: grammaire, temps, vocabulaire, mission.
            </p>
          </div>

          {recommendedCourseId && (
            <Link
              href="/quest"
              className="comic-button inline-flex w-fit items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              <QuestIcon className="h-4 w-4" />
              Ouvrir Aventure
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_0.7fr_0.8fr]">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Rechercher
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Present perfect, questions, conditionnel..."
              className="w-full border-2 border-black bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Niveau
            </span>
            <select
              value={palier}
              onChange={(event) => setPalier(event.target.value)}
              className="w-full border-2 border-black bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400"
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
              className="w-full border-2 border-black bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Bibliotheque active
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {filteredEntries.length} cours affiches sur {entries.length}
          </p>
        </div>
        {!isAuthenticated && (
          <p className="max-w-xl text-sm font-semibold leading-relaxed text-slate-400">
            Mode invite: les cours sont ouverts, mais la progression de campagne n'est pas sauvegardee.
          </p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
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
              className="group comic-card-dark flex min-h-[330px] flex-col overflow-hidden bg-slate-950"
            >
              <div className="relative flex min-h-[190px] flex-col justify-between overflow-hidden border-b-4 border-black p-5">
                <div className="absolute inset-y-0 left-0 w-2" style={{ background: profile.rail }} />
                <div className="absolute inset-0 opacity-20 comic-dot-pattern-light" />
                <div
                  className="absolute inset-0 opacity-80"
                  style={{ background: profile.cardBackground }}
                />
                <div className="absolute right-5 top-2 text-7xl font-black tracking-[-0.08em] text-white/5">
                  {entry.courseId.toString().padStart(2, "0")}
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full border border-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                    style={{ background: `${profile.accent}44` }}
                  >
                    Cours {entry.courseId}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                    {entry.levelLabel.split(" - ")[0]}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                    {entry.estimatedMinutes} min
                  </span>
                  {isRecommended && (
                    <span className="rounded-full border border-black/50 bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                      Focus
                    </span>
                  )}
                </div>

                <div className="relative z-10 mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
                    {profile.chapterLabel} / {entry.typeLabel}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight text-white text-outline md:text-3xl">
                    {entry.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm font-semibold leading-relaxed text-slate-200" style={clampText(3)}>
                  {entry.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-100">
                    {mission.primaryGameName ?? "Jeu conseille"}
                  </span>
                  {entry.focusTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/12 bg-slate-900/75 px-3 py-1 text-[11px] font-semibold text-slate-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Campagne: {adventureStatus}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: profile.accent }}>
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
