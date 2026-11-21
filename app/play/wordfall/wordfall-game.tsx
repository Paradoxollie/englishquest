"use client";
import { recordClassAnswer } from "@/components/classes/live-activity-events";

import { filterInappropriateWords } from "@/lib/games/enigma-scroll-words";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  createGameState,
  getWordLevel,
  getWordfallMaxActiveWords,
  getWordfallSpawnDelayMs,
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
  type FallingWord,
  type WordfallMode,
  type WordfallState,
} from "@/lib/games/wordfall";
import wordfallWordsData from "@/lib/games/words/wordfall-words.json";
import { playSoundEffect } from "@/lib/games/audio";
import { GameEnd, GameHud, GameStart, HudStat, SpeakButton, TimeBar, mapScoreResultToRewards, type RewardSummary } from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { DEFAULT_GAME_LEVEL, GAME_LEVELS, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import { submitWordfallScore } from "./actions";

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

type FloatingBurst = {
  id: string;
  x: number;
  y: number;
  text: string;
  tone: "ok" | "bad" | "perfect";
};

type ReviewWordEntry = {
  key: string;
  word: string;
  translation: string;
  status: "caught" | "missed";
  cefr: string | null;
};

const MODES: Record<
  WordfallMode,
  { label: string; detail: string; placeholder: string; rules: string[]; hint: string }
> = {
  exact: {
    label: "Vocabulaire",
    detail: "Un mot français descend. Retrouve sa traduction anglaise avant la zone rouge.",
    placeholder: "Ta réponse en anglais",
    hint: "Traduction anglaise",
    rules: [
      "Si le bloc affiche « livre », tape book puis valide avec Entrée.",
      "Un indice dévoile l’initiale ou la longueur du mot que tu cherches.",
    ],
  },
  free: {
    label: "Mot libre",
    detail: "Une lettre tombe. Trouve un mot anglais (3 lettres ou plus) qui commence par cette lettre.",
    placeholder: "START",
    hint: "Un mot anglais de 3 à 20 lettres commençant par la lettre affichée.",
    rules: [
      "Le mot doit faire de 3 à 20 lettres, commencer par la lettre du bloc et figurer dans le dictionnaire.",
      "Un mot déjà validé dans la partie ne peut pas être rejoué.",
    ],
  },
};

function cleanTranslation(translation: string) {
  return translation.replace(/\([^()]*\)/g, "").split("/")[0].split(",")[0].replace(/\s+/g, " ").trim();
}

function visibleWords(state: WordfallState | null) {
  if (!state) return [];
  if (state.activeWords?.length > 0) return state.activeWords;
  return state.activeWord ? [state.activeWord] : [];
}

function getCefrCode(word: string): string | null {
  const lvl = getWordLevel(word);
  if (!lvl) return null;
  return GAME_LEVELS.find((entry) => entry.value === lvl)?.cefr ?? null;
}

let bootstrapped: { ok: boolean; error: string | null } | null = null;

function bootstrap() {
  if (bootstrapped) return bootstrapped;
  try {
    const manual = wordfallWordsData.manualWords;
    if (!manual?.translations || !manual.wordsByLength) {
      bootstrapped = { ok: false, error: "La liste de mots est incomplète." };
      return bootstrapped;
    }
    initializeWordLists({
      translations: manual.translations,
      wordsByLength: manual.wordsByLength,
      expressions: manual.expressions || [],
      levels: manual.levels,
    });
    if (Array.isArray(wordfallWordsData.freeModeWords)) {
      initializeEnglishWords(filterInappropriateWords(wordfallWordsData.freeModeWords));
    }
    bootstrapped = { ok: true, error: null };
  } catch (error) {
    console.error("Wordfall: chargement des mots", error);
    bootstrapped = { ok: false, error: "Impossible de préparer Wordfall. Recharge la page." };
  }
  return bootstrapped;
}

function computeNextSpawnDelay(state: WordfallState, compact: boolean): number {
  const active = visibleWords(state);
  const limit = Math.min(compact ? 1 : 3, getWordfallMaxActiveWords(state));
  if (active.length >= limit) return 0;
  return active.length === 0 ? 180 : getWordfallSpawnDelayMs(state);
}

export function WordfallGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
}) {
  const [boot] = useState(bootstrap);
  const [mode, setMode] = useState<WordfallMode>("exact");
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [state, setState] = useState<WordfallState>(() =>
    createGameState({ mode: "exact", vocabLevel: suggestedLevel ?? DEFAULT_GAME_LEVEL })
  );
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(
    boot.error ? { tone: "bad", text: boot.error } : null
  );
  const [flash, setFlash] = useState<"is-right" | "is-wrong" | "">("");
  const [bursts, setBursts] = useState<FloatingBurst[]>([]);
  const [reviewWords, setReviewWords] = useState<ReviewWordEntry[]>([]);
  const [compact, setCompact] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 540 : false));
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  useRefreshAfterScore(submitStatus);

  const stateRef = useRef(state);
  const compactRef = useRef(compact);
  const pausedRef = useRef(paused);

  const inputRef = useRef<HTMLInputElement>(null);
  const loopRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const startedAtRef = useRef(0);
  const submittedRef = useRef(false);
  const sessionRef = useRef(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameSession = useGameSession("wordfall", isLoggedIn);

  const words = visibleWords(state);
  const inSession = Boolean((state.isRunning || paused) && !state.gameOver);
  useGameFocusMode(inSession);
  const maxWords = Math.min(compact ? 1 : 3, getWordfallMaxActiveWords(state));
  const spawnDelay = getWordfallSpawnDelayMs(state);

  useEffect(() => {
    stateRef.current = state;
    compactRef.current = compact;
    pausedRef.current = paused;
  }, [state, compact, paused]);

  useEffect(() => {
    const onResize = () => {
      const nextCompact = window.innerWidth < 540;
      compactRef.current = nextCompact;
      setCompact(nextCompact);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
      if (spawnRetryRef.current) clearTimeout(spawnRetryRef.current);
    };
  }, []);

  const focusInputSoon = useCallback((delay = 60) => {
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => inputRef.current?.focus(), delay);
  }, []);

  const say = useCallback((tone: "ok" | "bad", text: string, duration = 1700) => {
    setMessage({ tone, text });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  const pulse = useCallback((tone: "is-right" | "is-wrong") => {
    setFlash(tone);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(""), 380);
  }, []);

  const emitBurst = useCallback((x: number, y: number, text: string, tone: FloatingBurst["tone"]) => {
    const id = `${Date.now()}-${Math.random()}`;
    setBursts((prev) => [...prev.slice(-6), { id, x, y, text, tone }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((item) => item.id !== id));
    }, 850);
  }, []);

  const recordReview = useCallback((word: FallingWord, status: "caught" | "missed", extraWord?: string) => {
    const label = extraWord ?? word.text;
    const tr =
      word.translation
        ? cleanTranslation(word.translation)
        : status === "caught"
          ? `Lettre ${word.text} validée`
          : `Lettre ${word.text} manquée`;
    const key = `${label}::${status}::${tr}`;
    setReviewWords((prev) => {
      if (prev.some((entry) => entry.key === key)) return prev;
      return [...prev, { key, word: label, translation: tr, status, cefr: getCefrCode(word.text) }];
    });
  }, []);

  const reset = useCallback(
    (nextMode: WordfallMode) => {
      sessionRef.current += 1;
      gameSession.cancel();
      const fresh = createGameState({ mode: nextMode, vocabLevel: nextMode === "exact" ? level : null });
      stateRef.current = fresh;
      setMode(nextMode);
      setState(fresh);
      setInput("");
      setPaused(false);
      pausedRef.current = false;
      setBursts([]);
      setReviewWords([]);
      setMessage(boot.error ? { tone: "bad", text: boot.error } : null);
      setRewards(null);
      setSubmitStatus("idle");
      setSubmitError(null);
      submittedRef.current = false;
    },
    [boot.error, gameSession, level]
  );

  const start = useCallback(() => {
    if (!boot.ok) return;
    sessionRef.current += 1;
    gameSession.begin();
    const fresh = startGame(createGameState({ mode, vocabLevel: mode === "exact" ? level : null }));
    stateRef.current = fresh;
    setState(fresh);
    setPaused(false);
    pausedRef.current = false;
    setInput("");
    setBursts([]);
    setReviewWords([]);
    setMessage(null);
    setRewards(null);
    setSubmitStatus("idle");
    setSubmitError(null);
    submittedRef.current = false;
    startedAtRef.current = performance.now();
    lastTickRef.current = performance.now();
    focusInputSoon(80);
  }, [boot.ok, gameSession, mode, level, focusInputSoon]);

  const togglePause = useCallback(() => {
    const current = stateRef.current;
    if (!current || current.gameOver) return;
    if (pausedRef.current) {
      lastTickRef.current = performance.now();
      pausedRef.current = false;
      setPaused(false);
      const next = resumeGame(current);
      stateRef.current = next;
      setState(next);
      focusInputSoon(80);
    } else if (current.isRunning) {
      pausedRef.current = true;
      setPaused(true);
      const next = pauseGame(current);
      stateRef.current = next;
      setState(next);
    }
  }, [focusInputSoon]);

  const spawnOne = useCallback((): boolean => {
    const current = stateRef.current;
    if (!current || !current.isRunning || current.gameOver || pausedRef.current) return false;
    const active = visibleWords(current);
    const limit = Math.min(compactRef.current ? 1 : 3, getWordfallMaxActiveWords(current));
    if (active.length >= limit) return false;
    const word = spawnFallingWord(current, { mode: current.mode });
    if (!word) return false;
    const nextWords = [...active, word];
    const nextState: WordfallState = {
      ...current,
      activeWord: nextWords[0] ?? null,
      activeWords: nextWords,
      wordStartTime: current.wordStartTime ?? Date.now(),
    };
    stateRef.current = nextState;
    setState(nextState);
    return true;
  }, []);

  const advance = useCallback(
    (deltaMs: number) => {
      const current = stateRef.current;
      const active = visibleWords(current);
      if (!current || !current.isRunning || current.gameOver || pausedRef.current || active.length === 0) return;

      const moved = active.map((word) => updateFallingWord(word, deltaMs));
      const missedList = moved.filter(hasReachedBottom);

      if (missedList.length === 0) {
        const nextState: WordfallState = { ...current, activeWord: moved[0] ?? null, activeWords: moved };
        stateRef.current = nextState;
        setState(nextState);
        return;
      }

      let workingState: WordfallState = { ...current, activeWord: moved[0] ?? null, activeWords: moved };
      for (const missedWord of missedList) {
        if (workingState.gameOver) break;
        recordReview(missedWord, "missed");
        emitBurst(missedWord.x, 78, "Vie -1", "bad");
        workingState = processWordMissed(workingState, missedWord.id);
      }

      stateRef.current = workingState;
      setState(workingState);
      playSoundEffect("wrong");
      pulse("is-wrong");
      const firstMissed = missedList[0];
      say(
        "bad",
        firstMissed.translation
          ? `Manqué : ${firstMissed.text} = ${cleanTranslation(firstMissed.translation)}.`
          : `Manqué (${firstMissed.text}) : une vie en moins.`,
        2100
      );
    },
    [emitBurst, pulse, recordReview, say]
  );

  /* Boucle d'animation GPU-fluide sans transition CSS sur top */
  useEffect(() => {
    if (!state.isRunning || state.gameOver || paused) {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
      return;
    }
    lastTickRef.current = performance.now();
    const loop = (now: number) => {
      const delta = Math.min(80, Math.max(0, now - lastTickRef.current));
      lastTickRef.current = now;
      if (delta > 0) advance(delta);
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    };
  }, [advance, state.gameOver, state.isRunning, paused]);

  /* Apparition continue des blocs avec retry si les couloirs sont momentanément pleins */
  useEffect(() => {
    if (spawnRetryRef.current) {
      clearTimeout(spawnRetryRef.current);
      spawnRetryRef.current = null;
    }
    if (!state.isRunning || state.gameOver || paused) return;
    if (words.length >= maxWords) return;

    const scheduleAttempt = (delay: number) => {
      spawnRetryRef.current = setTimeout(() => {
        const spawned = spawnOne();
        if (!spawned && stateRef.current.isRunning && !stateRef.current.gameOver && !pausedRef.current) {
          const delayNext = computeNextSpawnDelay(stateRef.current, compactRef.current);
          if (delayNext > 0) scheduleAttempt(180);
        }
      }, delay);
    };

    scheduleAttempt(words.length === 0 ? 180 : spawnDelay);

    return () => {
      if (spawnRetryRef.current) {
        clearTimeout(spawnRetryRef.current);
        spawnRetryRef.current = null;
      }
    };
  }, [words.length, state.gameOver, state.isRunning, paused, maxWords, spawnDelay, spawnOne]);

  const submit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const current = stateRef.current;
      if (!current || !current.isRunning || pausedRef.current || !input.trim()) return;
      const result = processWordInput(current, input);
      recordClassAnswer(result.success);
      if (!result.success) {
        stateRef.current = result.newState;
        setState(result.newState);
        playSoundEffect("wrong");
        say("bad", result.reason || "Réponse incorrecte.", 1900);
        pulse("is-wrong");
        return;
      }

      const gained = result.newState.score - current.score;
      const matched = result.matchedWord ?? visibleWords(current)[0];
      stateRef.current = result.newState;
      setState(result.newState);
      setInput("");
      pulse("is-right");
      playSoundEffect(result.newState.combo > current.combo ? "combo" : "correct");

      if (matched) {
        const topPct = 4 + Math.min(1, Math.max(0, matched.y) / 100) * 68;
        emitBurst(
          matched.x,
          topPct,
          result.pointsBreakdown?.isPerfect ? `+${gained} ⚡` : `+${gained}`,
          result.pointsBreakdown?.isPerfect ? "perfect" : "ok"
        );
        recordReview(
          matched,
          "caught",
          input.trim().toUpperCase()
        );
      }

      if (result.pointsBreakdown?.isPerfect) {
        say("ok", `+ ${gained} points — capture éclair !`);
      } else if (result.newState.combo > current.combo) {
        say("ok", `+ ${gained} points — combo x${result.newState.combo} !`);
      } else {
        say("ok", `+ ${gained} points.`);
      }
      focusInputSoon(50);
    },
    [input, say, pulse, emitBurst, recordReview, focusInputSoon]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause]);

  /* Hook automatisé Playwright / audit */
  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string; advanceTime?: (ms: number) => void };
    const render = () => {
      const current = stateRef.current;
      return JSON.stringify({
        mode: current.mode,
        phase: current.gameOver ? "ended" : pausedRef.current ? "paused" : current.isRunning ? "playing" : "start",
        coordinates: "0-100; origin top-left, x right, y down",
        score: current.score,
        lives: current.lives,
        level: current.level,
        streak: current.streak,
        words: visibleWords(current).map((word) => ({ text: word.displayText, x: word.x, y: word.y })),
        input,
      });
    };
    const step = (ms: number) => {
      if (!Number.isFinite(ms) || ms < 0) return;
      spawnOne();
      advance(ms);
    };
    gameWindow.render_game_to_text = render;
    gameWindow.advanceTime = step;
    return () => {
      if (gameWindow.render_game_to_text === render) delete gameWindow.render_game_to_text;
      if (gameWindow.advanceTime === step) delete gameWindow.advanceTime;
    };
  }, [input, spawnOne, advance]);

  /* Enregistrement du score en fin de partie */
  useEffect(() => {
    if (!state.gameOver || submittedRef.current) return;
    submittedRef.current = true;
    playSoundEffect(state.wordsCompleted > 0 ? "victory" : "wrong");
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    setSubmitError(null);
    const session = sessionRef.current;
    const final = { mode: state.mode, score: state.score, wordsCompleted: state.wordsCompleted };
    gameSession
      .finish(performance.now() - startedAtRef.current)
      .then(({ sessionId, durationMs, save }) => save(() => submitWordfallScore({ ...final, durationMs, sessionId })))
      .then((result) => {
        if (session !== sessionRef.current) return;
        if (!result.success) {
          setSubmitError(result.error ?? null);
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(result));
        setSubmitStatus("saved");
      })
      .catch(() => {
        if (session === sessionRef.current) setSubmitStatus("error");
      });
  }, [state.gameOver, state.mode, state.score, state.wordsCompleted, isLoggedIn, gameSession]);

  const copy = MODES[mode];

  // In free mode the displayed initial identifies a block. A vocabulary prompt
  // keeps its spelling hidden until the player submits an English translation.
  const initial = input.trim()[0]?.toUpperCase();
  const matchingWord = mode === "free" && initial
    ? words.find(word => word.displayText.toUpperCase() === initial)
    : undefined;
  const lowestWord = words.reduce<FallingWord | null>(
    (lowest, w) => (!lowest || w.y > lowest.y ? w : lowest),
    null
  );
  const focusWord = matchingWord ?? lowestWord;

  /* ---------- démarrage ---------- */

  if (!state.isRunning && !state.gameOver && !paused) {
    return (
      <GameStart
        title="Les mots tombent"
        intro="Des blocs descendent en continu vers la zone rouge. Tape la bonne réponse avant qu'ils n'atteignent la ligne laser."
        rules={[
          ...copy.rules,
          "Trois vies : chaque bloc qui franchit la zone rouge coûte une vie.",
          "Capture éclair en haut du plateau = bonus maximal ; Échap met en pause.",
          missionTarget
            ? `Objectif de mission : ${missionTarget.toLocaleString("fr-FR")} points.`
            : "Enchaîne les mots sans erreur pour monter le combo (jusqu'à x3).",
        ]}
        onStart={start}
      >
        <div className="eq-game-options" role="radiogroup" aria-label="Mode">
          {(Object.keys(MODES) as WordfallMode[]).map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={mode === key}
              className="eq-game-option"
              onClick={() => reset(key)}
            >
              <b>{MODES[key].label}</b>
              <span>{MODES[key].detail}</span>
            </button>
          ))}
        </div>
        {mode === "exact" ? (
          <LevelPicker
            value={level}
            onChange={(next) => {
              setLevel(next);
              const updated = createGameState({ mode: "exact", vocabLevel: next });
              stateRef.current = updated;
              setState(updated);
            }}
            suggested={suggestedLevel}
          />
        ) : null}
        {boot.error ? <p className="eq-game-end-note is-error">{boot.error}</p> : null}
      </GameStart>
    );
  }

  /* ---------- fin ---------- */

  if (state.gameOver) {
    return (
      <GameEnd
        gameSlug="wordfall"
        title={state.wordsCompleted > 0 ? "Partie terminée" : "Plus de vies"}
        score={state.score.toLocaleString("fr-FR")}
        scoreLabel="points"
        lines={[
          `${state.wordsCompleted} mot${state.wordsCompleted > 1 ? "s" : ""} attrapé${state.wordsCompleted > 1 ? "s" : ""}`,
          `Niveau ${state.level} atteint · ${state.perfectCatches} capture${state.perfectCatches > 1 ? "s" : ""} éclair`,
          `Meilleure série : ${state.highestStreak}`,
          mode === "exact" ? `Mode vocabulaire : ${getGameLevelLabel(level)}` : "Mode mot libre",
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        retryScore={gameSession.retryScore}
        rewardError={submitError}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={() => reset(mode)}
      >
        {reviewWords.length > 0 ? (
          <div className="eq-game-review-scroll">
            <ul className="eq-game-review">
              {reviewWords.map((entry) => (
                <li key={entry.key} className={entry.status === "missed" ? "is-hard" : ""}>
                  <div>
                    <b>{entry.word}</b>{" "}
                    {entry.cefr ? <span className="eq-chip eq-chip-muted">{entry.cefr}</span> : null}
                    <span>
                      {" "}
                      · {entry.translation} ({entry.status === "caught" ? "attrapé" : "manqué"})
                    </span>
                  </div>
                  <SpeakButton text={entry.word} label="Écouter" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  /* ---------- partie ---------- */

  const wordsInCurrentLevel = state.wordsCompleted % 5;
  const levelProgressPct = (wordsInCurrentLevel / 5) * 100;

  return (
    <div className="eq-game-play">
      <GameHud onQuit={() => reset(mode)}>
        <HudStat label="Score" value={state.score.toLocaleString("fr-FR")} tone="gold" />
        <HudStat
          label="Vies"
          value={"♥".repeat(Math.max(0, state.lives)) + "♡".repeat(Math.max(0, 3 - state.lives))}
          tone={state.lives <= 1 ? "coral" : "mint"}
        />
        <HudStat label="Niveau" value={state.level} hint={`${wordsInCurrentLevel}/5 mots`} tone="cyan" />
        <HudStat label="Série" value={state.streak} hint={`combo x${state.combo}`} tone={state.combo > 1 ? "gold" : "default"} />
      </GameHud>

      <TimeBar percent={levelProgressPct} low={state.lives <= 1} />

      <div className="eq-fall-shell">
        <div className={`eq-game-arcade eq-fall ${flash}`} data-testid="wordfall-stage">
          <div className="eq-fall-lanes" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="eq-fall-danger" aria-hidden="true">
            <span>Zone rouge</span>
          </div>
          {state.isRunning && words.length === 0 ? <p className="eq-fall-next">Mot suivant…</p> : null}

          {words.map((word) => {
            const top = 4 + Math.min(1, Math.max(0, word.y) / 100) * 68;
            const progress = Math.max(0, 100 - word.y);
            const isLong = word.displayText.length > 9 || word.displayText.includes(" ");
            const inDanger = word.y >= 72;
            const isTargeted = matchingWord?.id === word.id;
            const cefr = mode === "exact" ? getCefrCode(word.text) : null;

            return (
              <div
                key={word.id}
                className={`eq-fall-card${inDanger ? " is-danger" : ""}${isTargeted ? " is-targeted" : ""}`}
                style={{
                  top: `${top}%`,
                  left: `clamp(calc(var(--card-w) / 2 + 8px), ${word.x}%, calc(100% - var(--card-w) / 2 - 8px))`,
                }}
              >
                {cefr ? <em className="eq-fall-cefr">{cefr}</em> : null}
                <b className={isLong ? "is-long" : ""} lang={mode === "exact" ? "fr" : "en"}>{word.displayText}</b>
                {mode === "free" ? <span>Commence par {word.text}</span> : null}
                <i style={{ width: `${progress}%` }} />
              </div>
            );
          })}

          {bursts.map((burst) => (
            <span
              key={burst.id}
              className={`eq-fall-burst is-${burst.tone}`}
              style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
              aria-hidden="true"
            >
              {burst.text}
            </span>
          ))}

          {paused ? (
            <div className="eq-fall-overlay">
              <div className="eq-fall-overlay-card">
                <p className="eq-kicker">Pause</p>
                <p>La chute est en pause.</p>
                <button type="button" className="eq-btn eq-btn-gold" onClick={togglePause}>
                  Reprendre
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="eq-fall-dock">
          <form onSubmit={submit} className="eq-game-fields eq-fall-form">
            <label className="eq-game-field">
              <span>{copy.hint}</span>
              <input
                ref={inputRef}
                data-testid="wordfall-input"
                type="text"
                enterKeyHint="send"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                value={input}
                placeholder={copy.placeholder}
                disabled={paused}
                style={{ textTransform: mode === "free" ? "uppercase" : undefined }}
                onChange={(event) => setInput(event.target.value)}
              />
            </label>
            <div className="eq-game-actions">
              <button type="submit" className="eq-btn eq-btn-gold" disabled={paused || !input.trim()}>
                Valider
              </button>
              {mode === "exact" && focusWord ? (
                <button type="button" className="eq-btn eq-btn-ghost" disabled={paused} onClick={() => {
                  const target = focusWord.text.toLowerCase();
                  const clue = target.length > 1
                    ? `commence par « ${target[0]} » et compte ${target.replace(/[^a-z]/g, "").length} lettres`
                    : "se traduit par une seule lettre";
                  say("ok", `« ${focusWord.displayText} » ${clue}.`, 3200);
                  focusInputSoon(0);
                }}>Indice</button>
              ) : null}
              <button type="button" className="eq-btn eq-btn-ghost" onClick={togglePause}>
                {paused ? "Reprendre" : "Pause (Échap)"}
              </button>
            </div>
          </form>

          <div className="eq-fall-status-slot" role="status" aria-live="polite">
            {message ? (
              <p className={`eq-game-feedback eq-fall-msg ${message.tone === "ok" ? "is-right" : "is-wrong"}`}>
                {message.text}
              </p>
            ) : (
              <p className="eq-fall-idle-tip">
                {focusWord
                  ? mode === "exact"
                    ? `À traduire : « ${focusWord.displayText} »${words.length > 1 ? ` · ${words.length} blocs à l'écran` : ""}`
                    : `Lettre ciblée : ${focusWord.displayText} · 3 à 20 lettres`
                  : "Préparation du prochain bloc…"}
              </p>
            )}
          </div>

          {mode === "free" && state.usedWords.length > 0 ? (
            <p className="eq-fall-used">
              Déjà joués ({state.usedWords.length}) :{" "}
              {state.usedWords.slice(-8).map((word) => (
                <span key={word} className="eq-chip eq-chip-muted">
                  {word}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
