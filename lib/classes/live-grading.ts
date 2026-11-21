import { isExerciseAnswerCorrect, type ExerciseAnswer, type ExerciseItem } from "@/lib/courses/exercise-check";

export function gradeLiveAnswers(pool: ExerciseItem[], input: unknown[]): (ExerciseAnswer & { ok: boolean })[] {
  const questions = new Map(pool.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const marks: (ExerciseAnswer & { ok: boolean })[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object" || !("id" in raw) || typeof raw.id !== "string" || seen.has(raw.id)) continue;
    const question = questions.get(raw.id);
    if (!question) continue;
    let answer: ExerciseAnswer;
    if (question.type === "mcq") {
      if (!("choice" in raw) || typeof raw.choice !== "number" || !Number.isInteger(raw.choice) || raw.choice < 0 || raw.choice >= question.options.length) continue;
      answer = { id: raw.id, choice: raw.choice };
    } else {
      if (!("text" in raw) || typeof raw.text !== "string" || !raw.text.trim() || raw.text.length > 200) continue;
      answer = { id: raw.id, text: raw.text.trim() };
    }
    seen.add(raw.id);
    marks.push({ ...answer, ok: isExerciseAnswerCorrect(question, answer) });
  }
  return marks;
}
