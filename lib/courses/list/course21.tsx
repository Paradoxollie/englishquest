import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course21: LessonContent = {
    courseNumber: 21,
    title: "Present Perfect (1) : Résultat Présent",
    objective: "Maîtriser le lien entre passé et présent.",
    sections: [
        {
            title: "1. La Mécanique (The Build)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le Present Perfect n&apos;est <strong className="text-red-400">PAS</strong> un temps du passé. C&apos;est un temps du <strong className="text-emerald-400">PRÉSENT</strong> qui regarde vers l&apos;arrière.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-emerald-500">
                        <h4 className="text-emerald-400 font-bold mb-4 text-lg">HAVE / HAS + PARTICIPE PASSÉ (V3)</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <p className="text-white">I <strong className="text-emerald-400">have finished</strong>.</p>
                                <p className="text-white">You <strong className="text-emerald-400">have finished</strong>.</p>
                                <p className="text-white">We <strong className="text-emerald-400">have finished</strong>.</p>
                                <p className="text-white">They <strong className="text-emerald-400">have finished</strong>.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-white">He <strong className="text-amber-400">has finished</strong>.</p>
                                <p className="text-white">She <strong className="text-amber-400">has finished</strong>.</p>
                                <p className="text-white">It <strong className="text-amber-400">has finished</strong>.</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-slate-400 text-xs italic">
                                * Rappel : Le participe passé des verbes réguliers est en <strong className="text-white">-ED</strong> (finished, played). Pour les irréguliers, c&apos;est la 3ème colonne (See &rarr; Saw &rarr; <strong className="text-white">Seen</strong>).
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Concept : Résultat Présent",
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-900/20 p-4 rounded border border-blue-500/50">
                        <h4 className="text-blue-400 font-bold mb-2 uppercase flex items-center gap-2">
                            <span>💡</span> LA LOGIQUE RIGOUREUSE
                        </h4>
                        <p className="text-slate-300">
                            On utilise le Present Perfect quand une action passée a une <strong className="text-white">conséquence visible maintenant</strong>. On ne s&apos;intéresse pas à "Quand" c&apos;est arrivé, mais à l&apos;état actuel.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-900 p-4 rounded border-l-4 border-emerald-500">
                            <p className="text-slate-400 text-xs mb-1">Situation A : Je cherche mes clés.</p>
                            <h4 className="text-white font-medium text-lg">"I <strong className="text-emerald-400">have lost</strong> my keys."</h4>
                            <p className="text-emerald-400 text-sm mt-1">➔ RÉSULTAT ACTUEL : Je ne les ai pas, je ne peux pas rentrer.</p>
                        </div>

                        <div className="bg-slate-900 p-4 rounded border-l-4 border-slate-600 opacity-75">
                            <p className="text-slate-400 text-xs mb-1">Situation B : Raconter une histoire (Past Simple).</p>
                            <h4 className="text-white font-medium text-lg">"I <strong className="text-slate-400">lost</strong> my keys yesterday."</h4>
                            <p className="text-slate-400 text-sm mt-1">➔ C&apos;est du passé. Peut-être que je les ai retrouvées depuis. On s&apos;en fiche du résultat présent.</p>
                        </div>
                    </div>

                    {/* New Breaking News Section */}
                    <div className="bg-slate-800 p-4 rounded border border-slate-700 mt-4">
                        <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
                            <span>📰</span> EXEMPLE TYPIQUE : BREAKING NEWS
                        </h4>
                        <p className="text-sm text-slate-300 mb-2">
                            Les titres de journaux utilisent le Present Perfect pour le fait récent, puis le Past Simple pour les détails.
                        </p>
                        <div className="bg-black/40 p-3 rounded text-sm font-mono">
                            <p className="text-white border-b border-slate-700 pb-2 mb-2">
                                TITRE : "The President <strong className="text-emerald-400">has signed</strong> the treaty."
                            </p>
                            <p className="text-slate-400">
                                DÉTAIL : "He <strong className="text-amber-400">signed</strong> it at 10 AM this morning."
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Les Boosters : Just, Already, Yet",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ces trois adverbes modulent le résultat. Leur place dans la phrase est <strong className="text-white">Stricte</strong>.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-slate-900 p-4 rounded border-l-4 border-cyan-500">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-cyan-400 font-bold">JUST (À l&apos;instant)</h4>
                                <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-1 rounded">Positif</span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mb-2 bg-black/30 p-1 inline-block rounded">PLACE : ENTRE HAVE ET V3</p>
                            <p className="text-slate-300 text-sm mb-2">L&apos;action vient tout juste de se finir.</p>
                            <p className="text-white italic">"Don&apos;t eat the cake. I <strong className="text-cyan-400">have just made</strong> it."</p>
                        </div>

                        <div className="bg-slate-900 p-4 rounded border-l-4 border-green-500">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-green-400 font-bold">ALREADY (Déjà)</h4>
                                <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Positif</span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mb-2 bg-black/30 p-1 inline-block rounded">PLACE : ENTRE HAVE ET V3</p>
                            <p className="text-slate-300 text-sm mb-2">C&apos;est fait (souvent plus tôt que prévu).</p>
                            <div className="flex flex-col gap-1 mt-2">
                                <p className="text-white italic">"Don&apos;t tell him. He <strong className="text-green-400">has already heard</strong> the news."</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-4 rounded border-l-4 border-orange-500">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-orange-400 font-bold">YET (Encore / Déjà)</h4>
                                <span className="text-xs bg-orange-900 text-orange-300 px-2 py-1 rounded">Négatif / Question</span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mb-2 bg-black/30 p-1 inline-block rounded">PLACE : TOUJOURS À LA FIN</p>
                            <ul className="list-disc ml-5 text-sm text-white italic space-y-2 mt-2">
                                <li>
                                    <span className="text-slate-400 not-italic mr-2">Négatif (Pas encore) :</span>
                                    "I haven&apos;t finished <strong className="text-orange-400">yet</strong>."
                                </li>
                                <li>
                                    <span className="text-slate-400 not-italic mr-2">Question (Déjà ?) :</span>
                                    "Have you finished <strong className="text-orange-400">yet</strong>?"
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz : Result & Keywords",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Where is Tom? He ___ to the shops.",
                            options: ["went", "has gone"],
                            correctAnswer: 1,
                            explanation: "On cherche Tom MAINTENANT. &apos;He has gone&apos; signifie qu&apos;il est là-bas en ce moment.",
                        },
                        {
                            id: 2,
                            question: "I ___ my homework. Can I watch TV?",
                            options: ["have done", "did"],
                            correctAnswer: 0,
                            explanation: "Le résultat compte : le travail est fait, donc je peux regarder la télé maintenant.",
                        },
                        {
                            id: 3,
                            question: "Would you like a coffee? No thanks, I ___ one.",
                            options: ["just had", "have just had"],
                            correctAnswer: 1,
                            explanation: "Action très récente avec conséquence immédiate (je n&apos;en veux plus). JUST s&apos;utilise avec le Present Perfect.",
                        },
                        {
                            id: 4,
                            question: "Don&apos;t pay the bill. I ___ paid it.",
                            options: ["have already", "already have"],
                            correctAnswer: 0,
                            explanation: "L&apos;ordre des mots : HAVE + ALREADY + PARTICIPE PASSÉ.",
                        },
                        {
                            id: 5,
                            question: "Has the postman come ___?",
                            options: ["yet", "just", "already"],
                            correctAnswer: 0,
                            explanation: "Dans une question pour savoir si c&apos;est fait &apos;maintenant/déjà&apos;, on utilise YET à la fin.",
                        },
                        {
                            id: 6,
                            question: "I ___ to him yesterday.",
                            options: ["have spoken", "spoke"],
                            correctAnswer: 1,
                            explanation: "&apos;Yesterday&apos; est une date précise terminée. Past Simple OBLIGATOIRE.",
                        },
                        {
                            id: 7,
                            question: "He ___ waiting for you.",
                            options: ["has hasn&apos;t stopped", "hasn&apos;t stopped"],
                            correctAnswer: 1,
                            explanation: "Négation : Has not (Hasn&apos;t) stopped.",
                        },
                        {
                            id: 8,
                            question: "Look! Someone ___ that window.",
                            options: ["broke", "has broken"],
                            correctAnswer: 1,
                            explanation: "&apos;Look!&apos; attire l&apos;attention sur le résultat visible maintenant (la fenêtre est cassée).",
                        },
                        {
                            id: 9,
                            question: "I haven&apos;t found my phone ___.",
                            options: ["just", "already", "yet"],
                            correctAnswer: 2,
                            explanation: "Phrase négative (Pas encore) = YET à la fin.",
                        },
                        {
                            id: 10,
                            question: "Are you hungry? No, I have ___ eaten.",
                            options: ["just", "yet", "ever"],
                            correctAnswer: 0,
                            explanation: "Je viens de manger à l&apos;instant = Just.",
                        },
                    ]}
                />
            )
        }
    ]
};