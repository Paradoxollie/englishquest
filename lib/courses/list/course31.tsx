import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course31: LessonContent = {
    courseNumber: 31,
    title: "Le Futur Réel (First Conditional)",
    objective: "Apprendre à créer des phrases avec 'SI' pour le futur.",
    sections: [
        {
            title: "Une éventualité et sa suite",
            content: (
              <LessonExamples
                examples={[
                  { english: "If it rains tomorrow, we’ll stay inside.", meaning: "Tu annonces ce que vous ferez." },
                  { english: "If it rains, take a coat.", meaning: "Tu donnes une consigne." },
                  { english: "You can call me if you get lost.", meaning: "Tu proposes une possibilité." },
                ]}
              >
                Le premier conditionnel permet d’envisager une situation future que l’on considère possible. Dans la proposition avec if, le présent simple est courant.
              </LessonExamples>
            )
        },
        {
            title: "Changer l’ordre des propositions",
            content: (
              <LessonExamples
                examples={[
                  { english: "If we miss the train, we’ll walk.", meaning: "On entend d’abord la condition." },
                  { english: "We’ll walk if we miss the train.", meaning: "On entend d’abord la décision." },
                ]}
              >
                La condition peut être placée avant ou après la conséquence. À l’écrit, on met généralement une virgule après la condition lorsqu’elle arrive en tête.
              </LessonExamples>
            )
        },
        {
            title: "3. La Phrase Négative (Dire NON)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour faire une phrase négative, on utilise <strong>DON'T / DOESN'T</strong> (pour le présent) et <strong>WON'T</strong> (pour le futur).
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="text-emerald-400 font-bold text-sm mb-2">Si cela N'ARRIVE PAS...</h4>
                            <p className="text-white">"If it <strong className="text-emerald-400">doesn't</strong> rain..."</p>
                            <p className="text-xs text-slate-500 italic">(S'il ne pleut pas...)</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="text-blue-400 font-bold text-sm mb-2">...Je NE FERAI PAS cela.</h4>
                            <p className="text-white">"...I <strong className="text-blue-400">won't</strong> stay home."</p>
                            <p className="text-xs text-slate-500 italic">(...je ne resterai pas à la maison.)</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "4. Poser une Question",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour poser une question, on inverse simplement "WILL" et la personne, comme d'habitude.
                    </p>

                    <div className="bg-slate-900 p-5 rounded-xl border border-indigo-500/30">
                        <p className="text-white text-lg mb-2">
                            "What <strong className="text-indigo-400">will you do</strong> if you miss the bus?"
                        </p>
                        <p className="text-sm text-slate-400 italic">
                            (Que feras-tu si tu rates le bus ?)
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-white text-lg">
                                "<strong className="text-indigo-400">Will she come</strong> if I invite her?"
                            </p>
                            <p className="text-sm text-slate-400 italic">
                                (Viendra-t-elle si je l'invite ?)
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz · Envisager une conséquence",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "If it ___ sunny, we will go outside.",
                            options: ["is", "will be"],
                            correctAnswer: 0,
                            explanation: "Après IF, on utilise le PRÉSENT (is). Jamais de WILL après IF.",
                        },
                        {
                            id: 2,
                            question: "Tu parles de ta réaction demain. I ___ happy if you come to the party.",
                            options: ["am", "will be"],
                            correctAnswer: 1,
                            explanation: "Ici c'est le RÉSULTAT (la conséquence). Donc on utilise le FUTUR (will be).",
                        },
                        {
                            id: 3,
                            question: "If she ___ study, she won't pass.",
                            options: ["don't", "doesn't"],
                            correctAnswer: 1,
                            explanation: "She (3e personne) ➔ doesn't.",
                        },
                        {
                            id: 4,
                            question: "___ you help me if I pay you?",
                            options: ["Will", "Do"],
                            correctAnswer: 0,
                            explanation: "C'est une question sur le futur (la conséquence) ➔ Will you help me?",
                        },
                        {
                            id: 5,
                            question: "If I miss the bus, I ___ walk.",
                            options: ["will", "would"],
                            correctAnswer: 0,
                            explanation: "C'est une possibilité réelle ➔ WILL.",
                        },
                        {
                            id: 6,
                            question: "If you are tired, ___ to bed.",
                            options: ["go", "will go"],
                            correctAnswer: 0,
                            explanation: "C'est un conseil/ordre : on utilise l'impératif (go). Will go est impossible ici, la phrase n'a pas de sujet.",
                        },
                        {
                            id: 7,
                            question: "Demain, si la pluie commence, quel conseil pourras-tu donner ?",
                            options: ["If it rains, take a coat.", "If it rains, took a coat.", "If rains, take a coat."],
                            correctAnswer: 0,
                            explanation: "La consigne se formule à l’impératif dans la proposition principale.",
                        },
                        {
                            id: 8,
                            question: "Tu demandes à Sam ce qu’il fera demain dans ce cas précis. What ___ if you lose your keys?",
                            options: ["will you do", "do you do"],
                            correctAnswer: 0,
                            explanation: "Question sur une conséquence future spécifique : Will you do?",
                        },
                        {
                            id: 9,
                            question: "If the train ___ late, call me.",
                            options: ["is", "will be"],
                            correctAnswer: 0,
                            explanation: "La partie 'IF' est toujours au présent, même si le train arrive plus tard.",
                        },
                        {
                            id: 10,
                            question: "I won't buy it if it ___ too expensive.",
                            options: ["is", "will be"],
                            correctAnswer: 0,
                            explanation: "Pas de Will après If (même si If est en deuxième partie de phrase !).",
                        }
                    ]}
                />
            )
        }
    ]
};
