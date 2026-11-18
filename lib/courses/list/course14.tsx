import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course14: LessonContent = {
  courseNumber: 14,
  title: "Intentions et prévisions (Be going to)",
  description: "L'intention et la preuve.",
  icon: "🔮",
  difficulty: "Indispensable",
  objective: "Exprimer ce qui va arriver (Plan ou Évidence).",
  sections: [
    {
      title: "Une intention et un indice",
      content: (
        <LessonExamples
          examples={[
            { english: "I’m going to visit my aunt.", meaning: "La visite est dans mes projets." },
            { english: "Look at that glass on the edge. It’s going to fall!", meaning: "La position du verre motive ta prédiction." },
          ]}
        >
          Be going to peut annoncer une intention déjà formée ou une prédiction que la situation suggère.
        </LessonExamples>
      )
    },
    {
      title: "Accorder be",
      content: (
        <LessonExamples
          examples={[
            { english: "Are you going to come with us?", meaning: "Tu comptes venir avec nous ?" },
            { english: "She isn’t going to go by car.", meaning: "Elle ne compte pas y aller en voiture. Going to go est courant." },
          ]}
        >
          Garde going to devant la base du verbe et accorde be avec le sujet. La question commence par be.
        </LessonExamples>
      )
    },
    {
      title: "Parler d’une prévision et d’un ancien projet",
      content: (
        <LessonExamples
          examples={[
            { english: "Look at those clouds. It’s going to rain.", meaning: "Tu attires l’attention sur les nuages." },
            { english: "Look at those clouds. I think it’ll rain.", meaning: "Tu donnes ton avis sur la suite." },
            { english: "I was going to call you, but I lost your number.", meaning: "Tu avais l’intention d’appeler." },
          ]}
        >
          Le locuteur choisit comment présenter sa prévision. Will est également possible lorsque tu exprimes ton avis, même si tu vois un indice.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Annoncer une intention",
      content: (
        <Quiz
          title="Le Prophète"
          questions={[
            {
              id: 1,
              question: "Complète avec la forme de be going to qui convient. Look at those clouds! It ___ rain.",
              options: ["are going to", "is going to", "going to", "am going to"],
              correctAnswer: 1,
              explanation: "Le sujet it prend is. La prédiction s’appuie sur les nuages.",
            },
            {
              id: 2,
              question: "Exprime ce projet avec be going to. I ___ buy a house next year.",
              options: ["will", "am going to", "am going", "go to"],
              correctAnswer: 1,
              explanation: "Intention/Projet déjà réfléchi. 'Will' serait une décision impulsive.",
            },
            {
              id: 3,
              question: "Quel indice justifie le mieux « You’re going to fall » ?",
              options: ["The ladder is shaking.", "You own a ladder.", "You bought it last month."],
              correctAnswer: 0,
              explanation: "Le mouvement actuel de l’échelle permet d’anticiper la chute.",
            },
            {
              id: 4,
              question: "Tu viens d’entendre que la porte est ouverte et tu proposes sur-le-champ de la fermer. Choisis l’offre avec will.",
              options: ["am going to", "close", "will", "closing"],
              correctAnswer: 2,
              explanation: "Décision instantanée (Je réagis maintenant). Je ne l'avais pas prévu avant le moment de parler. ➔ WILL.",
            },
            {
              id: 5,
              question: "I ___ call you, but I lost your number.",
              options: ["am going to", "was going to", "will", "went to"],
              correctAnswer: 1,
              explanation: "Intention passée non réalisée (Plan abandonné). ➔ WAS GOING TO.",
            },
            {
              id: 6,
              question: "Complète avec la forme de be going to pour we. We ___ visit Paris next summer.",
              options: ["are going to", "will", "go to", "going to"],
              correctAnswer: 0,
              explanation: "Projet de vacances (Intention).",
            },
            {
              id: 7,
              question: "Dans un message soigné, demande le projet de ton ami avec be going to. What ___ you ___ do with that money?",
              options: ["are / going to", "is / going to", "do / going to", "are / go to"],
              correctAnswer: 0,
              explanation: "Avec you, on utilise are. Going to précède la base do.",
            },
            {
              id: 8,
              question: "Ton ami devient soudain très pâle. Quelle phrase attire son attention sur cet indice ?",
              options: ["You look pale. Are you going to be sick?", "Were you ill last winter?", "Are you usually ill on boats?"],
              correctAnswer: 0,
              explanation: "L’indice présent suggère que quelque chose va se produire.",
            },
            {
              id: 9,
              question: "Utilise le présent continu pour un rendez-vous déjà fixé. I ___ my doctor at six.",
              options: ["am seeing", "will see", "seeing", "see"],
              correctAnswer: 0,
              explanation: "C'est un rendez-vous confirmé : le Present Continuous (I am seeing) est le plus naturel. 'Seeing' seul ne suffit pas : il faut l'auxiliaire am.",
            },
            {
              id: 10,
              question: "Why ___ you ___ sell your car?",
              options: ["will / sell", "are / going to", "do / go to", "are / selling"],
              correctAnswer: 1,
              explanation: "On demande la raison d'un projet/intention.",
            },
          ]}
        />
      )
    }
  ]
};
