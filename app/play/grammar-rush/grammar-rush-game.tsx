"use client";

import Link from "next/link";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GRAMMAR_RUSH_TIME_MS,
  answerRush,
  countFocusCorrect,
  createRushState,
  currentRushQuestion,
  rushMultiplier,
  weaveRushQueue,
  type RushQuestion,
  type RushState,
} from "@/lib/games/grammar-rush";
import { playSoundEffect } from "@/lib/games/audio";
import { PRACTICE_STAR_TARGET } from "@/lib/courses/stars";
import {
  GameEnd,
  GameHud,
  GameStart,
  HudStat,
  TimeBar,
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { submitGrammarRushScore } from "./actions";

const KEYS = ["1", "2", "3", "4"];
const FEEDBACK_RIGHT_MS = 550;
const FEEDBACK_WRONG_MS = 1600;

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

export function GrammarRushGame({
  queue,
  questionPool,
  queueFocusCourseId = null,
  isLoggedIn,
  missionTarget,
  levelLabel,
  focusCourseId = null,
}: {
  queue: RushQuestion[];
  questionPool?: RushQuestion[];
  queueFocusCourseId?: number | null;
  isLoggedIn: boolean;
  missionTarget: number | null;
  levelLabel: string;
  /** Cours ciblé via ?cours=N : ses bonnes réponses comptent pour l'étoile d'entraînement. */
  focusCourseId?: number | null;
}) {
  const [phase, setPhase] = useState<"start" | "playing" | "ended">("start");
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<RushState>(() => createRushState(queue));
  const [timeLeft, setTimeLeft] = useState(GRAMMAR_RUSH_TIME_MS);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    right: boolean;
    text: string;
    question: RushQuestion;
  } | null>(null);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const questionAtRef = useRef(0);
  const pausedRef = useRef(false);
  const pausedTimeLeftRef = useRef(GRAMMAR_RUSH_TIME_MS);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const answerPendingRef = useRef(false);
  const runRef = useRef(0);
  const stateRef = useRef(state);
  const gameSession = useGameSession("grammar-rush", isLoggedIn);
  useGameFocusMode(phase === "playing");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const advanceQuestion = useCallback(() => {
    setFeedback(null);
    setSelected(null);
    answerPendingRef.current = false;
    questionAtRef.current = performance.now();
    if (!currentRushQuestion(stateRef.current)) {
      setPhase("ended");
    }
  }, []);

  const start = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const sourcePool = questionPool && questionPool.length > 0 ? questionPool : queue;
    const freshQueue = weaveRushQueue(sourcePool, queueFocusCourseId);
    const fresh = createRushState(freshQueue.length > 0 ? freshQueue : queue);
    stateRef.current = fresh;
    setState(fresh);
    setPaused(false);
    pausedRef.current = false;
    pausedTimeLeftRef.current = GRAMMAR_RUSH_TIME_MS;
    setTimeLeft(GRAMMAR_RUSH_TIME_MS);
    setSelected(null);
    setFeedback(null);
    setRewards(null);
    setRewardError(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    answerPendingRef.current = false;
    runRef.current += 1;
    gameSession.begin();
    const now = performance.now();
    startedAtRef.current = now;
    questionAtRef.current = now;
    setPhase("playing");
  }, [questionPool, queue, queueFocusCourseId, gameSession]);

  /* Abandon : retour à l'écran de départ, rien n'est enregistré. */
  const quit = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    runRef.current += 1;
    gameSession.cancel();
    pausedRef.current = false;
    setPaused(false);
    answerPendingRef.current = false;
    setFeedback(null);
    setSelected(null);
    setPhase("start");
  }, [gameSession]);

  const togglePause = useCallback(() => {
    if (phase !== "playing") return;
    if (pausedRef.current) {
      const now = performance.now();
      pausedRef.current = false;
      setPaused(false);
      startedAtRef.current = now - (GRAMMAR_RUSH_TIME_MS - pausedTimeLeftRef.current);
      questionAtRef.current = now;
      if (answerPendingRef.current) {
        nextTimerRef.current = setTimeout(() => {
          if (!pausedRef.current) advanceQuestion();
        }, 500);
      }
    } else {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
        nextTimerRef.current = null;
      }
      const left = Math.max(0, GRAMMAR_RUSH_TIME_MS - (performance.now() - startedAtRef.current));
      pausedTimeLeftRef.current = left;
      setTimeLeft(left);
      pausedRef.current = true;
      setPaused(true);
    }
  }, [advanceQuestion, phase]);

  /* Chronomètre */
  useEffect(() => {
    if (phase !== "playing" || paused) return;
    const interval = setInterval(() => {
      const left = GRAMMAR_RUSH_TIME_MS - (performance.now() - startedAtRef.current);
      if (left <= 0) {
        if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        answerPendingRef.current = true;
        pausedTimeLeftRef.current = 0;
        setTimeLeft(0);
        setPhase("ended");
      } else {
        pausedTimeLeftRef.current = left;
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase, paused]);

  const choose = useCallback(
    (choice: number) => {
      if (phase !== "playing" || answerPendingRef.current || pausedRef.current) return;
      const now = performance.now();
      if (now - startedAtRef.current >= GRAMMAR_RUSH_TIME_MS) {
        answerPendingRef.current = true;
        if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        setTimeLeft(0);
        setPhase("ended");
        return;
      }
      const current = stateRef.current;
      const question = currentRushQuestion(current);
      if (!question) {
        setPhase("ended");
        return;
      }
      if (choice < 0 || choice >= question.options.length) return;
      const elapsed = Math.max(0, now - questionAtRef.current);
      answerPendingRef.current = true;
      const result = answerRush(current, choice, elapsed);
      stateRef.current = result.state;
      setState(result.state);
      setSelected(choice);
      if (result.isCorrect) {
        playSoundEffect(result.state.streak >= 3 ? "combo" : "correct");
      } else {
        playSoundEffect("wrong");
      }
      setFeedback(
        result.isCorrect
          ? {
              right: true,
              text: `+ ${result.points}${result.speedBonus ? " (éclair)" : ""}`,
              question,
            }
          : {
              right: false,
              text: `Non : ${question.options[question.correctAnswer]}`,
              question,
            }
      );
      nextTimerRef.current = setTimeout(
        () => {
          if (!pausedRef.current) advanceQuestion();
        },
        result.isCorrect ? FEEDBACK_RIGHT_MS : FEEDBACK_WRONG_MS
      );
    },
    [advanceQuestion, phase]
  );

  /* Touches 1 à options.length + Échap (Pause) */
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (pausedRef.current) return;
      const current = currentRushQuestion(stateRef.current);
      const optionLimit = current ? current.options.length : 4;
      const index = KEYS.indexOf(event.key);
      if (index >= 0 && index < optionLimit) {
        event.preventDefault();
        choose(index);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose, togglePause]);

  /* Enregistrement */
  useEffect(() => {
    if (phase !== "ended" || submittedRef.current) return;
    submittedRef.current = true;
    playSoundEffect(stateRef.current.correct > 0 ? "victory" : "wrong");
    const run = runRef.current;
    const final = stateRef.current;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    setRewardError(null);
    gameSession
      .finish(Math.min(GRAMMAR_RUSH_TIME_MS, Math.max(0, performance.now() - startedAtRef.current)))
      .then(({ sessionId, durationMs }) =>
        submitGrammarRushScore({
          score: final.score,
          correct: final.correct,
          attempts: final.attempts,
          durationMs,
          sessionId,
          focusCourseId,
          focusCorrect: countFocusCorrect(final, focusCourseId),
        })
      )
      .then((result) => {
        if (run !== runRef.current) return;
        if (!result.success) {
          setRewardError(result.error ?? null);
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(result));
        setSubmitStatus("saved");
      })
      .catch(() => {
        if (run === runRef.current) setSubmitStatus("error");
      });
  }, [phase, isLoggedIn, focusCourseId, gameSession]);

  if (phase === "start") {
    return (
      <GameStart
        title="Grammar Rush · 60 s"
        intro={`Les questions des cours défilent à toute allure (2 à 4 propositions selon la question). Réponds vite et juste · Niveau : ${levelLabel}.`}
        rules={[
          "10 points par bonne réponse, multipliés par la série (jusqu'à x2). + 5 si tu réponds en moins de 3 secondes.",
          "Une erreur remet la série à zéro et affiche immédiatement la bonne réponse.",
          "Au clavier : utilise les touches chiffrées 1 à 4.",
          missionTarget
            ? `Objectif de mission : ${missionTarget} points.`
            : "À la fin, chaque question ratée renvoie vers sa fiche de cours.",
          ...(focusCourseId && isLoggedIn
            ? [
                `Étoile d'entraînement : ${PRACTICE_STAR_TARGET} bonnes réponses sur les questions du cours ${focusCourseId} dans une même partie.`,
              ]
            : []),
        ]}
        onStart={start}
      />
    );
  }

  if (phase === "ended") {
    const accuracy = state.attempts > 0 ? Math.round((state.correct / state.attempts) * 100) : 0;
    return (
      <GameEnd
        gameSlug="grammar-rush"
        title={
          state.index >= state.queue.length
            ? "Toutes les questions terminées"
            : "Temps écoulé"
        }
        score={state.score}
        scoreLabel="points"
        lines={[
          `${state.correct} bonne${state.correct > 1 ? "s" : ""} réponse${state.correct > 1 ? "s" : ""} sur ${state.attempts} (${accuracy} %)`,
          `Meilleure série : ${state.bestStreak}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        rewardError={rewardError}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={quit}
      >
        {state.missed.length > 0 ? (
          <div>
            <p className="eq-kicker">À revoir ({state.missed.length})</p>
            <div className="eq-game-review-scroll">
              <ul className="eq-game-review">
                {state.missed.map((question, index) => (
                  <li key={`${question.id}-${index}`} className="is-hard">
                    <div>
                      <b>{question.question}</b>
                      <span> · {question.options[question.correctAnswer]}</span>
                    </div>
                    <Link href={`/cours/${question.course}`} className="eq-chip eq-chip-cyan">
                      Cours {question.course}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="eq-game-end-note">
            {state.attempts > 0
              ? "Sans faute ! Avance dans l'aventure pour débloquer d'autres chapitres."
              : "Essaie de répondre à une question lors de la prochaine partie."}
          </p>
        )}
      </GameEnd>
    );
  }

  const question = feedback?.question ?? currentRushQuestion(state);
  if (!question) return null;
  const timeLow = timeLeft < 10_000;

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quit}>
        <HudStat label="Score" value={state.score} tone="gold" />
        <HudStat label="Temps" value={`${Math.ceil(timeLeft / 1000)} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat
          label="Série"
          value={state.streak}
          tone="mint"
          hint={`x${rushMultiplier(state.streak).toFixed(1)}`}
        />
        <HudStat label="Justes" value={`${state.correct} / ${state.attempts}`} />
      </GameHud>
      <TimeBar percent={(timeLeft / GRAMMAR_RUSH_TIME_MS) * 100} low={timeLow} />

      <div
        className={`eq-game-stage eq-card-stage ${
          feedback ? (feedback.right ? "is-right" : "is-wrong") : ""
        }`}
        data-testid="game-stage"
      >
        <div className="eq-card-top">
          <p className="eq-game-prompt-kicker">
            Cours {question.course} · {question.options.length} choix
          </p>
          <button
            type="button"
            className="eq-btn eq-btn-ghost eq-enigma-mini-btn"
            onClick={togglePause}
          >
            {paused ? "Reprendre" : "Pause (Échap)"}
          </button>
        </div>

        <p className="eq-game-prompt is-text" data-testid="game-prompt">
          {question.question}
        </p>

        <div className="eq-game-choices" role="group" aria-label="Propositions">
          {question.options.map((option, index) => {
            const tone = feedback
              ? index === question.correctAnswer
                ? "is-correct"
                : selected === index
                  ? "is-wrong"
                  : "is-dim"
              : "";
            return (
              <button
                key={`${question.id}-${index}`}
                type="button"
                className={`eq-game-choice ${tone}`}
                onClick={() => choose(index)}
                disabled={Boolean(feedback) || paused}
                data-testid="game-choice"
              >
                <kbd>{KEYS[index]}</kbd>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="eq-card-feedback-slot">
          {feedback ? (
            <p
              className={`eq-game-feedback ${feedback.right ? "is-right" : "is-wrong"}`}
              role="status"
            >
              {feedback.text}
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
                  Quitter la partie
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
