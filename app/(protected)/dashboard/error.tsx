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
    <div className="eq-container flex min-h-[60vh] flex-col items-center justify-center">
      <div className="eq-card max-w-md p-8 text-center">
        <p className="eq-kicker text-[var(--coral)]">Erreur</p>
        <h2 className="eq-h2 mt-2 mb-3">Erreur du dashboard</h2>
        <p className="eq-muted mb-6">
          Impossible de charger le dashboard. Veuillez réessayer ou contacter un administrateur.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="eq-btn eq-btn-primary">
            Réessayer
          </button>
          <Link href="/dashboard" className="eq-btn eq-btn-ghost text-center">
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
