import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course46: LessonContent = {
    courseNumber: 46,
    title: "Faire faire quelque chose (Have something done)",
    objective: "Utiliser have something done pour parler d'un service, d'une intervention ou d'un evenement subi.",
    sections: [
        {
            title: "0. La structure causative",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Avec <strong>have something done</strong>, on dit qu'une action est faite{" "}
                        <strong>par quelqu'un d'autre</strong>, souvent pour nous, sur nous ou sur nos affaires.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
                        <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
                            Formule
                        </p>
                        <p className="text-center font-mono text-xl text-white">
                            have + object + past participle
                        </p>
                        <div className="mt-5 rounded-lg bg-black/30 p-4 text-center">
                            <p className="text-white">
                                I <strong className="text-cyan-400">had</strong> my hair{" "}
                                <strong className="text-emerald-400">cut</strong>.
                            </p>
                            <p className="mt-2 text-sm italic text-slate-400">
                                Je ne me suis pas coupe les cheveux moi-meme: quelqu'un l'a fait.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "1. Service, intervention, organisation",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C'est la structure typique pour parler d'un service professionnel ou d'une tache confiee a quelqu'un.
                    </p>

                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Service</h4>
                            <p className="text-slate-300">We had the kitchen painted.</p>
                        </div>
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Reparation</h4>
                            <p className="text-slate-300">She had her phone repaired.</p>
                        </div>
                        <div className="rounded-xl border-l-4 border-amber-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Organisation</h4>
                            <p className="text-slate-300">I need to have my eyes tested.</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="text-slate-200">
                            Le temps change normalement sur <strong>have</strong>:{" "}
                            <em>I am having the roof repaired.</em> / <em>We had the car serviced yesterday.</em>
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "2. Evenement subi et contraste utile",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        La meme structure peut aussi servir quand quelque chose nous arrive, souvent de facon negative.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-rose-300">Evenement subi</h4>
                            <p className="text-white">He had his wallet stolen.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Il ne l'a pas organise: il a subi le vol.
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Action commandee</h4>
                            <p className="text-white">He had his suit cleaned.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Ici, il a demande un service.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Ne pas confondre
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li>
                                <strong>have something done</strong> = le focus est sur la chose
                            </li>
                            <li>
                                <strong>have someone do something</strong> = on dit directement qu'on a demande a une personne d'agir
                            </li>
                        </ul>
                        <div className="mt-4 space-y-2 text-sm text-slate-300">
                            <p>I had the mechanic check the brakes.</p>
                            <p>I had the brakes checked.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Les erreurs les plus courantes",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-red-500/50 bg-red-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-red-300">Erreur</h4>
                            <p className="text-white line-through">I cut my hair yesterday.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                Cette phrase veut dire que je l'ai fait moi-meme.
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/20 p-5">
                            <h4 className="mb-3 font-bold uppercase text-emerald-300">Si un coiffeur l'a fait</h4>
                            <p className="text-white">I had my hair cut yesterday.</p>
                            <p className="mt-2 text-sm text-slate-300">
                                La structure montre bien l'intervention d'une autre personne.
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        Pense donc toujours a la question: <strong>qui a vraiment fait l'action?</strong> Si ce n'est
                        pas le sujet, la structure causative est souvent la bonne.
                    </p>
                </div>
            )
        },
        {
            title: "Quiz complet",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I need to ___ tomorrow.",
                            options: ["have my car serviced", "service my car by a mechanic"],
                            correctAnswer: 0,
                            explanation: "Have my car serviced exprime naturellement le service effectue par quelqu'un d'autre.",
                        },
                        {
                            id: 2,
                            question: "She had her phone ___ last week.",
                            options: ["repaired", "repair"],
                            correctAnswer: 0,
                            explanation: "La structure demande le past participle: repaired.",
                        },
                        {
                            id: 3,
                            question: "He had his wallet ___ on the train.",
                            options: ["stolen", "steal"],
                            correctAnswer: 0,
                            explanation: "Stolen est le past participle. Ici, on parle d'un evenement subi.",
                        },
                        {
                            id: 4,
                            question: "Which sentence means a professional did the work?",
                            options: ["I had my hair cut.", "I cut my hair."],
                            correctAnswer: 0,
                            explanation: "I had my hair cut montre qu'une autre personne s'en est chargee.",
                        },
                        {
                            id: 5,
                            question: "We are having the kitchen ___.",
                            options: ["painted", "paint"],
                            correctAnswer: 0,
                            explanation: "Have something done = object + past participle.",
                        },
                        {
                            id: 6,
                            question: "I had the mechanic ___ the brakes.",
                            options: ["check", "checked"],
                            correctAnswer: 0,
                            explanation: "Have someone do something prend la base verbale apres la personne.",
                        },
                        {
                            id: 7,
                            question: "They had their passports ___ before the trip.",
                            options: ["renewed", "renew"],
                            correctAnswer: 0,
                            explanation: "On parle d'un service realise avant le voyage.",
                        },
                        {
                            id: 8,
                            question: "This structure is often used for ...",
                            options: ["services and interventions", "general truths only"],
                            correctAnswer: 0,
                            explanation: "Have something done est tres frequent pour les services, reparations et rendez-vous.",
                        },
                        {
                            id: 9,
                            question: "She had her bag ___ while she was shopping.",
                            options: ["taken", "take"],
                            correctAnswer: 0,
                            explanation: "Taken exprime un evenement subi pendant qu'elle faisait ses courses.",
                        },
                        {
                            id: 10,
                            question: "Choose the best sentence for 'je vais faire tester mes yeux'.",
                            options: ["I'm going to have my eyes tested.", "I'm going to test my eyes."],
                            correctAnswer: 0,
                            explanation: "La premiere phrase exprime clairement le rendez-vous avec un professionnel.",
                        }
                    ]}
                />
            )
        }
    ]
};
