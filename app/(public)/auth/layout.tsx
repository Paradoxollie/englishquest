import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section
          className="comic-panel-dark p-6 md:p-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.18) 100%)",
          }}
        >
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300 text-outline">
              Espace joueur
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white text-outline md:text-5xl">
              Entre dans English Quest avec le bon decor.
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-slate-200 text-outline md:text-lg">
              Une entree claire, lisible et fidele a l'univers comics du site. Cree ton profil,
              reprends ton parcours et retrouve tes jeux sans casser l'ambiance.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="comic-panel border-2 border-black bg-slate-950/55 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Progression
                </p>
                <p className="mt-2 text-sm font-bold text-white">Cours et jeux relies</p>
              </div>
              <div className="comic-panel border-2 border-black bg-slate-950/55 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Recompenses
                </p>
                <p className="mt-2 text-sm font-bold text-white">XP, or et profils</p>
              </div>
              <div className="comic-panel border-2 border-black bg-slate-950/55 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Univers
                </p>
                <p className="mt-2 text-sm font-bold text-white">Marvel comics sombre</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
