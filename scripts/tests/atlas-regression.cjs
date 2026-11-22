// Independent PostgreSQL and cookie jars exercise the real pilot actions offline.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { PGlite } = require("@electric-sql/pglite");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const db = new PGlite();
const accounts = [randomUUID(), randomUUID()];
let user, offline = false;
let jar = new Map();
const items = () => Array.from(jar, ([name, value]) => ({ name, value }));
const admin = {
  from(name) {
    assert.equal(name, "adventure_checkpoints");
    return { select: () => ({ eq: async (column, id) => {
      assert.equal(column, "user_id");
      return offline ? { error: true } : { data: (await db.query("select mission, stage from adventure_checkpoints where user_id=$1", [id])).rows };
    } }) };
  },
  async rpc(name, p) {
    if (offline) return { error: true };
    if (name === "save_adventure_draft") {
      const result = await db.query("select save_adventure_draft($1,$2,$3,$4,$5::jsonb) as version", [p.p_user, p.p_mission, p.p_stage, p.p_version, JSON.stringify(p.p_draft)]);
      return { data: result.rows[0].version, error: null };
    }
    assert.equal(name, "keep_adventure_checkpoint");
    await db.query("select keep_adventure_checkpoint($1,$2,$3)", [p.p_user, p.p_mission, p.p_stage]);
    return { error: null };
  },
};
const mocks = {
  "server-only": {},
  "next/headers": { cookies: async () => ({ getAll: items, has: name => jar.has(name),
    set(name, value, options) {
      assert.ok(options.httpOnly);
      assert.equal(options.path, name.startsWith("eq-atlas2-g") ? "/" : "/quest");
      if (options.maxAge) jar.set(name, value); else jar.delete(name);
    } }) },
  "@/lib/supabase/auth-cache": { getServerUser: async () => user ? { id: user } : null },
  "@/lib/supabase/admin": { createSupabaseAdminClient: () => admin },
};
const modules = new Map();
function load(file) {
  const key = path.resolve(root, file);
  if (modules.has(key)) return modules.get(key);
  const mod = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(key, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  const localRequire = request => {
    if (Object.hasOwn(mocks, request)) return mocks[request];
    if (request.startsWith("@/")) return load(request.slice(2) + ".ts");
    if (request.startsWith(".")) return load(path.resolve(path.dirname(key), request + ".ts"));
    return require(request);
  };
  new Function("require", "module", "exports", outputText)(localRequire, mod, mod.exports);
  modules.set(key, mod.exports);
  return mod.exports;
}
function solution(step) {
  if (!step.game) return step.accept[0];
  return step.game.type === "rush"
    ? step.game.questions.map(q => ({ id: q.id, value: q.options[q.correctAnswer] }))
    : step.game.scenario.questions.map(q => ({ id: q.id, value: q.options[q.correctIndex] }));
}

async function test() {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "isolated-atlas-regression";
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);");
  await db.exec(fs.readFileSync(path.join(root, "supabase/migrations/20261122085111_adventure_checkpoints.sql"), "utf8"));
  for (const id of accounts) await db.query("insert into auth.users values ($1)", [id]);
  const { scenes } = load("lib/adventure/scenes.ts");
  const { culturalClues, passages } = load("lib/adventure/catalog.ts");
  const { gradeActivity } = load("lib/adventure/grading.ts");
  const { quizBank } = load("lib/adventure/quiz-bank.ts");
  const { quizForm, gradeQuiz } = load("lib/adventure/quiz.ts");
  const { panels } = load("lib/adventure/panels.ts");
  const { readReceipts, receiptName, legacyGuestReceiptName, signReceipt } = load("lib/adventure/receipts.ts");
  const { getAdventureProgress } = load("lib/adventure/progress.ts");
  const { checkPassage, openAtlasQuiz, importGuestAtlas } = load("app/quest/atlas/actions.ts");
  await assert.rejects(openAtlasQuiz(1));
  assert.equal((await checkPassage(2, 0, solution(scenes[2][0]))).ok, false);
  assert.equal((await checkPassage(1, 2, solution(scenes[1][2]))).ok, false);
  for (const p of passages) {
    assert.equal(panels[p.id].length + 1, scenes[p.id].length);
    assert.ok(culturalClues[p.id].after <= scenes[p.id].length);
    assert.ok(fs.existsSync(path.join(root, "public/art/passage", p.art + ".webp")));
    for (const [index, step] of scenes[p.id].entries()) {
      assert.equal((await checkPassage(p.id, index, "…")).ok, false);
      let answer = solution(step);
      if (step.mode === "quiz") {
        const form = await openAtlasQuiz(p.id);
        assert.deepEqual((await openAtlasQuiz(p.id, form.ticket)).questions, form.questions);
        assert.equal(new Set(form.questions.map(q => Math.floor(Number(q.id)/2))).size, 3);
        const variants = new Set(Array.from({length: 12}, () => JSON.stringify(quizForm(p.id, "guest").questions)));
        assert.ok(variants.size > 1);
        answer = { ticket:form.ticket, answers:form.questions.map(q => ({ id:q.id, value:quizBank[p.id][Number(q.id)][1] })) };
        assert.ok(gradeQuiz(p.id, "guest", answer));
        assert.equal(gradeQuiz(p.id, accounts[0], answer), false);
        const wrong = { ...answer, answers: answer.answers.map((a,i) => i===1 ? {...a, value:"wrong"} : a) };
        assert.deepEqual((await checkPassage(p.id, index, wrong)).retryIds, [answer.answers[1].id]);
      } else assert.ok(gradeActivity(step, answer));
      if (step.mode === "order") assert.equal(gradeActivity(step, step.options.join(" ")), false);
      if (step.mode === "choice") for (const option of step.options) assert.equal(gradeActivity(step, option), step.accept.includes(option));
      if (step.game) {
        assert.equal(gradeActivity(step, answer.map(() => answer[0])), false);
        assert.equal(gradeActivity(step, answer.slice(1)), false);
        if (step.game.type === "rush") {
          const oneMiss = answer.map((a,i) => i === 0 ? { ...a, value: step.game.questions[i].options[1] } : a);
          assert.ok(gradeActivity(step, oneMiss));
          oneMiss[1] = { ...answer[1], value: step.game.questions[1].options[1] };
          assert.equal(gradeActivity(step, oneMiss), false);
        }
      }
      const recording = step.radio ?? step.game?.radio;
      if (recording) assert.ok(fs.statSync(path.join(root, "public/audio/passage", recording.file + ".mp3")).size > 10000);
      assert.ok((await checkPassage(p.id, index, answer)).ok);
    }
  }
  assert.ok(gradeActivity(scenes[3].findLast(s => s.mode === "write"), "I’ve got a blue key!"));
  assert.ok(gradeActivity(scenes[5].findLast(s => s.mode === "write"), "Hi! I'm Nova. The key is on the map."));
  assert.equal(gradeActivity(scenes[5].findLast(s => s.mode === "write"), "I’m Nova. The key is under the map."), false);
  const target = passages.map(p => scenes[p.id].length);
  assert.deepEqual((await getAdventureProgress()).stages, target);
  const guestReceipts = new Map(jar);
  assert.equal(await importGuestAtlas(), false);
  const [receipt] = items();
  assert.deepEqual(readReceipts([{...receipt, value: receipt.value.replace(/.$/, "!")}]), [0,0,0,0,0]);
  assert.deepEqual(readReceipts(items(), undefined, Date.now() + 400 * 86400000), [0,0,0,0,0]);
  user = accounts[0];
  assert.deepEqual((await getAdventureProgress()).stages, [0,0,0,0,0]);
  const { saveAdventureDraft } = load("app/quest/atlas/draft-actions.ts");
  const draft = { index:0, opened:true, sheet:true, choice:"Hello!", tiles:[], gameAnswers:[], quiz:{ answers:[] }, shuffle:3, replaying:false };
  assert.equal(await saveAdventureDraft(1, 0, draft), 1);
  assert.equal(await saveAdventureDraft(1, 0, { ...draft, choice:"Boom" }), -1);
  assert.equal((await db.query("select draft->>'choice' as choice from adventure_checkpoints where user_id=$1", [user])).rows[0].choice, "Hello!");
  assert.ok((await checkPassage(1, 0, solution(scenes[1][0]))).synced);
  assert.equal(await saveAdventureDraft(1, 1, draft), -1);
  assert.equal((await db.query("select draft from adventure_checkpoints where user_id=$1", [user])).rows[0].draft, null);
  offline = true;
  assert.equal((await checkPassage(1, 1, solution(scenes[1][1]))).synced, false);
  offline = false;
  assert.equal((await getAdventureProgress()).stages[0], 2);
  await admin.rpc("keep_adventure_checkpoint", { p_user:user, p_mission:1, p_stage:1 });
  jar = new Map();
  assert.equal((await getAdventureProgress()).stages[0], 2);
  user = accounts[1];
  assert.equal((await getAdventureProgress()).stages[0], 0);
  jar = guestReceipts;
  jar.delete(receiptName(1, target[0], false));
  const legacy = legacyGuestReceiptName(1, target[0]);
  jar.set(legacy, signReceipt(legacy, "guest"));
  const unclaimed = await getAdventureProgress();
  assert.deepEqual(unclaimed.stages, [0,0,0,0,0]);
  assert.deepEqual(unclaimed.guestStages, target);
  offline = true;
  assert.equal(await importGuestAtlas(), false);
  assert.deepEqual(readReceipts(items()), target);
  offline = false;
  assert.equal(await importGuestAtlas(), true);
  assert.deepEqual((await getAdventureProgress()).stages, target);
  assert.deepEqual(readReceipts(items()), [0,0,0,0,0]);
  user = accounts[0];
  assert.deepEqual((await getAdventureProgress()).stages, [2,0,0,0,0]);
  for (const role of ["anon","authenticated"]) {
    await db.exec("set role " + role);
    await assert.rejects(db.query("select * from public.adventure_checkpoints"), /permission denied/);
    await assert.rejects(db.query("select public.keep_adventure_checkpoint($1,1,5)", [user]), /permission denied/);
    await assert.rejects(db.query("select public.save_adventure_draft($1,1,0,0,'{}')", [user]), /permission denied/);
    await db.exec("reset role");
  }
  console.log("PASS Five Atlas episodes, grading, game evidence, sequential unlocks, signed guest progress, private account sync and replay");
}
test().finally(() => db.close()).catch(error => { console.error(error); process.exitCode = 1; });
