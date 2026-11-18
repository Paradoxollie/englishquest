import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course3: LessonContent = {
  courseNumber: 3,
  title: "La Routine et les Faits (Present Simple)",
  objective: "Parler de ses habitudes et des vérités générales.",
  sections: [
    {
      title: "Parler de sa journée",
      content: (
        <LessonExamples
          examples={[
            { english: "I walk to work.", meaning: "C’est mon trajet habituel." },
            { english: "The café opens at nine.", meaning: "C’est l’horaire du café." },
          ]}
        >
          Le présent simple décrit tes habitudes, des faits ou ce que tu penses. Un repère comme every Sunday aide à comprendre le rythme.
        </LessonExamples>
      ),
    },
    {
      title: "1. La Formule (Formation)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200 text-lg leading-relaxed text-balance">
            À l’affirmatif, utilise la base du verbe avec I, you, we et they. Avec he, she ou it, ajoute souvent -s. Le verbe be a ses propres formes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: "Affirmation (+)", formula: "I work", sub: "Simple et efficace", color: "emerald" },
              { type: "Négation (-)", formula: "I don't work", sub: "Besoin de l'assistant DO", color: "red" },
              { type: "Question (?)", formula: "Do I work?", sub: "L'assistant DO passe devant", color: "cyan" }
            ].map((item, idx) => (
              <div key={idx} className={`h-full bg-slate-800/60 border border-${item.color}-500/30 rounded-xl p-6 hover:border-${item.color}-500 transition-all duration-300 group shadow-lg flex flex-col items-center text-center`}>
                <div className={`text-${item.color}-400 text-xs font-bold uppercase tracking-widest mb-3 border-b border-${item.color}-500/30 pb-1 w-full`}>{item.type}</div>
                <div className="bg-slate-900/40 rounded-lg p-4 w-full flex-1 flex flex-col items-center justify-center gap-2">
                  <span className="text-white font-black text-xl md:text-2xl tracking-wide text-balance">{item.formula}</span>
                  <span className="text-slate-500 text-xs italic">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "He, she et it",
      content: (
        <LessonExamples
          examples={[
            { english: "She watches the game. He tries again.", meaning: "Watch prend -es. Try devient tries." },
            { english: "Does she watch the game? He can swim.", meaning: "Après does ou can, le verbe garde sa forme de base." },
          ]}
        >
          À la forme affirmative, la plupart des verbes prennent -s à la troisième personne du singulier. Après does ou un modal, on garde la base du verbe.
        </LessonExamples>
      ),
    },
    {
      title: "Dire à quelle fréquence",
      content: (
        <LessonExamples
          examples={[
            { english: "She usually walks to work.", meaning: "Usually se place ici devant le verbe principal." },
            { english: "She is often early.", meaning: "Avec be, l’adverbe suit souvent le verbe." },
            { english: "Sometimes I walk to work.", meaning: "Sometimes peut aussi ouvrir la phrase." },
          ]}
        >
          Always, usually, often, sometimes, rarely et never permettent d’exprimer une fréquence. Leur sens dépend des habitudes que tu décris.
        </LessonExamples>
      )
    },
    {
      title: "Quiz · Parler des habitudes",
      content: (
        <Quiz
          title="Mission : La Vérité"
          questions={[
            {
              id: 1,
              question: "She ___ (play) tennis every Sunday.",
              options: ["play", "plays", "is playing", "playing"],
              correctAnswer: 1,
              explanation: "Every Sunday = Habitude ➔ Present Simple. She = 3e personne ➔ Plays (avec S).",
            },
            {
              id: 2,
              question: "Water ___ at 100 degrees.",
              options: ["boil", "boils", "is boiling", "boiling"],
              correctAnswer: 1,
              explanation: "C'est une vérité scientifique générale. Water = It ➔ Boils.",
            },
            {
              id: 3,
              question: "I ___ usually wake up early.",
              options: ["don't", "doesn't", "not", "am not"],
              correctAnswer: 0,
              explanation: "Négation au present simple avec 'I' ➔ Don't.",
            },
            {
              id: 4,
              question: "Que fait 'He' avec le verbe 'Watch' ?",
              options: ["He watchs", "He watchies", "He watches", "He watch"],
              correctAnswer: 2,
              explanation: "Watch finit par CH (son chuintant) ➔ on ajoute ES pour la prononciation ➔ Watches.",
            },
            {
              id: 5,
              question: "___ you speak English?",
              options: ["Are", "Do", "Does", "Is"],
              correctAnswer: 1,
              explanation: "Pour poser une question au present simple (sauf BE), on utilise l'auxiliaire DO.",
            },
            {
              id: 6,
              question: "He ___ (try) very hard.",
              options: ["trys", "tries", "tryes", "trying"],
              correctAnswer: 1,
              explanation: "Try finit par consonne + Y. Le Y devient IES ➔ Tries.",
            },
            {
              id: 7,
              question: "Where ___ she live?",
              options: ["do", "does", "is", "are"],
              correctAnswer: 1,
              explanation: "She est une 3e personne. L'auxiliaire DO prend le S et devient DOES.",
            },
            {
              id: 8,
              question: "I ___ never late.",
              options: ["am", "do", "have", "go"],
              correctAnswer: 0,
              explanation: "Piège ! Late est un adjectif. Il faut le verbe Être. I AM late. Never se place après BE.",
            },
            {
              id: 9,
              question: "Leur habitude toute l’année est de prendre le bus. They usually ___ to school by bus.",
              options: ["go", "goes", "going", "is going"],
              correctAnswer: 0,
              explanation: "They prend la forme de base go. Usually indique ici une habitude.",
            },
            {
              id: 10,
              question: "The sun ___ in the west.",
              options: ["don't rise", "doesn't rises", "doesn't rise", "isn't rising"],
              correctAnswer: 2,
              explanation: "Vérité générale (négative ici, le soleil ne se lève pas à l'ouest). The sun = It ➔ Doesn't + Base verbale (Rise).",
            },
          ]}
        />
      ),
    },
  ],
};
