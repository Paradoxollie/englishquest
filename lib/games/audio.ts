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
    // Ne coupe que les effets : une dictée ou un dialogue en cours continue.
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

/* ---------------------------------------------------------------------------
 * Voix anglaises (synthèse vocale du navigateur)
 *
 * La dictée et les dialogues sont le contenu même des jeux d'écoute : ils ne
 * dépendent PAS du réglage « effets sonores » (isSoundMuted), qui ne coupe que
 * les bips. Les voix se chargent parfois après coup (Chrome) : on les met en
 * cache et on prévient les écrans qui attendent (useEnglishVoiceStatus).
 * ------------------------------------------------------------------------- */

export function canSpeakEnglish(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type EnglishVoiceStatus = "loading" | "ok" | "no-english" | "unsupported";

let voicesCache: SpeechSynthesisVoice[] = [];
let voicesListenerAttached = false;
const voiceListeners = new Set<() => void>();

function refreshVoices(): SpeechSynthesisVoice[] {
  if (!canSpeakEnglish()) return [];
  try {
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) voicesCache = list;
  } catch {
    /* navigateur sans liste de voix */
  }
  if (!voicesListenerAttached) {
    voicesListenerAttached = true;
    try {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        voicesCache = window.speechSynthesis.getVoices();
        for (const listener of voiceListeners) listener();
      });
    } catch {
      /* ancien navigateur : on se contente de la première lecture */
    }
  }
  return voicesCache;
}

function englishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.filter((voice) => /^en([-_]|$)/i.test(voice.lang));
}

/** État des voix anglaises : « loading » tant que le navigateur n'a pas fourni sa liste. */
export function getEnglishVoiceStatus(): EnglishVoiceStatus {
  if (!canSpeakEnglish()) return "unsupported";
  const voices = refreshVoices();
  if (voices.length === 0) return "loading";
  return englishVoices(voices).length > 0 ? "ok" : "no-english";
}

/** Prévient quand la liste des voix change ; renvoie la fonction de désabonnement. */
export function subscribeToVoices(listener: () => void): () => void {
  refreshVoices();
  voiceListeners.add(listener);
  return () => {
    voiceListeners.delete(listener);
  };
}

const FEMALE_HINT =
  /\b(female|woman|libby|sonia|hazel|kate|serena|samantha|aria|jenny|zira|victoria|susan|emma|amy|olivia|maisie|natasha|clara|tessa|karen|moira|fiona|ava|allison|joanna|kendra|kimberly|salli|michelle|ana)\b/i;
const MALE_HINT =
  /\b(male|man|ryan|george|daniel|oliver|thomas|arthur|david|mark|alex|guy|james|william|brian|christopher|eric|roger|andrew|tom|fred|aaron|matthew|joey|justin|liam|elliot|steffan|davis|tony)\b/i;

function voiceQuality(voice: SpeechSynthesisVoice): number {
  if (/natural|neural|online|premium|enhanced/i.test(voice.name)) return 3;
  if (/google/i.test(voice.name)) return 2;
  return 1;
}

function voiceGender(voice: SpeechSynthesisVoice): "female" | "male" | null {
  if (FEMALE_HINT.test(voice.name)) return "female";
  if (MALE_HINT.test(voice.name)) return "male";
  return null;
}

type SelectedVoice = { voice: SpeechSynthesisVoice | undefined; lang: string; pitch: number };

/**
 * Choisit la meilleure voix anglaise pour un profil : bon genre, bon accent
 * (britannique par défaut), voix « Natural » en priorité, et si possible une
 * voix différente de celles déjà prises par les autres personnages.
 */
function selectEnglishVoice(
  voices: SpeechSynthesisVoice[],
  profile: VoiceProfile | undefined,
  taken: ReadonlySet<SpeechSynthesisVoice> = new Set()
): SelectedVoice {
  const prefersUS = profile === "female_us" || profile === "male_us";
  const wanted: "female" | "male" | null = profile
    ? profile.startsWith("female")
      ? "female"
      : "male"
    : null;
  const pool = englishVoices(voices);
  const fallbackLang = prefersUS ? "en-US" : "en-GB";
  if (pool.length === 0) {
    return { voice: undefined, lang: fallbackLang, pitch: 1 };
  }

  const regionOf = (voice: SpeechSynthesisVoice) => {
    if (prefersUS) return /^en[-_]US/i.test(voice.lang) ? 2 : 0;
    if (/^en[-_]GB/i.test(voice.lang)) return 2;
    if (/^en[-_](IE|AU|NZ)/i.test(voice.lang)) return 1;
    return 0;
  };
  const score = (voice: SpeechSynthesisVoice) => {
    const gender = voiceGender(voice);
    const genderScore = wanted === null ? 0 : gender === wanted ? 6 : gender === null ? 2 : -6;
    const freshScore = taken.has(voice) ? -4 : 0;
    return genderScore + regionOf(voice) * 2 + voiceQuality(voice) + freshScore;
  };

  const chosen = [...pool].sort((a, b) => score(b) - score(a))[0];
  const chosenGender = voiceGender(chosen);
  // Voix au genre inconnu ou déjà prise : on module la hauteur pour distinguer les personnages.
  let pitch = 1;
  if (wanted && chosenGender !== wanted) pitch = wanted === "male" ? 0.82 : 1.15;
  else if (taken.has(chosen)) pitch = wanted === "male" ? 0.88 : 1.1;
  return { voice: chosen, lang: chosen.lang || fallbackLang, pitch };
}

