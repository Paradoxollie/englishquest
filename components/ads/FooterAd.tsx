"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Composant client pour initialiser AdSense
export function FooterAd() {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Vérifier si le script AdSense est chargé
    const checkAdSense = () => {
      if (window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
          console.log("AdSense: Publicité initialisée");
        } catch (e) {
          console.error("AdSense: Erreur lors de l'initialisation", e);
        }
      } else {
        // Réessayer après un court délai si le script n'est pas encore chargé
        setTimeout(checkAdSense, 100);
      }
    };

    // Attendre que le DOM soit prêt
    if (document.readyState === "complete") {
      checkAdSense();
    } else {
      window.addEventListener("load", checkAdSense);
      return () => window.removeEventListener("load", checkAdSense);
    }
  }, []);

  // Message de débogage en développement
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="mt-2 rounded bg-blue-900/20 border border-blue-700/30 p-2 text-xs text-blue-400 text-center max-w-md mx-auto">
        ℹ️ AdSense: Slot ID configuré (1844574488). 
        {adLoaded ? (
          " Publicité initialisée - Les publicités peuvent prendre jusqu&apos;à 48h pour apparaître après l&apos;approbation."
        ) : (
          " En attente du chargement du script AdSense..."
        )}
      </div>
    );
  }

  return null;
}

