"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MissionStarsLegend, MissionStarsRow } from "@/components/rewards/mission-stars";
import type { MissionSummary } from "@/lib/courses/mission-summary";
import type { CourseStatus } from "@/lib/courses/progress";
import { describeMissionStars, PRACTICE_STAR_TARGET, type MissionStars } from "@/lib/courses/stars";

export type MapNode = {
  courseId: number;
  title: string;
  shortName: string;
  status: CourseStatus;
  /** Validé par le test de niveau, pas joué. */
  placed?: boolean;
  /** Étoiles du joueur connecté (null pour un invité). */
  stars?: MissionStars | null;
  /** Meilleur entraînement ciblé sur ce cours (bonnes réponses dans une partie). */
  practiceBest?: number;
  isCurrent: boolean;
  estimatedMinutes: number;
  rewardXp: number;
  rewardGold: number;
  gameName: string | null;
  gameSlug: string | null;
  challengeCompact: string | null;
};

export type MapChapter = {
  id: number;
  name: string;
  level: string;
  tagline: string;
  accent: string;
  gradient: [string, string];
  artSrc: string | null;
  completedCount: number;
  nodes: MapNode[];
  exam: { status: "locked" | "open" | "passed"; bestCorrect: number | null; total: number; rewardXp: number; rewardGold: number } | null;
};

export type MapMission = MissionSummary;

type AdventureMapProps = {
  chapters: MapChapter[];
  mission: MapMission | null;
  player: { initial: string; avatarUrl: string | null } | null;
  isLoggedIn: boolean;
};

const ROW_HEIGHT = 96;
const TOP_PADDING = 50;
const BOTTOM_PADDING = 40;
const X_POSITIONS = [22, 50, 78, 50]; // pourcentages, route en lacets

