import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course15: LessonContent = {
  courseNumber: 15,
  title: "La Capacité (Can / Could / Be able to)",
  description: "Savoir faire vs Réussir à faire.",
  icon: "💪",
  difficulty: "Difficile",
  objective: "Maîtriser les 3 facettes de la capacité (Présent, Joker, Passé Spécifique).",
  sections: [
    {
      title: "0. Théorie : Qu'est-ce qu'un Modal ?",
      content: (
        <div className="space-y-6">
          <div className="p-4 bg-slate-800 rounded-lg border border-indigo-500/30">
            <p className="text-slate-300">
              <span className="text-indigo-400 font-bold">Un Auxiliaire Modal</span> est un "Super-Verbe" qui modifie le sens du verbe principal (Capacité, Obligation, Conseil...).
              <br />
              Ils sont une famille à part (Can, Could, Must, Should, Will, Would, May, Might) et obéissent à <strong className="text-white">4 RÈGLES D'OR</strong> absolues.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 per-4 rounded border-l-4 border-red-500 p-3">
              <p className="text-red-400 font-bold text-sm mb-1">Règle #1 : Jamais de "TO"</p>
              <p className="text-slate-400 text-xs">Ils sont suivis directement de la Base Verbale.</p>
              <p className="text-white font-mono text-xs mt-1">"I can <span className="line-through text-red-500">to</span> go" ➔ "I can go"</p>
            </div>
            <div className="bg-slate-900 per-4 rounded border-l-4 border-red-500 p-3">
              <p className="text-red-400 font-bold text-sm mb-1">Règle #2 : Jamais de "S"</p>
              <p className="text-slate-400 text-xs">Ils sont invariables, même à la 3ème personne.</p>
              <p className="text-white font-mono text-xs mt-1">"He can<span className="line-through text-red-500">s</span> go" ➔ "He can go"</p>
            </div>
            <div className="bg-slate-900 per-4 rounded border-l-4 border-red-500 p-3">
              <p className="text-red-400 font-bold text-sm mb-1">Règle #3 : Jamais de "DON'T"</p>
              <p className="text-slate-400 text-xs">Ils font leur propre négation tout seuls.</p>
              <p className="text-white font-mono text-xs mt-1">"I <span className="line-through text-red-500">don't can</span>" ➔ "I cannot / can't"</p>
            </div>
            <div className="bg-slate-900 per-4 rounded border-l-4 border-red-500 p-3">
              <p className="text-red-400 font-bold text-sm mb-1">Règle #4 : Jamais de Futur/Passé Simple</p>
              <p className="text-slate-400 text-xs">Ils n'ont pas de temps composés. Ils sont défectifs.</p>
              <p className="text-white font-mono text-xs mt-1">"I will can" ➔ <span className="text-red-500 font-bold">IMPOSSIBLE</span></p>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="bg-indigo-900/50 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30">
              Ces règles s'appliquent à TOUS les modaux (Can, Must, Should...).
            </span>
          </div>
        </div>
      )
    },
    {
      title: "Introduction : Le Trio de Tête",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-emerald-500">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              En français, "Pouvoir" fait tout. En anglais, c'est une horlogerie fine.
              <br />
              Nous avons 3 outils différents pour dire "Je peux" ou "J'ai pu". Si vous vous trompez d'outil, vous changez le sens de la phrase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-slate-800 p-4 rounded-lg border-t-4 border-emerald-500">
              <p className="text-emerald-400 font-bold uppercase mb-1">CAN</p>
              <p className="text-xs text-slate-400">Le Roi du Présent.</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"I can swim."</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border-t-4 border-amber-500">
              <p className="text-amber-400 font-bold uppercase mb-1">COULD</p>
              <p className="text-xs text-slate-400">Le Passé Général.</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"I could swim."</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border-t-4 border-purple-500">
              <p className="text-purple-400 font-bold uppercase mb-1">BE ABLE TO</p>
              <p className="text-xs text-slate-400">Le Joker (Tous temps).</p>
              <p className="text-white font-mono mt-2 text-sm bg-slate-900 p-2 rounded">"I will be able to..."</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. CAN : Le Couteau Suisse (Présent)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            <strong className="text-emerald-400">CAN</strong> n'est pas seulement pour la "capacité physique". C'est un couteau suisse qui a 4 lames distinctes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold uppercase text-sm mb-1">1. Capacité (Savoir faire)</h4>
              <p className="text-slate-400 text-xs">Aptitude apprise ou innée.</p>
              <p className="text-white font-mono text-sm mt-1">"I <strong className="text-emerald-400">can</strong> swim."</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold uppercase text-sm mb-1">2. Permission (Avoir le droit)</h4>
              <p className="text-slate-400 text-xs">Donner ou demander l'autorisation.</p>
              <p className="text-white font-mono text-sm mt-1">"You <strong className="text-emerald-400">can</strong> go home now."</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold uppercase text-sm mb-1">3. Possibilité (Théorique)</h4>
              <p className="text-slate-400 text-xs">C'est possible (en général).</p>
              <p className="text-white font-mono text-sm mt-1">"It <strong className="text-emerald-400">can</strong> be cold here."</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold uppercase text-sm mb-1">4. Sens & Perception (Spécial)</h4>
              <p className="text-slate-400 text-xs">Avec See, Hear, Smell, Taste, Feel.</p>
              <p className="text-white font-mono text-sm mt-1">"I <strong className="text-emerald-400">can</strong> hear you."</p>
            </div>
          </div>

          <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 mt-2">
            <p className="text-emerald-300 font-bold flex items-center gap-2 text-sm">
              <span className="text-xl">👂</span> Le "Reflexe Sensoriel"
            </p>
            <p className="text-slate-300 text-sm mt-1">
              En français, on dit "Je t'entends". En anglais, on dit presque toujours "Je <strong>peux</strong> t'entendre".
              <br />
              <span className="text-red-400 line-through mr-2">I hear you.</span>
              <span className="text-red-400 line-through mr-2">I am hearing you.</span>
              <span className="text-emerald-400 font-bold">➔ I can hear you.</span>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. Le Joker : BE ABLE TO",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r">
            <h4 className="text-purple-400 font-bold uppercase text-sm mb-2">Pourquoi "Be able to" ?</h4>
            <p className="text-slate-300 text-sm">
              Essayez de mettre "CAN" au Futur... <em className="text-red-400">"I will can"</em> ?  <strong className="text-red-500 uppercase">IMPOSSIBLE !</strong>
              <br /><br />
              Quand "CAN" est coincé (Futur, Present Perfect, Infinitif...), on appelle le remplaçant : <strong className="text-white">BE ABLE TO</strong>.
              Il se conjugue comme le verbe Être.
            </p>
          </div>

          <div className="space-y-2 font-mono text-sm bg-slate-900 p-4 rounded-xl shadow-inner mt-4">
            <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-800">
              <span className="text-slate-500">Futur</span>
              <span className="text-white">I will <span className="text-purple-400 font-bold">be able to</span> go.</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-800">
              <span className="text-slate-500">Present Perfect</span>
              <span className="text-white">I have <span className="text-purple-400 font-bold">been able to</span> sleep.</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <span className="text-slate-500">Infinitif</span>
              <span className="text-white">I want to <span className="text-purple-400 font-bold">be able to</span> fly.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Le Piège Mortel (Passé : Could vs Managed to)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            C'est ici que les francophones se font piéger. Au passé, il y a DEUX "Pouvoir".
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-900/10 p-4 rounded border border-amber-500/30">
              <h4 className="text-amber-400 font-bold uppercase mb-2">COULD (Capacité Générale)</h4>
              <p className="text-xs text-slate-300 mb-2">
                "Je savais le faire" (J'avais le talent/la capacité en général).
              </p>
              <p className="text-white font-mono text-sm bg-slate-900 p-2 rounded">
                "When I was young, I <span className="text-amber-400">could</span> run fast."
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                (C'était une compétence permanente).
              </p>
            </div>

            <div className="bg-emerald-900/10 p-4 rounded border border-emerald-500/30">
              <h4 className="text-emerald-400 font-bold uppercase mb-2">WAS ABLE TO (Réussite Unique)</h4>
              <p className="text-xs text-slate-300 mb-2">
                "J'ai réussi à le faire" (Une fois, dans une situation précise et difficile).
              </p>
              <p className="text-white font-mono text-sm bg-slate-900 p-2 rounded">
                "The fire was big, but he <span className="text-emerald-400">was able to</span> escape."
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                (Il n'avait pas le "talent" d'échapper au feu, il a réussi ce coup-là).
              </p>
            </div>
          </div>

          <div className="bg-red-900/20 p-4 rounded-lg text-center font-bold text-red-300 border border-red-500/50 mt-2">
            ⚠️ INTERDIT : "He <span className="underline">could</span> escape the fire."
            <br />
            <span className="text-xs font-normal text-slate-400">(Car ce n'est pas une aptitude générale comme savoir nager).</span>
          </div>

          <div className="p-4 bg-slate-800 rounded text-sm text-slate-300 mt-2">
            <span className="text-xl mr-2">💡</span>
            <strong>Astuce :</strong> Si vous pouvez remplacer par <strong className="text-white">"Managed to"</strong> (Gérer/Réussir), alors utilisez <strong className="text-emerald-400">Was/Were able to</strong> (ou Managed to). N'utilisez PAS Could.
          </div>

          <div className="p-4 bg-slate-900 rounded text-sm text-slate-400 mt-2">
            Note : À la <strong>Négation</strong>, pas de problème ! <span className="text-red-400 font-bold">Couldn't</span> marche pour tout (Général ou Spécifique).
            <br />
            <span className="italic">"I couldn't escape."</span> (Correct).
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Le Maître des Talents"
          questions={[
            {
              id: 1,
              question: "When I was young, I ___ swim very fast.",
              options: ["can", "could", "managed to", "am able to"],
              correctAnswer: 1,
              explanation: "Capacité générale passée (C'était un talent permanent). ➔ COULD.",
            },
            {
              id: 2,
              question: "The door was locked, but I ___ open it.",
              options: ["could", "managed to", "can", "could have"],
              correctAnswer: 1,
              explanation: "Succès spécifique difficile (Une fois). 'Could' est interdit pour un succès unique positif. ➔ MANAGED TO (ou Was able to).",
            },
            {
              id: 3,
              question: "I hope I ___ come to your party tomorrow.",
              options: ["will can", "will be able to", "can", "could"],
              correctAnswer: 1,
              explanation: "Futur. CAN n'a pas de futur. Il faut utiliser le Joker ➔ WILL BE ABLE TO.",
            },
            {
              id: 4,
              question: "I looked everywhere, but I ___ find my keys.",
              options: ["couldn't", "can't", "not managed", "was able to"],
              correctAnswer: 0,
              explanation: "Négation au passé (Échec). COULDN'T marche tout le temps au négatif (Général ou Spécifique).",
            },
            {
              id: 5,
              question: "She ___ speak 3 languages.",
              options: ["cans", "can", "is able", "managed"],
              correctAnswer: 1,
              explanation: "Capacité présente générale. CAN (sans S !).",
            },
            {
              id: 6,
              question: "I haven't ___ sleep recently.",
              options: ["could", "been able to", "can", "managed"],
              correctAnswer: 1,
              explanation: "Present Perfect (Have + Participe Passé). CAN est impossible. Le participe passé de BE ABLE TO est BEEN ABLE TO.",
            },
            {
              id: 7,
              question: "He played well, but he ___ beat the champion.",
              options: ["couldn't", "was not able", "manage to", "has not"],
              correctAnswer: 0,
              explanation: "Échec spécifique. Couldn't fonctionne toujours.",
            },
            {
              id: 8,
              question: "Did you ___ finish the work?",
              options: ["could", "manage to", "can", "able to"],
              correctAnswer: 1,
              explanation: "Question sur un succès spécifique (As-tu réussi ?). 'Could' ne va pas ici. 'Manage to' est parfait.",
            },
            {
              id: 9,
              question: "One day, humans ___ live on Mars.",
              options: ["will can", "will could", "will be able to", "are able"],
              correctAnswer: 2,
              explanation: "Futur (Will) + Capacité ➔ WILL BE ABLE TO.",
            },
            {
              id: 10,
              question: "The police ___ catch the thief yesterday.",
              options: ["could", "were able to", "can", "are able to"],
              correctAnswer: 1,
              explanation: "Succès unique spécifique (Hier). 'Could' est interdit. ➔ WERE ABLE TO.",
            },
          ]}
        />
      )
    }
  ]
};