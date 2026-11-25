import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course29: LessonContent = {
    courseNumber: 29,
    title: "Incertitude : May, Might & Maybe",
    objective: "Dire « Il va peut-être pleuvoir » avec It may rain, It might rain ou Maybe it will rain. Tu verras aussi comment demander une permission avec may.",
    sections: [
        {
            title: "Exprimer un degré de certitude",
            content: (
              <LessonExamples
                examples={[
                  { english: "It may rain. It might rain.", meaning: "Dans les deux cas, la pluie est possible." },
                  { english: "I’m sure it’ll rain soon.", meaning: "I’m sure rend la confiance du locuteur explicite." },
                ]}
              >
                May, might et could peuvent tous introduire une possibilité. Le contexte et l’intonation comptent. Ces modaux ne correspondent pas à des pourcentages fixes.
              </LessonExamples>
            )
        },
        {
            title: "Maybe ou may be ?",
            content: (
              <LessonExamples
                examples={[
                  { english: "Maybe he is ill.", meaning: "Peut-être qu’il est malade. La phrase contient déjà is." },
                  { english: "He may be ill.", meaning: "Il se peut qu’il soit malade. Be est ici le verbe après may." },
                ]}
              >
                Maybe, en un mot, se comporte comme un adverbe. May be, en deux mots, réunit le modal may et le verbe be.
              </LessonExamples>
            )
        },
        {
            title: "Demander une permission",
            content: (
              <LessonExamples
                examples={[
                  { english: "May I leave early today?", meaning: "Tu demandes l’autorisation de partir plus tôt." },
                  { english: "Can I borrow your pen?", meaning: "Tu demandes un stylo à un ami." },
                ]}
              >
                May I…? est une façon polie, assez formelle, de demander une permission. Can I…? est très courant dans la conversation.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Exprimer un doute",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "___ he likes football.",
                            options: ["May be", "Maybe"],
                            correctAnswer: 1,
                            explanation: "C'est en début de phrase et suivi d'un sujet + verbe ('he likes'). C'est l'adverbe.",
                        },
                        {
                            id: 2,
                            question: "He ___ at home.",
                            options: ["maybe", "may be"],
                            correctAnswer: 1,
                            explanation: "Il manque le verbe. 'He may be' = Il se peut qu'il soit.",
                        },
                        {
                            id: 3,
                            question: "___ I have a glass of water, please?",
                            options: ["May", "Will"],
                            correctAnswer: 0,
                            explanation: "Demande de permission polie = May.",
                        },
                        {
                            id: 4,
                            question: "The sky is blue. It ___ rain, but I doubt it.",
                            options: ["must", "might"],
                            correctAnswer: 1,
                            explanation: "Probabilité faible ('I doubt it') = might. Must exprimerait une quasi-certitude.",
                        },
                        {
                            id: 5,
                            question: "She ___ not want to come.",
                            options: ["mights", "might"],
                            correctAnswer: 1,
                            explanation: "Les modaux sont invariables. Jamais de 'S'.",
                        },
                        {
                            id: 6,
                            question: "Je considère l’Espagne comme une possibilité parmi d’autres. Choisis le modal de possibilité. I ___ go to Spain.",
                            options: ["will", "may"],
                            correctAnswer: 1,
                            explanation: "Incertitude = May (ou Might). Will est une certitude.",
                        },
                        {
                            id: 7,
                            question: "Le parent donne explicitement la permission. You ___ leave the table now.",
                            options: ["may", "might"],
                            correctAnswer: 0,
                            explanation: "Donner la permission (formalité/autorité) = You may leave.",
                        },
                        {
                            id: 8,
                            question: "It is strictly forbidden. You ___ not enter.",
                            options: ["might", "may"],
                            correctAnswer: 1,
                            explanation: "'You may not' exprime une interdiction formelle (l'inverse de la permission).",
                        },
                        {
                            id: 9,
                            question: "Where is Sue? - She ___ stuck in traffic.",
                            options: ["can be", "might be"],
                            correctAnswer: 1,
                            explanation: "Pour exprimer une probabilité sur un fait actuel, on utilise Might/May/Could, mais rarement Can (qui exprime plutôt la capacité).",
                        },
                        {
                            id: 10,
                            question: "___ you help me?",
                            options: ["May", "Can"],
                            correctAnswer: 1,
                            explanation: "Piège ! On n'utilise pas 'May' pour demander une capacité ou un service physique ('Peux-tu m'aider'). On utilise Can ou Could. May est pour la permission.",
                        },
                    ]}
                />
            )
        }
    ]
};
