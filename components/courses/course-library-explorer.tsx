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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="grid gap-4 md:grid-cols-2">
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
                <span className="rounded-full border border-black/50 bg-slate-900/80 px-3 py-1 text-xs font-bold text-white">
                  Cours {entry.courseId}
                </span>
                <span
                  className={`rounded-full border border-black/50 px-3 py-1 text-xs font-bold text-white ${statusStyles[entry.status]}`}
                >
                  {statusLabels[entry.status]}
                </span>
                {isRecommended && (
                  <span className="rounded-full border border-black/50 bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                    Focus
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-start gap-3">
                <div className="rounded-2xl border-2 border-black/80 bg-indigo-600 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
                  <BookIcon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">
                    {entry.levelLabel} / {entry.typeLabel}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white md:text-2xl">{entry.title}</h3>
                </div>
              </div>

              <p
                className="mt-4 text-sm leading-relaxed text-slate-200 md:text-[15px]"
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
                {entry.focusTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/12 bg-slate-900/75 px-3 py-1 text-[11px] font-semibold text-slate-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-300">
                  <span>{entry.estimatedMinutes} min</span>
                  <span className="text-slate-500">/</span>
                  <span>{entry.status === "completed" ? "Revision ouverte" : entry.typeLabel}</span>
                </div>

                <span className="inline-flex items-center justify-center gap-2 text-sm font-bold text-cyan-300">
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
