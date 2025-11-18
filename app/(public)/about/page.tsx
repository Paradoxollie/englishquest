import type { Metadata } from "next";
import { MotionCard } from "@/components/ui/motion-card";

export const metadata: Metadata = {
  title: "À propos de moi - English Quest",
  description:
    "Découvrez l'histoire d'English Quest, créé par Pierre Marienne, professeur d'anglais dans le Val-d'Oise. Une approche ludique et pédagogique pour apprendre l'anglais.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="comic-panel-dark p-8 mb-8" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)" }}>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white text-outline md:text-4xl mb-4">À propos de moi</h1>
            <div className="h-1 w-24 bg-cyan-500 border-2 border-black"></div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <MotionCard>
            <div className="comic-card-dark p-6 h-full" style={{ background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)" }}>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white text-outline mb-4 pb-3 border-b-2 border-cyan-500/30">
                  Qui je suis
                </h2>
                <div className="space-y-3 text-slate-200 leading-relaxed">
                  <p>
                    Je m'appelle <span className="font-bold text-white">Pierre Marienne</span>. Professeur d'anglais depuis 10 ans, j'ai enseigné au collège, au lycée et à l'université.
                  </p>
                  <p>
                    Grâce à mon parcours professionnel et personnel, j'ai développé une sensibilité particulière pour les mécaniques de jeu et les univers créatifs. Cette expérience m'a permis d'imaginer une approche pédagogique qui allie apprentissage sérieux et engagement ludique.
                  </p>
                </div>
              </div>
            </div>
          </MotionCard>

          <MotionCard>
            <div className="comic-card-dark p-6 h-full" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)" }}>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white text-outline mb-4 pb-3 border-b-2 border-emerald-500/30">
                  Mon approche
                </h2>
                <div className="space-y-3 text-slate-200 leading-relaxed">
                  <p>
                    Je crois en un apprentissage qui allie sérieux pédagogique et plaisir de la découverte.
                  </p>
                  <p>
                    Les mécaniques de jeu permettent de rendre l'apprentissage plus motivant et plus engageant pour les élèves.
                  </p>
                </div>
              </div>
            </div>
          </MotionCard>

          <MotionCard>
            <div className="comic-card-dark p-6 h-full" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)" }}>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white text-outline mb-4 pb-3 border-b-2 border-indigo-500/30">
                  Le site
                </h2>
                <div className="space-y-3 text-slate-200 leading-relaxed">
                  <p>
                    English Quest a pour but de proposer un espace clair et accessible pour progresser en anglais.
                  </p>
                  <p>
                    Les contenus sont structurés, régulièrement mis à jour, et fidèles aux programmes officiels.
                  </p>
                </div>
              </div>
            </div>
          </MotionCard>

          <MotionCard>
            <div className="comic-card-dark p-6 h-full" style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)" }}>
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white text-outline mb-4 pb-3 border-b-2 border-purple-500/30">
                  L'objectif
                </h2>
                <div className="space-y-3 text-slate-200 leading-relaxed">
                  <p>
                    Proposer un apprentissage sérieux mais agréable, qui donne envie d'avancer.
                  </p>
                  <p>
                    Chaque activité est pensée pour être à la fois pédagogique et stimulante.
                  </p>
                  <p>
                    Le site propose également une section dédiée aux professeurs, avec des ressources clés en main pour la classe.
                  </p>
                </div>
              </div>
            </div>
          </MotionCard>
        </div>
      </div>
    </div>
  );
}

