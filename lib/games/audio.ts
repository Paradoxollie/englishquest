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
let changeRecordingPause: ((pause: boolean) => void) | null = null;
let activePlaybackToken = 0;
let activeTimers: number[] = [];
let activeCleanup: (() => void) | null = null;

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
  activeCleanup?.();
  activeCleanup = null;
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
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

/** Pause the current recording in place. Synthesised speech has no reliable audio cursor. */
export function setRecordingPaused(paused: boolean): boolean {
  if (!changeRecordingPause) return false;
  changeRecordingPause(paused);
  return true;
}

/** Recorded speech can change speed without restarting the message. */
export function setRecordingRate(rate: number) {
  if (!activeAudioElement) return false;
  activeAudioElement.playbackRate = rate;
  return true;
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

type SelectedVoice = { voice: SpeechSynthesisVoice | undefined; lang: string };

/**
 * Choisit la meilleure voix anglaise pour un profil : bon genre, bon accent
 * (américain par défaut), voix « Natural » en priorité, et si possible une
 * voix différente de celles déjà prises par les autres personnages.
 */
function selectEnglishVoice(
  voices: SpeechSynthesisVoice[],
  profile: VoiceProfile | undefined,
  taken: ReadonlySet<SpeechSynthesisVoice> = new Set()
): SelectedVoice {
  const prefersUS = !profile || profile.endsWith("_us");
  const wanted: "female" | "male" | null = profile
    ? profile.startsWith("female")
      ? "female"
      : "male"
    : null;
  const pool = englishVoices(voices);
  const fallbackLang = prefersUS ? "en-US" : "en-GB";
  if (pool.length === 0) {
    return { voice: undefined, lang: fallbackLang };
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
  return { voice: chosen, lang: chosen.lang || fallbackLang };
}

type PlaybackError = "unavailable" | "blocked";
type PlaybackOptions = {
  rate?: number;
  pitch?: number;
  onEnded?: () => void;
  onError?: (reason: PlaybackError) => void;
};

type LineOptions = PlaybackOptions & {
  onLineChange?: (index: number | null) => void;
  onProgress?: (elapsed: number, duration: number) => void;
};

function waitForEnglishVoices(
  token: number,
  ready: (voices: SpeechSynthesisVoice[]) => void,
  failed: () => void
) {
  if (!canSpeakEnglish()) return failed();
  const initial = refreshVoices();
  if (initial.length) return englishVoices(initial).length ? ready(initial) : failed();

  let done = false;
  const finish = () => {
    if (done || activePlaybackToken !== token) return;
    done = true;
    detach();
    clearPendingTimers();
    const voices = refreshVoices();
    if (englishVoices(voices).length) ready(voices);
    else failed();
  };
  const detach = subscribeToVoices(finish);
  activeCleanup = detach;
  activeTimers.push(window.setTimeout(finish, 1500));
}

function playLines(token: number, lines: readonly DialogueAudioLine[], options: LineOptions) {
  const failed = (reason: PlaybackError = "unavailable") => {
    if (token !== activePlaybackToken) return;
    activeCleanup?.();
    activeCleanup = null;
    clearPendingTimers();
    options.onLineChange?.(null);
    options.onError?.(reason);
  };
  waitForEnglishVoices(token, (voices) => {
    const cast = new Map<string, SelectedVoice>();
    const taken = new Set<SpeechSynthesisVoice>();
    for (const line of lines) {
      if (cast.has(line.speaker)) continue;
      const voice = selectEnglishVoice(voices, line.voiceProfile, taken);
      cast.set(line.speaker, voice);
      if (voice.voice) taken.add(voice.voice);
    }
    function playLine(index: number) {
      if (token !== activePlaybackToken) return;
      const line = lines[index];
      if (!line) {
        options.onLineChange?.(null);
        options.onEnded?.();
        return;
      }
      const selection = cast.get(line.speaker);
      try {
        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.voice = selection?.voice ?? null;
        utterance.lang = selection?.lang ?? "en-US";
        utterance.rate = options.rate ?? 1;
        utterance.pitch = options.pitch ?? 1;
        let done = false;
        function finish(error?: PlaybackError) {
          if (done || token !== activePlaybackToken) return;
          done = true;
          clearPendingTimers();
          activeCleanup?.();
          activeCleanup = null;
          if (error) {
            try { window.speechSynthesis.cancel(); } catch { /* already stopped */ }
            failed(error);
            return;
          }
          if (index + 1 < lines.length) {
            activeTimers.push(window.setTimeout(() => playLine(index + 1), 260));
          } else {
            options.onLineChange?.(null);
            options.onEnded?.();
          }
        }
        activeCleanup = () => {
          utterance.onstart = null;
          utterance.onend = null;
          utterance.onerror = null;
        };
        utterance.onstart = () => options.onLineChange?.(index);
        utterance.onend = () => finish();
        utterance.onerror = event => finish(event?.error === "not-allowed" ? "blocked" : "unavailable");
        const timeout = Math.max(8000, (line.text.length / (8 * utterance.rate)) * 1000 + 6000);
        activeTimers.push(window.setTimeout(() => finish("unavailable"), timeout));
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        failed(error instanceof Error && error.name === "NotAllowedError" ? "blocked" : "unavailable");
      }
    }
    playLine(0);
  }, failed);
}

function playSpeech(
  mp3Url: string | null | undefined,
  lines: readonly DialogueAudioLine[],
  options: LineOptions,
  lineStarts?: readonly number[]
): "mp3" | "tts" | "muted" {
  stopAllGameAudio();
  const token = activePlaybackToken;
  if (!lines.length || !lines.some(line => line.text.trim())) {
    options.onError?.("unavailable");
    return "muted";
  }
  const fallback = () => {
    options.onProgress?.(0, 0);
    playLines(token, lines, options);
  };
  if (!mp3Url || typeof Audio === "undefined") {
    fallback();
    return canSpeakEnglish() ? "tts" : "muted";
  }

  try {
    const player = new Audio(mp3Url);
    activeAudioElement = player;
    player.playbackRate = options.rate ?? 1;
    player.preservesPitch = true;
    let settled = false;
    let paused = false;
    let playAttempt = 0;
    let lastLine = -1;
    function settle(result: "ended" | "blocked" | "error") {
      if (settled || token !== activePlaybackToken) return;
      settled = true;
      activeCleanup?.();
      activeCleanup = null;
      clearPendingTimers();
      activeAudioElement = null;
      player.pause();
      options.onLineChange?.(null);
      if (result === "ended") options.onEnded?.();
      else if (result === "blocked") options.onError?.("blocked");
      else fallback();
    }
    const publishProgress = () => {
      if (settled || token !== activePlaybackToken) return;
      if (Number.isFinite(player.duration) && player.duration > 0) {
        options.onProgress?.(player.currentTime, player.duration);
      }
    };
    const monitor = () => {
      if (token !== activePlaybackToken || settled || paused) return;
      publishProgress();
      clearPendingTimers();
      activeTimers.push(window.setTimeout(() => settle("error"), 10000));
      // Without actual cues, only a single-speaker recording has a known speaker.
      const index = lineStarts?.length === lines.length
        ? Math.max(0, lineStarts.filter(start => start <= player.currentTime).length - 1)
        : lines.length === 1 ? 0 : -1;
      if (lastLine !== index) {
        lastLine = index;
        options.onLineChange?.(index >= 0 ? index : null);
      }
    };
    activeCleanup = () => {
      player.onended = null;
      player.onerror = null;
      player.ontimeupdate = null;
      player.onloadedmetadata = null;
      player.onplaying = null;
      changeRecordingPause = null;
    };
    player.onended = () => { publishProgress(); settle("ended"); };
    player.onloadedmetadata = publishProgress;
    player.onerror = () => settle("error");
    player.onplaying = monitor;
    player.ontimeupdate = monitor;
    const startPlayback = () => {
      const attempt = ++playAttempt;
      clearPendingTimers();
      activeTimers.push(window.setTimeout(() => settle("error"), 10000));
      const failed = (error: unknown) => {
        if (attempt === playAttempt && !paused) {
          settle(error instanceof Error && error.name === "NotAllowedError" ? "blocked" : "error");
        }
      };
      try { void player.play()?.catch(failed); } catch (error) { failed(error); }
    };
    changeRecordingPause = (pause) => {
      if (pause === paused || settled) return;
      paused = pause;
      if (pause) {
        playAttempt++;
        clearPendingTimers();
        player.pause();
        publishProgress();
      } else {
        startPlayback();
      }
    };
    startPlayback();
    return "mp3";
  } catch {
    fallback();
    return canSpeakEnglish() ? "tts" : "muted";
  }
}

export function speakEnglish(
  text: string, options: PlaybackOptions & { voiceProfile?: VoiceProfile } = {}
) {
  return playClipOrSpeak({ text, ...options });
}

export function playClipOrSpeak({
  mp3Url, text, voiceProfile, ...options
}: PlaybackOptions & { mp3Url?: string | null; text: string; voiceProfile?: VoiceProfile }) {
  return playSpeech(mp3Url, [{ speaker: "Voice", text, voiceProfile }], options);
}

export function playDialogueOrSpeak({
  mp3Url, lines, lineStarts, ...options
}: LineOptions & {
  mp3Url?: string | null;
  lines: readonly DialogueAudioLine[];
  lineStarts?: readonly number[];
}) {
  return playSpeech(mp3Url, lines, options, lineStarts);
}
