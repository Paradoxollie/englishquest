import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course42: LessonContent = {
    courseNumber: 42,
    title: "Les Souhaits et Regrets (I wish...)",
    objective: "Choisir entre wish + past simple, wish + past perfect et wish + would sans les confondre avec hope.",
    sections: [
        {
            title: "0. Le systeme de I wish",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        <strong>I wish</strong> ne sert pas a parler d'un futur probable. Il sert surtout a exprimer
                        un manque, un regret ou une irritation.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Regret sur le present</h4>
                            <p className="text-slate-300">I wish I knew the answer.</p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                Je ne connais pas la reponse maintenant.
                            </p>
                        </div>
                        <div className="rounded-xl border-l-4 border-rose-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Regret sur le passe</h4>
                            <p className="text-slate-300">I wish I had studied harder.</p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                Je regrette une action deja terminee.
                            </p>
                        </div>
                        <div className="rounded-xl border-l-4 border-amber-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Agacement / changement voulu</h4>
                            <p className="text-slate-300">I wish you would stop shouting.</p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                Je veux que la situation change.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Wish pour le present ou le futur irreel",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Apres <strong>wish</strong>, on utilise souvent une forme au <strong>past simple</strong> pour
                        parler d'une situation presente que l'on voudrait differente.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-white">
                            <p>
                                I wish I <strong className="text-cyan-400">had</strong> more time.
                            </p>
                            <p>
                                I wish I <strong className="text-cyan-400">were</strong> taller.
                            </p>
                            <p>
                                I wish we <strong className="text-cyan-400">lived</strong> closer to the station.
                            </p>
                        </div>
                        <p className="mt-4 text-sm text-slate-400">
                            Ici, le passe n'indique pas le passe chronologique. Il marque surtout la distance avec la realite.
                        </p>
                    </div>

                    <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Point fin
                        </p>
                        <p className="text-slate-200">
                            Avec <strong>be</strong>, on rencontre souvent <strong>I wish I were</strong>, surtout dans
                            un registre soigne. <strong>I wish I was</strong> existe aussi dans l'usage courant.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "2. Wish pour le regret sur le passe",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand on regrette une action deja terminee, on utilise <strong>wish + past perfect</strong>.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-white">
                            <p>
                                I wish I <strong className="text-rose-400">had known</strong> about the meeting.
                            </p>
                            <p>
                                She wishes she <strong className="text-rose-400">hadn't said</strong> that.
                            </p>
                            <p>
                                We wish we <strong className="text-rose-400">had booked</strong> earlier.
                            </p>
                        </div>
                        <p className="mt-4 text-sm text-slate-400">
                            C'est la structure jumelle du third conditional, mais ici on insiste sur le ressenti du locuteur.
                        </p>
                    </div>

                    <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                            Raccourci utile
                        </p>
                        <p className="text-slate-200">
                            <strong>If only</strong> fonctionne presque comme <strong>I wish</strong>, mais avec plus
                            d'intensite: <em>If only I had listened to you.</em>
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "3. Wish + would, et la difference avec hope",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        <strong>wish + would</strong> sert surtout a montrer une irritation ou un desir de changement.
                        Pour une attente normale dans le futur, on utilise plutot <strong>hope</strong>.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Correct</h4>
                            <ul className="space-y-2 text-slate-200">
                                <li>I wish you would answer my messages.</li>
                                <li>I hope the weather is nice tomorrow.</li>
                                <li>I hope they didn't miss the train.</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-red-300">A eviter</h4>
                            <ul className="space-y-2 text-slate-200">
                                <li className="line-through">I wish the weather is nice tomorrow.</li>
                                <li className="line-through">I wish they didn't miss the train.</li>
                                <li className="line-through">I wish to pass my exam tomorrow.</li>
                            </ul>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        En pratique:
                    </p>
                    <ul className="space-y-3 text-slate-200">
                        <li>
                            <strong>wish + past simple</strong>: present irreel
                        </li>
                        <li>
                            <strong>wish + past perfect</strong>: regret sur le passe
                        </li>
                        <li>
                            <strong>wish + would</strong>: irritation ou changement attendu
                        </li>
                        <li>
                            <strong>hope</strong>: souhait realiste
                        </li>
                    </ul>
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
                            question: "I wish I ___ the answer.",
                            options: ["knew", "had known"],
                            correctAnswer: 0,
                            explanation: "Regret sur le present: wish + past simple.",
                        },
                        {
                            id: 2,
                            question: "She wishes she ___ so rude yesterday.",
                            options: ["hadn't been", "weren't"],
                            correctAnswer: 0,
                            explanation: "Regret sur le passe: wish + past perfect.",
                        },
                        {
                            id: 3,
                            question: "I wish you ___ making that noise.",
                            options: ["would stop", "stopped yesterday"],
                            correctAnswer: 0,
                            explanation: "Wish + would exprime l'agacement et le desir de changement.",
                        },
                        {
                            id: 4,
                            question: "Choisis la phrase correcte pour demain.",
                            options: ["I hope the train is on time tomorrow.", "I wish the train is on time tomorrow."],
                            correctAnswer: 0,
                            explanation: "Pour un souhait realiste dans le futur, on utilise hope.",
                        },
                        {
                            id: 5,
                            question: "We wish we ___ closer to our family.",
                            options: ["lived", "had lived yesterday"],
                            correctAnswer: 0,
                            explanation: "Situation presente irreelle: wish + past simple.",
                        },
                        {
                            id: 6,
                            question: "I wish I ___ that email before sending it.",
                            options: ["read", "had read"],
                            correctAnswer: 1,
                            explanation: "Action passee regrettee: had read.",
                        },
                        {
                            id: 7,
                            question: "He wishes his neighbours ___ more considerate.",
                            options: ["were", "had been yesterday"],
                            correctAnswer: 0,
                            explanation: "On parle d'une situation actuelle: were.",
                        },
                        {
                            id: 8,
                            question: "I wish it ___ raining so we could go out now.",
                            options: ["would stop", "stops"],
                            correctAnswer: 0,
                            explanation: "Wish + would convient bien pour une situation irritante qui continue.",
                        },
                        {
                            id: 9,
                            question: "If only I ___ more careful!",
                            options: ["had been", "am"],
                            correctAnswer: 0,
                            explanation: "If only suit la meme logique que wish ici: regret sur le passe.",
                        },
                        {
                            id: 10,
                            question: "I wish I ___ more free time these days.",
                            options: ["had", "have had"],
                            correctAnswer: 0,
                            explanation: "Regret sur le present: wish + past simple.",
                        }
                    ]}
                />
            )
        }
    ]
};
