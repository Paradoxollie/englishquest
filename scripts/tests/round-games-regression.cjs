// Run with: node scripts/tests/round-games-regression.cjs
// Compile the pure TypeScript engines in memory with the project's TypeScript.
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

const flash = loadEngine("flashTranslation");
const memory = loadEngine("echoLex");
const verb = loadEngine("speed-verb-challenge");
let cases = 0;
function test(name, run) {
  run();
  cases += 1;
  console.log(`PASS ${name}`);
}
function seeded(seed = 12345) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
}
function newFlash(totalRounds = 3) {
  return flash.createGameState(flash.VOCABULARY, {
    totalRounds, minWaitMs: 100, maxWaitMs: 200, wrongAnswerPenaltyMs: 5000, rng: seeded(),
  });
}
function newVerb(difficulty = 1) {
  return verb.startNewRound(verb.createInitialGameState(verb.VERBS, {
    difficulty, totalTimeMs: 90000, rng: () => 0, allowImmediateRepeat: false,
  }), 0);
}
function answerFor(state) {
  return {
    pastSimple: state.currentRound.currentVerb.pastSimple[0],
    pastParticiple: state.currentRound.currentVerb.pastParticiple[0],
    translation: state.currentRound.currentVerb.translations[0],
  };
}

test("Flash Translation starts once and cannot reveal choices before starting", () => {
  const fresh = newFlash();
  assert.equal(flash.startAnswering(fresh, 0), fresh);
  const started = flash.startGame(fresh);
  assert.equal(flash.startGame(started), started);
  assert.equal(flash.startGame(newFlash(0)).phase, "ended");
});
test("Every vocabulary question has four distinct choices and exactly one correct answer", () => {
  const state = newFlash(flash.VOCABULARY.length);
  for (const round of state.rounds) {
    assert.equal(round.choices.length, 4, round.wordPair.french);
    assert.equal(new Set(round.choices.map((choice) => choice.text.trim().toLowerCase())).size, 4);
    assert.equal(round.choices.filter((choice) => choice.isCorrect).length, 1);
    assert.equal(round.choices[round.correctIndex].text, round.wordPair.english);
  }
});
test("Flash Translation vocabulary: 35+ words per level, one clear answer each", () => {
  const french = new Set();
  const english = new Set();
  for (const level of [1, 2, 3, 4, 5]) {
    const count = flash.VOCABULARY.filter((word) => word.level === level).length;
    assert.ok(count >= 35, `level ${level}: ${count}`);
  }
  for (const word of flash.VOCABULARY) {
    assert.ok([1, 2, 3, 4, 5].includes(word.level), word.french);
    assert.ok(!french.has(word.french), `duplicate prompt ${word.french}`);
    assert.ok(!english.has(word.english.toLowerCase()), `duplicate answer ${word.english}`);
    french.add(word.french);
    english.add(word.english.toLowerCase());
    assert.equal(word.distractors.length, 3, word.french);
    const normalized = word.distractors.map((item) => item.toLowerCase().trim());
    assert.equal(new Set(normalized).size, 3, word.french);
    assert.ok(!normalized.includes(word.english.toLowerCase()), `${word.french}: answer among distractors`);
    assert.ok(!/[\u2013\u2014]/.test(word.french + word.english), `${word.french}: no dashes`);
  }
  // Les premiers mots ne sont plus des phrasal verbs B1-B2.
  assert.equal(flash.VOCABULARY[0].level, 1);
});
test("Flash Translation rounds come from the player's level (70 %) and the level below", () => {
  for (const level of [1, 2, 3, 4, 5]) {
    for (let seed = 1; seed <= 30; seed += 1) {
      const state = flash.createGameState(flash.VOCABULARY, {
        totalRounds: 10, minWaitMs: 100, maxWaitMs: 200, wrongAnswerPenaltyMs: 5000, rng: seeded(seed * 97), level,
      });
      const levels = state.rounds.map((round) => round.wordPair.level);
      assert.equal(new Set(state.rounds.map((round) => round.wordPair.french)).size, 10);
      if (level === 1) assert.ok(levels.every((value) => value === 1));
      else {
        assert.equal(levels.filter((value) => value === level).length, 7, `level ${level}`);
        assert.equal(levels.filter((value) => value === level - 1).length, 3, `level ${level}`);
      }
    }
  }
});
test("Flash Translation ignores invalid choices and accepts one answer per round", () => {
  const current = flash.startAnswering(flash.startGame(newFlash()), 100);
  for (const choice of [-1, 4, 1.5, NaN]) assert.equal(flash.submitAnswer(current, choice, 200), current);
  const answer = flash.submitAnswer(current, current.rounds[0].correctIndex, 200);
  assert.equal(answer.totalTimeMs, 100);
  assert.equal(flash.submitAnswer(answer, 0, 300), answer);
  assert.equal(flash.startAnswering(answer, 400), answer);
});
test("Flash Translation final time includes reactions and one penalty per mistake", () => {
  let state = flash.startGame(newFlash());
  let totalReaction = 0;
  for (let i = 0; i < 3; i += 1) {
    state = flash.startAnswering(state, 1000 * i);
    const reaction = 200 + i * 100;
    totalReaction += reaction;
    const round = flash.getCurrentRound(state);
    const choice = i === 1 ? (round.correctIndex + 1) % 4 : round.correctIndex;
    state = flash.nextRound(flash.submitAnswer(state, choice, 1000 * i + reaction));
  }
  assert.equal(state.phase, "ended");
  assert.equal(state.wrongAnswers, 1);
  assert.equal(flash.getFinalScore(state), totalReaction + 5000);
  assert.equal(flash.getAverageReactionTime(state), 300);
  assert.equal(flash.nextRound(state), state);
});

