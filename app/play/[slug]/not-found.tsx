import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark p-8 text-center">
          <div className="relative z-10">
            <div className="mb-6 text-6xl">❌</div>
            <h1 className="text-4xl font-bold text-white mb-4 text-outline">
              Jeu non trouvé
            </h1>
            <p className="text-lg text-slate-300 font-semibold mb-6 text-outline">
              Ce jeu n'existe pas ou n'est pas encore disponible.
            </p>
            <Link
              href="/play"
              className="comic-button bg-cyan-600 text-white px-6 py-3 font-bold hover:bg-cyan-700 inline-block"
            >
              Retour aux jeux
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

