"use client";

import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  createGameState,
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
  type WordfallMode,
  type WordfallState,
} from "@/lib/games/wordfall";
import wordfallWordsData from "@/lib/games/words/wordfall-words.json";
import { GameEnd, GameHud, GameStart, HudStat, type RewardSummary } from "@/components/play/game-screens";
import { submitWordfallScore } from "./actions";

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

const MODES: Record<
  WordfallMode,
  { label: string; detail: string; placeholder: string; rules: string[]; hint: string }
> = {
  exact: {
    label: "Vocabulaire",
    detail: "Le mot anglais et sa traduction tombent. Tape les deux.",
    placeholder: "book livre",
    hint: "Tape le mot anglais puis sa traduction française.",
    rules: [
      "Tape d'abord le mot anglais affiché, puis sa traduction française.",
      "Les accents et les espaces en trop sont tolérés.",
    ],
  },
  free: {
    label: "Mot libre",
    detail: "Une lettre tombe. Trouve un mot anglais qui commence par cette lettre.",
    placeholder: "START",
    hint: "Un mot anglais qui commence par la lettre affichée.",
    rules: [
      "Le mot doit commencer par la lettre du bloc et exister dans le dictionnaire anglais.",
      "Un mot déjà joué dans la manche est refusé.",
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
    });
    if (Array.isArray(wordfallWordsData.freeModeWords)) {
      initializeEnglishWords(wordfallWordsData.freeModeWords);
    }
    bootstrapped = { ok: true, error: null };
  } catch (error) {
    console.error("Wordfall: chargement des mots", error);
    bootstrapped = { ok: false, error: "Impossible de préparer Wordfall. Recharge la page." };
  }
  return bootstrapped;
}

