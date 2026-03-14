"use client";

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

type ChapterDecor = {
  burst: string;
  subtitle: string;
  emblem: "shield" | "bolt" | "portal" | "mask" | "crown";
};

const mapWidth = 1000;
const chapterHeight = 1030;
const chapterTopPadding = 170;
const nodeSpacingScale = 1.18;
const chapterNodeTemplates: Record<number, Array<{ xPercent: number; yOffset: number }>> = {
  1: [
    { xPercent: 16, yOffset: 0 },
    { xPercent: 20, yOffset: 48 },
    { xPercent: 27, yOffset: 98 },
    { xPercent: 38, yOffset: 150 },
    { xPercent: 51, yOffset: 208 },
    { xPercent: 63, yOffset: 278 },
    { xPercent: 58, yOffset: 354 },
    { xPercent: 46, yOffset: 426 },
    { xPercent: 33, yOffset: 492 },
    { xPercent: 28, yOffset: 558 },
  ],
  2: [
    { xPercent: 74, yOffset: 0 },
    { xPercent: 69, yOffset: 54 },
    { xPercent: 60, yOffset: 110 },
    { xPercent: 48, yOffset: 168 },
    { xPercent: 37, yOffset: 232 },
    { xPercent: 31, yOffset: 304 },
    { xPercent: 36, yOffset: 378 },
    { xPercent: 49, yOffset: 446 },
    { xPercent: 63, yOffset: 510 },
    { xPercent: 74, yOffset: 576 },
  ],
  3: [
    { xPercent: 24, yOffset: 0 },
    { xPercent: 31, yOffset: 56 },
    { xPercent: 44, yOffset: 114 },
    { xPercent: 58, yOffset: 176 },
    { xPercent: 67, yOffset: 244 },
    { xPercent: 63, yOffset: 320 },
    { xPercent: 52, yOffset: 394 },
    { xPercent: 39, yOffset: 464 },
    { xPercent: 29, yOffset: 536 },
    { xPercent: 34, yOffset: 604 },
  ],
  4: [
    { xPercent: 68, yOffset: 0 },
    { xPercent: 61, yOffset: 58 },
    { xPercent: 49, yOffset: 118 },
    { xPercent: 35, yOffset: 182 },
    { xPercent: 24, yOffset: 252 },
    { xPercent: 27, yOffset: 328 },
    { xPercent: 40, yOffset: 400 },
    { xPercent: 55, yOffset: 470 },
    { xPercent: 67, yOffset: 538 },
    { xPercent: 60, yOffset: 608 },
  ],
  5: [
    { xPercent: 20, yOffset: 0 },
    { xPercent: 25, yOffset: 60 },
    { xPercent: 36, yOffset: 124 },
    { xPercent: 50, yOffset: 190 },
    { xPercent: 62, yOffset: 262 },
    { xPercent: 68, yOffset: 340 },
    { xPercent: 59, yOffset: 418 },
    { xPercent: 45, yOffset: 490 },
    { xPercent: 32, yOffset: 558 },
    { xPercent: 36, yOffset: 628 },
  ],
};
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

