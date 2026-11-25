"use client";

import { useActionState, useState } from "react";
import { enterGuestClass } from "@/app/(public)/rejoindre/actions";

export function GuestEntryForm({ code, attempt, firstName }: { code: string; attempt: string; firstName: boolean }) {
  const [error, submit, pending] = useActionState(enterGuestClass, "");
  const [enteredCode, setCode] = useState(code);
  const [name, setName] = useState("");
  return <form action={submit} className="eq-class-form">
    <input type="hidden" name="attempt" value={attempt} />
    <label className="eq-class-field"><span>Code de la classe</span>
      <input className="eq-class-input eq-class-code-input" name="code" value={enteredCode}
        onChange={e => setCode(e.target.value.toUpperCase())} placeholder="6 caractères" maxLength={9} required
        autoComplete="off" autoCapitalize="characters" spellCheck={false} /></label>
    <label className="eq-class-field"><span>{firstName ? "Prénom demandé par ton professeur" : "Pseudo ou prénom"}</span>
      <input className="eq-class-input" name="nickname" value={name} onChange={e => setName(e.target.value)}
        maxLength={24} autoComplete="off" spellCheck={false} required aria-describedby="guest-name-help" />
      <small id="guest-name-help">Suis la consigne de ton prof. Garde ton nom de famille pour toi.</small></label>
    <button className="eq-btn eq-btn-gold" type="submit" disabled={pending}>{pending ? "Entrée en classe…" : "Participer sans compte"}</button>
    {error && <p role="alert" className="eq-class-feedback is-error">{error}</p>}
  </form>;
}
