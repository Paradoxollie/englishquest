"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    type GameState,
    createGameState,
    startGame,
    nextRound,
    submitDecision,
} from "@/lib/games/echoLex";
import {
    ClockIcon,
    TrophyIcon,
    StarIcon,
    XCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FireIcon
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { submitEchoLexScore } from "./actions";
import { EchoLexLeaderboard } from "./leaderboard";
import { TopScoresDisplay } from "./top-scores-display";
import { ComboCounter, HitEffect, TimelineBar, FireBackground } from "./flashback-effects";

const TIMER_SECONDS = 5;

export default function EchoLexPage() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameEnded, setIsGameEnded] = useState(false);

    // Timer state for rendering
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [gameStartTime, setGameStartTime] = useState(0);

    // Arcade States
    const [combo, setCombo] = useState(0);
    const [hitEffects, setHitEffects] = useState<{ id: number; type: "hit" | "miss" }[]>([]);
    const [shake, setShake] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize game
    useEffect(() => {
        setGameState(createGameState());
    }, []);

    const handleStartGame = useCallback(() => {
        if (!gameState) return;
        const newState = startGame(gameState);
        setGameState(newState);
        setIsGameStarted(true);
        setIsGameEnded(false);
        setTimeLeft(TIMER_SECONDS);
        setGameStartTime(Date.now());
        setScoreSubmitted(false);
        setSubmissionResult(null);
        setCombo(0);
        setShowLeaderboard(false);
    }, [gameState]);

    const handleDecision = useCallback((saysIsSeen: boolean, isTimeout = false) => {
        if (!gameState || gameState.phase !== "playing") return;

        let resState = submitDecision(gameState, saysIsSeen);

        // Arcade Logic
        const isCorrect = resState.lastDecisionCorrect;

        if (isCorrect) {
            setCombo(c => c + 1);
            setHitEffects(prev => [...prev, { id: Date.now(), type: "hit" }]);
            setShake(prev => prev + 1);
        } else {
            setCombo(0);
            setHitEffects(prev => [...prev, { id: Date.now(), type: "miss" }]);
            setShake(prev => prev + 5);
        }

        setGameState(resState);

        if (resState.phase === "gameOver") {
            setIsGameEnded(true);
        } else {
            // Instant transition
            setTimeout(() => {
                setGameState((prev) => prev ? nextRound(prev) : null);
                setTimeLeft(TIMER_SECONDS);
            }, 600);
        }
    }, [gameState]);

    // Timer logic
    useEffect(() => {
        if (isGameStarted && !isGameEnded && gameState?.phase === "playing") {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0.1) {
                        handleDecision(false, true);
                        return TIMER_SECONDS;
                    }
                    return prev - 0.1;
                });
            }, 100);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [handleDecision, isGameStarted, isGameEnded, gameState?.phase]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isGameStarted || isGameEnded || gameState?.phase !== "playing") return;

            if (e.key === "ArrowLeft") {
                handleDecision(false);
            }
            if (e.key === "ArrowRight") {
                handleDecision(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isGameStarted, isGameEnded, gameState, handleDecision]);

    // Submit score
    useEffect(() => {
        if (isGameEnded && gameState && user && !scoreSubmitted) {
            const duration = Date.now() - gameStartTime;

            submitEchoLexScore({
                score: gameState.score,
                durationMs: duration
            }).then(res => {
                setSubmissionResult(res);
                setScoreSubmitted(true);
            });
        }
    }, [isGameEnded, gameState, user, scoreSubmitted, gameStartTime]);

    // Cleanup hit effects
    useEffect(() => {
        if (hitEffects.length > 0) {
            const timer = setTimeout(() => {
                setHitEffects(prev => prev.slice(1));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hitEffects]);

    if (!gameState) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <StarIcon className="w-12 h-12 text-amber-500 animate-pulse mx-auto mb-4" />
                    <p className="text-white text-lg font-bold">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 comic-dot-pattern overflow-hidden relative"
            animate={shake > 0 ? { x: [-shake, shake, -shake, shake, 0] } : {}}
            transition={{ duration: 0.3 }}
        >
            <div className="max-w-6xl mx-auto px-4 py-6 relative z-10 font-sans">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="comic-panel-dark p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="comic-panel bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-black p-3 shadow-[2px_2px_0_0_#000]">
                            <StarIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-wider text-outline">
                                Flash<span className="text-indigo-400">back</span>
                            </h1>
                            <p className="text-slate-300 text-sm md:text-base text-outline hidden md:block">
                                Mémorisation et réflexes arcade
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
                <main className="max-w-4xl mx-auto relative">
                    <AnimatePresence mode="wait">
                        {/* 1. START SCREEN */}
                        {!isGameStarted && !isGameEnded && (
                            <motion.div
                                key="start-screen"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="comic-panel-dark p-8 md:p-12 text-center overflow-hidden relative"
                            >
                                {/* Background flare */}
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500 blur-[80px] opacity-20" />
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 blur-[80px] opacity-20" />

                                <div className="mb-8 relative inline-block">
                                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 animate-pulse" />
                                    <motion.div
                                        animate={{ rotate: [3, -3, 3] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="comic-panel bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-black p-6 rotate-3 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]"
                                    >
                                        <StarIcon className="w-16 h-16 text-white drop-shadow-md" />
                                    </motion.div>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight text-outline skew-x-[-5deg]">
                                    Défi de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Mémoire</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                                    <motion.div whileHover={{ y: -5 }} className="comic-panel bg-slate-800 p-6 border-2 border-black shadow-[4px_4px_0_0_#000]">
                                        <ClockIcon className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                                        <div className="font-black text-white text-lg text-outline uppercase">RAPIDITÉ</div>
                                        <div className="text-sm text-slate-400 font-bold">Décidez en 5s</div>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="comic-panel bg-slate-800 p-6 border-2 border-black shadow-[4px_4px_0_0_#000]">
                                        <FireIcon className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                                        <div className="font-black text-white text-lg text-outline uppercase">COMBO</div>
                                        <div className="text-sm text-slate-400 font-bold">Multipliez les points</div>
                                    </motion.div>
                                    <motion.div whileHover={{ y: -5 }} className="comic-panel bg-slate-800 p-6 border-2 border-black shadow-[4px_4px_0_0_#000]">
                                        <TrophyIcon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                                        <div className="font-black text-white text-lg text-outline uppercase">LÉGENDE</div>
                                        <div className="text-sm text-slate-400 font-bold">Battez les records</div>
                                    </motion.div>
                                </div>

                                <motion.button
                                    onClick={handleStartGame}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="comic-button w-full md:w-auto px-12 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient rounded-xl font-black text-2xl text-white shadow-[0_6px_0_0_#000] border-4 border-black"
                                >
                                    <span className="relative flex items-center justify-center gap-3 text-outline uppercase tracking-wider">
                                        LANCER LA PARTIE <StarIcon className="w-8 h-8 animate-pulse text-yellow-300" />
                                    </span>
                                </motion.button>

                                <div className="mt-12 pt-8 border-t-2 border-slate-700/50">
                                    <TopScoresDisplay />
                                </div>
                            </motion.div>
                        )}

                        {/* 2. GAMEPLAY */}
                        {isGameStarted && !isGameEnded && (
                            <div key="gameplay" className="relative">
                                {/* Effects embedded in container */}
                                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-xl">
                                    <FireBackground intensity={combo} />
                                    {hitEffects.map(effect => (
                                        <HitEffect key={effect.id} type={effect.type} id={effect.id} />
                                    ))}
                                </div>

                                <div className="relative z-10 space-y-6">
                                    {/* HUD Stats - Improved Layout with Visible Combo */}
                                    <div className="comic-panel-dark p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 items-center shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
                                        {/* Score */}
                                        <div className="flex flex-col pl-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SCORE</div>
                                            <div className="text-3xl font-black text-white text-outline tracking-wider">{gameState.score}</div>
                                        </div>

                                        {/* Combo Display - Center Left */}
                                        <div className="flex flex-col items-center justify-center border-l-2 border-r-2 border-slate-800 h-full px-4">
                                            <div className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1 mb-1">
                                                <FireIcon className="w-3 h-3" /> COMBO
                                            </div>
                                            <motion.div
                                                key={combo}
                                                initial={{ scale: 1.5, color: "#fbbf24" }}
                                                animate={{ scale: 1, color: combo > 1 ? "#fbbf24" : "#cbd5e1" }}
                                                className={`text-4xl font-black text-outline italic ${combo > 1 ? "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" : ""}`}
                                            >
                                                {combo}x
                                            </motion.div>
                                        </div>

                                        {/* Timer takes less space now or fits in */}
                                        <div className="flex justify-center flex-col items-center w-full px-2">
                                            <TimelineBar timeLeft={timeLeft} totalTime={TIMER_SECONDS} />
                                        </div>

                                        {/* Lives */}
                                        <div className="flex justify-end gap-2 pr-2">
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ scale: i < gameState.strikes ? [1, 1.2, 1] : 1 }}
                                                    className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all duration-300 shadow-[2px_2px_0_0_#000] ${i < gameState.strikes ? "bg-red-600 grayscale" : "bg-gradient-to-br from-emerald-400 to-green-600"}`}
                                                >
                                                    {i < gameState.strikes ? <XCircleIcon className="w-6 h-6 text-white opacity-50" /> : <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_5px_white]" />}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CARD AREA */}
                                    <div className="perspective-1000 h-[380px]">
                                        <motion.div
                                            key={gameState.currentWord.english}
                                            initial={{ rotateX: -90, opacity: 0 }}
                                            animate={{ rotateX: 0, opacity: 1 }}
                                            exit={{ rotateX: 90, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="h-full w-full comic-panel-dark bg-slate-800 border-4 border-black flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                                        >
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                                            <h2 className="text-5xl md:text-7xl font-black text-white text-outline mb-8 drop-shadow-xl text-center">
                                                {gameState.currentWord.english}
                                            </h2>

                                            <div className="w-full max-w-sm h-px bg-slate-700 mb-8" />

                                            <div className="bg-indigo-900/50 px-8 py-3 rounded-xl border-2 border-indigo-500/30 backdrop-blur-sm">
                                                <p className="text-3xl font-bold text-indigo-200 italic">
                                                    {gameState.currentWord.french}
                                                </p>
                                            </div>

                                            {/* Result Overlay */}
                                            {gameState.phase === "result" && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -20 }}
                                                        animate={{ scale: 1.5, rotate: -5 }}
                                                        className={`px-10 py-6 border-8 border-black font-black text-5xl text-white text-outline shadow-[12px_12px_0_0_#000] rotate-[-5deg] ${gameState.lastDecisionCorrect ? "bg-emerald-500" : "bg-red-600"
                                                            }`}
                                                    >
                                                        {gameState.lastDecisionCorrect ? "PARFAIT !" : "RATÉ !"}
                                                    </motion.div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>

                                    {/* CONTROLS */}
                                    <div className="grid grid-cols-2 gap-8 mt-8">
                                        <button
                                            onClick={() => handleDecision(false)}
                                            disabled={gameState.phase !== "playing"}
                                            className="group relative h-28 bg-gradient-to-br from-emerald-500 to-emerald-700 border-4 border-black shadow-[6px_6px_0_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
                                        >
                                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                                            <div className="flex flex-col items-center justify-center relative z-10">
                                                <span className="text-2xl md:text-3xl font-black text-white text-outline uppercase drop-shadow-md">NOUVEAU</span>
                                                <span className="text-xs font-bold text-emerald-100 mt-2 bg-black/20 px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                                    <ChevronLeftIcon className="w-3 h-3" /> FLÈCHE GAUCHE
                                                </span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleDecision(true)}
                                            disabled={gameState.phase !== "playing"}
                                            className="group relative h-28 bg-gradient-to-br from-amber-500 to-orange-600 border-4 border-black shadow-[6px_6px_0_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]"
                                        >
                                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                                            <div className="flex flex-col items-center justify-center relative z-10">
                                                <span className="text-2xl md:text-3xl font-black text-white text-outline uppercase drop-shadow-md">DÉJÀ VU</span>
                                                <span className="text-xs font-bold text-orange-100 mt-2 bg-black/20 px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                                                    FLÈCHE DROITE <ChevronRightIcon className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
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

                                <h2 className="text-4xl font-black text-white mb-2 text-outline">PARTIE TERMINÉE !</h2>

                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-purple-500 mb-8 drop-shadow-md">
                                    {gameState.score} <span className="text-2xl text-white/50">pts</span>
                                </div>

                                {submissionResult?.success && submissionResult.rewards && (
                                    <div className="bg-slate-800 border-2 border-black p-6 mb-8 transform -rotate-1">
                                        <div className="flex justify-center gap-8 text-xl font-bold mb-2">
                                            <span className="text-emerald-400">+{submissionResult.rewards.xpEarned} XP</span>
                                            <span className="text-amber-400">+{submissionResult.rewards.goldEarned} OR</span>
                                        </div>
                                        {submissionResult.isNewPersonalBest && (
                                            <div className="inline-block bg-yellow-400 text-black px-4 py-1 font-black text-sm uppercase transform rotate-2 animate-pulse">
                                                Nouveau Record Personnel !
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <motion.button
                                        onClick={() => {
                                            setGameState(createGameState());
                                            setIsGameStarted(false);
                                            setIsGameEnded(false);
                                            setScoreSubmitted(false);
                                            setSubmissionResult(null);
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
                                            <EchoLexLeaderboard />
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
