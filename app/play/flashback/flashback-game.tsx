"use client";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGameState,
  flashbackWordsForLevel,
  nextRound,
  startGame,
  submitDecision,
  type GameState,
} from "@/lib/games/echoLex";
import { GameEnd, GameHud, GameStart, HudStat, TimeBar, type RewardSummary } from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import { submitEchoLexScore } from "./actions";

const ROUND_MS = 5000;
const RESULT_MS = 650;
const MAX_STRIKES = 3;

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

export function FlashbackGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
}) {
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [state, setState] = useState<GameState | null>(null);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const sessionRef = useRef(0);
  const stateRef = useRef<GameState | null>(null);
  const gameSession = useGameSession("flashback", isLoggedIn);

  const playing = started && state !== null && state.phase !== "gameOver";
  useGameFocusMode(playing);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      sessionRef.current += 1;
    };
  }, []);

  const start = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    sessionRef.current += 1;
    gameSession.begin();
    const fresh = startGame(createGameState(Math.random, flashbackWordsForLevel(level), level));
    stateRef.current = fresh;
    setState(fresh);
    setStarted(true);
    setTimeLeft(ROUND_MS);
    setCombo(0);
    setBestCombo(0);
    setRounds(0);
    setMissed([]);
    setRewards(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    startedAtRef.current = performance.now();
    roundStartedAtRef.current = startedAtRef.current;
  }, [gameSession, level]);

  /* Abandon : retour à l'écran de départ, rien n'est enregistré. */
  const quit = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    sessionRef.current += 1;
    gameSession.cancel();
    stateRef.current = null;
    setState(null);
    setStarted(false);
  }, [gameSession]);

  const decide = useCallback((saysSeen: boolean) => {
    const current = stateRef.current;
    if (!current || current.phase !== "playing") return;
    const timedOut = performance.now() - roundStartedAtRef.current >= ROUND_MS;
    const result = submitDecision(current, timedOut ? false : saysSeen);
    stateRef.current = result;
    setState(result);
    setRounds((count) => count + 1);
    if (result.lastDecisionCorrect) {
      setCombo((value) => {
        const next = value + 1;
        setBestCombo((best) => Math.max(best, next));
        return next;
      });
    } else {
      setCombo(0);
      setMissed((list) => (list.includes(current.currentWord.english) ? list : [...list, current.currentWord.english]));
    }
    if (result.phase !== "gameOver") {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      nextTimerRef.current = setTimeout(() => {
        const current = stateRef.current;
        if (!current || current.phase !== "result") return;
        const next = nextRound(current);
        stateRef.current = next;
        setState(next);
        setTimeLeft(ROUND_MS);
        roundStartedAtRef.current = performance.now();
      }, RESULT_MS);
    }
  }, []);

  /* Compte à rebours par mot */
  useEffect(() => {
    if (!started || !state || state.phase !== "playing") return;
    const interval = setInterval(() => {
      const left = ROUND_MS - (performance.now() - roundStartedAtRef.current);
      if (left <= 0) {
        setTimeLeft(0);
        decide(false);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, state, decide]);

  /* Flèches gauche (nouveau) et droite (déjà vu) */
  useEffect(() => {
    if (!started || !state || state.phase !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        decide(false);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        decide(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, state, decide]);

  /* Enregistrement */
  useEffect(() => {
    if (!state || state.phase !== "gameOver" || submittedRef.current) return;
    submittedRef.current = true;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    const session = sessionRef.current;
    gameSession
      .finish(performance.now() - startedAtRef.current)
      .then(({ sessionId, durationMs }) => submitEchoLexScore({ score: state.score, durationMs, sessionId }))
      .then((result) => {
        if (session !== sessionRef.current) return;
        if (!result.success) {
          setSubmitStatus("error");
          return;
        }
        setRewards({
          xpEarned: result.rewards?.xpEarned ?? 0,
          goldEarned: result.rewards?.goldEarned ?? 0,
          newLevel: result.rewards?.newLevel ?? null,
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
        });
        setSubmitStatus("saved");
      })
      .catch(() => {
        if (session === sessionRef.current) setSubmitStatus("error");
      });
  }, [state, isLoggedIn, gameSession]);

  if (!started || !state) {
    return (
      <GameStart
        title="Mémoire et vocabulaire"
        intro="Des mots anglais défilent avec leur traduction. Pour chacun, dis s'il est nouveau ou si tu l'as déjà vu dans la partie. Lis bien le sens : à la fin, tu retrouves tous les mots rencontrés."
        rules={[
          "5 secondes par mot. Sans réponse, le mot compte comme « nouveau ».",
          "Trois erreurs et la partie s'arrête. Le score est le nombre de bonnes réponses.",
          "Au clavier : flèche gauche pour nouveau, flèche droite pour déjà vu.",
          missionTarget ? `Objectif de mission : ${missionTarget} bonnes réponses.` : "Les mots viennent de ton niveau, avec quelques révisions du niveau précédent.",
        ]}
        onStart={start}
      >
        <LevelPicker value={level} onChange={setLevel} suggested={suggestedLevel} />
      </GameStart>
    );
  }

  if (state.phase === "gameOver") {
    return (
      <GameEnd
        title="Trois erreurs"
        score={state.score}
        scoreLabel="mots reconnus"
        lines={[`${rounds} réponses`, `Meilleure série : ${bestCombo}`, `Niveau ${getGameLevelLabel(level)}`]}
        rewards={rewards}
        rewardStatus={submitStatus}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={start}
      >
        <div>
          <p className="eq-kicker">Mots rencontrés ({state.seenWords.length})</p>
          <ul className="eq-game-review eq-game-review-scroll" data-testid="flashback-words">
            {state.seenWords.map((word) => (
              <li key={word.english} className={missed.includes(word.english) ? "is-hard" : ""}>
                <b>{word.english}</b>
                <span>{word.french}</span>
              </li>
            ))}
          </ul>
          {missed.length > 0 ? (
            <p className="eq-game-end-note">Les mots marqués d&apos;un trait rouge t&apos;ont piégé : relis-les avant de rejouer.</p>
          ) : null}
        </div>
      </GameEnd>
    );
  }

  const showingResult = state.phase === "result";
  const tone = showingResult ? (state.lastDecisionCorrect ? "is-right" : "is-wrong") : "";
  const timeLow = timeLeft < 1500;

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quit}>
        <HudStat label="Score" value={state.score} tone="gold" />
        <HudStat label="Série" value={combo} tone="mint" />
        <HudStat
          label="Erreurs"
          value={`${state.strikes} / ${MAX_STRIKES}`}
          tone={state.strikes > 0 ? "coral" : "default"}
        />
        <HudStat label="Temps" value={`${Math.ceil(timeLeft / 1000)} s`} tone={timeLow ? "coral" : "cyan"} />
      </GameHud>
      <TimeBar percent={(timeLeft / ROUND_MS) * 100} low={timeLow} />

      <div className={`eq-game-stage ${tone}`} data-testid="game-stage">
        <p className="eq-game-prompt-kicker">{"Ce mot, tu l'as déjà vu dans cette partie\u00a0?"}</p>
        <p className="eq-game-prompt" data-testid="game-prompt" lang="en">
          {state.currentWord.english}
        </p>
        <p className="eq-game-prompt-sub eq-game-prompt-meaning" lang="fr">
          {state.currentWord.french}
        </p>

        <div className="eq-game-choices eq-game-choices-duo">
          <button
            type="button"
            className={`eq-game-choice ${showingResult ? (state.isNew ? "is-correct" : "is-dim") : ""}`}
            onClick={() => decide(false)}
            disabled={showingResult}
            data-testid="choice-new"
          >
            <kbd>←</kbd>
            <span>Nouveau</span>
          </button>
          <button
            type="button"
            className={`eq-game-choice ${showingResult ? (!state.isNew ? "is-correct" : "is-dim") : ""}`}
            onClick={() => decide(true)}
            disabled={showingResult}
            data-testid="choice-seen"
          >
            <kbd>→</kbd>
            <span>Déjà vu</span>
          </button>
        </div>

        {showingResult ? (
          <p className={`eq-game-feedback ${state.lastDecisionCorrect ? "is-right" : "is-wrong"}`} role="status">
            {state.lastDecisionCorrect
              ? `Exact. ${state.currentWord.english} : ${state.currentWord.french}.`
              : state.isNew
                ? "Raté : ce mot était nouveau."
                : "Raté : tu l'avais déjà vu."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
