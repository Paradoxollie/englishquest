"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type WordfallMode,
  type WordfallState,
  createGameState,
  hasReachedBottom,
  initializeEnglishWords,
  initializeWordLists,
  pauseGame,
  processWordInput,
  processWordMissed,
  resumeGame,
  spawnFallingWord,
  startGame,
  updateFallingWord,
} from "@/lib/games/wordfall";
import wordfallWordsData from "@/lib/games/words/wordfall-words.json";
import englishWordsData from "@/lib/games/words/english-words.json";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  FireIcon,
  LightningIcon,
  StarIcon,
  TrophyIcon,
  XCircleIcon,
} from "@/components/ui/game-icons";
import { useAuth } from "@/components/auth/auth-provider";
import { submitWordfallScore } from "./actions";
import { PersonalBestDisplay } from "./personal-best-display";
import { WordfallLeaderboard } from "./leaderboard";

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (milliseconds: number) => void;
  }
}

type FlashTone = "success" | "danger" | null;

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  delay: number;
}

const MODE_COPY: Record<
  WordfallMode,
  {
    title: string;
    shortTitle: string;
    kicker: string;
    summary: string;
    input: string;
    prompt: string;
    accent: string;
    accentSoft: string;
    action: string;
    rules: string[];
  }
> = {
  exact: {
    title: "Mode vocabulaire exact",
    shortTitle: "Exact",
    kicker: "Anglais + traduction",
    summary:
      "Lis le bloc qui tombe, tape le mot anglais puis sa traduction francaise avant la zone rouge.",
    input: "BOOK livre",
    prompt: "Tape le mot anglais puis sa traduction francaise.",
    accent: "from-cyan-500 to-blue-600",
    accentSoft: "border-cyan-300/70 bg-cyan-950/50 text-cyan-100",
    action: "Saisis le duo complet",
    rules: [
      "Le premier mot doit etre le mot anglais affiche.",
      "La suite doit correspondre a la traduction francaise.",
      "Les accents et espaces multiples sont toleres.",
    ],
  },
  free: {
    title: "Mode mot libre",
    shortTitle: "Libre",
    kicker: "Reflexes lexicaux",
    summary:
      "Une lettre tombe. Trouve un mot anglais valide qui commence par cette lettre.",
    input: "START",
    prompt: "Tape un mot anglais commencant par la lettre affichee.",
    accent: "from-violet-500 to-fuchsia-600",
    accentSoft: "border-fuchsia-300/70 bg-fuchsia-950/50 text-fuchsia-100",
    action: "Trouve un mot valide",
    rules: [
      "Le mot doit commencer par la lettre du bloc.",
      "Les mots deja joues dans la manche sont refuses.",
      "Le dictionnaire anglais complet valide les reponses.",
    ],
  },
};

