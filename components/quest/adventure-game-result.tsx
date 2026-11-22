"use client";

import type { GameAnswer } from "@/lib/adventure/activities";

export type AdventureRound = {
  busy: boolean;
  initialAnswers: GameAnswer[];
  progress: (answers: GameAnswer[]) => void;
  submit: (answers: GameAnswer[]) => void;
};

export function AdventureGameResult({ correct, total, required, answers, round, replay }: {
  correct: number; total: number; required: number; answers: GameAnswer[]; round: AdventureRound; replay: () => void;
}) {
  const passed = correct >= required && answers.length === total;
  return <div className="atlas-game-end">
    <h3>{passed ? "Transmission complète" : "Encore un essai"}</h3>
    <p>{correct} / {total} réponses justes. {passed ? "Envoie tes réponses pour ouvrir la suite de l’histoire." : `Retrouve au moins ${required} bonnes réponses dans une manche complète.`}</p>
    <button className="eq-btn eq-btn-primary" type="button" disabled={round.busy}
      onClick={passed ? () => round.submit(answers) : replay}>
      {round.busy ? "Vérification…" : passed ? "Transmettre mes réponses" : "Rejouer la manche"}
    </button>
  </div>;
}
