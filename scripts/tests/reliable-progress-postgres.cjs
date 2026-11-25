// Uses an isolated, in-memory PostgreSQL database. No project credentials or network.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const ts = require("typescript");
const { PGlite } = require("@electric-sql/pglite");
const root = path.resolve(__dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const db = new PGlite();
const userId = randomUUID();
const guestId = randomUUID();
const otherId = randomUUID();
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const first = async (sql, params) => (await query(sql, params))[0];
const profile = (id) => first("select xp,gold,level from profiles where id=$1", [id]);
const countScores = async () => (await first("select count(*)::int n from game_scores")).n;
let signedInId = userId;
let allowCookies = true;
let importFails = false;
const jar = new Map();
const cookieJar = {
  getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
  has: (name) => jar.has(name),
  set: (name, value, options) => { assert.ok(options.httpOnly); if (allowCookies) jar.set(name, value); },
  delete: (name) => jar.delete(name),
};
const admin = {
  async rpc(name, args) {
    if (name === "apply_verified_placement") {
      if (importFails) return { error: { code: "TEST" } };
      const row = await first("select apply_verified_placement($1,$2,$3::jsonb) chapter", [args.p_user_id,args.p_chapter,JSON.stringify(args.p_results)]);
      return { data:row.chapter,error:null };
    }
    if (name === "import_guest_quiz_results") {
      if (importFails) return { error: { code: "TEST" } };
      await db.query("select import_guest_quiz_results($1,$2::jsonb)", [args.p_user_id, JSON.stringify(args.p_results)]);
      return { error: null };
    }
    assert.equal(name, "finish_game_score");
    const { p_user_id, p_session_id, p_slug, p_score, p_max_score, p_duration, p_difficulty, p_record_eligible,
      p_reward_options, p_full_plays, p_xp_level, p_context } = args;
    const row = await first("select finish_game_score($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb) receipt",
      [p_user_id, p_session_id, p_slug, p_score, p_max_score, p_duration, p_difficulty, p_record_eligible,
        JSON.stringify(p_reward_options), p_full_plays, p_xp_level, JSON.stringify(p_context)]);
    return { data: row.receipt, error: null };
  },
};
const overrides = {
  "server-only": {},
  "next/cache": { revalidatePath: () => {} },
  "next/headers": { cookies: async () => cookieJar },
  "next/navigation": {},
  "@/lib/supabase/server": { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({
    data: { user: signedInId ? { id: signedInId } : null },
  }) } }) },
  "@/lib/supabase/admin": { createSupabaseAdminClient: () => admin },
  "@/lib/profile/badges-server": { syncBadgesSafely: async () => [] },
  "@/lib/courses/mission-auto-complete": { autoCompleteCourseMissionForGame: async () => null },
  "@/lib/courses/mission-state": {},
  "@/lib/courses/practice-server": { recordGrammarRushPractice: async () => null },
  "@/lib/courses/progress": { getUserCourseRoadmap: async () => ({ entries: [] }) },
  "@/lib/profile/daily-challenge": { checkAndGrantDailyBonus: async () => ({ newLevel: null }) },
};
const loaded = new Map();
function load(file) {
  const absolute = path.resolve(root, file);
  if (loaded.has(absolute)) return loaded.get(absolute).exports;
  const mod = { exports: {} };
  loaded.set(absolute, mod);
  function localRequire(request) {
    if (Object.hasOwn(overrides, request)) return overrides[request];
    if (!request.startsWith("@/") && !request.startsWith(".")) return require(request);
    const base = request.startsWith("@/") ? path.join(root, request.slice(2)) : path.resolve(path.dirname(absolute), request);
    const target = [base, base + ".ts", path.join(base, "index.ts")].find((p) => fs.statSync(p, { throwIfNoEntry: false })?.isFile());
    assert.ok(target, "Missing test module " + request);
    const key = "@/" + path.relative(root, target).replaceAll("\\", "/").replace(/\.ts$/, "");
    if (Object.hasOwn(overrides, key)) return overrides[key];
    return target.endsWith(".json") ? require(target) : load(target);
  }
  const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  new Function("require", "module", "exports", code)(localRequire, mod, mod.exports);
  return mod.exports;
}

