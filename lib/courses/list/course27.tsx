import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course27: LessonContent = {
    courseNumber: 27,
    title: "Le Futur : Décision vs Plan",
    objective: "Maîtriser l'usage du FUTUR SPONTANÉ (Will).",
    sections: [
        {
            title: "Le téléphone sonne",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ll get it!", meaning: "Tu te proposes sur le moment." },
                  { english: "I’m going to call him after lunch.", meaning: "Tu avais déjà l’intention de le rappeler." },
                ]}
              >
                Ta sœur a les mains prises. En entendant le téléphone, tu décides de répondre. Will, souvent réduit à ’ll, est courant dans cette offre spontanée.
              </LessonExamples>
            )
        },
        {
            title: "Offrir, promettre, choisir",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ll carry that for you.", meaning: "Tu proposes de porter le sac." },
                  { english: "I promise I’ll be there.", meaning: "Tu t’engages à venir." },
                  { english: "I’ll have the soup, please.", meaning: "Tu choisis au moment de commander." },
                ]}
              >
                Will permet de faire quelque chose en parlant, par exemple promettre son aide ou prendre une décision.
              </LessonExamples>
            )
        },
        {
            title: "Exprimer une intention",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’m going to learn Italian. I haven’t picked a course yet.", meaning: "L’intention existe déjà." },
                  { english: "You’re learning Italian? I’ll join you!", meaning: "L’idée te vient pendant l’échange." },
                ]}
              >
                Be going to présente ton intention comme déjà formée. Les détails peuvent être encore ouverts. Les deux formes sont possibles dans de nombreuses situations et la nuance dépend de ce que tu souhaites dire.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Annoncer une décision ou un projet",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Le téléphone sonne. Quelle réplique est une offre de répondre tout de suite ?",
                            options: ["I’ll get it.", "It rang yesterday.", "I never answer it."],
                            correctAnswer: 0,
                            explanation: "I’ll get it offre une aide immédiate.",
                        },
                        {
                            id: 2,
                            question: "La peinture est achetée. Présente ton intention avec going to. I ___ paint my room.",
                            options: ["am going to", "is going to", "going"],
                            correctAnswer: 0,
                            explanation: "I prend am dans la construction be going to.",
                        },
                        {
                            id: 3,
                            question: "Quelqu’un a froid. Tu proposes ton aide. Que dis-tu ?",
                            options: ["I’ll close the window.", "Who closed it yesterday?", "Is it usually closed?"],
                            correctAnswer: 0,
                            explanation: "I’ll close the window est une offre.",
                        },
                        {
                            id: 4,
                            question: "Qu’est-ce qu’une intention déjà formée ?",
                            options: ["I’m going to visit my parents this weekend.", "I visited them yesterday.", "Where do they live?"],
                            correctAnswer: 0,
                            explanation: "Le premier énoncé présente un projet.",
                        },
                        {
                            id: 5,
                            question: "Que fait la personne en disant « I think Liverpool will win » ?",
                            options: ["Elle annonce le score final déjà connu.", "Elle donne son pronostic.", "Elle promet de jouer."],
                            correctAnswer: 1,
                            explanation: "I think annonce le point de vue du locuteur.",
                        },
                        {
                            id: 6,
                            question: "Quelle phrase est une promesse de remboursement ?",
                            options: ["I’ll pay you back, I promise.", "Did you pay him?", "You paid me back."],
                            correctAnswer: 0,
                            explanation: "Le locuteur s’engage à rendre l’argent.",
                        },
                        {
                            id: 7,
                            question: "Une amie oublie d’éteindre la lumière. Tu t’en charges tout de suite. « Don’t worry, I ___ do it. »",
                            options: ["’ll", "did", "have"],
                            correctAnswer: 0,
                            explanation: "Will contracté en ’ll convient à une prise en charge immédiate.",
                        },
                        {
                            id: 8,
                            question: "Quel indice convient à « It’s going to rain » ?",
                            options: ["The clouds are getting very dark.", "It rained last winter.", "I have a new umbrella at home."],
                            correctAnswer: 0,
                            explanation: "Des nuages qui s’assombrissent motivent cette prévision.",
                        },
                        {
                            id: 9,
                            question: "Tu commandes au café. Quelle réplique est naturelle ?",
                            options: ["I’ll have a coffee, please.", "I having a coffee, please.", "I am have a coffee, please."],
                            correctAnswer: 0,
                            explanation: "I’ll have … est courant pour commander.",
                        },
                        {
                            id: 10,
                            question: "Que veut dire « I promise I won’t be late » ?",
                            options: ["Je m’engage à être à l’heure.", "Je crains d’être déjà en retard.", "Je demande l’heure."],
                            correctAnswer: 0,
                            explanation: "Won’t est la forme négative de will dans la promesse.",
                        },
                    ]}
                />
            )
        }
    ]
};