"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

/* Bonus de bienvenue : affiché aux nouveaux comptes, masquable (mémorisé dans ce navigateur). */

function storageKey(userId: string) {
  return `eq-welcome-gold-dismissed:${userId}`;
}

function readDismissed(userId: string) {
  try {
    return window.localStorage.getItem(storageKey(userId)) === "1";
  } catch {
    // Stockage indisponible (navigation privée) : la notice reste affichable.
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function WelcomeGoldNotice({ userId, gold }: { userId: string; gold: number }) {
  // Côté serveur : masquée, pour ne pas la montrer à qui l'a déjà fermée.
  const dismissed = useSyncExternalStore(subscribe, () => readDismissed(userId), () => true);
  const [closed, setClosed] = useState(false);

  if (dismissed || closed) return null;

  const dismiss = () => {
    setClosed(true);
    try {
      window.localStorage.setItem(storageKey(userId), "1");
    } catch {
      // Sans stockage, la notice reviendra à la prochaine visite : sans gravité.
    }
  };

  return (
    <aside className="eq-welcome" aria-labelledby="eq-welcome-title">
      <span className="eq-welcome-coin" aria-hidden="true">
        {gold}
      </span>
      <div className="eq-welcome-text">
        <p id="eq-welcome-title" className="eq-h3">
          Bonus de bienvenue : {gold} or
        </p>
        <p className="text-sm text-[var(--muted)]">
          De quoi t&apos;offrir tout de suite un titre ou un fond dans la boutique. Ensuite, l&apos;or vient des missions et du
          défi du jour.
        </p>
      </div>
      <div className="eq-welcome-actions">
        <Link href="/profile#boutique" className="eq-btn eq-btn-gold eq-btn-sm">
          Ouvrir la boutique
        </Link>
        <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" onClick={dismiss}>
          Plus tard
        </button>
      </div>
    </aside>
  );
}
