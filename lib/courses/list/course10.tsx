import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course10: LessonContent = {
  courseNumber: 10,
  title: "Les Articles (A / An / The / Ø)",
  description: "La précision absolue : Un, Le ou Rien.",
  icon: "🔬",
  difficulty: "Difficile",
  objective: "Maîtriser enfin 'The' vs 'Rien' (Zero Article).",
  sections: [
    {
      title: "Présenter, retrouver, généraliser",
      content: (
        <LessonExamples
          examples={[
            { english: "I saw a cat at the station.", meaning: "Tu présentes un chat pour la première fois." },
            { english: "The cat was sleeping.", meaning: "La personne sait maintenant de quel chat tu parles." },
            { english: "Cats sleep a lot.", meaning: "Tu généralises à l’espèce." },
          ]}
        >
          Le choix de l’article dépend de ce que ton interlocuteur peut identifier. Écoute la même conversation du début à la fin.
        </LessonExamples>
      )
    },
    {
      title: "Règle 1 : A vs AN (Le Son)",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">On met <strong>AN</strong> devant un <strong>SON voyelle</strong>. C'est purement phonétique.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-3 rounded border-l-2 border-emerald-500">
              <p className="text-white">An apple</p>
              <p className="text-white">An <span className="text-emerald-400 font-bold">h</span>our <span className="text-xs text-slate-500">(H muet)</span></p>
            </div>
            <div className="bg-slate-900 p-3 rounded border-l-2 border-amber-500">
              <p className="text-white">A car</p>
              <p className="text-white">A <span className="text-amber-400 font-bold">u</span>niversity <span className="text-xs text-slate-500">(Son 'You' = Consonne)</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Parler d’un groupe ou d’une catégorie",
      content: (
        <LessonExamples
          examples={[
            { english: "Cats are cute.", meaning: "Tu parles des chats en général." },
            { english: "The cats in this photo are cute.", meaning: "Tu parles des chats précis que vous regardez." },
          ]}
        >
          Un pluriel sans article peut désigner une catégorie en général. The permet de viser un groupe identifiable.
        </LessonExamples>
      )
    },
    {
      title: "Règle 3 : Exceptions (Lieux & Institutions)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300 text-lg">
            Certains lieux familiers perdent leur article quand on parle de leur <strong>Fonction</strong> (ce qu'on y fait) plutôt que du <strong>Bâtiment</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Function (Zero Article) */}
            <div className="bg-slate-800 p-5 rounded-xl border-l-4 border-amber-500">
              <h4 className="text-amber-400 font-bold uppercase mb-3 text-sm">1. La Fonction (Ø Article)</h4>
              <p className="text-slate-400 text-sm mb-4">On y va pour faire l'activité prévue (Étudier, Prier, Guérir...).</p>

              <ul className="space-y-3 font-mono text-sm">
                <li className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-white">Go to <strong className="text-amber-400">Ø</strong> school</span>
                  <span className="text-slate-500 italic text-xs">(Élève)</span>
                </li>
                <li className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-white">Go to <strong className="text-amber-400">Ø</strong> church</span>
                  <span className="text-slate-500 italic text-xs">(Croyant)</span>
                </li>
                <li className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-white">Go to <strong className="text-amber-400">Ø</strong> prison</span>
                  <span className="text-slate-500 italic text-xs">(Prisonnier)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white">Go <strong className="text-amber-400">Ø</strong> home</span>
                  <span className="text-slate-500 italic text-xs">(Chez soi)</span>
                </li>
              </ul>
            </div>

            {/* Building (The) */}
            <div className="bg-slate-800 p-5 rounded-xl border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold uppercase mb-3 text-sm">2. Le Bâtiment (The)</h4>
              <p className="text-slate-400 text-sm mb-4">On y va en tant que visiteur, ou pour parler du lieu physique précis.</p>

              <ul className="space-y-3 font-mono text-sm">
                <li className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-white">Go to <strong className="text-emerald-400">the</strong> school</span>
                  <span className="text-slate-500 italic text-xs">(Parent/Visiteur)</span>
                </li>
                <li className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-white">See <strong className="text-emerald-400">the</strong> church</span>
                  <span className="text-slate-500 italic text-xs">(Touriste)</span>
                </li>
                <li className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-white">Drive past <strong className="text-emerald-400">the</strong> prison</span>
                  <span className="text-slate-500 italic text-xs">(Le bâtiment)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-col md:flex-row gap-4 text-sm mt-4">
            <div className="flex-1">
              <span className="block text-indigo-400 font-bold mb-1">🌍 Pays Singuliers (France, Spain...)</span>
              <span className="text-slate-400">➔ Ø Article (Jamais 'The France')</span>
            </div>
            <div className="w-px bg-slate-700 hidden md:block"></div>
            <div className="flex-1">
              <span className="block text-indigo-400 font-bold mb-1">🇺🇸 Pays Pluriels/Unions (UK, USA)</span>
              <span className="text-slate-400">➔ THE USA, THE UK, THE Netherlands.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pour aller plus loin (les articles en contexte)",
      content: (
        <LessonExamples
          examples={[
            { english: "Modern history fascinates me. The history of this building fascinates me.", meaning: "D’abord une discipline, puis l’histoire précise d’un bâtiment." },
            { english: "Go to Room 202. The room is upstairs.", meaning: "Le numéro identifie la salle. La seconde phrase reprend cette salle." },
          ]}
        >
          Un nom qu’on emploie sans article pour une généralité peut prendre the dès que le contexte l’identifie. Un numéro permet aussi de nommer directement une salle.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Choisir un article",
      content: (
        <Quiz
          title="Precision Check"
          questions={[
            {
              id: 1,
              question: "Tu demandes un parapluie quelconque, pour la première fois. I need ___ umbrella.",
              options: ["a", "an", "the", "Ø"],
              correctAnswer: 1,
              explanation: "Son voyelle ('Uh'). Donc AN.",
            },
            {
              id: 2,
              question: "___ France is beautiful.",
              options: ["The", "A", "An", "Ø"],
              correctAnswer: 3,
              explanation: "Pays singulier ➔ Pas d'article.",
            },
            {
              id: 3,
              question: "Tu parles du chocolat en général. I love ___ chocolate.",
              options: ["the", "a", "an", "Ø"],
              correctAnswer: 3,
              explanation: "Généralité (le chocolat en général) ➔ Article Zéro.",
            },
            {
              id: 4,
              question: "Look at ___ moon!",
              options: ["a", "an", "the", "Ø"],
              correctAnswer: 2,
              explanation: "Unique et spécifique (tout le monde la voit) ➔ THE.",
            },
            {
              id: 5,
              question: "Tu annonces son métier à quelqu’un qui le découvre. He is ___ doctor.",
              options: ["a", "an", "the", "Ø"],
              correctAnswer: 0,
              explanation: "Un métier (un parmi d'autres) ➔ A.",
            },
            {
              id: 6,
              question: "___ USA is a big country.",
              options: ["Ø", "The", "A", "An"],
              correctAnswer: 1,
              explanation: "Pays pluriel/union ➔ THE USA.",
            },
            {
              id: 7,
              question: "I go to ___ work at 8am.",
              options: ["the", "a", "an", "Ø"],
              correctAnswer: 3,
              explanation: "Lieu de routine (fonction) ➔ Pas d'article. Go to work.",
            },
            {
              id: 8,
              question: "Tu identifies pour la première fois le type de bâtiment. This is ___ university.",
              options: ["an", "a", "the", "Ø"],
              correctAnswer: 1,
              explanation: "Son consonne ('You'). Donc A University.",
            },
            {
              id: 9,
              question: "Tu fais une généralisation sur les chiens. ___ dogs are faithful.",
              options: ["The", "A", "An", "Ø"],
              correctAnswer: 3,
              explanation: "Généralité sur les chiens. Pas de 'The'.",
            },
            {
              id: 10,
              question: "Pass me ___ salt, please.",
              options: ["a", "an", "the", "Ø"],
              correctAnswer: 2,
              explanation: "Celui qui est sur la table (spécifique). ➔ THE.",
            },
          ]}
        />
      )
    }
  ]
};