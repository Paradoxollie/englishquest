import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course8: LessonContent = {
  courseNumber: 8,
  title: "L'Existence (There is / There are)",
  description: "Dire qu'une chose existe vs la décrire.",
  icon: "📍",
  difficulty: "Facile",
  objective: "Maîtriser la distinction entre 'Il y a' et 'C'est'.",
  sections: [
    {
      title: "Présenter ce qu’on voit",
      content: (
        <LessonExamples
          examples={[
            { english: "What’s outside? There’s a car.", meaning: "Tu annonces la présence d’une voiture." },
            { english: "What’s that in the picture? It’s a car.", meaning: "Tu identifies l’objet montré." },
          ]}
        >
          Un personnage découvre quelque chose, puis l’autre l’identifie ou le décrit. Le contexte indique si tu introduis un élément ou si tu parles d’un élément déjà repéré.
        </LessonExamples>
      )
    },
    {
      title: "Partie 1 : Le Singulier & L'Indénombrable (There IS)",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Règle du Singulier</h4>
            <p className="text-slate-300">
              Dès qu'on parle d'<strong>UNE seule chose</strong>, on utilise <span className="text-emerald-400 font-bold">There is</span>.
              <br /><span className="text-xs text-slate-500">Souvent contracté en "There's".</span>
            </p>
            <p className="bg-slate-900 p-3 rounded text-emerald-400 font-mono text-center">
              <span className="text-white">There is</span> a cat in the garden.
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">2. Cas des Indénombrables (Liquides, Concepts)</h4>
            <p className="text-slate-300">
              Tout ce qu'on ne peut pas compter (l'eau, le bruit, le temps, l'argent, l'amour) est considéré comme <strong>Singulier</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <p className="text-white">There is <span className="text-emerald-400">water</span>.</p>
              </div>
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <p className="text-white">There is <span className="text-emerald-400">noise</span>.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Présenter plusieurs objets",
      content: (
        <LessonExamples
          examples={[
            { english: "There are two books on the desk.", meaning: "Two books est au pluriel." },
            { english: "There are two books and a pen on the desk.", meaning: "La liste commence par le groupe pluriel." },
            { english: "There’s a pen and two books on the desk.", meaning: "C’est une tournure courante dans la conversation." },
          ]}
        >
          Avec un nom pluriel, emploie there are. Pour une liste, on entend souvent un accord avec le premier élément. Commencer par le groupe pluriel est une solution simple à l’écrit.
        </LessonExamples>
      )
    },
    {
      title: "Présenter puis décrire",
      content: (
        <LessonExamples
          examples={[
            { english: "There’s a car outside. It’s red.", meaning: "Tu introduis la voiture, puis tu en donnes la couleur." },
            { english: "There are two bikes outside. They’re blue.", meaning: "Au pluriel, tu reprends les vélos avec they." },
          ]}
        >
          Une fois l’objet présenté, un pronom permet de continuer à en parler.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Décrire ce qu’il y a",
      content: (
        <Quiz
          title="Existence vs Description"
          questions={[
            {
              id: 1,
              question: "Tu annonces la présence d’une nouvelle personne. Complète avec la tournure qui veut dire « il y a ». ___ a new student here.",
              options: ["There is", "It is", "There are", "He is"],
              correctAnswer: 0,
              explanation: "Introduction d'une nouvelle personne (Singulier) ➔ THERE IS.",
            },
            {
              id: 2,
              question: "Une seule chose est posée devant toi. ___ a laptop on the table.",
              options: ["There is", "There are", "They are"],
              correctAnswer: 0,
              explanation: "A laptop est un groupe nominal singulier. La tournure d’existence est there is.",
            },
            {
              id: 3,
              question: "Look at the stars. ___ beautiful.",
              options: ["There are", "They are", "It is", "There is"],
              correctAnswer: 1,
              explanation: "Description d'objets connus (Les étoiles) ➔ THEY ARE.",
            },
            {
              id: 4,
              question: "___ no milk left in the fridge.",
              options: ["There is", "It is", "There are", "They are"],
              correctAnswer: 0,
              explanation: "Indénombrable (Milk) = Singulier ➔ THERE IS.",
            },
            {
              id: 5,
              question: "I see a spider. ___ huge!",
              options: ["There is", "It is", "It has", "There has"],
              correctAnswer: 1,
              explanation: "Description de l'araignée (Séquence Étape 2) ➔ IT IS.",
            },
            {
              id: 6,
              question: "___ 50 states in the USA.",
              options: ["There is", "There are", "They are", "It is"],
              correctAnswer: 1,
              explanation: "Pluriel factuel ➔ THERE ARE.",
            },
            {
              id: 7,
              question: "___ usually a lot of traffic here.",
              options: ["There is", "It is", "There are", "There has"],
              correctAnswer: 0,
              explanation: "Traffic est indénombrable (Singulier) ➔ THERE IS.",
            },
            {
              id: 8,
              question: "On the table, ___ two books and a pen.",
              options: ["there is", "there are", "it is", "they are"],
              correctAnswer: 1,
              explanation: "Règle de Proximité : Le premier élément est 'two books' (Pluriel) ➔ THERE ARE.",
            },
            {
              id: 9,
              question: "Do you like the cake? Yes, ___ delicious.",
              options: ["there is", "it is", "there has", "it has"],
              correctAnswer: 1,
              explanation: "Description et opinion ➔ IT IS.",
            },
            {
              id: 10,
              question: "___ a reason for this problem.",
              options: ["There is", "It is", "There are", "They are"],
              correctAnswer: 0,
              explanation: "Constat d'existence (Singulier) ➔ THERE IS.",
            },
          ]}
        />
      )
    }
  ],
};