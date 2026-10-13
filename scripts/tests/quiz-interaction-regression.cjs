// Exercise the real Quiz handlers with batched renders; no browser or account writes.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const filename = path.resolve(__dirname, "../../components/courses/quiz.tsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const questions = [1, 2, 3].map((id) => ({ id, question: `Question ${id}`, options: ["Right", "Wrong"], correctAnswer: 0, explanation: "Explanation" }));

function harness(items = questions, mission = null) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
      return [slots[index], (next) => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useEffect(effect) { cursor += 1; effects.push(effect); },
  };
  const element = (type, props) => ({ type, props });
  const mod = new Module(filename, module);
  mod.require = (name) => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx: element, jsxs: element, Fragment: "fragment" };
    if (name === "next/link") return { __esModule: true, default: "a" };
    if (name === "@/components/courses/course-mission-provider") return { useCourseMission: () => mission };
    if (name === "@/lib/courses/quiz-score") return { isCourseQuizScorePassing: (score, total) => total > 0 && score / total >= 0.8 };
    throw new Error(`Unexpected import ${name}`);
  };
  mod._compile(compiled, filename);
  return {
    render() { cursor = 0; effects = []; return mod.exports.Quiz({ questions: items }); },
    effects() { return effects; },
  };
}
function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  const children = Array.isArray(node.props?.children) ? node.props.children.flat(Infinity) : [node.props?.children];
  for (const child of children) { const result = find(child, predicate); if (result) return result; }
  return null;
}
function content(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  if (Array.isArray(node)) return node.map(content).join("");
  return content(node.props?.children);
}
function button(tree, label) {
  const found = find(tree, (node) => node.type === "button" && content(node) === label);
  assert.ok(found, `Button '${label}' exists`);
  return found.props.onClick;
}
function option(tree, index = 0) {
  return find(tree, (node) => node.type === "button" && node.props?.className?.startsWith("eq-quiz-option") && content(node).endsWith(index === 0 ? "Right" : "Wrong")).props.onClick;
}
function header(tree) { return content(find(tree, (node) => node.props?.className === "eq-quiz-head")); }
let cases = 0;
async function test(name, run) { await run(); cases += 1; console.log(`PASS ${name}`); }

(async () => {
  await test("Double answers count once before the next React render", () => {
    const h = harness();
    const tree = h.render();
    const answer = option(tree);
    answer(); answer(); option(tree, 1)();
    assert.match(header(h.render()), /1 bonne$/);
  });
  await test("Double next cannot skip a question or answer it through an obsolete button", () => {
    const h = harness();
    const original = h.render();
    option(original)();
    const answered = h.render();
    const next = button(answered, "Question suivante");
    next(); next(); option(original)();
    const second = h.render();
    assert.match(header(second), /Question 2 sur 3/);
    assert.match(header(second), /1 bonne$/);
    assert.equal(find(second, (node) => node.type === "button" && content(node) === "Question suivante"), null);
  });
  await test("Finishing, replaying and finishing again preserve score bounds", () => {
    const h = harness();
    for (let attempt = 0; attempt < 2; attempt += 1) {
      for (let i = 0; i < 3; i += 1) {
        const tree = h.render();
        const answer = option(tree); answer(); answer();
        const next = button(h.render(), i < 2 ? "Question suivante" : "Voir le résultat");
        next(); next();
      }
      const result = h.render();
      assert.equal(content(find(result, (node) => node.props?.className === "eq-quiz-score")), "3 / 3");
      button(result, "Refaire le quiz")();
      assert.match(header(h.render()), /Question 1 sur 3.*0 bonne$/);
    }
  });
  await test("Empty quizzes render an availability message without crashing", () => {
    assert.match(content(harness([]).render()), /pas disponible/);
  });
  await test("An old quiz save cannot overwrite the replay feedback", async () => {
    let resolveSave;
    const mission = { isAuthenticated: true, isMissionTrackingEnabled: true, submitQuizResult: () => new Promise((resolve) => { resolveSave = resolve; }) };
    const h = harness(questions.slice(0, 1), mission);
    option(h.render())();
    button(h.render(), "Voir le résultat")();
    const result = h.render();
    for (const effect of h.effects()) effect();
    assert.equal(typeof resolveSave, "function");
    button(result, "Refaire le quiz")();
    resolveSave({ missionState: { quizPassed: true, readyToComplete: false }, courseCompleted: null });
    await Promise.resolve(); await Promise.resolve();
    assert.equal(find(h.render(), (node) => node.props?.className === "eq-quiz-sync"), null);
  });
  await test("Rejected quiz saves surface an error instead of an unhandled rejection", async () => {
    const mission = { isAuthenticated: true, isMissionTrackingEnabled: true, submitQuizResult: async () => { throw new Error("Offline"); } };
    const h = harness(questions.slice(0, 1), mission);
    option(h.render())();
    button(h.render(), "Voir le résultat")();
    h.render();
    for (const effect of h.effects()) effect();
    await Promise.resolve(); await Promise.resolve();
    assert.match(content(find(h.render(), (node) => node.props?.className === "eq-quiz-sync")), /pas pu être enregistré/);
  });
  console.log(`\n${cases} Quiz interaction regression cases passed.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
