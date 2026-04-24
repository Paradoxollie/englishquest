import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course13: LessonContent = {
  courseNumber: 13,
  title: "Used to / Didn't use to",
  description: "Le monde d'avant.",
  icon: "🎞️",
  difficulty: "Intermédiaire",
  objective: "Parler d'habitudes passées qui n'existent plus aujourd'hui (Rupture).",
  sections: [
    {
      title: "Introduction : Le Fossé Temporel (Gap)",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-amber-600">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              <span className="text-amber-400 font-bold">Used to</span> est une machine à voyager dans le temps.
              Il ne sert pas juste à dire ce que vous faisiez avant. Il sert à dire ce que vous <strong className="text-white">NE FAITES PLUS</strong> aujourd'hui.
              <br /><br />
              C'est une rupture nette.
              <span className="block mt-2 italic text-slate-400">"I used to smoke" implicite nécessairement : "I don't smoke anymore".</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-6">
            <div className="bg-slate-800 p-4 rounded-lg w-full md:w-1/3 text-center border-b-4 border-amber-500 opacity-75">
              <div className="text-4xl mb-2">📼</div>
              <p className="font-bold text-amber-400">AVANT (Vrai)</p>
              <p className="text-xs text-slate-400">I used to play tennis.</p>
            </div>
            <div className="hidden md:block text-2xl text-slate-500">➔ ⚡ ➔</div>
            <div className="bg-slate-800 p-4 rounded-lg w-full md:w-1/3 text-center border-b-4 border-emerald-500">
              <div className="text-4xl mb-2">📱</div>
              <p className="font-bold text-emerald-400">MAINTENANT (Faux)</p>
              <p className="text-xs text-slate-400">I don't play anymore.</p>
            </div>
          </div>

          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r mt-4">
            <h4 className="text-blue-400 font-bold uppercase text-sm mb-1">Le Test du "Une Fois"</h4>
            <p className="text-slate-300 text-sm">
              Pour utiliser "Used to", cela doit être une <strong>Habitude</strong> ou un <strong>État</strong> qui a duré.
              <br />
              Si vous l'avez fait une seule fois (ex: "Je suis allé à Disney l'an dernier"), "Used to" est <strong className="text-red-400">INTERDIT</strong>. Utilisez le Past Simple.
              <br />
              <span className="text-xs italic bg-slate-900 p-1 rounded inline-block mt-1">"I used to go to Disney once" ➔ IMPOSSIBLE.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "1. La Grammaire de Précision",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            La structure est invariable, mais attention aux pièges d'orthographe et de prononciation.
          </p>

          <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-slate-800 text-slate-200">
                <tr>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Structure</th>
                  <th className="p-3 text-left">Détail Critique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr className="bg-emerald-900/10">
                  <td className="p-3 font-bold text-emerald-400 text-xs md:text-sm">(+) Affirmation</td>
                  <td className="p-3 font-mono">I <strong className="text-white">used to</strong> play.</td>
                  <td className="p-3 text-xs text-slate-400">Avec un "D".</td>
                </tr>
                <tr className="bg-red-900/10">
                  <td className="p-3 font-bold text-red-400 text-xs md:text-sm">(-) Négation</td>
                  <td className="p-3 font-mono">I <strong className="text-white">didn't use</strong> to play.</td>
                  <td className="p-3 text-xs text-slate-400">PAS de "D" (Did le mange).</td>
                </tr>
                <tr className="bg-purple-900/10">
                  <td className="p-3 font-bold text-purple-400 text-xs md:text-sm">(-) Exception "Never"</td>
                  <td className="p-3 font-mono">I <strong className="text-white">never used</strong> to play.</td>
                  <td className="p-3 text-xs text-amber-400 font-bold">Le "D" revient ! (Pas de Did).</td>
                </tr>
                <tr className="bg-blue-900/10">
                  <td className="p-3 font-bold text-blue-400 text-xs md:text-sm">(?) Question</td>
                  <td className="p-3 font-mono"><strong className="text-white">Did</strong> you <strong className="text-white">use</strong> to play?</td>
                  <td className="p-3 text-xs text-slate-400">PAS de "D".</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="bg-slate-800 p-4 rounded border border-slate-600">
              <h4 className="text-slate-200 font-bold mb-2 text-sm">👄 Prononciation : Le sifflement</h4>
              <p className="text-slate-400 text-sm">
                Ne prononcez pas le "Z" de "To Use" (/juːz/).
                <br />
                "Used to" se prononce toujours avec un <strong>"S"</strong> (comme "Sssss").
                <br />
                <span className="font-mono text-white">/juːstuː/</span> (On lie les deux mots).
              </p>
            </div>
            <div className="bg-slate-800 p-4 rounded border border-slate-600">
              <h4 className="text-slate-200 font-bold mb-2 text-sm">🛑 "Any More" vs "No Longer"</h4>
              <p className="text-slate-400 text-sm">
                Pour insist sur la rupture en fin de phrase :
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>"I don't smoke <strong>any more</strong>." (Courant)</li>
                  <li>"I <strong>no longer</strong> smoke." (Plus formel/écrit)</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Les Traps (Imparfait & Faux Amis)",
      content: (
        <div className="space-y-6">

          {/* TRAP 1: CONTINUOUS vs HABIT */}
          <div className="bg-slate-800 p-5 rounded-xl border border-purple-500/30">
            <h3 className="text-purple-400 font-bold flex items-center gap-2 mb-3">
              <span className="text-xl">🛑</span> Trap #1 : Le Retour de l'Imparfait
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Comme vu au <strong>Cours 12</strong>, l'imparfait français a deux traductions. Ne les mélangez pas !
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-3 rounded border-l-2 border-cyan-500">
                <p className="text-xs text-cyan-400 uppercase font-bold mb-1">Contexte : Décor (Un jour précis)</p>
                <p className="text-slate-400 text-sm italic">"À 8h, je mangeais..."</p>
                <p className="text-white font-mono mt-1">➔ I was eating.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border-l-2 border-amber-500">
                <p className="text-xs text-amber-400 uppercase font-bold mb-1">Contexte : Habitude (Période révolue)</p>
                <p className="text-slate-400 text-sm italic">"Avant, je mangeais beaucoup..."</p>
                <p className="text-white font-mono mt-1">➔ I <span className="text-amber-400 font-bold">used to</span> eat.</p>
              </div>
            </div>
          </div>

          {/* TRAP 2: TO BE USED TO */}
          <div className="bg-red-900/20 p-5 rounded-xl border border-red-500/30">
            <h3 className="text-red-400 font-bold flex items-center gap-2 mb-3">
              <span className="text-xl">☠️</span> Trap #2 : L'Habitude Actuelle
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              C'est l'erreur n°1 des francophones. Ne confondez pas "Avoir l'habitude" (État présent) et "Avoir fait autrefois" (Passé).
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <div>
                  <p className="text-slate-200 font-bold">I used to drive.</p>
                  <p className="text-slate-400 text-xs">"Je conduisais avant (mais plus maintenant)." ➔ Rupture.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold">⚠️</span>
                <div>
                  <p className="text-slate-200 font-bold">I am used to driving.</p>
                  <p className="text-slate-400 text-xs">"J'ai l'habitude de conduire (ce n'est pas difficile pour moi)." ➔ Adaptation.</p>
                  <p className="text-xs text-red-400 mt-1">Notez le 'BE' et le 'ING'. C'est une structure totalement différente (Niveau B2/C1).</p>
                </div>
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
          title="Le Juge du Passé"
          questions={[
            {
              id: 1,
              question: "I ___ smoke, but I stopped last year.",
              options: ["used to", "use to", "usually", "was smoking"],
              correctAnswer: 0,
              explanation: "Habitude passée terminée. La structure affirmative prend un 'D'.",
            },
            {
              id: 2,
              question: "___ you ___ have long hair?",
              options: ["Did / used to", "Did / use to", "Do / use to", "Were / used to"],
              correctAnswer: 1,
              explanation: "Question au passé avec USED TO : L'auxiliaire DID mange le 'D'. ➔ Did you USE to...",
            },
            {
              id: 3,
              question: "Before internet, people ___ (write) letters.",
              options: ["were writing", "used to write", "are writing", "use to write"],
              correctAnswer: 1,
              explanation: "Habitude d'une époque révolue. 'Were writing' décrirait un moment précis, pas une généralité sur l'époque.",
            },
            {
              id: 4,
              question: "I ___ like broccoli, but now I love it.",
              options: ["didn't used to", "didn't use to", "not used to", "don't use to"],
              correctAnswer: 1,
              explanation: "Négation : DIDN'T USE TO (sans D).",
            },
            {
              id: 5,
              question: "She ___ usually wake up early.",
              options: ["doesn't", "is not used to", "didn't use to", "--"],
              correctAnswer: 0,
              explanation: "Piège ! 'Usually' est un marqueur de fréquence du PRÉSENT (ou habitude générale). Ici on teste le présent simple : She doesn't usually...",
            },
            {
              id: 6,
              question: "I ___ live in London.",
              options: ["used to", "was living", "am used to", "use to"],
              correctAnswer: 0,
              explanation: "Sans contexte précis de temps, 'Used to' est le meilleur choix pour dire 'J'habitais là-bas avant'.",
            },
            {
              id: 7,
              question: "I ___ (never) like sports.",
              options: ["never use to", "never used to", "didn't never used to", "never did use to"],
              correctAnswer: 1,
              explanation: "Avec 'Never', il n'y a pas d'auxiliaire DID. Donc 'Used to' garde son 'D' ! C'est le piège ultime.",
            },
            {
              id: 8,
              question: "Je n'ai pas l'habitude de conduire (C'est nouveau pour moi).",
              options: ["I didn't use to drive", "I am not used to driving", "I don't use to drive", "I not usually drive"],
              correctAnswer: 1,
              explanation: "C'est le piège 'BE USED TO'. Ici on parle de familiarité/difficulté, pas du passé simple.",
            },
            {
              id: 9,
              question: "Where ___ you ___ go to school?",
              options: ["did / use to", "did / used to", "were / going", "are / using"],
              correctAnswer: 0,
              explanation: "Question standard avec Used to : DID ... USE TO.",
            },
            {
              id: 10,
              question: "I went to Disney World once. I ___ love it.",
              options: ["used to", "loved", "was loving", "did use to"],
              correctAnswer: 1,
              explanation: "Une seule fois (Once) ? Alors 'Used to' est interdit. On utilise le Past Simple : I loved it.",
            },
          ]}
        />
      )
    }
  ]
};