test("Flashback records the first word once, after a correct decision", () => {
  const playing = memory.startGame(memory.createGameState(() => 0));
  assert.equal(playing.isNew, true);
  assert.equal(playing.seenWords.length, 0);
  const result = memory.submitDecision(playing, false);
  assert.equal(result.score, 1);
  assert.equal(result.seenWords.length, 1);
  assert.equal(memory.startGame(result), result);
});
test("Flashback remembers a displayed word after a mistake", () => {
  const first = memory.startGame(memory.createGameState(() => 0));
  const wrong = memory.submitDecision(first, true);
  assert.equal(wrong.strikes, 1);
  assert.equal(wrong.seenWords[0].english, first.currentWord.english);
  const second = memory.nextRound(wrong, () => 0);
  assert.notEqual(second.currentWord.english, first.currentWord.english);
  const secondResult = memory.submitDecision(second, false);
  const repeat = memory.nextRound(secondResult, () => 0.99);
  assert.equal(repeat.currentWord.english, first.currentWord.english);
  assert.equal(repeat.isNew, false);
  const meaning = memory.submitDecision(repeat, true);
  assert.equal(meaning.phase, "meaning");
  assert.equal(meaning.score, repeat.score);
  assert.equal(new Set(meaning.meaningChoices).size, 3);
  assert.ok(meaning.meaningChoices.includes(repeat.currentWord.french));
  assert.equal(memory.submitDecision(meaning, true), meaning);
  assert.equal(memory.submitMeaning(meaning, "absent"), meaning);
  assert.equal(memory.submitMeaning(meaning, repeat.currentWord.french).lastDecisionCorrect, true);
  const distractor = meaning.meaningChoices.find(text => text !== repeat.currentWord.french);
  assert.equal(memory.submitMeaning(meaning, distractor).score, repeat.score);
  assert.equal(memory.submitTimeout(meaning).strikes, repeat.strikes + 1);
});
test("Flashback rejects duplicate decisions and premature round advancement", () => {
  const idle = memory.createGameState(() => 0);
  assert.equal(memory.submitDecision(idle, false), idle);
  const playing = memory.startGame(idle);
  assert.equal(memory.nextRound(playing), playing);
  const result = memory.submitDecision(playing, false);
  assert.equal(memory.submitDecision(result, false), result);
});
test("Flashback stops on three errors and cannot restart a settled state", () => {
  let state = memory.startGame(memory.createGameState(() => 0));
  for (let i = 0; i < 3; i += 1) {
    state = memory.submitDecision(state, state.isNew);
    if (i < 2) state = memory.nextRound(state, () => 0);
  }
  assert.equal(state.phase, "gameOver");
  assert.equal(state.strikes, 3);
  assert.equal(state.score, 0);
  assert.equal(memory.nextRound(state), state);
  assert.equal(memory.submitDecision(state, false), state);
});
test("Flashback shows levelled words with their meaning and favours the player's level", () => {
  for (const level of [1, 2, 3, 4, 5]) {
    const pool = memory.flashbackWordsForLevel(level);
    assert.ok(pool.length >= 35, `level ${level}: ${pool.length}`);
    assert.ok(pool.every((word) => word.french && word.english && (word.level === level || word.level === level - 1)));
    const rng = seeded(level * 31);
    let state = memory.startGame(memory.createGameState(rng, pool, level));
    const shownLevels = [state.currentWord.level];
    for (let i = 0; i < 60; i += 1) {
      state = memory.submitDecision(state, !state.isNew, rng);
      if (state.phase === "meaning") state = memory.submitMeaning(state, state.currentWord.french);
      state = memory.nextRound(state, rng);
      if (state.isNew) shownLevels.push(state.currentWord.level);
    }
    assert.ok(state.seenWords.every((word) => pool.includes(word)), "words stay in the level pool");
    if (level > 1) {
      const main = shownLevels.filter((value) => value === level).length;
      assert.ok(main / shownLevels.length > 0.5, `level ${level}: ${main} of ${shownLevels.length}`);
    }
  }
});
test("Flashback remains consistent over 500 rounds including vocabulary exhaustion", () => {
  const rng = seeded(87654);
  let state = memory.startGame(memory.createGameState(rng));
  const seen = new Set();
  for (let i = 0; i < 500; i += 1) {
    assert.equal(state.isNew, !seen.has(state.currentWord.english));
    seen.add(state.currentWord.english);
    state = memory.submitDecision(state, !state.isNew, rng);
    if (state.phase === "meaning") state = memory.submitMeaning(state, state.currentWord.french);
    assert.equal(new Set(state.seenWords.map((word) => word.english)).size, state.seenWords.length);
    state = memory.nextRound(state, () => 0); // Force new words until exhausted.
  }
  assert.equal(state.score, 500);
  assert.equal(state.strikes, 0);
});

