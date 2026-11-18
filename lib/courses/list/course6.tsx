import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course6: LessonContent = {
  courseNumber: 6,
  title: "La Négation (Don't / Doesn't / Not)",
  objective: "Maîtriser la mécanique du NON (et le piège de Never).",
  sections: [
    {
      title: "Dire non avec le bon verbe",
      content: (
        <LessonExamples
          examples={[
            { english: "She isn’t at work.", meaning: "Elle n’est pas au travail." },
            { english: "She doesn’t work on Sundays.", meaning: "Elle ne travaille pas le dimanche." },
          ]}
        >
          Pour une phrase négative, repère d’abord le verbe. Avec be ou can, ajoute not. Avec la plupart des autres verbes au présent simple, utilise don’t ou doesn’t.
        </LessonExamples>
      )
    },
    {
      title: "Catégorie 1 : Les Verbes Autonomes (Be, Can)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Ces verbes sont à la fois des verbes et des auxiliaires. Ils possèdent la capacité technique de porter la négation eux-mêmes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BE */}
            <div className="bg-slate-800 border-l-4 border-cyan-500 p-4 rounded-r-xl">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-cyan-400 font-bold uppercase text-sm">To Be</h4>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                  <span className="text-white">I am <span className="text-slate-500">+</span> <span className="text-red-400">NOT</span></span>
                  <span className="text-cyan-300 font-bold">I'm NOT</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                  <span className="text-white">She is <span className="text-slate-500">+</span> <span className="text-red-400">NOT</span></span>
                  <span className="text-cyan-300 font-bold">She ISN'T</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                  <span className="text-white">They are <span className="text-slate-500">+</span> <span className="text-red-400">NOT</span></span>
                  <span className="text-cyan-300 font-bold">They AREN'T</span>
                </div>
              </div>
            </div>

            {/* CAN */}
            <div className="bg-slate-800 border-l-4 border-purple-500 p-4 rounded-r-xl">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-purple-400 font-bold uppercase text-sm">Can (Modal)</h4>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                  <span className="text-white">I can <span className="text-slate-500">+</span> <span className="text-red-400">NOT</span></span>
                  <span className="text-purple-300 font-bold">I CAN'T</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                  <span className="text-white">He can <span className="text-slate-500">+</span> <span className="text-red-400">NOT</span></span>
                  <span className="text-purple-300 font-bold">He CAN'T</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Catégorie 2 : Les Verbes Dépendants (Lexicaux)",
      content: (
        <div className="space-y-8">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            La majorité des verbes (Work, Play, Eat, Live...) sont des verbes <span className="text-white font-bold">lexicaux</span>. Ils servent uniquement à donner du sens. Ils n'ont pas de fonction grammaticale. <br />
            On doit donc injecter l'auxiliaire <span className="text-amber-400 font-bold">DO</span> pour réaliser la négation.
          </p>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
            {/* DO + NOT */}
            <div className="flex flex-col gap-2">
              <p className="text-slate-400 text-xs uppercase font-bold">Cas Standard (I, You, We, They)</p>
              <div className="flex items-center gap-2 font-mono text-lg bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <span className="text-amber-400">DO</span>
                <span className="text-slate-600">+</span>
                <span className="text-red-400">NOT</span>
                <span className="text-slate-600">=</span>
                <span className="text-white font-bold">DON'T</span>
              </div>
              <p className="text-slate-500 text-sm ml-4">➔ "I <span className="text-white">don't</span> want this."</p>
            </div>

            {/* DOES + NOT */}
            <div className="flex flex-col gap-2">
              <p className="text-slate-400 text-xs uppercase font-bold">3e personne (She, He, It)</p>
              <div className="flex items-center gap-2 font-mono text-lg bg-slate-900 p-3 rounded border-l-4 border-amber-500">
                <span className="text-amber-400">DOES</span>
                <span className="text-slate-600">+</span>
                <span className="text-red-400">NOT</span>
                <span className="text-slate-600">=</span>
                <span className="text-white font-bold">DOESN'T</span>
              </div>
              <p className="text-slate-500 text-sm ml-4">➔ "She <span className="text-white">doesn't</span> work here."</p>
            </div>
          </div>

          <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex gap-4 items-start">
            <div className="font-bold text-indigo-400 text-xl">ℹ️</div>
            <div>
              <p className="text-indigo-300 font-bold text-sm uppercase mb-1">Point de vigilance</p>
              <p className="text-slate-300 text-sm">
                L'auxiliaire <strong>DOES</strong> capture déjà la marque de la 3e personne ("S"). <br />
                Le verbe lexical reste donc à sa forme de base (Infinitif sans To).
                <br /><span className="text-red-400 line-through text-xs mt-1 block">She doesn't plays</span> (Incorrect)
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Cas Particulier : L'Absence (Ne pas avoir)",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-purple-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg text-slate-100 leading-relaxed font-medium text-balance">
              Pour exprimer l'absence de quelque chose (ex. : <span className="italic">"Il n'a pas de lunettes"</span>), nous retrouvons la logique des deux écoles (comme pour les questions).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option 1: Modern */}
            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-amber-500 flex flex-col items-center text-center">
              <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-2">Option 1 : Moderne (Standard)</p>
              <p className="text-slate-400 text-xs mb-4">On utilise l'opérateur DO (Verbe Lexical).</p>

              <div className="bg-slate-900 p-4 rounded-lg w-full mb-3">
                <p className="text-white font-mono text-lg">
                  He <span className="text-amber-400 font-bold">doesn't</span> have glasses.
                </p>
              </div>
              <p className="text-emerald-400 text-xs">Recommended for learners 👍</p>
            </div>

            {/* Option 2: Traditional */}
            <div className="bg-slate-800 p-6 rounded-xl border-t-4 border-purple-500 flex flex-col items-center text-center">
              <p className="text-purple-400 font-bold text-sm uppercase tracking-wider mb-2">Option 2 : Traditionnelle (Got)</p>
              <p className="text-slate-400 text-xs mb-4">On utilise l'opérateur HAVE (Auxiliaire).</p>

              <div className="bg-slate-900 p-4 rounded-lg w-full mb-3">
                <p className="text-white font-mono text-lg">
                  He <span className="text-purple-400 font-bold">hasn't</span> got glasses.
                </p>
              </div>
              <p className="text-slate-500 text-xs">Plus courant à l'oral / British 🇬🇧</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-red-900/20 p-3 rounded border border-red-500/20">
            <span className="text-red-500 font-bold">⛔ INTERDIT :</span>
            <span className="text-slate-300 line-through decoration-red-500">He hasn't glasses.</span>
            <span className="text-slate-500 text-sm">(Archaïque)</span>
          </div>
        </div>
      )
    },
    {
      title: "Never suffit à exprimer « jamais »",
      content: (
        <LessonExamples
          examples={[
            { english: "My grandmother never uses her phone at dinner.", meaning: "Ma grand-mère n’utilise jamais son téléphone pendant le dîner." },
            { english: "She is never late.", meaning: "Avec be, never vient ici après is." },
          ]}
        >
          Never est un adverbe de fréquence à sens négatif. En anglais standard, il donne déjà un sens négatif à la phrase.
        </LessonExamples>
      )
    },
    {
      title: "Niveau 4 : Usage Réel (Short Answers & Impératif)",
      content: (
        <div className="space-y-8">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Dans la vraie vie, on répète rarement toute la phrase. Mais dire juste "No" est souvent perçu comme sec ou impoli. Les anglophones utilisent des <strong>Réponses Courtes</strong>.
          </p>

          {/* Short Answers */}
          <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-cyan-500">
            <h4 className="text-cyan-400 font-bold uppercase mb-4 flex items-center gap-2">
              <span className="text-2xl">💬</span> L'Art de répondre "Non"
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-slate-400 text-xs uppercase">Question</p>
                <p className="text-white italic">"Do you like coffee?"</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-400 text-xs uppercase">Réponse Courte</p>
                <div className="font-mono text-lg">
                  <span className="text-red-400">No</span>, I <span className="text-amber-400 font-bold">don't</span>.
                </div>
                <p className="text-slate-500 text-xs">(Au lieu de "No, I don't like coffee")</p>
              </div>

              <div className="w-full h-px bg-slate-700 md:col-span-2 my-2"></div>

              <div className="flex flex-col gap-1">
                <p className="text-slate-400 text-xs uppercase">Question</p>
                <p className="text-white italic">"Is she ready?"</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-400 text-xs uppercase">Réponse Courte</p>
                <div className="font-mono text-lg">
                  <span className="text-red-400">No</span>, she <span className="text-cyan-400 font-bold">isn't</span>.
                </div>
              </div>
            </div>
          </div>

          {/* Imperative */}
          <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-red-500 mt-6">
            <h4 className="text-red-400 font-bold uppercase mb-4 flex items-center gap-2">
              <span className="text-2xl">🛑</span> L'Ordre Négatif (Impératif)
            </h4>
            <p className="text-slate-300 mb-4">
              Pour donner un ordre négatif ("Ne fais pas ça !"), c'est très simple : on utilise toujours <strong className="text-amber-400">DON'T</strong> au début de la phrase. Même pour une seule personne.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-slate-900 p-3 rounded text-center flex-1">
                <p className="text-white font-mono text-lg"><span className="text-amber-400 font-bold">Don't</span> touch!</p>
              </div>
              <div className="bg-slate-900 p-3 rounded text-center flex-1">
                <p className="text-white font-mono text-lg"><span className="text-amber-400 font-bold">Don't</span> worry.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded text-center flex-1">
                <p className="text-white font-mono text-lg"><span className="text-amber-400 font-bold">Don't</span> be late.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quiz · Former une négation",
      content: (
        <Quiz
          title="Teste la négation"
          questions={[
            {
              id: 1,
              question: "I ___ like spinach.",
              options: ["no", "don't", "doesn't", "not"],
              correctAnswer: 1,
              explanation: "Avec I et un verbe comme like, utilise don’t pour former la négation au présent.",
            },
            {
              id: 2,
              question: "She ___ happy today.",
              options: ["doesn't", "don't", "isn't", "not"],
              correctAnswer: 2,
              explanation: "Adjectif 'happy' ➔ Besoin de BE. She is not ➔ She ISN'T.",
            },
            {
              id: 3,
              question: "He ___ play tennis anymore.",
              options: ["doesn't", "don't", "isn't", "not"],
              correctAnswer: 0,
              explanation: "Avec he, la négation se forme avec doesn’t. Play garde sa base.",
            },
            {
              id: 4,
              question: "They ___ speak Spanish.",
              options: ["aren't", "don't", "doesn't", "no"],
              correctAnswer: 1,
              explanation: "Avec they, utilise don’t devant speak.",
            },
            {
              id: 5,
              question: "Elle ne mange jamais de viande. She ___ eats meat.",
              options: ["doesn't", "never", "don't", "no"],
              correctAnswer: 1,
              explanation: "Never exprime déjà la négation. Le verbe eats garde le -s de la troisième personne.",
            },
            {
              id: 6,
              question: "You ___ smoke here. It's forbidden.",
              options: ["don't", "cannot", "no", "not"],
              correctAnswer: 1,
              explanation: "Interdiction physique/règle ➔ CANNOT / CAN'T.",
            },
            {
              id: 7,
              question: "John and Sarah ___ coming to the party.",
              options: ["don't", "doesn't", "aren't", "isn't"],
              correctAnswer: 2,
              explanation: "Coming (ING) ➔ Be. John and Sarah = They. ➔ They AREN'T.",
            },
            {
              id: 8,
              question: "It ___ matter.",
              options: ["don't", "isn't", "not", "doesn't"],
              correctAnswer: 3,
              explanation: "Expression classique. It (3e pers.) + matter (verbe importer / compter). ➔ It DOESN'T matter.",
            },
            {
              id: 9,
              question: "I ___ got any money.",
              options: ["don't", "haven't", "am not", "doesn't"],
              correctAnswer: 1,
              explanation: "Présence de 'Got' ➔ Have est auxiliaire. I have not got ➔ I HAVEN'T got.",
            },
            {
              id: 10,
              question: "She ___ have a car.",
              options: ["hasn't", "doesn't", "don't", "is not"],
              correctAnswer: 1,
              explanation: "Pas de 'Got' ➔ Have est verbe faible. She DOESN'T have.",
            },
          ]}
        />
      ),
    },
  ],
};
