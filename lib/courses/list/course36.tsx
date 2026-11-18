import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course36: LessonContent = {
    courseNumber: 36,
    title: "Discours Indirect (2) : Les Questions Rapportées",
    objective: "Maîtriser la transformation des questions (Ordre des mots & 'IF').",
    sections: [
        {
            title: "0. Vocabulaire Technique",
            content: (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 mb-6">
                    <p className="text-slate-400 text-sm mb-2 uppercase font-bold tracking-wider">Concepts Clés :</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Word Order</span>
                            <span className="text-slate-500 text-sm">Ordre des mots</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">S.V.O.</span>
                            <span className="text-slate-500 text-sm">Sujet - Verbe - Objet</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold">Wh- Words</span>
                            <span className="text-slate-500 text-sm">Where, What, Who...</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Retrouver l’ordre sujet + verbe",
            content: (
              <LessonExamples
                examples={[
                  { english: "He asked where she lives.", meaning: "Tu racontes ce que quelqu’un a demandé. La phrase se termine par un point." },
                  { english: "Do you know where she lives?", meaning: "Tu poses toi-même une question polie. La phrase se termine par un point d’interrogation." },
                ]}
              >
                Dans la question rapportée, le sujet vient devant le verbe. La ponctuation finale dépend de la phrase complète.
              </LessonExamples>
            )
        },
        {
            title: "Rapporter une question fermée",
            content: (
              <LessonExamples
                examples={[
                  { english: "Are they ready?", meaning: "La question directe s’adresse au groupe." },
                  { english: "He asked if they were ready. He asked whether they were ready.", meaning: "Les deux mots introduisent la même question rapportée." },
                ]}
              >
                Pour rapporter une question à laquelle on pourrait répondre yes ou no, emploie if ou whether, puis le sujet et le verbe.
              </LessonExamples>
            )
        },
        {
            title: "3. La Disparition de DO / DOES / DID",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Les auxiliaires "Do", "Does" et "Did" servent uniquement à former la question directe.
                        <br />Puisque la phrase devient une affirmation, <strong>ils doivent disparaître</strong>.
                    </p>

                    <div className="bg-slate-900 p-4 rounded-xl border border-red-500/30">
                        <p className="text-white mb-2">Direct: "Where <strong className="text-red-400 line-through decoration-2">do</strong> you live?"</p>
                        <p className="text-white font-bold text-lg">Indirect: He asked where I lived.</p>
                        <p className="text-xs text-slate-400 mt-1">Le verbe principal (live) applique la concordance des temps (Subject + Past Simple).</p>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz · Rapporter une question",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "DIRECT: 'Where is Tom?' ➔ INDIRECT: He asked where ___.",
                            options: ["was Tom", "Tom was"],
                            correctAnswer: 1,
                            explanation: "Ordre S-V (Sujet + Verbe) obligatoire : Tom (Sujet) avant Was (Verbe).",
                        },
                        {
                            id: 2,
                            question: "DIRECT: 'Are you ready?' ➔ INDIRECT: He asked ___ I was ready.",
                            options: ["that", "if"],
                            correctAnswer: 1,
                            explanation: "Question fermée (Oui/Non) ➔ Insertion de IF.",
                        },
                        {
                            id: 3,
                            question: "DIRECT: 'What do you want?' ➔ INDIRECT: He asked what ___.",
                            options: ["I wanted", "did I want"],
                            correctAnswer: 0,
                            explanation: "Disparition de DO. Passage à l'ordre affirmatif Passé (I wanted).",
                        },
                        {
                            id: 4,
                            question: "Dans ce récit au passé, applique le décalage des temps. He asked if I ___ swim.",
                            options: ["can", "could"],
                            correctAnswer: 1,
                            explanation: "Dans le décalage demandé, can devient could.",
                        },
                        {
                            id: 5,
                            question: "DIRECT: 'Where does she live?' ➔ INDIRECT: He asked where ___.",
                            options: ["she lived", "did she live"],
                            correctAnswer: 0,
                            explanation: "Disparition de DOES. Passage à l'affirmative (She lived).",
                        },
                        {
                            id: 6,
                            question: "DIRECT: 'Who are you?' ➔ INDIRECT: He asked who ___.",
                            options: ["was I", "I was"],
                            correctAnswer: 1,
                            explanation: "Ordre S-V : I (Sujet) avant Was (Verbe).",
                        },
                        {
                            id: 7,
                            question: "Le concert d’hier est fini. Avant le concert, il m’a demandé si je viendrais. He asked if I ___ come.",
                            options: ["would", "will"],
                            correctAnswer: 0,
                            explanation: "Would rapporte ce qui était encore futur à ce moment-là.",
                        },
                        {
                            id: 8,
                            question: "DIRECT: 'Did you finish?' ➔ He asked if I ___ finished.",
                            options: ["have", "had"],
                            correctAnswer: 1,
                            explanation: "DID indique le passé. Le 'passé du passé' est le Past Perfect (HAD finished).",
                        },
                        {
                            id: 9,
                            question: "Tu demandes poliment une adresse. Quelle question peux-tu poser ?",
                            options: ["Do you know where she lives?", "Do you know where does she live?", "Do you know she where lives?"],
                            correctAnswer: 0,
                            explanation: "L’ensemble est une question, et where she lives garde l’ordre sujet + verbe.",
                        },
                        {
                            id: 10,
                            question: "He asked me do I like coffee. (Correct ?)",
                            options: ["Oui", "Non"],
                            correctAnswer: 1,
                            explanation: "Faux ! On ne peut pas garder 'do'. Il faut dire : He asked IF I liked coffee.",
                        }
                    ]}
                />
            )
        }
    ]
};