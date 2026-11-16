"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playClipOrSpeak, playSoundEffect, stopAllGameAudio } from "@/lib/games/audio";
import {
  buildSpellingDiff,
  computeSpellRoundPoints,
  getSpellDifficultyConfig,
  pickSpellRounds,
  shouldShowSpellMeaning,
  spellAnswerIssue,
  SPELL_STRIKE_ROUNDS,
  type SpellAnswerIssue,
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
import { useEnglishVoiceStatus } from "@/components/play/use-english-voice";
import { useGameFocusMode } from "@/components/play/use-game-focus-mode";
import { useGameSession } from "@/components/play/use-game-session";
import { useRefreshAfterScore } from "@/components/play/use-refresh-after-score";
import { submitSpellStrikeScore } from "./actions";

type SubmitStatus = "idle" | "saving" | "saved" | "error" | "guest";
type RoundResult = SpellRoundResult & { issue: SpellAnswerIssue };

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
  const voiceStatus = useEnglishVoiceStatus();
  const noVoice = voiceStatus === "unsupported" || voiceStatus === "no-english";

  const [difficulty, setDifficulty] = useState<SpellDifficulty>(2);
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [silentChoice, setSilentChoice] = useState(false);
  // Sans voix anglaise dans le navigateur, le jeu passe tout seul en mode écrit.
  const silentMode = silentChoice || noVoice;

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
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);

  const [rewards, setRewards] = useState<RewardSummary | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  useRefreshAfterScore(submitStatus);

  const startedAtRef = useRef(0);
  const roundStartedAtRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const submittedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const gameSession = useGameSession("spell-strike", isLoggedIn);

  useGameFocusMode(phase === "playing" || phase === "feedback");

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      stopAllGameAudio();
    };
  }, [clearTimers]);

  const currentEntry = rounds[roundIndex] ?? null;
  const diffConfig = getSpellDifficultyConfig(difficulty);

  const playWord = useCallback(
    (entryItem: SpellEntry, slow = false) => {
      if (silentMode) return;
      setSpeakingKind("word");
      playClipOrSpeak({
        mp3Url: audioMap[entryItem.id],
        text: entryItem.word,
        rate: slow ? 0.72 : 0.92,
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
        rate: 0.9,
        voiceProfile: "female_uk",
        onEnded: () => setSpeakingKind(null),
      });
    },
    [silentMode]
  );

  const finishMatch = useCallback(
    (finalScore: number, finalCorrect: number, finalTotal: number, finalDifficulty: SpellDifficulty) => {
      clearTimers();
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
    [clearTimers, gameSession, isLoggedIn]
  );

  const startGame = useCallback(() => {
    clearTimers();
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
    if (deck[0] && !silentMode) playWord(deck[0]);
    later(() => inputRef.current?.focus(), 60);
  }, [clearTimers, gameSession, later, level, playWord, silentMode]);

  const goToNext = useCallback(() => {
    clearTimers();
    const nextIndex = roundIndex + 1;
    if (nextIndex >= rounds.length) {
      finishMatch(score, correctCount, rounds.length, difficulty);
      return;
    }
    setRoundIndex(nextIndex);
    setTyped("");
    setUsedHint(false);
    setLastResult(null);
    setPhase("playing");
    roundStartedAtRef.current = performance.now();
    if (!silentMode) later(() => playWord(rounds[nextIndex]), 150);
    later(() => inputRef.current?.focus(), 50);
  }, [clearTimers, correctCount, difficulty, finishMatch, later, playWord, roundIndex, rounds, score, silentMode]);

  const submitCurrent = useCallback(
    (skipped = false) => {
      if (phase !== "playing" || !currentEntry) return;
      const value = skipped ? "" : typed.trim();
      if (!skipped && !value) {
        inputRef.current?.focus();
        return;
      }

      const reactionMs = Math.max(400, Math.round(performance.now() - roundStartedAtRef.current));
      const issue: SpellAnswerIssue = skipped ? "wrong" : spellAnswerIssue(currentEntry, value);
      const correct = issue === "ok";
      const nextStreak = correct ? streak + 1 : 0;
      const points = computeSpellRoundPoints({ difficulty, correct, usedHint, reactionMs, newStreak: nextStreak });

      const roundResult: RoundResult = {
        entry: currentEntry,
        given: value,
        correct,
        usedHint,
        reactionMs,
        points,
        diff: correct ? [] : buildSpellingDiff(currentEntry.word, value),
        issue,
      };

      setScore((prev) => prev + points);
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setCorrectCount((prev) => prev + (correct ? 1 : 0));
      setResults((prev) => [...prev, roundResult]);
      setLastResult(roundResult);
      setPhase("feedback");
      playSoundEffect(correct ? (nextStreak >= 3 ? "combo" : "correct") : "wrong");

      // Réponse juste : on enchaîne. Erreur : l'élève lit la correction et continue quand il veut.
      if (!correct) later(() => continueRef.current?.focus(), 60);
    },
    [currentEntry, difficulty, later, phase, streak, typed, usedHint]
  );

  // Après une bonne réponse, la manche suivante démarre seule.
  useEffect(() => {
    if (phase !== "feedback" || !lastResult?.correct) return;
    const id = setTimeout(goToNext, 1100);
    return () => clearTimeout(id);
  }, [goToNext, lastResult, phase]);

  const revealHint = () => {
    if (!currentEntry || !diffConfig.allowHint || usedHint || phase !== "playing") return;
    setUsedHint(true);
    setTyped((prev) => (prev.trim().length > 0 ? prev : currentEntry.word[0]));
    inputRef.current?.focus();
  };

  const quitToStart = () => {
    clearTimers();
    stopAllGameAudio();
    gameSession.cancel();
    setPhase("start");
  };

  const voiceNotice = noVoice ? (
    <p className="eq-game-notice" role="status">
      Ton navigateur n&apos;a pas de voix anglaise : le jeu passe en mode écrit (sens, phrase et phonétique). Pour
      la dictée, essaie Edge ou Chrome.
    </p>
  ) : null;

  if (phase === "start") {
    return (
      <GameStart
        title="Spell Strike"
        intro="Maya te dicte 10 mots anglais qui piègent souvent les francophones. Écoute le mot, appuie-toi sur la phrase, puis écris-le sans faute."
        rules={[
          "Écoute le mot seul ou dans sa phrase, autant de fois que tu veux, puis tape l'orthographe exacte.",
          "Les jours et les mois prennent une majuscule : Monday, February.",
          "Après une erreur, tu vois ce que tu as écrit, la bonne orthographe et la règle à retenir.",
        ]}
        startLabel="Lancer Spell Strike"
        onStart={startGame}
      >
        <div className="space-y-4">
          {voiceNotice}
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
          <LevelPicker value={level} onChange={setLevel} suggested={suggestedLevel} label="Niveau de vocabulaire" />
          {!noVoice ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                checked={silentChoice}
                onChange={(e) => setSilentChoice(e.target.checked)}
                className="h-4 w-4 accent-[var(--cyan)]"
              />
              <span>Mode écrit, sans écouteurs (le sens et la phonétique remplacent la dictée)</span>
            </label>
          ) : null}
        </div>
      </GameStart>
    );
  }

  if (phase === "ended") {
    const missionReached = missionTarget != null ? score >= missionTarget : null;
    const missed = results.filter((r) => !r.correct);
    const solved = results.filter((r) => r.correct);
    return (
      <GameEnd
        gameSlug="spell-strike"
        title="Session terminée"
        score={score.toLocaleString("fr-FR")}
        scoreLabel="points"
        ratio={rounds.length > 0 ? correctCount / rounds.length : 0}
        lines={[
          `${correctCount} / ${rounds.length} mots bien orthographiés`,
          `Meilleure série : ${bestStreak} · Difficulté : ${diffConfig.label.toLowerCase()}`,
          `Niveau ${getGameLevelLabel(level)}`,
        ]}
        rewards={rewards}
        rewardStatus={submitStatus}
        rewardError={rewardError}
        missionReached={missionReached}
        onReplay={() => setPhase("start")}
      >
        {missed.length > 0 ? (
          <div className="space-y-2">
            <h4 className="eq-h3">À revoir ({missed.length})</h4>
            <ul className="eq-spell-review">
              {missed.map((item) => (
                <li key={item.entry.id} className="is-missed">
                  <div className="min-w-0">
                    <p>
                      <b lang="en">{item.entry.word}</b>{" "}
                      <span className="eq-muted">
                        {item.entry.phonetic} · {item.entry.french}
                      </span>
                    </p>
                    <p className="eq-spell-review-given">
                      {item.given ? (
                        <>
                          Tu as écrit : <s lang="en">{item.given}</s>
                          {item.issue === "capital" ? " (majuscule oubliée)" : ""}
                        </>
                      ) : (
                        "Passé"
                      )}
                    </p>
                    <p className="eq-spell-review-rule">{item.entry.hint}</p>
                  </div>
                  <SpeakButton text={item.entry.word} label="Écouter" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {solved.length > 0 ? (
          <p className="eq-spell-solved">
            <b>Réussis :</b>{" "}
            <span lang="en">{solved.map((item) => item.entry.word).join(", ")}</span>
          </p>
        ) : null}
      </GameEnd>
    );
  }

  if (!currentEntry) return null;

  const showMeaning = diffConfig.showMeaning && shouldShowSpellMeaning(currentEntry);
  const lettersCount = currentEntry.word.length;
  const typedChars = typed.trim().split("");
  const slotCount = diffConfig.showLetterCount ? lettersCount : Math.max(typedChars.length, 1);
  const inFeedback = phase === "feedback" && lastResult !== null;

  return (
    <div className="eq-game-play">
      <GameHud onQuit={quitToStart}>
        <HudStat label="Manche" value={`${roundIndex + 1} / ${rounds.length}`} />
        <HudStat label="Score" value={score} tone="gold" />
        <HudStat label="Série" value={streak} tone={streak >= 3 ? "mint" : undefined} />
        <HudStat label="Justes" value={correctCount} />
      </GameHud>

      <div className={`eq-game-stage eq-spell-stage ${inFeedback ? (lastResult.correct ? "is-right" : "is-wrong") : ""}`}>
        {voiceNotice}
        <div className="eq-spell-audio-bar">
          <div className="eq-spell-audio-actions">
            {!silentMode ? (
              <>
                <button
                  type="button"
                  data-testid="spell-play-word"
                  onClick={() => playWord(currentEntry, false)}
                  className="eq-btn eq-btn-primary eq-btn-sm"
                  aria-pressed={speakingKind === "word"}
                >
                  {speakingKind === "word" ? "Lecture…" : "Écouter le mot"}
                </button>
                <button type="button" onClick={() => playWord(currentEntry, true)} className="eq-btn eq-btn-ghost eq-btn-sm">
                  Lentement
                </button>
                <button
                  type="button"
                  onClick={() => playSentence(currentEntry)}
                  className="eq-btn eq-btn-ghost eq-btn-sm"
                  aria-pressed={speakingKind === "sentence"}
                >
                  Dans la phrase
                </button>
              </>
            ) : (
              <span className="eq-chip eq-chip-cyan">Phonétique : {currentEntry.phonetic}</span>
            )}
          </div>
          {diffConfig.showLetterCount ? <span className="eq-chip eq-chip-gold">{lettersCount} lettres</span> : null}
        </div>

        <div className="eq-spell-prompt">
          {showMeaning || silentMode ? (
            <p className="text-sm font-semibold text-[var(--gold)]">Sens : {currentEntry.french}</p>
          ) : null}
          <p className="text-base font-medium leading-relaxed sm:text-lg" data-testid="game-prompt" lang="en">
            {currentEntry.sentence}
          </p>
          {usedHint ? (
            <p className="eq-spell-hint" role="status">
              Indice : {currentEntry.hint}
            </p>
          ) : null}
        </div>

        {!inFeedback ? (
          <div className="eq-spell-slots" aria-hidden="true">
            {Array.from({ length: slotCount }).map((_, idx) => (
              <span key={idx} className={`eq-spell-slot ${typedChars[idx] ? "is-filled" : ""}`}>
                {(typedChars[idx] ?? "").toUpperCase()}
              </span>
            ))}
          </div>
        ) : null}

        <form
          className="eq-spell-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (phase === "feedback") goToNext();
            else submitCurrent(false);
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
              lang="en"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              readOnly={phase !== "playing"}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={silentMode ? "Écris le mot anglais…" : "Tape le mot entendu…"}
            />
          </div>
          {phase === "playing" ? (
            <div className="eq-spell-controls">
              <button type="submit" data-testid="game-submit" disabled={!typed.trim()} className="eq-btn eq-btn-gold">
                Valider
              </button>
              {diffConfig.allowHint ? (
                <button type="button" disabled={usedHint} onClick={revealHint} className="eq-btn eq-btn-ghost">
                  {usedHint ? "Indice affiché" : "Indice (-40 pts)"}
                </button>
              ) : null}
              <button type="button" onClick={() => submitCurrent(true)} className="eq-btn eq-btn-ghost">
                Passer
              </button>
            </div>
          ) : null}
        </form>

        {inFeedback ? (
          <div className={`eq-spell-feedback ${lastResult.correct ? "is-right" : "is-wrong"}`} role="status">
            {lastResult.correct ? (
              <p>
                Bravo : <b lang="en">{lastResult.entry.word}</b> · +{lastResult.points} pts
              </p>
            ) : (
              <>
                <p className="eq-spell-feedback-title">
                  {lastResult.issue === "capital"
                    ? "Presque : il manque la majuscule."
                    : lastResult.given
                      ? "Pas tout à fait."
                      : "Mot passé."}
                </p>
                {lastResult.given ? (
                  <div className="eq-spell-diff" aria-label={`Tu as écrit ${lastResult.given}`}>
                    {lastResult.diff.map((cell, idx) => (
                      <span key={idx} className={`eq-spell-diff-cell is-${cell.status}`}>
                        {(cell.status === "extra" ? cell.given : cell.expected).toUpperCase()}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p>
                  {lastResult.given ? (
                    <>
                      Tu as écrit <s lang="en">{lastResult.given}</s>, il fallait{" "}
                    </>
                  ) : (
                    "Il fallait "
                  )}
                  <b lang="en">{lastResult.entry.word}</b> ({lastResult.entry.phonetic}).
                </p>
                <p className="eq-spell-feedback-rule">À retenir : {lastResult.entry.hint}</p>
                <div className="eq-spell-controls">
                  <button
                    ref={continueRef}
                    type="button"
                    onClick={goToNext}
                    className="eq-btn eq-btn-primary"
                    data-testid="spell-continue"
                  >
                    {roundIndex + 1 < rounds.length ? "Mot suivant" : "Voir le bilan"}
                  </button>
                  {!silentMode ? (
                    <button type="button" onClick={() => playWord(lastResult.entry, true)} className="eq-btn eq-btn-ghost">
                      Réécouter
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
