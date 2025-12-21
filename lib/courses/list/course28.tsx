import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course28: LessonContent = {
    courseNumber: 28,
    title: "Expertise : Futur & Prédictions",
    objective: "Maîtriser la nuance psychologique entre Will et Going to.",
    sections: [
        {
            title: "1. Analyse Psychologique : La Ligne du Temps",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour choisir le bon futur, vous devez vous poser une seule question : <strong className="text-white">Quand avez-vous pris la décision ?</strong>
                        <br />Ce n&apos;est pas une question de temps (demain, dans 10 ans), c&apos;est une question de <strong className="text-indigo-400">chronologie mentale</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-indigo-500 shadow-xl">
                            <h4 className="text-indigo-400 font-extrabold text-lg uppercase mb-4">LE PLAN (Going To)</h4>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">DÉCISION ANTÉRIEURE</p>

                            <p className="text-slate-300 mb-4 text-justify text-sm">
                                La décision a été prise <strong>AVANT</strong> la conversation actuelle. Elle est stockée dans votre tête comme un "dossier ouvert".
                            </p>

                            <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
                                <p className="text-white font-bold mb-2">Structure : BE GOING TO</p>
                                <p className="text-slate-300 italic text-sm">"I bought paint because I <strong className="text-indigo-400">am going to paint</strong> my room."</p>
                                <ul className="mt-3 space-y-1 text-xs text-slate-400 list-disc pl-4">
                                    <li>L&apos;achat de la peinture prouve le plan.</li>
                                    <li>Ce n&apos;est pas une surprise pour vous.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-cyan-500 shadow-xl">
                            <h4 className="text-cyan-400 font-extrabold text-lg uppercase mb-4">L'IMPULSION (Will)</h4>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">DÉCISION INSTANTANÉE</p>

                            <p className="text-slate-300 mb-4 text-justify text-sm">
                                La décision naît <strong>MAINTENANT</strong>, à la seconde où vous parlez. C&apos;est une réaction à une information nouvelle.
                            </p>

                            <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
                                <p className="text-white font-bold mb-2">Structure : WILL</p>
                                <p className="text-slate-300 italic text-sm">"Oh, you like blue? OK, I <strong className="text-cyan-400">will paint</strong> it blue then."</p>
                                <ul className="mt-3 space-y-1 text-xs text-slate-400 list-disc pl-4">
                                    <li>Vous venez de changer d&apos;avis.</li>
                                    <li>Vous réagissez à la préférence de l&apos;autre.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. La Science de la Prédiction",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand il ne s&apos;agit pas de vous, mais de prédire l&apos;extérieur (la météo, un match, l&apos;économie), la règle change.
                        <br />Demandez-vous : <strong className="text-white">Quelle est ma source d&apos;information ?</strong>
                    </p>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-5 rounded border-l-4 border-emerald-500">
                            <h4 className="text-emerald-400 font-bold mb-2 uppercase text-sm">Source = Mes Yeux (Réalité Physique)</h4>
                            <p className="text-white text-lg font-bold mb-2">➔ BE GOING TO</p>
                            <p className="text-slate-300 text-sm mb-3">
                                Si vous voyez des <strong>signes avant-coureurs</strong> indéniables, ce n&apos;est plus une opinion, c&apos;est un constat. Le futur est déjà enclenché.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 bg-black/40 p-3 rounded">
                                <div className="flex-1">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Situation</span>
                                    <p className="text-slate-300 text-sm">Un homme marche en regardant son téléphone. Il y a un trou devant lui.</p>
                                </div>
                                <div className="flex-1 border-l border-slate-700 pl-4">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Prédiction</span>
                                    <p className="text-white italic">"He <strong className="text-emerald-400">is going to fall</strong>!"</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-5 rounded border-l-4 border-purple-500">
                            <h4 className="text-purple-400 font-bold mb-2 uppercase text-sm">Source = Mon Cerveau (Croyance / Analyse)</h4>
                            <p className="text-white text-lg font-bold mb-2">➔ WILL</p>
                            <p className="text-slate-300 text-sm mb-3">
                                Si vous basez votre prédiction sur votre expérience, votre intuition ou des statistiques abstraites. Vous ne "voyez" pas l&apos;événement se produire.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 bg-black/40 p-3 rounded">
                                <div className="flex-1">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Situation</span>
                                    <p className="text-slate-300 text-sm">On parle du futur de l&apos;humanité en général.</p>
                                </div>
                                <div className="flex-1 border-l border-slate-700 pl-4">
                                    <span className="text-xs text-slate-500 uppercase font-bold">Prédiction</span>
                                    <p className="text-white italic">"We <strong className="text-purple-400">will discover</strong> life on Mars."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Le Comparatif Ultime",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Observez comment le sens de la phrase change radicalement juste en changeant le temps.
                    </p>

                    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 text-slate-400 uppercase font-bold">
                                <tr>
                                    <th className="p-4">Phrase</th>
                                    <th className="p-4">Message envoyé à l&apos;interlocuteur</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                <tr className="bg-slate-900/50">
                                    <td className="p-4 text-white font-medium">"Usually, he <span className="text-purple-400">will arrive</span> late."</td>
                                    <td className="p-4 text-slate-400">C&apos;est une habitude, une caractéristique typique de lui. (Prédiction basée sur l&apos;expérience).</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-white font-medium">"Look at the traffic! He <span className="text-emerald-400">is going to arrive</span> late."</td>
                                    <td className="p-4 text-slate-400">Constat physique des bouchons. C&apos;est une conséquence inévitable de la réalité actuelle.</td>
                                </tr>
                                <tr className="bg-slate-900/50">
                                    <td className="p-4 text-white font-medium">"I <span className="text-indigo-400">am going to be</span> a doctor."</td>
                                    <td className="p-4 text-slate-400">C&apos;est mon plan de carrière. J&apos;étudie pour ça. C&apos;est en cours.</td>
                                </tr>
                                <tr>
                                    <td className="p-4 text-white font-medium">"I <span className="text-cyan-400">will be</span> a doctor."</td>
                                    <td className="p-4 text-slate-400">C&apos;est une détermination personnelle ou un rêve d&apos;enfant, mais peut-être sans plan concret encore.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz de Nuance",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Why did you buy flour and eggs? - Because I ___ make a cake.",
                            options: ["will", "am going to"],
                            correctAnswer: 1,
                            explanation: "Les ingrédients sont la preuve matérielle d'un plan préétabli. Intention claire.",
                        },
                        {
                            id: 2,
                            question: "Oh, we have no sugar left. - Really? I ___ buy some.",
                            options: ["am going to", "will"],
                            correctAnswer: 1,
                            explanation: "Découverte de l'information à l'instant ('Really?'). Décision immédiate (spontanée).",
                        },
                        {
                            id: 3,
                            question: "The sky is completely dark. It ___ snow.",
                            options: ["will", "is going to"],
                            correctAnswer: 1,
                            explanation: "Indice visuel fort (ciel noir) = Conséquence physique immédiate = Going to.",
                        },
                        {
                            id: 4,
                            question: "I believe that in 2100, robots ___ control the world.",
                            options: ["are going to", "will"],
                            correctAnswer: 1,
                            explanation: "Croyance personnelle ('I believe') sur un futur lointain, sans preuve actuelle.",
                        },
                        {
                            id: 5,
                            question: "Are you busy tonight? - Yes, I ___ meet my friends.",
                            options: ["will", "am going to"],
                            correctAnswer: 1,
                            explanation: "Si vous êtes occupé, c'est que vous avez *déjà* un plan. Ce n'est pas décidé à la seconde.",
                        },
                        {
                            id: 6,
                            question: "That child is running too fast! He ___ fall.",
                            options: ["is going to", "will"],
                            correctAnswer: 0,
                            explanation: "On voit la cause (court trop vite), on prédit la conséquence immédiate.",
                        },
                        {
                            id: 7,
                            question: "I promise I ___ tell anyone.",
                            options: ["am not going to", "won't"],
                            correctAnswer: 1,
                            explanation: "Les promesses sont des actes de parole, des engagements personnels = Will.",
                        },
                        {
                            id: 8,
                            question: "Did you turn off the oven? - Oops, I forgot. I ___ do it now.",
                            options: ["am going to", "will"],
                            correctAnswer: 1,
                            explanation: "Réaction à l'oubli. Décision prise maintenant.",
                        },
                        {
                            id: 9,
                            question: "She looks very pale. She ___ faint.",
                            options: ["is going to", "will"],
                            correctAnswer: 0,
                            explanation: "Symptôme physique visible (pâleur) = Going to.",
                        },
                        {
                            id: 10,
                            question: "What would you like to eat? - I ___ have the steak.",
                            options: ["am going to", "will"],
                            correctAnswer: 1,
                            explanation: "Choix fait au restaurant au moment de la commande = Will.",
                        },
                    ]}
                />
            )
        }
    ]
};