import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course18: LessonContent = {
  courseNumber: 18,
  title: "Comparaisons & Superlatifs",
  objective: "Maîtriser les degrés de l'adjectif.",
  sections: [
    {
      title: "Introduction : Les Degrés de Comparaison",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-300">
            Pour comparer des éléments ou définir un extrême, l'anglais utilise trois degrés :
          </p>
          <ul className="list-disc ml-6 space-y-2 text-slate-300">
            <li>Le Comparatif de <span className="text-emerald-400 font-bold">Supériorité</span> (+) : <em>Plus ... que</em></li>
            <li>Le Comparatif d'<span className="text-purple-400 font-bold">Égalité</span> (=) : <em>Aussi ... que</em></li>
            <li>Le Comparatif d'<span className="text-red-400 font-bold">Infériorité</span> (-) : <em>Moins ... que</em></li>
            <li>Le <span className="text-yellow-400 font-bold">Superlatif</span> (Top) : <em>Le plus ...</em></li>
          </ul>
        </div>
      )
    },
    {
      title: "1. Comparatif de Supériorité (+)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            La règle dépend de la longueur de l'adjectif (nombre de syllabes).
          </p>

          <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-emerald-500">
            <h4 className="text-emerald-400 font-bold mb-2">A. Adjectifs Courts (1 syllabe)</h4>
            <p className="text-slate-200 mb-3">
              Pour ces adjectifs, on ajoute simplement <span className="font-bold text-white">-ER</span> à la fin du mot.
            </p>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="bg-black/20 p-2 rounded">
                <p className="mb-1">Pour <strong>Tall</strong> (Grand), on écrit <span className="text-emerald-400 font-bold">Taller</span> (Plus grand).</p>
                <p className="text-white italic">"My brother is <span className="text-emerald-400 font-bold">taller</span> <span className="text-yellow-400 font-bold">than</span> me."</p>
              </li>
              <li className="bg-black/20 p-2 rounded">
                <p className="mb-1">Pour <strong>Fast</strong> (Rapide), on écrit <span className="text-emerald-400 font-bold">Faster</span> (Plus rapide).</p>
                <p className="text-white italic">"A plane is <span className="text-emerald-400 font-bold">faster</span> <span className="text-yellow-400 font-bold">than</span> a car."</p>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-blue-400 font-bold mb-2">B. Adjectifs Longs (2 syllabes ou plus)</h4>
            <p className="text-slate-200 mb-3">
              L'adjectif est trop long pour être modifié. On ajoute <span className="font-bold text-white">MORE</span> devant l'adjectif.
            </p>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="bg-black/20 p-2 rounded">
                <p className="mb-1">Pour <strong>Modern</strong> (Moderne), on dit <span className="text-blue-400 font-bold">More modern</span> (Plus moderne).</p>
                <p className="text-white italic">"London is <span className="text-blue-400 font-bold">more modern</span> <span className="text-yellow-400 font-bold">than</span> Oxford."</p>
              </li>
              <li className="bg-black/20 p-2 rounded">
                <p className="mb-1">Pour <strong>Expensive</strong> (Cher), on dit <span className="text-blue-400 font-bold">More expensive</span> (Plus cher).</p>
                <p className="text-white italic">"This hotel is <span className="text-blue-400 font-bold">more expensive</span> <span className="text-yellow-400 font-bold">than</span> the hostel."</p>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
            <h4 className="text-white font-bold mb-2 text-sm uppercase">Règles Orthographiques Précises :</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li><strong className="text-yellow-400">Règle CVC :</strong> Si l'adjectif finit par Consonne-Voyelle-Consonne, on double la dernière lettre.<br />Ex: Pour <strong>Big</strong>, on écrit <span className="underline">Bi<strong>gg</strong>er</span>.</li>
              <li><strong className="text-yellow-400">Règle du Y :</strong> Si l'adjectif finit par Y, le Y se transforme en <strong className="text-white">I</strong>.<br />Ex: Pour <strong>Happy</strong>, on écrit <span className="underline">Happ<strong>i</strong>er</span>.</li>
            </ul>
          </div>

          <div className="bg-red-900/40 p-3 rounded text-center">
            <p className="text-red-300 text-sm font-bold mb-1">LES 3 IRRÉGULIERS À CONNAÎTRE :</p>
            <div className="flex justify-center gap-6 text-sm">
              <span>Good ➔ <strong>Better</strong></span>
              <span>Bad ➔ <strong>Worse</strong></span>
              <span>Far ➔ <strong>Further</strong></span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Comparatif d'Égalité (=)",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-900/30 p-5 rounded-xl border border-purple-500">
            <h3 className="text-purple-400 font-bold text-xl mb-4">AS ... AS</h3>
            <p className="text-slate-200 mb-4">
              Structure invariable, quelle que soit la longueur de l'adjectif.
            </p>
            <div className="bg-slate-900 p-3 rounded text-center mb-4">
              <span className="text-purple-400 font-bold">AS</span> + <span className="text-white">ADJECTIF</span> + <span className="text-purple-400 font-bold">AS</span>
            </div>
            <p className="text-slate-300 text-sm">
              Ex : "She is <span className="text-purple-400">as</span> tall <span className="text-purple-400">as</span> you."
              <br />
              Ex : "It is <span className="text-purple-400">as</span> expensive <span className="text-purple-400">as</span> the other one."
            </p>
          </div>
        </div>
      )
    },
    {
      title: "3. Comparatif d'Infériorité (-)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">Il existe deux façons d'exprimer l'infériorité.</p>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-900 p-4 rounded border-l-4 border-orange-500">
              <h4 className="text-orange-400 font-bold mb-2">Forme 1 : La Négation (Préférée)</h4>
              <p className="text-slate-200 text-sm mb-2">
                C'est la forme la plus courante et naturelle. On utilise la structure de l'égalité au négatif.
              </p>
              <div className="bg-black/30 p-2 rounded text-center font-mono text-sm text-white mb-2">
                NOT AS ... AS
              </div>
              <p className="text-slate-400 text-xs">Ex: "He is <strong>not as</strong> old <strong>as</strong> me." (Il n'est pas aussi vieux que moi = Il est moins vieux).</p>
            </div>

            <div className="bg-slate-900 p-4 rounded border-l-4 border-slate-500">
              <h4 className="text-slate-300 font-bold mb-2">Forme 2 : Less ... than</h4>
              <p className="text-slate-200 text-sm mb-2">
                Plus spécifique. S'utilise principalement avec les adjectifs longs.
              </p>
              <div className="bg-black/30 p-2 rounded text-center font-mono text-sm text-white mb-2">
                LESS ... THAN
              </div>
              <p className="text-slate-400 text-xs">Ex: "It is <strong>less</strong> expensive <strong>than</strong> standard models." (C'est moins cher que...).</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Le Superlatif (Extrême)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Le superlatif désigne l'élément <strong>numéro 1</strong> d'un groupe. L'article <span className="text-yellow-400 font-bold">"THE"</span> est absolument OBLIGATOIRE car l'élément est unique.
          </p>

          <table className="w-full text-left text-sm text-slate-300 border-collapse mb-4">
            <thead>
              <tr className="border-b border-slate-600 text-slate-400">
                <th className="py-2">Type d'Adjectif</th>
                <th className="py-2">Construction</th>
                <th className="py-2">Exemple Complet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="py-3 font-semibold text-emerald-400">Adjectifs Courts</td>
                <td className="py-3"><span className="text-yellow-400">THE</span> ... -EST</td>
                <td className="py-3">"Jupiter is <strong>the bigg<span className="text-emerald-400">est</span></strong> planet."</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-blue-400">Adjectifs Longs</td>
                <td className="py-3"><span className="text-yellow-400">THE MOST</span> ...</td>
                <td className="py-3">"It is <strong>the most</strong> boring movie."</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-yellow-400">Adjectifs en -Y</td>
                <td className="py-3"><span className="text-yellow-400">THE</span> ...-IEST</td>
                <td className="py-3">"He is <strong>the happ<span className="text-yellow-400">iest</span></strong> man."</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-red-400">Adj. Irréguliers</td>
                <td className="py-3">THE BEST / WORST</td>
                <td className="py-3">"You are <strong>the best</strong> friend."</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
            <h4 className="text-purple-400 font-bold mb-2">La Précision du Contexte (IN vs OF)</h4>
            <p className="text-slate-200 text-sm mb-3">
              Après un superlatif, on précise souvent le groupe ou le lieu.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <strong className="text-white">IN</strong> + LIEU / GROUPE :
                <span className="italic block pl-4 text-slate-400">"The highest mountain <strong>in</strong> the world." (Pas "of the world")</span>
                <span className="italic block pl-4 text-slate-400">"The best student <strong>in</strong> the class."</span>
              </li>
              <li>
                <strong className="text-white">OF</strong> + PÉRIODE DE TEMPS :
                <span className="italic block pl-4 text-slate-400">"The happiest day <strong>of</strong> my life."</span>
                <span className="italic block pl-4 text-slate-400">"The hottest day <strong>of</strong> the year."</span>
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
          title="Grammaire Comparative"
          questions={[
            {
              id: 1,
              question: "Comparatif de Supériorité : Tall",
              options: ["Taller", "More tall", "Tallest", "The taller"],
              correctAnswer: 0,
              explanation: "Adjectif court (1 syllabe) -> -ER.",
            },
            {
              id: 2,
              question: "Comparatif de Supériorité : Interesting",
              options: ["Interestingler", "More interesting", "Most interesting", "So interesting"],
              correctAnswer: 1,
              explanation: "Adjectif long (4 syllabes) -> MORE intellingent.",
            },
            {
              id: 3,
              question: "Superlatif : Good",
              options: ["The goodest", "The best", "Best", "The most good"],
              correctAnswer: 1,
              explanation: "Irrégulier. Good -> The BEST. L'article THE est obligatoire.",
            },
            {
              id: 4,
              question: "Orthographe : Big (Comparatif)",
              options: ["Biger", "Bigger", "More big", "Bigest"],
              correctAnswer: 1,
              explanation: "CVC (Consonne-Voyelle-Consonne) -> On double la consonne finale. Bigger.",
            },
            {
              id: 5,
              question: "Orthographe : Heavy (Comparatif)",
              options: ["Heavyer", "Heavier", "More heavy", "Heavyer"],
              correctAnswer: 1,
              explanation: "Terminaison en Y -> IER. Heavier.",
            },
            {
              id: 6,
              question: "Infériorité : He is ___ intelligent as his brother.",
              options: ["not", "not as", "not so", "less"],
              correctAnswer: 1,
              explanation: "Structure 'Not as ... as'.",
            },
            {
              id: 7,
              question: "Comparatif : Bad",
              options: ["Badder", "Worse", "Worst", "More bad"],
              correctAnswer: 1,
              explanation: "Irrégulier. Bad -> Worse.",
            },
            {
              id: 8,
              question: "Superlatif : Expensive",
              options: ["The expensivest", "The most expensive", "Most expensive", "The more expensive"],
              correctAnswer: 1,
              explanation: "Adjectif long -> THE MOST expensive.",
            },
            {
              id: 9,
              question: "Equality : She is as ___ as me.",
              options: ["smart", "smarter", "smartest", "more smart"],
              correctAnswer: 0,
              explanation: "Comparatif d'égalité : L'adjectif reste invariable. As SMART as.",
            },
            {
              id: 10,
              question: "Comparatif : Far",
              options: ["Farer", "Further", "Farthest", "More far"],
              correctAnswer: 1,
              explanation: "Irrégulier. Far -> Further.",
            },
          ]}
        />
      )
    }
  ]
};