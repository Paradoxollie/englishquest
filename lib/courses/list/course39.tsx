import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course39: LessonContent = {
    courseNumber: 39,
    title: "Gérondif ou Infinitif (1) : Verbes + -ING",
    objective: "Construire enjoy, mind ou avoid avec -ing et distinguer les deux sens de stop.",
    sections: [
        {
            title: "Nommer une activité",
            content: (
              <LessonExamples
                examples={[
                  { english: "I enjoy swimming.", meaning: "Je prends plaisir à nager." },
                  { english: "Swimming helps me relax.", meaning: "L’activité est ici le sujet de la phrase." },
                ]}
              >
                La forme en -ing peut désigner une activité. La construction dépend du premier verbe.
              </LessonExamples>
            )
        },
        {
            title: "Le verbe change la construction",
            content: (
              <LessonExamples
                examples={[
                  { english: "I enjoy cooking. Would you mind waiting?", meaning: "Après enjoy et mind, utilise -ing." },
                  { english: "He stopped smoking.", meaning: "Il a arrêté de fumer." },
                  { english: "He stopped to smoke.", meaning: "Il s’est arrêté pour fumer." },
                ]}
                note={"On dit aussi She suggested taking a break ou She suggested that we take a break."}
              >
                Enjoy, mind, finish, avoid, keep et suggest acceptent un complément en -ing. Stop fonctionne aussi avec un infinitif de but, ce qui change le sens.
              </LessonExamples>
            )
        },
        {
            title: "Après une préposition",
            content: (
              <LessonExamples
                examples={[
                  { english: "She’s good at learning languages.", meaning: "Elle est douée pour apprendre les langues." },
                  { english: "Thanks for coming.", meaning: "Merci d’être venu ou venue." },
                  { english: "He left without saying goodbye.", meaning: "Il est parti sans dire au revoir." },
                ]}
              >
                Une activité placée directement après une préposition comme at, in, for ou without prend généralement la forme en -ing.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Choisir le complément en -ing",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I enjoy ___ football.",
                            options: ["to play", "playing"],
                            correctAnswer: 1,
                            explanation: "Enjoy se construit ici avec un verbe en -ing.",
                        },
                        {
                            id: 2,
                            question: "Would you mind ___ the window?",
                            options: ["to close", "closing"],
                            correctAnswer: 1,
                            explanation: "Dans Would you mind + activité, le verbe prend -ing.",
                        },
                        {
                            id: 3,
                            question: "Il a arrêté de fumer il y a cinq ans et n’a plus touché une cigarette. He stopped ___ five years ago.",
                            options: ["to smoke", "smoking", "smoke"],
                            correctAnswer: 1,
                            explanation: "Stop smoking signifie cesser de fumer. Stop to smoke signifie faire une pause pour fumer.",
                        },
                        {
                            id: 4,
                            question: "She is afraid of ___.",
                            options: ["flying", "to fly"],
                            correctAnswer: 0,
                            explanation: "Of est ici une préposition et flying nomme l’activité qui lui fait peur.",
                        },
                        {
                            id: 5,
                            question: "I suggest ___ a break.",
                            options: ["to take", "taking"],
                            correctAnswer: 1,
                            explanation: "On peut dire I suggest taking a break ou I suggest that we take a break.",
                        },
                        {
                            id: 6,
                            question: "Have you finished ___ your homework?",
                            options: ["doing", "to do"],
                            correctAnswer: 0,
                            explanation: "Pour dire quelle activité est terminée après finish, utilise -ing.",
                        },
                        {
                            id: 7,
                            question: "He left without ___ anything.",
                            options: ["to say", "saying"],
                            correctAnswer: 1,
                            explanation: "WITHOUT est une préposition ➔ ING.",
                        },
                        {
                            id: 8,
                            question: "En pleine randonnée, Sam s’est arrêté pour prendre une photo. Quelle phrase raconte cette pause ?",
                            options: ["He stopped to take a photo.", "He stopped taking photos.", "He stopped take a photo."],
                            correctAnswer: 0,
                            explanation: "To take indique le but de l’arrêt.",
                        },
                        {
                            id: 9,
                            question: "We avoided ___ him.",
                            options: ["to meet", "meeting"],
                            correctAnswer: 1,
                            explanation: "Après avoid, meeting him désigne la rencontre qu’on a évitée.",
                        },
                        {
                            id: 10,
                            question: "I am thinking about ___ a new car.",
                            options: ["buying", "to buy"],
                            correctAnswer: 0,
                            explanation: "ABOUT est une préposition ➔ ING.",
                        }
                    ]}
                />
            )
        }
    ]
};
