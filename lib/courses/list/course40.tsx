import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course40: LessonContent = {
    courseNumber: 40,
    title: "Gérondif ou Infinitif (2) : Verbes + TO",
    objective: "Maîtriser les verbes suivis obligatoirement de l'Infinitif Complet (To + Verbe).",
    sections: [
        {
            title: "0. Définition Technique",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">L'Infinitif Complet (To-Infinitive) :</p>
                    <p className="text-slate-300 text-sm">
                        La structure <strong>TO + VERBE</strong> indique souvent un <strong>but</strong>, une <strong>intention</strong> ou une <strong>projection vers le futur</strong> par rapport au premier verbe.
                    </p>
                    <div className="mt-4 bg-slate-900 p-3 rounded text-center font-mono text-white">
                        "I want <span className="text-blue-400 font-bold">to go</span>."
                    </div>
                </div>
            )
        },
        {
            title: "1. La Liste des Verbes + TO (Intention / Futur)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ces verbes expriment une volonté ou une planification. L'action qui suit n'est pas encore réalisée (elle est "à faire").
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-bold text-white mb-2">WANT (Vouloir)</h4>
                            <p className="text-slate-300">✅ I want <strong>to sleep</strong>.</p>
                            <p className="text-slate-500 text-xs italic">Je veux (maintenant) ➔ Dormir (futur proche).</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-bold text-white mb-2">DECIDE (Décider)</h4>
                            <p className="text-slate-300">✅ We decided <strong>to leave</strong>.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-bold text-white mb-2">HOPE (Espérer)</h4>
                            <p className="text-slate-300">✅ I hope <strong>to see</strong> you.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-bold text-white mb-2">PLAN (Prévoir)</h4>
                            <p className="text-slate-300">✅ They plan <strong>to move</strong> to London.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-bold text-white mb-2">PROMISE (Promettre)</h4>
                            <p className="text-slate-300">✅ He promised <strong>to help</strong>.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-bold text-white mb-2">OFFER (Proposer d'aider)</h4>
                            <p className="text-slate-300">✅ She offered <strong>to carry</strong> my bag.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Verbe + Objet + TO + Verbe",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Structure très fréquente en anglais : On veut que <strong>QUELQU'UN D'AUTRE</strong> fasse l'action.
                        <br />Verbe 1 + <span className="text-green-400">PERSONNE</span> + TO + Verbe 2.
                    </p>

                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <ul className="space-y-3 text-white">
                            <li>• I want <strong className="text-green-400">you</strong> <strong className="text-blue-400">to come</strong>. (Je veux que tu viennes)</li>
                            <li>• She asked <strong className="text-green-400">me</strong> <strong className="text-blue-400">to help</strong>. (Elle m'a demandé d'aider)</li>
                            <li>• They told <strong className="text-green-400">us</strong> <strong className="text-blue-400">to wait</strong>. (Ils nous ont dit d'attendre)</li>
                        </ul>
                    </div>
                    <p className="text-xs text-red-400 mt-2 font-bold">ATTENTION : "I want that you come" est une erreur grave en anglais.</p>
                </div>
            )
        },
        {
            title: "Exercices de Pattern",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I want ___ home.",
                            options: ["to go", "going"],
                            correctAnswer: 0,
                            explanation: "WANT + TO (Intention).",
                        },
                        {
                            id: 2,
                            question: "He promised ___ late.",
                            options: ["not to be", "not being"],
                            correctAnswer: 0,
                            explanation: "PROMISE + TO (Engagement futur).",
                        },
                        {
                            id: 3,
                            question: "We decided ___ a pizza.",
                            options: ["ordering", "to order"],
                            correctAnswer: 1,
                            explanation: "DECIDE + TO (Décision d'une action future).",
                        },
                        {
                            id: 4,
                            question: "I want ___ to clean your room.",
                            options: ["that you", "you"],
                            correctAnswer: 1,
                            explanation: "Structure : Want + PERSONNE + To... (Jamais 'Want that').",
                        },
                        {
                            id: 5,
                            question: "She offered ___ us.",
                            options: ["to help", "helping"],
                            correctAnswer: 0,
                            explanation: "OFFER + TO (Proposition).",
                        },
                        {
                            id: 6,
                            question: "Don't forget ___ the door!",
                            options: ["locking", "to lock"],
                            correctAnswer: 1,
                            explanation: "Forget TO do = Oublier de faire (la tâche).",
                        },
                        {
                            id: 7,
                            question: "He plans ___ his job.",
                            options: ["quit", "to quit"],
                            correctAnswer: 1,
                            explanation: "PLAN + TO (Projet).",
                        },
                        {
                            id: 8,
                            question: "She asked him ___ quiet.",
                            options: ["be", "to be"],
                            correctAnswer: 1,
                            explanation: "Ask + Someone + TO + Verb.",
                        },
                        {
                            id: 9,
                            question: "I hope ___ the exam.",
                            options: ["passing", "to pass"],
                            correctAnswer: 1,
                            explanation: "HOPE + TO (Espoir futur).",
                        },
                        {
                            id: 10,
                            question: "They agreed ___ us.",
                            options: ["to pay", "paying"],
                            correctAnswer: 0,
                            explanation: "AGREE + TO (Accord pour faire).",
                        }
                    ]}
                />
            )
        }
    ]
};