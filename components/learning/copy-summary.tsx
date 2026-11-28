"use client";

import { useRef, useState } from "react";

export function CopySummary({ text }: { text: string }) {
  const field = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  return (
    <details className="eq-card p-4">
      <summary className="cursor-pointer font-bold">Bilan à copier sans le pseudo</summary>
      <p className="eq-muted my-2 text-sm">
        Tu peux utiliser ce résumé pour préparer un conseil ou en discuter. Tu choisis à qui le transmettre.
      </p>
      <textarea
        ref={field}
        aria-label="Bilan sans identifiant"
        readOnly
        value={text}
        rows={5}
        className="eq-class-input w-full"
      />
      <button
        type="button"
        className="eq-btn eq-btn-ghost eq-btn-sm mt-2"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setMessage("Bilan copié.");
          } catch {
            field.current?.focus();
            field.current?.select();
            setMessage("Le texte est sélectionné. Utilise la commande Copier.");
          }
        }}
      >
        Copier le bilan
      </button>{" "}
      <span role="status" className="eq-muted text-sm">
        {message}
      </span>
    </details>
  );
}
