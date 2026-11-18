import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course25: LessonContent = {
    courseNumber: 25,
    title: "Le Bilan : HOW LONG...",
    objective: "Poser la question 'Depuis quand / Combien de temps'.",
    sections: [
        {
            title: "Demander une durée",
            content: (
              <LessonExamples
                examples={[
                  { english: "How long have you been waiting?", meaning: "Depuis combien de temps attends-tu ?" },
                  { english: "How long does the film last?", meaning: "Combien de temps dure le film ?" },
                  { english: "How long did you stay?", meaning: "Combien de temps es-tu resté ?" },
                ]}
              >
                Pour une situation commencée auparavant et toujours en cours, how long se construit souvent avec le present perfect. Une question de durée peut aussi concerner un horaire ou un séjour terminé.
              </LessonExamples>
            )
        },
        {
            title: "Quand le verbe exprime un état",
            content: (
              <LessonExamples
                examples={[
                  { english: "How long have you known Maya?", meaning: "Know décrit ici une relation." },
                  { english: "How long have you had that bike?", meaning: "Have décrit ici la possession." },
                ]}
              >
                Si le verbe décrit une connaissance ou une possession, la forme simple est habituelle. Regarde le sens du verbe dans ta phrase.
              </LessonExamples>
            )
        },
        {
            title: "Deux façons de raconter sa durée",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ve lived here for ten years.", meaning: "Je donne un fait sur mon lieu de vie." },
                  { english: "I’ve been living here for ten years.", meaning: "Je regarde la période passée ici." },
                ]}
              >
                Avec live et work, on rencontre souvent les deux formes. La forme continue met plus volontiers l’accent sur la durée ou sur l’activité en cours.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Demander depuis combien de temps",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "___ have you been waiting?",
                            options: ["How long", "When"],
                            correctAnswer: 0,
                            explanation: "On s'intéresse à la durée de l'attente = How Long.",
                        },
                        {
                            id: 2,
                            question: "___ did you arrive?",
                            options: ["How long", "When"],
                            correctAnswer: 1,
                            explanation: "Auxiliaire 'Did' (Passé) + Arriver (action ponctuelle) = Date précise = When.",
                        },
                        {
                            id: 3,
                            question: "How long ___ him?",
                            options: ["have you been knowing", "have you known"],
                            correctAnswer: 1,
                            explanation: "'Know' est un verbe d'état (State Verb). Forme continue INTERDITE.",
                        },
                        {
                            id: 4,
                            question: "How long ___ married?",
                            options: ["have they been", "are they"],
                            correctAnswer: 0,
                            explanation: "Bilan d'une situation qui a commencé dans le passé et continue = Present Perfect.",
                        },
                        {
                            id: 5,
                            question: "How long ___ your car?",
                            options: ["have you had", "have you been having"],
                            correctAnswer: 0,
                            explanation: "'Have' (posséder) est un verbe d'état. Pas de forme continue.",
                        },
                        {
                            id: 6,
                            question: "I have ___ here for 5 years.",
                            options: ["lived", "living"],
                            correctAnswer: 0,
                            explanation: "Forme correcte 'Have lived'. 'Have living' n'existe pas (il manque 'been').",
                        },
                        {
                            id: 7,
                            question: "How long ___ English?",
                            options: ["do you learn", "have you been learning"],
                            correctAnswer: 1,
                            explanation: "Action commencée dans le passé et toujours en cours = Present Perfect Continuous.",
                        },
                        {
                            id: 8,
                            question: "How long has it been raining?",
                            options: ["Since 2 hours", "For 2 hours"],
                            correctAnswer: 1,
                            explanation: "Réponse à une durée (How long) avec une quantité de temps = For.",
                        },
                        {
                            id: 9,
                            question: "I have known her ___ a long time.",
                            options: ["for", "since"],
                            correctAnswer: 0,
                            explanation: "A long time = Durée = FOR.",
                        },
                        {
                            id: 10,
                            question: "How long have you been living here?",
                            options: ["For 2010", "Since 2010"],
                            correctAnswer: 1,
                            explanation: "2010 est une date précise, donc SINCE.",
                        },
                    ]}
                />
            )
        }
    ]
};