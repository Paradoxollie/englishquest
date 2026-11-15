/**
 * Exercices de cours : types partagés et correction, identiques côté
 * navigateur (retour immédiat) et côté serveur (note enregistrée).
 * Module sans dépendance.
 */

export type McqItem = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type GapItem = {
  id: string;
  type: "gap";
  prompt: string;
  answers: string[];
  explanation: string;
};

export type OrderItem = {
  id: string;
  type: "order";
  answers: string[];
  translation?: string;
  explanation: string;
};

export type ExerciseItem = McqItem | GapItem | OrderItem;

export type CourseExercises = { course: number; items: ExerciseItem[] };

/** Réponse envoyée au serveur : indice d'origine pour un QCM, texte sinon. */
export type ExerciseAnswer = { id: string; choice?: number; text?: string };

/** Nombre de questions d'une série de quiz. */
export const QUIZ_SIZE = 10;
/** Composition visée d'une série quand les exercices supplémentaires existent. */
export const QUIZ_MIX = { gap: 2, order: 2 } as const;

const FINAL_PUNCTUATION = /[\s.?!]+$/u;

/** Minuscules, apostrophes droites, espaces simples, sans ponctuation finale. */
export function normalizeAnswer(value: string) {
  return value
    .normalize("NFC")
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(FINAL_PUNCTUATION, "")
    .toLowerCase();
}

export function isGapAnswerCorrect(item: GapItem, text: string) {
  const given = normalizeAnswer(text);
  return given.length > 0 && item.answers.some((answer) => normalizeAnswer(answer) === given);
}

export function isOrderAnswerCorrect(item: OrderItem, text: string) {
  const given = normalizeAnswer(text);
  return given.length > 0 && item.answers.some((answer) => normalizeAnswer(answer) === given);
}

/** Mots à remettre dans l'ordre, tirés de la première phrase acceptée. */
export function orderTokens(item: OrderItem) {
  return item.answers[0].replace(FINAL_PUNCTUATION, "").trim().split(/\s+/);
}

/** Ponctuation finale de la phrase attendue, ajoutée automatiquement. */
export function orderPunctuation(item: OrderItem) {
  const match = item.answers[0].trim().match(/[.?!]$/);
  return match ? match[0] : ".";
}

/** Mots courants en début de phrase : leur majuscule désignerait le premier mot. */
const COMMON_STARTERS = new Set(
  (
    "you he she it we they my your his her its our their the a an this that these those there here " +
    "what where when why who how which whose do does did don't doesn't didn't is are am was were isn't aren't " +
    "wasn't weren't have has had haven't hasn't hadn't can could can't couldn't will would won't wouldn't " +
    "should shouldn't must mustn't may might shall if although though even despite in spite before after since " +
    "because as while unless once when yesterday today tomorrow last next every always never often sometimes " +
    "usually in on at by for from to with without some any no not all both each many much most one two three " +
    "let's please look listen be being get go come take make she's he's it's we're they're you're there's " +
    "what's who's that's let ten five people everyone nobody somebody someone nothing everything"
  ).split(" ")
);

/**
 * Mot affiché sur une étiquette : le premier mot de la phrase perd sa
 * majuscule quand c'est un mot courant, pour ne pas donner la réponse. Les
 * noms propres et « I » la gardent.
 */
export function displayToken(token: string, index: number) {
  if (index !== 0) return token;
  if (token === "I" || token.startsWith("I'")) return token;
  const lower = token.toLowerCase();
  return COMMON_STARTERS.has(lower) ? token.charAt(0).toLowerCase() + token.slice(1) : token;
}

export function isExerciseAnswerCorrect(item: ExerciseItem, answer: ExerciseAnswer) {
  if (item.type === "mcq") return answer.choice === item.correctAnswer;
  if (typeof answer.text !== "string") return false;
  return item.type === "gap" ? isGapAnswerCorrect(item, answer.text) : isOrderAnswerCorrect(item, answer.text);
}

/** Réponse modèle à afficher après une erreur. */
export function expectedAnswerText(item: ExerciseItem) {
  if (item.type === "mcq") return item.options[item.correctAnswer];
  return item.answers[0];
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Tire une série : des phrases à compléter et à remettre dans l'ordre quand
 * il y en a, le reste en QCM, puis mélange l'ordre de passage.
 */
export function drawQuizSeries(pool: ExerciseItem[], random: () => number = Math.random, size = QUIZ_SIZE) {
  const byType = (type: ExerciseItem["type"]) => shuffled(pool.filter((item) => item.type === type), random);
  const gaps = byType("gap").slice(0, QUIZ_MIX.gap);
  const orders = byType("order").slice(0, QUIZ_MIX.order);
  const mcqs = byType("mcq").slice(0, Math.max(0, size - gaps.length - orders.length));
  const series = [...mcqs, ...gaps, ...orders];
  if (series.length < size) {
    const used = new Set(series.map((item) => item.id));
    series.push(...shuffled(pool.filter((item) => !used.has(item.id)), random).slice(0, size - series.length));
  }
  return shuffled(series, random);
}
