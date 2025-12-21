import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course25: LessonContent = {
    courseNumber: 25,
    title: "Le Bilan : HOW LONG...",
    objective: "Poser la question 'Depuis quand / Combien de temps'.",
    sections: [
        {
            title: "1. La Question Universelle",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour demander "Depuis combien de temps" ou "Depuis quand", l&apos;anglais n&apos;utilise <strong className="text-red-400">JAMAIS</strong> le présent simple.
                        Il utilise <strong className="text-emerald-400">HOW LONG + PRESENT PERFECT</strong>.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-cyan-500">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">❓</span>
                                <h4 className="text-cyan-400 font-bold text-lg">HOW LONG HAVE YOU...?</h4>
                            </div>

                            <div className="bg-black/30 p-3 rounded space-y-2">
                                <p className="text-white">"How long <strong className="text-cyan-400">have you been</strong> here?"</p>
                                <p className="text-xs text-slate-500">(Depuis combien de temps es-tu là / Ça fait combien de temps que tu es là ?)</p>
                            </div>

                            <div className="bg-black/30 p-3 rounded space-y-2">
                                <p className="text-white">"How long <strong className="text-cyan-400">have you been waiting</strong>?"</p>
                                <p className="text-xs text-slate-500">(Ça fait combien de temps que tu attends ?)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Les Verbes d'État (State Verbs)",
            content: (
                <div className="space-y-6">
                    <div className="bg-red-900/20 p-4 rounded border border-red-500/50">
                        <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                            <span>⛔</span> LA LISTE NOIRE
                        </h4>
                        <p className="text-slate-300 mb-4 text-sm">
                            Certains verbes expriment un <strong className="text-white">ÉTAT MENTAL</strong> ou une <strong className="text-white">POSSESSION</strong>, pas une action. Ils ne peuvent PPHYSIQUEMENT pas être continus.
                            <br /><span className="italic text-slate-400">On ne peut pas être "en train de savoir" ou "en train de connaître". Soit on sait, soit on ne sait pas.</span>
                        </p>

                        <div className="space-y-3 bg-black/40 p-4 rounded text-sm">
                            <ul className="text-slate-300 grid grid-cols-2 gap-2 font-mono">
                                <li>&bull; Know (Connaître)</li>
                                <li>&bull; Have (Avoir)</li>
                                <li>&bull; Like / Love</li>
                                <li>&bull; Be (Être)</li>
                                <li>&bull; Believe (Croire)</li>
                                <li>&bull; Belong (Appartenir)</li>
                            </ul>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="bg-slate-800 p-3 rounded border-l-2 border-emerald-500">
                                <p className="text-xs text-emerald-400 font-bold mb-1">CORRECT (SIMPLE)</p>
                                <p className="text-white">"How long <strong className="text-emerald-400">have you known</strong> him?"</p>
                            </div>
                            <div className="bg-slate-800 p-3 rounded border-l-2 border-red-500 opacity-75">
                                <p className="text-xs text-red-400 font-bold mb-1">HORREUR ABSOLUE</p>
                                <p className="text-slate-400 line-through">"How long <strong className="text-red-500">have you been knowing</strong> him?"</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. L'Exception : LIVE & WORK",
            content: (
                <div className="space-y-6">
                    <div className="bg-emerald-900/20 p-4 rounded border border-emerald-500/50">
                        <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                            <span>🌟</span> LES VERBES FLEXIBLES
                        </h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Deux verbes sont spéciaux. Pour <strong>LIVE</strong> (habiter) et <strong>WORK</strong> (travailler), vous pouvez utiliser les deux formes sans réelle différence de sens pour des actions longues.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/30 p-3 rounded">
                                <p className="text-white font-medium">"I have lived here for 10 years."</p>
                                <p className="text-xs text-emerald-500">PERFECT</p>
                            </div>
                            <div className="bg-black/30 p-3 rounded">
                                <p className="text-white font-medium">"I have been living here for 10 years."</p>
                                <p className="text-xs text-emerald-500">PERFECT ALSO</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-4 rounded border-t-4 border-amber-500 mt-6">
                        <h4 className="text-amber-400 font-bold mb-2">RAPPEL : How long vs When</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-amber-400 font-bold">WHEN...?</span>
                                <span className="text-slate-300">➔ Cherche une date. <span className="text-slate-500">(Past Simple)</span></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400 font-bold">HOW LONG...?</span>
                                <span className="text-slate-300">➔ Cherche une durée. <span className="text-slate-500">(Present Perfect)</span></span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz : How Long...",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "___ have you been waiting?",
                            options: ["How long", "When"],
                            correctAnswer: 0,
                            explanation: "On s'intéresse à la durée de l'attente = How Long.",
                        },
                        {
                            id: 2,
                            question: "___ did you arrive?",
                            options: ["How long", "When"],
                            correctAnswer: 1,
                            explanation: "Auxiliaire 'Did' (Passé) + Arriver (action ponctuelle) = Date précise = When.",
                        },
                        {
                            id: 3,
                            question: "How long ___ him?",
                            options: ["have you been knowing", "have you known"],
                            correctAnswer: 1,
                            explanation: "'Know' est un verbe d'état (State Verb). Forme continue INTERDITE.",
                        },
                        {
                            id: 4,
                            question: "How long ___ married?",
                            options: ["have they been", "are they"],
                            correctAnswer: 0,
                            explanation: "Bilan d'une situation qui a commencé dans le passé et continue = Present Perfect.",
                        },
                        {
                            id: 5,
                            question: "How long ___ your car?",
                            options: ["have you had", "have you been having"],
                            correctAnswer: 0,
                            explanation: "'Have' (posséder) est un verbe d'état. Pas de forme continue.",
                        },
                        {
                            id: 6,
                            question: "I have ___ here for 5 years.",
                            options: ["lived", "living"],
                            correctAnswer: 0,
                            explanation: "Forme correcte 'Have lived'. 'Have living' n'existe pas (il manque 'been').",
                        },
                        {
                            id: 7,
                            question: "How long ___ English?",
                            options: ["do you learn", "have you been learning"],
                            correctAnswer: 1,
                            explanation: "Action commencée dans le passé et toujours en cours = Present Perfect Continuous.",
                        },
                        {
                            id: 8,
                            question: "How long has it been raining?",
                            options: ["Since 2 hours", "For 2 hours"],
                            correctAnswer: 1,
                            explanation: "Réponse à une durée (How long) avec une quantité de temps = For.",
                        },
                        {
                            id: 9,
                            question: "I have known her ___ a long time.",
                            options: ["for", "since"],
                            correctAnswer: 0,
                            explanation: "A long time = Durée = FOR.",
                        },
                        {
                            id: 10,
                            question: "How long have you been living here?",
                            options: ["For 2010", "Since 2010"],
                            correctAnswer: 1,
                            explanation: "2010 est une date précise, donc SINCE.",
                        },
                    ]}
                />
            )
        }
    ]
};