function speakNow(
  text: string,
  options: { rate?: number; pitch?: number; voiceProfile?: VoiceProfile; onEnded?: () => void }
) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    options.onEnded?.();
    return;
  }
  try {
    const token = ++activePlaybackToken;
    clearPendingTimers();
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const { voice, lang, pitch } = selectEnglishVoice(refreshVoices(), options.voiceProfile);
    utterance.lang = lang;
    utterance.rate = options.rate ?? 0.96;
    utterance.pitch = options.pitch ?? pitch;
    if (voice) utterance.voice = voice;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearPendingTimers();
      if (token === activePlaybackToken) options.onEnded?.();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    // Garde-fou si le navigateur ne déclenche jamais onend (mobiles, navigateurs sans affichage).
    const estimatedMs = Math.max(1800, Math.min(20000, Math.round(((cleaned.length / 10) * 1000) / Math.max(0.6, utterance.rate)) + 1600));
    activeTimers.push(window.setTimeout(finish, estimatedMs));
    synth.speak(utterance);
  } catch {
    options.onEnded?.();
  }
}

/** Attend (au plus ~1,2 s) que le navigateur fournisse ses voix, puis exécute `run`. */
function whenVoicesReady(run: () => void) {
  if (refreshVoices().length > 0) {
    run();
    return;
  }
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    unsubscribe();
    run();
  };
  const unsubscribe = subscribeToVoices(go);
  activeTimers.push(window.setTimeout(go, 1200));
}

export function speakEnglish(
  text: string,
  options?: { rate?: number; pitch?: number; voiceProfile?: VoiceProfile; onEnded?: () => void }
) {
  if (!canSpeakEnglish()) {
    options?.onEnded?.();
    return;
  }
  whenVoicesReady(() => speakNow(text, options ?? {}));
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
  if (mp3Url && typeof Audio !== "undefined") {
    stopAllGameAudio();
    const token = ++activePlaybackToken;
    const audio = new Audio(mp3Url);
    audio.playbackRate = rate;
    activeAudioElement = audio;

    const cleanup = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) onEnded?.();
    };
    const fallback = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) speakEnglish(text, { rate, voiceProfile, onEnded });
    };

    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("error", fallback, { once: true });
    void audio.play().catch(fallback);
    return "mp3";
  }

  if (!canSpeakEnglish()) {
    onEnded?.();
    return "muted";
  }
  speakEnglish(text, { rate, voiceProfile, onEnded });
  return "tts";
}

/**
 * Lit un dialogue ou une annonce : le MP3 complet s'il existe dans
 * `public/audio/echo-signal/`, sinon les répliques une à une, avec une voix
 * différente par personnage dès que le navigateur en propose plusieurs.
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
  if (lines.length === 0) {
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
      onLineChange?.(Math.min(lines.length - 1, Math.floor(ratio * lines.length)));
    });

    const finishMp3 = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) {
        onLineChange?.(null);
        onEnded?.();
      }
    };
    const fallback = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      if (token === activePlaybackToken) whenVoicesReady(() => runSequentialTts(token));
    };

    audio.addEventListener("ended", finishMp3, { once: true });
    audio.addEventListener("error", fallback, { once: true });
    void audio.play().catch(fallback);
    return "mp3";
  }

  if (!canSpeakEnglish()) {
    onLineChange?.(null);
    onEnded?.();
    return "muted";
  }

  stopAllGameAudio();
  const token = ++activePlaybackToken;
  whenVoicesReady(() => runSequentialTts(token));
  return "tts";

  function runSequentialTts(runToken: number) {
    if (runToken !== activePlaybackToken) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = refreshVoices();

    // Une voix par personnage, choisie une fois pour tout le dialogue.
    const castBySpeaker = new Map<string, SelectedVoice>();
    const taken = new Set<SpeechSynthesisVoice>();
    for (const line of lines) {
      const key = `${line.speaker}|${line.voiceProfile ?? ""}`;
      if (castBySpeaker.has(key)) continue;
      const selected = selectEnglishVoice(voices, line.voiceProfile, taken);
      castBySpeaker.set(key, selected);
      if (selected.voice) taken.add(selected.voice);
    }

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
        const cast = castBySpeaker.get(`${line.speaker}|${line.voiceProfile ?? ""}`);
        utterance.lang = cast?.lang ?? "en-GB";
        utterance.rate = rate;
        utterance.pitch = cast?.pitch ?? 1;
        if (cast?.voice) utterance.voice = cast.voice;

        let settled = false;
        const advance = () => {
          if (settled || runToken !== activePlaybackToken) return;
          settled = true;
          activeTimers.push(window.setTimeout(() => playIndex(index + 1), 260));
        };
        utterance.onend = advance;
        utterance.onerror = advance;
        const safetyMs = Math.max(1800, Math.min(20000, Math.round(((cleaned.length / 10) * 1000) / Math.max(0.6, rate)) + 1500));
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