async function setup() {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users (id uuid primary key);
    create table profiles(id uuid primary key, username text, role text default 'student', placement_chapter integer, placement_at timestamptz, xp integer default 0,
      gold integer default 0, level integer default 1, updated_at timestamptz default now(), created_at timestamptz default now());
    create table games(id uuid primary key default gen_random_uuid(), slug text unique);
    create table game_scores(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users,
      game_id uuid references games, score integer not null, max_score integer, duration_ms integer, difficulty text,
      created_at timestamptz default now());
    create table courses(id uuid primary key default gen_random_uuid(), course_number integer unique, reward_xp integer, reward_gold integer);
    create table user_course_progress(id uuid primary key default gen_random_uuid(), course_id uuid references courses,
      user_id uuid references auth.users, status text, best_score integer default 0,
      completed_at timestamptz, updated_at timestamptz default now(),unique(user_id,course_id));
    create table site_visits(visit_date date,visitor_hash text);
  `);
  const migration = read("supabase/migrations/20261118195018_reliable_game_scores_and_guest_progress.sql");
  await db.exec(read("supabase/migrations/2026-10-16_20_game_sessions.sql"));
  await db.exec(read("supabase/migrations/2026-10-13_02_atomic_course_rewards.sql"));
  await db.exec(migration);
  await db.exec(migration); // A resumed deployment is safe.
  await db.exec(read("supabase/migrations/20261119185629_retain_verified_placement.sql"));
  await db.exec("grant select,insert,update,delete on all tables in schema public to service_role");
  for (const row of await query("select oid from pg_proc where proname in ('finish_game_score','import_guest_quiz_results','admin_dashboard_summary','apply_verified_placement')")) {
    const acl = await first("select has_function_privilege('anon',$1::oid,'execute') a, has_function_privilege('authenticated',$1::oid,'execute') u, has_function_privilege('service_role',$1::oid,'execute') s", [row.oid]);
    assert.deepEqual(acl, { a: false, u: false, s: true });
  }
  for (const id of [userId, guestId, otherId]) {
    await db.query("insert into auth.users values($1)", [id]);
    await db.query("insert into profiles(id) values($1)", [id]);
  }
  await db.query("update profiles set xp=190 where id=$1", [userId]);
  await db.exec("insert into courses(course_number,reward_xp,reward_gold) select i,80,6 from generate_series(1,50) i");
  await db.query("insert into user_course_progress(course_id,user_id,status) select id,$1,case when course_number=1 then 'unlocked' else 'locked' end from courses", [guestId]);
  for (const slug of load("lib/games/game-session-rules.ts").GAME_SESSION_SLUGS) {
    await db.query("insert into games(slug) values($1)", [slug === "flashback" ? "echo-lex" : slug]);
  }
  await db.exec("set role service_role");
}
async function start(slug, id = userId, ageSeconds = 75) {
  return (await first("insert into game_sessions(user_id,game_slug,started_at) values($1,$2,clock_timestamp()-$3::int*interval '1 second') returning id", [id, slug, ageSeconds])).id;
}
const scenarios = [
  ["wordfall", "submitWordfallScore", { mode: "exact", score: 29, wordsCompleted: 2 }],
  ["enigma-scroll", "submitEnigmaScrollScore", { wordLength: 5, totalScore: 40, wordsFound: 1 }],
  ["space-lex", "submitLexiconBlasterScore", { score: 20, wave: 1, maxCombo: 2, wordsMastered: 2, wordsMissed: 0 }],
  ["flashback", "submitEchoLexScore", { score: 3 }],
  ["flash-translation", "submitFlashTranslationScore", { totalTimeMs: 30_000, averageReactionTimeMs: 3000, wrongAnswers: 0, roundsCompleted: 10, durationMs: 40_000 }],
  ["speed-verb-challenge", "submitSpeedVerbScore", { difficulty: 1, score: 4, correctCount: 2, totalRounds: 2 }],
  ["grammar-rush", "submitGrammarRushScore", { score: 31, correct: 2, attempts: 2, durationMs: 60_000 }],
  ["spell-strike", "submitSpellStrikeScore", { difficulty: 1, score: 100, correctCount: 1, totalRounds: 10 }],
  ["echo-signal", "submitEchoSignalScore", { difficulty: 1, score: 100, correctCount: 1, totalQuestions: 8 }],
];
async function scoreTests() {
  let total = 0;
  for (const [slug, action, values] of scenarios) {
    const submit = load("app/play/" + slug + "/actions.ts")[action];
    const params = { durationMs: 30_000, ...values, sessionId: await start(slug) };
    const before = await profile(userId);
    const [firstResult, retry] = await Promise.all([submit(params), submit(params)]);
    assert.ok(firstResult.success, slug + " " + firstResult.error);
    assert.ok(retry.success, slug + " retry " + retry.error);
    assert.deepEqual(firstResult.rewards, retry.rewards);
    const after = await profile(userId);
    assert.equal(after.xp - before.xp, firstResult.rewards.xpEarned, slug);
    assert.equal(after.gold - before.gold, firstResult.rewards.goldEarned, slug);
    assert.equal(after.level, 1 + Math.floor(after.xp / 200));
    assert.equal(await countScores(), ++total, slug + " score must be recorded once");
  }
  const submit = load("app/play/flashback/actions.ts").submitEchoLexScore;
  const valid = { score: 4, durationMs: 30_000, sessionId: await start("flashback") };
  const rejected = [
    { ...valid, sessionId: null }, { ...valid, sessionId: randomUUID() },
    { ...valid, sessionId: await start("wordfall") }, { ...valid, sessionId: await start("flashback", otherId) },
    { ...valid, sessionId: await start("flashback", userId, 7201) }, { ...valid, sessionId: await start("flashback", userId, 1) },
    { ...valid, score: 900 },
  ];
  for (const invalid of rejected) assert.equal((await submit(invalid)).success, false);
  assert.equal(await countScores(), total);
  const before = await profile(userId);
  await db.exec(`reset role;
    create function fail_balance() returns trigger language plpgsql as $$ begin raise exception 'test write failure'; end; $$;
    create trigger fail_balance before update on profiles for each row execute function fail_balance();
    set role service_role;`);
  assert.equal((await submit(valid)).retryable, true);
  assert.equal(await countScores(), total);
  assert.deepEqual(await profile(userId), before);
  assert.equal((await first("select used_at from game_sessions where id=$1", [valid.sessionId])).used_at, null);
  await db.exec("reset role; drop trigger fail_balance on profiles; set role service_role");
  assert.ok((await submit(valid)).success);
  assert.equal((await submit({ ...valid, score: 5 })).success, false);
  assert.equal(await countScores(), ++total);
  // An old session without a receipt cannot be used again after the migration.
  const oldSession = await start("flashback");
  await db.query("update game_sessions set used_at=now() where id=$1", [oldSession]);
  assert.equal((await submit({ ...valid, sessionId: oldSession })).success, false);
  const zero = await submit({ score: 0, durationMs: 30_000, sessionId: await start("flashback") });
  assert.equal(zero.rewards.xpEarned, 0);
  assert.equal(zero.isNewPersonalBest, false);
  const limit = load("lib/profile/economy.ts").FULL_REWARD_PLAYS_PER_DAY;
  let last;
  for (let i = 0; i <= limit; i++) last = await submit({ ...valid, sessionId: await start("flashback") });
  assert.equal(last.rewards.reduced, true);
  const flash = load("app/play/flash-translation/actions.ts").submitFlashTranslationScore;
  const faster = await flash({ ...scenarios[4][2], totalTimeMs: 25_000, averageReactionTimeMs: 2500, sessionId: await start("flash-translation") });
  assert.equal(faster.isNewGlobalBest, true, "the shortest Flash Translation time wins");
  const allWrong = await flash({ ...scenarios[4][2], totalTimeMs: 80_000, wrongAnswers: 10, sessionId: await start("flash-translation") });
  assert.equal(allWrong.rewards.xpEarned, 0);
  assert.equal(allWrong.isNewPersonalBest, false, "a completely incorrect translation game cannot set a record");
  const wordfall = load("app/play/wordfall/actions.ts").submitWordfallScore;
  const otherMode = await wordfall({ mode: "free", score: 10, wordsCompleted: 1, durationMs: 30_000, sessionId: await start("wordfall") });
  assert.equal(otherMode.isNewGlobalBest, true, "Wordfall records use separate difficulties");
}

async function guestTests() {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "isolated-fixture-signing-key";
  signedInId = null;
  const actions = load("app/cours/actions.ts");
  const proof = load("lib/courses/guest-proof.ts");
  const server = load("lib/courses/guest-progress-server.ts");
  const bank = load("lib/courses/exercises-server.ts");
  const answers = (course, score) => bank.getCourseNativeQuestions(course).map((item, index) => ({
    id: item.id, choice: index < score ? item.correctAnswer : (item.correctAnswer + 1) % item.options.length,
  }));
  const state = (course) => first("select p.status,p.best_score from user_course_progress p join courses c on c.id=p.course_id where user_id=$1 and course_number=$2", [guestId, course]);
  assert.equal(await actions.keepGuestQuizAction(1, { score: 10 }), false);
  assert.equal(await actions.keepGuestQuizAction(1, answers(1,7)), false);
  assert.equal(await actions.keepGuestQuizAction(1, answers(1,10).slice(1)), false);
  allowCookies = false;
  assert.ok(await actions.keepGuestQuizAction(1, answers(1,8)));
  assert.equal(await actions.confirmGuestQuizAction(1), false, "storage blocked");
  allowCookies = true;
  for (const [course, score] of [[2,9],[1,10],[1,8],[4,9]]) {
    assert.ok(await actions.keepGuestQuizAction(course, answers(course,score)));
    assert.ok(await actions.confirmGuestQuizAction(course));
  }
  const prefix = proof.GUEST_PROOF_PREFIX;
  const later = Date.now() + (proof.GUEST_PROOF_SECONDS + 1) * 1000;
  assert.equal(proof.readGuestScores(cookieJar.getAll(), later).size, 0, "expired proofs");
  jar.set(prefix + "3-9", jar.get(prefix + "2-9")); // A legitimate result belongs to its own course.
  jar.set(prefix + "5-10", "10.zzzzzz." + "a".repeat(43));
  jar.set(prefix + "1-8", proof.signGuestScore(1,8)); // Two tabs saved the same lesson.
  assert.deepEqual(Object.fromEntries(await server.getGuestScores()), { 1: 10, 2: 9, 4: 9 });
  assert.equal((await actions.transferGuestQuizzesAction()).success, false, "only the signed-in account can import");
  signedInId = guestId;
  importFails = true;
  assert.equal((await actions.transferGuestQuizzesAction()).success, false);
  assert.equal((await server.getGuestScores()).size, 3, "keep proofs after failure");
  importFails = false;
  await db.query("update user_course_progress set best_score=10010010 where user_id=$1 and course_id=(select id from courses where course_number=2)", [guestId]);
  const before = await profile(guestId);
  assert.equal(before.gold, 30, "the Auth trigger's profile starts with welcome gold");
  assert.ok((await actions.transferGuestQuizzesAction()).success);
  assert.equal((await server.getGuestScores()).size, 0);
  assert.deepEqual(await state(1), { status: "completed", best_score: 10010010 });
  assert.deepEqual(await state(2), { status: "completed", best_score: 10010010 });
  assert.equal((await state(3)).status, "unlocked");
  assert.deepEqual(await state(4), { status: "locked", best_score: 10010009 });
  assert.equal((await profile(guestId)).xp, before.xp + 160);
  await db.query("select import_guest_quiz_results($1,$2::jsonb)", [guestId, JSON.stringify([{course:1,score:9},{course:2,score:8}])]);
  assert.equal((await profile(guestId)).xp, before.xp + 160, "a repeated import is free of duplicate rewards");
  await assert.rejects(db.query("select import_guest_quiz_results($1,$2::jsonb)", [guestId, JSON.stringify([{course:3,score:9},{course:4,score:7}])]), /Invalid guest quiz/);
  assert.equal((await state(3)).status, "unlocked", "invalid batch rolls back in full");
  const remaining = Array.from({length:48}, (_,i) => ({course:i+3,score:8})).reverse();
  await db.query("select import_guest_quiz_results($1,$2::jsonb)", [guestId, JSON.stringify(remaining)]);
  assert.deepEqual(await state(50), {status:"completed",best_score:10010008});
  assert.equal((await profile(guestId)).xp, before.xp + 50*80);
  assert.equal((await profile(guestId)).gold, before.gold + 50*6);
}

async function audienceTests() {
  await db.exec(`insert into site_visits select date '2026-11-18',(i%1200)::text from generate_series(0,1499) i;
    insert into site_visits values ('2026-11-17','0'),('2026-11-17','extra'),('2026-10-18','old');
    insert into profiles(id,username,role,xp,gold) select gen_random_uuid(), 'fixture-'||i,'teacher',10,5 from generate_series(1,1050) i;`);
  const { value } = await first("select admin_dashboard_summary(date '2026-11-18') value");
  assert.equal(value.totalUsers, 1053);
  assert.equal(value.usersByRole.teachers, 1050);
  assert.equal(value.recentUsers.length, 5);
  assert.equal(value.visitors.totalUniqueVisitors, 1202);
  assert.equal(value.visitors.totalVisits, 1503);
  assert.equal(value.visitors.uniqueVisitorsToday, 1200);
  assert.equal(value.visitors.visitsToday, 1500);
  assert.deepEqual(value.visitors.dailyStats, [
    { date:"2026-11-18", uniqueVisitors:1200, totalVisits:1500 },
    { date:"2026-11-17", uniqueVisitors:2, totalVisits:2 },
  ]);
}

async function authTests() {
  jar.clear();
  await db.query("insert into user_course_progress(course_id,user_id,status) select id,$1,case when course_number=1 then 'unlocked' else 'locked' end from courses", [otherId]);
  // The external identity provider is the only simulated part of signup/login.
  // Each returned account has the profile normally inserted by the Auth trigger.
  const user = { id: otherId, identities: [{}] };
  let session = { user };
  overrides["@/lib/supabase/server"].createSupabaseServerClient = async () => ({ auth: {
    signUp: async ({ options }) => {
      assert.equal(new URL(options.emailRedirectTo).searchParams.get("next"), "/quest", "confirmation keeps the original destination");
      return { data: { user, session }, error: null };
    },
    signInWithPassword: async () => ({ data: { user }, error: null }),
    getSession: async () => ({ data: { session }, error: null }),
  } });
  overrides["next/navigation"].redirect = (location) => { throw Object.assign(new Error("Redirect"), { location }); };
  admin.from = (table) => {
    assert.equal(table, "profiles");
    const q = {
      select: () => q,
      eq: (column, value) => {
        assert.ok(["username","id"].includes(column));
        return { maybeSingle: async () => ({ data: await first("select id from profiles where " + column + "=$1", [value]), error: null }) };
      },
      upsert: async (row, options) => {
        assert.equal(options.ignoreDuplicates, true);
        await db.query("insert into profiles(id,username,xp,gold,level) values($1,$2,$3,$4,$5) on conflict(id) do nothing",
          [row.id,row.username,row.xp,row.gold,row.level]);
        return { error: null };
      },
    };
    return q;
  };
  const courses = load("app/cours/actions.ts");
  const bank = load("lib/courses/exercises-server.ts");
  const pass = (course) => courses.keepGuestQuizAction(course, bank.getCourseNativeQuestions(course).map((item) => ({ id:item.id, choice:item.correctAnswer })));
  const auth = load("app/(public)/auth/actions.ts");
  const form = new FormData();
  for (const [key,value] of Object.entries({ username:"guest_fixture", email:"guest@example.invalid", login:"guest@example.invalid", password:"fixture-only",next:"/quest" })) form.set(key,value);
  const onMap = (e) => e.location === "/quest";
  await pass(1);
  jar.set("eq-class-guest","temporary-class");
  await assert.rejects(auth.signUpAction({}, form), onMap);
  assert.equal(jar.has("eq-class-guest"),false,"a new account cannot reopen the previous guest after logout");
  const afterSignup = await profile(otherId);
  assert.equal(afterSignup.xp,80);
  assert.equal(afterSignup.gold,36);
  await pass(2);
  session = null; // Email confirmation still pending.
  jar.set("eq-class-guest","temporary-class");
  assert.ok((await auth.signUpAction({}, form)).success);
  assert.equal(jar.has("eq-class-guest"),true,"a pending signup keeps the current class usable");
  assert.deepEqual(await profile(otherId),afterSignup);
  assert.equal(await courses.confirmGuestQuizAction(2), true);
  session = { user };
  await assert.rejects(auth.loginAction({},form),onMap);
  assert.equal(jar.has("eq-class-guest"),false,"signing in releases the shared device");
  assert.equal((await profile(otherId)).xp,160);
  assert.equal(await courses.confirmGuestQuizAction(2), false);
  await assert.rejects(auth.loginAction({},form),onMap);
  assert.equal((await profile(otherId)).xp,160);

  const guest = load("lib/courses/guest-progress-server.ts");
  const tokens = load("lib/placement/placement-token.ts");
  allowCookies = false;
  await guest.keepGuestPlacement(tokens.createPlacementToken(2));
  assert.equal((await guest.getGuestProgress()).placementChapter,null,"device declined the placement cookie");
  allowCookies = true;
  await pass(5); await pass(11);
  await guest.keepGuestPlacement(tokens.createPlacementToken(2));
  assert.equal(await guest.keepGuestPlacement(tokens.createPlacementToken(1)),2,"lower retake preserves the earlier result");
  await db.query("update user_course_progress set status='in_progress',best_score=10010007 where user_id=$1 and course_id=(select id from courses where course_number=3)",[otherId]);
  const before = await profile(otherId);
  importFails = true;
  await assert.rejects(auth.loginAction({},form),onMap);
  assert.equal((await guest.getGuestProgress()).placementChapter,2);
  assert.deepEqual(await profile(otherId),before);
  importFails = false;
  await db.exec(`reset role; create function fail_placement_write() returns trigger language plpgsql as $$
    begin raise exception 'test: unavailable profile write'; end $$;
    create trigger fail_placement before update of placement_chapter on profiles for each row execute function fail_placement_write();
    set role service_role;`);
  await assert.rejects(auth.loginAction({},form),onMap);
  assert.deepEqual(await profile(otherId),before,"the final write failure rolls back the rewards of both quizzes");
  assert.equal(await courses.confirmGuestQuizAction(5),true);
  assert.equal((await guest.getGuestProgress()).placementChapter,2);
  await db.exec("reset role; drop trigger fail_placement on profiles; set role service_role");
  await assert.rejects(auth.loginAction({},form),onMap);
  assert.equal((await profile(otherId)).xp,before.xp+160,"only signed quizzes 5 and 11 pay");
  assert.equal((await profile(otherId)).gold,before.gold+12);
  assert.equal((await guest.getGuestProgress()).placementChapter,null);
  const rows = await query("select course_number,status,best_score from user_course_progress join courses on courses.id=course_id where user_id=$1 order by course_number", [otherId]);
  assert.deepEqual(rows.slice(0,12).map((r) => r.status),[...Array(11).fill("completed"),"unlocked"]);
  assert.equal(rows[4].best_score,10010010);
  assert.equal(rows[9].best_score,8000000);
  const telemetry = load("lib/courses/mission-telemetry.ts");
  assert.ok(telemetry.isCoursePlacementSkip(rows[2].best_score));
  assert.equal(telemetry.decodeCourseMissionTelemetry(rows[2].best_score).quizScore,7);
  const older = await first("select apply_verified_placement($1,1,'[]') chapter",[otherId]);
  assert.equal(older.chapter,2);
  assert.equal((await profile(otherId)).xp,before.xp+160);
}

async function retryControlsTest() {
  const pending = [];
  const refs = [], states = [];
  let cursor = 0, cleanup;
  const fakeReact = {
    useRef(initial) { const i=cursor++; return refs[i] ??= { current:initial }; },
    useState(initial) {
      const i = cursor++;
      if (!(i in states)) states[i] = initial;
      return [states[i], (value) => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
    },
    useEffect(effect) { if (!cleanup) cleanup = effect(); },
    useMemo: (factory) => factory(),
    useCallback: (fn) => fn,
  };
  overrides.react = fakeReact;
  overrides["@/lib/games/game-session-server"] = { startGameSession: () => new Promise((resolve) => pending.push(resolve)) };
  const savedWindow = global.window;
  const originalFetch = global.fetch;
  const timers = [];
  global.window = { setTimeout: (fn) => timers.push(fn) };
  const use = load("components/play/use-game-session.ts").useGameSession;
  const render = () => { cursor=0; return use("flashback",true); };
  const flush = () => new Promise((resolve) => setImmediate(resolve));
  try {
    render().begin();
    pending.shift()({ok:false,retryable:true}); await flush();
    pending.shift()({ok:true,sessionId:"first"});
    const first = await render().finish(123);
    assert.equal(first.sessionId,"first");
    let sends = 0;
    const saved = first.save(async () => {
      sends += 1;
      if (sends === 1) throw new Error("lost response");
      if (sends === 2) return { success:false,retryable:true };
      return { success:true, receipt:"original score" };
    });
    await flush();
    timers.shift()(); await flush();
    const retry = render().retryScore;
    assert.equal(typeof retry,"function");
    retry(); retry();
    assert.equal((await saved).receipt,"original score");
    assert.equal(sends,3,"double click must send the manual retry only once");
    render().begin();
    const oldRound = render().finish(100);
    render().begin(); // Another round starts before the older start response arrives.
    pending.shift()({ok:true,sessionId:"old"});
    const detached = await oldRound;
    let oldCalls = 0;
    void detached.save(async () => { oldCalls++; return {success:false,retryable:true}; });
    await flush(); timers.shift()(); await flush();
    assert.equal(oldCalls,2);
    assert.equal(render().retryScore,null,"an older result cannot replace the current round's controls");
    pending.shift()({ok:true,sessionId:"new"});
    const current = await render().finish(100);
    assert.equal(current.sessionId,"new");
    assert.equal((await current.save(async () => ({ success:false,error:"invalid" }))).success,false);
    assert.equal(render().retryScore,null);
    const gameEvents = [];
    global.fetch = async (url, options) => {
      assert.equal(url,"/api/parties-invitees");
      assert.equal(options.credentials,"omit");
      gameEvents.push(JSON.parse(options.body));
      return { ok:true };
    };
    const guest = () => { cursor=0; return use("flashback",false); };
    global.window.location = { pathname:"/play/flashback" };
    guest().begin(); guest().finishGuest(); guest().finishGuest();
    guest().begin(); guest().cancel(); guest().finishGuest();
    global.window.location.pathname = "/activite-classe/jeu/flashback";
    guest().begin(); guest().finishGuest();
    assert.deepEqual(gameEvents,["started","finished","started"].map(event=>({game:"flashback",event})));
  } finally {
    cleanup?.();
    global.window = savedWindow;
    global.fetch = originalFetch;
  }
}

(async () => {
  try {
    await setup();
    await scoreTests();
    console.log("PASS Nine actual score actions, repeated delivery, rollback, rewards and records on PostgreSQL");
    await retryControlsTest();
    console.log("PASS Transient start failure, lost result, manual retry, double click and rapid restart controls");
    await guestTests();
    console.log("PASS Server-graded guest proofs, blocked storage, failed import, existing account and 50th mission");
    await authTests();
    console.log("PASS Signup with an open session, deferred verification, login and repeated login import the correct account");
    await audienceTests();
    console.log("PASS Role permissions and complete audience aggregates beyond the 1,000-row API limit");
  } finally {
    await db.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
