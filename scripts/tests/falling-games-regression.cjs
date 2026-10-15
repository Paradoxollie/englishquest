const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");
const engineCache = new Map();
function loadEngine(relativePath, stubBackend = false) {
  const filename = path.join(root, relativePath);
  if (!stubBackend && engineCache.has(filename)) return engineCache.get(filename).exports;
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  if (!stubBackend) engineCache.set(filename, loaded);
  loaded.require = request => {
    if (stubBackend && request.startsWith("@/")) return new Proxy({}, { get: () => () => { throw new Error("Invalid score reached the backend"); } });
    // Pure sibling modules (./levels...) are TypeScript too.
    if (request.startsWith("./") && fs.existsSync(path.join(path.dirname(filename), `${request}.ts`))) {
      return loadEngine(path.relative(root, path.join(path.dirname(filename), `${request}.ts`)));
    }
    return Module.prototype.require.call(loaded, request);
  };
  loaded._compile(output, filename);
  return loaded.exports;
}

const wordfall = loadEngine("lib/games/wordfall.ts");
const enigma = loadEngine("lib/games/enigma-scroll.ts");
const enigmaWords = loadEngine("lib/games/enigma-scroll-words.ts");
const space = loadEngine("lib/games/spaceLexShooter.ts");
let checks = 0;
function check(name, test) {
  test();
  checks += 1;
  console.log(`PASS ${name}`);
}

check("Wordfall retains used words beyond five catches", () => {
  const words = ["APPLE", "ANGLE", "ALERT", "ABOUT", "ABOVE", "ACTOR"];
  wordfall.initializeEnglishWords(words);
  let state = wordfall.startGame(wordfall.createGameState({ mode: "free" }));
  const falling = { id: "a", text: "A", displayText: "A", x: 50, lane: 1, y: 20, speed: 5 };
  for (const word of words) {
    state = { ...state, activeWords: [falling], activeWord: falling };
    const result = wordfall.processWordInput(state, word);
    assert.equal(result.success, true);
    state = result.newState;
  }
  assert.equal(state.usedWords.length, words.length);
  assert.equal(wordfall.validateFreeWord("APPLE", "A", state.usedWords).valid, false);
});

check("Wordfall accepts expressions, accents and typographic apostrophes", () => {
  assert.equal(wordfall.validateExactWord("  DUE   TO à cause de ", "DUE TO", "à cause de").valid, true);
  assert.equal(wordfall.validateExactWord("SUMMER ete", "SUMMER", "été").valid, true);
  assert.equal(wordfall.validateExactWord("TODAY aujourd’hui", "TODAY", "aujourd'hui").valid, true);
});

check("Wordfall only spawns letters with an unused valid answer", () => {
  wordfall.initializeEnglishWords(["APPLE", "ANGLE", "XENON"]);
  const state = { ...wordfall.startGame(wordfall.createGameState({ mode: "free" })), usedWords: ["XENON"] };
  for (const rng of [() => 0, () => 0.999]) {
    assert.equal(wordfall.spawnFallingWord(state, { mode: "free" }, rng).displayText, "A");
  }
  const reserved = { id: "last-a", text: "A", displayText: "A", x: 18, lane: 0, y: 50, speed: 5 };
  assert.equal(wordfall.spawnFallingWord({ ...state, usedWords: ["XENON", "APPLE"], activeWord: reserved, activeWords: [reserved] }, { mode: "free" }, () => 0), null);
});

// Enigma : mots cibles relus (avec traduction et niveau) et propositions servies par public/data.
const enigmaTargets = loadEngine("lib/games/enigma-scroll-targets.ts");
const publicGuesses = Object.fromEntries([4, 5, 6].map(length => [
  length,
  JSON.parse(fs.readFileSync(path.join(root, `public/data/enigma-guesses-${length}.json`), "utf8")),
]));
const targetLists = Object.fromEntries([4, 5, 6].map(length => [length, enigmaTargets.ENIGMA_TARGETS[length].map(target => target.word)]));
const lists = enigmaWords.loadAndFilterWordLists(targetLists, publicGuesses);
enigma.initializeWordLists(lists);
check("Every Enigma target is a playable guess at all three lengths", () => {
  assert.equal(enigmaWords.validateWordLists(lists).valid, true);
  for (const length of [4, 5, 6]) {
    const served = new Set(publicGuesses[length]);
    for (const target of lists.targetWords[length]) {
      assert.equal(enigma.validateWord(target, length), true, `${length}: ${target}`);
      assert.ok(served.has(target), `${target} must be in public/data/enigma-guesses-${length}.json`);
    }
  }
});

