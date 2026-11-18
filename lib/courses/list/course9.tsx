import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course9: LessonContent = {
  courseNumber: 9,
  title: "Quantité (Some / Any)",
  description: "Définir l'indéfini : Du, De la, Des.",
  icon: "⚖️",
  difficulty: "Difficile",
  objective: "Choisir some ou any dans une offre, une question ou une phrase négative.",
  sections: [
    {
      title: "Faire les courses",
      content: (
        <LessonExamples
          examples={[
            { english: "I bought apples.", meaning: "J’ai acheté des pommes." },
            { english: "I bought some apples for the pie.", meaning: "J’ai acheté des pommes pour la tarte." },
            { english: "I like apples.", meaning: "J’aime les pommes en général." },
          ]}
        >
          En anglais, un pluriel peut s’employer seul pour parler d’une quantité indéfinie. Some attire l’attention sur une certaine quantité, sans la chiffrer.
        </LessonExamples>
      )
    },
    {
      title: "Some et any dans la conversation",
      content: (
        <LessonExamples
          examples={[
            { english: "We’ve got some apples.", meaning: "Il nous reste des pommes." },
            { english: "Have we got any apples?", meaning: "On vérifie s’il en reste." },
            { english: "We haven’t got any apples.", meaning: "Il ne nous en reste aucune." },
          ]}
          note={"En phrase affirmative, any peut aussi signifier « n’importe quel », comme dans Pick any apple."}
        >
          Some est fréquent quand on affirme qu’il y a une quantité. Any est courant dans une question ouverte sur la quantité ou après une négation.
        </LessonExamples>
      )
    },
    {
      title: "Proposer ou demander quelque chose",
      content: (
        <LessonExamples
          examples={[
            { english: "Would you like some tea?", meaning: "Tu proposes du thé." },
            { english: "Could I have some water, please?", meaning: "Tu demandes un peu d’eau." },
          ]}
        >
          Quand tu offres quelque chose ou demandes une portion, some est naturel, même dans une question.
        </LessonExamples>
      )
    },
    {
      title: "Parler d’une grande quantité",
      content: (
        <LessonExamples
          examples={[
            { english: "Do you have many friends here?", meaning: "Friends se compte." },
            { english: "We don’t have much time.", meaning: "Time désigne ici une durée." },
            { english: "We have a lot of work and a lot of ideas.", meaning: "On peut exprimer les deux quantités avec a lot of." },
          ]}
        >
          Many accompagne les noms dénombrables au pluriel. Much accompagne les indénombrables. A lot of s’emploie avec les deux dans la conversation.
        </LessonExamples>
      )
    },
    {
      title: "Advice, information et luggage",
      content: (
        <LessonExamples
          examples={[
            { english: "Can I give you some advice?", meaning: "Je peux te donner un conseil ?" },
            { english: "I need a piece of information.", meaning: "J’ai besoin d’un renseignement." },
            { english: "Our luggage is here.", meaning: "Nos bagages sont là." },
          ]}
        >
          Dans leur sens courant, ces noms s’emploient comme indénombrables. Si tu veux préciser une unité, ajoute une expression comme a piece of ou parle d’un objet précis.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Exprimer une quantité",
      content: (
        <Quiz
          title="Quantities Master"
          questions={[
            {
              id: 1,
              question: "I don't have ___ money.",
              options: ["some", "any", "many", "no"],
              correctAnswer: 1,
              explanation: "Phrase Négative (-) ➔ ANY.",
            },
            {
              id: 2,
              question: "Tu poses une question neutre pour savoir si quelqu’un a des frères. Do you have ___ brothers?",
              options: ["a", "any", "an", "much"],
              correctAnswer: 1,
              explanation: "Any convient à une question neutre avec un nom pluriel.",
            },
            {
              id: 3,
              question: "Wait! I have ___ good news.",
              options: ["any", "some", "many", "a"],
              correctAnswer: 1,
              explanation: "Phrase Affirmative (+) ➔ SOME.",
            },
            {
              id: 4,
              question: "Tu demandes poliment un peu d’eau. Could I have ___ water, please?",
              options: ["a", "some", "many", "an"],
              correctAnswer: 1,
              explanation: "Pour demander une quantité d’eau, some water est naturel.",
            },
            {
              id: 5,
              question: "I don't have ___ time to do this.",
              options: ["many", "much", "some", "a"],
              correctAnswer: 1,
              explanation: "Négatif + Indénombrable (Time) ➔ MUCH.",
            },
            {
              id: 6,
              question: "Tu veux dire « beaucoup d’amis ». Do you have ___ friends at work?",
              options: ["much", "many", "a lot", "a"],
              correctAnswer: 1,
              explanation: "Friends se compte. Many signifie « beaucoup de ». A lot demanderait of.",
            },
            {
              id: 7,
              question: "Would you like ___ coffee?",
              options: ["any", "some", "much", "many"],
              correctAnswer: 1,
              explanation: "Exception de Politesse (Offre) ➔ SOME.",
            },
            {
              id: 8,
              question: "He doesn't have ___ idea what to do.",
              options: ["some", "any", "no", "much"],
              correctAnswer: 1,
              explanation: "Négatif (-) ➔ ANY.",
            },
            {
              id: 9,
              question: "There are ___ people in the street.",
              options: ["much", "a lot of", "any", "little"],
              correctAnswer: 1,
              explanation: "Affirmative (+) + Pluriel. 'A lot of' est le meilleur choix naturel.",
            },
            {
              id: 10,
              question: "I refused without ___ difficulty.",
              options: ["some", "any", "no", "many"],
              correctAnswer: 1,
              explanation: "Without implique une négation ➔ ANY (difficulty est indénombrable : pas de many).",
            },
          ]}
        />
      )
    }
  ],
};