for (const difficulty of [1, 2, 3]) {
  test(`Speed Verb difficulty ${difficulty} requires the right fields`, () => {
    const state = newVerb(difficulty);
    assert.equal(state.currentRound.required.pastSimple, true);
    assert.equal(state.currentRound.required.pastParticiple, difficulty >= 2);
    assert.equal(state.currentRound.required.translation, difficulty >= 3);
    const answer = answerFor(state);
    assert.equal(verb.submitAnswer(state, answer, 1500).result.isCorrect, true);
    if (difficulty >= 2) assert.equal(verb.submitAnswer(state, { ...answer, pastParticiple: "" }, 1500).result.isCorrect, false);
    if (difficulty >= 3) assert.equal(verb.submitAnswer(state, { ...answer, translation: "" }, 1500).result.isCorrect, false);
  });
}
test("Speed Verb accepts documented alternate forms and case/outer whitespace", () => {
  const state = newVerb(2);
  const answer = { pastSimple: " WERE ", pastParticiple: " BEEN " };
  assert.equal(verb.submitAnswer(state, answer, 2000).result.isCorrect, true);
});
test("Speed Verb French answers accept ordinary text without explanatory parentheses", () => {
  for (const [base, translations] of [["wear", ["porter", "porter vêtement"]], ["spend", ["passer", "passer du temps"]], ["sit", ["s’asseoir"]], ["be", ["etre"]]]) {
    const pool = verb.VERBS.filter((entry) => entry.base === base);
    const state = verb.startNewRound(verb.createInitialGameState(pool, { difficulty: 3, totalTimeMs: 90000 }), 0);
    for (const translation of translations) {
      assert.equal(verb.submitAnswer(state, { ...answerFor(state), translation }, 2000).result.isCorrect, true, `${base}: ${translation}`);
    }
    assert.equal(verb.submitAnswer(state, { ...answerFor(state), translation: "wrong" }, 2000).result.isCorrect, false);
  }
});
test("Speed Verb awards score, streak and time bonus only once", () => {
  const state = verb.tickTimer(newVerb(), 2000);
  const result = verb.submitAnswer(state, answerFor(state), 2000);
  assert.equal(result.state.streak, 1);
  assert.equal(result.state.timeLeftMs, 89000);
  assert.equal(result.state.score, result.result.pointsAwarded);
  assert.equal(result.state.roundsCompleted, 1);
  const duplicate = verb.submitAnswer(result.state, answerFor(state), 2000);
  assert.equal(duplicate.state, result.state);
  assert.equal(duplicate.result.pointsAwarded, 0);
});
test("Speed Verb skip resets streak/multiplier and settles the round", () => {
  let state = newVerb();
  state = verb.submitAnswer(state, answerFor(state), 1000).state;
  state = verb.startNewRound(state, 2000);
  const skipped = verb.skipCurrentVerb(state);
  assert.equal(skipped.streak, 0);
  assert.equal(skipped.comboMultiplier, 1);
  assert.equal(skipped.highestStreak, 1);
  assert.equal(skipped.score, state.score);
  assert.equal(verb.submitAnswer(skipped, answerFor(state), 1000).state, skipped);
  assert.equal(verb.skipCurrentVerb(skipped), skipped);
});
test("Speed Verb wrong answer resets combo and cannot be corrected for extra points", () => {
  let state = newVerb();
  state = verb.submitAnswer(state, answerFor(state), 1000).state;
  state = verb.startNewRound(state, 2000);
  const wrong = verb.submitAnswer(state, { pastSimple: "incorrect" }, 1000).state;
  assert.equal(wrong.streak, 0);
  assert.equal(wrong.comboMultiplier, 1);
  assert.equal(wrong.score, state.score);
  assert.equal(verb.submitAnswer(wrong, answerFor(state), 1500).state, wrong);
});
test("Speed Verb deadline rejects answers and pending round starts", () => {
  const expired = verb.tickTimer(newVerb(), 90001);
  assert.equal(expired.ended, true);
  assert.equal(expired.timeLeftMs, 0);
  assert.equal(expired.currentRound, undefined);
  assert.equal(verb.submitAnswer(expired, { pastSimple: "was" }, 0).state, expired);
  assert.equal(verb.startNewRound(expired, 91000), expired);
});
test("Speed Verb empty pools end and ordinary rounds avoid immediate repeats", () => {
  const empty = verb.createInitialGameState([], { difficulty: 1, totalTimeMs: 90000 });
  assert.equal(verb.startNewRound(empty, 0).ended, true);
  const first = newVerb();
  const answered = verb.submitAnswer(first, answerFor(first), 1500).state;
  const second = verb.startNewRound(answered, 2000);
  assert.notEqual(first.currentRound.currentVerb.base, second.currentRound.currentVerb.base);
});
test("Speed Verb milestone points match score and time never exceeds initial cap", () => {
  let state = newVerb(3);
  for (let i = 1; i <= 10; i += 1) {
    const before = state.score;
    const result = verb.submitAnswer(state, answerFor(state), 2000);
    assert.equal(result.state.score - before, result.result.pointsAwarded);
    assert.ok(result.state.timeLeftMs <= state.config.totalTimeMs);
    if (i === 10) {
      assert.equal(result.result.isMilestone, true);
      assert.equal(result.result.timeBonus, 3000);
    }
    state = verb.startNewRound(result.state, i * 3000);
  }
  assert.equal(state.highestStreak, 10);
});

