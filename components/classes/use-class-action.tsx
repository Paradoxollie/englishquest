"use client";

import { useCallback, useState, useTransition } from "react";
import type { ClassActionResult } from "@/lib/classes/classes";

/**
 * Lance une action serveur de l'espace classe et garde sa réponse pour
 * l'afficher. Les actions revalident la page elles-mêmes : la liste se met à
 * jour sans rechargement.
 */
export function useClassAction(networkError = "La connexion a échoué. Réessayez.") {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ClassActionResult<unknown> | null>(null);

  const run = useCallback(
    <T,>(action: () => Promise<ClassActionResult<T>>, onSuccess?: (result: ClassActionResult<T> & { ok: true }) => void) => {
      startTransition(async () => {
        try {
          const next = await action();
          setResult(next);
          if (next.ok) onSuccess?.(next);
        } catch {
          setResult({ ok: false, error: networkError });
        }
      });
    },
    [networkError]
  );

  const reset = useCallback(() => setResult(null), []);

  return { pending, result, run, reset };
}

export function ActionFeedback({ result, className = "" }: { result: ClassActionResult<unknown> | null; className?: string }) {
  if (!result) return null;
  return (
    <p
      role={result.ok ? "status" : "alert"}
      className={`eq-class-feedback ${result.ok ? "is-ok" : "is-error"} ${className}`.trim()}
    >
      {result.ok ? result.message : result.error}
    </p>
  );
}
