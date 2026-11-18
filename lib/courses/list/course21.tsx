import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course21: LessonContent = {
    courseNumber: 21,
    title: "Present Perfect (1) : Résultat Présent",
    objective: "Maîtriser le lien entre passé et présent.",
    sections: [
        {
            title: "1. La Mécanique (The Build)",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Le Present Perfect n&apos;est <strong className="text-red-400">PAS</strong> un temps du passé. C&apos;est un temps du <strong className="text-emerald-400">PRÉSENT</strong> qui regarde vers l&apos;arrière.
                    </p>

                    <div className="bg-slate-900 p-6 rounded-lg border-l-4 border-emerald-500">
                        <h4 className="text-emerald-400 font-bold mb-4 text-lg">HAVE / HAS + PARTICIPE PASSÉ (V3)</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <p className="text-white">I <strong className="text-emerald-400">have finished</strong>.</p>
                                <p className="text-white">You <strong className="text-emerald-400">have finished</strong>.</p>
                                <p className="text-white">We <strong className="text-emerald-400">have finished</strong>.</p>
                                <p className="text-white">They <strong className="text-emerald-400">have finished</strong>.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-white">He <strong className="text-amber-400">has finished</strong>.</p>
                                <p className="text-white">She <strong className="text-amber-400">has finished</strong>.</p>
                                <p className="text-white">It <strong className="text-amber-400">has finished</strong>.</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <p className="text-slate-400 text-xs italic">
                                * Rappel : le participe passé des verbes réguliers est en <strong className="text-white">-ED</strong> (finished, played). Pour les irréguliers, c&apos;est la 3e colonne (See &rarr; Saw &rarr; <strong className="text-white">Seen</strong>).
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Ce que l’on sait maintenant",
            content: (
              <LessonExamples
                examples={[
                  { english: "I’ve lost my keys. Can you open the door?", meaning: "Les clés manquent maintenant." },
                  { english: "I lost my keys on Tuesday and found them on Wednesday.", meaning: "Tu racontes deux événements datés." },
                ]}
              >
                Le present perfect relie un événement antérieur au moment présent. Demande-toi ce que la personne veut communiquer à son interlocuteur.
              </LessonExamples>
            )
        },
        {
            title: "Just, already et yet",
            content: (
              <LessonExamples
                examples={[
                  { english: "She’s just called.", meaning: "Elle vient de téléphoner." },
                  { english: "We’ve already seen this film. We’ve seen this film already.", meaning: "Les deux ordres sont naturels." },
                  { english: "Has he called yet? He hasn’t called yet.", meaning: "Tu attends toujours l’appel ou tu vérifies s’il a eu lieu." },
                ]}
              >
                Just se place souvent après have ou has. Already peut se mettre à cet endroit ou en fin de phrase. Yet arrive fréquemment en fin de question ou de négation.
              </LessonExamples>
            )
        },
        {
            title: "Quiz · Expliquer un résultat présent",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "Tom est encore au magasin. Choisis la forme du present perfect. He ___ to the shops.",
                            options: ["has gone", "has went", "have gone"],
                            correctAnswer: 0,
                            explanation: "Avec he, emploie has et le participe passé gone.",
                        },
                        {
                            id: 2,
                            question: "Exprime le résultat au present perfect. I ___ my homework. Can I go out?",
                            options: ["have done", "have did", "am done"],
                            correctAnswer: 0,
                            explanation: "Have est suivi du participe passé done.",
                        },
                        {
                            id: 3,
                            question: "Utilise le present perfect avec just. No coffee for me, thanks. I ___ one.",
                            options: ["have just had", "have just have", "am just having had"],
                            correctAnswer: 0,
                            explanation: "Have just had est la forme attendue ici. Just had s’entend aussi, notamment en anglais américain.",
                        },
                        {
                            id: 4,
                            question: "Don’t pay the bill. I ___ paid it. Choisis une construction correcte.",
                            options: ["have already", "has already", "am already"],
                            correctAnswer: 0,
                            explanation: "Avec I, on peut dire I have already paid it ou I have paid it already.",
                        },
                        {
                            id: 5,
                            question: "Tu demandes si le courrier est enfin arrivé, sans exprimer de surprise. Has the post arrived ___?",
                            options: ["yet", "ever", "still"],
                            correctAnswer: 0,
                            explanation: "Dans cette question, yet signifie « jusque-là ».",
                        },
                        {
                            id: 6,
                            question: "I ___ to him yesterday.",
                            options: ["have spoken", "spoke"],
                            correctAnswer: 1,
                            explanation: "'Yesterday' est une date précise terminée. Past Simple OBLIGATOIRE.",
                        },
                        {
                            id: 7,
                            question: "He ___ waiting for you.",
              options: ["hasn't stop", "hasn't stopped"],
                            correctAnswer: 1,
                            explanation: "Négation : Has not (Hasn't) stopped.",
                        },
                        {
                            id: 8,
                            question: "La vitre est cassée. Complète au present perfect. Someone ___ the window.",
                            options: ["has broken", "has broke", "have broken"],
                            correctAnswer: 0,
                            explanation: "Someone prend has et le participe passé de break est broken.",
                        },
                        {
                            id: 9,
                            question: "I haven't found my phone ___.",
                            options: ["just", "already", "yet"],
                            correctAnswer: 2,
                            explanation: "Phrase négative (Pas encore) = YET à la fin.",
                        },
                        {
                            id: 10,
                            question: "Are you hungry? No, I have ___ eaten.",
                            options: ["just", "yet", "ever"],
                            correctAnswer: 0,
                            explanation: "Je viens de manger à l'instant = Just.",
                        },
                    ]}
                />
            )
        }
    ]
};
