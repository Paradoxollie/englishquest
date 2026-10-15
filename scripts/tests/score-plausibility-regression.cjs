// Run with: node scripts/tests/score-plausibility-regression.cjs
// Plausibility bounds are checked against real play of the pure engines:
// the best honest games pass, invented scores fail. Offline, no backend.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");
const loaded = new Map();
function loadEngine(name) {
  const filename = path.join(root, "lib/games", `${name}.ts`);
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = new Module(filename, module);
  loaded.set(filename, mod);
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (request) => request.startsWith("./") ? loadEngine(request.slice(2)) : originalRequire(request);
  mod._compile(compiled, filename);
  return mod.exports;
}

const plausible = loadEngine("score-plausibility");
const rules = loadEngine("game-session-rules");
const enigma = loadEngine("enigma-scroll");
const wordfall = loadEngine("wordfall");
const space = loadEngine("spaceLexShooter");
const verb = loadEngine("speed-verb-challenge");
const flash = loadEngine("flashTranslation");

let cases = 0;
function test(name, run) {
  run();
  cases += 1;
  console.log(`PASS ${name}`);
}
const ok = (result, message) => assert.equal(result.ok, true, `${message}: ${result.reason ?? ""}`);
const ko = (result, message) => assert.equal(result.ok, false, message);

test("Enigma: a perfect session passes, invented scores fail", () => {
  for (const length of [4, 5, 6]) {
    const words = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((letter) => letter.repeat(length));
    enigma.initializeWordLists({ targetWords: { [length]: words }, validGuesses: { [length]: words } });
    let state = enigma.createRandomGameState(length);
    for (let i = 0; i < 40; i += 1) {
      state = enigma.submitGuess(state, state.targetWord, 90).state; // first try, full time
      state = enigma.resetForNewRandomWord(state, new Set([state.targetWord]));
    }
    const honest = { wordLength: length, totalScore: state.totalScore, wordsFound: 40, durationMs: 40 * 1_300 };
    ok(plausible.checkEnigmaScroll(honest), `${length} letters`);
    assert.ok(state.totalScore <= 40 * plausible.maxEnigmaPointsPerWord(length));
    ko(plausible.checkEnigmaScroll({ ...honest, totalScore: honest.totalScore + 1_000 }), "too many points");
    ko(plausible.checkEnigmaScroll({ ...honest, durationMs: 5_000 }), "too fast");
    ko(plausible.checkEnigmaScroll({ ...honest, totalScore: 1 }), "too few points for 40 words");
  }
  ok(plausible.checkEnigmaScroll({ wordLength: 5, totalScore: 0, wordsFound: 0, durationMs: 0 }), "lost at once");
});

test("Wordfall: perfect catches of the longest words stay under the bound", () => {
  const words = Array.from({ length: 150 }, (_, index) => `A${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + Math.floor(index / 26))}QWERTYUIOPASDFGHJK`.slice(0, 20));
  wordfall.initializeEnglishWords(words);
  let state = wordfall.startGame(wordfall.createGameState({ mode: "free" }));
  for (const word of words) {
    const falling = { id: word, text: "A", displayText: "A", x: 50, lane: 1, y: 0, speed: 5 };
    const result = wordfall.processWordInput({ ...state, activeWords: [falling], activeWord: falling }, word);
    assert.equal(result.success, true, word);
    state = result.newState;
  }
  assert.ok(state.score <= plausible.maxWordfallScore("free", words.length), `${state.score}`);
  ok(plausible.checkWordfall({ mode: "free", score: state.score, wordsCompleted: words.length, durationMs: words.length * 700 }), "fast honest game");
  ko(plausible.checkWordfall({ mode: "free", score: state.score * 2, wordsCompleted: words.length, durationMs: 600_000 }), "double score");
  ko(plausible.checkWordfall({ mode: "exact", score: 50, wordsCompleted: 100, durationMs: 10_000 }), "100 words in 10 s");
});

test("Lexicon Blaster: the engine's best run stays under the bound", () => {
  let state = {
    ...space.createGameState(),
    isRunning: true,
    waveStatus: "playing",
    mission: space.generateMission(1),
    waveTarget: 10,
    activePowerUps: [{ type: "double_xp", endTime: Date.now() + 1e9 }],
  };
  let hits = 0;
  for (let i = 0; i < 90; i += 1) {
    const target = { ...space.spawnEnemy(state, null), id: `t${i}`, text: "TARGET", isTarget: true, x: 0.5, baseX: 0.5, y: 0.5 };
    state = space.checkCollisions({ ...state, enemies: [target], bullets: [{ id: `b${i}`, x: 0.5, y: 0.5, speed: 0.12 }] }, state.mission);
    state = space.updateLevel(state);
    hits += 1;
    if (state.waveStatus === "cleared") state = { ...space.startNextWave(state), waveStatus: "playing" };
  }
  assert.ok(state.score <= plausible.maxLexiconScore(hits), `${state.score} > ${plausible.maxLexiconScore(hits)}`);
  ok(plausible.checkLexiconBlaster({
    score: state.score, wave: state.waveNumber, maxCombo: state.maxCombo, wordsMastered: 1, wordsMissed: 0,
    durationMs: hits * 900 + (state.waveNumber - 1) * 6_000,
  }), "best run");
  ko(plausible.checkLexiconBlaster({ score: 50_000, wave: 1, maxCombo: 3, wordsMastered: 3, wordsMissed: 0, durationMs: 4_000 }), "huge score in 4 s");
  ko(plausible.checkLexiconBlaster({ score: 100, wave: 9, maxCombo: 3, wordsMastered: 3, wordsMissed: 0, durationMs: 20_000 }), "wave 9 in 20 s");
});