function nodePosition(index: number) {
  return {
    x: X_POSITIONS[index % X_POSITIONS.length],
    y: TOP_PADDING + index * ROW_HEIGHT,
  };
}

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) {
    return "";
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const midY = (prev.y + next.y) / 2;
    d += ` C ${prev.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
  }
  return d;
}

function statusLabel(node: MapNode) {
  if (node.status === "completed") return node.placed ? "Acquise au test" : "Validée";
  if (node.isCurrent) return "En cours";
  if (node.status === "unlocked" || node.status === "in_progress") return "Ouverte";
  return "À venir";
}

export function AdventureMap({ chapters, mission, player, isLoggedIn }: AdventureMapProps) {
  const currentNode = useMemo(
    () => chapters.flatMap((chapter) => chapter.nodes).find((node) => node.isCurrent) ?? null,
    [chapters]
  );
  const [selectedId, setSelectedId] = useState<number | null>(currentNode?.courseId ?? null);
  const selected = chapters.flatMap((chapter) => chapter.nodes).find((node) => node.courseId === selectedId) ?? null;

  /* La caméra glisse jusqu'à la mission en cours quand elle est hors de l'écran. */
  useEffect(() => {
    if (!currentNode || typeof window === "undefined") return;
    if (window.location.hash && window.location.hash !== "#mission-courante") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      const target = document.getElementById("mission-courante");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.85 || rect.top < 0) {
        target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [currentNode]);

  return (
    <div className="eq-map">
      {chapters.map((chapter) => {
        const points = chapter.nodes.map((_, index) => nodePosition(index));
        const trackHeight = TOP_PADDING + Math.max(0, chapter.nodes.length - 1) * ROW_HEIGHT + BOTTOM_PADDING;
        const lastDoneIndex = chapter.nodes.reduce(
          (acc, node, index) => (node.status === "completed" || node.isCurrent ? index : acc),
          -1
        );
        const basePath = buildPath(points);
        const donePath = lastDoneIndex >= 0 ? buildPath(points.slice(0, lastDoneIndex + 1)) : "";
        const hasSelectedHere = selected ? chapter.nodes.some((node) => node.courseId === selected.courseId) : false;

        return (
          <section
            key={chapter.id}
            className="eq-map-chapter"
            style={
              {
                "--chapter-a": chapter.gradient[0],
                "--chapter-b": chapter.gradient[1],
                "--chapter-accent": chapter.accent,
              } as React.CSSProperties
            }
            aria-labelledby={`chapter-${chapter.id}`}
          >
            {chapter.artSrc ? (
              <Image src={chapter.artSrc} alt="" fill sizes="760px" className="eq-map-art" />
            ) : null}

            <header className="eq-map-chapter-head">
              <p className="eq-map-chapter-kicker">
                Chapitre {chapter.id} · {chapter.level}
              </p>
              <h2 id={`chapter-${chapter.id}`} className="eq-map-chapter-title">
                {chapter.name}
              </h2>
              <p className="eq-map-chapter-tagline">{chapter.tagline}</p>
              <div className="eq-map-chapter-progress">
                <span className="eq-bar eq-bar-mint" aria-hidden="true">
                  <i style={{ width: `${chapter.nodes.length ? (chapter.completedCount / chapter.nodes.length) * 100 : 0}%` }} />
                </span>
                <span>
                  {chapter.completedCount} / {chapter.nodes.length}
                </span>
              </div>
            </header>

            <div className="eq-map-track" style={{ height: trackHeight }}>
              <svg
                className="eq-map-path"
                viewBox={`0 0 100 ${trackHeight}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path className="eq-map-path-base" d={basePath} />
                {donePath ? <path className="eq-map-path-done" d={donePath} /> : null}
              </svg>

              {chapter.nodes.map((node, index) => {
                const { x, y } = points[index];
                const isSelected = selected?.courseId === node.courseId;
                // Étoiles visibles dès qu'une est gagnée, ou sur une mission validée en jouant.
                const showStars = Boolean(
                  node.stars && (node.stars.count > 0 || (node.status === "completed" && !node.placed))
                );
                return (
                  <div
                    key={node.courseId}
                    className={`eq-node-slot${showStars ? " has-stars" : ""}`}
                    style={{ left: `${x}%`, top: y }}
                    id={node.isCurrent ? "mission-courante" : undefined}
                  >
                    <button
                      type="button"
                      className={`eq-node is-${node.status} ${node.isCurrent ? "is-current" : ""}`}
                      onClick={() => setSelectedId(node.courseId)}
                      aria-pressed={isSelected}
                      aria-label={`Mission ${node.courseId}, ${node.title}, ${statusLabel(node)}${
                        showStars && node.stars ? `, ${describeMissionStars(node.stars)}` : ""
                      }`}
                    >
                      {node.isCurrent && player ? (
                        <span className="eq-node-player" aria-hidden="true">
                          {player.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={player.avatarUrl} alt="" />
                          ) : (
                            player.initial
                          )}
                        </span>
                      ) : null}
                      <span className="eq-node-face">{node.status === "completed" ? "✓" : node.courseId}</span>
                      {showStars && node.stars ? (
                        <span className="eq-node-stars" aria-hidden="true">
                          <MissionStarsRow stars={node.stars} />
                        </span>
                      ) : null}
                    </button>
                    <span className="eq-node-label">{node.shortName}</span>
                  </div>
                );
              })}
            </div>

            {chapter.exam ? (
              <div className="px-4 pb-4 md:px-6">
                <div className={`eq-map-exam is-${chapter.exam.status}`}>
                  <div>
                    <p className="eq-map-card-kicker">Examen du chapitre</p>
                    <p className="eq-map-exam-text">
                      {chapter.exam.status === "passed"
                        ? `Réussi, ${chapter.exam.bestCorrect} / ${chapter.exam.total}. Tu peux le repasser pour le score.`
                        : chapter.exam.status === "open"
                          ? `Les dix missions sont validées : quinze questions, + ${chapter.exam.rewardXp} XP et + ${chapter.exam.rewardGold} or à la réussite.`
                          : `S'ouvre quand les dix missions sont validées (${chapter.completedCount} / ${chapter.nodes.length}).`}
                    </p>
                  </div>
                  {chapter.exam.status !== "locked" ? (
                    <Link href={`/examen/${chapter.id}`} className={`eq-btn ${chapter.exam.status === "open" ? "eq-btn-gold" : "eq-btn-ghost"} eq-btn-sm`}>
                      {chapter.exam.status === "open" ? "Passer l'examen" : "Repasser"}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}

            {hasSelectedHere && selected ? (
              <div className="px-4 pb-5 md:px-6">
                <div className="eq-map-card mx-auto" role="region" aria-label={`Détail de la mission ${selected.courseId}`}>
                  <p className="eq-map-card-kicker">
                    Mission {selected.courseId} · {statusLabel(selected)}
                  </p>
                  <p className="eq-map-card-title">{selected.title}</p>
                  {selected.stars && !selected.placed ? (
                    <MissionStarsLegend
                      stars={selected.stars}
                      practiceBest={selected.practiceBest ?? 0}
                      practiceTarget={PRACTICE_STAR_TARGET}
                    />
                  ) : null}
                  <div className="eq-map-card-chips">
                    <span className="eq-chip eq-chip-muted">{selected.estimatedMinutes} min</span>
                    <span className="eq-chip eq-chip-gold-soft">
                      + {selected.rewardXp} XP, + {selected.rewardGold} or
                    </span>
                    {selected.gameName ? (
                      <span className="eq-chip eq-chip-cyan">
                        {selected.gameName}
                        {selected.challengeCompact ? `, ${selected.challengeCompact}` : ""}
                      </span>
                    ) : null}
                  </div>

                  {selected.isCurrent && mission ? (
                    <>
                      <ol className="eq-map-steps">
                        <li className={mission.readingDone ? "is-done" : "is-now"}>Lire le cours</li>
                        <li className={mission.quizDone ? "is-done" : mission.readingDone ? "is-now" : ""}>
                          {mission.quizLabel}
                        </li>
                        <li>{mission.gameLabel}</li>
                      </ol>
                      <p className="eq-map-card-note">{mission.note}</p>
                      <div className="eq-map-card-actions">
                        <Link href={mission.cta.href} className={`eq-btn eq-btn-${mission.cta.tone}`}>
                          {mission.cta.label}
                        </Link>
                        {mission.secondary ? (
                          <Link href={mission.secondary.href} className="eq-btn eq-btn-ghost">
                            {mission.secondary.label}
                          </Link>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="eq-map-card-note">
                        {selected.status === "completed"
                          ? selected.placed
                            ? "Acquise au test de niveau. Le cours reste lisible si tu veux vérifier un point."
                            : "Mission validée. Tu peux relire le cours ou t'entraîner encore sur la notion."
                          : isLoggedIn
                            ? "Le cours se lit librement. Il deviendra ta mission quand les précédentes seront validées."
                            : "Le cours se lit librement. Avec un compte, il devient une mission qui fait avancer ton pion."}
                      </p>
                      <div className="eq-map-card-actions">
                        <Link href={`/cours/${selected.courseId}`} className="eq-btn eq-btn-ghost">
                          {selected.status === "completed" ? "Relire le cours" : "Lire le cours"}
                        </Link>
                        {selected.gameSlug ? (
                          <Link href={`/play/${selected.gameSlug}?cours=${selected.courseId}`} className="eq-btn eq-btn-ghost">
                            S&apos;entraîner sur la notion
                          </Link>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
