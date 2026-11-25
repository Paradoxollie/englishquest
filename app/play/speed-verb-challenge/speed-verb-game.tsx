"use client";
import { recordClassAnswer } from "@/components/classes/live-activity-events";

import { MistakePractice } from "@/components/play/mistake-practice";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  VERB_POOLS,
  verbsForDifficulty,
  matchesVerbTranslation,
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
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { submitSpeedVerbScore } from "./actions";

const TOTAL_TIME_MS = 90_000;
const FEEDBACK_RIGHT_MS = 900;
const FEEDBACK_WRONG_MS = 2200;

const DIFFICULTIES: { value: Difficulty; label: string; detail: string }[] = [
  { value: 1, label: "Facile", detail: `Prétérit seulement · ${VERB_POOLS[1].length} verbes courants` },
  { value: 2, label: "Moyen", detail: `Prétérit et participe passé · ${VERB_POOLS[2].length} verbes` },
  { value: 3, label: "Difficile", detail: `Prétérit, participe et traduction · ${VERB_POOLS[3].length} verbes` },
];

type Phase = "start" | "playing" | "ended";

type Feedback = {
  kind: "right" | "wrong" | "skipped";
  message: string;
  fieldResults?: {
    pastSimple: boolean;
    pastParticiple: boolean;
    translation: boolean;
  };
  answers?: { key: keyof AnswerPayload; label: string; values: string[] }[];
};

type Missed = {
  base: string;
  pastSimple: string[];
  pastParticiple: string[];
  translations: string[];
  required: RequiredFields;
  userAnswer: AnswerPayload;
  reason: "incorrect" | "skipped";
};

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

function emptyAnswer(): AnswerPayload {
  return { pastSimple: "", pastParticiple: "", translation: "" };
}

