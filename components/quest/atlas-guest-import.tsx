"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { importGuestAtlas } from "@/app/quest/atlas/actions";

export function AtlasGuestImport() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  async function transfer() {
    setBusy(true);
    try {
      if (await importGuestAtlas()) router.refresh();
      else setNotice("La synchronisation est indisponible. Tu peux réessayer.");
    } catch { setNotice("Connexion interrompue. Tu peux réessayer."); }
    finally { setBusy(false); }
  }
  return <div className="atlas-import"><p>Tu as validé des épreuves en invité sur cet appareil. Si c’est bien ta partie, tu peux la rattacher à ton compte.</p>
    <button className="atlas-talk-link" disabled={busy} onClick={transfer}>{busy ? "Enregistrement…" : "Récupérer mes étapes validées"}</button>
    {notice && <p role="status">{notice}</p>}</div>;
}
