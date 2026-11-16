"use client";

const MUTE_STORAGE_KEY = "eq-sound-muted";

export type VoiceProfile = "female_uk" | "male_uk" | "female_us" | "male_us";

export type DialogueAudioLine = {
  speaker: string;
  voiceProfile?: VoiceProfile;
  text: string;
};

let audioContext: AudioContext | null = null;
let cachedMuted: boolean | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let activePlaybackToken = 0;
let activeTimers: number[] = [];

function clearPendingTimers() {
  if (typeof window === "undefined") return;
  for (const id of activeTimers) {
    window.clearTimeout(id);
  }
  activeTimers = [];
}

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

export function stopAllGameAudio() {
  activePlaybackToken += 1;
  clearPendingTimers();
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore cleanup failures.
    }
    activeAudioElement = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speech cancellation errors.
    }
  }
}

export function setSoundMuted(muted: boolean): boolean {
  cachedMuted = muted;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
    } catch {
      // Ignore storage failures in restricted contexts.
    }
    if (muted) {
      stopAllGameAudio();
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

function selectEnglishVoice(voices: SpeechSynthesisVoice[], profile?: VoiceProfile): {
  voice: SpeechSynthesisVoice | undefined;
  lang: string;
  pitchAdjust: number;
} {
  const prefersUS = profile === "female_us" || profile === "male_us";
  const wantsFemale = profile === "female_uk" || profile === "female_us";
  const enVoices = voices.filter((voice) => /^en/i.test(voice.lang));
  const regional = enVoices.filter((voice) => (prefersUS ? /^en[-_]US/i : /^en[-_]GB/i).test(voice.lang));
  const pool = regional.length > 0 ? regional : enVoices;

  const femaleHints = /(female|libby|sonia|hazel|kate|serena|samantha|aria|jenny|zira|victoria)/i;
  const maleHints = /(male|ryan|george|daniel|oliver|thomas|arthur|david|mark|alex|guy)/i;
  const hinted = pool.find((voice) => (wantsFemale ? femaleHints : maleHints).test(voice.name));
  const chosen = hinted ?? (wantsFemale ? pool[0] : pool[pool.length - 1] ?? pool[0]);

  return {
    voice: chosen,
    lang: chosen?.lang ?? (prefersUS ? "en-US" : "en-GB"),
    pitchAdjust: hinted ? 1 : profile ? (wantsFemale ? 1.06 : 0.94) : 1,
  };
}

export function speakEnglish(
  text: string,
  options?: { rate?: number; pitch?: number; voiceProfile?: VoiceProfile; onEnded?: () => void }
) {
  if (isSoundMuted() || !canSpeakEnglish()) {
    options?.onEnded?.();
    return;
  }
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    options?.onEnded?.();
    return;
  }

  try {
    const token = ++activePlaybackToken;
    clearPendingTimers();
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const { voice, lang, pitchAdjust } = selectEnglishVoice(synth.getVoices(), options?.voiceProfile);
    utterance.lang = lang;
    utterance.rate = options?.rate ?? 0.96;
    utterance.pitch = options?.pitch ?? pitchAdjust;
    if (voice) {
      utterance.voice = voice;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearPendingTimers();
      if (token === activePlaybackToken) {
        options?.onEnded?.();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    // Garde-fou si speechSynthesis ne déclenche pas onend dans certains navigateurs mobiles/headless.
    const estimatedMs = Math.max(1800, Math.min(18000, Math.round((cleaned.length / 10) * 1000 / Math.max(0.6, utterance.rate)) + 1600));
    activeTimers.push(window.setTimeout(finish, estimatedMs));

    synth.speak(utterance);
  } catch {
    options?.onEnded?.();
  }
}

/**
 * Lit un fichier MP3 statique s'il est disponible sur le serveur, sinon
 * bascule proprement sur la synthèse vocale anglaise.
 */
export function playClipOrSpeak({
  mp3Url,
  text,
  rate = 0.96,
  voiceProfile,
  onEnded,
}: {
  mp3Url?: string | null;
  text: string;
  rate?: number;
  voiceProfile?: VoiceProfile;
  onEnded?: () => void;
}): "mp3" | "tts" | "muted" {
  if (isSoundMuted()) {
    onEnded?.();
    return "muted";
  }

  if (mp3Url && typeof Audio !== "undefined") {
    stopAllGameAudio();
    const token = ++activePlaybackToken;
    const audio = new Audio(mp3Url);
    audio.playbackRate = rate;
    activeAudioElement = audio;

    const cleanup = () => {
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      if (token === activePlaybackToken) {
        onEnded?.();
      }
    };

    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener(
      "error",
      () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        if (token === activePlaybackToken) {
          speakEnglish(text, { rate, voiceProfile, onEnded });
        }
      },
      { once: true }
    );

    void audio.play().catch(() => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) {
        speakEnglish(text, { rate, voiceProfile, onEnded });
      }
    });
    return "mp3";
  }

  speakEnglish(text, { rate, voiceProfile, onEnded });
  return canSpeakEnglish() ? "tts" : "muted";
}

