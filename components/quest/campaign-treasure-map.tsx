"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { launchCourseMissionAction } from "@/app/cours/actions";
import { addCacheBustingIfSupabase } from "@/lib/utils/image-cache";
import { getCourseMissionPlan } from "@/lib/courses/campaign";
import type { CourseMissionPlan } from "@/lib/courses/campaign";
import { getCourseVisualProfile } from "@/lib/courses/presentation";
import type { CourseRoadmapEntry } from "@/lib/courses/progress";

type QuestPlayerToken = {
  username: string;
  initial: string;
  avatarImageUrl: string | null;
  backgroundImageUrl: string | null;
  backgroundTheme: string | null;
};

type CampaignTreasureMapProps = {
  entries: CourseRoadmapEntry[];
  activeCourseId: number | null;
  missionPlans: Record<number, CourseMissionPlan>;
  playerToken: QuestPlayerToken | null;
};

type PositionedEntry = {
  entry: CourseRoadmapEntry;
  xPercent: number;
  xViewBox: number;
  y: number;
};

type ChapterTheme = {
  place: string;
  terrain: "harbor" | "cliffs" | "vortex" | "maze" | "citadel";
  hazard: string;
  route: string;
  caption: string;
};

type HazardMarker = {
  chapter: number;
  xPercent: number;
  yOffset: number;
  label: string;
  detail: string;
  kind: "trap" | "storm" | "bridge" | "maze" | "boss";
};

const mapWidth = 1200;
const chapterHeight = 640;
const chapterTopPadding = 150;

const chapterNodeTemplates: Record<number, Array<{ xPercent: number; yOffset: number }>> = {
  1: [
    { xPercent: 13, yOffset: 28 },
    { xPercent: 22, yOffset: 92 },
    { xPercent: 34, yOffset: 70 },
    { xPercent: 47, yOffset: 136 },
    { xPercent: 60, yOffset: 112 },
    { xPercent: 72, yOffset: 196 },
    { xPercent: 63, yOffset: 282 },
    { xPercent: 49, yOffset: 330 },
    { xPercent: 34, yOffset: 402 },
    { xPercent: 20, yOffset: 462 },
  ],
  2: [
    { xPercent: 84, yOffset: 30 },
    { xPercent: 72, yOffset: 92 },
    { xPercent: 58, yOffset: 72 },
    { xPercent: 45, yOffset: 150 },
    { xPercent: 32, yOffset: 126 },
    { xPercent: 22, yOffset: 220 },
    { xPercent: 31, yOffset: 304 },
    { xPercent: 45, yOffset: 360 },
    { xPercent: 63, yOffset: 410 },
    { xPercent: 78, yOffset: 472 },
  ],
  3: [
    { xPercent: 17, yOffset: 30 },
    { xPercent: 28, yOffset: 88 },
    { xPercent: 42, yOffset: 78 },
    { xPercent: 55, yOffset: 154 },
    { xPercent: 69, yOffset: 130 },
    { xPercent: 82, yOffset: 220 },
    { xPercent: 71, yOffset: 306 },
    { xPercent: 55, yOffset: 360 },
    { xPercent: 39, yOffset: 420 },
    { xPercent: 27, yOffset: 482 },
  ],
  4: [
    { xPercent: 80, yOffset: 30 },
    { xPercent: 66, yOffset: 90 },
    { xPercent: 51, yOffset: 76 },
    { xPercent: 37, yOffset: 154 },
    { xPercent: 24, yOffset: 130 },
    { xPercent: 16, yOffset: 226 },
    { xPercent: 27, yOffset: 310 },
    { xPercent: 43, yOffset: 366 },
    { xPercent: 60, yOffset: 418 },
    { xPercent: 72, yOffset: 482 },
  ],
  5: [
    { xPercent: 18, yOffset: 32 },
    { xPercent: 30, yOffset: 92 },
    { xPercent: 45, yOffset: 78 },
    { xPercent: 59, yOffset: 158 },
    { xPercent: 72, yOffset: 132 },
    { xPercent: 84, yOffset: 230 },
    { xPercent: 72, yOffset: 316 },
    { xPercent: 56, yOffset: 374 },
    { xPercent: 39, yOffset: 430 },
    { xPercent: 50, yOffset: 506 },
  ],
};

