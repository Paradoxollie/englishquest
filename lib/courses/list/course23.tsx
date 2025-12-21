import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course23: LessonContent = {
    courseNumber: 23,
    title: "La Durée : FOR vs SINCE",
    objective: "Exprimer une durée avec une précision chirurgicale.",
    sections: [
        {
            title: "1. La Metaphore Visuelle",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour ne plus jamais hésiter, visualisez le temps.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-indigo-500 shadow-xl">
                            <h4 className="text-indigo-400 font-extrabold mb-2 text-2xl flex items-center gap-3">
                                <span>📦</span> FOR
                            </h4>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">LE "PAQUET" DE TEMPS</p>

                            <p className="text-slate-300 mb-4 text-justify">
                                Imaginez que vous mettez le temps dans une boîte. Vous regardez la <strong>DURÉE TOTALE</strong> de l&apos;action.
                            </p>

                            <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
                                <ul className="text-slate-200 space-y-2 font-medium">
                                    <li>&bull; For <strong className="text-white">10 minutes</strong></li>
                                    <li>&bull; For <strong className="text-white">3 weeks</strong></li>
                                    <li>&bull; For <strong className="text-white">a long time</strong></li>
                                    <li>&bull; For <strong className="text-white">ages</strong> (des lustres)</li>
                                </ul>
                            </div>
                            <p className="text-indigo-300 mt-4 font-bold text-lg text-center">"Une quantité mesurable"</p>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-pink-500 shadow-xl">
                            <h4 className="text-pink-400 font-extrabold mb-2 text-2xl flex items-center gap-3">
                                <span>📍</span> SINCE
                            </h4>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">LE POINT SUR LE CALENDRIER</p>

                            <p className="text-slate-300 mb-4 text-justify">
                                Imaginez une punaise plantée sur une date précise du calendrier. C&apos;est le <strong>DÉBUT</strong> de l&apos;action.
                            </p>

                            <div className="bg-pink-900/20 p-4 rounded-lg border border-pink-500/30">
                                <ul className="text-slate-200 space-y-2 font-medium">
                                    <li>&bull; Since <strong className="text-white">Monday</strong></li>
                                    <li>&bull; Since <strong className="text-white">8:00 AM</strong></li>
                                    <li>&bull; Since <strong className="text-white">1995</strong></li>
                                    <li>&bull; Since <strong className="text-white">I was born</strong> (Date de naissance)</li>
                                </ul>
                            </div>
                            <p className="text-pink-300 mt-4 font-bold text-lg text-center">"Une date de départ"</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Piège Mortel : LA TRADUCTION",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Votre cerveau français veut traduire "Depuis" par "Since". C&apos;est l&apos;erreur fatale.
                        <br />En anglais, on ne traduit pas le mot, on traduit la <strong>LOGIQUE</strong>.
                    </p>

                    <div className="bg-red-950/30 p-6 rounded-lg border-2 border-red-600/50 space-y-6 relative overflow-hidden">
                        {/* Warning Stripe */}
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">DON&apos;T DO THIS</div>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 bg-black/40 p-4 rounded text-center">
                                <p className="text-sm text-slate-400 mb-1">Pensée : "Depuis 3 jours"</p>
                                <p className="line-through text-red-500 font-bold mb-1">"Since 3 days"</p>
                                <p className="text-emerald-400 font-bold text-xl anim-pulse">"FOR 3 days"</p>
                                <p className="text-xs text-emerald-600 mt-1">(3 jours = Une quantité)</p>
                            </div>

                            <div className="text-3xl text-slate-600">VS</div>

                            <div className="flex-1 bg-black/40 p-4 rounded text-center">
                                <p className="text-sm text-slate-400 mb-1">Pensée : "Depuis 2010"</p>
                                <p className="line-through text-red-500 font-bold mb-1">"For 2010"</p>
                                <p className="text-emerald-400 font-bold text-xl">"SINCE 2010"</p>
                                <p className="text-xs text-emerald-600 mt-1">(2010 = Une date)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Duel Final : AGO vs FOR",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Comment faire la différence entre "Il y a 10 ans" (Ago) et "Depuis 10 ans" (For) ?
                        <br />Regardez si l&apos;action continue ou non.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-800 p-4 rounded border-l-8 border-amber-500 flex items-center gap-4">
                            <div className="bg-slate-900 p-3 rounded-full h-12 w-12 flex items-center justify-center text-xl">🏁</div>
                            <div>
                                <h4 className="text-amber-400 font-bold">AGO = C&apos;EST MORT (Past Simple)</h4>
                                <p className="text-white italic">"I arrived <strong className="text-amber-400">3 days ago</strong>."</p>
                                <p className="text-sm text-slate-500 mt-1">L&apos;action d&apos;arriver est terminée, bouclée. C&apos;est du passé pur.</p>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-4 rounded border-l-8 border-emerald-500 flex items-center gap-4">
                            <div className="bg-slate-900 p-3 rounded-full h-12 w-12 flex items-center justify-center text-xl">🔄</div>
                            <div>
                                <h4 className="text-emerald-400 font-bold">FOR = C&apos;EST VIVANT (Present Perfect)</h4>
                                <p className="text-white italic">"I have been here <strong className="text-emerald-400">for 3 days</strong>."</p>
                                <p className="text-sm text-slate-500 mt-1">Je suis encore là au moment où je parle. Le lien passé-présent est actif.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz : Maîtrise Totale",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I have lived in London ___ ten years.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "Ten years = Une décennie = Une quantité de temps (Boîte) = FOR.",
                        },
                        {
                            id: 2,
                            question: "I have lived in London ___ 2010.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "2010 = Une date sur le calendrier (Punaise) = SINCE.",
                        },
                        {
                            id: 3,
                            question: "It has been raining ___ I got up.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "'I got up' (mon réveil) est un point précis dans le temps = SINCE.",
                        },
                        {
                            id: 4,
                            question: "He has been waiting ___ a long time.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "'A long time' est une durée mesurable (même si floue) = FOR.",
                        },
                        {
                            id: 5,
                            question: "I have been working here ___ April.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "April = Un mois du calendrier = SINCE.",
                        },
                        {
                            id: 6,
                            question: "Kelly has been married ___ three years.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "Three years = Quantité = FOR.",
                        },
                        {
                            id: 7,
                            question: "She got married ___.",
                            options: ["three years ago", "for three years"],
                            correctAnswer: 0,
                            explanation: "PAST SIMPLE (Got married) = Période révolue = AGO.",
                        },
                        {
                            id: 8,
                            question: "We haven't seen them ___ ages.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "'Ages' (des lustres) est considéré comme une durée = FOR.",
                        },
                        {
                            id: 9,
                            question: "I haven't eaten ___ yesterday.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "Yesterday = Point de départ = SINCE.",
                        },
                        {
                            id: 10,
                            question: "I arrived in France ___.",
                            options: ["since 2 months", "2 months ago"],
                            correctAnswer: 1,
                            explanation: "Arrived (Past Simple) = Action finie = AGO.",
                        },
                    ]}
                />
            )
        }
    ]
};