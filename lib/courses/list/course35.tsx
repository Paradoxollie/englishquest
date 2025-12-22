import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course35: LessonContent = {
    courseNumber: 35,
    title: "Discours Indirect (1) : He said that...",
    objective: "Rapporter les paroles de quelqu'un (Le 'Gossip').",
    sections: [
        {
            title: "0. Boîte à Outils (Vocabulaire)",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Mots clés pour ce cours :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Say (Said)</span>
                            <span className="text-slate-500 text-sm">Dire</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Tell (Told)</span>
                            <span className="text-slate-500 text-sm">Raconter / Dire à qqn</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Ask</span>
                            <span className="text-slate-500 text-sm">Demander</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. La Règle du 'Pas en Arrière' (The Step Back)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand on répète ce que quelqu'un a dit dans le passé, on doit décaler le temps du verbe <strong>D'UN PAS EN ARRIÈRE</strong> vers le passé.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-indigo-500 relative">
                        <div className="flex flex-col md:flex-row items-center gap-8 justify-center">

                            <div className="text-center md:w-1/3">
                                <div className="bg-white text-black p-3 rounded-t-xl rounded-br-xl mb-2 relative">
                                    <span className="text-xs font-bold uppercase text-slate-500 block mb-1">DIRECT</span>
                                    "I <strong className="text-indigo-600">am</strong> tired."
                                </div>
                                <p className="text-sm text-slate-400">Tom (Hier)</p>
                            </div>

                            <div className="text-2xl text-slate-500">➔</div>

                            <div className="text-center md:w-1/3">
                                <div className="bg-indigo-900 text-white p-3 rounded-xl mb-2 border border-indigo-500">
                                    <span className="text-xs font-bold uppercase text-indigo-300 block mb-1">INDIRECT (Gossip)</span>
                                    He said he <strong className="text-indigo-400">was</strong> tired.
                                </div>
                                <div className="text-sm text-slate-400">Vous (Aujourd'hui)</div>
                            </div>

                        </div>
                        <div className="mt-6 text-center bg-black/20 p-2 rounded">
                            <p className="text-white font-mono">AM / IS / ARE <span className="text-slate-500">➔</span> WAS / WERE</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Les Changements de Personnes",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Attention aux miroirs ! Si Tom dit "JE suis fatigué", vous ne dites pas "JE suis fatigué" (sinon c'est vous !).
                        <br />Vous dites : "IL a dit qu'IL était fatigué".
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
                        <div className="bg-slate-800 p-3 rounded border-l-4 border-emerald-500">
                            <p className="font-bold text-white">Direct</p>
                            <p className="text-slate-300">"<strong>I</strong> like <strong>my</strong> car."</p>
                        </div>
                        <div className="bg-slate-800 p-3 rounded border-l-4 border-blue-500">
                            <p className="font-bold text-white">Indirect</p>
                            <p className="text-slate-300">He said <strong>he</strong> liked <strong>his</strong> car.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Say vs Tell (Le piège)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C'est la faute la plus courante. Quelle est la différence ?
                        <br /><span className="text-emerald-400 font-bold">TELL</span> a besoin d'une personne cible.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <h4 className="text-white font-bold mb-2">SAY (Dire quelque chose)</h4>
                            <ul className="text-slate-300 space-y-2">
                                <li>✅ He said that...</li>
                                <li>❌ <span className="line-through">He said me that...</span> (INTERDIT)</li>
                                <li>✅ He said <strong>to</strong> me that... (Possible mais lourd)</li>
                            </ul>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-xl">
                            <h4 className="text-emerald-400 font-bold mb-2">TELL (Dire À quelqu'un)</h4>
                            <ul className="text-slate-300 space-y-2">
                                <li>✅ He told <strong>me</strong> that...</li>
                                <li>✅ He told <strong>Ann</strong> that...</li>
                                <li>❌ <span className="line-through">He told that...</span> (Il manque la personne !)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz Gossip",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Tom: 'I am sick.' ➔ He said he ___ sick.",
                            options: ["is", "was"],
                            correctAnswer: 1,
                            explanation: "Step Back : Am (Présent) devient Was (Passé).",
                        },
                        {
                            id: 2,
                            question: "Sarah: 'I have a new car.' ➔ She said she ___ a new car.",
                            options: ["had", "has"],
                            correctAnswer: 0,
                            explanation: "Step Back : Have (Présent) devient Had (Passé).",
                        },
                        {
                            id: 3,
                            question: "He ___ me that he was angry.",
                            options: ["said", "told"],
                            correctAnswer: 1,
                            explanation: "Il y a 'ME' (la personne cible) ➔ TOLD.",
                        },
                        {
                            id: 4,
                            question: "He ___ that he was angry.",
                            options: ["said", "told"],
                            correctAnswer: 0,
                            explanation: "Pas de 'ME' (pas de cible) ➔ SAID.",
                        },
                        {
                            id: 5,
                            question: "Paul: 'I will call you.' ➔ He said he ___ call me.",
                            options: ["would", "will"],
                            correctAnswer: 0,
                            explanation: "Le passé de WILL est WOULD.",
                        },
                        {
                            id: 6,
                            question: "Anna: 'I can swim.' ➔ She said she ___ swim.",
                            options: ["can", "could"],
                            correctAnswer: 1,
                            explanation: "Le passé de CAN est COULD.",
                        },
                        {
                            id: 7,
                            question: "'My feet are cold.' ➔ He said ___ feet were cold.",
                            options: ["my", "his"],
                            correctAnswer: 1,
                            explanation: "On change le pronom : 'Mes pieds' deviennent 'Ses pieds' (His feet).",
                        },
                        {
                            id: 8,
                            question: "'I want to go.' ➔ She said she ___ to go.",
                            options: ["wants", "wanted"],
                            correctAnswer: 1,
                            explanation: "Want (Présent) devient Wanted (Passé).",
                        },
                        {
                            id: 9,
                            question: "He said me the truth. (Correct ou Faux ?)",
                            options: ["Correct", "Faux"],
                            correctAnswer: 1,
                            explanation: "Faux ! On ne dit jamais 'Said me'. On dit 'Told me'.",
                        },
                        {
                            id: 10,
                            question: "'I am working.' ➔ She said she ___ working.",
                            options: ["was", "is"],
                            correctAnswer: 0,
                            explanation: "Am working (Présent continu) devient Was working (Passé continu).",
                        }
                    ]}
                />
            )
        }
    ]
};