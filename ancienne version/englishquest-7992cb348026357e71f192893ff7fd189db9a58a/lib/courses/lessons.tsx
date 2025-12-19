/**
 * Contenu des cours de grammaire
 * Toutes les explications sont en français, seuls les exemples sont en anglais
 */

import { ReactNode } from "react";

export type LessonContent = {
  courseNumber: number;
  title: string;
  objective: string;
  sections: LessonSection[];
};

export type LessonSection = {
  title: string;
  content: ReactNode;
};

// Note: Le contenu réel sera fourni plus tard. Cette structure sert de template.

export const lessons: Record<number, LessonContent> = {
  1: {
    courseNumber: 1,
    title: "Le verbe BE au présent : am / is / are",
    objective: "Apprendre à utiliser correctement les formes am, is et are du verbe être en anglais.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              Le verbe <strong className="text-cyan-300">BE</strong> (être) est l'un des verbes les plus utilisés en anglais. 
              Il permet de décrire des états, des identités, des caractéristiques et des localisations.
            </p>
            <p>
              Contrairement au français où on dit simplement "je suis", "tu es", "il est", 
              l'anglais utilise trois formes différentes selon le sujet : <strong className="text-cyan-300">am</strong>, 
              <strong className="text-cyan-300"> is</strong> ou <strong className="text-cyan-300">are</strong>.
            </p>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-cyan-500/50">
                      <th className="pb-3 pr-4 text-cyan-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-cyan-300 font-bold text-sm uppercase tracking-wide">Forme de BE</th>
                      <th className="pb-3 pr-4 text-cyan-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 text-cyan-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I</td>
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">am</td>
                      <td className="py-3 italic text-slate-300">I am a student.</td>
                      <td className="py-3 text-slate-400">Je suis étudiant.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">You</td>
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">are</td>
                      <td className="py-3 italic text-slate-300">You are my friend.</td>
                      <td className="py-3 text-slate-400">Tu es mon ami.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">He / She / It</td>
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">is</td>
                      <td className="py-3 italic text-slate-300">He is happy. / She is here. / It is cold.</td>
                      <td className="py-3 text-slate-400">Il est heureux. / Elle est ici. / Il fait froid.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">We / You / They</td>
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">are</td>
                      <td className="py-3 italic text-slate-300">We are ready. / They are students.</td>
                      <td className="py-3 text-slate-400">Nous sommes prêts. / Ils sont étudiants.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-cyan-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-indigo-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 flex items-center gap-2">
                    <span className="text-cyan-400 text-lg">✨</span>
                    <strong className="text-white text-lg">État / Caractéristique :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-cyan-300 font-semibold">I am</span> tired. <span className="text-slate-400 italic">(Je suis fatigué.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-cyan-300 font-semibold">She is</span> intelligent. <span className="text-slate-400 italic">(Elle est intelligente.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-cyan-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-cyan-300 font-semibold">They are</span> friendly. <span className="text-slate-400 italic">(Ils sont amicaux.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-indigo-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 flex items-center gap-2">
                    <span className="text-indigo-400 text-lg">👤</span>
                    <strong className="text-white text-lg">Identité / Profession :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-indigo-300 font-semibold">I am</span> a teacher. <span className="text-slate-400 italic">(Je suis professeur.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-indigo-300 font-semibold">He is</span> my brother. <span className="text-slate-400 italic">(Il est mon frère.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-indigo-300 font-semibold">We are</span> students. <span className="text-slate-400 italic">(Nous sommes étudiants.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-purple-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 flex items-center gap-2">
                    <span className="text-purple-400 text-lg">📍</span>
                    <strong className="text-white text-lg">Localisation :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-purple-300 font-semibold">I am</span> at home. <span className="text-slate-400 italic">(Je suis à la maison.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-purple-300 font-semibold">The book is</span> on the table. <span className="text-slate-400 italic">(Le livre est sur la table.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-purple-300 font-semibold">They are</span> in Paris. <span className="text-slate-400 italic">(Ils sont à Paris.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li>Le verbe BE est toujours présent dans une phrase qui décrit un état ou une caractéristique.</li>
              <li>La forme change selon le sujet : <span className="font-mono text-cyan-300">am</span> pour "I", 
                  <span className="font-mono text-cyan-300"> is</span> pour "he/she/it", 
                  <span className="font-mono text-cyan-300"> are</span> pour "we/you/they".</li>
            </ul>
            <div className="comic-panel bg-emerald-950/30 border-2 border-emerald-500/50 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">À retenir</h4>
                  <p className="text-slate-200 text-outline leading-relaxed">
                    On peut contracter le verbe BE : <span className="font-mono text-cyan-300">I'm</span>, 
                    <span className="font-mono text-cyan-300"> you're</span>, 
                    <span className="font-mono text-cyan-300"> he's</span>, 
                    <span className="font-mono text-cyan-300"> she's</span>, 
                    <span className="font-mono text-cyan-300"> it's</span>, 
                    <span className="font-mono text-cyan-300"> we're</span>, 
                    <span className="font-mono text-cyan-300"> they're</span>. 
                    Les contractions sont très courantes à l'oral et à l'écrit informel.
                  </p>
                </div>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  2: {
    courseNumber: 2,
    title: "Le verbe BE : questions et réponses courtes",
    objective: "Apprendre à poser des questions avec BE et à y répondre de manière courte.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              Pour poser une question avec le verbe <strong className="text-cyan-300">BE</strong>, 
              on place simplement le verbe avant le sujet. C'est beaucoup plus simple qu'en français !
            </p>
            <p>
              Les réponses courtes permettent de répondre rapidement sans répéter toute la phrase.
            </p>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
              <div className="relative z-10">
                <p className="text-slate-100 mb-4 font-semibold text-lg">Structure de la question :</p>
                <div className="space-y-3 text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">→</span>
                    <p><span className="font-mono text-cyan-300 font-bold text-lg">Am I</span> ... ? <span className="text-slate-400 text-sm">(Suis-je ... ?)</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">→</span>
                    <p><span className="font-mono text-cyan-300 font-bold text-lg">Are you</span> ... ? <span className="text-slate-400 text-sm">(Es-tu / Êtes-vous ... ?)</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">→</span>
                    <p><span className="font-mono text-cyan-300 font-bold text-lg">Is he / she / it</span> ... ? <span className="text-slate-400 text-sm">(Est-il / Est-elle / Est-ce ... ?)</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold">→</span>
                    <p><span className="font-mono text-cyan-300 font-bold text-lg">Are we / you / they</span> ... ? <span className="text-slate-400 text-sm">(Sommes-nous / Êtes-vous / Sont-ils ... ?)</span></p>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 opacity-50" />
              <div className="relative z-10">
                <p className="text-slate-100 mb-3 font-semibold text-lg">Réponses courtes :</p>
                <p className="text-slate-300 mb-4 text-sm italic">
                  Les réponses courtes permettent de répondre rapidement sans répéter toute la phrase. 
                  On utilise <span className="font-semibold text-cyan-300">Yes</span> ou <span className="font-semibold text-amber-300">No</span>, 
                  suivi du sujet et de la forme appropriée de BE.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="comic-panel border-2 border-cyan-500/40 p-4"
                       style={{
                         background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)",
                       }}>
                    <p className="text-cyan-300 font-semibold mb-3 text-lg">Affirmatif :</p>
                    <ul className="space-y-2 text-slate-200">
                      <li className="flex items-center gap-2">Yes, <span className="font-mono text-cyan-300 font-bold">I am</span>.</li>
                      <li className="flex items-center gap-2">Yes, <span className="font-mono text-cyan-300 font-bold">you are</span>.</li>
                      <li className="flex items-center gap-2">Yes, <span className="font-mono text-cyan-300 font-bold">he / she / it is</span>.</li>
                      <li className="flex items-center gap-2">Yes, <span className="font-mono text-cyan-300 font-bold">we / you / they are</span>.</li>
                    </ul>
                  </div>
                  <div className="comic-panel border-2 border-amber-500/40 p-4"
                       style={{
                         background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%)",
                       }}>
                    <p className="text-amber-300 font-semibold mb-3 text-lg">Négatif :</p>
                    <ul className="space-y-2 text-slate-200">
                      <li className="flex items-center gap-2">No, <span className="font-mono text-amber-300 font-bold">I'm not</span>.</li>
                      <li className="flex items-center gap-2">No, <span className="font-mono text-amber-300 font-bold">you aren't</span>.</li>
                      <li className="flex items-center gap-2">No, <span className="font-mono text-amber-300 font-bold">he / she / it isn't</span>.</li>
                      <li className="flex items-center gap-2">No, <span className="font-mono text-amber-300 font-bold">we / you / they aren't</span>.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-indigo-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 flex items-center gap-2">
                    <span className="text-indigo-400 text-lg">❓</span>
                    <strong className="text-white text-lg">Questions :</strong>
                  </p>
                  <ul className="list-none space-y-3 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-indigo-300 font-semibold">Are you</span> ready? <span className="text-slate-400">→</span> Oui, <span className="font-mono text-cyan-300 font-semibold">I am</span>. / Non, <span className="font-mono text-amber-300 font-semibold">I'm not</span>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-indigo-300 font-semibold">Is she</span> a teacher? <span className="text-slate-400">→</span> Oui, <span className="font-mono text-cyan-300 font-semibold">she is</span>. / Non, <span className="font-mono text-amber-300 font-semibold">she isn't</span>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-indigo-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-indigo-300 font-semibold">Are they</span> at home? <span className="text-slate-400">→</span> Oui, <span className="font-mono text-cyan-300 font-semibold">they are</span>. / Non, <span className="font-mono text-amber-300 font-semibold">they aren't</span>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li>Pour poser une question, on inverse simplement le sujet et le verbe BE.</li>
            </ul>
            <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/50 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Attention</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    Dans les réponses courtes, on utilise toujours la forme complète après "Yes" : 
                    <span className="font-mono text-cyan-300"> Yes, I am</span> (pas "Yes, I'm").
                  </p>
                  <p className="text-slate-200 text-outline leading-relaxed">
                    Dans les réponses courtes négatives, on peut utiliser la forme contractée : 
                    <span className="font-mono text-amber-300"> No, I'm not</span>.
                  </p>
                </div>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  3: {
    courseNumber: 3,
    title: "Present Simple : forme affirmative",
    objective: "Apprendre à utiliser le présent simple pour parler de routines, habitudes et vérités générales.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              Le <strong className="text-cyan-300">Present Simple</strong> (présent simple) est utilisé pour exprimer ce qui est vrai en général, 
              pas ce qui est en train de se passer maintenant.
            </p>
            <p className="mb-4">
              On l'utilise pour exprimer :
            </p>
            <div className="space-y-3 mb-4">
              <div className="comic-panel border-2 border-purple-500/30 p-4"
                   style={{
                     background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
                   }}>
                <p className="text-slate-200">
                  <strong className="text-white">1. Des habitudes et des routines quotidiennes</strong>
                </p>
              </div>
              <div className="comic-panel border-2 border-purple-500/30 p-4"
                   style={{
                     background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
                   }}>
                <p className="text-slate-200">
                  <strong className="text-white">2. Des vérités générales et des faits permanents</strong>
                </p>
              </div>
              <div className="comic-panel border-2 border-purple-500/30 p-4"
                   style={{
                     background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)",
                   }}>
                <p className="text-slate-200">
                  <strong className="text-white">3. Des préférences et des goûts</strong>
                </p>
              </div>
            </div>
            <p>
              C'est le temps le plus utilisé en anglais pour parler du présent !
            </p>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-xl text-outline">Règle essentielle : la marque de 3e personne du singulier</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-3">
                    À la 3e personne du singulier (<span className="font-mono text-cyan-300 font-bold">he / she / it</span>), 
                    on ajoute <strong className="text-red-300 text-xl">TOUJOURS</strong> une marque à la fin du verbe : 
                    généralement <strong className="text-red-300 text-xl">-s</strong>, mais parfois <strong className="text-red-300 text-xl">-es</strong> ou <strong className="text-red-300 text-xl">-ies</strong>.
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-4 mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="comic-panel bg-cyan-950/30 border-2 border-cyan-500/40 p-3">
                        <p className="text-slate-300 mb-2 font-semibold text-white">I / You / We / They :</p>
                        <p className="font-mono text-cyan-300 font-bold text-lg mb-1">verbe (base)</p>
                        <p className="text-slate-400 italic text-xs">I work / You work / They work</p>
                        <p className="text-slate-400 italic text-xs mt-1">❌ PAS de marque</p>
                      </div>
                      <div className="comic-panel bg-red-950/30 border-2 border-red-500/50 p-3">
                        <p className="text-slate-300 mb-2 font-semibold text-white">He / She / It :</p>
                        <p className="font-mono text-red-300 font-bold text-lg mb-1">verbe + marque</p>
                        <p className="text-slate-400 italic text-xs">He works / She goes / It studies</p>
                        <p className="text-red-300 font-bold text-xs mt-1">✅ OBLIGATOIRE : -s, -es ou -ies</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-50" />
              <div className="relative z-10">
                <p className="text-slate-100 mb-4 font-semibold text-lg">Tableau récapitulatif :</p>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-purple-500/50">
                      <th className="pb-3 pr-4 text-purple-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-purple-300 font-bold text-sm uppercase tracking-wide">Forme du verbe</th>
                      <th className="pb-3 text-purple-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I / You / We / They</td>
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">verbe (base)</td>
                      <td className="py-3 italic text-slate-300">I work. / They play.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        <span className="text-red-300 font-bold">He / She / It</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">
                        verbe + marque<br/>
                        <span className="text-sm">(-s, -es ou -ies)</span>
                      </td>
                      <td className="py-3 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">He works.</span> / <span className="font-mono text-red-300 font-semibold">She goes.</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel border-2 border-cyan-500/40 p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)",
                 }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-400" />
              <div className="relative z-10 pl-4">
                <p className="text-slate-100 mb-3 font-semibold text-lg text-white">Exemples comparatifs :</p>
                <div className="space-y-3 text-slate-200">
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-sm">
                      <span className="font-mono text-cyan-300">I like</span> pizza. 
                      <span className="text-slate-400"> → </span>
                      <span className="font-mono text-red-300 font-bold">She likes</span> pizza. 
                      <span className="text-slate-400 italic">(Elle aime la pizza - avec -s !)</span>
                    </p>
                  </div>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-sm">
                      <span className="font-mono text-cyan-300">You play</span> football. 
                      <span className="text-slate-400"> → </span>
                      <span className="font-mono text-red-300 font-bold">He plays</span> football. 
                      <span className="text-slate-400 italic">(Il joue au foot - avec -s !)</span>
                    </p>
                  </div>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-sm">
                      <span className="font-mono text-cyan-300">We go</span> to school. 
                      <span className="text-slate-400"> → </span>
                      <span className="font-mono text-red-300 font-bold">The bus goes</span> to school. 
                      <span className="text-slate-400 italic">(Le bus va à l'école - avec -s !)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel border-2 border-purple-500/40 p-5 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                 }}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400" />
              <div className="relative z-10 pl-4">
                <p className="text-slate-100 mb-3 font-semibold text-lg">Règles pour la marque de 3e personne :</p>
                <div className="space-y-3">
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-slate-200 mb-2">
                      <strong className="text-white">1. La plupart des verbes :</strong> on ajoute <span className="font-mono text-purple-300 font-bold">-s</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <span className="font-mono text-purple-300">work → works</span> / 
                      <span className="font-mono text-purple-300"> play → plays</span> / 
                      <span className="font-mono text-purple-300"> like → likes</span>
                    </p>
                  </div>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-slate-200 mb-2">
                      <strong className="text-white">2. Verbes en -s, -sh, -ch, -x, -o :</strong> on ajoute <span className="font-mono text-purple-300 font-bold">-es</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <span className="font-mono text-purple-300">go → goes</span> / 
                      <span className="font-mono text-purple-300"> watch → watches</span> / 
                      <span className="font-mono text-purple-300"> fix → fixes</span> / 
                      <span className="font-mono text-purple-300"> do → does</span>
                    </p>
                  </div>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-slate-200 mb-2">
                      <strong className="text-white">3. Verbes en -y après consonne :</strong> on change <span className="font-mono text-purple-300 font-bold">-y</span> en <span className="font-mono text-purple-300 font-bold">-ies</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <span className="font-mono text-purple-300">study → studies</span> / 
                      <span className="font-mono text-purple-300"> cry → cries</span> / 
                      <span className="font-mono text-purple-300"> try → tries</span>
                    </p>
                  </div>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                    <p className="text-slate-200 mb-2">
                      <strong className="text-white">4. Verbes en -y après voyelle :</strong> on ajoute simplement <span className="font-mono text-purple-300 font-bold">-s</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                      <span className="font-mono text-purple-300">play → plays</span> / 
                      <span className="font-mono text-purple-300"> enjoy → enjoys</span> / 
                      <span className="font-mono text-purple-300"> stay → stays</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-purple-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>1. Routines / Habitudes :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-purple-300 font-semibold">I wake up</span> at 7 AM every day. <span className="text-slate-400 italic">(Je me réveille à 7h tous les jours.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-purple-300 font-semibold">She goes</span> to school by bus. <span className="text-slate-400 italic">(Elle va à l'école en bus.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-purple-300 font-semibold">We play</span> football on Saturdays. <span className="text-slate-400 italic">(Nous jouons au foot le samedi.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-rose-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(251, 113, 133, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-400 to-pink-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>2. Vérités générales :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-rose-300 font-semibold">The sun rises</span> in the east. <span className="text-slate-400 italic">(Le soleil se lève à l'est.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-rose-300 font-semibold">Water boils</span> at 100°C. <span className="text-slate-400 italic">(L'eau bout à 100°C.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-rose-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-rose-300 font-semibold">Birds fly</span>. <span className="text-slate-400 italic">(Les oiseaux volent.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-pink-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 63, 94, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-400 to-rose-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>3. Préférences et goûts :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-pink-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-pink-300 font-semibold">I like</span> chocolate. <span className="text-slate-400 italic">(J'aime le chocolat.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-pink-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-pink-300 font-semibold">She loves</span> reading. <span className="text-slate-400 italic">(Elle adore lire.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-pink-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-pink-300 font-semibold">They prefer</span> tea to coffee. <span className="text-slate-400 italic">(Ils préfèrent le thé au café.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-emerald-950/30 border-2 border-emerald-500/50 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">À retenir</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    Le Present Simple est souvent accompagné d'adverbes de fréquence : 
                    <span className="font-mono text-cyan-300"> always</span>, 
                    <span className="font-mono text-cyan-300"> usually</span>, 
                    <span className="font-mono text-cyan-300"> often</span>, 
                    <span className="font-mono text-cyan-300"> sometimes</span>, 
                    <span className="font-mono text-cyan-300"> never</span>.
                  </p>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    <strong>Placement des adverbes de fréquence :</strong> En général, on les place avant le verbe, 
                    sauf avec <span className="font-mono text-cyan-300">BE</span> où ils viennent après.
                  </p>
                  <p className="text-slate-200 text-outline leading-relaxed">
                    On utilise aussi des expressions temporelles : 
                    <span className="font-mono text-cyan-300"> every day</span>, 
                    <span className="font-mono text-cyan-300"> on Mondays</span>, 
                    <span className="font-mono text-cyan-300"> in the morning</span>.
                  </p>
                </div>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  4: {
    courseNumber: 4,
    title: "Present Simple : négation et questions",
    objective: "Apprendre à former les phrases négatives et les questions au présent simple avec les verbes ordinaires.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              Pour exprimer la <strong className="text-cyan-300">négation</strong> et les <strong className="text-cyan-300">questions</strong> 
              au Present Simple avec les <strong>verbes ordinaires</strong> (work, like, play, etc.), on utilise 
              <span className="font-mono text-cyan-300"> do</span> / <span className="font-mono text-cyan-300"> don't</span> 
              et <span className="font-mono text-cyan-300"> does</span> / <span className="font-mono text-cyan-300"> doesn't</span>.
            </p>
            <div className="comic-panel border-2 border-amber-500/30 p-4 mb-4"
                 style={{
                   background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)",
                 }}>
              <p className="text-slate-200">
                <strong className="text-white">Important :</strong> Cette leçon concerne les verbes ordinaires. 
                Les verbes <span className="font-mono text-cyan-300">BE</span>, <span className="font-mono text-cyan-300"> can</span>, 
                <span className="font-mono text-cyan-300"> have got</span> ont leurs propres règles pour les questions et la négation 
                (voir les cours précédents et suivants).
              </p>
            </div>
            <p>
              La <strong className="text-red-300">clé</strong> : à la 3e personne du singulier (he/she/it), 
              <span className="font-mono text-red-300 font-bold"> don't</span> devient 
              <span className="font-mono text-red-300 font-bold"> doesn't</span> !
            </p>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <h3 className="text-slate-100 mb-4 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Négation</h3>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 mb-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Important :</strong> Après <span className="font-mono text-cyan-300">do</span>, 
                <span className="font-mono text-cyan-300"> does</span>, <span className="font-mono text-cyan-300"> don't</span> ou 
                <span className="font-mono text-cyan-300"> doesn't</span>, le verbe reprend <strong className="text-amber-300">toujours</strong> sa forme de base (sans -s) !
              </p>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
              <div className="relative z-10">
                <div className="space-y-4 text-slate-200">
                  <div className="comic-panel border-2 border-cyan-500/30 p-4"
                       style={{
                         background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
                       }}>
                    <p className="mb-2">
                      <span className="font-mono text-cyan-300 font-bold text-lg">I / You / We / They</span> + 
                      <span className="font-mono text-red-300 font-bold text-lg"> don't</span> + verbe (base)
                    </p>
                    <p className="text-slate-400 italic text-sm">Exemple : I don't like coffee. / They don't play football.</p>
                  </div>
                  <div className="comic-panel border-2 border-red-500/40 p-4"
                       style={{
                         background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                       }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 font-bold text-xl">⚠️</span>
                      <p className="font-semibold text-white">
                        <span className="font-mono text-cyan-300 font-bold text-lg">He / She / It</span> + 
                        <span className="font-mono text-red-300 font-bold text-lg"> doesn't</span> + verbe (base)
                      </p>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      <strong>Attention :</strong> À la 3e personne du singulier, 
                      <span className="font-mono text-red-300 font-bold"> don't</span> devient 
                      <span className="font-mono text-red-300 font-bold"> doesn't</span> (avec un <strong className="text-red-300">-s</strong>) !
                    </p>
                    <p className="text-slate-400 italic text-sm">Exemple : He doesn't work. / She doesn't like tea.</p>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-slate-100 mb-4 mt-8 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Questions</h3>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 mb-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Important :</strong> Après <span className="font-mono text-cyan-300">Do</span> ou 
                <span className="font-mono text-cyan-300"> Does</span>, le verbe reprend <strong className="text-amber-300">toujours</strong> sa forme de base (sans -s) !
              </p>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
              <div className="relative z-10">
                <div className="space-y-4 text-slate-200">
                  <div className="comic-panel border-2 border-cyan-500/30 p-4"
                       style={{
                         background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
                       }}>
                    <p className="mb-2">
                      <span className="font-mono text-cyan-300 font-bold text-lg">Do</span> + 
                      <span className="font-mono text-cyan-300"> I / you / we / they</span> + verbe (base) + ... ?
                    </p>
                    <p className="text-slate-400 italic text-sm">Exemple : Do you like pizza? / Do they speak English?</p>
                  </div>
                  <div className="comic-panel border-2 border-red-500/40 p-4"
                       style={{
                         background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                       }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 font-bold text-xl">⚠️</span>
                      <p className="font-semibold text-white">
                        <span className="font-mono text-cyan-300 font-bold text-lg">Does</span> + 
                        <span className="font-mono text-cyan-300"> he / she / it</span> + verbe (base) + ... ?
                      </p>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      <strong>Attention :</strong> À la 3e personne du singulier, 
                      <span className="font-mono text-cyan-300 font-bold"> Do</span> devient 
                      <span className="font-mono text-cyan-300 font-bold"> Does</span> (avec un <strong className="text-red-300">-s</strong>) !
                    </p>
                    <p className="text-slate-400 italic text-sm">Exemple : Does he work? / Does she like coffee?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel border-2 border-indigo-500/30 p-4 my-4"
                 style={{
                   background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                 }}>
              <p className="text-slate-200 mb-2">
                <strong className="text-white">Rappel :</strong> Les questions avec <span className="font-mono text-cyan-300">BE</span>, 
                <span className="font-mono text-cyan-300"> can</span>, <span className="font-mono text-cyan-300"> have got</span> 
                n'utilisent <strong>pas</strong> <span className="font-mono text-cyan-300"> do/does</span> :
              </p>
              <ul className="list-none space-y-1 text-slate-300 ml-4 text-sm">
                <li>• <span className="font-mono text-cyan-300">Are you</span> ready? (avec BE)</li>
                <li>• <span className="font-mono text-cyan-300">Can you</span> help me? (avec can)</li>
                <li>• <span className="font-mono text-cyan-300">Have you got</span> a pen? (avec have got)</li>
              </ul>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-red-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-orange-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 flex items-center gap-2">
                    <strong className="text-white text-lg">Négation :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">I don't like</span> coffee. <span className="text-slate-400 italic">(Je n'aime pas le café.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">She doesn't work</span> on Sundays. <span className="text-slate-400 italic">(Elle ne travaille pas le dimanche.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">They don't speak</span> French. <span className="text-slate-400 italic">(Ils ne parlent pas français.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-blue-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 flex items-center gap-2">
                    <strong className="text-white text-lg">Questions :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Do you speak</span> English? <span className="text-slate-400 italic">(Parles-tu anglais ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Does she live</span> in Paris? <span className="text-slate-400 italic">(Vit-elle à Paris ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Do they play</span> football? <span className="text-slate-400 italic">(Jouent-ils au foot ?)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/50 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Attention</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">1. Le -s à la 3e personne :</strong> À la 3e personne du singulier 
                        (<span className="font-mono text-cyan-300">he / she / it</span>), 
                        <span className="font-mono text-red-300 font-bold"> don't</span> devient 
                        <span className="font-mono text-red-300 font-bold"> doesn't</span> (avec un <strong className="text-red-300">-s</strong>), 
                        et <span className="font-mono text-cyan-300"> Do</span> devient 
                        <span className="font-mono text-cyan-300"> Does</span>.
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-300 mb-1">I / You / We / They :</p>
                            <p className="font-mono text-cyan-300 font-bold"> don't / Do</p>
                          </div>
                          <div>
                            <p className="text-slate-300 mb-1">He / She / It :</p>
                            <p className="font-mono text-red-300 font-bold"> doesn't / Does</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed">
                        <strong className="text-white">2. Le verbe reprend sa forme de base :</strong> Après 
                        <span className="font-mono text-cyan-300"> do</span>, <span className="font-mono text-cyan-300"> does</span>, 
                        <span className="font-mono text-cyan-300"> don't</span> ou <span className="font-mono text-cyan-300"> doesn't</span>, 
                        le verbe ordinaire reste <strong>toujours</strong> à la base (sans -s) : 
                        <span className="font-mono text-cyan-300"> Does she work</span> (pas "works"), 
                        <span className="font-mono text-cyan-300"> He doesn't like</span> (pas "likes"). 
                        Le -s est déjà dans <span className="font-mono text-cyan-300"> does</span> !
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li><span className="font-mono text-cyan-300"> Do/Does</span> est utilisé uniquement avec les <strong>verbes ordinaires</strong>. 
                  Les verbes <span className="font-mono text-cyan-300"> BE</span>, <span className="font-mono text-cyan-300"> can</span>, 
                  <span className="font-mono text-cyan-300"> have got</span> ont leurs propres règles.</li>
            </ul>
          </>
        ),
      },
    ],
  },
  5: {
    courseNumber: 5,
    title: "Have got : parler de possessions",
    objective: "Apprendre à utiliser have got pour exprimer la possession en anglais.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              <span className="font-mono text-cyan-300 font-bold">Have got</span> (ou <span className="font-mono text-cyan-300">has got</span>) 
              est utilisé pour exprimer la <strong className="text-cyan-300">possession</strong> en anglais britannique.
            </p>
            <p className="mb-4">
              On l'utilise pour parler de ce qu'on possède (objets, famille, caractéristiques, relations).
            </p>
            <div className="comic-panel border-2 border-indigo-500/30 p-4 mb-4"
                 style={{
                   background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                 }}>
              <p className="text-slate-200">
                <strong className="text-white">Note :</strong> En anglais américain, on utilise souvent simplement 
                <span className="font-mono text-cyan-300"> have</span> (I have a car) au lieu de 
                <span className="font-mono text-cyan-300"> have got</span> (I have got a car).
              </p>
            </div>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <h3 className="text-slate-100 mb-4 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Forme affirmative</h3>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-emerald-500/50">
                      <th className="pb-3 pr-4 text-emerald-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-emerald-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 pr-4 text-emerald-300 font-bold text-sm uppercase tracking-wide">Forme contractée</th>
                      <th className="pb-3 text-emerald-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I / You / We / They</td>
                      <td className="py-3 pr-4 italic text-slate-300">I have got a car.</td>
                      <td className="py-3 pr-4 font-mono text-emerald-300 font-bold text-lg">I've got</td>
                      <td className="py-3 text-slate-400">J'ai une voiture.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        <span className="text-red-300 font-bold">He / She / It</span>
                      </td>
                      <td className="py-3 pr-4 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">She has got</span> a cat.
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">She's got</td>
                      <td className="py-3 text-slate-400">Elle a un chat.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Attention : He/She/It → has got</h4>
                  <p className="text-slate-200 text-outline leading-relaxed">
                    À la 3e personne du singulier (<span className="font-mono text-cyan-300 font-bold">he / she / it</span>), 
                    <span className="font-mono text-red-300 font-bold"> have got</span> devient 
                    <span className="font-mono text-red-300 font-bold"> has got</span> (avec un <strong className="text-red-300">-s</strong>) !
                  </p>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 my-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Important :</strong> La contraction <span className="font-mono text-cyan-300">He's got</span> signifie 
                <span className="font-mono text-cyan-300"> He has got</span> (il a), <strong>pas</strong> 
                <span className="font-mono text-cyan-300"> He is got</span> ! 
                <span className="font-mono text-cyan-300"> He's</span> seul peut signifier <span className="font-mono text-cyan-300">He is</span> ou 
                <span className="font-mono text-cyan-300">He has</span>, mais <span className="font-mono text-cyan-300">He's got</span> = toujours 
                <span className="font-mono text-cyan-300">He has got</span>.
              </p>
            </div>
            <h3 className="text-slate-100 mb-4 mt-8 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Forme négative</h3>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-red-500/50">
                      <th className="pb-3 pr-4 text-red-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-red-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 pr-4 text-red-300 font-bold text-sm uppercase tracking-wide">Forme contractée</th>
                      <th className="pb-3 text-red-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I / You / We / They</td>
                      <td className="py-3 pr-4 italic text-slate-300">I haven't got a car.</td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">haven't got</td>
                      <td className="py-3 text-slate-400">Je n'ai pas de voiture.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        <span className="text-red-300 font-bold">He / She / It</span>
                      </td>
                      <td className="py-3 pr-4 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">She hasn't got</span> a cat.
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">hasn't got</td>
                      <td className="py-3 text-slate-400">Elle n'a pas de chat.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <h3 className="text-slate-100 mb-4 mt-8 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Forme interrogative</h3>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-blue-500/50">
                      <th className="pb-3 pr-4 text-blue-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-blue-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 pr-4 text-blue-300 font-bold text-sm uppercase tracking-wide">Forme contractée</th>
                      <th className="pb-3 text-blue-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I / you / we / they</td>
                      <td className="py-3 pr-4 italic text-slate-300">Have you got a pen?</td>
                      <td className="py-3 pr-4 font-mono text-blue-300 font-bold text-lg">Have ... got?</td>
                      <td className="py-3 text-slate-400">As-tu un stylo ?</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        <span className="text-red-300 font-bold">he / she / it</span>
                      </td>
                      <td className="py-3 pr-4 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">Has he got</span> a car?
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">Has ... got?</td>
                      <td className="py-3 text-slate-400">A-t-il une voiture ?</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-emerald-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Affirmatif :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">I've got</span> a new phone. <span className="text-slate-400 italic">(J'ai un nouveau téléphone.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">She has got</span> two brothers. <span className="text-slate-400 italic">(Elle a deux frères.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">He's got</span> blue eyes. <span className="text-slate-400 italic">(Il a les yeux bleus.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">They've got</span> a good teacher. <span className="text-slate-400 italic">(Ils ont un bon professeur.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-red-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-orange-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Négatif :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">I haven't got</span> a car. <span className="text-slate-400 italic">(Je n'ai pas de voiture.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">She hasn't got</span> any siblings. <span className="text-slate-400 italic">(Elle n'a pas de frères et sœurs.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">We haven't got</span> time. <span className="text-slate-400 italic">(Nous n'avons pas le temps.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-blue-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Questions :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Have you got</span> a pen? <span className="text-slate-400 italic">(As-tu un stylo ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Has she got</span> a cat? <span className="text-slate-400 italic">(A-t-elle un chat ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Have they got</span> children? <span className="text-slate-400 italic">(Ont-ils des enfants ?)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-indigo-950/30 border-2 border-indigo-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🌍</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Anglais britannique vs américain</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 mb-2 font-semibold text-white">🇬🇧 Anglais britannique :</p>
                      <p className="text-slate-200 text-sm">
                        <span className="font-mono text-cyan-300">I have got</span> / 
                        <span className="font-mono text-cyan-300"> I've got</span>
                      </p>
                      <p className="text-slate-400 italic text-xs mt-1">(Très courant)</p>
                    </div>
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 mb-2 font-semibold text-white">🇺🇸 Anglais américain :</p>
                      <p className="text-slate-200 text-sm">
                        <span className="font-mono text-cyan-300">I have</span> / 
                        <span className="font-mono text-cyan-300"> I've</span>
                      </p>
                      <p className="text-slate-400 italic text-xs mt-1">(Plus courant)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Pièges à éviter</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">1. Ne pas combiner "have" et "have got" :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm mb-1">
                          ❌ <span className="font-mono text-red-300">Do you have got</span> a pen? 
                          <span className="text-slate-400"> (INCORRECT)</span>
                        </p>
                        <p className="text-slate-300 text-sm">
                          ✅ <span className="font-mono text-green-300">Have you got</span> a pen? 
                          <span className="text-slate-400"> (CORRECT)</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">2. Ne pas utiliser "has got" dans les questions :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm mb-1">
                          ❌ <span className="font-mono text-red-300">She has got</span> a cat? 
                          <span className="text-slate-400"> (INCORRECT comme question)</span>
                        </p>
                        <p className="text-slate-300 text-sm">
                          ✅ <span className="font-mono text-green-300">Has she got</span> a cat? 
                          <span className="text-slate-400"> (CORRECT)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li>Les formes contractées (<span className="font-mono text-cyan-300">I've got</span>, <span className="font-mono text-cyan-300">she's got</span>) sont très courantes à l'oral.</li>
              <li>À la 3e personne du singulier, <span className="font-mono text-cyan-300">have got</span> devient <span className="font-mono text-cyan-300">has got</span>.</li>
              <li>Pour les questions, on place <span className="font-mono text-cyan-300">Have</span> ou <span className="font-mono text-cyan-300">Has</span> avant le sujet.</li>
              <li>Pour la négation, on utilise <span className="font-mono text-cyan-300">haven't got</span> ou <span className="font-mono text-cyan-300">hasn't got</span>.</li>
            </ul>
          </>
        ),
      },
    ],
  },
  6: {
    courseNumber: 6,
    title: "Pronoms et adjectifs possessifs",
    objective: "Apprendre à utiliser correctement les pronoms et adjectifs possessifs en anglais.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              Les <strong className="text-cyan-300">adjectifs possessifs</strong> indiquent à qui appartient quelque chose. 
              Ils sont placés <strong>avant un nom</strong> : 
              <span className="font-mono text-cyan-300"> my book</span>, <span className="font-mono text-cyan-300">your car</span>, 
              <span className="font-mono text-cyan-300">his house</span>, etc.
            </p>
            <p className="mb-4">
              Les <strong className="text-cyan-300">pronoms possessifs</strong> <strong>remplacent un groupe nominal</strong> déjà mentionné. 
              Ils évitent la répétition : 
              <span className="font-mono text-cyan-300"> my book</span> → <span className="font-mono text-cyan-300">mine</span>, 
              <span className="font-mono text-cyan-300">your pen</span> → <span className="font-mono text-cyan-300">yours</span>, etc.
            </p>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 mb-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Règle essentielle :</strong> Le possessif dépend du <strong className="text-amber-300">possesseur</strong> (celui qui possède), 
                <strong>pas</strong> de la chose possédée ! 
                <span className="font-mono text-cyan-300"> her cat</span> = le chat d'<strong>elle</strong> (pas "son chat" au sens masculin), 
                <span className="font-mono text-cyan-300"> his cat</span> = le chat de <strong>lui</strong>.
              </p>
            </div>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <h3 className="text-slate-100 mb-4 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Adjectifs possessifs</h3>
            <p className="text-slate-200 mb-4 text-outline">
              Les adjectifs possessifs sont placés <strong>avant un nom</strong> pour indiquer à qui appartient quelque chose.
            </p>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-violet-500/50">
                      <th className="pb-3 pr-4 text-violet-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-violet-300 font-bold text-sm uppercase tracking-wide">Adjectif possessif</th>
                      <th className="pb-3 pr-4 text-violet-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 text-violet-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I</td>
                      <td className="py-3 pr-4 font-mono text-violet-300 font-bold text-lg">my</td>
                      <td className="py-3 italic text-slate-300">my book</td>
                      <td className="py-3 text-slate-400">mon livre</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">You</td>
                      <td className="py-3 pr-4 font-mono text-violet-300 font-bold text-lg">your</td>
                      <td className="py-3 italic text-slate-300">your car</td>
                      <td className="py-3 text-slate-400">ta voiture</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">He</td>
                      <td className="py-3 pr-4 font-mono text-violet-300 font-bold text-lg">his</td>
                      <td className="py-3 italic text-slate-300">his house</td>
                      <td className="py-3 text-slate-400">sa maison</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">She</td>
                      <td className="py-3 pr-4 font-mono text-violet-300 font-bold text-lg">her</td>
                      <td className="py-3 italic text-slate-300">her bag</td>
                      <td className="py-3 text-slate-400">son sac</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        <span className="text-red-300 font-bold">It</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">its</td>
                      <td className="py-3 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">its</span> tail
                      </td>
                      <td className="py-3 text-slate-400">sa queue</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">We</td>
                      <td className="py-3 pr-4 font-mono text-violet-300 font-bold text-lg">our</td>
                      <td className="py-3 italic text-slate-300">our school</td>
                      <td className="py-3 text-slate-400">notre école</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">They</td>
                      <td className="py-3 pr-4 font-mono text-violet-300 font-bold text-lg">their</td>
                      <td className="py-3 italic text-slate-300">their friends</td>
                      <td className="py-3 text-slate-400">leurs amis</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Attention : its ≠ it's</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    <span className="font-mono text-red-300 font-bold">its</span> (sans apostrophe) = adjectif possessif 
                    (<span className="font-mono text-cyan-300">its tail</span> = sa queue).
                  </p>
                  <p className="text-slate-200 text-outline leading-relaxed">
                    <span className="font-mono text-red-300 font-bold">it's</span> (avec apostrophe) = <span className="font-mono text-cyan-300">it is</span> ou 
                    <span className="font-mono text-cyan-300">it has</span> (<span className="font-mono text-cyan-300">it's big</span> = c'est grand).
                  </p>
                </div>
              </div>
            </div>
            <h3 className="text-slate-100 mb-4 mt-8 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Pronoms possessifs</h3>
            <p className="text-slate-200 mb-4 text-outline">
              Les pronoms possessifs <strong>remplacent un groupe nominal</strong> pour éviter la répétition : 
              <span className="font-mono text-cyan-300"> my book</span> → <span className="font-mono text-cyan-300">mine</span>, 
              <span className="font-mono text-cyan-300">your pen</span> → <span className="font-mono text-cyan-300">yours</span>.
            </p>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-purple-500/50">
                      <th className="pb-3 pr-4 text-purple-300 font-bold text-sm uppercase tracking-wide">Sujet</th>
                      <th className="pb-3 pr-4 text-purple-300 font-bold text-sm uppercase tracking-wide">Pronom possessif</th>
                      <th className="pb-3 pr-4 text-purple-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 text-purple-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">I</td>
                      <td className="py-3 pr-4 font-mono text-purple-300 font-bold text-lg">mine</td>
                      <td className="py-3 italic text-slate-300">This is mine.</td>
                      <td className="py-3 text-slate-400">C'est à moi.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">You</td>
                      <td className="py-3 pr-4 font-mono text-purple-300 font-bold text-lg">yours</td>
                      <td className="py-3 italic text-slate-300">Is this yours?</td>
                      <td className="py-3 text-slate-400">Est-ce à toi ?</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-amber-900/20 transition-colors bg-amber-950/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        <span className="text-amber-300 font-bold">He</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-amber-300 font-bold text-lg">his</td>
                      <td className="py-3 italic text-slate-300">
                        <span className="font-mono text-amber-300 font-semibold">The book is his.</span>
                      </td>
                      <td className="py-3 text-slate-400">Le livre est à lui.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">She</td>
                      <td className="py-3 pr-4 font-mono text-purple-300 font-bold text-lg">hers</td>
                      <td className="py-3 italic text-slate-300">The bag is hers.</td>
                      <td className="py-3 text-slate-400">Le sac est à elle.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">We</td>
                      <td className="py-3 pr-4 font-mono text-purple-300 font-bold text-lg">ours</td>
                      <td className="py-3 italic text-slate-300">This room is ours.</td>
                      <td className="py-3 text-slate-400">Cette chambre est à nous.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">They</td>
                      <td className="py-3 pr-4 font-mono text-purple-300 font-bold text-lg">theirs</td>
                      <td className="py-3 italic text-slate-300">These are theirs.</td>
                      <td className="py-3 text-slate-400">Ceux-ci sont à eux.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/60 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Cas particulier : "his"</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    <span className="font-mono text-amber-300 font-bold">his</span> est à la fois <strong>adjectif</strong> et <strong>pronom</strong> possessif :
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                    <p className="text-slate-300 text-sm mb-1">
                      <strong>Adjectif :</strong> <span className="font-mono text-cyan-300">his book</span> (son livre)
                    </p>
                    <p className="text-slate-300 text-sm">
                      <strong>Pronom :</strong> <span className="font-mono text-cyan-300">The book is his.</span> (Le livre est à lui.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-violet-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-400 to-purple-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Adjectifs possessifs :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-violet-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-violet-300 font-semibold">My brother</span> is tall. <span className="text-slate-400 italic">(Mon frère est grand.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-violet-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-violet-300 font-semibold">Her cat</span> is sleeping. <span className="text-slate-400 italic">(Son chat [à elle] dort.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-violet-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-violet-300 font-semibold">His cat</span> is sleeping. <span className="text-slate-400 italic">(Son chat [à lui] dort.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-violet-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-violet-300 font-semibold">Our teacher</span> is nice. <span className="text-slate-400 italic">(Notre professeur est sympa.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-violet-300 font-bold mt-1">→</span>
                      <span>The dog wags <span className="font-mono text-violet-300 font-semibold">its tail</span>. <span className="text-slate-400 italic">(Le chien remue sa queue.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-purple-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Pronoms possessifs :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span>This book is <span className="font-mono text-purple-300 font-semibold">mine</span>. <span className="text-slate-400 italic">(Ce livre est à moi.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span>Is this pen <span className="font-mono text-purple-300 font-semibold">yours</span>? <span className="text-slate-400 italic">(Ce stylo est-il à toi ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span>Is this <span className="font-mono text-purple-300 font-semibold">her book</span> or <span className="font-mono text-purple-300 font-semibold">his</span>? <span className="text-slate-400 italic">(Est-ce son livre [à elle] ou à lui ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span>These keys aren't <span className="font-mono text-purple-300 font-semibold">mine</span>. They're <span className="font-mono text-purple-300 font-semibold">hers</span>. <span className="text-slate-400 italic">(Ces clés ne sont pas à moi. Elles sont à elle.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-purple-300 font-bold mt-1">→</span>
                      <span>The car is <span className="font-mono text-purple-300 font-semibold">theirs</span>. <span className="text-slate-400 italic">(La voiture est à eux.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-indigo-950/30 border-2 border-indigo-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Différence fondamentale</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 mb-2 font-semibold text-white">Adjectif possessif :</p>
                      <p className="text-slate-200 text-sm mb-1">
                        Placé <strong>avant un nom</strong>
                      </p>
                      <p className="text-slate-400 italic text-xs">
                        <span className="font-mono text-cyan-300">my book</span> / 
                        <span className="font-mono text-cyan-300"> her cat</span>
                      </p>
                    </div>
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 mb-2 font-semibold text-white">Pronom possessif :</p>
                      <p className="text-slate-200 text-sm mb-1">
                        <strong>Remplace</strong> un groupe nominal
                      </p>
                      <p className="text-slate-400 italic text-xs">
                        <span className="font-mono text-cyan-300">This is mine</span> / 
                        <span className="font-mono text-cyan-300"> The bag is hers</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Pièges à éviter</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">1. its ≠ it's :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm mb-1">
                          ❌ <span className="font-mono text-red-300">it's tail</span> 
                          <span className="text-slate-400"> (INCORRECT)</span>
                        </p>
                        <p className="text-slate-300 text-sm">
                          ✅ <span className="font-mono text-green-300">its tail</span> 
                          <span className="text-slate-400"> (CORRECT - adjectif possessif)</span>
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          <span className="font-mono text-cyan-300">it's</span> = <span className="font-mono text-cyan-300">it is</span> ou <span className="font-mono text-cyan-300">it has</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">2. her ≠ his (le genre du possesseur, pas de l'objet) :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm mb-1">
                          <span className="font-mono text-cyan-300">her cat</span> = le chat d'<strong>elle</strong> (possesseur = féminin)
                        </p>
                        <p className="text-slate-300 text-sm">
                          <span className="font-mono text-cyan-300">his cat</span> = le chat de <strong>lui</strong> (possesseur = masculin)
                        </p>
                        <p className="text-slate-400 italic text-xs mt-1">
                          Le genre du chat n'a pas d'importance, seul le possesseur compte !
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">3. their ≠ there :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm mb-1">
                          <span className="font-mono text-cyan-300">their</span> = adjectif possessif (<span className="font-mono text-cyan-300">their friends</span> = leurs amis)
                        </p>
                        <p className="text-slate-300 text-sm">
                          <span className="font-mono text-cyan-300">there</span> = adverbe de lieu (<span className="font-mono text-cyan-300">over there</span> = là-bas)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li><span className="font-mono text-cyan-300">his</span> est à la fois adjectif (<span className="font-mono text-cyan-300">his book</span>) et pronom possessif (<span className="font-mono text-cyan-300">The book is his</span>).</li>
              <li>Les adjectifs possessifs sont toujours suivis d'un nom : <span className="font-mono text-cyan-300">my book</span>, <span className="font-mono text-cyan-300">her cat</span>.</li>
              <li>Les pronoms possessifs remplacent le nom : <span className="font-mono text-cyan-300">This is mine</span> (pas "my").</li>
              <li>Le possessif dépend du <strong>possesseur</strong>, pas de la chose possédée : <span className="font-mono text-cyan-300">her cat</span> (elle possède), <span className="font-mono text-cyan-300">his cat</span> (il possède).</li>
            </ul>
          </>
        ),
      },
    ],
  },
  7: {
    courseNumber: 7,
    title: "A / an et pluriels",
    objective: "Apprendre à utiliser correctement les articles a/an et à former les pluriels en anglais.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              Les articles <span className="font-mono text-cyan-300 font-bold">a</span> et 
              <span className="font-mono text-cyan-300 font-bold"> an</span> sont utilisés devant un nom au <strong>singulier</strong> 
              pour indiquer "un" ou "une".
            </p>
            <p className="mb-4">
              Le <strong className="text-cyan-300">pluriel</strong> se forme généralement en ajoutant <span className="font-mono text-cyan-300">-s</span> au nom, 
              mais il existe de nombreuses exceptions à connaître.
            </p>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 mb-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Règle essentielle :</strong> On utilise <span className="font-mono text-cyan-300">a</span> ou 
                <span className="font-mono text-cyan-300"> an</span> <strong>uniquement</strong> avec un nom au <strong className="text-amber-300">singulier</strong>. 
                On n'utilise <strong>jamais</strong> <span className="font-mono text-cyan-300">a/an</span> avec un pluriel !
              </p>
            </div>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <h3 className="text-slate-100 mb-4 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Articles indéfinis : a / an</h3>
            <div className="comic-panel bg-red-950/20 border-2 border-red-500/40 p-4 mb-4">
              <p className="text-slate-200 mb-2">
                <strong className="text-white">⚠️ Règle essentielle :</strong> On utilise <span className="font-mono text-cyan-300">a</span> ou 
                <span className="font-mono text-cyan-300"> an</span> selon le <strong className="text-red-300">SON</strong> qui suit, <strong>pas la lettre</strong> !
              </p>
              <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                <p className="text-slate-300 text-sm mb-1">
                  <strong>Son voyelle :</strong> a, e, i, o, u (prononcés comme voyelles) → <span className="font-mono text-cyan-300">an</span>
                </p>
                <p className="text-slate-300 text-sm">
                  <strong>Son consonne :</strong> b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z (prononcés comme consonnes) → <span className="font-mono text-cyan-300">a</span>
                </p>
              </div>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-amber-500/50">
                      <th className="pb-3 pr-4 text-amber-300 font-bold text-sm uppercase tracking-wide">Article</th>
                      <th className="pb-3 pr-4 text-amber-300 font-bold text-sm uppercase tracking-wide">Règle</th>
                      <th className="pb-3 pr-4 text-amber-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 text-amber-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">a</td>
                      <td className="py-3 pr-4 text-slate-300">Son consonne</td>
                      <td className="py-3 italic text-slate-300">a book [b]</td>
                      <td className="py-3 text-slate-400">un livre</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">a</td>
                      <td className="py-3 pr-4 text-slate-300">Son consonne (u = [j])</td>
                      <td className="py-3 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">a university</span> [juː]
                      </td>
                      <td className="py-3 text-slate-400">une université</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">a</td>
                      <td className="py-3 pr-4 text-slate-300">Son consonne (eu = [j])</td>
                      <td className="py-3 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">a European</span> [jʊər]
                      </td>
                      <td className="py-3 text-slate-400">un Européen</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">an</td>
                      <td className="py-3 pr-4 text-slate-300">Son voyelle</td>
                      <td className="py-3 italic text-slate-300">an apple [æ]</td>
                      <td className="py-3 text-slate-400">une pomme</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-mono text-cyan-300 font-bold text-lg">an</td>
                      <td className="py-3 pr-4 text-slate-300">Son voyelle (h muet)</td>
                      <td className="py-3 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">an hour</span> [aʊər]
                      </td>
                      <td className="py-3 text-slate-400">une heure</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 my-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">💡 Pourquoi "European" prend "a" ?</strong> Le son [j] (comme dans "you") est un <strong>son consonne</strong>. 
                En anglais, "eu" dans "European" se prononce [jʊər], donc on entend d'abord le son [j] (consonne) → <span className="font-mono text-cyan-300">a European</span>.
              </p>
            </div>
            <h3 className="text-slate-100 mb-4 mt-8 font-bold text-2xl text-white text-outline" style={{
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>Formation du pluriel</h3>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-yellow-500/50">
                      <th className="pb-3 pr-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">Règle</th>
                      <th className="pb-3 pr-4 text-yellow-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 text-yellow-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300">+ <span className="font-mono text-cyan-300 font-bold">-s</span> (règle générale)</td>
                      <td className="py-3 pr-4 italic text-slate-300">book → books</td>
                      <td className="py-3 text-slate-400">livre → livres</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300">+ <span className="font-mono text-cyan-300 font-bold">-es</span> (s, sh, ch, x, z)</td>
                      <td className="py-3 pr-4 italic text-slate-300">box → boxes, bus → buses</td>
                      <td className="py-3 text-slate-400">boîte → boîtes</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300">-y → <span className="font-mono text-cyan-300 font-bold">-ies</span> (après consonne)</td>
                      <td className="py-3 pr-4 italic text-slate-300">city → cities, baby → babies</td>
                      <td className="py-3 text-slate-400">ville → villes</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300">-y → <span className="font-mono text-cyan-300 font-bold">-ys</span> (après voyelle)</td>
                      <td className="py-3 pr-4 italic text-slate-300">boy → boys, day → days</td>
                      <td className="py-3 text-slate-400">garçon → garçons</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300">-f/-fe → <span className="font-mono text-cyan-300 font-bold">-ves</span></td>
                      <td className="py-3 pr-4 italic text-slate-300">knife → knives, leaf → leaves</td>
                      <td className="py-3 text-slate-400">couteau → couteaux</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 text-slate-300">-o → <span className="font-mono text-cyan-300 font-bold">-oes</span> ou <span className="font-mono text-cyan-300 font-bold">-os</span></td>
                      <td className="py-3 pr-4 italic text-slate-300">tomato → tomatoes, photo → photos</td>
                      <td className="py-3 text-slate-400">tomate → tomates</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 text-slate-300">
                        <span className="text-red-300 font-bold">Irréguliers</span> (à apprendre)
                      </td>
                      <td className="py-3 pr-4 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">child → children</span>, person → people
                      </td>
                      <td className="py-3 text-slate-400">enfant → enfants</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-red-900/20 transition-colors bg-red-950/10">
                      <td className="py-3 pr-4 text-slate-300">
                        <span className="text-red-300 font-bold">Invariables</span> (singulier = pluriel)
                      </td>
                      <td className="py-3 pr-4 italic text-slate-300">
                        <span className="font-mono text-red-300 font-semibold">sheep → sheep</span>, deer → deer
                      </td>
                      <td className="py-3 text-slate-400">mouton → moutons</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-amber-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-yellow-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Articles :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-amber-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-amber-300 font-semibold">a cat</span> / <span className="font-mono text-amber-300 font-semibold">an elephant</span> <span className="text-slate-400 italic">(un chat / un éléphant)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-amber-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-amber-300 font-semibold">a university</span> <span className="text-slate-400 italic">(une université - son [j])</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-amber-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-amber-300 font-semibold">an hour</span> <span className="text-slate-400 italic">(une heure - h muet, son [aʊ])</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-yellow-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-orange-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Pluriels :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">book</span> → <span className="font-mono text-yellow-300 font-semibold">books</span> <span className="text-slate-400 italic">(règle générale)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">city</span> → <span className="font-mono text-yellow-300 font-semibold">cities</span> <span className="text-slate-400 italic">(y → ies après consonne)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">baby</span> → <span className="font-mono text-yellow-300 font-semibold">babies</span> <span className="text-slate-400 italic">(y → ies)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">knife</span> → <span className="font-mono text-yellow-300 font-semibold">knives</span> <span className="text-slate-400 italic">(f → ves)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">tomato</span> → <span className="font-mono text-yellow-300 font-semibold">tomatoes</span> <span className="text-slate-400 italic">(o → oes)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">child</span> → <span className="font-mono text-yellow-300 font-semibold">children</span> <span className="text-slate-400 italic">(irrégulier)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-yellow-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-yellow-300 font-semibold">sheep</span> → <span className="font-mono text-yellow-300 font-semibold">sheep</span> <span className="text-slate-400 italic">(invariable)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-indigo-950/30 border-2 border-indigo-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Quand utiliser a/an et quand ne pas utiliser d'article</h4>
                  <div className="space-y-3">
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 text-sm mb-2 font-semibold text-white">✅ On utilise a/an :</p>
                      <ul className="list-none space-y-1 text-slate-300 text-sm ml-4">
                        <li>• Avec un nom <strong>singulier</strong> comptable : <span className="font-mono text-cyan-300">a book</span>, <span className="font-mono text-cyan-300">an apple</span></li>
                      </ul>
                    </div>
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 text-sm mb-2 font-semibold text-white">❌ On n'utilise PAS a/an :</p>
                      <ul className="list-none space-y-1 text-slate-300 text-sm ml-4">
                        <li>• Avec un <strong>pluriel</strong> : <span className="font-mono text-red-300">I have books</span> (pas "a books")</li>
                        <li>• Avec un nom <strong>indénombrable</strong> : <span className="font-mono text-red-300">I drink water</span> (pas "a water")</li>
                        <li>• Avec certains noms abstraits : <span className="font-mono text-red-300">information</span>, <span className="font-mono text-red-300">advice</span>, <span className="font-mono text-red-300">news</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li>Les noms irréguliers doivent être appris par cœur : <span className="font-mono text-cyan-300">child → children</span>, <span className="font-mono text-cyan-300">person → people</span>, <span className="font-mono text-cyan-300">mouse → mice</span>.</li>
              <li>Certains noms étrangers gardent leur pluriel d'origine : <span className="font-mono text-cyan-300">cactus → cacti</span>, <span className="font-mono text-cyan-300">radius → radii</span>.</li>
            </ul>
            <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/50 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Noms invariables (singulier = pluriel)</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    Certains noms sont identiques au singulier et au pluriel :
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                    <ul className="list-none space-y-1 text-slate-300 text-sm">
                      <li>• <span className="font-mono text-cyan-300">sheep</span> → <span className="font-mono text-cyan-300">sheep</span> (mouton/moutons)</li>
                      <li>• <span className="font-mono text-cyan-300">deer</span> → <span className="font-mono text-cyan-300">deer</span> (cerf/cerfs)</li>
                      <li>• <span className="font-mono text-cyan-300">fish</span> → <span className="font-mono text-cyan-300">fish</span> (poisson/poissons)</li>
                      <li>• <span className="font-mono text-cyan-300">aircraft</span> → <span className="font-mono text-cyan-300">aircraft</span> (avion/avions)</li>
                      <li>• <span className="font-mono text-cyan-300">species</span> → <span className="font-mono text-cyan-300">species</span> (espèce/espèces)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  8: {
    courseNumber: 8,
    title: "There is / there are",
    objective: "Apprendre à utiliser there is et there are pour décrire l'existence ou la présence de quelque chose.",
    sections: [
      {
        title: "À quoi sert cette structure ?",
        content: (
          <>
            <p className="mb-4">
              <span className="font-mono text-cyan-300 font-bold">There is</span> et 
              <span className="font-mono text-cyan-300 font-bold"> there are</span> servent à indiquer 
              qu'<strong className="text-cyan-300">il y a</strong> ou qu'<strong className="text-cyan-300">il existe</strong> quelque chose quelque part.
            </p>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 mb-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Important :</strong> Dans <span className="font-mono text-cyan-300">there is</span> / 
                <span className="font-mono text-cyan-300">there are</span>, le mot <span className="font-mono text-cyan-300">there</span> 
                <strong>n'est pas</strong> l'adverbe "là-bas" ! C'est une <strong className="text-amber-300">structure impersonnelle</strong> qui signifie 
                "il existe" ou "il y a". On ne peut pas le traduire par "là-bas il y a".
              </p>
            </div>
            <p className="mb-4">
              On utilise <span className="font-mono text-cyan-300">there is</span> pour le singulier et 
              <span className="font-mono text-cyan-300"> there are</span> pour le pluriel.
            </p>
            <p>
              Le choix entre <span className="font-mono text-cyan-300">is</span> et <span className="font-mono text-cyan-300">are</span> 
              dépend de l'<strong>idée</strong> exprimée, pas toujours du nombre réel d'objets.
            </p>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-sky-500/50">
                      <th className="pb-3 pr-4 text-sky-300 font-bold text-sm uppercase tracking-wide">Forme</th>
                      <th className="pb-3 pr-4 text-sky-300 font-bold text-sm uppercase tracking-wide">Singulier</th>
                      <th className="pb-3 pr-4 text-sky-300 font-bold text-sm uppercase tracking-wide">Pluriel</th>
                      <th className="pb-3 text-sky-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">Affirmatif</td>
                      <td className="py-3 pr-4 font-mono text-sky-300 font-bold text-lg">There is</td>
                      <td className="py-3 pr-4 font-mono text-sky-300 font-bold text-lg">There are</td>
                      <td className="py-3 italic text-slate-300">There is a cat. / There are two cats.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">Négatif</td>
                      <td className="py-3 pr-4 font-mono text-sky-300 font-bold text-lg">There isn't</td>
                      <td className="py-3 pr-4 font-mono text-sky-300 font-bold text-lg">There aren't</td>
                      <td className="py-3 italic text-slate-300">There isn't a cat. / There aren't any cats.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">Interrogatif</td>
                      <td className="py-3 pr-4 font-mono text-sky-300 font-bold text-lg">Is there...?</td>
                      <td className="py-3 pr-4 font-mono text-sky-300 font-bold text-lg">Are there...?</td>
                      <td className="py-3 italic text-slate-300">Is there a cat? / Are there any cats?</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
              <div className="relative z-10">
                <p className="text-slate-100 mb-4 font-semibold text-lg">Formes contractées :</p>
                <div className="space-y-2 text-slate-200">
                  <p><span className="font-mono text-sky-300 font-bold">There's</span> = There is (très courant à l'oral)</p>
                  <p><span className="font-mono text-sky-300 font-bold">There isn't</span> = There is not</p>
                  <p><span className="font-mono text-sky-300 font-bold">There aren't</span> = There are not</p>
                  <p className="text-slate-400 italic text-sm">
                    Note : <span className="font-mono text-cyan-300">There're</span> (There are) se prononce parfois à l'oral mais s'écrit rarement.
                  </p>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Piège fréquent : There's + pluriel</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    <span className="font-mono text-red-300 font-bold">There's</span> est <strong>toujours</strong> suivi d'un nom au <strong>singulier</strong> !
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                    <p className="text-slate-300 text-sm mb-1">
                      ❌ <span className="font-mono text-red-300">There's three cats</span> 
                      <span className="text-slate-400"> (INCORRECT)</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                      ✅ <span className="font-mono text-green-300">There are three cats</span> 
                      <span className="text-slate-400"> (CORRECT)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-sky-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-400 to-blue-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Affirmatif :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-sky-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-sky-300 font-semibold">There is</span> a park near my house. <span className="text-slate-400 italic">(Il y a un parc près de chez moi.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-sky-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-sky-300 font-semibold">There's</span> a problem with the computer. <span className="text-slate-400 italic">(Il y a un problème avec l'ordinateur.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-sky-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-sky-300 font-semibold">There are</span> many shops in this street. <span className="text-slate-400 italic">(Il y a beaucoup de magasins dans cette rue.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-sky-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-sky-300 font-semibold">There are</span> some apples in the fridge. <span className="text-slate-400 italic">(Il y a des pommes dans le frigo.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-red-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-orange-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Négatif :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">There isn't</span> any milk left. <span className="text-slate-400 italic">(Il n'y a plus de lait.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-red-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-red-300 font-semibold">There aren't</span> any students in the classroom. <span className="text-slate-400 italic">(Il n'y a pas d'étudiants dans la salle.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-blue-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Questions :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Is there</span> a bank near here? <span className="text-slate-400 italic">(Y a-t-il une banque près d'ici ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">Are there</span> any restaurants in this area? <span className="text-slate-400 italic">(Y a-t-il des restaurants dans ce quartier ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">How many</span> books <span className="font-mono text-blue-300 font-semibold">are there</span> on the shelf? <span className="text-slate-400 italic">(Combien y a-t-il de livres sur l'étagère ?)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-emerald-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>Avec adverbes et prépositions :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">There is still</span> a seat available. <span className="text-slate-400 italic">(Il reste encore une place disponible.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">There are always</span> students in the hallway. <span className="text-slate-400 italic">(Il y a toujours des étudiants dans le couloir.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">There is never</span> enough time. <span className="text-slate-400 italic">(Il n'y a jamais assez de temps.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Le choix selon l'idée, pas le nombre réel</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-3">
                    Le choix entre <span className="font-mono text-cyan-300">is</span> et <span className="font-mono text-cyan-300">are</span> 
                    dépend de l'<strong>idée</strong> exprimée, pas toujours du nombre réel d'objets.
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                    <p className="text-slate-300 text-sm mb-2">
                      <strong>Exemples :</strong>
                    </p>
                    <ul className="list-none space-y-1 text-slate-300 text-sm">
                      <li>• <span className="font-mono text-cyan-300">There is a lot of traffic</span> (singulier, même si "traffic" est un concept collectif)</li>
                      <li>• <span className="font-mono text-cyan-300">There is a group of students</span> (singulier, car "group" est au singulier)</li>
                      <li>• <span className="font-mono text-cyan-300">There are some students</span> (pluriel, car "students" est au pluriel)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-indigo-950/30 border-2 border-indigo-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Avec some / any</h4>
                  <div className="space-y-2">
                    <p className="text-slate-200 text-outline leading-relaxed">
                      <strong className="text-white">Some</strong> (affirmatif) : <span className="font-mono text-cyan-300">There are some books</span> (Il y a des livres)
                    </p>
                    <p className="text-slate-200 text-outline leading-relaxed">
                      <strong className="text-white">Any</strong> (négatif/interrogatif) : <span className="font-mono text-cyan-300">There aren't any books</span> / 
                      <span className="font-mono text-cyan-300"> Are there any books?</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-indigo-950/30 border-2 border-indigo-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Ordre des mots avec adverbes</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    Les adverbes (still, always, never, etc.) se placent généralement <strong>après</strong> 
                    <span className="font-mono text-cyan-300">there is/are</span> :
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                    <ul className="list-none space-y-1 text-slate-300 text-sm">
                      <li>• <span className="font-mono text-cyan-300">There is still</span> time.</li>
                      <li>• <span className="font-mono text-cyan-300">There are always</span> people here.</li>
                      <li>• <span className="font-mono text-cyan-300">There is never</span> enough money.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li><span className="font-mono text-cyan-300">There is</span> est suivi d'un nom au singulier.</li>
              <li><span className="font-mono text-cyan-300">There are</span> est suivi d'un nom au pluriel.</li>
              <li>La forme contractée <span className="font-mono text-cyan-300">There's</span> est très courante à l'oral.</li>
              <li>Pour les questions avec quantité, on utilise <span className="font-mono text-cyan-300">How many... are there?</span></li>
            </ul>
          </>
        ),
      },
    ],
  },
  9: {
    courseNumber: 9,
    title: "Can / can't : capacité et permission",
    objective: "Apprendre à utiliser can et can't pour exprimer la capacité, la possibilité et la permission.",
    sections: [
      {
        title: "À quoi sert can ?",
        content: (
          <>
            <p className="mb-4">
              Le modal <span className="font-mono text-cyan-300 font-bold">can</span> sert à exprimer trois choses principales :
            </p>
            <div className="space-y-3 mb-4">
              <div className="comic-panel border-2 border-green-500/30 p-4"
                   style={{
                     background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
                   }}>
                <p className="text-slate-200">
                  <strong className="text-white">1. La capacité</strong> : ce qu'on sait faire ou est capable de faire
                </p>
                <p className="text-slate-400 italic text-sm mt-1">Exemple : "I can swim" = "Je sais nager" / "Je suis capable de nager"</p>
              </div>
              <div className="comic-panel border-2 border-blue-500/30 p-4"
                   style={{
                     background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                   }}>
                <p className="text-slate-200">
                  <strong className="text-white">2. La possibilité réelle</strong> : ce qui est possible dans une situation donnée
                </p>
                <p className="text-slate-400 italic text-sm mt-1">Exemple : "I can see your house from here" = "Je peux voir ta maison d'ici"</p>
              </div>
              <div className="comic-panel border-2 border-emerald-500/30 p-4"
                   style={{
                     background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                   }}>
                <p className="text-slate-200">
                  <strong className="text-white">3. La permission</strong> : ce qu'on a le droit de faire
                </p>
                <p className="text-slate-400 italic text-sm mt-1">Exemple : "You can go" = "Tu peux partir" / "Tu as le droit de partir"</p>
              </div>
            </div>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 mb-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">💡 Qu'est-ce qu'un modal ?</strong> Un <strong>modal</strong> est un mot spécial qui modifie le sens d'un verbe. 
                <span className="font-mono text-cyan-300"> Can</span> est un modal : il est suivi d'un verbe à la base (sans "to") et ne change pas selon le sujet 
                (pas de -s à la 3e personne, contrairement aux verbes ordinaires).
              </p>
            </div>
            <div className="comic-panel border-2 border-cyan-500/30 p-4 mb-4"
                 style={{
                   background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
                 }}>
              <p className="text-slate-200 mb-2">
                <strong className="text-white">Lien avec le Present Simple :</strong>
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• Verbe ordinaire : <span className="font-mono text-cyan-300">I work</span> / <span className="font-mono text-red-300">He works</span> (avec -s à la 3e personne)</p>
                <p>• Modal <span className="font-mono text-cyan-300">can</span> : <span className="font-mono text-cyan-300">I can work</span> / <span className="font-mono text-cyan-300">He can work</span> (pas de -s, même à la 3e personne !)</p>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Les formes à retenir",
        content: (
          <>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-50" />
              <div className="relative z-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-green-500/50">
                      <th className="pb-3 pr-4 text-green-300 font-bold text-sm uppercase tracking-wide">Forme</th>
                      <th className="pb-3 pr-4 text-green-300 font-bold text-sm uppercase tracking-wide">Structure</th>
                      <th className="pb-3 pr-4 text-green-300 font-bold text-sm uppercase tracking-wide">Exemple</th>
                      <th className="pb-3 text-green-300 font-bold text-sm uppercase tracking-wide">Français</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-200">
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">Affirmatif</td>
                      <td className="py-3 pr-4 font-mono text-green-300 font-bold text-lg">Sujet + can + verbe (base)</td>
                      <td className="py-3 italic text-slate-300">I can swim. / He can play.</td>
                      <td className="py-3 text-slate-400">Je sais nager. / Il sait jouer.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">Négatif</td>
                      <td className="py-3 pr-4 font-mono text-red-300 font-bold text-lg">Sujet + can't + verbe (base)</td>
                      <td className="py-3 italic text-slate-300">She can't drive. / They can't come.</td>
                      <td className="py-3 text-slate-400">Elle ne sait pas conduire. / Ils ne peuvent pas venir.</td>
                    </tr>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white">Interrogatif</td>
                      <td className="py-3 pr-4 font-mono text-blue-300 font-bold text-lg">Can + sujet + verbe (base) + ... ?</td>
                      <td className="py-3 italic text-slate-300">Can you help me? / Can she speak French?</td>
                      <td className="py-3 text-slate-400">Peux-tu m'aider ? / Sait-elle parler français ?</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="comic-panel bg-amber-950/20 border-2 border-amber-500/40 p-4 my-4">
              <p className="text-slate-200 text-base">
                <strong className="text-white">⚠️ Important :</strong> <span className="font-mono text-cyan-300">can</span> ne change <strong>jamais</strong> selon le sujet. 
                On dit <span className="font-mono text-cyan-300">He can play</span> (pas "He cans play"), contrairement aux verbes ordinaires où on ajoute un -s à la 3e personne.
              </p>
            </div>
            <div className="comic-panel border-2 border-black p-5 my-4 relative overflow-hidden"
                 style={{
                   background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
                 }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50" />
              <div className="relative z-10">
                <p className="text-slate-100 mb-4 font-semibold text-lg">Formes de la négation :</p>
                <div className="space-y-2 text-slate-200">
                  <p><span className="font-mono text-cyan-300 font-bold">can't</span> = contraction de <span className="font-mono text-cyan-300">cannot</span> (très courant à l'oral et à l'écrit)</p>
                  <p><span className="font-mono text-cyan-300 font-bold">cannot</span> = forme complète (plus formelle, plus fréquente à l'écrit)</p>
                  <p className="text-slate-400 italic text-sm mt-2">
                    Exemple : <span className="font-mono text-cyan-300">I can't come</span> (oral) / 
                    <span className="font-mono text-cyan-300"> I cannot attend</span> (écrit formel)
                  </p>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Exemples",
        content: (
          <>
            <div className="space-y-4">
              <div className="comic-panel border-2 border-green-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>1. Capacité :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-green-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-green-300 font-semibold">I can speak</span> English. <span className="text-slate-400 italic">(Je sais parler anglais.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-green-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-green-300 font-semibold">She can play</span> the piano. <span className="text-slate-400 italic">(Elle sait jouer du piano.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-green-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-green-300 font-semibold">He can't swim</span>. <span className="text-slate-400 italic">(Il ne sait pas nager - incapacité.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-blue-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>2. Possibilité réelle :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">I can see</span> your house from here. <span className="text-slate-400 italic">(Je peux voir ta maison d'ici.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">You can find</span> the book online. <span className="text-slate-400 italic">(Tu peux trouver le livre en ligne.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-blue-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-blue-300 font-semibold">We can't hear</span> you. <span className="text-slate-400 italic">(On ne peut pas t'entendre - impossibilité.)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="comic-panel border-2 border-emerald-500/40 p-5 relative overflow-hidden"
                   style={{
                     background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                   }}>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                <div className="relative z-10 pl-4">
                  <p className="text-slate-100 mb-3 font-semibold text-lg text-white">
                    <strong>3. Permission :</strong>
                  </p>
                  <ul className="list-none space-y-2 text-slate-200">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">Can I go</span> to the bathroom? <span className="text-slate-400 italic">(Puis-je aller aux toilettes ?)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">You can sit</span> here. <span className="text-slate-400 italic">(Tu peux t'asseoir ici.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">You can't smoke</span> here. <span className="text-slate-400 italic">(Tu ne peux pas fumer ici - interdiction.)</span></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-emerald-300 font-bold mt-1">→</span>
                      <span><span className="font-mono text-emerald-300 font-semibold">Could I borrow</span> your pen? <span className="text-slate-400 italic">(Pourrais-je emprunter ton stylo ? - plus poli)</span></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Points importants",
        content: (
          <>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Différence fondamentale : can't = incapacité vs interdiction</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">1. Incapacité / Impossibilité :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm">
                          <span className="font-mono text-cyan-300">She can't swim</span> = Elle ne sait pas nager / Elle n'est pas capable de nager
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          <span className="font-mono text-cyan-300">I can't see anything</span> = Je ne peux rien voir (impossibilité)
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-200 text-outline leading-relaxed mb-2">
                        <strong className="text-white">2. Interdiction :</strong>
                      </p>
                      <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                        <p className="text-slate-300 text-sm">
                          <span className="font-mono text-cyan-300">You can't smoke here</span> = Tu n'as pas le droit de fumer ici (interdiction)
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          <span className="font-mono text-cyan-300">Students can't use phones</span> = Les étudiants n'ont pas le droit d'utiliser leur téléphone
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-amber-950/30 border-2 border-amber-500/60 p-5 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-3 text-lg text-outline">Politesse et registre pour la permission</h4>
                  <div className="space-y-3">
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 text-sm mb-2 font-semibold text-white">Registre familier / direct :</p>
                      <p className="text-slate-200 text-sm">
                        <span className="font-mono text-cyan-300">Can I go?</span> (Acceptable à l'école, entre amis)
                      </p>
                    </div>
                    <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3">
                      <p className="text-slate-300 text-sm mb-2 font-semibold text-white">Registre plus poli / formel :</p>
                      <p className="text-slate-200 text-sm">
                        <span className="font-mono text-cyan-300">Could I go?</span> (Plus poli, contexte formel)
                      </p>
                      <p className="text-slate-400 italic text-xs mt-1">
                        <span className="font-mono text-cyan-300">Can I...?</span> est plus direct et acceptable dans la plupart des situations, 
                        mais <span className="font-mono text-cyan-300">Could I...?</span> est plus approprié dans un contexte formel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="comic-panel bg-red-950/30 border-2 border-red-500/60 p-4 my-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 text-outline">Piège : can ≠ know how to</h4>
                  <p className="text-slate-200 text-outline leading-relaxed mb-2">
                    <span className="font-mono text-cyan-300">can</span> et <span className="font-mono text-cyan-300">know how to</span> expriment tous deux la capacité, 
                    mais avec des structures différentes :
                  </p>
                  <div className="comic-panel bg-slate-800/50 border-2 border-slate-700/50 p-3 mt-2">
                    <p className="text-slate-300 text-sm mb-1">
                      ❌ <span className="font-mono text-red-300">I know to swim</span> / 
                      <span className="font-mono text-red-300"> I can to swim</span> 
                      <span className="text-slate-400"> (INCORRECT)</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                      ✅ <span className="font-mono text-green-300">I can swim</span> / 
                      <span className="font-mono text-green-300"> I know how to swim</span> 
                      <span className="text-slate-400"> (CORRECT)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ul className="list-disc list-inside space-y-2 text-slate-200 ml-4 mb-4">
              <li><span className="font-mono text-cyan-300">Can</span> est suivi directement du verbe à la base, sans "to" : <span className="font-mono text-cyan-300">I can go</span> (pas "can to go").</li>
              <li>La forme est la même pour tous les sujets : pas de -s à la 3e personne (<span className="font-mono text-cyan-300">He can play</span>, pas "He cans play").</li>
              <li><span className="font-mono text-cyan-300">Can't</span> est la contraction de <span className="font-mono text-cyan-300">cannot</span> (forme complète plus formelle, surtout à l'écrit).</li>
              <li>Pour les suggestions ou reproches, on peut utiliser <span className="font-mono text-cyan-300">Can't you...?</span> : 
                <span className="font-mono text-cyan-300"> Can't you help me?</span> (Ne peux-tu pas m'aider ?)</li>
            </ul>
          </>
        ),
      },
    ],
  },
};

