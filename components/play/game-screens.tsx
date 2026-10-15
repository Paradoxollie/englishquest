"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { buildGameRewardDetail, dispatchReward, type RewardBadge } from "@/lib/profile/reward-events";

/* Écrans partagés par les jeux : démarrage, fin de partie, HUD. */

export type RewardSummary = {
  xpEarned: number;
  goldEarned: number;
  newLevel?: number | null;
  reduced?: boolean;
  isNewPersonalBest?: boolean;
  isNewGlobalBest?: boolean;
  courseCompleted?: {
    courseNumber: number;
    courseTitle: string;
    rewards: { xp: number; gold: number };
    newLevel?: number | null;
  } | null;
  dailyChallenge?: { bonusGranted: boolean; xpBonus: number; goldBonus: number; dailyGoalReached: boolean } | null;
  /** Badges obtenus grâce à cette partie. */
  newBadges?: RewardBadge[];
  /** Entraînement ciblé sur un cours (Grammar Rush ouvert avec ?cours=N). */
  practice?: {
    courseId: number;
    focusCorrect: number;
    target: number;
    starReached: boolean;
    newlyEarned: boolean;
  } | null;
};

/** Compteur qui monte de 0 à la valeur en quelques dixièmes de seconde. */
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target <= 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);
  return value;
}

function RewardCounters({ xp, gold }: { xp: number; gold: number }) {
  const xpValue = useCountUp(xp);
  const goldValue = useCountUp(gold, 700);
  return (
    <>
      <div>
        <small>Expérience</small>
        <b className="eq-num">+ {xpValue} XP</b>
      </div>
      <div>
        <small>Or</small>
        <b className="eq-num">+ {goldValue}</b>
      </div>
    </>
  );
}

export function GameHud({ children }: { children: ReactNode }) {
  return <div className="eq-game-hud">{children}</div>;
}

export function HudStat({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "gold" | "mint" | "coral" | "cyan";
  hint?: string;
}) {
  return (
    <div className={`eq-game-stat is-${tone}`}>
      <small>{label}</small>
      <b className="eq-num">{value}</b>
      {hint ? <span>{hint}</span> : null}
    </div>
  );
}

