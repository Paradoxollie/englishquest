import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course37: LessonContent = {
    courseNumber: 37,
    title: "Les Propositions Relatives (1) : Who / Which",
    objective: "Identifier l'antécédent pour choisir le bon pronom relatif.",
    sections: [
        {
            title: "0. Vocabulaire Technique",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Concepts Clés :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Relative Pronoun</span>
                            <span className="text-slate-500 text-sm">Pronom Relatif (Que/Qui)</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Antecedent</span>
                            <span className="text-slate-500 text-sm">Le mot avant (La Cible)</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Clause</span>
                            <span className="text-slate-500 text-sm">Proposition (Phrase)</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. La Règle de l'Antécédent",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour choisir entre <strong>WHO</strong> et <strong>WHICH</strong>, vous devez analyser un seul mot : l'<strong>Antécédent</strong>.
                        <br />C'est le nom qui se trouve juste avant le pronom relatif.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-blue-500">
                            <h4 className="text-blue-400 font-bold uppercase mb-2">SI L'ANTÉCÉDENT EST HUMAIN</h4>
                            <p className="text-3xl font-black text-white mb-2">WHO</p>
                            <p className="text-slate-400 text-sm">Ex: The man <strong className="text-white">who</strong> called.</p>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-emerald-500">
                            <h4 className="text-emerald-400 font-bold uppercase mb-2">SI C'EST UNE CHOSE / ANIMAL</h4>
                            <p className="text-3xl font-black text-white mb-2">WHICH</p>
                            <p className="text-slate-400 text-sm">Ex: The car <strong className="text-white">which</strong> is red.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Cas Particulier : THAT",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le pronom <strong>THAT</strong> est un "Joker". Dans les propositions définies (qui sont essentielles au sens), il peut remplacer à la fois WHO et WHICH.
                    </p>

                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold">✓</span>
                            <p className="text-slate-300">The man <strong className="text-white">who</strong> called.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold">✓</span>
                            <p className="text-slate-300">The man <strong className="text-white">that</strong> called.</p>
                        </div>
                        <div className="w-full h-px bg-slate-700 my-2"></div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold">✓</span>
                            <p className="text-slate-300">The car <strong className="text-white">which</strong> fits.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-green-400 font-bold">✓</span>
                            <p className="text-slate-300">The car <strong className="text-white">that</strong> fits.</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 italic">Attention : Dans ce cours, nous nous concentrons d'abord sur la distinction stricte WHO vs WHICH.</p>
                </div>
            )
        },
        {
            title: "3. Analyse Structurelle",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Regardez toujours à gauche du trou. C'est là que se trouve la réponse.
                    </p>

                    <div className="bg-black/30 p-4 rounded text-center">
                        <p className="text-lg text-slate-400">
                            The <span className="text-white font-bold underline decoration-indigo-500 decoration-4">doctor</span> [ ___ ] lives here.
                        </p>
                        <p className="mt-2 text-sm text-indigo-400"> Doctor = Personne ➔ WHO</p>
                    </div>

                    <div className="bg-black/30 p-4 rounded text-center">
                        <p className="text-lg text-slate-400">
                            The <span className="text-white font-bold underline decoration-emerald-500 decoration-4">book</span> [ ___ ] is on the table.
                        </p>
                        <p className="mt-2 text-sm text-emerald-400"> Book = Objet ➔ WHICH</p>
                    </div>
                </div>
            )
        },
        {
            title: "Exercices d'Identification",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "The girl ___ is sitting there is my sister.",
                            options: ["which", "who"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'The girl' (Humain) ➔ WHO.",
                        },
                        {
                            id: 2,
                            question: "The phone ___ I bought is broken.",
                            options: ["which", "who"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The phone' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 3,
                            question: "I met a man ___ works at NASA.",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'A man' (Humain) ➔ WHO.",
                        },
                        {
                            id: 4,
                            question: "Where is the cheese ___ was in the fridge?",
                            options: ["who", "which"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'The cheese' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 5,
                            question: "Do you know the people ___ live next door?",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The people' (Humains) ➔ WHO.",
                        },
                        {
                            id: 6,
                            question: "The dog ___ bit me ran away.",
                            options: ["who", "which"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'The dog' (Animal) ➔ WHICH.",
                        },
                        {
                            id: 7,
                            question: "This is the game ___ I told you about.",
                            options: ["which", "who"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The game' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 8,
                            question: "I like students ___ work hard.",
                            options: ["which", "who"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'Students' (Humains) ➔ WHO.",
                        },
                        {
                            id: 9,
                            question: "A dictionary is a book ___ gives definitions.",
                            options: ["who", "which"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'A book' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 10,
                            question: "He is the actor ___ won the Oscar.",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The actor' (Humain) ➔ WHO.",
                        }
                    ]}
                />
            )
        }
    ]
};