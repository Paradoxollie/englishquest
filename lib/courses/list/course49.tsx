import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course49: LessonContent = {
    courseNumber: 49,
    title: "Phrasal Verbs (Introduction)",
    objective: "Comprendre ce qu'est un phrasal verb, comment il se construit, et pourquoi l'ordre des mots compte.",
    sections: [
        {
            title: "0. Qu'est-ce qu'un phrasal verb ?",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Un <strong>phrasal verb</strong> est souvent un verbe suivi d'une petite particule comme{" "}
                        <strong>up</strong>, <strong>out</strong>, <strong>on</strong>, <strong>off</strong>. Le sens
                        final peut etre evident... ou completement idiomatique.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Sens assez literal</h4>
                            <p className="text-slate-300">sit down, come in</p>
                        </div>
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Sens plus abstrait</h4>
                            <p className="text-slate-300">give up, find out</p>
                        </div>
                        <div className="rounded-xl border-l-4 border-amber-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">A apprendre en bloc</h4>
                            <p className="text-slate-300">turn down an offer, carry on working</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Sens literal ou sens idiomatique",
            content: (
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-slate-200">
                            <p>
                                <strong>sit down</strong> = s'asseoir
                            </p>
                            <p>
                                <strong>turn off</strong> the light = eteindre
                            </p>
                            <p>
                                <strong>give up</strong> = abandonner
                            </p>
                            <p>
                                <strong>find out</strong> = decouvrir
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        C'est pour cela qu'il faut memoriser le groupe entier, pas seulement traduire la particule.
                        <strong> give up</strong> ne veut pas dire "donner vers le haut".
                    </p>
                </div>
            )
        },
        {
            title: "2. Separable ou inseparable ?",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Certains phrasal verbs peuvent separer le verbe et la particule. D'autres non. Avec un{" "}
                        <strong>pronom</strong>, ce point devient crucial.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Separable</h4>
                            <p className="text-white">turn on the light / turn the light on</p>
                            <p className="text-white mt-2">turn it on</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Avec un pronom, la particule vient apres le pronom.
                            </p>
                        </div>

                        <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-cyan-300">Inseparable</h4>
                            <p className="text-white">look after the children</p>
                            <p className="text-white mt-2">look after them</p>
                            <p className="mt-2 text-sm text-slate-300">
                                On ne separe pas: <span className="line-through">look them after</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Premiere boite a outils",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Au quotidien</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li>get up</li>
                                <li>put on</li>
                                <li>take off</li>
                                <li>pick up</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Interaction / information</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li>find out</li>
                                <li>look for</li>
                                <li>look after</li>
                                <li>give up</li>
                            </ul>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        La bonne methode est de les apprendre en petits groupes, avec une phrase complete et un contexte clair.
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
                            question: "A phrasal verb is often made of ...",
                            options: ["a verb + a particle", "two nouns only"],
                            correctAnswer: 0,
                            explanation: "C'est souvent un verbe suivi d'une particule comme up, out, on, off.",
                        },
                        {
                            id: 2,
                            question: "Which one means 'abandonner'?",
                            options: ["give up", "sit down"],
                            correctAnswer: 0,
                            explanation: "Give up est un phrasal verb idiomatique tres frequent.",
                        },
                        {
                            id: 3,
                            question: "Choose the correct order with a pronoun.",
                            options: ["turn it on", "turn on it"],
                            correctAnswer: 0,
                            explanation: "Avec un phrasal verb separable et un pronom, le pronom va au milieu.",
                        },
                        {
                            id: 4,
                            question: "Which one is correct?",
                            options: ["look after them", "look them after"],
                            correctAnswer: 0,
                            explanation: "Look after est inseparable.",
                        },
                        {
                            id: 5,
                            question: "Find out means ...",
                            options: ["discover", "sit quietly"],
                            correctAnswer: 0,
                            explanation: "Find out = decouvrir, apprendre une information.",
                        },
                        {
                            id: 6,
                            question: "The best way to learn phrasal verbs is ...",
                            options: ["as complete chunks in context", "particle by particle only"],
                            correctAnswer: 0,
                            explanation: "Le sens depend du groupe entier et du contexte.",
                        },
                        {
                            id: 7,
                            question: "Which phrasal verb is most likely separable?",
                            options: ["turn off", "look after"],
                            correctAnswer: 0,
                            explanation: "Turn off peut se separer: turn the light off.",
                        },
                        {
                            id: 8,
                            question: "Which one means 's'occuper de'?",
                            options: ["look after", "pick up"],
                            correctAnswer: 0,
                            explanation: "Look after = prendre soin de / s'occuper de.",
                        },
                        {
                            id: 9,
                            question: "Phrasal verbs should often be memorized ...",
                            options: ["with example sentences", "as isolated particles only"],
                            correctAnswer: 0,
                            explanation: "Les phrases d'exemple aident a fixer sens, registre et ordre des mots.",
                        },
                        {
                            id: 10,
                            question: "Which pair is correct?",
                            options: ["pick up the phone / pick the phone up", "pick up it / pick it up later"],
                            correctAnswer: 0,
                            explanation: "La premiere paire illustre bien un phrasal verb separable avec un nom.",
                        }
                    ]}
                />
            )
        }
    ]
};
