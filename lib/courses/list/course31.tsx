import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course31: LessonContent = {
    courseNumber: 31,
    title: "Le Futur Réel (First Conditional)",
    objective: "Apprendre à créer des phrases avec 'SI' pour le futur.",
    sections: [
        {
            title: "1. Le Concept Simple (Action ➔ Réaction)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour parler du futur avec "SI" (If), l'anglais a une logique stricte.
                        <br />On imagine une <strong>Condition</strong> (le déclencheur) et un <strong>Résultat</strong> (la conséquence).
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <p className="text-center text-indigo-300 font-bold mb-4">LA FORMULE MAGIQUE</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-center font-mono text-lg">
                            <div className="bg-slate-800 p-3 rounded-lg text-emerald-400">
                                IF + PRÉSENT
                                <div className="text-xs text-slate-500 mt-1">(La Condition)</div>
                            </div>
                            <div className="text-white font-bold">➔</div>
                            <div className="bg-slate-800 p-3 rounded-lg text-blue-400">
                                WILL + VERBE
                                <div className="text-xs text-slate-500 mt-1">(Le Résultat)</div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-white text-xl">"If it <strong className="text-emerald-400">rains</strong>, I <strong className="text-blue-400">will stay</strong> home."</p>
                            <p className="text-sm text-slate-400 italic mt-2">
                                (S'il pleut, je resterai à la maison.)
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Piège à Éviter (Danger !)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C'est exactement <strong>comme en français</strong> !
                        <br />Vous connaissez la règle : <em className="text-yellow-400">"Les SI n'aiment pas les RAI"</em>.
                        <br />(On ne dit pas "Si je <s>partirai</s>", on dit "Si je <strong>pars</strong>").
                    </p>

                    <div className="bg-red-900/10 border border-red-500 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">⛔</span>
                            <h4 className="text-red-400 font-bold uppercase">La Règle d'Or</h4>
                        </div>
                        <p className="text-white text-lg mb-4">
                            En anglais, c'est PAREIL : Pas de <strong>WILL</strong> juste après <strong>IF</strong>.
                        </p>
                        <div className="space-y-2 bg-black/30 p-4 rounded-lg">
                            <div className="flex gap-2">
                                <span className="text-red-500">❌</span>
                                <span className="line-through text-slate-400">If I will go...</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-emerald-400">✅</span>
                                <span className="text-white">If I <strong className="text-emerald-400">go</strong>...</span>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-red-300 italic">
                            Astuce : Si le mot "Si" (If) est là, le futur (Will) est interdit dans cette partie de la phrase.
                        </p>
                    </div>
                </div>
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
            title: "Quiz Complet",
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
                            question: "I ___ happy if you come.",
                            options: ["am", "will be"],
                            correctAnswer: 1,
                            explanation: "Ici c'est le RÉSULTAT (la conséquence). Donc on utilise le FUTUR (will be).",
                        },
                        {
                            id: 3,
                            question: "If she ___ study, she won't pass.",
                            options: ["don't", "doesn't"],
                            correctAnswer: 1,
                            explanation: "She (3ème personne) ➔ doesn't.",
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
                            explanation: "C'est un conseil/ordre (Impératif). Le futur n'est pas nécessaire.",
                        },
                        {
                            id: 7,
                            question: "If it rains, we ___ inside.",
                            options: ["stay", "will stay"],
                            correctAnswer: 1,
                            explanation: "Conséquence future classique : Will stay.",
                        },
                        {
                            id: 8,
                            question: "What ___ if you lose your keys?",
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
