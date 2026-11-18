import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course37: LessonContent = {
    courseNumber: 37,
    title: "Les Propositions Relatives (1) : Who / Which",
    objective: "Préciser de qui ou de quoi tu parles avec who, which et that.",
    sections: [
        {
            title: "Identifier quelqu’un",
            content: (
              <LessonExamples
                examples={[
                  { english: "That’s the woman who found my keys.", meaning: "C’est la femme qui a retrouvé mes clés. Who renvoie à the woman." },
                  { english: "This is the key which opens the gate.", meaning: "C’est la clé qui ouvre le portail. Which renvoie à the key." },
                ]}
              >
                Une relative apporte une précision sur un nom. Le pronom relatif relie cette précision au reste de la phrase.
              </LessonExamples>
            )
        },
        {
            title: "À quel nom renvoie le pronom ?",
            content: (
              <LessonExamples
                examples={[
                  { english: "The woman who called is my aunt.", meaning: "Who reprend the woman et fait l’action de téléphoner." },
                  { english: "The phone which rang is mine.", meaning: "Which reprend the phone." },
                ]}
              >
                Repère le nom que la relative décrit. Dans les exemples qui suivent, who renvoie à une personne et which à un objet.
              </LessonExamples>
            )
        },
        {
            title: "Choisir that, who ou which",
            content: (
              <LessonExamples
                examples={[
                  { english: "The bike that won the race is blue.", meaning: "Which est également possible ici." },
                  { english: "My sister, who lives in York, is here.", meaning: "Who introduit une précision entre virgules." },
                  { english: "The dogs who work with the rescue team are well trained.", meaning: "Who se rencontre également pour des animaux, notamment quand on les individualise." },
                ]}
              >
                Dans une relative qui identifie la personne ou la chose, that peut remplacer who ou which. Une information ajoutée entre virgules suit une autre construction.
              </LessonExamples>
            )
        },
        {
            title: "Lire la phrase entière",
            content: (
              <LessonExamples
                examples={[
                  { english: "The doctor who lives here works nights.", meaning: "Who est le sujet de lives. Le verbe principal est works." },
                  { english: "The book which you recommended is on the table.", meaning: "Which reprend the book. You est le sujet de recommended." },
                  { english: "The book you recommended is on the table.", meaning: "Quand le pronom est complément dans une relative qui identifie le nom, on peut souvent l’omettre." },
                ]}
              >
                Repère le nom que la relative décrit, puis la place qui manque dans cette relative.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Préciser de qui ou de quoi on parle",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "The girl ___ is sitting there is my sister.",
                            options: ["which", "who"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'The girl' (Humain) ➔ WHO.",
                        },
                        {
                            id: 2,
                            question: "The phone ___ I bought is broken.",
                            options: ["which", "who"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The phone' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 3,
                            question: "I met a man ___ works at NASA.",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'A man' (Humain) ➔ WHO.",
                        },
                        {
                            id: 4,
                            question: "Where is the cheese ___ was in the fridge?",
                            options: ["who", "which"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'The cheese' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 5,
                            question: "Do you know the people ___ live next door?",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The people' (Humains) ➔ WHO.",
                        },
                        {
                            id: 6,
                            question: "Tu décris un objet. The chair ___ broke yesterday is in the garage.",
                            options: ["who", "which", "where"],
                            correctAnswer: 1,
                            explanation: "Which peut être sujet d’une relative qui décrit une chose.",
                        },
                        {
                            id: 7,
                            question: "This is the game ___ I told you about.",
                            options: ["which", "who"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The game' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 8,
                            question: "I like students ___ work hard.",
                            options: ["which", "who"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'Students' (Humains) ➔ WHO.",
                        },
                        {
                            id: 9,
                            question: "A dictionary is a book ___ gives definitions.",
                            options: ["who", "which"],
                            correctAnswer: 1,
                            explanation: "Antécédent : 'A book' (Objet) ➔ WHICH.",
                        },
                        {
                            id: 10,
                            question: "He is the actor ___ won the Oscar.",
                            options: ["who", "which"],
                            correctAnswer: 0,
                            explanation: "Antécédent : 'The actor' (Humain) ➔ WHO.",
                        }
                    ]}
                />
            )
        }
    ]
};