check("Enigma targets: 150+ common words per length, each translated and levelled", () => {
  const seen = new Set();
  for (const length of [4, 5, 6]) {
    const targets = enigmaTargets.ENIGMA_TARGETS[length];
    assert.ok(targets.length >= 150, `${length} letters: ${targets.length}`);
    for (const target of targets) {
      assert.equal(target.word.length, length, target.word);
      assert.match(target.word, /^[A-Z]+$/);
      assert.ok(!seen.has(target.word), `duplicate ${target.word}`);
      seen.add(target.word);
      assert.ok(target.french && target.french.trim() === target.french, `${target.word} needs a translation`);
      assert.ok([1, 2, 3, 4, 5].includes(target.level), `${target.word} level`);
      assert.equal(enigmaWords.filterInappropriateWords([target.word]).length, 1, `${target.word} is filtered`);
      assert.equal(enigmaTargets.getEnigmaTranslation(target.word), target.french);
    }
    for (const level of [1, 2, 3, 4, 5]) {
      const pool = enigmaTargets.enigmaTargetsForLevel(length, level);
      assert.ok(pool.length >= 40, `${length} letters, level ${level}: ${pool.length}`);
      assert.ok(pool.every(target => target.level <= level), "never above the player's level");
    }
    assert.ok(enigmaTargets.enigmaTargetsForLevel(length, 1).every(target => target.level === 1));
    const guessFile = fs.statSync(path.join(root, `public/data/enigma-guesses-${length}.json`)).size;
    assert.ok(guessFile < 400_000, `guess file ${length} stays small (${guessFile} bytes)`);
  }
  assert.ok(!fs.existsSync(path.join(root, "lib/games/words/enigma-scroll-words.json")), "the 61 000 guesses are no longer bundled");
});

check("Enigma client bundle imports no guess list", () => {
  const client = fs.readFileSync(path.join(root, "app/play/enigma-scroll/enigma-scroll-game.tsx"), "utf8");
  assert.ok(!/words\/enigma-scroll-words\.json/.test(client));
  assert.match(client, /\/data\/enigma-guesses-\$\{length\}\.json/);
});

check("Enigma streak counts actual wins and preserves cumulative score", () => {
  let state = enigma.createRandomGameState(5);
  assert.equal(state.bestStreak, 0);
  assert.equal(state.currentStreak, 0);
  let firstScore;
  for (let wins = 1; wins <= 3; wins += 1) {
    const result = enigma.submitGuess(state, state.targetWord, 90);
    state = result.state;
    assert.equal(state.currentStreak, wins);
    assert.equal(state.bestStreak, wins);
    assert.equal(state.wordsFound, wins);
    if (wins === 1) firstScore = state.totalScore;
    else assert.ok(state.totalScore > firstScore);
    state = enigma.resetForNewRandomWord(state, new Set([state.targetWord]));
  }
});

check("Enigma duplicate-letter feedback consumes each target occurrence once", () => {
  enigma.initializeWordLists({ targetWords: { 5: ["APPLE"] }, validGuesses: { 5: ["APPLE", "ALLEY"] } });
  const result = enigma.submitGuess(enigma.createInitialGameState("APPLE"), "ALLEY", 90);
  assert.deepEqual(result.state.rows[0].cells.map(cell => cell.status), ["correct", "present", "absent", "present", "absent"]);
});

