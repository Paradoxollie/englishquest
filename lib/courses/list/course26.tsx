import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course26: LessonContent = {
    courseNumber: 26,
    title: "Comparaison : Past Simple vs Present Perfect",
    objective: "Distinguer l&apos;action révolue du bilan présent.",
    sections: [
        {
            title: "1. La Distinction Fondamentale",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        La différence ne réside pas dans la traduction française, mais dans la <strong className="text-white">période de temps</strong> considérée.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-slate-500 shadow-xl opacity-90">
                            <h4 className="text-slate-400 font-extrabold text-lg uppercase mb-4">Past Simple</h4>

                            <p className="text-slate-300 mb-4 text-sm font-medium">
                                Action située dans une <strong className="text-white">période de temps terminée</strong> (coupée du présent).
                            </p>

                            <div className="bg-black/30 p-4 rounded border border-slate-700 space-y-2">
                                <p className="text-slate-400 text-xs uppercase font-bold">Marqueurs de temps révolus :</p>
                                <ul className="text-slate-300 text-sm list-disc pl-4 space-y-1">
                                    <li>Yesterday</li>
                                    <li>Last week / Last year</li>
                                    <li>In 2010</li>
                                    <li>...Ago</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-emerald-500 shadow-xl">
                            <h4 className="text-emerald-400 font-extrabold text-lg uppercase mb-4">Present Perfect</h4>

                            <p className="text-slate-300 mb-4 text-sm font-medium">
                                Action située dans une <strong className="text-white">période de temps non terminée</strong> ou ayant une conséquence présente.
                            </p>

                            <div className="bg-emerald-900/20 p-4 rounded border border-emerald-500/30 space-y-2">
                                <p className="text-emerald-400 text-xs uppercase font-bold">Marqueurs de temps ouverts :</p>
                                <ul className="text-slate-300 text-sm list-disc pl-4 space-y-1">
                                    <li>Today / This week</li>
                                    <li>Just / Already / Yet</li>
                                    <li>Ever / Never (dans sa vie)</li>
                                    <li>Recently / So far</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Règle Stricte : Le Marqueur de Temps",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        En anglais, la présence d&apos;une date ou d&apos;un moment précis dans le passé impose grammaticalement le Past Simple.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-4 rounded border-l-4 border-slate-500">
                            <h4 className="text-white font-bold mb-2">L&apos;Action Datée (Past Simple)</h4>
                            <p className="text-sm text-slate-400 mb-2">Dès que vous répondez à la question <strong>"When?"</strong>, vous devez utiliser le Past Simple.</p>
                            <div className="bg-black/40 p-3 rounded">
                                <p className="text-white">"I <strong className="text-slate-400">lost</strong> my keys <span className="underline decoration-slate-500">yesterday</span>."</p>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-4 rounded border-l-4 border-emerald-500">
                            <h4 className="text-white font-bold mb-2">Le Constat / Résultat (Present Perfect)</h4>
                            <p className="text-sm text-slate-400 mb-2">Si le temps n&apos;est pas précisé et que l&apos;important est le résultat actuel.</p>
                            <div className="bg-black/40 p-3 rounded">
                                <p className="text-white">"I <strong className="text-emerald-400">have lost</strong> my keys. I can&apos;t open the door."</p>
                                <p className="text-xs text-slate-500 mt-1">(Peu importe quand, le fait est que je ne les ai plus).</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Analyse Comparative",
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-900/20 p-5 rounded border border-blue-500/50">
                        <h4 className="text-blue-400 font-bold mb-4 uppercase text-sm">
                            Erreur Fréquente à Éviter
                        </h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Il est incorrect de mélanger l'auxiliaire "Have" (présent) avec un marqueur de temps passé.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/40 p-3 rounded border border-red-500/30">
                                <p className="text-red-400 font-bold text-xs mb-1">INCORRECT</p>
                                <p className="text-slate-400 line-through">"I <strong className="text-red-500">have arrived</strong> yesterday."</p>
                                <p className="text-xs text-slate-500 mt-2">Conflit : Have (Présent) vs Yesterday (Passé).</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-emerald-500/30">
                                <p className="text-emerald-400 font-bold text-xs mb-1">CORRECT</p>
                                <p className="text-white">"I <strong className="text-emerald-400">arrived</strong> yesterday."</p>
                                <p className="text-xs text-slate-500 mt-2">Cohérence : Verbe passé + Date passée.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz de Validation",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I ___ to the cinema yesterday.",
                            options: ["have gone", "went"],
                            correctAnswer: 1,
                            explanation: "'Yesterday' place l'action dans une période révolue. Past Simple obligatoire.",
                        },
                        {
                            id: 2,
                            question: "I ___ my homework. Can I go out?",
                            options: ["have done", "did"],
                            correctAnswer: 0,
                            explanation: "L'accent est mis sur le résultat présent (le travail est fait) sans date précise. Present Perfect.",
                        },
                        {
                            id: 3,
                            question: "___ you ever eaten frogs?",
                            options: ["Did", "Have"],
                            correctAnswer: 1,
                            explanation: "'Ever' interroge sur l'expérience de vie globale jusqu'à maintenant. Present Perfect.",
                        },
                        {
                            id: 4,
                            question: "When ___ you born?",
                            options: ["were", "have you been"],
                            correctAnswer: 0,
                            explanation: "La naissance est un événement daté, terminé dans le passé. Past Simple.",
                        },
                        {
                            id: 5,
                            question: "She ___ here for 10 years.",
                            options: ["lived", "has lived"],
                            correctAnswer: 1,
                            explanation: "Le contexte (For) et le fait qu'elle y soit encore (implicite sans date de fin) appellent le Present Perfect.",
                        },
                        {
                            id: 6,
                            question: "Shakespeare ___ many plays.",
                            options: ["has written", "wrote"],
                            correctAnswer: 1,
                            explanation: "Le sujet (Shakespeare) est décédé, sa période d'activité est terminée. Past Simple.",
                        },
                        {
                            id: 7,
                            question: "It is the first time I ___ a helicopter.",
                            options: ["flew", "have flown"],
                            correctAnswer: 1,
                            explanation: "Structure idiomatique de bilan 'It is the first time...' = Present Perfect.",
                        },
                        {
                            id: 8,
                            question: "Look! He ___ his leg.",
                            options: ["broke", "has broken"],
                            correctAnswer: 1,
                            explanation: "Observation d'un résultat présent ('Look!'). Present Perfect.",
                        },
                        {
                            id: 9,
                            question: "He ___ his leg last year.",
                            options: ["broke", "has broken"],
                            correctAnswer: 0,
                            explanation: "Marqueur temporel strict 'Last year'. Past Simple.",
                        },
                        {
                            id: 10,
                            question: "At 11pm last night, I ___ to bed.",
                            options: ["went", "have gone"],
                            correctAnswer: 0,
                            explanation: "Heure et date précises dans le passé. Past Simple.",
                        },
                    ]}
                />
            )
        }
    ]
};