export function TimeBar({ percent, low = false }: { percent: number; low?: boolean }) {
  return (
    <div className={`eq-game-timebar ${low ? "is-low" : ""}`} aria-hidden="true">
      <i style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

export function GameStart({
  title,
  intro,
  rules,
  children,
  onStart,
  startLabel = "Lancer la partie",
}: {
  title: string;
  intro: string;
  rules: string[];
  children?: ReactNode;
  onStart: () => void;
  startLabel?: string;
}) {
  return (
    <div className="eq-game-start eq-pop">
      <h2 className="eq-h2">{title}</h2>
      <p className="eq-game-intro">{intro}</p>
      <ul className="eq-game-rules">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
      {children}
      <button
        type="button"
        onClick={() => {
          onStart();
          if (typeof window !== "undefined") {
            window.requestAnimationFrame(() => {
              document.querySelector(".eq-game-main")?.scrollIntoView({ block: "start", behavior: "smooth" });
            });
          }
        }}
        className="eq-btn eq-btn-gold eq-btn-lg"
        data-testid="game-start"
      >
        {startLabel}
      </button>
    </div>
  );
}

export function GameEnd({
  title,
  score,
  scoreLabel = "points",
  lines,
  rewards,
  rewardStatus,
  missionReached,
  onReplay,
  children,
}: {
  title: string;
  score: ReactNode;
  scoreLabel?: string;
  lines?: string[];
  rewards: RewardSummary | null;
  rewardStatus?: "idle" | "saving" | "saved" | "error" | "guest";
  missionReached?: boolean | null;
  onReplay: () => void;
  children?: ReactNode;
}) {
  // Une seule célébration par résultat enregistré (XP, or, niveau, badges, étoiles).
  const celebratedRef = useRef<RewardSummary | null>(null);
  useEffect(() => {
    if (!rewards || rewardStatus !== "saved" || celebratedRef.current === rewards) return;
    celebratedRef.current = rewards;
    dispatchReward(buildGameRewardDetail(rewards));
  }, [rewards, rewardStatus]);

  return (
    <div className="eq-game-end eq-pop" data-testid="game-end">
      <p className="eq-kicker">{title}</p>
      <p className="eq-game-end-score">
        {score} <span>{scoreLabel}</span>
      </p>
      {lines && lines.length > 0 ? (
        <ul className="eq-game-end-lines">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}

      {rewardStatus === "guest" ? (
        <p className="eq-game-end-note">
          Partie non enregistrée : sans compte, pas d&apos;expérience ni de classement.{" "}
          <Link href="/auth/signup" className="font-bold text-[var(--cyan)]">
            Créer un compte
          </Link>
        </p>
      ) : rewardStatus === "saving" ? (
        <p className="eq-game-end-note">Enregistrement du score…</p>
      ) : rewardStatus === "error" ? (
        <p className="eq-game-end-note is-error">Le score n&apos;a pas pu être enregistré. Réessaie dans un instant.</p>
      ) : rewards ? (
        <div className="eq-game-rewards">
          <RewardCounters xp={rewards.xpEarned} gold={rewards.goldEarned} />
          {rewards.isNewGlobalBest ? (
            <p className="eq-chip eq-chip-gold">Record du site</p>
          ) : rewards.isNewPersonalBest ? (
            <p className="eq-chip eq-chip-gold-soft">Record personnel</p>
          ) : null}
          {rewards.reduced ? (
            <p className="eq-game-end-note">Après cinq parties sur un même jeu dans la journée, les gains sont réduits.</p>
          ) : null}
          {rewards.newLevel ? (
            <p className="eq-game-levelup eq-pop" role="status">
              <b>Niveau {rewards.newLevel}</b> atteint. Ton anneau passe au cran suivant.
            </p>
          ) : null}
          {rewards.dailyChallenge?.bonusGranted ? (
            <p className="eq-chip eq-chip-mint">
              Défi du jour réussi : + {rewards.dailyChallenge.xpBonus} XP, + {rewards.dailyChallenge.goldBonus} or
            </p>
          ) : null}
          {rewards.newBadges && rewards.newBadges.length > 0 ? (
            <p className="eq-game-badges">
              {rewards.newBadges.length > 1 ? "Badges débloqués : " : "Badge débloqué : "}
              <b>{rewards.newBadges.map((badge) => badge.name).join(", ")}</b>.{" "}
              <Link href="/profile#badges">Voir mes badges</Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {rewards?.practice ? (
        <p className={`eq-game-practice${rewards.practice.starReached ? " is-earned" : ""}`}>
          {rewards.practice.starReached
            ? `Étoile d'entraînement gagnée pour le cours ${rewards.practice.courseId}.`
            : `Cours ${rewards.practice.courseId} : ${rewards.practice.focusCorrect} bonne${rewards.practice.focusCorrect > 1 ? "s" : ""} réponse${rewards.practice.focusCorrect > 1 ? "s" : ""} sur ses questions. Il en faut ${rewards.practice.target} dans une partie pour l'étoile d'entraînement.`}
        </p>
      ) : null}

      {rewards?.courseCompleted ? (
        <div className="eq-game-mission-done">
          <b>Mission {rewards.courseCompleted.courseNumber} validée.</b> {rewards.courseCompleted.courseTitle} :
          + {rewards.courseCompleted.rewards.xp} XP, + {rewards.courseCompleted.rewards.gold} or. La mission suivante est
          ouverte.
          <Link href="/quest" className="eq-btn eq-btn-gold eq-btn-sm">
            Voir la carte
          </Link>
        </div>
      ) : missionReached === false ? (
        <p className="eq-game-end-note">Objectif de mission pas encore atteint. Tu peux retenter tout de suite.</p>
      ) : null}

      {children}

      <div className="eq-game-end-actions">
        <button type="button" onClick={onReplay} className="eq-btn eq-btn-primary">
          Rejouer
        </button>
        <Link href="/play" className="eq-btn eq-btn-ghost">
          Autres jeux
        </Link>
      </div>
    </div>
  );
}
