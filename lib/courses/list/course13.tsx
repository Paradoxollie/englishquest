import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course13: LessonContent = {
  courseNumber: 13,
  title: "Used to / Didn't use to",
  description: "Le monde d'avant.",
  icon: "🎞️",
  difficulty: "Intermédiaire",
  objective: "Parler d'habitudes passées qui n'existent plus aujourd'hui (Rupture).",
  sections: [
    {
      title: "Une ancienne habitude",
      content: (
        <LessonExamples
          examples={[
            { english: "I used to play tennis. Now I go swimming.", meaning: "L’activité habituelle a changé." },
            { english: "We used to live near the station.", meaning: "Tu évoques une ancienne adresse." },
            { english: "I went to Brighton last Saturday.", meaning: "Tu racontes une sortie particulière." },
          ]}
        >
          Used to permet de raconter une habitude ou un état d’autrefois. Le contexte suggère généralement que la situation a changé. Pour une seule sortie datée, le prétérit simple suffit.
        </LessonExamples>
      )
    },
    {
      title: "Construire et prononcer used to",
      content: (
        <LessonExamples
          examples={[
            { english: "I used to play the piano.", meaning: "Autrefois, je jouais du piano. À débit naturel, used to se rapproche de /ˈjuːstə/." },
            { english: "Did you use to play? I didn’t use to sing.", meaning: "Did porte la marque du passé." },
          ]}
        >
          À l’affirmatif, écris used to suivi de la base verbale. Dans les questions et les négations avec did, utilise use to. Dans la parole courante, le to de used to est souvent réduit à /tə/.
        </LessonExamples>
      )
    },
    {
      title: "Habitude passée ou familiarité ?",
      content: (
        <LessonExamples
          examples={[
            { english: "I used to drive to work.", meaning: "Avant, je prenais la voiture pour aller travailler." },
            { english: "I’m used to driving at night.", meaning: "J’ai l’habitude de conduire la nuit." },
            { english: "I drove to York last Tuesday.", meaning: "Il s’agit ici d’un trajet particulier." },
          ]}
        >
          Used to + verbe évoque une ancienne habitude ou situation. Be used to + nom ou forme en -ing dit à quoi on est habitué.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Parler d’une ancienne habitude",
      content: (
        <Quiz
          title="Le Juge du Passé"
          questions={[
            {
              id: 1,
              question: "I ___ smoke, but I stopped last year.",
              options: ["used to", "use to", "usually", "was smoking"],
              correctAnswer: 0,
              explanation: "Habitude passée terminée. La structure affirmative prend un 'D'.",
            },
            {
              id: 2,
              question: "___ you ___ have long hair?",
              options: ["Did / used to", "Did / use to", "Do / use to", "Were / used to"],
              correctAnswer: 1,
              explanation: "Question au passé avec USED TO : L'auxiliaire DID mange le 'D'. ➔ Did you USE to...",
            },
            {
              id: 3,
              question: "Before the internet, people ___ (write) letters.",
              options: ["were writing", "used to write", "are writing", "use to write"],
              correctAnswer: 1,
              explanation: "Habitude d'une époque révolue. 'Were writing' décrirait un moment précis, pas une généralité sur l'époque.",
            },
            {
              id: 4,
              question: "I ___ like broccoli, but now I love it.",
              options: ["didn't used to", "didn't use to", "not used to", "don't use to"],
              correctAnswer: 1,
              explanation: "Négation : DIDN'T USE TO (sans D).",
            },
            {
              id: 5,
              question: "Elle ne se lève généralement pas tôt aujourd’hui. She ___ usually wake up early.",
              options: ["doesn’t", "isn’t", "hasn’t", "don’t"],
              correctAnswer: 0,
              explanation: "Au présent simple, she prend doesn’t devant la base wake.",
            },
            {
              id: 6,
              question: "I ___ live in London, but now I live in Paris.",
              options: ["used to", "was living", "am used to", "use to"],
              correctAnswer: 0,
              explanation: "Situation passée qui n'existe plus (but now...) : 'Used to' est le bon choix pour dire 'J'habitais là-bas avant'.",
            },
            {
              id: 7,
              question: "Choisis l’affirmation qui décrit une ancienne habitude. « Avant, je marchais beaucoup. »",
              options: ["I used to walk a lot.", "I use to walked a lot.", "I am used to walk a lot."],
              correctAnswer: 0,
              explanation: "Used to est suivi de la base walk.",
            },
            {
              id: 8,
              question: "Je n'ai pas l'habitude de conduire (C'est nouveau pour moi).",
              options: ["I didn't use to drive", "I am not used to driving", "I don't use to drive", "I not usually drive"],
              correctAnswer: 1,
              explanation: "C'est le piège 'BE USED TO'. Ici on parle de familiarité/difficulté, pas d'une habitude passée.",
            },
            {
              id: 9,
              question: "Where ___ you ___ go to school?",
              options: ["did / use to", "did / used to", "were / going", "are / using"],
              correctAnswer: 0,
              explanation: "Question standard avec Used to : DID ... USE TO.",
            },
            {
              id: 10,
              question: "I went to Disney World once. I ___ (love) it.",
              options: ["used to love", "loved", "was loving", "did use to love"],
              correctAnswer: 1,
              explanation: "Une seule fois (Once) ? Alors 'Used to' est interdit. On utilise le Past Simple : I loved it.",
            },
          ]}
        />
      )
    }
  ]
};
