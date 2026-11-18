import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course15: LessonContent = {
  courseNumber: 15,
  title: "La Capacité (Can / Could / Be able to)",
  description: "Savoir faire vs Réussir à faire.",
  icon: "💪",
  difficulty: "Difficile",
  objective: "Maîtriser les 3 facettes de la capacité (Présent, Joker, Passé Spécifique).",
  sections: [
    {
      title: "Comment construire can et could",
      content: (
        <LessonExamples
          examples={[
            { english: "She can play the guitar. Can she sing too?", meaning: "Can reste identique à toutes les personnes." },
            { english: "I can’t swim very far.", meaning: "Can’t forme la négation." },
            { english: "I hope I’ll be able to come.", meaning: "Après will, be able to permet de parler d’une capacité future." },
          ]}
        >
          Ces modaux précèdent directement la base verbale. Ils gardent la même forme avec tous les sujets. Pour une question, place le modal devant le sujet.
        </LessonExamples>
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
      title: "Dire ce que tu pourras faire",
      content: (
        <LessonExamples
          examples={[
            { english: "I can meet you tomorrow.", meaning: "Je peux te retrouver demain." },
            { english: "After the repairs, we’ll be able to open the shop.", meaning: "Après les réparations, nous pourrons ouvrir le magasin." },
            { english: "I want to be able to travel alone.", meaning: "Je veux être capable de voyager seul ou seule." },
          ]}
        >
          Can exprime déjà certaines possibilités futures. Pour former un autre temps ou placer la capacité après un infinitif, utilise be able to.
        </LessonExamples>
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
      title: "Une possibilité ou une réussite ?",
      content: (
        <LessonExamples
          examples={[
            { english: "She could swim when she was six.", meaning: "Elle en était capable à cet âge." },
            { english: "He could escape through the window.", meaning: "La fenêtre lui offrait une issue. La phrase laisse le résultat ouvert." },
            { english: "He managed to escape through the window.", meaning: "Il a réussi à sortir." },
          ]}
        >
          Could décrit une capacité générale dans le passé. Managed to ou was able to permettent de préciser qu’une tentative particulière a abouti.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Parler d’une capacité",
      content: (
        <Quiz
          title="Le Maître des Talents"
          questions={[
            {
              id: 1,
              question: "Tu parles d’une capacité générale à l’âge de dix ans. I ___ swim very fast.",
              options: ["can", "could", "managed to", "am able to"],
              correctAnswer: 1,
              explanation: "Capacité générale passée (C'était un talent permanent). ➔ COULD.",
            },
            {
              id: 2,
              question: "La porte était bloquée. Je veux dire « j’ai finalement réussi à l’ouvrir ». I finally ___ open it.",
              options: ["could", "managed to", "can", "could have"],
              correctAnswer: 1,
              explanation: "Succès spécifique difficile (Une fois). 'Could' est interdit pour un succès unique positif. ➔ MANAGED TO (ou Was able to).",
            },
            {
              id: 3,
              question: "I hope I ___ come to your party tomorrow.",
              options: ["will can", "will be able to", "will able to", "could"],
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
              question: "La police a effectivement réussi à arrêter le voleur hier. Quelle forme exprime cette réussite ?",
              options: ["were able to", "can", "are able to", "will be able to"],
              correctAnswer: 0,
              explanation: "Pour une réussite précise au passé, we were able to ou we managed to convient.",
            },
          ]}
        />
      )
    }
  ]
};