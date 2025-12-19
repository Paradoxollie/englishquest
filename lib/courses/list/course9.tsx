import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course9: LessonContent = {
  courseNumber: 9,
  title: "Quantité (Some / Any)",
  description: "Définir l'indéfini : Du, De la, Des.",
  icon: "⚖️",
  difficulty: "Difficile",
  objective: "Comprendre pourquoi et comment on quantifie en anglais.",
  sections: [
    {
      title: "Introduction : Pourquoi ces mots existent ?",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-900/40 p-4 rounded-lg border-l-4 border-amber-500">
            <h4 className="text-amber-400 font-bold uppercase mb-2">1. À quoi ça sert ?</h4>
            <p className="text-slate-200 text-lg mb-4">
              En anglais, on ne peut pas parler d'une quantité non-précisée sans mettre un petit mot devant le nom.
              <br />
              Si vous dites "I eat apple", on dirait un robot. Si vous dites "I eat apples", vous parlez des pommes en général (toutes les pommes du monde).
              <br /><br />
              Pour dire "Je mange <strong>des</strong> pommes" (une certaine quantité, pas toutes, pas une seule), il faut un outil : <strong>Some</strong> ou <strong>Any</strong>.
            </p>

            <h4 className="text-amber-400 font-bold uppercase mb-2">2. La Traduction (Le Concept)</h4>
            <ul className="list-none space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-1 rounded">SOME</span>
                <span>= "En partie", "Quelques", "Un peu de". (Positif)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-red-500/20 text-red-400 font-bold px-2 py-1 rounded">ANY</span>
                <span>= "N'importe quel", "Aucun", "Du tout". (Négatif / Neutre)</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Partie 1 : Le Système Binaire (+ / -)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            Puisqu'ils veulent dire la même chose ("une certaine quantité"), l'anglais les range par <strong>Contexte</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-emerald-500/30">
              <h4 className="text-emerald-400 font-bold uppercase mb-2 flex items-center gap-2">
                <span className="text-2xl">✅</span> Contexte : J'en ai (Some)
              </h4>
              <p className="text-slate-300 mb-2 text-sm">
                Vous affirmez l'existence d'une quantité. C'est réel, c'est là.
              </p>
              <p className="font-mono text-white bg-slate-900 p-2 rounded text-center">
                "I have <span className="text-emerald-400 font-bold">SOME</span> ideas."
                <br />
                <span className="text-xs text-slate-500">(J'ai quelques idées)</span>
              </p>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-red-500/30">
              <h4 className="text-red-400 font-bold uppercase mb-2 flex items-center gap-2">
                <span className="text-2xl">❌</span> Contexte : Vide (Any)
              </h4>
              <p className="text-slate-300 mb-2 text-sm">
                Le vide absolu. Zéro quantité.
              </p>
              <p className="font-mono text-white bg-slate-900 p-2 rounded text-center">
                "I don't have <span className="text-red-400 font-bold">ANY</span> ideas."
              </p>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-blue-500/30">
            <h4 className="text-blue-400 font-bold uppercase mb-2 flex items-center gap-2">
              <span className="text-2xl">❓</span> Contexte : Inconnu (Any)
            </h4>
            <p className="text-slate-300 mb-2 text-sm">
              Je ne sais pas si il y en a. Je demande "n'importe quelle quantité".
            </p>
            <p className="font-mono text-white bg-slate-900 p-2 rounded text-center">
              "Do you have <span className="text-blue-400 font-bold">ANY</span> ideas?"
              <br />
              <span className="text-xs text-slate-500">(As-tu la moindre idée ?)</span>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Partie 2 : L'Exception de Politesse (The Waiter Rule)",
      content: (
        <div className="space-y-6">
          <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30">
            <h4 className="text-amber-400 font-bold uppercase mb-2 flex items-center gap-2">
              <span className="text-xl">☕</span> L'Exception "Restaurant"
            </h4>
            <p className="text-slate-200">
              Si la règle est stricte <strong>(? = ANY)</strong>, pourquoi dit-on :
              <br />
              <em>"Can I have <strong>some</strong> water?"</em>
            </p>
            <p className="text-slate-300 mt-2 text-sm">
              <strong>La réponse :</strong> C'est une fausse question. Vous n'attendez pas une information (Oui/Non), vous attendez un service.
              <br /><br />
              ➔ Quand on <strong>Offre</strong> ou qu'on <strong>Demande</strong> (en espérant un OUI), on utilise <span className="text-emerald-400 font-bold">SOME</span> pour être poli.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Partie 3 : Les Grandes Quantités (Much / Many)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-200">
            Pour dire "Beaucoup", l'anglais sépare le monde en deux : ce qu'on compte et ce qu'on ne compte pas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MUCH */}
            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-blue-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">💧</div>
              <h4 className="text-blue-400 font-bold uppercase mb-2">MUCH (Indénombrable)</h4>
              <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">Eau, Temps, Argent...</p>
              <p className="text-slate-300 text-sm mb-3">
                Pour les concepts singuliers. Surtout utilisé en <strong>Négatif (-)</strong> et <strong>Question (?)</strong>.
              </p>
              <p className="font-mono text-white bg-slate-900 p-2 rounded text-center text-sm">
                "I don't have <span className="text-blue-400 font-bold">much</span> time."
              </p>
            </div>

            {/* MANY */}
            <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-amber-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 text-6xl">📚</div>
              <h4 className="text-amber-400 font-bold uppercase mb-2">MANY (Comptable)</h4>
              <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">Amis, Livres, Jours...</p>
              <p className="text-slate-300 text-sm mb-3">
                Pour les pluriels. Utilisable partout, mais très fréquent en Négatif et Question.
              </p>
              <p className="font-mono text-white bg-slate-900 p-2 rounded text-center text-sm">
                "Do you have <span className="text-amber-400 font-bold">many</span> friends?"
              </p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <h4 className="text-emerald-400 font-bold uppercase mb-3 text-center">🃏 Le Joker : A LOT OF vs LOTS OF</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-white font-bold text-center mb-1">A LOT OF</p>
                <p className="text-slate-400 text-xs text-center">Standard / Neutre</p>
                <p className="text-slate-300 text-xs text-center mt-1">"Beaucoup de"</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded">
                <p className="text-white font-bold text-center mb-1">LOTS OF</p>
                <p className="text-slate-400 text-xs text-center">Informel / Oral</p>
                <p className="text-slate-300 text-xs text-center mt-1">"Des tas de"</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-300 border-t border-slate-700 pt-3">
              <p className="font-bold text-white">🚀 La Règle Magique : Ils marchent avec TOUT !</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>
                  Avec du <strong>Pluriel</strong> (Comptable) : <br />
                  "I have <span className="text-emerald-400">a lot of</span> friend<strong>s</strong>."
                </li>
                <li>
                  Avec du <strong>Singulier</strong> (Indénombrable) : <br />
                  "I have <span className="text-emerald-400">lots of</span> time."
                </li>
              </ul>
              <p className="text-xs text-slate-500 italic mt-2">
                Astuce : Dans le doute en phrase affirmative (+), utilisez toujours "A lot of". C'est 100% sûr.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Partie 4 : Les 'Faux Amis' (Pièges Indénombrables)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertIcon className="w-8 h-8 text-red-500" />
              <h4 className="text-red-400 font-bold uppercase text-lg">Le Piège Mortel des Francophones</h4>
            </div>
            <p className="text-slate-200 text-lg leading-relaxed text-balance">
              En français, on peut compter ces mots. En anglais, <strong>JAMAIS</strong>.
              Ils sont toujours singuliers (Indénombrables).
              <br />
              <span className="text-red-400 font-bold">Interdit de mettre "A", "AN" ou "S" à la fin !</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { word: "Information", trap: "Une information", proper: "Some information" },
              { word: "Advice", trap: "Un conseil", proper: "Some advice" },
              { word: "News", trap: "Une nouvelle", proper: "Some news" },
              { word: "Furniture", trap: "Des meubles", proper: "Some furniture" },
              { word: "Luggage", trap: "Des bagages", proper: "Some luggage" },
              { word: "Bread", trap: "Un pain", proper: "Some bread" },
              { word: "Work", trap: "Un travail", proper: "Some work / A job" },
              { word: "Traffic", trap: "Des embouteillages", proper: "Heavy traffic" },
              { word: "Progress", trap: "Des progrès", proper: "Some progress" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-red-500/50 transition-colors group">
                <p className="text-white font-black text-xl mb-2 group-hover:text-red-400 transition-colors">{item.word}</p>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between text-slate-500">
                    <span>🇫🇷</span>
                    <span className="line-through decoration-red-500">{item.trap}</span>
                  </p>
                  <p className="flex justify-between text-emerald-400 font-bold border-t border-slate-700 pt-1 mt-1">
                    <span>🇬🇧</span>
                    <span>{item.proper}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30 text-center">
            <p className="text-indigo-300 text-sm">
              <strong>L'Astuce de Secours :</strong> Si vous voulez vraiment compter (ex: "J'ai deux conseils"), utilisez une unité de mesure :
              <br />
              <span className="font-mono text-white mt-1 block">"I have two <span className="text-amber-400 font-bold">pieces of</span> advice."</span>
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Validation des Connaissances",
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
              question: "Do you have ___ brothers?",
              options: ["some", "much", "any", "a"],
              correctAnswer: 2,
              explanation: "Question standard (?) ➔ ANY.",
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
              question: "Can I have ___ water please?",
              options: ["any", "some", "much", "no"],
              correctAnswer: 1,
              explanation: "Exception de Politesse (Demande de service) ➔ SOME.",
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
              question: "Do you have ___ friends within the company?",
              options: ["much", "many", "a lot", "some"],
              correctAnswer: 1,
              explanation: "Question + Pluriel (Friends) ➔ MANY.",
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
              options: ["some", "any", "no", "much"],
              correctAnswer: 1,
              explanation: "Without implique une négation ➔ ANY.",
            },
          ]}
        />
      )
    }
  ],
};