const chapterThemes: Record<number, ChapterTheme> = {
  1: {
    place: "Port des Fondations",
    terrain: "harbor",
    hazard: "Fosses des auxiliaires",
    route: "Route des bases",
    caption: "Installer les reflexes essentiels.",
  },
  2: {
    place: "Falaises de l'Elan",
    terrain: "cliffs",
    hazard: "Pont des modaux",
    route: "Passage A2",
    caption: "Traverser les premieres variations.",
  },
  3: {
    place: "Vortex des Temps",
    terrain: "vortex",
    hazard: "Tempete des recits",
    route: "Couloir B1",
    caption: "Garder le cap dans les temps.",
  },
  4: {
    place: "Labyrinthe Tactique",
    terrain: "maze",
    hazard: "Pieges de nuance",
    route: "Zone B2",
    caption: "Choisir la bonne structure.",
  },
  5: {
    place: "Citadelle Finale",
    terrain: "citadel",
    hazard: "Boss des automatismes",
    route: "Ascension C1",
    caption: "Consolider sans hesitation.",
  },
};

const hazardMarkers: HazardMarker[] = [
  {
    chapter: 1,
    xPercent: 79,
    yOffset: 98,
    label: "Danger",
    detail: "Auxiliaires pieges",
    kind: "trap",
  },
  {
    chapter: 2,
    xPercent: 16,
    yOffset: 112,
    label: "Pont",
    detail: "Modaux instables",
    kind: "bridge",
  },
  {
    chapter: 3,
    xPercent: 83,
    yOffset: 112,
    label: "Tempete",
    detail: "Temps composes",
    kind: "storm",
  },
  {
    chapter: 4,
    xPercent: 18,
    yOffset: 118,
    label: "Piege",
    detail: "Nuances proches",
    kind: "maze",
  },
  {
    chapter: 5,
    xPercent: 78,
    yOffset: 86,
    label: "Boss",
    detail: "Automatismes",
    kind: "boss",
  },
];

const defaultAvatarThemes: Record<string, string> = {
  emerald: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  red: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
  blue: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
  purple: "linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)",
  green: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
  gold: "linear-gradient(135deg, #f59e0b 0%, #facc15 100%)",
  dark: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  slate: "linear-gradient(135deg, #334155 0%, #64748b 100%)",
  cyan: "linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)",
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;
  const value = Number.parseInt(safe, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const beforePrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? current;
    const tension = 0.2;
    const cp1x = previous.x + (current.x - beforePrevious.x) * tension;
    const cp1y = previous.y + (current.y - beforePrevious.y) * tension;
    const cp2x = current.x - (next.x - previous.x) * tension;
    const cp2y = current.y - (next.y - previous.y) * tension;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
  }

  return path;
}

function getNodeTone(status: CourseRoadmapEntry["status"], isCurrent: boolean) {
  if (isCurrent) {
    return {
      border: "#67e8f9",
      fill: "linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)",
      text: "#020617",
      glow: "0 0 0 10px rgba(34, 211, 238, 0.18), 0 18px 38px rgba(8, 145, 178, 0.34)",
    };
  }

  if (status === "completed") {
    return {
      border: "#86efac",
      fill: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
      text: "#f8fafc",
      glow: "0 12px 30px rgba(16, 185, 129, 0.24)",
    };
  }

  if (status === "unlocked" || status === "in_progress") {
    return {
      border: "#bfdbfe",
      fill: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
      text: "#f8fafc",
      glow: "0 12px 30px rgba(56, 189, 248, 0.18)",
    };
  }

  return {
    border: "#475569",
    fill: "linear-gradient(135deg, #101827 0%, #253244 100%)",
    text: "#cbd5e1",
    glow: "0 10px 20px rgba(2, 6, 23, 0.32)",
  };
}

