import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course8: LessonContent = {
  courseNumber: 8,
  title: "L'Existence (There is / There are)",
  description: "Dire qu'une chose existe vs La décrire.",
  icon: "📍",
  difficulty: "Facile",
  objective: "Maîtriser la distinction entre 'Il y a' et 'C'est'.",
  sections: [
    {
      title: "Introduction : Le Piège du 'Il y a'",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 rounded-lg border-l-4 border-amber-500">
            <p className="text-slate-200 text-lg">
              <strong>Le Problème :</strong> En français, "Il y a" est une expression "poubelle" qui fait tout (Singulier, Pluriel, Indénombrable).
              <br /><br />
              En anglais, c'est de la chirurgie :
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Vous devez scanner la <strong>quantité</strong> avant de parler.</li>
                <li>Vous devez scanner la <strong>nature</strong> (comptable ou non).</li>
              </ul>
            </p>
          </div>
        </div>
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
      title: "Partie 2 : Le Pluriel & La Règle de Proximité",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Le Pluriel Standard</h4>
            <p className="text-slate-300">
              Pour <strong>2 choses ou plus</strong>. Attention : "There's" (singulier) est souvent entendu à l'oral pour du pluriel, mais c'est une <strong>faute</strong> à l'écrit.
            </p>
            <p className="bg-slate-900 p-3 rounded text-amber-400 font-mono text-center">
              <span className="text-white">There are</span> two solutions.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-blue-500/30 mt-4">
            <h4 className="text-blue-400 font-bold uppercase mb-2 text-sm flex items-center gap-2">
              <span className="text-xl">⚡</span> Niveau Avancé : La Règle de Proximité
            </h4>
            <p className="text-slate-300 text-sm mb-4">
              Que faire si vous avez une liste mixte ? (Un stylo ET deux livres).
              La règle est simple : <strong>L'anglais s'accorde avec le PREMIER élément de la liste.</strong>
            </p>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                <span><span className="text-emerald-400 font-bold">There IS</span> a pen and two books.</span>
                <span className="text-xs text-slate-500">(1er objet = Singulier ➔ IS)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                <span><span className="text-amber-400 font-bold">There ARE</span> two books and a pen.</span>
                <span className="text-xs text-slate-500">(1er objet = Pluriel ➔ ARE)</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 3 : La Séquence Logique (Existence ➔ Description)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg">
            C'est la clé de la maîtrise. Ne confondez jamais l'Introduction (There is) et la Description (It is).
          </p>

          <div className="relative pl-8 border-l-2 border-slate-700 space-y-8">
            {/* EXISTENCE */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0 bg-emerald-500 text-slate-900 font-bold w-8 h-8 rounded-full flex items-center justify-center">1</div>
              <h4 className="text-emerald-400 font-bold uppercase mb-1">Introduction (Inconnu)</h4>
              <p className="text-slate-400 text-sm mb-2">L'objet n'est pas encore dans la conversation. On le fait apparaître.</p>
              <p className="font-mono text-white bg-slate-900 p-2 rounded inline-block">
                "Look! <span className="text-emerald-400 font-bold">There is</span> a car."
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0 bg-amber-500 text-slate-900 font-bold w-8 h-8 rounded-full flex items-center justify-center">2</div>
              <h4 className="text-amber-400 font-bold uppercase mb-1">Description (Connu)</h4>
              <p className="text-slate-400 text-sm mb-2">L'objet est maintenant "sur la table". On peut le qualifier.</p>
              <p className="font-mono text-white bg-slate-900 p-2 rounded inline-block">
                "<span className="text-amber-400 font-bold">It is</span> red."
              </p>
            </div>
          </div>

          <div className="bg-red-500/10 p-4 rounded text-center border border-red-500/30 text-red-200 text-sm italic mt-4">
            "There is red" ou "It is a car" (dans ce contexte) sont des erreurs de logique pure.
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Existence vs Description"
          questions={[
            {
              id: 1,
              question: "___ a new student in the class.",
              options: ["There is", "It is", "There are", "He is"],
              correctAnswer: 0,
              explanation: "Introduction d'une nouvelle personne (Singulier) ➔ THERE IS.",
            },
            {
              id: 2,
              question: "List: ___ a laptop and two phones.",
              options: ["There is", "There are", "It is", "They are"],
              correctAnswer: 0,
              explanation: "Règle de Proximité : Le premier mot est 'a laptop' (Singulier) ➔ THERE IS.",
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
              explanation: "Règle de Proximité : Le premier mot est 'two books' (Pluriel) ➔ THERE ARE.",
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