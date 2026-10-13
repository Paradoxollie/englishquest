const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");
function loadEngine(relativePath, stubBackend = false) {
  const filename = path.join(root, relativePath);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  if (stubBackend) {
    loaded.require = request => {
      if (request.startsWith("@/")) return new Proxy({}, { get: () => () => { throw new Error("Invalid score reached the backend"); } });
      return Module.prototype.require.call(loaded, request);
    };
  }
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

const rawEnigma = JSON.parse(fs.readFileSync(path.join(root, "lib/games/words/enigma-scroll-words.json"), "utf8"));
const lists = enigmaWords.loadAndFilterWordLists(rawEnigma.targetWords, rawEnigma.validGuesses);
enigma.initializeWordLists(lists);
check("Every Enigma target is a playable guess at all three lengths", () => {
  assert.equal(enigmaWords.validateWordLists(lists).valid, true);
  for (const length of [4, 5, 6]) {
    for (const target of lists.targetWords[length]) {
      assert.equal(enigma.validateWord(target, length), true, `${length}: ${target}`);
    }
  }
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
