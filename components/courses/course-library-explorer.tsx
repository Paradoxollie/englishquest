"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import { ArrowRightIcon, BookIcon, QuestIcon } from "@/components/ui/icons";

type CourseLibraryExplorerProps = {
  entries: CourseRoadmapEntry[];
  recommendedCourseId: number | null;
  isAuthenticated: boolean;
};

const statusLabels = {
  locked: "Verrouille",
  unlocked: "Pret",
  in_progress: "En cours",
  completed: "Termine",
} as const;

const statusStyles = {
  locked: "bg-slate-700",
  unlocked: "bg-cyan-600",
  in_progress: "bg-amber-600",
  completed: "bg-emerald-600",
} as const;

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
  { label: "Recommande", value: "recommended" },
  { label: "En cours", value: "in_progress" },
  { label: "Disponibles", value: "available" },
  { label: "Termines", value: "completed" },
];

export function CourseLibraryExplorer({
  entries,
  recommendedCourseId,
  isAuthenticated,
}: CourseLibraryExplorerProps) {
  const [search, setSearch] = useState("");
  const [palier, setPalier] = useState("all");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      entry.title.toLowerCase().includes(normalizedSearch) ||
      entry.summary.toLowerCase().includes(normalizedSearch) ||
      entry.focusTags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    const matchesPalier = palier === "all" || String(entry.palierId) === palier;

    const matchesStatus =
      status === "all" ||
      (status === "recommended" && entry.courseId === recommendedCourseId) ||
      (status === "in_progress" && entry.status === "in_progress") ||
      (status === "completed" && entry.status === "completed") ||
      (status === "available" &&
        (entry.status === "unlocked" || entry.status === "in_progress"));

    return matchesSearch && matchesPalier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="comic-panel-dark p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Rechercher un cours
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Present perfect, questions, conditionnel..."
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

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Bibliotheque active
          </p>
          <p className="text-sm font-semibold text-slate-200">
            {filteredEntries.length} cours affiches sur {entries.length}
          </p>
        </div>
        {recommendedCourseId && (
          <Link
            href={`/cours/${recommendedCourseId}`}
            className="comic-button inline-flex items-center gap-2 bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <QuestIcon className="h-4 w-4" />
            Reprendre la progression
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEntries.map((entry) => {
          const isRecommended = entry.courseId === recommendedCourseId;
          const ctaLabel =
            entry.status === "completed"
              ? "Reviser"
              : entry.status === "in_progress"
                ? "Continuer"
                : entry.status === "locked" && isAuthenticated
                  ? "Voir le module"
                  : "Ouvrir";

          return (
            <Link
              key={entry.courseId}
              href={`/cours/${entry.courseId}`}
              className="comic-card-dark flex h-full flex-col p-5 md:p-6"
              style={{
                background: isRecommended
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.24) 0%, rgba(15, 23, 42, 0.98) 78%)"
                  : "linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.96) 100%)",
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-xs font-bold text-white">
                  Cours {entry.courseId}
                </span>
                <span
                  className={`comic-panel border-2 border-black px-3 py-1 text-xs font-bold text-white ${statusStyles[entry.status]}`}
                >
                  {statusLabels[entry.status]}
                </span>
                {isRecommended && (
                  <span className="comic-panel border-2 border-black bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    Recommande
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-start gap-3">
                <div className="comic-panel border-2 border-black bg-indigo-600 p-3">
                  <BookIcon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                    {entry.levelLabel}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">{entry.title}</h3>
                </div>
              </div>

              <div className="mt-4 comic-panel border-2 border-black bg-slate-900/80 p-4">
                <p className="text-sm leading-relaxed text-slate-200 md:text-[15px]">{entry.summary}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {entry.focusTags.map((tag) => (
                  <span
                    key={tag}
                    className="comic-panel border-2 border-black bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="comic-panel border-2 border-black bg-slate-900/80 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Duree
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">{entry.estimatedMinutes} min</p>
                  </div>
                  <div className="comic-panel border-2 border-black bg-slate-900/80 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Recompense
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">{entry.rewardXp} XP</p>
                  </div>
                </div>

                <span className="comic-button inline-flex items-center justify-center gap-2 bg-slate-800 px-4 py-3 text-xs font-bold text-white hover:bg-slate-700">
                  {ctaLabel}
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
