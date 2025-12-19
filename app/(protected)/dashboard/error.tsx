"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="comic-panel-dark max-w-md p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-400 text-outline">
          Erreur du dashboard
        </h2>
        <p className="mb-6 text-slate-300 text-outline">
          Impossible de charger le dashboard. Veuillez réessayer ou contacter un administrateur.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="comic-button bg-cyan-600 text-white px-6 py-3 font-bold hover:bg-cyan-700"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="comic-button bg-slate-700 text-white px-6 py-3 font-bold hover:bg-slate-600 text-center"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

