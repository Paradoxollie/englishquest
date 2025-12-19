import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course2: LessonContent = {
  courseNumber: 2,
  title: "L'Action en direct (Present Continuous)",
  objective: "Décrire ce qui se passe maintenant.",
  sections: [
    {
      title: "Introduction",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-indigo-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium text-balance">
              Le <span className="text-cyan-400 font-bold">Present Continuous</span> est le temps du <span className="text-white font-bold uppercase tracking-wider">DIRECT</span>. C'est l'équivalent précis de "être en train de".
            </p>

            <div className="mt-6 bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-amber-500/30">Le grand piège du français</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-balance">
                En français, <span className="text-white italic">"Je mange"</span> peut vouloir dire deux choses très différentes :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                  <p className="text-cyan-200 text-sm mb-1">Sens 1 : L'action actuelle</p>
                  <p className="text-white font-bold">"Je mange (maintenant)."</p>
                  <p className="text-cyan-400 text-xs mt-1 font-mono">Present Continuous (I am eating)</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">Sens 2 : L'habitude</p>
                  <p className="text-white font-medium">"Je mange à 8h."</p>
                  <p className="text-red-400 text-xs mt-1 font-mono">Present Simple (I eat)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "1. La Formule Magique (Formation)",
      content: (
        <div className="space-y-8">
          <div>
            <p className="text-slate-200 text-lg leading-relaxed text-balance mb-6">
              Pourquoi cette formule bizarre ? Décortiquons la logique pour ne plus jamais l'oublier :
            </p>

            {/* Decoder Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800/40 border-2 border-dashed border-indigo-500/30 rounded-xl p-5 flex flex-col items-center text-center relative">
                <div className="absolute -top-3 bg-slate-900 px-3 text-indigo-400 font-bold uppercase text-xs tracking-widest border border-indigo-500/30 rounded-full">L'Ancre</div>
                <span className="text-4xl font-black text-indigo-400 mb-2">BE</span>
                <p className="text-slate-300 text-sm">"Je suis..."</p>
                <p className="text-slate-400 text-xs mt-2 italic">Il connecte le sujet au moment présent.</p>
              </div>

              <div className="bg-slate-800/40 border-2 border-dashed border-cyan-500/30 rounded-xl p-5 flex flex-col items-center text-center relative">
                <div className="absolute -top-3 bg-slate-900 px-3 text-cyan-400 font-bold uppercase text-xs tracking-widest border border-cyan-500/30 rounded-full">L'Action</div>
                <span className="text-4xl font-black text-cyan-400 mb-2">ING</span>
                <p className="text-slate-300 text-sm">"...vivant / en cours"</p>
                <p className="text-slate-400 text-xs mt-2 italic">Il transforme le verbe en une activité active.</p>
              </div>
            </div>

            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 text-center">
              <p className="text-indigo-200 font-medium">
                <span className="text-white font-bold">I am working</span> = Littéralement "Je suis (actuellement) travaillant".
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-base font-semibold leading-6 text-slate-200">La Chronologie du Direct</span>
            </div>
          </div>

          {/* Timeline Visual */}
          <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 flex flex-col items-center relative overflow-hidden">
            {/* Line */}
            <div className="w-full h-1 bg-gradient-to-r from-slate-800 via-cyan-500 to-slate-800 rounded-full mb-2 opacity-50"></div>

            {/* Points */}
            <div className="flex justify-between w-full max-w-md relative z-10 px-4">
              <div className="flex flex-col items-center opacity-50">
                <div className="w-3 h-3 bg-slate-600 rounded-full mb-2"></div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Passé</span>
              </div>

              <div className="flex flex-col items-center relative">
                {/* Pulsing Effect */}
                <span className="absolute -top-1 w-6 h-6 bg-cyan-500/30 rounded-full animate-ping"></span>
                <div className="w-4 h-4 bg-cyan-400 rounded-full mb-2 shadow-[0_0_15px_rgba(34,211,238,0.8)] border-2 border-white"></div>
                <span className="text-sm text-cyan-400 font-bold uppercase tracking-widest">NOW</span>
              </div>

              <div className="flex flex-col items-center opacity-50">
                <div className="w-3 h-3 bg-slate-600 rounded-full mb-2"></div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Futur</span>
              </div>
            </div>

            <p className="mt-6 text-center text-slate-300 text-sm max-w-lg">
              On utilise <span className="text-cyan-400 font-bold">BE + ING</span> uniquement quand l'action traverse <strong className="text-white">ce point précis</strong> (NOW). Si c'est une habitude (tous les jours), c'est STOP, on change de temps !
            </p>
          </div>

          <p className="text-slate-200 text-lg leading-relaxed text-balance pt-4">
            Voici la formule sacrée à appliquer :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: "Affirmation (+)", formula: "I am working", color: "cyan" },
              { type: "Négation (-)", formula: "I am NOT working", color: "red" },
              { type: "Question (?)", formula: "Am I working ?", color: "emerald" }
            ].map((item, idx) => (
              <div key={idx} className={`h-full bg-slate-800/60 border border-${item.color}-500/30 rounded-xl p-6 hover:border-${item.color}-500 transition-all duration-300 group shadow-lg flex flex-col items-center text-center`}>
                <div className={`text-${item.color}-400 text-xs font-bold uppercase tracking-widest mb-3 border-b border-${item.color}-500/30 pb-1 w-full`}>{item.type}</div>
                <div className="bg-slate-900/40 rounded-lg p-4 w-full flex-1 flex items-center justify-center">
                  <span className="text-white font-black text-xl md:text-2xl tracking-wide text-balance leading-tight">{item.formula}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
              <p className="text-slate-400 text-sm mb-3">Verbe court (1 syllabe) fini par <span className="text-white">Consonne-Voyelle-Consonne</span> ? On double la finale !</p>
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
              <p className="text-slate-400 text-sm mb-3">Les verbes finis en "-ie" changent radicalement en "-y".</p>
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
      title: "Point de Vigilance : Les Verbes de Cœur et d'Esprit",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-950/80 to-slate-900 border-l-4 border-red-500 rounded-r-xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-visible group">

            <div className="shrink-0 flex items-start md:pt-1">
              <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform duration-300 ring-4 ring-red-600/20">
                <AlertIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-white text-2xl mb-3 tracking-tight">Interdit aux Sentiments 🚫</h4>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 text-balance">
                En anglais, on ne met <strong className="text-red-400 uppercase">JAMAIS</strong> de "-ing" aux verbes qui décrivent ce que vous ressentez, pensez, ou possédez. Ce sont des états, pas des actions actives.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                  <p className="text-red-400 font-bold text-xs uppercase mb-2">Ne dites jamais</p>
                  <ul className="space-y-2 font-mono text-sm text-slate-400">
                    <li className="line-through decoration-red-500/50 opacity-70">I am liking this movie.</li>
                    <li className="line-through decoration-red-500/50 opacity-70">I am understanding now.</li>
                    <li className="line-through decoration-red-500/50 opacity-70">He is having a car.</li>
                  </ul>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                  <p className="text-emerald-400 font-bold text-xs uppercase mb-2">Dites simplement</p>
                  <ul className="space-y-2 font-medium text-white">
                    <li className="flex items-center gap-2">I <span className="text-cyan-400 font-bold">like</span> this movie.</li>
                    <li className="flex items-center gap-2">I <span className="text-cyan-400 font-bold">understand</span> now.</li>
                    <li className="flex items-center gap-2">He <span className="text-cyan-400 font-bold">has</span> a car.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Validation des Connaissances",
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
              question: "Complétez : She ___ (watch) TV.",
              options: ["is watching", "are watching", "watches", "is watch"],
              correctAnswer: 0,
              explanation: "She (3ème pers.) + is + watching.",
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
              question: "Choisissez la forme correcte :",
              options: ["We are makeing a cake", "We are making a cake", "We is making a cake", "We making a cake"],
              correctAnswer: 1,
              explanation: "Make finit par E. On enlève le E avant d'ajouter ING ➔ Making. Et We 'are'.",
            },
            {
              id: 5,
              question: "Piège ! Je 'veux' un café.",
              options: ["I am wanting a coffee", "I want a coffee", "I wanting a coffee", "I am want a coffee"],
              correctAnswer: 1,
              explanation: "'Want' est un verbe de volonté (état). Jamais de ING ! On utilise le présent simple.",
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
              question: "Négation : Ils ne travaillent pas.",
              options: ["They not working", "They aren't working", "They don't working", "They isn't working"],
              correctAnswer: 1,
              explanation: "They are not ➔ They aren't working.",
            },
            {
              id: 8,
              question: "Pourquoi pas 'I am loving you' ?",
              options: ["C'est grammaticalement incorrect", "C'est possible chez McDo mais pas en grammaire pure", "Ça ne se dit pas", "Les trois réponses"],
              correctAnswer: 3,
              explanation: "Love est un verbe de sentiment. 'I'm lovin' it' est un slogan publicitaire, pas de l'anglais correct !",
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