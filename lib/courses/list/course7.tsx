import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course7: LessonContent = {
  courseNumber: 7,
  title: "Les Pronoms et la Possession",
  description: "Adjectifs Possessifs, Cas Génitif et Pronoms Possessifs.",
  icon: "🎓",
  difficulty: "Moyen",
  objective: "Comprendre la logique et le contexte de la possession.",
  sections: [
    {
      title: "Introduction : Le Rôle du Sujet",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 rounded-lg border-l-4 border-indigo-500">
            <p className="text-slate-200 text-lg">
              <strong>Pourquoi commencer ici ?</strong><br />
              Pour exprimer la possession ("Sa voiture"), il faut d'abord identifier <strong>L'ACTEUR</strong> ("Il" ou "Elle"). Sans identifier le sujet, vous ne pouvez pas choisir le bon possessif.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border border-slate-700">
              <thead className="bg-slate-800 text-slate-200 uppercase font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-700">L'Acteur (Sujet)</th>
                  <th className="p-3 border-b border-slate-700">Désigne...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40 font-mono">
                <tr><td className="p-3"><span className="text-white font-bold">I</span></td><td className="p-3">Moi-même (Je)</td></tr>
                <tr><td className="p-3"><span className="text-white font-bold">You</span></td><td className="p-3">Toi ou Vous (L'interlocuteur)</td></tr>
                <tr><td className="p-3"><span className="text-white font-bold">He</span></td><td className="p-3">Un Homme (Il)</td></tr>
                <tr><td className="p-3"><span className="text-white font-bold">She</span></td><td className="p-3">Une Femme (Elle)</td></tr>
                <tr><td className="p-3"><span className="text-white font-bold">It</span></td><td className="p-3">Une Chose / Un Animal</td></tr>
                <tr><td className="p-3"><span className="text-white font-bold">We</span></td><td className="p-3">Nous (Groupe incluant Moi)</td></tr>
                <tr><td className="p-3"><span className="text-white font-bold">They</span></td><td className="p-3">Eux (Groupe externe)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      title: "Partie 1 : Les Adjectifs Possessifs (Déterminants)",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Usage & Contexte</h4>
            <p className="text-slate-300">
              <strong>À quoi ça sert ?</strong> À introduire un objet en précisant son propriétaire.<br />
              <strong>Quand l'utiliser ?</strong> Quand vous nommez l'objet juste après. Il fonctionne comme un article (Le/La/Un/Une).
            </p>
            <p className="bg-slate-900 p-3 rounded text-emerald-400 font-mono text-center">
              C'est <span className="text-white underline decoration-emerald-500">ma</span> voiture. = It is <span className="text-white underline decoration-emerald-500">my</span> car.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border border-slate-700 mt-2">
              <thead className="bg-slate-800 text-slate-200 uppercase font-bold">
                <tr>
                  <th className="p-3 border-b border-slate-700">Sujet</th>
                  <th className="p-3 border-b border-slate-700">Adjectif Possessif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40 font-mono">
                <tr><td className="p-3">I (Je)</td><td className="p-3 text-emerald-400 font-bold">My <span className="text-slate-500 font-normal text-xs">(Mon/Ma/Mes)</span></td></tr>
                <tr><td className="p-3">You (Tu)</td><td className="p-3 text-emerald-400 font-bold">Your <span className="text-slate-500 font-normal text-xs">(Ton/Ta/Tes)</span></td></tr>
                <tr><td className="p-3">He (Il)</td><td className="p-3 text-emerald-400 font-bold">His <span className="text-slate-500 font-normal text-xs">(Son - Homme)</span></td></tr>
                <tr><td className="p-3">She (Elle)</td><td className="p-3 text-emerald-400 font-bold">Her <span className="text-slate-500 font-normal text-xs">(Sa - Femme)</span></td></tr>
                <tr><td className="p-3">It (Chose)</td><td className="p-3 text-emerald-400 font-bold">Its <span className="text-slate-500 font-normal text-xs">(Son - Chose)</span></td></tr>
                <tr><td className="p-3">We (Nous)</td><td className="p-3 text-emerald-400 font-bold">Our <span className="text-slate-500 font-normal text-xs">(Notre/Nos)</span></td></tr>
                <tr><td className="p-3">They (Eux)</td><td className="p-3 text-emerald-400 font-bold">Their <span className="text-slate-500 font-normal text-xs">(Leur/Leurs)</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 mt-4">
            <h4 className="text-white font-bold uppercase mb-4 border-b border-slate-600 pb-2">
              Point Critique : La Règle du Genre
            </h4>
            <p className="text-slate-300 text-sm mb-4">
              En anglais, l'adjectif possessif s'accorde avec le <strong>possesseur</strong>, et non avec l'objet possédé.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-white font-bold">Si le propriétaire est un HOMME (He)</p>
                <p className="text-emerald-400 font-mono text-lg">➔ HIS House</p>
                <p className="text-xs text-slate-500">Même si 'House' est féminin, on s'en fiche. C'est À LUI.</p>
              </div>
              <div className="space-y-2">
                <p className="text-white font-bold">Si le propriétaire est une FEMME (She)</p>
                <p className="text-purple-400 font-mono text-lg">➔ HER House</p>
                <p className="text-xs text-slate-500">C'est À ELLE.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 2 : Le Cas Possessif (Génitif 'S)",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Usage & Contexte</h4>
            <p className="text-slate-300">
              <strong>À quoi ça sert ?</strong> À créer un lien d'appartenance direct entre deux noms.<br />
              <strong>Pourquoi pas "OF" ?</strong> "The car OF Pierre" est grammaticalement lourd et incorrect en anglais courant. On privilégie la structure "Propriétaire-Objet".
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border-l-4 border-amber-500">
            <p className="text-amber-400 font-bold uppercase mb-2">La Structure</p>
            <div className="flex flex-col md:flex-row items-center gap-4 text-xl font-mono text-white">
              <div className="text-center">
                <span className="block text-sm text-slate-500 mb-1">1. Le Chef</span>
                <span className="bg-slate-800 px-3 py-1 rounded">Pierre</span>
              </div>
              <span className="text-red-400 font-black text-3xl">'S</span>
              <div className="text-center">
                <span className="block text-sm text-slate-500 mb-1">2. L'Objet</span>
                <span className="bg-slate-800 px-3 py-1 rounded">Car</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400 italic">
              Notez que l'article "The" de "Car" disparaît. Il est "avalé" par le 'S.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Partie 3 : Les Pronoms Possessifs (Substituts)",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. Usage & Contexte</h4>
            <p className="text-slate-300">
              <strong>Quel est le but ?</strong> Éviter la répétition.<br />
              <strong>Situation :</strong> Vous montrez un sac. Vous ne voulez pas dire "C'est mon sac". Vous dites "C'est le mien".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
              <p className="text-xs uppercase text-slate-500 mb-1">Phrase Lourde (Répétition)</p>
              <p className="text-slate-300">"Is this <span className="text-emerald-400">your bag</span>? No, it's <span className="text-emerald-400">my bag</span>."</p>
            </div>
            <div>
              <p className="text-xs uppercase text-amber-500 mb-1">Phrase Fluide (Pronom)</p>
              <p className="text-white font-bold">"Is this <span className="text-amber-400">yours</span>? No, it's <span className="text-amber-400">mine</span>."</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border border-slate-700 mt-4 text-center">
              <thead className="bg-slate-800 text-slate-200 uppercase font-bold">
                <tr><th className="p-3 border-b border-slate-700">Adjectif (Avec Nom)</th><th className="p-3 border-b border-slate-700">Pronom (Sans Nom)</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-900/40 font-mono">
                <tr><td className="p-3 text-emerald-300">My car</td><td className="p-3 text-amber-300 font-bold">Mine</td></tr>
                <tr><td className="p-3 text-emerald-300">Your car</td><td className="p-3 text-amber-300 font-bold">Yours <span className="text-xs text-slate-500">(+S)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">His car</td><td className="p-3 text-amber-300 font-bold">His <span className="text-xs text-slate-500">(Inchangé)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">Her car</td><td className="p-3 text-amber-300 font-bold">Hers <span className="text-xs text-slate-500">(+S)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">Our car</td><td className="p-3 text-amber-300 font-bold">Ours <span className="text-xs text-slate-500">(+S)</span></td></tr>
                <tr><td className="p-3 text-emerald-300">Their car</td><td className="p-3 text-amber-300 font-bold">Theirs <span className="text-xs text-slate-500">(+S)</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      title: "Partie 4 : Distinctions Techniques (Whose & Its)",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WHOSE */}
            <div className="space-y-2">
              <h4 className="text-white font-bold border-b border-slate-700 pb-1">1. WHOSE (L'interrogateur)</h4>
              <p className="text-slate-300 text-sm">
                Sert à poser la question sur le propriétaire. Ne confondez pas avec "Who's" (Qui est).
              </p>
              <p className="text-emerald-400 font-mono text-sm bg-slate-900 p-2 rounded">
                "<strong>Whose</strong> keys are these?" (À qui sont ces clés ?)
              </p>
            </div>

            {/* ITS vs IT'S */}
            <div className="space-y-2">
              <h4 className="text-white font-bold border-b border-slate-700 pb-1">2. ITS vs IT'S</h4>
              <ul className="text-sm space-y-2 text-slate-300">
                <li>
                  <span className="text-emerald-400 font-bold">Its</span> : "Son/Sa" (pour un objet). <br />
                  <span className="text-xs text-slate-500">"The phone and <span className="text-white bg-red-500/20 px-1 rounded">its</span> screen."</span>
                </li>
                <li>
                  <span className="text-red-400 font-bold">It's</span> : "It IS" (C'est). <br />
                  <span className="text-xs text-slate-500">"It's expensive."</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
      content: (
        <Quiz
          title="Évaluation de Maîtrise"
          questions={[
            {
              id: 1,
              question: "I have a brother. ___ name is Paul.",
              options: ["His", "Her", "He", "Him"],
              correctAnswer: 0,
              explanation: "Le sujet est 'Brother' (Homme) ➔ HIS.",
            },
            {
              id: 2,
              question: "This is my sister. ___ car is red.",
              options: ["His", "Her", "She", "Hers"],
              correctAnswer: 1,
              explanation: "Le sujet est 'Sister' (Femme) ➔ HER.",
            },
            {
              id: 3,
              question: "This is the office of the boss.",
              options: ["It's the boss's office", "It's the office's boss", "It's the boss office", "It's the office boss"],
              correctAnswer: 0,
              explanation: "Structure Génitif : Boss + 's + Office.",
            },
            {
              id: 4,
              question: "___ shoes are these?",
              options: ["Who", "Who's", "Whose", "Whom"],
              correctAnswer: 2,
              explanation: "Question d'appartenance ➔ WHOSE.",
            },
            {
              id: 5,
              question: "It is my sandwich. It is ___.",
              options: ["mine", "my", "me", "mines"],
              correctAnswer: 0,
              explanation: "Remplacement du nom (Pronom) ➔ MINE.",
            },
            {
              id: 6,
              question: "These keys are not yours. They are ___.",
              options: ["our", "ours", "us", "we"],
              correctAnswer: 1,
              explanation: "Pronom (Les nôtres) ➔ OURS.",
            },
            {
              id: 7,
              question: "Look at the dog! ___ ears are huge.",
              options: ["It's", "Its", "His", "Her"],
              correctAnswer: 1,
              explanation: "Possessif animal ➔ ITS.",
            },
            {
              id: 8,
              question: "The children are playing with ___ toys.",
              options: ["theirs", "their", "they", "there"],
              correctAnswer: 1,
              explanation: "Adjectif devant 'toys' ➔ THEIR.",
            },
            {
              id: 9,
              question: "Is this pen ___?",
              options: ["your", "you", "yours", "you's"],
              correctAnswer: 2,
              explanation: "Pronom fin de phrase ➔ YOURS.",
            },
            {
              id: 10,
              question: "___ time to go.",
              options: ["Its", "It's", "His", "Her"],
              correctAnswer: 1,
              explanation: "Contraction de 'It is' ➔ IT'S.",
            },
          ]}
        />
      )
    }
  ],
};