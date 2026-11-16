"use client";

import { useEffect, useState } from "react";
import { getEnglishVoiceStatus, subscribeToVoices, type EnglishVoiceStatus } from "@/lib/games/audio";

/**
 * État des voix anglaises du navigateur, mis à jour quand la liste arrive.
 * Après ~1,5 s sans aucune voix, on considère qu'il n'y en a pas.
 */
export function useEnglishVoiceStatus(): EnglishVoiceStatus {
  const [status, setStatus] = useState<EnglishVoiceStatus>("loading");

  useEffect(() => {
    const update = () => setStatus(getEnglishVoiceStatus());
    update();
    const unsubscribe = subscribeToVoices(update);
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "no-english" : current));
    }, 1500);
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  return status;
}
