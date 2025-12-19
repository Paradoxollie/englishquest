import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course16: LessonContent = {
  courseNumber: 16,
  title: "L'Obligation (Must / Have to)",
  description: "La loi interne vs la loi externe.",
  icon: "👮",
  difficulty: "Difficile",
  objective: "Distinguer l'obligation personnelle (Must) de l'obligation imposée (Have to) et maîtriser l'interdiction.",
  sections: [
    {
      title: "Introduction : Le Chef, c'est qui ?",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-red-600">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              Pour dire "Je dois", l'anglais fait une distinction psychologique que le français ignore :
              <br />
              <strong className="text-white">Est-ce que l'ordre vient de VOUS ou de l'EXTÉRIEUR ?</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center border-t-4 border-purple-500">
              <span className="text-4xl mb-2">🧠</span>
              <p className="text-purple-400 font-bold uppercase">MUST (Interne)</p>
              <p className="text-slate-400 text-sm mt-1">Je me l'impose à moi-même. C'est mon sentiment.</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"I <span className="text-purple-400">must</span> call mom."</p>
              <p className="text-xs text-slate-500 mt-1">(Je pense que c'est nécessaire).</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center border-t-4 border-orange-500">
              <span className="text-4xl mb-2">📜</span>
              <p className="text-orange-400 font-bold uppercase">HAVE TO (Externe)</p>
              <p className="text-slate-400 text-sm mt-1">C'est la règle, la loi, ou la situation qui m'oblige.</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"I <span className="text-orange-400">have to</span> wear a tie."</p>
              <p className="text-xs text-slate-500 mt-1">(C'est le règlement au travail).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. Le Piège du Temps (MUST est défectif)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            <strong className="text-purple-400">MUST</strong> est un modal "diva". Il refuse de travailler au passé ou au futur.
            <br />
            Dès qu'on sort du présent, il démissionne et laisse la place à <strong className="text-orange-400">HAVE TO</strong>.
          </p>

          <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 mt-4">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-200">
                <tr>
                  <th className="p-3 text-left">Temps</th>
                  <th className="p-3 text-left">Verbe utilisé</th>
                  <th className="p-3 text-left">Exemple</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr className="bg-purple-900/10">
                  <td className="p-3 font-bold text-slate-400">Présent</td>
                  <td className="p-3 text-purple-400 font-bold">Must / Have to</td>
                  <td className="p-3 text-white">I <span className="text-purple-400">must</span> go.</td>
                </tr>
                <tr className="bg-red-900/10">
                  <td className="p-3 font-bold text-slate-400">Passé</td>
                  <td className="p-3 text-orange-400 font-bold">HAD TO</td>
                  <td className="p-3 text-white">I <span className="text-orange-400">had to</span> go yesterday. <span className="text-xs text-red-500 ml-1">(Must impossible)</span></td>
                </tr>
                <tr className="bg-blue-900/10">
                  <td className="p-3 font-bold text-slate-400">Futur</td>
                  <td className="p-3 text-orange-400 font-bold">WILL HAVE TO</td>
                  <td className="p-3 text-white">I <span className="text-orange-400">will have to</span> go.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded-r mt-2">
            <p className="text-amber-200 text-sm">
              <strong>Rappel :</strong> "He has to" (3e personne) prend un S. "Must" est invariable.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. Le Sherlock Holmes (Déduction Logique)",
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-900/40 p-5 rounded-xl border-l-4 border-indigo-500">
            <h3 className="text-indigo-300 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">🕵️‍♂️</span> Must pour la Logique (99% Sûr)
            </h3>
            <p className="text-slate-200">
              Parfois, <strong className="text-purple-400">MUST</strong> ne veut pas dire "Il faut", mais "C'est sûrement vrai".
              <br />
              On l'utilise quand on a une preuve évidente.
            </p>
            <div className="mt-4 bg-slate-900 p-3 rounded text-sm font-mono text-white">
              "You worked 12 hours? You <span className="text-purple-400 font-bold">must be</span> tired."
              <br />
              <span className="text-slate-500 text-xs italic">(Logique : Tu dois être fatigué.)</span>
            </div>
          </div>

          <div className="bg-red-900/20 p-5 rounded-xl border-l-4 border-red-500">
            <h3 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">⚡</span> Le Piège de la Déduction Négative
            </h3>
            <p className="text-slate-200 mb-2">
              Si vous êtes sur que c'est **FAUX**, n'utilisez jamais "Mustn't".
              <br />
              Utilisez <strong className="text-red-400">CAN'T</strong>.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-red-500">❌</span>
                <span className="text-slate-400 line-through">"It mustn't be true."</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">✅</span>
                <span className="text-white">"It <strong className="text-red-400">can't</strong> be true."</span>
                <span className="text-slate-500 text-xs self-center">(Ça ne peut pas être vrai).</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "3. Le Contresens Absolu (Négation)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-950 p-6 rounded-xl border border-red-600 shadow-lg shadow-red-900/20">
            <h3 className="text-red-500 font-black text-xl flex items-center gap-3 uppercase mb-4">
              <span className="text-3xl">☠️</span> Danger Critique
            </h3>
            <p className="text-slate-100 text-lg mb-6">
              À la forme affirmative, <em>Must</em> et <em>Have to</em> sont proches.
              <br />
              MAIS à la forme négative, <strong>ILS SONT OPPOSÉS</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MUSTN'T */}
              <div className="bg-red-900/40 p-5 rounded-lg border border-red-500 flex flex-col items-center text-center">
                <div className="text-5xl mb-3">⛔</div>
                <h4 className="text-white font-black text-xl uppercase mb-2">MUSTN'T</h4>
                <p className="text-red-300 font-bold">C'est INTERDIT !</p>
                <p className="text-slate-300 text-sm mt-3 border-t border-red-500/50 pt-3 w-full">
                  "You mustn't smoke."
                  <br />
                  <span className="italic text-slate-400">= Don't do it!</span>
                </p>
              </div>

              {/* DON'T HAVE TO */}
              <div className="bg-emerald-900/40 p-5 rounded-lg border border-emerald-500 flex flex-col items-center text-center">
                <div className="text-5xl mb-3">🤷</div>
                <h4 className="text-white font-black text-xl uppercase mb-2">DON'T HAVE TO</h4>
                <p className="text-emerald-300 font-bold">Ce n'est PAS nécessaire.</p>
                <p className="text-slate-300 text-sm mt-3 border-t border-emerald-500/50 pt-3 w-full">
                  "You don't have to pay."
                  <br />
                  <span className="italic text-slate-400">= ou "You needn't pay".</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded mt-6 text-center">
              <p className="text-slate-400 text-xs mb-2">
                <span className="text-amber-400 font-bold">Note Orale :</span> "I have got to go" (ou "I've gotta go") est très courant pour dire "I have to go".
              </p>
              <p className="text-white text-sm">
                <span className="text-red-500 font-bold">RAPPEL :</span> "You mustn't pay" = Interdit de payer. "You don't have to pay" = Gratuit.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Le Juge de l'Obligation"
          questions={[
            {
              id: 1,
              question: "It's a secret. You ___ tell anyone.",
              options: ["mustn't", "don't have to", "haven't to", "must not to"],
              correctAnswer: 0,
              explanation: "Interdiction formelle (Secret). ➔ MUSTN'T.",
            },
            {
              id: 2,
              question: "Look at his Ferrari. He ___ be rich!",
              options: ["must", "has to", "can", "mustn't"],
              correctAnswer: 0,
              explanation: "DÉDUCTION LOGIQUE (Sherlock). Ce n'est pas une obligation, c'est une quasi-certitude. ➔ HE MUST BE RICH.",
            },
            {
              id: 3,
              question: "You ___ come if you don't want to. It's optional.",
              options: ["mustn't", "don't have to", "haven't to", "must not"],
              correctAnswer: 1,
              explanation: "Absence d'obligation (C'est ton choix). ➔ DON'T HAVE TO (ou Needn't).",
            },
            {
              id: 4,
              question: "She is running a marathon? But her leg is broken! It ___ be true.",
              options: ["mustn't", "can't", "doesn't have to", "shouldn't"],
              correctAnswer: 1,
              explanation: "DÉDUCTION NÉGATIVE (Impossible). On n'utilise jamais Mustn't pour dire 'C'est impossible'. On utilise CAN'T.",
            },
            {
              id: 5,
              question: "Yesterday, I ___ work late.",
              options: ["must", "had to", "have to", "musted"],
              correctAnswer: 1,
              explanation: "Passé. Must n'existe pas au passé. Il faut utiliser HAD TO.",
            },
            {
              id: 6,
              question: "Entrance is free. You ___ pay.",
              options: ["mustn't", "needn't", "cannot", "won't"],
              correctAnswer: 1,
              explanation: "Absence de nécessité. NEEDN'T est un synonyme chic de 'Don't have to'.",
            },
            {
              id: 7,
              question: "Passengers ___ wear seat belts. (Panneau officiel)",
              options: ["have to", "must", "can", "will"],
              correctAnswer: 1,
              explanation: "Instruction écrite/règlement officiel. Sur les panneaux, MUST est utilisé pour l'autorité directe.",
            },
            {
              id: 8,
              question: "Tomorrow, I ___ get up early.",
              options: ["must", "will must", "will have to", "had to"],
              correctAnswer: 2,
              explanation: "Futur. Must n'a pas de futur. WILL HAVE TO.",
            },
            {
              id: 9,
              question: "She ___ wear a uniform at work.",
              options: ["musts", "has to", "have to", "must"],
              correctAnswer: 1,
              explanation: "Règle externe (Travail) + 3e personne. Must est invariable. 'Has to' est la bonne conjugaison.",
            },
            {
              id: 10,
              question: "I have a toothache. I ___ see a dentist.",
              options: ["have to", "must", "can", "don't have to"],
              correctAnswer: 1,
              explanation: "Obligation interne (Ressenti personnel). MUST.",
            },
          ]}
        />
      )
    }
  ]
};