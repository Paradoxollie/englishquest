import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course16: LessonContent = {
  courseNumber: 16,
  title: "L'Obligation (Must / Have to)",
  description: "La loi interne vs la loi externe.",
  icon: "👮",
  difficulty: "Difficile",
  objective: "Exprimer une obligation, une interdiction ou une absence d’obligation.",
  sections: [
    {
      title: "Parler d’une obligation",
      content: (
        <LessonExamples
          examples={[
            { english: "Passengers must wear seat belts.", meaning: "Formulation courante sur un panneau." },
            { english: "We have to wear seat belts.", meaning: "Une personne explique la règle." },
            { english: "I must remember my ticket.", meaning: "Je me rappelle à moi-même quelque chose d’important." },
          ]}
        >
          Must et have to expriment tous deux une nécessité. Le point de vue et le registre orientent le choix. Un règlement peut employer must directement.
        </LessonExamples>
      )
    },
    {
      title: "Une obligation aujourd’hui, hier ou demain",
      content: (
        <LessonExamples
          examples={[
            { english: "You must call me tomorrow.", meaning: "L’obligation porte sur demain." },
            { english: "I had to leave early yesterday.", meaning: "L’obligation se situait hier." },
            { english: "We’ll have to leave before six.", meaning: "L’horaire nous imposera de partir tôt." },
          ]}
        >
          Must peut viser l’avenir avec un repère comme tomorrow. Pour raconter une obligation passée, emploie had to. Pour annoncer ce que les circonstances imposeront, will have to est disponible.
        </LessonExamples>
      )
    },
    {
      title: "Déduire à partir d’un indice",
      content: (
        <LessonExamples
          examples={[
            { english: "You worked all night. You must be tired.", meaning: "Tu déduis la fatigue à partir de la nuit de travail." },
            { english: "That can’t be Maya. She’s abroad.", meaning: "Tu disposes d’un indice qui exclut cette personne." },
          ]}
        >
          Must exprime aussi une conclusion que les indices rendent très plausible. Avec can’t, tu juges une explication impossible.
        </LessonExamples>
      )
    },
    {
      title: "3. Le Contresens Absolu (Négation)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-950 p-6 rounded-xl border border-red-600 shadow-lg shadow-red-900/20">
            <h3 className="text-red-500 font-black text-xl flex items-center gap-3 uppercase mb-4">
              <span className="text-3xl">☠️</span> Danger Critique
            </h3>
            <p className="text-slate-100 text-lg mb-6">
              À la forme affirmative, <em>Must</em> et <em>Have to</em> sont proches.
              <br />
              MAIS à la forme négative, <strong>ILS SONT OPPOSÉS</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MUSTN'T */}
              <div className="bg-red-900/40 p-5 rounded-lg border border-red-500 flex flex-col items-center text-center">
                <div className="text-5xl mb-3">⛔</div>
                <h4 className="text-white font-black text-xl uppercase mb-2">MUSTN'T</h4>
                <p className="text-red-300 font-bold">C'est INTERDIT !</p>
                <p className="text-slate-300 text-sm mt-3 border-t border-red-500/50 pt-3 w-full">
                  "You mustn't smoke."
                  <br />
                  <span className="italic text-slate-400">= Don't do it!</span>
                </p>
              </div>

              {/* DON'T HAVE TO */}
              <div className="bg-emerald-900/40 p-5 rounded-lg border border-emerald-500 flex flex-col items-center text-center">
                <div className="text-5xl mb-3">🤷</div>
                <h4 className="text-white font-black text-xl uppercase mb-2">DON'T HAVE TO</h4>
                <p className="text-emerald-300 font-bold">Ce n'est PAS nécessaire.</p>
                <p className="text-slate-300 text-sm mt-3 border-t border-emerald-500/50 pt-3 w-full">
                  "You don't have to pay."
                  <br />
                  <span className="italic text-slate-400">= ou "You needn't pay".</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded mt-6 text-center">
              <p className="text-slate-400 text-xs mb-2">
                <span className="text-amber-400 font-bold">Note Orale :</span> "I have got to go" (ou "I've gotta go") est très courant pour dire "I have to go".
              </p>
              <p className="text-white text-sm">
                <span className="text-red-500 font-bold">RAPPEL :</span> "You mustn't pay" = Interdit de payer. "You don't have to pay" = Gratuit.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quiz · Distinguer obligation et interdiction",
      content: (
        <Quiz
          title="Le Juge de l'Obligation"
          questions={[
            {
              id: 1,
              question: "It's a secret. You ___ tell anyone.",
              options: ["mustn't", "don't have to", "haven't to", "must not to"],
              correctAnswer: 0,
              explanation: "Interdiction formelle (Secret). ➔ MUSTN'T.",
            },
            {
              id: 2,
              question: "Il bâille après sa nuit de travail. Complète « He ___ be tired » avec le modal qui exprime une forte déduction.",
              options: ["might", "must", "shouldn’t", "can’t"],
              correctAnswer: 1,
              explanation: "Must exprime ici la conclusion que tu tires des indices.",
            },
            {
              id: 3,
              question: "You ___ come if you don't want to. It's optional.",
              options: ["mustn't", "don't have to", "haven't to", "must not"],
              correctAnswer: 1,
              explanation: "Absence d'obligation (C'est ton choix). ➔ DON'T HAVE TO (ou Needn't).",
            },
            {
              id: 4,
              question: "She is running a marathon? But her leg is broken! It ___ be true.",
              options: ["mustn't", "can't", "doesn't have to", "shouldn't"],
              correctAnswer: 1,
              explanation: "DÉDUCTION NÉGATIVE (Impossible). On n'utilise jamais Mustn't pour dire 'C'est impossible'. On utilise CAN'T.",
            },
            {
              id: 5,
              question: "Yesterday, I ___ work late.",
              options: ["must", "had to", "have to", "musted"],
              correctAnswer: 1,
              explanation: "Passé. Must n'existe pas au passé. Il faut utiliser HAD TO.",
            },
            {
              id: 6,
              question: "Entrance is free. You ___ pay.",
              options: ["mustn't", "needn't", "cannot", "won't"],
              correctAnswer: 1,
              explanation: "Absence de nécessité. NEEDN'T est un synonyme chic de 'Don't have to'.",
            },
            {
              id: 7,
              question: "Sur un panneau, choisis le modal qui exprime une obligation. Passengers ___ wear seat belts.",
              options: ["might", "must", "may", "could"],
              correctAnswer: 1,
              explanation: "Must exprime l’obligation. Have to serait également naturel dans une phrase qui explique le règlement.",
            },
            {
              id: 8,
              question: "Tu anticipes ce que ton nouvel horaire va t’imposer. Tomorrow I ___ get up early.",
              options: ["must to", "will must", "will have to", "had to"],
              correctAnswer: 2,
              explanation: "Will have to annonce une obligation future. You must get up early tomorrow est également naturel.",
            },
            {
              id: 9,
              question: "She ___ wear a uniform at work.",
              options: ["musts", "has to", "have to", "must to"],
              correctAnswer: 1,
              explanation: "Règle externe (Travail) + 3e personne. Must est invariable. 'Has to' est la bonne conjugaison.",
            },
            {
              id: 10,
              question: "Que signifie « You don’t have to come tomorrow » ?",
              options: ["Ta présence est interdite.", "Ta présence est facultative.", "Ta présence est obligatoire."],
              correctAnswer: 1,
              explanation: "Don’t have to laisse le choix. Mustn’t exprimerait une interdiction.",
            },
          ]}
        />
      )
    }
  ]
};
