import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course50: LessonContent = {
    courseNumber: 50,
    title: "Phrasal Verbs (Les essentiels)",
    objective: "Fixer un premier noyau de phrasal verbs indispensables et savoir les reutiliser dans des phrases naturelles.",
    sections: [
        {
            title: "0. Apprendre les essentiels par blocs",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le but ici n'est pas de memoriser une liste infinie. Il faut d'abord verrouiller un noyau
                        frequent, tres utile a l'oral comme a l'ecrit courant.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="text-slate-200">
                            Methode conseillee: apprendre chaque phrasal verb avec
                            <strong> un sens central</strong>, <strong>une phrase type</strong> et{" "}
                            <strong>un contraste utile</strong>.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "1. Les indispensables du quotidien",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border-l-4 border-cyan-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Actions simples</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>get up</strong> = se lever</li>
                                <li><strong>put on</strong> = enfiler</li>
                                <li><strong>take off</strong> = enlever</li>
                                <li><strong>turn on / off</strong> = allumer / eteindre</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Objets et deplacements</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>pick up</strong> = ramasser / recuperer</li>
                                <li><strong>drop off</strong> = deposer</li>
                                <li><strong>run out of</strong> = ne plus avoir</li>
                                <li><strong>go back</strong> = revenir</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Travail, etudes, interaction",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Communication et information</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>find out</strong> = decouvrir</li>
                                <li><strong>check out</strong> = verifier / jeter un oeil</li>
                                <li><strong>fill in</strong> = remplir un document</li>
                                <li><strong>look into</strong> = examiner</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Action et progression</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>deal with</strong> = gerer</li>
                                <li><strong>set up</strong> = installer / mettre en place</li>
                                <li><strong>carry on</strong> = continuer</li>
                                <li><strong>work out</strong> = trouver une solution / bien se passer</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. Les bons reflexes pour les reutiliser",
            content: (
                <div className="space-y-6">
                    <div className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-5">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
                            Trois reflexes utiles
                        </p>
                        <ul className="space-y-3 text-slate-200">
                            <li>Memorise le sens principal avant les sens secondaires.</li>
                            <li>Apprends si le verbe est separable ou non.</li>
                            <li>Associe toujours le phrasal verb a une situation concrete.</li>
                        </ul>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <div className="space-y-3 text-slate-200">
                            <p>
                                Can you <strong>fill in</strong> this form?
                            </p>
                            <p>
                                We need to <strong>deal with</strong> this problem today.
                            </p>
                            <p>
                                I finally <strong>found out</strong> why the app was crashing.
                            </p>
                            <p>
                                Please <strong>carry on</strong> with your presentation.
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-300">
                        Plus ton exposition est variee, plus ces verbes deviennent naturels. Le but n'est pas de tous
                        les connaitre, mais de rendre automatiques les plus rentables.
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
                            question: "Which phrasal verb means 'allumer'?",
                            options: ["turn on", "take off"],
                            correctAnswer: 0,
                            explanation: "Turn on = allumer.",
                        },
                        {
                            id: 2,
                            question: "If you have no milk left, you have ...",
                            options: ["run into milk", "run out of milk"],
                            correctAnswer: 1,
                            explanation: "Run out of = ne plus avoir.",
                        },
                        {
                            id: 3,
                            question: "Please ___ this form before the interview.",
                            options: ["fill in", "find out"],
                            correctAnswer: 0,
                            explanation: "Fill in = remplir un formulaire.",
                        },
                        {
                            id: 4,
                            question: "We need to ___ this complaint quickly.",
                            options: ["drop off", "deal with"],
                            correctAnswer: 1,
                            explanation: "Deal with = gerer un probleme ou une situation.",
                        },
                        {
                            id: 5,
                            question: "I need to ___ why the server failed.",
                            options: ["find out", "put on"],
                            correctAnswer: 0,
                            explanation: "Find out = decouvrir une information.",
                        },
                        {
                            id: 6,
                            question: "The meeting will continue, so please ___.",
                            options: ["take off", "carry on"],
                            correctAnswer: 1,
                            explanation: "Carry on = continuer.",
                        },
                        {
                            id: 7,
                            question: "Which one means 'installer / mettre en place'?",
                            options: ["set up", "go back"],
                            correctAnswer: 0,
                            explanation: "Set up est frequent pour du materiel, un systeme ou un evenement.",
                        },
                        {
                            id: 8,
                            question: "Pick up can mean ...",
                            options: ["refuse an invitation", "collect or lift"],
                            correctAnswer: 1,
                            explanation: "Pick up est tres polyvalent, mais l'idee de prendre ou recuperer reste centrale.",
                        },
                        {
                            id: 9,
                            question: "Which sentence is correct with the pronoun 'it'?",
                            options: ["Can you check it out for me?", "Can you check out it for me?"],
                            correctAnswer: 0,
                            explanation: "Avec un pronom objet comme 'it', le pronom se place au milieu : check it out.",
                        },
                        {
                            id: 10,
                            question: "The best strategy with essential phrasal verbs is ...",
                            options: ["memorize random long lists without examples", "learn a core set deeply in context"],
                            correctAnswer: 1,
                            explanation: "Un petit noyau solide vaut mieux qu'une longue liste oubliee.",
                        }
                    ]}
                />
            )
        }
    ]
};
