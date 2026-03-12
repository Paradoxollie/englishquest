import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course41: LessonContent = {
    courseNumber: 41,
    title: "Le Regret (Third Conditional)",
    objective: "Exprimer un passe different et le resultat qui aurait pu arriver autrement.",
    sections: [
        {
            title: "0. La formule du passe imagine",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le <strong>third conditional</strong> sert a parler d'un passe qui n'a pas eu lieu. On imagine
                        une autre realite, puis on montre la consequence qui aurait pu suivre.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                        <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-rose-300 mb-4">
                            La formule cle
                        </p>
                        <div className="grid gap-3 md:grid-cols-2 text-center font-mono text-white">
                            <div className="rounded-lg bg-slate-800 p-4 text-emerald-300">
                                IF + past perfect
                                <div className="mt-2 text-xs text-slate-400">if + had + past participle</div>
                            </div>
                            <div className="rounded-lg bg-slate-800 p-4 text-cyan-300">
                                would / could / might have + past participle
                                <div className="mt-2 text-xs text-slate-400">resultat imagine</div>
                            </div>
                        </div>

                        <div className="mt-5 rounded-lg bg-black/30 p-4 text-center">
                            <p className="text-xl text-white">
                                If I <strong className="text-emerald-400">had left</strong> earlier, I{" "}
                                <strong className="text-cyan-400">would have caught</strong> the train.
                            </p>
                            <p className="mt-2 text-sm italic text-slate-400">
                                En vrai: je suis parti trop tard, donc j'ai rate le train.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Quand l'utiliser",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        On l'utilise surtout pour trois idees: le regret, l'explication d'un echec, ou une consequence
                        positive qui aurait ete possible dans un autre scenario.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border-l-4 border-rose-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Regret</h4>
                            <p className="text-slate-300">
                                If I had studied more, I would have passed.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                Je regrette de ne pas avoir assez travaille.
                            </p>
                        </div>

                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Explication</h4>
                            <p className="text-slate-300">
                                If they had checked the map, they would not have got lost.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                On explique la cause de l'erreur.
                            </p>
                        </div>

                        <div className="rounded-xl border-l-4 border-amber-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Possibilite alternative</h4>
                            <p className="text-slate-300">
                                If you had called me, I could have helped you.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                <strong>could have</strong> = capacite possible.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                            Nuances utiles
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li>
                                <strong className="text-white">would have</strong> = resultat probable
                            </li>
                            <li>
                                <strong className="text-white">could have</strong> = possibilite ou capacite
                            </li>
                            <li>
                                <strong className="text-white">might have</strong> = resultat seulement possible, moins certain
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "2. Les pieges a eviter",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le piege principal est toujours le meme: on ne met pas <strong>would have</strong> dans la
                        partie apres <strong>if</strong>.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-red-500/60 bg-red-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-red-300">Erreur classique</h4>
                            <p className="text-lg text-white line-through">
                                If I would have known, I would have come.
                            </p>
                            <p className="mt-3 text-sm text-red-200">
                                Beaucoup de gens le disent a l'oral, mais la forme reste consideree comme incorrecte.
                            </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Bonne structure</h4>
                            <p className="text-lg text-white">
                                If I <strong className="text-emerald-400">had known</strong>, I{" "}
                                <strong className="text-cyan-400">would have come</strong>.
                            </p>
                            <p className="mt-3 text-sm text-emerald-200">
                                <strong>had known</strong> dans la condition, <strong>would have come</strong> dans le resultat.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            A retenir
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li>Le third conditional parle d'un passe impossible a changer.</li>
                            <li>Il est souvent proche de l'idee de <strong>regret</strong>.</li>
                            <li>
                                Si le resultat continue dans le present, on entre parfois dans un <strong>mixed conditional</strong>,
                                mais la base reste la meme: un passe different.
                            </li>
                        </ul>
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
                            question: "If I ___ earlier, I would have caught the train.",
                            options: ["left", "had left"],
                            correctAnswer: 1,
                            explanation: "Dans la partie apres IF, on utilise le past perfect: had left.",
                        },
                        {
                            id: 2,
                            question: "She would have passed if she ___ more.",
                            options: ["had studied", "would have studied"],
                            correctAnswer: 0,
                            explanation: "Jamais de would have dans la proposition avec IF.",
                        },
                        {
                            id: 3,
                            question: "If we had known about the traffic, we ___ another road.",
                            options: ["would have taken", "took"],
                            correctAnswer: 0,
                            explanation: "Le resultat imagine se construit avec would have + past participle.",
                        },
                        {
                            id: 4,
                            question: "If you had called me, I ___ you.",
                            options: ["could have helped", "had helped"],
                            correctAnswer: 0,
                            explanation: "Could have helped exprime une aide qui etait possible dans cette realite alternative.",
                        },
                        {
                            id: 5,
                            question: "They ___ on time if they had left earlier.",
                            options: ["would arrive", "would have arrived"],
                            correctAnswer: 1,
                            explanation: "Le third conditional parle d'un resultat passe: would have arrived.",
                        },
                        {
                            id: 6,
                            question: "Choisis la phrase correcte.",
                            options: [
                                "If I would have seen her, I would have spoken to her.",
                                "If I had seen her, I would have spoken to her.",
                            ],
                            correctAnswer: 1,
                            explanation: "La condition correcte est if + past perfect.",
                        },
                        {
                            id: 7,
                            question: "If he had worn a coat, he ___ cold.",
                            options: ["wouldn't have been", "hadn't been"],
                            correctAnswer: 0,
                            explanation: "Le resultat imagine se forme avec would not have been.",
                        },
                        {
                            id: 8,
                            question: "We might have won if we ___ better.",
                            options: ["had played", "played"],
                            correctAnswer: 0,
                            explanation: "Avec if, on garde le past perfect pour le passe imagine.",
                        },
                        {
                            id: 9,
                            question: "If Emma had remembered the meeting, she ___ late.",
                            options: ["wouldn't have been", "won't be"],
                            correctAnswer: 0,
                            explanation: "On parle d'un resultat passe different.",
                        },
                        {
                            id: 10,
                            question: "Le third conditional sert surtout a parler de ...",
                            options: ["faits generaux", "situations passees imaginaires"],
                            correctAnswer: 1,
                            explanation: "Il sert a imaginer un autre passe et un autre resultat.",
                        }
                    ]}
                />
            )
        }
    ]
};
