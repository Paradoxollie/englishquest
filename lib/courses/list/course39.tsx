import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course39: LessonContent = {
    courseNumber: 39,
    title: "Gérondif ou Infinitif (1) : Verbes + -ING",
    objective: "Maîtriser les verbes suivis obligatoirement du Gérondif.",
    sections: [
        {
            title: "0. Définition Technique",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Le Gérondif (Gerund) :</p>
                    <p className="text-slate-300 text-sm">
                        En grammaire anglaise, le Gérondif est un verbe terminé par <strong>-ING</strong> qui fonctionne comme un <strong>NOM</strong> (et non plus comme un verbe d'action progressive).
                    </p>
                    <div className="mt-4 bg-slate-900 p-3 rounded text-center font-mono text-white">
                        "I like <span className="text-emerald-400 font-bold">swimming</span>."
                    </div>
                    <p className="text-center text-xs text-slate-500 mt-1">Ici, 'swimming' est l'objet direct, comme 'chocolate'.</p>
                </div>
            )
        },
        {
            title: "1. La Liste des Verbes + -ING (Mémorisation)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Certains verbes exigent <strong>impérativement</strong> que le verbe suivant soit au gérondif. Utiliser "TO" est une erreur grave.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-bold text-white mb-2">ENJOY (Apprécier)</h4>
                            <p className="text-slate-300">✅ I enjoy <strong>reading</strong>.</p>
                            <p className="text-red-400/60 line-through text-xs">❌ I enjoy to read.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-bold text-white mb-2">STOP / FINISH (Arrêter/Finir)</h4>
                            <p className="text-slate-300">✅ He stopped <strong>smoking</strong>.</p>
                            <p className="text-red-400/60 line-through text-xs">❌ He stopped to smoke.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-bold text-white mb-2">MIND (Se soucier / Ça dérange)</h4>
                            <p className="text-slate-300">✅ I don't mind <strong>waiting</strong>.</p>
                            <p className="text-red-400/60 line-through text-xs">❌ I don't mind to wait.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-bold text-white mb-2">SUGGEST (Suggérer)</h4>
                            <p className="text-slate-300">✅ She suggested <strong>going</strong> to the cinema.</p>
                            <p className="text-red-400/60 line-through text-xs">❌ She suggested to go.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-bold text-white mb-2">AVOID (Éviter)</h4>
                            <p className="text-slate-300">✅ Avoid <strong>driving</strong> fast.</p>
                            <p className="text-red-400/60 line-through text-xs">❌ Avoid to drive.</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-emerald-500">
                            <h4 className="font-bold text-white mb-2">KEEP (Continuer à)</h4>
                            <p className="text-slate-300">✅ Keep <strong>working</strong>!</p>
                            <p className="text-red-400/60 line-through text-xs">❌ Keep to work.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Après une Préposition",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Règle absolue : Si un verbe suit une préposition (at, in, on, of, about, with, without...), il se met <strong>TOUJOURS</strong> en -ING.
                    </p>

                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <ul className="space-y-3 text-white">
                            <li>• He is good <strong className="text-yellow-400">at</strong> learn<strong className="text-emerald-400">ing</strong> languages.</li>
                            <li>• I am interested <strong className="text-yellow-400">in</strong> buy<strong className="text-emerald-400">ing</strong> it.</li>
                            <li>• Thanks <strong className="text-yellow-400">for</strong> com<strong className="text-emerald-400">ing</strong>.</li>
                            <li>• Without <strong className="text-yellow-400">saying</strong> goodbye.</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Exercices de Mémorisation listée",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I enjoy ___ football.",
                            options: ["playing", "to play"],
                            correctAnswer: 0,
                            explanation: "ENJOY est toujours suivi de -ING.",
                        },
                        {
                            id: 2,
                            question: "Would you mind ___ the window?",
                            options: ["to close", "closing"],
                            correctAnswer: 1,
                            explanation: "MIND est toujours suivi de -ING.",
                        },
                        {
                            id: 3,
                            question: "He stopped ___ 5 years ago.",
                            options: ["smoking", "to smoke"],
                            correctAnswer: 0,
                            explanation: "STOP + ING = Arrêter une activité (Arrêter de fumer).",
                        },
                        {
                            id: 4,
                            question: "She is afraid of ___.",
                            options: ["flying", "to fly"],
                            correctAnswer: 0,
                            explanation: "OF est une préposition ➔ Verbe + ING obligatoire.",
                        },
                        {
                            id: 5,
                            question: "I suggest ___ a break.",
                            options: ["taking", "to take"],
                            correctAnswer: 0,
                            explanation: "SUGGEST est toujours suivi de -ING.",
                        },
                        {
                            id: 6,
                            question: "Have you finished ___ your homework?",
                            options: ["doing", "to do"],
                            correctAnswer: 0,
                            explanation: "FINISH est toujours suivi de -ING.",
                        },
                        {
                            id: 7,
                            question: "He left without ___ anything.",
                            options: ["saying", "to say"],
                            correctAnswer: 0,
                            explanation: "WITHOUT est une préposition ➔ ING.",
                        },
                        {
                            id: 8,
                            question: "Keep ___ !",
                            options: ["smiling", "to smile"],
                            correctAnswer: 0,
                            explanation: "KEEP (dans le sens continuer) + ING.",
                        },
                        {
                            id: 9,
                            question: "We avoided ___ him.",
                            options: ["meeting", "to meet"],
                            correctAnswer: 0,
                            explanation: "AVOID est toujours suivi de -ING.",
                        },
                        {
                            id: 10,
                            question: "I am thinking about ___ a new car.",
                            options: ["buying", "to buy"],
                            correctAnswer: 0,
                            explanation: "ABOUT est une préposition ➔ ING.",
                        }
                    ]}
                />
            )
        }
    ]
};