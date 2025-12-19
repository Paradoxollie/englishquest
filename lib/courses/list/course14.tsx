import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course14: LessonContent = {
  courseNumber: 14,
  title: "Le Futur Proche (Going to)",
  description: "L'intention et la preuve.",
  icon: "🔮",
  difficulty: "Indispensable",
  objective: "Exprimer ce qui va arriver (Plan ou Évidence).",
  sections: [
    {
      title: "Introduction : Les Deux Visages du Futur",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-teal-500">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              En anglais, le futur n'est pas juste un temps conjugué. C'est une <strong>nuance de certitude</strong>.
              <br /><br />
              <span className="text-teal-400 font-bold">BE GOING TO</span> est le roi de la <strong className="text-white">VISIBILITÉ</strong>. On l'utilise quand le futur est déjà présent dans notre tête (Plan) ou sous nos yeux (Preuve).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center border-t-4 border-purple-500">
              <span className="text-4xl mb-2">🧠</span>
              <p className="text-purple-400 font-bold uppercase">Le Projet (Interne)</p>
              <p className="text-slate-400 text-sm mt-1">C'est décidé, c'est mon intention.</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"I'm <span className="text-purple-400">going to</span> buy a car."</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center border-t-4 border-orange-500">
              <span className="text-4xl mb-2">👀</span>
              <p className="text-orange-400 font-bold uppercase">La Preuve (Externe)</p>
              <p className="text-slate-400 text-sm mt-1">Je vois la cause et l'effet imminent.</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"Look! He's <span className="text-orange-400">going to</span> fall!"</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. La Structure et Ses Subtilités",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            C'est une machine à 3 pièces. Mais attention : pour le verbe "Allez" (To Go), on triche souvent !
          </p>

          <div className="flex flex-wrap justify-center gap-2 font-mono text-lg md:text-xl bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex flex-col items-center">
              <span className="text-purple-400 font-bold">BE (conjugué)</span>
              <span className="text-xs text-slate-500 uppercase mt-1">Am / Is / Are</span>
            </div>
            <span className="text-slate-500 self-center">+</span>
            <div className="flex flex-col items-center">
              <span className="text-teal-400 font-bold">GOING TO</span>
              <span className="text-xs text-slate-500 uppercase mt-1">Invariable</span>
            </div>
            <span className="text-slate-500 self-center">+</span>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold">VERBE</span>
              <span className="text-xs text-slate-500 uppercase mt-1">Base Verbale</span>
            </div>
          </div>

          <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🗣️</span>
              <h4 className="text-amber-400 font-bold uppercase text-sm">Oral Only : "GONNA"</h4>
            </div>
            <p className="text-slate-300 text-sm">
              "I'm <strong className="text-white">gonna</strong> do it."
              <br />
              C'est LA façon dont les natifs de parlent. Mais attention, "Gonna" ne s'écrit jamais (sauf SMS).
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded border border-slate-600 mt-4">
            <h4 className="text-slate-200 font-bold text-sm mb-2">L'Exception du verbe "GO"</h4>
            <p className="text-slate-400 text-sm">
              On évite souvent de dire "I am going to go". C'est lourd.
              <br />
              On préfère dire simplement : <strong className="text-white">"I am going to Paris"</strong> (Present Continuous utilisé comme futur).
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. Les Nuances Avancées (Will & Was)",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
            <h4 className="text-blue-400 font-bold uppercase text-sm mb-1">Le Cas "Sherlock Holmes" (La Preuve)</h4>
            <p className="text-slate-300 text-sm">
              Si vous avez une <strong className="text-white">PREUVE VISUELLE</strong>, vous DEVEZ utiliser Going To. "Will" est interdit ici.
              <br />
              Ex: Nuages noirs ➔ <em>"It's going to rain."</em> (Pas "It will rain").
              <br />
              Ex: Homme qui marche vers un mur sans regarder ➔ <em>"He is going to crash."</em>
            </p>
          </div>

          <div className="bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r">
            <h4 className="text-purple-400 font-bold uppercase text-sm mb-1">Le Plan Abandonné (Was Going To)</h4>
            <p className="text-slate-300 text-sm">
              Une structure magnifique pour raconter vos échecs ou changements de plan.
              <br />
              <span className="font-mono text-white text-base block mt-2 mb-1">"I <span className="text-purple-400 font-bold">was going to</span> call you, but I forgot."</span>
              <span className="text-xs text-slate-400 px-2">J'avais l'intention de t'appeler (projet passé), mais je ne l'ai pas fait.</span>
            </p>
          </div>

          <div className="mt-4 p-4 bg-slate-800 rounded-lg">
            <h4 className="text-emerald-400 font-bold text-sm mb-2">Subtilité : Intention vs Arrangement</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <strong className="text-white">I'm going to meet Tom.</strong> (Mon intention/projet).
              </li>
              <li>
                <strong className="text-white">I'm meeting Tom.</strong> (C'est arrangé, rendez-vous pris).
                <br />
                <span className="text-xs text-slate-500">Le Present Continuous est plus "fort" et plus "sûr" que le Going to pour les rendez-vous.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Le Prophète"
          questions={[
            {
              id: 1,
              question: "Look at those black clouds! It ___ rain.",
              options: ["will", "is going to", "goes to", "shall"],
              correctAnswer: 1,
              explanation: "Preuve visuelle évidente (Les nuages). C'est le cas 'Sherlock Holmes' ➔ GOING TO.",
            },
            {
              id: 2,
              question: "I ___ buy a new house next year. (C'est mon projet).",
              options: ["will", "am going to", "am going", "go to"],
              correctAnswer: 1,
              explanation: "Intention/Projet déjà réfléchi. 'Will' serait une décision impulsive.",
            },
            {
              id: 3,
              question: "Watch out! You ___ fall!",
              options: ["will", "are going to", "go to", "are falling"],
              correctAnswer: 1,
              explanation: "Évidence immédiate (Tu vas tomber !). On voit la cause et l'effet imminent.",
            },
            {
              id: 4,
              question: "'I left the door open.' 'No problem, I ___ close it.'",
              options: ["am going to", "close", "will", "closing"],
              correctAnswer: 2,
              explanation: "Décision instantanée (Je réagis maintenant). Je ne l'avais pas prévu avant le moment de parler. ➔ WILL.",
            },
            {
              id: 5,
              question: "I ___ call you, but I lost your number.",
              options: ["am going to", "was going to", "will", "went to"],
              correctAnswer: 1,
              explanation: "Intention passée non réalisée (Plan abandonné). ➔ WAS GOING TO.",
            },
            {
              id: 6,
              question: "We ___ visit Paris next summer.",
              options: ["are going to", "will", "go to", "going to"],
              correctAnswer: 0,
              explanation: "Projet de vacances (Intention).",
            },
            {
              id: 7,
              question: "What ___ you ___ do with that money?",
              options: ["are / going to", "will / do", "do / go to", "are / gonna"],
              correctAnswer: 0,
              explanation: "Question sur l'intention/le projet.",
            },
            {
              id: 8,
              question: "I feel seek. I think I ___ be sick.",
              options: ["will", "am going to", "go to", "am being"],
              correctAnswer: 1,
              explanation: "Sensation interne (Preuve sensorielle). 'I feel terrible' ➔ Evidence ➔ GOING TO be sick.",
            },
            {
              id: 9,
              question: "I can't come tonight. I ___ (see) my doctor.",
              options: ["am seeing", "will see", "am going to see", "see"],
              correctAnswer: 0,
              explanation: "C'est un rendez-vous (Arrangement) confirmé. Le Present Continuous (I am seeing) est le plus naturel ici, bien que 'Going to' soit grammaticalement correct pour l'intention.",
            },
            {
              id: 10,
              question: "Why ___ you ___ sell your car?",
              options: ["will / sell", "are / going to", "do / go to", "are / selling"],
              correctAnswer: 1,
              explanation: "On demande la raison d'un projet/intention.",
            },
          ]}
        />
      )
    }
  ]
};