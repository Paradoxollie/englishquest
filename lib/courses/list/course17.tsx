import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course17: LessonContent = {
  courseNumber: 17,
  title: "Conseil (Should / Ought to)",
  objective: "Tu devrais...",
  sections: [
    {
      title: "Introduction : Le Conseiller Bienveillant",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-300">
            Pour donner un conseil, une opinion ou dire ce qui est "bien" de faire, nous avons un champion : <span className="text-cyan-400 font-bold">SHOULD</span>.
          </p>
          <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-cyan-500">
            <p className="text-lg font-mono text-cyan-300">"You should stop smoking."</p>
            <p className="text-slate-500 text-sm mt-1">= C'est mon conseil. C'est une bonne idée.</p>
          </div>

          <div className="flex gap-4 items-start bg-blue-900/30 p-4 rounded-lg border border-blue-500/50">
            <span className="text-2xl">🔧</span>
            <div>
              <p className="text-blue-300 font-bold mb-1">C'est un MODAL !</p>
              <p className="text-slate-300 text-sm">
                N'oubliez jamais que <strong>Should</strong> est un <em>Auxiliaire Modal</em>. Il obéit donc aux <strong>4 Règles d'Or</strong> (voir Cours 15) :
              </p>
              <ul className="text-slate-400 text-sm mt-2 ml-4 list-disc">
                <li>Il est invariable (Pas de "S" à la 3e personne).</li>
                <li>Il est suivi de la Base Verbale (Pas de "TO").</li>
                <li>Il est son propre chef pour les questions/négations.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. Le Jumeau Chic (Ought to)",
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-900/40 p-5 rounded-xl border border-indigo-500/50">
            <h3 className="text-indigo-400 font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">🎩</span> OUGHT TO
            </h3>
            <p className="text-slate-200 mb-4">
              Ne vous compliquez pas la vie : <strong>Ought to</strong> est simplement un synonyme "chic" de <em>Should</em>.
              <br />
              <span className="text-slate-400 italic">Note : Il est beaucoup moins fréquent que Should. On l'utilise peu à l'oral courant.</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-3 rounded">
                <p className="text-cyan-400 font-bold">SHOULD</p>
                <p className="text-white">"You <span className="underline">should</span> go."</p>
                <p className="text-xs text-slate-500 text-center mt-2">Le Jeans-Baskets (Passe partout)</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-indigo-500/30">
                <p className="text-indigo-400 font-bold">OUGHT TO</p>
                <p className="text-white">"You <span className="underline">ought to</span> go."</p>
                <p className="text-xs text-slate-500 text-center mt-2">Le Smoking (Rare & Formel)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              <span className="text-red-400 font-bold">ATTENTION :</span> C'est le SEUL modal qui garde le "TO" !
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. La Machine à Remonter le Temps (Regrets)",
      content: (
        <div className="space-y-6">
          <div className="bg-amber-900/30 p-6 rounded-xl border-l-4 border-amber-500">
            <h3 className="text-amber-400 font-black text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">⏳</span> The Time Machine
            </h3>
            <p className="text-slate-200 text-lg mb-4">
              Le plus grand regret des apprenants : vouloir utiliser "Should" au passé.
              <br />
              <span className="text-red-400">"You should stop yesterday"</span> = IMPOSSIBLE.
              <br />
              Pour le passé (reproche/regret), on utilise toujours :
            </p>

            <div className="bg-slate-900 p-5 rounded-lg text-center border border-amber-500/30 shadow-lg mb-6">
              <span className="text-cyan-400 font-black text-2xl">SHOULD HAVE</span>
              <span className="text-slate-500 mx-3 text-2xl">+</span>
              <span className="text-white font-bold text-2xl">V3</span>
              <p className="text-slate-400 text-sm mt-2">(Participe Passé)</p>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300">
                <span className="text-green-400 font-bold">➜</span> "I should have studied." <span className="text-slate-500 italic">(J'aurais dû étudier)</span>
              </p>
              <p className="text-slate-300">
                <span className="text-green-400 font-bold">➜</span> "You shouldn't have said that." <span className="text-slate-500 italic">(Tu n'aurais pas dû dire ça)</span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. La Menace (Had better)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-950 p-6 rounded-xl border border-red-600 shadow-lg shadow-red-900/20">
            <h3 className="text-red-500 font-black text-xl flex items-center gap-3 uppercase mb-4">
              <span className="text-3xl">⚠️</span> DANGER ZONE
            </h3>
            <p className="text-slate-100 text-lg mb-4">
              Beaucoup pensent que <strong>"Had better"</strong> est un conseil poli ("Ce serait mieux").
              <br />
              <span className="text-red-400 font-bold text-xl">FAUX !</span>
            </p>
            <div className="bg-red-900/40 p-4 rounded text-center mb-4">
              <p className="text-white text-lg font-bold">HAD BETTER = SINON...</p>
              <p className="text-red-300 text-sm mt-1">C'est un avertissement, voire une menace.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-lg">
              <p className="text-white text-lg font-mono">
                "You<span className="text-red-500">'d better</span> run."
              </p>
              <p className="text-slate-400 text-sm mt-1">
                (Sous-entendu : Sinon je t'attrape / Sinon tu vas rater ton bus).
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">
              <em>Note : On utilise 'd better (I'd better, You'd better).</em>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "4. Bonus Expert : L'Urgence (It's time)",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-900/30 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-purple-400 font-bold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">⏰</span> IT'S TIME...
            </h3>
            <p className="text-slate-200 mb-4">
              Une structure magnifique (et bizarre) pour dire "Il est grand temps que tu fasses quelque chose".
              <br />
              La règle folle : Après "It's time", le verbe est au <span className="text-purple-400 font-bold">PASSÉ</span> (Prétérit Modal), même si on parle du présent !
            </p>

            <div className="grid grid-cols-1 gap-4 text-center">
              <div className="bg-slate-900 p-4 rounded text-lg">
                "It's time we <span className="text-purple-400 font-bold underline">went</span> home."
                <br />
                <span className="text-slate-500 text-sm">(Il est temps qu'on rentre. Mais on ne l'a pas encore fait, donc c'est urgent !)</span>
              </div>
              <div className="bg-slate-900 p-4 rounded text-lg">
                "It's time you <span className="text-purple-400 font-bold underline">realised</span> the truth."
              </div>
            </div>

            <p className="text-xs text-purple-300 mt-4 text-center font-bold">
              C'est le signe d'un niveau d'anglais très avancé. Utilisez-le pour impressionner !
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Le Conseiller Expert"
          questions={[
            {
              id: 1,
              question: "You ___ smoke here. It's forbidden.",
              options: ["shouldn't", "don't have to", "mustn't", "had better"],
              correctAnswer: 2,
              explanation: "Interdiction formelle (Forbidden). MUSTN'T. 'Shouldn't' est trop faible.",
            },
            {
              id: 2,
              question: "You missed the train! You ___ left earlier.",
              options: ["should", "should have", "must", "had to"],
              correctAnswer: 1,
              explanation: "Regret sur le passé. SHOULD HAVE + V3.",
            },
            {
              id: 3,
              question: "It's formal. You ___ to wear a tie.",
              options: ["should", "must", "ought", "better"],
              correctAnswer: 2,
              explanation: "Le seul modal de la liste suivi de 'TO' est OUGHT TO.",
            },
            {
              id: 4,
              question: "You ___ be late, or the boss will fire you!",
              options: ["shouldn't", "had better not", "don't have to", "mustn't to"],
              correctAnswer: 1,
              explanation: "Menace/Danger clair (or... fire you). HAD BETTER NOT.",
            },
            {
              id: 5,
              question: "It's time we ___ home. It's late.",
              options: ["go", "went", "have gone", "will go"],
              correctAnswer: 1,
              explanation: "Règle de l'Urgence (It's time + Sujet + PRETERIT MODAL). It's time we WENT.",
            },
            {
              id: 6,
              question: "I have an exam in 10 minutes. I ___ go now.",
              options: ["better", "'d better", "should to", "ought"],
              correctAnswer: 1,
              explanation: "Urgence immédiate. HAD BETTER ('d better).",
            },
            {
              id: 7,
              question: "I didn't study and I failed. I ___ studied more.",
              options: ["should", "should have", "must have", "had better"],
              correctAnswer: 1,
              explanation: "Regret personnel passé. I SHOULD HAVE studied.",
            },
            {
              id: 8,
              question: "You ___ tell him the truth. He deserves to know.",
              options: ["ought", "ought to", "should to", "better"],
              correctAnswer: 1,
              explanation: "Conseil moral. OUGHT TO.",
            },
            {
              id: 9,
              question: "It's time you ___ a job.",
              options: ["find", "found", "have found", "finding"],
              correctAnswer: 1,
              explanation: "It's time + Prétérit. It's time you FOUND a job.",
            },
            {
              id: 10,
              question: "Where is the bank? You ___ ask a policeman.",
              options: ["should", "ought", "better", "should have"],
              correctAnswer: 0,
              explanation: "Suggestion simple sans danger ni regret. SHOULD est parfait.",
            },
          ]}
        />
      )
    }
  ]
};