check("Wordfall exact mode drops words of the player's level (70 %) and the level below", () => {
  const data = JSON.parse(fs.readFileSync(path.join(root, "lib/games/words/wordfall-words.json"), "utf8")).manualWords;
  const levels = data.levels;
  for (const word of Object.keys(data.translations)) assert.ok([1, 2, 3, 4, 5].includes(levels[word]), `${word} has a level`);
  const counts = [1, 2, 3, 4, 5].map(level => Object.values(levels).filter(value => value === level).length);
  assert.ok(counts[0] >= 150 && counts[1] >= 150, `plenty of easy words: ${counts}`);
  wordfall.initializeWordLists({ translations: data.translations, wordsByLength: data.wordsByLength, expressions: data.expressions, levels });
  for (const level of [1, 3, 5]) {
    let state = wordfall.startGame(wordfall.createGameState({ mode: "exact", vocabLevel: level }));
    const picked = [];
    for (let i = 0; i < 200; i += 1) {
      const word = wordfall.spawnFallingWord({ ...state, activeWords: [], activeWord: null }, { mode: "exact" });
      assert.ok(word, "a word falls");
      picked.push(levels[word.text]);
      state = { ...state, usedWords: [...state.usedWords, word.text] };
    }
    assert.ok(picked.every(value => value === level || value === level - 1), `level ${level}: ${[...new Set(picked)]}`);
    if (level > 1) {
      const main = picked.filter(value => value === level).length;
      assert.ok(main > 110 && main < 170, `level ${level}: ${main} of 200 at the player's level`);
    }
  }
});

check("Wordfall caught words are not dropped again while others remain", () => {
  const data = JSON.parse(fs.readFileSync(path.join(root, "lib/games/words/wordfall-words.json"), "utf8")).manualWords;
  wordfall.initializeWordLists({ translations: data.translations, wordsByLength: data.wordsByLength, expressions: data.expressions, levels: data.levels });
  let state = wordfall.startGame(wordfall.createGameState({ mode: "exact", vocabLevel: 2 }));
  const word = wordfall.spawnFallingWord(state, { mode: "exact" });
  state = { ...state, activeWords: [word], activeWord: word };
  const result = wordfall.processWordInput(state, `${word.text} ${word.translation}`);
  assert.equal(result.success, true);
  assert.ok(result.newState.usedWords.includes(word.text));
  assert.equal(wordfall.startGame({ ...result.newState, gameOver: true }).vocabLevel, 2, "replay keeps the level");
});

check("Wordfall accepts oe typed for the ligature", () => {
  assert.equal(wordfall.validateExactWord("SISTER soeur", "SISTER", "sœur").valid, true);
  assert.equal(wordfall.validateExactWord("EGG oeuf", "EGG", "œuf").valid, true);
});

function playingState() {
  return { ...space.createGameState(), isRunning: true, waveStatus: "playing", waveTarget: 10 };
}
function enemy(id, isTarget = true, y = 0.5) {
  return { ...space.spawnEnemy(playingState(), null), id, text: isTarget ? "HAPPY" : "TABLE", isTarget, x: 0.5, baseX: 0.5, y };
}
function bullet(id, y = 0.5) {
  return { id, x: 0.5, y, speed: 0.12 };
}

check("Space Lex two bullets can score one enemy only once", () => {
  const initial = { ...playingState(), enemies: [enemy("target")], bullets: [bullet("one"), bullet("two")] };
  const result = space.checkCollisions(initial, null);
  assert.equal(result.score, 10);
  assert.equal(result.waveProgress, 1);
  assert.equal(result.comboCount, 1);
  assert.equal(result.enemies.length, 0);
  assert.equal(result.bullets.length, 1);
  assert.equal(initial.score, 0);
});

check("Space Lex two bullets on one distractor remove a single life", () => {
  const result = space.checkCollisions({ ...playingState(), enemies: [enemy("wrong", false)], bullets: [bullet("one"), bullet("two")] }, null);
  assert.equal(result.lives, 2);
});

check("Space Lex bullets hit words crossed between animation frames", () => {
  const initial = { ...playingState(), enemies: [enemy("target")], bullets: [bullet("fast", 0.65)] };
  const moved = space.updateBullets(initial, 33.34);
  assert.ok(moved.bullets[0].y < 0.5);
  assert.equal(space.checkCollisions(moved, null).score, 10);
});

check("Space Lex wave completion grants the clear bonus once", () => {
  const result = space.checkCollisions({ ...playingState(), waveTarget: 1, enemies: [enemy("first"), enemy("second")], bullets: [bullet("one"), bullet("two")] }, null);
  assert.equal(result.score, 110);
  assert.equal(result.waveProgress, 1);
  assert.equal(result.waveStatus, "cleared");
  assert.equal(space.checkCollisions(result, null), result);
});

check("Space Lex death prevents later bullets from earning more points", () => {
  const result = space.checkCollisions({ ...playingState(), lives: 1, enemies: [enemy("wrong", false), enemy("right")], bullets: [bullet("one"), bullet("two")] }, null);
  assert.equal(result.gameOver, true);
  assert.equal(result.score, 0);
});