const chapterDecor: Record<number, ChapterDecor> = {
  1: {
    burst: "GO!",
    subtitle: "Base d'entrainement",
    emblem: "shield",
  },
  2: {
    burst: "ZAP",
    subtitle: "Rampe d'elan",
    emblem: "bolt",
  },
  3: {
    burst: "SHIFT",
    subtitle: "Couloir des timelines",
    emblem: "portal",
  },
  4: {
    burst: "CLASH",
    subtitle: "Zone tactique",
    emblem: "mask",
  },
  5: {
    burst: "BOSS",
    subtitle: "Citadelle finale",
    emblem: "crown",
  },
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

function ChapterEmblem({
  emblem,
  color,
  className,
}: {
  emblem: ChapterDecor["emblem"];
  color: string;
  className?: string;
}) {
  const shared = {
    className,
    viewBox: "0 0 64 64",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (emblem) {
    case "shield":
      return (
        <svg {...shared}>
          <path d="M32 6l18 7v15c0 13-8 23-18 30C22 51 14 41 14 28V13l18-7z" stroke={color} strokeWidth="4" />
          <path d="M32 18v24M22 30h20" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...shared}>
          <path d="M36 4L16 34h12l-4 26 24-34H36l0-22z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
        </svg>
      );
    case "portal":
      return (
        <svg {...shared}>
          <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="4" />
          <circle cx="32" cy="32" r="10" stroke={color} strokeWidth="4" />
          <path d="M32 6v10M58 32H48M32 58V48M6 32h10" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "mask":
      return (
        <svg {...shared}>
          <path d="M16 16h32l-2 17c-1 11-8 19-14 21-6-2-13-10-14-21l-2-17z" stroke={color} strokeWidth="4" />
          <path d="M22 25c2-3 6-5 10-5s8 2 10 5" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M24 34c3 2 5 3 8 3s5-1 8-3" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case "crown":
      return (
        <svg {...shared}>
          <path d="M12 48h40l-4-24-12 10-8-18-8 18-12-10-4 24z" stroke={color} strokeWidth="4" strokeLinejoin="round" />
          <path d="M14 48h36" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
  }
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
    const tension = 0.18;
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
      ring: "rgba(34, 211, 238, 0.46)",
      fill: "linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)",
      glow: "0 0 0 10px rgba(34, 211, 238, 0.12), 0 18px 40px rgba(8, 145, 178, 0.32)",
    };
  }

  if (status === "completed") {
    return {
      ring: "rgba(52, 211, 153, 0.3)",
      fill: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
      glow: "0 12px 28px rgba(16, 185, 129, 0.24)",
    };
  }

  if (status === "unlocked" || status === "in_progress") {
    return {
      ring: "rgba(96, 165, 250, 0.24)",
      fill: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
      glow: "0 12px 28px rgba(56, 189, 248, 0.2)",
    };
  }

  return {
    ring: "rgba(71, 85, 105, 0.18)",
    fill: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    glow: "0 10px 18px rgba(15, 23, 42, 0.22)",
  };
}

function getTooltipPlacement(xPercent: number, y: number, mapHeight: number) {
  const isNearLeftEdge = xPercent < 24;
  const isNearRightEdge = xPercent > 76;
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
    const y = chapterIndex * chapterHeight + chapterTopPadding + Math.round(point.yOffset * nodeSpacingScale);

    return {
      entry,
      xPercent,
      xViewBox,
      y,
    };
  });

  const mapHeight = (entries.length === 0 ? chapterHeight : positionedEntries[positionedEntries.length - 1].y + 220);
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
  const chapterMarkers = [1, 2, 3, 4, 5].map((palierId) => {
    const firstPoint = positionedEntries.find((item) => item.entry.palierId === palierId);
    const profile = getCourseVisualProfile(palierId);
    const decor = chapterDecor[palierId];
    const chapterEntries = positionedEntries.filter((item) => item.entry.palierId === palierId);
    const lastPoint = chapterEntries[chapterEntries.length - 1];

    return firstPoint
      ? {
          palierId,
          profile,
          decor,
          xPercent: palierId % 2 === 1 ? 72 : 28,
          y: firstPoint.y - 132,
          zoneTop: firstPoint.y - 96,
          zoneHeight: (lastPoint?.y ?? firstPoint.y) - firstPoint.y + 210,
        }
      : null;
  }).filter((marker): marker is NonNullable<typeof marker> => Boolean(marker));

  return (
    <div
      className="comic-panel-dark relative overflow-hidden border-2 border-black p-4 md:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(4, 10, 20, 0.99) 0%, rgba(6, 13, 24, 0.98) 52%, rgba(3, 8, 18, 1) 100%)",
      }}
    >
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 text-outline">
            Carte de campagne
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white text-outline md:text-3xl">
            La route des missions
          </h2>
        </div>
        <p className="max-w-xl text-sm font-semibold leading-relaxed text-slate-300">
          Une carte unique, avec le parcours, les points a franchir et ton pion joueur sur la mission active.
        </p>
      </div>

      <div className="relative rounded-[28px] border-2 border-black bg-slate-950/90 p-3 md:p-4">
        <div className="absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute inset-0 opacity-[0.2] comic-dot-pattern-light" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              background:
                "repeating-linear-gradient(126deg, rgba(255, 255, 255, 0.07) 0 2px, transparent 2px 18px)",
            }}
          />
          <div className="absolute left-[-6%] top-[8%] h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute right-[-10%] top-[36%] h-60 w-60 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="absolute left-[12%] bottom-[8%] h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="relative z-10" style={{ height: mapHeight }}>
          {chapterMarkers.map((marker, index) => (
            <div
              key={`zone-${marker.palierId}`}
              className="pointer-events-none absolute inset-x-2 overflow-hidden rounded-[34px] border border-white/6 md:inset-x-4"
              style={{
                top: marker.zoneTop,
                height: marker.zoneHeight,
                background: `linear-gradient(135deg, ${hexToRgba(marker.profile.accent, 0.08)} 0%, rgba(2, 6, 23, 0.02) 36%, ${hexToRgba(marker.profile.secondary, 0.08)} 100%)`,
                clipPath:
                  index % 2 === 0
                    ? "polygon(0 4%, 97% 0, 100% 96%, 3% 100%)"
                    : "polygon(3% 0, 100% 4%, 97% 100%, 0 96%)",
              }}
            >
              <div className="absolute inset-0 opacity-[0.15] comic-dot-pattern-light" />
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  background:
                    index % 2 === 0
                      ? "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 24px)"
                      : "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 24px)",
                }}
              />
              <div
                className={`absolute ${index % 2 === 0 ? "right-6" : "left-6"} top-8 h-28 w-28 opacity-[0.16] md:h-40 md:w-40`}
              >
                <ChapterEmblem
                  emblem={marker.decor.emblem}
                  color={marker.profile.accent}
                  className="h-full w-full"
                />
              </div>
              <div className={`absolute ${index % 2 === 0 ? "left-6" : "right-6"} bottom-8 text-right md:text-left`}>
                <p
                  className="text-4xl font-black uppercase tracking-[-0.08em] opacity-[0.18] md:text-6xl"
                  style={{ color: marker.profile.secondary }}
                >
                  {marker.decor.burst}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                  {marker.decor.subtitle}
                </p>
              </div>
            </div>
          ))}

          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={allPath}
              fill="none"
              stroke="rgba(71, 85, 105, 0.45)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={allPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="1 24"
            />
            <path
              d={progressPath}
              fill="none"
              stroke="url(#questProgress)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <defs>
              <linearGradient id="questProgress" x1="0" y1="0" x2="1000" y2={mapHeight}>
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="48%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {chapterMarkers.map((marker) => (
            <div
              key={marker.palierId}
              className="pointer-events-none absolute z-10 w-[70%] max-w-[220px] -translate-x-1/2 rounded-[24px] border-2 border-black p-3 text-center shadow-[0_18px_35px_rgba(0,0,0,0.28)] md:max-w-[320px] md:p-4"
              style={{
                left: `${marker.xPercent}%`,
                top: marker.y,
                background: marker.profile.cardBackgroundSoft,
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-black bg-slate-950/80 p-1.5 md:h-12 md:w-12">
                  <ChapterEmblem
                    emblem={marker.decor.emblem}
                    color={marker.profile.accent}
                    className="h-full w-full"
                  />
                </div>
                <div className="text-left">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.24em]"
                    style={{ color: marker.profile.accent }}
                  >
                    Acte {marker.palierId}
                  </p>
                  <p className="mt-1 text-base font-bold text-white text-outline md:text-lg">
                    {marker.profile.chapterLabel}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {positionedEntries.map((item) => {
            const isCurrent = item.entry.courseId === activePoint?.entry.courseId;
            const tone = getNodeTone(item.entry.status, isCurrent);
            const mission = missionPlans[item.entry.courseId] ?? getCourseMissionPlan(item.entry);
            const profile = getCourseVisualProfile(item.entry.palierId);
            const localIndex = (item.entry.courseId - 1) % 10;
            const isCheckpoint = localIndex === 4;
            const isBossGate = localIndex === 9;
            const nodeSize = isBossGate ? 76 : isCheckpoint ? 64 : 56;
            const badgeLabel = isBossGate ? "Gate" : isCheckpoint ? "CP" : null;
            const tooltipPlacement = getTooltipPlacement(item.xPercent, item.y, mapHeight);
            const canLaunch = item.entry.status !== "locked";
            const actionLabel =
              item.entry.status === "completed"
                ? "Clique pour revoir"
                : item.entry.status === "in_progress"
                  ? "Clique pour continuer"
                  : item.entry.status === "unlocked"
                    ? "Clique pour lancer"
                    : "Etape verrouillee";
            const nodeClasses = `group absolute block ${
              isCurrent ? "z-30" : "z-20 hover:z-40 focus-visible:z-40"
            }`;
            const nodeStyle = {
              left: `${item.xPercent}%`,
              top: item.y,
              transform: "translate(-50%, -50%)",
            } as const;
            const nodeBody = (
              <>
                <div
                  className={`relative flex items-center justify-center border-4 border-black text-sm font-black text-white md:text-base ${
                    isBossGate ? "rounded-[1.75rem]" : isCheckpoint ? "rounded-[1.4rem]" : "rounded-full"
                  }`}
                  style={{
                    height: nodeSize,
                    width: nodeSize,
                    background: tone.fill,
                    boxShadow: tone.glow,
                  }}
                >
                  <div
                    className={`${isBossGate ? "rounded-[2rem]" : isCheckpoint ? "rounded-[1.7rem]" : "rounded-full"} absolute inset-[-10px] border`}
                    style={{
                      borderColor: tone.ring,
                      transform: isCheckpoint ? "rotate(8deg)" : undefined,
                    }}
                  />
                  <div
                    className={`${isBossGate ? "rounded-[1.5rem]" : isCheckpoint ? "rounded-[1.2rem]" : "rounded-full"} absolute inset-[6px] border border-white/10`}
                    style={{ transform: isBossGate ? "rotate(-6deg)" : undefined }}
                  />
                  {isCurrent && (
                    <motion.div
                      className={`${isBossGate ? "rounded-[2.2rem]" : isCheckpoint ? "rounded-[1.9rem]" : "rounded-full"} absolute inset-[-18px] border-2 border-cyan-300/55`}
                      animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {badgeLabel && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-black bg-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white"
                      style={{ color: profile.accent }}
                    >
                      {badgeLabel}
                    </span>
                  )}
                  <span
                    className="relative z-10"
                    style={{
                      fontSize: isBossGate ? 16 : 14,
                    }}
                  >
                    {item.entry.courseId}
                  </span>
                  {(isCheckpoint || isBossGate) && (
                    <div
                      className="pointer-events-none absolute -bottom-3 left-1/2 h-2 w-10 -translate-x-1/2 rounded-full blur-md"
                      style={{ background: hexToRgba(profile.accent, 0.45) }}
                    />
                  )}
                </div>

                <div
                  className={`pointer-events-none absolute z-20 hidden w-[210px] rounded-[22px] border-2 border-black bg-slate-950/96 p-3 shadow-[0_18px_34px_rgba(0,0,0,0.3)] transition-all duration-200 md:block ${tooltipPlacement.horizontalClass} ${tooltipPlacement.verticalClass} ${tooltipPlacement.textAlignClass} ${
                    isCurrent
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: profile.accent }}
                  >
                    Mission {item.entry.courseId}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-tight text-white text-outline">
                    {item.entry.title}
                  </p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-300">
                    {mission.gameChallengeCompact} / {item.entry.levelLabel.split(" - ")[0]}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {actionLabel}
                  </p>
                  {(isCheckpoint || isBossGate) && (
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                      {isBossGate ? "Porte d'acte" : "Checkpoint"}
                    </p>
                  )}
                </div>
              </>
            );

            if (!canLaunch) {
              return (
                <div
                  key={item.entry.courseId}
                  className={`${nodeClasses} cursor-not-allowed opacity-85`}
                  style={nodeStyle}
                  aria-disabled="true"
                >
                  {nodeBody}
                </div>
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
                  aria-label={`${actionLabel} : mission ${item.entry.courseId}`}
                >
                  {nodeBody}
                </button>
              </form>
            );
          })}

          {activePoint && (
            <motion.div
              className="absolute z-30"
              style={{
                left: `${activePoint.xPercent}%`,
                top: activePoint.y - 88,
                transform: "translate(-50%, -50%)",
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-cyan-300/25 blur-xl" />
                {playerToken?.backgroundImageUrl && (
                  <div
                    className="absolute inset-[-16px] rounded-full opacity-45 blur-md"
                    style={{
                      backgroundImage: `url("${addCacheBustingIfSupabase(playerToken.backgroundImageUrl)}")`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  />
                )}
                <div
                  className="relative h-16 w-16 rounded-full border-4 border-black p-1.5 shadow-[0_22px_42px_rgba(0,0,0,0.32)] md:h-20 md:w-20"
                  style={{
                    background:
                      playerToken?.backgroundImageUrl
                        ? `url("${addCacheBustingIfSupabase(playerToken.backgroundImageUrl)}") center / cover`
                        : defaultAvatarThemes[playerToken?.backgroundTheme ?? "cyan"] ?? defaultAvatarThemes.cyan,
                  }}
                >
                  <div
                    className="absolute inset-[-8px] rounded-full border border-cyan-300/35"
                    style={{ transform: "rotate(-10deg)" }}
                  />
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-black bg-slate-950">
                    {playerToken?.avatarImageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={addCacheBustingIfSupabase(playerToken.avatarImageUrl)}
                          alt={playerToken.username}
                          className="h-full w-full rounded-full object-cover"
                          style={{ objectPosition: "center top" }}
                          loading="eager"
                          decoding="async"
                        />
                      </>
                    ) : (
                      <span className="text-lg font-black text-white text-outline md:text-2xl">
                        {playerToken?.initial ?? "J"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mx-auto mt-1 h-4 w-4 rotate-45 border-r-4 border-b-4 border-black bg-cyan-300" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { QuestPlayerToken };
