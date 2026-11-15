"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Écouter une phrase anglaise du cours : l'élève sélectionne le texte, un
 * bouton apparaît en bas de l'écran et la voix anglaise du navigateur la lit.
 * Gratuit, sans serveur, fonctionne hors ligne quand la voix est installée.
 * Rien ne s'affiche si le navigateur ne sait pas parler.
 */

const MAX_LENGTH = 300;

function pickEnglishVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => voice.lang === "en-GB") ??
    voices.find((voice) => voice.lang.startsWith("en-GB")) ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    null
  );
}

export function SpeakSelection({ scopeSelector = ".eq-lesson-body" }: { scopeSelector?: string }) {
  const [supported, setSupported] = useState(false);
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voiceRef.current = pickEnglishVoice(synth.getVoices());
    };
    loadVoices();
    synth.addEventListener?.("voiceschanged", loadVoices);
    const enable = window.setTimeout(() => setSupported(true), 0);

    let timer: number | undefined;
    const onSelection = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const selection = window.getSelection();
        const value = selection?.toString().replace(/\s+/g, " ").trim() ?? "";
        const anchor = selection?.anchorNode instanceof Element ? selection.anchorNode : selection?.anchorNode?.parentElement;
        const inScope = Boolean(anchor?.closest(scopeSelector));
        setText(inScope && value.length > 0 && value.length <= MAX_LENGTH ? value : "");
      }, 150);
    };
    document.addEventListener("selectionchange", onSelection);

    return () => {
      window.clearTimeout(enable);
      window.clearTimeout(timer);
      document.removeEventListener("selectionchange", onSelection);
      synth.removeEventListener?.("voiceschanged", loadVoices);
      synth.cancel();
    };
  }, [scopeSelector]);

  if (!supported) return null;

  const speak = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceRef.current?.lang ?? "en-GB";
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <>
      <p className="eq-speak-hint">Pour entendre une phrase anglaise, sélectionne-la : un bouton « Écouter » apparaît.</p>
      {text ? (
        <button
          type="button"
          className="eq-speak-button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={speak}
          aria-live="polite"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
            <path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {speaking ? "Lecture…" : "Écouter"}
          <span className="eq-speak-preview">{text.length > 40 ? `${text.slice(0, 38)}…` : text}</span>
        </button>
      ) : null}
    </>
  );
}
