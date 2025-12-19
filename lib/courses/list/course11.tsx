import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course11: LessonContent = {
  courseNumber: 11,
  title: "Le Past Simple (Prétérit)",
  description: "L'art de raconter une histoire terminée.",
  icon: "🎬",
  difficulty: "Intermédiaire",
  objective: "Raconter des faits passés datés et terminés.",
  sections: [
    {
      title: "Introduction : La Boîte Fermée",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-indigo-500">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              Le Past Simple sert à parler d'événements qui sont <strong>complètement terminés</strong>. Il n'y a plus aucun lien avec le présent.
              <br /><br />
              C'est comme une boîte fermée et rangée dans le grenier. L'histoire est finie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center">
              <span className="text-4xl mb-2">✂️</span>
              <p className="text-white font-bold">La Rupture</p>
              <p className="text-slate-400 text-sm mt-1">On coupe le lien avec "Maintenant".</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center text-center">
              <span className="text-4xl mb-2">📅</span>
              <p className="text-white font-bold">La Date</p>
              <p className="text-slate-400 text-sm mt-1">Souvent accompagné de "Yesterday", "In 1999", "Last week".</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 1 : Les Réguliers (+ED) et le Piège de Prononciation",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            Pour 80% des verbes, il suffit d'ajouter <strong className="text-emerald-400">-ED</strong> à la fin.
            <br />
            <span className="font-mono text-slate-400">Work ➔ Worked | Play ➔ Played</span>
          </p>

          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <h4 className="text-red-400 font-bold uppercase">Le Piège Mortel : La Prononciation</h4>
            </div>
            <p className="text-slate-300 text-sm">
              Les francophones ont tendance à prononcer le "E" de "-ed" (ex: "Work-euh-d"). <strong className="text-white">C'EST INTERDIT !</strong>
              <br />
              Le "E" est muet dans 90% des cas. On passe directement de la racine au "D/T".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
            <div className="bg-slate-800 p-3 rounded border-t-4 border-emerald-500">
              <p className="text-emerald-400 font-bold mb-1">Son /T/ (Sifflant)</p>
              <p className="text-slate-400 text-xs mb-2">Après K, P, S, SH, CH, F</p>
              <p className="text-white">Work<span className="text-emerald-400">ed</span> ➔ "Work-T"</p>
              <p className="text-white">Stop<span className="text-emerald-400">ped</span> ➔ "Stop-T"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded border-t-4 border-amber-500">
              <p className="text-amber-400 font-bold mb-1">Son /D/ (Vibrant)</p>
              <p className="text-slate-400 text-xs mb-2">Après voyelles et sons doux</p>
              <p className="text-white">Play<span className="text-amber-400">ed</span> ➔ "Play-D"</p>
              <p className="text-white">Live<span className="text-amber-400">d</span> ➔ "Live-D"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded border-t-4 border-purple-500">
              <p className="text-purple-400 font-bold mb-1">Son /ID/ (L'Exception)</p>
              <p className="text-slate-400 text-xs mb-2">Seulement après T ou D</p>
              <p className="text-white">Want<span className="text-purple-400">ed</span> ➔ "Want-Id"</p>
              <p className="text-white">Decid<span className="text-purple-400">ed</span> ➔ "Decid-Id"</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 2 : La Liste Noire (Les Irréguliers)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            Les verbes les plus courants sont souvent irréguliers. Il n'y a pas de règle, il faut les apprendre.
            <br />
            Voici le "Top 5" absolu à connaître par cœur :
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border border-slate-700">
              <thead className="bg-slate-800 text-slate-200 uppercase font-bold">
                <tr><th className="p-3">Infinitif</th><th className="p-3 text-amber-400">Past Simple</th><th className="p-3 text-slate-500">Exemple</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40 font-mono">
                <tr><td className="p-3">GO (Aller)</td><td className="p-3 text-amber-400 font-bold">WENT</td><td className="p-3 italic">"I went to Paris."</td></tr>
                <tr><td className="p-3">HAVE (Avoir)</td><td className="p-3 text-amber-400 font-bold">HAD</td><td className="p-3 italic">"I had a dog."</td></tr>
                <tr><td className="p-3">DO (Faire)</td><td className="p-3 text-amber-400 font-bold">DID</td><td className="p-3 italic">"I did my homework."</td></tr>
                <tr><td className="p-3">GET (Obtenir)</td><td className="p-3 text-amber-400 font-bold">GOT</td><td className="p-3 italic">"I got a message."</td></tr>
                <tr><td className="p-3">SAY (Dire)</td><td className="p-3 text-amber-400 font-bold">SAID <span className="text-xs text-slate-500">/sed/</span></td><td className="p-3 italic">"He said no."</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      title: "Partie 3 : Négation et Question (Le Retour de DID)",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-800 p-4 rounded-xl border border-blue-500/30">
            <h4 className="text-blue-400 font-bold uppercase mb-2 flex items-center gap-2">
              <span className="text-xl">🛡️</span> Le Garde du Corps : DID
            </h4>
            <p className="text-slate-300 text-sm mb-4">
              Comme au présent avec DO/DOES, le passé a besoin d'un auxiliaire pour les phrases Non/Question.
              L'auxiliaire du passé est <strong>DID</strong>.
            </p>

            <div className="space-y-3 font-mono text-sm bg-slate-900 p-3 rounded">
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                <span>(+) Affirmation</span>
                <span className="text-white">I <span className="text-amber-400 font-bold">went</span> out.</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800">
                <span>(-) Négation</span>
                <span className="text-white">I <span className="text-blue-400 font-bold">did not</span> go out.</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>(?) Question</span>
                <span className="text-white"><span className="text-blue-400 font-bold">Did</span> you go out?</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-amber-300 font-bold text-sm">Le Piège du Double Passé</p>
              <p className="text-slate-400 text-sm mt-1">
                Si <strong>DID</strong> porte le passé, le verbe redevient normal (Base Verbale).
                <br />
                <span className="text-red-400 line-through">Did you went?</span> ➔ <span className="text-emerald-400 font-bold">Did you GO?</span>
              </p>
            </div>
          </div>

          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30 mt-4">
            <p className="text-purple-300 font-bold text-sm mb-1">Exception : Le verbe ÊTRE (BE)</p>
            <p className="text-slate-400 text-sm">
              "To Be" est un roi. Il n'a pas besoin de DID. Il se débrouille tout seul.
              <br />
              <span className="text-white font-mono block mt-1">
                "I <span className="text-purple-400">was</span> happy." / "I <span className="text-purple-400">was not</span> happy." / "<span className="text-purple-400">Were</span> you happy?"
              </span>
              (Jamais "Did you be").
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Past Simple Master"
          questions={[
            {
              id: 1,
              question: "Yesterday, I ___ (watch) a movie.",
              options: ["watchd", "watched", "watch", "watching"],
              correctAnswer: 1,
              explanation: "Verbe régulier + ED. Prononciation 'Watch-T'.",
            },
            {
              id: 2,
              question: "We ___ (go) to the beach last week.",
              options: ["goed", "gone", "went", "did go"],
              correctAnswer: 2,
              explanation: "GO est irrégulier ➔ WENT.",
            },
            {
              id: 3,
              question: "___ you ___ (see) the match?",
              options: ["Did / saw", "Did / see", "Do / see", "Have / seen"],
              correctAnswer: 1,
              explanation: "Question au passé ➔ DID + Verbe normal (See). Pas de 'Saw' ici !",
            },
            {
              id: 4,
              question: "I ___ (not / know) the answer.",
              options: ["didn't knew", "not know", "didn't know", "don't knew"],
              correctAnswer: 2,
              explanation: "Négation au passé ➔ DIDN'T + Verbe normal.",
            },
            {
              id: 5,
              question: "She ___ (want) to leave early.",
              options: ["wanted", "want", "wants", "wantted"],
              correctAnswer: 0,
              explanation: "WANTED. Ici on prononce le 'ID' car WANT finit par T.",
            },
            {
              id: 6,
              question: "Where ___ (be) you yesterday?",
              options: ["did you be", "was you", "were you", "are you"],
              correctAnswer: 2,
              explanation: "BE est spécial. Pas de DID. YOU WERE.",
            },
            {
              id: 7,
              question: "He ___ (buy) a new car 2 days ago.",
              options: ["buyed", "bought", "brought", "did buy"],
              correctAnswer: 1,
              explanation: "BUY est irrégulier ➔ BOUGHT (Attention à ne pas confondre avec Bring/Brought).",
            },
            {
              id: 8,
              question: "They ___ (live) in London in 2010.",
              options: ["lived", "liveed", "left", "living"],
              correctAnswer: 0,
              explanation: "LIVE est régulier (+D). Prononciation 'Live-D'.",
            },
            {
              id: 9,
              question: "I ___ (stop) the car.",
              options: ["stoped", "stopped", "stopt", "stop"],
              correctAnswer: 1,
              explanation: "Double consonne après voyelle courte : STOPPED.",
            },
            {
              id: 10,
              question: "Why ___ (did) you ___ (do) that?",
              options: ["did / /", "did / do", "do / did", "did / done"],
              correctAnswer: 1,
              explanation: "Le premier DID est l'auxiliaire, le deuxième est le verbe d'action 'Faire'.",
            },
          ]}
        />
      )
    }
  ]
};