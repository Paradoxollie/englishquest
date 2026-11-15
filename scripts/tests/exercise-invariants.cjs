// Run: node scripts/tests/exercise-invariants.cjs [--require-all]
// Vérifie les exercices supplémentaires des cours (lib/courses/exercises/courseN.json).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const dir = path.join(root, "lib/courses/exercises");
const requireAll = process.argv.includes("--require-all");
const EXPECTED = { mcq: 6, gap: 4, order: 3 };
const ENTITY = /&(?:[a-z]+|#\d+);/i;
const BANNED = /[—–]/; // tirets longs : style refusé
const bank = JSON.parse(fs.readFileSync(path.join(root, "lib/placement/questions.json"), "utf8"));

function words(sentence) {
  return sentence.replace(/[.?!]+$/, "").trim().split(/\s+/);
}
function checkText(text, context) {
  assert.equal(typeof text, "string", `${context}: texte attendu`);
  assert.ok(text.trim().length > 0, `${context}: texte vide`);
  assert.ok(!ENTITY.test(text), `${context}: entité HTML brute dans « ${text} »`);
  assert.ok(!BANNED.test(text), `${context}: tiret long interdit dans « ${text} »`);
}

let files = 0;
let items = 0;
for (let course = 1; course <= 50; course += 1) {
  const file = path.join(dir, `course${course}.json`);
  if (!fs.existsSync(file)) {
    assert.ok(!requireAll, `Cours ${course}: fichier d'exercices manquant`);
    continue;
  }
  files += 1;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.equal(data.course, course, `Cours ${course}: champ course`);
  assert.ok(Array.isArray(data.items), `Cours ${course}: items`);
  const counts = { mcq: 0, gap: 0, order: 0 };
  const ids = new Set();
  const signature = (question, options) => `${question.trim().toLowerCase()}|${[...options].map((o) => o.trim().toLowerCase()).sort().join("|")}`;
  const nativeQuestions = new Set(bank.filter((q) => q.course === course && !/-x\d+$/.test(q.id)).map((q) => signature(q.question, q.options)));
  for (const item of data.items) {
    const ctx = `Cours ${course} ${item.id}`;
    assert.match(item.id, /^x\d{1,2}$/, `${ctx}: identifiant x1, x2…`);
    assert.ok(!ids.has(item.id), `${ctx}: identifiant en double`);
    ids.add(item.id);
    assert.ok(item.type in counts, `${ctx}: type inconnu ${item.type}`);
    counts[item.type] += 1;
    checkText(item.explanation, `${ctx} explication`);
    if (item.type === "mcq") {
      checkText(item.question, `${ctx} question`);
      assert.ok(Array.isArray(item.options) && item.options.length >= 3 && item.options.length <= 4, `${ctx}: 3 ou 4 propositions`);
      item.options.forEach((option, index) => checkText(option, `${ctx} proposition ${index}`));
      assert.equal(new Set(item.options.map((o) => o.trim().toLowerCase())).size, item.options.length, `${ctx}: propositions en double`);
      assert.ok(!nativeQuestions.has(signature(item.question, item.options)), `${ctx}: reprend une question du quiz existant`);
      assert.ok(Number.isInteger(item.correctAnswer) && item.correctAnswer >= 0 && item.correctAnswer < item.options.length, `${ctx}: correctAnswer`);
    } else if (item.type === "gap") {
      checkText(item.prompt, `${ctx} consigne`);
      assert.equal((item.prompt.match(/___/g) || []).length, 1, `${ctx}: exactement un trou ___`);
      assert.ok(Array.isArray(item.answers) && item.answers.length >= 1 && item.answers.length <= 4, `${ctx}: 1 à 4 réponses acceptées`);
      item.answers.forEach((answer, index) => {
        checkText(answer, `${ctx} réponse ${index}`);
        assert.ok(!answer.includes("___") && answer.length <= 40, `${ctx}: réponse courte attendue`);
      });
    } else {
      assert.ok(Array.isArray(item.answers) && item.answers.length >= 1 && item.answers.length <= 3, `${ctx}: 1 à 3 phrases acceptées`);
      item.answers.forEach((answer, index) => checkText(answer, `${ctx} phrase ${index}`));
      const base = words(item.answers[0]).map((w) => w.toLowerCase()).sort().join(" ");
      assert.ok(words(item.answers[0]).length >= 3 && words(item.answers[0]).length <= 12, `${ctx}: 3 à 12 mots`);
      for (const answer of item.answers) {
        assert.equal(words(answer).map((w) => w.toLowerCase()).sort().join(" "), base, `${ctx}: les phrases acceptées utilisent les mêmes mots`);
      }
      if (item.translation !== undefined) checkText(item.translation, `${ctx} traduction`);
    }
    items += 1;
  }
  assert.deepEqual(counts, EXPECTED, `Cours ${course}: 6 QCM, 4 phrases à compléter, 3 phrases à remettre dans l'ordre`);
}
console.log(`PASS ${files} fichiers d'exercices, ${items} exercices supplémentaires valides.`);
