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

const spellPresent = spell.SPELL_STRIKE_WORDS.filter((item) =>
  fs.existsSync(path.join(root, "public", "audio", "spell-strike", `${item.id}.mp3`))
).length;
const echoPresent = echo.ECHO_SIGNAL_SCENARIOS.filter((item) =>
  fs.existsSync(path.join(root, "public", "audio", "echo-signal", `${item.id}.mp3`))
).length;

console.log(`Spell Strike MP3: ${spellPresent} / ${spell.SPELL_STRIKE_WORDS.length} présents (public/audio/spell-strike/<id>.mp3)`);
console.log(`Echo Signal MP3:  ${echoPresent} / ${echo.ECHO_SIGNAL_SCENARIOS.length} présents (public/audio/echo-signal/<id>.mp3)`);

if (process.argv.includes("--json")) {
  const manifest = {
    spellStrike: spell.SPELL_STRIKE_WORDS.map((w) => ({
      id: w.id,
      level: w.level,
      file: `public/audio/spell-strike/${w.id}.mp3`,
      text: w.word,
      contextSentence: w.sentenceSpoken,
    })),
    echoSignal: echo.ECHO_SIGNAL_SCENARIOS.map((s) => ({
      id: s.id,
      level: s.level,
      title: s.title,
      file: `public/audio/echo-signal/${s.id}.mp3`,
      lines: s.lines,
    })),
  };
  console.log(JSON.stringify(manifest, null, 2));
}
