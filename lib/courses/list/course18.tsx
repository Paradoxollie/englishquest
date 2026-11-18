import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

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
            Pour comparer des éléments ou définir un extrême, l'anglais utilise quatre structures :
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
      title: "Comparer deux choses",
      content: (
        <LessonExamples
          examples={[
            { english: "This bag is bigger than mine.", meaning: "Big double le g devant -er." },
            { english: "This route is more interesting.", meaning: "Avec interesting, utilise more." },
            { english: "She’s cleverer than me. She’s more clever than me.", meaning: "Les deux comparatifs existent avec clever. Happy donne happier." },
          ]}
        >
          Beaucoup d’adjectifs courts prennent -er. Les adjectifs longs emploient généralement more. Pour certains adjectifs de deux syllabes, deux formes existent.
        </LessonExamples>
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
      title: "Choisir dans un groupe",
      content: (
        <LessonExamples
          examples={[
            { english: "This is the quietest room in the hotel.", meaning: "C’est la chambre la plus calme de l’hôtel." },
            { english: "Maya is my best friend.", meaning: "Le possessif my détermine friend." },
            { english: "That’s our most expensive ticket.", meaning: "Our accompagne ici le groupe nominal." },
          ]}
          note={"Good donne better puis best. Bad donne worse puis worst."}
        >
          Le superlatif situe une personne ou une chose dans un groupe. On rencontre souvent the et aussi un possessif comme my ou our.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Comparer deux options",
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
              explanation: "Adjectif long (plusieurs syllabes) -> MORE interesting.",
            },
            {
              id: 3,
              question: "Complète avec le superlatif de good. She’s my ___ friend.",
              options: ["goodest", "best", "the best", "better"],
              correctAnswer: 1,
              explanation: "My détermine déjà friend. On dit my best friend.",
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
              options: ["Heavyer", "Heavier", "More heavy", "Heaviest"],
              correctAnswer: 1,
              explanation: "Terminaison en Y -> IER. Heavier.",
            },
            {
              id: 6,
              question: "Infériorité : He is ___ intelligent as his brother.",
              options: ["not", "not as", "so", "less"],
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
              question: "Un seul billet coûte plus que tous les autres. This is ___ ticket on sale.",
              options: ["the expensivest", "the most expensive", "more expensive", "the more expensive"],
              correctAnswer: 1,
              explanation: "On situe un billet dans tout le groupe avec the most expensive.",
            },
            {
              id: 9,
              question: "Égalité : She is as ___ as me.",
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
