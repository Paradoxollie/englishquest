"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import { paliers } from "@/lib/courses/data";
import { isCoursePlacementSkip } from "@/lib/courses/mission-telemetry";
import { courseSearchTerms, findArcadeSearchMatches, matchesCourseSearch } from "@/lib/courses/library-search";
import { getGamePresentation } from "@/lib/games/presentation";

type CourseLibraryExplorerProps = {
  entries: CourseRoadmapEntry[];
  missionPlans: Record<number, CourseMissionPlan>;
  recommendedCourseId: number | null;
  isAuthenticated: boolean;
};

const levelFilters = [
  { label: "Tous les niveaux", value: "all" },
  { label: "A1", value: "1" },
  { label: "A2", value: "2" },
  { label: "A2+", value: "3" },
  { label: "B1", value: "4" },
  { label: "B1+", value: "5" },
];

function statusLabel(entry: CourseRoadmapEntry, isRecommended: boolean, isAuthenticated: boolean) {
  if (entry.status === "completed") {
    return { text: isCoursePlacementSkip(entry.missionTelemetry) ? "Acquis au test" : "Validé", className: "eq-chip-mint" };
  }
  if (entry.status === "in_progress") {
    return { text: "Mission en cours", className: "eq-chip-gold" };
  }
  if (isRecommended) {
    return { text: isAuthenticated || entry.courseId > 1 ? "Prochaine mission" : "Commence ici", className: "eq-chip-gold-soft" };
  }
  return null;
}

export function CourseLibraryExplorer({
  entries,
  missionPlans,
  recommendedCourseId,
  isAuthenticated,
}: CourseLibraryExplorerProps) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const terms = courseSearchTerms(deferredSearch);
  const arcadeMatches = findArcadeSearchMatches(terms);

  const filteredEntries = entries.filter((entry) =>
    (level === "all" || String(entry.palierId) === level) &&
    matchesCourseSearch(entry, missionPlans[entry.courseId]?.objective, terms)
  );

  const grouped = paliers
    .map((palier) => ({
      palier,
      entries: filteredEntries.filter((entry) => entry.palierId === palier.id),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex-1">
          <span className="sr-only">Rechercher un cours</span>
          <input
            id="course-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Prétérit, se présenter, verbes irréguliers…"
            className="w-full rounded-[var(--radius)] border border-[var(--line-strong)] bg-[var(--ink-2)] px-4 py-3 text-[0.95rem] text-[var(--fg)] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--cyan)]"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par niveau">
          {levelFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLevel(option.value)}
              className={`eq-chip ${level === option.value ? "eq-chip-gold" : ""}`}
              aria-pressed={level === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">
        {filteredEntries.length} cours{arcadeMatches.length ? ` et ${arcadeMatches.length} jeu${arcadeMatches.length > 1 ? "x" : ""} d’arcade` : ""}.
      </p>
      {arcadeMatches.length ? (
        <section aria-labelledby="library-arcade-heading">
          <h2 id="library-arcade-heading" className="eq-h2">S’entraîner en jouant</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {arcadeMatches.map((game) => (
              <li key={game.slug}>
                <Link href={`/play/${game.slug}`} className="eq-card eq-card-link h-full gap-1 p-4">
                  <h3 className="eq-h3">{game.name}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">{getGamePresentation(game).hook}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {grouped.length === 0 && !arcadeMatches.length ? (
        <p className="eq-card text-[var(--muted)]">
          Aucun cours ni jeu ne correspond à ta recherche. Essaie par exemple « prétérit » ou « se présenter ».
        </p>
      ) : null}

      {grouped.map(({ palier, entries: palierEntries }) => (
        <section key={palier.id} aria-labelledby={`palier-${palier.id}`}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id={`palier-${palier.id}`} className="eq-h2">
              {palier.title.replace(/^Niveau \d+ : /, "")}
            </h2>
            <span className="eq-chip eq-chip-cyan">{palier.level}</span>
            <p className="w-full text-sm text-[var(--muted)]">{palier.description}</p>
          </div>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {palierEntries.map((entry) => {
              const isRecommended = entry.courseId === recommendedCourseId;
              const badge = statusLabel(entry, isRecommended, isAuthenticated);
              return (
                <li key={entry.courseId}>
                  <Link
                    href={`/cours/${entry.courseId}`}
                    className={`eq-card eq-card-link h-full gap-2.5 p-4 ${
                      isRecommended || entry.status === "in_progress"
                        ? "ring-2 ring-[var(--pro-primary)]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
                        #{String(entry.courseId).padStart(2, "0")} · {palier.level}
                      </span>
                      {badge ? <span className={`eq-chip ${badge.className}`}>{badge.text}</span> : null}
                    </div>
                    <h3 className="eq-h3">{entry.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">{entry.summary}</p>
                    <p className="mt-auto pt-2 text-xs font-bold text-[var(--muted)]">
                      {entry.estimatedMinutes} min
                      {isAuthenticated ? (
                        <span className="text-[var(--gold)]">
                          {" "}
                          · +{entry.rewardXp} XP, +{entry.rewardGold} or
                        </span>
                      ) : null}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
