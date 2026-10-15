"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

    if (!mission?.isAuthenticated) {
      return;
    }

    if (!mission.isMissionTrackingEnabled) {
      setSyncMessage("Ce cours n'est pas ta mission en cours : le score n'est pas enregistré.");
      return;
    }

    const attempt = attemptRef.current;
    void (async () => {
      try {
        const outcome = await mission.submitQuizResult([...answersRef.current]);
        if (attempt !== attemptRef.current) return;
        if (!outcome) {
          setSyncMessage("Le score n'a pas pu être enregistré. Réessaie dans un instant.");
          return;
        }
        const updatedState = outcome.missionState;
        if (outcome.courseCompleted) {
          const { xp, gold, newLevel } = outcome.courseCompleted;
          setSyncMessage(
            `Mission validée : +${xp} XP et +${gold} or${newLevel ? `, niveau ${newLevel} atteint` : ""}. Le cours suivant est ouvert sur la carte.`
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
          setSyncMessage("Le score n'a pas pu être enregistré. Réessaie dans un instant.");
        }
      }
    })();
  }, [mission, showResult]);

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
    settle(entry, { id: entry.item.id, text: typed });
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
      <div ref={containerRef} className="eq-quiz eq-pop" data-testid="quiz-result">
        <p className="eq-quiz-kicker">{passed ? "Quiz réussi" : "Pas encore"}</p>
        <p className="eq-quiz-score">
          {score} <span>/ {total}</span>
        </p>
        <p className="eq-quiz-text">
          {passed
            ? `${accuracy} %. Tu tiens la notion.`
            : `${accuracy} %. Il faut 80 % pour valider. Relis la section qui coince, puis recommence : les exercices changent à chaque essai.`}
          {maxCombo >= 5 ? ` Meilleure série : ${maxCombo} bonnes réponses d'affilée.` : ""}
        </p>
        {syncMessage ? <p className="eq-quiz-sync">{syncMessage}</p> : null}
        <div className="eq-quiz-actions">
          <button type="button" onClick={restart} className="eq-btn eq-btn-ghost">
            Refaire le quiz
          </button>
          {passed ? (
            <Link href="/quest" className="eq-btn eq-btn-gold">
              Retour à la carte
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const kindLabel = item.type === "gap" ? "Complète la phrase" : item.type === "order" ? "Remets les mots dans l'ordre" : null;

  return (
    <div ref={containerRef} className="eq-quiz" data-testid="quiz">
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
              placeholder="Tape le mot qui manque"
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
            <p className={`eq-quiz-verdict ${lastCorrect ? "is-right" : "is-wrong"}`}>
              {lastCorrect ? "Juste." : "Pas celle-là."}
              {lastCorrect && combo >= 3 ? ` ${combo} d'affilée.` : ""}
            </p>
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
        </div>
      ) : null}
    </div>
  );
}
