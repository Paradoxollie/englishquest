import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course12: LessonContent = {
  courseNumber: 12,
  title: "Une action en cours dans le passé (Past Continuous)",
  description: "Le décor de votre film.",
  icon: "🎥",
  difficulty: "Intermédiaire",
  objective: "Raconter ce qui était en cours au moment d’un autre événement.",
  sections: [
    {
      title: "Planter le décor d’une histoire",
      content: (
        <LessonExamples
          examples={[
            { english: "I was sleeping when you called.", meaning: "Ton appel arrive pendant mon sommeil." },
            { english: "When I was little, I lived in Lyon.", meaning: "J’habitais à Lyon étant petite. Il s’agit de mon lieu de vie à cette époque." },
          ]}
        >
          Le prétérit continu associe was ou were au verbe en -ing. Il permet de se placer à l’intérieur d’une activité passée. L’imparfait français a aussi d’autres traductions.
        </LessonExamples>
      )
    },
    {
      title: "Deux actions au même moment",
      content: (
        <LessonExamples
          examples={[
            { english: "At eight I was cooking and my sister was reading.", meaning: "La même image montre les deux activités en cours." },
            { english: "I cooked dinner, then my sister read to us.", meaning: "Ce récit présente les événements l’un après l’autre." },
          ]}
        >
          Imagine ce que montrerait la caméra à huit heures. Elle peut montrer deux activités déjà en cours.
        </LessonExamples>
      )
    },
    {
      title: "When et while",
      content: (
        <LessonExamples
          examples={[
            { english: "When I arrived, they were talking.", meaning: "La conversation était en cours à mon arrivée." },
            { english: "While I lived in York, I walked to work.", meaning: "While peut aussi porter sur une période entière." },
          ]}
        >
          When situe un moment. While souligne que deux situations se recouvrent. C’est le sens du récit qui guide le choix du temps.
        </LessonExamples>
      )
    },
    {
      title: "Avant ou après l’arrivée ?",
      content: (
        <LessonExamples
          examples={[
            { english: "When Karen arrived, we were having dinner.", meaning: "Le repas avait déjà commencé quand Karen est entrée." },
            { english: "When Karen arrived, we had dinner.", meaning: "Dans ce récit, le repas a suivi son arrivée." },
          ]}
        >
          Deux phrases presque identiques peuvent raconter deux scènes différentes. Imagine ce que la personne voit en ouvrant la porte.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Planter le décor au passé",
      content: (
        <Quiz
          title="Director's Cut Quiz"
          questions={[
            {
              id: 1,
              question: "À ton arrivée, j’étais déjà endormi. When you arrived, I ___ (sleep).",
              options: ["slept", "was sleeping", "am sleeping", "sleeped"],
              correctAnswer: 1,
              explanation: "C'était le 'Décor' (action longue en cours) quand tu es arrivé : tu as interrompu mon sommeil. ➔ WAS SLEEPING.",
            },
            {
              id: 2,
              question: "Décris deux activités déjà en cours à huit heures hier. While I ___ (cook), my sister ___ (read).",
              options: ["cooked / read", "was cooking / was reading", "cooked / was reading", "was cooking / read"],
              correctAnswer: 1,
              explanation: "Deux actions longues PARALLÈLES. Personne ne coupe personne. 'While' déclenche le Continuous. ➔ WAS COOKING / WAS READING.",
            },
            {
              id: 3,
              question: "Le chat attendait devant la porte. J’ai ouvert, puis il a filé dehors. When I opened the door, the cat ___ out.",
              options: ["was running", "ran", "runned", "running"],
              correctAnswer: 1,
              explanation: "Suite d'actions rapides (Chronologie). J'ouvre ➔ Il sort. Pas de décor ici. ➔ RAN (Past Simple).",
            },
            {
              id: 4,
              question: "When I was young, I ___ (love) candy.",
              options: ["was loving", "loved", "loving", "love"],
              correctAnswer: 1,
              explanation: "Piège ! LOVE est un verbe d'état (Sentiment). Jamais de ING, même si ça a duré toute l'enfance. ➔ LOVED.",
            },
            {
              id: 5,
              question: "La pluie avait déjà commencé. It ___ when I left home.",
              options: ["rained", "was raining", "raining", "is raining"],
              correctAnswer: 1,
              explanation: "Le décor (il pleuvait) était déjà installé au moment de l'action de partir. ➔ WAS RAINING.",
            },
            {
              id: 6,
              question: "My phone rang while I ___ (take) a shower.",
              options: ["took", "was taking", "taking", "am taking"],
              correctAnswer: 1,
              explanation: "WHILE introduit l'action longue (Le Décor). L'éclair (rang) coupe la douche. ➔ WAS TAKING.",
            },
            {
              id: 7,
              question: "When Karen arrived, we ___ (have) dinner. (So we asked her to join us).",
              options: ["had", "were having", "have", "are having"],
              correctAnswer: 1,
              explanation: "On était DÉJÀ en train de manger (Milieu de l'action). ➔ WERE HAVING.",
            },
            {
              id: 8,
              question: "When Karen arrived, we ___ (have) dinner. (We waited for her to start).",
              options: ["had", "were having", "have", "are having"],
              correctAnswer: 0,
              explanation: "On a mangé APRÈS son arrivée (Chronologie). ➔ HAD.",
            },
            {
              id: 9,
              question: "I ___ (walk) down the street when I ___ (fall).",
              options: ["walked / fell", "was walking / fell", "was walking / fallen", "walked / was falling"],
              correctAnswer: 1,
              explanation: "Classique Décor (Marche) coupé par Accident (Chute). ➔ WAS WALKING / FELL.",
            },
            {
              id: 10,
              question: "Décris ce qu’ils étaient en train de faire à dix heures. They ___ to the teacher at that moment.",
              options: ["didn't listen", "weren't listening", "wasn't listening", "not listening"],
              correctAnswer: 1,
              explanation: "Action de 'ne pas écouter' en cours. THEY WERE NOT listening.",
            },
          ]}
        />
      )
    }
  ]
};