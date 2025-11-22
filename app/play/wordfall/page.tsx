"use client";

/**
 * Wordfall Game Page
 * 
 * A Tetris-style word typing game with two modes:
 * - Exact Word Mode: Type the exact falling word
 * - Free Word Mode: Type any valid word starting with the displayed letter
 * 
 * Professional gaming app style with Marvel/comic book visual effects.
 * 
 * TODO: Future integration points:
 * - When game ends, call a server action to save the game_score to Supabase
 * - Read user profile (xp, gold, level) from Supabase to display in header
 * - Update user XP/gold based on final score
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  type WordfallState,
  type WordfallMode,
  type FallingWord,
  createGameState,
  spawnFallingWord,
  updateFallingWord,
  hasReachedBottom,
  processWordInput,
  processWordMissed,
  startGame,
  pauseGame,
  resumeGame,
  initializeWordLists,
  initializeEnglishWords,
} from "@/lib/games/wordfall";
import wordfallWordsData from "@/lib/games/words/wordfall-words.json";
import englishWordsData from "@/lib/games/words/english-words.json";
import {
  LightningIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  StarIcon,
  BookOpenIcon,
  TrophyIcon,
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { WordfallLeaderboard } from "./leaderboard";
import { submitWordfallScore } from "./actions";
import { PersonalBestDisplay } from "./personal-best-display";

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function WordfallPage() {
  const [gameState, setGameState] = useState<WordfallState | null>(null);
  const [selectedMode, setSelectedMode] = useState<WordfallMode>("exact");
  const [wordInput, setWordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wordListsLoaded, setWordListsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [backgroundFlash, setBackgroundFlash] = useState<"green" | "red" | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showStreakNotification, setShowStreakNotification] = useState(false);
  const [streakNotificationText, setStreakNotificationText] = useState("");
  const [showPerfectNotification, setShowPerfectNotification] = useState(false);
  const [lastScoreIncrease, setLastScoreIncrease] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    isNewPersonalBest?: boolean;
    isNewGlobalBest?: boolean;
    personalBest?: number;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const particleIdRef = useRef(0);
  const previousScoreRef = useRef(0);
  const previousWordsCompletedRef = useRef(0);
  const gameStartTimeRef = useRef<number | null>(null);
  const { user } = useAuth();

  // Detect mobile and keyboard state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    const checkKeyboard = () => {
      if (typeof window !== 'undefined' && 'visualViewport' in window) {
        const viewport = window.visualViewport;
        if (viewport) {
          // Keyboard is likely open if visual viewport height is significantly less than window height
          const heightDiff = window.innerHeight - viewport.height;
          setIsKeyboardOpen(heightDiff > 150); // Threshold for keyboard detection
        }
      } else {
        // Fallback: check if input is focused (less reliable but works on more devices)
        const activeElement = document.activeElement;
        const isInputFocused = !!(activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA'
        ));
        setIsKeyboardOpen(!!(isMobile && isInputFocused));
      }
    };
    
    checkMobile();
    checkKeyboard();
    
    window.addEventListener('resize', checkMobile);
    if (typeof window !== 'undefined' && 'visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard);
    }
    
    // Also check on focus/blur events for input
    const handleFocus = () => {
      if (isMobile) {
        setTimeout(checkKeyboard, 300); // Delay to allow keyboard to appear
      }
    };
    const handleBlur = () => {
      if (isMobile) {
        setTimeout(() => setIsKeyboardOpen(false), 300); // Delay to allow keyboard to hide
      }
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (typeof window !== 'undefined' && 'visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboard);
      }
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [isMobile]);

  // Load word lists on mount
  useEffect(() => {
    try {
      // Check if wordfallWordsData exists
      if (!wordfallWordsData) {
        console.error("Wordfall words data is missing");
        setWordListsLoaded(true);
        return;
      }

      // Initialize word lists - use manual words if available, otherwise use all words
      const wordListsToUse = wordfallWordsData.manualWords ? {
        translations: wordfallWordsData.manualWords.translations,
        wordsByLength: wordfallWordsData.manualWords.wordsByLength,
        expressions: wordfallWordsData.manualWords.expressions || []
      } : {
        translations: wordfallWordsData.translations,
        wordsByLength: wordfallWordsData.wordsByLength,
        expressions: []
      };
      
      // Check if the selected word list is valid
      if (!wordListsToUse || !wordListsToUse.translations || !wordListsToUse.wordsByLength) {
        console.error("Wordfall words data is invalid - missing translations or wordsByLength");
        setWordListsLoaded(true);
        return;
      }
      
      // Debug: log which word list is being used
      if (wordfallWordsData.manualWords) {
        console.log("✅ Wordfall: Using MANUAL words only", {
          total: Object.keys(wordListsToUse.translations || {}).length,
          byLength: {
            4: wordListsToUse.wordsByLength?.[4]?.length || 0,
            5: wordListsToUse.wordsByLength?.[5]?.length || 0,
            6: wordListsToUse.wordsByLength?.[6]?.length || 0,
          }
        });
      } else {
        console.log("⚠️ Wordfall: Using ALL words (manual words not found)");
      }
      
      initializeWordLists({
        translations: wordListsToUse.translations,
        wordsByLength: wordListsToUse.wordsByLength,
        expressions: wordListsToUse.expressions // Include expressions if available
      });
      
      // Initialize English words dictionary for free mode validation
      if (englishWordsData && englishWordsData.allWords) {
        initializeEnglishWords(englishWordsData.allWords);
        console.log(`✅ Wordfall: Loaded ${englishWordsData.allWords.length} English words for free mode validation`);
      } else {
        console.warn("⚠️ Wordfall: English words dictionary not found, free mode will use limited word list");
      }
      
      setWordListsLoaded(true);
    } catch (error) {
      console.error("Failed to load wordfall word lists:", error);
      // Still set loaded to true to prevent infinite loading
      setWordListsLoaded(true);
    }
  }, []);

  // Initialize game
  const initializeGame = useCallback((mode: WordfallMode) => {
    const newGame = createGameState({ mode });
    setGameState(newGame);
    setWordInput("");
    setErrorMessage(null);
    setIsPaused(false);
    previousScoreRef.current = 0;
    previousWordsCompletedRef.current = 0;
    lastUpdateRef.current = Date.now();
  }, []);

  // Start the game
  const handleStartGame = useCallback(() => {
    if (!gameState) return;
    const newState = startGame(gameState);
    setGameState(newState);
    setIsPaused(false);
    previousScoreRef.current = 0;
    previousWordsCompletedRef.current = 0;
    lastUpdateRef.current = Date.now();
    gameStartTimeRef.current = Date.now();
    setScoreSubmitted(false);
    setSubmissionError(null);
    setSubmissionResult(null);
  }, [gameState]);

  // Pause/Resume
  const handlePauseToggle = useCallback(() => {
    if (!gameState || gameState.gameOver) return;
    if (isPaused) {
      const newState = resumeGame(gameState);
      setGameState(newState);
      setIsPaused(false);
      lastUpdateRef.current = Date.now();
    } else {
      const newState = pauseGame(gameState);
      setGameState(newState);
      setIsPaused(true);
    }
  }, [gameState, isPaused]);

  // Handle word input submission
  const handleSubmitWord = useCallback((e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!gameState || !gameState.isRunning || !wordInput.trim()) return;

    // Prevent scroll by maintaining current scroll position
    const scrollY = window.scrollY;

    const result = processWordInput(gameState, wordInput);
    
    if (result.success) {
      // Calculate score increase and get points breakdown
      const scoreIncrease = result.newState.score - previousScoreRef.current;
      previousScoreRef.current = result.newState.score;
      const pointsBreakdown = result.pointsBreakdown;
      
      // Check for streak milestones (5, 10, 20, 50, etc.)
      const newStreak = result.newState.streak;
      const milestoneStreaks = [5, 10, 20, 50, 100];
      if (milestoneStreaks.includes(newStreak)) {
        setStreakNotificationText(`${newStreak} mots en série! 🔥`);
        setShowStreakNotification(true);
        setTimeout(() => setShowStreakNotification(false), 3000);
      }
      
      // Check for perfect catch
      if (pointsBreakdown?.isPerfect) {
        setShowPerfectNotification(true);
        setTimeout(() => setShowPerfectNotification(false), 2000);
        // Show special celebration for perfect catch
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
      
      // Show combo notification when combo increases
      if (result.newState.combo > gameState.combo && result.newState.combo > 1) {
        setStreakNotificationText(`Combo ×${result.newState.combo}! ⚡`);
        setShowStreakNotification(true);
        setTimeout(() => setShowStreakNotification(false), 2500);
      }
      
      const wordsCompleted = result.newState.wordsCompleted;
      previousWordsCompletedRef.current = wordsCompleted;

      // Show celebration and particles
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
      
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: particleIdRef.current++,
        x: 50 + Math.random() * 20 - 10,
        y: 50 + Math.random() * 20 - 10,
        delay: i * 0.03,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 2000);

      // Flash background green for correct answer
      setBackgroundFlash("green");
      setTimeout(() => setBackgroundFlash(null), 600);

      // Show score increase
      if (scoreIncrease > 0) {
        setLastScoreIncrease(scoreIncrease);
        setTimeout(() => setLastScoreIncrease(0), 1500);
      }

      setGameState(result.newState);
      setWordInput("");
      setErrorMessage(null);
      
      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    } else {
      setErrorMessage(result.reason || "Invalid word");
      setTimeout(() => setErrorMessage(null), 2000);
      
      // Flash background red for incorrect answer
      setBackgroundFlash("red");
      setTimeout(() => setBackgroundFlash(null), 600);
      
      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  }, [gameState, wordInput]);

  // Spawn new word when needed
  const spawnNewWord = useCallback(() => {
    if (!gameState || !gameState.isRunning || gameState.gameOver) return;
    
    if (!gameState.activeWord) {
      const newWord = spawnFallingWord(gameState, { mode: gameState.mode });
      if (newWord) {
        setGameState({
          ...gameState,
          activeWord: newWord,
          wordStartTime: Date.now(), // Track when word appeared for speed bonus
        });
      }
    }
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (!gameState || !gameState.isRunning || gameState.gameOver || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setGameState((prevState) => {
        if (!prevState || !prevState.isRunning || !prevState.activeWord) {
          return prevState;
        }

        const updatedWord = updateFallingWord(prevState.activeWord, deltaTime);

        if (hasReachedBottom(updatedWord)) {
          // Word reached bottom - lose a life
          const newState = processWordMissed(prevState);
          // Flash background red when losing a life
          setBackgroundFlash("red");
          setTimeout(() => setBackgroundFlash(null), 600);
          return newState;
        }

        return {
          ...prevState,
          activeWord: updatedWord,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState?.isRunning, gameState?.gameOver, isPaused]);

  // Spawn new word when active word is cleared
  useEffect(() => {
    if (gameState?.isRunning && !gameState.activeWord && !gameState.gameOver) {
      const timer = setTimeout(() => {
        spawnNewWord();
      }, 500); // Small delay before spawning next word
      return () => clearTimeout(timer);
    }
  }, [gameState?.activeWord, gameState?.isRunning, gameState?.gameOver, spawnNewWord]);

  // Keyboard input handler
  useEffect(() => {
    if (!gameState?.isRunning || gameState.gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmitWord();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handlePauseToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState?.isRunning, gameState?.gameOver, handleSubmitWord, handlePauseToggle]);

  // Initialize game when mode changes or word lists are loaded
  useEffect(() => {
    if (!wordListsLoaded) return;
    try {
    initializeGame(selectedMode);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      setErrorMessage("Failed to initialize game. Please refresh the page.");
    }
  }, [selectedMode, wordListsLoaded, initializeGame]);

  // Reset input when mode changes
  useEffect(() => {
    setWordInput("");
    setErrorMessage(null);
  }, [selectedMode]);

  // Submit score when game ends
  useEffect(() => {
    async function handleGameEnd() {
      if (!gameState?.gameOver || !user || scoreSubmitted) {
        return;
      }

      // Calculate game duration
      const durationMs = gameStartTimeRef.current
        ? Date.now() - gameStartTimeRef.current
        : 0;

      try {
        const result = await submitWordfallScore({
          mode: gameState.mode,
          score: gameState.score,
          wordsCompleted: gameState.wordsCompleted,
          durationMs: durationMs,
        });

        if (result.success) {
          setScoreSubmitted(true);
          setSubmissionResult({
            isNewPersonalBest: result.isNewPersonalBest,
            isNewGlobalBest: result.isNewGlobalBest,
            personalBest: result.personalBest,
          });
        } else {
          setSubmissionError(result.error || "Erreur lors de la sauvegarde");
        }
      } catch (error) {
        setSubmissionError("Erreur lors de la sauvegarde du score");
        console.error("Error submitting score:", error);
      }
    }

    handleGameEnd();
  }, [gameState?.gameOver, gameState?.mode, gameState?.score, gameState?.wordsCompleted, user, scoreSubmitted]);

  if (!wordListsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern flex items-center justify-center">
        <div className="comic-panel-dark p-8 text-center">
          <p className="text-white text-outline text-lg">Loading word lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern ${
      isMobile ? "p-2 pb-4" : "p-4 md:p-8"
    }`}>
      {/* Streak Notification */}
      <AnimatePresence>
        {showStreakNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`fixed left-1/2 transform -translate-x-1/2 z-50 ${
              isMobile ? "top-16" : "top-20"
            }`}
          >
            <div className={`comic-panel bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 border-4 border-black shadow-2xl ${
              isMobile ? "p-3 border-2" : "p-6"
            }`}>
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className={isMobile ? "mb-2" : "mb-3"}
                >
                  <FireIcon className={`text-white mx-auto ${
                    isMobile ? "w-8 h-8" : "w-12 h-12"
                  }`} />
                </motion.div>
                <h3 className={`font-bold text-white text-outline ${
                  isMobile ? "text-base" : "text-2xl"
                }`}>
                  {streakNotificationText || `${gameState?.streak || 0} mots en série! 🔥`}
                </h3>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Perfect Catch Notification */}
      <AnimatePresence>
        {showPerfectNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`fixed left-1/2 transform -translate-x-1/2 z-50 ${
              isMobile ? "top-24" : "top-32"
            }`}
          >
            <div className={`comic-panel bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 border-4 border-black shadow-2xl ${
              isMobile ? "p-2 border-2" : "p-4"
            }`}>
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6 }}
                  className={isMobile ? "mb-1" : "mb-2"}
                >
                  <StarIcon className={`text-white mx-auto ${
                    isMobile ? "w-6 h-6" : "w-10 h-10"
                  }`} />
                </motion.div>
                <h3 className={`font-bold text-white text-outline ${
                  isMobile ? "text-base" : "text-xl"
                }`}>
                  PERFECT CATCH! ⭐
                </h3>
                {!isMobile && (
                  <p className="text-sm text-white/90 text-outline mt-1">
                    +5 points bonus
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-5xl mx-auto ${
        isMobile ? "space-y-2" : "space-y-6"
      }`}>
          {/* Header */}
        {(!isMobile || !isKeyboardOpen) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={`comic-panel-dark ${
              isMobile ? "p-3" : "p-6"
            }`}
            style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}
          >
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between ${
              isMobile ? "gap-2" : "gap-4"
            }`}>
              <div className={`flex items-center ${
                isMobile ? "gap-2" : "gap-4"
              }`}>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className={`comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black flex-shrink-0 ${
                    isMobile ? "p-2" : "p-3"
                  }`}
                >
                  <BookOpenIcon className={isMobile ? "w-5 h-5 text-white" : "w-8 h-8 text-white"} />
                </motion.div>
                <div>
                  <h1 className={`font-bold text-white mb-1 text-outline ${
                    isMobile ? "text-xl" : "text-3xl md:text-4xl"
                  }`}>
                    Wordfall
                  </h1>
                  {!isMobile && (
                    <p className="text-slate-200 text-outline font-semibold">
                      Tapez les mots avant qu'ils n'atteignent le bas!
                    </p>
                  )}
                </div>
              </div>
              {!isMobile && (
              <Link
                href="/play"
                  className="comic-button bg-slate-700 text-white px-4 py-2 font-bold hover:bg-slate-600 text-outline transition-all hover:scale-105"
              >
                  ← Retour
              </Link>
              )}
            </div>
          </motion.div>
        )}

            {/* Mode Selector */}
        <AnimatePresence>
          {!gameState?.isRunning && (!isMobile || !isKeyboardOpen) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`comic-panel-dark ${
                isMobile ? "p-3" : "p-6"
              }`}
              style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)" }}
            >
              <div className={`flex items-start ${
                isMobile ? "gap-2 mb-3" : "gap-4 mb-6"
              }`}>
                <div className={`comic-panel bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-black flex-shrink-0 ${
                  isMobile ? "p-2" : "p-3"
                }`}>
                  <LightningIcon className={`text-white ${
                    isMobile ? "w-4 h-4" : "w-6 h-6"
                  }`} />
                </div>
                <div className="flex-1">
                  <h2 className={`font-bold text-white mb-1 text-outline ${
                    isMobile ? "text-lg" : "text-2xl"
                  }`}>Choisissez le mode</h2>
                  {!isMobile && (
                    <p className="text-slate-300 text-outline text-sm mb-4">Sélectionnez votre style de jeu</p>
                  )}
                  <div className={`grid grid-cols-1 md:grid-cols-2 ${
                    isMobile ? "gap-2" : "gap-4"
                  }`}>
                    <motion.button
                  onClick={() => setSelectedMode("exact")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`comic-button font-bold text-outline text-left transition-all relative overflow-hidden ${
                        isMobile ? "p-3" : "p-5"
                      } ${
                    selectedMode === "exact"
                          ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white border-4 border-black shadow-lg"
                          : "bg-slate-700 text-white hover:bg-slate-600 border-2 border-slate-600"
                      }`}
                    >
                      {selectedMode === "exact" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.1 }}
                          className="absolute inset-0 bg-white"
                        />
                      )}
                      <div className="relative z-10">
                        <div className={`flex items-center justify-between ${
                          isMobile ? "mb-1" : "mb-2"
                        }`}>
                          <div className={`flex items-center ${
                            isMobile ? "gap-1" : "gap-2"
                          }`}>
                            <span className={isMobile ? "text-base" : "text-xl"}>Exact Word</span>
                            {selectedMode === "exact" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`comic-panel bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-black ${
                                  isMobile ? "p-0.5" : "p-1"
                                }`}
                              >
                                <CheckCircleIcon className={`text-white ${
                                  isMobile ? "w-3 h-3" : "w-5 h-5"
                                }`} />
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <span className={`block opacity-90 mt-2 leading-relaxed ${
                          isMobile ? "text-xs" : "text-sm"
                        }`}>
                          Tapez le mot exact qui tombe avec sa traduction française
                        </span>
                      </div>
                    </motion.button>
                    <motion.button
                  onClick={() => setSelectedMode("free")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`comic-button font-bold text-outline text-left transition-all relative overflow-hidden ${
                        isMobile ? "p-3" : "p-5"
                      } ${
                    selectedMode === "free"
                          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-4 border-black shadow-lg"
                          : "bg-slate-700 text-white hover:bg-slate-600 border-2 border-slate-600"
                      }`}
                    >
                      {selectedMode === "free" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.1 }}
                          className="absolute inset-0 bg-white"
                        />
                      )}
                      <div className="relative z-10">
                        <div className={`flex items-center justify-between ${
                          isMobile ? "mb-1" : "mb-2"
                        }`}>
                          <div className={`flex items-center ${
                            isMobile ? "gap-1" : "gap-2"
                          }`}>
                            <span className={isMobile ? "text-base" : "text-xl"}>Free Word</span>
                            {selectedMode === "free" && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`comic-panel bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-black ${
                                  isMobile ? "p-0.5" : "p-1"
                                }`}
                              >
                                <CheckCircleIcon className={`text-white ${
                                  isMobile ? "w-3 h-3" : "w-5 h-5"
                                }`} />
                              </motion.div>
            )}
          </div>
                        </div>
                        <span className={`block opacity-90 mt-2 leading-relaxed ${
                          isMobile ? "text-xs" : "text-sm"
                        }`}>
                          Tapez n'importe quel mot valide commençant par la lettre
                        </span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Game Stats */}
        <AnimatePresence>
          {gameState && (!isMobile || !isKeyboardOpen) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`comic-panel-dark ${
                isMobile ? "p-2" : "p-6"
              }`}
            >
              <div className={`grid gap-2 md:gap-4 ${
                isMobile && isKeyboardOpen 
                  ? "grid-cols-3" 
                  : isMobile 
                    ? "grid-cols-3" 
                    : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
              }`}>
                <motion.div
                  className={`comic-panel bg-gradient-to-br from-purple-600 to-indigo-600 border-2 border-black text-center relative ${
                    isMobile ? "p-2" : "p-4"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  style={{ minHeight: isMobile ? "70px" : "100px" }}
                >
                  <div className={`text-white/80 mb-1 text-outline font-semibold ${
                    isMobile ? "text-[10px]" : "text-xs"
                  }`}>SCORE</div>
                  <div className={`font-bold text-white text-outline ${
                    isMobile ? "text-xl" : "text-3xl"
                  }`}>{gameState.score}</div>
                  <div style={{ height: "20px", position: "relative" }}>
                    {lastScoreIncrease > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        className="text-sm text-emerald-200 font-bold text-outline absolute inset-x-0"
                        style={{ top: 0 }}
                      >
                        +{lastScoreIncrease}
                      </motion.div>
                    )}
                </div>
                </motion.div>
                <motion.div
                  className={`comic-panel border-2 border-black text-center ${
                    gameState.lives <= 1
                      ? "bg-gradient-to-br from-red-600 to-orange-600 animate-comic-flash"
                      : "bg-gradient-to-br from-pink-600 to-rose-600"
                  } ${isMobile ? "p-2" : "p-4"}`}
                  whileHover={{ scale: 1.05 }}
                  style={{ minHeight: isMobile ? "70px" : "100px" }}
                >
                  <div className={`text-white/80 mb-1 text-outline font-semibold ${
                    isMobile ? "text-[10px]" : "text-xs"
                  }`}>VIES</div>
                  <div className={`font-bold text-white text-outline ${
                    isMobile ? "text-xl" : "text-3xl"
                  }`}>
                  {gameState.lives}
                </div>
                </motion.div>
                {(!isMobile || !isKeyboardOpen) && (
                  <>
                    <motion.div
                      className={`comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black text-center ${
                        isMobile ? "p-2" : "p-4"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      style={{ minHeight: isMobile ? "70px" : "100px" }}
                    >
                      <div className={`text-white/80 mb-1 text-outline font-semibold ${
                        isMobile ? "text-[10px]" : "text-xs"
                      }`}>NIVEAU</div>
                      <div className={`font-bold text-white text-outline ${
                        isMobile ? "text-xl" : "text-3xl"
                      }`}>
                  {gameState.level}
                </div>
                    </motion.div>
                    <motion.div
                      className={`comic-panel bg-gradient-to-br from-amber-600 to-yellow-600 border-2 border-black text-center ${
                        isMobile ? "p-2" : "p-4"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      style={{ minHeight: isMobile ? "70px" : "100px" }}
                    >
                      <div className={`flex items-center justify-center gap-1 text-white/80 mb-1 text-outline font-semibold ${
                        isMobile ? "text-[10px]" : "text-xs"
                      }`}>
                        <StarIcon className={isMobile ? "w-2 h-2" : "w-3 h-3"} />
                        MOTS
              </div>
                      <div className={`font-bold text-white text-outline ${
                        isMobile ? "text-xl" : "text-3xl"
                      }`}>
                  {gameState.wordsCompleted}
                </div>
                    </motion.div>
                  </>
                )}
                
                {/* Streak Display */}
                {gameState.streak > 0 && (!isMobile || !isKeyboardOpen) && (
                  <motion.div
                    className={`comic-panel bg-gradient-to-br from-orange-600 to-red-600 border-2 border-black text-center ${
                      isMobile ? "p-2" : "p-4"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    animate={gameState.streak >= 5 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: gameState.streak >= 5 ? Infinity : 0, repeatDelay: 1 }}
                    style={{ minHeight: isMobile ? "70px" : "100px" }}
                  >
                    <div className={`flex items-center justify-center gap-2 mb-1 ${
                      isMobile ? "gap-1" : ""
                    }`}>
                      <FireIcon className={isMobile ? "w-3 h-3" : "w-4 h-4 text-white"} />
                      <div className={`text-white/80 text-outline font-semibold ${
                        isMobile ? "text-[10px]" : "text-xs"
                      }`}>STREAK</div>
              </div>
                    <div className={`font-bold text-white text-outline ${
                      isMobile ? "text-xl" : "text-3xl"
                    }`}>{gameState.streak}</div>
                    {gameState.highestStreak > 0 && gameState.highestStreak !== gameState.streak && !isMobile && (
                      <div className="text-xs text-white/60 text-outline mt-1">Meilleur: {gameState.highestStreak}</div>
                    )}
                  </motion.div>
                )}
                
                {/* Combo Multiplier */}
                {gameState.combo > 1 && (!isMobile || !isKeyboardOpen) && (
                  <motion.div
                    className={`comic-panel bg-gradient-to-br from-yellow-500 to-orange-500 border-2 border-black text-center ${
                      isMobile ? "p-2" : "p-4"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                    style={{ minHeight: isMobile ? "70px" : "100px" }}
                  >
                    <div className={`text-white/80 mb-1 text-outline font-semibold ${
                      isMobile ? "text-[10px]" : "text-xs"
                    }`}>COMBO</div>
                    <div className={`font-bold text-white text-outline ${
                      isMobile ? "text-xl" : "text-3xl"
                    }`}>×{gameState.combo}</div>
                    {!isMobile && (
                      <div className="text-xs text-white/60 text-outline mt-1">Multiplicateur</div>
                    )}
                  </motion.div>
                )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Main Game Area */}
        <AnimatePresence mode="wait">
          {gameState && (
            <motion.div
              key={gameState.isRunning ? "running" : "stopped"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="comic-panel-dark relative overflow-hidden"
              style={{
                height: isMobile ? (isKeyboardOpen ? "250px" : "300px") : "500px",
                minHeight: isMobile ? (isKeyboardOpen ? "250px" : "300px") : "500px",
                maxHeight: isMobile ? (isKeyboardOpen ? "250px" : "300px") : "500px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)",
                position: "relative",
                contain: "layout style paint",
              }}
            >
                  {/* Background Flash Effect */}
                  <AnimatePresence>
                    {backgroundFlash && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.3, 0.2, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 0.5,
                          ease: "easeOut"
                        }}
                        className={`absolute inset-0 z-0 pointer-events-none rounded-lg ${
                          backgroundFlash === "green" 
                            ? "bg-green-400" 
                            : "bg-red-400"
                        }`}
                        style={{
                          mixBlendMode: "screen",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Decorative background elements */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-500 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
                  </div>

                  {/* Celebration Particles */}
                  <AnimatePresence>
                    {particles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        initial={{ 
                          opacity: 0, 
                          scale: 0,
                          x: `${particle.x}%`,
                          y: `${particle.y}%`,
                        }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: `${particle.x + (Math.random() - 0.5) * 40}%`,
                          y: `${particle.y + (Math.random() - 0.5) * 40}%`,
                        }}
                        transition={{ 
                          delay: particle.delay,
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                        className="absolute z-20 pointer-events-none"
                        style={{
                          left: "50%",
                          top: "50%",
                        }}
                      >
                        <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg" />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Celebration Overlay */}
                  <AnimatePresence>
                    {showCelebration && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          willChange: "transform, opacity",
                        }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className="text-6xl"
                          style={{
                            willChange: "transform",
                            transformOrigin: "center center",
                          }}
                        >
                          ✓
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                {/* Falling Word */}
                {gameState?.activeWord && (
                  <motion.div
                      initial={{ top: "-60px", scale: 0.8, opacity: 0 }}
                      animate={{ 
                        top: `${Math.max(-60, Math.min(isMobile ? (isKeyboardOpen ? 250 : 300) : 500, (gameState.activeWord.y / 100) * (isMobile ? (isKeyboardOpen ? 310 : 360) : 560) - 60))}px`,
                        scale: 1,
                        opacity: 1,
                      }}
                    transition={{ duration: 0.1, ease: "linear" }}
                      className="absolute left-1/2 transform -translate-x-1/2 z-10"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.02, 1],
                          rotate: [0, 1, -1, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`comic-panel bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 border-4 border-black shadow-2xl ${
                          isMobile ? "px-3 py-2 border-2" : "px-6 py-4"
                        }`}
                    style={{
                          boxShadow: "0 8px 0 0 #000, 0 12px 24px rgba(6, 182, 212, 0.4)",
                        }}
                      >
                        <div className={`font-bold text-white text-outline text-center ${
                          isMobile ? "text-xl" : "text-3xl md:text-5xl"
                        }`}>
                          {gameState.activeWord.text || ""}
                      </div>
                        {gameState.activeWord.translation && (
                          <div className={`font-bold text-white text-outline text-center mt-2 ${
                            isMobile ? "text-xl" : "text-3xl md:text-5xl"
                          }`}>
                            {(() => {
                              // Clean translation for display: remove parentheses, slashes, and take first part
                              let cleaned = gameState.activeWord.translation || '';
                              // Remove everything in parentheses
                              cleaned = cleaned.replace(/\([^()]*\)/g, '');
                              // Take first part before "/"
                              if (cleaned.includes('/')) {
                                cleaned = cleaned.split('/')[0].trim();
                              }
                              // Take first part before ","
                              if (cleaned.includes(',')) {
                                cleaned = cleaned.split(',')[0].trim();
                              }
                              // Clean up spaces
                              cleaned = cleaned.replace(/\s+/g, ' ').trim();
                              return cleaned;
                            })()}
                    </div>
                        )}
                      </motion.div>
                  </motion.div>
                )}

                {/* Game Over Overlay */}
                {gameState?.gameOver && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center z-40"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="comic-panel-dark p-8 text-center max-w-md"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: 2 }}
                          className="mb-4"
                        >
                          <TrophyIcon className="w-16 h-16 text-yellow-400 mx-auto" />
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-outline mb-4">
                        Game Over!
                      </h2>
                        <p className="text-xl md:text-2xl text-slate-200 text-outline mb-2">
                          Score Final: {gameState.score}
                      </p>
                      <p className="text-base md:text-lg text-slate-300 text-outline mb-6">
                          Mots Complétés: {gameState.wordsCompleted}
                        </p>
                        {scoreSubmitted ? (
                          <div className="space-y-3 mb-6">
                            <p className="text-sm text-emerald-300 text-outline">
                              ✅ Score sauvegardé avec succès!
                            </p>
                            {submissionResult?.isNewPersonalBest && (
                              <p className="text-sm text-cyan-300 text-outline">
                                🎉 Nouveau record personnel!
                              </p>
                            )}
                            {submissionResult?.isNewGlobalBest && (
                              <p className="text-sm text-yellow-300 text-outline font-bold">
                                🏆 Nouveau record mondial!
                              </p>
                            )}
                    </div>
                        ) : submissionError ? (
                          <p className="text-sm text-red-300 text-outline mb-6">
                            ⚠️ {submissionError}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 text-outline mb-6">
                            Sauvegarde en cours...
                          </p>
                        )}
                        <motion.button
                          onClick={() => {
                            initializeGame(selectedMode);
                            setScoreSubmitted(false);
                            setSubmissionError(null);
                            setSubmissionResult(null);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="comic-button bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 text-lg font-bold hover:from-emerald-700 hover:to-green-700 border-4 border-black"
                        >
                          Rejouer
                        </motion.button>
                      </motion.div>
                    </motion.div>
                )}

                {/* Pause Overlay */}
                {isPaused && !gameState?.gameOver && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center z-40"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="comic-panel-dark p-8 text-center"
                      >
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-outline mb-6">
                          Pause
                      </h2>
                        <motion.button
                        onClick={handlePauseToggle}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="comic-button bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 text-lg font-bold hover:from-cyan-700 hover:to-blue-700 border-4 border-black"
                        >
                          Reprendre
                        </motion.button>
                      </motion.div>
                    </motion.div>
                )}

                {/* Start Screen */}
                {gameState && !gameState.isRunning && !gameState.gameOver && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center z-30"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="comic-panel-dark p-8 text-center max-w-md"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mb-6"
                        >
                          <BookOpenIcon className="w-16 h-16 text-cyan-400 mx-auto" />
                        </motion.div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-outline mb-4">
                        {selectedMode === "exact" ? "Exact Word Mode" : "Free Word Mode"}
                      </h2>
                        <p className="text-base md:text-lg text-slate-200 text-outline mb-6">
                        {selectedMode === "exact"
                            ? "Tapez le mot anglais puis sa traduction française (ex: BOOK livre)!"
                            : "Tapez n'importe quel mot valide commençant par la lettre affichée!"}
                      </p>
                        <motion.button
                        onClick={handleStartGame}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="comic-button bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 text-lg font-bold hover:from-emerald-700 hover:to-green-700 border-4 border-black animate-comic-glow"
                        >
                          <span className="flex items-center gap-2 justify-center">
                            <LightningIcon className="w-6 h-6" />
                            Commencer
                          </span>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Used Words Panel (Free Mode) */}
        <AnimatePresence>
          {selectedMode === "free" && gameState && gameState.isRunning && !gameState.gameOver && (!isMobile || !isKeyboardOpen) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`comic-panel-dark overflow-hidden ${
                isMobile ? "p-3" : "p-6"
              }`}
              style={{ 
                maxHeight: isMobile ? "150px" : "300px", 
                overflowY: "auto",
                minHeight: gameState.usedWords.length === 0 ? (isMobile ? "80px" : "120px") : (isMobile ? "100px" : "150px")
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-bold text-white text-outline">
                  Mots Utilisés
                  </h3>
              </div>
              {gameState.usedWords.length === 0 ? (
                    <p className="text-sm md:text-base text-slate-400 text-outline">
                  Aucun mot utilisé pour le moment
                    </p>
                  ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  <AnimatePresence>
                    {gameState.usedWords.slice(-5).map((word, index) => (
                      <motion.div
                        key={`${word}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.03 }}
                        className="comic-panel bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-black px-3 py-2 text-center"
                        >
                          <span className="text-sm md:text-base font-semibold text-white text-outline">
                            {word}
                          </span>
                      </motion.div>
                      ))}
                  </AnimatePresence>
                    </div>
                  )}
            </motion.div>
            )}
        </AnimatePresence>

          {/* Input Area */}
        <AnimatePresence>
          {gameState?.isRunning && !gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`space-y-4 ${
                isMobile && isKeyboardOpen ? "sticky bottom-0 z-50 bg-slate-900/95 backdrop-blur-sm pb-2 pt-2" : ""
              }`}
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitWord(e);
                }}
                className={`flex gap-2 md:gap-4 ${
                  isMobile ? "flex-col" : "flex-col md:flex-row"
                }`}
              >
                <motion.input
                  type="text"
                  value={wordInput}
                  onChange={(e) => {
                    // For exact mode, preserve case (needed for French translation)
                    // For free mode, convert to uppercase
                    const value = selectedMode === "exact" 
                      ? e.target.value 
                      : e.target.value.toUpperCase();
                    setWordInput(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitWord(e);
                    }
                  }}
                  placeholder={selectedMode === "exact" ? "MOT traduction (ex: BOOK livre)" : "Tapez un mot commençant par la lettre..."}
                  className={`flex-1 comic-panel-dark border-4 border-black font-bold text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isMobile ? "px-3 py-3 text-base border-2" : "px-6 py-4 text-lg"
                  }`}
                  autoFocus
                  disabled={isPaused}
                  whileFocus={{ scale: 1.02 }}
                  onFocus={(e) => {
                    // Prevent scroll on focus
                    if (isMobile) {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    } else {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                />
                <div className={`flex gap-2 md:gap-4 ${
                  isMobile ? "flex-row" : ""
                }`}>
                  <motion.button
                    type="submit"
                  disabled={isPaused || !wordInput.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`comic-button bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold hover:from-emerald-700 hover:to-green-700 border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed ${
                      isMobile ? "px-4 py-3 text-base border-2 flex-1" : "px-8 py-4 text-lg"
                    }`}
                  >
                    <span className={`flex items-center gap-2 justify-center ${
                      isMobile ? "gap-1" : ""
                    }`}>
                      <CheckCircleIcon className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                      {isMobile ? "OK" : "Valider"}
                    </span>
                  </motion.button>
                  {(!isMobile || !isKeyboardOpen) && (
                    <motion.button
                  onClick={handlePauseToggle}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`comic-button bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold hover:from-amber-700 hover:to-yellow-700 border-4 border-black ${
                        isMobile ? "px-4 py-3 text-base border-2" : "px-6 py-4 text-lg"
                      }`}
                    >
                      {isPaused ? "Reprendre" : "Pause"}
                    </motion.button>
                  )}
              </div>
              </form>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="comic-panel bg-gradient-to-br from-red-600 to-orange-600 border-4 border-black p-4 overflow-hidden"
                    style={{ minHeight: "60px" }}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <XCircleIcon className="w-5 h-5 text-white" />
                      <p className="text-base font-bold text-white text-outline text-center">
                      {errorMessage}
                    </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Instructions */}
        <AnimatePresence>
          {!gameState?.isRunning && !gameState?.gameOver && (!isMobile || !isKeyboardOpen) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`comic-panel-dark ${
                isMobile ? "p-3" : "p-6"
              }`}
              style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)" }}
            >
              <div className={`flex items-start ${
                isMobile ? "gap-2" : "gap-4"
              }`}>
                <div className={`comic-panel bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-black flex-shrink-0 ${
                  isMobile ? "p-2" : "p-3"
                }`}>
                  <BookOpenIcon className={`text-white ${
                    isMobile ? "w-4 h-4" : "w-6 h-6"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-white text-outline mb-1 ${
                    isMobile ? "text-base" : "text-xl"
                  }`}>
                    Comment jouer
              </h3>
                  {!isMobile && (
                    <p className="text-slate-300 text-outline text-sm mb-4">
                      {selectedMode === "exact" ? "Mode Exact" : "Mode Libre"}
                    </p>
                  )}
                  <div className="space-y-2.5 text-slate-200 text-outline">
                {selectedMode === "exact" ? (
                  <>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Les mots tombent du haut de l'écran</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Tapez le mot anglais puis sa traduction française</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Format: <strong className="text-cyan-300">MOT traduction</strong> (ex: <span className="text-emerald-300">BOOK livre</span>)</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Vous perdez une vie si un mot atteint le bas</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Le jeu s'accélère très doucement au fur et à mesure</span>
                        </div>
                  </>
                ) : (
                  <>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Une lettre tombe du haut de l'écran</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Tapez n'importe quel mot anglais valide commençant par cette lettre</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Chaque mot ne peut être utilisé qu'une fois par partie</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Vous perdez une vie si la lettre atteint le bas</span>
                        </div>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                          <span className="text-cyan-400 font-bold mt-0.5 text-lg">•</span>
                          <span className="flex-1">Le jeu s'accélère au fur et à mesure</span>
                        </div>
                  </>
                )}
              </div>
            </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Leaderboard - Show when game is not running */}
        <AnimatePresence>
          {!gameState?.isRunning && !gameState?.gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WordfallLeaderboard initialMode={selectedMode} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Best Display - Show when game is not running, after leaderboard */}
        <AnimatePresence>
          {!gameState?.isRunning && !gameState?.gameOver && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PersonalBestDisplay 
                selectedMode={selectedMode} 
                currentScore={gameState?.gameOver ? gameState.score : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
