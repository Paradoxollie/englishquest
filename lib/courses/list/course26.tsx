import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course26: LessonContent = {
    courseNumber: 26,
    title: "Comparaison : Past Simple vs Present Perfect",
    objective: "Distinguer l'action révolue du bilan présent.",
    sections: [
        {
            title: "Ce qui s’est passé aujourd’hui",
            content: (
              <LessonExamples
                examples={[
                  { english: "I saw Maya today.", meaning: "Tu racontes une rencontre qui a eu lieu." },
                  { english: "I’ve seen Maya twice today.", meaning: "Tu comptes les rencontres depuis le début de la journée." },
                ]}
              >
                Une même période peut servir à raconter un événement ou à faire le bilan jusqu’à maintenant.
              </LessonExamples>
            )
        },
        {
            title: "Un moment passé ou un bilan",
            content: (
              <LessonExamples
                examples={[
                  { english: "I lost my keys yesterday.", meaning: "Hier situe l’événement." },
                  { english: "I’ve lost my keys. Can you let me in?", meaning: "Le résultat compte au moment de parler." },
                ]}
              >
                Un moment passé fermé conduit normalement au prétérit. Avec le present perfect, la personne fait le lien avec le présent. Un lieu ou une simple durée ne suffit pas à décider.
              </LessonExamples>
            )
        },
        {
            title: "3. Analyse Comparative",
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-900/20 p-5 rounded border border-blue-500/50">
                        <h4 className="text-blue-400 font-bold mb-4 uppercase text-sm">
                            Erreur Fréquente à Éviter
                        </h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Il est incorrect de mélanger l'auxiliaire "Have" (présent) avec un marqueur de temps passé.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/40 p-3 rounded border border-red-500/30">
                                <p className="text-red-400 font-bold text-xs mb-1">INCORRECT</p>
                                <p className="text-slate-400 line-through">"I <strong className="text-red-500">have arrived</strong> yesterday."</p>
                                <p className="text-xs text-slate-500 mt-2">Conflit : Have (Présent) vs Yesterday (Passé).</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded border border-emerald-500/30">
                                <p className="text-emerald-400 font-bold text-xs mb-1">CORRECT</p>
                                <p className="text-white">"I <strong className="text-emerald-400">arrived</strong> yesterday."</p>
                                <p className="text-xs text-slate-500 mt-2">Cohérence : Verbe passé + Date passée.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Quiz · Situer un fait passé",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I ___ to the cinema yesterday.",
                            options: ["have gone", "went"],
                            correctAnswer: 1,
                            explanation: "'Yesterday' place l'action dans une période révolue. Past Simple obligatoire.",
                        },
                        {
                            id: 2,
                            question: "Rassure la personne en employant le present perfect. I ___ my homework.",
                            options: ["have done", "have did", "did done"],
                            correctAnswer: 0,
                            explanation: "Have done forme le present perfect de do.",
                        },
                        {
                            id: 3,
                            question: "___ you ever eaten frogs?",
                            options: ["Did", "Have"],
                            correctAnswer: 1,
                            explanation: "'Ever' interroge sur l'expérience de vie globale jusqu'à maintenant. Present Perfect.",
                        },
                        {
                            id: 4,
                            question: "When ___ you born?",
                            options: ["were", "have you been"],
                            correctAnswer: 0,
                            explanation: "La naissance est un événement daté, terminé dans le passé. Past Simple.",
                        },
                        {
                            id: 5,
                            question: "She ___ here for 10 years now.",
                            options: ["lived", "has lived"],
                            correctAnswer: 1,
                            explanation: "For + now : elle habite toujours ici, la période n'est pas terminée. Present Perfect.",
                        },
                        {
                            id: 6,
                            question: "Shakespeare ___ many plays.",
                            options: ["has written", "wrote"],
                            correctAnswer: 1,
                            explanation: "Le sujet (Shakespeare) est décédé, sa période d'activité est terminée. Past Simple.",
                        },
                        {
                            id: 7,
                            question: "It is the first time I ___ a helicopter.",
                            options: ["flew", "have flown"],
                            correctAnswer: 1,
                            explanation: "Structure idiomatique de bilan 'It is the first time...' = Present Perfect.",
                        },
                        {
                            id: 8,
                            question: "Complète avec un participe passé. He has ___ his leg.",
                            options: ["broken", "broke", "break"],
                            correctAnswer: 0,
                            explanation: "Break, broke, broken. Après has, il faut broken.",
                        },
                        {
                            id: 9,
                            question: "He ___ his leg last year.",
                            options: ["broke", "has broken"],
                            correctAnswer: 0,
                            explanation: "Marqueur temporel strict 'Last year'. Past Simple.",
                        },
                        {
                            id: 10,
                            question: "At 11pm last night, I ___ to bed.",
                            options: ["went", "have gone"],
                            correctAnswer: 0,
                            explanation: "Heure et date précises dans le passé. Past Simple.",
                        },
                    ]}
                />
            )
        }
    ]
};