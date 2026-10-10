"use client";

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
import { GameEnd, GameHud, GameStart, HudStat, TimeBar, type RewardSummary } from "@/components/play/game-screens";
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

export function FlashTranslationGame({
  isLoggedIn,
  missionTarget,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
}) {
  const [state, setState] = useState<GameState>(() => createGameState(VOCABULARY, CONFIG));
  const [selected, setSelected] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockRef = useRef(false);
  const submittedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (waitTimer.current) clearTimeout(waitTimer.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    waitTimer.current = null;
    feedbackTimer.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const round = getCurrentRound(state);
  const done = completedRounds(state);
  const playing = state.started && state.phase !== "ended";

  const start = useCallback(() => {
    clearTimers();
    setState(startGame(createGameState(VOCABULARY, CONFIG)));
    setSelected(null);
    setCombo(0);
    setBestCombo(0);
    setRewards(null);
    setSubmitStatus("idle");
    lockRef.current = false;
    submittedRef.current = false;
  }, [clearTimers]);

  /* Délai avant l'apparition des choix */
  useEffect(() => {
    if (!state.started || state.phase !== "waiting" || !round) return;
    waitTimer.current = setTimeout(() => {
      setState((current) => startAnswering(current, Date.now()));
    }, round.waitTimeMs);
    return () => {
      if (waitTimer.current) clearTimeout(waitTimer.current);
    };
  }, [state.started, state.phase, round]);

  const choose = useCallback(
    (index: number) => {
      if (state.phase !== "answering" || !round || lockRef.current) return;
      lockRef.current = true;
      const answered = submitAnswer(state, index, Date.now());
      setState(answered);
      setSelected(index);
      if (index === round.correctIndex) {
        setCombo((current) => {
          const next = current + 1;
          setBestCombo((best) => Math.max(best, next));
          return next;
        });
      } else {
        setCombo(0);
      }
      feedbackTimer.current = setTimeout(() => {
        setState(nextRound(answered));
        setSelected(null);
        lockRef.current = false;
      }, FEEDBACK_MS);
    },
    [state, round]
  );

  /* Raccourcis clavier 1 à 4 */
  useEffect(() => {
    if (state.phase !== "answering") return;
    const onKey = (event: KeyboardEvent) => {
      const index = KEYS.indexOf(event.key);
      if (index >= 0) {
        event.preventDefault();
        choose(index);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, choose]);

  /* Enregistrement */
  useEffect(() => {
    if (state.phase !== "ended" || submittedRef.current) return;
    submittedRef.current = true;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    submitFlashTranslationScore({
      totalTimeMs: getFinalScore(state),
      averageReactionTimeMs: getAverageReactionTime(state),
      wrongAnswers: state.wrongAnswers,
      roundsCompleted: completedRounds(state),
    })
      .then((result) => {
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
      })
      .catch(() => setSubmitStatus("error"));
  }, [state, isLoggedIn]);

  if (!state.started) {
    return (
      <GameStart
        title="Réflexes et vocabulaire"
        intro="Un mot français s'affiche, quatre traductions apparaissent après un court délai. Touche la bonne le plus vite possible : ici, le score est ton temps total, et plus il est bas, mieux c'est."
        rules={[
          "10 mots, 4 propositions à chaque fois. Les touches 1 à 4 fonctionnent au clavier.",
          "Chaque erreur ajoute 5 secondes à ton temps.",
          "Attends le signal : les choix apparaissent après un délai variable.",
          missionTarget ? `Objectif de mission : finir en moins de ${seconds(missionTarget)}.` : "Garde la série pour un temps parfait.",
        ]}
        onStart={start}
      />
    );
  }

  if (state.phase === "ended") {
    const total = getFinalScore(state);
    return (
      <GameEnd
        title="Série terminée"
        score={seconds(total)}
        scoreLabel="au total"
        lines={[
          `Réaction moyenne : ${seconds(getAverageReactionTime(state))}`,
          `${state.wrongAnswers} erreur${state.wrongAnswers > 1 ? "s" : ""} (${state.wrongAnswers * 5} s de pénalité)`,
          `Meilleure série : ${bestCombo}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        missionReached={missionTarget != null ? total <= missionTarget : null}
        onReplay={start}
      >
        {state.wrongAnswers > 0 ? (
          <div>
            <p className="eq-kicker">À revoir</p>
            <ul className="eq-game-review">
              {state.rounds
                .filter((entry) => entry.isCorrect === false)
                .map((entry) => (
                  <li key={entry.wordPair.french} className="is-hard">
                    <b>{entry.wordPair.french}</b>
                    <span>{entry.wordPair.english}</span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  if (!playing || !round) {
    return null;
  }

  const progress = (done / state.rounds.length) * 100;
  const feedback = state.phase === "feedback";
  const stageTone = feedback ? (selected === round.correctIndex ? "is-right" : "is-wrong") : "";

  return (
    <div className="eq-game-play">
      <GameHud>
        <HudStat label="Temps" value={seconds(getFinalScore(state))} tone="cyan" />
        <HudStat label="Mot" value={`${state.currentRoundIndex + 1} / ${state.rounds.length}`} />
        <HudStat label="Erreurs" value={state.wrongAnswers} tone={state.wrongAnswers > 0 ? "coral" : "mint"} hint="+ 5 s chacune" />
        <HudStat label="Série" value={combo} tone="gold" />
      </GameHud>
      <TimeBar percent={progress} />

      <div className={`eq-game-stage ${stageTone}`} data-testid="game-stage">
        <p className="eq-game-prompt-kicker">{state.phase === "waiting" ? "Prépare-toi" : "Traduis en anglais"}</p>
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
                  disabled={feedback}
                  data-testid="game-choice"
                >
                  <kbd>{KEYS[index]}</kbd>
                  <span>{choice.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {feedback && selected !== null ? (
          <p className={`eq-game-feedback ${selected === round.correctIndex ? "is-right" : "is-wrong"}`} role="status">
            {selected === round.correctIndex
              ? `Juste, en ${seconds(round.reactionTimeMs ?? 0)}.`
              : `Non : ${round.wordPair.english}. + 5 secondes.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
