"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playDialogueOrSpeak, playSoundEffect, setRecordingRate, stopAllGameAudio } from "@/lib/games/audio";
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
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useEnglishVoiceStatus } from "@/components/play/use-english-voice";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";
import { submitEchoSignalScore } from "./actions";

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

type QuestionLog = {
  scenarioId: string;
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
  lineStarts = {},
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
  audioMap?: Record<string, string>;
  lineStarts?: Record<string, number[]>;
}) {
  const voiceStatus = useEnglishVoiceStatus();
  const noVoice = voiceStatus === "unsupported" || voiceStatus === "no-english";

  const [difficulty, setDifficulty] = useState<EchoDifficulty>(2);
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [silentChoice, setSilentChoice] = useState(false);
  const [textScenario, setTextScenario] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState("");

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
  const [playingReview, setPlayingReview] = useState<string | null>(null);

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
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const submittedRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const gameSession = useGameSession("echo-signal", isLoggedIn);

  useGameFocusMode(phase === "playing" || phase === "feedback");

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      stopAllGameAudio();
    };
  }, [clearTimers]);

  const currentMission = missions[clipIndex] ?? null;
  const silentMode = silentChoice || (!!currentMission && (
    textScenario === currentMission.id || (noVoice && !audioMap[currentMission.id])
  ));
  const currentQuestion = currentMission?.questions[qIndex] ?? null;
  const diffConfig = getEchoDifficultyConfig(difficulty);
  const questionsPerClip = currentMission?.questions.length ?? 2;
  const totalQuestions = missions.reduce((sum, m) => sum + m.questions.length, 0) || ECHO_SIGNAL_CLIPS_PER_RUN * 2;
  const globalQuestionIndex = clipIndex * questionsPerClip + qIndex;

  const playScenario = useCallback(
    (scenario: EchoScenario, rate: number) => {
      setAudioNotice("");
      setIsPlayingAudio(true);
      playDialogueOrSpeak({
        mp3Url: audioMap[scenario.id],
        lines: scenario.lines,
        lineStarts: lineStarts[scenario.id],
        rate,
        onLineChange: setActiveSpeakerIndex,
        onEnded: () => {
          setIsPlayingAudio(false);
          setActiveSpeakerIndex(null);
          setPlaysUsed((used) => used + 1);
        },
        onError: (reason) => {
          setIsPlayingAudio(false);
          setActiveSpeakerIndex(null);
          if (reason === "blocked") setAudioNotice("Appuie sur Écouter le message pour lancer la lecture.");
          else {
            setTextScenario(scenario.id);
            setAudioNotice("La lecture audio a échoué. Le texte du message est disponible pour répondre.");
          }
        },
      });
    },
    [audioMap, lineStarts]
  );

  const stopScenario = useCallback(() => {
    stopAllGameAudio();
    setIsPlayingAudio(false);
    setActiveSpeakerIndex(null);
  }, []);

  // Only a completed playback consumes an attempt.
  const togglePlay = useCallback(() => {
    if (!currentMission || silentMode) return;
    if (isPlayingAudio) {
      stopScenario();
      return;
    }
    if (playsUsed >= diffConfig.maxPlays) return;
    playScenario(currentMission, speedRate);
  }, [currentMission, diffConfig.maxPlays, isPlayingAudio, playScenario, playsUsed, silentMode, speedRate, stopScenario]);

  const finishMatch = useCallback(
    (finalScore: number, finalCorrect: number, finalTotalQuestions: number, finalDiff: EchoDifficulty) => {
      clearTimers();
      stopScenario();
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
        const { sessionId, durationMs, save } = await gameSession.finish(rawDurationMs);
        const res = await save(() => submitEchoSignalScore({
          difficulty: finalDiff,
          score: finalScore,
          correctCount: finalCorrect,
          totalQuestions: finalTotalQuestions,
          durationMs,
          sessionId,
        }));
        if (!res.success) {
          setRewardError(res.error ?? "Impossible d'enregistrer le score.");
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(res));
        setSubmitStatus("saved");
      })();
    },
    [clearTimers, gameSession, isLoggedIn, stopScenario]
  );

  const startGame = useCallback(() => {
    clearTimers();
    stopAllGameAudio();
    const picked = pickEchoSignalMissions({ level, count: ECHO_SIGNAL_CLIPS_PER_RUN });
    setMissions(picked);
    setClipIndex(0);
    setQIndex(0);
    setPlaysUsed(0);
    setTextScenario(null);
    setAudioNotice("");
    setPlayingReview(null);
    setSpeedRate(1);
    setIsPlayingAudio(false);
    setActiveSpeakerIndex(null);
    setSelectedChoice(null);
    setLastAnswerCorrect(null);
    setShowTranscript(false);
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
    if (picked[0] && !silentChoice) playScenario(picked[0], 1);
  }, [clearTimers, gameSession, level, playScenario, silentChoice]);

  const moveNext = useCallback(() => {
    clearTimers();
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
      finishMatch(score, correctCount, totalQuestions, difficulty);
      return;
    }
    stopScenario();
    setClipIndex(nextClip);
    setQIndex(0);
    setPlaysUsed(0);
    setTextScenario(null);
    setAudioNotice("");
    setSelectedChoice(null);
    setLastAnswerCorrect(null);
    setShowTranscript(false);
    setPhase("playing");
    if (!silentChoice) playScenario(missions[nextClip], speedRate);
  }, [
    clearTimers,
    clipIndex,
    correctCount,
    currentMission,
    difficulty,
    finishMatch,
    missions,
    playScenario,
    qIndex,
    score,
    silentChoice,
    speedRate,
    stopScenario,
    totalQuestions,
  ]);

  const chooseOption = useCallback(
    (optionIndex: number) => {
      if (phase !== "playing" || !currentMission || !currentQuestion || (!silentMode && (!playsUsed || isPlayingAudio))) return;
      const correct = optionIndex === currentQuestion.correctIndex;
      const nextStreak = correct ? streak + 1 : 0;
      const points = computeEchoQuestionPoints({ difficulty, correct, playsUsed, newStreak: nextStreak, silentMode });

      setSelectedChoice(optionIndex);
      setLastAnswerCorrect(correct);
      setScore((prev) => prev + points);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + (correct ? 1 : 0));
      setLogs((prev) => [
        ...prev,
        {
          scenarioId: currentMission.id,
          prompt: currentQuestion.prompt,
          chosen: currentQuestion.options[optionIndex] ?? "",
          expected: currentQuestion.options[currentQuestion.correctIndex],
          correct,
          explanation: currentQuestion.explanation,
        },
      ]);
      // La transcription apparaît après la dernière question de la transmission.
      if (qIndex + 1 >= currentMission.questions.length) setShowTranscript(true);
      setPhase("feedback");
      playSoundEffect(correct ? (nextStreak >= 3 ? "combo" : "correct") : "wrong");
      // Pas d'avance automatique : l'élève lit la correction, puis continue.
      later(() => {
        feedbackRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        continueRef.current?.focus({ preventScroll: true });
      }, 60);
    },
    [currentMission, currentQuestion, difficulty, isPlayingAudio, later, phase, playsUsed, qIndex, silentMode, streak]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "4") chooseOption(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chooseOption, phase]);

  const quitToStart = () => {
    clearTimers();
    stopScenario();
    gameSession.cancel();
    setPhase("start");
  };

  const hasAudio = Object.keys(audioMap).length > 0 || !noVoice;

  if (phase === "start") {
    return (
      <GameStart
        title="Echo Signal"
        intro="Maya et Sam interceptent 4 messages en anglais : annonces, messages vocaux, conversations. Écoute bien, puis réponds aux deux questions de chaque message."
        rules={[
          "4 messages, 2 questions chacun : heures, lieux, prix, raisons, intentions.",
          "Facile : 3 écoutes et vitesse lente. Moyen : 2 écoutes. Difficile : une seule écoute.",
          "Lis l’explication après chaque réponse. En mode écoute, comprendre le message dès la première écoute complète rapporte un bonus.",
        ]}
        startLabel="Capter les signaux"
        onStart={startGame}
      >
        <div className="space-y-4">
          {!hasAudio && <p className="eq-game-notice">L’audio est indisponible sur cet appareil. Tu peux lire les messages et gagner les points de compréhension.</p>}
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
          <LevelPicker value={level} onChange={setLevel} suggested={suggestedLevel} label="Niveau de compréhension" />
          {hasAudio ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                checked={silentChoice}
                onChange={(e) => setSilentChoice(e.target.checked)}
                className="h-4 w-4 accent-[var(--cyan)]"
              />
              <span>Mode lecture, sans écouteurs</span>
            </label>
          ) : null}
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
        ratio={totalQuestions > 0 ? correctCount / totalQuestions : 0}
        lines={[
          `${correctCount} / ${totalQuestions} bonnes réponses`,
          `Meilleure série : ${bestStreak} · Difficulté : ${diffConfig.label.toLowerCase()}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={missionReached}
        onReplay={quitToStart}
      >
        {audioNotice && <p className="eq-game-notice" role="status">{audioNotice}</p>}
        {missions.length > 0 ? (
          <div className="space-y-3">
            <h4 className="eq-h3">Les messages et tes réponses</h4>
            <ul className="eq-echo-review">
              {missions.map((missionItem) => {
                const scenarioLogs = logs.filter((l) => l.scenarioId === missionItem.id);
                return (
                  <li key={missionItem.id}>
                    <div className="eq-echo-review-head">
                      <b>{missionItem.title}</b>
                      {audioMap[missionItem.id] || !noVoice ? (
                        <button
                          type="button"
                          className="eq-btn eq-btn-ghost eq-btn-sm"
                          onClick={() => {
                            if (playingReview === missionItem.id) {
                              stopAllGameAudio();
                              setPlayingReview(null);
                              return;
                            }
                            setPlayingReview(missionItem.id);
                            setAudioNotice("");
                            playDialogueOrSpeak({
                              mp3Url: audioMap[missionItem.id],
                              lines: missionItem.lines,
                              lineStarts: lineStarts[missionItem.id],
                              rate: 1,
                              onEnded: () => setPlayingReview(null),
                              onError: () => {
                                setPlayingReview(null);
                                setAudioNotice("Le message audio est indisponible. Sa transcription est disponible dans le bilan.");
                              },
                            });
                          }}
                        >
                          {playingReview === missionItem.id ? "Arrêter" : "Réécouter"}
                        </button>
                      ) : null}
                    </div>
                    <div className="eq-echo-transcript" lang="en">
                      {missionItem.lines.map((line, index) => (
                        <p key={`${line.speaker}-${index}`}>
                          <b>{line.speaker} :</b> {line.text}
                        </p>
                      ))}
                    </div>
                    {scenarioLogs.map((logItem) => (
                      <div key={logItem.prompt} className={`eq-echo-review-q ${logItem.correct ? "is-right" : "is-wrong"}`}>
                        <p>
                          <b>{logItem.prompt}</b>
                        </p>
                        {logItem.correct ? (
                          <p>Ta réponse : {logItem.expected} ✓</p>
                        ) : (
                          <p>
                            Ta réponse : <s>{logItem.chosen}</s> · Bonne réponse : <b>{logItem.expected}</b>
                          </p>
                        )}
                        <p className="eq-echo-review-why">{logItem.explanation}</p>
                      </div>
                    ))}
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
  const isLastQuestion = clipIndex + 1 >= missions.length && qIndex + 1 >= currentMission.questions.length;

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quitToStart}>
        <HudStat label="Message" value={`${clipIndex + 1} / ${missions.length}`} />
        <HudStat label="Question" value={`${globalQuestionIndex + 1} / ${totalQuestions}`} />
        <HudStat label="Score" value={score} tone="gold" />
        <HudStat label="Série" value={streak} tone={streak >= 3 ? "mint" : undefined} />
      </GameHud>

      <div className={`eq-game-stage eq-echo-stage ${phase === "feedback" ? (lastAnswerCorrect ? "is-right" : "is-wrong") : ""}`}>
        {audioNotice && <p className="eq-game-notice" role="status">{audioNotice}</p>}
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
            <p className="eq-echo-speaker">
              À l&apos;antenne : <b>{currentMission.lines[activeSpeakerIndex].speaker}</b>
            </p>
          ) : null}

          {!silentMode ? (
            <div className="eq-echo-controls">
              <button
                type="button"
                data-testid="echo-play-btn"
                onClick={togglePlay}
                disabled={!isPlayingAudio && replaysLeft <= 0}
                className="eq-btn eq-btn-primary eq-btn-sm"
              >
                {isPlayingAudio
                  ? "Arrêter"
                  : playsUsed === 0
                    ? "Écouter le message"
                  : replaysLeft > 0
                    ? `Réécouter (${replaysLeft} restante${replaysLeft > 1 ? "s" : ""})`
                    : "Écoutes utilisées"}
              </button>
              {diffConfig.allowSlowSpeed ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextRate = speedRate === 1 ? 0.8 : 1;
                    setSpeedRate(nextRate);
                    if (isPlayingAudio && !setRecordingRate(nextRate)) playScenario(currentMission, nextRate);
                  }}
                  className="eq-btn eq-btn-ghost eq-btn-sm"
                  aria-pressed={speedRate !== 1}
                >
                  {speedRate === 1 ? "Vitesse normale" : "Vitesse lente"}
                </button>
              ) : null}
              {phase === "playing" && (
                <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" onClick={() => {
                  stopScenario();
                  setTextScenario(currentMission.id);
                  setAudioNotice("");
                }}>Lire ce message</button>
              )}
            </div>
          ) : null}

          {silentMode || showTranscript ? (
            <div className="eq-echo-transcript" lang="en">
              {currentMission.lines.map((line, index) => (
                <p key={`${line.speaker}-${index}`} className={activeSpeakerIndex === index ? "is-active-line" : ""}>
                  <b>{line.speaker} :</b> {line.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">Le texte du message s&apos;affichera après sa 2e question.</p>
          )}
        </div>

        <div className="eq-echo-question">
          <p className="text-balance text-base font-bold sm:text-lg">{currentQuestion.prompt.replace(/ \?$/, "\u202f?")}</p>
          <div className="eq-game-choices">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedChoice === idx;
              const isRight = idx === currentQuestion.correctIndex;
              const stateClass = phase === "feedback" ? (isRight ? "is-correct" : isSelected ? "is-wrong" : "is-dim") : "";
              return (
                <button
                  key={option}
                  type="button"
                  data-testid="game-choice"
                  disabled={phase !== "playing" || (!silentMode && (playsUsed === 0 || isPlayingAudio))}
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
          <div
            ref={feedbackRef}
            className={`eq-spell-feedback ${lastAnswerCorrect ? "is-right" : "is-wrong"}`}
            role="status"
          >
            <p className="eq-spell-feedback-title">{lastAnswerCorrect ? "Bien capté !" : "Pas cette fois."}</p>
            <p>{currentQuestion.explanation}</p>
            <div className="eq-spell-controls">
              <button ref={continueRef} type="button" onClick={moveNext} className="eq-btn eq-btn-primary" data-testid="echo-continue">
                {isLastQuestion ? "Voir le bilan" : "Continuer"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