function getTooltipPlacement(xPercent: number, y: number, mapHeight: number) {
  const isNearLeftEdge = xPercent < 22;
  const isNearRightEdge = xPercent > 78;
  const isNearBottomEdge = y > mapHeight - 220;

  return {
    horizontalClass: isNearLeftEdge
      ? "left-0 translate-x-0"
      : isNearRightEdge
        ? "right-0 left-auto translate-x-0"
        : "left-1/2 -translate-x-1/2",
    verticalClass: isNearBottomEdge ? "bottom-full mb-3" : "top-full mt-3",
    textAlignClass: isNearRightEdge ? "text-right" : "text-left",
  };
}

function TerrainIllustration({
  terrain,
  color,
  className = "",
}: {
  terrain: ChapterTheme["terrain"];
  color: string;
  className?: string;
}) {
  const stroke = color;
  const fill = hexToRgba(color, 0.13);

  switch (terrain) {
    case "harbor":
      return (
        <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
          <path d="M22 110c32-18 60-18 92 0s60 18 84 0" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" opacity="0.55" />
          <path d="M62 92V38l42-18 42 18v54" fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
          <path d="M82 90V62h44v28M62 62h84" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <path d="M34 118h154" stroke={stroke} strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
    case "cliffs":
      return (
        <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
          <path d="M22 122 64 36l32 50 30-64 72 100Z" fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
          <path d="M64 36 82 82l14 4M126 22l14 54 24 22" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          <path d="M72 114h108" stroke={stroke} strokeWidth="8" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
    case "vortex":
      return (
        <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
          <path d="M156 70c0 32-28 56-62 48-30-7-46-39-32-66 15-30 55-38 82-17 24 19 24 54 2 70-22 17-56 6-62-20-5-22 13-42 35-38 20 4 29 26 17 42-11 15-35 12-40-6" fill="none" stroke={stroke} strokeWidth="7" strokeLinecap="round" opacity="0.65" />
          <circle cx="112" cy="74" r="18" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M44 36h32M156 116h34M172 34l20-14" stroke={stroke} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        </svg>
      );
    case "maze":
      return (
        <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
          <path d="M34 120V34h152v86" fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
          <path d="M62 98V58h38v26h36V58h24v40M62 58h22M136 58h24M100 120V96h36v24" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 120h168" stroke={stroke} strokeWidth="7" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
    case "citadel":
      return (
        <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
          <path d="M44 120V54l26 12 40-34 40 34 26-12v66Z" fill={fill} stroke={stroke} strokeWidth="7" strokeLinejoin="round" />
          <path d="M86 120V82h48v38M70 66v-28M150 66v-28M102 48h16" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 120h156" stroke={stroke} strokeWidth="8" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
  }
}

function HazardIcon({
  kind,
  className = "",
}: {
  kind: HazardMarker["kind"];
  className?: string;
}) {
  switch (kind) {
    case "trap":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M8 38h32L24 10Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
          <path d="M24 20v8M24 34h.01" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    case "storm":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M14 30c-5 0-8-3-8-8 0-4 3-7 7-8 2-5 6-8 12-8 7 0 12 5 13 11 3 1 5 4 5 7 0 4-3 6-7 6" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M25 28 17 42h8l-2 8 10-16h-8Z" fill="currentColor" />
        </svg>
      );
    case "bridge":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M7 34c10-16 24-16 34 0" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M12 34h24M16 27v12M24 24v16M32 27v12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "maze":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M10 10h28v28H10zM18 10v12h12V10M18 38V26h12v12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        </svg>
      );
    case "boss":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path d="M8 36h32l-3-18-8 7-5-13-5 13-8-7Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
          <path d="M11 36h26" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
  }
}

function ChapterIsland({
  chapter,
  top,
  height,
  isEven,
}: {
  chapter: number;
  top: number;
  height: number;
  isEven: boolean;
}) {
  const profile = getCourseVisualProfile(chapter);
  const theme = chapterThemes[chapter];

  return (
    <div
      className="pointer-events-none absolute inset-x-4 overflow-hidden border-2 border-black/80 bg-slate-950/72 shadow-[0_18px_44px_rgba(0,0,0,0.28)] md:inset-x-8"
      style={{
        top,
        height,
        clipPath: isEven
          ? "polygon(1% 7%, 99% 1%, 96% 94%, 4% 100%)"
          : "polygon(4% 1%, 96% 7%, 99% 100%, 1% 94%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(profile.accent, 0.15)} 0%, rgba(2, 6, 23, 0.62) 45%, ${hexToRgba(profile.secondary, 0.13)} 100%)`,
        }}
      />
      <div className="absolute inset-0 comic-dot-pattern-light opacity-20" />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: isEven
            ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 28px)"
            : "repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 28px)",
        }}
      />
      <TerrainIllustration
        terrain={theme.terrain}
        color={profile.accent}
        className={`absolute ${isEven ? "right-8" : "left-8"} bottom-6 h-40 w-56 opacity-35 md:h-52 md:w-72`}
      />
      <div className={`absolute top-8 max-w-[19rem] ${isEven ? "left-8" : "right-16 text-right"}`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: profile.accent }}>
          Acte {chapter}
        </p>
        <p className="mt-2 text-2xl font-black leading-tight text-white text-outline md:text-3xl">
          {theme.place}
        </p>
        <p className="mt-2 max-w-[18rem] text-xs font-semibold leading-relaxed text-slate-300">
          {theme.caption}
        </p>
      </div>
      <div
        className={`absolute ${isEven ? "left-8" : "right-8"} bottom-8 border-2 border-black bg-slate-950/82 px-4 py-3 shadow-[0_3px_0_#000]`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
          {theme.route}
        </p>
        <p className="mt-1 max-w-[12rem] text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
          Danger: {theme.hazard}
        </p>
      </div>
    </div>
  );
}

