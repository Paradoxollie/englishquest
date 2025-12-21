import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course29: LessonContent = {
    courseNumber: 29,
    title: "Incertitude : May, Might & Maybe",
    objective: "Maîtriser toutes les nuances du doute et de la politesse.",
    sections: [
        {
            title: "1. Le Spectre de la Probabilité",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        En anglais, l&apos;incertitude n&apos;est pas binaire. C&apos;est une échelle précise.
                        <br />Plus vous descendez dans l&apos;échelle, moins vous êtes sûr de vous.
                    </p>

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-amber-500 to-indigo-500 opacity-50"></div>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center font-bold text-white z-10">90%</div>
                                <div className="flex-1 bg-slate-800 p-4 rounded-lg">
                                    <h5 className="text-emerald-400 font-bold text-sm uppercase">WILL / IS GOING TO</h5>
                                    <p className="text-white italic">"It will rain."</p>
                                    <p className="text-xs text-slate-400">Quasi-certitude.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center font-bold text-white z-10">50%</div>
                                <div className="flex-1 bg-slate-800 p-4 rounded-lg transition-transform hover:scale-[1.02]">
                                    <h5 className="text-amber-400 font-bold text-sm uppercase">MAY</h5>
                                    <p className="text-white italic">"It may rain."</p>
                                    <p className="text-xs text-slate-400">C&apos;est une possibilité réelle et sérieuse. (50/50)</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center font-bold text-white z-10">30%</div>
                                <div className="flex-1 bg-slate-800 p-4 rounded-lg transition-transform hover:scale-[1.02]">
                                    <h5 className="text-indigo-400 font-bold text-sm uppercase">MIGHT</h5>
                                    <p className="text-white italic">"It might rain."</p>
                                    <p className="text-xs text-slate-400">C&apos;est une possibilité lointaine, hypothetique. "Ça se pourrait..."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Le Piège Orthographique : MAYBE",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C&apos;est l&apos;erreur classique des francophones. Ne confondez jamais l&apos;adverbe (en un mot) et le verbe (en deux mots).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 p-5 rounded-xl border-t-8 border-purple-500 shadow-xl">
                            <h4 className="text-purple-400 font-bold text-lg mb-2">MAYBE (Adverbe)</h4>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">"PEUT-ÊTRE"</p>

                            <ul className="text-sm space-y-3 text-slate-300">
                                <li>&bull; Se place souvent en <strong>début de phrase</strong>.</li>
                                <li>&bull; Ne remplace PAS le verbe.</li>
                            </ul>
                            <div className="mt-4 bg-purple-900/20 p-3 rounded border border-purple-500/30">
                                <p className="text-white font-medium">"<strong className="text-purple-400">Maybe</strong> he is sick."</p>
                                <p className="text-xs text-slate-400 mt-1">Notez qu&apos;il y a le verbe 'is' après.</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-5 rounded-xl border-t-8 border-cyan-500 shadow-xl">
                            <h4 className="text-cyan-400 font-bold text-lg mb-2">MAY BE (Verbe Modal)</h4>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-4">"IL SE PEUT QU'IL SOIT"</p>

                            <ul className="text-sm space-y-3 text-slate-300">
                                <li>&bull; C&apos;est l&apos;auxiliaire <strong>MAY</strong> + le verbe <strong>BE</strong>.</li>
                                <li>&bull; C&apos;est le verbe de la phrase.</li>
                            </ul>
                            <div className="mt-4 bg-cyan-900/20 p-3 rounded border border-cyan-500/30">
                                <p className="text-white font-medium">"He <strong className="text-cyan-400">may be</strong> sick."</p>
                                <p className="text-xs text-slate-400 mt-1">Ici, 'may be' remplace 'is' avec une nuance de doute.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. La Politesse Extrême : MAY I ?",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Outre la probabilité, <strong>MAY</strong> a une fonction sociale unique : c&apos;est le summum de la politesse pour demander une permission.
                    </p>

                    <div className="bg-slate-800 p-4 rounded border-l-4 border-emerald-500 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Informel / Standard</span>
                            <span className="text-white font-bold">"Can I come in?"</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Poli</span>
                            <span className="text-white font-bold">"Could I come in?"</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-emerald-400 font-bold uppercase text-xs">Très Formel / Respectueux</span>
                                <p className="text-xs text-slate-500">Utilisé avec un professeur, un client, un supérieur.</p>
                            </div>
                            <span className="text-emerald-400 font-bold text-lg">"May I come in?"</span>
                        </div>
                    </div>

                    <div className="bg-black/30 p-4 rounded text-sm text-slate-400 italic text-center">
                        Note : "Might I" existe mais est archaïque et presque jamais utilisé aujourd'hui.
                    </div>
                </div>
            )
        },
        {
            title: "Quiz Complet",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "___ he likes football.",
                            options: ["May be", "Maybe"],
                            correctAnswer: 1,
                            explanation: "C'est en début de phrase et suivi d'un sujet+verbe ('he likes'). C'est l'adverbe.",
                        },
                        {
                            id: 2,
                            question: "He ___ at home.",
                            options: ["maybe", "may be"],
                            correctAnswer: 1,
                            explanation: "Il manque le verbe. 'He may be' = Il se peut qu'il soit.",
                        },
                        {
                            id: 3,
                            question: "___ I have a glass of water, please?",
                            options: ["May", "Will"],
                            correctAnswer: 0,
                            explanation: "Demande de permission polie = May.",
                        },
                        {
                            id: 4,
                            question: "The sky is blue. It ___ rain, but I doubt it.",
                            options: ["may", "might"],
                            correctAnswer: 1,
                            explanation: "Probabilité très faible ('I doubt it') = Might.",
                        },
                        {
                            id: 5,
                            question: "She ___ not want to come.",
                            options: ["mights", "might"],
                            correctAnswer: 1,
                            explanation: "Les modaux sont invariables. Jamais de 'S'.",
                        },
                        {
                            id: 6,
                            question: "I'm not sure about my holidays. I ___ go to Spain.",
                            options: ["will", "may"],
                            correctAnswer: 1,
                            explanation: "Incertitude = May (ou Might). Will est une certitude.",
                        },
                        {
                            id: 7,
                            question: "You ___ leave the table now.",
                            options: ["may", "might"],
                            correctAnswer: 0,
                            explanation: "Donner la permission (formalité/autorité) = You may leave.",
                        },
                        {
                            id: 8,
                            question: "It is strictly forbidden. You ___ not enter.",
                            options: ["might", "may"],
                            correctAnswer: 1,
                            explanation: "'You may not' exprime une interdiction formelle (l'inverse de la permission).",
                        },
                        {
                            id: 9,
                            question: "Where is Sue? - She ___ stuck in traffic.",
                            options: ["can be", "might be"],
                            correctAnswer: 1,
                            explanation: "Pour exprimer une probabilité sur un fait actuel, on utilise Might/May/Could, mais rarement Can (qui exprime plutôt la capacité).",
                        },
                        {
                            id: 10,
                            question: "___ you help me?",
                            options: ["May", "Can"],
                            correctAnswer: 1,
                            explanation: "Piège ! On n'utilise pas 'May' pour demander une capacité ou un service physique ('Peux-tu m'aider'). On utilise Can ou Could. May est pour la permission.",
                        },
                    ]}
                />
            )
        }
    ]
};