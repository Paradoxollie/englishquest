import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course4: LessonContent = {
  courseNumber: 4,
  title: "Le Duel du Présent (I do vs I am doing)",
  objective: "Ne plus confondre habitudes et actions en cours.",
  sections: [
    {
      title: "Introduction",
      content: (
        <div className="space-y-6">
          <div className="relative bg-slate-900/60 rounded-xl p-6 border-l-4 border-purple-500 shadow-2xl backdrop-blur-sm">
            <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium text-balance">
              Vous connaissez les règles de base. Mais pour devenir bilingue, il faut maîtriser les <span className="text-white font-bold">NUANCES</span>. C'est ici que se joue la différence entre "parler anglais" et "penser en anglais".
            </p>

            <div className="mt-4 flex items-start gap-4 bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <div className="bg-purple-500/20 p-2 rounded-full shrink-0">
                <InfoIcon className="w-5 h-5 text-purple-300" />
              </div>
              <p className="text-slate-300 italic text-sm md:text-base leading-relaxed text-balance">
                <strong className="text-purple-300 not-italic">Objectif :</strong> Ne plus traduire mot à mot, mais analyser la situation (Permanence vs Temporaire).
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. La Décision Ultime (Logique 2.0)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            Le test "Est-ce que c'est maintenant ?" ne suffit pas toujours. Voici l'algorithme complet pour ne jamais se tromper :
          </p>

          <div className="bg-slate-900 rounded-xl p-6 md:p-10 border border-slate-700 flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>

            {/* Step 1: NOW? */}
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="bg-indigo-600 px-6 py-3 rounded-lg shadow-lg border border-indigo-400 mb-6 w-64 text-center font-bold text-white">
                Action en cours ? (NOW)
              </div>

              {/* Split 1 */}
              <div className="flex w-full max-w-lg justify-between px-10 relative">
                <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-600 -translate-y-6"></div>
                <div className="absolute top-2 left-10 right-10 h-px bg-slate-600"></div>

                {/* NO Branch (Simple) */}
                <div className="flex flex-col items-center mt-4">
                  <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded mb-2">NON</div>
                  <div className="bg-slate-800 border border-emerald-500/50 p-3 rounded-xl text-center w-32 md:w-40">
                    <p className="text-emerald-400 font-bold text-sm">Routine / Vérité</p>
                    <p className="text-white font-mono text-lg mt-1">SIMPLE</p>
                  </div>
                </div>

                {/* YES Branch (Go Deeper) */}
                <div className="flex flex-col items-center mt-4">
                  <div className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded mb-2">OUI</div>
                  <div className="relative">
                    {/* Step 2: State Verb? */}
                    <div className="bg-purple-600 px-4 py-3 rounded-lg shadow-lg border border-purple-400 w-56 text-center font-bold text-white mb-6">
                      Verbe d'État/Sentiment ?
                    </div>

                    {/* Split 2 */}
                    <div className="flex w-full justify-between px-2 relative">
                      <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-600 -translate-y-6"></div>
                      <div className="absolute top-2 left-2 right-2 h-px bg-slate-600"></div>

                      {/* YES (Exception) */}
                      <div className="flex flex-col items-center mt-4">
                        <div className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2">OUI</div>
                        <div className="bg-slate-800 border-2 border-dashed border-red-500/50 p-2 rounded-xl text-center w-24">
                          <p className="text-red-400 font-bold text-[10px] uppercase">Exception</p>
                          <p className="text-white font-mono text-sm">SIMPLE</p>
                        </div>
                      </div>

                      {/* NO (Standard) */}
                      <div className="flex flex-col items-center mt-4">
                        <div className="bg-slate-800 border border-cyan-500/50 p-2 rounded-xl text-center w-24">
                          <p className="text-cyan-400 font-bold text-[10px] uppercase">Action</p>
                          <p className="text-white font-mono text-sm">ING</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. La Nuance : Temporaire vs Permanent",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            C'est la différence la plus subtile. Imaginez que le <span className="text-emerald-400 font-bold">Present Simple</span> est une racine (ancrée, solide) et le <span className="text-cyan-400 font-bold">Continuous</span> un nuage (qui passe).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permanent Card */}
            <div className="bg-emerald-950/20 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌳</span>
                <h3 className="text-emerald-400 font-bold text-xl">Permanent (Racines)</h3>
              </div>
              <p className="text-white text-lg font-medium">"I live in Paris."</p>
              <p className="text-slate-400 text-sm">
                C'est mon domicile fixe. C'est ma vie, c'est établi. Je n'ai pas prévu de changer.
              </p>
              <div className="mt-auto pt-2 border-t border-emerald-500/20 text-xs text-emerald-300 uppercase tracking-widest font-bold">
                Present Simple
              </div>
            </div>

            {/* Temporary Card */}
            <div className="bg-cyan-950/20 border-l-4 border-cyan-500 rounded-lg p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">☁️</span>
                <h3 className="text-cyan-400 font-bold text-xl">Temporaire (Nuage)</h3>
              </div>
              <p className="text-white text-lg font-medium">"I am living in London."</p>
              <p className="text-slate-400 text-sm">
                Juste pour ce mois-ci, pour un stage ou des vacances. C'est une situation provisoire.
              </p>
              <div className="mt-auto pt-2 border-t border-cyan-500/20 text-xs text-cyan-300 uppercase tracking-widest font-bold">
                Present Continuous
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances (Niveau Expert)",
      content: (
        <Quiz
          title="Mission : Maîtriser les Nuances"
          questions={[
            {
              id: 1,
              question: "Attention ! I ___ (understand) this lesson now.",
              options: ["understand", "am understanding", "understanding", "understands"],
              correctAnswer: 0,
              explanation: "Piège ! 'Understand' est un verbe d'état (Cerveau). Même avec 'now', on ne met JAMAIS de ING.",
            },
            {
              id: 2,
              question: "I usually drive to work, but this week I ___ (take) the bus.",
              options: ["take", "am taking", "takes", "taking"],
              correctAnswer: 1,
              explanation: "C'est une situation TEMPORAIRE (juste cette semaine) contrairement à l'habitude. ➔ Continuous (Nuage).",
            },
            {
              id: 3,
              question: "She ___ (live) in New York. It's her home.",
              options: ["is living", "live", "lives", "living"],
              correctAnswer: 2,
              explanation: "C'est son domicile fixe (Permanent / Racines). ➔ Simple.",
            },
            {
              id: 4,
              question: "Look! The bus ___ (come)!",
              options: ["comes", "coming", "is coming", "come"],
              correctAnswer: 2,
              explanation: "'Look!' indique une action visible EN COURS. ➔ Continuous.",
            },
            {
              id: 5,
              question: "I ___ (think) you are right.",
              options: ["am thinking", "think", "thinks", "thinking"],
              correctAnswer: 1,
              explanation: "Ici 'think' = avoir une opinion (État). Si c'était 'réfléchir' (action), on pourrait dire 'I am thinking'.",
            },
            {
              id: 6,
              question: "He ___ (stay) at the Hilton for two nights.",
              options: ["stays", "is staying", "stay", "staying"],
              correctAnswer: 1,
              explanation: "Situation temporaire (juste 2 nuits). ➔ Continuous.",
            },
            {
              id: 7,
              question: "Water ___ (boil) at 100°C.",
              options: ["is boiling", "boils", "boil", "boiling"],
              correctAnswer: 1,
              explanation: "Vérité scientifique générale (Toujours vrai). ➔ Simple.",
            },
            {
              id: 8,
              question: "Why ___ you ___ (look) at me like that?",
              options: ["do / look", "are / looking", "is / looking", "do / looking"],
              correctAnswer: 1,
              explanation: "Action en cours : tu es en train de me regarder maintenant.",
            },
            {
              id: 9,
              question: "She ___ (love) chocolate.",
              options: ["is loving", "loves", "love", "loving"],
              correctAnswer: 1,
              explanation: "Sentiment/Goût = Verbe d'état. Jamais de ING (sauf chez McDonald's !).",
            },
            {
              id: 10,
              question: "Listen! Somebody ___ (sing).",
              options: ["sings", "is singing", "sing", "singing"],
              correctAnswer: 1,
              explanation: "Action sonore en train de se dérouler. ➔ Continuous.",
            },
          ]}
        />
      ),
    },
  ],
};