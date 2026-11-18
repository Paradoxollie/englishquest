import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course5: LessonContent = {
  courseNumber: 5,
  title: "L'Art de la Question (Inversion & Do/Does)",
  objective: "Maîtriser la mécanique de l'interrogation.",
  sections: [
    {
      title: "À qui s’adresse la question ?",
      content: (
        <LessonExamples
          examples={[
            { english: "Do you live here?", meaning: "Tu veux vérifier une adresse." },
            { english: "Who lives here?", meaning: "Tu cherches la personne qui habite ici. Who est le sujet." },
            { english: "Who do you live with?", meaning: "Le sujet est you. Tu demandes le nom de la personne qui l’accompagne." },
          ]}
        >
          Une question fermée invite à répondre par yes ou no. Une question ouverte demande un renseignement précis. Le rôle du mot interrogatif change la construction.
        </LessonExamples>
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
      title: "Avec be ou un modal",
      content: (
        <LessonExamples
          examples={[
            { english: "Are you ready?", meaning: "Tu es prêt ?" },
            { english: "Can you help me?", meaning: "Tu peux m’aider ?" },
          ]}
        >
          Lorsque be est le verbe, place am, is ou are devant le sujet. Can se place lui aussi devant le sujet.
        </LessonExamples>
      )
    },
    {
      title: "Avec do ou does",
      content: (
        <LessonExamples
          examples={[
            { english: "Do they like pizza?", meaning: "Ils aiment la pizza ?" },
            { english: "Does she play chess?", meaning: "Elle joue aux échecs ?" },
          ]}
        >
          Au présent simple, construis la question avec do ou does, puis le sujet et la base du verbe. Does porte déjà la marque de la troisième personne.
        </LessonExamples>
      )
    },
    {
      title: "Avec have ou have got",
      content: (
        <LessonExamples
          examples={[
            { english: "Do you have a bike?", meaning: "Have est le verbe principal." },
            { english: "Have you got a bike?", meaning: "Dans have got, have se place devant le sujet." },
          ]}
        >
          Deux constructions courantes permettent de parler de possession. Choisis-en une et conserve ses auxiliaires.
        </LessonExamples>
      )
    },
    {
      title: "Quel renseignement cherches-tu ?",
      content: (
        <LessonExamples
          examples={[
            { english: "Who called?", meaning: "Qui a téléphoné ?" },
            { english: "Who did you call?", meaning: "Qui as-tu appelé ?" },
          ]}
        >
          Quand le mot interrogatif occupe la place du sujet, le verbe suit directement. Quand le sujet apparaît après, utilise l’ordre de la question correspondant au temps et au verbe.
        </LessonExamples>
      )
    },
    {
      title: "Niveau 3 : La Boîte à Outils de l'Inspecteur",
      content: (
        <div className="space-y-8">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Pour obtenir des informations précises, l'inspecteur ne peut pas juste demander oui ou non. Il a besoin de ses <strong>outils spécifiques</strong> (les "WH-Words").
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
      title: "Quiz · Construire une question",
      content: (
        <Quiz
          title="Mission : Interrogatoire"
          questions={[
            {
              id: 1,
              question: "___ they play football on Sundays?",
              options: ["Are", "Do", "Does", "Is"],
              correctAnswer: 1,
              explanation: "Verbe 'play' (pas 'be') + Sujet 'They' ➔ Auxiliaire DO.",
            },
            {
              id: 2,
              question: "What time ___ the film start?",
              options: ["do", "does", "is", "are"],
              correctAnswer: 1,
              explanation: "Sujet 'the film' (3e pers.) + Verbe 'start' ➔ Auxiliaire DOES.",
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
              question: "La réponse est « John lives here ». Demande qui habite ici.",
              options: ["Who lives here?", "Who do lives here?", "Where does John live?"],
              correctAnswer: 0,
              explanation: "Who est le sujet de lives. Where demanderait le lieu.",
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
              explanation: "It (le temps/3e pers. du singulier) + Rain (verbe). ➔ DOES.",
            },
          ]}
        />
      ),
    },
  ],
};
