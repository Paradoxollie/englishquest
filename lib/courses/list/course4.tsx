import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course4: LessonContent = {
  courseNumber: 4,
  title: "Le Duel du Présent (I do vs I am doing)",
  objective: "Ne plus confondre habitudes et actions en cours.",
  sections: [
    {
      title: "Deux façons de parler de Londres",
      content: (
        <LessonExamples
          examples={[
            { english: "I live in London.", meaning: "Sam présente son lieu de vie habituel." },
            { english: "I’m living in London for a month.", meaning: "Maya présente un séjour temporaire." },
          ]}
        >
          Sam habite Londres. Maya y séjourne le temps d’une mission. Le choix du présent dit comment chacun voit sa situation.
        </LessonExamples>
      )
    },
    {
      title: "Choisir selon le sens",
      content: (
        <LessonExamples
          examples={[
            { english: "We take the train every morning.", meaning: "C’est notre trajet habituel." },
            { english: "We’re taking the bus this week.", meaning: "Le trajet change provisoirement." },
          ]}
        >
          Pour un fait, une habitude ou une opinion, le présent simple est souvent le bon choix. Pour une activité en train de se dérouler ou limitée à une période autour du présent, pense à be + -ing.
        </LessonExamples>
      )
    },
    {
      title: "Une situation temporaire",
      content: (
        <LessonExamples
          examples={[
            { english: "Sam works in a café.", meaning: "C’est son emploi habituel." },
            { english: "Sam is working at a festival this weekend.", meaning: "Ce travail concerne cette période précise." },
          ]}
        >
          Le même verbe peut décrire une habitude ou une activité temporaire. Se représenter la période aide à choisir.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Choisir le présent qui convient",
      content: (
        <Quiz
          title="Mission : Maîtriser les Nuances"
          questions={[
            {
              id: 1,
              question: "Attention ! I ___ (understand) this lesson now.",
              options: ["understand", "am understanding", "understanding", "understands"],
              correctAnswer: 0,
              explanation: "Piège ! 'Understand' est un verbe d'état (Cerveau). Même avec 'now', on ne met JAMAIS de ING.",
            },
            {
              id: 2,
              question: "I usually drive to work, but this week I ___ (take) the bus.",
              options: ["take", "am taking", "takes", "taking"],
              correctAnswer: 1,
              explanation: "C'est une situation TEMPORAIRE (juste cette semaine) contrairement à l'habitude. ➔ Continuous (Nuage).",
            },
            {
              id: 3,
              question: "She ___ (live) in New York. It's her home.",
              options: ["is living", "live", "lives", "living"],
              correctAnswer: 2,
              explanation: "C'est son domicile fixe (Permanent / Racines). ➔ Simple.",
            },
            {
              id: 4,
              question: "Look! The bus ___ (come)!",
              options: ["comes", "coming", "is coming", "come"],
              correctAnswer: 2,
              explanation: "'Look!' indique une action visible EN COURS. ➔ Continuous.",
            },
            {
              id: 5,
              question: "I ___ (think) you are right.",
              options: ["am thinking", "think", "thinks", "thinking"],
              correctAnswer: 1,
              explanation: "Ici 'think' = avoir une opinion (État). Si c'était 'réfléchir' (action), on pourrait dire 'I am thinking'.",
            },
            {
              id: 6,
              question: "Il loge provisoirement à l’hôtel pendant les travaux. This week he ___ at the Hilton.",
              options: ["stays", "is staying", "stay", "staying"],
              correctAnswer: 1,
              explanation: "Situation temporaire (juste 2 nuits). ➔ Continuous.",
            },
            {
              id: 7,
              question: "Water ___ (boil) at 100°C.",
              options: ["is boiling", "boils", "boil", "boiling"],
              correctAnswer: 1,
              explanation: "Vérité scientifique générale (Toujours vrai). ➔ Simple.",
            },
            {
              id: 8,
              question: "Quelqu’un te fixe en ce moment. Why ___ you ___ at me like that?",
              options: ["do / look", "are / looking", "is / looking", "do / looking"],
              correctAnswer: 1,
              explanation: "Action en cours : tu es en train de me regarder maintenant.",
            },
            {
              id: 9,
              question: "She ___ (love) chocolate.",
              options: ["is loving", "loves", "love", "loving"],
              correctAnswer: 1,
              explanation: "Sentiment/Goût = Verbe d'état. Jamais de ING (sauf chez McDonald's !).",
            },
            {
              id: 10,
              question: "Listen! Somebody ___ (sing).",
              options: ["sings", "is singing", "sing", "singing"],
              correctAnswer: 1,
              explanation: "Action sonore en train de se dérouler. ➔ Continuous.",
            },
          ]}
        />
      ),
    },
  ],
};