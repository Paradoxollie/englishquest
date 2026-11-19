"use client";

import Link from "next/link";
import { Burst } from "@/components/comic/burst";
import { Mascot } from "@/components/comic/mascot";
import { ResponsiveDetails } from "@/components/ui/responsive-details";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { games } from "@/lib/games/config";
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
  breakdown?: {
    base: number;
    personalBest: number;
    globalBest: number;
  };
  playsUsedToday?: number;
  isNewPersonalBest?: boolean;
  isNewGlobalBest?: boolean;
  courseCompleted?: {
    courseNumber: number;
    courseTitle: string;
    rewards: { xp: number; gold: number };
    newLevel?: number | null;
  } | null;
  dailyChallenge?: {
    bonusGranted: boolean;
    xpBonus: number;
    goldBonus: number;
    dailyGoalReached: boolean;
    dailyPlayedGames?: string[];
    requiredGames?: string[];
    newLevel?: number | null;
  } | null;
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

type ScoreActionResultLike = {
  rewards?: {
    xpEarned: number;
    goldEarned: number;
    newLevel?: number;
    reduced?: boolean;
    breakdown?: { base: number; personalBest: number; globalBest: number };
    playsUsedToday?: number;
  };
  isNewPersonalBest?: boolean;
  isNewGlobalBest?: boolean;
  courseCompleted?: {
    courseNumber: number;
    courseTitle: string;
    rewards: { xp: number; gold: number };
    newLevel?: number | null;
  } | null;
  dailyChallenge?: {
    bonusGranted: boolean;
    xpBonus: number;
    goldBonus: number;
    dailyGoalReached: boolean;
    dailyPlayedGames?: string[];
    requiredGames?: string[];
    newLevel?: number | null;
  } | null;
  newBadges?: RewardBadge[];
  practice?: {
    courseId: number;
    focusCorrect: number;
    target: number;
    starReached: boolean;
    newlyEarned: boolean;
  } | null;
};