check("Space Lex boss hit leaves the previous React state immutable", () => {
  const mission = space.generateMission(5);
  const initial = { ...playingState(), mission, boss: { id: "boss", name: "Boss", hp: 15, maxHp: 15, x: 0.5, y: 0.2, phase: 1 }, enemies: [enemy("target")], bullets: [bullet("one")] };
  const result = space.checkCollisions(initial, mission);
  assert.equal(initial.boss.hp, 15);
  assert.equal(result.boss.hp, 14);
  const moved = space.updateEnemies(initial, 16);
  assert.equal(initial.boss.x, 0.5);
  assert.notEqual(moved.boss, initial.boss);
});

check("Space Lex boss has a stable visible synonym mission", () => {
  const mission = space.generateMission(5);
  assert.ok(mission.label.includes(mission.synonymKey));
  for (let i = 0; i < 300; i += 1) {
    const spawned = space.spawnEnemy(playingState(), mission);
    assert.equal(spawned.isTarget, space.isTargetWord(spawned.text, mission));
    assert.notEqual(spawned.text, "EMPTY");
  }
});

check("Space Lex neutral distractors cannot overlap a valid target", () => {
  const missions = [
    ...Object.keys(space.WORD_FAMILIES).map(theme => ({ type: "WORD_FAMILY", theme })),
    ...Object.keys(space.CONNECTORS).map(connectorCategory => ({ type: "CONNECTORS", connectorCategory })),
    ...Object.keys(space.SYNONYMS).map(synonymKey => ({ type: "SYNONYMS", synonymKey })),
  ];
  for (const mission of missions) {
    for (let i = 0; i < 100; i += 1) {
      const spawned = space.spawnEnemy(playingState(), mission);
      assert.equal(spawned.isTarget, space.isTargetWord(spawned.text, mission), `${mission.type}: ${spawned.text}`);
    }
  }
});

check("Space Lex beginners get French missions, easy words and no connectors", () => {
  for (const level of [1, 2]) {
    for (let i = 0; i < 300; i += 1) {
      const mission = space.generateMission(1 + (i % 6), level);
      assert.notEqual(mission.type, "CONNECTORS");
      assert.equal(mission.lang, "fr");
      assert.match(mission.label, /^(Tire sur|Boss : tire sur)/);
      if (mission.type === "WORD_FAMILY") assert.ok(space.EASY_WORD_FAMILIES[mission.theme], mission.theme);
      else assert.ok(space.EASY_SYNONYMS[mission.synonymKey], mission.synonymKey);
      const enemyWord = space.spawnEnemy(playingState(), mission);
      const word = enemyWord.text.toLowerCase();
      assert.equal(enemyWord.isTarget, space.isTargetWord(word, mission));
      const full = mission.type === "WORD_FAMILY" ? space.WORD_FAMILIES[mission.theme] : space.SYNONYMS[mission.synonymKey];
      if (!enemyWord.isTarget) assert.ok(!full.includes(word), `${word} is right for ${mission.label}`);
    }
  }
  const advanced = space.generateMission(1, 4);
  assert.equal(advanced.lang, "en");
  assert.match(advanced.label, /^Shoot/);
});

check("Space Lex dialogues: simple English with French subtitles for beginners", () => {
  for (const wave of [1, 5]) {
    const beginner = space.getDialogueForWave(wave, 1);
    assert.ok(beginner.lines.every(line => line.subtitle && line.text.length < 70), `wave ${wave}`);
    assert.ok(space.getDialogueForWave(wave, 4).lines.every(line => !line.subtitle));
  }
  const started = space.startGame(space.createGameState(2));
  assert.equal(started.mission.lang, "fr");
  assert.ok(started.currentDialogue.lines[0].subtitle);
  assert.equal(space.resetGame(started).vocabLevel, 2);
  assert.ok(!JSON.stringify(space.getDialogueForWave(1, 3)).includes("the Sector 7"));
});