function cleanTranslationLabel(translation: string): string {
  return translation
    .replace(/\([^()]*\)/g, "")
    .split("/")[0]
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

function getFallingWordTextClass(value: string): string {
  const compactLength = value.replace(/\s+/g, "").length;

  if (compactLength > 12) return "text-3xl md:text-4xl";
  if (compactLength > 9) return "text-4xl md:text-5xl";
  return "text-5xl md:text-6xl";
}

interface WordfallBootstrap {
  loaded: boolean;
  error: string | null;
}

let wordfallBootstrap: WordfallBootstrap | null = null;

function ensureWordfallBootstrap(): WordfallBootstrap {
  if (wordfallBootstrap) {
    return wordfallBootstrap;
  }

  try {
    if (!wordfallWordsData) {
      wordfallBootstrap = {
        loaded: true,
        error: "Impossible de charger la liste Wordfall.",
      };
      return wordfallBootstrap;
    }

    const wordListsToUse = wordfallWordsData.manualWords
      ? {
          translations: wordfallWordsData.manualWords.translations,
          wordsByLength: wordfallWordsData.manualWords.wordsByLength,
          expressions: wordfallWordsData.manualWords.expressions || [],
        }
      : {
          translations: wordfallWordsData.translations,
          wordsByLength: wordfallWordsData.wordsByLength,
          expressions: [],
        };

    if (!wordListsToUse.translations || !wordListsToUse.wordsByLength) {
      wordfallBootstrap = {
        loaded: true,
        error: "La liste Wordfall est incomplete.",
      };
      return wordfallBootstrap;
    }

    initializeWordLists({
      translations: wordListsToUse.translations,
      wordsByLength: wordListsToUse.wordsByLength,
      expressions: wordListsToUse.expressions,
    });

    if (englishWordsData?.allWords) {
      initializeEnglishWords(englishWordsData.allWords);
    }

    wordfallBootstrap = { loaded: true, error: null };
    return wordfallBootstrap;
  } catch (error) {
    console.error("Wordfall: failed to load word lists", error);
    wordfallBootstrap = {
      loaded: true,
      error: "Impossible de preparer Wordfall. Recharge la page.",
    };
    return wordfallBootstrap;
  }
}

function getStageLabel(state: WordfallState | null, isPaused: boolean): string {
  if (!state) return "Chargement";
  if (state.gameOver) return "Partie terminee";
  if (isPaused) return "Pause";
  if (state.isRunning) return "En cours";
  return "Pret";
}

function StatTile({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: string | number;
  tone: string;
  helper?: string;
}) {
  return (
    <div className={`border-4 border-black ${tone} p-3 shadow-[0_4px_0_#000]`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold leading-none text-white text-outline md:text-3xl">
        {value}
      </p>
      {helper && <p className="mt-2 text-xs font-semibold text-white/75">{helper}</p>}
    </div>
  );
}

export default function WordfallPage() {
  const [bootstrap] = useState(ensureWordfallBootstrap);
  const wordListsLoaded = bootstrap.loaded;
  const [gameState, setGameState] = useState<WordfallState | null>(() =>
    createGameState({ mode: "exact" })
  );
  const [selectedMode, setSelectedMode] = useState<WordfallMode>("exact");
  const [wordInput, setWordInput] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(bootstrap.error);
  const [backgroundFlash, setBackgroundFlash] = useState<FlashTone>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [lastScoreIncrease, setLastScoreIncrease] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    isNewPersonalBest?: boolean;
    isNewGlobalBest?: boolean;
    personalBest?: number;
  } | null>(null);

  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const particleIdRef = useRef(0);
  const gameStartTimeRef = useRef<number | null>(null);
  const scoreSubmissionStartedRef = useRef(false);

  const modeCopy = MODE_COPY[selectedMode];

  const stageLabel = getStageLabel(gameState, isPaused);
  const activeWord = gameState?.activeWord ?? null;
  const activeTop = activeWord ? 6 + Math.min(1, Math.max(0, activeWord.y) / 100) * 64 : 8;
  const activeProgress = activeWord ? Math.max(0, 100 - activeWord.y) : 100;
  const activeWordTextClass = activeWord ? getFallingWordTextClass(activeWord.text) : "";

  const statItems = useMemo(() => {
    if (!gameState) return [];

    return [
      {
        label: "Score",
        value: formatNumber(gameState.score),
        tone: "bg-slate-950/90",
        helper: lastScoreIncrease > 0 ? `+${lastScoreIncrease}` : undefined,
      },
      {
        label: "Vies",
        value: gameState.lives,
        tone:
          gameState.lives <= 1
            ? "bg-red-700/90 animate-comic-flash"
            : "bg-rose-700/90",
      },
      {
        label: "Niveau",
        value: gameState.level,
        tone: "bg-blue-700/90",
      },
      {
        label: "Mots",
        value: gameState.wordsCompleted,
        tone: "bg-amber-600/90",
      },
      {
        label: "Serie",
        value: gameState.streak,
        tone: "bg-orange-700/90",
        helper:
          gameState.highestStreak > gameState.streak
            ? `Record ${gameState.highestStreak}`
            : undefined,
      },
      {
        label: "Combo",
        value: `x${gameState.combo}`,
        tone: "bg-emerald-700/90",
      },
    ];
  }, [gameState, lastScoreIncrease]);

  const initializeGame = useCallback((mode: WordfallMode) => {
    setGameState(createGameState({ mode }));
    setWordInput("");
    setErrorMessage(bootstrap.error);
    setStatusBanner(null);
    setIsPaused(false);
    setLastScoreIncrease(0);
    setScoreSubmitted(false);
    setSubmissionError(null);
    setSubmissionResult(null);
    scoreSubmissionStartedRef.current = false;
    gameStartTimeRef.current = null;
    lastUpdateRef.current = Date.now();
  }, [bootstrap.error]);

  const flashStage = useCallback((tone: Exclude<FlashTone, null>) => {
    setBackgroundFlash(tone);
    window.setTimeout(() => setBackgroundFlash(null), 420);
  }, []);

  const spawnParticles = useCallback(() => {
    const newParticles = Array.from({ length: 18 }, (_, index) => ({
      id: particleIdRef.current++,
      x: 48 + Math.random() * 10,
      y: 45 + Math.random() * 14,
      targetX: (Math.random() - 0.5) * 42,
      targetY: (Math.random() - 0.5) * 42,
      delay: index * 0.025,
    }));

    setParticles(newParticles);
    window.setTimeout(() => setParticles([]), 1200);
  }, []);

  const handleStartGame = useCallback(() => {
    setGameState((current) => {
      if (!current) return current;
      return startGame(current);
    });
    setIsPaused(false);
    setWordInput("");
    setErrorMessage(null);
    setStatusBanner(null);
    setLastScoreIncrease(0);
    setScoreSubmitted(false);
    setSubmissionError(null);
    setSubmissionResult(null);
    scoreSubmissionStartedRef.current = false;
    gameStartTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handlePauseToggle = useCallback(() => {
    setGameState((current) => {
      if (!current || current.gameOver) return current;

      if (isPaused) {
        lastUpdateRef.current = Date.now();
        setIsPaused(false);
        return resumeGame(current);
      }

      if (!current.isRunning) return current;
      setIsPaused(true);
      return pauseGame(current);
    });
  }, [isPaused]);

  const spawnNewWord = useCallback(() => {
    setGameState((current) => {
      if (!current || !current.isRunning || current.gameOver || current.activeWord) {
        return current;
      }

      const newWord = spawnFallingWord(current, { mode: current.mode });
      if (!newWord) {
        return current;
      }

      return {
        ...current,
        activeWord: newWord,
        wordStartTime: Date.now(),
      };
    });
  }, []);

  const advanceGame = useCallback(
    (deltaTime: number) => {
      setGameState((current) => {
        if (!current || !current.isRunning || current.gameOver || !current.activeWord) {
          return current;
        }

        const updatedWord = updateFallingWord(current.activeWord, deltaTime);
        if (hasReachedBottom(updatedWord)) {
          flashStage("danger");
          setStatusBanner("Mot manque: une vie perdue.");
          window.setTimeout(() => setStatusBanner(null), 1500);
          return processWordMissed(current);
        }

        return {
          ...current,
          activeWord: updatedWord,
        };
      });
    },
    [flashStage]
  );

  useEffect(() => {
    if (!gameState?.isRunning || gameState.gameOver || isPaused) {
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
      advanceGame(deltaTime);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [advanceGame, gameState?.gameOver, gameState?.isRunning, isPaused]);

  useEffect(() => {
    if (gameState?.isRunning && !gameState.activeWord && !gameState.gameOver && !isPaused) {
      const timer = window.setTimeout(spawnNewWord, 360);
      return () => window.clearTimeout(timer);
    }
  }, [gameState?.activeWord, gameState?.gameOver, gameState?.isRunning, isPaused, spawnNewWord]);

  const handleSubmitWord = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!gameState || !gameState.isRunning || isPaused || !wordInput.trim()) return;

      const result = processWordInput(gameState, wordInput);

      if (!result.success) {
        setGameState(result.newState);
        setErrorMessage(result.reason || "Reponse incorrecte.");
        flashStage("danger");
        window.setTimeout(() => setErrorMessage(null), 1900);
        return;
      }

      const scoreIncrease = result.newState.score - gameState.score;
      const nextStreak = result.newState.streak;

      setGameState(result.newState);
      setWordInput("");
      setErrorMessage(null);
      setLastScoreIncrease(scoreIncrease);
      setShowCelebration(true);
      flashStage("success");
      spawnParticles();

      if (result.pointsBreakdown?.isPerfect) {
        setStatusBanner("Capture parfaite: bonus vitesse.");
      } else if (result.newState.combo > gameState.combo) {
        setStatusBanner(`Combo x${result.newState.combo}`);
      } else if ([5, 10, 20, 50, 100].includes(nextStreak)) {
        setStatusBanner(`${nextStreak} reponses justes de suite.`);
      }

      window.setTimeout(() => setShowCelebration(false), 900);
      window.setTimeout(() => setLastScoreIncrease(0), 1300);
      window.setTimeout(() => setStatusBanner(null), 1700);
      window.setTimeout(() => inputRef.current?.focus(), 80);
    },
    [flashStage, gameState, isPaused, spawnParticles, wordInput]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handlePauseToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePauseToggle]);

  useEffect(() => {
    async function submitScore() {
      if (!gameState?.gameOver || !user || scoreSubmissionStartedRef.current) {
        return;
      }

      scoreSubmissionStartedRef.current = true;
      const durationMs = gameStartTimeRef.current ? Date.now() - gameStartTimeRef.current : 0;

      try {
        const result = await submitWordfallScore({
          mode: gameState.mode,
          score: gameState.score,
          wordsCompleted: gameState.wordsCompleted,
          durationMs,
        });

        if (result.success) {
          setScoreSubmitted(true);
          setSubmissionResult({
            isNewPersonalBest: result.isNewPersonalBest,
            isNewGlobalBest: result.isNewGlobalBest,
            personalBest: result.personalBest,
          });
          return;
        }

        setSubmissionError(result.error || "Erreur lors de la sauvegarde du score.");
      } catch (error) {
        console.error("Wordfall: score submission failed", error);
        setSubmissionError("Erreur lors de la sauvegarde du score.");
      }
    }

    submitScore();
  }, [gameState?.gameOver, gameState?.mode, gameState?.score, gameState?.wordsCompleted, user]);

  useEffect(() => {
    window.render_game_to_text = () =>
      JSON.stringify(
        {
          game: "wordfall",
          mode: selectedMode,
          loaded: wordListsLoaded,
          stage: stageLabel,
          score: gameState?.score ?? 0,
          lives: gameState?.lives ?? 0,
          level: gameState?.level ?? 0,
          wordsCompleted: gameState?.wordsCompleted ?? 0,
          streak: gameState?.streak ?? 0,
          combo: gameState?.combo ?? 1,
          activeWord: gameState?.activeWord
            ? {
                text: gameState.activeWord.text,
                displayText: gameState.activeWord.displayText,
                translation: gameState.activeWord.translation
                  ? cleanTranslationLabel(gameState.activeWord.translation)
                  : null,
                y: Math.round(gameState.activeWord.y),
                speed: gameState.activeWord.speed,
              }
            : null,
          input: wordInput,
          error: errorMessage,
        },
        null,
        2
      );
    window.advanceTime = (milliseconds: number) => {
      const safeMs = Math.max(0, Number(milliseconds) || 0);
      advanceGame(safeMs);
    };

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [
    advanceGame,
    errorMessage,
    gameState,
    selectedMode,
    stageLabel,
    wordInput,
    wordListsLoaded,
  ]);

  if (!wordListsLoaded || !gameState) {
    return (
      <div className="relative left-1/2 flex min-h-screen w-screen -translate-x-1/2 items-center justify-center overflow-hidden bg-[#020617] text-white">
        <Image
          src="/game-art/wordfall-key-art.png"
          alt="Illustration Wordfall"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[#020617]/80" />
        <div className="relative border-4 border-black bg-slate-950/90 p-8 text-center shadow-[0_8px_0_#000]">
          <BookOpenIcon className="mx-auto h-12 w-12 text-cyan-300" />
          <p className="mt-4 text-lg font-bold text-white text-outline">
            Preparation de Wordfall...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 overflow-x-hidden bg-[#020617] text-white">
      <Image
        src="/game-art/wordfall-key-art.png"
        alt="Illustration comic book de Wordfall."
        fill
        priority
        sizes="100vw"
        className="fixed inset-0 object-cover opacity-45"
      />
      <div className="fixed inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/88 to-[#020617]/35" />
      <div className="fixed inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/35 to-black/55" />
      <div className="fixed inset-0 comic-dot-pattern-light opacity-20" />

      <AnimatePresence>
        {backgroundFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.32, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42 }}
            className={`fixed inset-0 z-20 pointer-events-none ${
              backgroundFlash === "success" ? "bg-emerald-400" : "bg-red-500"
            }`}
            style={{ mixBlendMode: "screen" }}
          />
        )}
      </AnimatePresence>

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
              src="/game-art/logos/wordfall-logo.png"
              alt="Wordfall"
              width={520}
              height={164}
              priority
              className="mt-5 h-auto w-full max-w-[360px] md:max-w-[460px]"
            />
            <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-slate-100 text-outline md:text-lg">
              Attrape les mots avant la zone danger. Wordfall melange vitesse,
              memoire visuelle et vocabulaire utile.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:w-[420px]">
            <div className="border-4 border-black bg-black/65 p-3 shadow-[0_4px_0_#000]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
                Etat
              </p>
              <p className="mt-2 truncate text-lg font-bold text-white">{stageLabel}</p>
            </div>
            <div className="border-4 border-black bg-cyan-950/75 p-3 shadow-[0_4px_0_#000]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                Mode
              </p>
              <p className="mt-2 truncate text-lg font-bold text-white">
                {modeCopy.shortTitle}
              </p>
            </div>
            <div className="border-4 border-black bg-amber-950/75 p-3 shadow-[0_4px_0_#000]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                Niveau
              </p>
              <p className="mt-2 truncate text-lg font-bold text-white">
                {gameState.level}
              </p>
            </div>
          </div>
        </header>

        <main className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-5">
            {!gameState.isRunning && !gameState.gameOver && !isPaused && (
              <div className="grid gap-3 md:grid-cols-2">
                {(Object.keys(MODE_COPY) as WordfallMode[]).map((mode) => {
                  const copy = MODE_COPY[mode];
                  const isActive = selectedMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setSelectedMode(mode);
                        initializeGame(mode);
                      }}
                      className={`group border-4 border-black p-4 text-left shadow-[0_5px_0_#000] transition-transform hover:-translate-y-1 ${
                        isActive
                          ? `bg-gradient-to-br ${copy.accent} text-white`
                          : "bg-slate-950/86 text-slate-100 hover:bg-slate-900"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
                            {copy.kicker}
                          </span>
                          <span className="mt-2 block text-xl font-bold text-white text-outline">
                            {copy.title}
                          </span>
                        </span>
                        {isActive && <CheckCircleIcon className="h-7 w-7 text-white" />}
                      </span>
                      <span className="mt-3 block text-sm font-semibold leading-relaxed text-white/85">
                        {copy.summary}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {statItems.map((item) => (
                <StatTile key={item.label} {...item} />
              ))}
            </div>

            <section
              data-testid="wordfall-stage"
              className="relative min-h-[460px] overflow-hidden border-4 border-black bg-[#06101f]/95 shadow-[0_8px_0_#000] md:min-h-[560px]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/16 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-red-500/80 bg-gradient-to-t from-red-950/85 to-red-900/12">
                <p className="absolute right-4 top-3 text-[10px] font-bold uppercase tracking-[0.3em] text-red-100">
                  Zone danger
                </p>
              </div>
              <div className="absolute left-4 top-4 border-2 border-white/20 bg-black/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
                {modeCopy.action}
              </div>

              <AnimatePresence>
                {particles.map((particle) => (
                  <motion.span
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
                      x: `${particle.x + particle.targetX}%`,
                      y: `${particle.y + particle.targetY}%`,
                    }}
                    transition={{
                      delay: particle.delay,
                      duration: 0.75,
                      ease: "easeOut",
                    }}
                    className="absolute z-30 h-3 w-3 rounded-full bg-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.75)]"
                  />
                ))}
              </AnimatePresence>

              {gameState.isRunning && !activeWord && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="border-4 border-black bg-slate-950/80 px-5 py-4 text-center shadow-[0_4px_0_#000]">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
                      Prochain bloc
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      Analyse du mot suivant...
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {activeWord && (
                  <motion.div
                    key={activeWord.id}
                    initial={{ opacity: 0, scale: 0.92, top: "2%" }}
                    animate={{ opacity: 1, scale: 1, top: `${activeTop}%` }}
                    exit={{ opacity: 0, scale: 0.86 }}
                    transition={{ duration: 0.08, ease: "linear" }}
                    className="absolute left-1/2 z-20 w-[min(88vw,500px)] -translate-x-1/2"
                  >
                    <div className="border-4 border-black bg-white p-4 text-slate-950 shadow-[0_8px_0_#000] md:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                          {selectedMode === "exact" ? "Mot cible" : "Lettre cible"}
                        </p>
                        <p className="border-2 border-black bg-slate-950 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                          Vitesse {activeWord.speed.toFixed(1)}
                        </p>
                      </div>
                      <p className={`mt-3 break-words text-center font-black leading-tight tracking-normal text-slate-950 ${activeWordTextClass}`}>
                        {activeWord.text}
                      </p>
                      {selectedMode === "exact" && activeWord.translation && (
                        <p className="mt-3 border-t-2 border-slate-200 pt-3 text-center text-sm font-bold uppercase tracking-[0.16em] text-cyan-700 md:text-base">
                          Traduction: {cleanTranslationLabel(activeWord.translation)}
                        </p>
                      )}
                      {selectedMode === "free" && (
                        <p className="mt-3 border-t-2 border-slate-200 pt-3 text-center text-sm font-bold uppercase tracking-[0.16em] text-fuchsia-700 md:text-base">
                          Un mot anglais qui commence par {activeWord.text}
                        </p>
                      )}
                      <div className="mt-4 h-3 border-2 border-black bg-red-100">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
                          style={{ width: `${activeProgress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.86 }}
                    className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                  >
                    <div className="border-4 border-black bg-emerald-500 px-6 py-4 text-2xl font-black uppercase tracking-[0.14em] text-white shadow-[0_6px_0_#000] text-outline">
                      Valide
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {gameState.gameOver && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/78 p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-lg border-4 border-black bg-slate-950 p-6 text-center shadow-[0_8px_0_#000] md:p-8"
                  >
                    <TrophyIcon className="mx-auto h-14 w-14 text-amber-300" />
                    <h2 className="mt-4 text-3xl font-bold text-white text-outline md:text-4xl">
                      Partie terminee
                    </h2>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="border-2 border-white/15 bg-white/8 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Score final
                        </p>
                        <p className="mt-2 text-2xl font-bold text-cyan-200">
                          {formatNumber(gameState.score)}
                        </p>
                      </div>
                      <div className="border-2 border-white/15 bg-white/8 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Mots valides
                        </p>
                        <p className="mt-2 text-2xl font-bold text-amber-200">
                          {gameState.wordsCompleted}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 text-sm font-semibold text-slate-300">
                      {!user && "Connecte-toi pour sauvegarder ton score."}
                      {user && scoreSubmitted && (
                        <span className="text-emerald-300">
                          Score sauvegarde.
                          {submissionResult?.isNewPersonalBest && " Nouveau record personnel."}
                          {submissionResult?.isNewGlobalBest && " Meilleur score global."}
                        </span>
                      )}
                      {user && !scoreSubmitted && !submissionError && "Sauvegarde en cours..."}
                      {user && submissionError && (
                        <span className="text-red-300">{submissionError}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => initializeGame(selectedMode)}
                      className="comic-button mt-6 inline-flex items-center gap-2 bg-emerald-600 px-7 py-3 text-base font-bold text-white hover:bg-emerald-700"
                    >
                      <LightningIcon className="h-5 w-5" />
                      Rejouer
                    </button>
                  </motion.div>
                </div>
              )}

              {isPaused && !gameState.gameOver && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
                  <div className="border-4 border-black bg-slate-950 p-7 text-center shadow-[0_8px_0_#000]">
                    <h2 className="text-3xl font-bold text-white text-outline">Pause</h2>
                    <p className="mt-3 max-w-sm text-sm font-semibold leading-relaxed text-slate-300">
                      La chute est arretee. Reprends quand tu es pret.
                    </p>
                    <button
                      type="button"
                      onClick={handlePauseToggle}
                      className="comic-button mt-6 bg-cyan-600 px-7 py-3 text-base font-bold text-white hover:bg-cyan-700"
                    >
                      Reprendre
                    </button>
                  </div>
                </div>
              )}

              {!gameState.isRunning && !gameState.gameOver && !isPaused && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/44 p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full max-w-xl border-4 border-black bg-slate-950/95 p-6 text-center shadow-[0_8px_0_#000] md:p-8"
                  >
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center border-4 border-black bg-gradient-to-br ${modeCopy.accent}`}>
                      <BookOpenIcon className="h-8 w-8 text-white" />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                      {modeCopy.kicker}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold text-white text-outline md:text-4xl">
                      {modeCopy.title}
                    </h2>
                    <p className="mt-4 text-base font-semibold leading-relaxed text-slate-200">
                      {modeCopy.summary}
                    </p>
                    <button
                      data-testid="wordfall-start"
                      type="button"
                      onClick={handleStartGame}
                      className="comic-button mt-7 inline-flex items-center gap-2 bg-emerald-600 px-8 py-4 text-lg font-bold text-white hover:bg-emerald-700"
                    >
                      <LightningIcon className="h-6 w-6" />
                      Demarrer la manche
                    </button>
                  </motion.div>
                </div>
              )}
            </section>

            {gameState.isRunning && !gameState.gameOver && (
              <form
                onSubmit={handleSubmitWord}
                className="border-4 border-black bg-slate-950/92 p-4 shadow-[0_6px_0_#000] md:p-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row">
                  <label className="min-w-0 flex-1">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      Reponse
                    </span>
                    <input
                      ref={inputRef}
                      data-testid="wordfall-input"
                      type="text"
                      value={wordInput}
                      onChange={(event) => {
                        const value =
                          selectedMode === "free"
                            ? event.target.value.toUpperCase()
                            : event.target.value;
                        setWordInput(value);
                      }}
                      placeholder={`${modeCopy.prompt} Exemple: ${modeCopy.input}`}
                      disabled={isPaused}
                      autoFocus
                      className="w-full border-4 border-black bg-white px-4 py-4 text-lg font-bold text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/30 disabled:opacity-60"
                    />
                  </label>

                  <div className="flex gap-3 lg:items-end">
                    <button
                      type="submit"
                      disabled={isPaused || !wordInput.trim()}
                      className="comic-button inline-flex flex-1 items-center justify-center gap-2 bg-emerald-600 px-6 py-4 text-base font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={handlePauseToggle}
                      className="comic-button inline-flex items-center justify-center bg-amber-600 px-6 py-4 text-base font-bold text-white hover:bg-amber-700"
                    >
                      Pause
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {(errorMessage || statusBanner) && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`mt-4 flex items-center gap-3 border-4 border-black p-3 text-sm font-bold shadow-[0_4px_0_#000] ${
                        errorMessage
                          ? "bg-red-700 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {errorMessage ? (
                        <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <StarIcon className="h-5 w-5 flex-shrink-0" />
                      )}
                      <span>{errorMessage || statusBanner}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}

            {selectedMode === "free" && gameState.usedWords.length > 0 && (
              <div className="border-4 border-black bg-slate-950/86 p-4 shadow-[0_5px_0_#000]">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Derniers mots joues
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gameState.usedWords.slice(-5).map((word) => (
                    <span
                      key={word}
                      className="border-2 border-black bg-slate-800 px-3 py-2 text-sm font-bold text-white"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="border-4 border-black bg-slate-950/90 p-5 shadow-[0_6px_0_#000]">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center border-4 border-black bg-gradient-to-br ${modeCopy.accent}`}>
                  <LightningIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Brief de mission
                  </p>
                  <h2 className="text-xl font-bold text-white text-outline">
                    {modeCopy.shortTitle}
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-300">
                {modeCopy.summary}
              </p>
              <div className="mt-5 space-y-3">
                {modeCopy.rules.map((rule) => (
                  <div key={rule} className={`border-l-4 px-3 py-2 ${modeCopy.accentSoft}`}>
                    <p className="text-sm font-semibold leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-4 border-black bg-slate-950/90 p-5 shadow-[0_6px_0_#000]">
              <div className="flex items-center gap-3">
                <FireIcon className="h-6 w-6 text-orange-300" />
                <h2 className="text-xl font-bold text-white text-outline">Scoring</h2>
              </div>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>Capture haute</span>
                  <span className="text-emerald-300">bonus</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span>Series propres</span>
                  <span className="text-amber-300">combo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Niveaux</span>
                  <span className="text-cyan-300">vitesse + points</span>
                </div>
              </div>
            </section>

            <PersonalBestDisplay
              selectedMode={selectedMode}
              currentScore={gameState.gameOver ? gameState.score : undefined}
            />
          </aside>
        </main>

        {!gameState.isRunning && !gameState.gameOver && (
          <section className="mt-8">
            <WordfallLeaderboard initialMode={selectedMode} />
          </section>
        )}
      </div>
    </div>
  );
}
