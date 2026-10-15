"use client";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VERBS,
  createInitialGameState,
  startNewRound,
  submitAnswer,
  skipCurrentVerb,
  tickTimer,
  type AnswerPayload,
  type Difficulty,
  type GameState,
  type RequiredFields,
} from "@/lib/games/speed-verb-challenge";
import { GameEnd, GameHud, GameStart, HudStat, TimeBar, type RewardSummary } from "@/components/play/game-screens";
import { submitSpeedVerbScore } from "./actions";

const TOTAL_TIME_MS = 90_000;
const FEEDBACK_RIGHT_MS = 900;
const FEEDBACK_WRONG_MS = 2200;

const DIFFICULTIES: { value: Difficulty; label: string; detail: string }[] = [
  { value: 1, label: "Facile", detail: "Prétérit seulement" },
  { value: 2, label: "Moyen", detail: "Prétérit et participe passé" },
  { value: 3, label: "Difficile", detail: "Prétérit, participe passé et traduction" },
];

type Phase = "start" | "playing" | "ended";

type Feedback = {
  kind: "right" | "wrong" | "skipped";
  message: string;
  answers?: { label: string; values: string[] }[];
};

type Missed = {
  base: string;
  pastSimple: string[];
  pastParticiple: string[];
  translations: string[];
  required: RequiredFields;
  reason: "incorrect" | "skipped";
};

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

function emptyAnswer(): AnswerPayload {
  return { pastSimple: "", pastParticiple: "", translation: "" };
}

function correctAnswersFor(state: GameState) {
  const round = state.currentRound;
  if (!round) return [];
  const list: { label: string; values: string[] }[] = [];
  if (round.required.pastSimple) list.push({ label: "Prétérit", values: round.currentVerb.pastSimple });
  if (round.required.pastParticiple) list.push({ label: "Participe passé", values: round.currentVerb.pastParticiple });
  if (round.required.translation) list.push({ label: "Traduction", values: round.currentVerb.translations });
  return list;
}

