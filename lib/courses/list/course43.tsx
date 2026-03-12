import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course43: LessonContent = {
    courseNumber: 43,
    title: "Le Futur Anterieur et Continu (Will be doing / have done)",
    objective: "Distinguer une action en cours dans le futur d'un resultat deja acheve avant un repere futur.",
    sections: [
        {
            title: "0. Deux manieres de regarder le futur",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        A ce niveau, on ne parle plus seulement du futur en bloc. On choisit l'angle exact:
                        l'action sera-t-elle <strong>en cours</strong> ou deja <strong>terminee</strong> a un moment futur?
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-cyan-300">Future continuous</h4>
                            <p className="font-mono text-white">will be + verb-ing</p>
                            <p className="mt-3 text-slate-200">
                                Action en cours a un moment futur.
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                This time tomorrow, I will be flying to Rome.
                            </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Future perfect</h4>
                            <p className="font-mono text-white">will have + past participle</p>
                            <p className="mt-3 text-slate-200">
                                Action terminee avant un repere futur.
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                By Friday, I will have finished the report.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Future continuous : action en cours dans le futur",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le <strong>future continuous</strong> sert a imaginer une action qui sera en train de se
                        derouler a un moment precis dans le futur.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <ul className="space-y-3 text-slate-200">
                            <li>
                                This time next week, we <strong className="text-cyan-400">will be staying</strong> by the sea.
                            </li>
                            <li>
                                At 8 p.m., she <strong className="text-cyan-400">will be giving</strong> her presentation.
                            </li>
                            <li>
                                I will post your letter. I <strong className="text-cyan-400">will be passing</strong> a post office anyway.
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Usage fin
                        </p>
                        <p className="text-slate-200">
                            On l'utilise aussi pour des suppositions polies ou neutres sur le programme de quelqu'un:
                            <em className="text-white"> Will you be using the car tonight?</em>
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "2. Future perfect : action deja terminee avant un repere futur",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le <strong>future perfect</strong> regarde le futur comme si on etait deja arrive a un point
                        plus loin. On parle alors d'une action qui sera finie <strong>avant</strong> ce repere.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-white">
                            <p>
                                By 10 o'clock, they <strong className="text-emerald-400">will have landed</strong>.
                            </p>
                            <p>
                                By the end of the month, I <strong className="text-emerald-400">will have worked</strong> here for six years.
                            </p>
                            <p>
                                Do you think she <strong className="text-emerald-400">will have seen</strong> the message by then?
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Marqueurs frequents</h4>
                            <p className="text-slate-300">by, by then, by the time, before, by next week</p>
                        </div>
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Idee centrale</h4>
                            <p className="text-slate-300">
                                On regarde en arriere depuis un point futur.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Bien choisir entre les deux",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-cyan-300">Action en cours</h4>
                            <p className="text-white">
                                At 9 p.m., I <strong>will be writing</strong> my essay.
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                                A 21h, l'action sera en train de se faire.
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Action terminee</h4>
                            <p className="text-white">
                                By 9 p.m., I <strong>will have written</strong> my essay.
                            </p>
                            <p className="mt-2 text-sm text-slate-300">
                                A 21h, l'action sera deja terminee.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-purple-300">
                            Extension utile
                        </p>
                        <p className="text-slate-200">
                            Pour insister sur la <strong>duree</strong>, on peut rencontrer le{" "}
                            <strong>future perfect continuous</strong>:
                            <em className="text-white"> By June, I will have been working here for ten years.</em>
                            Ici, l'idee cle est la longueur de l'activite, pas juste son achevement.
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
                            question: "This time tomorrow, we ___ over the Alps.",
                            options: ["will be flying", "will have flown"],
                            correctAnswer: 0,
                            explanation: "On imagine l'action en cours a un moment precis du futur.",
                        },
                        {
                            id: 2,
                            question: "By Friday, I ___ the report.",
                            options: ["will be finishing", "will have finished"],
                            correctAnswer: 1,
                            explanation: "By Friday indique une action terminee avant ce repere.",
                        },
                        {
                            id: 3,
                            question: "At 8 p.m., she ___ her clients.",
                            options: ["will be meeting", "will have met"],
                            correctAnswer: 0,
                            explanation: "A 20h, la reunion sera en cours.",
                        },
                        {
                            id: 4,
                            question: "Do you think they ___ there by midnight?",
                            options: ["will have got", "will be getting"],
                            correctAnswer: 0,
                            explanation: "On vise un resultat atteint avant minuit.",
                        },
                        {
                            id: 5,
                            question: "Don't call at 7. I ___ dinner then.",
                            options: ["will be cooking", "will have cooked"],
                            correctAnswer: 0,
                            explanation: "Then renvoie a un moment ou l'action sera en cours.",
                        },
                        {
                            id: 6,
                            question: "By next month, we ___ here for a year.",
                            options: ["will have lived", "will be living only"],
                            correctAnswer: 0,
                            explanation: "On regarde une periode complete avant un repere futur.",
                        },
                        {
                            id: 7,
                            question: "At noon, the team ___ the presentation, so wait until 1 p.m.",
                            options: ["will be giving", "will have given"],
                            correctAnswer: 0,
                            explanation: "A midi, la presentation sera en train de se derouler.",
                        },
                        {
                            id: 8,
                            question: "By the time you arrive, I ___ everything.",
                            options: ["will have prepared", "will be preparing"],
                            correctAnswer: 0,
                            explanation: "By the time annonce une action achevee avant ton arrivee.",
                        },
                        {
                            id: 9,
                            question: "Which sentence means the essay is already complete at 9 p.m.?",
                            options: [
                                "At 9 p.m., I will be writing my essay.",
                                "By 9 p.m., I will have written my essay.",
                            ],
                            correctAnswer: 1,
                            explanation: "By + heure future + future perfect = travail deja termine.",
                        },
                        {
                            id: 10,
                            question: "By June, she ___ at the company for ten years. Which form stresses duration?",
                            options: ["will have been working", "will be working"],
                            correctAnswer: 0,
                            explanation: "Le future perfect continuous met l'accent sur la duree.",
                        }
                    ]}
                />
            )
        }
    ]
};