test("Flashback submitTimeout penalizes timeout without free points", () => {
  const start = memory.startGame(memory.createGameState(() => 0));
  const timedOut = memory.submitTimeout(start);
  assert.equal(timedOut.score, 0);
  assert.equal(timedOut.strikes, 1);
  assert.equal(timedOut.lastDecisionCorrect, false);
  assert.equal(timedOut.seenWords.length, 1);
  assert.equal(memory.submitTimeout(timedOut), timedOut);
});

test("Speed Verb removes answered verbs from deck and grants Facile speed bonus < 5 s", () => {
  let state = newVerb(1);
  const firstBase = state.currentRound.currentVerb.base;
  const quickResult = verb.submitAnswer(state, answerFor(state), 2000);
  assert.equal(quickResult.result.speedBonus >= 1, true);
  assert.equal(quickResult.state.remainingVerbs.some((entry) => entry.base === firstBase), false);
});

test("Grammar Rush weaveRushQueue builds a varied queue with focus ratio", () => {
  const grammar = loadEngine("grammar-rush");
  const pool = Array.from({ length: 30 }, (_, idx) => ({
    id: `q${idx}`,
    course: idx < 10 ? 7 : idx + 10,
    question: `Q${idx}`,
    options: ["A", "B"],
    correctAnswer: 0,
  }));
  const mixed = grammar.weaveRushQueue(pool, 7, seeded(123));
  assert.equal(mixed.length, 30);
  assert.equal(mixed[1].course, 7);
});

