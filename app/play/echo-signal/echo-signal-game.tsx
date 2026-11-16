"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playDialogueOrSpeak, playSoundEffect, stopAllGameAudio } from "@/lib/games/audio";
import {
  computeEchoQuestionPoints,
  ECHO_SIGNAL_CLIPS_PER_RUN,
  getEchoDifficultyConfig,
  pickEchoSignalMissions,
  type EchoDifficulty,
  type EchoScenario,
} from "@/lib/games/echoSignal";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import {
  GameEnd,
  GameHud,
  GameStart,
  HudStat,
  SpeakButton,
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";
import { submitEchoSignalScore } from "./actions";

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

type QuestionLog = {
  scenarioId: string;
  scenarioTitle: string;
  prompt: string;
  chosen: string;
  expected: string;
  correct: boolean;
  explanation: string;
};

export function EchoSignalGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
  audioMap = {},
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
  audioMap?: Record<string, string>;
}) {
  const [difficulty, setDifficulty] = useState<EchoDifficulty>(2);
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [silentMode, setSilentMode] = useState(false);

  const [missions, setMissions] = useState<EchoScenario[]>([]);
  const [clipIndex, setClipIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "ended">("start");
  const [playsUsed, setPlaysUsed] = useState(0);
  const [speedRate, setSpeedRate] = useState<number>(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [logs, setLogs] = useState<QuestionLog[]>([]);

  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const gameSession = useGameSession("echo-signal", isLoggedIn);

  useGameFocusMode(phase === "playing" || phase === "feedback");

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      stopAllGameAudio();
    };
  }, []);

  const currentMission = missions[clipIndex] ?? null;
  const currentQuestion = currentMission?.questions[qIndex] ?? null;
  const diffConfig = getEchoDifficultyConfig(difficulty);
  const totalQuestions = missions.reduce((sum, m) => sum + m.questions.length, 0) || ECHO_SIGNAL_CLIPS_PER_RUN * 2;
  const globalQuestionIndex = clipIndex * 2 + qIndex;

  const triggerPlay = useCallback(
    (scenario: EchoScenario, rate: number, countPlay = true) => {
      if (silentMode) return;
      if (countPlay && playsUsed >= diffConfig.maxPlays) return;
      if (countPlay) {
        setPlaysUsed((prev) => prev + 1);
      }
      setIsPlayingAudio(true);
      playDialogueOrSpeak({
        mp3Url: audioMap[scenario.id],
        lines: scenario.lines,
        rate,
        onLineChange: setActiveSpeakerIndex,
        onEnded: () => {
          setIsPlayingAudio(false);
          setActiveSpeakerIndex(null);
        },
      });
    },
    [audioMap, diffConfig.maxPlays, playsUsed, silentMode]
  );

  const finishMatch = useCallback(
    (finalScore: number, finalCorrect: number, finalTotalQuestions: number, finalDiff: EchoDifficulty) => {
      stopAllGameAudio();
      setIsPlayingAudio(false);
      setActiveSpeakerIndex(null);
      setPhase("ended");
      playSoundEffect(finalCorrect > 0 ? "victory" : "wrong");

      if (!isLoggedIn) {
        setSubmitStatus("guest");
        return;
      }
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitStatus("saving");
      const rawDurationMs = Math.max(1000, Math.round(performance.now() - startedAtRef.current));
      void (async () => {
        const { sessionId, durationMs } = await gameSession.finish(rawDurationMs);
        const res = await submitEchoSignalScore({
          difficulty: finalDiff,
          score: finalScore,
          correctCount: finalCorrect,
          totalQuestions: finalTotalQuestions,
          durationMs,
          sessionId,
        });
        if (!res.success) {
          setRewardError(res.error ?? "Impossible d'enregistrer le score.");
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(res));
        setSubmitStatus("saved");
      })();
    },
    [gameSession, isLoggedIn]
  );

  const startGame = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    stopAllGameAudio();
    const picked = pickEchoSignalMissions({ level, count: ECHO_SIGNAL_CLIPS_PER_RUN });
    setMissions(picked);
    setClipIndex(0);
    setQIndex(0);
    setPlaysUsed(silentMode ? 0 : 1);
    setSpeedRate(1);
    setIsPlayingAudio(false);
    setActiveSpeakerIndex(null);
    setSelectedChoice(null);
    setLastAnswerCorrect(null);
    setShowTranscript(silentMode);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setLogs([]);
    setRewards(null);
    setRewardError(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    setPhase("playing");
    startedAtRef.current = performance.now();
    gameSession.begin();

    if (picked[0] && !silentMode) {
      setIsPlayingAudio(true);
      playDialogueOrSpeak({
        mp3Url: audioMap[picked[0].id],
        lines: picked[0].lines,
        rate: 1,
        onLineChange: setActiveSpeakerIndex,
        onEnded: () => {
          setIsPlayingAudio(false);
          setActiveSpeakerIndex(null);
        },
      });
    }
  }, [audioMap, gameSession, level, silentMode]);

  const moveNext = useCallback(
    (nextScore: number, nextCorrect: number) => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      if (!currentMission) return;
      if (qIndex + 1 < currentMission.questions.length) {
        setQIndex(qIndex + 1);
        setSelectedChoice(null);
        setLastAnswerCorrect(null);
        setPhase("playing");
        return;
      }
      const nextClip = clipIndex + 1;
      if (nextClip >= missions.length) {
        finishMatch(nextScore, nextCorrect, totalQuestions, difficulty);
        return;
      }
      stopAllGameAudio();
      setClipIndex(nextClip);
      setQIndex(0);
      setPlaysUsed(silentMode ? 0 : 1);
      setSelectedChoice(null);
      setLastAnswerCorrect(null);
      setShowTranscript(silentMode);
      setPhase("playing");
      if (!silentMode) {
        setTimeout(() => {
          setIsPlayingAudio(true);
          playDialogueOrSpeak({
            mp3Url: audioMap[missions[nextClip].id],
            lines: missions[nextClip].lines,
            rate: speedRate,
            onLineChange: setActiveSpeakerIndex,
            onEnded: () => {
              setIsPlayingAudio(false);
              setActiveSpeakerIndex(null);
            },
          });
        }, 160);
      }
    },
    [
      audioMap,
      clipIndex,
      currentMission,
      difficulty,
      finishMatch,
      missions,
      qIndex,
      silentMode,
      speedRate,
      totalQuestions,
    ]
  );

  const chooseOption = useCallback(
    (optionIndex: number) => {
      if (phase !== "playing" || !currentMission || !currentQuestion) return;
      const correct = optionIndex === currentQuestion.correctIndex;
      const nextStreak = correct ? streak + 1 : 0;
      const points = computeEchoQuestionPoints({
        difficulty,
        correct,
        playsUsed,
        newStreak: nextStreak,
        silentMode,
      });
      const nextScore = score + points;
      const nextCorrect = correctCount + (correct ? 1 : 0);

      setSelectedChoice(optionIndex);
      setLastAnswerCorrect(correct);
      setScore(nextScore);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount(nextCorrect);
      setLogs((prev) => [
        ...prev,
        {
          scenarioId: currentMission.id,
          scenarioTitle: currentMission.title,
          prompt: currentQuestion.prompt,
          chosen: currentQuestion.options[optionIndex] ?? "",
          expected: currentQuestion.options[currentQuestion.correctIndex],
          correct,
          explanation: currentQuestion.explanation,
        },
      ]);
      // Dévoile la transcription après la dernière question de la transmission en cours.
      if (qIndex + 1 >= currentMission.questions.length) {
        setShowTranscript(true);
      }
      setPhase("feedback");
      playSoundEffect(correct ? (nextStreak >= 3 ? "combo" : "correct") : "wrong");

      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      nextTimerRef.current = setTimeout(() => {
        moveNext(nextScore, nextCorrect);
      }, correct ? 1700 : 2500);
    },
    [
      correctCount,
      currentMission,
      currentQuestion,
      difficulty,
      moveNext,
      phase,
      playsUsed,
      qIndex,
      score,
      silentMode,
      streak,
    ]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") {
        chooseOption(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chooseOption, phase]);

  const quitToStart = () => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    stopAllGameAudio();
    gameSession.cancel();
    setPhase("start");
  };

  if (phase === "start") {
    return (
      <GameStart
        title="Echo Signal"
        intro="Maya et Sam interceptent 4 messages radio en anglais depuis Londres. Écoute attentivement chaque annonce ou dialogue et réponds aux questions."
        rules={[
          "4 transmissions audio (8 questions) : repère les heures, lieux, prix et intentions.",
          "En Facile et Moyen, tu peux réécouter la transmission (bonus si tu réussis dès la 1re écoute).",
          "La transcription complète s'affiche après les deux questions pour vérifier ce que tu as manqué.",
        ]}
        startLabel="Capter les signaux"
        onStart={startGame}
      >
        <div className="space-y-4">
          <div className="eq-game-options" role="radiogroup" aria-label="Difficulté">
            {([1, 2, 3] as EchoDifficulty[]).map((item) => {
              const cfg = getEchoDifficultyConfig(item);
              return (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === item}
                  onClick={() => setDifficulty(item)}
                  className="eq-game-option"
                >
                  <b>{cfg.label}</b>
                  <span>{cfg.subtitle}</span>
                </button>
              );
            })}
          </div>
          <LevelPicker
            value={level}
            onChange={setLevel}
            suggested={suggestedLevel}
            label="Niveau de compréhension"
          />
          <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={silentMode}
              onChange={(e) => setSilentMode(e.target.checked)}
              className="h-4 w-4 accent-[var(--cyan)]"
            />
            <span>Mode sans son (affiche le dialogue écrit · score ajusté à 65 %)</span>
          </label>
        </div>
      </GameStart>
    );
  }

  if (phase === "ended") {
    const missionReached = missionTarget != null ? score >= missionTarget : null;
    return (
      <GameEnd
        gameSlug="echo-signal"
        title="Transmissions décodées"
        score={score.toLocaleString("fr-FR")}
        scoreLabel="points"
        lines={[
          `${correctCount} / ${totalQuestions} bonnes réponses`,
          `Meilleure série : ${bestStreak} · Difficulté ${diffConfig.label}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        rewardError={rewardError}
        missionReached={missionReached}
        onReplay={() => setPhase("start")}
      >
        {missions.length > 0 ? (
          <div className="space-y-2">
            <h4 className="eq-h3">Transcriptions et corrections</h4>
            <ul className="eq-game-review eq-game-review-scroll">
              {missions.map((missionItem) => {
                const fullScript = missionItem.lines.map((l) => `${l.speaker}: ${l.text}`).join(" ");
                const scenarioLogs = logs.filter((l) => l.scenarioId === missionItem.id);
                const allGood = scenarioLogs.every((l) => l.correct);
                return (
                  <li key={missionItem.id} className={allGood ? "" : "is-hard"}>
                    <div>
                      <b>
                        {missionItem.title} · {missionItem.category}
                      </b>
                      <p className="text-xs text-[var(--muted)] mt-1">{fullScript}</p>
                      {scenarioLogs.map((logItem) => (
                        <p key={logItem.prompt} className="text-xs mt-1">
                          {logItem.correct ? "OK" : "À revoir"} : {logItem.explanation}
                        </p>
                      ))}
                    </div>
                    <SpeakButton text={missionItem.lines.map((l) => l.text).join(" ")} label="Réécouter" />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  if (!currentMission || !currentQuestion) return null;

  const replaysLeft = Math.max(0, diffConfig.maxPlays - playsUsed);

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quitToStart}>
        <HudStat label="Signal" value={`${clipIndex + 1} / ${missions.length}`} />
        <HudStat label="Question" value={`${globalQuestionIndex + 1} / ${totalQuestions}`} />
        <HudStat label="Score" value={score} tone="gold" />
        <HudStat label="Série" value={streak} tone={streak >= 3 ? "mint" : undefined} />
      </GameHud>

      <div
        className={`eq-game-stage eq-echo-stage ${
          phase === "feedback"
            ? lastAnswerCorrect
              ? "is-right"
              : "is-wrong"
            : ""
        }`}
      >
        <div className="eq-echo-radio">
          <div className="eq-echo-radio-head">
            <div>
              <span className="eq-chip eq-chip-cyan">{currentMission.category}</span>
              <h3 className="eq-echo-title mt-2" data-testid="game-prompt">
                {currentMission.title}
              </h3>
              <p className="text-xs text-[var(--muted)]">{currentMission.context}</p>
            </div>
            <div className={`eq-echo-bars ${isPlayingAudio ? "is-playing" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          {activeSpeakerIndex !== null && currentMission.lines[activeSpeakerIndex] ? (
            <p className="eq-echo-speaker" role="status">
              À l&apos;antenne : <b>{currentMission.lines[activeSpeakerIndex].speaker}</b>
            </p>
          ) : null}

          {!silentMode ? (
            <div className="eq-echo-controls">
              <button
                type="button"
                data-testid="echo-play-btn"
                onClick={() => triggerPlay(currentMission, speedRate, true)}
                disabled={replaysLeft <= 0 && !isPlayingAudio}
                className="eq-btn eq-btn-primary eq-btn-sm"
              >
                {isPlayingAudio
                  ? "Lecture en cours…"
                  : replaysLeft > 0
                    ? `Réécouter (${replaysLeft} restante${replaysLeft > 1 ? "s" : ""})`
                    : "Écoutes utilisées"}
              </button>
              {diffConfig.allowSlowSpeed ? (
                <button
                  type="button"
                  onClick={() => setSpeedRate((r) => (r === 1 ? 0.85 : 1))}
                  className="eq-btn eq-btn-ghost eq-btn-sm"
                >
                  Vitesse : {speedRate === 1 ? "1x" : "0,85x"}
                </button>
              ) : null}
            </div>
          ) : null}

          {showTranscript ? (
            <div className="eq-echo-transcript">
              {currentMission.lines.map((line, index) => (
                <p
                  key={`${line.speaker}-${index}`}
                  className={activeSpeakerIndex === index ? "is-active-line" : ""}
                >
                  <b>{line.speaker} :</b> {line.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              La transcription apparaîtra après la 2e question de cette transmission.
            </p>
          )}
        </div>

        <div className="eq-echo-question">
          <p className="text-base sm:text-lg font-bold">{currentQuestion.prompt}</p>
          <div className="eq-game-choices">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedChoice === idx;
              const isRight = idx === currentQuestion.correctIndex;
              const stateClass =
                phase === "feedback"
                  ? isRight
                    ? "is-correct"
                    : isSelected
                      ? "is-wrong"
                      : "is-dim"
                  : "";
              return (
                <button
                  key={option}
                  type="button"
                  data-testid="game-choice"
                  disabled={phase !== "playing"}
                  onClick={() => chooseOption(idx)}
                  className={`eq-game-choice ${stateClass}`}
                >
                  <kbd>{idx + 1}</kbd>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {phase === "feedback" ? (
          <div className={`eq-game-feedback ${lastAnswerCorrect ? "is-right" : "is-wrong"}`} role="status">
            <span>
              {lastAnswerCorrect ? "Bien capté ! " : "À retenir : "}
              {currentQuestion.explanation}
            </span>
            <button
              type="button"
              onClick={() => moveNext(score, correctCount)}
              className="eq-btn eq-btn-ghost eq-btn-sm ml-auto"
            >
              Continuer →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
