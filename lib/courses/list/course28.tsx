import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course28: LessonContent = {
    courseNumber: 28,
    title: "Expertise : Futur & Prédictions",
    objective: "Faire une prédiction compréhensible et dire sur quel indice ou quelle opinion elle repose.",
    sections: [
        {
            title: "À l’arrêt de bus",
            content: (
              <LessonExamples
                examples={[
                  { english: "We’re going to miss the bus.", meaning: "Son pronostic s’appuie sur les portes qui se ferment." },
                  { english: "I think we’ll miss the bus.", meaning: "Elle donne son avis sur l’issue de la scène." },
                ]}
              >
                Il reste deux minutes avant le départ. Le bus ferme déjà ses portes. Comment Maya interprète-t-elle ce qu’elle voit ?
              </LessonExamples>
            )
        },
        {
            title: "Pendant le match",
            content: (
              <LessonExamples
                examples={[
                  { english: "Look how well they’re playing. They’re going to win.", meaning: "Tu montres un élément qui te frappe maintenant." },
                  { english: "I think they’ll win. They’re usually strong in the second half.", meaning: "Tu donnes une opinion sur la suite." },
                ]}
              >
                Le score est serré. Deux personnes peuvent anticiper la même victoire tout en présentant des raisons différentes.
              </LessonExamples>
            )
        },
        {
            title: "Expliquer ton pronostic",
            content: (
              <LessonExamples
                examples={[
                  { english: "The glass is slipping. It’s going to break!", meaning: "Tu avertis la personne qui le tient." },
                  { english: "I think it’ll be a long journey. It’s Friday evening.", meaning: "Tu partages une prévision avec un ami." },
                ]}
              >
                Une courte justification donne du sens à will comme à going to. Pense à la personne à qui tu t’adresses.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Faire une prévision",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Des œufs et de la farine sont sur la table. Quelle intention les explique ?",
                            options: ["I’m going to bake a cake.", "I baked a cake last week.", "I never bake at home."],
                            correctAnswer: 0,
                            explanation: "La première phrase présente un projet possible pour ces ingrédients.",
                        },
                        {
                            id: 2,
                            question: "Au moment où tu découvres qu’il manque du sucre, tu proposes d’en acheter. Choisis la réplique.",
                            options: ["I’ll get some.", "I got some last year.", "Do you usually buy it?"],
                            correctAnswer: 0,
                            explanation: "I’ll get some offre une solution immédiate.",
                        },
                        {
                            id: 3,
                            question: "Quelle phrase prédit un événement ?",
                            options: ["It’s snowing now.", "It snowed yesterday.", "It’s going to snow tonight."],
                            correctAnswer: 2,
                            explanation: "Tonight situe ici la prévision dans l’avenir.",
                        },
                        {
                            id: 4,
                            question: "Que fait « I believe robots will change our lives » ?",
                            options: ["La personne exprime une opinion sur l’avenir.", "La personne confirme un rendez-vous.", "La personne décrit un fait achevé."],
                            correctAnswer: 0,
                            explanation: "I believe donne le point de vue de la personne sur une évolution future.",
                        },
                        {
                            id: 5,
                            question: "Ton amie annonce son intention de voir quelqu’un. « I ___ meet Maya tonight. » Choisis la forme de going to.",
                            options: ["am going to", "is going to", "going to"],
                            correctAnswer: 0,
                            explanation: "Avec I, going to est précédé de am.",
                        },
                        {
                            id: 6,
                            question: "Quel indice justifie « That child is going to fall » ?",
                            options: ["His shoelace is caught and he’s losing his balance.", "He fell once last year.", "He likes playing outside."],
                            correctAnswer: 0,
                            explanation: "L’enfant perd l’équilibre maintenant.",
                        },
                        {
                            id: 7,
                            question: "Tu veux rassurer un ami en t’engageant à garder son secret. Quelle réplique choisir ?",
                            options: ["I promise I won’t tell anyone.", "Who told you that?", "I tell him everything."],
                            correctAnswer: 0,
                            explanation: "La première réplique est une promesse.",
                        },
                        {
                            id: 8,
                            question: "Le four est resté allumé. Que propose une personne qui dit « I’ll turn it off now » ?",
                            options: ["L’éteindre maintenant.", "Le faire réparer demain.", "Vérifier s’il est froid."],
                            correctAnswer: 0,
                            explanation: "Will accompagne ici une offre immédiate.",
                        },
                        {
                            id: 9,
                            question: "Quelle phrase donne une raison observable à la prédiction ?",
                            options: ["She’s going to faint. She’s gone very pale.", "She fainted last year.", "Did she feel better?"],
                            correctAnswer: 0,
                            explanation: "Le teint très pâle est l’indice sur lequel s’appuie la prédiction.",
                        },
                        {
                            id: 10,
                            question: "Tu souhaites partager une prévision personnelle. Quelle formulation choisir ?",
                            options: ["I think the journey will take an hour.", "The journey took an hour yesterday.", "How long was the journey?"],
                            correctAnswer: 0,
                            explanation: "I think avec will situe la prévision dans l’avenir.",
                        },
                    ]}
                />
            )
        }
    ]
};