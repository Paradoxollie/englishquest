"use client";

import dynamic from "next/dynamic";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addLetterToCurrentGuess,
  createInitialGameState,
  DEFAULT_CONFIGS,
  getCurrentGuess,
  initializeWordLists,
  removeLetterFromCurrentGuess,
  resetForNewWord,
  submitGuess,
  type GameState,
  type LetterStatus,
} from "@/lib/games/enigma-scroll";
import {
  ENIGMA_TARGETS,
  enigmaTargetsForLevel,
  getEnigmaTranslation,
  pickEnigmaTargetWord,
} from "@/lib/games/enigma-scroll-targets";
import { filterInappropriateWords, loadAndFilterWordLists } from "@/lib/games/enigma-scroll-words";
import { playSoundEffect } from "@/lib/games/audio";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import {
  GameEnd,
  GameHud,
  GameStart,
  HudStat,
  SpeakButton,
  TimeBar,
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { submitEnigmaScrollScore } from "./actions";

const EnigmaWordNotes = dynamic(() => import("@/components/play/enigma-word-notes").then(module => module.EnigmaWordNotes));

type WordLength = 4 | 5 | 6;
type KeyboardLayout = "azerty" | "qwerty";
type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";
type Dictionary = "loading" | "ready" | "fallback";

const TILE_FEEDBACK = {
  correct: { label: "bien placée", mark: "✓" },
  present: { label: "présente ailleurs", mark: "↔" },
  absent: { label: "absente", mark: "×" },
};
const ROUND_SECONDS = 90;
const DICTIONARY_TIMEOUT_MS = 10_000;
const LAYOUT_STORAGE_KEY = "eq:enigmaKeyboardLayout";

const KEY_LAYOUTS: Record<KeyboardLayout, string[][]> = {
  azerty: [
    ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
    ["W", "X", "C", "V", "B", "N"],
  ],
  qwerty: [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ],
};

const LENGTHS: { value: WordLength; label: string; detail: string }[] = [
  { value: 4, label: "4 lettres", detail: "5 essais, 10 points par mot" },
  { value: 5, label: "5 lettres", detail: "6 essais, 15 points par mot" },
  { value: 6, label: "6 lettres", detail: "7 essais, 20 points par mot" },
];

/* ---------- dictionnaire des propositions, chargé à la demande ---------- */

const guessCache = new Map<WordLength, string[]>();
const guessRequests = new Map<WordLength, Promise<string[] | null>>();

/** Liste des propositions acceptées pour une longueur (public/data), mise en cache. */
function loadGuesses(length: WordLength): Promise<string[] | null> {
  const cached = guessCache.get(length);
  if (cached) return Promise.resolve(cached);
  const pending = guessRequests.get(length);
  if (pending) return pending;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DICTIONARY_TIMEOUT_MS);
  const request = fetch(`/data/enigma-guesses-${length}.json`, { signal: controller.signal })
    .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
    .then((list: unknown) => {
      if (!Array.isArray(list)) throw new Error("Liste invalide");
      const words = filterInappropriateWords(list.filter((word): word is string => typeof word === "string"))
        .map((word) => word.trim().toUpperCase())
        .filter((word) => word.length === length && /^[A-Z]+$/.test(word));
      guessCache.set(length, words);
      return words;
    })
    .catch((error) => {
      console.error("Enigma Scroll : dictionnaire", error);
      return null;
    })
    .finally(() => {
      window.clearTimeout(timeout);
      guessRequests.delete(length);
    });
  guessRequests.set(length, request);
  return request;
}

/**
 * Prépare le moteur pour une partie : mots cibles du niveau choisi et propositions acceptées.
 */
function prepareWordLists(length: WordLength, level: GameLevel) {
  const targets = enigmaTargetsForLevel(length, level).map((target) => target.word);
  const guesses = guessCache.get(length) ?? ENIGMA_TARGETS[length].map((target) => target.word);
  initializeWordLists(loadAndFilterWordLists({ [length]: targets }, { [length]: guesses }));
}

