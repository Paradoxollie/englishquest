import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course27: LessonContent = {
    courseNumber: 27,
    title: "Le Futur : Décision vs Plan",
    objective: "Maîtriser l&apos;usage du FUTUR SPONTANÉ (Will).",
    sections: [
        {
            title: "1. La Décision Spontanée",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        L&apos;auxiliaire <strong>WILL</strong> s&apos;utilise principalement lorsqu&apos;une décision est prise <strong className="text-white">au moment même où l&apos;on parle</strong>.
                        Il n&apos;y a aucune préméditation.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-xl border-t-8 border-cyan-500 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div>
                                <h4 className="text-cyan-400 font-bold text-lg">Mise en Situation</h4>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-800 p-4 rounded border-l-2 border-slate-600">
                                <p className="text-sm text-slate-400 italic mb-2">Situation : Le téléphone sonne.</p>
                                <div className="space-y-2">
                                    <p className="text-slate-500 line-through text-sm">"I am going to answer." <span className="text-xs ml-2">(Incorrect : Implique que c&apos;était prévu)</span></p>
                                    <p className="text-white font-medium">"I <strong className="text-cyan-400">will</strong> answer."</p>
                                    <p className="text-xs text-cyan-300 ml-4">➔ Décision prise à l&apos;instant T.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Les Contextes Fonctionnels",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Au-delà de la spontanéité, WILL est utilisé pour certaines fonctions de communication spécifiques :
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-800 p-4 rounded border-l-4 border-indigo-500">
                            <h4 className="text-indigo-400 font-bold text-sm uppercase mb-1">1. L&apos;Offre d&apos;Aide</h4>
                            <p className="text-slate-300 text-sm mb-2">Proposer ses services volontairement.</p>
                            <p className="text-white italic">"Your bag looks heavy. I <strong className="text-indigo-400">will help</strong> you."</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded border-l-4 border-pink-500">
                            <h4 className="text-pink-400 font-bold text-sm uppercase mb-1">2. La Promesse</h4>
                            <p className="text-slate-300 text-sm mb-2">S&apos;engager à faire quelque chose.</p>
                            <p className="text-white italic">"I <strong className="text-pink-400">will pay</strong> you back tomorrow. I promise."</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded border-l-4 border-amber-500">
                            <h4 className="text-amber-400 font-bold text-sm uppercase mb-1">3. L&apos;Opinion / Prédiction Personnelle</h4>
                            <p className="text-slate-300 text-sm mb-2">Exprimer ce que l&apos;on pense qu&apos;il va arriver (souvent après "I think").</p>
                            <p className="text-white italic">"I think it <strong className="text-amber-400">will rain</strong> later."</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Distinction : Will vs Going To",
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-900/20 p-5 rounded border border-blue-500/50">
                        <h4 className="text-blue-400 font-bold mb-4 uppercase text-sm text-center">
                            La Règle de l&apos;Intention
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h5 className="text-slate-300 font-bold border-b border-slate-600 pb-1">GOING TO</h5>
                                <p className="text-xs text-slate-400 font-bold uppercase">PLAN PRÉÉTABLI</p>
                                <p className="text-white italic text-sm">"I am going to fly to Paris."</p>
                                <p className="text-xs text-slate-500">L&apos;intention existait avant la conversation. Tout est organisé.</p>
                            </div>

                            <div className="space-y-2">
                                <h5 className="text-cyan-400 font-bold border-b border-cyan-800 pb-1">WILL</h5>
                                <p className="text-xs text-cyan-600 font-bold uppercase">DÉCISION IMMÉDIATE</p>
                                <p className="text-white italic text-sm">"I will fly to Paris!"</p>
                                <p className="text-xs text-slate-500">Idée qui vient d&apos;émerger. "Tiens, et si j&apos;allais à Paris ?"</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz de Validation",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "The phone is ringing. - OK, I ___ answer it.",
                            options: ["am going to", "will"],
                            correctAnswer: 1,
                            explanation: "Réaction immédiate au stimulus (téléphone). Aucune planification antérieure.",
                        },
                        {
                            id: 2,
                            question: "Why did you buy paint? - Because I ___ paint my room.",
                            options: ["will", "am going to"],
                            correctAnswer: 1,
                            explanation: "L'achat de la peinture prouve l'existence d'un plan antérieur. 'Going to' est requis.",
                        },
                        {
                            id: 3,
                            question: "It's cold in here. - I ___ close the window.",
                            options: ["am going to", "'ll (will)"],
                            correctAnswer: 1,
                            explanation: "Décision prise à l'instant en réaction au froid (ou offre de service).",
                        },
                        {
                            id: 4,
                            question: "What are your plans for the weekend? - I ___ visit my parents.",
                            options: ["am going to", "will"],
                            correctAnswer: 0,
                            explanation: "La question porte spécifiquement sur les plans prévus.",
                        },
                        {
                            id: 5,
                            question: "I think Liverpool ___ win.",
                            options: ["is going to", "will"],
                            correctAnswer: 1,
                            explanation: "Expression d'une opinion ou prédiction personnelle ('I think').",
                        },
                        {
                            id: 6,
                            question: "Don't worry about the money. I ___ pay you back.",
                            options: ["am going to", "will"],
                            correctAnswer: 1,
                            explanation: "Promesse faite pour rassurer l'interlocuteur.",
                        },
                        {
                            id: 7,
                            question: "Did you talk to him? - Oh no! I forgot. I ___ call him now.",
                            options: ["will", "am going to"],
                            correctAnswer: 0,
                            explanation: "Oubli constaté = Nouvelle décision prise instantanément.",
                        },
                        {
                            id: 8,
                            question: "Look at those black clouds! It ___ rain.",
                            options: ["will", "is going to"],
                            correctAnswer: 1,
                            explanation: "Prédiction basée sur une évidence physique présente (les nuages), pas juste une opinion. 'Going to' est préféré ici.",
                        },
                        {
                            id: 9,
                            question: "Do you want tea or coffee? - I ___ have coffee, please.",
                            options: ["will", "am going to"],
                            correctAnswer: 0,
                            explanation: "Choix exprimé au moment de la commande.",
                        },
                        {
                            id: 10,
                            question: "I promise I ___ be late.",
                            options: ["won't", "am not going to"],
                            correctAnswer: 0,
                            explanation: "Engagement personnel (Promesse).",
                        },
                    ]}
                />
            )
        }
    ]
};