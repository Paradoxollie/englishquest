import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course22: LessonContent = {
    courseNumber: 22,
    title: "Present Perfect (2) : Expérience de vie",
    objective: "Parler de ses expériences de vie avec le Present Perfect et revenir au Past Simple dès qu'un moment précis est donné.",
    sections: [
        {
            title: "Faire le bilan d’une expérience",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ve been to Japan twice.", meaning: "Deux visites font partie de ton expérience." },
                  { english: "I went there with my brother in 2019.", meaning: "Tu situes maintenant un voyage précis." },
                ]}
              >
                Avec have ou has suivi du participe passé, tu peux dire ce que tu as déjà fait au cours d’une période qui va jusqu’à maintenant.
              </LessonExamples>
            )
        },
        {
            title: "Relancer la conversation",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ve eaten sushi in Tokyo twice.", meaning: "Tu fais le bilan d’une expérience dans un lieu précis." },
                  { english: "When did you last go? I went there last Friday.", meaning: "La relance situe une visite sur le calendrier." },
                ]}
              >
                Le present perfect peut inclure un lieu ou une fréquence. Un repère passé terminé, comme last Friday, appelle normalement le prétérit pour raconter cet épisode.
              </LessonExamples>
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
            title: "Been to et gone to",
            content: (
              <LessonExamples
                examples={[
                  { english: "Have you ever been to Dublin?", meaning: "On demande si le voyage fait partie de ton expérience." },
                  { english: "Sam has gone to the shops. He’ll be back at six.", meaning: "Sam est parti et on attend encore son retour." },
                ]}
              >
                Have been to évoque une visite ou une expérience. Have gone to indique souvent que la personne est partie et se trouve encore en déplacement.
              </LessonExamples>
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
            title: "Quiz · Parler d’une expérience",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "___ you ever been to Australia?",
                            options: ["Did", "Have"],
                            correctAnswer: 1,
                            explanation: "Question sur l'expérience de vie (Ever) = Present Perfect.",
                        },
                        {
                            id: 2,
                            question: "I ___ golf in my life.",
                            options: ["didn't play", "have never played"],
                            correctAnswer: 1,
                            explanation: "Expérience de vie négative jusqu'à maintenant = Have never played.",
                        },
                        {
                            id: 3,
                            question: "Where is Bill? He ___ to the shops.",
                            options: ["has been", "has gone"],
                            correctAnswer: 1,
                            explanation: "Il n'est pas là (on demande où il est). Il est parti = Has GONE.",
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
                            explanation: "Structure 'It is the first time...' = Present Perfect obligatoire.",
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
                            question: "This is the first time I ___ a book in English.",
                            options: ["read", "have read"],
                            correctAnswer: 1,
                            explanation: "Après 'This is the first time', on utilise le Present Perfect : c'est un bilan de mon expérience jusqu'à maintenant.",
                        },
                        {
                            id: 9,
                            question: "Fais le bilan de ses voyages jusqu’à aujourd’hui. She ___ to China three times.",
                            options: ["has been", "was"],
                            correctAnswer: 0,
                            explanation: "Expérience répétée dans une vie non terminée (elle est toujours vivante) = Present Perfect.",
                        },
                        {
                            id: 10,
                            question: "« Have you ever watched a play in English? » Quelle relance situe une représentation passée ?",
                            options: ["When did you see it?", "When have you saw it?", "When you did see it?"],
                            correctAnswer: 0,
                            explanation: "La relance demande la date d’une représentation précise.",
                        },
                    ]}
                />
            )
        }
    ]
};