test("Spell Strike covers all 5 levels cleanly, accepts variants and builds diffs", () => {
  const spell = loadEngine("spellStrike");
  assert.ok(spell.SPELL_STRIKE_WORDS.length >= 150);
  for (const level of [1, 2, 3, 4, 5]) {
    const levelWords = spell.SPELL_STRIKE_WORDS.filter((w) => w.level === level);
    assert.ok(levelWords.length >= 25, `level ${level}: ${levelWords.length}`);
    const picked = spell.pickSpellRounds({ level, totalRounds: 10, rng: seeded(level * 17) });
    assert.equal(picked.length, 10);
    assert.equal(new Set(picked.map((w) => w.id)).size, 10);
  }
  const fav = spell.SPELL_STRIKE_WORDS.find((w) => w.word === "favourite");
  assert.equal(spell.isSpellAnswerCorrect(fav, " FAVORITE "), true);
  assert.equal(spell.isSpellAnswerCorrect(fav, "favrit"), false);
  const diff = spell.buildSpellingDiff("friend", "freind");
  assert.equal(diff[2].status, "wrong");
  assert.equal(diff[0].status, "match");
});

test("Echo Signal scenarios cover all 5 levels cleanly with valid comprehension questions", () => {
  const echo = loadEngine("echoSignal");
  assert.ok(echo.ECHO_SIGNAL_SCENARIOS.length >= 40);
  for (const level of [1, 2, 3, 4, 5]) {
    const list = echo.ECHO_SIGNAL_SCENARIOS.filter((s) => s.level === level);
    assert.ok(list.length >= 8, `level ${level}: ${list.length}`);
    for (const s of list) {
      assert.ok(s.lines.length >= 1);
      assert.equal(s.questions.length, 2);
      for (const q of s.questions) {
        assert.equal(q.options.length, 4);
        assert.equal(new Set(q.options).size, 4, `${s.id} duplicate option`);
        assert.ok(q.correctIndex >= 0 && q.correctIndex <= 3);
      }
    }
    const picked = echo.pickEchoSignalMissions({ level, count: 4, rng: seeded(level * 29) });
    assert.equal(picked.length, 4);
    assert.equal(new Set(picked.map((s) => s.id)).size, 4);
  }
});

