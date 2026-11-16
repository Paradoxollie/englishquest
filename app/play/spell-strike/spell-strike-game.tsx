"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playClipOrSpeak, playSoundEffect, stopAllGameAudio } from "@/lib/games/audio";
import {
  buildSpellingDiff,
  computeSpellRoundPoints,
  getSpellDifficultyConfig,
  isSpellAnswerCorrect,
  pickSpellRounds,
  SPELL_STRIKE_ROUNDS,
  type SpellDifficulty,
  type SpellEntry,
  type SpellRoundResult,
} from "@/lib/games/spellStrike";
import { DEFAULT_GAME_LEVEL, getGameLevelLabel, type GameLevel } from "@/lib/games/levels";
import {
  GameEnd,
  GameHud,
  GameStart,
  HudStat,
  SpeakButton,
  mapScoreResultToRewards,
  type RewardSummary,
} from "@/components/play/game-screens";
import { LevelPicker } from "@/components/play/level-picker";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";
import { submitSpellStrikeScore } from "./actions";

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";

export function SpellStrikeGame({
  isLoggedIn,
  missionTarget,
  suggestedLevel,
  audioMap = {},
}: {
  isLoggedIn: boolean;
  missionTarget: number | null;
  suggestedLevel: GameLevel | null;
  audioMap?: Record<string, string>;
}) {
  const [difficulty, setDifficulty] = useState<SpellDifficulty>(2);
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [silentMode, setSilentMode] = useState(false);

  const [rounds, setRounds] = useState<SpellEntry[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "ended">("start");
  const [typed, setTyped] = useState("");
  const [usedHint, setUsedHint] = useState(false);
  const [speakingKind, setSpeakingKind] = useState<"word" | "sentence" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<SpellRoundResult[]>([]);
  const [lastResult, setLastResult] = useState<SpellRoundResult | null>(null);

  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const gameSession = useGameSession("spell-strike", isLoggedIn);

  useGameFocusMode(phase === "playing" || phase === "feedback");

  useEffect(() => {
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      stopAllGameAudio();
    };
  }, []);

  const currentEntry = rounds[roundIndex] ?? null;
  const diffConfig = getSpellDifficultyConfig(difficulty);

  const playWord = useCallback(
    (entryItem: SpellEntry, slow = false) => {
      if (silentMode) return;
      setSpeakingKind("word");
      playClipOrSpeak({
        mp3Url: audioMap[entryItem.id],
        text: entryItem.word,
        rate: slow ? 0.74 : 0.94,
        voiceProfile: "female_uk",
        onEnded: () => setSpeakingKind(null),
      });
    },
    [audioMap, silentMode]
  );

  const playSentence = useCallback(
    (entryItem: SpellEntry) => {
      if (silentMode) return;
      setSpeakingKind("sentence");
      playClipOrSpeak({
        text: entryItem.sentenceSpoken,
        rate: 0.92,
        voiceProfile: "male_uk",
        onEnded: () => setSpeakingKind(null),
      });
    },
    [silentMode]
  );

  const finishMatch = useCallback(
    (finalScore: number, finalCorrect: number, finalTotal: number, finalDifficulty: SpellDifficulty) => {
      stopAllGameAudio();
      setPhase("ended");
      playSoundEffect(finalCorrect > 0 ? "victory" : "wrong");

      if (!isLoggedIn) {
        setSubmitStatus("guest");
        return;
      }
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitStatus("saving");
      const rawDurationMs = Math.max(1000, Math.round(performance.now() - startedAtRef.current));
      void (async () => {
        const { sessionId, durationMs } = await gameSession.finish(rawDurationMs);
        const res = await submitSpellStrikeScore({
          difficulty: finalDifficulty,
          score: finalScore,
          correctCount: finalCorrect,
          totalRounds: finalTotal,
          durationMs,
          sessionId,
        });
        if (!res.success) {
          setRewardError(res.error ?? "Impossible d'enregistrer le score.");
          setSubmitStatus("error");
          return;
        }
        setRewards(mapScoreResultToRewards(res));
        setSubmitStatus("saved");
      })();
    },
    [gameSession, isLoggedIn]
  );

  const startGame = useCallback(() => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    stopAllGameAudio();
    const deck = pickSpellRounds({ level, totalRounds: SPELL_STRIKE_ROUNDS });
    setRounds(deck);
    setRoundIndex(0);
    setTyped("");
    setUsedHint(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setResults([]);
    setLastResult(null);
    setRewards(null);
    setRewardError(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    setPhase("playing");
    startedAtRef.current = performance.now();
    roundStartedAtRef.current = performance.now();
    gameSession.begin();
    if (deck[0] && !silentMode) {
      playWord(deck[0]);
    }
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [gameSession, level, playWord, silentMode]);

  const advanceOrEnd = useCallback(
    (
      nextIndex: number,
      deck: SpellEntry[],
      nextScore: number,
      nextCorrect: number
    ) => {
      if (nextIndex >= deck.length) {
        finishMatch(nextScore, nextCorrect, deck.length, difficulty);
        return;
      }
      setRoundIndex(nextIndex);
      setTyped("");
      setUsedHint(false);
      setLastResult(null);
      setPhase("playing");
      roundStartedAtRef.current = performance.now();
      if (!silentMode) {
        setTimeout(() => playWord(deck[nextIndex]), 120);
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [difficulty, finishMatch, playWord, silentMode]
  );

  const submitCurrent = useCallback(
    (skipped = false) => {
      if (phase !== "playing" || !currentEntry) return;
      const value = skipped ? "" : typed.trim();
      if (!skipped && !value) {
        inputRef.current?.focus();
        return;
      }

      const reactionMs = Math.max(400, Math.round(performance.now() - roundStartedAtRef.current));
      const correct = !skipped && isSpellAnswerCorrect(currentEntry, value);
      const nextStreak = correct ? streak + 1 : 0;
      const points = computeSpellRoundPoints({
        difficulty,
        correct,
        usedHint,
        reactionMs,
        newStreak: nextStreak,
      });

      const nextScore = score + points;
      const nextCorrect = correctCount + (correct ? 1 : 0);
      const nextBestStreak = Math.max(bestStreak, nextStreak);
      const roundResult: SpellRoundResult = {
        entry: currentEntry,
        given: value,
        correct,
        usedHint,
        reactionMs,
        points,
        diff: buildSpellingDiff(currentEntry.word, value),
      };

      setScore(nextScore);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setCorrectCount(nextCorrect);
      setResults((prev) => [...prev, roundResult]);
      setLastResult(roundResult);
      setPhase("feedback");

      playSoundEffect(correct ? (nextStreak >= 3 ? "combo" : "correct") : "wrong");

      const delay = correct ? 1150 : 2100;
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
      nextTimerRef.current = setTimeout(() => {
        advanceOrEnd(roundIndex + 1, rounds, nextScore, nextCorrect);
      }, delay);
    },
    [
      advanceOrEnd,
      bestStreak,
      correctCount,
      currentEntry,
      difficulty,
      phase,
      roundIndex,
      rounds,
      score,
      streak,
      typed,
      usedHint,
    ]
  );

  const revealHint = () => {
    if (!currentEntry || !diffConfig.allowHint || usedHint || phase !== "playing") return;
    setUsedHint(true);
    setTyped((prev) => (prev.trim().length > 0 ? prev : currentEntry.word[0]));
    inputRef.current?.focus();
  };

  const quitToStart = () => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    stopAllGameAudio();
    gameSession.cancel();
    setPhase("start");
  };

  if (phase === "start") {
    return (
      <GameStart
        title="Spell Strike"
        intro="Maya te dicte 10 mots anglais utiles avec leurs pièges d'orthographe. Écoute, appuie sur le contexte et frappe le mot juste sans faute."
        rules={[
          "10 manches : écoute le mot seul ou dans une phrase, puis tape l'orthographe exacte.",
          "Plus tu réponds vite et sans indice, plus ton bonus et ta série grimpent.",
          "Après chaque erreur, les cases montrent exactement où la graphie a dévié.",
        ]}
        startLabel="Lancer Spell Strike"
        onStart={startGame}
      >
        <div className="space-y-4">
          <div className="eq-game-options" role="radiogroup" aria-label="Difficulté">
            {([1, 2, 3] as SpellDifficulty[]).map((item) => {
              const cfg = getSpellDifficultyConfig(item);
              return (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === item}
                  onClick={() => setDifficulty(item)}
                  className="eq-game-option"
                >
                  <b>{cfg.label}</b>
                  <span>{cfg.subtitle}</span>
                </button>
              );
            })}
          </div>
          <LevelPicker
            value={level}
            onChange={setLevel}
            suggested={suggestedLevel}
            label="Niveau de vocabulaire"
          />
          <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={silentMode}
              onChange={(e) => setSilentMode(e.target.checked)}
              className="h-4 w-4 accent-[var(--cyan)]"
            />
            <span>Mode sans son (affiche la phonétique pour jouer sans écouteurs)</span>
          </label>
        </div>
      </GameStart>
    );
  }

  if (phase === "ended") {
    const missionReached = missionTarget != null ? score >= missionTarget : null;
    const missedEntries = results.filter((r) => !r.correct);
    return (
      <GameEnd
        gameSlug="spell-strike"
        title="Session terminée"
        score={score.toLocaleString("fr-FR")}
        scoreLabel="points"
        lines={[
          `${correctCount} / ${rounds.length} mots bien orthographiés`,
          `Meilleure série : ${bestStreak} · Difficulté ${diffConfig.label}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        rewardError={rewardError}
        missionReached={missionReached}
        onReplay={() => {
          setPhase("start");
        }}
      >
        {results.length > 0 ? (
          <div className="space-y-2">
            <h4 className="eq-h3">
              {missedEntries.length > 0 ? "Mots à revoir" : "Tous les mots de la série"}
            </h4>
            <ul className="eq-game-review eq-game-review-scroll">
              {results.map((item) => (
                <li key={item.entry.id} className={item.correct ? "" : "is-hard"}>
                  <div>
                    <b>{item.entry.word}</b>{" "}
                    <span className="eq-muted">
                      ({item.entry.phonetic}) · {item.entry.french}
                    </span>
                    <div className="text-xs text-[var(--muted)] mt-0.5">{item.entry.hint}</div>
                  </div>
                  <SpeakButton text={item.entry.word} label="Audio" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </GameEnd>
    );
  }

  if (!currentEntry) return null;

  const lettersCount = currentEntry.word.length;
  const previewChars = typed.trim().toLowerCase().split("");

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quitToStart}>
        <HudStat label="Manche" value={`${roundIndex + 1} / ${rounds.length}`} />
        <HudStat label="Score" value={score} tone="gold" />
        <HudStat label="Série" value={streak} tone={streak >= 3 ? "mint" : undefined} />
        <HudStat label="Justes" value={correctCount} />
      </GameHud>

      <div
        className={`eq-game-stage eq-spell-stage ${
          phase === "feedback" && lastResult
            ? lastResult.correct
              ? "is-right"
              : "is-wrong"
            : ""
        }`}
      >
        <div className="eq-spell-audio-bar">
          <div className="eq-spell-audio-actions">
            {!silentMode ? (
              <>
                <button
                  type="button"
                  data-testid="spell-play-word"
                  onClick={() => playWord(currentEntry, false)}
                  className={`eq-btn eq-btn-primary eq-btn-sm ${speakingKind === "word" ? "ring-2 ring-amber-300" : ""}`}
                >
                  {speakingKind === "word" ? "Lecture…" : "Écouter le mot"}
                </button>
                <button
                  type="button"
                  onClick={() => playWord(currentEntry, true)}
                  className="eq-btn eq-btn-ghost eq-btn-sm"
                >
                  Lentement
                </button>
                <button
                  type="button"
                  onClick={() => playSentence(currentEntry)}
                  className={`eq-btn eq-btn-ghost eq-btn-sm ${speakingKind === "sentence" ? "ring-2 ring-cyan-300" : ""}`}
                >
                  Dans la phrase
                </button>
              </>
            ) : (
              <span className="eq-chip eq-chip-cyan">Phonétique : {currentEntry.phonetic}</span>
            )}
          </div>
          <span className="eq-chip eq-chip-gold">{lettersCount} lettres</span>
        </div>

        <div className="eq-spell-prompt">
          <p className="text-sm font-semibold text-[var(--gold)]">Sens : {currentEntry.french}</p>
          <p className="text-base sm:text-lg font-medium leading-relaxed" data-testid="game-prompt">
            {currentEntry.sentence}
          </p>
          {usedHint ? (
            <p className="eq-spell-hint" role="status">
              Indice : {currentEntry.hint}
            </p>
          ) : null}
        </div>

        <div className="eq-spell-slots" aria-hidden="true">
          {Array.from({ length: lettersCount }).map((_, idx) => {
            const diffCell = phase === "feedback" ? lastResult?.diff[idx] : undefined;
            const char = diffCell ? (diffCell.expected || diffCell.given) : previewChars[idx] ?? "";
            const cls = diffCell
              ? diffCell.status === "match"
                ? "is-match"
                : "is-miss"
              : previewChars[idx]
                ? "is-filled"
                : "";
            return (
              <span key={idx} className={`eq-spell-slot ${cls}`}>
                {char.toUpperCase()}
              </span>
            );
          })}
        </div>

        <form
          className="eq-spell-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitCurrent(false);
          }}
        >
          <div className="eq-game-field">
            <label htmlFor="spell-strike-input" className="sr-only">
              Orthographe du mot
            </label>
            <input
              ref={inputRef}
              id="spell-strike-input"
              data-testid="spell-input"
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={phase !== "playing"}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Tape le mot entendu…"
            />
          </div>
          <div className="eq-spell-controls">
            <button
              type="submit"
              data-testid="game-submit"
              disabled={phase !== "playing" || !typed.trim()}
              className="eq-btn eq-btn-gold"
            >
              Valider
            </button>
            {diffConfig.allowHint ? (
              <button
                type="button"
                disabled={phase !== "playing" || usedHint}
                onClick={revealHint}
                className="eq-btn eq-btn-ghost"
              >
                {usedHint ? "Indice affiché" : "Indice (-40 pts)"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={phase !== "playing"}
              onClick={() => submitCurrent(true)}
              className="eq-btn eq-btn-ghost"
            >
              Passer
            </button>
          </div>
        </form>

        {phase === "feedback" && lastResult ? (
          <div className={`eq-game-feedback ${lastResult.correct ? "is-right" : "is-wrong"}`} role="status">
            {lastResult.correct ? (
              <span>
                Bravo : <b>{lastResult.entry.word}</b> · +{lastResult.points} pts
              </span>
            ) : (
              <span>
                Orthographe exacte : <b>{lastResult.entry.word}</b> · {lastResult.entry.hint}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
