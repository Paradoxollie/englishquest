"use client";
import { recordClassAnswer } from "@/components/classes/live-activity-events";
import { useClassActivity } from "@/components/classes/live-activity-context";

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
  const inClass = Boolean(useClassActivity());
  const voiceStatus = useEnglishVoiceStatus();
  const noVoice = voiceStatus === "unsupported" || voiceStatus === "no-english";

  const [difficulty, setDifficulty] = useState<SpellDifficulty>(2);
  const [level, setLevel] = useState<GameLevel>(suggestedLevel ?? DEFAULT_GAME_LEVEL);
  const [silentChoice, setSilentChoice] = useState(false);
  const [textEntry, setTextEntry] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState("");

  const [rounds, setRounds] = useState<SpellEntry[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<"start" | "playing" | "feedback" | "ended">("start");
  const [typed, setTyped] = useState("");
  const [canAnswer, setCanAnswer] = useState(false);
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
  const answerStartedAtRef = useRef<number | null>(null);
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
  const silentMode = silentChoice || (!!currentEntry && (
    textEntry === currentEntry.id || (noVoice && !audioMap[currentEntry.id] && !audioMap[`${currentEntry.id}-sentence`])
  ));

  // The first completed recording starts the clock, including a context sentence.
  const enableAnswer = useCallback(() => {
    if (answerStartedAtRef.current !== null) return;
    answerStartedAtRef.current = performance.now();
    setCanAnswer(true);
  }, []);

  const showWrittenWord = useCallback((entry: SpellEntry) => {
    setTextEntry(entry.id);
    enableAnswer();
  }, [enableAnswer]);

  const playWord = useCallback(
    (entryItem: SpellEntry, slow = false) => {
      setAudioNotice("");
      setSpeakingKind("word");
      playClipOrSpeak({
        mp3Url: audioMap[entryItem.id],
        text: entryItem.word,
        rate: slow ? 0.8 : 1,
        voiceProfile: "female_us",
        onEnded: () => {
          setSpeakingKind(null);
          setTextEntry(null);
          enableAnswer();
        },
        onError: (reason) => {
          setSpeakingKind(null);
          if (reason === "blocked") setAudioNotice("Appuie sur Écouter le mot pour lancer la dictée.");
          else {
            showWrittenWord(entryItem);
            setAudioNotice("La dictée est indisponible pour ce mot. Tu peux utiliser la phonétique ou réessayer l’écoute.");
          }
        },
      });
    },
    [audioMap, enableAnswer, showWrittenWord]
  );

  const playSentence = useCallback(
    (entryItem: SpellEntry) => {
      setAudioNotice("");
      setSpeakingKind("sentence");
      playClipOrSpeak({
        mp3Url: audioMap[`${entryItem.id}-sentence`],
        text: entryItem.sentenceSpoken,
        rate: 1,
        voiceProfile: "female_us",
        onEnded: () => {
          setSpeakingKind(null);
          enableAnswer();
        },
        onError: () => {
          setSpeakingKind(null);
          if (noVoice && !audioMap[entryItem.id]) {
            showWrittenWord(entryItem);
            setAudioNotice("La dictée est indisponible pour ce mot. Tu peux utiliser la phrase écrite et la phonétique.");
          } else {
            setAudioNotice("La phrase audio est indisponible. Tu peux la lire ci-dessous et réécouter le mot.");
          }
        },
      });
    },
    [audioMap, enableAnswer, noVoice, showWrittenWord]
  );

  const beginDictation = useCallback((entry: SpellEntry, waitForTap = false) => {
    answerStartedAtRef.current = null;
    setCanAnswer(false);
    if (silentChoice || (noVoice && !audioMap[entry.id] && !audioMap[`${entry.id}-sentence`])) {
      showWrittenWord(entry);
    } else if (waitForTap) {
      setAudioNotice("Appuie sur Écouter le mot pour commencer la dictée.");
    } else if (noVoice && !audioMap[entry.id]) {
      playSentence(entry);
    } else {
      playWord(entry);
    }
  }, [audioMap, noVoice, playSentence, playWord, showWrittenWord, silentChoice]);

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
        const { sessionId, durationMs, save } = await gameSession.finish(rawDurationMs);
        const res = await save(() => submitSpellStrikeScore({
          difficulty: finalDifficulty,
          score: finalScore,
          correctCount: finalCorrect,
          totalRounds: finalTotal,
          durationMs,
          sessionId,
        }));
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
    setAudioNotice("");
    setTextEntry(null);
    setSpeakingKind(null);
    setRewardError(null);
    setSubmitStatus("idle");
    submittedRef.current = false;
    setPhase("playing");
    startedAtRef.current = performance.now();
    gameSession.begin();
    if (deck[0]) beginDictation(deck[0], inClass);
    if (!inClass) later(() => inputRef.current?.focus(), 60);
  }, [beginDictation, clearTimers, gameSession, inClass, later, level]);

  const goToNext = useCallback(() => {
    clearTimers();
    const nextIndex = roundIndex + 1;
    if (nextIndex >= rounds.length) {
      finishMatch(score, correctCount, rounds.length, difficulty);
      return;
    }
    setRoundIndex(nextIndex);
    stopAllGameAudio();
    setAudioNotice("");
    setTextEntry(null);
    setSpeakingKind(null);
    setTyped("");
    setUsedHint(false);
    setLastResult(null);
    setPhase("playing");
    beginDictation(rounds[nextIndex]);
    later(() => inputRef.current?.focus(), 50);
  }, [beginDictation, clearTimers, correctCount, difficulty, finishMatch, later, roundIndex, rounds, score]);

  const submitCurrent = useCallback(
    (skipped = false) => {
      if (phase !== "playing" || !currentEntry) return;
      const value = skipped ? "" : typed.trim();
      if (!skipped && !value) {
        inputRef.current?.focus();
        return;
      }

      const answerStart = answerStartedAtRef.current;
      if (!skipped && answerStart === null) return;
      stopAllGameAudio();
      setSpeakingKind(null);
      const reactionMs = answerStart === null ? 0 : Math.max(400, Math.round(performance.now() - answerStart));
      const issue: SpellAnswerIssue = skipped ? "wrong" : spellAnswerIssue(currentEntry, value);
      const correct = issue === "ok";
      recordClassAnswer(correct);
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

      // Après une erreur, la correction reste à l’écran jusqu’au mot suivant.
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

  const hasAudio = Object.keys(audioMap).length > 0 || !noVoice;

  if (phase === "start") {
    return (
      <GameStart
        title="Spell Strike"
        intro="Maya te dicte 10 mots anglais qui piègent souvent les francophones. Écoute le mot, appuie-toi sur la phrase, puis écris-le sans faute."
        rules={[
          "Écoute le mot seul ou dans sa phrase, autant de fois que tu veux, puis tape l'orthographe exacte.",
          "Le bonus de rapidité démarre après la première écoute complète. En mode écrit, il démarre à l’affichage des indices.",
          "Après une erreur, tu vois ce que tu as écrit, la bonne orthographe et la règle à retenir.",
        ]}
        startLabel="Lancer Spell Strike"
        onStart={startGame}
      >
        <div className="space-y-4">
          {!hasAudio && <p className="eq-game-notice">La dictée est indisponible sur cet appareil. Tu peux jouer avec la phrase et la phonétique.</p>}
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
          {hasAudio ? (
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
        retryScore={gameSession.retryScore}
        rewardError={rewardError}
        missionReached={missionReached}
        onReplay={quitToStart}
      >
        {audioNotice && <p className="eq-game-notice" role="status">{audioNotice}</p>}
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
                    {item.entry.accept?.length ? (
                      <p>Autre orthographe acceptée · <span lang="en">{item.entry.accept.join(", ")}</span></p>
                    ) : null}
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
                  {(audioMap[item.entry.id] || !noVoice) && (
                    <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" onClick={() => playWord(item.entry)}
                      aria-label={`Réécouter ${item.entry.word}`}>Réécouter</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {solved.length > 0 ? (
          <p className="eq-spell-solved">
            <b>Réussis :</b>{" "}
            <span lang="en">{solved.map((item) => item.given).join(", ")}</span>
          </p>
        ) : null}
      </GameEnd>
    );
  }

  if (!currentEntry) return null;

  const showMeaning = diffConfig.showMeaning && shouldShowSpellMeaning(currentEntry);
  const lengths = [currentEntry.word, ...(currentEntry.accept ?? [])].map(word => word.length);
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  const typedChars = typed.trim().split("");
  const slotCount = diffConfig.showLetterCount ? Math.max(shortest, typedChars.length) : Math.max(typedChars.length, 1);
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
        {audioNotice && <p className="eq-game-notice" role="status">{audioNotice}</p>}
        {audioNotice && !canAnswer && !silentMode && (
          <button type="button" className="eq-btn eq-btn-ghost" onClick={() => {
            stopAllGameAudio();
            setSpeakingKind(null);
            setAudioNotice("");
            showWrittenWord(currentEntry);
          }}>Utiliser la phonétique pour ce mot</button>
        )}
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
              <>
                <span className="eq-chip eq-chip-cyan">Phonétique · {currentEntry.phonetic}</span>
                {!silentChoice && (audioMap[currentEntry.id] || !noVoice) && (
                  <button type="button" onClick={() => playWord(currentEntry)} className="eq-btn eq-btn-ghost eq-btn-sm">Réessayer l’écoute</button>
                )}
              </>
            )}
          </div>
          {diffConfig.showLetterCount ? <span className="eq-chip eq-chip-gold">
            {shortest === longest ? shortest : `${shortest} ou ${longest}`} lettres
          </span> : null}
        </div>

        <div className="eq-spell-prompt">
          {showMeaning || (silentMode && shouldShowSpellMeaning(currentEntry)) ? (
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
          {!canAnswer && !inFeedback && !silentMode && <p className="text-sm" role="status">Tu pourras écrire ta réponse à la fin de la première écoute.</p>}
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
              maxLength={Math.max(24, longest + 8)}
              readOnly={phase !== "playing" || !canAnswer}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={silentMode ? "Écris le mot anglais…" : "Tape le mot entendu…"}
            />
          </div>
          {phase === "playing" ? (
            <div className="eq-spell-controls">
              <button type="submit" data-testid="game-submit" disabled={!canAnswer || !typed.trim()} className="eq-btn eq-btn-gold">
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
                Bravo · <b lang="en">{lastResult.given}</b> · +{lastResult.points} pts
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
                  <b lang="en">{[lastResult.entry.word, ...(lastResult.entry.accept ?? [])].join(" / ")}</b> ({lastResult.entry.phonetic}).
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
