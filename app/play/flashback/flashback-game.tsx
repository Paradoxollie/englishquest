"use client";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGameState,
  flashbackWordsForLevel,
  nextRound,
  startGame,
  submitDecision,
  submitTimeout,
  type GameState,
} from "@/lib/games/echoLex";
import { playSoundEffect } from "@/lib/games/audio";
import {
  GameEnd,
  GameHud,
  GameStart,
  HudStat,
  SpeakButton,
  TimeBar,
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import { submitEchoLexScore } from "./actions";

const ROUND_MS = 5000;
const RESULT_MS = 700;
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
  const [paused, setPaused] = useState(false);
  const [timedOutRound, setTimedOutRound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const comboRef = useRef(0);
  const timeLeftRef = useRef(ROUND_MS);
  const pausedRef = useRef(false);
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

  const scheduleNextRound = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    nextTimerRef.current = setTimeout(() => {
      if (pausedRef.current) return;
      const current = stateRef.current;
      if (!current || current.phase !== "result") return;
      const next = nextRound(current);
      stateRef.current = next;
      setState(next);
      setTimedOutRound(false);
      timeLeftRef.current = ROUND_MS;
      setTimeLeft(ROUND_MS);
      roundStartedAtRef.current = performance.now();
    }, RESULT_MS);
  }, []);

  const start = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    sessionRef.current += 1;
    gameSession.begin();
    const fresh = startGame(createGameState(Math.random, flashbackWordsForLevel(level), level));
    stateRef.current = fresh;
    setState(fresh);
    setStarted(true);
    setPaused(false);
    pausedRef.current = false;
    setTimedOutRound(false);
    timeLeftRef.current = ROUND_MS;
    setTimeLeft(ROUND_MS);
    comboRef.current = 0;
    setCombo(0);
    setBestCombo(0);
    setRounds(0);
    setMissed([]);
    setRewards(null);
    setRewardError(null);
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
    pausedRef.current = false;
    setPaused(false);
    setState(null);
    setStarted(false);
  }, [gameSession]);

  const togglePause = useCallback(() => {
    const current = stateRef.current;
    if (!started || !current || current.phase === "gameOver") return;
    if (pausedRef.current) {
      pausedRef.current = false;
      setPaused(false);
      roundStartedAtRef.current = performance.now() - (ROUND_MS - timeLeftRef.current);
      if (current.phase === "result") {
        scheduleNextRound();
      }
    } else {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
        nextTimerRef.current = null;
      }
      if (current.phase === "playing") {
        const remaining = Math.max(0, ROUND_MS - (performance.now() - roundStartedAtRef.current));
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
      }
      pausedRef.current = true;
      setPaused(true);
    }
  }, [scheduleNextRound, started]);

  const decide = useCallback(
    (saysSeen: boolean) => {
      const current = stateRef.current;
      if (!current || current.phase !== "playing" || pausedRef.current) return;
      const result = submitDecision(current, saysSeen);
      stateRef.current = result;
      setState(result);
      setTimedOutRound(false);
      setRounds((count) => count + 1);

      if (result.lastDecisionCorrect) {
        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        setCombo(nextCombo);
        setBestCombo((best) => Math.max(best, nextCombo));
        playSoundEffect(nextCombo > 0 && nextCombo % 5 === 0 ? "combo" : "correct");
      } else {
        comboRef.current = 0;
        setCombo(0);
        playSoundEffect("wrong");
        setMissed((list) =>
          list.includes(current.currentWord.english) ? list : [...list, current.currentWord.english]
        );
      }

      if (result.phase !== "gameOver") {
        scheduleNextRound();
      }
    },
    [scheduleNextRound]
  );

  const handleTimeout = useCallback(() => {
    const current = stateRef.current;
    if (!current || current.phase !== "playing" || pausedRef.current) return;
    const result = submitTimeout(current);
    stateRef.current = result;
    setState(result);
    setTimedOutRound(true);
    setRounds((count) => count + 1);
    comboRef.current = 0;
    setCombo(0);
    playSoundEffect("wrong");
    setMissed((list) =>
      list.includes(current.currentWord.english) ? list : [...list, current.currentWord.english]
    );
    if (result.phase !== "gameOver") {
      scheduleNextRound();
    }
  }, [scheduleNextRound]);

  /* Compte à rebours par mot */
  useEffect(() => {
    if (!started || !state || state.phase !== "playing" || paused) return;
    const interval = setInterval(() => {
      const left = ROUND_MS - (performance.now() - roundStartedAtRef.current);
      if (left <= 0) {
        timeLeftRef.current = 0;
        setTimeLeft(0);
        handleTimeout();
      } else {
        timeLeftRef.current = left;
        setTimeLeft(left);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [started, state, paused, handleTimeout]);

  /* Flèches gauche (nouveau), droite (déjà vu), Échap (Pause) */
  useEffect(() => {
    if (!started || !state || state.phase === "gameOver") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (pausedRef.current || stateRef.current?.phase !== "playing") return;
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
  }, [started, state, decide, togglePause]);

  /* Enregistrement */
  useEffect(() => {
    if (!state || state.phase !== "gameOver" || submittedRef.current) return;
    submittedRef.current = true;
    playSoundEffect(state.score > 0 ? "victory" : "wrong");
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    setRewardError(null);
    const session = sessionRef.current;
    gameSession
      .finish(performance.now() - startedAtRef.current)
      .then(({ sessionId, durationMs }) =>
        submitEchoLexScore({ score: state.score, durationMs, sessionId })
      )
      .then((result) => {
        if (session !== sessionRef.current) return;
        if (!result.success) {
          setRewardError(result.error ?? null);
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(result));
        setSubmitStatus("saved");
      })
      .catch(() => {
        if (session === sessionRef.current) setSubmitStatus("error");
      });
  }, [state, isLoggedIn, gameSession]);

  if (!started || !state) {
    return (
      <GameStart
        title="Flashback · Mémoire"
        intro="Des mots anglais défilent avec leur traduction. Pour chacun, indique s'il est nouveau ou s'il est déjà apparu dans la partie."
        rules={[
          "5 secondes par mot : sans réponse, le chrono compte une erreur.",
          "Trois erreurs et la partie s'arrête. Le score est le nombre de bonnes réponses.",
          "Au clavier : flèche gauche pour Nouveau, flèche droite pour Déjà vu.",
          missionTarget
            ? `Objectif de mission : ${missionTarget} bonnes réponses.`
            : "Tous les mots vus sont listés à la fin avec audio pour réviser.",
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
        gameSlug="flashback"
        title="Trois erreurs"
        score={state.score}
        scoreLabel="mots reconnus"
        lines={[
          `${rounds} réponses`,
          `Meilleure série : ${bestCombo}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        rewardError={rewardError}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={start}
      >
        <div>
          <p className="eq-kicker">Mots rencontrés ({state.seenWords.length})</p>
          <ul className="eq-game-review eq-game-review-scroll" data-testid="flashback-words">
            {state.seenWords.map((word) => (
              <li key={word.english} className={missed.includes(word.english) ? "is-hard" : ""}>
                <div>
                  <b lang="en">{word.english}</b>
                  <span> · {word.french}</span>
                </div>
                <SpeakButton text={word.english} label="Audio" />
              </li>
            ))}
          </ul>
          {missed.length > 0 ? (
            <p className="eq-game-end-note">
              Les mots marqués d&apos;un trait rouge t&apos;ont piégé : écoute-les avant de rejouer.
            </p>
          ) : null}
        </div>
        <div>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={quit}>
            Changer de niveau
          </button>
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
        <HudStat
          label="Temps"
          value={`${Math.ceil(timeLeft / 1000)} s`}
          tone={timeLow ? "coral" : "cyan"}
        />
      </GameHud>
      <TimeBar percent={(timeLeft / ROUND_MS) * 100} low={timeLow} />

      <div className={`eq-game-stage eq-card-stage ${tone}`} data-testid="game-stage">
        <div className="eq-card-top">
          <p className="eq-game-prompt-kicker">
            {"Ce mot, tu l'as déjà vu dans cette partie\u00a0?"}
          </p>
          <div className="flex items-center gap-2">
            <SpeakButton text={state.currentWord.english} label="Prononcer" />
            <button type="button" className="eq-btn eq-btn-ghost eq-enigma-mini-btn" onClick={togglePause}>
              {paused ? "Reprendre" : "Pause (Échap)"}
            </button>
          </div>
        </div>

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
            disabled={showingResult || paused}
            data-testid="choice-new"
          >
            <kbd>←</kbd>
            <span>Nouveau</span>
          </button>
          <button
            type="button"
            className={`eq-game-choice ${showingResult ? (!state.isNew ? "is-correct" : "is-dim") : ""}`}
            onClick={() => decide(true)}
            disabled={showingResult || paused}
            data-testid="choice-seen"
          >
            <kbd>→</kbd>
            <span>Déjà vu</span>
          </button>
        </div>

        <div className="eq-card-feedback-slot">
          {showingResult ? (
            <p
              className={`eq-game-feedback ${state.lastDecisionCorrect ? "is-right" : "is-wrong"}`}
              role="status"
            >
              {state.lastDecisionCorrect
                ? `Exact ! ${state.currentWord.english} : ${state.currentWord.french}.`
                : timedOutRound
                  ? `Temps écoulé · ce mot était ${state.isNew ? "nouveau" : "déjà vu"}.`
                  : state.isNew
                    ? "Raté : c'était la première fois qu'il apparaissait."
                    : "Raté : ce mot était déjà passé dans la partie."}
            </p>
          ) : null}
        </div>

        {paused ? (
          <div className="eq-space-overlay">
            <div className="eq-space-overlay-card">
              <p className="eq-kicker">Pause</p>
              <p className="eq-space-overlay-sub">Chrono figé · reprends quand tu es prêt.</p>
              <div className="eq-space-overlay-actions">
                <button type="button" className="eq-btn eq-btn-gold" onClick={togglePause}>
                  Reprendre
                </button>
                <button type="button" className="eq-btn eq-btn-ghost" onClick={quit}>
                  Changer de niveau
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
