import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course50: LessonContent = {
    courseNumber: 50,
    title: "Phrasal Verbs (Les essentiels)",
    objective: "Fixer un premier noyau de phrasal verbs indispensables et savoir les réutiliser dans des phrases naturelles.",
    sections: [
        {
            title: "0. Apprendre les essentiels par blocs",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le but ici n'est pas de mémoriser une liste infinie. Il faut d'abord verrouiller un noyau
                        fréquent, très utile à l'oral comme à l'écrit courant.
                    </p>

                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
                        <p className="text-slate-200">
                            Méthode conseillée : apprendre chaque phrasal verb avec
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
                                <li><strong>turn on / off</strong> = allumer / éteindre</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Objets et déplacements</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>pick up</strong> = ramasser / récupérer</li>
                                <li><strong>drop off</strong> = déposer</li>
                                <li><strong>run out of</strong> = ne plus avoir</li>
                                <li><strong>go back</strong> = retourner</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Travail, études, interaction",
            content: (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Communication et information</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>find out</strong> = découvrir</li>
                                <li><strong>check out</strong> = vérifier / jeter un œil</li>
                                <li><strong>fill in</strong> = remplir un document</li>
                                <li><strong>look into</strong> = examiner</li>
                            </ul>
                        </div>
                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                            <h4 className="mb-2 font-bold text-white">Action et progression</h4>
                            <ul className="space-y-2 text-slate-300">
                                <li><strong>deal with</strong> = gérer</li>
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
            title: "Le trajet de Maya et Sam",
            content: (
              <LessonExamples
                examples={[
                  { english: "Can you pick me up at the station?", meaning: "Maya demande qu’on vienne la chercher." },
                  { english: "Could you drop me off at the theatre?", meaning: "Elle indique ensuite où elle veut descendre." },
                  { english: "We’ve run out of petrol. Let’s find a station.", meaning: "Un imprévu change le trajet." },
                ]}
                note={"Pour raconter ta propre version, change le point de départ, la destination et ce qui vient à manquer."}
              >
                Le téléphone de Maya vibre. Lis les trois messages dans l’ordre et imagine ce que Sam doit faire.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Placer le complément d’un verbe à particule",
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
                            explanation: "Deal with = gérer un problème ou une situation.",
                        },
                        {
                            id: 5,
                            question: "I need to ___ why the server failed.",
                            options: ["find out", "put on"],
                            correctAnswer: 0,
                            explanation: "Find out = découvrir une information.",
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
                            explanation: "Set up est fréquent pour du matériel, un système ou un événement.",
                        },
                        {
                            id: 8,
                            question: "« I’ll pick you up at six outside the station. » Que proposes-tu ?",
                            options: ["Venir chercher la personne.", "La déposer à la gare avant six heures.", "Lui faire remplir un document."],
                            correctAnswer: 0,
                            explanation: "Dans ce trajet, pick someone up signifie venir chercher quelqu’un.",
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
                            question: "Le réservoir est vide, Maya doit prévenir Sam. Quel message envoie-t-elle ?",
                            options: ["We’ve run out of petrol.", "We’ve put on petrol.", "We’ve looked after petrol."],
                            correctAnswer: 0,
                            explanation: "Run out of signifie que la réserve est épuisée.",
                        }
                    ]}
                />
            )
        }
    ]
};
