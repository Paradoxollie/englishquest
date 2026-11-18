import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course7: LessonContent = {
  courseNumber: 7,
  title: "Les Pronoms et la Possession",
  description: "Adjectifs Possessifs, Cas Génitif et Pronoms Possessifs.",
  icon: "🎓",
  difficulty: "Moyen",
  objective: "Comprendre la logique et le contexte de la possession.",
  sections: [
    {
      title: "À qui appartient l’objet ?",
      content: (
        <LessonExamples
          examples={[
            { english: "Maya has a bag. Her bag is red.", meaning: "Her renvoie à Maya." },
            { english: "Sam has a bag. His bag is blue.", meaning: "His renvoie à Sam." },
            { english: "Someone left their bag here.", meaning: "Their peut reprendre une seule personne dont on ignore le genre." },
          ]}
        >
          En français, « son » peut désigner le sac de Maya aussi bien que celui de Sam. En anglais, le possessif indique à qui appartient le sac.
        </LessonExamples>
      )
    },
    {
      title: "Un possessif devant le nom",
      content: (
        <LessonExamples
          examples={[
            { english: "My bag, your bag, his bag, her bag.", meaning: "Mon sac, ton sac, son sac à lui ou son sac à elle." },
            { english: "Our keys, their keys, its key.", meaning: "Nos clés, leurs clés, la clé de l’objet dont on parle." },
            { english: "Her brother has her ticket.", meaning: "Her ticket est le billet de la personne désignée par her." },
          ]}
        >
          Choisis le possessif d’après la personne qui possède l’objet. Le nom qui suit peut être au singulier ou au pluriel.
        </LessonExamples>
      )
    },
    {
      title: "Partie 2 : Le Cas Possessif (Génitif 'S)",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Usage & Contexte</h4>
            <p className="text-slate-300">
              <strong>À quoi ça sert ?</strong> À créer un lien d'appartenance direct entre deux noms.<br />
              <strong>Pourquoi pas "OF" ?</strong> "The car OF Pierre" est grammaticalement lourd et incorrect en anglais courant. On privilégie la structure "Propriétaire-Objet".
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500">
            <p className="text-amber-400 font-bold uppercase mb-2">La Structure</p>
            <div className="flex flex-col md:flex-row items-center gap-4 text-xl font-mono text-white">
              <div className="text-center">
                <span className="block text-sm text-slate-500 mb-1">1. Le Chef</span>
                <span className="bg-slate-800 px-3 py-1 rounded">Pierre</span>
              </div>
              <span className="text-red-400 font-black text-3xl">'S</span>
              <div className="text-center">
                <span className="block text-sm text-slate-500 mb-1">2. L'Objet</span>
                <span className="bg-slate-800 px-3 py-1 rounded">Car</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400 italic">
              Notez que l'article "The" de "Car" disparaît. Il est "avalé" par le 'S.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Partie 3 : Les Pronoms Possessifs (Substituts)",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Usage & Contexte</h4>
            <p className="text-slate-300">
              <strong>Quel est le but ?</strong> Éviter la répétition.<br />
              <strong>Situation :</strong> Vous montrez un sac. Vous ne voulez pas dire "C'est mon sac". Vous dites "C'est le mien".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
              <p className="text-xs uppercase text-slate-500 mb-1">Phrase Lourde (Répétition)</p>
              <p className="text-slate-300">"Is this <span className="text-emerald-400">your bag</span>? No, it's <span className="text-emerald-400">my bag</span>."</p>
            </div>
            <div>
              <p className="text-xs uppercase text-amber-500 mb-1">Phrase Fluide (Pronom)</p>
              <p className="text-white font-bold">"Is this <span className="text-amber-400">yours</span>? No, it's <span className="text-amber-400">mine</span>."</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border border-slate-700 mt-4 text-center">
              <thead className="bg-slate-800 text-slate-200 uppercase font-bold">
                <tr><th className="p-3 border-b border-slate-700">Adjectif (Avec Nom)</th><th className="p-3 border-b border-slate-700">Pronom (Sans Nom)</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40 font-mono">
                <tr><td className="p-3 text-emerald-300">My car</td><td className="p-3 text-amber-300 font-bold">Mine</td></tr>
                <tr><td className="p-3 text-emerald-300">Your car</td><td className="p-3 text-amber-300 font-bold">Yours <span className="text-xs text-slate-500">(+S)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">His car</td><td className="p-3 text-amber-300 font-bold">His <span className="text-xs text-slate-500">(Inchangé)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">Her car</td><td className="p-3 text-amber-300 font-bold">Hers <span className="text-xs text-slate-500">(+S)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">Our car</td><td className="p-3 text-amber-300 font-bold">Ours <span className="text-xs text-slate-500">(+S)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">Their car</td><td className="p-3 text-amber-300 font-bold">Theirs <span className="text-xs text-slate-500">(+S)</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      title: "Whose, its et it’s",
      content: (
        <LessonExamples
          examples={[
            { english: "Whose scarf is this? It’s mine.", meaning: "À qui est cette écharpe ? Elle est à moi." },
            { english: "The shop changed its name.", meaning: "Le magasin a changé de nom. Its accompagne name." },
            { english: "It’s cold. It’s been a long day.", meaning: "It is cold. It has been a long day." },
          ]}
        >
          Whose demande à qui appartient quelque chose. Its indique une possession. L’apostrophe de it’s signale une contraction, dont le sens apparaît dans la suite de la phrase.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Dire à qui appartient un objet",
      content: (
        <Quiz
          title="Évaluation de Maîtrise"
          questions={[
            {
              id: 1,
              question: "I have a brother. ___ name is Paul.",
              options: ["His", "Her", "He", "Him"],
              correctAnswer: 0,
              explanation: "Le possesseur est 'Brother' (Homme) ➔ HIS.",
            },
            {
              id: 2,
              question: "This is my sister. ___ car is red.",
              options: ["His", "Her", "She", "Hers"],
              correctAnswer: 1,
              explanation: "Le possesseur est 'Sister' (Femme) ➔ HER.",
            },
            {
              id: 3,
              question: "This is the office of the boss.",
              options: ["It's the boss's office", "It's the office's boss", "It's the boss office", "It's the office boss"],
              correctAnswer: 0,
              explanation: "Structure Génitif : Boss + 's + Office.",
            },
            {
              id: 4,
              question: "___ shoes are these?",
              options: ["Who", "Who's", "Whose", "Whom"],
              correctAnswer: 2,
              explanation: "Question d'appartenance ➔ WHOSE.",
            },
            {
              id: 5,
              question: "It is my sandwich. It is ___.",
              options: ["mine", "my", "me", "mines"],
              correctAnswer: 0,
              explanation: "Remplacement du nom (Pronom) ➔ MINE.",
            },
            {
              id: 6,
              question: "These keys are not yours. They are ___.",
              options: ["our", "ours", "us", "we"],
              correctAnswer: 1,
              explanation: "Pronom (Les nôtres) ➔ OURS.",
            },
            {
              id: 7,
              question: "Le fabricant parle du robot qu’il a construit. « The robot can move ___ arms. » Choisis le possessif de it.",
              options: ["It’s", "Its", "It", "Its’"],
              correctAnswer: 1,
              explanation: "Its est le déterminant possessif correspondant à it.",
            },
            {
              id: 8,
              question: "The children are playing with ___ toys.",
              options: ["theirs", "their", "they", "there"],
              correctAnswer: 1,
              explanation: "Adjectif devant 'toys' ➔ THEIR.",
            },
            {
              id: 9,
              question: "Is this pen ___?",
              options: ["your", "you", "yours", "you's"],
              correctAnswer: 2,
              explanation: "Pronom fin de phrase ➔ YOURS.",
            },
            {
              id: 10,
              question: "___ time to go.",
              options: ["Its", "It's", "His", "Her"],
              correctAnswer: 1,
              explanation: "Contraction de 'It is' ➔ IT'S.",
            },
          ]}
        />
      )
    }
  ],
};