import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course19: LessonContent = {
  courseNumber: 19,
  title: "Quantité précise (Much / Many)",
  objective: "Dire combien il y en a. Demande « How many apples? » pour des pommes et « How much water? » pour de l’eau.",
  sections: [
    {
      title: "1. Le Concept Fondamental : Dénombrable vs Indénombrable",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            On utilise many avec un nom dénombrable au pluriel, comme apples. Avec un nom indénombrable comme water, on utilise much.
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
      title: "Much pour une quantité",
      content: (
        <LessonExamples
          examples={[
            { english: "How much time do we have? We don’t have much time.", meaning: "Tu demandes quelle durée reste disponible." },
            { english: "Much work remains.", meaning: "Formulation fréquente dans un rapport ou un registre soutenu." },
          ]}
        >
          Much accompagne un nom indénombrable. On le rencontre souvent dans les questions et les négations, ainsi que dans l’écrit soutenu.
        </LessonExamples>
      )
    },
    {
      title: "A lot of dans la conversation",
      content: (
        <LessonExamples
          examples={[
            { english: "We have a lot of time.", meaning: "On a beaucoup de temps." },
            { english: "She has a lot of friends.", meaning: "Elle a beaucoup d’amis." },
          ]}
        >
          A lot of convient aux noms pluriels et aux indénombrables. C’est une façon courante d’exprimer une grande quantité à l’oral.
        </LessonExamples>
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
      title: "Quiz · Demander combien",
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
              question: "À l’oral, quelle expression est la plus courante pour dire « J’ai beaucoup de temps » ? I have ___ time.",
              options: ["much", "many", "a lot of"],
              correctAnswer: 2,
              explanation: "A lot of est courant dans la conversation. Much se rencontre aussi dans des emplois plus soutenus.",
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
