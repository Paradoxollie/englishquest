"use client";

/**
 * Flash Translation Game Page
 * 
 * A reaction speed game where players must quickly select the correct
 * English translation of French words.
 * Refined to match the "Comic/Marvel" aesthetic of the platform.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    type GameState,
    type GameConfig,
    createGameState,
    startGame,
    startAnswering,
    submitAnswer,
    nextRound,
    getCurrentRound,
    getFinalScore,
    getAverageReactionTime,
    VOCABULARY,
} from "@/lib/games/flashTranslation";
import {
    LightningIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    TrophyIcon,
    FireIcon,
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { submitFlashTranslationScore } from "./actions";
import { FlashTranslationLeaderboard } from "./leaderboard";
import { TopScoresDisplay } from "./top-scores-display";

const DEFAULT_CONFIG: GameConfig = {
    totalRounds: 10,
    minWaitMs: 2000,
    maxWaitMs: 4000,
    wrongAnswerPenaltyMs: 5000,
};

export default function FlashTranslationPage() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState<GameState | null>(() =>
        createGameState(VOCABULARY, DEFAULT_CONFIG)
    );
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);

    // New State for "Juice"
    const [combo, setCombo] = useState(0);
    const [shake, setShake] = useState(0); // For screen shake

    const waitTimerRef = useRef<NodeJS.Timeout | null>(null);
    const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Handle start game
    const handleStartGame = useCallback(() => {
        if (!gameState) return;
        const newState = startGame(gameState);
        setGameState(newState);
        setIsGameStarted(true);
        setIsGameEnded(false);
        setScoreSubmitted(false);
        setShowLeaderboard(false);
        setCombo(0); // Reset combo
    }, [gameState]);

    // Handle wait timer (show choices after wait time)
    useEffect(() => {
        if (!gameState || !isGameStarted || gameState.phase !== "waiting") {
            if (waitTimerRef.current) {
                clearTimeout(waitTimerRef.current);
                waitTimerRef.current = null;
            }
            return;
        }

        const currentRound = getCurrentRound(gameState);
        if (!currentRound) return;

        waitTimerRef.current = setTimeout(() => {
            const now = Date.now();
            setGameState(prev => prev ? startAnswering(prev, now) : prev);
        }, currentRound.waitTimeMs);

        return () => {
            if (waitTimerRef.current) {
                clearTimeout(waitTimerRef.current);
                waitTimerRef.current = null;
            }
        };
    }, [gameState, isGameStarted]);

    // Handle answer selection
    const handleSelectChoice = useCallback((choiceIndex: number) => {
        if (!gameState || gameState.phase !== "answering") return;

        const currentRound = getCurrentRound(gameState);
        if (!currentRound) return;

        const isCorrect = choiceIndex === currentRound.correctIndex;

        // Visual "Juice" Logic with styling update
        if (isCorrect) {
            setCombo(prev => prev + 1);
        } else {
            setCombo(0);
            setShake(prev => prev + 1);
        }

        const now = Date.now();
        const newState = submitAnswer(gameState, choiceIndex, now);
        setGameState(newState);
        setSelectedChoice(choiceIndex);

        feedbackTimerRef.current = setTimeout(() => {
            setSelectedChoice(null);
            const nextState = nextRound(newState);
            setGameState(nextState);

            if (nextState.phase === "ended") {
                setIsGameEnded(true);
            }
        }, 1200);
    }, [gameState]);

    // Keyboard controls
    useEffect(() => {
        if (!gameState || gameState.phase !== "answering") return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" || e.key === "1") {
                e.preventDefault();
                handleSelectChoice(0);
            } else if (e.key === "ArrowRight" || e.key === "2") {
                e.preventDefault();
                handleSelectChoice(1);
            } else if (e.key === "ArrowDown" || e.key === "3") {
                e.preventDefault();
                handleSelectChoice(2);
            } else if (e.key === "ArrowLeft" || e.key === "4") {
                e.preventDefault();
                handleSelectChoice(3);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState, handleSelectChoice]);

    // Submit score when game ends
    useEffect(() => {
        async function handleGameEnd() {
            if (!isGameEnded || !gameState || !user || scoreSubmitted) return;

            const finalScore = getFinalScore(gameState);
            const avgReactionTime = getAverageReactionTime(gameState);

            try {
                const result = await submitFlashTranslationScore({
                    totalTimeMs: finalScore,
                    averageReactionTimeMs: avgReactionTime,
                    wrongAnswers: gameState.wrongAnswers,
                    roundsCompleted: gameState.rounds.length,
                });

                if (result.success && result.rewards) {
                    setScoreSubmitted(true);
                }
            } catch (error) {
                console.error("Error submitting score:", error);
            }
        }

        handleGameEnd();
    }, [isGameEnded, gameState, user, scoreSubmitted]);

    // Cleanup timers
    useEffect(() => {
        return () => {
            if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, []);

    const currentRound = gameState ? getCurrentRound(gameState) : undefined;
    const progress = gameState ? ((gameState.currentRoundIndex + 1) / gameState.rounds.length) * 100 : 0;

    if (!gameState) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <LightningIcon className="w-12 h-12 text-amber-500 animate-pulse mx-auto mb-4" />
                    <p className="text-white text-lg font-bold">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern overflow-hidden relative"
            animate={shake > 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            <div className="max-w-6xl mx-auto px-4 py-6 relative z-10 font-sans">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="comic-panel-dark p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="comic-panel bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-black p-3 shadow-[2px_2px_0_0_#000]">
                            <LightningIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-wider text-outline">
                                Flash <span className="text-amber-500">Translation</span>
                            </h1>
                            <p className="text-slate-300 text-sm md:text-base text-outline hidden md:block">
                                Test de réflexes et vocabulaire ultrarapide
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/play"
                        className="comic-button bg-slate-700 text-white px-6 py-2 hover:bg-slate-600 transition-all font-bold text-sm border-2 border-black"
                    >
                        QUITTER
                    </Link>
                </motion.div>

                {/* Game Container */}
                <main className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* 1. START SCREEN */}
                        {!isGameStarted && !isGameEnded && (
                            <motion.div
                                key="start-screen"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="comic-panel-dark p-8 md:p-12 text-center"
                            >
                                <div className="mb-8 relative inline-block">
                                    <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20 animate-pulse" />
                                    <div className="comic-panel bg-gradient-to-br from-amber-500 to-yellow-500 border-4 border-black p-6 rotate-3">
                                        <LightningIcon className="w-16 h-16 text-white drop-shadow-md" />
                                    </div>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight text-outline">
                                    Prêt pour le <span className="text-amber-500">Challenge ?</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                                    <div className="comic-panel bg-slate-800 p-4 border-2 border-black">
                                        <ClockIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                                        <div className="font-bold text-white text-outline">VITESSE</div>
                                        <div className="text-xs text-slate-300">Le temps est la clé</div>
                                    </div>
                                    <div className="comic-panel bg-slate-800 p-4 border-2 border-black">
                                        <LightningIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <div className="font-bold text-white text-outline">COMBOS</div>
                                        <div className="text-xs text-slate-300">Enchaînez sans erreur</div>
                                    </div>
                                    <div className="comic-panel bg-slate-800 p-4 border-2 border-black">
                                        <TrophyIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                        <div className="font-bold text-white text-outline">GLOIRE</div>
                                        <div className="text-xs text-slate-300">Grimpez le classement</div>
                                    </div>
                                </div>

                                <div className="mb-10 flex justify-center">
                                    <div className="comic-panel border-2 border-black bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white text-outline">
                                        Mauvaise reponse = +5 secondes
                                    </div>
                                </div>

                                <motion.button
                                    onClick={handleStartGame}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="comic-button px-12 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-black text-xl text-white shadow-[0_4px_0_0_#000]"
                                >
                                    <span className="relative flex items-center gap-3 text-outline">
                                        JOUER MAINTENANT <LightningIcon className="w-6 h-6 animate-pulse" />
                                    </span>
                                </motion.button>

                                <div className="mt-12 pt-8 border-t-2 border-slate-700">
                                    <TopScoresDisplay />
                                </div>
                            </motion.div>
                        )}

                        {/* 2. GAMEPLAY */}
                        {isGameStarted && !isGameEnded && currentRound && (
                            <div key="gameplay" className="relative space-y-4">
                                {/* HUD Stats */}
                                <div className="comic-panel-dark p-4 grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
                                    {/* Score / Progress */}
                                    <div className="flex flex-col">
                                        <div className="text-xs font-bold text-slate-400 uppercase">PROGRESSION</div>
                                        <div className="h-4 bg-slate-800 rounded-full border-2 border-black overflow-hidden mt-1 relative">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <div className="text-right text-xs text-white font-bold mt-1">
                                            {gameState.currentRoundIndex + 1} / {gameState.rounds.length}
                                        </div>
                                    </div>

                                    {/* Timer - Center */}
                                    <div className="flex justify-center">
                                        <div className="comic-panel bg-slate-800 border-2 border-black px-6 py-2 text-center min-w-[120px]">
                                            <div className="text-xs text-slate-400 font-bold uppercase mb-1">TEMPS</div>
                                            <div className="text-2xl font-black text-white tabular-nums tracking-tight text-outline">
                                                {(gameState.totalTimeMs / 1000).toFixed(2)}s
                                            </div>
                                        </div>
                                    </div>

                                    {/* Combo - Right (Hidden on small mobile if needed, or stacked) */}
                                    <div className="flex justify-end relative">
                                        <AnimatePresence>
                                            {combo > 1 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                                    animate={{ opacity: 1, scale: 1, rotate: -5 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="comic-panel bg-gradient-to-r from-amber-500 to-orange-600 border-2 border-black px-4 py-2 shadow-[4px_4px_0_0_#000]"
                                                >
                                                    <span className="font-black text-white text-lg italic text-outline flex items-center gap-2">
                                                        <FireIcon className="w-5 h-5 animate-bounce" />
                                                        {combo}x COMBO
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* GAME AREA PANEL */}
                                <motion.div
                                    className="comic-panel-dark p-6 md:p-10 relative overflow-hidden min-h-[400px] flex flex-col justify-center"
                                    layout
                                >
                                    {/* WAITING PHASE */}
                                    {gameState.phase === "waiting" && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.1 }}
                                            className="text-center py-8"
                                        >
                                            <div className="inline-block px-4 py-1 bg-slate-700 border-2 border-black rounded-lg text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider">
                                                PRÉPAREZ-VOUS...
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-[4px_4px_0_#000] text-outline">
                                                {currentRound.wordPair.french}
                                            </h2>
                                            <div className="mt-8 flex justify-center">
                                                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ANSWERING & FEEDBACK PHASE */}
                                    {(gameState.phase === "answering" || gameState.phase === "feedback") && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="relative z-10 w-full"
                                        >
                                            <div className="text-center mb-10">
                                                <div className="inline-block px-4 py-1 bg-slate-700 border-2 border-black rounded-lg text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">
                                                    TRADUISEZ CE MOT
                                                </div>
                                                <h2 className="text-5xl md:text-7xl font-black text-white drop-shadow-[4px_4px_0_#000] text-outline break-words">
                                                    {currentRound.wordPair.french}
                                                </h2>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentRound.choices.map((choice, index) => {
                                                    const isSelected = index === selectedChoice;
                                                    const isCorrect = choice.isCorrect;

                                                    // Determine visual state with strict Comic styles
                                                    let buttonStyle = "bg-slate-800 text-slate-200 border-black"; // Default

                                                    if (gameState.phase === "feedback") {
                                                        if (isCorrect) {
                                                            buttonStyle = "bg-emerald-500 text-white border-black transform scale-[1.02] shadow-[0_0_0_4px_rgba(16,185,129,0.5)]";
                                                        } else if (isSelected && !isCorrect) {
                                                            buttonStyle = "bg-red-500 text-white border-black opacity-90";
                                                        } else {
                                                            buttonStyle = "bg-slate-900/50 text-slate-600 border-slate-800";
                                                        }
                                                    } else {
                                                        // Hover effect only during answering
                                                        buttonStyle += " hover:bg-slate-700 hover:border-amber-500 hover:text-white";
                                                    }

                                                    // Keyboard shortcuts labels
                                                    const shortcuts = ["↑", "→", "↓", "←"];
                                                    const shortcutLabel = shortcuts[index];

                                                    return (
                                                        <motion.button
                                                            key={index}
                                                            onClick={() => handleSelectChoice(index)}
                                                            disabled={gameState.phase !== "answering"}
                                                            whileHover={gameState.phase === "answering" ? { y: -2, boxShadow: "0 4px 0 0 #000" } : {}}
                                                            whileTap={gameState.phase === "answering" ? { y: 0, boxShadow: "0 0 0 0 #000" } : {}}
                                                            className={`comic-button relative p-6 text-xl font-bold transition-all duration-100 group overflow-hidden border-4 text-left ${buttonStyle}`}
                                                        >
                                                            <div className="relative z-10 flex items-center justify-between">
                                                                <span className="text-outline">{choice.text}</span>

                                                                <div className="flex items-center gap-3">
                                                                    {gameState.phase === "answering" && (
                                                                        <span className="hidden md:flex w-8 h-8 items-center justify-center rounded bg-black/40 text-xs font-bold border border-white/20 text-white/70">
                                                                            {shortcutLabel}
                                                                        </span>
                                                                    )}
                                                                    {gameState.phase === "feedback" && isCorrect && (
                                                                        <CheckCircleIcon className="w-8 h-8 text-white drop-shadow-md" />
                                                                    )}
                                                                    {gameState.phase === "feedback" && isSelected && !isCorrect && (
                                                                        <XCircleIcon className="w-8 h-8 text-white drop-shadow-md" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* COMIC BOOM FEEDBACK OVERLAY */}
                                    <AnimatePresence>
                                        {gameState.phase === "feedback" && selectedChoice !== null && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                                {currentRound.isCorrect ? (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -45 }}
                                                        animate={{ scale: 1.5, rotate: -12 }}
                                                        exit={{ scale: 2, opacity: 0 }}
                                                        transition={{ type: "spring", bounce: 0.6 }}
                                                        className="relative"
                                                    >
                                                        <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50" />
                                                        <div className="relative bg-gradient-to-br from-emerald-400 to-green-600 border-4 border-black px-8 py-4 shadow-[8px_8px_0_0_#000] rotate-3">
                                                            <span className="text-4xl font-black text-white text-outline italic">
                                                                EXCELLENT !
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: 45 }}
                                                        animate={{ scale: 1.2, rotate: 12 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        className="relative"
                                                    >
                                                        <div className="relative bg-gradient-to-br from-red-500 to-red-700 border-4 border-black px-8 py-4 shadow-[8px_8px_0_0_#000] -rotate-3">
                                                            <span className="text-4xl font-black text-white text-outline italic">
                                                                FAIL !
                                                            </span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        )}

                        {/* 3. END SCREEN */}
                        {isGameEnded && (
                            <motion.div
                                key="end-screen"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="comic-panel-dark p-8 md:p-12 text-center max-w-2xl mx-auto"
                            >
                                <div className="inline-block p-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-4 border-black shadow-[4px_4px_0_0_#000] mb-8">
                                    <TrophyIcon className="w-16 h-16 text-white" />
                                </div>

                                <h2 className="text-4xl font-black text-white mb-2 text-outline">MISSION TERMINÉE !</h2>
                                <p className="text-slate-300 mb-10 font-bold">Rapport de mission</p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="comic-panel bg-slate-800 p-6 border-2 border-black">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">TEMPS TOTAL</div>
                                        <div className="text-3xl font-black text-white text-outline">{(getFinalScore(gameState) / 1000).toFixed(2)}s</div>
                                    </div>
                                    <div className="comic-panel bg-slate-800 p-6 border-2 border-black">
                                        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">ERREURS</div>
                                        <div className={`text-3xl font-black text-outline ${gameState.wrongAnswers === 0 ? "text-emerald-400" : "text-red-400"}`}>
                                            {gameState.wrongAnswers}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                    <motion.button
                                        onClick={() => {
                                            const newState = createGameState(VOCABULARY, DEFAULT_CONFIG);
                                            setGameState(newState);
                                            setIsGameStarted(false);
                                            setIsGameEnded(false);
                                            setScoreSubmitted(false);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="comic-button bg-white text-slate-900 px-8 py-4 font-black hover:bg-slate-200"
                                    >
                                        REJOUER
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setShowLeaderboard(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="comic-button bg-slate-700 text-white px-8 py-4 font-bold hover:bg-slate-600"
                                    >
                                        CLASSEMENT
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Leaderboard Overlay */}
                    <AnimatePresence>
                        {showLeaderboard && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            >
                                <div className="w-full max-w-2xl">
                                    <div className="comic-panel-dark overflow-hidden">
                                        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-slate-800">
                                            <h3 className="text-xl font-bold text-white text-outline">CLASSEMENT GLOBAL</h3>
                                            <button
                                                onClick={() => setShowLeaderboard(false)}
                                                className="comic-button px-3 py-1 bg-slate-700 text-white hover:bg-slate-600 text-sm"
                                            >
                                                FERMER
                                            </button>
                                        </div>
                                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                            <FlashTranslationLeaderboard />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </motion.div>
    );
}
