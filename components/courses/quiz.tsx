"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Burst } from "@/components/comic/burst";
import { Mascot } from "@/components/comic/mascot";
import { useCourseMission } from "@/components/courses/course-mission-provider";
import { isCourseQuizScorePassing } from "@/lib/courses/quiz-score";
import {
  QUIZ_SIZE,
  displayToken,
  drawQuizSeries,
  expectedAnswerText,
  isExerciseAnswerCorrect,
  orderPunctuation,
  orderTokens,
  writtenExerciseAnswer,
  type ExerciseAnswer,
  type ExerciseItem,
} from "@/lib/courses/exercise-check";

export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

interface QuizProps {
  title?: string;
  questions: Question[];
}

const letters = ["A", "B", "C", "D", "E", "F"];

/**
 * Une série : chaque exercice avec l'ordre d'affichage de ses propositions
 * (QCM) ou de ses étiquettes (phrase à remettre dans l'ordre).
 */
type DeckEntry = { item: ExerciseItem; order: number[] };

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toItems(questions: Question[]): ExerciseItem[] {
  return questions.map((question) => ({
    id: String(question.id),
    type: "mcq" as const,
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  }));
}

function entryFor(item: ExerciseItem, shuffle: boolean): DeckEntry {
  const size = item.type === "mcq" ? item.options.length : item.type === "order" ? orderTokens(item).length : 0;
  const order = Array.from({ length: size }, (_, index) => index);
  if (!shuffle) return { item, order };
  if (item.type !== "order") return { item, order: shuffled(order) };
  // Jamais l'ordre de la bonne réponse : ce serait la donner.
  let next = shuffled(order);
  for (let attempt = 0; attempt < 5 && size > 1 && next.every((value, index) => value === index); attempt += 1) {
    next = shuffled(order);
  }
  return { item, order: next };
}

/** Au rendu serveur : les questions du cours dans l'ordre, sans hasard (pas d'écart d'hydratation). */
function initialDeck(questions: Question[]): DeckEntry[] {
  return toItems(questions)
    .slice(0, QUIZ_SIZE)
    .map((item) => entryFor(item, false));
}

function randomDeck(pool: ExerciseItem[]): DeckEntry[] {
  return drawQuizSeries(pool).map((item) => entryFor(item, true));
}

