import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course34: LessonContent = {
    courseNumber: 34,
    title: "La Voix Passive (2) : Formes continues et parfaites",
    objective: "Dire 'C'est en train d'être fait' et 'Ça a été fait'.",
    sections: [
        {
            title: "0. Boîte à Outils (Vocabulaire)",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Mots clés pour ce cours :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Repair</span>
                            <span className="text-slate-500 text-sm">Réparer</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Paint</span>
                            <span className="text-slate-500 text-sm">Peindre</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Kick</span>
                            <span className="text-slate-500 text-sm">Frapper (pied)</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Bite</span>
                            <span className="text-slate-500 text-sm">Mordre (Bitten)</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. En train d'être fait (Being)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Parfois, l'action est <strong>EN COURS</strong> au moment où on parle.
                        <br />Au passif, on ajoute l'ingrédient magique : <strong>BEING</strong>.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-blue-500/30">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <h4 className="text-blue-400 font-bold uppercase">ACTION EN COURS (NOW)</h4>
                        </div>

                        <div className="text-center">
                            <p className="text-2xl text-white font-bold mb-2">IS <span className="text-blue-400">BEING</span> DONE</p>
                            <p className="text-slate-400 italic">Example : The car is being repaired.</p>
                            <p className="text-xs text-slate-500 mt-1">(La voiture est en train d'être réparée.)</p>
                        </div>

                        <div className="mt-6 bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300">
                            <strong>Différence clé :</strong>
                            <ul className="mt-2 space-y-2">
                                <li>• The room <strong className="text-white">is cleaned</strong> every day. (Habitude)</li>
                                <li>• The room <strong className="text-blue-400">is being cleaned</strong> right now. (Maintenant)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Ça a ETE fait (Been)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Quand on veut dire que c'est fini, que c'est accompli, on utilise le <strong>Perfect</strong>.
                        <br />L'ingrédient magique change : on utilise <strong>BEEN</strong>.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="text-2xl">✅</span>
                            <h4 className="text-emerald-400 font-bold uppercase">ACTION FINIE (RESULT)</h4>
                        </div>

                        <div className="text-center">
                            <p className="text-2xl text-white font-bold mb-2">HAS <span className="text-emerald-400">BEEN</span> DONE</p>
                            <p className="text-slate-400 italic">Example : The room has been painted.</p>
                            <p className="text-xs text-slate-500 mt-1">(La chambre a été peinte. Regarde, elle est bleue !)</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Tableau de Comparaison Ultime",
            content: (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-slate-800 text-slate-300">
                                <th className="p-3">Temps</th>
                                <th className="p-3">Structure</th>
                                <th className="p-3">Exemple</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-200 text-sm">
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <td className="p-3 font-bold text-white">Présent Simple</td>
                                <td className="p-3">am/is/are + done</td>
                                <td className="p-3">It <strong className="text-white">is cleaned</strong>. (Habitude)</td>
                            </tr>
                            <tr className="bg-slate-900/80 border-b border-slate-700">
                                <td className="p-3 font-bold text-blue-300">Présent Continu</td>
                                <td className="p-3">is/are <strong className="text-blue-400">being</strong> + done</td>
                                <td className="p-3">It <strong className="text-blue-400">is being cleaned</strong>. (Maintenant)</td>
                            </tr>
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <td className="p-3 font-bold text-emerald-300">Present Perfect</td>
                                <td className="p-3">has/have <strong className="text-emerald-400">been</strong> + done</td>
                                <td className="p-3">It <strong className="text-emerald-400">has been cleaned</strong>. (Fini)</td>
                            </tr>
                            <tr className="bg-slate-900/80">
                                <td className="p-3 font-bold text-purple-300">Passé Simple</td>
                                <td className="p-3">was/were + done</td>
                                <td className="p-3">It <strong className="text-purple-400">was cleaned</strong>. (Hier)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )
        },
        {
            title: "Quiz Expert",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Look! The bridge is ___ repaired.",
                            options: ["being", "been"],
                            correctAnswer: 0,
                            explanation: "Look! (Regarde!) ➔ Action en cours maintenant ➔ BEING.",
                        },
                        {
                            id: 2,
                            question: "The room looks nice. It has ___ cleaned.",
                            options: ["being", "been"],
                            correctAnswer: 1,
                            explanation: "C'est fini, on voit le résultat ➔ HAS BEEN.",
                        },
                        {
                            id: 3,
                            question: "My car ___ stolen yesterday.",
                            options: ["has been", "was"],
                            correctAnswer: 1,
                            explanation: "Yesterday ➔ Passé simple (WAS), pas Perfect.",
                        },
                        {
                            id: 4,
                            question: "Somebody is painting the door. (Passif ?)",
                            options: ["The door is being painted.", "The door is painted."],
                            correctAnswer: 0,
                            explanation: "Action en cours (is painting) ➔ is BEING painted.",
                        },
                        {
                            id: 5,
                            question: "My keys have ___ stolen.",
                            options: ["been", "being"],
                            correctAnswer: 0,
                            explanation: "Je les ai perdues (résultat). Have + BEEN.",
                        },
                        {
                            id: 6,
                            question: "Football ___ played in most countries.",
                            options: ["is", "is being"],
                            correctAnswer: 0,
                            explanation: "C'est une vérité générale/habitude ➔ IS (Simple).",
                        },
                        {
                            id: 7,
                            question: "I can't use my office. It is ___ painted.",
                            options: ["being", "been"],
                            correctAnswer: 0,
                            explanation: "Je ne peux pas l'utiliser car l'action est en cours ➔ BEING.",
                        },
                        {
                            id: 8,
                            question: "The shirt has been ___.",
                            options: ["wash", "washed"],
                            correctAnswer: 1,
                            explanation: "Toujours le Participe Passé (3ème colonne) au passif.",
                        },
                        {
                            id: 9,
                            question: "Is the computer ___ used?",
                            options: ["be", "being"],
                            correctAnswer: 1,
                            explanation: "Est-ce que l'ordi est (en train d'être) utilisé ? ➔ BEING.",
                        },
                        {
                            id: 10,
                            question: "All the tickets have been ___.",
                            options: ["sold", "sell"],
                            correctAnswer: 0,
                            explanation: "Have been + Participe Passé (Sold).",
                        }
                    ]}
                />
            )
        }
    ]
};