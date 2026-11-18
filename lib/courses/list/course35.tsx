import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course35: LessonContent = {
    courseNumber: 35,
    title: "Discours Indirect (1) : He said that...",
    objective: "Rapporter les paroles de quelqu'un (Le 'Gossip').",
    sections: [
        {
            title: "0. Boîte à Outils (Vocabulaire)",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Mots clés pour ce cours :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Say (Said)</span>
                            <span className="text-slate-500 text-sm">Dire</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Tell (Told)</span>
                            <span className="text-slate-500 text-sm">Raconter / Dire à qqn</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Ask</span>
                            <span className="text-slate-500 text-sm">Demander</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Rapporter plus tard ou confirmer ce qui reste vrai",
            content: (
              <LessonExamples
                examples={[
                  { english: "Yesterday he said he was ill. Today he’s back at work.", meaning: "Le récit replace la maladie dans le passé." },
                  { english: "Maya said she lives in York.", meaning: "La personne qui rapporte l’adresse la présente comme actuelle." },
                  { english: "Maya said she lived in York.", meaning: "Le décalage des temps est possible, même si Maya y habite encore." },
                ]}
              >
                Après said ou told au passé, on décale souvent le temps du verbe. On peut garder le présent si l’information est toujours valable. Le passé rapporté seul ne précise pas si la situation a changé.
              </LessonExamples>
            )
        },
        {
            title: "Adapter les pronoms",
            content: (
              <LessonExamples
                examples={[
                  { english: "Tom said, “I like my car.”", meaning: "Dans sa bouche, I et my renvoient à Tom." },
                  { english: "Tom said he liked his car.", meaning: "La personne qui raconte parle maintenant de Tom." },
                ]}
              >
                Identifie la personne qui parle, celle à qui elle parle et les personnes qu’elle désigne. Change les pronoms quand le point de vue change.
              </LessonExamples>
            )
        },
        {
            title: "3. Say vs Tell (Le piège)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        C'est la faute la plus courante. Quelle est la différence ?
                        <br /><span className="text-emerald-400 font-bold">TELL</span> a besoin d'une personne cible.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-4 rounded-xl">
                            <h4 className="text-white font-bold mb-2">SAY (Dire quelque chose)</h4>
                            <ul className="text-slate-300 space-y-2">
                                <li>✅ He said that...</li>
                                <li>❌ <span className="line-through">He said me that...</span> (INTERDIT)</li>
                                <li>✅ He said <strong>to</strong> me that... (Possible mais lourd)</li>
                            </ul>
                        </div>

                        <div className="bg-slate-800 p-4 rounded-xl">
                            <h4 className="text-emerald-400 font-bold mb-2">TELL (Dire À quelqu'un)</h4>
                            <ul className="text-slate-300 space-y-2">
                                <li>✅ He told <strong>me</strong> that...</li>
                                <li>✅ He told <strong>Ann</strong> that...</li>
                                <li>❌ <span className="line-through">He told that...</span> (Il manque la personne !)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz · Rapporter des paroles",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Tom était malade lundi, il est guéri. Raconte lundi. He said he ___ sick that day.",
                            options: ["is", "was"],
                            correctAnswer: 1,
                            explanation: "Le moment raconté est terminé. Was correspond à la maladie de lundi.",
                        },
                        {
                            id: 2,
                            question: "Sarah habite toujours York. Quelles paroles rapportent correctement cette information ?",
                            options: ["She said she lives in York. / She said she lived in York.", "She said she live in York. / She says she living there.", "She said me she lives in York."],
                            correctAnswer: 0,
                            explanation: "Le présent souligne que l’information reste vraie. Le décalage au passé est aussi possible.",
                        },
                        {
                            id: 3,
                            question: "He ___ me that he was angry.",
                            options: ["said", "told"],
                            correctAnswer: 1,
                            explanation: "Il y a 'ME' (la personne cible) ➔ TOLD.",
                        },
                        {
                            id: 4,
                            question: "He ___ that he was angry.",
                            options: ["said", "told"],
                            correctAnswer: 0,
                            explanation: "Pas de 'ME' (pas de cible) ➔ SAID.",
                        },
                        {
                            id: 5,
                            question: "Paul avait promis un appel hier. Le moment prévu est passé. He said he ___ call me that evening.",
                            options: ["would", "will"],
                            correctAnswer: 0,
                            explanation: "Le futur vu depuis un moment passé se rapporte avec would.",
                        },
                        {
                            id: 6,
                            question: "Anna a dit « I can swim ». Rapporte ses paroles en appliquant le décalage au passé. She said she ___ swim.",
                            options: ["can", "could"],
                            correctAnswer: 1,
                            explanation: "Avec le décalage demandé, can devient could. Can reste possible pour affirmer sa capacité actuelle.",
                        },
                        {
                            id: 7,
                            question: "'My feet are cold.' ➔ He said ___ feet were cold.",
                            options: ["my", "his"],
                            correctAnswer: 1,
                            explanation: "On change le pronom : 'Mes pieds' deviennent 'Ses pieds' (His feet).",
                        },
                        {
                            id: 8,
                            question: "Elle voulait partir hier et elle est depuis partie. She said she ___ to go.",
                            options: ["wants", "wanted"],
                            correctAnswer: 1,
                            explanation: "Wanted situe ce souhait hier.",
                        },
                        {
                            id: 9,
                            question: "He said me the truth. (Correct ou Faux ?)",
                            options: ["Correct", "Faux"],
                            correctAnswer: 1,
                            explanation: "Faux ! On ne dit jamais 'Said me'. On dit 'Told me'.",
                        },
                        {
                            id: 10,
                            question: "Maya travaillait à huit heures hier. Rapporte ce qu’elle a dit à ce moment-là. She said she ___ working at eight.",
                            options: ["was", "is"],
                            correctAnswer: 0,
                            explanation: "Was working situe l’activité à huit heures hier.",
                        }
                    ]}
                />
            )
        }
    ]
};