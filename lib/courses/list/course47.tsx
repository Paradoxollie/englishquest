import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course47: LessonContent = {
    courseNumber: 47,
    title: "Connecteurs logiques avances (Although, Despite...)",
    objective: "Relier deux idees opposees avec la bonne structure grammaticale et le bon niveau de contraste.",
    sections: [
        {
            title: "0. Dire l'opposition sans casser la phrase",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand deux idees s'opposent, l'anglais ne choisit pas toujours la meme structure. Le vrai point
                        a maitriser ici, ce n'est pas seulement le sens: c'est la forme qui vient apres le connecteur.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-cyan-300">although / though / even though</h4>
                            <p className="text-white">+ clause complete</p>
                            <p className="mt-2 text-slate-300">
                                Although it was late, we kept working.
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">despite / in spite of</h4>
                            <p className="text-white">+ nom / groupe nominal / -ing</p>
                            <p className="mt-2 text-slate-300">
                                Despite the rain, we kept working.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Clause complete ou groupe nominal",
            content: (
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-slate-200">
                            <p>
                                <strong className="text-cyan-400">Although</strong> she was tired, she finished the report.
                            </p>
                            <p>
                                <strong className="text-emerald-400">Despite</strong> her tiredness, she finished the report.
                            </p>
                            <p>
                                <strong className="text-emerald-400">In spite of</strong> being tired, she finished the report.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Le point a memoriser
                        </p>
                        <p className="text-slate-200">
                            Apres <strong>although</strong>, il faut un sujet + verbe. Apres <strong>despite</strong> ou{" "}
                            <strong>in spite of</strong>, il faut un nom, un pronom ou un verbe en <strong>-ing</strong>.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "2. Transformations utiles",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        On doit souvent reformuler une phrase pour garder le meme sens tout en changeant de connecteur.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Version avec clause</h4>
                            <p className="text-slate-300">
                                Although he had no experience, he got the job.
                            </p>
                        </div>
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Version avec groupe nominal</h4>
                            <p className="text-slate-300">
                                Despite having no experience, he got the job.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <ul className="space-y-3 text-slate-200">
                            <li>
                                <strong>despite the fact that</strong> / <strong>in spite of the fact that</strong> permettent aussi de garder une clause complete.
                            </li>
                            <li>
                                <strong>though</strong> peut apparaitre en fin de phrase a l'oral: <em>Nice place. A bit noisy, though.</em>
                            </li>
                            <li>
                                <strong>even though</strong> marque souvent un contraste plus fort que <strong>although</strong>.
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "3. Les fautes les plus courantes",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-red-300">Erreur</h4>
                            <p className="text-white line-through">Despite he was tired, he continued.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Apres despite, on ne met pas directement une clause complete.
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Correct</h4>
                            <p className="text-white">Although he was tired, he continued.</p>
                            <p className="text-white mt-2">Despite being tired, he continued.</p>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        Le reflexe utile: si tu vois un verbe conjugue juste apres le connecteur, pense a{" "}
                        <strong>although</strong>. Si tu vois un nom ou un verbe en <strong>-ing</strong>, pense a{" "}
                        <strong>despite</strong> ou <strong>in spite of</strong>.
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
                            question: "___ it was raining, we went out.",
                            options: ["Despite", "Although"],
                            correctAnswer: 1,
                            explanation: "Apres although, on peut mettre une clause complete: it was raining.",
                        },
                        {
                            id: 2,
                            question: "___ the rain, we went out.",
                            options: ["Although", "Despite"],
                            correctAnswer: 1,
                            explanation: "Apres despite, on met un nom ou groupe nominal: the rain.",
                        },
                        {
                            id: 3,
                            question: "In spite of ___ tired, she finished the task.",
                            options: ["being", "was"],
                            correctAnswer: 0,
                            explanation: "Apres in spite of, on utilise ici le -ing.",
                        },
                        {
                            id: 4,
                            question: "Choose the correct sentence.",
                            options: [
                                "Despite he had no money, he travelled a lot.",
                                "Although he had no money, he travelled a lot.",
                            ],
                            correctAnswer: 1,
                            explanation: "Despite ne peut pas etre suivi directement d'une clause complete.",
                        },
                        {
                            id: 5,
                            question: "___ having very little time, they finished on schedule.",
                            options: ["Although", "Despite"],
                            correctAnswer: 1,
                            explanation: "Having very little time est une forme en -ing.",
                        },
                        {
                            id: 6,
                            question: "Even though means ...",
                            options: ["exactly the same register as a noun", "a stronger contrast"],
                            correctAnswer: 1,
                            explanation: "Even though renforce souvent l'idee de contraste.",
                        },
                        {
                            id: 7,
                            question: "___ the fact that he apologized, she stayed upset.",
                            options: ["Despite", "Although"],
                            correctAnswer: 0,
                            explanation: "Despite the fact that permet d'introduire une clause.",
                        },
                        {
                            id: 8,
                            question: "Nice idea. A bit risky, ___.",
                            options: ["despite", "though"],
                            correctAnswer: 1,
                            explanation: "Though peut se placer en fin de phrase dans un style courant.",
                        },
                        {
                            id: 9,
                            question: "Which pair has the same meaning?",
                            options: [
                                "Although she was ill / Despite being ill",
                                "Although being ill / Despite she was ill"
                            ],
                            correctAnswer: 0,
                            explanation: "La premiere paire respecte les deux structures correctes.",
                        },
                        {
                            id: 10,
                            question: "After despite, the safest structure is ...",
                            options: ["subject + verb only", "noun, pronoun or -ing"],
                            correctAnswer: 1,
                            explanation: "C'est la regle de base a memoriser.",
                        }
                    ]}
                />
            )
        }
    ]
};
