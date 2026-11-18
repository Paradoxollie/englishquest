import { LessonExamples } from "@/components/courses/lesson-examples";
import { LessonContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";

export const course40: LessonContent = {
    courseNumber: 40,
    title: "Gérondif ou Infinitif (2) : Verbes + TO",
    objective: "Maîtriser les verbes suivis obligatoirement de l'Infinitif Complet (To + Verbe).",
    sections: [
        {
            title: "L’infinitif avec to",
            content: (
              <LessonExamples
                examples={[
                  { english: "I want to be here.", meaning: "Je souhaite être ici maintenant." },
                  { english: "I hope to see you tomorrow.", meaning: "L’espoir concerne demain." },
                ]}
              >
                Après certains verbes, une base verbale précédée de to complète le sens. Le contexte donne le moment de l’action.
              </LessonExamples>
            )
        },
        {
            title: "Associer le verbe à sa construction",
            content: (
              <LessonExamples
                examples={[
                  { english: "She decided to walk. We hope to arrive by six.", meaning: "Décision et espoir." },
                  { english: "He promised to call. She offered to help.", meaning: "Promesse et proposition d’aide." },
                  { english: "I plan to stay. I plan on staying.", meaning: "Plan accepte aussi on suivi de -ing." },
                ]}
              >
                Want, decide, hope, promise et offer peuvent introduire to + verbe. Mémorise la construction avec un exemple du quotidien.
              </LessonExamples>
            )
        },
        {
            title: "2. Verbe + Objet + TO + Verbe",
            content: (
                <div className="space-y-6">
                    <p className="text-slate-300">
                        Structure très fréquente en anglais : On veut que <strong>QUELQU'UN D'AUTRE</strong> fasse l'action.
                        <br />Verbe 1 + <span className="text-green-400">PERSONNE</span> + TO + Verbe 2.
                    </p>

                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                        <ul className="space-y-3 text-white">
                            <li>• I want <strong className="text-green-400">you</strong> <strong className="text-blue-400">to come</strong>. (Je veux que tu viennes)</li>
                            <li>• She asked <strong className="text-green-400">me</strong> <strong className="text-blue-400">to help</strong>. (Elle m'a demandé d'aider)</li>
                            <li>• They told <strong className="text-green-400">us</strong> <strong className="text-blue-400">to wait</strong>. (Ils nous ont dit d'attendre)</li>
                        </ul>
                    </div>
                    <p className="text-xs text-red-400 mt-2 font-bold">ATTENTION : "I want that you come" est une erreur grave en anglais.</p>
                </div>
            )
        },
        {
            title: "Quiz · Choisir le complément à l’infinitif",
            content: (
                <Quiz
                    questions={[
                        {
                            id: 1,
                            question: "I want ___ home.",
                            options: ["to go", "going"],
                            correctAnswer: 0,
                            explanation: "WANT + TO (Intention).",
                        },
                        {
                            id: 2,
                            question: "He promised ___ late.",
                            options: ["not to be", "not being"],
                            correctAnswer: 0,
                            explanation: "PROMISE + TO (Engagement futur).",
                        },
                        {
                            id: 3,
                            question: "We decided ___ a pizza.",
                            options: ["ordering", "to order"],
                            correctAnswer: 1,
                            explanation: "DECIDE + TO (Décision d'une action future).",
                        },
                        {
                            id: 4,
                            question: "I want ___ to clean your room.",
                            options: ["that you", "you"],
                            correctAnswer: 1,
                            explanation: "Structure : Want + PERSONNE + To... (Jamais 'Want that').",
                        },
                        {
                            id: 5,
                            question: "She offered ___ us.",
                            options: ["to help", "helping"],
                            correctAnswer: 0,
                            explanation: "OFFER + TO (Proposition).",
                        },
                        {
                            id: 6,
                            question: "Tu rappelles une tâche à faire avant de sortir. Don’t forget ___ the door when you leave.",
                            options: ["locking", "to lock"],
                            correctAnswer: 1,
                            explanation: "Forget to lock vise l’action qu’il reste à accomplir.",
                        },
                        {
                            id: 7,
                            question: "He plans ___ his job.",
                            options: ["quit", "to quit"],
                            correctAnswer: 1,
                            explanation: "PLAN + TO (Projet).",
                        },
                        {
                            id: 8,
                            question: "She asked him ___ quiet.",
                            options: ["be", "to be"],
                            correctAnswer: 1,
                            explanation: "Ask + Someone + TO + Verb.",
                        },
                        {
                            id: 9,
                            question: "I hope ___ the exam.",
                            options: ["passing", "to pass"],
                            correctAnswer: 1,
                            explanation: "HOPE + TO (Espoir futur).",
                        },
                        {
                            id: 10,
                            question: "Choisis la demande qu’un ami peut réellement t’adresser. « Elle m’a demandé d’attendre. »",
                            options: ["She asked me to wait.", "She asked that me wait.", "She asked me waiting."],
                            correctAnswer: 0,
                            explanation: "Ask + personne + to + base verbale exprime la demande.",
                        }
                    ]}
                />
            )
        }
    ]
};