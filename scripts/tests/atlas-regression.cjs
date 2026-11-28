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
  // An account that finished world five before this release must keep its checkpoint and draft version.
  await db.query("insert into public.adventure_checkpoints(user_id,mission,stage,draft_version) values ($1,5,7,2)", [accounts[0]]);
  await db.exec(fs.readFileSync(path.join(root, "supabase/migrations/20261122155026_extend_atlas_missions.sql"), "utf8"));
  assert.deepEqual((await db.query("select mission,stage,draft_version from public.adventure_checkpoints where user_id=$1", [accounts[0]])).rows, [{mission:5,stage:7,draft_version:2}]);
  await db.query("insert into public.adventure_checkpoints(user_id,mission,stage,draft_version) values ($1,10,6,3)", [accounts[0]]);
  const museumMigration = fs.readdirSync(path.join(root, "supabase/migrations")).find(file => file.endsWith("_atlas_museum_chapter.sql"));
  await db.exec(fs.readFileSync(path.join(root, "supabase/migrations", museumMigration), "utf8"));
  assert.deepEqual((await db.query("select mission,stage,draft_version from public.adventure_checkpoints where user_id=$1 order by mission", [accounts[0]])).rows,
    [{mission:5,stage:7,draft_version:2}, {mission:10,stage:6,draft_version:3}]);
  await db.query("insert into public.adventure_checkpoints(user_id,mission,stage,draft_version) values ($1,15,6,4)", [accounts[0]]);
  const refugeMigration = fs.readdirSync(path.join(root, "supabase/migrations")).find(file => file.endsWith("_atlas_refuge_chapter.sql"));
  await db.exec(fs.readFileSync(path.join(root, "supabase/migrations", refugeMigration), "utf8"));
  assert.deepEqual((await db.query("select mission,stage,draft_version from public.adventure_checkpoints where user_id=$1 order by mission", [accounts[0]])).rows,
    [{mission:5,stage:7,draft_version:2}, {mission:10,stage:6,draft_version:3}, {mission:15,stage:6,draft_version:4}]);
  await assert.rejects(db.query("insert into public.adventure_checkpoints(user_id,mission,stage) values ($1,21,0)", [accounts[0]]), /check constraint/);
  const beforeCoast = { index: 3, opened: true, phase: "question", choice: "Do you like bread?" };
  await db.query("insert into public.adventure_checkpoints(user_id,mission,stage,draft_version,draft) values ($1,20,3,7,$2)", [accounts[0], JSON.stringify(beforeCoast)]);
  const oldRows = async () => (await db.query("select mission, stage, draft_version, draft, updated_at from public.adventure_checkpoints where user_id=$1 and mission<=20 order by mission", [accounts[0]])).rows;
  const oldProgress = await oldRows();
  const coastMigration = fs.readdirSync(path.join(root, "supabase/migrations")).find(file => file.endsWith("_atlas_coast_chapter.sql"));
  await db.exec(fs.readFileSync(path.join(root, "supabase/migrations", coastMigration), "utf8"));
  assert.deepEqual(await oldRows(), oldProgress);
  await db.query("insert into public.adventure_checkpoints(user_id,mission,stage) values ($1,25,6)", [accounts[0]]);
  await assert.rejects(db.query("insert into public.adventure_checkpoints(user_id,mission,stage) values ($1,26,0)", [accounts[0]]), /check constraint/);
  await db.query("delete from public.adventure_checkpoints where user_id=$1", [accounts[0]]);
  const { scenes } = load("lib/adventure/scenes.ts");
  const { passages, atlasChapters } = load("lib/adventure/catalog.ts");
  const empty = passages.map(() => 0);
  const { partForStage } = load("lib/adventure/parts.ts");
  const { gradeActivity } = load("lib/adventure/grading.ts");
  const { boardAnswer, learnerActivity, recordingPath } = load("lib/adventure/activities.ts");
  const { quizBank } = load("lib/adventure/quiz-bank.ts");
  const { quizForm, gradeQuiz } = load("lib/adventure/quiz.ts");
  const { panels, storyPanel } = load("lib/adventure/panels.ts");
  const { readReceipts, receiptName, legacyGuestReceiptName, signReceipt } = load("lib/adventure/receipts.ts");
  const { getAdventureProgress } = load("lib/adventure/progress.ts");
  const { checkPassage, openAtlasQuiz, importGuestAtlas } = load("app/quest/atlas/actions.ts");
  await assert.rejects(openAtlasQuiz(1));
  await assert.rejects(openAtlasQuiz(13));
  const [goodbye, caller] = scenes[1];
  assert.ok(goodbye.lesson);
  assert.equal(goodbye.document, undefined);
  assert.ok(gradeActivity(goodbye, "Goodbye!"));
  assert.equal(gradeActivity(goodbye, "Hello!"), false);
  assert.equal(caller.radio.line, "Hi, I’m Sam.");
  assert.ok(storyPanel(1, 1).dialogue.every(speech => !speech.line.includes("Sam")));
  for (const clip of ["hello-us", "maya-goodbye"]) {
    assert.ok(fs.statSync(path.join(root, "public/audio/passage", clip + ".mp3")).size > 2000);
  }
  assert.deepEqual(scenes[1][2].lesson.parts.map(([word]) => word), ["I", "am", "Maya."]);
  assert.match(scenes[1][2].lesson.rule, /I am et I’m/);
  assert.match(scenes[5][2].lesson.example, /Take the map/);
  assert.equal(scenes[3][2].radio, undefined);
  assert.match(scenes[3][2].document.text, /I have the red map\.[\s\S]+\nSam$/);
  for (const p of passages) {
    const examples = scenes[p.id].flatMap(step => step.lesson?.example.split("\n") ?? []);
    assert.ok(examples.every(line => line.split(/ · | = /).length === 2));
  }
  const refuge = passages.filter(p => p.id >= 16 && p.id <= 20);
  assert.equal(refuge.length, 5);
  const coast = passages.filter(p => p.id >= 21 && p.id <= 25);
  assert.deepEqual(coast.map(p => p.id), [21, 22, 23, 24, 25]);
  assert.deepEqual(atlasChapters.flatMap(c => Array.from({length: c.last - c.first + 1}, (_, i) => c.first + i)), passages.map(p => p.id));
  assert.equal(coast.reduce((sum, p) => sum + p.targets.length, 0), 9);
  assert.equal(scenes[25].at(-1).mode, "write");
  assert.ok(coast.filter(p => scenes[p.id].at(-1).mode === "quiz").length >= 3);
  assert.equal(await openAtlasQuiz(21).then(() => true, () => false), false);
  for (const p of [...refuge, ...coast]) {
    assert.ok(p.targets.length && p.course);
    assert.equal(new Set(p.targets.map(goal => goal.stage)).size, p.targets.length);
    for (const goal of p.targets) assert.equal(scenes[p.id][goal.stage-1].mode, "write");
    assert.ok(fs.existsSync(path.join(root, "public/art/passage", p.art + "-insert.webp")));
  }
  const contrasts = [
    [16, 5, "You like apples.", "I like apples."], [16, 6, "I like pears and apples!", "I likes apples"],
    [17, 4, "She needs some water.", "She need water."], [17, 5, "He needs light.", "She needs light."],
    [17, 5, "He needs a lamp.", "He needs water."],
    [17, 6, "It likes pears.", "It like pears."], [18, 5, "We like soup.", "They like soup."],
    [18, 6, "They don’t like soup.", "They like soup."], [18, 6, "They do not like soup.", "They doesn't like soup."],
    [19, 4, "No, I don’t.", "No, I am not."], [19, 5, "Do you like apples?", "You like apples."],
    [20, 4, "Do you like bread?", "Does you like bread?"], [20, 7, "We need water. It likes pears.", "We need water."],
    [20, 7, "It likes pears. We need some water.", "It likes water. We need pears."],
    [20, 7, "We need more water. It really likes pears.", "We need more water. It really like pears."],
    [21, 4, "She opens the gate every evening.", "She open the gate every evening."],
    [21, 5, "I close the door.", "I closes the door."],
    [22, 5, "It doesn’t open the gate.", "It doesn’t opens the gate."],
    [22, 5, "It does not open the cinema gate.", "It does open the gate."],
    [23, 4, "Does it take the note?", "Does it takes the note?"],
    [23, 6, "Does she need the map?", "Do she need the map?"],
    [24, 5, "Yes, she does.", "Yes, it does."],
    [24, 6, "No, it does not.", "Yes, it does."],
    [25, 4, "Do you close the red gate?", "Does she close the red gate?"],
    [25, 6, "Tess opens the blue gate. Your map is in the blue bag.", "Tess opens the blue gate."],
    [25, 6, "The map’s in the blue bag. She opens the blue gate every evening.", "The map is in the red bag. She opens the blue gate."],
    [25, 6, "She opens the blue gate and the map is in the blue bag.", "She opens the red gate and the map is in the blue bag."]
  ];
  for (const [id, stage, right, wrong] of contrasts) {
    assert.ok(gradeActivity(scenes[id][stage-1], right), right);
    assert.equal(gradeActivity(scenes[id][stage-1], wrong), false, wrong);
  }
  assert.equal((await checkPassage(2, 0, solution(scenes[2][0]))).ok, false);
  assert.equal((await checkPassage(1, 2, solution(scenes[1][2]))).ok, false);
  for (const p of passages) {
    assert.equal(panels[p.id].length + 1, scenes[p.id].length);
    assert.equal(partForStage(0, scenes[p.id].length), 0);
    assert.equal(partForStage(2, scenes[p.id].length), 1);
    assert.equal(partForStage(scenes[p.id].length-2, scenes[p.id].length), 2);
    assert.ok(fs.existsSync(path.join(root, "public/art/passage", p.art + ".webp")));
    for (const [index, step] of scenes[p.id].entries()) {
      const panel = storyPanel(p.id, index);
      assert.ok(panel.caption.trim() && panel.dialogue.length >= 1 && panel.dialogue.length <= 2);
      for (const speech of panel.dialogue) {
        assert.ok(["Maya", "Sam"].includes(speech.speaker) && speech.line.trim());
        if (speech.lang === "en") assert.ok(speech.french.trim());
      }
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
      if (step.legacyQuiz) {
        const oldForm = await openAtlasQuiz(p.id);
        const oldAnswer = { ticket: oldForm.ticket, answers: oldForm.questions.map(q => ({id:q.id, value:quizBank[p.id][Number(q.id)][1]})) };
        assert.deepEqual((await openAtlasQuiz(p.id, oldForm.ticket)).questions, oldForm.questions);
        assert.ok((await checkPassage(p.id, index, oldAnswer)).ok);
      }
      if (step.mode === "spot") {
        assert.equal(step.options.length, step.spots.points.length);
        assert.ok(step.spots.points.every(point => point.length === 2 && point.every(n => n > 0 && n < 100)));
        for (const option of step.options) assert.equal(gradeActivity(step, option), step.accept.includes(option));
      }
      if (step.mode === "evidence" || step.mode === "delivery") {
        const view = learnerActivity(step);
        const [pieces, decision] = answer.split(" | ");
        const tiles = step.mode === "delivery" ? [step.options.indexOf(pieces)] : pieces.split("+").map(Number).reverse();
        assert.ok(gradeActivity(step, boardAnswer(view, decision, tiles)));
        assert.equal(gradeActivity(step, boardAnswer(view, decision, [])), false);
        assert.equal(gradeActivity(step, boardAnswer(view, "", tiles)), false);
        if (step.clues) {
          assert.equal(gradeActivity(step, boardAnswer(view, decision, [tiles[0], tiles[0]])), false);
          assert.equal(gradeActivity(step, boardAnswer(view, decision, [tiles[0], [0,1,2].find(i => !tiles.includes(i))])), false);
        } else {
          const other = step.delivery.destinations.find(dest => dest !== decision);
          assert.equal(gradeActivity(step, boardAnswer(view, other, tiles)), false);
        }
      }
      if (step.mode === "order") assert.equal(gradeActivity(step, step.options.join(" ")), false);
      if (step.mode === "choice") for (const option of step.options) assert.equal(gradeActivity(step, option), step.accept.includes(option));
      if (step.mode === "route") {
        assert.equal(gradeActivity(step, "left"), false);
        assert.equal(gradeActivity(step, answer.split(" ").reverse().join(" ")), false);
      }
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
      if (recording) assert.ok(fs.statSync(path.join(root, "public", recordingPath(recording))).size > (recording.collection === "spell-strike" ? 2000 : 10000));
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
  assert.deepEqual(readReceipts([{...receipt, value: receipt.value.replace(/.$/, "!")}]), empty);
  assert.deepEqual(readReceipts(items(), undefined, Date.now() + 400 * 86400000), empty);
  user = accounts[0];
  assert.deepEqual((await getAdventureProgress()).stages, empty);
  const { saveAdventureDraft } = load("app/quest/atlas/draft-actions.ts");
  const draft = { index:0, opened:true, sheet:true, choice:"Hello!", tiles:[], gameAnswers:[], quiz:{ answers:[] }, shuffle:3, replaying:false };
  assert.equal(await saveAdventureDraft(1, 0, draft), 1);
  assert.equal(await saveAdventureDraft(1, 0, { ...draft, choice:"Boom" }), -1);
  assert.equal((await db.query("select draft->>'choice' as choice from adventure_checkpoints where user_id=$1", [user])).rows[0].choice, "Hello!");
  const comic = { ...draft, sheet: false, phase: "help", beat: 2, retryHint: goodbye.hint };
  assert.equal(await saveAdventureDraft(1, 1, comic), 2);
  assert.deepEqual((await db.query("select draft from adventure_checkpoints where user_id=$1", [user])).rows[0].draft, comic);
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
  assert.deepEqual(unclaimed.stages, empty);
  assert.deepEqual(unclaimed.guestStages, target);
  offline = true;
  assert.equal(await importGuestAtlas(), false);
  assert.deepEqual(readReceipts(items()), target);
  offline = false;
  assert.equal(await importGuestAtlas(), true);
  assert.deepEqual((await getAdventureProgress()).stages, target);
  assert.deepEqual(readReceipts(items()), empty);
  user = accounts[0];
  assert.deepEqual((await getAdventureProgress()).stages, passages.map(p => p.id === 1 ? 2 : 0));
  for (const role of ["anon","authenticated"]) {
    await db.exec("set role " + role);
    await assert.rejects(db.query("select * from public.adventure_checkpoints"), /permission denied/);
    await assert.rejects(db.query("select public.keep_adventure_checkpoint($1,1,5)", [user]), /permission denied/);
    await assert.rejects(db.query("select public.save_adventure_draft($1,1,0,0,'{}')", [user]), /permission denied/);
    await db.exec("reset role");
  }
  console.log("PASS", passages.length, "Atlas episodes, grading, routes, sequential unlocks, guest progress, private account sync and replay");
}
test().finally(() => db.close()).catch(error => { console.error(error); process.exitCode = 1; });
