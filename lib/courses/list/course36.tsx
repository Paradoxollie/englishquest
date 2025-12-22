import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course36: LessonContent = {
    courseNumber: 36,
    title: "Discours Indirect (2) : Les Questions Rapportées",
    objective: "Maîtriser la transformation des questions (Ordre des mots & 'IF').",
    sections: [
        {
            title: "0. Vocabulaire Technique",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Concepts Clés :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Word Order</span>
                            <span className="text-slate-500 text-sm">Ordre des mots</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">S.V.O.</span>
                            <span className="text-slate-500 text-sm">Sujet - Verbe - Objet</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Wh- Words</span>
                            <span className="text-slate-500 text-sm">Where, What, Who...</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Le Retour à l'Ordre Affirmatif (S-V)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Règle fondamentale : Une question rapportée <strong>N'EST PLUS UNE QUESTION</strong> grammaticalement. C'est une affirmation.
                        <br />Conséquence : On doit annuler l'inversion et remettre le Sujet avant le Verbe.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-blue-500 relative">
                        <div className="mb-6 pb-6 border-b border-slate-700">
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">QUESTION DIRECTE (Inversion V-S)</p>
                            <div className="flex items-center gap-2 text-xl font-mono">
                                <span className="text-slate-400">"Where</span>
                                <span className="text-red-400 font-bold border-b border-red-400 px-1">are</span>
                                <span className="text-blue-400 font-bold border-b border-blue-400 px-1">you</span>
                                <span className="text-slate-400">?"</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">QUESTION RAPPORTÉE (Ordre S-V)</p>
                            <p className="text-xl font-mono text-white mb-2">He asked where <span className="text-blue-400 font-bold border-b-2 border-blue-400 px-1">I</span> <span className="text-red-400 font-bold border-b-2 border-red-400 px-1">was</span>.</p>
                            <ul className="text-sm text-slate-300 list-disc list-inside mt-3">
                                <li>Plus de point d'interrogation.</li>
                                <li>Le Sujet (I) repasse devant le Verbe (Was).</li>
                                <li>La concordance des temps s'applique (Are ➔ Was).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Les Questions Fermées (Yes/No) : L'ajout de IF",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Si la question directe ne commence pas par un mot interrogatif (Where, What...), elle appelle une réponse par Oui ou Non.
                        <br />Pour rapporter ce type de question, on doit insérer <strong>IF</strong> (Si).
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">DIRECT</p>
                            <p className="text-white text-lg">"<strong>Are</strong> you happy?"</p>
                        </div>

                        <div className="flex justify-center text-2xl text-slate-500">⬇</div>

                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-indigo-500">
                            <p className="text-slate-400 text-xs uppercase font-bold mb-1">INDIRECT</p>
                            <p className="text-white text-lg">He asked <strong className="text-yellow-400 px-2 bg-yellow-400/10 rounded">if</strong> I was happy.</p>
                            <p className="text-xs text-slate-400 mt-2 italic">Note : L'inversion disparait aussi (Are you ➔ I was).</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. La Disparition de DO / DOES / DID",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Les auxiliaires "Do", "Does" et "Did" servent uniquement à former la question directe.
                        <br />Puisque la phrase devient une affirmation, <strong>ils doivent disparaître</strong>.
                    </p>

                    <div className="bg-slate-900 p-4 rounded-xl border border-red-500/30">
                        <p className="text-white mb-2">Direct: "Where <strong className="text-red-400 line-through decoration-2">do</strong> you live?"</p>
                        <p className="text-white font-bold text-lg">Indirect: He asked where I lived.</p>
                        <p className="text-xs text-slate-400 mt-1">Le verbe principal (live) applique la concordance des temps (Subject + Past Simple).</p>
                    </div>
                </div>
            )
        },
        {
            title: "Exercices de Rigueur",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "DIRECT: 'Where is Tom?' ➔ INDIRECT: He asked where ___.",
                            options: ["was Tom", "Tom was"],
                            correctAnswer: 1,
                            explanation: "Ordre S-V (Sujet + Verbe) obligatoire : Tom (Sujet) avant Was (Verbe).",
                        },
                        {
                            id: 2,
                            question: "DIRECT: 'Are you ready?' ➔ INDIRECT: He asked ___ I was ready.",
                            options: ["that", "if"],
                            correctAnswer: 1,
                            explanation: "Question fermée (Oui/Non) ➔ Insertion de IF.",
                        },
                        {
                            id: 3,
                            question: "DIRECT: 'What do you want?' ➔ INDIRECT: He asked what ___.",
                            options: ["I wanted", "did I want"],
                            correctAnswer: 0,
                            explanation: "Disparition de DO. Passage à l'ordre affirmatif Passé (I wanted).",
                        },
                        {
                            id: 4,
                            question: "DIRECT: 'Can you swim?' ➔ INDIRECT: He asked if I ___ swim.",
                            options: ["can", "could"],
                            correctAnswer: 1,
                            explanation: "Concordance des temps : CAN devient COULD.",
                        },
                        {
                            id: 5,
                            question: "DIRECT: 'Where does she live?' ➔ INDIRECT: He asked where ___.",
                            options: ["she lived", "did she live"],
                            correctAnswer: 0,
                            explanation: "Disparition de DOES. Passage à l'affirmative (She lived).",
                        },
                        {
                            id: 6,
                            question: "DIRECT: 'Who are you?' ➔ INDIRECT: He asked who ___.",
                            options: ["was I", "I was"],
                            correctAnswer: 1,
                            explanation: "Ordre S-V : I (Sujet) avant Was (Verbe).",
                        },
                        {
                            id: 7,
                            question: "DIRECT: 'Will you come?' ➔ He asked if I ___ come.",
                            options: ["would", "will"],
                            correctAnswer: 0,
                            explanation: "Concordance : WILL devient WOULD.",
                        },
                        {
                            id: 8,
                            question: "DIRECT: 'Did you finish?' ➔ He asked if I ___ finished.",
                            options: ["have", "had"],
                            correctAnswer: 1,
                            explanation: "DID indique le passé. Le 'passé du passé' est le Past Perfect (HAD finished).",
                        },
                        {
                            id: 9,
                            question: "He asked me where I was going. (Correct ?)",
                            options: ["Oui", "Non"],
                            correctAnswer: 0,
                            explanation: "Correct. Ordre S-V respecté (I was going).",
                        },
                        {
                            id: 10,
                            question: "He asked me do I like coffee. (Correct ?)",
                            options: ["Oui", "Non"],
                            correctAnswer: 1,
                            explanation: "Faux ! On ne peut pas garder 'do'. Il faut dire : He asked IF I liked coffee.",
                        }
                    ]}
                />
            )
        }
    ]
};