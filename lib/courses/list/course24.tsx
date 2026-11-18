import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course24: LessonContent = {
    courseNumber: 24,
    title: "Present Perfect Continuous : L'Action",
    objective: "Mettre l'accent sur l'activité elle-même.",
    sections: [
        {
            title: "1. La Formation",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Ce temps est comme une caméra qui zoome sur l&apos;action en cours ou qui vient juste de finir.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-indigo-500">
                        <h4 className="text-indigo-400 font-bold mb-4 text-lg">HAVE/HAS + BEEN + V-ING</h4>

                        <div className="space-y-2 text-lg">
                            <p className="text-white">I <strong className="text-indigo-400">have been running</strong>.</p>
                            <p className="text-white">He <strong className="text-indigo-400">has been sleeping</strong>.</p>
                            <p className="text-white">They <strong className="text-indigo-400">have been waiting</strong>.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Une activité et ses traces",
            content: (
              <LessonExamples
                examples={[
                  { english: "It’s been raining. The ground is wet.", meaning: "Il a pu cesser de pleuvoir." },
                  { english: "I’ve been working since eight. Can we take a break?", meaning: "La personne décrit l’activité qui l’occupe." },
                ]}
              >
                Le present perfect continu peut décrire une activité qui continue ou qui vient de s’arrêter. Les traces qu’elle laisse expliquent souvent pourquoi on en parle.
              </LessonExamples>
            )
        },
        {
            title: "Compter un résultat ou décrire une activité",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ve been running five kilometres every morning.", meaning: "La distance décrit chaque sortie d’une habitude répétée." },
                  { english: "I’ve run five kilometres today.", meaning: "Tu annonces le total parcouru aujourd’hui." },
                  { english: "I’ve written three emails. I’ve been writing emails all morning.", meaning: "La première phrase compte les messages terminés. La seconde décrit l’activité." },
                ]}
              >
                Une quantité est possible dans les deux formes. Le choix dépend de ce que tu veux mettre au premier plan.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Décrire une activité récente",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Ton ami est essoufflé. Tu lui demandes quelle activité l’occupait. ___ you ___?",
                            options: ["Have / been running", "Has / running", "Are / been running"],
                            correctAnswer: 0,
                            explanation: "Le present perfect continu demande la cause de son essoufflement.",
                        },
                        {
                            id: 2,
                            question: "Look! Someone ___ that window.",
                            options: ["has broken", "has been breaking"],
                            correctAnswer: 0,
                            explanation: "La fenêtre est cassée (Résultat final visible, pas l'action en cours) = Simple.",
                        },
                        {
                            id: 3,
                            question: "I ___ my keys. I can't find them.",
                            options: ["have been losing", "have lost"],
                            correctAnswer: 1,
                            explanation: "Perdre n'est pas une activité qu'on fait 'pendant' une durée. C'est un résultat = Simple.",
                        },
                        {
                            id: 4,
                            question: "Insiste sur l’activité qui explique ta fatigue. I ___ all afternoon.",
                            options: ["have been working", "have been work", "am been working"],
                            correctAnswer: 0,
                            explanation: "Have been + -ing rend compte de l’activité.",
                        },
                        {
                            id: 5,
                            question: "Le compteur affiche dix messages envoyés. Quel résultat annonces-tu ?",
                            options: ["I’ve written ten emails.", "I’ve been writing an email.", "I’ll write ten emails."],
                            correctAnswer: 0,
                            explanation: "Le premier énoncé annonce le total effectivement atteint.",
                        },
                        {
                            id: 6,
                            question: "Tes vêtements sont terreux. Choisis la forme continue correcte. I ___ in the garden.",
                            options: ["have been working", "have working", "have been worked"],
                            correctAnswer: 0,
                            explanation: "Le sol sur les vêtements est un indice de l’activité récente.",
                        },
                        {
                            id: 7,
                            question: "Where is the book? I ___ it yet.",
                            options: ["haven't been finishing", "haven't finished"],
                            correctAnswer: 1,
                            explanation: "Négation d'accomplissement (fini ou pas) = Simple.",
                        },
                        {
                            id: 8,
                            question: "He ___ emails for two hours.",
                            options: ["has been writing", "has written"],
                            correctAnswer: 0,
                            explanation: "Pas de quantité mentionnée, juste la durée = Continuous.",
                        },
                        {
                            id: 9,
                            question: "It is the first time I ___ a car.",
                            options: ["have been driving", "have driven"],
                            correctAnswer: 1,
                            explanation: "Structure 'It is the first time...' = Toujours SIMPLE (C'est un bilan d'expérience).",
                        },
                        {
                            id: 10,
                            question: "Demande la durée de l’attente avec le present perfect continu. ___ you ___ long?",
                            options: ["Have / waited", "Have / been waiting"],
                            correctAnswer: 1,
                            explanation: "Question classique sur la durée de l'attente = Continuous.",
                        },
                    ]}
                />
            )
        }
    ]
};