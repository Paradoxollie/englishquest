"use client";

import Image from "next/image";
import Link from "next/link";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    type GameConfig,
    type GameState,
    VOCABULARY,
    createGameState,
    getAverageReactionTime,
    getCurrentRound,
    getFinalScore,
    nextRound,
    startAnswering,
    startGame,
    submitAnswer,
} from "@/lib/games/flashTranslation";
import {
    CheckCircleIcon,
    ChevronLeftIcon,
    ClockIcon,
    FireIcon,
    LightningIcon,
    TrophyIcon,
    XCircleIcon,
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { submitFlashTranslationScore } from "./actions";
import { FlashTranslationLeaderboard } from "./leaderboard";
import { TopScoresDisplay } from "./top-scores-display";

declare global {
    interface Window {
        render_game_to_text?: () => string;
        advanceTime?: (milliseconds: number) => void;
    }
}

const DEFAULT_CONFIG: GameConfig = {
    totalRounds: 10,
    minWaitMs: 1400,
    maxWaitMs: 2800,
    wrongAnswerPenaltyMs: 5000,
};

const CHOICE_KEYS = ["1", "2", "3", "4"] as const;

type SubmissionState = "idle" | "saving" | "saved" | "error";

function createFreshGame(): GameState {
    return createGameState(VOCABULARY, DEFAULT_CONFIG);
}

function formatSeconds(ms: number): string {
    return `${(ms / 1000).toFixed(2)}s`;
}

function getCompletedRounds(state: GameState): number {
    return state.rounds.filter((round) => round.reactionTimeMs !== undefined).length;
}

function StatTile({
    label,
    value,
    tone,
    helper,
}: {
    label: string;
    value: string;
    tone: string;
    helper?: string;
}) {
    return (
        <div className={`border-4 border-black p-3 shadow-[0_4px_0_#000] ${tone}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
                {label}
            </p>
            <p className="mt-2 text-2xl font-bold leading-none text-white text-outline">
                {value}
            </p>
            {helper && <p className="mt-2 text-xs font-semibold text-white/75">{helper}</p>}
        </div>
    );
}

export default function FlashTranslationPage() {
    const { user } = useAuth();
    const [gameState, setGameState] = useState<GameState>(() => createFreshGame());
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [combo, setCombo] = useState(0);
    const [bestCombo, setBestCombo] = useState(0);
    const [shakeCount, setShakeCount] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
    const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

    const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scoreSubmissionStartedRef = useRef(false);
    const answerLockedRef = useRef(false);

    const currentRound = getCurrentRound(gameState);
    const completedRounds = getCompletedRounds(gameState);
    const progress = Math.min(
        100,
        ((gameState.phase === "ended" ? gameState.rounds.length : completedRounds) / gameState.rounds.length) * 100
    );
    const finalScore = getFinalScore(gameState);
    const averageReactionTime = getAverageReactionTime(gameState);
    const isPlaying = gameState.started && gameState.phase !== "ended";
    const stageLabel = gameState.phase === "ended"
        ? "Termine"
        : !gameState.started
            ? "Pret"
            : gameState.phase === "waiting"
                ? "Signal"
                : gameState.phase === "answering"
                    ? "Reponds"
                    : "Feedback";

    const statItems = useMemo(
        () => [
            {
                label: "Temps",
                value: formatSeconds(finalScore),
                tone: "bg-slate-950/90",
                helper: `Moy. ${formatSeconds(averageReactionTime)}`,
            },
            {
                label: "Tours",
                value: `${completedRounds}/${gameState.rounds.length}`,
                tone: "bg-blue-700/90",
            },
            {
                label: "Erreurs",
                value: `${gameState.wrongAnswers}`,
                tone: gameState.wrongAnswers > 0 ? "bg-red-700/90" : "bg-emerald-700/90",
                helper: "+5s par erreur",
            },
            {
                label: "Combo",
                value: `x${Math.max(1, combo)}`,
                tone: "bg-amber-600/90",
                helper: bestCombo > 1 ? `Max x${bestCombo}` : undefined,
            },
        ],
        [averageReactionTime, bestCombo, combo, completedRounds, finalScore, gameState.rounds.length, gameState.wrongAnswers]
    );

    const clearTimers = useCallback(() => {
        if (waitTimerRef.current) {
            clearTimeout(waitTimerRef.current);
            waitTimerRef.current = null;
        }
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = null;
        }
    }, []);

    const resetGame = useCallback((startImmediately: boolean) => {
        clearTimers();
        const freshGame = createFreshGame();
        setGameState(startImmediately ? startGame(freshGame) : freshGame);
        setSelectedChoice(null);
        setCombo(0);
        setBestCombo(0);
        setSubmissionState("idle");
        setSubmissionMessage(null);
        setShowLeaderboard(false);
        scoreSubmissionStartedRef.current = false;
        answerLockedRef.current = false;
    }, [clearTimers]);

    const handleStartGame = useCallback(() => {
        resetGame(true);
    }, [resetGame]);

    const revealChoices = useCallback((now = Date.now()) => {
        if (waitTimerRef.current) {
            clearTimeout(waitTimerRef.current);
            waitTimerRef.current = null;
        }
        setGameState((current) => startAnswering(current, now));
    }, []);

    useEffect(() => {
        if (!gameState.started || gameState.phase !== "waiting" || !currentRound) {
            if (waitTimerRef.current) {
                clearTimeout(waitTimerRef.current);
                waitTimerRef.current = null;
            }
            return;
        }

        waitTimerRef.current = setTimeout(() => {
            revealChoices(Date.now());
        }, currentRound.waitTimeMs);

        return () => {
            if (waitTimerRef.current) {
                clearTimeout(waitTimerRef.current);
                waitTimerRef.current = null;
            }
        };
    }, [currentRound, gameState.phase, gameState.started, revealChoices]);

    const goToNextRound = useCallback((stateAfterAnswer: GameState) => {
        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = null;
        }
        const nextState = nextRound(stateAfterAnswer);
        setGameState(nextState);
        setSelectedChoice(null);
        answerLockedRef.current = false;
    }, []);

    const handleSelectChoice = useCallback((choiceIndex: number) => {
        if (gameState.phase !== "answering" || !currentRound || answerLockedRef.current) return;

        answerLockedRef.current = true;
        const isCorrect = choiceIndex === currentRound.correctIndex;
        const now = Date.now();
        const answeredState = submitAnswer(gameState, choiceIndex, now);
        setGameState(answeredState);
        setSelectedChoice(choiceIndex);

        if (isCorrect) {
            setCombo((current) => {
                const nextCombo = current + 1;
                setBestCombo((best) => Math.max(best, nextCombo));
                return nextCombo;
            });
        } else {
            setCombo(0);
            setShakeCount((current) => current + 1);
        }

        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current);
        }

        feedbackTimerRef.current = setTimeout(() => {
            goToNextRound(answeredState);
        }, 950);
    }, [currentRound, gameState, goToNextRound]);

    useEffect(() => {
        if (gameState.phase !== "answering") return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const index = CHOICE_KEYS.findIndex((key) => key === event.key);
            if (index >= 0) {
                event.preventDefault();
                handleSelectChoice(index);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState.phase, handleSelectChoice]);

    useEffect(() => {
        async function handleGameEnd() {
            if (gameState.phase !== "ended" || !user || scoreSubmissionStartedRef.current) return;

            scoreSubmissionStartedRef.current = true;
            setSubmissionState("saving");

            try {
                const result = await submitFlashTranslationScore({
                    totalTimeMs: getFinalScore(gameState),
                    averageReactionTimeMs: getAverageReactionTime(gameState),
                    wrongAnswers: gameState.wrongAnswers,
                    roundsCompleted: getCompletedRounds(gameState),
                });

                if (result.success) {
                    setSubmissionState("saved");
                    setSubmissionMessage(
                        result.isNewGlobalBest
                            ? "Score sauvegarde. Nouveau record global."
                            : result.isNewPersonalBest
                                ? "Score sauvegarde. Nouveau record personnel."
                                : "Score sauvegarde."
                    );
                    return;
                }

                setSubmissionState("error");
                setSubmissionMessage(result.error || "Sauvegarde impossible.");
            } catch (error) {
                console.error("Flash Translation: score submission failed", error);
                setSubmissionState("error");
                setSubmissionMessage("Sauvegarde impossible.");
            }
        }

        handleGameEnd();
    }, [gameState, user]);

    useEffect(() => {
        return clearTimers;
    }, [clearTimers]);

    useEffect(() => {
        window.render_game_to_text = () =>
            JSON.stringify(
                {
                    game: "flash-translation",
                    phase: gameState.phase,
                    started: gameState.started,
                    stage: stageLabel,
                    round: gameState.currentRoundIndex + 1,
                    totalRounds: gameState.rounds.length,
                    completedRounds,
                    totalTimeMs: finalScore,
                    averageReactionTimeMs: averageReactionTime,
                    wrongAnswers: gameState.wrongAnswers,
                    combo,
                    currentPrompt: currentRound?.wordPair.french ?? null,
                    choices: currentRound?.choices.map((choice, index) => ({
                        index,
                        text: choice.text,
                        isCorrect: choice.isCorrect,
                    })) ?? [],
                    correctIndex: currentRound?.correctIndex ?? null,
                    selectedChoice,
                },
                null,
                2
            );

        window.advanceTime = () => {
            if (gameState.phase === "waiting") {
                revealChoices(Date.now());
            } else if (gameState.phase === "feedback") {
                goToNextRound(gameState);
            }
        };

        return () => {
            delete window.render_game_to_text;
            delete window.advanceTime;
        };
    }, [
        averageReactionTime,
        combo,
        completedRounds,
        currentRound,
        finalScore,
        gameState,
        goToNextRound,
        revealChoices,
        selectedChoice,
        stageLabel,
    ]);

    return (
        <motion.div
            className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-x-hidden bg-[#020617] text-white"
            animate={shakeCount > 0 ? { x: [-5, 5, -4, 4, 0] } : {}}
            transition={{ duration: 0.28 }}
        >
            <Image
                src="/game-art/flash-translation-key-art.png"
                alt="Illustration comic book de Flash Translation."
                fill
                priority
                sizes="100vw"
                className="fixed inset-0 object-cover opacity-45"
            />
            <div className="fixed inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/86 to-[#020617]/35" />
            <div className="fixed inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/38 to-black/55" />
            <div className="fixed inset-0 comic-dot-pattern-light opacity-20" />

            <div className="relative z-10 mx-auto max-w-[1460px] px-4 py-5 md:px-8 md:py-7 xl:px-10">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <Link
                            href="/play"
                            className="comic-button inline-flex items-center gap-2 bg-slate-950/90 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                        >
                            <ChevronLeftIcon className="h-4 w-4" />
                            Retour aux jeux
                        </Link>
                        <Image
                            src="/game-art/logos/flash-translation-logo.png"
                            alt="Flash Translation"
                            width={540}
                            height={170}
                            priority
                            className="mt-5 h-auto w-full max-w-[360px] md:max-w-[470px]"
                        />
                        <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-lg">
                            Traduis vite, garde le combo, evite la penalite. Ici le score est ton temps final: plus il est bas, mieux c'est.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:w-[430px]">
                        <div className="border-4 border-black bg-black/65 p-3 shadow-[0_4px_0_#000]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Etat</p>
                            <p className="mt-2 truncate text-lg font-bold text-white">{stageLabel}</p>
                        </div>
                        <div className="border-4 border-black bg-amber-950/75 p-3 shadow-[0_4px_0_#000]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">Rounds</p>
                            <p className="mt-2 truncate text-lg font-bold text-white">
                                {completedRounds}/{gameState.rounds.length}
                            </p>
                        </div>
                        <div className="border-4 border-black bg-red-950/75 p-3 shadow-[0_4px_0_#000]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">Penalite</p>
                            <p className="mt-2 truncate text-lg font-bold text-white">+5s</p>
                        </div>
                    </div>
                </header>

                <main className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <section className="space-y-5">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {statItems.map((item) => (
                                <StatTile key={item.label} {...item} />
                            ))}
                        </div>

                        <section
                            data-testid="flash-stage"
                            className="relative min-h-[560px] overflow-hidden border-4 border-black bg-[#070b18]/95 shadow-[0_8px_0_#000]"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,191,36,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:74px_74px]" />
                            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-400/18 to-transparent" />
                            <div className="absolute inset-x-4 top-4 border-2 border-white/20 bg-black/45 px-2 py-2 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-slate-200 md:inset-x-auto md:left-4 md:px-3 md:text-xs md:tracking-[0.18em]">
                                Choisis la traduction anglaise
                            </div>
                            <div className="absolute right-4 top-4 hidden border-2 border-amber-300/40 bg-amber-950/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-100 md:block">
                                1-4 au clavier
                            </div>

                            <div className="relative z-10 flex min-h-[560px] flex-col justify-center p-4 pt-20 md:p-8">
                                <AnimatePresence mode="wait">
                                    {!gameState.started && (
                                        <motion.div
                                            key="start"
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            className="mx-auto w-full max-w-2xl border-4 border-black bg-slate-950/96 p-6 text-center shadow-[0_8px_0_#000] md:p-8"
                                        >
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center border-4 border-black bg-amber-500">
                                                <LightningIcon className="h-8 w-8 text-white" />
                                            </div>
                                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-amber-200">
                                                Duel de reflexes
                                            </p>
                                            <h1 className="mt-3 text-3xl font-bold text-white text-outline md:text-5xl">
                                                Flash Translation
                                            </h1>
                                            <p className="mt-4 text-base font-semibold leading-relaxed text-slate-200">
                                                Le mot francais apparait. Attends le signal, puis choisis la meilleure traduction anglaise.
                                            </p>
                                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                                <div className="border-2 border-white/15 bg-white/7 p-3">
                                                    <ClockIcon className="mx-auto h-6 w-6 text-cyan-200" />
                                                    <p className="mt-2 text-sm font-bold text-white">Temps bas</p>
                                                </div>
                                                <div className="border-2 border-white/15 bg-white/7 p-3">
                                                    <FireIcon className="mx-auto h-6 w-6 text-amber-300" />
                                                    <p className="mt-2 text-sm font-bold text-white">Combo propre</p>
                                                </div>
                                                <div className="border-2 border-white/15 bg-white/7 p-3">
                                                    <XCircleIcon className="mx-auto h-6 w-6 text-red-300" />
                                                    <p className="mt-2 text-sm font-bold text-white">Erreur = +5s</p>
                                                </div>
                                            </div>
                                            <button
                                                data-testid="flash-start"
                                                type="button"
                                                onClick={handleStartGame}
                                                className="comic-button mt-7 inline-flex items-center gap-2 bg-emerald-600 px-8 py-4 text-lg font-bold text-white hover:bg-emerald-700"
                                            >
                                                <LightningIcon className="h-6 w-6" />
                                                Demarrer la mission
                                            </button>
                                        </motion.div>
                                    )}

                                    {isPlaying && currentRound && (
                                        <motion.div
                                            key={`${gameState.currentRoundIndex}-${gameState.phase}`}
                                            initial={{ opacity: 0, y: 14 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -14 }}
                                            className="mx-auto w-full max-w-4xl"
                                        >
                                            <div className="mb-7">
                                                <div className="mb-3 h-4 border-2 border-black bg-slate-950">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 0.25 }}
                                                    />
                                                </div>
                                                <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                                                    Round {gameState.currentRoundIndex + 1} / {gameState.rounds.length}
                                                </p>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-200">
                                                    {gameState.phase === "waiting" ? "Prepare-toi" : "Traduis ce mot"}
                                                </p>
                                                <h2 className="mt-3 break-words text-5xl font-black leading-tight text-white text-outline md:text-7xl">
                                                    {currentRound.wordPair.french}
                                                </h2>
                                            </div>

                                            {gameState.phase === "waiting" && (
                                                <div className="mt-9 flex flex-col items-center gap-4">
                                                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
                                                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-300">
                                                        Le signal arrive...
                                                    </p>
                                                </div>
                                            )}

                                            {(gameState.phase === "answering" || gameState.phase === "feedback") && (
                                                <div className="mt-9 grid gap-3 md:grid-cols-2">
                                                    {currentRound.choices.map((choice, index) => {
                                                        const isSelected = selectedChoice === index;
                                                        const isCorrect = choice.isCorrect;
                                                        const isFeedback = gameState.phase === "feedback";
                                                        const buttonTone = isFeedback
                                                            ? isCorrect
                                                                ? "bg-emerald-600 text-white"
                                                                : isSelected
                                                                    ? "bg-red-700 text-white"
                                                                    : "bg-slate-900/70 text-slate-500"
                                                            : "bg-slate-950/92 text-white hover:-translate-y-1 hover:bg-slate-900";

                                                        return (
                                                            <button
                                                                key={`${choice.text}-${index}`}
                                                                type="button"
                                                                onClick={() => handleSelectChoice(index)}
                                                                disabled={isFeedback}
                                                                className={`group flex min-h-[92px] items-center justify-between gap-4 border-4 border-black p-4 text-left shadow-[0_5px_0_#000] transition-transform ${buttonTone}`}
                                                            >
                                                                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-black bg-white text-lg font-black text-slate-950">
                                                                    {CHOICE_KEYS[index]}
                                                                </span>
                                                                <span className="min-w-0 flex-1 text-xl font-bold leading-tight text-outline md:text-2xl">
                                                                    {choice.text}
                                                                </span>
                                                                {isFeedback && isCorrect && <CheckCircleIcon className="h-7 w-7 flex-shrink-0" />}
                                                                {isFeedback && isSelected && !isCorrect && <XCircleIcon className="h-7 w-7 flex-shrink-0" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {gameState.phase === "ended" && (
                                        <motion.div
                                            key="ended"
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mx-auto w-full max-w-2xl border-4 border-black bg-slate-950/96 p-6 text-center shadow-[0_8px_0_#000] md:p-8"
                                        >
                                            <TrophyIcon className="mx-auto h-14 w-14 text-amber-300" />
                                            <h2 className="mt-4 text-3xl font-bold text-white text-outline md:text-4xl">
                                                Mission terminee
                                            </h2>
                                            <div className="mt-6 grid grid-cols-2 gap-3">
                                                <div className="border-2 border-white/15 bg-white/8 p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Temps final</p>
                                                    <p className="mt-2 text-2xl font-bold text-cyan-200">{formatSeconds(finalScore)}</p>
                                                </div>
                                                <div className="border-2 border-white/15 bg-white/8 p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Erreurs</p>
                                                    <p className="mt-2 text-2xl font-bold text-red-200">{gameState.wrongAnswers}</p>
                                                </div>
                                                <div className="border-2 border-white/15 bg-white/8 p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Reaction moy.</p>
                                                    <p className="mt-2 text-2xl font-bold text-amber-200">{formatSeconds(averageReactionTime)}</p>
                                                </div>
                                                <div className="border-2 border-white/15 bg-white/8 p-3">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Combo max</p>
                                                    <p className="mt-2 text-2xl font-bold text-emerald-200">x{Math.max(1, bestCombo)}</p>
                                                </div>
                                            </div>

                                            <p className="mt-5 text-sm font-semibold text-slate-300">
                                                {!user && "Connecte-toi pour sauvegarder ton score."}
                                                {user && submissionState === "saving" && "Sauvegarde en cours..."}
                                                {user && submissionMessage && submissionState !== "saving" && submissionMessage}
                                            </p>

                                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                                <button
                                                    type="button"
                                                    onClick={() => resetGame(true)}
                                                    className="comic-button inline-flex items-center justify-center gap-2 bg-emerald-600 px-7 py-3 text-base font-bold text-white hover:bg-emerald-700"
                                                >
                                                    <LightningIcon className="h-5 w-5" />
                                                    Rejouer
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLeaderboard(true)}
                                                    className="comic-button bg-slate-800 px-7 py-3 text-base font-bold text-white hover:bg-slate-700"
                                                >
                                                    Classement
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {gameState.phase === "feedback" && selectedChoice !== null && currentRound && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.82 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                                        >
                                            <div
                                                className={`border-4 border-black px-6 py-4 text-2xl font-black uppercase tracking-[0.14em] text-white shadow-[0_6px_0_#000] text-outline ${
                                                    currentRound.choices[selectedChoice]?.isCorrect
                                                        ? "bg-emerald-600"
                                                        : "bg-red-700"
                                                }`}
                                            >
                                                {currentRound.choices[selectedChoice]?.isCorrect ? "Valide" : "+5 secondes"}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>
                    </section>

                    <aside className="space-y-5">
                        <section className="border-4 border-black bg-slate-950/90 p-5 shadow-[0_6px_0_#000]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center border-4 border-black bg-amber-500">
                                    <LightningIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                                        Brief de mission
                                    </p>
                                    <h2 className="text-xl font-bold text-white text-outline">Precision et vitesse</h2>
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                <div className="border-l-4 border-amber-300/70 bg-amber-950/40 px-3 py-2 text-sm font-semibold leading-relaxed text-amber-50">
                                    Attends le signal avant de repondre.
                                </div>
                                <div className="border-l-4 border-cyan-300/70 bg-cyan-950/40 px-3 py-2 text-sm font-semibold leading-relaxed text-cyan-50">
                                    Utilise les touches 1, 2, 3, 4 pour aller plus vite.
                                </div>
                                <div className="border-l-4 border-red-300/70 bg-red-950/40 px-3 py-2 text-sm font-semibold leading-relaxed text-red-50">
                                    Une erreur ajoute 5 secondes au temps final.
                                </div>
                            </div>
                        </section>

                        <TopScoresDisplay />
                    </aside>
                </main>
            </div>

            <AnimatePresence>
                {showLeaderboard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-4xl">
                            <div className="border-4 border-black bg-slate-950 shadow-[0_8px_0_#000]">
                                <div className="flex items-center justify-between border-b-4 border-black bg-slate-900 p-4">
                                    <h3 className="text-xl font-bold text-white text-outline">Classement Flash Translation</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowLeaderboard(false)}
                                        className="comic-button bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
                                    >
                                        Fermer
                                    </button>
                                </div>
                                <div className="max-h-[72vh] overflow-y-auto p-4">
                                    <FlashTranslationLeaderboard />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