/**
 * Lit un dialogue ou une annonce audio : utilise le MP3 statique complet
 * s'il existe dans `public/audio/echo-signal/`, sinon enchaîne les répliques
 * avec changement de voix en synthèse vocale.
 */
export function playDialogueOrSpeak({
  mp3Url,
  lines,
  rate = 0.96,
  onLineChange,
  onEnded,
}: {
  mp3Url?: string | null;
  lines: readonly DialogueAudioLine[];
  rate?: number;
  onLineChange?: (index: number | null) => void;
  onEnded?: () => void;
}): "mp3" | "tts" | "muted" {
  if (isSoundMuted() || lines.length === 0) {
    onLineChange?.(null);
    onEnded?.();
    return "muted";
  }

  if (mp3Url && typeof Audio !== "undefined") {
    stopAllGameAudio();
    const token = ++activePlaybackToken;
    const audio = new Audio(mp3Url);
    audio.playbackRate = rate;
    activeAudioElement = audio;
    onLineChange?.(0);

    audio.addEventListener("timeupdate", () => {
      if (token !== activePlaybackToken || !audio.duration || !Number.isFinite(audio.duration)) return;
      const ratio = audio.currentTime / audio.duration;
      const idx = Math.min(lines.length - 1, Math.floor(ratio * lines.length));
      onLineChange?.(idx);
    });

    const finishMp3 = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) {
        onLineChange?.(null);
        onEnded?.();
      }
    };

    audio.addEventListener("ended", finishMp3, { once: true });
    audio.addEventListener(
      "error",
      () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        if (token === activePlaybackToken) {
          runSequentialTts(token);
        }
      },
      { once: true }
    );

    void audio.play().catch(() => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) {
        runSequentialTts(token);
      }
    });
    return "mp3";
  }

  stopAllGameAudio();
  const token = ++activePlaybackToken;
  runSequentialTts(token);
  return canSpeakEnglish() ? "tts" : "muted";

  function runSequentialTts(runToken: number) {
    if (!canSpeakEnglish()) {
      onLineChange?.(null);
      onEnded?.();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();

    const playIndex = (index: number) => {
      if (runToken !== activePlaybackToken) return;
      if (index >= lines.length) {
        onLineChange?.(null);
        onEnded?.();
        return;
      }

      const line = lines[index];
      onLineChange?.(index);
      const cleaned = line.text.replace(/\s+/g, " ").trim();
      if (!cleaned) {
        playIndex(index + 1);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(cleaned);
        const { voice, lang, pitchAdjust } = selectEnglishVoice(voices, line.voiceProfile);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitchAdjust;
        if (voice) {
          utterance.voice = voice;
        }

        let settled = false;
        const advance = () => {
          if (settled || runToken !== activePlaybackToken) return;
          settled = true;
          const timerId = window.setTimeout(() => playIndex(index + 1), 240);
          activeTimers.push(timerId);
        };

        utterance.onend = advance;
        utterance.onerror = advance;
        const safetyMs = Math.max(1800, Math.min(18000, Math.round((cleaned.length / 10) * 1000 / Math.max(0.6, rate)) + 1500));
        activeTimers.push(window.setTimeout(advance, safetyMs));

        synth.speak(utterance);
      } catch {
        onLineChange?.(null);
        onEnded?.();
      }
    };

    playIndex(0);
  }
}
