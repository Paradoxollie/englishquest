import type { RushQuestion } from "./grammar-rush";
import type { CourseExercises } from "../courses/exercise-check";
import { grammarDrills } from "./words/grammar-drills";

export function buildGrammarBank(native: readonly RushQuestion[], exercises: Record<number, CourseExercises>): RushQuestion[] {
  const bank = [...native];
  for (const { course, items } of Object.values(exercises)) {
    for (const item of items) {
      if (item.type === "mcq" && item.options.length === 4) {
        bank.push({ id: `exercise-${course}-${item.id}`, course, question: item.question, options: item.options, correctAnswer: item.correctAnswer });
      }
    }
  }
  const counts = new Map<number, number>();
  for (const [course, options, sentences] of grammarDrills) {
    for (const sentence of sentences) {
      const index = (counts.get(course) ?? 0) + 1;
      counts.set(course, index);
      const match = /\[([^\]]+)\]/.exec(sentence);
      if (!match || !options.includes(match[1])) throw new Error(`Corrigé manquant au cours ${course} : ${sentence}`);
      bank.push({ id: `rush-${course}-${index}`, course, question: sentence.replace(match[0], "___"), options, correctAnswer: options.indexOf(match[1]) });
    }
  }
  return bank;
}
