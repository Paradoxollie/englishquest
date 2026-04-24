import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course3: LessonContent = {
  courseNumber: 3,
  title: "La Routine et les Faits (Present Simple)",
  objective: "Parler de ses habitudes et des vérités générales.",
  sections: [
    {
      title: "Introduction",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-emerald-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium text-balance">
              Le <span className="text-cyan-400 font-bold">Present Simple</span> n'est pas "simple" au sens de facile, mais au sens de <span className="text-white font-bold uppercase tracking-wider">PUR</span>. C'est le temps des vérités permanentes et de la routine.
            </p>

            <div className="mt-6 bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border border-amber-500/30">L'autre côté du miroir</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-balance">
                Revenons à notre piège français <span className="text-white italic">"Je mange"</span>. Ici, on s'intéresse à la <strong>fréquence</strong> et à la <strong>permanence</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-cyan-950/30 p-3 rounded-lg border border-cyan-500/30 relative overflow-hidden opacity-50">
                  <p className="text-cyan-200 text-sm mb-1">Sens 1 : L'action actuelle</p>
                  <p className="text-white font-medium">"Je mange (la)."</p>
                  <p className="text-cyan-400 text-xs mt-1 font-mono">I am eating (Non)</p>
                </div>
                <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-500/30 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
                  <p className="text-emerald-200 text-sm mb-1 font-bold">Sens 2 : L'habitude / La Vérité</p>
                  <p className="text-white font-black text-lg">"Je mange (tous les jours)."</p>
                  <p className="text-emerald-400 text-xs mt-1 font-mono">Present Simple (I eat)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "1. La Formule (Formation)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            C'est la forme la plus pure du verbe. Pas de "BE", pas de "ING". Juste le sujet et le verbe.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: "Affirmation (+)", formula: "I work", sub: "Simple et efficace", color: "emerald" },
              { type: "Négation (-)", formula: "I don't work", sub: "Besoin de l'assistant DO", color: "red" },
              { type: "Question (?)", formula: "Do I work ?", sub: "L'assistant DO passe devant", color: "cyan" }
            ].map((item, idx) => (
              <div key={idx} className={`h-full bg-slate-800/60 border border-${item.color}-500/30 rounded-xl p-6 hover:border-${item.color}-500 transition-all duration-300 group shadow-lg flex flex-col items-center text-center`}>
                <div className={`text-${item.color}-400 text-xs font-bold uppercase tracking-widest mb-3 border-b border-${item.color}-500/30 pb-1 w-full`}>{item.type}</div>
                <div className="bg-slate-900/40 rounded-lg p-4 w-full flex-1 flex flex-col items-center justify-center gap-2">
                  <span className="text-white font-black text-xl md:text-2xl tracking-wide text-balance">{item.formula}</span>
                  <span className="text-slate-500 text-xs italic">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "2. La Règle d'Or : Danger à la 3ème Personne",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 border-l-4 border-amber-500 rounded-r-xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-visible group">

            <div className="shrink-0 flex items-start md:pt-1">
              <div className="bg-amber-600 p-3 rounded-xl shadow-lg shadow-amber-900/20 group-hover:scale-110 transition-transform duration-300 ring-4 ring-amber-600/20">
                <AlertIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-white text-2xl mb-3 tracking-tight">Le Super S 🐍</h4>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 text-balance">
                Avec <strong className="text-amber-400">He / She / It</strong>, le verbe change. Il "siffle". Il faut <strong className="text-white uppercase">TOUJOURS</strong> ajouter un "S". C'est l'erreur n°1 des francophones.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                  <p className="text-red-400 font-bold text-xs uppercase mb-2">Erreur Fatale</p>
                  <ul className="space-y-2 font-mono text-sm text-slate-400">
                    <li className="line-through decoration-red-500/50 opacity-70">He work every day.</li>
                    <li className="line-through decoration-red-500/50 opacity-70">She like chocolate.</li>
                    <li className="line-through decoration-red-500/50 opacity-70">It start at 8PM.</li>
                  </ul>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                  <p className="text-emerald-400 font-bold text-xs uppercase mb-2">Le Bon Sifflement</p>
                  <ul className="space-y-2 font-medium text-white">
                    <li className="flex items-center gap-2">He <span className="text-amber-400 font-bold">works</span> every day.</li>
                    <li className="flex items-center gap-2">She <span className="text-amber-400 font-bold">likes</span> chocolate.</li>
                    <li className="flex items-center gap-2">It <span className="text-amber-400 font-bold">starts</span> at 8PM.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Spelling Rules for S */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded text-sm">Le Standard</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">On ajoute juste S.</p>
              <div className="mt-auto bg-slate-900/50 p-3 rounded-lg font-mono text-sm">
                Work ➔ Works<br />Play ➔ Plays
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-purple-500/20 text-purple-400 font-bold px-2 py-1 rounded text-sm">Les Siffleurs (O, S, X, CH, SH)</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Si ça siffle déjà ou finit en O, on met <span className="text-white font-bold">ES</span> pour respirer.</p>
              <div className="mt-auto bg-slate-900/50 p-3 rounded-lg font-mono text-sm">
                Go ➔ Go<span className="text-purple-400 font-bold">es</span><br />Watch ➔ Watch<span className="text-purple-400 font-bold">es</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/50 transition-colors h-full flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-cyan-500/20 text-cyan-400 font-bold px-2 py-1 rounded text-sm">Le Y Consonne</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Consonne + Y ? Le Y devient <span className="text-white font-bold">IES</span>.</p>
              <div className="mt-auto bg-slate-900/50 p-3 rounded-lg font-mono text-sm">
                Cry ➔ Cr<span className="text-cyan-400 font-bold">ies</span><br />Fly ➔ Fl<span className="text-cyan-400 font-bold">ies</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "3. La Fréquence (Les Indices)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Ce temps est le meilleur ami des adverbes de fréquence. Ils indiquent la répétion.
          </p>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 text-right font-bold text-emerald-400 text-sm">100%</div>
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full"></div>
                </div>
                <div className="w-24 font-bold text-white text-sm">Always</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-right font-bold text-emerald-300 text-sm">80%</div>
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/80 w-[80%]"></div>
                </div>
                <div className="w-24 font-bold text-slate-200 text-sm">Usually</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-right font-bold text-cyan-400 text-sm">60%</div>
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[60%]"></div>
                </div>
                <div className="w-24 font-bold text-slate-200 text-sm">Often</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-right font-bold text-indigo-400 text-sm">40%</div>
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[40%]"></div>
                </div>
                <div className="w-24 font-bold text-slate-200 text-sm">Sometimes</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-right font-bold text-amber-400 text-sm">10%</div>
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[10%]"></div>
                </div>
                <div className="w-24 font-bold text-slate-200 text-sm">Rarely</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 text-right font-bold text-red-400 text-sm">0%</div>
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden border border-red-500/20">
                  {/* Empty */}
                </div>
                <div className="w-24 font-bold text-white text-sm">Never</div>
              </div>
            </div>
            <p className="text-center text-slate-400 text-sm mt-4 italic">
              Position : Toujours <strong className="text-white">AVANT</strong> le verbe (I <span className="text-emerald-400">always</span> eat), mais <strong className="text-white">APRÈS</strong> BE (I am <span className="text-emerald-400">always</span> late).
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Mission : La Vérité"
          questions={[
            {
              id: 1,
              question: "She ___ (play) tennis every Sunday.",
              options: ["play", "plays", "is playing", "playing"],
              correctAnswer: 1,
              explanation: "Every Sunday = Habitude ➔ Present Simple. She = 3e personne ➔ Plays (avec S).",
            },
            {
              id: 2,
              question: "Water ___ at 100 degrees.",
              options: ["boil", "boils", "is boiling", "boiling"],
              correctAnswer: 1,
              explanation: "C'est une vérité scientifique générale. Water = It ➔ Boils.",
            },
            {
              id: 3,
              question: "I ___ usually wake up early.",
              options: ["don't", "doesn't", "not", "am not"],
              correctAnswer: 0,
              explanation: "Négation au présent simple avec 'I' ➔ Don't.",
            },
            {
              id: 4,
              question: "Que fait 'He' avec le verbe 'Watch' ?",
              options: ["He watchs", "He watchies", "He watches", "He watch"],
              correctAnswer: 2,
              explanation: "Watch finit par CH (son chuintant) ➔ on ajoute ES pour la prononciation ➔ Watches.",
            },
            {
              id: 5,
              question: "___ you speak English?",
              options: ["Are", "Do", "Does", "Is"],
              correctAnswer: 1,
              explanation: "Pour poser une question au présent simple (sauf BE), on utilise l'auxiliaire DO.",
            },
            {
              id: 6,
              question: "He ___ (try) very hard.",
              options: ["trys", "tries", "tryes", "trying"],
              correctAnswer: 1,
              explanation: "Try finit par consonne + Y. Le Y devient IES ➔ Tries.",
            },
            {
              id: 7,
              question: "Where ___ she live?",
              options: ["do", "does", "is", "are"],
              correctAnswer: 1,
              explanation: "She est une 3e personne. L'auxiliaire DO prend le S et devient DOES.",
            },
            {
              id: 8,
              question: "I ___ never late.",
              options: ["am", "do", "have", "go"],
              correctAnswer: 0,
              explanation: "Piège ! Late est un adjectif. Il faut le verbe Être. I AM late. Never se place après BE.",
            },
            {
              id: 9,
              question: "They ___ (go) to school by bus.",
              options: ["goes", "go", "are going", "going"],
              correctAnswer: 1,
              explanation: "They (pluriel) ➔ le verbe ne change pas. Go.",
            },
            {
              id: 10,
              question: "The sun ___ in the West.",
              options: ["don't rise", "doesn't rises", "doesn't rise", "isn't rising"],
              correctAnswer: 2,
              explanation: "Vérité générale (négative ici, le soleil ne se lève pas à l'Ouest). The Sun = It ➔ Doesn't + Base verbale (Rise).",
            },
          ]}
        />
      ),
    },
  ],
};
