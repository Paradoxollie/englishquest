import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course45: LessonContent = {
    courseNumber: 45,
    title: "Nuances de deduction passee (Must have / Can't have)",
    objective: "Exprimer des deductions sur un evenement passe avec le bon niveau de certitude.",
    sections: [
        {
            title: "0. Deviner le passe avec precision",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ici, on ne raconte pas directement un fait observe. On fait une deduction a partir d'indices.
                        Le choix du modal montre a quel point on est certain.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
                        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                            Structure de base
                        </p>
                        <p className="text-center font-mono text-xl text-white">
                            modal + have + past participle
                        </p>
                        <div className="mt-5 grid gap-3 md:grid-cols-3 text-sm">
                            <div className="rounded-lg bg-slate-800 p-4 text-center text-emerald-300">
                                must have
                                <div className="mt-2 text-slate-400">quasi certain</div>
                            </div>
                            <div className="rounded-lg bg-slate-800 p-4 text-center text-amber-300">
                                may / might / could have
                                <div className="mt-2 text-slate-400">possible</div>
                            </div>
                            <div className="rounded-lg bg-slate-800 p-4 text-center text-rose-300">
                                can't / couldn't have
                                <div className="mt-2 text-slate-400">impossible selon moi</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Must have, may have, might have, could have",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Must have</h4>
                            <p className="text-slate-300">
                                The lights are off. They <strong>must have gone</strong> home.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                C'est, pour moi, l'explication la plus logique.
                            </p>
                        </div>

                        <div className="rounded-xl border-l-4 border-amber-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">May / might / could have</h4>
                            <p className="text-slate-300">
                                She <strong>might have missed</strong> the bus.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                C'est possible, mais je ne suis pas sur.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                            Nuances utiles
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li><strong>must have</strong> = deduction forte</li>
                            <li><strong>may have / might have</strong> = possibilite</li>
                            <li><strong>could have</strong> = deduction possible aussi, souvent un peu moins frequent</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "2. Can't have, couldn't have, et ce qu'il ne faut pas melanger",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand quelque chose semble impossible, on utilise <strong>can't have</strong> ou{" "}
                        <strong>couldn't have</strong>.
                    </p>

                    <div className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-5">
                        <div className="space-y-3 text-white">
                            <p>She can't have driven there. Her car keys are still here.</p>
                            <p>It couldn't have been Tom. He was in Madrid yesterday.</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Ne pas confondre
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li>
                                <strong>should have</strong> = critique ou conseil retrospectif, pas deduction
                            </li>
                            <li>
                                <strong>could have</strong> peut aussi parler d'une possibilite non realisee, selon le contexte
                            </li>
                            <li>
                                <strong>mustn't have</strong> n'est pas la forme standard pour la deduction passee negative
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "3. Lire les indices avant de choisir le modal",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        La bonne reponse depend des preuves visibles. Ce n'est pas seulement une question de forme,
                        mais de logique.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Preuve forte</h4>
                            <p className="text-slate-300">must have</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Hypothese ouverte</h4>
                            <p className="text-slate-300">may / might / could have</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Contradiction claire</h4>
                            <p className="text-slate-300">can't have / couldn't have</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                        <p className="text-slate-200">
                            Exemple: <em>The door was locked and nothing was broken. The thief must have had a key.</em>
                            On ne sait pas exactement ce qui s'est passe, mais les indices orientent fortement la deduction.
                        </p>
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
                            question: "The lights are off and nobody is answering. They ___ home.",
                            options: ["must have gone", "can't have gone"],
                            correctAnswer: 0,
                            explanation: "Les indices rendent le depart tres probable.",
                        },
                        {
                            id: 2,
                            question: "She ___ driven here. Her car keys are still on the table.",
                            options: ["must have", "can't have"],
                            correctAnswer: 1,
                            explanation: "Les indices contredisent cette hypothese.",
                        },
                        {
                            id: 3,
                            question: "He isn't answering. He ___ his phone at home.",
                            options: ["might have left", "can't have left for sure"],
                            correctAnswer: 0,
                            explanation: "C'est une possibilite, pas une certitude.",
                        },
                        {
                            id: 4,
                            question: "The thief ___ had a key. The lock wasn't damaged.",
                            options: ["should have", "must have"],
                            correctAnswer: 1,
                            explanation: "Must have exprime une deduction forte.",
                        },
                        {
                            id: 5,
                            question: "It ___ been Julia I saw. She is abroad this week.",
                            options: ["must have", "couldn't have"],
                            correctAnswer: 1,
                            explanation: "La situation rend cette hypothese impossible.",
                        },
                        {
                            id: 6,
                            question: "Which one expresses criticism, not deduction?",
                            options: ["She should have called.", "She must have called."],
                            correctAnswer: 0,
                            explanation: "Should have critique une action manquante; ce n'est pas une deduction.",
                        },
                        {
                            id: 7,
                            question: "Police think the suspect ___ the country using a fake passport.",
                            options: ["can't have left", "may have left"],
                            correctAnswer: 1,
                            explanation: "L'enquete n'apporte qu'une hypothese possible.",
                        },
                        {
                            id: 8,
                            question: "We have milk in the fridge. Mo ___ some yesterday.",
                            options: ["must have bought", "couldn't have bought"],
                            correctAnswer: 0,
                            explanation: "C'est l'explication la plus logique au vu du resultat present.",
                        },
                        {
                            id: 9,
                            question: "The train is late, so they ___ arrived yet.",
                            options: ["must have", "can't have"],
                            correctAnswer: 1,
                            explanation: "Les indices rendent l'arrivee deja accomplie tres improbable.",
                        },
                        {
                            id: 10,
                            question: "Which form means 'possible but not certain'?",
                            options: ["must have", "might have"],
                            correctAnswer: 1,
                            explanation: "Might have exprime une deduction ouverte.",
                        }
                    ]}
                />
            )
        }
    ]
};
