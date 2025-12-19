"use client";

/**
 * Enigma Scroll Game Page
 * 
 * A Wordle-style word-guessing game where players must guess a secret word
 * within a limited number of attempts. Professional gaming app style with
 * Marvel/comic book visual effects.
 * 
 * TODO: Future integration points:
 * - When game ends (win or loss), call a server action to save the game_score to Supabase
 * - Read user profile (xp, gold, level) from Supabase to display in header
 * - Update user XP/gold based on final score and words found
 * - Track daily streaks in the database
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { TouchEvent, MouseEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  type GameState,
  type Row,
  type LetterStatus,
  createRandomGameState,
  submitGuess,
  addLetterToCurrentGuess,
  removeLetterFromCurrentGuess,
  resetForNewRandomWord,
  getCurrentGuess,
  initializeWordLists,
} from "@/lib/games/enigma-scroll";
import {
  loadAndFilterWordLists,
  validateWordLists,
} from "@/lib/games/enigma-scroll-words";
import wordListsData from "@/lib/games/words/enigma-scroll-words.json";
import {
  FireIcon,
  TrophyIcon,
  ClockIcon,
  StarIcon,
  BookOpenIcon,
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { submitEnigmaScrollScore } from "./actions";
import { TopScoresDisplay } from "./top-scores-display";
import { mapWordLengthToDifficulty } from "@/lib/profile/enigma-scroll-rewards";

interface SessionStats {
  totalGamesPlayed: number;
  totalWins: number;
  bestStreak: number;
  totalWordsFound: number;
}

type Difficulty = 4 | 5 | 6;

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  4: "4 Lettres",
  5: "5 Lettres",
  6: "6 Lettres",
};

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  4: "5 tentatives",
  5: "6 tentatives",
  6: "7 tentatives",
};

export default function EnigmaScrollPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(5);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalGamesPlayed: 0,
    totalWins: 0,
    bestStreak: 0,
    totalWordsFound: 0,
  });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [wordListsLoaded, setWordListsLoaded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showStreakNotification, setShowStreakNotification] = useState(false);
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    success: boolean;
    rewards?: { xpEarned: number; goldEarned: number; newLevel?: number };
    error?: string;
  } | null>(null);
  const gameStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);
  const touchHandledRef = useRef(false);
  const { user } = useAuth();

  // Load word lists on mount
  useEffect(() => {
    try {
      const wordLists = loadAndFilterWordLists(
        wordListsData.targetWords,
        wordListsData.validGuesses
      );
      
      // Use targetWords for validGuesses if empty
      for (const length of [4, 5, 6]) {
        if (!wordLists.validGuesses[length] || wordLists.validGuesses[length].length === 0) {
          wordLists.validGuesses[length] = [...wordLists.targetWords[length]];
        }
      }

      const validation = validateWordLists(wordLists);
      if (!validation.valid) {
        console.error("Word lists validation failed:", validation.errors);
        // Continue anyway with fallback
      }

      initializeWordLists(wordLists);
      setWordListsLoaded(true);
    } catch (error) {
      console.error("Failed to load word lists:", error);
      // Continue with default lists
      setWordListsLoaded(true);
    }
  }, []);

  // Initialize game
  const initializeGame = useCallback((difficulty: Difficulty) => {
    const newGame = createRandomGameState(difficulty);
    setGameState(newGame);
    setTimeRemaining(90);
    setIsTimerRunning(false);
    setErrorMessage(null);
    setShowGameOver(false);
    setIsGameStarted(false);
    setScoreSubmitted(false);
    setSaveStatus(null);
    gameStartTimeRef.current = null;
  }, []);

  // Start the game
  const startGame = useCallback(() => {
    if (!gameState) return;
    setIsGameStarted(true);
    setIsTimerRunning(true);
    setShowGameOver(false);
    setErrorMessage(null);
    setTimeRemaining(90);
    setScoreSubmitted(false);
    setSaveStatus(null);
    gameStartTimeRef.current = Date.now();
  }, [gameState]);

  // Handle letter input
  const handleLetterInput = useCallback(
    (letter: string) => {
      if (!gameState || gameState.isFinished || !isGameStarted) return;
      setGameState((prev) =>
        prev ? addLetterToCurrentGuess(prev, letter) : null
      );
      setErrorMessage(null);
    },
    [gameState, isGameStarted]
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (!gameState || gameState.isFinished || !isGameStarted) return;
    setGameState((prev) =>
      prev ? removeLetterFromCurrentGuess(prev) : null
    );
    setErrorMessage(null);
  }, [gameState, isGameStarted]);

  // Handle guess submission
  const handleSubmitGuess = useCallback(() => {
    if (!gameState || gameState.isFinished || !isGameStarted) return;

    const currentGuess = getCurrentGuess(gameState);

    if (currentGuess.length !== gameState.config.wordLength) {
      setErrorMessage("Mot incomplet");
      return;
    }

    const { state: newState, result } = submitGuess(
      gameState,
      currentGuess,
      timeRemaining
    );

    if (!result.isValid) {
      setErrorMessage(result.errorMessage || "Mot invalide");
      // Shake animation for error
      setShakeRow(gameState.currentAttemptIndex);
      setTimeout(() => setShakeRow(null), 600);
      return;
    }

    setGameState(newState);
    setErrorMessage(null);

    // Update session stats
    const prevStats = sessionStats;
    setSessionStats((prev) => ({
      totalGamesPlayed: prev.totalGamesPlayed + 1,
      totalWins: prev.totalWins + (result.isWin ? 1 : 0),
      bestStreak: Math.max(prev.bestStreak, newState.bestStreak),
      totalWordsFound: newState.wordsFound,
    }));

    // 🎉 CELEBRATION & ADDICTIVE FEATURES
    if (result.isWin) {
      // Store points earned for celebration display
      setLastPointsEarned(result.pointsEarned);
      
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      // Create particle explosion
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: particleIdRef.current++,
        x: 50 + Math.random() * 20 - 10,
        y: 50 + Math.random() * 20 - 10,
        delay: i * 0.05,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 2000);

      // Check for streak milestones
      if (newState.currentStreak > prevStats.bestStreak && newState.currentStreak % 5 === 0) {
        setShowStreakNotification(true);
        setTimeout(() => setShowStreakNotification(false), 3000);
      }

      // Check for achievements
      const newAchievements = new Set(achievements);
      if (newState.wordsFound === 10 && !newAchievements.has('first-10')) {
        newAchievements.add('first-10');
      }
      if (newState.wordsFound === 50 && !newAchievements.has('word-master')) {
        newAchievements.add('word-master');
      }
      if (newState.currentStreak === 10 && !newAchievements.has('streak-10')) {
        newAchievements.add('streak-10');
      }
      if (newState.currentStreak === 25 && !newAchievements.has('streak-25')) {
        newAchievements.add('streak-25');
      }
      if (result.pointsEarned >= 100 && !newAchievements.has('high-score')) {
        newAchievements.add('high-score');
      }
      setAchievements(newAchievements);
    }

    if (result.isGameOver) {
      setIsTimerRunning(false);
      setShowGameOver(true);
    }
  }, [gameState, timeRemaining, isGameStarted, sessionStats, achievements]);

  // Handle touch input (mobile) - prevents double input
  const handleTouchInput = useCallback(
    (letter: string, e: TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      touchHandledRef.current = true;
      handleLetterInput(letter);
      // Reset flag after a short delay to allow next touch
      setTimeout(() => {
        touchHandledRef.current = false;
      }, 300);
    },
    [handleLetterInput]
  );

  // Handle click input (desktop) - only if not from touch
  const handleClickInput = useCallback(
    (letter: string, e: MouseEvent<HTMLButtonElement>) => {
      // Ignore click if it was triggered by a touch event
      if (touchHandledRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      handleLetterInput(letter);
    },
    [handleLetterInput]
  );

  // Handle touch submit (mobile) - prevents double submit
  const handleTouchSubmit = useCallback(
    (e: TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      touchHandledRef.current = true;
      handleSubmitGuess();
      setTimeout(() => {
        touchHandledRef.current = false;
      }, 300);
    },
    [handleSubmitGuess]
  );

  // Handle click submit (desktop) - only if not from touch
  const handleClickSubmit = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (touchHandledRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      handleSubmitGuess();
    },
    [handleSubmitGuess]
  );

  // Handle touch backspace (mobile) - prevents double backspace
  const handleTouchBackspace = useCallback(
    (e: TouchEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      touchHandledRef.current = true;
      handleBackspace();
      setTimeout(() => {
        touchHandledRef.current = false;
      }, 300);
    },
    [handleBackspace]
  );

  // Handle click backspace (desktop) - only if not from touch
  const handleClickBackspace = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (touchHandledRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      handleBackspace();
    },
    [handleBackspace]
  );

  // Submit score when game ends
  useEffect(() => {
    async function handleGameEnd() {
      if (!gameState?.isFinished || !user || scoreSubmitted || !gameStartTimeRef.current) {
        return;
      }

      setScoreSubmitted(true);
      
      const durationMs = Date.now() - gameStartTimeRef.current;
      
      try {
        const result = await submitEnigmaScrollScore({
          wordLength: gameState.config.wordLength as 4 | 5 | 6,
          totalScore: gameState.totalScore,
          wordsFound: gameState.wordsFound,
          durationMs,
        });

        if (result.success) {
          setSaveStatus({
            success: true,
            rewards: result.rewards,
          });
        } else {
          setSaveStatus({
            success: false,
            error: result.error || "Failed to save score",
          });
        }
      } catch (error) {
        console.error("Error submitting score:", error);
        setSaveStatus({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    handleGameEnd();
  }, [gameState?.isFinished, user, scoreSubmitted]);

  // Start next word (after win)
  const startNextWord = useCallback(() => {
    if (!gameState) return;
    const excludeWords = new Set([gameState.targetWord]);
    const newGame = resetForNewRandomWord(gameState, excludeWords);
    setGameState(newGame);
    setTimeRemaining(90);
    setIsTimerRunning(true);
    setShowGameOver(false);
    setErrorMessage(null);
    setScoreSubmitted(false);
    setSaveStatus(null);
    gameStartTimeRef.current = Date.now();
  }, [gameState]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0 && isGameStarted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (gameState && !gameState.isFinished) {
              // Timeout - end game
              setShowGameOver(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining, isGameStarted, gameState]);

  // Keyboard input handler
  useEffect(() => {
    if (!isGameStarted || showGameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleLetterInput(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameStarted, showGameOver, handleSubmitGuess, handleBackspace, handleLetterInput]);

  // Initialize on mount and when difficulty changes (only after word lists are loaded)
  useEffect(() => {
    if (!wordListsLoaded) return;
    try {
      initializeGame(selectedDifficulty);
    } catch (error) {
      console.error("Error initializing game:", error);
      setErrorMessage("Erreur lors de l'initialisation du jeu. Veuillez rafraîchir la page.");
    }
  }, [initializeGame, selectedDifficulty, wordListsLoaded]);

  // Get keyboard state for visual feedback
  const getKeyboardState = (): Record<string, LetterStatus> => {
    if (!gameState) return {};
    const state: Record<string, LetterStatus> = {};

    gameState.rows.forEach((row) => {
      if (row.isSubmitted) {
        row.cells.forEach((cell) => {
          if (cell.letter && cell.status !== "empty") {
            const existing = state[cell.letter];
            // Priority: correct > present > absent
            if (
              !existing ||
              (cell.status === "correct") ||
              (cell.status === "present" && existing === "absent")
            ) {
              state[cell.letter] = cell.status;
            }
          }
        });
      }
    });

    return state;
  };

  const keyboardState = getKeyboardState();
  const isTimeLow = timeRemaining < 10;

  // Detect if mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to get button styles
  const getButtonStyle = (isCorrect: boolean, isPresent: boolean, isAbsent: boolean) => {
    if (isMobile) {
      return {
        boxShadow: isCorrect
          ? "0 3px 0 0 #000, inset 0 1px 2px rgba(255,255,255,0.2)"
          : isPresent
          ? "0 3px 0 0 #000, inset 0 1px 2px rgba(255,255,255,0.2)"
          : isAbsent
          ? "0 2px 0 0 #000"
          : "0 3px 0 0 #000, inset 0 1px 2px rgba(255,255,255,0.1)",
        textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
      };
    }
    return {
      boxShadow: isCorrect
        ? "0 5px 0 0 #000, 0 0 15px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)"
        : isPresent
        ? "0 5px 0 0 #000, 0 0 15px rgba(234, 179, 8, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)"
        : isAbsent
        ? "0 5px 0 0 #000, 0 0 10px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(0,0,0,0.5)"
        : "0 4px 0 0 #000, 0 6px 12px rgba(0,0,0,0.3)",
      textShadow: "0 0 4px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,1)",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern p-2 md:p-8">
      <div className="max-w-5xl mx-auto space-y-3 md:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="comic-panel-dark p-3 md:p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)",
          }}
        >
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <motion.div
                className="comic-panel bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 border-2 md:border-4 border-black p-2 md:p-4 relative overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  boxShadow: "0 6px 0 0 #000, 0 0 25px rgba(139, 92, 246, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                <BookOpenIcon className="w-6 h-6 md:w-10 md:h-10 text-white relative z-10" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-5xl font-extrabold text-white mb-1 md:mb-2 text-outline leading-tight md:leading-normal break-words" style={{
                  textShadow: "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)",
                }}>
                  Enigma Scroll
                </h1>
                <p className="text-slate-200 text-xs md:text-lg font-semibold text-outline leading-tight md:leading-normal break-words">
                  Devine le mot secret en un nombre limité de tentatives!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-end flex-shrink-0">
              <Link
                href="/play/enigma-scroll/leaderboard"
                className="comic-button bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 text-white px-3 py-2 md:px-6 md:py-3 text-xs md:text-base font-extrabold hover:from-amber-700 hover:to-yellow-700 text-outline border-2 md:border-4 border-black whitespace-nowrap"
                style={{
                  boxShadow: "0 5px 0 0 #000, 0 8px 16px rgba(0,0,0,0.4)",
                  textShadow: "0 0 4px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,1)",
                }}
              >
                🏆 Classement
              </Link>
              <Link
                href="/play"
                className="comic-button bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white px-3 py-2 md:px-6 md:py-3 text-xs md:text-base font-extrabold hover:from-slate-600 hover:to-slate-700 text-outline border-2 md:border-4 border-black whitespace-nowrap"
                style={{
                  boxShadow: "0 5px 0 0 #000, 0 8px 16px rgba(0,0,0,0.4)",
                  textShadow: "0 0 4px rgba(0,0,0,0.8), 1px 1px 0 rgba(0,0,0,1)",
                }}
              >
                ← Retour
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Game Rules */}
        <AnimatePresence>
          {!isGameStarted && !showGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="comic-panel-dark p-4 md:p-8"
            >
              <div className="flex items-start gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black p-2 md:p-3 flex-shrink-0">
                  <BookOpenIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4 text-outline">
                    Règles du jeu
                  </h2>
                  <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-slate-300 text-outline">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>
                        Devine le mot secret en utilisant les indices de couleur
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>
                        <span className="text-green-400 font-bold">Vert</span> = lettre correcte à la bonne position
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>
                        <span className="text-yellow-400 font-bold">Jaune</span> = lettre présente mais mauvaise position
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>
                        <span className="text-gray-400 font-bold">Gris</span> = lettre absente du mot
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold mt-1">•</span>
                      <span>
                        Tu as 90 secondes pour trouver le mot
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mt-6 md:mt-8">
                <label className="block text-white font-bold mb-3 md:mb-4 text-outline text-base md:text-lg">
                  Choisissez la difficulté:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {([4, 5, 6] as Difficulty[]).map((diff) => (
                    <motion.button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`comic-button p-3 md:p-4 font-bold text-outline text-left ${
                        selectedDifficulty === diff
                          ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white border-2 md:border-4 border-black"
                          : "bg-slate-700 text-white hover:bg-slate-600 border-2 md:border-4 border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 md:mb-2">
                        <span className="text-base md:text-xl">{DIFFICULTY_LABELS[diff]}</span>
                        {selectedDifficulty === diff && (
                          <div className="comic-panel bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-black p-1">
                            <StarIcon className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="block text-xs md:text-sm opacity-90 mt-1">
                        {DIFFICULTY_DESCRIPTIONS[diff]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Top Scores Display */}
              {user && (
                <div className="mt-8">
                  <TopScoresDisplay 
                    selectedDifficulty={mapWordLengthToDifficulty(selectedDifficulty)}
                  />
                </div>
              )}

              {/* Start Button */}
              <div className="mt-6 md:mt-8 flex justify-center">
                <motion.button
                  onClick={startGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="comic-button bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 md:px-12 md:py-4 text-base md:text-xl font-bold hover:from-emerald-700 hover:to-green-700 text-outline animate-comic-glow border-2 md:border-4 border-black w-full md:w-auto"
                >
                  <span className="flex items-center justify-center gap-2">
                    <BookOpenIcon className="w-5 h-5 md:w-6 md:h-6" />
                    Commencer le jeu
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Stats Bar */}
        <AnimatePresence>
          {isGameStarted && gameState && !showGameOver && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="comic-panel-dark p-3 md:p-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4">
                <motion.div
                  className="comic-panel bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 border-2 md:border-4 border-black p-2 md:p-5 text-center relative overflow-hidden"
                  whileHover={{ scale: 1.08, y: -3 }}
                  style={{
                    boxShadow: "0 6px 0 0 #000, 0 0 20px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="text-xs md:text-sm text-white/90 mb-2 text-outline font-extrabold uppercase tracking-wider">
                    SCORE
                  </div>
                  <div className="text-xl md:text-4xl font-extrabold text-white text-outline" style={{
                    textShadow: "0 0 10px rgba(139, 92, 246, 0.6), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)",
                  }}>
                    {gameState.totalScore}
                  </div>
                </motion.div>
                <motion.div
                  className="comic-panel bg-gradient-to-br from-cyan-500 via-blue-600 to-cyan-700 border-2 md:border-4 border-black p-2 md:p-5 text-center relative overflow-hidden"
                  whileHover={{ scale: 1.08, y: -3 }}
                  style={{
                    boxShadow: "0 6px 0 0 #000, 0 0 20px rgba(6, 182, 212, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-white/90 mb-2 text-outline font-extrabold uppercase tracking-wider">
                    <div className="comic-panel bg-gradient-to-br from-orange-500 via-red-600 to-orange-600 border-2 border-black p-1.5">
                      <FireIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    SÉRIE
                  </div>
                  <motion.div 
                    className="text-xl md:text-4xl font-extrabold text-white text-outline relative"
                    style={{
                      textShadow: "0 0 10px rgba(6, 182, 212, 0.6), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)",
                    }}
                    animate={gameState.currentStreak > 1 ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {gameState.currentStreak}
                    {gameState.currentStreak > 1 && (
                      <motion.span
                        className="absolute -top-2 -right-2 text-xs bg-gradient-to-br from-orange-500 to-red-600 text-white px-2 py-1 rounded-full border-2 border-black"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        style={{
                          boxShadow: "0 2px 0 0 #000, 0 0 10px rgba(239, 68, 68, 0.6)",
                        }}
                      >
                        x{gameState.currentStreak}
                      </motion.span>
                    )}
                  </motion.div>
                </motion.div>
                <motion.div
                  className="comic-panel bg-gradient-to-br from-pink-500 via-rose-600 to-pink-700 border-2 md:border-4 border-black p-2 md:p-5 text-center relative overflow-hidden"
                  whileHover={{ scale: 1.08, y: -3 }}
                  style={{
                    boxShadow: "0 6px 0 0 #000, 0 0 20px rgba(236, 72, 153, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-white/90 mb-2 text-outline font-extrabold uppercase tracking-wider">
                    <div className="comic-panel bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-2 border-black p-1.5">
                      <StarIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    TROUVÉS
                  </div>
                  <div className="text-xl md:text-4xl font-extrabold text-white text-outline" style={{
                    textShadow: "0 0 10px rgba(236, 72, 153, 0.6), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)",
                  }}>
                    {gameState.wordsFound}
                  </div>
                </motion.div>
                <motion.div
                  className={`comic-panel border-2 md:border-4 border-black p-2 md:p-5 text-center relative overflow-hidden ${
                    isTimeLow
                      ? "bg-gradient-to-br from-red-500 via-orange-600 to-red-700 animate-comic-flash"
                      : "bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700"
                  }`}
                  whileHover={{ scale: 1.08, y: -3 }}
                  style={{
                    boxShadow: isTimeLow
                      ? "0 6px 0 0 #000, 0 0 25px rgba(239, 68, 68, 0.7), inset 0 2px 4px rgba(0,0,0,0.2)"
                      : "0 6px 0 0 #000, 0 0 20px rgba(234, 179, 8, 0.5), inset 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-white/90 mb-2 text-outline font-extrabold uppercase tracking-wider">
                    <div className="comic-panel bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 border-2 border-black p-1.5">
                      <ClockIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    TEMPS
                  </div>
                  <div className={`text-xl md:text-4xl font-extrabold text-white text-outline ${isTimeLow ? "animate-pulse" : ""}`} style={{
                    textShadow: isTimeLow
                      ? "0 0 15px rgba(239, 68, 68, 0.8), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)"
                      : "0 0 10px rgba(234, 179, 8, 0.6), 0 4px 8px rgba(0,0,0,0.8), 2px 2px 0 rgba(0,0,0,1)",
                  }}>
                    {timeRemaining}s
                  </div>
                </motion.div>
              </div>

              {/* Timer Bar */}
              <div className="comic-panel bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-2 md:border-4 border-black h-5 md:h-7 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full relative ${
                    isTimeLow
                      ? "bg-gradient-to-r from-red-500 via-orange-500 to-red-600"
                      : "bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600"
                  }`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeRemaining / 90) * 100}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                  style={{
                    boxShadow: isTimeLow
                      ? "0 0 20px rgba(239, 68, 68, 0.9), inset 0 2px 4px rgba(255,255,255,0.2)"
                      : "0 0 15px rgba(6, 182, 212, 0.7), inset 0 2px 4px rgba(255,255,255,0.2)",
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Grid */}
        <AnimatePresence>
          {isGameStarted && gameState && !showGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="comic-panel-dark p-4 md:p-8 relative overflow-hidden"
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
                <div className="flex flex-col items-center gap-2 md:gap-4">
                  {gameState.rows.map((row, rowIndex) => (
                    <motion.div
                      key={rowIndex}
                      className="flex gap-1.5 md:gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: rowIndex === gameState.currentAttemptIndex ? 1 : 0.8,
                        x: shakeRow === rowIndex ? [0, -10, 10, -10, 10, 0] : 0,
                      }}
                      transition={{ 
                        delay: rowIndex * 0.1,
                        x: shakeRow === rowIndex ? { 
                          duration: 0.5, 
                          type: "tween",
                          ease: "easeInOut"
                        } : {}
                      }}
                    >
                      {row.cells.map((cell, cellIndex) => {
                        const isCorrect = cell.status === "correct";
                        const isPresent = cell.status === "present";
                        const isAbsent = cell.status === "absent";
                        const isEmpty = cell.status === "empty";
                        const isSubmitted = row.isSubmitted;

                        return (
                          <motion.div
                            key={cellIndex}
                            className="w-12 h-12 md:w-20 md:h-20 border-2 md:border-4 border-black flex items-center justify-center text-2xl md:text-4xl font-extrabold relative overflow-hidden rounded-lg"
                            style={{
                              // Couleurs directement sur le fond
                              background: isCorrect
                                ? "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)"
                                : isPresent
                                ? "linear-gradient(135deg, #eab308 0%, #f59e0b 50%, #d97706 100%)"
                                : isAbsent
                                ? "linear-gradient(135deg, #0a0a0a 0%, #000000 50%, #050505 100%)"
                                : "linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)",
                              color: isEmpty ? "#94a3b8" : "#ffffff",
                              boxShadow: isSubmitted && !isEmpty
                                ? isCorrect
                                  ? "0 6px 0 0 #000, 0 0 25px rgba(34, 197, 94, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)"
                                  : isPresent
                                  ? "0 6px 0 0 #000, 0 0 25px rgba(234, 179, 8, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)"
                                  : "0 6px 0 0 #000, 0 0 15px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(0,0,0,0.4)"
                                : "0 4px 0 0 #000, 0 8px 16px rgba(0,0,0,0.3)",
                              // Contours très prononcés pour les lettres (style BD Marvel)
                              textShadow: isSubmitted && !isEmpty
                                ? "3px 3px 0 rgba(0,0,0,1), -3px -3px 0 rgba(0,0,0,1), 3px -3px 0 rgba(0,0,0,1), -3px 3px 0 rgba(0,0,0,1), 0 3px 0 rgba(0,0,0,1), 0 -3px 0 rgba(0,0,0,1), 3px 0 0 rgba(0,0,0,1), -3px 0 0 rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9)"
                                : "2px 2px 0 rgba(0,0,0,1), -2px -2px 0 rgba(0,0,0,1), 2px -2px 0 rgba(0,0,0,1), -2px 2px 0 rgba(0,0,0,1), 0 2px 0 rgba(0,0,0,1), 0 -2px 0 rgba(0,0,0,1), 2px 0 0 rgba(0,0,0,1), -2px 0 0 rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)",
                            }}
                            initial={{ 
                              scale: 0.8, 
                              opacity: 0,
                              rotateY: isSubmitted ? 180 : 0
                            }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              rotateY: 0,
                            }}
                            transition={{
                              delay: isSubmitted
                                ? cellIndex * 0.08
                                : 0,
                              type: "spring",
                              stiffness: 400,
                              damping: 20,
                            }}
                            whileHover={!isSubmitted ? {
                              scale: 1.05,
                              y: -2,
                            } : {}}
                          >
                            {/* Shine effect for submitted cells */}
                            {isSubmitted && !isEmpty && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                                initial={{ x: "-100%", y: "-100%" }}
                                animate={{ x: "200%", y: "200%" }}
                                transition={{
                                  duration: 0.6,
                                  delay: cellIndex * 0.08 + 0.3,
                                  ease: "easeInOut",
                                }}
                              />
                            )}
                            <span className="relative z-10">{cell.letter}</span>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-4 md:mt-6 comic-panel bg-gradient-to-br from-red-500 via-rose-600 to-red-700 border-2 md:border-4 border-black p-3 md:p-5 text-center relative overflow-hidden"
                  style={{
                    boxShadow: "0 6px 0 0 #000, 0 0 25px rgba(239, 68, 68, 0.7), inset 0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                  <p className="text-white font-extrabold text-sm md:text-lg text-outline relative z-10 break-words" style={{
                    textShadow: "0 0 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,1)",
                  }}>
                    {errorMessage}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Virtual Keyboard - Responsive: Compact Mobile / Professional Desktop */}
        <AnimatePresence>
          {isGameStarted && gameState && !showGameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="comic-panel-dark p-2 md:p-6 relative overflow-hidden"
              style={{ touchAction: "manipulation" }}
            >
              {/* Decorative background - Desktop only */}
              <div className="hidden md:block absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="flex flex-col items-center gap-1 md:gap-3">
                  {/* Row 1 */}
                  <div className="flex gap-1 md:gap-2 justify-center w-full max-w-full px-1 md:px-0">
                    {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map(
                      (letter) => {
                        const status = keyboardState[letter];
                        const isCorrect = status === "correct";
                        const isPresent = status === "present";
                        const isAbsent = status === "absent";

                        return (
                          <motion.button
                            key={letter}
                            onClick={(e) => handleClickInput(letter, e)}
                            onTouchStart={(e) => handleTouchInput(letter, e)}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.92 }}
                            className={`flex-1 max-w-[9%] md:max-w-none aspect-[1.2/1] md:aspect-auto min-h-[36px] md:min-h-[48px] md:px-4 md:py-3 flex items-center justify-center text-sm md:text-lg font-extrabold md:font-extrabold text-white text-outline border-2 md:border-4 border-black rounded-md md:rounded-lg relative overflow-hidden transition-all ${
                              isCorrect
                                ? "bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 md:bg-gradient-to-br md:from-green-400 md:via-emerald-500 md:to-green-600"
                                : isPresent
                                ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 md:bg-gradient-to-br md:from-yellow-400 md:via-amber-500 md:to-yellow-600"
                                : isAbsent
                                ? "bg-gray-700 opacity-50 md:bg-gradient-to-br md:from-gray-900 md:via-black md:to-gray-900 md:opacity-100"
                                : "bg-slate-600 hover:bg-slate-500 md:bg-gradient-to-br md:from-slate-700 md:via-slate-800 md:to-slate-900"
                            }`}
                            style={{
                              ...getButtonStyle(isCorrect, isPresent, isAbsent),
                              touchAction: "manipulation",
                              WebkitTapHighlightColor: "transparent",
                              userSelect: "none",
                            }}
                          >
                            {letter}
                          </motion.button>
                        );
                      }
                    )}
                  </div>
                  
                  {/* Row 2 */}
                  <div className="flex gap-1 md:gap-2 justify-center w-full max-w-full px-2 md:px-0">
                    {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map(
                      (letter) => {
                        const status = keyboardState[letter];
                        const isCorrect = status === "correct";
                        const isPresent = status === "present";
                        const isAbsent = status === "absent";

                        return (
                          <motion.button
                            key={letter}
                            onClick={(e) => handleClickInput(letter, e)}
                            onTouchStart={(e) => handleTouchInput(letter, e)}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.92 }}
                            className={`flex-1 max-w-[10%] md:max-w-none aspect-[1.2/1] md:aspect-auto min-h-[36px] md:min-h-[48px] md:px-4 md:py-3 flex items-center justify-center text-sm md:text-lg font-extrabold text-white text-outline border-2 md:border-4 border-black rounded-md md:rounded-lg relative overflow-hidden transition-all ${
                              isCorrect
                                ? "bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 md:bg-gradient-to-br md:from-green-400 md:via-emerald-500 md:to-green-600"
                                : isPresent
                                ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 md:bg-gradient-to-br md:from-yellow-400 md:via-amber-500 md:to-yellow-600"
                                : isAbsent
                                ? "bg-gray-700 opacity-50 md:bg-gradient-to-br md:from-gray-900 md:via-black md:to-gray-900 md:opacity-100"
                                : "bg-slate-600 hover:bg-slate-500 md:bg-gradient-to-br md:from-slate-700 md:via-slate-800 md:to-slate-900"
                            }`}
                            style={{
                              ...getButtonStyle(isCorrect, isPresent, isAbsent),
                              touchAction: "manipulation",
                              WebkitTapHighlightColor: "transparent",
                              userSelect: "none",
                            }}
                          >
                            {letter}
                          </motion.button>
                        );
                      }
                    )}
                  </div>
                  
                  {/* Row 3 */}
                  <div className="flex gap-1 md:gap-2 justify-center w-full max-w-full px-1 md:px-0">
                    <motion.button
                      onClick={handleClickSubmit}
                      onTouchStart={handleTouchSubmit}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      className="flex-[1.3] max-w-[12%] md:max-w-none md:min-w-[80px] aspect-[2/1] md:aspect-auto min-h-[36px] md:min-h-[48px] md:px-6 md:py-3 flex items-center justify-center text-xs md:text-base font-extrabold text-white text-outline border-2 md:border-4 border-black rounded-md md:rounded-lg bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 relative overflow-hidden transition-all"
                      style={{
                        boxShadow: isMobile
                          ? "0 3px 0 0 #000, inset 0 1px 2px rgba(255,255,255,0.2)"
                          : "0 5px 0 0 #000, 0 0 20px rgba(16, 185, 129, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)",
                        textShadow: isMobile
                          ? "1px 1px 2px rgba(0,0,0,0.8)"
                          : "0 0 4px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,1)",
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                        userSelect: "none",
                      }}
                    >
                      <span className="relative z-10">ENTER</span>
                    </motion.button>
                    {["Z", "X", "C", "V", "B", "N", "M"].map((letter) => {
                      const status = keyboardState[letter];
                      const isCorrect = status === "correct";
                      const isPresent = status === "present";
                      const isAbsent = status === "absent";

                      return (
                        <motion.button
                          key={letter}
                          onClick={(e) => handleClickInput(letter, e)}
                          onTouchStart={(e) => handleTouchInput(letter, e)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.92 }}
                          className={`flex-1 max-w-[10%] md:max-w-none aspect-[1.2/1] md:aspect-auto min-h-[36px] md:min-h-[48px] md:px-4 md:py-3 flex items-center justify-center text-sm md:text-lg font-extrabold text-white text-outline border-2 md:border-4 border-black rounded-md md:rounded-lg relative overflow-hidden transition-all ${
                            isCorrect
                              ? "bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 md:bg-gradient-to-br md:from-green-400 md:via-emerald-500 md:to-green-600"
                              : isPresent
                              ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 md:bg-gradient-to-br md:from-yellow-400 md:via-amber-500 md:to-yellow-600"
                              : isAbsent
                              ? "bg-gray-700 opacity-50 md:bg-gradient-to-br md:from-gray-900 md:via-black md:to-gray-900 md:opacity-100"
                              : "bg-slate-600 hover:bg-slate-500 md:bg-gradient-to-br md:from-slate-700 md:via-slate-800 md:to-slate-900"
                          }`}
                          style={{
                            ...getButtonStyle(isCorrect, isPresent, isAbsent),
                            touchAction: "manipulation",
                            WebkitTapHighlightColor: "transparent",
                            userSelect: "none",
                          }}
                        >
                          {letter}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      onClick={handleClickBackspace}
                      onTouchStart={handleTouchBackspace}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.92 }}
                      className="flex-[1.3] max-w-[12%] md:max-w-none md:min-w-[80px] aspect-[2/1] md:aspect-auto min-h-[36px] md:min-h-[48px] md:px-6 md:py-3 flex items-center justify-center text-lg md:text-xl font-extrabold text-white text-outline border-2 md:border-4 border-black rounded-md md:rounded-lg bg-gradient-to-br from-red-500 via-rose-600 to-red-700 relative overflow-hidden transition-all"
                      style={{
                        boxShadow: isMobile
                          ? "0 3px 0 0 #000, inset 0 1px 2px rgba(255,255,255,0.2)"
                          : "0 5px 0 0 #000, 0 0 20px rgba(239, 68, 68, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)",
                        textShadow: isMobile
                          ? "1px 1px 2px rgba(0,0,0,0.8)"
                          : "0 0 4px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,1)",
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                        userSelect: "none",
                      }}
                    >
                      <span className="relative z-10">⌫</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Modal */}
        <AnimatePresence>
          {showGameOver && gameState && (
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
                <motion.h2 
                  className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-outline"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  style={{
                    textShadow: gameState.isWin
                      ? "0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.6), 0 4px 8px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,1)"
                      : "0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,1)",
                  }}
                >
                  {gameState.isWin ? "🎉 BRAVO! 🎉" : "Partie terminée!"}
                </motion.h2>
                {!gameState.isWin && (
                  <motion.p 
                    className="text-xl text-slate-300 mb-4 text-outline"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Le mot était:{" "}
                    <span className="font-bold text-cyan-400 text-2xl">
                      {gameState.targetWord}
                    </span>
                  </motion.p>
                )}
                <div className="space-y-4 mb-8">
                  <motion.div 
                    className="comic-panel bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 border-4 border-black p-4 text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                      boxShadow: "0 6px 0 0 #000, 0 0 25px rgba(139, 92, 246, 0.6), inset 0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div className="text-sm text-white/80 mb-1 text-outline font-semibold">SCORE FINAL</div>
                    <div className="text-4xl md:text-5xl font-extrabold text-white text-outline" style={{
                      textShadow: "0 0 15px rgba(139, 92, 246, 0.8), 0 4px 8px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,1)",
                    }}>
                      {gameState.totalScore}
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className="comic-panel bg-gradient-to-br from-pink-600 via-rose-700 to-pink-800 border-4 border-black p-3 text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="text-xs text-white/80 mb-1 text-outline">MOTS TROUVÉS</div>
                      <div className="text-2xl font-extrabold text-white text-outline">
                        {gameState.wordsFound}
                      </div>
                    </motion.div>
                    <motion.div 
                      className="comic-panel bg-gradient-to-br from-cyan-600 via-blue-700 to-cyan-800 border-4 border-black p-3 text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="text-xs text-white/80 mb-1 text-outline">MEILLEURE SÉRIE</div>
                      <div className="text-2xl font-extrabold text-white text-outline">
                        {gameState.bestStreak}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Session Stats - Enhanced */}
                <motion.div 
                  className="comic-panel bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-4 border-black p-6 mb-8 max-w-md mx-auto relative overflow-hidden"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{
                    boxShadow: "0 6px 0 0 #000, 0 0 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  <h3 className="text-xl font-extrabold text-white mb-4 text-outline flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    Statistiques de session
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="comic-panel bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-black p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">PARTIES</div>
                      <div className="text-xl font-extrabold text-white text-outline">
                        {sessionStats.totalGamesPlayed}
                      </div>
                    </div>
                    <div className="comic-panel bg-gradient-to-br from-emerald-700 to-green-800 border-2 border-black p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">VICTOIRES</div>
                      <div className="text-xl font-extrabold text-white text-outline">
                        {sessionStats.totalWins}
                      </div>
                    </div>
                    <div className="comic-panel bg-gradient-to-br from-cyan-700 to-blue-800 border-2 border-black p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">SÉRIE MAX</div>
                      <div className="text-xl font-extrabold text-white text-outline">
                        {sessionStats.bestStreak}
                      </div>
                    </div>
                    <div className="comic-panel bg-gradient-to-br from-pink-700 to-rose-800 border-2 border-black p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">TROUVÉS</div>
                      <div className="text-xl font-extrabold text-white text-outline">
                        {sessionStats.totalWordsFound}
                      </div>
                    </div>
                  </div>
                  {sessionStats.totalGamesPlayed > 0 && (
                    <div className="comic-panel bg-gradient-to-br from-amber-700 to-yellow-800 border-2 border-black p-3 text-center">
                      <div className="text-xs text-slate-300 mb-1">TAUX DE RÉUSSITE</div>
                      <div className="text-2xl font-extrabold text-white text-outline">
                        {Math.round((sessionStats.totalWins / sessionStats.totalGamesPlayed) * 100)}%
                      </div>
                    </div>
                  )}
                  {/* Save Status */}
                  {user ? (
                    saveStatus ? (
                      saveStatus.success ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="comic-panel bg-gradient-to-br from-emerald-600 to-green-700 border-2 border-black p-3 mt-4 text-center"
                        >
                          <div className="text-sm font-bold text-white text-outline mb-1">
                            ✅ Score sauvegardé!
                          </div>
                          {saveStatus.rewards && (
                            <div className="text-xs text-emerald-100 text-outline">
                              +{saveStatus.rewards.xpEarned} XP
                              {saveStatus.rewards.goldEarned > 0 && ` • +${saveStatus.rewards.goldEarned} Or`}
                              {saveStatus.rewards.newLevel && ` • Niveau ${saveStatus.rewards.newLevel}!`}
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="comic-panel bg-gradient-to-br from-red-600 to-red-700 border-2 border-black p-3 mt-4 text-center"
                        >
                          <div className="text-xs text-white text-outline">
                            ⚠️ {saveStatus.error || "Erreur lors de la sauvegarde"}
                          </div>
                        </motion.div>
                      )
                    ) : (
                      <div className="text-xs text-amber-300 mt-4 text-outline text-center">
                        💾 Sauvegarde en cours...
                      </div>
                    )
                  ) : (
                    <p className="text-xs text-amber-300 mt-4 text-outline text-center">
                      💡 <Link href="/auth/login" className="underline hover:text-amber-200">Connectez-vous</Link> pour sauvegarder votre progression
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Top Scores Display */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.8 }}
                  className="comic-panel-dark p-6"
                >
                  <TopScoresDisplay 
                    selectedDifficulty={mapWordLengthToDifficulty(gameState.config.wordLength as 4 | 5 | 6)}
                    currentScore={gameState.totalScore}
                  />
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="comic-panel-dark p-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  {gameState.isWin && (
                    <motion.button
                      onClick={startNextWord}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="comic-button bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 text-lg font-bold hover:from-cyan-700 hover:to-blue-700 text-outline"
                    >
                      Mot suivant
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => {
                      initializeGame(selectedDifficulty);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="comic-button bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 text-lg font-bold hover:from-emerald-700 hover:to-green-700 text-outline"
                  >
                    Nouvelle partie
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

        {/* 🎉 CELEBRATION ANIMATION */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <motion.h2
                  className="text-6xl md:text-8xl font-extrabold text-white mb-4 text-outline"
                  style={{
                    textShadow: "0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.6), 0 8px 16px rgba(0,0,0,0.9), 4px 4px 0 rgba(0,0,0,1)",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 0.6, repeat: 2 }}
                >
                  🎉 VICTOIRE! 🎉
                </motion.h2>
                {gameState && (
                  <motion.div
                    className="text-3xl md:text-4xl font-bold text-yellow-400 text-outline"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      textShadow: "0 0 20px rgba(234, 179, 8, 0.8), 0 4px 8px rgba(0,0,0,0.9), 2px 2px 0 rgba(0,0,0,1)",
                    }}
                  >
                    +{lastPointsEarned} points!
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔥 STREAK NOTIFICATION */}
        <AnimatePresence>
          {showStreakNotification && gameState && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
            >
              <motion.div
                className="comic-panel bg-gradient-to-br from-orange-500 via-red-600 to-orange-700 border-4 border-black p-6 text-center relative overflow-hidden"
                style={{
                  boxShadow: "0 8px 0 0 #000, 0 0 30px rgba(239, 68, 68, 0.8), inset 0 2px 4px rgba(0,0,0,0.2)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <FireIcon className="w-8 h-8 text-white animate-pulse" />
                  <div>
                    <div className="text-2xl font-extrabold text-white text-outline">
                      SÉRIE DE {gameState.currentStreak}!
                    </div>
                    <div className="text-sm text-yellow-200 text-outline">
                      Incroyable! 🔥
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✨ PARTICLE EFFECTS */}
        <AnimatePresence>
          {particles.length > 0 && (
            <div className="fixed inset-0 z-40 pointer-events-none">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    background: `radial-gradient(circle, ${
                      ['#22c55e', '#eab308', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 5)]
                    } 0%, transparent 70%)`,
                    boxShadow: `0 0 10px ${
                      ['#22c55e', '#eab308', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 5)]
                    }`,
                  }}
                  initial={{
                    scale: 0,
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: particle.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* 🏆 ACHIEVEMENTS BADGE */}
        {achievements.size > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <motion.div
              className="comic-panel bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 border-4 border-black p-4 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              style={{
                boxShadow: "0 6px 0 0 #000, 0 0 25px rgba(234, 179, 8, 0.7), inset 0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-white" />
                <div>
                  <div className="text-sm font-bold text-white text-outline">
                    {achievements.size} Succès débloqués!
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

