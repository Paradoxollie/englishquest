"use client";

import { useEffect } from "react";

export const GAME_FOCUS_CLASS = "eq-game-focus";

/**
 * Mode concentration des jeux sur téléphone.
 *
 * Tant que `active` est vrai (partie en cours, ni en pause ni terminée), la
 * classe `eq-game-focus` est posée sur <body>. Le CSS (fin de globals.css,
 * sous 768 px seulement) masque alors l'en-tête et le pied du site, l'en-tête
 * du jeu et le bandeau invité, compacte le HUD et cale la zone de jeu sur la
 * partie visible de l'écran.
 *
 * La hauteur et le décalage du viewport visuel (`window.visualViewport`) sont
 * recopiés dans `--eq-vv-height` et `--eq-vv-top` : quand le clavier du
 * téléphone s'ouvre (Wordfall), la zone de jeu et le champ de saisie restent
 * au-dessus du clavier.
 */
export function useGameFocusMode(active: boolean) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const body = document.body;
    const root = document.documentElement;
    body.classList.add(GAME_FOCUS_CLASS);

    const viewport = window.visualViewport;
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = viewport ? viewport.height : window.innerHeight;
        const top = viewport ? viewport.offsetTop : 0;
        root.style.setProperty("--eq-vv-height", `${Math.round(height)}px`);
        root.style.setProperty("--eq-vv-top", `${Math.round(top)}px`);
      });
    };
    sync();
    viewport?.addEventListener("resize", sync);
    viewport?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);

    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", sync);
      viewport?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      body.classList.remove(GAME_FOCUS_CLASS);
      root.style.removeProperty("--eq-vv-height");
      root.style.removeProperty("--eq-vv-top");
    };
  }, [active]);
}
