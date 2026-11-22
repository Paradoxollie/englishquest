// Run with: node scripts/tests/course-question-invariants.cjs
// Read every native lesson quiz and verify the Grammar Rush bank/queues match it.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const loaded = new Map();
function loadSource(filename) {
  filename = path.resolve(filename);
  if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = new Module(filename, module);
  loaded.set(filename, mod);
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (name) => {
    if (name === "server-only") return {};
    if (name.startsWith("@/") || name.startsWith("./")) {
      const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      return loadSource(resolved);
    }
    return originalRequire(name);
  };
  mod._compile(output, filename);
  return mod.exports;
}

function nativeQuiz(course) {
  const filename = path.join(root, `lib/courses/list/course${course}.tsx`);
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  assert.equal(source.parseDiagnostics.length, 0, `Course ${course}: valid TSX`);
  const quizzes = [];
  function visit(node) {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(source) === "Quiz") {
      const attr = node.attributes.properties.find((item) => ts.isJsxAttribute(item) && item.name.getText(source) === "questions");
      assert.ok(attr && attr.initializer && ts.isJsxExpression(attr.initializer), `Course ${course}: quiz question data`);
      const expression = attr.initializer.expression;
      assert.ok(ts.isArrayLiteralExpression(expression), `Course ${course}: inspectable question array`);
      quizzes.push(vm.runInNewContext(`(${expression.getText(source)})`));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(quizzes.length, 1, `Course ${course}: exactly one complete quiz`);
  return { source: source.text, questions: quizzes[0] };
}
function checkQuestion(question, context) {
  assert.equal(typeof question.question, "string", `${context}: prompt text`);
  assert.ok(question.question.trim(), `${context}: nonempty prompt`);
  assert.ok(Array.isArray(question.options) && question.options.length >= 2 && question.options.length <= 6, `${context}: playable option count`);
  assert.ok(question.options.every((option) => typeof option === "string" && option.trim()), `${context}: nonempty options`);
  assert.equal(new Set(question.options.map((option) => option.trim().toLowerCase())).size, question.options.length, `${context}: distinct options`);
  assert.ok(Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer < question.options.length, `${context}: valid correct index`);
  for (const text of [question.question, question.explanation ?? "", ...question.options]) {
    assert.ok(!HTML_ENTITY.test(text), `${context}: HTML entity shown as raw text in "${text}"`);
  }
}
// Les chaînes JavaScript n'interprètent pas &apos; : l'élève verrait « Don&apos;t ».
const HTML_ENTITY = /&(?:[a-z]+|#\d+);/i;
const STRING_PROPERTY_WITH_ENTITY = /^\s*(?:objective|title|question|explanation|options)\s*:.*&(?:[a-z]+|#\d+);/im;

const { chapters, getChapterForCourse } = loadSource(path.join(root, "lib/courses/chapters.ts"));
const { paliers } = loadSource(path.join(root, "lib/courses/data.ts"));
const { buildRushQueue } = loadSource(path.join(root, "lib/games/grammar-rush-server.ts"));
const { GRAMMAR_RUSH_MAX_QUESTIONS } = loadSource(path.join(root, "lib/games/grammar-rush.ts"));
const bank = JSON.parse(fs.readFileSync(path.join(root, "lib/placement/questions.json"), "utf8"));
const bankMap = new Map(bank.map((question) => [question.id, question]));
assert.equal(bankMap.size, bank.length, "No duplicate question-bank IDs");
const courseIds = chapters.flatMap((chapter) => chapter.courseIds);
assert.equal(new Set(courseIds).size, courseIds.length, "Every course belongs to one chapter");
assert.deepEqual([...courseIds].sort((a, b) => a - b), Array.from({ length: 50 }, (_, index) => index + 1));
assert.equal(chapters.length, paliers.length);
const lessonIndex = fs.readFileSync(path.join(root, "lib/courses/lessons.tsx"), "utf8");
let nativeCount = 0;
for (const course of courseIds) {
  const quiz = nativeQuiz(course);
  assert.ok(new RegExp(`courseNumber:\\s*${course}\\b`).test(quiz.source), `Course ${course}: declared lesson number matches path`);
  assert.ok(!STRING_PROPERTY_WITH_ENTITY.test(quiz.source), `Course ${course}: no HTML entity inside a string property`);
  assert.ok(new RegExp(`import \\{ course${course} \\} from "\\./list/course${course}"`).test(lessonIndex), `Course ${course}: imported by lesson index`);
  assert.ok(new RegExp(`\\b${course}: course${course}\\b`).test(lessonIndex), `Course ${course}: registered in lesson index`);
  assert.equal(quiz.questions.length, 10, `Course ${course}: complete ten-question quiz`);
  assert.equal(new Set(quiz.questions.map((question) => question.id)).size, quiz.questions.length, `Course ${course}: unique native IDs`);
  for (const question of quiz.questions) {
    nativeCount += 1;
    checkQuestion(question, `Course ${course} question ${question.id}`);
    assert.equal(typeof question.explanation, "string");
    assert.ok(question.explanation.trim(), `Course ${course}: feedback explanation`);
    const stored = bankMap.get(`${course}-${question.id}`);
    assert.ok(stored, `Course ${course} question ${question.id}: present in Grammar Rush/placement bank`);
    assert.equal(stored.course, course);
    assert.equal(stored.question, question.question, `Course ${course} question ${question.id}: prompt synchronized`);
    assert.deepEqual(stored.options, Array.from(question.options), `Course ${course} question ${question.id}: choices synchronized`);
    assert.equal(stored.correctAnswer, question.correctAnswer, `Course ${course} question ${question.id}: correct answer synchronized`);
  }
}
assert.equal(bank.length, nativeCount, "Question bank has no orphaned entries");
for (const question of bank) checkQuestion(question, `Bank ${question.id}`);

const { gradeCourseQuiz } = loadSource(path.join(root, "lib/courses/quiz-grading.ts"));
const { getCourseQuizPool } = loadSource(path.join(root, "lib/courses/exercises-server.ts"));
const { gradeLiveAnswers } = loadSource(path.join(root, "lib/classes/live-grading.ts"));
for (const course of [1, 27, 50]) {
  const own = bank.filter((question) => question.course === course);
  const perfect = own.map((question) => ({ id: Number(question.id.split("-")[1]), choice: question.correctAnswer }));
  assert.deepEqual(gradeCourseQuiz(course, perfect), { score: own.length, total: own.length }, `Course ${course}: perfect copy`);
  const oneWrong = perfect.map((answer, index) => index === 0 ? { ...answer, choice: (answer.choice + 1) % own[0].options.length } : answer);
  assert.deepEqual(gradeCourseQuiz(course, oneWrong), { score: own.length - 1, total: own.length });
  assert.equal(gradeCourseQuiz(course, perfect.slice(1)), null, "Incomplete copy refused");
  assert.equal(gradeCourseQuiz(course, [...perfect.slice(1), perfect[1]]), null, "Duplicate answer refused");
  assert.equal(gradeCourseQuiz(course, perfect.map((answer) => ({ ...answer, choice: 9 }))), null, "Missing choice refused");
  assert.equal(gradeCourseQuiz(course, { score: 10, total: 10 }), null, "Client score refused");
}
// Séries mêlant QCM, phrases à compléter et phrases à remettre dans l'ordre.
const check = loadSource(path.join(root, "lib/courses/exercise-check.ts"));
const extras1 = JSON.parse(fs.readFileSync(path.join(root, "lib/courses/exercises/course1.json"), "utf8")).items;
const gap = extras1.find((item) => item.type === "gap");
const order = extras1.find((item) => item.type === "order");
const mixed = [
  ...bank.filter((q) => q.course === 1 && /^1-\d+$/.test(q.id)).slice(0, 8).map((q) => ({ id: q.id.split("-")[1], choice: q.correctAnswer })),
  { id: gap.id, text: `  ${gap.answers[0].toUpperCase()} ` },
  { id: order.id, text: order.answers[0].replace(/[.?!]$/, "").toLowerCase() },
];
assert.deepEqual(gradeCourseQuiz(1, mixed), { score: 10, total: 10 }, "Typed answers ignore case, spaces and final punctuation");
assert.deepEqual(gradeCourseQuiz(1, mixed.map((a) => a.id === gap.id ? { ...a, text: "zzz" } : a)), { score: 9, total: 10 });
assert.equal(gradeCourseQuiz(1, mixed.map((a) => a.id === gap.id ? { id: a.id, choice: 0 } : a)), null, "A gap needs text");
assert.equal(gradeCourseQuiz(1, mixed.map((a) => a.id === order.id ? { ...a, text: "x".repeat(201) } : a)), null, "Text length is bounded");
assert.equal(gradeCourseQuiz(1, [...mixed.slice(0, 9), { id: "x99", choice: 0 }]), null, "Unknown exercise refused");
assert.equal(check.normalizeAnswer(" Isn’t  it? "), "isn't it");
for (const [course, id, accepted, rejected] of [
  [1, "x13", "Today, they are very happy.", "They happy are very today."],
  [41, "x11", "If Lucie had played, we would have won.", "If had Lucie played, we would have won."],
  [47, "x11", "Although it was cloudy, we went to the beach.", "Although cloudy was it, we went to the beach."],
  [49, "x11", "Turn your phones off, please.", "Turn your off phones, please."],
  [49, "x11", "Turn off your phones, please.", "Turn off phones your, please."],
  [49, "x11", "Please turn your phones off.", "Please your phones turn off."],
  [49, "x11", "Please turn off your phones.", "Please turn your off phones."],
  [50, "x12", "We set the tent up near the lake.", "We the tent set up near the lake."],
]) {
  const items = JSON.parse(fs.readFileSync(path.join(root, `lib/courses/exercises/course${course}.json`), "utf8")).items;
  const item = items.find((exercise) => exercise.id === id);
  assert.equal(check.isOrderAnswerCorrect(item, accepted), true, `Course ${course} accepts a valid alternative`);
  assert.equal(check.isOrderAnswerCorrect(item, rejected), false, `Course ${course} checks the order`);
}
function verifyMark(course, item, response, correct) {
  const pool = getCourseQuizPool(course);
  const otherAnswers = pool.filter(q => q.type === "mcq" && q.id !== item.id).slice(0, 9)
    .map(q => ({ id: q.id, choice: q.correctAnswer }));
  const context = `course ${course} exercise ${item.id} answer ${JSON.stringify(response)}`;
  assert.equal(check.isExerciseAnswerCorrect(item, response), correct, `Browser: ${context}`);
  assert.deepEqual(gradeCourseQuiz(course, [...otherAnswers, response]), { score: correct ? 10 : 9, total: 10 }, `Solo: ${context}`);
  const [mark] = gradeLiveAnswers(pool, [response]);
  assert.equal(mark?.ok, correct, `Live: ${context}`);
  assert.equal(mark.revision, response.revision, `Resumed live answer: ${context}`);
}
for (const [course,id,correct,incorrect] of [
  [1,"x7","’s","’re"], [1,"x9","Has  got","have got"], [1,"x9","has","has got got"], [1,"x9","’s got","’s"],
  [15,"x7","be able to","able"], [17,"x7","ought to","ought"], [17,"x9","’d better","’d"],
  [34,"x7","’s being recorded","’s been recorded"],
  [41,"x8","’ve gotten","’d gotten"], [44,"x10","’d not read","’ve not read"],
]) {
  const item = JSON.parse(fs.readFileSync(path.join(root,`lib/courses/exercises/course${course}.json`),"utf8")).items.find((q) => q.id === id);
  assert.equal(check.isGapAnswerCorrect(item,correct),true);
  assert.equal(check.isGapAnswerCorrect(item,incorrect),false);
  verifyMark(course, item, check.writtenExerciseAnswer(item, correct), true);
  verifyMark(course, item, check.writtenExerciseAnswer(item, incorrect), false);
}
const blueEyes = extras1.find(item => item.id === "x9");
assert.match(blueEyes.prompt, /She ___ blue eyes\./);
verifyMark(1, blueEyes, { id: "x9", text: "’s" }, true); // The old prompt supplied “got”.
verifyMark(1, blueEyes, { id: "x9", text: "has got" }, true);
verifyMark(1, blueEyes, { id: "x9", text: "’s", revision: 2 }, false);
verifyMark(1, blueEyes, { id: "x9", text: "have got", revision: 2 }, false);
verifyMark(1, blueEyes, { id: "x9", text: "has", revision: 999 }, false);
assert.equal(check.displayToken("She", 0), "she");
assert.equal(check.displayToken("Tom", 0), "Tom");
assert.equal(check.displayToken("I", 0), "I");
let seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
let exerciseCount = 0;
for (let course = 1; course <= 50; course += 1) {
  const pool = getCourseQuizPool(course);
  for (const item of pool) {
    exerciseCount++;
    if (item.type === "mcq") {
      item.options.forEach((_, choice) => verifyMark(course, item, { id: item.id, choice }, choice === item.correctAnswer));
    } else {
      for (const text of item.answers) verifyMark(course, item, check.writtenExerciseAnswer(item, text), true);
      verifyMark(course, item, check.writtenExerciseAnswer(item, "zzz"), false);
      for (const [index, accepted] of (item.previousAnswers ?? []).entries()) {
        for (const text of accepted) verifyMark(course, item, { id: item.id, text, revision: index + 1 }, true);
      }
    }
  }
  for (let draw = 0; draw < 4; draw += 1) {
    const series = check.drawQuizSeries(pool, rnd);
    assert.equal(series.length, 10, `Course ${course}: ten exercises`);
    assert.equal(new Set(series.map((item) => item.id)).size, 10, `Course ${course}: no repeat`);
    assert.equal(series.filter((item) => item.type === "gap").length, 2);
    assert.equal(series.filter((item) => item.type === "order").length, 2);
    const answers = series.map((item) => item.type === "mcq" ? { id: item.id, choice: item.correctAnswer } : check.writtenExerciseAnswer(item, item.answers[0]));
    assert.deepEqual(gradeCourseQuiz(course, answers), { score: 10, total: 10 }, `Course ${course}: perfect mixed series`);
  }
}
console.log("PASS Course quizzes are graded on the server from the answers only, mixed series of 50 courses included.");
console.log(`PASS All answer options and listed written variants of ${exerciseCount} exercises agree in the browser, solo scores and live marks.`);

process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "test-only-key";
const { createPlacementToken, readPlacementToken, createPlacementStepToken, readPlacementStepToken } = loadSource(path.join(root, "lib/placement/placement-token.ts"));
const now = Date.UTC(2026, 9, 15);
const token = createPlacementToken(3, now);
assert.equal(readPlacementToken(token, now + 1000), 3, "Signed guest placement is accepted");
assert.equal(readPlacementToken(token.replace(/^3\./, "5."), now), null, "Edited chapter is refused");
assert.equal(readPlacementToken(`${token}x`, now), null, "Edited signature is refused");
assert.equal(readPlacementToken(token, now + 15 * 24 * 3600 * 1000), null, "Old result expires");
assert.equal(readPlacementToken(createPlacementToken(9, now), now), null, "Unknown chapter is refused");
assert.equal(readPlacementToken(undefined, now), null);
const step = createPlacementStepToken(2, now);
assert.equal(readPlacementStepToken(step, now), 2);
assert.equal(readPlacementToken(step, now), null, "A step cannot be redeemed as a final placement");
assert.equal(readPlacementStepToken(token, now), null, "A final result cannot skip test stages");
assert.equal(readPlacementStepToken(step, now + 14 * 24 * 3600 * 1000), null);
console.log("PASS Guest placement results are signed, tamper-proof and expire.");

let queueScenarios = 0;
for (const chapter of chapters) {
  const allowed = new Set(chapters.filter((item) => item.id <= chapter.id).flatMap((item) => item.courseIds));
  const focusCases = [null, ...chapter.courseIds, 999];
  for (const focusCourseId of focusCases) {
    for (let iteration = 0; iteration < 5; iteration += 1) {
      queueScenarios += 1;
      const queue = buildRushQueue({ maxChapter: chapter.id, focusCourseId });
      assert.equal(queue.length, GRAMMAR_RUSH_MAX_QUESTIONS, `Chapter ${chapter.id}: full playable queue`);
      assert.equal(new Set(queue.map((question) => question.id)).size, queue.length, "No duplicate queued question");
      assert.ok(queue.every((question) => allowed.has(question.course)), `Chapter ${chapter.id}: no questions above permitted level`);
      for (const question of queue) {
        // Les propositions sont mélangées à chaque partie : même question, mêmes options, bonne réponse suivie.
        const source = bankMap.get(question.id);
        assert.equal(question.question, source.question, "Queue preserves the prompt");
        assert.deepEqual([...question.options].sort(), [...source.options].sort(), "Queue preserves the options");
        assert.equal(question.options[question.correctAnswer], source.options[source.correctAnswer], "Queue keeps the right answer");
      }
      if (focusCourseId != null && allowed.has(focusCourseId)) {
        assert.equal(queue.filter((question) => question.course === focusCourseId).length, 10, `Course ${focusCourseId}: all focused revision questions included`);
        assert.equal(queue[1].course, focusCourseId, `Course ${focusCourseId}: focus begins at second question`);
      }
    }
  }
  for (const course of chapter.courseIds) assert.equal(getChapterForCourse(course).id, chapter.id);
}
console.log(`PASS ${courseIds.length} lessons / ${nativeCount} quiz questions match the complete question bank.`);
console.log(`PASS ${chapters.length} chapters / ${queueScenarios} Grammar Rush queue scenarios respect level, focus, uniqueness and correct indices.`);
