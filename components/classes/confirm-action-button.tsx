"use client";

import { useState } from "react";
import type { ClassActionResult } from "@/lib/classes/classes";
import { ActionFeedback, useClassAction } from "./use-class-action";

type ConfirmActionButtonProps = {
  label: string;
  /** Question posée avant d'agir, par exemple « Retirer lea_92 de la classe ? ». */
  question: string;
  confirmLabel: string;
  action: () => Promise<ClassActionResult<unknown>>;
  tone?: "ghost" | "danger";
  size?: "sm" | "md";
  networkError?: string;
  cancelLabel?: string;
  /** Garder le message de réussite affiché (utile quand la ligne reste à l'écran). */
  showSuccess?: boolean;
};

/**
 * Bouton en deux temps pour les actions qui ne se défont pas d'un clic :
 * retirer un élève, archiver, changer le code, quitter une classe.
 */
export function ConfirmActionButton({
  label,
  question,
  confirmLabel,
  action,
  tone = "ghost",
  size = "sm",
  networkError,
  cancelLabel = "Annuler",
  showSuccess = true,
}: ConfirmActionButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const { pending, result, run, reset } = useClassAction(networkError);
  const sizeClass = size === "sm" ? " eq-btn-sm" : "";

  if (!confirming) {
    return (
      <div className="eq-class-confirm">
        <button
          type="button"
          className={`eq-btn eq-btn-${tone}${sizeClass}`}
          onClick={() => {
            reset();
            setConfirming(true);
          }}
        >
          {label}
        </button>
        {result && (showSuccess || !result.ok) ? <ActionFeedback result={result} /> : null}
      </div>
    );
  }

  return (
    <div className="eq-class-confirm is-open" role="group" aria-label={question}>
      <p className="eq-class-confirm-question">{question}</p>
      <div className="eq-class-confirm-actions">
        <button
          type="button"
          className={`eq-btn eq-btn-danger${sizeClass}`}
          disabled={pending}
          onClick={() => run(action, () => setConfirming(false))}
        >
          {pending ? "Un instant…" : confirmLabel}
        </button>
        <button type="button" className={`eq-btn eq-btn-ghost${sizeClass}`} disabled={pending} onClick={() => setConfirming(false)}>
          {cancelLabel}
        </button>
      </div>
      <ActionFeedback result={result && !result.ok ? result : null} />
    </div>
  );
}
