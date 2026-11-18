import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course23: LessonContent = {
    courseNumber: 23,
    title: "La Durée : FOR vs SINCE",
    objective: "Choisir for pour une durée et since pour un point de départ.",
    sections: [
        {
            title: "Une durée ou un point de départ ?",
            content: (
              <LessonExamples
                examples={[
                  { english: "We’ve been here for two hours.", meaning: "Imagine un segment long de deux heures." },
                  { english: "We’ve been here since nine o’clock.", meaning: "Neuf heures est le point de départ." },
                ]}
              >
                For mesure une longueur de temps. Since part d’un repère. Place les deux expressions sur une même ligne du temps.
              </LessonExamples>
            )
        },
        {
            title: "Traduire « depuis »",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ve been here for three days.", meaning: "Three days est une durée." },
                  { english: "I’ve been here since Monday.", meaning: "Monday en situe le début." },
                ]}
              >
                Repère si le complément donne la longueur de la période ou le moment où elle commence.
              </LessonExamples>
            )
        },
        {
            title: "For, since ou ago ?",
            content: (
              <LessonExamples
                examples={[
                  { english: "I lived there for two years, then I moved.", meaning: "Le séjour est terminé." },
                  { english: "I’ve lived here for two years.", meaning: "J’habite toujours ici." },
                  { english: "I moved here two years ago.", meaning: "Le déménagement est daté." },
                ]}
              >
                For mesure une durée dans le passé, le présent ou l’avenir. Since donne le départ d’une période. Ago situe un événement par rapport à maintenant.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Situer le début et la durée",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I have lived in London ___ ten years.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "Ten years = Une décennie = Une quantité de temps (Boîte) = FOR.",
                        },
                        {
                            id: 2,
                            question: "I have lived in London ___ 2010.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "2010 = Une date sur le calendrier (Punaise) = SINCE.",
                        },
                        {
                            id: 3,
                            question: "It has been raining ___ I got up.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "'I got up' (mon réveil) est un point précis dans le temps = SINCE.",
                        },
                        {
                            id: 4,
                            question: "He has been waiting ___ a long time.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "'A long time' est une durée mesurable (même si floue) = FOR.",
                        },
                        {
                            id: 5,
                            question: "I have been working here ___ April.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "April = Un mois du calendrier = SINCE.",
                        },
                        {
                            id: 6,
                            question: "Kelly has been married ___ three years.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "Three years = Quantité = FOR.",
                        },
                        {
                            id: 7,
                            question: "Kelly s’est mariée il y a trois ans. She got married ___.",
                            options: ["three years ago", "for three years"],
                            correctAnswer: 0,
                            explanation: "PAST SIMPLE (Got married) = Période révolue = AGO.",
                        },
                        {
                            id: 8,
                            question: "We haven't seen them ___ ages.",
                            options: ["since", "for"],
                            correctAnswer: 1,
                            explanation: "'Ages' (des lustres) est considéré comme une durée = FOR.",
                        },
                        {
                            id: 9,
                            question: "I haven't eaten ___ yesterday.",
                            options: ["since", "for"],
                            correctAnswer: 0,
                            explanation: "Yesterday = Point de départ = SINCE.",
                        },
                        {
                            id: 10,
                            question: "I arrived in France ___.",
                            options: ["since 2 months", "2 months ago"],
                            correctAnswer: 1,
                            explanation: "Arrived (Past Simple) = Action finie = AGO.",
                        },
                    ]}
                />
            )
        }
    ]
};