"use client";

import { useEffect, useState } from "react";

const savedKey = "eq-contact-private-receipt-v1";

export function ReceiptLink({ path, remember = false }: { path: string; remember?: boolean }) {
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState("");

  async function copy() {
    const url = new URL(path, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Lien copié.");
    } catch {
      setManual(url);
      setStatus("Sélectionne le lien pour le copier.");
    }
  }

  function save() {
    try {
      localStorage.setItem(savedKey, path);
      window.dispatchEvent(new Event("eq:contact-link"));
      setStatus("Tu retrouveras ce lien sur la page Contact de cet appareil.");
    } catch { setStatus("Cet appareil ne peut pas garder le lien. Utilise « Copier le lien privé »."); }
  }

  return <div className="grid gap-2">
    <div className="flex flex-wrap gap-2">
      <a href={path} className="eq-btn eq-btn-primary">Ouvrir le suivi privé</a>
      <button type="button" className="eq-btn eq-btn-ghost" onClick={copy}>Copier le lien privé</button>
      {remember && <button type="button" className="eq-btn eq-btn-ghost" onClick={save}>Garder sur mon appareil personnel</button>}
    </div>
    {manual && <input aria-label="Lien privé à copier" readOnly value={manual} onFocus={e => e.target.select()} className="eq-input w-full" />}
    <p role="status" className="eq-muted text-sm">{status}</p>
  </div>;
}

export function SavedReceipt() {
  const [path, setPath] = useState("");
  useEffect(() => {
    function read() {
      try {
        const value = localStorage.getItem(savedKey) ?? "";
        setPath(/^\/contact\/suivi#[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(value) ? value : "");
      } catch { setPath(""); }
    }
    read();
    window.addEventListener("eq:contact-link", read);
    return () => window.removeEventListener("eq:contact-link", read);
  }, []);
  if (!path) return null;
  return <div className="eq-inset flex flex-wrap gap-2 p-3">
    <a className="eq-btn eq-btn-primary" href={path}>Retrouver mon échange</a>
    <button type="button" className="eq-btn eq-btn-ghost" onClick={() => {
      try { localStorage.removeItem(savedKey); } catch { /* Storage can be disabled by the browser. */ }
      setPath("");
    }}>Oublier sur cet appareil</button>
  </div>;
}