export function Quiz({ questions }: QuizProps) {
  const mission = useCourseMission();
  const [deck, setDeck] = useState<DeckEntry[]>(() => initialDeck(questions));
  const shuffledRef = useRef(false);
  const answersRef = useRef<ExerciseAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [built, setBuilt] = useState<number[]>([]);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed" | "blocked">("idle");
  const [saveRetry, setSaveRetry] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasSubmittedResultRef = useRef(false);
  const roundRef = useRef({ index: 0, answered: false, finished: false });
  const attemptRef = useRef(0);

  const pool = (): ExerciseItem[] => [...toItems(questions), ...(mission?.extraExercises ?? [])];

  useEffect(() => () => {
    attemptRef.current += 1;
  }, []);

  useEffect(() => {
    if (shuffledRef.current) return;
    shuffledRef.current = true;
    setDeck(randomDeck([...toItems(questions), ...(mission?.extraExercises ?? [])]));
  }, [questions, mission?.extraExercises]);

  useEffect(() => {
    if (
      !mission?.isAuthenticated ||
      mission.missionState?.readingCheckpointReached ||
      !containerRef.current
    ) {
      return;
    }

    const node = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.4
        );
        if (!isVisible) {
          return;
        }
        observer.disconnect();
        void mission.markReadingCheckpoint();
      },
      { threshold: [0.4] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mission, mission?.isAuthenticated, mission?.missionState?.readingCheckpointReached]);

  useEffect(() => {
    if (!showResult || hasSubmittedResultRef.current) {
      return;
    }

    hasSubmittedResultRef.current = true;

    if (!mission) return;
    const attempt = attemptRef.current;
    if (!mission.isAuthenticated) {
      if (!isCourseQuizScorePassing(score, deck.length)) return;
      setSaveState("saving");
      void mission.keepGuestQuiz([...answersRef.current]).then((result) => {
        if (attempt === attemptRef.current) setSaveState(result);
      }).catch(() => {
        if (attempt === attemptRef.current) setSaveState("failed");
      });
      return;
    }

    if (!mission.isMissionTrackingEnabled) {
      setSyncMessage("Ce cours n'est pas ta mission en cours : le score n'est pas enregistré.");
      return;
    }

    setSaveState("saving");
    void (async () => {
      try {
        const outcome = await mission.submitQuizResult([...answersRef.current]);
        if (attempt !== attemptRef.current) return;
        if (!outcome) {
          setSaveState("failed");
          setSyncMessage("Le score n'a pas pu être enregistré. Réessaie dans un instant.");
          return;
        }
        const updatedState = outcome.missionState;
        setSaveState("saved");
        if (outcome.courseCompleted) {
          const { xp, gold, newLevel } = outcome.courseCompleted;
          setSyncMessage(
            `Mission validée. +${xp} XP et +${gold} or${newLevel ? `, niveau ${newLevel} atteint` : ""}. ${mission.courseNumber === 50 ? "Tu as atteint la dernière mission." : "Le cours suivant est ouvert sur la carte."}`
          );
          return;
        }
        if (updatedState.quizPassed) {
          setSyncMessage("Quiz validé : la mission est réussie. Entraîne-toi sur la notion pour gagner les étoiles suivantes.");
          return;
        }
        setSyncMessage("Score enregistré. Il faut 80 % pour valider : tu peux refaire le quiz, les exercices changent.");
      } catch {
        if (attempt === attemptRef.current) {
          setSaveState("failed");
          setSyncMessage("Le score n'a pas pu être enregistré. Réessaie dans un instant.");
        }
      }
    })();
  }, [deck.length, mission, saveRetry, score, showResult]);

  /** Enregistre une réponse une seule fois par exercice, même sur des clics très rapides. */
  const settle = (entry: DeckEntry, answer: ExerciseAnswer) => {
    const current = roundRef.current;
    if (current.finished || current.answered || current.index !== currentQuestion) return false;
    current.answered = true;
    const correct = isExerciseAnswerCorrect(entry.item, answer);
    answersRef.current = [...answersRef.current.filter((given) => given.id !== entry.item.id), answer];
    setLastCorrect(correct);
    setIsAnswered(true);
    setAnimationKey((key) => key + 1);
    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setScore((prev) => prev + 1);
    } else {
      setCombo(0);
    }
    return true;
  };

  const handleOptionClick = (index: number) => {
    const entry = deck[currentQuestion];
    if (!entry || entry.item.type !== "mcq") return;
    if (!Number.isInteger(index) || index < 0 || index >= entry.item.options.length) return;
    const choice = entry.order[index] ?? index;
    if (settle(entry, { id: entry.item.id, choice })) setSelectedOption(index);
  };

  const submitTyped = () => {
    const entry = deck[currentQuestion];
    if (!entry || entry.item.type !== "gap" || !typed.trim()) return;
    settle(entry, writtenExerciseAnswer(entry.item, typed));
  };

  const submitBuilt = () => {
    const entry = deck[currentQuestion];
    if (!entry || entry.item.type !== "order") return;
    const tokens = orderTokens(entry.item);
    if (built.length !== tokens.length) return;
    const sentence = `${built.map((index) => tokens[index]).join(" ")}${orderPunctuation(entry.item)}`;
    settle(entry, { id: entry.item.id, text: sentence });
  };

  const resetAnswerInputs = () => {
    setSelectedOption(null);
    setTyped("");
    setBuilt([]);
    setIsAnswered(false);
    setLastCorrect(false);
  };

  const nextQuestion = () => {
    const current = roundRef.current;
    if (current.finished || !current.answered || current.index !== currentQuestion) return;
    if (currentQuestion < deck.length - 1) {
      roundRef.current = { index: currentQuestion + 1, answered: false, finished: false };
      setCurrentQuestion(currentQuestion + 1);
      resetAnswerInputs();
    } else {
      current.finished = true;
      setShowResult(true);
    }
  };

  const restart = () => {
    attemptRef.current += 1;
    answersRef.current = [];
    setDeck(randomDeck(pool()));
    roundRef.current = { index: 0, answered: false, finished: false };
    setCurrentQuestion(0);
    resetAnswerInputs();
    setScore(0);
    setShowResult(false);
    setCombo(0);
    setMaxCombo(0);
    setSyncMessage(null);
    setSaveState("idle");
    hasSubmittedResultRef.current = false;
  };

  const entry = deck[currentQuestion];
  const total = deck.length;
  if (!entry || total === 0) {
    return <div className="eq-quiz">Ce quiz n&apos;est pas disponible pour le moment.</div>;
  }
  const item = entry.item;
  const progress = Math.round(((currentQuestion + (isAnswered ? 1 : 0)) / total) * 100);

  if (showResult) {
    const accuracy = Math.round((score / total) * 100);
    const passed = isCourseQuizScorePassing(score, total);

    return (
      <div id="quiz" ref={containerRef} className="eq-quiz eq-quiz-result eq-slam" data-testid="quiz-result">
        <div className="eq-quiz-result-head">
          <Mascot pose={passed ? "duo-victoire" : "sam-oups"} size={110} />
          <Burst color={passed ? "yellow" : "white"} size={170} rotate={-8} className="eq-pop-in">
            {passed ? "Mission réussie !" : "Presque !"}
          </Burst>
          <div>
            <p className="eq-quiz-kicker">{passed ? "Quiz réussi" : "Pas encore"}</p>
            <p className="eq-quiz-score">
              {score} <span>/ {total}</span>
            </p>
          </div>
        </div>
        <p className="eq-quiz-text">
          {passed
            ? `${accuracy} %. Tu tiens la notion.`
            : `${accuracy} %. Il faut 80 % pour valider. Relis la section qui coince, puis recommence : les exercices changent à chaque essai.`}
          {maxCombo >= 5 ? ` Meilleure série : ${maxCombo} bonnes réponses d'affilée.` : ""}
        </p>
        {syncMessage ? <p className="eq-quiz-sync" role="status">{syncMessage}</p> : null}
        {passed && mission && !mission.isAuthenticated ? (
          <p className="eq-quiz-sync" role="status">
            {saveState === "saved" ? "Ta réussite est gardée sur cet appareil. Avec un compte, tu pourras aussi la retrouver ailleurs."
              : saveState === "blocked" ? "Le navigateur bloque la sauvegarde sur cet appareil. Tu peux continuer ou te connecter pour garder tes prochaines réussites."
              : saveState === "failed" ? "La sauvegarde a échoué. Tu peux la réessayer avec les mêmes réponses."
              : "Enregistrement de ta réussite…"}
          </p>
        ) : null}
        {passed && mission && saveState === "saved" ? (
          <p className="eq-quiz-sync">
            <Link href={mission.isAuthenticated ? "/profile#boutique" : "/collection"} className="eq-text-link">
              {mission.isAuthenticated ? "Voir ma collection" : "Découvrir les récompenses"}
            </Link>
          </p>
        ) : null}
        <div className="eq-quiz-actions">
          {saveState === "failed" ? (
            <button type="button" className="eq-btn eq-btn-primary" onClick={() => {
              hasSubmittedResultRef.current = false;
              setSaveRetry((value) => value + 1);
            }}>Réessayer la sauvegarde</button>
          ) : null}
          {passed && mission && !mission.isAuthenticated && saveState !== "saving" && saveState !== "idle" ? (
            <>
              {mission.courseNumber < 50 ? (
                <Link href={`/cours/${mission.courseNumber + 1}`} className="eq-btn eq-btn-gold">
                  Continuer vers la mission {mission.courseNumber + 1}
                </Link>
              ) : null}
              <Link href="/auth/signup?next=/quest" className="eq-btn eq-btn-ghost">
                {saveState === "saved" ? "Garder ma progression avec un compte" : "Créer un compte"}
              </Link>
            </>
          ) : null}
          <button type="button" onClick={restart} className="eq-btn eq-btn-ghost">
            Refaire le quiz
          </button>
          {passed && (!mission || mission.isAuthenticated || (saveState !== "idle" && saveState !== "saving")) ? (
            <Link href="/quest" className={mission && !mission.isAuthenticated && mission.courseNumber < 50 ? "eq-btn eq-btn-ghost" : "eq-btn eq-btn-gold"}>
              Retour à la carte
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const kindLabel = item.type === "gap" ? "Complète la phrase" : item.type === "order" ? "Remets les mots dans l'ordre" : null;

  return (
    <div id="quiz" ref={containerRef} className="eq-quiz" data-testid="quiz">
      <div className="eq-quiz-head">
        <span>
          Question {currentQuestion + 1} sur {total}
        </span>
        <span className="eq-quiz-bar" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </span>
        <span>
          {score} bonne{score > 1 ? "s" : ""}
        </span>
      </div>

      {kindLabel ? <p className="eq-quiz-kind">{kindLabel}</p> : null}

      {item.type === "mcq" ? (
        <>
          <h3 className="eq-quiz-question">{item.question}</h3>
          <div className="eq-quiz-options" role="group" aria-label="Réponses">
            {entry.order.map((original, index) => {
              const option = item.options[original];
              let state: "idle" | "right" | "wrong" = "idle";
              if (isAnswered) {
                if (original === item.correctAnswer) state = "right";
                else if (index === selectedOption) state = "wrong";
              }
              const shake = isAnswered && index === selectedOption && !lastCorrect;
              return (
                <button
                  key={`${item.id}-${index}-${shake ? animationKey : 0}`}
                  type="button"
                  onClick={() => handleOptionClick(index)}
                  disabled={isAnswered}
                  className={`eq-quiz-option ${shake ? "eq-shake" : ""} ${state === "right" && index === selectedOption ? "eq-pop" : ""}`}
                  data-state={state}
                  aria-pressed={selectedOption === index}
                >
                  <span className="eq-quiz-letter">{letters[index] ?? index + 1}</span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {item.type === "gap" ? (
        <form
          className="eq-quiz-gap"
          onSubmit={(event) => {
            event.preventDefault();
            submitTyped();
          }}
        >
          <h3 className="eq-quiz-question" lang="en">
            {item.prompt.split("___").map((part, index, parts) => (
              <span key={index}>
                {part}
                {index < parts.length - 1 ? <span className="eq-quiz-blank" aria-label="trou">___</span> : null}
              </span>
            ))}
          </h3>
          <div className="eq-quiz-gap-row">
            <label className="sr-only" htmlFor={`quiz-gap-${item.id}`}>
              Ta réponse
            </label>
            <input
              id={`quiz-gap-${item.id}`}
              className="eq-quiz-input"
              data-state={isAnswered ? (lastCorrect ? "right" : "wrong") : "idle"}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={isAnswered}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              lang="en"
              placeholder="Mot ou groupe de mots manquant"
            />
            {!isAnswered ? (
              <button type="submit" className="eq-btn eq-btn-gold" disabled={!typed.trim()}>
                Valider
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {item.type === "order" ? (
        <div className="eq-quiz-order">
          {item.translation ? <h3 className="eq-quiz-question">« {item.translation} »</h3> : null}
          <p
            className="eq-quiz-built"
            data-state={isAnswered ? (lastCorrect ? "right" : "wrong") : "idle"}
            aria-live="polite"
            lang="en"
          >
            {built.length === 0 ? (
              <span className="eq-quiz-built-hint">Touche les mots dans le bon ordre.</span>
            ) : (
              built.map((tokenIndex, position) => (
                <button
                  key={`built-${tokenIndex}`}
                  type="button"
                  className="eq-quiz-token is-placed"
                  disabled={isAnswered}
                  onClick={() => setBuilt(built.filter((_, index) => index !== position))}
                  aria-label={`Retirer ${orderTokens(item)[tokenIndex]}`}
                >
                  {displayToken(orderTokens(item)[tokenIndex], tokenIndex)}
                </button>
              ))
            )}
            {built.length > 0 ? <span className="eq-quiz-punct">{orderPunctuation(item)}</span> : null}
          </p>
          <div className="eq-quiz-tokens" role="group" aria-label="Mots à placer" lang="en">
            {entry.order.map((tokenIndex) =>
              built.includes(tokenIndex) ? null : (
                <button
                  key={`token-${tokenIndex}`}
                  type="button"
                  className="eq-quiz-token"
                  disabled={isAnswered}
                  onClick={() => setBuilt([...built, tokenIndex])}
                >
                  {displayToken(orderTokens(item)[tokenIndex], tokenIndex)}
                </button>
              )
            )}
          </div>
          {!isAnswered ? (
            <div className="eq-quiz-actions">
              <button
                type="button"
                className="eq-btn eq-btn-gold"
                onClick={submitBuilt}
                disabled={built.length !== orderTokens(item).length}
              >
                Valider
              </button>
              {built.length > 0 ? (
                <button type="button" className="eq-btn eq-btn-ghost" onClick={() => setBuilt([])}>
                  Effacer
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="eq-quiz-feedback" aria-live="polite">
        {isAnswered ? (
          <>
            <div className={`eq-quiz-verdict ${lastCorrect ? "is-right" : "is-wrong"}`}>
              <Burst
                key={`${currentQuestion}-${lastCorrect ? "ok" : "ko"}`}
                color={lastCorrect ? "yellow" : "red"}
                size={96}
                rotate={lastCorrect ? -8 : 6}
                className="eq-pop-in"
              >
                {lastCorrect ? "Juste !" : "Oups !"}
              </Burst>
              <span>
                {lastCorrect ? (combo >= 3 ? `Bonne réponse, ${combo} d'affilée.` : "Bonne réponse.") : "Pas celle-là."}
              </span>
            </div>
            {!lastCorrect && item.type !== "mcq" ? (
              <p className="eq-quiz-expected">
                Réponse attendue : <b lang="en">{expectedAnswerText(item)}</b>
              </p>
            ) : null}
            {item.explanation ? <p className="eq-quiz-explanation">{item.explanation}</p> : null}
          </>
        ) : item.type === "mcq" ? (
          <p className="eq-quiz-hint">Choisis une réponse.</p>
        ) : null}
      </div>

      {isAnswered ? (
        <div className="eq-quiz-actions">
          <button type="button" onClick={nextQuestion} className="eq-btn eq-btn-gold">
            {currentQuestion < total - 1 ? "Question suivante" : "Voir le résultat"}
          </button>
          {mission && (
            <a className="eq-text-link text-sm" target="_blank" rel="noopener noreferrer"
              href={`/contact?cours=${mission.courseNumber}&exercice=${encodeURIComponent(item.id)}`}>
              Signaler cette question<span className="sr-only"> (nouvel onglet)</span>
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
}
