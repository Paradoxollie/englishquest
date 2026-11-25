"use client";

import { useState } from "react";
import type { ClassActionResult } from "@/lib/classes/classes";
import { useClassAction, ActionFeedback } from "./use-class-action";

export function PupilInvitation({ code, firstName, savePrompt }: {
  code: string; firstName: boolean; savePrompt: (firstName: boolean) => Promise<ClassActionResult>;
}) {
  const [message, setMessage] = useState("");
  const save = useClassAction();
  async function copy() {
    const link = new URL("/rejoindre", window.location.origin);
    link.searchParams.set("code", code);
    if (firstName) link.searchParams.set("prenom", "1");
    try { await navigator.clipboard.writeText(link.href); setMessage("Lien élève copié."); }
    catch { setMessage(link.href); }
  }
  return <div className="grid gap-2"><label className="eq-class-field"><span>Consigne pour les invités</span>
    <select className="eq-class-input" value={firstName ? "prenom" : "pseudo"} disabled={save.pending} onChange={e => {
      const useFirstName = e.target.value === "prenom";
      setMessage("");
      save.run(() => savePrompt(useFirstName));
    }}><option value="pseudo">Choisis un pseudo</option><option value="prenom">Indique ton prénom</option></select></label>
    <ActionFeedback result={save.result} />
    <button type="button" disabled={save.pending} className="eq-btn eq-btn-ghost eq-btn-sm" onClick={copy}>Copier le lien élève</button>
    {message && <p role="status" className="text-sm break-all">{message}</p>}</div>;
}
