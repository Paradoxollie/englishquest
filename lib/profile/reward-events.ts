/**
 * Événement « eq:reward » : une récompense vient d'être versée.
 *
 * Les écrans de fin de partie, le quiz de cours et l'examen l'envoient ; le
 * composant RewardCelebrations (monté une fois dans app/layout.tsx) l'écoute
 * et affiche les notifications, le passage de niveau et les badges.
 *
 * Module sans dépendance serveur : importable côté client.
 */

import type { BadgeTier } from "./badges";

export const REWARD_EVENT = "eq:reward";

export type RewardBadge = { key: string; name: string; tier?: BadgeTier };

export type RewardEventDetail = {
  xp?: number;
  gold?: number;
  newLevel?: number | null;
  badges?: RewardBadge[];
  stars?: number;
  label?: string;
};

function positive(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

/** Nettoie un détail venu d'un événement : nombres positifs, badges valides. */
export function normalizeRewardDetail(detail: unknown): Required<Omit<RewardEventDetail, "newLevel" | "label">> & {
  newLevel: number | null;
  label: string | null;
} {
  const source = (detail && typeof detail === "object" ? detail : {}) as RewardEventDetail;
  const badges = Array.isArray(source.badges)
    ? source.badges.filter(
        (badge): badge is RewardBadge =>
          Boolean(badge) && typeof badge.key === "string" && typeof badge.name === "string" && badge.name.length > 0
      )
    : [];
  return {
    xp: positive(source.xp),
    gold: positive(source.gold),
    newLevel: positive(source.newLevel) || null,
    badges,
    stars: positive(source.stars),
    label: typeof source.label === "string" && source.label.trim() ? source.label.trim() : null,
  };
}

export function hasRewardContent(detail: RewardEventDetail | null | undefined) {
  const clean = normalizeRewardDetail(detail);
  return clean.xp > 0 || clean.gold > 0 || clean.newLevel !== null || clean.badges.length > 0 || clean.stars > 0;
}

export function dispatchReward(detail: RewardEventDetail): boolean {
  if (typeof window === "undefined" || !hasRewardContent(detail)) return false;
  // Envoi différé d'un tour : si l'écran qui célèbre est monté dans le même rendu
  // que l'écouteur (RewardCelebrations), l'écouteur est abonné avant l'envoi.
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent<RewardEventDetail>(REWARD_EVENT, { detail }));
  }, 0);
  return true;
}

/** Ce qu'un écran de fin de partie sait des gains (voir RewardSummary). */
export type GameRewardLike = {
  xpEarned: number;
  goldEarned: number;
  newLevel?: number | null;
  courseCompleted?: { courseNumber: number; rewards: { xp: number; gold: number }; newLevel?: number | null } | null;
  dailyChallenge?: { bonusGranted: boolean; xpBonus: number; goldBonus: number } | null;
  newBadges?: RewardBadge[] | null;
  practice?: { courseId: number; newlyEarned: boolean } | null;
};

/** Total d'une partie : jeu, défi du jour et mission validée, en un seul événement. */
export function buildGameRewardDetail(rewards: GameRewardLike): RewardEventDetail {
  const daily = rewards.dailyChallenge?.bonusGranted ? rewards.dailyChallenge : null;
  const course = rewards.courseCompleted ?? null;
  const levels = [rewards.newLevel, course?.newLevel].map(positive).filter((level) => level > 0);
  return {
    xp: positive(rewards.xpEarned) + positive(daily?.xpBonus) + positive(course?.rewards.xp),
    gold: positive(rewards.goldEarned) + positive(daily?.goldBonus) + positive(course?.rewards.gold),
    newLevel: levels.length > 0 ? Math.max(...levels) : null,
    badges: rewards.newBadges ?? [],
    stars: (course ? 1 : 0) + (rewards.practice?.newlyEarned ? 1 : 0),
    label: course
      ? `Mission ${course.courseNumber} validée`
      : daily
        ? "Partie enregistrée, défi du jour réussi"
        : "Partie enregistrée",
  };
}
