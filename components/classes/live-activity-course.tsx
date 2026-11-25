"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { displayToken, isExerciseAnswerCorrect, orderTokens, writtenExerciseAnswer, type ExerciseAnswer, type ExerciseItem } from "@/lib/courses/exercise-check";
import { useClassActivity } from "./live-activity-context";
import { recordClassAnswer } from "./live-activity-events";

/** Same deck and word order on every telephone during a given round. */
function shuffled<T>(values: readonly T[], seed: string): T[] {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = Math.floor((state / 4294967296) * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function LiveCourseActivity({ title, objective, exercises, children }: {
  title: string; objective: string; exercises: ExerciseItem[]; children: ReactNode;
}) {
  const activity = useClassActivity();
  const [deck] = useState(() => shuffled(exercises, activity?.runKey ?? title));
  const [answers, setAnswers] = useState<ExerciseAnswer[]>(() => activity?.initialAnswers ?? []);
  const [tab, setTab] = useState<"lesson" | "questions">(() => answers.length ? "questions" : "lesson");
  const [question, setQuestion] = useState(() => deck.find(item => !answers.some(given => given.id === item.id)));
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const settled = useRef<string | null>(null);
  const [text, setText] = useState("");
  const score = (activity?.initialCorrect ?? 0) + answers.slice(activity?.initialAnswers.length ?? 0).filter(answer => {
    const item = deck.find(entry => entry.id === answer.id);
    return item && isExerciseAnswerCorrect(item, answer);
  }).length;
  const options = question?.type === "mcq" ? shuffled(question.options.map((value, index) => ({ value, index })), activity!.runKey + question.id) : [];
  const words = question?.type === "order" ? orderTokens(question).map((word, index) => displayToken(word, index)) : [];
  const hints = question ? shuffled(words, activity!.runKey + question.id) : [];
  if (hints.length > 1 && hints.every((value, index) => value === words[index])) hints.push(hints.shift()!);

  function submit(answer: ExerciseAnswer) {
    if (!question || feedback !== null || settled.current === answer.id || answers.some(({ id }) => id === answer.id)) return;
    settled.current = answer.id;
    const correct = isExerciseAnswerCorrect(question, answer);
    setAnswers([...answers, answer]);
    setFeedback(correct);
    recordClassAnswer(correct, answer);
  }
  function submitText(event: FormEvent) {
    event.preventDefault();
    if (question && question.type !== "mcq" && text.trim()) submit(writtenExerciseAnswer(question, text.trim()));
  }
  function next() {
    setQuestion(deck.find(item => !answers.some(given => given.id === item.id)));
    setText("");
    setFeedback(null);
  }
  const correction = question?.type === "mcq" ? question.options[question.correctAnswer] : question?.answers[0];

  return <div className="eq-live-course">
    <h1 className="eq-h3">{title}</h1>
    <p className="eq-live-objective">{objective}</p>
    <div className="eq-live-course-nav" aria-label="Activité">
      <button aria-pressed={tab === "lesson"} className="eq-btn eq-btn-ghost" onClick={() => setTab("lesson")}>Leçon</button>
      <button aria-pressed={tab === "questions"} className="eq-btn eq-btn-ghost" onClick={() => setTab("questions")}>Exercices</button>
    </div>
    {tab === "lesson" ? <div className="eq-live-lesson">
      {children}
      <button className="eq-btn eq-btn-primary" onClick={() => setTab("questions")}>Passer aux exercices</button>
    </div> : !question ? <div role="status" className="eq-inset">
      <h2 className="eq-h3">Exercices terminés</h2>
      <p>{score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {answers.length}.</p>
      <button className="eq-btn eq-btn-ghost" onClick={() => setTab("lesson")}>Relire la leçon</button>
    </div> : <section className="eq-live-exercise" key={question.id} data-exercise={question.id}>
      <p className="eq-muted">Exercice {Math.min(answers.length + (feedback === null ? 1 : 0), deck.length)} sur {deck.length}</p>
      <h2 className="eq-h3">{question.type === "mcq" ? question.question : question.type === "gap" ? question.prompt : "Remets les mots dans l’ordre."}</h2>
      {question.type === "order" && <><p lang="en" className="eq-live-word-hint">{hints.join(" · ")}</p>{question.translation && <p>{question.translation}</p>}</>}
      {question.type === "mcq" ? <div className="eq-live-course-choices">
        {options.map(({ value, index }) => <button key={index} className="eq-btn eq-btn-ghost" disabled={feedback !== null}
          onClick={() => submit({ id: question.id, choice: index })}>{value}</button>)}
      </div> : <form onSubmit={submitText} className="eq-live-course-choices">
        <label htmlFor="live-written-answer">{question.type === "gap" ? "Mot ou groupe de mots manquant" : "Ta réponse en anglais"}</label>
        <input id="live-written-answer" className="eq-input" value={text} onChange={event => setText(event.target.value)}
          maxLength={200} autoComplete="off" autoCapitalize="off" spellCheck={false} readOnly={feedback !== null} />
        {feedback === null && <button className="eq-btn eq-btn-primary" disabled={!text.trim()}>Valider</button>}
      </form>}
      {feedback !== null && <div className="eq-live-course-feedback" role="status">
        <strong>{feedback ? "Bonne réponse !" : "Réponse attendue"}</strong>
        {!feedback && <p lang="en">{correction}</p>}
        {question.explanation && <p>{question.explanation}</p>}
        <button className="eq-btn eq-btn-primary" onClick={next}>{answers.length === deck.length ? "Voir mon bilan" : "Continuer"}</button>
      </div>}
    </section>}
  </div>;
}
