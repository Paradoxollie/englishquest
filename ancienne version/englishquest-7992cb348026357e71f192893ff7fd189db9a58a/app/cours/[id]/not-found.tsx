import Link from "next/link";
import { BookIcon } from "@/components/ui/icons";

export default function CourseNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 comic-dot-pattern">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        <div className="comic-panel-dark w-full p-6 md:p-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="comic-panel bg-slate-800 border-2 border-black p-6">
                <BookIcon className="w-16 h-16 text-slate-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-outline">
              Cours introuvable
            </h1>
            <p className="text-lg text-slate-300 mb-8 text-outline">
              Ce cours n'existe pas encore ou n'est pas disponible.
            </p>
            <Link
              href="/tous-les-cours"
              className="comic-button bg-indigo-600 text-white px-6 py-3 font-bold hover:bg-indigo-700 inline-flex items-center gap-2"
            >
              <BookIcon className="w-5 h-5" />
              Retour aux cours
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

