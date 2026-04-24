import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course22: LessonContent = {
    courseNumber: 22,
    title: "Present Perfect (2) : Expérience de vie",
    objective: "Parler de ses expériences de vie avec le Present Perfect et revenir au Past Simple dès qu'un moment précis est donné.",
    sections: [
        {
            title: "1. Le Concept : Le Bilan de Vie",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ici, on ne regarde pas le résultat immédiat, mais <strong className="text-emerald-400">l&apos;expérience accumulée</strong> jusqu&apos;à aujourd&apos;hui.
                        Pensez-y comme une "Checklist de vie".
                    </p>

                    <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-purple-500">
                        <h4 className="text-purple-400 font-bold mb-4 text-lg">LE TEMPS NON-DÉFINI</h4>
                        <p className="text-slate-300 mb-4">
                            La période de temps est : <strong className="text-white">"De votre naissance à maintenant"</strong>.
                            Tant que vous êtes vivant, la période n&apos;est pas finie, donc on utilise le Present Perfect.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇯🇵</span>
                                <p className="text-white text-lg">"I <strong className="text-purple-400">have been</strong> to Japan."</p>
                            </div>
                            <p className="text-slate-400 text-sm ml-10">(= Dans ma vie, j&apos;y suis allé au moins une fois. Peu importe quand.)</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. La Règle d'Or : Details Switch",
            content: (
                <div className="space-y-6">
                    <div className="bg-red-900/20 p-4 rounded border border-red-500/50">
                        <h4 className="text-red-400 font-bold mb-2 uppercase flex items-center gap-2">
                            <span>⚠️</span> RÈGLE DE PRÉCISION
                        </h4>
                        <p className="text-slate-300 mb-4">
                            C'est l'erreur numéro 1. Dès que vous donnez un <strong className="text-white">DÉTAIL</strong> (Quand ? Où exactement ? Comment ?), vous basculez obligatoirement au <strong className="text-amber-400">PAST SIMPLE</strong>.
                        </p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">1. L&apos;annonce (Expérience)</p>
                                    <p className="text-emerald-300 font-medium">"I <strong className="text-white">have been</strong> to Japan."</p>
                                </div>
                                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">2. Le détail (Passé fini)</p>
                                    <p className="text-amber-300 font-medium">"I <strong className="text-white">went</strong> there in 2010."</p>
                                </div>
                            </div>

                            <div className="bg-black/30 p-3 rounded text-sm italic text-slate-400">
                                <p>A: "Have you seen 'Titanic'?" <span className="text-emerald-500">(Bilan)</span></p>
                                <p>B: "Yes, I saw it last week." <span className="text-amber-500">(Détail temps)</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "3. EVER & NEVER",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Pour demander ou affirmer une expérience, on utilise ces deux mots clés.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded border-t-4 border-cyan-500">
                            <h4 className="text-cyan-400 font-bold mb-2">EVER (Déjà / Une fois dans ta vie)</h4>
                            <p className="text-slate-400 text-sm mb-3">Utilisé principalement dans les <strong className="text-white">QUESTIONS</strong>.</p>
                            <p className="text-white italic">"Have you <strong className="text-cyan-400">ever</strong> eaten sushi?"</p>
                            <p className="text-xs text-slate-500 mt-1">(Est-ce que ça t&apos;est arrivé, ne serait-ce qu&apos;une fois ?)</p>
                        </div>

                        <div className="bg-slate-900 p-4 rounded border-t-4 border-red-500">
                            <h4 className="text-red-400 font-bold mb-2">NEVER (Jamais)</h4>
                            <p className="text-slate-400 text-sm mb-3">Le verbe reste <strong className="text-white">POSITIF</strong> car Never porte la négation.</p>
                            <p className="text-white italic">"I <strong className="text-red-400">have never</strong> flown in a helicopter."</p>
                            <div className="mt-2 bg-red-900/30 p-2 rounded text-xs text-red-200">
                                ⚠️ <span className="line-through text-slate-500">I haven&apos;t never</span> (Double négation interdite !)
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "4. Nuance Critique : GONE vs BEEN",
            content: (
                <div className="space-y-6">
                    <div className="bg-amber-900/20 p-4 rounded border border-amber-500/50">
                        <h4 className="text-amber-400 font-bold mb-2 uppercase flex items-center gap-2">
                            <span>✈️</span> PIÈGE CLASSIQUE
                        </h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Le verbe "TO GO" a deux participes passés avec des sens très différents.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-slate-900 p-3 rounded flex items-start gap-3">
                                <div className="bg-slate-800 p-2 rounded text-2xl">🏃</div>
                                <div>
                                    <strong className="text-amber-400 block mb-1">GONE (Parti sans revenir)</strong>
                                    <p className="text-white italic">"Jim is on holiday. He <strong className="text-amber-400">has gone</strong> to Spain."</p>
                                    <p className="text-xs text-slate-400 mt-1">➔ IL EST EN ESPAGNE MAINTENANT. Il n&apos;est pas ici.</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-3 rounded flex items-start gap-3">
                                <div className="bg-slate-800 p-2 rounded text-2xl">🏡</div>
                                <div>
                                    <strong className="text-emerald-400 block mb-1">BEEN (Allé et revenu)</strong>
                                    <p className="text-white italic">"Jane is back home. She <strong className="text-emerald-400">has been</strong> to Spain."</p>
                                    <p className="text-xs text-slate-400 mt-1">➔ ELLE EST ICI. Le voyage est fini, c&apos;est un souvenir/expérience.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-slate-800 rounded text-center">
                            <p className="text-white text-sm">
                                Pour dire "J&apos;ai été à Paris" (expérience), on dit toujours : <br />
                                <span className="text-emerald-400 font-bold text-lg">"I HAVE BEEN TO..."</span>
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "5. Structures Spéciales (It is the first time...)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Deux structures exigent rigoureusement le Present Perfect.
                    </p>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-slate-800 p-4 rounded border-l-4 border-indigo-500">
                            <h4 className="text-indigo-400 font-bold mb-2">C&apos;est la première fois que...</h4>
                            <p className="text-slate-300 text-sm mb-2">Comme c&apos;est un bilan à l&apos;instant T, on utilise le Present Perfect.</p>
                            <p className="text-white italic text-lg mb-2">"It is the <strong className="text-indigo-400">first time</strong> I <strong className="text-white">have driven</strong> a car."</p>
                            <p className="text-slate-500 text-xs">(Jamais "I drive" ou "I drove").</p>
                        </div>

                        <div className="bg-slate-800 p-4 rounded border-l-4 border-pink-500">
                            <h4 className="text-pink-400 font-bold mb-2">Superlatifs (The Best... Ever)</h4>
                            <p className="text-white italic text-lg mb-2">"It is the <strong className="text-pink-400">best</strong> movie I <strong className="text-white">have ever seen</strong>."</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz : Life Experience",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "___ you ever been to Australia?",
                            options: ["Did", "Have"],
                            correctAnswer: 1,
                            explanation: "Question sur l&apos;expérience de vie (Ever) = Present Perfect.",
                        },
                        {
                            id: 2,
                            question: "I ___ golf in my life.",
                            options: ["didn&apos;t play", "have never played"],
                            correctAnswer: 1,
                            explanation: "Expérience de vie négative jusqu&apos;à maintenant = Have never played.",
                        },
                        {
                            id: 3,
                            question: "Where is Bill? He ___ to the shops.",
                            options: ["has been", "has gone"],
                            correctAnswer: 1,
                            explanation: "Il n&apos;est pas là (On demande où il est). Il est parti = Has GONE.",
                        },
                        {
                            id: 4,
                            question: "Hello Bill! I see you have ___ to the shops.",
                            options: ["been", "gone"],
                            correctAnswer: 0,
                            explanation: "Bill est là (on lui parle). Il est allé et revenu = Has BEEN.",
                        },
                        {
                            id: 5,
                            question: "It is the first time I ___ sushi.",
                            options: ["eat", "have eaten"],
                            correctAnswer: 1,
                            explanation: "Structure 'It is the first time...' = Present Perfect Obligatoire.",
                        },
                        {
                            id: 6,
                            question: "Have you ever been to Paris? Yes, I ___ there in 2015.",
                            options: ["have been", "went"],
                            correctAnswer: 1,
                            explanation: "Détail de temps précis (in 2015) = SWITCH au Past Simple.",
                        },
                        {
                            id: 7,
                            question: "I have never ___ a horse.",
                            options: ["ridden", "rode"],
                            correctAnswer: 0,
                            explanation: "Participe passé de RIDE = RIDDEN.",
                        },
                        {
                            id: 8,
                            question: "This comes from a book I ___.",
                            options: ["read", "have read"],
                            correctAnswer: 1,
                            explanation: "C&apos;est une expérience (j&apos;ai lu ce livre, peu importe quand).",
                        },
                        {
                            id: 9,
                            question: "She ___ to China three times.",
                            options: ["has been", "was"],
                            correctAnswer: 0,
                            explanation: "Expérience répétée dans une vie non terminée (elle est toujours vivante) = Present Perfect.",
                        },
                        {
                            id: 10,
                            question: "I haven&apos;t seen that movie.",
                            options: ["Correct", "Wrong"],
                            correctAnswer: 0,
                            explanation: "Phrase correcte. Bilan présent : je ne l&apos;ai pas vu.",
                        },
                    ]}
                />
            )
        }
    ]
};
