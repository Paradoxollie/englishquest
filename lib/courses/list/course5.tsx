import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course5: LessonContent = {
  courseNumber: 5,
  title: "L'Art de la Question (Inversion & Do/Does)",
  objective: "Maîtriser la mécanique de l'interrogation.",
  sections: [
    {
      title: "Introduction",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-amber-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium text-balance">
              Il existe deux grands types de questions. Celles qui attendent un <span className="text-emerald-400 font-bold">OUI/NON</span> (Fermées) et celles qui demandent des <span className="text-indigo-400 font-bold">DÉTAILS</span> (Ouvertes).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-2">1. Questions Fermées (Closed)</h4>
              <p className="text-slate-300 text-sm italic mb-2">"Tu aimes la pizza ?"</p>
              <p className="text-white font-mono bg-slate-900 p-2 rounded">Auxiliaire + Sujet + Verbe ?</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h4 className="text-indigo-400 font-bold uppercase tracking-wider text-sm mb-2">2. Questions Ouvertes (Open)</h4>
              <p className="text-slate-300 text-sm italic mb-2">"Où habites-tu ?"</p>
              <p className="text-white font-mono bg-slate-900 p-2 rounded"><span className="text-indigo-400 font-bold">WH</span> + Auxiliaire + Sujet + Verbe ?</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 1 : Questions Fermées (Yes/No)",
      content: (
        <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
          <p className="text-emerald-200 font-medium">Objectif : Juste savoir ou vérifier. La réponse commence par Yes ou No.</p>
        </div>
      )
    },
    {
      title: "Niveau 1 : Le Roi (To Be)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Le verbe <span className="text-cyan-300 font-bold">BE</span> est le seul assez fort pour passer devant tout seul. Il échange simplement sa place avec le sujet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-slate-600">
              <p className="text-slate-500 text-sm mb-1">Affirmation</p>
              <p className="text-xl text-white font-mono"><span className="text-emerald-400">You</span> <span className="text-cyan-400">are</span> ready.</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-cyan-500 shadow-lg shadow-cyan-900/20">
              <p className="text-cyan-400 text-sm mb-1 font-bold">Question</p>
              <p className="text-xl text-white font-mono"><span className="text-cyan-400 font-bold decoration-2 underline decoration-cyan-500/50">Are</span> <span className="text-emerald-400">you</span> ready ?</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Niveau 2 : L'Origine du DO (Le Bodyguard)",
      content: (
        <div className="space-y-8">

          {/* Concept 1: The Weakness */}
          <div>
            <h3 className="text-xl text-slate-100 font-bold mb-3 flex items-center gap-2">
              <span className="bg-slate-700 text-slate-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Le problème des verbes anglais
            </h3>
            <p className="text-slate-300 leading-relaxed text-balance">
              Contrairement au français, les verbes anglais (Like, Play, Eat...) sont <strong className="text-red-400">faibles</strong>. Ils ne sont pas assez musclés pour porter une question ou une négation. Si on essaie de les inverser ("Like you pizza?"), ils s'effondrent.
            </p>
          </div>

          {/* Concept 2: The Muscle */}
          <div>
            <h3 className="text-xl text-slate-100 font-bold mb-3 flex items-center gap-2">
              <span className="bg-amber-600 text-amber-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              L'arrivée du Bodyguard (DO)
            </h3>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-300 mb-4 text-balance">
                Pour les aider, on appelle un verbe "Bodyguard" : <strong className="text-amber-400 text-xl mx-1">DO</strong>.
                <br /><span className="text-sm text-slate-500 italic block mt-1">(À l'origine, "To Do" veut dire "Faire/Agir". C'est le verbe de l'action pure.)</span>
              </p>
              <div className="flex items-center justify-center gap-4 bg-black/20 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Français (Verbe fort)</div>
                  <div className="text-white font-serif italic">"Aimes-tu ?"</div>
                </div>
                <div className="text-slate-600">vs</div>
                <div className="text-center">
                  <div className="text-xs text-amber-500/80 uppercase tracking-widest mb-1">Anglais (Besoin d'aide)</div>
                  <div className="text-white font-mono"><span className="text-amber-400 font-bold">FAIS</span>-tu aimer ?</div>
                  <div className="text-xs text-emerald-400 font-mono mt-1">(Do you like?)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Concept 3: The Job */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-500 text-amber-950 font-black px-3 py-1 rounded text-sm uppercase tracking-wider">La Mission</div>
              <h4 className="text-amber-300 font-bold">Le Sacrifice du Bodyguard</h4>
            </div>

            <p className="text-white mb-6 leading-relaxed">
              Le Bodyguard <strong className="text-amber-400">DO</strong> passe devant et prend tous les coups à la place du verbe. C'est lui qui porte la marque de la 3ème personne (le "S").
            </p>

            <div className="space-y-4 font-mono text-lg">
              {/* Transformation Example 1 */}
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <div className="opacity-60 text-sm md:text-base">She <span className="text-red-400 font-bold">likes</span> pizza.</div>
                <ArrowRightIcon className="w-5 h-5 text-amber-500 rotate-90 md:rotate-0" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-black text-xl">DOES</span>
                    <span className="text-white">she</span>
                    <span className="text-emerald-300 border-b-2 border-emerald-500/50">like</span>
                    <span className="text-slate-400 text-base">?</span>
                  </div>
                  <div className="text-[10px] text-amber-400/80 mt-1 font-sans">
                    DO est devenu DOES (il a pris le 'S'). Le verbe 'like' est protégé (base simple).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Niveau 2b : Le Cas Spécial (Have vs Have Got)",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-purple-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg text-slate-100 leading-relaxed font-medium text-balance">
              Attention ! Pour dire "J'ai" (la possession), il y a deux écoles. C'est souvent source de confusion pour les francophones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-amber-500 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🇺🇸</span>
              <h3 className="text-amber-400 font-bold text-lg uppercase tracking-wider mb-2">L'Option Moderne</h3>
              <p className="text-slate-400 text-sm mb-4">On traite "Have" comme un verbe normal (faible). Il a besoin du Bodyguard.</p>

              <div className="bg-slate-900 p-4 rounded-lg w-full">
                <p className="text-white font-mono text-lg mb-1">
                  <span className="text-amber-400 font-bold">Do</span> you <span className="text-emerald-300">have</span> a car?
                </p>
                <p className="text-xs text-slate-500">Simple, efficace, standard.</p>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-purple-500 flex flex-col items-center text-center">
              <span className="text-4xl mb-3">🇬🇧</span>
              <h3 className="text-purple-400 font-bold text-lg uppercase tracking-wider mb-2">L'Option "Got"</h3>
              <p className="text-slate-400 text-sm mb-4">Ici, "Have" est un Auxiliaire (Fort). Il passe devant tout seul, mais il traîne "Got" derrière.</p>

              <div className="bg-slate-900 p-4 rounded-lg w-full">
                <p className="text-white font-mono text-lg mb-1">
                  <span className="text-purple-400 font-bold">Have</span> you <span className="text-slate-500 text-sm">got</span> a car?
                </p>
                <p className="text-xs text-slate-500">Plus formel ou britannique.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
            <AlertIcon className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="text-red-300 font-bold text-sm uppercase mb-1">Le Piège à éviter absoluement</p>
              <p className="text-slate-300 text-sm">
                Ne dites jamais <span className="line-through decoration-red-500 decoration-2 text-white">"Have you a car?"</span>. <br />
                Soit vous utilisez <strong>DO</strong>, soit vous ajoutez <strong>GOT</strong>. Mais "Have" tout seul ne passe pas devant !
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 2 : Questions Ouvertes (Wh-Questions)",
      content: (
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
          <p className="text-indigo-200 font-medium">Objectif : Obtenir une information précise (Lieu, Date, Personne...).</p>
        </div>
      )
    },
    {
      title: "Niveau 3 : La Boîte à Outils de l'Inspecteur",
      content: (
        <div className="space-y-8">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Pour obtenir des informations précises, l'inspecteur ne peut pas juste demander oui ou non. Il a besoin de ses **outils spéificiques** (les "WH-Words").
          </p>

          {/* The Toolkit Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">👤</span>
              <p className="text-indigo-400 font-bold uppercase text-xs tracking-wider mb-1">Personne</p>
              <p className="text-white font-black text-xl">WHO</p>
              <p className="text-slate-500 text-xs italic">"Who are you?"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📍</span>
              <p className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-1">Lieu</p>
              <p className="text-white font-black text-xl">WHERE</p>
              <p className="text-slate-500 text-xs italic">"Where do you live?"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-amber-500 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">⏰</span>
              <p className="text-amber-400 font-bold uppercase text-xs tracking-wider mb-1">Temps</p>
              <p className="text-white font-black text-xl">WHEN</p>
              <p className="text-slate-500 text-xs italic">"When do you start?"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-cyan-500 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">📦</span>
              <p className="text-cyan-400 font-bold uppercase text-xs tracking-wider mb-1">Chose / Quoi</p>
              <p className="text-white font-black text-xl">WHAT</p>
              <p className="text-slate-500 text-xs italic">"What do you want?"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-red-500 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">❓</span>
              <p className="text-red-400 font-bold uppercase text-xs tracking-wider mb-1">Raison</p>
              <p className="text-white font-black text-xl">WHY</p>
              <p className="text-slate-500 text-xs italic">"Why are you sad?"</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors group">
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🛠️</span>
              <p className="text-purple-400 font-bold uppercase text-xs tracking-wider mb-1">Manière</p>
              <p className="text-white font-black text-xl">HOW</p>
              <p className="text-slate-500 text-xs italic">"How are you?"</p>
            </div>
          </div>

          {/* Construction Site */}
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏗️</span> Le Chantier de Construction
            </h3>
            <p className="text-slate-300 text-sm mb-6">Ne jetez pas les mots au hasard ! Suivez le plan de l'architecte étape par étape.</p>

            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border-l-4 border-indigo-500">
                <div className="bg-indigo-900/50 text-indigo-300 w-8 h-8 rounded flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="text-indigo-300 font-bold text-xs uppercase">L'Outil (Tool)</p>
                  <p className="text-white">Where / When / Who...</p>
                </div>
              </div>
              <div className="flex justify-center"><div className="w-0.5 h-4 bg-slate-700"></div></div>

              <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border-l-4 border-amber-500">
                <div className="bg-amber-900/50 text-amber-300 w-8 h-8 rounded flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="text-amber-300 font-bold text-xs uppercase">Le Bodyguard (Aux)</p>
                  <p className="text-white">Do / Does / Are / Is...</p>
                </div>
              </div>
              <div className="flex justify-center"><div className="w-0.5 h-4 bg-slate-700"></div></div>

              <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border-l-4 border-emerald-500">
                <div className="bg-emerald-900/50 text-emerald-300 w-8 h-8 rounded flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="text-emerald-300 font-bold text-xs uppercase">Le Patron (Sujet)</p>
                  <p className="text-white">You / She / They...</p>
                </div>
              </div>
              <div className="flex justify-center"><div className="w-0.5 h-4 bg-slate-700"></div></div>

              <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border-l-4 border-slate-500">
                <div className="bg-slate-700 text-slate-300 w-8 h-8 rounded flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="text-slate-300 font-bold text-xs uppercase">L'Action (Verbe)</p>
                  <p className="text-white">Live / Work / Eat...</p>
                </div>
              </div>
            </div>
          </div>

          {/* QUASI Formula Summary */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <p className="text-center text-slate-400 text-xs uppercase tracking-widest mb-4">Résumé : La Formule QUASI</p>
            <div className="grid grid-cols-4 gap-1 text-center font-mono">
              <div className="text-indigo-400 font-black text-2xl">Q</div>
              <div className="text-amber-400 font-black text-2xl">A</div>
              <div className="text-emerald-400 font-black text-2xl">S</div>
              <div className="text-slate-400 font-black text-2xl">I</div>

              <div className="text-[10px] text-indigo-500/80">Question</div>
              <div className="text-[10px] text-amber-500/80">Auxiliary</div>
              <div className="text-[10px] text-emerald-500/80">Subject</div>
              <div className="text-[10px] text-slate-500/80">Infinitive</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Mission : Interrogatoire"
          questions={[
            {
              id: 1,
              question: "___ you speak English?",
              options: ["Are", "Do", "Does", "Is"],
              correctAnswer: 1,
              explanation: "Verbe 'speak' (pas 'be') + Sujet 'You' ➔ Auxiliaire DO.",
            },
            {
              id: 2,
              question: "Where ___ she live?",
              options: ["do", "does", "is", "are"],
              correctAnswer: 1,
              explanation: "Sujet 'She' (3ème pers) + Verbe 'live' ➔ Auxiliaire DOES.",
            },
            {
              id: 3,
              question: "___ he happy?",
              options: ["Does", "Do", "Is", "Has"],
              correctAnswer: 2,
              explanation: "Adjectif 'happy' ➔ Besoin du verbe Être (To Be). 'Is he happy?'",
            },
            {
              id: 4,
              question: "What ___ you doing?",
              options: ["are", "do", "does", "is"],
              correctAnswer: 0,
              explanation: "Action en cours (Doing) ➔ Forme BE + ING. 'What are you doing?'",
            },
            {
              id: 5,
              question: "___ John play football?",
              options: ["Do", "Is", "Does", "Play"],
              correctAnswer: 2,
              explanation: "John = He (3ème pers) + Verbe 'play'. ➔ DOES (l'aspirateur à S).",
            },
            {
              id: 6,
              question: "How often ___ they travel?",
              options: ["do", "does", "are", "have"],
              correctAnswer: 0,
              explanation: "Sujet 'They' (Pluriel). ➔ DO.",
            },
            {
              id: 7,
              question: "Why ___ she crying?",
              options: ["does", "is", "do", "are"],
              correctAnswer: 1,
              explanation: "Crying (ING) ➔ Besoin de l'auxiliaire BE. She is -> Is she.",
            },
            {
              id: 8,
              question: "___ you like pizza?",
              options: ["Are", "Have", "Do", "Does"],
              correctAnswer: 2,
              explanation: "Like est un verbe simple. ➔ DO.",
            },
            {
              id: 9,
              question: "Where ___ your parents live?",
              options: ["does", "do", "are", "is"],
              correctAnswer: 1,
              explanation: "Your parents = They (Pluriel). Warning: 'Your' n'est pas le sujet, 'Parents' l'est ! ➔ DO.",
            },
            {
              id: 10,
              question: "___ it rain often here?",
              options: ["Do", "Is", "Does", "Are"],
              correctAnswer: 2,
              explanation: "It (le temps/3ème pers singulier) + Rain (verbe). ➔ DOES.",
            },
          ]}
        />
      ),
    },
  ],
};