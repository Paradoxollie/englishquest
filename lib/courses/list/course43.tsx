import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course43: LessonContent = {
    courseNumber: 43,
    title: "Le Futur Antérieur et Continu (Will be doing / have done)",
    objective: "Distinguer une action en cours dans le futur d'un résultat déjà achevé avant un repère futur.",
    sections: [
        {
            title: "0. Deux manières de regarder le futur",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        À ce niveau, on ne parle plus seulement du futur en bloc. On choisit l'angle exact :
                        l'action sera-t-elle <strong>en cours</strong> ou déjà <strong>terminée</strong> à un moment futur ?
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-cyan-500/50 bg-cyan-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-cyan-300">Future continuous</h4>
                            <p className="font-mono text-white">will be + verb-ing</p>
                            <p className="mt-3 text-slate-200">
                                Action en cours à un moment futur.
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                This time tomorrow, I will be flying to Rome.
                            </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Future perfect</h4>
                            <p className="font-mono text-white">will have + past participle</p>
                            <p className="mt-3 text-slate-200">
                                Action terminée avant un repère futur.
                            </p>
                            <p className="mt-2 text-sm text-slate-400">
                                By Friday, I will have finished the report.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Future continuous : action en cours dans le futur",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le <strong>future continuous</strong> sert à imaginer une action qui sera en train de se
                        dérouler à un moment précis dans le futur.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <ul className="space-y-3 text-slate-200">
                            <li>
                                This time next week, we <strong className="text-cyan-400">will be staying</strong> by the sea.
                            </li>
                            <li>
                                At 8 p.m., she <strong className="text-cyan-400">will be giving</strong> her presentation.
                            </li>
                            <li>
                                I will post your letter. I <strong className="text-cyan-400">will be passing</strong> a post office anyway.
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Usage fin
                        </p>
                        <p className="text-slate-200">
                            On l'utilise aussi pour des suppositions polies ou neutres sur le programme de quelqu'un :
                            <em className="text-white"> Will you be using the car tonight?</em>
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Faire le point depuis un repère futur",
            content: (
              <LessonExamples
                examples={[
                  { english: "By ten, they will have landed.", meaning: "À dix heures, l’atterrissage aura déjà eu lieu." },
                  { english: "By June, I will have worked here for six years.", meaning: "En juin, six ans se seront écoulés. Le travail pourra se poursuivre ensuite." },
                ]}
              >
                Will have + participe passé permet de regarder en arrière depuis un moment futur. On peut annoncer un résultat acquis ou une durée atteinte à ce moment-là.
              </LessonExamples>
            )
        },
        {
            title: "At nine ou by nine ?",
            content: (
              <LessonExamples
                examples={[
                  { english: "At nine I’ll be writing my essay.", meaning: "À neuf heures, la rédaction est en cours." },
                  { english: "By nine I’ll have written my essay.", meaning: "La rédaction sera prête au plus tard à neuf heures." },
                  { english: "By June I’ll have been working here for ten years.", meaning: "Tu mets en avant dix années d’activité." },
                ]}
              >
                At fixe le moment où l’on observe la scène. By fixe une limite. Le futur antérieur continu peut aussi servir à souligner une durée accumulée.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Se projeter dans l’avenir",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "À cette heure-ci demain, nous serons en plein vol au-dessus des Alpes. We ___ over the Alps.",
                            options: ["will have flown", "will be flying"],
                            correctAnswer: 1,
                            explanation: "On imagine l'action en cours à un moment précis du futur.",
                        },
                        {
                            id: 2,
                            question: "Vendredi à neuf heures, le rapport sera déjà terminé. By then I ___ the report.",
                            options: ["will be finishing", "will have finished"],
                            correctAnswer: 1,
                            explanation: "By Friday indique une action terminée avant ce repère.",
                        },
                        {
                            id: 3,
                            question: "Le rendez-vous dure de 19 h 30 à 20 h 30. À 20 h, la réunion sera en cours. She ___ her clients.",
                            options: ["will have met", "will be meeting"],
                            correctAnswer: 1,
                            explanation: "À 20 h, la réunion sera en cours.",
                        },
                        {
                            id: 4,
                            question: "Tu demandes si le trajet sera terminé à minuit. Do you think they ___ there by midnight?",
                            options: ["will have got", "will be getting"],
                            correctAnswer: 0,
                            explanation: "On vise un résultat atteint avant minuit.",
                        },
                        {
                            id: 5,
                            question: "Don't call at 7. I ___ dinner then.",
                            options: ["will have cooked", "will be cooking"],
                            correctAnswer: 1,
                            explanation: "Then renvoie à un moment où l'action sera en cours.",
                        },
                        {
                            id: 6,
                            question: "By next month, we ___ here for a year.",
                            options: ["will have lived", "will be living only"],
                            correctAnswer: 0,
                            explanation: "On regarde une période complète avant un repère futur.",
                        },
                        {
                            id: 7,
                            question: "At noon, the team ___ the presentation, so wait until 1 p.m.",
                            options: ["will be giving", "will have given"],
                            correctAnswer: 0,
                            explanation: "À midi, la présentation sera en train de se dérouler.",
                        },
                        {
                            id: 8,
                            question: "Tout sera prêt avant ton arrivée. By the time you arrive, I ___ everything.",
                            options: ["will be preparing", "will have prepared"],
                            correctAnswer: 1,
                            explanation: "By the time annonce une action achevée avant ton arrivée.",
                        },
                        {
                            id: 9,
                            question: "Tu veux lire sa rédaction dès 21 heures. Quelle réponse promet un texte prêt à ce moment-là ?",
                            options: ["By nine I’ll have written it.", "At nine I’ll be writing it.", "I’ll start writing it at nine."],
                            correctAnswer: 0,
                            explanation: "Le futur antérieur situe la fin de la rédaction avant ou au plus tard à neuf heures.",
                        },
                        {
                            id: 10,
                            question: "By June, she ___ at the company for ten years. Which form stresses duration?",
                            options: ["will have been working", "will be working"],
                            correctAnswer: 0,
                            explanation: "Le future perfect continuous met l'accent sur la durée.",
                        }
                    ]}
                />
            )
        }
    ]
};
