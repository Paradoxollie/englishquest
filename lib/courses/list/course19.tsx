import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course19: LessonContent = {
  courseNumber: 19,
  title: "Quantité précise (Much / Many)",
  objective: "Maîtriser les quantités dénombrables et indénombrables.",
  sections: [
    {
      title: "1. Le Concept Fondamental : Dénombrable vs Indénombrable",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            En anglais, tout dépend de la nature du mot. Peut-on compter l'objet sur ses doigts ?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold mb-2">Dénombrables (Countable)</h4>
              <p className="text-sm text-slate-300 mb-2">On peut compter : 1, 2, 3...</p>
              <ul className="text-sm text-slate-400 list-disc ml-4 space-y-1">
                <li>One apple, two apple<strong>s</strong>.</li>
                <li>One car, three car<strong>s</strong>.</li>
                <li>One friend, many friend<strong>s</strong>.</li>
              </ul>
              <p className="mt-2 text-xs text-emerald-400 italic">Indice : Ils prennent un S au pluriel.</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="text-purple-400 font-bold mb-2">Indénombrables (Uncountable)</h4>
              <p className="text-sm text-slate-300 mb-2">Impossible à compter à l'unité (liquides, concepts).</p>
              <ul className="text-sm text-slate-400 list-disc ml-4 space-y-1">
                <li>Water (Pas "one water").</li>
                <li>Money (Pas "two monies").</li>
                <li>Time, Love, Music, Bread...</li>
              </ul>
              <p className="mt-2 text-xs text-purple-400 italic">Indice : Ils restent toujours au singulier.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. MANY (Pour les Dénombrables)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Pour dire "Beaucoup de" avec des pluriels (Dénombrables), on utilise <span className="font-bold text-emerald-400">MANY</span>.
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>"I have <strong>many</strong> friends." (J'ai beaucoup d'amis)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">✔</span>
              <span>"There are <strong>many</strong> cars in the street."</span>
            </li>
          </ul>
          <div className="bg-slate-800 p-3 rounded space-y-2">
            <p className="text-xs text-slate-400">Note : <strong>Many</strong> fonctionne dans tous les types de phrases (+, -, ?).</p>
            <p className="text-xs text-emerald-400">
              <strong>Astuce Pro :</strong> Pour le temps, on préfère "Many years / weeks / days" (Plus élégant que "A lot of").
              <br /><span className="text-slate-500 italic">Ex: "I have lived here for many years."</span>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "3. MUCH (Pour les Indénombrables)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Pour dire "Beaucoup de" avec du singulier (Indénombrables), on utilise <span className="font-bold text-purple-400">MUCH</span>.
          </p>

          <div className="bg-red-900/30 p-4 rounded border border-red-500/50">
            <h4 className="text-red-400 font-bold mb-2 uppercase flex items-center gap-2">
              <span>⚠️</span> LE PIÈGE MORTEL
            </h4>
            <p className="text-slate-200 mb-2">
              <strong>MUCH</strong> est interdit dans les phrases affirmatives (Positives) !
            </p>
            <p className="text-sm text-slate-300">
              Il est réservé strictement aux :
              <br />1. Phrases Négatives (-)
              <br />2. Questions (?)
            </p>
          </div>

          <div className="bg-slate-800 p-3 rounded border border-yellow-500/30 mt-2">
            <strong className="text-yellow-400 text-xs uppercase mb-1 block">EXCEPTION IMPORTANTE :</strong>
            <p className="text-sm text-slate-300">
              <strong>MUCH</strong> est autorisé en positif S'IL est accompagné de <strong className="text-white">TOO</strong> (trop) ou <strong className="text-white">SO</strong> (tellement).
            </p>
            <ul className="text-xs text-slate-400 mt-1 list-disc ml-4">
              <li>"I ate <strong>too much</strong> cake." (J'ai mangé trop de gâteau). <span className="text-green-400">OK</span></li>
              <li>"Thank you <strong>so much</strong>." (Merci tellement/beaucoup). <span className="text-green-400">OK</span></li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4 text-sm">
            <div className="bg-black/20 p-3 rounded">
              <p className="text-slate-500 mb-1">Négatif (-) : <span className="text-green-400">Correct</span></p>
              <p className="text-white">"I don't have <strong>much</strong> time."</p>
            </div>
            <div className="bg-black/20 p-3 rounded">
              <p className="text-slate-500 mb-1">Question (?) : <span className="text-green-400">Correct</span></p>
              <p className="text-white">"Do you have <strong>much</strong> money?"</p>
            </div>
            <div className="bg-black/20 p-3 rounded border border-red-500/30">
              <p className="text-slate-500 mb-1">Affirmatif (+) : <span className="text-red-400 font-bold">INTERDIT</span></p>
              <p className="text-red-300 line-through">"I have much money."</p>
              <p className="text-slate-400 italic">➔ Voir section suivante pour la solution.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Le Joker : A LOT OF",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            C'est le sauveur universel. Il remplace <strong className="text-purple-400">MUCH</strong> dans les phrases affirmatives (+).
          </p>
          <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="text-yellow-400 font-bold mb-2">La Règle d'Or en Affirmatif (+)</h4>
            <p className="text-slate-200 mb-3">
              Si la phrase est positive, utilisez toujours <strong className="text-yellow-400">A LOT OF</strong> (ou <em>Lots of</em>).
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>"I have <strong className="text-yellow-400">a lot of</strong> money." (Pas "Much")</li>
              <li>"She drinks <strong className="text-yellow-400">a lot of</strong> water." (Pas "Much")</li>
              <li>"We have <strong className="text-yellow-400">a lot of</strong> problems." (Fonctionne aussi avec Many)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "5. Questions de Quantité",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">Pour poser une question, on applique la même logique.</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-center">
            <div className="bg-slate-800 p-4 rounded border border-emerald-500/30">
              <strong className="block text-emerald-400 text-lg mb-2">HOW MANY ?</strong>
              <p className="text-slate-400">Pour ce qui se compte.</p>
              <p className="text-white mt-2 italic">"How many <strong>cars</strong>?"</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-purple-500/30">
              <strong className="block text-purple-400 text-lg mb-2">HOW MUCH ?</strong>
              <p className="text-slate-400">Pour le reste (masse, prix).</p>
              <p className="text-white mt-2 italic">"How much <strong>sugar</strong>?"</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quiz : Much, Many ou A lot of ?",
      content: (
        <Quiz
          questions={[
            {
              id: 1,
              question: "Type de mot : 'Water' (Eau)",
              options: ["Countable (Dénombrable)", "Uncountable (Indénombrable)"],
              correctAnswer: 1,
              explanation: "L'eau est un liquide, on ne peut pas la compter à l'unité (one water, two waters... non).",
            },
            {
              id: 2,
              question: "Phrase Correcte : I don't have ___ money.",
              options: ["many", "much", "a lot"],
              correctAnswer: 1,
              explanation: "Phrase négative avec 'Money' (Indénombrable) -> MUCH.",
            },
            {
              id: 3,
              question: "Phrase Correcte : She has ___ friends.",
              options: ["many", "much", "plenty"],
              correctAnswer: 0,
              explanation: "Friends est pluriel (Dénombrable) -> MANY.",
            },
            {
              id: 4,
              question: "Phrase Correcte : I have ___ time.",
              options: ["much", "many", "a lot of"],
              correctAnswer: 2,
              explanation: "PIÈGE ! Phrase affirmative (+). 'Much' est interdit. On doit utiliser 'A lot of'.",
            },
            {
              id: 5,
              question: "How ___ stars are there in the sky?",
              options: ["much", "many", "lots"],
              correctAnswer: 1,
              explanation: "Stars (Étoiles) est pluriel. On peut les compter -> How MANY.",
            },
            {
              id: 6,
              question: "How ___ does it cost?",
              options: ["much", "many", "lot"],
              correctAnswer: 0,
              explanation: "Le prix (l'argent) est indénombrable -> How MUCH.",
            },
            {
              id: 7,
              question: "Il y a trop de sel. Too ___ salt.",
              options: ["many", "much", "lots"],
              correctAnswer: 1,
              explanation: "Salt (Sel) est indénombrable (poudre/grains). Too MUCH.",
            },
            {
              id: 8,
              question: "People (Gens) est...",
              options: ["Singulier", "Pluriel"],
              correctAnswer: 1,
              explanation: "People est toujours pluriel (One person, two people). Donc on utilise MANY.",
            },
            {
              id: 9,
              question: "News (Nouvelles/Infos) est...",
              options: ["Singulier (Uncountable)", "Pluriel (Countable)"],
              correctAnswer: 0,
              explanation: "Attention ! 'News' finit par S mais c'est un concept indénombrable singulier. 'The news IS interesting'. Donc MUCH.",
            },
            {
              id: 10,
              question: "Traffic (Circulation) est...",
              options: ["Singulier (Uncountable)", "Pluriel (Countable)"],
              correctAnswer: 0,
              explanation: "Traffic est un concept de masse. On ne dit pas 'one traffic'. Donc MUCH traffic.",
            },
          ]}
        />
      )
    }
  ]
};