function keyboardStatus(state: GameState | null): Record<string, LetterStatus> {
  const result: Record<string, LetterStatus> = {};
  if (!state) return result;
  for (const row of state.rows) {
    if (!row.isSubmitted) continue;
    for (const cell of row.cells) {
      if (!cell.letter || cell.status === "empty") continue;
      const existing = result[cell.letter];
      if (!existing || cell.status === "correct" || (cell.status === "present" && existing === "absent")) {
        result[cell.letter] = cell.status;
      }
    }
  }
  return result;
}

function WordMeaning({ word }: { word: string }) {
  const french = getEnigmaTranslation(word);
  return (
    <span className="eq-enigma-meaning">
      <b lang="en">{word}</b>
      {french ? <span lang="fr">{french}</span> : null}
    </span>
  );
}

export function EnigmaScrollGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
}) {
  const [length, setLength] = useState<WordLength>(5);
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>("azerty");
  const [dictionary, setDictionary] = useState<Dictionary>("loading");
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<"start" | "playing" | "won" | "ended">("start");
  const [paused, setPaused] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const wordStartedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const submittedRef = useRef(false);
  const sessionRef = useRef(0);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gameSession = useGameSession("enigma-scroll", isLoggedIn);

  useGameFocusMode(phase === "playing" || phase === "won");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved === "azerty" || saved === "qwerty") {
        setKeyboardLayout(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  const toggleKeyboardLayout = useCallback(() => {
    setKeyboardLayout((current) => {
      const next: KeyboardLayout = current === "azerty" ? "qwerty" : "azerty";
      try {
        window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  /* Dictionnaire de la longueur choisie, chargé à la demande */
  useEffect(() => {
    let cancelled = false;
    if (guessCache.has(length)) {
      setDictionary("ready");
      return;
    }
    setDictionary("loading");
    loadGuesses(length).then((words) => {
      if (!cancelled) setDictionary(words ? "ready" : "fallback");
    });
    return () => {
      cancelled = true;
    };
  }, [length]);

  const start = useCallback(() => {
    prepareWordLists(length, level);
    sessionRef.current += 1;
    gameSession.begin();
    const firstWord = pickEnigmaTargetWord(length, level);
    setState(createInitialGameState(firstWord));
    setPhase("playing");
    setPaused(false);
    pausedAtRef.current = 0;
    setHintShown(false);
    setTimeLeft(ROUND_SECONDS);
    setMessage(null);
    setLastPoints(0);
    setFound([]);
    setNotes({});
    setRewards(null);
    setRewardError(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    startedAtRef.current = Date.now();
    wordStartedAtRef.current = Date.now();
  }, [length, level, gameSession]);

  /* Abandon : retour à l'écran de départ, rien n'est enregistré. */
  const quit = useCallback(() => {
    sessionRef.current += 1;
    gameSession.cancel();
    setPaused(false);
    pausedAtRef.current = 0;
    setMessage(null);
    setPhase("start");
  }, [gameSession]);

  const togglePause = useCallback(() => {
    if (phase !== "playing") return;
    if (paused) {
      const elapsed = pausedAtRef.current > 0 ? Date.now() - pausedAtRef.current : 0;
      wordStartedAtRef.current += elapsed;
      pausedAtRef.current = 0;
      setPaused(false);
    } else {
      pausedAtRef.current = Date.now();
      setPaused(true);
    }
  }, [paused, phase]);

  const nextWord = useCallback(() => {
    setState((current) => {
      if (!current) return current;
      const excluded = new Set([current.targetWord, ...found]);
      const nextTarget = pickEnigmaTargetWord(
        current.config.wordLength as WordLength,
        level,
        excluded
      );
      return resetForNewWord(current, nextTarget);
    });
    setPhase("playing");
    setPaused(false);
    pausedAtRef.current = 0;
    setHintShown(false);
    setTimeLeft(ROUND_SECONDS);
    setMessage(null);
    setLastPoints(0);
    wordStartedAtRef.current = Date.now();
  }, [found, level]);

  /* Chronomètre par mot */
  useEffect(() => {
    if (phase !== "playing" || paused) return;
    const interval = setInterval(() => {
      const left = ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000);
      if (left <= 0) {
        setTimeLeft(0);
        playSoundEffect("wrong");
        setState((current) =>
          current ? { ...current, isFinished: true, isWin: false, currentStreak: 0 } : current
        );
        setPhase("ended");
      } else {
        setTimeLeft(left);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [phase, paused]);

  const triggerShake = useCallback((rowIdx: number) => {
    setShakeRow(rowIdx);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => setShakeRow(null), 500);
  }, []);

  const typeLetter = useCallback(
    (letter: string) => {
      if (phase !== "playing" || paused) return;
      setState((current) => (current ? addLetterToCurrentGuess(current, letter) : current));
      setMessage(null);
    },
    [paused, phase]
  );

  const backspace = useCallback(() => {
    if (phase !== "playing" || paused) return;
    setState((current) => (current ? removeLetterFromCurrentGuess(current) : current));
    setMessage(null);
  }, [paused, phase]);

  const submit = useCallback(() => {
    if (phase !== "playing" || paused || !state || state.isFinished) return;
    const remaining = Math.max(0, ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000));
    if (remaining === 0) {
      setTimeLeft(0);
      playSoundEffect("wrong");
      setState({ ...state, isFinished: true, isWin: false, currentStreak: 0 });
      setPhase("ended");
      return;
    }
    const guess = getCurrentGuess(state);
    if (guess.length !== state.config.wordLength) {
      playSoundEffect("wrong");
      setMessage("Mot incomplet.");
      triggerShake(state.currentAttemptIndex);
      return;
    }
    const { state: next, result } = submitGuess(state, guess, remaining);
    if (!result.isValid) {
      playSoundEffect("wrong");
      setMessage(result.errorMessage || "Ce mot n'est pas dans le dictionnaire.");
      triggerShake(state.currentAttemptIndex);
      return;
    }
    setState(next);
    setMessage(null);
    if (result.isWin) {
      playSoundEffect("victory");
      setLastPoints(result.pointsEarned);
      setFound((list) => [...list, next.targetWord]);
      setPhase("won");
    } else if (result.isGameOver) {
      playSoundEffect("wrong");
      setPhase("ended");
    } else {
      playSoundEffect("tick");
    }
  }, [paused, phase, state, triggerShake]);

  /* Clavier physique */
  useEffect(() => {
    if (phase !== "playing" && phase !== "won") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape" && phase === "playing") {
        event.preventDefault();
        togglePause();
        return;
      }
      if (phase === "won") {
        if (event.target instanceof HTMLElement && event.target.closest("input, textarea, button, summary")) return;
        if (event.key === "Enter" && !event.repeat) {
          event.preventDefault();
          nextWord();
        }
        return;
      }
      if (paused) return;
      if (event.key === "Enter") {
        if (event.target instanceof HTMLElement && event.target.closest("button, a, summary")) return;
        event.preventDefault();
        submit();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        if (event.target !== gridRef.current) gridRef.current?.focus({ preventScroll: true });
        typeLetter(event.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, paused, togglePause, nextWord, submit, backspace, typeLetter]);

  useEffect(() => {
    const gameWindow = window as Window & {
      render_game_to_text?: () => string;
      advanceTime?: (ms: number) => void;
    };
    const render = () =>
      JSON.stringify({
        phase,
        paused,
        timeLeft,
        wordLength: state?.config.wordLength ?? length,
        level,
        dictionary,
        score: state?.totalScore ?? 0,
        wordsFound: state?.wordsFound ?? 0,
        streak: state?.currentStreak ?? 0,
        rows: state?.rows,
        currentGuess: state ? getCurrentGuess(state) : "",
        message,
      });
    const step = (ms: number) => {
      if (phase !== "playing" || paused || !Number.isFinite(ms) || ms < 0) return;
      wordStartedAtRef.current -= ms;
      const remaining = Math.max(
        0,
        ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining === 0) {
        setState((current) =>
          current ? { ...current, isFinished: true, isWin: false, currentStreak: 0 } : current
        );
        setPhase("ended");
      }
    };
    gameWindow.render_game_to_text = render;
    gameWindow.advanceTime = step;
    return () => {
      if (gameWindow.render_game_to_text === render) delete gameWindow.render_game_to_text;
      if (gameWindow.advanceTime === step) delete gameWindow.advanceTime;
    };
  }, [phase, paused, timeLeft, state, length, level, dictionary, message]);

  /* Enregistrement à la fin de la session */
  useEffect(() => {
    if (phase !== "ended" || !state || submittedRef.current) return;
    submittedRef.current = true;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    setRewardError(null);
    const session = sessionRef.current;
    const final = {
      wordLength: state.config.wordLength as WordLength,
      totalScore: state.totalScore,
      wordsFound: state.wordsFound,
    };
    gameSession
      .finish(Date.now() - startedAtRef.current)
      .then(({ sessionId, durationMs, save }) =>
        save(() => submitEnigmaScrollScore({ ...final, durationMs, sessionId }))
      )
      .then((result) => {
        if (session !== sessionRef.current) return;
        if (!result.success) {
          setRewardError(result.error ?? null);
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(result));
        setSubmitStatus("saved");
      })
      .catch(() => {
        if (session === sessionRef.current) setSubmitStatus("error");
      });
  }, [phase, state, isLoggedIn, gameSession]);

  if (phase === "start") {
    const attemptsForLength = DEFAULT_CONFIGS[length].maxAttempts;
    return (
      <GameStart
        title="Enigma Scroll"
        intro={`Un mot anglais secret de ${length} lettres et ${attemptsForLength} essais pour le déchiffrer. Une lettre verte ✓ est bien placée, une lettre dorée ↔ est présente ailleurs et une lettre grise × est absente.`}
        rules={[
          "90 secondes par mot. Chaque mot trouvé rapporte des points et lance le suivant.",
          "Trouver vite rapporte un bonus de temps ; les séries montent le multiplicateur jusqu'à x2,5.",
          "Besoin d'un coup de pouce ? Tu peux afficher l'indice français à tout moment.",
          missionTarget
            ? `Objectif de mission : ${missionTarget} points.`
            : "Clavier AZERTY / QWERTY interchangeable en pleine partie.",
        ]}
        onStart={start}
        startDisabled={dictionary === "loading"}
        startLabel={dictionary === "loading" ? "Chargement du dictionnaire…" : "Lancer la partie"}
      >
        <div className="eq-game-options" role="radiogroup" aria-label="Longueur du mot">
          {LENGTHS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={length === option.value}
              className="eq-game-option"
              onClick={() => setLength(option.value)}
            >
              <b>{option.label}</b>
              <span>{option.detail}</span>
            </button>
          ))}
        </div>
        <LevelPicker
          value={level}
          onChange={setLevel}
          suggested={suggestedLevel}
          label="Niveau des mots à trouver"
        />
        {dictionary === "fallback" ? (
          <p className="eq-game-end-note is-error" role="status">
            Le dictionnaire complet n&apos;a pas pu être chargé : seuls les mots de la liste du jeu sont acceptés comme propositions.
          </p>
        ) : null}
      </GameStart>
    );
  }

  if (!state) {
    return null;
  }

  function wordNotes(word: string) {
    return <EnigmaWordNotes key={word} word={word} french={getEnigmaTranslation(word)} saved={notes[word] ?? ""}
      onSave={sentence => setNotes(current => ({ ...current, [word]: sentence }))} />;
  }

  if (phase === "ended") {
    const missedWord = state.isWin ? null : state.targetWord;
    return (
      <GameEnd
        gameSlug="enigma-scroll"
        title={state.isWin ? "Session terminée" : timeLeft === 0 ? "Temps écoulé" : "Mot manqué"}
        score={state.totalScore}
        scoreLabel="points"
        lines={[
          `${state.wordsFound} mot${state.wordsFound > 1 ? "s" : ""} trouvé${state.wordsFound > 1 ? "s" : ""}`,
          `Meilleure série : ${state.bestStreak}`,
          `${state.config.wordLength} lettres, niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={missionTarget != null ? state.totalScore >= missionTarget : null}
        onReplay={() => {
          sessionRef.current += 1;
          setPhase("start");
        }}
      >
        {missedWord ? (
          <div className="eq-enigma-reveal" data-testid="enigma-reveal">
            <p className="eq-kicker">Le mot à trouver</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <WordMeaning word={missedWord} />
              <SpeakButton text={missedWord} label="Écouter" />
            </div>
            {wordNotes(missedWord)}
          </div>
        ) : null}
        {found.length > 0 ? (
          <div>
            <p className="eq-kicker">Mots trouvés ({found.length})</p>
            <div className="eq-game-review-scroll">
              <ul className="eq-game-review">
                {found.map((word, idx) => (
                  <li key={`${word}-${idx}`}>
                    <div>
                      <b lang="en">{word}</b>
                      {getEnigmaTranslation(word) ? (
                        <span lang="fr"> · {getEnigmaTranslation(word)}</span>
                      ) : null}
                      {wordNotes(word)}
                    </div>
                    <SpeakButton text={word} label="Audio" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  const keys = keyboardStatus(state);
  const timeLow = timeLeft < 15;
  const activeCursor = getCurrentGuess(state).length;
  const keyRows = KEY_LAYOUTS[keyboardLayout];
  const frenchClue = getEnigmaTranslation(state.targetWord);

  return (
    <div className="eq-game-play eq-enigma">
      <GameHud onQuit={quit}>
        <HudStat label="Score" value={state.totalScore} tone="gold" />
        <HudStat label="Temps" value={`${timeLeft} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat
          label="Série"
          value={state.currentStreak}
          tone="mint"
          hint={`x${Math.min(state.config.streakBonusMultiplier, 1 + state.currentStreak * 0.15).toFixed(2)}`}
        />
        <HudStat label="Mots" value={state.wordsFound} />
      </GameHud>
      <TimeBar percent={(timeLeft / ROUND_SECONDS) * 100} low={timeLow} />

      <div
        className={`eq-game-stage eq-enigma-stage ${phase === "won" ? "is-right" : ""}`}
        data-testid="game-stage"
      >
        <div className="eq-enigma-toolbar">
          <div className="eq-enigma-toolbar-left">
            {frenchClue ? (
              <button
                type="button"
                className={`eq-btn eq-btn-ghost eq-enigma-mini-btn ${hintShown ? "is-active" : ""}`}
                onClick={() => setHintShown(true)}
                disabled={phase !== "playing" || paused || hintShown}
              >
                {hintShown ? `Indice : « ${frenchClue} »` : "Indice FR"}
              </button>
            ) : null}
          </div>
          <div className="eq-enigma-toolbar-right">
            <button
              type="button"
              className="eq-btn eq-btn-ghost eq-enigma-mini-btn"
              onClick={toggleKeyboardLayout}
              title="Basculer le clavier virtuel AZERTY / QWERTY"
            >
              Clavier : {keyboardLayout.toUpperCase()}
            </button>
            {phase === "playing" ? (
              <button
                type="button"
                className="eq-btn eq-btn-ghost eq-enigma-mini-btn"
                onClick={togglePause}
              >
                {paused ? "Reprendre" : "Pause (Échap)"}
              </button>
            ) : null}
          </div>
        </div>

        <div
          className="eq-grid"
          style={{ ["--cols" as string]: state.config.wordLength }}
          role="grid"
          ref={gridRef}
          tabIndex={-1}
          aria-label="Grille des propositions"
        >
          {state.rows.map((row, rowIndex) => {
            const isActiveRow = rowIndex === state.currentAttemptIndex && !row.isSubmitted;
            return (
              <div
                key={rowIndex}
                role="row"
                className={`eq-grid-row ${shakeRow === rowIndex ? "is-shake" : ""} ${
                  isActiveRow ? "is-active" : ""
                }`}
              >
                {row.cells.map((cell, cellIndex) => {
                  const isCursor =
                    phase === "playing" &&
                    isActiveRow &&
                    cellIndex === Math.min(activeCursor, state.config.wordLength - 1) &&
                    !cell.letter;
                  const feedback = cell.status === "empty" ? null : TILE_FEEDBACK[cell.status];
                  return (
                    <span
                      key={cellIndex}
                      role="gridcell"
                      aria-label={`Colonne ${cellIndex + 1}, ${cell.letter || "vide"}${feedback ? ", " + feedback.label : ""}`}
                      className={`eq-grid-cell relative is-${cell.status} ${
                        cell.letter ? "has-letter" : ""
                      } ${isCursor ? "is-cursor" : ""}`}
                      style={
                        row.isSubmitted
                          ? { animationDelay: `${cellIndex * 75}ms` }
                          : undefined
                      }
                    >
                      {cell.letter}
                      {feedback && <small aria-hidden="true" className="absolute bottom-0.5 right-0.5 text-[0.56rem] leading-none">{feedback.mark}</small>}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="eq-enigma-feedback-slot">
          {message ? (
            <p className="eq-game-feedback is-wrong" role="status">
              {message}
            </p>
          ) : null}
        </div>

        {phase === "won" ? (
          <div className="eq-game-feedback is-right eq-enigma-won">
            <div className="eq-enigma-won-head">
              <div>
                <p>Trouvé ! + {lastPoints} points</p>
                <WordMeaning word={state.targetWord} />
              </div>
              <SpeakButton text={state.targetWord} label="Prononcer" />
            </div>
            {wordNotes(state.targetWord)}
            <div className="eq-game-actions">
              <button
                type="button"
                className="eq-btn eq-btn-gold"
                onClick={nextWord}
                autoFocus
                data-testid="next-word"
              >
                Mot suivant (Entrée)
              </button>
              <button
                type="button"
                className="eq-btn eq-btn-ghost"
                onClick={() => {
                  setState((current) =>
                    current ? { ...current, isFinished: true, isWin: true } : current
                  );
                  setPhase("ended");
                }}
              >
                Terminer la session
              </button>
            </div>
          </div>
        ) : (
          <div className="eq-keys" aria-label="Clavier">
            {keyRows.map((row, rowIndex) => (
              <div key={rowIndex} className="eq-keys-row">
                {rowIndex === 2 ? (
                  <button
                    type="button"
                    className="eq-key is-wide"
                    onClick={submit}
                    aria-label="Valider"
                  >
                    OK
                  </button>
                ) : null}
                {row.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className={`eq-key ${keys[letter] ? `is-${keys[letter]}` : ""}`}
                    aria-label={keys[letter] && keys[letter] !== "empty" ? `${letter}, ${TILE_FEEDBACK[keys[letter]].label}` : undefined}
                    onClick={() => typeLetter(letter)}
                  >
                    {letter}
                  </button>
                ))}
                {rowIndex === 2 ? (
                  <button
                    type="button"
                    className="eq-key is-wide"
                    onClick={backspace}
                    aria-label="Effacer"
                  >
                    ⌫
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {paused ? (
          <div className="eq-space-overlay">
            <div className="eq-space-overlay-card">
              <p className="eq-kicker">Pause</p>
              <p className="eq-space-overlay-sub">Chrono en pause · le mot reste secret.</p>
              <div className="eq-space-overlay-actions">
                <button type="button" className="eq-btn eq-btn-gold" onClick={togglePause}>
                  Reprendre
                </button>
                <button type="button" className="eq-btn eq-btn-ghost" onClick={quit}>
                  Changer d&apos;options
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
