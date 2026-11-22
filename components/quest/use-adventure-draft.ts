"use client";

import { useCallback, useRef } from "react";
import { saveAdventureDraft } from "@/app/quest/atlas/draft-actions";
import type { AccountDraft, Draft } from "@/lib/adventure/activities";

export function useAdventureDraft(id: number, key: string, stage: number, initial: AccountDraft) {
  const state = useRef({ stage, version: initial.version, latest: null as Draft | null,
    saved: JSON.stringify(initial.data), conflicted: false, flight: null as Promise<void> | null });
  const track = useCallback((draft: Draft, cloud: boolean) => {
    const slot = state.current;
    if (slot.stage !== draft.index) {
      slot.stage = draft.index; slot.version = 0; slot.saved = ""; slot.conflicted = false;
    }
    slot.latest = cloud && !draft.replaying && draft.opened ? draft : null;
    try { localStorage.setItem(key, JSON.stringify({ ...draft, cloudVersion: slot.version })); } catch { /* Account storage is independent. */ }
  }, [key]);
  const flush = useCallback(async () => {
    const slot = state.current;
    if (slot.flight) await slot.flight;
    if (!slot.latest || slot.conflicted || slot.flight || JSON.stringify(slot.latest) === slot.saved) return;
    slot.flight = (async () => {
      while (slot.latest && !slot.conflicted) {
        const value = slot.latest, snapshot = JSON.stringify(value);
        if (snapshot === slot.saved) break;
        const version = await saveAdventureDraft(id, slot.version, value);
        if (value.index !== slot.stage) continue;
        if (version < 0) { slot.conflicted = true; break; }
        slot.version = version; slot.saved = snapshot;
        try {
          const local = JSON.parse(localStorage.getItem(key) ?? "null");
          if (local?.index === value.index) localStorage.setItem(key, JSON.stringify({ ...local, cloudVersion: version }));
        } catch { /* Resume on the account still works. */ }
      }
    })().catch(() => { /* Retry at the next change or explicit exit. */ });
    try { await slot.flight; } finally { slot.flight = null; }
  }, [id, key]);
  return { track, flush };
}
