// Liste tous les extraits audio attendus dans public/audio/ pour Spell Strike et Echo Signal.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const loaded = new Map();

function loadTs(relPath) {
  const filename = path.join(root, relPath);
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = new Module(filename, module);
  loaded.set(filename, mod);
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const origReq = mod.require.bind(mod);
  mod.require = (req) => {
    if (req.startsWith("@/")) {
      const target = path.join(root, `${req.slice(2)}.ts`);
      return fs.existsSync(target) ? loadTs(`${req.slice(2)}.ts`) : {};
    }
    if (req.startsWith("./")) {
      return loadTs(path.relative(root, path.join(path.dirname(filename), `${req.slice(2)}.ts`)));
    }
    return origReq(req);
  };
  mod._compile(code, filename);
  return mod.exports;
}

const spell = loadTs("lib/games/spellStrike.ts");
const echo = loadTs("lib/games/echoSignal.ts");

const spellStrike = spell.SPELL_STRIKE_WORDS.map((word) => ({
  id: word.id, level: word.level, text: word.word, contextSentence: word.sentenceSpoken,
  file: `public/audio/spell-strike/${word.id}.mp3`,
  sentenceFile: `public/audio/spell-strike/${word.id}-sentence.mp3`,
}));
const echoSignal = echo.ECHO_SIGNAL_SCENARIOS.map((scenario) => ({
  id: scenario.id, level: scenario.level, title: scenario.title, lines: scenario.lines,
  file: `public/audio/echo-signal/${scenario.id}.mp3`,
}));
const scripts = [
  ...spellStrike.map(word => [word.id, word.text, word.contextSentence]),
  ...echoSignal.map(scenario => [scenario.id, ...scenario.lines.map(line => [line.speaker, line.voiceProfile, line.text])]),
];
const sourceDigest = require("node:crypto").createHash("sha256").update(JSON.stringify(scripts)).digest("hex");
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ sourceDigest, spellStrike, echoSignal }, null, 2));
} else {
  const files = {
    "Mots dictés": spellStrike.map(word => word.file),
    "Phrases d’exemple": spellStrike.map(word => word.sentenceFile),
    "Messages": echoSignal.map(scenario => scenario.file),
  };
  let healthy = true;
  for (const [label, paths] of Object.entries(files)) {
    const present = paths.filter(file => fs.statSync(path.join(root, file), { throwIfNoEntry: false })?.size > 0).length;
    console.log(`${label}: ${present}/${paths.length}`);
    if (present !== paths.length) healthy = false;
  }
  if (process.argv.includes("--check")) {
    const pack = JSON.parse(fs.readFileSync(path.join(root, "public/audio/recordings.json"), "utf8"));
    if (pack.sourceDigest !== sourceDigest) {
      console.error("Les textes ou les voix du jeu ont changé depuis la génération des enregistrements.");
      healthy = false;
    }
    const orderedFiles = [
      ...spellStrike.flatMap(word => [word.file, word.sentenceFile]),
      ...echoSignal.map(scenario => scenario.file),
    ];
    if (healthy) {
      const digest = require("node:crypto").createHash("sha256");
      for (const file of orderedFiles) digest.update(fs.readFileSync(path.join(root, file)));
      if (digest.digest("hex").slice(0, 12) !== pack.revision) {
        console.error("Le contenu des MP3 ne correspond plus à la révision publiée.");
        healthy = false;
      }
    }
    for (const word of spellStrike) {
      if (!pack.words.includes(word.id) || !pack.sentences.includes(word.id)) healthy = false;
    }
    for (const scenario of echoSignal) {
      const cast = new Map();
      for (const line of scenario.lines) {
        if (cast.has(line.speaker) && cast.get(line.speaker) !== line.voiceProfile) healthy = false;
        cast.set(line.speaker, line.voiceProfile);
      }
      if (new Set(cast.values()).size !== cast.size || [...cast.values()].some(voice => !voice)) {
        console.error(`Chaque interlocuteur doit avoir sa propre voix : ${scenario.id}`);
        healthy = false;
      }
      const starts = pack.dialogues[scenario.id];
      if (!starts || starts.length !== scenario.lines.length || starts[0] !== 0 ||
          starts.some((value, i) => !Number.isFinite(value) || (i > 0 && value <= starts[i - 1]))) {
        console.error(`Repères des voix incorrects : ${scenario.id}`);
        healthy = false;
      }
    }
    if (!healthy) process.exitCode = 1;
  }
}