test("Spell Strike never shows the answer, checks capitals and aligns the correction", () => {
  const spell = loadEngine("spellStrike");
  const strip = (v) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  for (const entry of spell.SPELL_STRIKE_WORDS) {
    assert.ok(!strip(entry.hint).includes(strip(entry.word)), `${entry.id}: l'indice contient le mot`);
    assert.equal(entry.sentence.split("____").length, 2, `${entry.id}: un seul trou`);
    if (strip(entry.french).includes(strip(entry.word))) {
      assert.equal(spell.shouldShowSpellMeaning(entry), false, `${entry.id}: le sens révèle le mot`);
    }
  }
  const byWord = (w) => spell.SPELL_STRIKE_WORDS.find((e) => e.word === w);
  assert.equal(spell.shouldShowSpellMeaning(byWord("orange")), false);
  assert.equal(spell.shouldShowSpellMeaning(byWord("education")), false);
  assert.equal(spell.shouldShowSpellMeaning(byWord("address")), true);
  assert.equal(spell.spellAnswerIssue(byWord("Monday"), "monday"), "capital");
  assert.equal(spell.spellAnswerIssue(byWord("Monday"), "Monday"), "ok");
  assert.equal(spell.spellAnswerIssue(byWord("friend"), "Friend"), "ok");
  const missing = spell.buildSpellingDiff("listen", "liten").map((c) => c.status);
  assert.deepEqual(missing, ["match", "match", "missing", "match", "match", "match"]);
  const extra = spell.buildSpellingDiff("dinner", "dinnerr").map((c) => c.status);
  assert.equal(extra.filter((st) => st === "extra").length, 1);
  assert.equal(extra.filter((st) => st === "match").length, 6);
});

test("Echo Signal shuffles answers so their position never gives them away", () => {
  const echo = loadEngine("echoSignal");
  const positions = [0, 0, 0, 0];
  const rng = seeded(4242);
  for (let run = 0; run < 400; run += 1) {
    const level = (run % 5) + 1;
    for (const scenario of echo.pickEchoSignalMissions({ level, count: 4, rng })) {
      const source = echo.ECHO_SIGNAL_SCENARIOS.find((s) => s.id === scenario.id);
      scenario.questions.forEach((q, i) => {
        const original = source.questions[i];
        assert.equal(q.options[q.correctIndex], original.options[original.correctIndex], `${scenario.id}: bonne réponse conservée`);
        positions[q.correctIndex] += 1;
      });
    }
  }
  const total = positions.reduce((a, b) => a + b, 0);
  for (const count of positions) assert.ok(count / total < 0.35 && count / total > 0.15, `positions ${positions.join("/")}`);
});

test("Speed Verb pools grow with the level and accept the common meanings", () => {
  const easy = verb.VERB_POOLS[1].map((v) => v.base);
  const medium = verb.VERB_POOLS[2].map((v) => v.base);
  assert.equal(verb.VERB_POOLS[3].length, verb.VERBS.length);
  assert.ok(easy.length >= 60 && easy.length < medium.length && medium.length < verb.VERBS.length);
  for (const base of easy) assert.ok(medium.includes(base), `${base} manque au niveau moyen`);
  for (const base of ["be", "go", "forget", "learn"]) assert.ok(easy.includes(base), base);
  for (const base of ["bind", "wring", "forgo", "undergo"]) assert.ok(!easy.includes(base), base);
  const byBase = (b) => verb.VERBS.find((v) => v.base === b);
  assert.ok(byBase("think").translations.includes("réfléchir"));
  assert.ok(byBase("feel").translations.includes("se sentir"));
  const lie = byBase("lie");
  assert.ok(lie.hint && !lie.translations.some((t) => lie.hint.includes(t)));
});

console.log(`\n${cases} round-game regression cases passed.`);
