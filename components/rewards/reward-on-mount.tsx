"use client";

import { useEffect, useRef } from "react";
import { dispatchReward, type RewardEventDetail } from "@/lib/profile/reward-events";

/**
 * Célèbre une récompense calculée par le serveur pendant le rendu de la page
 * (par exemple un badge rattrapé à l'ouverture de l'accueil). Une seule fois.
 */
export function RewardOnMount({ detail }: { detail: RewardEventDetail }) {
  const sentRef = useRef(false);
  useEffect(() => {
    if (sentRef.current) return;
    // Laisse RewardCelebrations s'abonner avant l'envoi. Le drapeau n'est posé
    // qu'à l'envoi : le double montage du mode strict n'avale pas l'événement.
    const timer = window.setTimeout(() => {
      sentRef.current = true;
      dispatchReward(detail);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [detail]);
  return null;
}