/** Normalise la réponse serveur de n'importe quel jeu vers RewardSummary. */
export function mapScoreResultToRewards(result: ScoreActionResultLike): RewardSummary {
  return {
    xpEarned: result.rewards?.xpEarned ?? 0,
    goldEarned: result.rewards?.goldEarned ?? 0,
    newLevel: result.rewards?.newLevel ?? null,
    reduced: result.rewards?.reduced,
    breakdown: result.rewards?.breakdown,
    playsUsedToday: result.rewards?.playsUsedToday,
    isNewPersonalBest: result.isNewPersonalBest,
    isNewGlobalBest: result.isNewGlobalBest,
    courseCompleted: result.courseCompleted
      ? {
          courseNumber: result.courseCompleted.courseNumber,
          courseTitle: result.courseCompleted.courseTitle,
          rewards: result.courseCompleted.rewards,
          newLevel: result.courseCompleted.newLevel,
        }
      : null,
    dailyChallenge: result.dailyChallenge ?? null,
    newBadges: result.newBadges ?? [],
    practice: result.practice ?? null,
  };
}

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
      title={muted ? "Activer les effets sonores (les voix restent actives)" : "Couper les effets sonores (les voix restent actives)"}
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
      <span>{muted ? "Effets coupés" : "Effets sonores"}</span>
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
  const introId = useId();
  const introduction = <p id={introId} className="eq-game-start-intro">{intro}</p>;
  return (
    <div className="eq-game-start eq-slam">
      {games.some((game) => game.name === title) ? null : <h2 className="eq-h2">{title}</h2>}
      <button
        type="button"
        onClick={() => {
          onStart();
          if (typeof window !== "undefined") {
            window.requestAnimationFrame(() => {
              const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
              document.querySelector(".eq-game-main")?.scrollIntoView({ block: "start", behavior });
            });
          }
        }}
        className="eq-btn eq-btn-primary eq-btn-xl"
        data-testid="game-start"
        disabled={startDisabled}
        aria-busy={startDisabled || undefined}
        aria-describedby={introId}
      >
        {startLabel}
      </button>
      {!children ? introduction : null}
      <ResponsiveDetails className="eq-rules-disclosure" summary="Règles du jeu">
        {children ? introduction : null}
        <ul className="eq-game-rules">
          {rules.map(rule => <li key={rule}>{rule}</li>)}
        </ul>
      </ResponsiveDetails>
      {children}
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
  retryScore,
  missionReached,
  gameSlug,
  ratio,
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
  retryScore?: (() => void) | null;
  missionReached?: boolean | null;
  gameSlug?: string;
  /** Part de bonnes réponses (0 à 1) : règle le message de fin (« Bien joué », « Pas mal », « Continue »). */
  ratio?: number;
  onReplay: () => void;
  children?: ReactNode;
}) {
  const isZeroScore = score === 0 || score === "0";
  const mood: "great" | "ok" | "low" =
    typeof ratio === "number" ? (ratio >= 0.7 ? "great" : ratio >= 0.4 ? "ok" : "low") : isZeroScore ? "low" : "great";
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
        <Mascot pose={mood === "low" ? "sam-oups" : "sam-bravo"} size={104} />
        <Burst color={mood === "low" ? "white" : "yellow"} className="eq-pop-in">
          {mood === "great" ? "Bien joué !" : mood === "ok" ? "Pas mal !" : "Continue, ça vient !"}
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
          Avec un compte, tes prochaines parties peuvent te rapporter de l&apos;XP et des pièces d&apos;or pour ta collection.{" "}
          <Link href="/collection" className="eq-text-link">
            Découvrir les récompenses
          </Link>{" · "}
          <Link href="/auth/signup" className="eq-text-link">
            Créer un compte
          </Link>
        </p>
      ) : rewardStatus === "saving" && retryScore ? (
        <p className="eq-game-end-note is-error" role="status">
          La connexion a été interrompue. <button type="button" className="eq-text-link" onClick={retryScore}>Réessayer la sauvegarde</button>
        </p>
      ) : rewardStatus === "saving" ? (
        <p className="eq-game-end-note">Enregistrement du score…</p>
      ) : rewardStatus === "error" ? (
        <p className="eq-game-end-note is-error">
          {rewardError || "Le score n'a pas pu être enregistré. Réessaie dans un instant."}
        </p>
      ) : rewards ? (
        (() => {
          const dailyBonusXp = rewards.dailyChallenge?.bonusGranted ? rewards.dailyChallenge.xpBonus : 0;
          const dailyBonusGold = rewards.dailyChallenge?.bonusGranted ? rewards.dailyChallenge.goldBonus : 0;
          const missionXp = rewards.courseCompleted?.rewards.xp ?? 0;
          const missionGold = rewards.courseCompleted?.rewards.gold ?? 0;
          const totalXp = rewards.xpEarned + dailyBonusXp + missionXp;
          const totalGold = rewards.goldEarned + dailyBonusGold + missionGold;
          const reachedLevel =
            Math.max(
              0,
              rewards.newLevel ?? 0,
              rewards.dailyChallenge?.bonusGranted ? (rewards.dailyChallenge.newLevel ?? 0) : 0,
              rewards.courseCompleted?.newLevel ?? 0
            ) || null;
          const requiredDaily = rewards.dailyChallenge?.requiredGames ?? [];
          const playedDaily = rewards.dailyChallenge?.dailyPlayedGames ?? [];
          const dailyDoneCount = requiredDaily.filter((slug) => playedDaily.includes(slug)).length;
          const breakdown = rewards.breakdown;
          const parts: string[] = [];
          if (breakdown && breakdown.base > 0) {
            parts.push(`Partie : + ${breakdown.base} XP`);
          } else if (rewards.xpEarned > 0) {
            parts.push(`Partie : + ${rewards.xpEarned} XP${rewards.goldEarned > 0 ? `, + ${rewards.goldEarned} or` : ""}`);
          }
          if (breakdown?.globalBest) {
            parts.push(`Record du site : + ${breakdown.globalBest} XP, + 3 or`);
          } else if (breakdown?.personalBest) {
            parts.push(`Record personnel : + ${breakdown.personalBest} XP, + 1 or`);
          }
          if (dailyBonusXp > 0 || dailyBonusGold > 0) {
            parts.push(`Défi du jour : + ${dailyBonusXp} XP, + ${dailyBonusGold} or`);
          }
          if (missionXp > 0 || missionGold > 0) {
            parts.push(`Mission ${rewards.courseCompleted?.courseNumber} : + ${missionXp} XP, + ${missionGold} or`);
          }
          const baseXpForGoldHint = breakdown?.base ?? rewards.xpEarned;
          const xpMissingForGold =
            !rewards.reduced && rewards.xpEarned > 0 && rewards.goldEarned === 0 && baseXpForGoldHint < 12
              ? 12 - baseXpForGoldHint
              : 0;

          return (
            <div className="eq-game-rewards">
              <RewardCounters xp={totalXp} gold={totalGold} />
              {rewards.isNewGlobalBest ? (
                <p className="eq-chip eq-chip-gold">Record du site</p>
              ) : rewards.isNewPersonalBest ? (
                <p className="eq-chip eq-chip-gold-soft">Record personnel</p>
              ) : null}
              {rewards.dailyChallenge?.bonusGranted ? (
                <p className="eq-chip eq-chip-mint">
                  Défi du jour réussi : + {rewards.dailyChallenge.xpBonus} XP, + {rewards.dailyChallenge.goldBonus} or
                </p>
              ) : requiredDaily.length > 0 && !rewards.dailyChallenge?.dailyGoalReached ? (
                <p className="eq-chip eq-chip-cyan">
                  Défi du jour : {dailyDoneCount} / {requiredDaily.length} jeux
                </p>
              ) : null}
              {parts.length > 0 ? (
                <p className="eq-game-end-note eq-game-reward-breakdown">{parts.join(" · ")}</p>
              ) : rewards.xpEarned === 0 ? (
                <p className="eq-game-end-note eq-game-reward-breakdown">
                  Aucune bonne réponse enregistrée : 0 XP et 0 or sur cette partie.
                </p>
              ) : null}
              {xpMissingForGold > 0 ? (
                <p className="eq-game-end-note eq-game-reward-breakdown">
                  L&apos;or de partie se débloque dès 12 XP en une partie (1 or par palier de 12 XP, jusqu&apos;à 3).
                </p>
              ) : null}
              {rewards.reduced ? (
                <p className="eq-game-end-note eq-game-reward-breakdown">
                  Après 5 parties sur ce jeu dans la journée ({rewards.playsUsedToday ? `${rewards.playsUsedToday}e partie` : "quota dépassé"}), les gains de partie sont réduits (1/4 d&apos;XP, 0 or ; les records et le défi du jour restent payés).
                </p>
              ) : rewards.playsUsedToday && rewards.playsUsedToday <= 5 ? (
                <p className="eq-game-end-note eq-game-reward-breakdown">
                  Plein tarif du jour sur ce jeu : {rewards.playsUsedToday} / 5 parties.
                </p>
              ) : null}
              {reachedLevel ? (
                <p className="eq-game-levelup eq-pop" role="status">
                  <b>Niveau {reachedLevel}</b> atteint.
                </p>
              ) : null}
              {totalXp > 0 || totalGold > 0 ? (
                <p className="eq-game-end-note eq-game-reward-breakdown">
                  <Link href="/profile#boutique" className="eq-text-link">Voir ma collection</Link>
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
          );
        })()
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
        {gameSlug && rewardStatus !== "guest" ? (
          <Link href={`/leaderboard?game=${gameSlug}`} className="eq-btn eq-btn-ghost">
            Classement
          </Link>
        ) : null}
        <Link href="/play" className="eq-btn eq-btn-ghost">
          Autres jeux
        </Link>
      </div>
    </div>
  );
}
