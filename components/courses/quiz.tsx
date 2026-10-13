"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCourseMission } from "@/components/courses/course-mission-provider";
import { isCourseQuizScorePassing } from "@/lib/courses/quiz-score";

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

export function Quiz({ questions }: QuizProps) {
  const mission = useCourseMission();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
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

  useEffect(() => () => {
    attemptRef.current += 1;
  }, []);

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
        const outcome = await mission.submitQuizResult(score, questions.length);
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
        if (updatedState.readyToComplete) {
          setSyncMessage("Quiz validé. Le défi de jeu est déjà atteint : la mission se valide sur la carte.");
          return;
        }
        if (updatedState.quizPassed) {
          setSyncMessage("Quiz validé. Il reste le défi de jeu pour terminer la mission.");
          return;
        }
        setSyncMessage("Score enregistré. Il faut 80 % pour valider : tu peux refaire le quiz.");
      } catch {
        if (attempt === attemptRef.current) {
          setSyncMessage("Le score n'a pas pu être enregistré. Réessaie dans un instant.");
        }
      }
    })();
  }, [mission, questions.length, score, showResult]);

  const handleOptionClick = (index: number) => {
    const current = roundRef.current;
    const question = questions[currentQuestion];
    if (current.finished || current.answered || current.index !== currentQuestion || !question) return;
    if (!Number.isInteger(index) || index < 0 || index >= question.options.length) return;
    current.answered = true;
    setSelectedOption(index);
    setIsAnswered(true);
    setAnimationKey((key) => key + 1);

    if (index === questions[currentQuestion].correctAnswer) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      setScore((prev) => prev + 1);
    } else {
      setCombo(0);
    }
  };

  const nextQuestion = () => {
    const current = roundRef.current;
    if (current.finished || !current.answered || current.index !== currentQuestion) return;
    if (currentQuestion < questions.length - 1) {
      roundRef.current = { index: currentQuestion + 1, answered: false, finished: false };
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      current.finished = true;
      setShowResult(true);
    }
  };

  const restart = () => {
    attemptRef.current += 1;
    roundRef.current = { index: 0, answered: false, finished: false };
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
    setCombo(0);
    setMaxCombo(0);
    setSyncMessage(null);
    hasSubmittedResultRef.current = false;
  };

  const question = questions[currentQuestion];
  const total = questions.length;
  if (!question || total === 0) {
    return <div className="eq-quiz">Ce quiz n&apos;est pas disponible pour le moment.</div>;
  }
  const progress = Math.round(((currentQuestion + (isAnswered ? 1 : 0)) / total) * 100);
  const isCorrect = isAnswered && selectedOption === question.correctAnswer;

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
            : `${accuracy} %. Il faut 80 % pour valider. Relis la section qui coince, puis recommence.`}
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

      <h3 className="eq-quiz-question">{question.question}</h3>

      <div className="eq-quiz-options" role="group" aria-label="Réponses">
        {question.options.map((option, index) => {
          let state: "idle" | "right" | "wrong" | "missed" = "idle";
          if (isAnswered) {
            if (index === question.correctAnswer) state = "right";
            else if (index === selectedOption) state = "wrong";
          }
          const shake = isAnswered && index === selectedOption && !isCorrect;
          return (
            <button
              key={`${question.id}-${index}-${shake ? animationKey : 0}`}
              type="button"
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered}
              className={`eq-quiz-option ${shake ? "eq-shake" : ""} ${state === "right" && isAnswered && index === selectedOption ? "eq-pop" : ""}`}
              data-state={state}
              aria-pressed={selectedOption === index}
            >
              <span className="eq-quiz-letter">{letters[index] ?? index + 1}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      <div className="eq-quiz-feedback" aria-live="polite">
        {isAnswered ? (
          <>
            <p className={`eq-quiz-verdict ${isCorrect ? "is-right" : "is-wrong"}`}>
              {isCorrect ? "Juste." : "Pas celle-là."}
              {isCorrect && combo >= 3 ? ` ${combo} d'affilée.` : ""}
            </p>
            <p className="eq-quiz-explanation">{question.explanation}</p>
          </>
        ) : (
          <p className="eq-quiz-hint">Choisis une réponse.</p>
        )}
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
