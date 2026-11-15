"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectionCodeProps = {
  classLabel: string;
  code: string;
  /** Adresse à taper, sans https:// (par exemple englishquest-omega.vercel.app/rejoindre). */
  joinAddress: string;
  backHref: string;
  archived: boolean;
};

/**
 * Le code en très grand, seul à l'écran, lisible du fond de la salle.
 * Recouvre l'en-tête et le pied de page du site ; « Plein écran » masque aussi
 * le navigateur.
 */
export function ProjectionCode({ classLabel, code, joinAddress, backHref, archived }: ProjectionCodeProps) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Navigateur sans plein écran (certains iPhone) : la vue reste lisible telle quelle.
    }
  }

  return (
    <div className="eq-projection" role="dialog" aria-modal="true" aria-labelledby="projection-title">
      <div className="eq-projection-bar">
        <p id="projection-title" className="eq-projection-class">
          {classLabel}
        </p>
        <div className="eq-projection-tools">
          <button type="button" className="eq-btn eq-btn-ghost eq-btn-sm" onClick={toggleFullscreen}>
            {fullscreen ? "Quitter le plein écran" : "Plein écran"}
          </button>
          <Link href={backHref} className="eq-btn eq-btn-ghost eq-btn-sm">
            Fermer
          </Link>
        </div>
      </div>

      {archived ? (
        <p className="eq-projection-warning">Classe archivée : ce code ne permet plus de la rejoindre.</p>
      ) : null}

      <div className="eq-projection-body">
        <p className="eq-projection-step">
          <span className="eq-projection-num" aria-hidden="true">
            1
          </span>
          Allez sur <b className="eq-projection-url">{joinAddress}</b>
        </p>
        <p className="eq-projection-step">
          <span className="eq-projection-num" aria-hidden="true">
            2
          </span>
          Tapez le code de la classe
        </p>
        <p className="eq-projection-code" aria-label={`Code : ${code.split("").join(" ")}`}>
          {code.split("").map((character, index) => (
            <span key={`${character}-${index}`}>{character}</span>
          ))}
        </p>
        <p className="eq-projection-foot">Pas encore de compte ? Le site propose d&apos;en créer un d&apos;abord, sans adresse e-mail.</p>
      </div>
    </div>
  );
}