function correctAnswersFor(state: GameState) {
  const round = state.currentRound;
  if (!round) return [];
  const list: { key: keyof AnswerPayload; label: string; values: string[] }[] = [];
  if (round.required.pastSimple) {
    list.push({ key: "pastSimple", label: "Prétérit", values: round.currentVerb.pastSimple });
  }
  if (round.required.pastParticiple) {
    list.push({ key: "pastParticiple", label: "Participe passé", values: round.currentVerb.pastParticiple });
  }
  if (round.required.translation) {
    list.push({ key: "translation", label: "Traduction", values: round.currentVerb.translations });
  }
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
  const [paused, setPaused] = useState(false);
  const [answer, setAnswer] = useState<AnswerPayload>(emptyAnswer);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [roundElapsedMs, setRoundElapsedMs] = useState(0);
  const [stats, setStats] = useState({ correct: 0, attempts: 0 });
  const [missed, setMissed] = useState<Missed[]>([]);
  const [roundKey, setRoundKey] = useState(0);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const lastTickRef = useRef(0);
  const startedAtRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const feedbackEndsAtRef = useRef(0);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const feedbackRef = useRef<Feedback | null>(null);
  const pausedRef = useRef(false);
  const roundLockedRef = useRef(false);
  const sessionRef = useRef(0);
  const gameSession = useGameSession("speed-verb-challenge", isLoggedIn);
  useGameFocusMode(phase === "playing");

  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const clearTimers = useCallback(() => {
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    advanceTimeoutRef.current = null;
    toastTimeoutRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearTimers();
      sessionRef.current += 1;
    },
    [clearTimers]
  );

  const showToast = useCallback((message: string, durationMs = 2400) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), durationMs);
  }, []);

  const updateState = useCallback(
    (next: GameState) => {
      stateRef.current = next;
      setState(next);
      if (next.ended) {
        clearTimers();
        setFeedback(null);
        feedbackRef.current = null;
        setPaused(false);
        pausedRef.current = false;
        setPhase("ended");
      }
    },
    [clearTimers]
  );

  const tickCurrent = useCallback(
    (now: number) => {
      const current = stateRef.current;
      if (!current || current.ended) return current;
      const prev = lastTickRef.current;
      lastTickRef.current = now;

      if (pausedRef.current) {
        return current;
      }

      let billableDelta = Math.max(0, now - prev);
      if (feedbackRef.current && feedbackEndsAtRef.current > 0) {
        // Freeze countdown only during the scheduled feedback window; never swallow time after it expires
        const effectiveStart = Math.max(prev, feedbackEndsAtRef.current);
        billableDelta = Math.max(0, now - effectiveStart);
      }

      if (!feedbackRef.current) {
        setRoundElapsedMs(Math.max(0, now - roundStartedAtRef.current));
      }
      if (billableDelta <= 0) {
        return current;
      }

      const next = tickTimer(current, billableDelta);
      updateState(next);
      return next;
    },
    [updateState]
  );

  const advanceToNextVerb = useCallback(() => {
    const now = performance.now();
    const current = stateRef.current;
    if (!current || current.ended) return;
    const effectiveStart =
      feedbackEndsAtRef.current > 0
        ? Math.max(lastTickRef.current, feedbackEndsAtRef.current)
        : lastTickRef.current;
    const billableDelta = Math.max(0, now - effectiveStart);
    feedbackEndsAtRef.current = 0;
    const updated = billableDelta > 0 ? tickTimer(current, billableDelta) : current;
    lastTickRef.current = now;
    if (updated.ended) {
      updateState(updated);
      return;
    }
    roundStartedAtRef.current = now;
    setRoundElapsedMs(0);
    updateState(startNewRound(updated, now));
    roundLockedRef.current = false;
    setFeedback(null);
    feedbackRef.current = null;
    setAnswer(emptyAnswer());
    setRoundKey((key) => key + 1);
  }, [updateState]);

  const scheduleNext = useCallback(
    (after: number) => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
        if (!pausedRef.current) {
          advanceToNextVerb();
        }
      }, after);
    },
    [advanceToNextVerb]
  );

  const start = useCallback(() => {
    clearTimers();
    sessionRef.current += 1;
    gameSession.begin();
    roundLockedRef.current = false;
    const now = performance.now();
    const initial = createInitialGameState(verbsForDifficulty(difficulty), {
      totalTimeMs: TOTAL_TIME_MS,
      difficulty,
      allowImmediateRepeat: false,
    });
    updateState(startNewRound(initial, now));
    setPaused(false);
    pausedRef.current = false;
    setAnswer(emptyAnswer());
    setFeedback(null);
    feedbackRef.current = null;
    setToast(null);
    setRoundElapsedMs(0);
    setStats({ correct: 0, attempts: 0 });
    setMissed([]);
    setRewards(null);
    setRewardError(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    lastTickRef.current = now;
    startedAtRef.current = now;
    roundStartedAtRef.current = now;
    feedbackEndsAtRef.current = 0;
    setRoundKey((key) => key + 1);
    setPhase("playing");
  }, [clearTimers, difficulty, updateState, gameSession]);

  /* Abandon : retour à l'écran de départ, rien n'est enregistré. */
  const quit = useCallback(() => {
    clearTimers();
    sessionRef.current += 1;
    gameSession.cancel();
    roundLockedRef.current = false;
    feedbackEndsAtRef.current = 0;
    setPaused(false);
    pausedRef.current = false;
    setFeedback(null);
    feedbackRef.current = null;
    setToast(null);
    setPhase("start");
  }, [clearTimers, gameSession]);

  const togglePause = useCallback(() => {
    if (phase !== "playing" || !stateRef.current || stateRef.current.ended) return;
    if (pausedRef.current) {
      const now = performance.now();
      lastTickRef.current = now;
      // Keep speed bonus fair across pause
      roundStartedAtRef.current = now - roundElapsedMs;
      pausedRef.current = false;
      setPaused(false);
      if (feedbackRef.current) {
        feedbackEndsAtRef.current = now + 650;
        scheduleNext(650);
      } else {
        feedbackEndsAtRef.current = 0;
        setTimeout(() => firstInputRef.current?.focus(), 20);
      }
    } else {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = null;
      }
      pausedRef.current = true;
      setPaused(true);
    }
  }, [phase, roundElapsedMs, scheduleNext]);

  /* Escape toggles Pause */
  useEffect(() => {
    if (phase !== "playing") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, togglePause]);

  /* Chronomètre */
  useEffect(() => {
    if (phase !== "playing" || paused) return;
    const interval = setInterval(() => {
      tickCurrent(performance.now());
    }, 100);
    return () => clearInterval(interval);
  }, [phase, paused, tickCurrent]);

  /* Focus sur le premier champ à chaque nouveau verbe */
  useEffect(() => {
    if (phase === "playing" && !feedback && !paused) {
      firstInputRef.current?.focus();
    }
  }, [phase, feedback, paused, roundKey]);

  const handleSubmit = useCallback(() => {
    if (roundLockedRef.current || pausedRef.current) return;
    const current = stateRef.current;
    if (!current || !current.currentRound || current.ended || feedbackRef.current) return;

    const req = current.currentRound.required;
    const hasAnyValue =
      (req.pastSimple && Boolean(answer.pastSimple?.trim())) ||
      (req.pastParticiple && Boolean(answer.pastParticiple?.trim())) ||
      (req.translation && Boolean(answer.translation?.trim()));

    if (!hasAnyValue) {
      showToast("Tape une réponse avant de valider, ou clique sur Passer.", 1800);
      firstInputRef.current?.focus();
      return;
    }

    const now = performance.now();
    const checked = tickCurrent(now);
    if (!checked || !checked.currentRound || checked.ended) return;

    roundLockedRef.current = true;
    const answerTime = now - roundStartedAtRef.current;
    const { state: next, result } = submitAnswer(checked, answer, answerTime);
    recordClassAnswer(result.isCorrect);
    const round = checked.currentRound;

    setStats((previous) => ({
      correct: previous.correct + (result.isCorrect ? 1 : 0),
      attempts: previous.attempts + 1,
    }));

    if (result.isCorrect) {
      playSoundEffect(result.isMilestone ? "combo" : "correct");
      const parts = [`+ ${result.pointsAwarded} pts`];
      if (result.speedBonus) parts.push(`éclair +${result.speedBonus}`);
      if (result.timeBonus) parts.push(`+${Math.round(result.timeBonus / 1000)} s chrono`);
      const nextFeedback: Feedback = {
        kind: "right",
        message: parts.join(" · "),
        fieldResults: result.fieldResults,
      };
      feedbackRef.current = nextFeedback;
      setFeedback(nextFeedback);
      if (result.isMilestone) {
        showToast(`Série de ${result.streakAfter} ! Bonus chrono +2 s !`, 2600);
      }
    } else {
      playSoundEffect("wrong");
      const nextFeedback: Feedback = {
        kind: "wrong",
        message: "Correction à retenir :",
        fieldResults: result.fieldResults,
        answers: correctAnswersFor(checked),
      };
      feedbackRef.current = nextFeedback;
      setFeedback(nextFeedback);
      setMissed((previous) => [
        ...previous,
        {
          base: round.currentVerb.base,
          pastSimple: round.currentVerb.pastSimple,
          pastParticiple: round.currentVerb.pastParticiple,
          translations: round.currentVerb.translations,
          required: round.required,
          userAnswer: { ...answer },
          reason: "incorrect",
        },
      ]);
    }

    updateState(next);
    if (!next.ended) {
      const delay = result.isCorrect ? FEEDBACK_RIGHT_MS : FEEDBACK_WRONG_MS;
      feedbackEndsAtRef.current = now + delay;
      scheduleNext(delay);
    }
  }, [answer, scheduleNext, showToast, tickCurrent, updateState]);

  const handleSkip = useCallback(() => {
    if (roundLockedRef.current || pausedRef.current) return;
    const now = performance.now();
    const current = tickCurrent(now);
    if (!current || !current.currentRound || current.ended || feedbackRef.current) return;
    roundLockedRef.current = true;
    const round = current.currentRound;
    updateState(skipCurrentVerb(current));
    recordClassAnswer(false);
    playSoundEffect("wrong");
    setStats((previous) => ({ ...previous, attempts: previous.attempts + 1 }));
    const nextFeedback: Feedback = {
      kind: "skipped",
      message: "Verbe passé · série remise à zéro :",
      answers: correctAnswersFor(current),
    };
    feedbackRef.current = nextFeedback;
    setFeedback(nextFeedback);
    setMissed((previous) => [
      ...previous,
      {
        base: round.currentVerb.base,
        pastSimple: round.currentVerb.pastSimple,
        pastParticiple: round.currentVerb.pastParticiple,
        translations: round.currentVerb.translations,
        required: round.required,
        userAnswer: { ...answer },
        reason: "skipped",
      },
    ]);
    feedbackEndsAtRef.current = now + FEEDBACK_WRONG_MS;
    scheduleNext(FEEDBACK_WRONG_MS);
  }, [answer, scheduleNext, tickCurrent, updateState]);

  /* Enregistrement du score */
  useEffect(() => {
    if (phase !== "ended" || !state || submittedRef.current) return;
    submittedRef.current = true;
    playSoundEffect(stats.correct > 0 ? "victory" : "wrong");

    if (!isLoggedIn) {
      gameSession.finishGuest();
      setSubmitStatus("guest");
      return;
    }

    setSubmitStatus("saving");
    setRewardError(null);
    const session = sessionRef.current;
    const final = {
      difficulty,
      score: state.score,
      correctCount: stats.correct,
      totalRounds: stats.attempts,
    };
    gameSession
      .finish(performance.now() - startedAtRef.current)
      .then(({ sessionId, durationMs, save }) =>
        save(() => submitSpeedVerbScore({ ...final, durationMs, sessionId }))
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
  }, [phase, state, isLoggedIn, difficulty, stats.correct, stats.attempts, gameSession]);

  /* ---------- écran de démarrage ---------- */

  if (phase === "start") {
    return (
      <GameStart
        title="Speed Verb Challenge"
        intro="Un verbe irrégulier apparaît : tape sa conjugaison le plus vite possible pendant 90 secondes pour enchaîner les combos."
        rules={[
          "Facile : prétérit uniquement · Moyen : prétérit + participe · Difficile : + traduction.",
          "Moins de 3 s par verbe = +50 % de score et +1 s au chrono !",
          "Le paquet évite les répétitions jusqu'à ce que tous les verbes soient passés.",
          missionTarget
            ? `Objectif de mission : ${missionTarget} points.`
            : "Tous les verbes manqués sont récapitulés à la fin pour réviser.",
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
    const practice = missed.flatMap(verb => {
      const fields = [
        { key: "pastSimple", label: "Prétérit", answers: verb.pastSimple },
        { key: "pastParticiple", label: "Participe passé", answers: verb.pastParticiple },
        { key: "translation", label: "Traduction française", answers: verb.translations },
      ] as const;
      return fields.filter(field => verb.required[field.key]).flatMap(field => {
        const matches = (input: string) => field.key === "translation"
          ? matchesVerbTranslation(verb.translations, input)
          : field.answers.some(form => form.toLowerCase() === input.trim().toLowerCase());
        if (verb.reason === "incorrect" && matches(verb.userAnswer[field.key] ?? "")) return [];
        return [{ id: verb.base + "-" + field.key, prompt: verb.base, label: field.label, answers: field.answers, matches }];
      });
    });
    const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
    return (
      <GameEnd
        gameSlug="speed-verb-challenge"
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
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={() => setPhase("start")}
      >
        {missed.length > 0 ? (
          <MistakePractice items={practice}>
            <p className="eq-kicker">Carnet de révision ({missed.length})</p>
            <div className="eq-game-review-scroll">
              <ul className="eq-game-review">
                {missed.map((verb, index) => (
                  <li
                    key={`${verb.base}-${index}`}
                    className={verb.reason === "incorrect" ? "is-hard" : ""}
                  >
                    <div>
                      <b>{verb.base}</b>
                      <span>
                        {" "}
                        · {verb.pastSimple.join(" / ")} · {verb.pastParticiple.join(" / ")}
                      </span>
                      {verb.reason === "incorrect" &&
                      (verb.userAnswer.pastSimple ||
                        verb.userAnswer.pastParticiple ||
                        verb.userAnswer.translation) ? (
                        <small className="eq-speed-attempt">
                          Ton essai :{" "}
                          {[
                            verb.userAnswer.pastSimple,
                            verb.userAnswer.pastParticiple,
                            verb.userAnswer.translation,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{verb.translations[0]}</span>
                      <SpeakButton
                        text={`${verb.base}, ${verb.pastSimple[0]}, ${verb.pastParticiple[0]}`}
                        label="Audio"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </MistakePractice>
        ) : (
          <p className="eq-game-end-note">{stats.attempts ? "Tous les verbes joués ont été réussis." : "Aucun verbe joué dans cette partie."}</p>
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
  const fields: { key: keyof AnswerPayload; label: string }[] = [];
  if (required.pastSimple) fields.push({ key: "pastSimple", label: "Prétérit" });
  if (required.pastParticiple) fields.push({ key: "pastParticiple", label: "Participe passé" });
  if (required.translation) fields.push({ key: "translation", label: "Traduction" });

  const stageTone = feedback?.kind === "right" ? "is-right" : feedback ? "is-wrong" : "";
  const speedTier =
    roundElapsedMs < 3000
      ? { label: "Éclair < 3 s : +50 % & +1 s", tone: "is-fast", pct: Math.max(5, 100 - (roundElapsedMs / 3000) * 100) }
      : roundElapsedMs < 5000
        ? { label: "Rapide < 5 s : +30 %", tone: "is-mid", pct: Math.max(5, 100 - ((roundElapsedMs - 3000) / 2000) * 100) }
        : roundElapsedMs < 8000
          ? { label: "Bonus < 8 s : +15 %", tone: "is-warm", pct: Math.max(5, 100 - ((roundElapsedMs - 5000) / 3000) * 100) }
          : { label: "Rythme normal", tone: "is-base", pct: 0 };

  return (
    <div className="eq-game-play eq-speed">
      <GameHud onQuit={quit}>
        <HudStat label="Score" value={state.score} tone="gold" />
        <HudStat label="Temps" value={`${secondsLeft} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat
          label="Série"
          value={state.streak}
          tone="mint"
          hint={`x${state.comboMultiplier.toFixed(1)}`}
        />
        <HudStat label="Verbes" value={state.roundsCompleted} />
      </GameHud>
      <TimeBar percent={timePercent} low={timeLow} />

      <div className="eq-speed-status-slot">
        {toast ? (
          <p className="eq-game-toast eq-pop" role="status">
            {toast}
          </p>
        ) : (
          <div className={`eq-speed-pace ${speedTier.tone}`}>
            <span>{speedTier.label}</span>
            <i aria-hidden="true">
              <b style={{ width: `${speedTier.pct}%` }} />
            </i>
          </div>
        )}
      </div>

      <form
        key={roundKey}
        className={`eq-game-stage eq-speed-stage ${stageTone}`}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="eq-speed-card-head">
          <div className="eq-speed-deck-badges">
            <span className="eq-chip eq-chip-gold-soft">V1 · Infinitif</span>
            {!required.translation ? (
              <span className="eq-speed-fr-hint">
                FR : <strong>{round.currentVerb.translations[0]}</strong>
              </span>
            ) : null}
          </div>
          <div
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (!feedback && !paused) {
                setTimeout(() => firstInputRef.current?.focus(), 0);
              }
            }}
          >
            <SpeakButton text={round.currentVerb.base} label="Prononcer" />
          </div>
        </div>

        <p className="eq-game-prompt eq-speed-verb" data-testid="game-prompt">
          {round.currentVerb.base}
        </p>

        {round.currentVerb.hint ? (
          <p className="eq-game-prompt-sub" data-testid="verb-hint">
            ({round.currentVerb.hint})
          </p>
        ) : null}

        <p className="eq-game-prompt-sub">
          {fields.length === 1
            ? "Tape la forme au prétérit puis valide avec Entrée."
            : `Complète ${fields.map((field) => field.label.toLowerCase()).join(", ")}.`}
        </p>

        <div className="eq-game-fields eq-speed-matrix">
          {fields.map((field, index) => {
            const fieldOk = feedback?.fieldResults?.[field.key];
            const stateClass = feedback
              ? fieldOk === true
                ? "is-field-ok"
                : fieldOk === false
                  ? "is-field-bad"
                  : ""
              : "";
            return (
              <label key={field.key} className={`eq-game-field eq-speed-field ${stateClass}`}>
                <span className="eq-speed-field-head">
                  <span>{field.label}</span>
                  {feedback && fieldOk !== undefined ? (
                    <b>{fieldOk ? "✓" : "✗"}</b>
                  ) : null}
                </span>
                <input
                  ref={index === 0 ? firstInputRef : undefined}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint={index + 1 < fields.length ? "next" : "done"}
                  placeholder={field.label}
                  value={answer[field.key] ?? ""}
                  disabled={Boolean(feedback) || paused}
                  onChange={(event) =>
                    setAnswer((previous) => ({ ...previous, [field.key]: event.target.value }))
                  }
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
            );
          })}
        </div>

        <div className="eq-game-actions">
          <button
            type="submit"
            className="eq-btn eq-btn-gold"
            disabled={Boolean(feedback) || paused}
            data-testid="game-submit"
          >
            Valider
          </button>
          <button
            type="button"
            className="eq-btn eq-btn-ghost"
            onClick={handleSkip}
            disabled={Boolean(feedback) || paused}
          >
            Passer
          </button>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={togglePause}>
            {paused ? "Reprendre" : "Pause (Échap)"}
          </button>
        </div>

        {feedback ? (
          <div
            className={`eq-game-feedback ${feedback.kind === "right" ? "is-right" : "is-wrong"}`}
            role="status"
          >
            <p>{feedback.message}</p>
            {feedback.answers ? (
              <dl>
                {feedback.answers.map((entry) => (
                  <div key={entry.key}>
                    <dt>{entry.label}</dt>
                    <dd>{entry.values.join(" / ")}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        ) : null}

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
                  Changer de difficulté
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