export function CampaignTreasureMap({
  entries,
  activeCourseId,
  missionPlans,
  playerToken,
}: CampaignTreasureMapProps) {
  const positionedEntries: PositionedEntry[] = entries.map((entry) => {
    const chapterIndex = entry.palierId - 1;
    const localIndex = (entry.courseId - 1) % 10;
    const template = chapterNodeTemplates[entry.palierId] ?? chapterNodeTemplates[1];
    const point = template[localIndex] ?? template[template.length - 1];
    const xPercent = point.xPercent;
    const xViewBox = (xPercent / 100) * mapWidth;
    const y = chapterIndex * chapterHeight + chapterTopPadding + point.yOffset;

    return {
      entry,
      xPercent,
      xViewBox,
      y,
    };
  });

  const mapHeight =
    entries.length === 0 ? chapterHeight : positionedEntries[positionedEntries.length - 1].y + 190;
  const activeIndex = positionedEntries.findIndex((item) => item.entry.courseId === activeCourseId);
  const activePoint =
    activeIndex >= 0
      ? positionedEntries[activeIndex]
      : positionedEntries.find((item) => item.entry.status !== "locked") ?? positionedEntries[0];
  const allPath = buildPath(positionedEntries.map((item) => ({ x: item.xViewBox, y: item.y })));
  const progressPath = buildPath(
    positionedEntries
      .slice(0, activeIndex >= 0 ? activeIndex + 1 : 1)
      .map((item) => ({ x: item.xViewBox, y: item.y }))
  );
  const shouldDockPlayerToken =
    Boolean(activePoint && activePoint.y < 260 && activePoint.xPercent < 20);
  const playerTokenXPercent = activePoint?.xPercent ?? 0;
  const playerTokenYOffset = shouldDockPlayerToken ? 145 : 78;

  return (
    <div className="relative overflow-hidden border-4 border-black bg-slate-950 p-4 shadow-[0_4px_0_#000] md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
            Carte de campagne
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white text-outline md:text-4xl">
            La route des missions
          </h2>
        </div>
        <div className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-300 sm:grid-cols-3">
          <span className="border border-cyan-300/30 bg-cyan-950/35 px-3 py-2 text-cyan-200">
            Pion actif
          </span>
          <span className="border border-amber-300/30 bg-amber-950/30 px-3 py-2 text-amber-200">
            Danger
          </span>
          <span className="border border-emerald-300/30 bg-emerald-950/30 px-3 py-2 text-emerald-200">
            Checkpoint
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto border-4 border-black bg-[#06111f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 comic-dot-pattern-light opacity-16" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "linear-gradient(90deg, rgba(34,211,238,0.08) 0 1px, transparent 1px 96px), linear-gradient(180deg, rgba(34,211,238,0.08) 0 1px, transparent 1px 96px)",
          }}
        />

        <div className="relative min-w-[840px]" style={{ height: mapHeight }}>
          {[1, 2, 3, 4, 5].map((chapter, index) => (
            <ChapterIsland
              key={chapter}
              chapter={chapter}
              top={index * chapterHeight + 34}
              height={chapterHeight - 58}
              isEven={index % 2 === 0}
            />
          ))}

          {hazardMarkers.map((hazard) => {
            const profile = getCourseVisualProfile(hazard.chapter);
            const top = (hazard.chapter - 1) * chapterHeight + chapterTopPadding + hazard.yOffset;

            return (
              <div
                key={`${hazard.chapter}-${hazard.kind}`}
                className="pointer-events-none absolute z-10 w-40 -translate-x-1/2 border-4 border-black bg-slate-950/90 p-3 text-left shadow-[0_4px_0_#000]"
                style={{
                  left: `${hazard.xPercent}%`,
                  top,
                  color: profile.secondary,
                }}
              >
                <div className="flex items-center gap-2">
                  <HazardIcon kind={hazard.kind} className="h-6 w-6 shrink-0 text-amber-300" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                      {hazard.label}
                    </p>
                    <p className="mt-1 text-xs font-bold leading-tight text-white text-outline">
                      {hazard.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="questRoad" x1="0" y1="0" x2="1200" y2={mapHeight}>
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="35%" stopColor="#34d399" />
                <stop offset="70%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={allPath}
              fill="none"
              stroke="rgba(0,0,0,0.86)"
              strokeWidth="36"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={allPath}
              fill="none"
              stroke="rgba(148, 163, 184, 0.38)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={allPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.22)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="18 24"
            />
            <path
              d={progressPath}
              fill="none"
              filter="url(#roadGlow)"
              stroke="url(#questRoad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {positionedEntries.map((item) => {
            const isCurrent = item.entry.courseId === activePoint?.entry.courseId;
            const tone = getNodeTone(item.entry.status, isCurrent);
            const mission = missionPlans[item.entry.courseId] ?? getCourseMissionPlan(item.entry);
            const profile = getCourseVisualProfile(item.entry.palierId);
            const localIndex = (item.entry.courseId - 1) % 10;
            const isCheckpoint = localIndex === 4;
            const isGate = localIndex === 9;
            const canLaunch = item.entry.status !== "locked";
            const usesDirectNavigation =
              item.entry.status === "in_progress" || item.entry.status === "completed";
            const actionLabel =
              item.entry.status === "completed"
                ? "Revoir"
                : item.entry.status === "in_progress"
                  ? "Continuer"
                  : item.entry.status === "unlocked"
                    ? "Lancer"
                    : "Verrouille";
            const tooltipPlacement = getTooltipPlacement(item.xPercent, item.y, mapHeight);
            const nodeSize = isGate ? 76 : isCheckpoint ? 68 : 56;
            const nodeClasses = `group absolute z-20 block ${isCurrent ? "z-40" : "hover:z-50 focus-visible:z-50"}`;
            const nodeStyle = {
              left: `${item.xPercent}%`,
              top: item.y,
              transform: "translate(-50%, -50%)",
            } as const;
            const nodeBody = (
              <>
                <div
                  className={`relative flex items-center justify-center border-4 text-sm font-black ${
                    isGate ? "rounded-[1.35rem]" : isCheckpoint ? "rounded-[1rem]" : "rounded-full"
                  }`}
                  style={{
                    width: nodeSize,
                    height: nodeSize,
                    color: tone.text,
                    borderColor: tone.border,
                    background: tone.fill,
                    boxShadow: tone.glow,
                  }}
                >
                  <div className="absolute inset-[-8px] border border-white/14" style={{ borderRadius: isGate ? 24 : isCheckpoint ? 18 : 999 }} />
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-[-18px] rounded-full border-2 border-cyan-200/70"
                      animate={{ scale: [0.9, 1.12, 0.9], opacity: [0.35, 0.9, 0.35] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {(isCheckpoint || isGate) && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-black bg-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-white">
                      {isGate ? "Gate" : "CP"}
                    </span>
                  )}
                  <span className="relative z-10">{item.entry.courseId}</span>
                </div>

                <div
                  className={`pointer-events-none absolute z-30 hidden w-[230px] border-4 border-black bg-slate-950/96 p-3 shadow-[0_4px_0_#000] transition-opacity duration-200 md:block ${tooltipPlacement.horizontalClass} ${tooltipPlacement.verticalClass} ${tooltipPlacement.textAlignClass} ${
                    isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: profile.accent }}>
                    Mission {item.entry.courseId} / {actionLabel}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-tight text-white text-outline">
                    {item.entry.title}
                  </p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-300">
                    {mission.gameChallengeCompact} - {item.entry.levelLabel.split(" - ")[0]}
                  </p>
                  {(isCheckpoint || isGate) && (
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                      {isGate ? "Porte de fin d'acte" : "Checkpoint de zone"}
                    </p>
                  )}
                </div>
              </>
            );

            if (!canLaunch) {
              return (
                <div
                  key={item.entry.courseId}
                  className={`${nodeClasses} cursor-not-allowed opacity-80`}
                  style={nodeStyle}
                  aria-disabled="true"
                >
                  {nodeBody}
                </div>
              );
            }

            if (usesDirectNavigation) {
              return (
                <Link
                  key={item.entry.courseId}
                  href={`/cours/${item.entry.courseId}`}
                  className={nodeClasses}
                  style={nodeStyle}
                  aria-label={`${actionLabel} la mission ${item.entry.courseId}`}
                >
                  {nodeBody}
                </Link>
              );
            }

            return (
              <form
                key={item.entry.courseId}
                action={launchCourseMissionAction}
                className={nodeClasses}
                style={nodeStyle}
              >
                <input type="hidden" name="courseNumber" value={item.entry.courseId} />
                <button
                  type="submit"
                  className="block bg-transparent p-0 text-left"
                  aria-label={`${actionLabel} la mission ${item.entry.courseId}`}
                >
                  {nodeBody}
                </button>
              </form>
            );
          })}

          {activePoint && (
            <motion.div
              className="pointer-events-none absolute z-50"
              style={{
                left: `${playerTokenXPercent}%`,
                top: activePoint.y - playerTokenYOffset,
                transform: "translate(-50%, -50%)",
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-300/30 blur-xl" />
                {playerToken?.backgroundImageUrl && (
                  <div
                    className="absolute inset-[-14px] rounded-full opacity-45 blur-md"
                    style={{
                      backgroundImage: `url("${addCacheBustingIfSupabase(playerToken.backgroundImageUrl)}")`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  />
                )}
                <div
                  className="relative h-16 w-16 rounded-full border-4 border-black p-1.5 shadow-[0_18px_34px_rgba(0,0,0,0.34)] md:h-20 md:w-20"
                  style={{
                    background:
                      playerToken?.backgroundImageUrl
                        ? `url("${addCacheBustingIfSupabase(playerToken.backgroundImageUrl)}") center / cover`
                        : defaultAvatarThemes[playerToken?.backgroundTheme ?? "cyan"] ?? defaultAvatarThemes.cyan,
                  }}
                >
                  <div className="absolute inset-[-8px] rounded-full border-2 border-cyan-200/50" />
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-black bg-slate-950">
                    {playerToken?.avatarImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={addCacheBustingIfSupabase(playerToken.avatarImageUrl)}
                        alt={playerToken.username}
                        className="h-full w-full rounded-full object-cover"
                        style={{ objectPosition: "center top" }}
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <span className="text-lg font-black text-white text-outline md:text-2xl">
                        {playerToken?.initial ?? "J"}
                      </span>
                    )}
                  </div>
                </div>
                {!shouldDockPlayerToken && (
                  <div className="mx-auto mt-1 h-4 w-4 rotate-45 border-r-4 border-b-4 border-black bg-cyan-300" />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { QuestPlayerToken };