test("Speed Verb: fast perfect answers stay under the bound", () => {
  for (const difficulty of [1, 2, 3]) {
    let state = verb.startNewRound(verb.createInitialGameState(verb.VERBS, { difficulty, totalTimeMs: 90_000, rng: () => 0.3 }), 0);
    let correct = 0;
    for (let i = 0; i < 60 && !state.ended; i += 1) {
      const round = state.currentRound.currentVerb;
      const result = verb.submitAnswer(state, { pastSimple: round.pastSimple[0], pastParticiple: round.pastParticiple[0], translation: round.translations[0] }, 900);
      if (result.result.isCorrect) correct += 1;
      state = verb.startNewRound(result.state, (i + 1) * 1_000);
    }
    assert.ok(state.score <= plausible.maxSpeedVerbScore(difficulty, correct), `${difficulty}: ${state.score}`);
    ok(plausible.checkSpeedVerb({ difficulty, score: state.score, correctCount: correct, totalRounds: correct, durationMs: correct * 1_000 }), `difficulty ${difficulty}`);
    ko(plausible.checkSpeedVerb({ difficulty, score: state.score + 500, correctCount: correct, totalRounds: correct, durationMs: 90_000 }), "inflated score");
    ko(plausible.checkSpeedVerb({ difficulty, score: state.score, correctCount: correct, totalRounds: correct, durationMs: 2_000 }), "too fast");
  }
});

test("Flashback and Flash Translation: timing bounds", () => {
  ok(plausible.checkFlashback({ score: 40, durationMs: 40 * 700 }), "quick player");
  ko(plausible.checkFlashback({ score: 40, durationMs: 5_000 }), "40 answers in 5 s");
  let state = flash.startGame(flash.createGameState(flash.VOCABULARY, { totalRounds: 10, minWaitMs: 1_400, maxWaitMs: 2_800, wrongAnswerPenaltyMs: 5_000, level: 2 }));
  let wall = 0;
  for (let i = 0; i < 10; i += 1) {
    wall += flash.getCurrentRound(state).waitTimeMs;
    state = flash.startAnswering(state, wall);
    wall += 450;
    const round = flash.getCurrentRound(state);
    state = flash.nextRound(flash.submitAnswer(state, i === 3 ? (round.correctIndex + 1) % 4 : round.correctIndex, wall));
    wall += 950;
  }
  const honest = { totalTimeMs: flash.getFinalScore(state), wrongAnswers: state.wrongAnswers, roundsCompleted: 10, durationMs: wall };
  ok(plausible.checkFlashTranslation(honest), "real game");
  ko(plausible.checkFlashTranslation({ ...honest, durationMs: 3_000 }), "no time to wait for the choices");
  ko(plausible.checkFlashTranslation({ ...honest, totalTimeMs: 500 }), "faster than the penalty");
  ok(plausible.checkGrammarRush({ score: 31, correct: 2, attempts: 2, durationMs: 60_000 }), "grammar rush");
  ko(plausible.checkGrammarRush({ score: 5_000, correct: 60, attempts: 60, durationMs: 60_000 }), "grammar rush max");
});

test("Game sessions: unknown, foreign, used, wrong game, too fast and expired sessions are rejected", () => {
  const now = Date.parse("2026-10-16T10:00:00Z");
  const row = { id: "s", user_id: "user", game_slug: "wordfall", started_at: new Date(now - 60_000).toISOString(), used_at: null };
  const expected = { userId: "user", slug: "wordfall", claimedDurationMs: 60_000, nowMs: now };
  ok(rules.checkGameSession(row, expected), "valid");
  ok(rules.checkGameSession(row, { ...expected, claimedDurationMs: 62_999 }), "3 s of clock tolerance");
  assert.equal(rules.checkGameSession(null, expected).reason, "unknown");
  assert.equal(rules.checkGameSession({ ...row, user_id: "other" }, expected).reason, "foreign");
  assert.equal(rules.checkGameSession({ ...row, game_slug: "flashback" }, expected).reason, "wrong_game");
  assert.equal(rules.checkGameSession({ ...row, used_at: new Date(now).toISOString() }, expected).reason, "used");
  assert.equal(rules.checkGameSession(row, { ...expected, claimedDurationMs: 63_001 }).reason, "too_fast");
  assert.equal(rules.checkGameSession({ ...row, started_at: new Date(now - 2 * 3_600_000 - 1).toISOString() }, expected).reason, "expired");
  assert.equal(rules.checkGameSession(row, { ...expected, claimedDurationMs: NaN }).reason, "invalid");
  assert.equal(rules.isSessionId("4f6c1b0e-8a2d-4c3b-9f1e-2a7d5c9b0e11"), true);
  assert.equal(rules.isSessionId("not-a-uuid"), false);
  assert.deepEqual([...rules.GAME_SESSION_SLUGS].sort(), ["enigma-scroll", "flash-translation", "flashback", "grammar-rush", "space-lex", "speed-verb-challenge", "wordfall"]);
  for (const reason of ["missing", "invalid", "unknown", "foreign", "wrong_game", "used", "too_fast", "expired"]) {
    assert.ok(rules.sessionRejectionMessage(reason).length > 10);
  }
});

console.log(`\n${cases} plausibility and session-rule cases passed.`);
