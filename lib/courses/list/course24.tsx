import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course24: LessonContent = {
    courseNumber: 24,
    title: "Present Perfect Continuous : L'Action",
    objective: "Mettre l'accent sur l'activité elle-même.",
    sections: [
        {
            title: "1. La Formation",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ce temps est comme une caméra qui zoome sur l&apos;action en cours ou vient juste de finir.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="text-indigo-400 font-bold mb-4 text-lg">HAVE/HAS + BEEN + V-ING</h4>

                        <div className="space-y-2 text-lg">
                            <p className="text-white">I <strong className="text-indigo-400">have been running</strong>.</p>
                            <p className="text-white">He <strong className="text-indigo-400">has been sleeping</strong>.</p>
                            <p className="text-white">They <strong className="text-indigo-400">have been waiting</strong>.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. La Preuve Physique (Side Effects)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C&apos;est le secret des natifs. Si vous voyez une <strong className="text-white">trace physique</strong> d&apos;une activité récente, utilisez le Continuous.
                        Jouez au détective.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded border-t-4 border-indigo-500">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-indigo-400 font-bold">L&apos;ACTIVITÉ (Effort)</h4>
                                <span className="text-2xl">🥵</span>
                            </div>
                            <p className="text-white italic mb-2">"You are out of breath. <br /><strong>Have you been running?</strong>"</p>
                            <p className="text-xs text-slate-400">INDICE : L&apos;essoufflement. On s&apos;intéresse à l&apos;effort fourni.</p>
                        </div>

                        <div className="bg-slate-900 p-4 rounded border-t-4 border-indigo-500">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-indigo-400 font-bold">L&apos;ACTIVITÉ (Saleté)</h4>
                                <span className="text-2xl">👐</span>
                            </div>
                            <p className="text-white italic mb-2">"Your hands are dirty. <br /><strong>Have you been repairing the car?</strong>"</p>
                            <p className="text-xs text-slate-400">INDICE : La graisse. On ne sait pas si la voiture marche, mais on voit l&apos;activité.</p>
                        </div>
                    </div>

                    <div className="mt-4 bg-slate-800 p-4 rounded border-l-4 border-pink-500">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div>
                                <h4 className="text-pink-400 font-bold mb-1">VS SIMPLE (Le Résultat Fini)</h4>
                                <p className="text-white font-medium">"The car is ready. I <strong className="text-emerald-400">have repaired</strong> it."</p>
                                <p className="text-xs text-slate-400 mt-1">Ici, pas de mains sales. Juste une voiture qui marche. C&apos;est l&apos;accomplissement.</p>
                            </div>
                            <span className="text-4xl">✅</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. La Règle de la Quantité",
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-900/20 p-4 rounded border border-blue-500/50">
                        <h4 className="text-blue-400 font-bold mb-3 uppercase flex items-center gap-2">
                            <span>🔢</span> RÈGLE CRITIQUE
                        </h4>
                        <p className="text-slate-300">
                            Dès que vous dites <strong className="text-white">COMBIEN</strong> (Quantité, Nombre de fois), vous basculez obligatoirement au <strong className="text-emerald-400">SIMPLE</strong>.
                            Le Continuous refuse les quantités finies car il implique que ce n&apos;est pas "fini".
                        </p>

                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/40 p-3 rounded border-l-2 border-indigo-500">
                                    <p className="text-indigo-300 font-bold text-xs mb-1">DURÉE (HOW LONG)</p>
                                    <p className="text-white">"He has been drinking tea."</p>
                                    <p className="text-xs text-slate-500 mt-1">(Activité de boire)</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded border-l-2 border-emerald-500">
                                    <p className="text-emerald-300 font-bold text-xs mb-1">QUANTITÉ (HOW MUCH)</p>
                                    <p className="text-white">"He has drunk <strong className="text-emerald-400">3 cups</strong> of tea."</p>
                                    <p className="text-xs text-slate-500 mt-1">(Résultat : 3 tasses vides)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz : Continuous or Simple?",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "You are out of breath. ___ you ___?",
                            options: ["Have / run", "Have / been running"],
                            correctAnswer: 1,
                            explanation: "Indice physique (essoufflé) = Activité récente = Continuous.",
                        },
                        {
                            id: 2,
                            question: "Look! Someone ___ that window.",
                            options: ["has broken", "has been breaking"],
                            correctAnswer: 0,
                            explanation: "La fenêtre est cassée (Résultat final visible, pas l'action en cours) = Simple.",
                        },
                        {
                            id: 3,
                            question: "I ___ my keys. I can't find them.",
                            options: ["have been losing", "have lost"],
                            correctAnswer: 1,
                            explanation: "Perdre n'est pas une activité qu'on fait 'pendant' une durée. C'est un résultat = Simple.",
                        },
                        {
                            id: 4,
                            question: "I ___ all afternoon. I'm tired.",
                            options: ["have been working", "have worked"],
                            correctAnswer: 0,
                            explanation: "Insistance sur la durée et la fatigue (effet secondaire) = Continuous.",
                        },
                        {
                            id: 5,
                            question: "He ___ ten emails today.",
                            options: ["has been writing", "has written"],
                            correctAnswer: 1,
                            explanation: "Quantité précisée (DIX emails) = Résultat = Simple.",
                        },
                        {
                            id: 6,
                            question: "Why are your clothes dirty? I ___ in the garden.",
                            options: ["have worked", "have been working"],
                            correctAnswer: 1,
                            explanation: "Les vêtements sales sont la preuve de l'activité = Continuous.",
                        },
                        {
                            id: 7,
                            question: "Where is the book? I ___ it yet.",
                            options: ["haven't been finishing", "haven't finished"],
                            correctAnswer: 1,
                            explanation: "Négation d'accomplissement (fini ou pas) = Simple.",
                        },
                        {
                            id: 8,
                            question: "He ___ emails for two hours.",
                            options: ["has been writing", "has written"],
                            correctAnswer: 0,
                            explanation: "Pas de quantité mentionnée, juste la durée = Continuous.",
                        },
                        {
                            id: 9,
                            question: "It is the first time I ___ a car.",
                            options: ["have been driving", "have driven"],
                            correctAnswer: 1,
                            explanation: "Structure 'It is the first time...' = Toujours SIMPLE (C'est un bilan d'expérience).",
                        },
                        {
                            id: 10,
                            question: "Sorry I'm late. ___ you ___ long?",
                            options: ["Have / waited", "Have / been waiting"],
                            correctAnswer: 1,
                            explanation: "Question classique sur la durée de l'attente = Continuous.",
                        },
                    ]}
                />
            )
        }
    ]
};