export function WordfallGame({ isLoggedIn, missionTarget }: { isLoggedIn: boolean; missionTarget: number | null }) {
  const [boot] = useState(bootstrap);
  const [mode, setMode] = useState<WordfallMode>("exact");
  const [state, setState] = useState<WordfallState | null>(() => createGameState({ mode: "exact" }));
  const [input, setInput] = useState("");
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(boot.error ? { tone: "bad", text: boot.error } : null);
  const [flash, setFlash] = useState<"is-right" | "is-wrong" | "">("");
  const [compact, setCompact] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 900 : false));
  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const inputRef = useRef<HTMLInputElement>(null);
  const loopRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const startedAtRef = useRef(0);
  const submittedRef = useRef(false);
  const sessionRef = useRef(0);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const words = visibleWords(state);
  const maxWords = state ? Math.min(compact ? 1 : 3, getWordfallMaxActiveWords(state)) : 1;
  const spawnDelay = state ? getWordfallSpawnDelayMs(state) : 260;

  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const say = useCallback((tone: "ok" | "bad", text: string, duration = 1600) => {
    setMessage({ tone, text });
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(null), duration);
  }, []);

  const pulse = useCallback((tone: "is-right" | "is-wrong") => {
    setFlash(tone);
    window.setTimeout(() => setFlash(""), 400);
  }, []);

  const reset = useCallback(
    (nextMode: WordfallMode) => {
      sessionRef.current += 1;
      setMode(nextMode);
      setState(createGameState({ mode: nextMode }));
      setInput("");
      setPaused(false);
      setMessage(boot.error ? { tone: "bad", text: boot.error } : null);
      setRewards(null);
      setSubmitStatus("idle");
      submittedRef.current = false;
    },
    [boot.error]
  );

  const start = useCallback(() => {
    if (!boot.ok) return;
    sessionRef.current += 1;
    setState((current) => (current ? startGame(current) : current));
    setPaused(false);
    setInput("");
    setMessage(null);
    setRewards(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    startedAtRef.current = Date.now();
    lastTickRef.current = Date.now();
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [boot.ok]);

  const togglePause = useCallback(() => {
    setState((current) => {
      if (!current || current.gameOver) return current;
      if (paused) {
        lastTickRef.current = Date.now();
        setPaused(false);
        window.setTimeout(() => inputRef.current?.focus(), 80);
        return resumeGame(current);
      }
      if (!current.isRunning) return current;
      setPaused(true);
      return pauseGame(current);
    });
  }, [paused]);

  const spawn = useCallback(() => {
    setState((current) => {
      if (!current || !current.isRunning || current.gameOver) return current;
      const active = visibleWords(current);
      const limit = Math.min(compact ? 1 : 3, getWordfallMaxActiveWords(current));
      if (active.length >= limit) return current;
      const word = spawnFallingWord(current, { mode: current.mode });
      if (!word) return current;
      const next = [...active, word];
      return { ...current, activeWord: next[0] ?? null, activeWords: next, wordStartTime: current.wordStartTime ?? Date.now() };
    });
  }, [compact]);

  const advance = useCallback(
    (delta: number) => {
      setState((current) => {
        const active = visibleWords(current);
        if (!current || !current.isRunning || current.gameOver || active.length === 0) return current;
        const moved = active.map((word) => updateFallingWord(word, delta));
        const missed = moved.find(hasReachedBottom);
        if (missed) {
          pulse("is-wrong");
          say("bad", "Mot manqué : une vie en moins.");
          return processWordMissed({ ...current, activeWord: moved[0] ?? null, activeWords: moved }, missed.id);
        }
        return { ...current, activeWord: moved[0] ?? null, activeWords: moved };
      });
    },
    [pulse, say]
  );

  /* Boucle d'animation */
  useEffect(() => {
    if (!state?.isRunning || state.gameOver || paused) {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
      return;
    }
    const loop = () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      advance(delta);
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    };
  }, [advance, state?.gameOver, state?.isRunning, paused]);

  /* Apparition des mots */
  useEffect(() => {
    if (!state?.isRunning || state.gameOver || paused) return;
    if (words.length >= maxWords) return;
    const timer = window.setTimeout(spawn, words.length === 0 ? 260 : spawnDelay);
    return () => window.clearTimeout(timer);
  }, [words.length, state?.gameOver, state?.isRunning, paused, maxWords, spawnDelay, spawn]);

  const submit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (!state || !state.isRunning || paused || !input.trim()) return;
      const result = processWordInput(state, input);
      if (!result.success) {
        setState(result.newState);
        say("bad", result.reason || "Réponse incorrecte.", 1900);
        pulse("is-wrong");
        return;
      }
      const gained = result.newState.score - state.score;
      setState(result.newState);
      setInput("");
      pulse("is-right");
      if (result.pointsBreakdown?.isPerfect) {
        say("ok", `+ ${gained} points, capture parfaite.`);
      } else if (result.newState.combo > state.combo) {
        say("ok", `+ ${gained} points, combo x${result.newState.combo}.`);
      } else {
        say("ok", `+ ${gained} points.`);
      }
      window.setTimeout(() => inputRef.current?.focus(), 60);
    },
    [state, paused, input, say, pulse]
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

  useEffect(() => {
    const gameWindow = window as Window & { render_game_to_text?: () => string; advanceTime?: (ms: number) => void };
    const render = () => JSON.stringify({
      mode: state?.mode,
      phase: state?.gameOver ? "ended" : paused ? "paused" : state?.isRunning ? "playing" : "start",
      coordinates: "0-100; origin top-left, x right, y down",
      score: state?.score, lives: state?.lives, level: state?.level, streak: state?.streak,
      words: visibleWords(state).map(word => ({ text: word.text, translation: word.translation, x: word.x, y: word.y })),
      input,
    });
    const step = (ms: number) => {
      if (!Number.isFinite(ms) || ms < 0) return;
      spawn();
      advance(ms);
    };
    gameWindow.render_game_to_text = render;
    gameWindow.advanceTime = step;
    return () => {
      if (gameWindow.render_game_to_text === render) delete gameWindow.render_game_to_text;
      if (gameWindow.advanceTime === step) delete gameWindow.advanceTime;
    };
  }, [state, paused, input, spawn, advance]);

  /* Enregistrement */
  useEffect(() => {
    if (!state?.gameOver || submittedRef.current) return;
    submittedRef.current = true;
    if (!isLoggedIn) {
      setSubmitStatus("guest");
      return;
    }
    setSubmitStatus("saving");
    const session = sessionRef.current;
    submitWordfallScore({
      mode: state.mode,
      score: state.score,
      wordsCompleted: state.wordsCompleted,
      durationMs: Date.now() - startedAtRef.current,
    })
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
  }, [state?.gameOver, state?.mode, state?.score, state?.wordsCompleted, isLoggedIn]);

  if (!state) {
    return null;
  }

  const copy = MODES[mode];

  /* ---------- démarrage ---------- */

  if (!state.isRunning && !state.gameOver && !paused) {
    return (
      <GameStart
        title="Les mots tombent"
        intro="Des blocs descendent vers la zone rouge. Tape la bonne réponse avant qu'ils l'atteignent. Plus tu attrapes haut, plus tu marques, et la vitesse monte à chaque niveau."
        rules={[
          ...copy.rules,
          "Trois vies. Un mot qui touche le bas en coûte une.",
          "Échap met le jeu en pause.",
          missionTarget ? `Objectif de mission : ${missionTarget.toLocaleString("fr-FR")} points.` : "Les captures hautes et les séries sans faute donnent des bonus.",
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
        {boot.error ? <p className="eq-game-end-note is-error">{boot.error}</p> : null}
      </GameStart>
    );
  }

  /* ---------- fin ---------- */

  if (state.gameOver) {
    return (
      <GameEnd
        title="Plus de vies"
        score={state.score.toLocaleString("fr-FR")}
        scoreLabel="points"
        lines={[
          `${state.wordsCompleted} mot${state.wordsCompleted > 1 ? "s" : ""} attrapé${state.wordsCompleted > 1 ? "s" : ""}`,
          `Niveau ${state.level} atteint`,
          `Meilleure série : ${state.highestStreak}`,
          `Mode ${copy.label.toLowerCase()}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        missionReached={missionTarget != null ? state.score >= missionTarget : null}
        onReplay={() => reset(mode)}
      />
    );
  }

  /* ---------- partie ---------- */

  return (
    <div className="eq-game-play">
      <GameHud>
        <HudStat label="Score" value={state.score.toLocaleString("fr-FR")} tone="gold" />
        <HudStat label="Vies" value={"●".repeat(Math.max(0, state.lives))} tone={state.lives <= 1 ? "coral" : "mint"} />
        <HudStat label="Niveau" value={state.level} tone="cyan" />
        <HudStat label="Série" value={state.streak} hint={`combo x${state.combo}`} />
      </GameHud>

      <div className={`eq-game-arcade eq-fall ${flash}`} data-testid="wordfall-stage">
        <div className="eq-fall-danger" aria-hidden="true">
          <span>Zone rouge</span>
        </div>
        {state.isRunning && words.length === 0 ? <p className="eq-fall-next">Mot suivant…</p> : null}

        {words.map((word) => {
          const top = 4 + Math.min(1, Math.max(0, word.y) / 100) * 66;
          const progress = Math.max(0, 100 - word.y);
          const long = word.text.replace(/\s+/g, "").length > 9;
          return (
            <div
              key={word.id}
              className="eq-fall-card"
              style={{
                top: `${top}%`,
                left: `clamp(calc(var(--card-w) / 2 + 8px), ${word.x}%, calc(100% - var(--card-w) / 2 - 8px))`,
              }}
            >
              <b className={long ? "is-long" : ""}>{word.text}</b>
              {mode === "exact" && word.translation ? <span>{cleanTranslation(word.translation)}</span> : null}
              {mode === "free" ? <span>mot anglais en {word.text}</span> : null}
              <i style={{ width: `${progress}%` }} />
            </div>
          );
        })}

        {paused ? (
          <div className="eq-fall-overlay">
            <div className="eq-fall-overlay-card">
              <p className="eq-kicker">Pause</p>
              <p>La chute est arrêtée.</p>
              <button type="button" className="eq-btn eq-btn-gold" onClick={togglePause}>
                Reprendre
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={submit} className="eq-game-fields eq-fall-form">
        <label className="eq-game-field">
          <span>{copy.hint}</span>
          <input
            ref={inputRef}
            data-testid="wordfall-input"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={input}
            placeholder={copy.placeholder}
            disabled={paused}
            onChange={(event) => setInput(mode === "free" ? event.target.value.toUpperCase() : event.target.value)}
          />
        </label>
        <div className="eq-game-actions">
          <button type="submit" className="eq-btn eq-btn-gold" disabled={paused || !input.trim()}>
            Valider
          </button>
          <button type="button" className="eq-btn eq-btn-ghost" onClick={togglePause}>
            {paused ? "Reprendre" : "Pause"}
          </button>
        </div>
      </form>

      {message ? (
        <p className={`eq-game-feedback ${message.tone === "ok" ? "is-right" : "is-wrong"}`} role="status">
          {message.text}
        </p>
      ) : null}

      {mode === "free" && state.usedWords.length > 0 ? (
        <p className="eq-fall-used">
          Déjà joués :{" "}
          {state.usedWords.slice(-8).map((word) => (
            <span key={word} className="eq-chip eq-chip-muted">
              {word}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
