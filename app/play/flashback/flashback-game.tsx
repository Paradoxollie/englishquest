"use client";
import { recordClassAnswer } from "@/components/classes/live-activity-events";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGameState,
  flashbackWordsForLevel,
  nextRound,
  startGame,
  submitDecision,
  submitMeaning,
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
const MEANING_MS = 8000;
const RESULT_MS = 1900;
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
  const [selfPaced, setSelfPaced] = useState(false);
  const [lastCorrectionRead, setLastCorrectionRead] = useState(false);
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

  const lastCorrection = selfPaced && state?.phase === "gameOver" && !lastCorrectionRead;
  const playing = started && state !== null && (state.phase !== "gameOver" || lastCorrection);
  useGameFocusMode(playing);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      sessionRef.current += 1;
    };
  }, []);

  const continueRound = useCallback(() => {
    const current = stateRef.current;
    if (pausedRef.current || !current || current.phase !== "result") return;
    const next = nextRound(current);
    stateRef.current = next;
    setState(next);
    setTimedOutRound(false);
    timeLeftRef.current = ROUND_MS;
    setTimeLeft(ROUND_MS);
    roundStartedAtRef.current = performance.now();
  }, []);

  const scheduleNextRound = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    if (!selfPaced) nextTimerRef.current = setTimeout(continueRound, RESULT_MS);
  }, [continueRound, selfPaced]);

  const start = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    sessionRef.current += 1;
    if (!selfPaced) gameSession.begin();
    const fresh = startGame(createGameState(Math.random, flashbackWordsForLevel(level), level));
    stateRef.current = fresh;
    setState(fresh);
    setStarted(true);
    setLastCorrectionRead(false);
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
  }, [gameSession, level, selfPaced]);

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
      const duration = current.phase === "meaning" ? MEANING_MS : ROUND_MS;
      roundStartedAtRef.current = performance.now() - (duration - timeLeftRef.current);
      if (current.phase === "result") {
        scheduleNextRound();
      }
    } else {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
        nextTimerRef.current = null;
      }
      if (current.phase === "playing" || current.phase === "meaning") {
        const duration = current.phase === "meaning" ? MEANING_MS : ROUND_MS;
        const remaining = Math.max(0, duration - (performance.now() - roundStartedAtRef.current));
        timeLeftRef.current = remaining;
        setTimeLeft(remaining);
      }
      pausedRef.current = true;
      setPaused(true);
    }
  }, [scheduleNextRound, started]);

  const resolve = useCallback((choice: boolean | string | null) => {
    const current = stateRef.current;
    if (!current || pausedRef.current || (current.phase !== "playing" && current.phase !== "meaning")) return;
    const now = performance.now();
    const duration = current.phase === "meaning" ? MEANING_MS : ROUND_MS;
    const timedOut = choice === null || now - roundStartedAtRef.current >= duration;
    const next = timedOut ? submitTimeout(current)
      : typeof choice === "string" ? submitMeaning(current, choice) : submitDecision(current, choice);
    if (next === current) return;
    stateRef.current = next;
    setState(next);
    setTimedOutRound(timedOut);
    if (next.phase === "meaning") {
      roundStartedAtRef.current = now;
      timeLeftRef.current = MEANING_MS;
      setTimeLeft(MEANING_MS);
      return;
    }
    setRounds(count => count + 1);
    if (choice !== null) recordClassAnswer(next.lastDecisionCorrect === true);
    const streak = next.lastDecisionCorrect ? comboRef.current + 1 : 0;
    comboRef.current = streak;
    setCombo(streak);
    setBestCombo(best => Math.max(best, streak));
    playSoundEffect(streak === 0 ? "wrong" : streak % 5 === 0 ? "combo" : "correct");
    if (!next.lastDecisionCorrect) {
      setMissed(list => list.includes(current.currentWord.english) ? list : [...list, current.currentWord.english]);
    }
    if (next.phase === "result") scheduleNextRound();
  }, [scheduleNextRound]);

  /* Compte à rebours par mot */
  useEffect(() => {
    if (!started || !state || (state.phase !== "playing" && state.phase !== "meaning") || paused) return;
    const duration = state.phase === "meaning" ? MEANING_MS : ROUND_MS;
    const interval = setInterval(() => {
      const left = duration - (performance.now() - roundStartedAtRef.current);
      if (left <= 0) {
        timeLeftRef.current = 0;
        setTimeLeft(0);
        resolve(null);
      } else {
        timeLeftRef.current = left;
        setTimeLeft(left);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [started, state, paused, resolve]);

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
      if (pausedRef.current) return;
      const current = stateRef.current;
      if (current?.phase === "meaning") {
        const choice = current.meaningChoices[Number(event.key) - 1];
        if (choice) { event.preventDefault(); resolve(choice); }
        return;
      }
      if (current?.phase !== "playing") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        resolve(false);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        resolve(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, state, resolve, togglePause]);

  /* Enregistrement */
  useEffect(() => {
    if (!state || state.phase !== "gameOver" || submittedRef.current) return;
    submittedRef.current = true;
    playSoundEffect(state.score > 0 ? "victory" : "wrong");
    if (selfPaced) return;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    setRewardError(null);
    const session = sessionRef.current;
    gameSession
      .finish(performance.now() - startedAtRef.current)
      .then(({ sessionId, durationMs, save }) =>
        save(() => submitEchoLexScore({ score: state.score, durationMs, sessionId }))
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
  }, [state, isLoggedIn, gameSession, selfPaced]);

  if (!started || !state) {
    return (
      <GameStart
        title="Flashback · Mémoire"
        intro="Un mot apparaît. Indique si tu l’as déjà vu et découvre son sens. Quand il revient, retrouve aussi sa traduction."
        rules={[
          "Tu as 5 secondes pour reconnaître le mot et 8 secondes pour en retrouver le sens quand il revient.",
          "Trois erreurs et la partie s'arrête. Le score est le nombre de bonnes réponses.",
          "Au clavier, utilise les flèches pour reconnaître un mot et les touches 1 à 3 pour choisir son sens.",
          !selfPaced && missionTarget
            ? `Objectif de mission : ${missionTarget} bonnes réponses.`
            : "Tous les mots vus sont listés à la fin avec audio pour réviser.",
        ]}
        onStart={start}
      >
        <LevelPicker value={level} onChange={setLevel} suggested={suggestedLevel} />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={selfPaced} onChange={event => setSelfPaced(event.target.checked)} />
          Entraînement avec corrections à mon rythme, hors classement
        </label>
      </GameStart>
    );
  }

  if (state.phase === "gameOver" && !lastCorrection) {
    return (
      <GameEnd
        gameSlug={selfPaced ? undefined : "flashback"}
        title={selfPaced ? "Entraînement terminé · hors classement" : "Trois erreurs"}
        score={state.score}
        scoreLabel="mots validés"
        lines={[
          `${rounds} réponses`,
          `Meilleure série : ${bestCombo}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={!selfPaced && missionTarget != null ? state.score >= missionTarget : null}
        onReplay={start}
      >
        <div>
          <p className="eq-kicker">Mots rencontrés ({state.seenWords.length})</p>
          <ul className="eq-game-review eq-game-review-scroll" data-testid="flashback-words">
            {state.seenWords.map((word) => (
              <li key={word.english} className={missed.includes(word.english) ? "is-hard" : ""}>
                <div>
                  <b lang="en">{word.english}</b>
                  <span> · {word.french}{missed.includes(word.english) ? " · à revoir" : ""}</span>
                </div>
                <SpeakButton text={word.english} label="Audio" />
              </li>
            ))}
          </ul>

        </div>
        <div>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={quit}>
            Changer de niveau
          </button>
        </div>
      </GameEnd>
    );
  }

  const showingResult = state.phase === "result" || lastCorrection;
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
      <TimeBar percent={(timeLeft / (state.phase === "meaning" || state.meaningChoices.length ? MEANING_MS : ROUND_MS)) * 100} low={timeLow} />

      <div className={`eq-game-stage eq-card-stage ${tone}`} data-testid="game-stage">
        <div className="eq-card-top">
          <p className="eq-game-prompt-kicker" aria-live="polite">
            {state.phase === "meaning" ? "Quel est son sens en français ?" : "As-tu déjà vu ce mot dans cette partie ?"}
          </p>
          <div className="flex items-center gap-2">
            <SpeakButton text={state.currentWord.english} label="Prononcer" />
            {!lastCorrection && <button type="button" className="eq-btn eq-btn-ghost eq-enigma-mini-btn" onClick={togglePause}>
              {paused ? "Reprendre" : "Pause (Échap)"}
            </button>}
          </div>
        </div>

        <p className="eq-game-prompt" data-testid="game-prompt" lang="en" aria-live="polite" aria-atomic="true">
          {state.currentWord.english}
        </p>
        {showingResult && <p className="eq-game-prompt-sub eq-game-prompt-meaning" lang="fr">{state.currentWord.french}</p>}

        {state.phase === "meaning" ? (
          <div className="eq-game-choices" role="group" aria-label="Traductions possibles">
            {state.meaningChoices.map((choice, index) => (
              <button type="button" key={choice} className="eq-game-choice" data-testid="meaning-choice" disabled={paused}
                onClick={() => resolve(choice)}><kbd>{index + 1}</kbd><span>{choice}</span></button>
            ))}
          </div>
        ) : (
          <div className="eq-game-choices eq-game-choices-duo">
            <button type="button" className={`eq-game-choice ${showingResult && state.isNew ? "is-correct" : ""}`}
              onClick={() => resolve(false)} disabled={showingResult || paused} data-testid="choice-new">
              <kbd>←</kbd><span>Nouveau</span>
            </button>
            <button type="button" className={`eq-game-choice ${showingResult && !state.isNew ? "is-correct" : ""}`}
              onClick={() => resolve(true)} disabled={showingResult || paused} data-testid="choice-seen">
              <kbd>→</kbd><span>Déjà vu</span>
            </button>
          </div>
        )}

        <div className="eq-card-feedback-slot">
          {showingResult ? (
            <p
              className={`eq-game-feedback ${state.lastDecisionCorrect ? "is-right" : "is-wrong"}`}
              role="status"
            >
              {state.lastDecisionCorrect
                ? `Exact ! ${state.currentWord.english} : ${state.currentWord.french}.`
                : timedOutRound
                  ? `Temps écoulé. ${state.currentWord.english} signifie « ${state.currentWord.french} ».`
                  : state.meaningChoices.length
                    ? `Pour ce mot, retiens « ${state.currentWord.french} ».`
                    : state.isNew
                    ? "Raté : c'était la première fois qu'il apparaissait."
                    : "Raté : ce mot était déjà passé dans la partie."}
            </p>
          ) : null}
        </div>

        {selfPaced && showingResult && (
          <button type="button" className="eq-btn eq-btn-gold" onClick={lastCorrection ? () => setLastCorrectionRead(true) : continueRound} disabled={paused}>
            {lastCorrection ? "Voir mon bilan" : "Continuer au mot suivant"}
          </button>
        )}

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
