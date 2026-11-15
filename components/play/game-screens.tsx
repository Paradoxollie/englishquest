"use client";

import Link from "next/link";
import { Burst } from "@/components/comic/burst";
import { Mascot } from "@/components/comic/mascot";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  canSpeakEnglish,
  isSoundMuted,
  setSoundMuted,
  speakEnglish,
} from "@/lib/games/audio";
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

export function SoundToggleButton() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
  }, []);

  const toggle = () => {
    const next = setSoundMuted(!muted);
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? "Activer les effets sonores" : "Couper les effets sonores"}
      className={`eq-sound-btn ${muted ? "is-muted" : ""}`}
      title={muted ? "Activer le son" : "Couper le son"}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {muted ? (
          <>
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        ) : (
          <>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </>
        )}
      </svg>
      <span>{muted ? "Son coupé" : "Son activé"}</span>
    </button>
  );
}

export function SpeakButton({
  text,
  label = "Écouter",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(canSpeakEnglish());
  }, []);

  if (!supported || !text.trim()) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => speakEnglish(text)}
      className={`eq-speak-btn ${className}`.trim()}
      aria-label={`Écouter la prononciation anglaise de ${text}`}
      title="Écouter la prononciation anglaise"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
      <span>{label}</span>
    </button>
  );
}

/**
 * Barre de statistiques. `onQuit` ajoute un bouton « Quitter », visible
 * seulement en mode concentration sur téléphone (voir useGameFocusMode).
 */
export function GameHud({
  children,
  onQuit,
  showSoundToggle = true,
}: {
  children: ReactNode;
  onQuit?: () => void;
  showSoundToggle?: boolean;
}) {
  return (
    <div className="eq-game-hud-wrap">
      <div className="eq-game-hud">{children}</div>
      {showSoundToggle || onQuit ? (
        <div className="eq-game-hud-actions">
          {showSoundToggle ? <SoundToggleButton /> : null}
          {onQuit ? (
            <button type="button" className="eq-game-quit" onClick={onQuit} data-testid="game-quit">
              Quitter
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
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
  startDisabled = false,
}: {
  title: string;
  intro: string;
  rules: string[];
  children?: ReactNode;
  onStart: () => void;
  startLabel?: string;
  /** Bouton inactif, par exemple pendant le chargement d'un dictionnaire. */
  startDisabled?: boolean;
}) {
  return (
    <div className="eq-game-start eq-slam">
      <div className="eq-game-start-intro">
        <h2 className="eq-h2">{title}</h2>
        <p>{intro}</p>
      </div>
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
        className="eq-btn eq-btn-primary eq-btn-xl"
        data-testid="game-start"
        disabled={startDisabled}
        aria-busy={startDisabled || undefined}
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
  rewardError,
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
  rewardError?: string | null;
  missionReached?: boolean | null;
  onReplay: () => void;
  children?: ReactNode;
}) {
  const isZeroScore = score === 0 || score === "0";
  // Une seule célébration par résultat enregistré (XP, or, niveau, badges, étoiles).
  const celebratedRef = useRef<RewardSummary | null>(null);
  useEffect(() => {
    if (!rewards || rewardStatus !== "saved" || celebratedRef.current === rewards) return;
    celebratedRef.current = rewards;
    dispatchReward(buildGameRewardDetail(rewards));
  }, [rewards, rewardStatus]);

  return (
    <div className="eq-game-end eq-slam" data-testid="game-end">
      <div className="eq-game-end-head">
        <Mascot pose={isZeroScore ? "sam-oups" : "sam-bravo"} size={104} />
        <Burst color={isZeroScore ? "white" : "yellow"} className="eq-pop-in">
          {isZeroScore ? "Oups !" : "Bien joué !"}
        </Burst>
        <div>
          <p className="eq-kicker">{title}</p>
          <p className="eq-game-end-score">
            {score} <span>{scoreLabel}</span>
          </p>
        </div>
      </div>
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
        <p className="eq-game-end-note is-error">
          {rewardError || "Le score n'a pas pu être enregistré. Réessaie dans un instant."}
        </p>
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
