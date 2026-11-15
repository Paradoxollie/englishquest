"use client";

const MUTE_STORAGE_KEY = "eq-sound-muted";

let audioContext: AudioContext | null = null;
let cachedMuted: boolean | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }
  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!audioContext) {
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function isSoundMuted(): boolean {
  if (cachedMuted !== null) {
    return cachedMuted;
  }
  if (typeof window === "undefined") {
    return false;
  }
  try {
    cachedMuted = window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    cachedMuted = false;
  }
  return cachedMuted;
}

export function setSoundMuted(muted: boolean): boolean {
  cachedMuted = muted;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    if (muted && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speech cancellation errors.
      }
    }
  }
  return cachedMuted;
}

function playTone(
  frequency: number,
  durationSec: number,
  type: OscillatorType = "triangle",
  gainPeak = 0.08,
  delaySec = 0
) {
  if (isSoundMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const start = ctx.currentTime + delaySec;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + durationSec + 0.02);
  } catch {
    // Audio playback is best-effort.
  }
}

export function playSoundEffect(effect: "correct" | "wrong" | "combo" | "victory" | "tick") {
  if (isSoundMuted()) return;
  switch (effect) {
    case "correct":
      playTone(523.25, 0.11, "triangle", 0.075, 0);
      playTone(659.25, 0.15, "triangle", 0.08, 0.06);
      break;
    case "wrong":
      playTone(220, 0.14, "sawtooth", 0.045, 0);
      playTone(174.61, 0.18, "sawtooth", 0.04, 0.09);
      break;
    case "combo":
      playTone(587.33, 0.09, "triangle", 0.07, 0);
      playTone(783.99, 0.1, "triangle", 0.075, 0.055);
      playTone(1046.5, 0.16, "triangle", 0.08, 0.11);
      break;
    case "victory":
      playTone(523.25, 0.12, "triangle", 0.075, 0);
      playTone(659.25, 0.12, "triangle", 0.075, 0.08);
      playTone(783.99, 0.12, "triangle", 0.08, 0.16);
      playTone(1046.5, 0.28, "triangle", 0.09, 0.24);
      break;
    case "tick":
      playTone(440, 0.05, "sine", 0.03, 0);
      break;
  }
}

export function canSpeakEnglish(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakEnglish(text: string, options?: { rate?: number; pitch?: number }) {
  if (isSoundMuted() || !canSpeakEnglish()) return;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return;

  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "en-GB";
    utterance.rate = options?.rate ?? 0.96;
    utterance.pitch = options?.pitch ?? 1;

    const voices = synth.getVoices();
    const preferred =
      voices.find((voice) => /^en[-_]GB/i.test(voice.lang)) ??
      voices.find((voice) => /^en[-_]US/i.test(voice.lang)) ??
      voices.find((voice) => /^en/i.test(voice.lang));
    if (preferred) {
      utterance.voice = preferred;
      utterance.lang = preferred.lang;
    }

    synth.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on restricted browsers.
  }
}
