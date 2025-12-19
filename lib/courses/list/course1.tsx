import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course1: LessonContent = {
  courseNumber: 1,
  title: "Être et Avoir (Les Fondamentaux)",
  objective: "Maîtriser les deux verbes auxiliaires essentiels de l'anglais : To Be et To Have.",
  sections: [
    {
      title: "Introduction",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-indigo-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium text-balance">
              Pour construire des phrases correctes, la maîtrise de <span className="whitespace-nowrap inline-block"><span className="text-cyan-400 font-bold px-2 py-0.5 bg-cyan-950/40 rounded border border-cyan-500/30">To Be</span> (Être)</span> et de <span className="whitespace-nowrap inline-block"><span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-500/30">To Have</span> (Avoir)</span> est un prérequis absolu.
            </p>
            <div className="mt-4 flex items-start gap-4 bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/20">
              <div className="bg-indigo-500/20 p-2 rounded-full shrink-0">
                <InfoIcon className="w-5 h-5 text-indigo-300" />
              </div>
              <p className="text-slate-300 italic text-sm md:text-base leading-relaxed text-balance">
                <strong className="text-indigo-300 not-italic">Pourquoi c'est vital ?</strong> Ces verbes sont les fondations des temps complexes. Une erreur ici vous suivra longtemps si elle n'est pas corrigée dès maintenant.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "1. Le Verbe Être (To Be)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Le verbe <strong className="text-cyan-300">BE</strong> est unique : c'est le seul verbe anglais qui change autant de forme. Il sert à définir <span className="text-white font-bold">l'identité, l'âge, ou l'état.</span>
          </p>

          {/* Cards with equal height and perfect centering */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { subject: "I", form: "am", example: "I am a student." },
              { subject: "You", form: "are", example: "You are late." },
              { subject: "He / She / It", form: "is", example: "She is happy." },
              { subject: "We / They", form: "are", example: "They are English." }
            ].map((item, idx) => (
              <div key={idx} className="h-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-300 group shadow-lg flex flex-col items-center justify-between gap-4">
                {/* Top: Subject */}
                <div className="w-full flex items-center justify-center pt-2">
                  <span className="text-white text-2xl font-bold tracking-tight text-center">{item.subject}</span>
                </div>

                {/* Bottom: Verb Form & Example */}
                <div className="w-full bg-cyan-950/30 rounded-lg p-3 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors flex flex-col items-center gap-1">
                  <span className="text-cyan-300 font-black text-3xl">{item.form}</span>
                  <span className="text-cyan-100/60 text-xs italic text-center w-full truncate">{item.example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "2. Le Verbe Avoir (To Have)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Pour la <strong>possession</strong>, on privilégie <strong className="text-emerald-300">Have got</strong>. C'est la forme la plus claire pour dire "Je possède".
          </p>

          {/* Equal height cards for Have */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Card 1: Standard */}
            <div className="h-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/50 transition-colors relative overflow-hidden group shadow-lg flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none">
                <div className="w-32 h-32 bg-emerald-500 rounded-full blur-3xl -mr-10 -mt-10"></div>
              </div>

              <div className="relative z-10 w-full flex flex-col items-center gap-4 flex-1">
                <div className="text-emerald-400 font-bold uppercase tracking-widest text-xs border-b border-emerald-500/30 pb-1 mb-1">Le Cas Général</div>

                <div className="text-white text-xl font-medium tracking-tight h-16 flex items-center justify-center">
                  I / You / We / They
                </div>

                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-6 py-2 shadow-inner">
                  <span className="text-3xl font-black text-white tracking-wide">have got</span>
                </div>

                <div className="mt-auto pt-2">
                  <p className="text-emerald-200/50 italic text-sm">"I have got a question."</p>
                </div>
              </div>
            </div>

            {/* Card 2: Exception */}
            <div className="h-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-red-500/50 transition-colors relative overflow-hidden group shadow-lg flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none">
                <div className="w-32 h-32 bg-red-500 rounded-full blur-3xl -mr-10 -mt-10"></div>
              </div>

              <div className="relative z-10 w-full flex flex-col items-center gap-4 flex-1">
                <div className="text-red-400 font-bold uppercase tracking-widest text-xs border-b border-red-500/30 pb-1 mb-1">L'Exception (3ème pers.)</div>

                <div className="text-white text-xl font-medium tracking-tight h-16 flex items-center justify-center">
                  He / She / It
                </div>

                <div className="bg-red-950/40 border border-red-500/30 rounded-xl px-6 py-2 shadow-inner">
                  <span className="text-3xl font-black text-red-500 tracking-wide">has got</span>
                </div>

                <div className="mt-auto pt-2">
                  <p className="text-red-200/50 italic text-sm">"She has got a key."</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 bg-red-950/20 border border-red-900/50 p-3 rounded-lg mx-auto max-w-2xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0"></div>
            <p className="text-sm text-red-200 text-center text-balance">
              <span className="font-bold">Règle d'or :</span> Seule la 3ème personne du singulier change en <strong className="text-red-400 underline decoration-2 underline-offset-2">HAS</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Point de Vigilance : Les \"Faux Amis\"",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-950/80 to-slate-900 border-l-4 border-red-500 rounded-r-xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="shrink-0 flex items-start md:pt-1 relative z-10">
              <div className="bg-red-500 p-3 rounded-xl shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform duration-300 ring-4 ring-red-500/20">
                <AlertIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1 relative z-10">
              <h4 className="font-bold text-white text-2xl mb-4 tracking-tight">Le "Piège du Français"</h4>
              <p className="text-slate-200 text-lg leading-relaxed mb-6 text-balance">
                En anglais, <span className="text-white font-bold">la faim, le froid, ou l'âge</span> sont des <strong className="text-red-400">ÉTATS</strong> (To Be), et non des possessions.
                <br /><span className="italic text-slate-400 text-base mt-1 block">On ne "possède" pas son âge, on "est" son âge.</span>
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-xl">
                  <p className="text-red-400 font-bold text-xs uppercase tracking-wider mb-3">À ne pas dire 🚫</p>
                  <ul className="space-y-3 font-mono text-sm text-slate-400">
                    <li className="line-through decoration-red-500/50 flex items-center gap-2"><span className="opacity-50">I have</span> 20 years old.</li>
                    <li className="line-through decoration-red-500/50 flex items-center gap-2"><span className="opacity-50">I have</span> cold.</li>
                  </ul>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl">
                  <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">La forme correcte ✅</p>
                  <ul className="space-y-3 font-medium text-white text-lg">
                    <li className="flex items-center gap-2">I <span className="text-cyan-400 font-bold">am</span> 20 years old.</li>
                    <li className="flex items-center gap-2">I <span className="text-cyan-400 font-bold">am</span> cold.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Mission Validation"
          questions={[
            {
              id: 1,
              question: "Comment traduire correctement 'J'ai faim' ?",
              options: ["I have hungry", "I am hungry", "I have hunger", "I am hunger"],
              correctAnswer: 1,
              explanation: "La faim est un état physique temporaire. On utilise donc le verbe 'To Be' (Être).",
            },
            {
              id: 2,
              question: "Complétez la phrase : My sister ___ got a new car.",
              options: ["have", "is", "has", "are"],
              correctAnswer: 2,
              explanation: "C'est une possession. À la 3ème personne du singulier (She), 'Have' devient 'Has'.",
            },
            {
              id: 3,
              question: "Quelle est la conjugaison correcte pour 'You' ?",
              options: ["You is ready", "You am ready", "You are ready", "You be ready"],
              correctAnswer: 2,
              explanation: "Avec le pronom 'You' (singulier ou pluriel), la conjugaison est toujours 'are'.",
            },
            {
              id: 4,
              question: "Traduisez : 'Ils sont contents' (They = Ils, Happy = Contenus)",
              options: ["They have happy", "They is happy", "They are happy", "They am happy"],
              correctAnswer: 2,
              explanation: "Le sujet est pluriel ('They'). La forme correcte du verbe Être est 'are'.",
            },
            {
              id: 5,
              question: "Piège ! Comment dire 'J'ai 25 ans' ?",
              options: ["I have 25 years", "I am 25 years old", "I have 25 years old", "I'm have 25"],
              correctAnswer: 1,
              explanation: "L'âge est un état civil en anglais, pas une possession. On dit 'Je SUIS vieux de 25 ans' (I am...).",
            },
            {
              id: 6,
              question: "Complétez : We ___ a big house.",
              options: ["are", "is", "have got", "has got"],
              correctAnswer: 2,
              explanation: "Nous 'possédons' une maison. Le sujet 'We' demande 'have got'.",
            },
            {
              id: 7,
              question: "Quelle phrase est correcte ?",
              options: ["It are a dog", "It is a dog", "It am a dog", "It have a dog"],
              correctAnswer: 1,
              explanation: "Pour un animal ou un objet (It), on utilise 'is' (Singulier).",
            },
            {
              id: 8,
              question: "Sensation : 'Nous avons froid' (Cold = Froid)",
              options: ["We have cold", "We are cold", "We has cold", "We is cold"],
              correctAnswer: 1,
              explanation: "Le froid est une sensation/état. On utilise 'To Be'.",
            },
            {
              id: 9,
              question: "Possession : ' The cat ___ blue eyes' (Les yeux bleus)",
              options: ["is", "are", "have got", "has got"],
              correctAnswer: 3,
              explanation: "Le chat (It/He) 'possède' des yeux bleus. 3ème personne du singulier = has got.",
            },
            {
              id: 10,
              question: "Le verbe 'To Be' est-il régulier ?",
              options: ["Oui, toujours", "Non, c'est le plus irrégulier", "Seulement au présent", "L'anglais n'a pas de verbes"],
              correctAnswer: 1,
              explanation: "To Be (Am/Is/Are) est le verbe le plus irrégulier et changeant de la langue anglaise !",
            },
          ]}
        />
      ),
    },
  ],
};