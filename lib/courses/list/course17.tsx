import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course17: LessonContent = {
  courseNumber: 17,
  title: "Conseil (Should / Ought to)",
  objective: "Formuler des conseils, des avertissements et des regrets avec should, ought to, had better et should have.",
  sections: [
    {
      title: "Un conseil à un ami",
      content: (
        <LessonExamples
          examples={[
            { english: "You should get some sleep.", meaning: "Tu suggères du repos." },
            { english: "What should I do?", meaning: "Tu demandes un avis." },
          ]}
        >
          Should suivi de la base verbale permet de recommander une action. Tu peux aussi poser une question pour demander conseil.
        </LessonExamples>
      )
    },
    {
      title: "Ought to",
      content: (
        <LessonExamples
          examples={[
            { english: "You should call her.", meaning: "Tu devrais l’appeler." },
            { english: "You ought to call her.", meaning: "La même recommandation est formulée avec ought to." },
          ]}
        >
          Ought to permet de conseiller. Il est proche de should et se construit avec to suivi de la base verbale.
        </LessonExamples>
      )
    },
    {
      title: "Pour aller plus loin (Un regret passé)",
      content: (
        <LessonExamples
          examples={[
            { english: "I should have left earlier. I missed the bus.", meaning: "J’aurais dû partir plus tôt. J’ai raté le bus." },
            { english: "You shouldn’t have said that.", meaning: "Tu n’aurais pas dû dire ça." },
          ]}
        >
          Pour dire après coup qu’un autre choix aurait été préférable, emploie should have suivi du participe passé.
        </LessonExamples>
      )
    },
    {
      title: "Had better et la conséquence",
      content: (
        <LessonExamples
          examples={[
            { english: "We’d better hurry or we’ll miss the bus.", meaning: "Deux amis risquent de rater le bus." },
            { english: "You’d better not touch that pan.", meaning: "La personne te prévient d’un danger." },
          ]}
        >
          Had better exprime un conseil appuyé par une conséquence possible. Le ton peut être amical, pressant ou menaçant selon la situation.
        </LessonExamples>
      )
    },
    {
      title: "Pour aller plus loin (it’s time)",
      content: (
        <LessonExamples
          examples={[
            { english: "It’s time to go home.", meaning: "C’est le moment de rentrer." },
            { english: "It’s time we went home.", meaning: "Il est grand temps que nous rentrions." },
          ]}
        >
          It’s time peut être suivi de to + verbe. Avec un sujet exprimé, le prétérit peut signifier qu’il est grand temps d’agir.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Donner un conseil",
      content: (
        <Quiz
          title="Le Conseiller Expert"
          questions={[
            {
              id: 1,
              question: "You ___ smoke here. It's forbidden.",
              options: ["shouldn't", "don't have to", "mustn't", "had better"],
              correctAnswer: 2,
              explanation: "Interdiction formelle (Forbidden). MUSTN'T. 'Shouldn't' est trop faible.",
            },
            {
              id: 2,
              question: "You missed the train! You ___ left earlier.",
              options: ["should", "should have", "must", "had to"],
              correctAnswer: 1,
              explanation: "Regret sur le passé. SHOULD HAVE + V3.",
            },
            {
              id: 3,
              question: "It's formal. You ___ to wear a tie.",
              options: ["should", "must", "ought", "better"],
              correctAnswer: 2,
              explanation: "Le seul modal de la liste suivi de 'TO' est OUGHT TO.",
            },
            {
              id: 4,
              question: "Donne un avertissement avec had better. You ___ be late, or you’ll miss the last bus.",
              options: ["shouldn't", "had better not", "don't have to", "mustn't to"],
              correctAnswer: 1,
              explanation: "Menace/Danger clair (or... fire you). HAD BETTER NOT.",
            },
            {
              id: 5,
              question: "Quel conseil pourrait suivre « I feel ill » ?",
              options: ["You should get some rest.", "You should resting.", "You ought get some rest."],
              correctAnswer: 0,
              explanation: "Should est suivi de la base verbale. Ought demanderait to.",
            },
            {
              id: 6,
              question: "Choisis la forme complète en anglais écrit. I ___ leave now or I’ll miss the train.",
              options: ["better to", "had better", "should to", "ought"],
              correctAnswer: 1,
              explanation: "Had better se construit avec une base verbale.",
            },
            {
              id: 7,
              question: "I didn't study and I failed. I ___ studied more.",
              options: ["should", "should have", "must have", "had better"],
              correctAnswer: 1,
              explanation: "Regret personnel passé. I SHOULD HAVE studied.",
            },
            {
              id: 8,
              question: "You ___ tell him the truth. He deserves to know.",
              options: ["ought", "ought to", "should to", "better"],
              correctAnswer: 1,
              explanation: "Conseil moral. OUGHT TO.",
            },
            {
              id: 9,
              question: "Le bus part dans une minute. Quel conseil le groupe se donne-t-il ?",
              options: ["We’d better hurry.", "We had better hurrying.", "We’d better to hurry."],
              correctAnswer: 0,
              explanation: "We’d better hurry est une recommandation pressante qui inclut la personne qui parle.",
            },
            {
              id: 10,
              question: "Where is the bank? You ___ ask a policeman.",
              options: ["should", "ought", "better", "should have"],
              correctAnswer: 0,
              explanation: "Suggestion simple sans danger ni regret. SHOULD est parfait.",
            },
          ]}
        />
      )
    }
  ]
};
