import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course45: LessonContent = {
    courseNumber: 45,
    title: "Nuances de déduction passée (Must have / Can't have)",
    objective: "Exprimer des déductions sur un événement passé avec le bon niveau de certitude.",
    sections: [
        {
            title: "0. Deviner le passé avec précision",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ici, on ne raconte pas directement un fait observé. On fait une déduction à partir d'indices.
                        Le choix du modal montre à quel point on est certain.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
                        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                            Structure de base
                        </p>
                        <p className="text-center font-mono text-xl text-white">
                            modal + have + past participle
                        </p>
                        <div className="mt-5 grid gap-3 md:grid-cols-3 text-sm">
                            <div className="rounded-lg bg-slate-800 p-4 text-center text-emerald-300">
                                must have
                                <div className="mt-2 text-slate-400">quasi certain</div>
                            </div>
                            <div className="rounded-lg bg-slate-800 p-4 text-center text-amber-300">
                                may / might / could have
                                <div className="mt-2 text-slate-400">possible</div>
                            </div>
                            <div className="rounded-lg bg-slate-800 p-4 text-center text-rose-300">
                                can't / couldn't have
                                <div className="mt-2 text-slate-400">impossible selon moi</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Must have, may have, might have, could have",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Must have</h4>
                            <p className="text-slate-300">
                                The lights are off. They <strong>must have gone</strong> home.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                C'est, pour moi, l'explication la plus logique.
                            </p>
                        </div>

                        <div className="rounded-xl border-l-4 border-amber-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">May / might / could have</h4>
                            <p className="text-slate-300">
                                She <strong>might have missed</strong> the bus.
                            </p>
                            <p className="mt-2 text-xs italic text-slate-500">
                                C'est possible, mais je ne suis pas sûr.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                            Nuances utiles
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li><strong>must have</strong> = déduction forte</li>
                            <li><strong>may have / might have</strong> = possibilité</li>
                            <li><strong>could have</strong> = déduction possible aussi, souvent un peu moins fréquent</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Conclusion, attente ou reproche",
            content: (
              <LessonExamples
                examples={[
                  { english: "It can’t have been Maya. She was in Madrid.", meaning: "Sa présence ailleurs contredit l’hypothèse." },
                  { english: "You should have called. I was waiting.", meaning: "Le locuteur reproche l’absence d’appel." },
                  { english: "The train should have arrived by now.", meaning: "D’après l’horaire, on s’attend à ce que le train soit arrivé." },
                ]}
              >
                Can’t have et couldn’t have permettent d’écarter une explication selon les indices disponibles. Should have peut exprimer un reproche ou une attente raisonnable. Le contexte permet de les distinguer.
              </LessonExamples>
            )
        },
        {
            title: "3. Lire les indices avant de choisir le modal",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        La bonne réponse dépend des preuves visibles. Ce n'est pas seulement une question de forme,
                        mais de logique.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Preuve forte</h4>
                            <p className="text-slate-300">must have</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Hypothèse ouverte</h4>
                            <p className="text-slate-300">may / might / could have</p>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Contradiction claire</h4>
                            <p className="text-slate-300">can't have / couldn't have</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                        <p className="text-slate-200">
                            Exemple : <em>The door was locked and nothing was broken. The thief must have had a key.</em>
                            On ne sait pas exactement ce qui s'est passé, mais les indices orientent fortement la déduction.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz · Déduire ce qui a dû se passer",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "The lights are off and nobody is answering. They ___ home.",
                            options: ["must have gone", "can't have gone"],
                            correctAnswer: 0,
                            explanation: "Les indices rendent le départ très probable.",
                        },
                        {
                            id: 2,
                            question: "She ___ driven here. Her car keys are still on the table.",
                            options: ["must have", "can't have"],
                            correctAnswer: 1,
                            explanation: "Les indices contredisent cette hypothèse.",
                        },
                        {
                            id: 3,
                            question: "He isn't answering. He ___ his phone at home.",
                            options: ["might have left", "can't have left for sure"],
                            correctAnswer: 0,
                            explanation: "C'est une possibilité, pas une certitude.",
                        },
                        {
                            id: 4,
                            question: "La serrure est intacte. Le témoin conclut que le voleur avait forcément une clé. The thief ___ had a key.",
                            options: ["might have", "must have", "ought to"],
                            correctAnswer: 1,
                            explanation: "Must have exprime la forte déduction que le témoin formule.",
                        },
                        {
                            id: 5,
                            question: "It ___ been Julia I saw. She is abroad this week.",
                            options: ["must have", "couldn't have"],
                            correctAnswer: 1,
                            explanation: "La situation rend cette hypothèse impossible.",
                        },
                        {
                            id: 6,
                            question: "Quelle phrase exprime un reproche dans ce contexte ?",
                            options: ["You should have called. I waited an hour for you.", "Your train should have arrived by now, according to the timetable.", "You might have left your phone at home."],
                            correctAnswer: 0,
                            explanation: "Dans la première phrase, la personne reproche à son interlocuteur de ne pas avoir appelé.",
                        },
                        {
                            id: 7,
                            question: "Police think the suspect ___ the country using a fake passport.",
                            options: ["can't have left", "may have left"],
                            correctAnswer: 1,
                            explanation: "L'enquête n'apporte qu'une hypothèse possible.",
                        },
                        {
                            id: 8,
                            question: "Seul Mo a fait les courses hier. Son ticket indique du lait et la bouteille est dans le frigo. Mo ___ the milk yesterday.",
                            options: ["can’t have bought", "must have bought", "might buy tomorrow"],
                            correctAnswer: 1,
                            explanation: "Les indices concordent et désignent Mo. Must have bought formule une forte déduction.",
                        },
                        {
                            id: 9,
                            question: "The train is late, so they ___ arrived yet.",
                            options: ["must have", "can't have"],
                            correctAnswer: 1,
                            explanation: "Les indices rendent l'arrivée déjà accomplie très improbable.",
                        },
                        {
                            id: 10,
                            question: "Which form means 'possible but not certain'?",
                            options: ["must have", "might have"],
                            correctAnswer: 1,
                            explanation: "Might have exprime une déduction ouverte.",
                        }
                    ]}
                />
            )
        }
    ]
};
