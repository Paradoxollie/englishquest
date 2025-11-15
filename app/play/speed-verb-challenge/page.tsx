"use client";

/**
 * Speed Verb Challenge Game Page
 * 
 * A fast-paced game where players must quickly conjugate English irregular verbs.
 * Professional gaming app style with Marvel/comic book visual effects.
 * 
 * TODO: Future integration points:
 * - When game ends, call a server action to save the game_score to Supabase
 * - Read user profile (xp, gold, level) from Supabase to display in header
 * - Update user XP/gold based on final score
 * - Track daily streaks in the database
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  type GameState,
  type AnswerPayload,
  type Difficulty,
  VERBS,
  createInitialGameState,
  startNewRound,
  submitAnswer,
  tickTimer,
  setDifficulty,
} from "@/lib/games/speed-verb-challenge";
import {
  LightningIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  BookOpenIcon,
  TrophyIcon,
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { SpeedVerbLeaderboard } from "./leaderboard";
import { submitSpeedVerbScore } from "./actions";
import { TopScoresDisplay } from "./top-scores-display";

interface SessionStats {
  totalCorrect: number;
  totalAttempts: number;
  bestStreak: number;
}

interface MissedVerb {
  base: string;
  pastSimple: string[];
  pastParticiple: string[];
  translations: string[];
  required: {
    pastSimple: boolean;
    pastParticiple: boolean;
    translation: boolean;
  };
  reason: "incorrect" | "skipped";
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Facile",
  2: "Moyen",
  3: "Difficile",
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  1: "Past Simple uniquement",
  2: "Past Simple + Past Participle",
  3: "Past Simple + Past Participle + Traduction",
};

export default function SpeedVerbChallengePage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalCorrect: 0,
    totalAttempts: 0,
    bestStreak: 0,
  });
  const [missedVerbs, setMissedVerbs] = useState<MissedVerb[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(1);
  const [answer, setAnswer] = useState<AnswerPayload>({
    pastSimple: "",
    pastParticiple: "",
    translation: "",
  });
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
    correctAnswers?: {
      pastSimple?: string[];
      pastParticiple?: string[];
      translation?: string[];
    };
  } | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [showFeedbackAnimation, setShowFeedbackAnimation] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    isNewPersonalBest?: boolean;
    isNewGlobalBest?: boolean;
    personalBest?: number;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const gameStartTimeRef = useRef<number | null>(null);

  // Initialize game state
  const initializeGame = useCallback(() => {
    const config = {
      totalTimeMs: 90_000, // 90 seconds
      difficulty: selectedDifficulty,
      allowImmediateRepeat: false,
    };
    const initialState = createInitialGameState(VERBS, config);
    setGameState(initialState);
    setAnswer({ pastSimple: "", pastParticiple: "", translation: "" });
    setFeedback(null);
    setIsGameStarted(false);
    setIsGameEnded(false);
    setSessionStats({ totalCorrect: 0, totalAttempts: 0, bestStreak: 0 });
    setMissedVerbs([]);
    setShowFeedbackAnimation(false);
  }, [selectedDifficulty]);

  // Start the game
  const startGame = useCallback(() => {
    if (!gameState) return;
    const now = Date.now();
    const newState = startNewRound(gameState, now);
    setGameState(newState);
    setIsGameStarted(true);
    setIsGameEnded(false);
    setScoreSubmitted(false);
    setSubmissionError(null);
    setSessionStats({ totalCorrect: 0, totalAttempts: 0, bestStreak: 0 });
    setMissedVerbs([]);
    setAnswer({ pastSimple: "", pastParticiple: "", translation: "" });
    setFeedback(null);
    lastTickRef.current = now;
    gameStartTimeRef.current = now;
  }, [gameState]);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!gameState || !gameState.currentRound || gameState.ended) return;

    const { state: newState, result } = submitAnswer(gameState, answer);

    // Update session stats
    setSessionStats((prev) => ({
      totalCorrect: prev.totalCorrect + (result.isCorrect ? 1 : 0),
      totalAttempts: prev.totalAttempts + 1,
      bestStreak: Math.max(prev.bestStreak, result.streakAfter),
    }));

    setGameState(newState);
    setShowFeedbackAnimation(true);

    // Show feedback
    if (result.isCorrect) {
      const message = `+${result.pointsAwarded} points • Série: ${result.streakAfter}`;
      setFeedback({
        show: true,
        isCorrect: true,
        message,
      });
    } else {
      // Show correct answers when wrong
      const verb = gameState.currentRound.currentVerb;
      const required = gameState.currentRound.required;
      const correctAnswers: {
        pastSimple?: string[];
        pastParticiple?: string[];
        translation?: string[];
      } = {};

      if (required.pastSimple) {
        correctAnswers.pastSimple = verb.pastSimple;
      }
      if (required.pastParticiple) {
        correctAnswers.pastParticiple = verb.pastParticiple;
      }
      if (required.translation) {
        correctAnswers.translation = verb.translations;
      }

      setFeedback({
        show: true,
        isCorrect: false,
        message: "Réponse incorrecte",
        correctAnswers,
      });

      // Track missed verb
      setMissedVerbs((prev) => [
        ...prev,
        {
          base: verb.base,
          pastSimple: verb.pastSimple,
          pastParticiple: verb.pastParticiple,
          translations: verb.translations,
          required,
          reason: "incorrect",
        },
      ]);
    }

    // Clear answer inputs
    setAnswer({ pastSimple: "", pastParticiple: "", translation: "" });

    // Auto-advance to next round after a short delay
    setTimeout(() => {
      setFeedback(null);
      setShowFeedbackAnimation(false);
      if (!newState.ended && newState.currentRound) {
        const now = Date.now();
        const nextState = startNewRound(newState, now);
        setGameState(nextState);
      } else if (newState.ended) {
        setIsGameEnded(true);
      }
    }, 2000);
  }, [gameState, answer]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!gameState || !gameState.currentRound || gameState.ended) return;
    
    // Show correct answers when skipping
    const verb = gameState.currentRound.currentVerb;
    const required = gameState.currentRound.required;
    const correctAnswers: {
      pastSimple?: string[];
      pastParticiple?: string[];
      translation?: string[];
    } = {};

    if (required.pastSimple) {
      correctAnswers.pastSimple = verb.pastSimple;
    }
    if (required.pastParticiple) {
      correctAnswers.pastParticiple = verb.pastParticiple;
    }
    if (required.translation) {
      correctAnswers.translation = verb.translations;
    }

    setFeedback({
      show: true,
      isCorrect: false,
      message: "Mot passé. Voici les bonnes réponses:",
      correctAnswers,
    });
    setShowFeedbackAnimation(true);

    // Track missed verb
    setMissedVerbs((prev) => [
      ...prev,
      {
        base: verb.base,
        pastSimple: verb.pastSimple,
        pastParticiple: verb.pastParticiple,
        translations: verb.translations,
        required,
        reason: "skipped",
      },
    ]);

    // Clear answer inputs
    setAnswer({ pastSimple: "", pastParticiple: "", translation: "" });

    // Auto-advance to next round after a short delay
    setTimeout(() => {
      setFeedback(null);
      setShowFeedbackAnimation(false);
      const now = Date.now();
      const nextState = startNewRound(gameState, now);
      setGameState(nextState);
    }, 2000);
  }, [gameState]);

  // Timer tick
  useEffect(() => {
    if (!isGameStarted || !gameState || gameState.ended) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setGameState((prev) => {
        if (!prev) return prev;
        const updated = tickTimer(prev, delta);
        if (updated.ended && !isGameEnded) {
          setIsGameEnded(true);
        }
        return updated;
      });
    }, 100); // Update every 100ms for smooth countdown

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isGameStarted, gameState, isGameEnded]);

  // Initialize on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Submit score when game ends
  useEffect(() => {
    async function handleGameEnd() {
      if (!isGameEnded || !gameState || !user || scoreSubmitted) {
        return;
      }

      // Calculate game duration
      const durationMs = gameStartTimeRef.current
        ? Date.now() - gameStartTimeRef.current
        : 0;

      // Submit the score
      try {
        const result = await submitSpeedVerbScore({
          difficulty: selectedDifficulty,
          correctCount: gameState.roundsCompleted,
          totalRounds: sessionStats.totalAttempts,
          durationMs: durationMs,
        });

        if (result.success) {
          setScoreSubmitted(true);
          setSubmissionResult({
            isNewPersonalBest: result.isNewPersonalBest,
            isNewGlobalBest: result.isNewGlobalBest,
            personalBest: result.personalBest,
          });
          console.log("Score submitted successfully:", result.rewards);
        } else {
          setSubmissionError(result.error || "Erreur lors de la sauvegarde");
          console.error("Error submitting score:", result.error);
        }
      } catch (error) {
        setSubmissionError("Erreur lors de la sauvegarde du score");
        console.error("Error submitting score:", error);
      }
    }

    handleGameEnd();
  }, [isGameEnded, gameState, user, scoreSubmitted, selectedDifficulty, sessionStats.totalAttempts]);

  // Handle difficulty change
  const handleDifficultyChange = useCallback(
    (difficulty: Difficulty) => {
      setSelectedDifficulty(difficulty);
      if (gameState) {
        const updated = setDifficulty(gameState, difficulty);
        setGameState(updated);
      }
    },
    [gameState]
  );

  // Format time display
  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Calculate time percentage
  const timePercentage = gameState
    ? (gameState.timeLeftMs / gameState.config.totalTimeMs) * 100
    : 100;

  const currentRound = gameState?.currentRound;
  const required = currentRound?.required;
  const isTimeLow = gameState && gameState.timeLeftMs < 10000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="comic-panel-dark p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="comic-panel bg-gradient-to-br from-amber-600 to-yellow-600 border-2 border-black p-3">
                <LightningIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-outline">
                  Speed Verb Challenge
                </h1>
                <p className="text-slate-300 text-outline">
                  Conjuguez les verbes irréguliers anglais le plus rapidement possible!
                </p>
              </div>
            </div>
            <Link
              href="/play"
              className="comic-button bg-slate-700 text-white px-4 py-2 font-bold hover:bg-slate-600 text-outline"
            >
              ← Retour
            </Link>
          </div>
        </motion.div>

        {/* Game Rules */}
        <AnimatePresence>
          {!isGameStarted && !isGameEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="comic-panel-dark p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black p-3">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4 text-outline">Règles du jeu</h2>
                  <ul className="space-y-3 text-slate-300 text-outline">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>Vous avez 90 secondes pour répondre au maximum de questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>
                        Selon la difficulté, vous devez conjuguer le verbe au Past Simple, Past
                        Participle, et/ou donner la traduction
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>Plus votre série (streak) est longue, plus vous gagnez de points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>Les réponses correctes augmentent votre score et votre série</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>Une réponse incorrecte remet votre série à zéro</span>
                    </li>
                  </ul>
                </div>
              </div>

            {/* Difficulty Selection */}
            <div className="mt-8">
              <label className="block text-white font-bold mb-4 text-outline text-lg">
                Choisissez la difficulté:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([1, 2, 3] as Difficulty[]).map((diff) => (
                  <motion.button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`comic-button p-4 font-bold text-outline text-left ${
                      selectedDifficulty === diff
                        ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white border-4 border-black"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{DIFFICULTY_LABELS[diff]}</span>
                      {selectedDifficulty === diff && (
                        <CheckCircleIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="block text-sm opacity-90 mt-1">
                      {DIFFICULTY_DESCRIPTIONS[diff]}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Top Scores Display */}
            <div className="mt-8">
              <TopScoresDisplay 
                selectedDifficulty={selectedDifficulty === 1 ? "easy" : selectedDifficulty === 2 ? "medium" : "hard"}
              />
            </div>

            {/* Start Button */}
            <div className="mt-8 flex justify-center">
                <motion.button
                  onClick={startGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="comic-button bg-gradient-to-r from-emerald-600 to-green-600 text-white px-12 py-4 text-xl font-bold hover:from-emerald-700 hover:to-green-700 text-outline animate-comic-glow"
                >
                  <span className="flex items-center gap-2">
                    <LightningIcon className="w-6 h-6" />
                    Commencer le jeu
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Stats Bar */}
        <AnimatePresence>
          {isGameStarted && gameState && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="comic-panel-dark p-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <motion.div
                  className="comic-panel bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-black p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-xs text-white/80 mb-1 text-outline font-semibold">SCORE</div>
                  <div className="text-3xl font-bold text-white text-outline">{gameState.score}</div>
                </motion.div>
                <motion.div
                  className="comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center gap-1 text-xs text-white/80 mb-1 text-outline font-semibold">
                    <FireIcon className="w-3 h-3" />
                    SÉRIE
                  </div>
                  <div className="text-3xl font-bold text-white text-outline">
                    {gameState.streak}
                  </div>
                </motion.div>
                <motion.div
                  className="comic-panel bg-gradient-to-br from-pink-600 to-rose-600 border-2 border-black p-4 text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center gap-1 text-xs text-white/80 mb-1 text-outline font-semibold">
                    <StarIcon className="w-3 h-3" />
                    COMBO
                  </div>
                  <div className="text-3xl font-bold text-white text-outline">
                    {gameState.comboMultiplier.toFixed(1)}x
                  </div>
                </motion.div>
                <motion.div
                  className={`comic-panel border-2 border-black p-4 text-center ${
                    isTimeLow
                      ? "bg-gradient-to-br from-red-600 to-orange-600 animate-comic-flash"
                      : "bg-gradient-to-br from-amber-600 to-yellow-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center gap-1 text-xs text-white/80 mb-1 text-outline font-semibold">
                    <ClockIcon className="w-3 h-3" />
                    TEMPS
                  </div>
                  <div className="text-3xl font-bold text-white text-outline">
                    {formatTime(gameState.timeLeftMs)}
                  </div>
                </motion.div>
              </div>

              {/* Timer Bar */}
              <div className="comic-panel bg-slate-800 border-2 border-black h-4 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    isTimeLow
                      ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-600"
                      : "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"
                  }`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${timePercentage}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  style={{
                    boxShadow: isTimeLow
                      ? "0 0 10px rgba(239, 68, 68, 0.8)"
                      : "0 0 5px rgba(6, 182, 212, 0.5)",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {isGameStarted && currentRound && !isGameEnded && (
            <motion.div
              key={currentRound.currentVerb.base}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3 }}
              className="comic-panel-dark p-8 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)",
              }}
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <motion.div
                    className="comic-panel bg-gradient-to-br from-amber-500 to-yellow-500 border-4 border-black p-6 inline-block mb-4 shadow-lg"
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      boxShadow: "0 8px 0 0 #000, 0 12px 24px rgba(234, 179, 8, 0.4)",
                    }}
                  >
                    <BookOpenIcon className="w-12 h-12 text-white mx-auto" />
                  </motion.div>
                  <motion.h2
                    className="text-5xl md:text-6xl font-bold mb-3 text-white text-outline"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {currentRound.currentVerb.base}
                  </motion.h2>
                  <p className="text-cyan-300 text-lg font-semibold text-outline">
                    Conjuguez ce verbe au temps demandé
                  </p>
                </div>

                {/* Answer Inputs */}
                <div className="space-y-5 max-w-2xl mx-auto">
                {required?.pastSimple && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="flex items-center gap-2 text-cyan-300 font-bold mb-2 text-outline text-lg">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      Past Simple:
                    </label>
                    <input
                      type="text"
                      value={answer.pastSimple || ""}
                      onChange={(e) =>
                        setAnswer((prev) => ({ ...prev, pastSimple: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !required.pastParticiple && !required.translation) {
                          handleSubmit();
                        }
                      }}
                      className="w-full comic-panel border-3 border-black px-5 py-4 text-white text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-cyan-500/50 text-outline transition-all"
                      style={{
                        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
                        borderColor: "#06b6d4",
                      }}
                      placeholder="Entrez le Past Simple"
                      autoFocus
                    />
                  </motion.div>
                )}

                {required?.pastParticiple && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="flex items-center gap-2 text-purple-300 font-bold mb-2 text-outline text-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      Past Participle:
                    </label>
                    <input
                      type="text"
                      value={answer.pastParticiple || ""}
                      onChange={(e) =>
                        setAnswer((prev) => ({ ...prev, pastParticiple: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !required.translation) {
                          handleSubmit();
                        }
                      }}
                      className="w-full comic-panel border-3 border-black px-5 py-4 text-white text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-outline transition-all"
                      style={{
                        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                        borderColor: "#a855f7",
                      }}
                      placeholder="Entrez le Past Participle"
                    />
                  </motion.div>
                )}

                {required?.translation && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="flex items-center gap-2 text-pink-300 font-bold mb-2 text-outline text-lg">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                      Traduction (français):
                    </label>
                    <input
                      type="text"
                      value={answer.translation || ""}
                      onChange={(e) =>
                        setAnswer((prev) => ({ ...prev, translation: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit();
                        }
                      }}
                      className="w-full comic-panel border-3 border-black px-5 py-4 text-white text-xl font-semibold focus:outline-none focus:ring-4 focus:ring-pink-500/50 text-outline transition-all"
                      style={{
                        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)",
                        borderColor: "#ec4899",
                      }}
                      placeholder="Entrez la traduction"
                    />
                  </motion.div>
                )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 comic-button text-white px-6 py-4 text-lg font-bold text-outline border-4 border-black"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
                      boxShadow: "0 6px 0 0 #000, 0 10px 20px rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      Valider
                    </span>
                  </motion.button>
                  <motion.button
                    onClick={handleSkip}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="comic-button text-white px-6 py-4 font-bold text-outline border-4 border-black"
                    style={{
                      background: "linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)",
                      boxShadow: "0 6px 0 0 #000, 0 10px 20px rgba(100, 116, 139, 0.3)",
                    }}
                  >
                    Passer →
                  </motion.button>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback?.show && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`mt-8 comic-panel border-4 border-black p-6 ${
                        feedback.isCorrect
                          ? "bg-gradient-to-br from-emerald-600 to-green-600 text-white animate-comic-pulse-success"
                          : "bg-gradient-to-br from-red-600 to-rose-600 text-white animate-comic-shake"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {feedback.isCorrect ? (
                          <CheckCircleIcon className="w-8 h-8" />
                        ) : (
                          <XCircleIcon className="w-8 h-8" />
                        )}
                        <div className="text-center font-bold text-xl text-outline">
                          {feedback.message}
                        </div>
                      </div>
                      {!feedback.isCorrect && feedback.correctAnswers && (
                        <div className="space-y-3 text-left mt-4">
                          {feedback.correctAnswers.pastSimple && (
                            <div className="comic-panel bg-black/30 border-2 border-black p-3">
                              <div className="text-sm font-semibold mb-1 text-outline">Past Simple:</div>
                              <div className="text-lg font-bold text-outline">
                                {feedback.correctAnswers.pastSimple.join(", ")}
                              </div>
                            </div>
                          )}
                          {feedback.correctAnswers.pastParticiple && (
                            <div className="comic-panel bg-black/30 border-2 border-black p-3">
                              <div className="text-sm font-semibold mb-1 text-outline">
                                Past Participle:
                              </div>
                              <div className="text-lg font-bold text-outline">
                                {feedback.correctAnswers.pastParticiple.join(", ")}
                              </div>
                            </div>
                          )}
                          {feedback.correctAnswers.translation && (
                            <div className="comic-panel bg-black/30 border-2 border-black p-3">
                              <div className="text-sm font-semibold mb-1 text-outline">Traduction:</div>
                              <div className="text-lg font-bold text-outline">
                                {feedback.correctAnswers.translation.join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Screen */}
        <AnimatePresence>
          {isGameEnded && gameState && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header with Trophy */}
              <div className="comic-panel-dark p-10 text-center">
                <motion.div
                  className="comic-panel bg-gradient-to-br from-amber-600 to-yellow-600 border-4 border-black p-6 inline-block mb-6"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <TrophyIcon className="w-16 h-16 text-white mx-auto" />
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-6 text-outline">Partie terminée!</h2>
                <div className="space-y-3 mb-8">
                  <div className="text-2xl text-slate-300 text-outline">
                    Score final:{" "}
                    <span className="font-bold text-white text-3xl">{gameState.score}</span>
                  </div>
                  <div className="text-xl text-slate-300 text-outline">
                    Rondes complétées:{" "}
                    <span className="font-bold text-white">{gameState.roundsCompleted}</span>
                  </div>
                  <div className="text-xl text-slate-300 text-outline">
                    Meilleure série:{" "}
                    <span className="font-bold text-cyan-400 text-2xl">
                      {gameState.highestStreak}
                    </span>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="comic-panel bg-slate-800 border-3 border-black p-6 mb-8 max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-white mb-4 text-outline">
                    Statistiques de session
                  </h3>
                  <div className="space-y-3 text-slate-300 text-outline">
                    <div className="flex justify-between items-center">
                      <span>Réponses correctes:</span>
                      <span className="font-bold text-white text-lg">
                        {sessionStats.totalCorrect} / {sessionStats.totalAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Meilleure série:</span>
                      <span className="font-bold text-cyan-400 text-lg">{sessionStats.bestStreak}</span>
                    </div>
                  </div>
                  {!user && (
                    <p className="text-sm text-amber-300 mt-4 text-outline">
                      💡 Connectez-vous pour sauvegarder votre XP et votre or dans le futur.
                    </p>
                  )}
                  {user && (
                    <div className="mt-4">
                      {scoreSubmitted ? (
                        <div className="space-y-2">
                          <p className="text-sm text-emerald-300 text-outline">
                            ✅ Score sauvegardé avec succès!
                          </p>
                          {submissionResult?.isNewPersonalBest && (
                            <p className="text-sm text-cyan-300 text-outline font-bold">
                              🎉 Nouveau record personnel!
                            </p>
                          )}
                          {submissionResult?.isNewGlobalBest && (
                            <p className="text-sm text-amber-300 text-outline font-bold">
                              🏆 Nouveau record global!
                            </p>
                          )}
                        </div>
                      ) : submissionError ? (
                        <p className="text-sm text-red-300 text-outline">
                          ❌ {submissionError}
                        </p>
                      ) : (
                        <p className="text-sm text-amber-300 text-outline">
                          ⏳ Sauvegarde en cours...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Scores Display */}
              {user && (
                <div className="comic-panel-dark p-6">
                  <TopScoresDisplay 
                    selectedDifficulty={selectedDifficulty === 1 ? "easy" : selectedDifficulty === 2 ? "medium" : "hard"}
                    currentScore={gameState.roundsCompleted}
                  />
                </div>
              )}

              {/* Missed Verbs Section */}
              {missedVerbs.length > 0 && (
                <div className="comic-panel-dark p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 text-outline text-center">
                    Mots à revoir ({missedVerbs.length})
                  </h3>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {missedVerbs.map((verb, index) => (
                      <motion.div
                        key={`${verb.base}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="comic-panel bg-slate-800 border-3 border-black p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-2xl font-bold text-white mb-2 text-outline">
                              {verb.base}
                            </h4>
                            <span
                              className={`comic-panel px-3 py-1 text-xs font-bold text-white text-outline ${
                                verb.reason === "incorrect"
                                  ? "bg-red-600"
                                  : "bg-amber-600"
                              }`}
                            >
                              {verb.reason === "incorrect" ? "❌ Incorrect" : "⏭️ Passé"}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {verb.required.pastSimple && (
                            <div className="comic-panel bg-cyan-900/30 border-2 border-cyan-600 p-3">
                              <div className="text-xs font-semibold text-cyan-300 mb-1 text-outline">
                                Past Simple:
                              </div>
                              <div className="text-base font-bold text-white text-outline">
                                {verb.pastSimple.join(", ")}
                              </div>
                            </div>
                          )}
                          {verb.required.pastParticiple && (
                            <div className="comic-panel bg-purple-900/30 border-2 border-purple-600 p-3">
                              <div className="text-xs font-semibold text-purple-300 mb-1 text-outline">
                                Past Participle:
                              </div>
                              <div className="text-base font-bold text-white text-outline">
                                {verb.pastParticiple.join(", ")}
                              </div>
                            </div>
                          )}
                          {verb.required.translation && (
                            <div className="comic-panel bg-pink-900/30 border-2 border-pink-600 p-3">
                              <div className="text-xs font-semibold text-pink-300 mb-1 text-outline">
                                Traduction:
                              </div>
                              <div className="text-base font-bold text-white text-outline">
                                {verb.translations.join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="comic-panel-dark p-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <motion.button
                    onClick={() => {
                      initializeGame();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="comic-button bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 text-lg font-bold hover:from-cyan-700 hover:to-blue-700 text-outline"
                  >
                    Rejouer
                  </motion.button>
                  <Link
                    href="/play"
                    className="comic-button bg-slate-700 text-white px-8 py-4 text-lg font-bold hover:bg-slate-600 text-outline"
                  >
                    Retour aux jeux
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Stats (during game) */}
        {isGameStarted && !isGameEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="comic-panel-dark p-4"
          >
            <h3 className="text-sm font-bold text-white mb-3 text-outline">
              Statistiques de session
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm text-slate-300 text-outline">
              <div>
                Correctes: <span className="font-bold text-white">{sessionStats.totalCorrect}</span>
              </div>
              <div>
                Tentatives: <span className="font-bold text-white">{sessionStats.totalAttempts}</span>
              </div>
              <div>
                Meilleure série:{" "}
                <span className="font-bold text-cyan-400">{sessionStats.bestStreak}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
