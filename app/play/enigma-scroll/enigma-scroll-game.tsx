"use client";

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
import { loadAndFilterWordLists, validateWordLists } from "@/lib/games/enigma-scroll-words";
import wordListsData from "@/lib/games/words/enigma-scroll-words.json";
import { GameEnd, GameHud, GameStart, HudStat, TimeBar, type RewardSummary } from "@/components/play/game-screens";
import { submitEnigmaScrollScore } from "./actions";

type WordLength = 4 | 5 | 6;
type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

const ROUND_SECONDS = 90;
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

let listsReady = false;

function ensureLists() {
  if (listsReady) return;
  try {
    const lists = loadAndFilterWordLists(wordListsData.targetWords, wordListsData.validGuesses);
    for (const length of [4, 5, 6]) {
      if (!lists.validGuesses[length] || lists.validGuesses[length].length === 0) {
        lists.validGuesses[length] = [...lists.targetWords[length]];
      }
    }
    const validation = validateWordLists(lists);
    if (!validation.valid) {
      console.error("Enigma Scroll : listes de mots", validation.errors);
    }
    initializeWordLists(lists);
  } catch (error) {
    console.error("Enigma Scroll : chargement des listes", error);
  }
  listsReady = true;
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

export function EnigmaScrollGame({ isLoggedIn, missionTarget }: { isLoggedIn: boolean; missionTarget: number | null }) {
  const [length, setLength] = useState<WordLength>(5);
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<"start" | "playing" | "won" | "ended">("start");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const startedAtRef = useRef(0);
  const wordStartedAtRef = useRef(0);
  const submittedRef = useRef(false);
  const touchRef = useRef(false);

  useEffect(() => {
    ensureLists();
  }, []);

  const start = useCallback(() => {
    ensureLists();
    setState(createRandomGameState(length));
    setPhase("playing");
    setTimeLeft(ROUND_SECONDS);
    setMessage(null);
    setLastPoints(0);
    setRewards(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    startedAtRef.current = Date.now();
    wordStartedAtRef.current = Date.now();
  }, [length]);

  const nextWord = useCallback(() => {
    setState((current) => {
      if (!current) return current;
      return resetForNewRandomWord(current, new Set([current.targetWord]));
    });
    setPhase("playing");
    setTimeLeft(ROUND_SECONDS);
    setMessage(null);
    setLastPoints(0);
    wordStartedAtRef.current = Date.now();
  }, []);

  /* Chronomètre par mot */
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      const left = ROUND_SECONDS - Math.floor((Date.now() - wordStartedAtRef.current) / 1000);
      if (left <= 0) {
        setTimeLeft(0);
        setState((current) => (current ? { ...current, isFinished: true, isWin: false } : current));
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
    const guess = getCurrentGuess(state);
    if (guess.length !== state.config.wordLength) {
      setMessage("Mot incomplet.");
      setShakeRow(state.currentAttemptIndex);
      window.setTimeout(() => setShakeRow(null), 500);
      return;
    }
    const { state: next, result } = submitGuess(state, guess, timeLeft);
    if (!result.isValid) {
      setMessage(result.errorMessage || "Ce mot n'est pas dans la liste.");
      setShakeRow(state.currentAttemptIndex);
      window.setTimeout(() => setShakeRow(null), 500);
      return;
    }
    setState(next);
    setMessage(null);
    if (result.isWin) {
      setLastPoints(result.pointsEarned);
      setPhase("won");
    } else if (result.isGameOver) {
      setPhase("ended");
    }
  }, [phase, state, timeLeft]);

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

  /* Enregistrement à la fin de la session */
  useEffect(() => {
    if (phase !== "ended" || !state || submittedRef.current) return;
    submittedRef.current = true;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    submitEnigmaScrollScore({
      wordLength: state.config.wordLength as WordLength,
      totalScore: state.totalScore,
      wordsFound: state.wordsFound,
      durationMs: Date.now() - startedAtRef.current,
    })
      .then((result) => {
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
              }
            : null,
          dailyChallenge: result.dailyChallenge ?? null,
        });
        setSubmitStatus("saved");
      })
      .catch(() => setSubmitStatus("error"));
  }, [phase, state, isLoggedIn]);

  /* Pression tactile puis clic : éviter la double saisie */
  const press = (action: () => void) => ({
    onTouchEnd: (event: React.TouchEvent) => {
      event.preventDefault();
      touchRef.current = true;
      action();
      window.setTimeout(() => {
        touchRef.current = false;
      }, 300);
    },
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      if (touchRef.current) return;
      action();
    },
  });

  if (phase === "start") {
    return (
      <GameStart
        title="Trouve le mot caché"
        intro="Un mot anglais secret, quelques essais pour le découvrir. Après chaque proposition, les lettres se colorent : verte à la bonne place, dorée présente ailleurs, grise absente."
        rules={[
          "90 secondes par mot. Chaque mot trouvé en appelle un autre, et les points s'accumulent.",
          "Trouver vite rapporte plus, et les mots enchaînés sans échec font grimper le multiplicateur.",
          "La session s'arrête au premier mot raté ou quand le temps est écoulé.",
          missionTarget ? `Objectif de mission : ${missionTarget} points.` : "Les propositions doivent être de vrais mots anglais.",
        ]}
        onStart={start}
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
      </GameStart>
    );
  }

  if (!state) {
    return null;
  }

  if (phase === "ended") {
    return (
      <GameEnd
        title={state.isWin ? "Session terminée" : timeLeft === 0 ? "Temps écoulé" : "Mot manqué"}
        score={state.totalScore}
        scoreLabel="points"
        lines={[
          `${state.wordsFound} mot${state.wordsFound > 1 ? "s" : ""} trouvé${state.wordsFound > 1 ? "s" : ""}`,
          `Meilleure série : ${state.bestStreak}`,
          `Le dernier mot était ${state.targetWord}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        missionReached={missionTarget != null ? state.totalScore >= missionTarget : null}
        onReplay={() => setPhase("start")}
      />
    );
  }

  const keys = keyboardStatus(state);
  const timeLow = timeLeft < 15;

  return (
    <div className="eq-game-play">
      <GameHud>
        <HudStat label="Score" value={state.totalScore} tone="gold" />
        <HudStat label="Temps" value={`${timeLeft} s`} tone={timeLow ? "coral" : "cyan"} />
        <HudStat label="Série" value={state.currentStreak} tone="mint" />
        <HudStat label="Mots" value={state.wordsFound} />
      </GameHud>
      <TimeBar percent={(timeLeft / ROUND_SECONDS) * 100} low={timeLow} />

      <div className={`eq-game-stage ${phase === "won" ? "is-right" : ""}`} data-testid="game-stage">
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
              <b>{state.targetWord}</b> trouvé, + {lastPoints} points.
            </p>
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
                  <button type="button" className="eq-key is-wide" {...press(submit)} aria-label="Valider">
                    OK
                  </button>
                ) : null}
                {row.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    className={`eq-key ${keys[letter] ? `is-${keys[letter]}` : ""}`}
                    {...press(() => typeLetter(letter))}
                  >
                    {letter}
                  </button>
                ))}
                {rowIndex === 2 ? (
                  <button type="button" className="eq-key is-wide" {...press(backspace)} aria-label="Effacer">
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
