import { LessonContent, LessonSection, PlaceholderContent } from "@/lib/courses/types";
import { Quiz } from "@/components/courses/quiz";
import { AlertIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ReactNode } from "react";

export const course20: LessonContent = {
  courseNumber: 20,
  title: "Lier ses idées (Logical Connectors)",
  objective: "Relier ses idées avec précision : condition, précaution, cause, conséquence, simultanéité et opposition.",
  sections: [
    {
      title: "1. La Cause (Why?)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Pour expliquer "Pourquoi", <strong className="text-emerald-400">BECAUSE</strong> est le standard. Mais pour varier votre style, voici d'autres options.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-emerald-500">
              <h4 className="text-emerald-400 font-bold mb-2">BECAUSE + Sujet + Verbe</h4>
              <p className="text-sm text-slate-300 mb-2">Standard.</p>
              <p className="text-white italic">"We stayed inside <strong className="text-emerald-400">because</strong> it <span className="underline">was raining</span>."</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border-l-4 border-emerald-600">
              <h4 className="text-emerald-500 font-bold mb-2">BECAUSE OF + Nom</h4>
              <p className="text-sm text-slate-300 mb-2">Préposition (à cause de).</p>
              <p className="text-white italic">"We stayed inside <strong className="text-emerald-500">because of</strong> <span className="underline">the rain</span>."</p>
            </div>
          </div>

          {/* Vocabulary Booster: Cause */}
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
              <span>🚀</span> Vocabulary Booster : Variantes de Cause
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-emerald-300 block mb-1">DUE TO / OWING TO (+ Nom)</strong>
                <p className="text-slate-400 text-xs">Plus formel que "Because of".</p>
                <p className="text-white italic text-xs">"<strong className="text-emerald-300">Due to</strong> the delay, we missed the flight."</p>
              </div>
              <div>
                <strong className="text-emerald-300 block mb-1">THANKS TO (+ Nom)</strong>
                <p className="text-slate-400 text-xs">Cause positive ("Grâce à").</p>
                <p className="text-white italic text-xs">"<strong className="text-emerald-300">Thanks to</strong> you, I passed."</p>
              </div>
              <div>
                <strong className="text-emerald-300 block mb-1">SINCE / AS (+ Phrase)</strong>
                <p className="text-slate-400 text-xs">"Puisque" / "Comme" (Souvent au début).</p>
                <p className="text-white italic text-xs">"<strong className="text-emerald-300">Since</strong> you are here, help me."</p>
              </div>
              <div>
                <strong className="text-emerald-300 block mb-1">ON ACCOUNT OF (+ Nom)</strong>
                <p className="text-slate-400 text-xs">Très formel ("En raison de").</p>
                <p className="text-white italic text-xs">"<strong className="text-emerald-300">On account of</strong> the weather..."</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Le Résultat (So)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Le roi est <strong className="text-yellow-400">SO</strong>, mais le vocabulaire académique en a d'autres.
          </p>
          <div className="bg-slate-800 p-4 rounded border-l-4 border-yellow-500">
            <p className="text-white text-lg font-medium">"Cause" ➔ <strong className="text-yellow-400">SO</strong> ➔ "Conséquence"</p>
            <p className="text-slate-400 mt-2 text-sm italic">"I was tired, <strong className="text-yellow-400">so</strong> I went to bed early."</p>
          </div>

          {/* Vocabulary Booster: Result */}
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
              <span>🚀</span> Vocabulary Booster : Variantes de Résultat
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-yellow-300 block mb-1">THEREFORE (Donc)</strong>
                <p className="text-slate-400 text-xs">Formel, logique mathématique.</p>
                <p className="text-white italic text-xs">"I think, <strong className="text-yellow-300">therefore</strong> I am."</p>
              </div>
              <div>
                <strong className="text-yellow-300 block mb-1">AS A RESULT / CONSEQUENTLY</strong>
                <p className="text-slate-400 text-xs">Pour marquer une conséquence directe.</p>
                <p className="text-white italic text-xs">"He didn't study. <strong className="text-yellow-300">Consequently</strong>, he failed."</p>
              </div>
              <div>
                <strong className="text-yellow-300 block mb-1">THUS / HENCE</strong>
                <p className="text-slate-400 text-xs">Très formel / Académique ("Ainsi").</p>
                <p className="text-white italic text-xs">"It is late, <strong className="text-yellow-300">hence</strong> the empty streets."</p>
              </div>
              <div>
                <strong className="text-yellow-300 block mb-1">THAT'S WHY (C'est pourquoi)</strong>
                <p className="text-slate-400 text-xs">Plus oral / explicatif.</p>
                <p className="text-white italic text-xs">"I was sick. <strong className="text-yellow-300">That's why</strong> I didn't come."</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. L'Opposition (The Contrast Hierarchy)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Au-delà de "But", voici comment exprimer un contraste élégant.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded border-l-4 border-purple-500">
              <h4 className="text-purple-400 font-bold mb-1">ALTHOUGH / EVEN THOUGH</h4>
              <p className="text-xs text-slate-400 uppercase font-bold mb-2">RÈGLE : + SUJET + VERBE</p>
              <ul className="text-sm text-slate-300 mt-2 list-disc ml-4">
                <li>"<strong className="text-purple-400">Although</strong> it rained, we played."</li>
                <li>"<strong className="text-purple-400">Even though</strong> I was tired, I ran." (Plus fort)</li>
              </ul>
            </div>

            <div className="bg-slate-900 p-4 rounded border-l-4 border-red-500">
              <h4 className="text-red-400 font-bold mb-1">IN SPITE OF / DESPITE</h4>
              <p className="text-xs text-slate-400 uppercase font-bold mb-2">RÈGLE : + NOM (ou -ING)</p>
              <ul className="text-sm text-slate-300 mt-2 list-disc ml-4">
                <li>"<strong className="text-red-400">In spite of</strong> the rain, we played."</li>
                <li>"<strong className="text-red-400">Despite</strong> being tired, I ran."</li>
              </ul>
            </div>

            <div className="bg-slate-800 p-3 rounded border border-blue-500/30">
              <h4 className="text-blue-400 font-bold text-sm mb-1">Astuce Pro : "THOUGH" final</h4>
              <p className="text-slate-400 text-xs">Utilisé à l'oral en fin de phrase pour dire "Par contre" ou "Quand même".</p>
              <p className="text-white italic text-sm mt-1">"The hotel is expensive. It's nice <strong className="text-blue-400">though</strong>."</p>
            </div>
          </div>

          {/* Vocabulary Booster: Contrast */}
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
              <span>🚀</span> Vocabulary Booster : Variantes d'Opposition
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-purple-300 block mb-1">HOWEVER (Cependant)</strong>
                <p className="text-slate-400 text-xs">Le classique (Début phrase).</p>
                <p className="text-white italic text-xs">"It's raining. <strong className="text-purple-300">However</strong>, I smile."</p>
              </div>
              <div>
                <strong className="text-purple-300 block mb-1">NEVERTHELESS</strong>
                <p className="text-slate-400 text-xs">Très formel ("Néanmoins").</p>
              </div>
              <div>
                <strong className="text-purple-300 block mb-1">WHEREAS / WHILE</strong>
                <p className="text-slate-400 text-xs">Comparaison directe.</p>
                <p className="text-white italic text-xs">"I am tall, <strong className="text-purple-300">whereas</strong> you are short."</p>
              </div>
              <div>
                <strong className="text-purple-300 block mb-1">YET (Pourtant)</strong>
                <p className="text-slate-400 text-xs">Court et fort.</p>
                <p className="text-white italic text-xs">"Simple, <strong className="text-purple-300">yet</strong> effective."</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. La Condition (The Deal)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Au-delà de "If", voici les conditions strictes.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-900 p-4 rounded border-l-4 border-orange-500">
              <h4 className="text-orange-400 font-bold mb-1">UNLESS (À moins que / Sauf si)</h4>
              <p className="text-slate-300 text-sm">"Unless" = "Except if". Il contient déjà une idée négative.</p>
              <p className="text-white italic mt-2">"You can't enter <strong className="text-orange-400">unless</strong> you are a member."</p>
            </div>
            <div className="bg-slate-900 p-4 rounded border-l-4 border-green-500">
              <h4 className="text-green-400 font-bold mb-1">PROVIDED / AS LONG AS (Tant que)</h4>
              <p className="text-slate-300 text-sm">Impouse une condition stricte.</p>
              <p className="text-white italic mt-2">"You can come <strong className="text-green-400">as long as</strong> you are quiet."</p>
            </div>
          </div>

          {/* Vocabulary Booster: Condition */}
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
              <span>🚀</span> Vocabulary Booster : Variantes de Condition
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-orange-300 block mb-1">OTHERWISE (Sinon)</strong>
                <p className="text-slate-400 text-xs">"Hurry up, <strong className="text-orange-300">otherwise</strong> you'll be late."</p>
              </div>
              <div>
                <strong className="text-orange-300 block mb-1">SUPPOSE / SUPPOSING (Et si...)</strong>
                <p className="text-slate-400 text-xs">"<strong className="text-orange-300">Suppose</strong> you win the lottery?"</p>
              </div>
              <div>
                <strong className="text-orange-300 block mb-1">ON CONDITION THAT</strong>
                <p className="text-slate-400 text-xs">Très strict/contractuel.</p>
              </div>
              <div>
                <strong className="text-orange-300 block mb-1">EVEN IF (Même si)</strong>
                <p className="text-slate-400 text-xs">"<strong className="text-orange-300">Even if</strong> it rains, I will go."</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "5. La Précaution (In Case vs If)",
      content: (
        <div className="space-y-6">
          <div className="bg-red-900/20 p-4 rounded border border-red-500/50">
            <h4 className="text-red-400 font-bold mb-2 uppercase flex items-center gap-2">
              <span>⚠️</span> NUANCE CRITIQUE
            </h4>
            <p className="text-slate-300 text-sm mb-4">
              Ne confondez pas <strong className="text-white">IF</strong> (Si ça arrive) et <strong className="text-white">IN CASE</strong> (Au cas où / Prévention).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900 p-3 rounded">
                <strong className="text-blue-400 block mb-1">IF (Si)</strong>
                <p className="text-slate-400 mb-2">J'attends que l'événement arrive pour agir.</p>
                <p className="text-white italic">"I'll buy food <strong className="text-blue-400">if</strong> Tom comes."</p>
                <p className="text-xs text-slate-500 mt-1">(Si Tom ne vient pas, j'achète rien).</p>
              </div>
              <div className="bg-slate-900 p-3 rounded">
                <strong className="text-orange-400 block mb-1">IN CASE (Au cas où)</strong>
                <p className="text-slate-400 mb-2">J'agis MAINTENANT par précaution.</p>
                <p className="text-white italic">"I'll buy food <strong className="text-orange-400">in case</strong> Tom comes."</p>
                <p className="text-xs text-slate-500 mt-1">(J'achète la nourriture maintenant, qu'il vienne ou pas).</p>
              </div>
            </div>
          </div>

          {/* Vocabulary Booster: Precaution */}
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
              <span>🚀</span> Vocabulary Booster : Precaution
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-red-300 block mb-1">JUST IN CASE (Au cas où)</strong>
                <p className="text-slate-400 text-xs">Excellente expression courte.</p>
                <p className="text-white italic text-xs">"Take a key, <strong className="text-red-300">just in case</strong>."</p>
              </div>
              <div>
                <strong className="text-red-300 block mb-1">FOR FEAR THAT (De peur que)</strong>
                <p className="text-slate-400 text-xs">Très littéraire / Soutenu.</p>
                <p className="text-white italic text-xs">"He ran away <strong className="text-red-300">for fear that</strong> he be seen."</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6. Le Temps (Simultanéité)",
      content: (
        <div className="space-y-6">
          <p className="text-slate-300">
            Pour raconter deux actions en même temps, utilisez <strong className="text-cyan-400">AS</strong>.
          </p>
          <div className="bg-slate-800 p-4 rounded border-l-4 border-cyan-500">
            <h4 className="text-cyan-400 font-bold mb-1">AS (Au moment où...)</h4>
            <p className="text-white italic">"<strong className="text-cyan-400">As</strong> I walked into the room, he left."</p>
            <p className="text-slate-400 text-sm mt-1">= Au moment précis où je suis rentré.</p>
          </div>

          {/* Vocabulary Booster: Time */}
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h4 className="text-slate-200 font-bold mb-3 flex items-center gap-2">
              <span>🚀</span> Vocabulary Booster : Variantes de Temps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-cyan-300 block mb-1">WHILE (Pendant que)</strong>
                <p className="text-slate-400 text-xs">Action longue.</p>
                <p className="text-white italic text-xs">"<strong className="text-cyan-300">While</strong> I was sleeping, it rained."</p>
              </div>
              <div>
                <strong className="text-cyan-300 block mb-1">AS SOON AS / ONCE (Dès que)</strong>
                <p className="text-slate-400 text-xs">Immédiateté.</p>
                <p className="text-white italic text-xs">"<strong className="text-cyan-300">As soon as</strong> I saw him, I smiled."</p>
              </div>
              <div>
                <strong className="text-cyan-300 block mb-1">WHENEVER (N'importe quand)</strong>
                <p className="text-slate-400 text-xs">Répétition / Généralité.</p>
                <p className="text-white italic text-xs">"<strong className="text-cyan-300">Whenever</strong> I go there, it rains."</p>
              </div>
              <div>
                <strong className="text-cyan-300 block mb-1">MEANWHILE (Pendant ce temps)</strong>
                <p className="text-slate-400 text-xs">Connecteur entre deux phrases.</p>
                <p className="text-white italic text-xs">"I was working. <strong className="text-cyan-300">Meanwhile</strong>, he was playing."</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Quiz : The Ultimate Challenge",
      content: (
        <Quiz
          questions={[
            {
              id: 1,
              question: "Take an umbrella ___ it rains.",
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
              question: "I'll draw a map ___ you get lost.",
              options: ["if", "in case"],
              correctAnswer: 1,
              explanation: "Précaution ! Je dessine la carte MAINTENANT 'au cas où'.",
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
              question: "___ I was walking, I saw him.",
              options: ["As", "Because", "So"],
              correctAnswer: 0,
              explanation: "Simultanéité (Au moment où). AS.",
            },
            {
              id: 8,
              question: "It's expensive. It's nice ___.",
              options: ["although", "though", "but"],
              correctAnswer: 1,
              explanation: "Le petit mot de fin pour l'opposition : THOUGH.",
            },
            {
              id: 9,
              question: "___ I entered the room, the phone rang.",
              options: ["Just as", "During", "While"],
              correctAnswer: 0,
              explanation: "'Just as' marque une action ponctuelle simultanée.",
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
