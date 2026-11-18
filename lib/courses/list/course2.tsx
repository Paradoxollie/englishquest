import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course2: LessonContent = {
  courseNumber: 2,
  title: "L'Action en direct (Present Continuous)",
  objective: "Décrire une action en cours et une situation temporaire autour du présent.",
  sections: [
    {
      title: "Maintenant et ces jours-ci",
      content: (
        <LessonExamples
          examples={[
            { english: "I’m reading your message now.", meaning: "Tu as le message sous les yeux." },
            { english: "I’m reading a long novel this month.", meaning: "Le livre t’occupe ce mois-ci. Il peut être fermé en ce moment." },
          ]}
        >
          En français, « je lis » peut désigner ce que tu fais à cet instant ou le livre qui t’occupe ces jours-ci. Dans les deux situations, l’anglais peut employer le présent continu.
        </LessonExamples>
      ),
    },
    {
      title: "Former le présent continu",
      content: (
        <LessonExamples
          examples={[
            { english: "I am working. She is working. We are working.", meaning: "Avec I, on emploie am. Avec she, is. Avec we, are." },
            { english: "Are you working today?", meaning: "Tu travailles aujourd’hui ?" },
            { english: "My friends aren’t working this week.", meaning: "Mes amis ne travaillent pas cette semaine." },
          ]}
        >
          Accorde be avec le sujet, puis ajoute le verbe en -ing. Pour poser une question, place la forme de be devant le sujet.
        </LessonExamples>
      ),
    },
    {
      title: "2. Les Règles d'Orthographe (-ING)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed">
            La plupart du temps, on ajoute simplement <span className="text-cyan-300 font-bold">-ing</span>. Mais pour garder une prononciation fluide, il y a 3 exceptions logiques :
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Rule 1: Silent E */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded text-sm">Le "E" Muet</span>
              </div>
              <p className="text-slate-400 text-sm mb-3 text-balance">Si le verbe finit par un "e" qu'on n'entend pas, il disparaît.</p>
              <div className="mt-auto bg-slate-900/50 p-3 rounded-lg space-y-2 font-mono text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Make</span> <span className="text-amber-100">Mak<span className="text-amber-400 font-bold">ing</span></span></div>
                <div className="flex justify-between"><span className="text-slate-500">Dance</span> <span className="text-amber-100">Danc<span className="text-amber-400 font-bold">ing</span></span></div>
              </div>
            </div>

            {/* Rule 2: CVC */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-purple-500/20 text-purple-400 font-bold px-2 py-1 rounded text-sm">Le "CVC" (Double)</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Verbe court (1 syllabe) terminé par <span className="text-white">Consonne-Voyelle-Consonne</span> ? On double la finale !</p>
              <div className="mt-auto bg-slate-900/50 p-3 rounded-lg space-y-2 font-mono text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Run</span> <span className="text-purple-100">Run<span className="text-purple-400 font-bold underline decoration-2">n</span>ing</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Swim</span> <span className="text-purple-100">Swim<span className="text-purple-400 font-bold underline decoration-2">m</span>ing</span></div>
              </div>
            </div>

            {/* Rule 3: IE -> Y */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-cyan-500/20 text-cyan-400 font-bold px-2 py-1 rounded text-sm">Le "IE" Magique</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Les verbes terminés en "-ie" changent radicalement en "-y".</p>
              <div className="mt-auto bg-slate-900/50 p-3 rounded-lg space-y-2 font-mono text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Die</span> <span className="text-cyan-100">D<span className="text-cyan-400 font-bold">y</span>ing</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Lie</span> <span className="text-cyan-100">L<span className="text-cyan-400 font-bold">y</span>ing</span></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Un état ou une activité",
      content: (
        <LessonExamples
          examples={[
            { english: "I think this book is great.", meaning: "Tu donnes ton avis." },
            { english: "I’m thinking about the ending.", meaning: "Tu es en pleine réflexion sur la fin du livre." },
          ]}
        >
          Les verbes d’état comme know, want et believe se rencontrent généralement au présent simple dans leur sens habituel. Certains verbes changent de sens selon la situation.
        </LessonExamples>
      ),
    },
    {
      title: "Quiz · Décrire une action en cours",
      content: (
        <Quiz
          title="Mission : Le Direct"
          questions={[
            {
              id: 1,
              question: "Quelle phrase décrit une action en cours ?",
              options: ["I play tennis every Sunday", "I am playing tennis right now", "I played tennis yesterday", "I play tennis"],
              correctAnswer: 1,
              explanation: "'Right now' (maintenant) indique une action en cours ➔ Present Continuous.",
            },
            {
              id: 2,
              question: "Complète : Look! She ___ (watch) TV right now.",
              options: ["is watching", "are watching", "watches", "is watch"],
              correctAnswer: 0,
              explanation: "Look! et right now : action en cours. She (3e pers.) + is + watching.",
            },
            {
              id: 3,
              question: "Orthographe : Comment écrire 'Run' au continu ?",
              options: ["Runing", "Running", "Runnning", "Runeing"],
              correctAnswer: 1,
              explanation: "Run est court et finit par CVC ➔ On double le N ➔ Running.",
            },
            {
              id: 4,
              question: "Choisis la forme correcte :",
              options: ["We are makeing a cake", "We are making a cake", "We is making a cake", "We making a cake"],
              correctAnswer: 1,
              explanation: "Make finit par E. On enlève le E avant d'ajouter ING ➔ Making. Et We 'are'.",
            },
            {
              id: 5,
              question: "Piège ! Je 'veux' un café.",
              options: ["I am wanting a coffee", "I want a coffee", "I wanting a coffee", "I am want a coffee"],
              correctAnswer: 1,
              explanation: "'Want' est un verbe de volonté (état). Jamais de ING ! On utilise le present simple.",
            },
            {
              id: 6,
              question: "Question : ___ you ___ ?",
              options: ["Do / sleeping", "Are / sleeping", "Is / sleeping", "Are / sleep"],
              correctAnswer: 1,
              explanation: "Pour poser une question au continu : Auxiliaire BE (Are) + Sujet + V-ing.",
            },
            {
              id: 7,
              question: "Au téléphone, tu précises qu’ils ne sont pas en train de travailler. Quelle phrase convient ?",
              options: ["They not working", "They aren't working", "They don't working", "They isn't working"],
              correctAnswer: 1,
              explanation: "They are not ➔ They aren't working.",
            },
            {
              id: 8,
              question: "Pourquoi évite-t-on 'I am loving you' pour dire 'je t'aime' ?",
              options: ["Parce que love exprime généralement un état ou un sentiment", "Parce que le sujet I est interdit", "Parce que love n'existe pas", "Parce que am doit toujours être suivi de a"],
              correctAnswer: 0,
              explanation: "En anglais standard, pour un sentiment durable, on dit 'I love you'. Le continu peut exister dans des emplois très contextuels comme 'I'm loving this', mais ce n'est pas la forme de base.",
            },
            {
              id: 9,
              question: "Le verbe 'Die' (Mourir) au continu ?",
              options: ["Dieing", "Dying", "Diing", "Dyyng"],
              correctAnswer: 1,
              explanation: "Les verbes en -IE (Die, Lie, Tie) changent en -Ying. Die ➔ Dying.",
            },
            {
              id: 10,
              question: "Listen! The baby ___.",
              options: ["cries", "is crying", "cry", "are crying"],
              correctAnswer: 1,
              explanation: "'Listen!' (Écoute !) implique que l'action se passe maintenant.",
            },
          ]}
        />
      ),
    },
  ],
};
