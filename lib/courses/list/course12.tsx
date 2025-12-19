import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course12: LessonContent = {
  courseNumber: 12,
  title: "Le Past Continuous (Imparfait)",
  description: "Le décor de votre film.",
  icon: "🎥",
  difficulty: "Intermédiaire",
  objective: "Planter le décor et décrire des actions longues dans le passé.",
  sections: [
    {
      title: "Introduction : Le Décor vs L'Action",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-cyan-500">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              Si le <span className="text-amber-400 font-bold">Past Simple</span> est une photo (clic !), le <span className="text-cyan-400 font-bold">Past Continuous</span> est une vidéo.
              <br /><br />
              Il sert à planter le <strong className="text-white">DÉCOR</strong> de votre histoire. C'est l'arrière-plan, l'ambiance, ce qui était "en train de se passer" à un moment précis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col gap-3 border border-cyan-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">☁️</div>
              <h4 className="text-cyan-400 font-bold uppercase text-lg">Le Décor (Film)</h4>
              <p className="text-slate-300 text-sm">Action longue, ambiance, "en train de...".</p>
              <div className="mt-auto bg-slate-900 p-2 rounded text-center">
                <span className="text-white font-mono">I <span className="text-cyan-400 font-bold">was sleeping</span>...</span>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg flex flex-col gap-3 border border-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">⚡</div>
              <h4 className="text-amber-400 font-bold uppercase text-lg">L'Action (Photo)</h4>
              <p className="text-slate-300 text-sm">Soudaine, brève, coupe le décor.</p>
              <div className="mt-auto bg-slate-900 p-2 rounded text-center">
                <span className="text-white font-mono">...when you <span className="text-amber-400 font-bold">called</span>.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. La Logique Temporelle (Timeline)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            Visualisez le temps comme une ligne. Le Past Continuous est un <span className="text-cyan-400 font-bold">NUAGE</span> qui s'étend sur la durée. Le Past Simple est un <span className="text-amber-400 font-bold">ÉCLAIR</span> qui frappe à un instant T.
          </p>

          {/* TIMELINE VISUAL REUSED & ADAPTED */}
          <div className="relative h-32 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden">
            {/* The Timeline Line */}
            <div className="absolute h-1 w-full bg-slate-600"></div>

            {/* The Cloud (Past Continuous) */}
            <div className="absolute left-1/4 w-1/3 h-16 bg-cyan-500/20 rounded-full blur-md flex items-center justify-center border border-cyan-500/50">
              <span className="text-cyan-300 font-bold text-xs uppercase tracking-widest">Je dormais...</span>
            </div>

            {/* The Spark (Past Simple) */}
            <div className="absolute left-1/2 w-4 h-4 bg-amber-500 rotate-45 border-2 border-white z-10 shadow-[0_0_15px_rgba(245,158,11,1)]"></div>
            <div className="absolute left-1/2 top-20 -translate-x-1/2 text-amber-400 font-bold text-sm">
              Téléphone sonne
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-slate-300 text-sm italic">
              "I <span className="text-cyan-400 font-bold">was watching</span> TV (Le nuage dure...), when suddenly the phone <span className="text-amber-400 font-bold">rang</span> (L'éclair coupe le nuage !)."
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h4 className="text-blue-400 font-bold text-sm mb-2">Nouveau : Les Mondes Parallèles</h4>
            <p className="text-slate-300 text-sm">
              Il est possible d'avoir <strong>deux nuages</strong> en même temps.
              <br />
              <span className="italic">"While I was cooking, he was reading."</span>
              <br />
              (Pendant que je cuisinais, il lisait). Personne n'interrompt personne. Deux décors simultanés.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. Les Mots-Clés (The Triggers)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            Comment savoir lequel utiliser ? Regardez le petit mot qui introduit la phrase. C'est souvent un indice décisif.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded border-t-4 border-cyan-500">
              <h4 className="text-cyan-400 font-bold uppercase mb-2">WHILE (Pendant que)</h4>
              <p className="text-sm text-slate-300 mb-2">Annonce presque toujours une <strong>action longue</strong> (Continuous).</p>
              <div className="bg-slate-900 p-2 rounded text-xs text-white font-mono">
                While I <span className="text-cyan-400">was sleeping</span>...
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded border-t-4 border-amber-500">
              <h4 className="text-amber-400 font-bold uppercase mb-2">WHEN (Quand)</h4>
              <p className="text-sm text-slate-300 mb-2">Annonce souvent une <strong>rupture</strong> ou un événement soudain (Simple).</p>
              <div className="bg-slate-900 p-2 rounded text-xs text-white font-mono">
                ...when he <span className="text-amber-400">arrived</span>.
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mt-2">
            <p className="text-sm text-slate-400">
              <strong className="text-white">Le Test Ultime du Francophone :</strong>
              <br />
              Si vous pouvez dire <em>"J'étais <strong>en train de</strong>..."</em> en français, c'est 100% Past Continuous.
              <br />
              Sinon, c'est probablement du Past Simple (ou une habitude "Used to", voir cours 13).
            </p>
          </div>
        </div>
      )
    },
    {
      title: "3. Le Piège Chronologique (Expert)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r">
            <h4 className="text-red-400 font-bold uppercase text-sm mb-2">Attention : Nuance Critique !</h4>
            <p className="text-slate-300 text-sm">
              Regardez la différence massive de sens entre ces deux phrases :
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3 items-center bg-slate-900 p-3 rounded">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="text-white text-sm font-mono">"When we arrived, they <span className="text-cyan-400 font-bold">were having</span> dinner."</p>
                  <p className="text-slate-500 text-xs mt-1">➔ Ils avaient commencé AVANT qu'on arrive. On les a interrompus au milieu.</p>
                </div>
              </div>
              <div className="flex gap-3 items-center bg-slate-900 p-3 rounded">
                <span className="text-2xl">🏁</span>
                <div>
                  <p className="text-white text-sm font-mono">"When we arrived, they <span className="text-amber-400 font-bold">had</span> dinner."</p>
                  <p className="text-slate-500 text-xs mt-1">➔ Ils ont mangé APRÈS notre arrivée. C'est une suite d'actions chronologique.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20">
            <h4 className="text-purple-400 font-bold text-sm mb-2">Rappel : La Liste Interdite (Stative Verbs)</h4>
            <p className="text-slate-300 text-xs mb-2">
              Interdit d'utiliser le Continuous avec ces verbes (même si ça dure longtemps !). Utilisez le Past Simple.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono text-slate-400">
              <span>Want</span> <span>Need</span> <span>Know</span> <span>Understand</span>
              <span>Love</span> <span>Hate</span> <span>Believe</span> <span>Remember</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Director's Cut Quiz"
          questions={[
            {
              id: 1,
              question: "When you arrived, I ___ (sleep).",
              options: ["slept", "was sleeping", "am sleeping", "sleeped"],
              correctAnswer: 1,
              explanation: "C'était le 'Décor' (action longue en cours) quand tu es arrivé. On a interrompu ton sommeil. ➔ WAS SLEEPING.",
            },
            {
              id: 2,
              question: "While I ___ (cook), my sister ___ (read).",
              options: ["cooked / read", "was cooking / was reading", "cooked / was reading", "was cooking / read"],
              correctAnswer: 1,
              explanation: "Deux actions longues PARALLÈLES. Personne ne coupe personne. 'While' déclenche le Continuous. ➔ WAS COOKING / WAS READING.",
            },
            {
              id: 3,
              question: "When I opened the door, the cat ___ (run) out.",
              options: ["was running", "ran", "runned", "running"],
              correctAnswer: 1,
              explanation: "Suite d'actions rapides (Chronologie). J'ouvre ➔ Il sort. Pas de décor ici. ➔ RAN (Past Simple).",
            },
            {
              id: 4,
              question: "When I was young, I ___ (love) candy.",
              options: ["was loving", "loved", "loving", "love"],
              correctAnswer: 1,
              explanation: "Piège ! LOVE est un verbe d'état (Sentiment). Jamais de ING, même si ça a duré toute l'enfance. ➔ LOVED.",
            },
            {
              id: 5,
              question: "It ___ (rain) when I left home.",
              options: ["rained", "was raining", "raining", "is raining"],
              correctAnswer: 1,
              explanation: "Le décor (il pleuvait) était déjà installé au moment de l'action de partir. ➔ WAS RAINING.",
            },
            {
              id: 6,
              question: "My phone rang while I ___ (take) a shower.",
              options: ["took", "was taking", "taking", "am taking"],
              correctAnswer: 1,
              explanation: "WHILE introduit l'action longue (Le Décor). L'éclair (rang) coupe la douche. ➔ WAS TAKING.",
            },
            {
              id: 7,
              question: "When Karen arrived, we ___ (have) dinner. (So we asked her to join us).",
              options: ["had", "were having", "have", "are having"],
              correctAnswer: 1,
              explanation: "On était DÉJÀ en train de manger (Milieu de l'action). ➔ WERE HAVING.",
            },
            {
              id: 8,
              question: "When Karen arrived, we ___ (have) dinner. (We waited for her to start).",
              options: ["had", "were having", "have", "are having"],
              correctAnswer: 0,
              explanation: "On a mangé APRÈS son arrivée (Chronologie). ➔ HAD.",
            },
            {
              id: 9,
              question: "I ___ (walk) down the street when I ___ (fall).",
              options: ["walked / fell", "was walking / fell", "was walking / fallen", "walked / was falling"],
              correctAnswer: 1,
              explanation: "Classique Décor (Marche) coupé par Accident (Chute). ➔ WAS WALKING / FELL.",
            },
            {
              id: 10,
              question: "They ___ (not / listen) to the teacher.",
              options: ["didn't listen", "weren't listening", "wasn't listening", "not listening"],
              correctAnswer: 1,
              explanation: "Action de 'ne pas écouter' en cours. THEY WERE NOT listening.",
            },
          ]}
        />
      )
    }
  ]
};