import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course44: LessonContent = {
    courseNumber: 44,
    title: "Le Passe du Passe (Past Perfect)",
    objective: "Montrer clairement qu'une action s'est produite avant un autre moment passe.",
    sections: [
        {
            title: "0. Le past perfect en une image",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le <strong>past perfect</strong> sert a parler d'un passe encore plus ancien qu'un autre point
                        de reference deja passe. C'est le temps du <strong>avant deja termine</strong>.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
                        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-purple-300">
                            Formule
                        </p>
                        <p className="text-center font-mono text-xl text-white">
                            had + past participle
                        </p>
                        <div className="mt-5 rounded-lg bg-black/30 p-4 text-center">
                            <p className="text-white">
                                When I arrived, the film <strong className="text-purple-400">had already started</strong>.
                            </p>
                            <p className="mt-2 text-sm italic text-slate-400">
                                Mon arrivee = repere passe. Le debut du film = encore avant.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Une action avant une autre action passee",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C'est l'usage central: on combine souvent <strong>past perfect</strong> avec{" "}
                        <strong>past simple</strong> pour marquer l'ordre des evenements.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border-l-4 border-purple-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Evenement ancien</h4>
                            <p className="text-slate-300">
                                She <strong>had left</strong> before I called.
                            </p>
                        </div>
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Repere passe</h4>
                            <p className="text-slate-300">
                                I <strong>called</strong> at 8 p.m.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <ul className="space-y-3 text-slate-200">
                            <li>By the time we got to the station, the train had left.</li>
                            <li>They were tired because they had worked all night.</li>
                            <li>I couldn't get in because I had forgotten my keys.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "2. Marqueurs utiles et emplois frequents",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">already / just / never</h4>
                            <p className="text-slate-300">She had already eaten.</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">before / after / by the time</h4>
                            <p className="text-slate-300">After he had finished, he went home.</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Cause dans le passe</h4>
                            <p className="text-slate-300">She was upset because she had lost her wallet.</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Autre emploi important
                        </p>
                        <p className="text-slate-200">
                            On retrouve aussi souvent le past perfect dans le <strong>reported speech</strong> quand
                            on raconte apres coup ce que quelqu'un a dit ou ce qui etait deja vrai avant un moment passe.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "3. Les erreurs classiques",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-red-300">Sur-utilisation</h4>
                            <p className="text-slate-200">
                                On n'a pas besoin du past perfect a chaque fois que deux actions sont au passe. Il sert
                                seulement quand on veut <strong>clarifier l'anteriorite</strong>.
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Bonne logique</h4>
                            <p className="text-slate-200">
                                Utilise le past perfect pour l'action plus ancienne, puis le past simple pour le repere.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                            Compare
                        </p>
                        <div className="space-y-3 text-slate-200">
                            <p>
                                <strong>When I arrived, they left.</strong>: ordre peu clair ou succession simple.
                            </p>
                            <p>
                                <strong>When I arrived, they had left.</strong>: ils etaient deja partis.
                            </p>
                        </div>
                    </div>
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
                            question: "When we arrived, the concert ___.",
                            options: ["had started", "started after us"],
                            correctAnswer: 0,
                            explanation: "Le concert avait deja commence avant notre arrivee.",
                        },
                        {
                            id: 2,
                            question: "She was upset because she ___ her phone.",
                            options: ["had lost", "lost later"],
                            correctAnswer: 0,
                            explanation: "La perte du telephone est anterieure a l'emotion.",
                        },
                        {
                            id: 3,
                            question: "By the time I called, he ___.",
                            options: ["had gone to bed", "goes to bed"],
                            correctAnswer: 0,
                            explanation: "L'action plus ancienne prend le past perfect.",
                        },
                        {
                            id: 4,
                            question: "Choose the best option: After they ___ dinner, they went for a walk.",
                            options: ["had finished", "finish"],
                            correctAnswer: 0,
                            explanation: "L'action de finir le repas est anterieure a la promenade.",
                        },
                        {
                            id: 5,
                            question: "The shop ___ by the time we got there.",
                            options: ["had closed", "closed now"],
                            correctAnswer: 0,
                            explanation: "La fermeture etait deja accomplie a notre arrivee.",
                        },
                        {
                            id: 6,
                            question: "I couldn't pay because I ___ my wallet at home.",
                            options: ["had left", "left after"],
                            correctAnswer: 0,
                            explanation: "L'oubli du portefeuille explique la situation passee.",
                        },
                        {
                            id: 7,
                            question: "Le past perfect sert surtout a montrer ...",
                            options: ["une habitude presente", "une anteriorite dans le passe"],
                            correctAnswer: 1,
                            explanation: "C'est le temps de l'action deja accomplie avant un autre point passe.",
                        },
                        {
                            id: 8,
                            question: "By 2001, she ___ to five countries in Europe.",
                            options: ["had been", "was being"],
                            correctAnswer: 0,
                            explanation: "On parle du temps accumule jusqu'a un point du passe.",
                        },
                        {
                            id: 9,
                            question: "Which sentence is best if the keys were forgotten before leaving home?",
                            options: [
                                "I forgot my keys and I couldn't get in.",
                                "I couldn't get in because I had forgotten my keys."
                            ],
                            correctAnswer: 1,
                            explanation: "Le past perfect clarifie bien la cause deja anterieure.",
                        },
                        {
                            id: 10,
                            question: "Had she ___ the message before the meeting started?",
                            options: ["seen", "saw"],
                            correctAnswer: 0,
                            explanation: "Question au past perfect: Had + sujet + past participle.",
                        }
                    ]}
                />
            )
        }
    ]
};
