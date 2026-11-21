"use client";
import { recordClassAnswer } from "@/components/classes/live-activity-events";

import { translationAnswers } from "@/lib/games/translation-recall";
import { MistakePractice } from "@/components/play/mistake-practice";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VOCABULARY,
  createGameState,
  getAverageReactionTime,
  getCurrentRound,
  getFinalScore,
  nextRound,
  startAnswering,
  startGame,
  submitAnswer,
  type GameConfig,
  type GameState,
} from "@/lib/games/flashTranslation";
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
import { submitFlashTranslationScore } from "./actions";

const CONFIG: GameConfig = {
  totalRounds: 10,
  minWaitMs: 1400,
  maxWaitMs: 2800,
  wrongAnswerPenaltyMs: 5000,
};

const KEYS = ["1", "2", "3", "4"];
const FEEDBACK_MS = 950;

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

function seconds(ms: number) {
  return `${(ms / 1000).toFixed(2)} s`;
}

function completedRounds(state: GameState) {
  return state.rounds.filter((round) => round.reactionTimeMs !== undefined).length;
}

/** Etat initial déterministe pour le rendu serveur (aucun Math.random au SSR). */
function createIdlePlaceholderState(level: GameLevel): GameState {
  return createGameState(VOCABULARY, { ...CONFIG, level, rng: () => 0 });
}

