import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course48: LessonContent = {
    courseNumber: 48,
    title: "Prepositions et Gerondif (Preposition + -ing)",
    objective: "Maitriser la regle preposition + -ing, y compris avec les expressions en to qui ne sont pas des infinitifs.",
    sections: [
        {
            title: "0. La regle d'or",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand un verbe arrive juste apres une <strong>preposition</strong>, il prend normalement la
                        forme en <strong>-ing</strong>.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
                        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                            Reflexe a automatiser
                        </p>
                        <p className="text-center font-mono text-xl text-white">
                            preposition + verb-ing
                        </p>
                        <div className="mt-5 space-y-2 text-center text-white">
                            <p>She is good at <strong className="text-emerald-400">solving</strong> problems.</p>
                            <p>Thank you for <strong className="text-emerald-400">coming</strong>.</p>
                            <p>He left without <strong className="text-emerald-400">saying</strong> goodbye.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Prepositions frequentes et formes courantes",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Apres une preposition classique</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li>before leaving</li>
                                <li>after reading the article</li>
                                <li>without asking</li>
                                <li>instead of complaining</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Apres adjectif + preposition</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li>interested in learning</li>
                                <li>afraid of flying</li>
                                <li>good at speaking</li>
                                <li>tired of waiting</li>
                            </ul>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        Le vrai danger n'est pas la preposition en elle-meme, mais l'habitude de vouloir remettre un infinitif apres.
                    </p>
                </div>
            )
        },
        {
            title: "2. Le piege du mot TO",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Parfois, <strong>to</strong> n'est pas le marqueur de l'infinitif. C'est simplement une{" "}
                        <strong>preposition</strong>. Dans ce cas, on garde la regle: <strong>to + -ing</strong>.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-white">
                            <p>I am looking forward to <strong className="text-cyan-400">seeing</strong> you.</p>
                            <p>She is used to <strong className="text-cyan-400">working</strong> late.</p>
                            <p>He objected to <strong className="text-cyan-400">paying</strong> extra.</p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-red-300">Erreur</h4>
                            <p className="text-white line-through">I am looking forward to see you.</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Correct</h4>
                            <p className="text-white">I am looking forward to seeing you.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Used to + verb, ou be used to + -ing ?",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-amber-300">used to + base verbale</h4>
                            <p className="text-white">I used to live in Lyon.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Ancienne habitude ou situation passee.
                            </p>
                        </div>
                        <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-cyan-300">be used to + -ing / noun</h4>
                            <p className="text-white">I am used to living in a big city.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Etre habitue a quelque chose.
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        Meme forme ecrite, logique differente. Dans le deuxieme cas, <strong>to</strong> est une
                        preposition, donc la forme en <strong>-ing</strong> est normale.
                    </p>
                </div>
            )
        },
        {
            title: "Quiz complet",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Thank you for ___ me.",
                            options: ["helping", "to help"],
                            correctAnswer: 0,
                            explanation: "Apres la preposition for, on met -ing.",
                        },
                        {
                            id: 2,
                            question: "She is interested in ___ abroad.",
                            options: ["working", "to work"],
                            correctAnswer: 0,
                            explanation: "In est une preposition: working.",
                        },
                        {
                            id: 3,
                            question: "I am looking forward to ___ you.",
                            options: ["seeing", "see"],
                            correctAnswer: 0,
                            explanation: "Ici, to est une preposition, pas un infinitif.",
                        },
                        {
                            id: 4,
                            question: "He left without ___ goodbye.",
                            options: ["saying", "to say"],
                            correctAnswer: 0,
                            explanation: "Without + -ing.",
                        },
                        {
                            id: 5,
                            question: "They are used to ___ early.",
                            options: ["getting up", "get up"],
                            correctAnswer: 0,
                            explanation: "Be used to = etre habitue a, donc to + -ing.",
                        },
                        {
                            id: 6,
                            question: "Choose the sentence about a past habit.",
                            options: ["I used to play tennis.", "I am used to playing tennis."],
                            correctAnswer: 0,
                            explanation: "Used to + base verbale exprime une ancienne habitude.",
                        },
                        {
                            id: 7,
                            question: "She insisted on ___ the bill herself.",
                            options: ["paying", "pay"],
                            correctAnswer: 0,
                            explanation: "On est une preposition: paying.",
                        },
                        {
                            id: 8,
                            question: "Before ___, lock the door.",
                            options: ["leaving", "leave"],
                            correctAnswer: 0,
                            explanation: "Before + -ing.",
                        },
                        {
                            id: 9,
                            question: "He objected to ___ more money.",
                            options: ["paying", "pay"],
                            correctAnswer: 0,
                            explanation: "Object to + -ing.",
                        },
                        {
                            id: 10,
                            question: "After a preposition, the safest pattern is ...",
                            options: ["verb-ing", "to + base verb"],
                            correctAnswer: 0,
                            explanation: "C'est la regle centrale du cours.",
                        }
                    ]}
                />
            )
        }
    ]
};
