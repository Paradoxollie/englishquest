const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const source = path.join(root, "lib/games/audio.ts");
const compiled = ts.transpileModule(fs.readFileSync(source, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function setup(voices, playError) {
  const timers = new Map();
  let nextTimer = 0;
  const recordings = [], utterances = [], changes = [], errors = [], completions = [];
  global.window = {
    setTimeout(fn, delay) { timers.set(++nextTimer, { fn, delay }); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
  };
  if (voices) window.speechSynthesis = {
    getVoices: () => voices, addEventListener() {}, cancel() {}, speak: utterance => utterances.push(utterance),
  };
  global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  global.Audio = class {
    constructor(url) { this.url = url; this.currentTime = 0; recordings.push(this); }
    play() { this.plays = (this.plays || 0) + 1; this.paused = false; return playError ? Promise.reject(playError) : Promise.resolve(); }
    pause() { this.paused = true; }
  };
  const mod = new Module(source, module);
  mod._compile(compiled, source);
  return {
    api: mod.exports, timers, recordings, utterances, changes, errors, completions,
    options: {
      onError: reason => errors.push(reason), onEnded: () => completions.push(true),
      onLineChange: index => changes.push(index),
    },
    fireTimer(delay) {
      const found = [...timers].find(([, value]) => value.delay === delay);
      assert.ok(found, `missing timer for ${delay} ms`);
      timers.delete(found[0]);
      found[1].fn();
    },
  };
}

const cast = [
  { name: "Jenny Natural", lang: "en-US" }, { name: "Guy Natural", lang: "en-US" },
  { name: "Thomas", lang: "fr-FR" }, { name: "Libby Natural", lang: "en-GB" },
];
const lines = [
  { speaker: "Customer", text: "A tea, please.", voiceProfile: "female_us" },
  { speaker: "Barista", text: "Certainly.", voiceProfile: "male_us" },
];
async function run() {
  {
    const a = setup();
    a.api.playDialogueOrSpeak({ ...a.options, mp3Url: "/cafe.mp3", lines, lineStarts: [0, 4.6] });
    const recording = a.recordings[0];
    recording.onplaying();
    recording.currentTime = 1.3; recording.ontimeupdate();
    assert.deepEqual(a.changes, [0]);
    recording.currentTime = 4.61; recording.ontimeupdate();
    assert.deepEqual(a.changes, [0, 1]);
    assert.equal(a.api.setRecordingRate(0.8), true);
    assert.equal(recording.playbackRate, 0.8);
    assert.equal(recording.preservesPitch, true);
    a.api.setSoundMuted(true);
    assert.equal(recording.paused, false);
    recording.onended();
    assert.deepEqual(a.completions, [true]); assert.deepEqual(a.errors, []); assert.equal(a.timers.size, 0);
  }
  {
    const a = setup();
    const times = [];
    a.api.playDialogueOrSpeak({ ...a.options, mp3Url: "/dialogue.mp3", lines,
      onProgress: (elapsed, duration) => times.push([elapsed, duration]) });
    const recording = a.recordings[0];
    recording.duration = 9;
    recording.currentTime = 2.4;
    recording.ontimeupdate();
    assert.deepEqual(times.at(-1), [2.4, 9]);
    assert.equal(a.api.setRecordingPaused(true), true);
    assert.equal(recording.paused, true);
    assert.equal(a.timers.size, 0, "media stall timer stays off during a deliberate pause");
    assert.deepEqual(a.completions, []);
    assert.equal(a.api.setRecordingPaused(false), true);
    assert.equal(recording.paused, false);
    assert.equal(recording.plays, 2);
    assert.equal(recording.currentTime, 2.4);
    assert.equal(a.recordings.length, 1);
    assert.equal(a.timers.size, 1);
    const ended = recording.onended;
    recording.currentTime = 9;
    ended();
    const eventCount = times.length;
    ended();
    assert.equal(times.length, eventCount);
    assert.deepEqual(times.at(-1), [9, 9]);
    assert.deepEqual(a.completions, [true]);
    assert.equal(a.api.setRecordingPaused(false), false);
    assert.equal(a.timers.size, 0);
  }
  {
    const a = setup(cast, new Error("media failed"));
    a.api.playDialogueOrSpeak({ ...a.options, mp3Url: "/broken.mp3", lines });
    a.recordings[0].onerror();
    await Promise.resolve();
    assert.equal(a.utterances.length, 1);
    assert.equal(a.utterances[0].voice, cast[0]);
    a.utterances[0].onstart(); a.utterances[0].onend();
    a.fireTimer(260);
    assert.equal(a.utterances[1].voice, cast[1]);
    a.utterances[1].onstart(); a.utterances[1].onerror();
    assert.deepEqual(a.errors, ["unavailable"]); assert.deepEqual(a.completions, []);
    assert.equal(a.timers.size, 0);
  }
  {
    const a = setup([cast[2]]);
    a.api.playClipOrSpeak({ ...a.options, mp3Url: "/stalled.mp3", text: "Monday" });
    a.fireTimer(10000);
    assert.deepEqual(a.errors, ["unavailable"]); assert.deepEqual(a.completions, []); assert.equal(a.utterances.length, 0);
  }
  {
    const a = setup([], Object.assign(new Error("gesture required"), { name: "NotAllowedError" }));
    a.api.playClipOrSpeak({ ...a.options, mp3Url: "/monday.mp3", text: "Monday" });
    await Promise.resolve();
    assert.deepEqual(a.errors, ["blocked"]); assert.deepEqual(a.completions, []); assert.equal(a.timers.size, 0);
  }
  {
    const a = setup(cast);
    a.api.playDialogueOrSpeak({ ...a.options, lines });
    const oldEvent = a.utterances[0].onend;
    a.api.stopAllGameAudio();
    oldEvent();
    assert.equal(a.timers.size, 0); assert.equal(a.utterances.length, 1); assert.deepEqual(a.completions, []);
    a.api.playClipOrSpeak({ ...a.options, mp3Url: "/new.mp3", text: "Wednesday" });
    const oldMediaEvent = a.recordings[0].onended;
    a.api.stopAllGameAudio(); oldMediaEvent();
    assert.equal(a.recordings[0].paused, true); assert.deepEqual(a.completions, []);
  }
  {
    const a = setup([]);
    a.api.playClipOrSpeak({ ...a.options, text: "Later" });
    a.fireTimer(1500);
    assert.deepEqual(a.errors, ["unavailable"]); assert.deepEqual(a.completions, []);
  }
  {
    const a = setup(cast);
    a.api.playClipOrSpeak({ ...a.options, text: "Wednesday" });
    a.utterances[0].onerror({ error: "not-allowed" });
    assert.deepEqual(a.errors, ["blocked"]); assert.deepEqual(a.completions, []);
  }
  execFileSync(process.execPath, ["scripts/audit-audio-coverage.cjs", "--check"], { cwd: root, stdio: "inherit" });
  console.log("PASS recorded audio, speaker cues, speed, browser voices, failures, cancellation and pack coverage");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
