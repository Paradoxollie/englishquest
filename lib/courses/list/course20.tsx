import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course20: LessonContent = {
  courseNumber: 20,
  title: "Lier ses idées (Logical Connectors)",
  objective: "Raconter ce qui s’est passé en reliant la cause, le résultat et un contraste.",
  sections: [
    {
      title: "Donner une raison avec because",
      content: (
        <LessonExamples
          examples={[
            { english: "Maya walked home because she missed the bus.", meaning: "Elle est rentrée à pied parce qu’elle a raté le bus." },
            { english: "She was late because of the traffic.", meaning: "Après because of, on trouve ici le nom traffic." },
          ]}
        >
          Maya rentre à pied après une sortie. Because introduit une proposition qui explique la cause, avec un sujet et un verbe.
        </LessonExamples>
      )
    },
    {
      title: "Enchaîner avec so",
      content: (
        <LessonExamples
          examples={[
            { english: "Maya missed the bus, so she walked home.", meaning: "Le trajet à pied est le résultat." },
            { english: "I was hungry, so I made a sandwich.", meaning: "La faim explique la préparation du sandwich." },
          ]}
        >
          Avec so, donne la cause en premier. La suite raconte ce qui en découle.
        </LessonExamples>
      )
    },
    {
      title: "Introduire une surprise avec although",
      content: (
        <LessonExamples
          examples={[
            { english: "Although it was raining, Maya walked home.", meaning: "Malgré la pluie, elle est rentrée à pied." },
            { english: "Maya walked home although it was raining.", meaning: "On peut commencer par le choix de Maya." },
          ]}
          note={"Despite peut introduire un nom, comme dans Despite the rain, Maya walked home."}
        >
          Although introduit une information qui rend la suite inattendue. La proposition avec although peut venir au début ou à la fin.
        </LessonExamples>
      )
    },
    {
      title: "Poser une condition",
      content: (
        <LessonExamples
          examples={[
            { english: "You can join us if you have a ticket.", meaning: "L’entrée dépend du billet." },
            { english: "We’ll walk unless it rains.", meaning: "On ira à pied sauf s’il pleut." },
            { english: "You can play as long as you follow the rules.", meaning: "L’autorisation dépend du respect des règles." },
          ]}
        >
          If introduit une condition. Unless exprime « sauf si ». As long as permet de poser une condition que l’on doit respecter.
        </LessonExamples>
      )
    },
    {
      title: "Prendre une précaution",
      content: (
        <LessonExamples
          examples={[
            { english: "Take a jacket in case it gets cold.", meaning: "Tu prends déjà la veste." },
            { english: "Put on your jacket if it gets cold.", meaning: "Tu l’enfileras si la température baisse." },
          ]}
        >
          In case exprime la raison de se préparer à quelque chose qui pourrait arriver.
        </LessonExamples>
      )
    },
    {
      title: "Dire « pendant que »",
      content: (
        <LessonExamples
          examples={[
            { english: "Dad was cooking while I was doing my homework.", meaning: "Les deux activités se recouvraient." },
          ]}
        >
          While ou as relient deux activités qui ont lieu en même temps.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Relier deux idées",
      content: (
        <Quiz
          questions={[
            {
              id: 1,
              question: "Tu prends le parapluie maintenant, au cas où il pleuvrait. Take an umbrella ___ it rains.",
              options: ["if", "in case"],
              correctAnswer: 1,
              explanation: "C'est une précaution (on le prend AVANT la pluie). Donc IN CASE.",
            },
            {
              id: 2,
              question: "___ it was raining, we played.",
              options: ["Despite", "Although", "Because of"],
              correctAnswer: 1,
              explanation: "'It was raining' est une phrase (S+V). Donc ALTHOUGH.",
            },
            {
              id: 3,
              question: "You can't come in ___ you have a ticket.",
              options: ["unless", "if"],
              correctAnswer: 0,
              explanation: "Sauf si tu as un ticket. UNLESS contient l'idée de 'Except if'.",
            },
            {
              id: 4,
              question: "We stayed home ___ the rain.",
              options: ["because", "because of", "as"],
              correctAnswer: 1,
              explanation: "'The rain' est un nom. Donc BECAUSE OF.",
            },
            {
              id: 5,
              question: "Tu n’as pas mangé depuis ce matin. I was hungry, ___ I made a sandwich.",
              options: ["because", "although", "so"],
              correctAnswer: 2,
              explanation: "So introduit la conséquence de la faim.",
            },
            {
              id: 6,
              question: "___ being tired, I ran.",
              options: ["Although", "Despite", "In spite"],
              correctAnswer: 1,
              explanation: "Verbe en -ING. Donc DESPITE (ou In spite OF).",
            },
            {
              id: 7,
              question: "Explique pourquoi Maya est rentrée à pied. She walked home ___ she missed the last bus.",
              options: ["so", "because", "because of"],
              correctAnswer: 1,
              explanation: "Because est suivi du sujet she et du verbe missed.",
            },
            {
              id: 8,
              question: "La journée était froide, pourtant la baignade a eu lieu. ___ it was cold, we went swimming.",
              options: ["Because of", "Although", "So"],
              correctAnswer: 1,
              explanation: "Although introduit la difficulté qui rend la baignade surprenante.",
            },
            {
              id: 9,
              question: "Les deux activités avaient lieu en même temps. I was reading ___ Maya was cooking.",
              options: ["while", "so", "because of"],
              correctAnswer: 0,
              explanation: "While situe les deux activités dans la même période.",
            },
            {
              id: 10,
              question: "You can drive my car ___ you are careful.",
              options: ["unless", "as long as"],
              correctAnswer: 1,
              explanation: "Condition positive : 'Tant que' (As long as).",
            },
          ]}
        />
      )
    }
  ]
};