export function FlashTranslationGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
}) {
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [state, setState] = useState<GameState>(() =>
    createIdlePlaceholderState(suggestedLevel ?? DEFAULT_GAME_LEVEL)
  );
  const [paused, setPaused] = useState(false);
  const [practice, setPractice] = useState(false);
  const [liveAnswerMs, setLiveAnswerMs] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockRef = useRef(false);
  const pausedRef = useRef(false);
  const comboRef = useRef(0);
  const answerStartedAtRef = useRef(0);
  const pausedAnswerElapsedRef = useRef(0);
  const submittedRef = useRef(false);
  const sessionRef = useRef(0);
  const startedAtRef = useRef(0);
  const stateRef = useRef<GameState>(state);
  const gameSession = useGameSession("flash-translation", isLoggedIn);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearTimers = useCallback(() => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    waitTimer.current = null;
    feedbackTimer.current = null;
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      sessionRef.current += 1;
    },
    [clearTimers]
  );

  const round = getCurrentRound(state);
  const done = completedRounds(state);
  const playing = state.started && state.phase !== "ended";
  useGameFocusMode(playing);

  const start = useCallback(() => {
    clearTimers();
    sessionRef.current += 1;
    if (!practice) gameSession.begin();
    startedAtRef.current = performance.now();
    const timing = practice ? { ...CONFIG, minWaitMs: 0, maxWaitMs: 0 } : CONFIG;
    const fresh = startGame(createGameState(VOCABULARY, { ...timing, level }));
    stateRef.current = fresh;
    setState(fresh);
    setPaused(false);
    pausedRef.current = false;
    setLiveAnswerMs(0);
    pausedAnswerElapsedRef.current = 0;
    setSelected(null);
    comboRef.current = 0;
    setCombo(0);
    setBestCombo(0);
    setRewards(null);
    setRewardError(null);
    setSubmitStatus("idle");
    lockRef.current = false;
    submittedRef.current = false;
  }, [clearTimers, gameSession, level, practice]);

  /* Abandon : retour à l'écran de départ, rien n'est enregistré. */
  const quit = useCallback(() => {
    clearTimers();
    sessionRef.current += 1;
    gameSession.cancel();
    const idle = createIdlePlaceholderState(level);
    stateRef.current = idle;
    setState(idle);
    setPaused(false);
    pausedRef.current = false;
    setLiveAnswerMs(0);
    setSelected(null);
    comboRef.current = 0;
    setCombo(0);
    lockRef.current = false;
  }, [clearTimers, gameSession, level]);

  const togglePause = useCallback(() => {
    const current = stateRef.current;
    if (!current.started || current.phase === "ended") return;
    if (pausedRef.current) {
      pausedRef.current = false;
      setPaused(false);
      if (current.phase === "answering") {
        answerStartedAtRef.current = performance.now() - pausedAnswerElapsedRef.current;
      } else if (current.phase === "feedback") {
        // (En phase d'attente, l'effet « Délai avant l'apparition des choix » relance seul le minuteur.)
        feedbackTimer.current = setTimeout(() => {
          if (pausedRef.current) return;
          setState((prev) => nextRound(prev));
          setSelected(null);
          setLiveAnswerMs(0);
          lockRef.current = false;
        }, 500);
      }
    } else {
      clearTimers();
      if (current.phase === "answering") {
        const elapsed = Math.max(0, performance.now() - answerStartedAtRef.current);
        pausedAnswerElapsedRef.current = elapsed;
        setLiveAnswerMs(elapsed);
      }
      pausedRef.current = true;
      setPaused(true);
    }
  }, [clearTimers, round]);

  /* Délai avant l'apparition des choix */
  useEffect(() => {
    if (!state.started || state.phase !== "waiting" || !round || paused) return;
    waitTimer.current = setTimeout(() => {
      if (pausedRef.current) return;
      const now = performance.now();
      answerStartedAtRef.current = now;
      pausedAnswerElapsedRef.current = 0;
      setLiveAnswerMs(0);
      setState((current) => startAnswering(current, now));
    }, round.waitTimeMs);
    return () => {
      if (waitTimer.current) clearTimeout(waitTimer.current);
    };
  }, [state.started, state.phase, round, paused]);

  /* Chronomètre visible en direct pendant la phase de réponse */
  useEffect(() => {
    if (!state.started || state.phase !== "answering" || paused) return;
    const interval = setInterval(() => {
      setLiveAnswerMs(Math.max(0, performance.now() - answerStartedAtRef.current));
    }, 60);
    return () => clearInterval(interval);
  }, [state.started, state.phase, paused]);

  const choose = useCallback(
    (index: number) => {
      if (state.phase !== "answering" || !round || lockRef.current || pausedRef.current) return;
      lockRef.current = true;
      // Temps de réponse sans les pauses : la référence affichée est recalée à la reprise,
      // on reporte donc le temps écoulé sur l'heure d'apparition des choix connue du moteur.
      const elapsed = Math.max(0, performance.now() - answerStartedAtRef.current);
      const now = (round.startTimeMs ?? answerStartedAtRef.current) + elapsed;
      const answered = submitAnswer(state, index, now);
      if (answered === state) {
        lockRef.current = false;
        return;
      }
      setState(answered);
      recordClassAnswer(index === round.correctIndex);
      setSelected(index);
      setLiveAnswerMs(0);

      if (index === round.correctIndex) {
        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        setCombo(nextCombo);
        setBestCombo((best) => Math.max(best, nextCombo));
        playSoundEffect(nextCombo >= 3 ? "combo" : "correct");
      } else {
        comboRef.current = 0;
        setCombo(0);
        playSoundEffect("wrong");
      }

      feedbackTimer.current = setTimeout(() => {
        if (pausedRef.current) return;
        setState(nextRound(answered));
        setSelected(null);
        lockRef.current = false;
      }, FEEDBACK_MS);
    },
    [state, round]
  );

  /* Raccourcis clavier 1 à 4 + Échap (Pause) */
  useEffect(() => {
    if (!state.started || state.phase === "ended") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (pausedRef.current || state.phase !== "answering") return;
      const index = KEYS.indexOf(event.key);
      if (index >= 0) {
        event.preventDefault();
        choose(index);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.started, state.phase, choose, togglePause]);

  /* Enregistrement */
  useEffect(() => {
    if (state.phase !== "ended" || submittedRef.current) return;
    submittedRef.current = true;
    playSoundEffect(state.wrongAnswers < state.rounds.length ? "victory" : "wrong");
    if (practice) return;
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
        save(() => submitFlashTranslationScore({
          totalTimeMs: getFinalScore(state),
          averageReactionTimeMs: getAverageReactionTime(state),
          wrongAnswers: state.wrongAnswers,
          roundsCompleted: completedRounds(state),
          durationMs,
          sessionId,
        }))
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
  }, [state, isLoggedIn, gameSession, practice]);

  if (!state.started) {
    return (
      <GameStart
        title="Flash Translation"
        intro="Un mot français s'affiche, puis quatre traductions surgissent après un court délai. Touche la bonne le plus vite possible : ici, le temps le plus bas l'emporte."
        rules={[
          "10 mots, 4 propositions à chaque fois. Les touches 1 à 4 fonctionnent au clavier.",
          "Chaque erreur ajoute 5 secondes de pénalité à ton temps total.",
          practice ? "En entraînement, les traductions sont disponibles dès que le mot apparaît." : "Le chronomètre de réaction démarre quand les traductions apparaissent.",
          !practice && missionTarget
            ? `Objectif de mission : finir en moins de ${seconds(missionTarget)}.`
            : "Garde la série pour un chrono parfait.",
        ]}
        onStart={start}
      >
        <LevelPicker value={level} onChange={setLevel} suggested={suggestedLevel} />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={practice} onChange={event => setPractice(event.target.checked)} />
          Entraînement sans attente, hors classement
        </label>
      </GameStart>
    );
  }

  if (state.phase === "ended") {
    const total = getFinalScore(state);
    return (
      <GameEnd
        gameSlug={practice ? undefined : "flash-translation"}
        title={practice ? "Entraînement terminé · hors classement" : "Série terminée"}
        score={seconds(total)}
        scoreLabel="au total"
        lines={[
          `Réaction moyenne : ${seconds(getAverageReactionTime(state))}`,
          `${state.wrongAnswers} erreur${state.wrongAnswers > 1 ? "s" : ""} (${state.wrongAnswers * 5} s de pénalité)`,
          `Meilleure série : ${bestCombo}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={!practice && missionTarget != null ? total <= missionTarget : null}
        onReplay={start}
      >
        {state.wrongAnswers > 0 ? (
          <MistakePractice items={state.rounds.filter(round => round.isCorrect === false).map(({ wordPair }) => ({
            id: wordPair.english, prompt: wordPair.french, answers: translationAnswers(wordPair.english, wordPair.french),
          }))}>
            <p className="eq-kicker">À revoir ({state.wrongAnswers})</p>
            <div className="eq-game-review-scroll">
              <ul className="eq-game-review">
                {state.rounds
                  .filter((entry) => entry.isCorrect === false)
                  .map((entry, idx) => (
                    <li key={`${entry.wordPair.french}-${idx}`} className="is-hard">
                      <div>
                        <b>{entry.wordPair.french}</b>
                        <span> · {entry.wordPair.english}</span>
                      </div>
                      <SpeakButton text={entry.wordPair.english} label="Audio" />
                    </li>
                  ))}
              </ul>
            </div>
          </MistakePractice>
        ) : (
          <p className="eq-game-end-note">Zéro faute ! Super temps de réaction.</p>
        )}
        <div>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={quit}>
            Changer de niveau
          </button>
        </div>
      </GameEnd>
    );
  }

  if (!playing || !round) {
    return null;
  }

  const progress = (done / state.rounds.length) * 100;
  const feedback = state.phase === "feedback";
  const stageTone = feedback ? (selected === round.correctIndex ? "is-right" : "is-wrong") : "";
  const displayedTotalMs = getFinalScore(state) + (state.phase === "answering" ? liveAnswerMs : 0);

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quit}>
        <HudStat label="Temps" value={seconds(displayedTotalMs)} tone="cyan" />
        <HudStat
          label="Mot"
          value={`${state.currentRoundIndex + 1} / ${state.rounds.length}`}
        />
        <HudStat
          label="Erreurs"
          value={state.wrongAnswers}
          tone={state.wrongAnswers > 0 ? "coral" : "mint"}
          hint="+ 5 s chacune"
        />
        <HudStat label="Série" value={combo} tone="gold" />
      </GameHud>
      <TimeBar percent={progress} />

      <div className={`eq-game-stage eq-card-stage ${stageTone}`} data-testid="game-stage">
        <div className="eq-card-top">
          <p className="eq-game-prompt-kicker">
            {state.phase === "waiting" ? "Prépare-toi..." : "Traduis en anglais"}
          </p>
          <button
            type="button"
            className="eq-btn eq-btn-ghost eq-enigma-mini-btn"
            onClick={togglePause}
          >
            {paused ? "Reprendre" : "Pause (Échap)"}
          </button>
        </div>

        <p className="eq-game-prompt" data-testid="game-prompt">
          {round.wordPair.french}
        </p>

        {state.phase === "waiting" ? (
          <p className="eq-game-wait" aria-live="polite">
            <i /> Le signal arrive
          </p>
        ) : (
          <div className="eq-game-choices" role="group" aria-label="Propositions">
            {round.choices.map((choice, index) => {
              const tone = feedback
                ? choice.isCorrect
                  ? "is-correct"
                  : selected === index
                    ? "is-wrong"
                    : "is-dim"
                : "";
              return (
                <button
                  key={`${choice.text}-${index}`}
                  type="button"
                  className={`eq-game-choice ${tone}`}
                  onClick={() => choose(index)}
                  disabled={feedback || paused}
                  data-testid="game-choice"
                >
                  <kbd>{KEYS[index]}</kbd>
                  <span>{choice.text}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="eq-card-feedback-slot">
          {feedback && selected !== null ? (
            <div
              className={`eq-game-feedback flex flex-wrap items-center justify-between gap-2 ${
                selected === round.correctIndex ? "is-right" : "is-wrong"
              }`}
              role="status"
            >
              <span>
                {selected === round.correctIndex
                  ? `Juste, en ${seconds(round.reactionTimeMs ?? 0)}.`
                  : `Non : ${round.wordPair.english}. + 5 secondes.`}
              </span>
              <SpeakButton text={round.wordPair.english} label="Prononcer" />
            </div>
          ) : null}
        </div>

        {paused ? (
          <div className="eq-space-overlay">
            <div className="eq-space-overlay-card">
              <p className="eq-kicker">Pause</p>
              <p className="eq-space-overlay-sub">Chrono en pause · reprends quand tu es prêt.</p>
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
