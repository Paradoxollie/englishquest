"use client";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addLetterToCurrentGuess,
  createRandomGameState,
  getCurrentGuess,
  initializeWordLists,
  removeLetterFromCurrentGuess,
  resetForNewRandomWord,
  submitGuess,
  type GameState,
  type LetterStatus,
} from "@/lib/games/enigma-scroll";
import { ENIGMA_TARGETS, enigmaTargetsForLevel, getEnigmaTranslation } from "@/lib/games/enigma-scroll-targets";
import { filterInappropriateWords, loadAndFilterWordLists } from "@/lib/games/enigma-scroll-words";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import { GameEnd, GameHud, GameStart, HudStat, TimeBar, type RewardSummary } from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { submitEnigmaScrollScore } from "./actions";

type WordLength = 4 | 5 | 6;
type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";
type Dictionary = "loading" | "ready" | "fallback";

const ROUND_SECONDS = 90;
const DICTIONARY_TIMEOUT_MS = 10_000;
const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

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
 * Prépare le moteur pour une partie : mots cibles du niveau choisi, et
 * propositions acceptées. Si le dictionnaire n'a pas pu être chargé, tout mot
 * de la liste des cibles (tous niveaux) reste une proposition valable.
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
  const [dictionary, setDictionary] = useState<Dictionary>("loading");
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<"start" | "playing" | "won" | "ended">("start");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const wordStartedAtRef = useRef(0);
  const submittedRef = useRef(false);
  const sessionRef = useRef(0);
  const gameSession = useGameSession("enigma-scroll", isLoggedIn);

  useGameFocusMode(phase === "playing" || phase === "won");

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
    setState(createRandomGameState(length));
    setPhase("playing");
    setTimeLeft(ROUND_SECONDS);
    setMessage(null);
    setLastPoints(0);
    setFound([]);
    setRewards(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    startedAtRef.current = Date.now();
    wordStartedAtRef.current = Date.now();
  }, [length, level, gameSession]);

  /* Abandon : retour à l'écran de départ, rien n'est enregistré. */
  const quit = useCallback(() => {
    sessionRef.current += 1;
    gameSession.cancel();
    setMessage(null);
    setPhase("start");
  }, [gameSession]);

  const nextWord = useCallback(() => {
    setState((current) => {
      if (!current) return current;
      return resetForNewRandomWord(current, new Set([current.targetWord, ...found]));
    });
    setPhase("playing");
    setTimeLeft(ROUND_SECONDS);
    setMessage(null);
    setLastPoints(0);
    wordStartedAtRef.current = Date.now();
  }, [found]);

  /* Chronomètre par mot */
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const left = ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000);
      if (left <= 0) {
        setTimeLeft(0);
        setState((current) => (current ? { ...current, isFinished: true, isWin: false, currentStreak: 0 } : current));
        setPhase("ended");
      } else {
        setTimeLeft(left);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [phase]);

  const typeLetter = useCallback(
    (letter: string) => {
      if (phase !== "playing") return;
      setState((current) => (current ? addLetterToCurrentGuess(current, letter) : current));
      setMessage(null);
    },
    [phase]
  );

  const backspace = useCallback(() => {
    if (phase !== "playing") return;
    setState((current) => (current ? removeLetterFromCurrentGuess(current) : current));
    setMessage(null);
  }, [phase]);

  const submit = useCallback(() => {
    if (phase !== "playing" || !state || state.isFinished) return;
    const remaining = Math.max(0, ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000));
    if (remaining === 0) {
      setTimeLeft(0);
      setState({ ...state, isFinished: true, isWin: false, currentStreak: 0 });
      setPhase("ended");
      return;
    }
    const guess = getCurrentGuess(state);
    if (guess.length !== state.config.wordLength) {
      setMessage("Mot incomplet.");
      setShakeRow(state.currentAttemptIndex);
      window.setTimeout(() => setShakeRow(null), 500);
      return;
    }
    const { state: next, result } = submitGuess(state, guess, remaining);
    if (!result.isValid) {
      setMessage("Ce mot n'est pas dans le dictionnaire.");
      setShakeRow(state.currentAttemptIndex);
      window.setTimeout(() => setShakeRow(null), 500);
      return;
    }
    setState(next);
    setMessage(null);
    if (result.isWin) {
      setLastPoints(result.pointsEarned);
      setFound((list) => [...list, next.targetWord]);
      setPhase("won");
    } else if (result.isGameOver) {
      setPhase("ended");
    }
  }, [phase, state]);

  /* Clavier physique */
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") {
        event.preventDefault();
        submit();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        typeLetter(event.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, submit, backspace, typeLetter]);

  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string; advanceTime?: (ms: number) => void };
    const render = () => JSON.stringify({
      phase, timeLeft, wordLength: state?.config.wordLength ?? length, level, dictionary,
      score: state?.totalScore ?? 0, wordsFound: state?.wordsFound ?? 0, streak: state?.currentStreak ?? 0,
      rows: state?.rows, currentGuess: state ? getCurrentGuess(state) : "", message,
    });
    const step = (ms: number) => {
      if (phase !== "playing" || !Number.isFinite(ms) || ms < 0) return;
      wordStartedAtRef.current -= ms;
      const remaining = Math.max(0, ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setState(current => current ? { ...current, isFinished: true, isWin: false, currentStreak: 0 } : current);
        setPhase("ended");
      }
    };
    gameWindow.render_game_to_text = render;
    gameWindow.advanceTime = step;
    return () => {
      if (gameWindow.render_game_to_text === render) delete gameWindow.render_game_to_text;
      if (gameWindow.advanceTime === step) delete gameWindow.advanceTime;
    };
  }, [phase, timeLeft, state, length, level, dictionary, message]);

  /* Enregistrement à la fin de la session */
  useEffect(() => {
    if (phase !== "ended" || !state || submittedRef.current) return;
    submittedRef.current = true;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    const session = sessionRef.current;
    const final = {
      wordLength: state.config.wordLength as WordLength,
      totalScore: state.totalScore,
      wordsFound: state.wordsFound,
    };
    gameSession
      .finish(Date.now() - startedAtRef.current)
      .then(({ sessionId, durationMs }) => submitEnigmaScrollScore({ ...final, durationMs, sessionId }))
      .then((result) => {
        if (session !== sessionRef.current) return;
        if (!result.success) {
          setSubmitStatus("error");
          return;
        }
        setRewards({
          xpEarned: result.rewards?.xpEarned ?? 0,
          goldEarned: result.rewards?.goldEarned ?? 0,
          newLevel: result.rewards?.newLevel ?? null,
          isNewPersonalBest: result.isNewPersonalBest,
          isNewGlobalBest: result.isNewGlobalBest,
          courseCompleted: result.courseCompleted
            ? {
                courseNumber: result.courseCompleted.courseNumber,
                courseTitle: result.courseCompleted.courseTitle,
                rewards: result.courseCompleted.rewards,
                newLevel: result.courseCompleted.newLevel,
              }
            : null,
          dailyChallenge: result.dailyChallenge ?? null,
          newBadges: result.newBadges ?? [],
        });
        setSubmitStatus("saved");
      })
      .catch(() => { if (session === sessionRef.current) setSubmitStatus("error"); });
  }, [phase, state, isLoggedIn, gameSession]);

  if (phase === "start") {
    return (
      <GameStart
        title="Trouve le mot caché"
        intro="Un mot anglais secret, quelques essais pour le découvrir. Après chaque proposition, les lettres se colorent : verte à la bonne place, dorée présente ailleurs, grise absente. Chaque mot se termine par sa traduction."
        rules={[
          "90 secondes par mot. Chaque mot trouvé en appelle un autre, et les points s'accumulent.",
          "Trouver vite rapporte plus, et les mots enchaînés sans échec font grimper le multiplicateur.",
          "La session s'arrête au premier mot raté ou quand le temps est écoulé.",
          missionTarget ? `Objectif de mission : ${missionTarget} points.` : "Les propositions doivent être de vrais mots anglais.",
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
        <LevelPicker value={level} onChange={setLevel} suggested={suggestedLevel} label="Niveau des mots à trouver" />
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

  if (phase === "ended") {
    const missedWord = state.isWin ? null : state.targetWord;
    return (
      <GameEnd
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
        missionReached={missionTarget != null ? state.totalScore >= missionTarget : null}
        onReplay={() => { sessionRef.current += 1; setPhase("start"); }}
      >
        {missedWord ? (
          <div className="eq-enigma-reveal" data-testid="enigma-reveal">
            <p className="eq-kicker">Le mot à trouver</p>
            <WordMeaning word={missedWord} />
          </div>
        ) : null}
        {found.length > 0 ? (
          <div>
            <p className="eq-kicker">Mots trouvés</p>
            <ul className="eq-game-review">
              {found.map((word) => (
                <li key={word}>
                  <b lang="en">{word}</b>
                  <span lang="fr">{getEnigmaTranslation(word) ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  const keys = keyboardStatus(state);
  const timeLow = timeLeft < 15;

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quit}>
        <HudStat label="Score" value={state.totalScore} tone="gold" />
        <HudStat label="Temps" value={`${timeLeft} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat label="Série" value={state.currentStreak} tone="mint" />
        <HudStat label="Mots" value={state.wordsFound} />
      </GameHud>
      <TimeBar percent={(timeLeft / ROUND_SECONDS) * 100} low={timeLow} />

      <div className={`eq-game-stage eq-enigma-stage ${phase === "won" ? "is-right" : ""}`} data-testid="game-stage">
        <div className="eq-grid" style={{ ["--cols" as string]: state.config.wordLength }} role="grid" aria-label="Grille">
          {state.rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              role="row"
              className={`eq-grid-row ${shakeRow === rowIndex ? "is-shake" : ""} ${rowIndex === state.currentAttemptIndex && !row.isSubmitted ? "is-active" : ""}`}
            >
              {row.cells.map((cell, cellIndex) => (
                <span
                  key={cellIndex}
                  role="gridcell"
                  className={`eq-grid-cell is-${cell.status} ${cell.letter ? "has-letter" : ""}`}
                  style={row.isSubmitted ? { animationDelay: `${cellIndex * 70}ms` } : undefined}
                >
                  {cell.letter}
                </span>
              ))}
            </div>
          ))}
        </div>

        {message ? (
          <p className="eq-game-feedback is-wrong" role="status">
            {message}
          </p>
        ) : null}

        {phase === "won" ? (
          <div className="eq-game-feedback is-right" role="status">
            <p>
              Trouvé, + {lastPoints} points.
            </p>
            <WordMeaning word={state.targetWord} />
            <div className="eq-game-actions">
              <button type="button" className="eq-btn eq-btn-gold" onClick={nextWord} autoFocus data-testid="next-word">
                Mot suivant
              </button>
              <button
                type="button"
                className="eq-btn eq-btn-ghost"
                onClick={() => {
                  setState((current) => (current ? { ...current, isFinished: true, isWin: true } : current));
                  setPhase("ended");
                }}
              >
                Arrêter ici
              </button>
            </div>
          </div>
        ) : (
          <div className="eq-keys" aria-label="Clavier">
            {KEY_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="eq-keys-row">
                {rowIndex === 2 ? (
                  <button type="button" className="eq-key is-wide" onClick={submit} aria-label="Valider">
                    OK
                  </button>
                ) : null}
                {row.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className={`eq-key ${keys[letter] ? `is-${keys[letter]}` : ""}`}
                    onClick={() => typeLetter(letter)}
                  >
                    {letter}
                  </button>
                ))}
                {rowIndex === 2 ? (
                  <button type="button" className="eq-key is-wide" onClick={backspace} aria-label="Effacer">
                    ⌫
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
