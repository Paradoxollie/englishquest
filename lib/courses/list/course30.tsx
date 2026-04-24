import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course30: LessonContent = {
    courseNumber: 30,
    title: "Mesure : Too & Enough",
    objective: "Exprimer l'excès, la suffisance et les conséquences.",
    sections: [
        {
            title: "1. La Logique Négative de TOO",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Attention : <strong>TOO</strong> n&apos;est pas synonyme de "Very".
                        <br />"Very" augmente l&apos;intensité. "Too" <strong className="text-red-400">TUE</strong> la possibilité d&apos;action.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-5 rounded-lg border border-slate-600">
                            <h4 className="text-slate-300 font-bold mb-2 uppercase text-sm">VERY (Intensité)</h4>
                            <p className="text-white italic mb-1">"The coffee is <strong>very</strong> hot."</p>
                            <p className="text-xs text-emerald-400">➔ C&apos;est chaud, mais je peux le boire. C&apos;est juste une information.</p>
                        </div>
                        <div className="bg-slate-800 p-5 rounded-lg border border-red-500/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5">BLOCKER</div>
                            <h4 className="text-red-400 font-bold mb-2 uppercase text-sm">TOO (Blocage)</h4>
                            <p className="text-white italic mb-1">"The coffee is <strong className="text-red-400">too</strong> hot."</p>
                            <p className="text-xs text-red-300">➔ C&apos;est brûlant. Je NE PEUX PAS le boire. L&apos;action est bloquée.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. La Structure Complexe (La Conséquence)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Les anglais adorent combiner ces mots avec l&apos;infinitif complet pour expliquer la conséquence.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-indigo-500/30 shadow-lg">
                        <div className="mb-6">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Formule Magique</p>
                            <div className="flex flex-wrap items-center gap-2 text-lg md:text-xl font-mono bg-black/40 p-4 rounded-lg">
                                <span className="text-red-400 font-bold">TOO</span>
                                <span className="text-slate-500">+</span>
                                <span className="text-indigo-300">ADJECTIVE</span>
                                <span className="text-slate-500">+</span>
                                <span className="bg-white/10 px-2 rounded text-white font-bold">TO</span>
                                <span className="text-slate-500">+</span>
                                <span className="text-emerald-400">VERB</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border-l-4 border-red-500 pl-4">
                                <p className="text-white">"It is <strong className="text-red-400">too</strong> late <strong className="text-white">to</strong> <span className="text-emerald-400">go</span> out."</p>
                                <p className="text-sm text-slate-400 italic">Il est trop tard pour sortir.</p>
                            </div>
                            <div className="border-l-4 border-indigo-500 pl-4">
                                <p className="text-white">"He is <strong className="text-indigo-300">old</strong> <strong className="text-white">enough</strong> <strong className="text-white">to</strong> <span className="text-emerald-400">vote</span>."</p>
                                <p className="text-sm text-slate-400 italic">Il est assez vieux pour voter.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Gymnastique Mentale : Le Placement d'ENOUGH",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C&apos;est la règle la plus stricte. <strong>Enough</strong> change de place comme un caméléon.
                        <br />Mémorisez ces deux "boîtes".
                    </p>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Boîte Adjectif */}
                        <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border-t-8 border-cyan-500">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-cyan-400 font-bold text-lg">Avec ADJECTIF</h4>
                                <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">POST-POSITION</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-4">Enough se place <strong>APRÈS</strong>.</p>

                            <div className="space-y-2 font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">❌</span>
                                    <span className="line-through text-slate-600">Enough big</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-400">✅</span>
                                    <span className="text-white">Big <strong className="text-cyan-400">enough</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Boîte Nom */}
                        <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border-t-8 border-amber-500">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-amber-400 font-bold text-lg">Avec NOM</h4>
                                <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded">PRÉ-POSITION</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-4">Enough se place <strong>AVANT</strong> (comme "assez de").</p>

                            <div className="space-y-2 font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">❌</span>
                                    <span className="line-through text-slate-600">Money enough</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-400">✅</span>
                                    <span className="text-white"><strong className="text-amber-400">Enough</strong> money</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz de Précision",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I can't drink this tea. It is ___ sweet.",
                            options: ["very", "too"],
                            correctAnswer: 1,
                            explanation: "Le fait de ne pas pouvoir le boire indique un blocage/excès négatif = Too.",
                        },
                        {
                            id: 2,
                            question: "Is your room ___?",
                            options: ["enough warm", "warm enough"],
                            correctAnswer: 1,
                            explanation: "Warm est un adjectif. Enough se place APRÈS les adjectifs.",
                        },
                        {
                            id: 3,
                            question: "We have ___ for the party.",
                            options: ["food enough", "enough food"],
                            correctAnswer: 1,
                            explanation: "Food est un nom. Enough se place AVANT les noms.",
                        },
                        {
                            id: 4,
                            question: "It is too cold ___ outside.",
                            options: ["for going", "to go"],
                            correctAnswer: 1,
                            explanation: "Structure: Too + Adj + TO + Verbe.",
                        },
                        {
                            id: 5,
                            question: "He speaks ___ quickly for me to understand.",
                            options: ["too", "very"],
                            correctAnswer: 0,
                            explanation: "Conséquence négative (je ne comprends pas) = Too.",
                        },
                        {
                            id: 6,
                            question: "There are ___ people in this bus.",
                            options: ["too much", "too many"],
                            correctAnswer: 1,
                            explanation: "People est un pluriel dénombrable = Too many.",
                        },
                        {
                            id: 7,
                            question: "I don't have ___ money to buy this car.",
                            options: ["enough", "too"],
                            correctAnswer: 0,
                            explanation: "Manque de quantité suffisante (Not enough).",
                        },
                        {
                            id: 8,
                            question: "This is ___ trouble!",
                            options: ["too much", "too many"],
                            correctAnswer: 0,
                            explanation: "Trouble (les ennuis/le problème) est indénombrable = Too much.",
                        },
                        {
                            id: 9,
                            question: "Are you ___ to lift this box?",
                            options: ["strong enough", "enough strong"],
                            correctAnswer: 0,
                            explanation: "Strong (Adj) + Enough.",
                        },
                        {
                            id: 10,
                            question: "This bag is very heavy, but not ___ heavy to carry.",
                            options: ["too", "enough"],
                            correctAnswer: 0,
                            explanation: "Nuance subtile : 'Pas TROP lourd'. Not TOO heavy.",
                        },
                    ]}
                />
            )
        }
    ]
};
