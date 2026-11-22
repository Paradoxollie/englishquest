import { normalizeAnswer } from "@/lib/courses/exercise-check";
import type { AuthoredActivity, GameAnswer } from "./activities";

export function gradeActivity(step: AuthoredActivity, submitted: unknown) {
  if (step.mode !== "game") {
    if (typeof submitted !== "string" || submitted.length > 260) return false;
    const normalize = (s: string) => normalizeAnswer(s.replace(/[,.!?;:]/g, " "));
    const value = normalize(submitted);
    const withoutGreeting = value.replace(/^(?:hello|hi)\s+/, "");
    return step.accept.some(answer => normalize(answer) === value ||
      (step.mode === "write" && normalize(answer) === withoutGreeting));
  }
  const game = step.game;
  if (!game || !Array.isArray(submitted) || submitted.length > 6) return false;
  const answers = new Map<string, string>();
  for (const item of submitted as Partial<GameAnswer>[]) {
    if (!item || typeof item.id !== "string" || typeof item.value !== "string" || answers.has(item.id)) return false;
    answers.set(item.id, item.value);
  }
  if (game.type === "rush") {
    return answers.size === game.questions.length &&
      game.questions.filter(q => answers.get(q.id) === q.options[q.correctAnswer]).length >= 3 &&
      game.questions.every(q => q.options.includes(answers.get(q.id) ?? ""));
  }
  return answers.size === game.scenario.questions.length &&
    game.scenario.questions.every(q => answers.get(q.id) === q.options[q.correctIndex]);
}
