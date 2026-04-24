import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course38: LessonContent = {
    courseNumber: 38,
    title: "Les Propositions Relatives (2) : L'Omission",
    objective: "Savoir quand on peut supprimer 'Who', 'That' ou 'Which'.",
    sections: [
        {
            title: "0. Vocabulaire Technique",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Analyse Grammaticale :</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Object Pronoun</span>
                            <span className="text-slate-500 text-sm">Pronom Objet (Supprimable)</span>
                            <span className="text-xs text-slate-600 italic">Ex: The the book (that) I read.</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Subject Pronoun</span>
                            <span className="text-slate-500 text-sm">Pronom Sujet (Obligatoire)</span>
                            <span className="text-xs text-slate-600 italic">Ex: The man who called.</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. La Règle d'Or : Le Test du Sujet",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        En anglais, vous pouvez supprimer le pronom relatif (Who, That, Which) <strong>UNIQUEMENT</strong> s'il est suivi d'un nouveau Sujet + Verbe.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500 relative">
                        <h4 className="text-emerald-400 font-bold uppercase mb-4 text-center">OMISSION AUTORISÉE (Pronoms Objets)</h4>

                        <div className="text-center space-y-4">
                            <p className="text-xl text-white">"The movie <span className="text-slate-500 line-through decoration-2 decoration-red-500 text-sm mx-1">(that)</span> <strong className="text-emerald-400 border-b border-emerald-400">we saw</strong> was good."</p>

                            <div className="bg-emerald-900/20 p-3 rounded text-left text-sm text-emerald-200">
                                <p><strong>Analyse :</strong></p>
                                <ul className="list-disc list-inside">
                                    <li>Après le pronom, avons-nous un sujet ? <strong>OUI (We)</strong>.</li>
                                    <li>Conclusion : Le pronom est un Objet. On peut l'enlever.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-red-500 relative mt-6">
                        <h4 className="text-red-400 font-bold uppercase mb-4 text-center">OMISSION INTERDITE (Pronoms Sujets)</h4>

                        <div className="text-center space-y-4">
                            <p className="text-xl text-white">"The man <strong className="text-red-400 border-b-2 border-red-400">who</strong> <span className="text-slate-400 decoration-slate-500">called</span> is here."</p>

                            <div className="bg-red-900/20 p-3 rounded text-left text-sm text-red-200">
                                <p><strong>Analyse :</strong></p>
                                <ul className="list-disc list-inside">
                                    <li>Après le pronom, avons-nous un sujet ? <strong>NON</strong>. C'est directement le verbe (Called).</li>
                                    <li>Conclusion : Le pronom est le Sujet. Il est <strong>OBLIGATOIRE</strong>.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Cas des Prépositions",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Si le pronom est supprimé, la préposition (to, at, for, with...) qui l'accompagnait doit être rejetée à la <strong>FIN</strong> de la proposition relative.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <p className="text-xs font-bold text-slate-500 mb-1">FORMEL (Avec Pronom)</p>
                            <p className="text-white">The girl <strong className="text-indigo-400">with whom</strong> I work.</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-indigo-500">
                            <p className="text-xs font-bold text-slate-500 mb-1">COURANT (Sans Pronom)</p>
                            <p className="text-white">The girl <span className="text-slate-600 italic">(x)</span> I work <strong className="text-indigo-400">with</strong>.</p>
                            <p className="text-xs text-slate-400 mt-2">La préposition 'with' migre à la fin.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Exercices de Structure",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "The car ___ I bought is fast. (Le pronom est-il obligatoire ?)",
                            options: ["Obligatoire", "Optionnel (Supprimable)"],
                            correctAnswer: 1,
                            explanation: "Suivi de 'I bought' (Sujet + Verbe) ➔ Pronom Objet ➔ Supprimable.",
                        },
                        {
                            id: 2,
                            question: "The man ___ lives here is old. (Le pronom est-il obligatoire ?)",
                            options: ["Obligatoire", "Optionnel (Supprimable)"],
                            correctAnswer: 0,
                            explanation: "Suivi directement de 'lives' (Verbe). Pas de sujet intermédiaire ➔ Obligatoire.",
                        },
                        {
                            id: 3,
                            question: "Where is the book ___ I lent you?",
                            options: ["- (Rien)", "who"],
                            correctAnswer: 0,
                            explanation: "L'omission est possible (et préférée) car suivi de 'I lent' (Sujet + Verbe).",
                        },
                        {
                            id: 4,
                            question: "I know a girl ___ speaks Japanese. (Peut-on supprimer 'who' ?)",
                            options: ["Oui", "Non"],
                            correctAnswer: 1,
                            explanation: "Non. 'Who' est le sujet du verbe 'speaks'.",
                        },
                        {
                            id: 5,
                            question: "The hotel ___ we stayed at was clean.",
                            options: ["that", "where"],
                            correctAnswer: 0,
                            explanation: "On peut utiliser 'that' (ou rien), mais pas 'where' si la préposition 'at' est à la fin.",
                        },
                        {
                            id: 6,
                            question: "Everything ___ he said was true.",
                            options: ["- (Rien)", "what"],
                            correctAnswer: 0,
                            explanation: "Après 'Everything', on omet souvent 'that'. Jamais 'what' dans une relative.",
                        },
                        {
                            id: 7,
                            question: "The person ___ I am waiting for is late.",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent Humain (Person) ➔ WHO (ou omission).",
                        },
                        {
                            id: 8,
                            question: "This is the house ___ Jack built.",
                            options: ["- (Rien)", "who"],
                            correctAnswer: 0,
                            explanation: "House est un objet, donc pas 'who'. L'omission est possible car le sujet 'Jack' suit.",
                        },
                        {
                            id: 9,
                            question: "Do you know the girl ___ is dancing?",
                            options: ["- (Rien)", "who"],
                            correctAnswer: 1,
                            explanation: "Obligatoire car c'est le sujet de 'is dancing'.",
                        },
                        {
                            id: 10,
                            question: "The song ___ you are listening to is great.",
                            options: ["- (Rien)", "who"],
                            correctAnswer: 0,
                            explanation: "Pronom objet (suivi de 'you are'). Omission possible.",
                        }
                    ]}
                />
            )
        }
    ]
};
