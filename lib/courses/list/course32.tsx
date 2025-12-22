import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course32: LessonContent = {
    courseNumber: 32,
    title: "L'Imaginaire (Second Conditional)",
    objective: "Exprimer des rêves, des hypothèses et des situations imaginaires.",
    sections: [
        {
            title: "0. Boîte à Outils (Vocabulaire)",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Mots clés pour ce cours :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Dream</span>
                            <span className="text-slate-500 text-sm">Rêver</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Rich / Poor</span>
                            <span className="text-slate-500 text-sm">Riche / Pauvre</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">World</span>
                            <span className="text-slate-500 text-sm">Monde</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Fly</span>
                            <span className="text-slate-500 text-sm">Voler (oiseau)</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Le Monde du Rêve",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le <strong>Second Conditional</strong> sert à parler de choses qui ne sont <strong>PAS RÉELLES</strong> maintenant.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg opacity-50">
                            <h4 className="text-slate-500 font-bold uppercase text-xs mb-2">RÉALITÉ (First Conditional)</h4>
                            <p className="text-white">"If I have time..."</p>
                            <p className="text-xs text-slate-500 italic">(Si j'ai du temps ➔ C'est possible que ça arrive.)</p>
                        </div>
                        <div className="bg-slate-800 border-2 border-purple-500 p-4 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                            <h4 className="text-purple-400 font-bold uppercase text-xs mb-2">RÊVE (Second Conditional)</h4>
                            <p className="text-white text-lg">"If I <strong className="text-purple-400">had</strong> time..."</p>
                            <p className="text-xs text-slate-400 italic">(Si j'avais du temps ➔ Mais je n'en ai pas. Je rêve.)</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Secret : Le 'Passé Distant'",
            content: (
                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-xl border border-purple-500/30">
                        <p className="text-slate-300 mb-4">
                            Voici le secret : En anglais, on utilise le <strong>PASSÉ (Past Simple)</strong> pour montrer qu'on est <strong>LOIN de la réalité</strong>.
                            <br /><span className="text-sm italic text-slate-500">Ce n'est pas le passé du temps (hier), c'est le passé de la distance (imaginaire).</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-center font-mono text-lg mt-6">
                            <div className="bg-purple-900/20 p-3 rounded-lg text-purple-400 border border-purple-500/50">
                                IF + PAST SIMPLE
                                <div className="text-xs text-slate-400 mt-1">(La Condition Imaginaire)</div>
                            </div>
                            <div className="text-white font-bold">➔</div>
                            <div className="bg-pink-900/20 p-3 rounded-lg text-pink-400 border border-pink-500/50">
                                WOULD + VERBE
                                <div className="text-xs text-slate-400 mt-1">(Le Résultat Rêvé)</div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-white text-xl">"If I <strong className="text-purple-400">had</strong> a million dollars, I <strong className="text-pink-400">would buy</strong> an island."</p>
                            <p className="text-sm text-slate-400 italic mt-2">
                                (Si j'avais un million... j'achèterais une île.)
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 flex items-start gap-4">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">🔊</div>
                        <div>
                            <h5 className="text-blue-300 font-bold text-sm mb-1">ASTUCE PRONONCIATION</h5>
                            <p className="text-slate-300 text-sm">
                                Le 'L' dans <strong>WOULD</strong> est silencieux !
                                <br />On prononce <strong>"WOU-D"</strong> (comme "Wood" / Bois).
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. L'Exception : 'If I WERE...'",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Avec le verbe <strong>TO BE</strong>, il y a une règle spéciale pour l'imaginaire.
                        <br />On utilise <strong>WERE</strong> pour tout le monde (Je, Tu, Il, Elle...).
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-yellow-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-yellow-400 font-bold mb-1">SI J'ÉTAIS TOI...</h4>
                                    <p className="text-white text-lg">"If I <strong>were</strong> you..."</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-yellow-900 text-yellow-200 px-2 py-1 rounded">TRÈS COURANT</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 italic">On l'utilise tout le temps pour donner des conseils.</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-slate-500">
                            <h4 className="text-slate-400 font-bold mb-1">SI ELLE ÉTAIT ICI...</h4>
                            <p className="text-white text-lg">"If she <strong>were</strong> here..." (et pas <s>was</s>)</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "4. Négations et Questions",
            content: (
                <div className="space-y-6">
                    <div className="bg-slate-800 p-5 rounded-lg">
                        <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">La Forme Négative (-)</h4>
                        <p className="text-slate-300 mb-2">On utilise <strong>DIDN'T</strong> (Passé) et <strong>WOULDN'T</strong> (Conditionnel).</p>
                        <p className="text-indigo-300 text-lg">"If I <strong>didn't</strong> have to work, I <strong>wouldn't</strong> go."</p>
                        <p className="text-sm text-slate-500 italic">(Si je n'avais pas à travailler, je n'irais pas.)</p>
                    </div>

                    <div className="bg-slate-800 p-5 rounded-lg">
                        <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">La Question (?)</h4>
                        <p className="text-slate-300 mb-2">On place <strong>WOULD</strong> au début de la conséquence.</p>
                        <p className="text-indigo-300 text-lg">"What <strong>would you do</strong> if you <strong>saw</strong> a ghost?"</p>
                        <p className="text-sm text-slate-500 italic">(Que ferais-tu si tu voyais un fantôme ?)</p>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz Imaginaire",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "If I ___ rich, I would help everyone.",
                            options: ["was", "were"],
                            correctAnswer: 1,
                            explanation: "Dans l'imaginaire (Second Conditional), on utilise WERE pour tout le monde.",
                        },
                        {
                            id: 2,
                            question: "If I found a wallet, I ___ return it.",
                            options: ["will", "would"],
                            correctAnswer: 1,
                            explanation: "Found est au passé (imaginaire) ➔ Donc on utilise WOULD (le rêve).",
                        },
                        {
                            id: 3,
                            question: "What would you do if you ___ fly?",
                            options: ["can", "could"],
                            correctAnswer: 1,
                            explanation: "On doit utiliser le passé pour l'imaginaire : CAN devient COULD.",
                        },
                        {
                            id: 4,
                            question: "If I didn't know the answer, I ___ ask.",
                            options: ["would", "will"],
                            correctAnswer: 0,
                            explanation: "Didn't (Passé) ➔ Would (Conditionnel).",
                        },
                        {
                            id: 5,
                            question: "___ you go if I paid for you?",
                            options: ["Would", "Will"],
                            correctAnswer: 0,
                            explanation: "Paid est au passé. On est dans une hypothèse ➔ Would.",
                        },
                        {
                            id: 6,
                            question: "If I ___ you, I would study harder.",
                            options: ["am", "were"],
                            correctAnswer: 1,
                            explanation: "Expression classique du conseil : 'If I WERE you' (Si j'étais toi).",
                        },
                        {
                            id: 7,
                            question: "If we lived in Spain, we ___ happy.",
                            options: ["would be", "will be"],
                            correctAnswer: 0,
                            explanation: "Lived (Passé) implique l'imaginaire ➔ Would be.",
                        },
                        {
                            id: 8,
                            question: "I wouldn't buy this car if I ___ you.",
                            options: ["was", "were"],
                            correctAnswer: 1,
                            explanation: "Toujours 'WERE' avec 'If I' dans le 2nd Conditionnel.",
                        },
                        {
                            id: 9,
                            question: "If I had a dog, I ___ walk him every day.",
                            options: ["would", "will"],
                            correctAnswer: 0,
                            explanation: "Had (Passé) ➔ Would (Conditionnel).",
                        },
                        {
                            id: 10,
                            question: "If she ___ the truth, she would be angry.",
                            options: ["knows", "knew"],
                            correctAnswer: 1,
                            explanation: "Pour que la conséquence soit 'Would', la condition doit être au PASSÉ (Knew).",
                        }
                    ]}
                />
            )
        }
    ]
};