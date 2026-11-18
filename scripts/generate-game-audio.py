"""Generate the static English Quest recordings offline from their actual game scripts.

Requires FFmpeg, kokoro-onnx 0.5.0 and the upstream v1.0 full-precision ONNX
and voices-v1.0.bin. The website has no speech-model dependency.
"""

import argparse
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
import onnxruntime as ort
from kokoro_onnx.tokenizer import Tokenizer


ROOT = Path(__file__).resolve().parents[1]
SAMPLE_RATE = 24000
BRITISH = {"female_uk": "bf_emma", "male_uk": "bm_george"}
AMERICAN = {"female_us": "af_heart", "male_us": "am_michael"}
CAST = {**BRITISH, **AMERICAN}
PLACE_NAMES = {"Holborn": "hˈoʊbən", "Edinburgh": "ˈɛdɪnbəɹə"}


def render(engine, tokenizer, voices, text, voice, speed):
    language = "en-gb" if voice.startswith("b") else "en-us"
    phonemes = tokenizer.phonemize(text.strip(), language)
    # London station and Scottish city names keep their local pronunciation.
    for spelling, local_ipa in PLACE_NAMES.items():
        if spelling in text:
            phonemes = phonemes.replace(tokenizer.phonemize(spelling, language), local_ipa)
    tokens = tokenizer.tokenize(phonemes)
    if not 0 < len(tokens) < len(voices[voice]):
        raise ValueError(f"Line outside model context: {text}")
    waveform = engine.run(["waveform"], {
        "input_ids": np.array([[0, *tokens, 0]], dtype=np.int64),
        "style": voices[voice][len(tokens)],
        "speed": np.array([speed], dtype=np.float32),
    })[0].reshape(-1)
    active = np.flatnonzero(np.abs(waveform) > 0.002)
    if len(active) < 240 or not np.isfinite(waveform).all():
        raise ValueError(f"Empty recording: {text}")
    first = max(0, active[0] - 480)
    last = min(len(waveform), active[-1] + 960)
    wave = waveform[first:last].copy()
    rms = np.sqrt(np.mean(wave ** 2))
    wave *= min(0.105 / rms, 0.79 / np.abs(wave).max())
    ramp = min(144, len(wave) // 2)
    wave[:ramp] *= np.linspace(0, 1, ramp)
    wave[-ramp:] *= np.linspace(1, 0, ramp)
    return np.pad(wave, (960, 1920)).astype("<f4")


def encode(destination, audio):
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".tmp.mp3")
    subprocess.run([
        "ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SAMPLE_RATE),
        "-ac", "1", "-i", "pipe:0", "-codec:a", "libmp3lame", "-b:a", "64k",
        "-write_xing", "1", str(temporary),
    ], input=audio.astype("<f4").tobytes(), check=True)
    temporary.replace(destination)


def dialogue(record, render_line, cast):
    parts = []
    starts = []
    elapsed = 0
    for i, line in enumerate(record["lines"]):
        if i:
            pause = np.zeros(round(0.29 * SAMPLE_RATE), dtype="<f4")
            parts.append(pause)
            elapsed += len(pause)
        starts.append(round(elapsed / SAMPLE_RATE, 3))
        voice = cast[line.get("voiceProfile", "female_us")]
        audio = render_line(line["text"], voice, 0.97)
        parts.append(audio)
        elapsed += len(audio)
    return np.concatenate(parts), starts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=ROOT / "public" / "audio")
    parser.add_argument("--samples-only", action="store_true")
    parser.add_argument("--accent", choices=["british", "american"], default="american")
    opts = parser.parse_args()
    text = subprocess.check_output(["node", "scripts/audit-audio-coverage.cjs", "--json"], cwd=ROOT)
    scripts = json.loads(text[text.index(b"{"):])
    settings = ort.SessionOptions()
    settings.intra_op_num_threads = 4
    settings.inter_op_num_threads = 1
    settings.add_session_config_entry("session.intra_op.allow_spinning", "0")
    engine = ort.InferenceSession(str(opts.model_dir / "kokoro-v1.0.onnx"), settings,
                                  providers=["CPUExecutionProvider"])
    tokenizer = Tokenizer()
    with np.load(opts.model_dir / "voices-v1.0.bin") as archive:
        voices = {voice: archive[voice] for voice in CAST.values()}

    def render_line(text, voice, speed):
        return render(engine, tokenizer, voices, text, voice, speed)

    if opts.samples_only:
        word = next(item for item in scripts["spellStrike"] if item["id"] == "wednesday")
        cafe = next(item for item in scripts["echoSignal"] if item["id"] == "l1-cafe-order")
        for label, female, male in [("britannique", "bf_emma", "bm_george"),
                                    ("americain", "af_heart", "am_michael")]:
            scene, _ = dialogue(cafe, render_line, {
                "male_uk": male, "male_us": male, "female_uk": female, "female_us": female,
            })
            pieces = [render_line(word["text"], female, 0.96),
                      np.zeros(8400), render_line(word["contextSentence"], female, 0.98),
                      np.zeros(16800), scene]
            encode(opts.output / f"essai-{label}.mp3", np.concatenate(pieces))
        return

    cast = CAST if opts.accent == "american" else {**CAST, "female_us": "bf_emma", "male_us": "bm_george"}
    manifest = {"revision": "", "sourceDigest": scripts["sourceDigest"], "accent": opts.accent,
                "words": [], "sentences": [], "dialogues": {}}
    digest = hashlib.sha256()
    for i, word in enumerate(scripts["spellStrike"], 1):
        for group, name, script, speed in [
            ("words", word["id"], word["text"], 0.95),
            ("sentences", word["id"] + "-sentence", word["contextSentence"], 0.98),
        ]:
            file = opts.output / "spell-strike" / f"{name}.mp3"
            encode(file, render_line(script, cast["female_us"], speed))
            manifest[group].append(word["id"])
            digest.update(file.read_bytes())
        if i % 25 == 0:
            print(f"{i} words and example sentences", flush=True)
    for i, scenario in enumerate(scripts["echoSignal"], 1):
        audio, starts = dialogue(scenario, render_line, cast)
        file = opts.output / "echo-signal" / (scenario["id"] + ".mp3")
        encode(file, audio)
        manifest["dialogues"][scenario["id"]] = starts
        digest.update(file.read_bytes())
        if i % 10 == 0:
            print(f"{i} dialogues", flush=True)
    manifest["revision"] = digest.hexdigest()[:12]
    manifest_file = opts.output / "recordings.json"
    temp = manifest_file.with_suffix(".tmp")
    temp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", "utf-8")
    temp.replace(manifest_file)


if __name__ == "__main__":
    main()
