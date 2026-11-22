"use client";

import { useEffect } from "react";

export function OldChapterLink() {
  useEffect(() => {
    function openChapter() {
      const anchor = window.location.hash;
      if (/^#(?:chapitre-[1-5]|mission-courante)$/.test(anchor)) window.location.replace(`/tous-les-cours/parcours${anchor}`);
    }
    openChapter();
    window.addEventListener("hashchange", openChapter);
    return () => window.removeEventListener("hashchange", openChapter);
  }, []);
  return null;
}
