/**
 * Grammar Rush : les questions des cours, sous chrono.
 *
 * Moteur pur, sans état React. Soixante secondes, une question à la fois,
 * quatre propositions. Une bonne réponse vaut 10 points multipliés par la
 * série (1,0 puis +0,1 par bonne réponse consécutive, plafonné à 2,0), plus
 * 5 points si la réponse vient en moins de trois secondes. Une erreur ne
 * retire rien mais remet la série à zéro.
 */

export const GRAMMAR_RUSH_TIME_MS = 60_000;
export const GRAMMAR_RUSH_BASE_POINTS = 10;
export const GRAMMAR_RUSH_SPEED_BONUS = 5;
export const GRAMMAR_RUSH_SPEED_LIMIT_MS = 3000;
export const GRAMMAR_RUSH_MAX_MULTIPLIER = 2;

export type RushQuestion = {
  id: string;
  course: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type RushState = {
  queue: RushQuestion[];
  index: number;
  score: number;
  correct: number;
  attempts: number;
  streak: number;
  bestStreak: number;
  missed: RushQuestion[];
};

export function createRushState(questions: RushQuestion[]): RushState {
  return { queue: questions, index: 0, score: 0, correct: 0, attempts: 0, streak: 0, bestStreak: 0, missed: [] };
}

export function currentRushQuestion(state: RushState): RushQuestion | null {
  return state.queue[state.index] ?? null;
}

export function rushMultiplier(streak: number) {
  return Math.min(GRAMMAR_RUSH_MAX_MULTIPLIER, 1 + streak * 0.1);
}

export function answerRush(state: RushState, choice: number, elapsedMs: number) {
  const question = currentRushQuestion(state);
  if (!question) {
    return { state, isCorrect: false, points: 0, speedBonus: 0 };
  }
  const isCorrect = question.correctAnswer === choice;
  if (!isCorrect) {
    return {
      state: {
        ...state,
        index: state.index + 1,
        attempts: state.attempts + 1,
        streak: 0,
        missed: [...state.missed, question],
      },
      isCorrect,
      points: 0,
      speedBonus: 0,
    };
  }
  const multiplier = rushMultiplier(state.streak);
  const speedBonus = elapsedMs <= GRAMMAR_RUSH_SPEED_LIMIT_MS ? GRAMMAR_RUSH_SPEED_BONUS : 0;
  const points = Math.round(GRAMMAR_RUSH_BASE_POINTS * multiplier) + speedBonus;
  const streak = state.streak + 1;
  return {
    state: {
      ...state,
      index: state.index + 1,
      score: state.score + points,
      correct: state.correct + 1,
      attempts: state.attempts + 1,
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
    },
    isCorrect,
    points,
    speedBonus,
  };
}
