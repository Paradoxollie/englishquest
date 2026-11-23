"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmReading({ reference, notice, confirm, onSaved }: {
  reference: string; notice: string;
  confirm: (reference: string, notice: string) => Promise<boolean>;
  onSaved?: () => Promise<void>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  async function acknowledge() {
    setPending(true);
    try {
      const saved = await confirm(reference, notice);
      setStatus(saved ? "Lecture confirmée." : "Actualise l’échange pour consulter sa dernière réponse.");
      if (onSaved) await onSaved();
      else {
        window.dispatchEvent(new Event("eq:contact-notices"));
        router.refresh();
      }
    } catch { setStatus("Réessaie dans un instant."); }
    finally { setPending(false); }
  }
  return <div>
    <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" disabled={pending} onClick={acknowledge}>Confirmer ma lecture à l’équipe</button>
    {status && <p role="status" className="eq-muted text-sm">{status}</p>}
  </div>;
}
