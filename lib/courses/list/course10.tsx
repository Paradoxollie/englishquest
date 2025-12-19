import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course10: LessonContent = {
  courseNumber: 10,
  title: "Les Articles (A / An / The / Ø)",
  description: "La précision absolue : Un, Le, ou Rien.",
  icon: "🔬",
  difficulty: "Difficile",
  objective: "Maîtriser enfin 'The' vs 'Rien' (Zero Article).",
  sections: [
    {
      title: "La Logique (Cruciale)",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border-l-4 border-indigo-500">
            <p className="text-lg text-slate-100 leading-relaxed font-medium">
              En anglais, le choix de l'article dépend purement de la <strong className="text-white">Notoriété</strong> de l'objet pour celui qui écoute.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4">
            <li className="bg-slate-800 p-4 rounded-lg flex items-start gap-4">
              <span className="text-3xl">1️⃣</span>
              <div>
                <p className="text-white font-bold mb-1">Inconnu / Quelconque ➔ A / AN</p>
                <p className="text-slate-400 text-sm">"J'ai vu *un* chien." (Tu ne sais pas lequel, c'est un parmi d'autres).</p>
              </div>
            </li>
            <li className="bg-slate-800 p-4 rounded-lg flex items-start gap-4">
              <span className="text-3xl">2️⃣</span>
              <div>
                <p className="text-white font-bold mb-1">Connu / Spécifique ➔ THE</p>
                <p className="text-slate-400 text-sm">"J'ai vu *le* chien." (Celui dont on a parlé, ou le seul qui est là).</p>
              </div>
            </li>
            <li className="bg-slate-800 p-4 rounded-lg flex items-start gap-4 border border-red-500/30">
              <span className="text-3xl">3️⃣</span>
              <div>
                <p className="text-red-400 font-bold mb-1">Concept Général ➔ Ø (RIEN)</p>
                <p className="text-slate-400 text-sm">"J'aime (-) les chiens." (Tous les chiens du monde). <strong>Erreur n°1 des Français.</strong></p>
              </div>
            </li>
          </ul>
        </div>
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
      title: "Règle 2 : L'Article Zéro (Généralités)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-500/40 p-4 rounded-xl">
            <p className="text-red-300 font-bold uppercase text-sm mb-2">Attention - Différence Majeure avec le Français</p>
            <p className="text-slate-200">
              En français, on dit "J'aime <strong>la</strong> vie". <br />
              En anglais, on dit "I like <span className="text-red-400 font-bold text-xl inline-block mx-1">Ø</span> life".
            </p>
            <p className="text-slate-400 text-sm mt-2">Dès que vous parlez d'une catégorie en général, supprimez 'THE'.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="bg-slate-800 p-3 rounded text-center text-white">❌ I hate <span className="text-red-500 decoration-2 line-through">the</span> traffic.</p>
            <p className="bg-emerald-900/30 p-3 rounded text-center text-emerald-300">✅ I hate traffic.</p>

            <p className="bg-slate-800 p-3 rounded text-center text-white">❌ <span className="text-red-500 decoration-2 line-through">The</span> cats are cute.</p>
            <p className="bg-emerald-900/30 p-3 rounded text-center text-emerald-300">✅ Cats are cute.</p>
          </div>
        </div>
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
      title: "Partie 5 (Bonus) : Les Pièges de Nuance (Niveau C1)",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h4 className="text-white font-bold uppercase mb-3 flex items-center gap-2">
              <span className="text-xl">🕵️‍♂️</span> Piège 1 : Concept vs Groupe (Society)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-mono text-white">"Running a business in <strong>Ø</strong> society."</p>
                <p className="text-slate-400">➔ La société en général (le concept abstrait de vivre ensemble).</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-white">"I joined <strong>the</strong> Society of Arts."</p>
                <p className="text-slate-400">➔ Un groupe/club spécifique avec des membres.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h4 className="text-white font-bold uppercase mb-3 flex items-center gap-2">
              <span className="text-xl">🏷️</span> Piège 2 : L'Étiquette (Labels)
            </h4>
            <p className="text-slate-300 text-sm mb-2">
              Quand un nom propre ou une lettre majuscule agit comme une <strong>étiquette</strong> (Label), l'article disparaît.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="font-mono text-white">"Open <strong>Ø</strong> Document A."</p>
                <p className="text-slate-400">➔ C'est son nom propre/code.</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-white">"Open <strong>the</strong> document."</p>
                <p className="text-slate-400">➔ L'objet physique/fichier spécifique.</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800">
              <p className="font-mono text-white text-sm">"Go to <strong>Ø</strong> Room 202" vs "Go to <strong>the</strong> room."</p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h4 className="text-white font-bold uppercase mb-3 flex items-center gap-2">
              <span className="text-xl">🇺🇸</span> Piège 3 : L'Adjectif ne rend pas "Spécifique"
            </h4>
            <div className="bg-red-500/10 p-3 rounded mb-3 border-l-2 border-red-500">
              <p className="text-slate-200 text-sm">
                <strong className="text-red-400">Erreur classique :</strong> Penser que parce qu'on ajoute "American" ou "Modern", ça devient précis. NON !
                <br />
                Un concept "décoré" reste un concept général.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="bg-slate-800/50 p-3 rounded border-l-2 border-slate-500">
                <p className="font-bold text-white mb-1">1. Concept + Adjectif = Toujours Ø</p>
                <ul className="space-y-2 text-slate-300">
                  <li>"<strong>Ø</strong> Life is hard" ➔ "<strong>Ø</strong> Modern life is hard."</li>
                  <li>"<strong>Ø</strong> Society is complex" ➔ "<strong>Ø</strong> American society is complex."</li>
                  <li>"<strong>Ø</strong> History is fascinating" ➔ "<strong>Ø</strong> French history is fascinating."</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 p-3 rounded border-l-2 border-emerald-500">
                <p className="font-bold text-white mb-1">2. L'Exception "Tranche de Gâteau" (Specific Slice)</p>
                <p className="text-slate-400 mb-2">Si vous coupez une tranche précise (dans le temps ou l'espace), ça devient <strong>THE</strong>.</p>
                <ul className="space-y-2 text-slate-300">
                  <li>"<strong>The</strong> American society <em>of the 1920s</em>." (Cette époque précise)</li>
                  <li>"<strong>The</strong> French history <em>that I learnt at school</em>." (Celle-là spécifiquement)</li>
                </ul>
              </div>

              <div className="bg-slate-800/50 p-3 rounded border-l-2 border-amber-500">
                <p className="font-bold text-white mb-1">3. Les Titres Officiels (Capitalized)</p>
                <p className="text-slate-400 mb-2">Si c'est un nom de club ou d'asso, c'est <strong>THE</strong>.</p>
                <ul className="space-y-2 text-slate-300">
                  <li>"<strong>The</strong> American Society of Engineers." (L'organisation)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Precision Check"
          questions={[
            {
              id: 1,
              question: "I need ___ umbrella.",
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
              question: "I love ___ chocolate.",
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
              question: "He is ___ doctor.",
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
              question: "This is ___ university.",
              options: ["an", "a", "the", "Ø"],
              correctAnswer: 1,
              explanation: "Son consonne ('You'). Donc A University.",
            },
            {
              id: 9,
              question: "___ dogs are faithful.",
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