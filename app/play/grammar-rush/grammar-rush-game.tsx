"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GRAMMAR_RUSH_TIME_MS,
  answerRush,
  createRushState,
  currentRushQuestion,
  rushMultiplier,
  type RushQuestion,
  type RushState,
} from "@/lib/games/grammar-rush";
import { GameEnd, GameHud, GameStart, HudStat, TimeBar, type RewardSummary } from "@/components/play/game-screens";
import { submitGrammarRushScore } from "./actions";

const KEYS = ["1", "2", "3", "4"];
const FEEDBACK_RIGHT_MS = 500;
const FEEDBACK_WRONG_MS = 1600;

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

export function GrammarRushGame({
  queue,
  isLoggedIn,
  missionTarget,
  levelLabel,
}: {
  queue: RushQuestion[];
  isLoggedIn: boolean;
  missionTarget: number | null;
  levelLabel: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"start" | "playing" | "ended">("start");
  const [state, setState] = useState<RushState>(() => createRushState(queue));
  const [timeLeft, setTimeLeft] = useState(GRAMMAR_RUSH_TIME_MS);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ right: boolean; text: string; question: RushQuestion } | null>(null);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const startedAtRef = useRef(0);
  const questionAtRef = useRef(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const answerPendingRef = useRef(false);
  const runRef = useRef(0);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const fresh = createRushState(queue);
    stateRef.current = fresh;
    setState(fresh);
    setTimeLeft(GRAMMAR_RUSH_TIME_MS);
    setSelected(null);
    setFeedback(null);
    setRewards(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    answerPendingRef.current = false;
    runRef.current += 1;
    startedAtRef.current = Date.now();
    questionAtRef.current = Date.now();
    setPhase("playing");
  }, [queue]);

  /* Chronomètre */
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const left = GRAMMAR_RUSH_TIME_MS - (Date.now() - startedAtRef.current);
      if (left <= 0) {
        if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        answerPendingRef.current = true;
        setTimeLeft(0);
        setPhase("ended");
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  const choose = useCallback(
    (choice: number) => {
      if (phase !== "playing" || answerPendingRef.current) return;
      if (Date.now() - startedAtRef.current >= GRAMMAR_RUSH_TIME_MS) {
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
      const elapsed = Date.now() - questionAtRef.current;
      answerPendingRef.current = true;
      const result = answerRush(current, choice, elapsed);
      stateRef.current = result.state;
      setState(result.state);
      setSelected(choice);
      setFeedback(
        result.isCorrect
          ? { right: true, text: `+ ${result.points}${result.speedBonus ? " (rapide)" : ""}`, question }
          : { right: false, text: `Non : ${question.options[question.correctAnswer]}`, question }
      );
      nextTimerRef.current = setTimeout(
        () => {
          setFeedback(null);
          setSelected(null);
          answerPendingRef.current = false;
          questionAtRef.current = Date.now();
          if (!currentRushQuestion(stateRef.current)) {
            setPhase("ended");
          }
        },
        result.isCorrect ? FEEDBACK_RIGHT_MS : FEEDBACK_WRONG_MS
      );
    },
    [phase]
  );

  /* Touches 1 à 4 */
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const index = KEYS.indexOf(event.key);
      if (index >= 0) {
        event.preventDefault();
        choose(index);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose]);

  /* Enregistrement */
  useEffect(() => {
    if (phase !== "ended" || submittedRef.current) return;
    submittedRef.current = true;
    const run = runRef.current;
    const final = stateRef.current;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    submitGrammarRushScore({
      score: final.score,
      correct: final.correct,
      attempts: final.attempts,
      durationMs: Math.min(GRAMMAR_RUSH_TIME_MS, Date.now() - startedAtRef.current),
    })
      .then((result) => {
        if (run !== runRef.current) return;
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
              }
            : null,
          dailyChallenge: result.dailyChallenge ?? null,
        });
        setSubmitStatus("saved");
        router.refresh();
      })
      .catch(() => {
        if (run === runRef.current) setSubmitStatus("error");
      });
  }, [phase, isLoggedIn, router]);

  if (phase === "start") {
    return (
      <GameStart
        title="Soixante secondes de grammaire"
        intro={`Les questions des cours défilent, quatre propositions à chaque fois. Réponds vite et juste : la série fait grimper le multiplicateur. Niveau des questions : ${levelLabel}.`}
        rules={[
          "10 points par bonne réponse, multipliés par la série (jusqu'à x2). + 5 si tu réponds en moins de trois secondes.",
          "Une erreur ne retire rien mais remet la série à zéro, et la bonne réponse s'affiche.",
          "Au clavier : touches 1 à 4.",
          missionTarget ? `Objectif de mission : ${missionTarget} points.` : "À la fin, chaque question ratée renvoie vers son cours.",
        ]}
        onStart={start}
      />
    );
  }

  if (phase === "ended") {
    const accuracy = state.attempts > 0 ? Math.round((state.correct / state.attempts) * 100) : 0;
    return (
      <GameEnd
        title={state.index >= state.queue.length ? "Toutes les questions terminées" : "Temps écoulé"}
        score={state.score}
        scoreLabel="points"
        lines={[
          `${state.correct} bonne${state.correct > 1 ? "s" : ""} réponse${state.correct > 1 ? "s" : ""} sur ${state.attempts} (${accuracy} %)`,
          `Meilleure série : ${state.bestStreak}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={() => setPhase("start")}
      >
        {state.missed.length > 0 ? (
          <div>
            <p className="eq-kicker">À revoir ({state.missed.length})</p>
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
        ) : (
          <p className="eq-game-end-note">{state.attempts > 0 ? "Sans faute. Monte d'un chapitre pour corser les questions." : "Essaie de répondre à une question lors de la prochaine partie."}</p>
        )}
      </GameEnd>
    );
  }

  const question = feedback?.question ?? currentRushQuestion(state);
  if (!question) return null;
  const timeLow = timeLeft < 10_000;

  return (
    <div className="eq-game-play">
      <GameHud>
        <HudStat label="Score" value={state.score} tone="gold" />
        <HudStat label="Temps" value={`${Math.ceil(timeLeft / 1000)} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat label="Série" value={state.streak} tone="mint" hint={`x${rushMultiplier(state.streak).toFixed(1)}`} />
        <HudStat label="Justes" value={`${state.correct} / ${state.attempts}`} />
      </GameHud>
      <TimeBar percent={(timeLeft / GRAMMAR_RUSH_TIME_MS) * 100} low={timeLow} />

      <div className={`eq-game-stage ${feedback ? (feedback.right ? "is-right" : "is-wrong") : ""}`} data-testid="game-stage">
        <p className="eq-game-prompt-kicker">Cours {question.course}</p>
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
                disabled={Boolean(feedback)}
                data-testid="game-choice"
              >
                <kbd>{KEYS[index]}</kbd>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {feedback ? (
          <p className={`eq-game-feedback ${feedback.right ? "is-right" : "is-wrong"}`} role="status">
            {feedback.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