export function SpeedVerbGame({
  isLoggedIn,
  missionTarget,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
}) {
  const [phase, setPhase] = useState<Phase>("start");
  const [difficulty, setDifficultyChoice] = useState<Difficulty>(1);
  const [state, setState] = useState<GameState | null>(null);
  const [answer, setAnswer] = useState<AnswerPayload>(emptyAnswer);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, attempts: 0 });
  const [missed, setMissed] = useState<Missed[]>([]);
  const [roundKey, setRoundKey] = useState(0);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const lastTickRef = useRef(0);
  const startedAtRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const roundLockedRef = useRef(false);
  const sessionRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    advanceTimeoutRef.current = null;
    toastTimeoutRef.current = null;
  }, []);

  useEffect(() => () => {
    clearTimers();
    sessionRef.current += 1;
  }, [clearTimers]);

  const updateState = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
    if (next.ended) {
      clearTimers();
      setFeedback(null);
      setPhase("ended");
    }
  }, [clearTimers]);

  const tickCurrent = useCallback((now: number) => {
    const current = stateRef.current;
    if (!current || current.ended) return current;
    const delta = now - lastTickRef.current;
    lastTickRef.current = now;
    const next = tickTimer(current, delta);
    updateState(next);
    return next;
  }, [updateState]);

  const start = useCallback(() => {
    clearTimers();
    sessionRef.current += 1;
    roundLockedRef.current = false;
    const now = performance.now();
    const initial = createInitialGameState(VERBS, {
      totalTimeMs: TOTAL_TIME_MS,
      difficulty,
      allowImmediateRepeat: false,
    });
    updateState(startNewRound(initial, now));
    setAnswer(emptyAnswer());
    setFeedback(null);
    setToast(null);
    setStats({ correct: 0, attempts: 0 });
    setMissed([]);
    setRewards(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    lastTickRef.current = now;
    startedAtRef.current = now;
    roundStartedAtRef.current = now;
    setRoundKey((key) => key + 1);
    setPhase("playing");
  }, [clearTimers, difficulty, updateState]);

  /* Chronomètre */
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      tickCurrent(performance.now());
    }, 100);
    return () => clearInterval(interval);
  }, [phase, tickCurrent]);

  /* Focus sur le premier champ à chaque nouveau verbe */
  useEffect(() => {
    if (phase === "playing" && !feedback) {
      firstInputRef.current?.focus();
    }
  }, [phase, feedback, roundKey]);

  const scheduleNext = useCallback(
    (after: number) => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
        const now = performance.now();
        const current = tickCurrent(now);
        if (!current || current.ended) return;
        roundStartedAtRef.current = now;
        updateState(startNewRound(current, now));
        roundLockedRef.current = false;
        setFeedback(null);
        setAnswer(emptyAnswer());
        setRoundKey((key) => key + 1);
      }, after);
    },
    [tickCurrent, updateState]
  );

  const handleSubmit = useCallback(() => {
    if (roundLockedRef.current) return;
    const now = performance.now();
    const current = tickCurrent(now);
    if (!current || !current.currentRound || current.ended || feedback) return;
    roundLockedRef.current = true;

    const answerTime = now - roundStartedAtRef.current;
    const { state: next, result } = submitAnswer(current, answer, answerTime);
    const round = current.currentRound;

    setStats((previous) => ({
      correct: previous.correct + (result.isCorrect ? 1 : 0),
      attempts: previous.attempts + 1,
    }));

    if (result.isCorrect) {
      const parts = [`+ ${result.pointsAwarded} points`];
      if (result.speedBonus) parts.push(`vitesse + ${result.speedBonus}`);
      if (result.timeBonus) parts.push(`+ ${Math.round(result.timeBonus / 1000)} s`);
      setFeedback({ kind: "right", message: parts.join(" · ") });
      if (result.isMilestone) {
        setToast(`Série de ${result.streakAfter} ! Bonus de temps et de points.`);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToast(null), 2600);
      }
    } else {
      setFeedback({ kind: "wrong", message: "Pas tout à fait. Les bonnes réponses :", answers: correctAnswersFor(current) });
      setMissed((previous) => [
        ...previous,
        {
          base: round.currentVerb.base,
          pastSimple: round.currentVerb.pastSimple,
          pastParticiple: round.currentVerb.pastParticiple,
          translations: round.currentVerb.translations,
          required: round.required,
          reason: "incorrect",
        },
      ]);
    }

    updateState(next);
    if (!next.ended) {
      scheduleNext(result.isCorrect ? FEEDBACK_RIGHT_MS : FEEDBACK_WRONG_MS);
    }
  }, [answer, feedback, scheduleNext, tickCurrent, updateState]);

  const handleSkip = useCallback(() => {
    if (roundLockedRef.current) return;
    const current = tickCurrent(performance.now());
    if (!current || !current.currentRound || current.ended || feedback) return;
    roundLockedRef.current = true;
    const round = current.currentRound;
    updateState(skipCurrentVerb(current));
    setStats((previous) => ({ ...previous, attempts: previous.attempts + 1 }));
    setFeedback({ kind: "skipped", message: "Verbe passé. Série remise à zéro. À retenir :", answers: correctAnswersFor(current) });
    setMissed((previous) => [
      ...previous,
      {
        base: round.currentVerb.base,
        pastSimple: round.currentVerb.pastSimple,
        pastParticiple: round.currentVerb.pastParticiple,
        translations: round.currentVerb.translations,
        required: round.required,
        reason: "skipped",
      },
    ]);
    scheduleNext(FEEDBACK_WRONG_MS);
  }, [feedback, scheduleNext, tickCurrent, updateState]);

  /* Enregistrement du score */
  useEffect(() => {
    if (phase !== "ended" || !state || submittedRef.current) return;
    submittedRef.current = true;

    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }

    setSubmitStatus("saving");
    const session = sessionRef.current;
    submitSpeedVerbScore({
      difficulty,
      score: state.score,
      correctCount: stats.correct,
      totalRounds: stats.attempts,
      durationMs: Math.round(performance.now() - startedAtRef.current),
    })
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
  }, [phase, state, isLoggedIn, difficulty, stats.correct, stats.attempts]);

  /* ---------- écran de démarrage ---------- */

  if (phase === "start") {
    return (
      <GameStart
        title="Prêt à conjuguer ?"
        intro="Un verbe irrégulier apparaît, tu tapes ses formes le plus vite possible. 90 secondes, et chaque bonne réponse enchaînée fait grimper le multiplicateur."
        rules={[
          "Prétérit au niveau facile, participe passé en plus au niveau moyen, traduction française au niveau difficile.",
          "Une série de bonnes réponses rapporte des points bonus et du temps supplémentaire.",
          "Une erreur ou un verbe passé remet la série à zéro. Les verbes manqués sont listés à la fin pour réviser.",
          missionTarget ? `Objectif de mission : ${missionTarget} points.` : "Les verbes manqués sont affichés à la fin de la partie.",
        ]}
        onStart={start}
      >
        <div className="eq-game-options" role="radiogroup" aria-label="Difficulté">
          {DIFFICULTIES.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={difficulty === option.value}
              className="eq-game-option"
              onClick={() => setDifficultyChoice(option.value)}
            >
              <b>{option.label}</b>
              <span>{option.detail}</span>
            </button>
          ))}
        </div>
      </GameStart>
    );
  }

  /* ---------- fin de partie ---------- */

  if (phase === "ended" && state) {
    const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
    return (
      <GameEnd
        title="Temps écoulé"
        score={state.score}
        scoreLabel="points"
        lines={[
          `${stats.correct} bonne${stats.correct > 1 ? "s" : ""} réponse${stats.correct > 1 ? "s" : ""} sur ${stats.attempts} (${accuracy} %)`,
          `Meilleure série : ${state.highestStreak}`,
          `Niveau ${DIFFICULTIES.find((option) => option.value === difficulty)?.label.toLowerCase()}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={() => setPhase("start")}
      >
        {missed.length > 0 ? (
          <div>
            <p className="eq-kicker">À revoir ({missed.length})</p>
            <ul className="eq-game-review">
              {missed.map((verb, index) => (
                <li key={`${verb.base}-${index}`} className={verb.reason === "incorrect" ? "is-hard" : ""}>
                  <div>
                    <b>{verb.base}</b>
                    <span>
                      {" "}
                      · {verb.pastSimple.join(" / ")} · {verb.pastParticiple.join(" / ")}
                    </span>
                  </div>
                  <span>{verb.translations[0]}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="eq-game-end-note">Aucun verbe manqué. Sans faute.</p>
        )}
      </GameEnd>
    );
  }

  /* ---------- partie en cours ---------- */

  if (!state || !state.currentRound) {
    return null;
  }

  const round = state.currentRound;
  const required = round.required;
  const timePercent = (state.timeLeftMs / TOTAL_TIME_MS) * 100;
  const timeLow = state.timeLeftMs < 10_000;
  const secondsLeft = Math.ceil(state.timeLeftMs / 1000);
  const fields: { key: keyof AnswerPayload; label: string; placeholder: string }[] = [];
  if (required.pastSimple) fields.push({ key: "pastSimple", label: "Prétérit", placeholder: "went" });
  if (required.pastParticiple) fields.push({ key: "pastParticiple", label: "Participe passé", placeholder: "gone" });
  if (required.translation) fields.push({ key: "translation", label: "Traduction", placeholder: "aller" });

  const stageTone = feedback?.kind === "right" ? "is-right" : feedback ? "is-wrong" : "";

  return (
    <div className="eq-game-play">
      <GameHud>
        <HudStat label="Score" value={state.score} tone="gold" />
        <HudStat label="Temps" value={`${secondsLeft} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat label="Série" value={state.streak} tone="mint" hint={`x${state.comboMultiplier.toFixed(1)}`} />
        <HudStat label="Verbes" value={state.roundsCompleted} />
      </GameHud>
      <TimeBar percent={timePercent} low={timeLow} />

      {toast ? (
        <p className="eq-game-toast eq-pop" role="status">
          {toast}
        </p>
      ) : null}

      <form
        key={roundKey}
        className={`eq-game-stage ${stageTone}`}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <p className="eq-game-prompt-kicker">Verbe irrégulier</p>
        <p className="eq-game-prompt" data-testid="game-prompt">
          {round.currentVerb.base}
        </p>
        <p className="eq-game-prompt-sub">
          {fields.length === 1 ? "Donne le prétérit." : `Donne ${fields.map((field) => field.label.toLowerCase()).join(", ")}.`}
        </p>

        <div className="eq-game-fields">
          {fields.map((field, index) => (
            <label key={field.key} className="eq-game-field">
              <span>{field.label}</span>
              <input
                ref={index === 0 ? firstInputRef : undefined}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={field.placeholder}
                value={answer[field.key] ?? ""}
                disabled={Boolean(feedback)}
                onChange={(event) => setAnswer((previous) => ({ ...previous, [field.key]: event.target.value }))}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  if (event.repeat || event.nativeEvent.isComposing) {
                    event.preventDefault();
                    return;
                  }
                  const form = event.currentTarget.form;
                  const inputs = form ? Array.from(form.querySelectorAll<HTMLInputElement>("input")) : [];
                  const nextInput = inputs[index + 1];
                  if (nextInput) {
                    event.preventDefault();
                    nextInput.focus();
                  }
                }}
              />
            </label>
          ))}
        </div>

        <div className="eq-game-actions">
          <button type="submit" className="eq-btn eq-btn-gold" disabled={Boolean(feedback)} data-testid="game-submit">
            Valider
          </button>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={handleSkip} disabled={Boolean(feedback)}>
            Passer
          </button>
        </div>

        {feedback ? (
          <div className={`eq-game-feedback ${feedback.kind === "right" ? "is-right" : "is-wrong"}`} role="status">
            <p>{feedback.message}</p>
            {feedback.answers ? (
              <dl>
                {feedback.answers.map((entry) => (
                  <div key={entry.label}>
                    <dt>{entry.label}</dt>
                    <dd>{entry.values.join(" / ")}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