check("Space Lex word data: no misspelt or duplicated entries, distractors never fit the mission", () => {
  for (const [name, bank] of Object.entries({ ...space.WORD_FAMILIES, ...space.CONNECTORS, ...space.SYNONYMS })) {
    assert.equal(new Set(bank).size, bank.length, `duplicates in ${name}`);
    for (const word of bank) assert.match(word, /^[a-z][a-z' -]*[a-z]$/, `${name}: ${word}`);
  }
  for (const [key, easy] of Object.entries(space.EASY_SYNONYMS)) for (const word of easy) assert.ok(space.SYNONYMS[key].includes(word), `${key}: ${word}`);
  for (const [theme, easy] of Object.entries(space.EASY_WORD_FAMILIES)) for (const word of easy) assert.ok(space.WORD_FAMILIES[theme].includes(word), `${theme}: ${word}`);
  // Mission FOOD : ni poisson ni poulet comme mauvais mots ; mission TRAVEL : pas de bus.
  for (const [theme, forbidden] of [["FOOD", ["fish", "chicken"]], ["TRAVEL", ["bus", "beach"]], ["FUTURE_JOBS", ["doctor", "lawyer", "astronaut"]]]) {
    const mission = { type: "WORD_FAMILY", theme, targetCount: 10 };
    for (let i = 0; i < 400; i += 1) {
      const enemyWord = space.spawnEnemy(playingState(), mission);
      assert.ok(enemyWord.isTarget || !forbidden.includes(enemyWord.text.toLowerCase()), `${theme}: ${enemyWord.text}`);
    }
  }
});

check("Space Lex clears preview data when moving to a new wave", () => {
  const next = space.startNextWave({ ...playingState(), upcomingEnemy: enemy("old"), upcomingEnemySpawnTime: 123 });
  assert.equal(next.upcomingEnemy, null);
  assert.equal(next.upcomingEnemySpawnTime, 0);
});

check("Space Lex pause preserves preview, transition and power-up time", () => {
  const initial = { ...playingState(), shipVelocity: 0.005, waveTransitionTime: 1_000, lastEnemySpawnTime: 1_100, upcomingEnemySpawnTime: 2_000, activePowerUps: [{ type: "slowmo", endTime: 5_000 }] };
  const result = space.resumeGame(initial, 10_000);
  assert.equal(result.waveTransitionTime, 11_000);
  assert.equal(result.upcomingEnemySpawnTime, 12_000);
  assert.equal(result.activePowerUps[0].endTime, 15_000);
  assert.equal(result.lastBulletTime, 0);
  assert.equal(result.shipVelocity, 0);
  assert.equal(initial.activePowerUps[0].endTime, 5_000);
});

check("Space Lex touch reaches finger position and respects board edges", () => {
  assert.equal(space.setShipTarget(playingState(), 0.85).shipX, 0.85);
  assert.equal(space.setShipTarget(playingState(), 2).shipX, 0.98);
  assert.equal(space.setShipTarget(playingState(), -1).shipX, 0.02);
});

async function validateScoreGuards() {
  const actions = [
    { name: "Wordfall", submit: loadEngine("app/play/wordfall/actions.ts", true).submitWordfallScore, valid: { mode: "free", score: 10, wordsCompleted: 1, durationMs: 1_000 }, invalid: [{ mode: "invalid" }, { score: NaN }, { score: -1 }, { wordsCompleted: -1 }, { durationMs: 9_000_000 }] },
    { name: "Enigma", submit: loadEngine("app/play/enigma-scroll/actions.ts", true).submitEnigmaScrollScore, valid: { wordLength: 5, totalScore: 10, wordsFound: 1, durationMs: 1_000 }, invalid: [{ wordLength: 7 }, { totalScore: Infinity }, { wordsFound: -1 }, { totalScore: 1.5 }, { durationMs: 9_000_000 }] },
    { name: "Space Lex", submit: loadEngine("app/play/space-lex/actions.ts", true).submitLexiconBlasterScore, valid: { score: 10, wave: 1, maxCombo: 1, wordsMastered: 1, wordsMissed: 0, durationMs: 1_000 }, invalid: [{ score: NaN }, { wave: 0 }, { maxCombo: -1 }, { wordsMastered: 1.5 }, { durationMs: 9_000_000 }] },
  ];
  for (const action of actions) {
    for (const invalid of action.invalid) {
      const result = await action.submit({ ...action.valid, ...invalid });
      assert.equal(result.success, false);
      assert.match(result.error, /invalide|limites/);
    }
    checks += 1;
    console.log(`PASS ${action.name} rejects invalid scores before any backend access`);
  }
  console.log(`${checks} falling-game regression scenarios passed.`);
}
validateScoreGuards().catch(error => { console.error(error); process.exitCode = 1; });
