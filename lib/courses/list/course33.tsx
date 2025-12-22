import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course33: LessonContent = {
    courseNumber: 33,
    title: "La Voix Passive (1) : Is done / Was done",
    objective: "Comprendre le 'Changement de Caméra' : Quand l'objet devient la star.",
    sections: [
        {
            title: "0. Boîte à Outils (Vocabulaire)",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Mots clés pour ce cours :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Clean</span>
                            <span className="text-slate-500 text-sm">Nettoyer</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Build</span>
                            <span className="text-slate-500 text-sm">Construire (Built)</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Write</span>
                            <span className="text-slate-500 text-sm">Écrire (Written)</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Invent</span>
                            <span className="text-slate-500 text-sm">Inventer</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Le Concept : Le Changement de Caméra",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        La voix passive, c'est comme au cinéma : on change l'angle de la caméra.
                        <br />Au lieu de filmer celui qui <strong>FAIT</strong> l'action, on filme celui qui la <strong>SUBIT</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 opacity-60">
                            <h4 className="text-slate-400 font-bold uppercase text-xs mb-2">VOIX ACTIVE (Classique)</h4>
                            <p className="text-white text-lg">"Somebody <strong className="text-emerald-400">cleans</strong> the office."</p>
                            <p className="text-xs text-slate-500 italic mt-1">(Quelqu'un nettoie le bureau.)</p>
                            <p className="text-xs text-slate-400 mt-2">➔ La caméra est sur "Quelqu'un".</p>
                        </div>

                        <div className="bg-slate-900 p-4 rounded-xl border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <h4 className="text-indigo-400 font-bold uppercase text-xs mb-2">VOIX PASSIVE (Focus Objet)</h4>
                            <p className="text-white text-lg">"The office <strong className="text-indigo-400">is cleaned</strong>."</p>
                            <p className="text-xs text-slate-500 italic mt-1">(Le bureau est nettoyé.)</p>
                            <p className="text-xs text-indigo-300 mt-2">➔ La caméra est sur "Le Bureau". On se fiche de "Qui" nettoie.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. La Machine à Fabriquer le Passif",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour fabriquer le passif, on a besoin de deux ingrédients obligatoires :
                        <br />1. Le verbe <strong>TO BE</strong> (Être)
                        <br />2. Le verbe principal au <strong>PARTICIPE PASSÉ</strong> (3ème colonne).
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-white">BE</div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <h4 className="text-emerald-400 font-bold mb-3 border-b border-emerald-500/30 pb-2">AU PRÉSENT (C'est fait)</h4>
                                <div className="space-y-2 font-mono text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Objet Singulier</span>
                                        <span className="text-white">IS done</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Objets Pluriels</span>
                                        <span className="text-white">ARE done</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-300 italic">"The room <strong>is cleaned</strong> every day."</p>
                            </div>

                            <div>
                                <h4 className="text-blue-400 font-bold mb-3 border-b border-blue-500/30 pb-2">AU PASSÉ (C'était fait)</h4>
                                <div className="space-y-2 font-mono text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Objet Singulier</span>
                                        <span className="text-white">WAS done</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Objets Pluriels</span>
                                        <span className="text-white">WERE done</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-slate-300 italic">"The room <strong>was cleaned</strong> yesterday."</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Dire 'PAR' qui (By...)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Si vous voulez absolument dire qui a fait l'action, utilisez le petit mot magique <strong>BY</strong>.
                    </p>

                    <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-white text-lg">"The telephone was invented <strong className="text-yellow-400">by</strong> Alexander Bell."</p>
                        <p className="text-xs text-slate-400 mt-1 italic">Le téléphone a été inventé PAR Alexander Bell.</p>
                    </div>

                    <p className="text-slate-400 text-sm mt-4">
                        Attention : 80% du temps, on n'utilise PAS "by". On utilise le passif justement parce qu'on ne sait pas qui l'a fait, ou parce que ce n'est pas important.
                    </p>
                </div>
            )
        },
        {
            title: "Quiz Passif",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "The house ___ built in 1990.",
                            options: ["is", "was"],
                            correctAnswer: 1,
                            explanation: "1990 = C'est fini (Passé). Donc WAS built.",
                        },
                        {
                            id: 2,
                            question: "English ___ spoken all over the world.",
                            options: ["is", "was"],
                            correctAnswer: 0,
                            explanation: "C'est une vérité générale (Présent). Donc IS spoken.",
                        },
                        {
                            id: 3,
                            question: "My car ___ stolen last night!",
                            options: ["was", "is"],
                            correctAnswer: 0,
                            explanation: "Last night (Hier soir) = Passé ➔ WAS stolen.",
                        },
                        {
                            id: 4,
                            question: "These windows ___ cleaned every Friday.",
                            options: ["are", "is"],
                            correctAnswer: 0,
                            explanation: "Windows est pluriel ➔ ARE cleaned.",
                        },
                        {
                            id: 5,
                            question: "This book was written ___ J.K. Rowling.",
                            options: ["from", "by"],
                            correctAnswer: 1,
                            explanation: "Pour dire 'par' quelqu'un au passif ➔ BY.",
                        },
                        {
                            id: 6,
                            question: "The butter is ___ from milk.",
                            options: ["make", "made"],
                            correctAnswer: 1,
                            explanation: "Passif = TO BE + Participe Passé (3ème colonne). Make ➔ Made.",
                        },
                        {
                            id: 7,
                            question: "Where ___ you born?",
                            options: ["were", "are"],
                            correctAnswer: 0,
                            explanation: "On naît dans le passé. Toujours 'I was born', 'Were you born'.",
                        },
                        {
                            id: 8,
                            question: "The letters ___ sent yesterday.",
                            options: ["was", "were"],
                            correctAnswer: 1,
                            explanation: "Letters (Pluriel) + Yesterday (Passé) ➔ WERE.",
                        },
                        {
                            id: 9,
                            question: "Someone cleans the room. (Transformez au passif)",
                            options: ["The room is cleaned.", "The room cleans."],
                            correctAnswer: 0,
                            explanation: "La salle ne nettoie pas, elle EST nettoyée.",
                        },
                        {
                            id: 10,
                            question: "Many accidents ___ caused by dangerous driving.",
                            options: ["are", "have"],
                            correctAnswer: 0,
                            explanation: "Sont causés ➔ ARE caused (Passif).",
                        }
                    ]}
                />
            )
        }
    ]
};