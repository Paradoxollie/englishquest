// Focused regression checks without writes to a real Supabase project.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function loadTs(relativePath, imports = {}) {
  const filename = path.resolve(__dirname, "..", relativePath);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (id) => id === "server-only" ? {} : id in imports ? imports[id] : require(id);
  new Function("require", "module", "exports", code)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

class Query {
  constructor(db, table) { this.db = db; this.table = table; this.filters = []; this.orders = []; }
  select(columns, options) { if (options?.count) this.countOptions = options; return this; }
  eq(key, value) { this.filters.push((row) => row[key] === value); return this; }
  gte(key, value) { this.filters.push((row) => row[key] >= value); return this; }
  lte(key, value) { this.filters.push((row) => row[key] <= value); return this; }
  lt(key, value) { this.filters.push((row) => row[key] < value); return this; }
  insert(rows) { this.inserted = Array.isArray(rows) ? rows : [rows]; return this; }
  delete() { this.deleting = true; return this; }
  is(key, value) { this.filters.push((row) => row[key] == value); return this; }
  in(key, values) { this.filters.push((row) => values.includes(row[key])); return this; }
  filter(key, operator, value) {
    assert.equal(operator, "eq");
    const expected = JSON.parse(`[${value.slice(1, -1)}]`);
    this.filters.push((row) => JSON.stringify(row[key]) === JSON.stringify(expected));
    return this;
  }
  order(key, { ascending }) { this.orders.push({ key, ascending }); return this; }
  range(from, to) { this.bounds = [from, to]; return this; }
  limit(limit) { this.bounds = [0, limit - 1]; return this; }
  update(patch) { this.patch = patch; return this; }
  async execute(single = false) {
    await new Promise((resolve) => setImmediate(resolve));
    const failure = await this.db.failQuery?.(this);
    if (failure) return { data: null, error: failure };
    this.db[this.table] ??= [];
    if (this.inserted) {
      const created = this.inserted.map((row) => ({ id: crypto.randomUUID(), ...row }));
      this.db[this.table].push(...created);
      const copies = created.map((row) => structuredClone(row));
      return { data: single ? copies[0] : copies, error: null };
    }
    let rows = this.db[this.table].filter((row) => this.filters.every((filter) => filter(row)));
    if (this.deleting) {
      this.db[this.table] = this.db[this.table].filter((row) => !rows.includes(row));
      return { data: null, error: null };
    }
    if (this.countOptions) return { data: this.countOptions.head ? null : rows.map((row) => structuredClone(row)), count: rows.length, error: null };
    rows.sort((a, b) => {
      for (const { key, ascending } of this.orders) {
        const difference = typeof a[key] === "number" ? a[key] - b[key] : String(a[key]).localeCompare(String(b[key]));
        if (difference) return ascending ? difference : -difference;
      }
      return 0;
    });
    if (this.bounds) rows = rows.slice(this.bounds[0], this.bounds[1] + 1);
    if (this.patch) rows.forEach((row) => Object.assign(row, this.patch));
    const copied = rows.map((row) => structuredClone(row));
    return { data: single ? copied[0] ?? null : copied, error: null };
  }
  single() { return this.execute(true); }
  maybeSingle() { return this.execute(true); }
  then(resolve, reject) { return this.execute().then(resolve, reject); }
}
const clientFor = (db) => ({
  from: (table) => new Query(db, table),
  rpc: (name, params) => db.rpc ? db.rpc(name, params) : Promise.resolve({ data: null, error: new Error("Missing mock RPC") }),
});

// A transaction contract double: changes become observable together, after
// any simulated failure. PostgreSQL's real locking is checked separately.
function atomicRewardRpc(db) {
  return async (name, params) => {
    await new Promise((resolve) => setImmediate(resolve));
    const failure = await db.failRpc?.(name, params);
    if (failure) return { data: null, error: failure };
    const profile = db.profiles.find((row) => row.id === params.p_user_id);
    if (!profile) return { data: null, error: new Error("Profile not found") };
    const previousLevel = profile.level;
    if (name === "complete_course_mission_and_grant_rewards") {
      const progress = db.user_course_progress.find((row) => row.user_id === params.p_user_id && row.course_id === params.p_course_id);
      const course = db.courses.find((row) => row.id === params.p_course_id);
      if (progress.status === "completed") return { data: { granted: false, level: profile.level, previousLevel }, error: null };
      const previousCourse = db.courses.find((row) => row.course_number === course.course_number - 1);
      const previousProgress = db.user_course_progress.find((row) => row.course_id === previousCourse?.id && row.user_id === params.p_user_id);
      if (progress.status === "locked" && course.course_number !== 1 && previousProgress?.status !== "completed") return { data: null, error: new Error("Course is locked") };
      profile.xp += params.p_reward_xp;
      profile.gold += params.p_reward_gold;
      profile.level = 1 + Math.floor(profile.xp / 200);
      progress.status = "completed";
      progress.completed_at = new Date().toISOString();
      const nextCourse = db.courses.find((row) => row.course_number === course.course_number + 1);
      const nextProgress = db.user_course_progress.find((row) => row.course_id === nextCourse?.id && row.user_id === params.p_user_id);
      if (nextProgress?.status === "locked") nextProgress.status = "unlocked";
      return { data: { granted: true, level: profile.level, previousLevel }, error: null };
    }
    assert.equal(name, "record_chapter_exam_and_grant_rewards");
    let exam = db.chapter_exams.find((row) => row.user_id === params.p_user_id && row.chapter === params.p_chapter);
    if (!exam) {
      exam = { id: "exam", user_id: params.p_user_id, chapter: params.p_chapter, best_correct: 0, total: 15, attempts: 0, passed_at: null };
      db.chapter_exams.push(exam);
    }
    const firstPass = params.p_correct >= 12 && exam.passed_at === null;
    exam.best_correct = Math.max(exam.best_correct, params.p_correct);
    exam.attempts += 1;
    if (firstPass) {
      exam.passed_at = new Date().toISOString();
      profile.xp += params.p_reward_xp;
      profile.gold += params.p_reward_gold;
      profile.level = 1 + Math.floor(profile.xp / 200);
    }
    return { data: { saved: true, firstPass, rewards: { xp: firstPass ? params.p_reward_xp : 0, gold: firstPass ? params.p_reward_gold : 0 }, newLevel: profile.level > previousLevel ? profile.level : null }, error: null };
  };
}

async function main() {
  const rush = loadTs("lib/games/grammar-rush.ts");
  const question = { id: "a", course: 1, question: "A?", options: ["yes", "no"], correctAnswer: 0 };
  let state = rush.createRushState(Array.from({ length: 60 }, (_, index) => ({ ...question, id: String(index) })));
  assert.equal(rush.answerRush(state, 9, 500).state, state, "invalid choices must not advance the queue");
  assert.equal(rush.answerRush(state, 0, -1).state, state, "negative response time must not award a bonus");
  let first = rush.answerRush(state, 0, 500);
  assert.equal(first.points, 15);
  assert.equal(first.state.correct, 1);
  const mistake = rush.answerRush(first.state, 1, 100);
  assert.equal(mistake.state.streak, 0);
  assert.equal(mistake.state.missed[0].id, "1");
  for (let index = 0; index < 60; index++) state = rush.answerRush(state, 0, 500).state;
  assert.equal(rush.currentRushQuestion(state), null);
  assert.equal(state.bestStreak, 60);
  assert(rush.isValidRushResult({ score: state.score, correct: 60, attempts: 60, durationMs: 60000 }));
  for (const result of [
    { score: 5000, correct: 60, attempts: 60, durationMs: 60000 },
    { score: 15, correct: 1, attempts: 0, durationMs: 60000 },
    { score: 30, correct: 2, attempts: 2, durationMs: 10 },
    { score: NaN, correct: 1, attempts: 1, durationMs: 60000 },
  ]) assert.equal(rush.isValidRushResult(result), false);

  const economy = loadTs("lib/profile/economy.ts");
  const server = loadTs("lib/profile/economy-server.ts", { "@/lib/profile/economy": economy });
  const boundaries = [
    ["2026-01-15T12:00:00Z", "2026-01-14T23:00:00.000Z"],
    ["2026-07-15T12:00:00Z", "2026-07-14T22:00:00.000Z"],
    ["2026-03-29T12:00:00Z", "2026-03-28T23:00:00.000Z"],
    ["2026-10-25T12:00:00Z", "2026-10-24T22:00:00.000Z"],
    ["2026-10-13T22:30:00Z", "2026-10-13T22:00:00.000Z"],
  ];
  const previousTZ = process.env.TZ;
  for (const tz of ["UTC", "Europe/Paris", "America/Los_Angeles"]) {
    process.env.TZ = tz;
    for (const [date, expected] of boundaries) assert.equal(server.getParisDayStart(new Date(date)).toISOString(), expected, tz);
  }
  if (previousTZ == null) delete process.env.TZ; else process.env.TZ = previousTZ;

  const balances = { profiles: [{ id: "user", xp: 180, gold: 5, level: 1 }] };
  await Promise.all([
    server.grantProfileRewards(clientFor(balances), "user", { xp: 25, gold: 2 }),
    server.grantProfileRewards(clientFor(balances), "user", { xp: 40, gold: 3 }),
  ]);
  assert.equal(balances.profiles[0].xp, 245, "concurrent games must retain both rewards");
  assert.equal(balances.profiles[0].gold, 10);
  assert.equal(balances.profiles[0].level, 2);

  const gameSlugs = ["enigma-scroll", "flash-translation", "flashback", "grammar-rush", "space-lex", "speed-verb-challenge", "wordfall"];
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const dailyDb = { profiles: [{ id: "user", xp: 100, gold: 5, level: 1, daily_streak: 6, last_game_date: today, last_daily_bonus_date: null, daily_played_games: [] }] };
  const daily = loadTs("lib/profile/daily-challenge.ts", {
    "@/lib/profile/economy": economy,
    "@/lib/profile/leveling": { calculateLevelFromXP: economy.getLevelFromXP },
    "@/lib/games/config": { games: gameSlugs.map((slug) => ({ slug })) },
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(dailyDb) },
  });
  const required = daily.getDailyRequiredGames();
  dailyDb.profiles[0].daily_played_games = [required[0]];
  const completions = await Promise.all([
    daily.checkAndGrantDailyBonus("user", required[1]),
    daily.checkAndGrantDailyBonus("user", required[2]),
    daily.checkAndGrantDailyBonus("user", required[2]),
  ]);
  assert.equal(completions.filter((result) => result.bonusGranted).length, 1, "daily bonus must be awarded once");
  assert.equal(dailyDb.profiles[0].xp, 145);
  assert.equal(dailyDb.profiles[0].gold, 8);
  assert.equal(completions.find((result) => result.bonusGranted).xpBonus, 45, "display the actual streak bonus");
  assert.deepEqual([...dailyDb.profiles[0].daily_played_games].sort(), [...required].sort());
  const springDate = new Date("2026-03-29T22:30:00Z"); // 30 March 00:30 in Paris, after the shortened day.
  assert.equal(daily.getDailyChallengeState({ last_game_date: "2026-03-29", daily_streak: 4 }, springDate).dailyStreak, 4);
  const fallDate = new Date("2026-10-25T22:30:00Z"); // 25 October 23:30 in Paris, after the longer day.
  assert.equal(daily.getDailyChallengeState({ last_game_date: "2026-10-24", daily_streak: 4 }, fallDate).dailyStreak, 4);

  const scores = Array.from({ length: 1200 }, (_, index) => ({ id: `a-${index}`, user_id: "a", game_id: "game", score: 100, difficulty: "easy", max_score: 10 }));
  scores.push({ id: "b", user_id: "b", game_id: "game", score: 90, difficulty: "easy", max_score: 9 });
  const leaderboardDb = { games: [{ id: "game", slug: "grammar-rush" }], game_scores: scores, profiles: [{ id: "a", username: "Alice" }, { id: "b", username: "Bob" }], user_equipped_items: [] };
  const leaderboard = loadTs("lib/games/leaderboard-service.ts", { "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(leaderboardDb) } });
  const board = await leaderboard.getGameLeaderboards({ slug: "grammar-rush", buckets: [{ key: "all" }], rowLimit: 500 });
  assert.equal(board.all.length, 2, "a prolific player must not hide other players");
  assert.equal(board.all[0].games_played, 1200);
  assert.equal(board.all[1].best_score, 90);
  leaderboardDb.game_scores = Array.from({ length: 2200 }, (_, index) => ({ id: String(index), user_id: "a", game_id: "game", score: index, difficulty: "easy" }));
  const best = await leaderboard.getPersonalBests({ slug: "grammar-rush", userId: "a", buckets: [{ key: "easy", difficulty: "easy" }] });
  assert.equal(best.easy, 2199, "personal best must include scores beyond the old 2000-row cap");
  const fastest = await leaderboard.getPersonalBests({ slug: "grammar-rush", userId: "a", buckets: [{ key: "all" }], scoreOrder: "asc" });
  assert.equal(fastest.all, 0);

  function courseFixture() {
    const courses = [1, 2, 3].map((number) => ({ id: `course-${number}`, course_number: number, title: `Course ${number}`, description: `Summary ${number}`, reward_xp: 80, reward_gold: 6, required_xp: (number - 1) * 30 }));
    const db = {
      courses,
      profiles: [{ id: "user", xp: 180, gold: 5, level: 1 }],
      user_course_progress: courses.map((course, index) => ({ id: `progress-${index}`, user_id: "user", course_id: course.id, status: index === 0 ? "in_progress" : "locked", best_score: 10001004, completed_at: null })),
    };
    db.rpc = atomicRewardRpc(db);
    const progress = loadTs("lib/courses/progress.ts", {
      "next/cache": { unstable_cache: (callback) => callback },
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(db) },
      "@/lib/profile/economy-server": server,
      "@/lib/games/config": { getGameBySlug: () => null },
      "./cache": { COURSE_CATALOG_TAG: "courses" },
      "./metadata": {
        getCourseMetadata: (id) => ({ summary: `Summary ${id}`, palierId: 1, learningGoals: [], focusTags: [], recommendedGameSlugs: [] }),
        getCourseRewardProfile: () => ({ xp: 80, gold: 6 }),
      },
      "./data": { paliers: [{ id: 1, courses: courses.map((course) => ({ id: course.course_number, title: course.title })) }], getCourseById: (id) => ({ title: `Course ${id}` }) },
    });
    return { db, progress };
  }
  const simultaneous = courseFixture();
  const courseResults = await Promise.all([
    simultaneous.progress.completeCourseAndGrantRewards("user", 1),
    simultaneous.progress.completeCourseAndGrantRewards("user", 1),
  ]);
  assert.equal(courseResults.filter((result) => result.rewards.xp > 0).length, 1, "concurrent course completion must reward once");
  assert.equal(simultaneous.db.profiles[0].xp, 260);
  assert.equal(simultaneous.db.profiles[0].gold, 11);
  assert.equal(simultaneous.db.user_course_progress[0].status, "completed");
  assert.equal(simultaneous.db.user_course_progress[1].status, "unlocked");

  const mixed = courseFixture();
  await Promise.all([
    mixed.progress.completeCourseAndGrantRewards("user", 1),
    server.grantProfileRewards(clientFor(mixed.db), "user", { xp: 25, gold: 2 }),
  ]);
  assert.equal(mixed.db.profiles[0].xp, 285, "game and course must retain both rewards");
  assert.equal(mixed.db.profiles[0].gold, 13);

  const blocked = courseFixture();
  await assert.rejects(blocked.progress.completeCourseAndGrantRewards("user", 3), /Course is locked/);
  assert.equal(blocked.db.profiles[0].xp, 180);
  assert.equal(blocked.db.user_course_progress[2].status, "locked");

  const failed = courseFixture();
  failed.db.failRpc = async () => {
    // A concurrent roadmap read must not unlock a course while its reward is pending.
    await failed.progress.getUserCourseRoadmap("user");
    return new Error("Simulated reward write failure");
  };
  await assert.rejects(failed.progress.completeCourseAndGrantRewards("user", 1), /Simulated reward write failure/);
  assert.equal(failed.db.user_course_progress[0].status, "in_progress", "failed reward must restore course claim");
  assert.equal(failed.db.user_course_progress[0].completed_at, null);
  assert.equal(failed.db.user_course_progress[1].status, "locked");
  assert.equal(failed.db.profiles[0].xp, 180);

  const chapterDefinitions = [1, 2, 3, 4, 5].map((id) => ({ id, name: `Chapter ${id}`, courseIds: Array.from({ length: 10 }, (_, index) => (id - 1) * 10 + index + 1) }));
  const questionBank = Array.from({ length: 50 }, (_, index) =>
    Array.from({ length: 5 }, (_, number) => ({ id: `${index + 1}-q${number}`, course: index + 1, question: "Choose yes", options: ["yes", "no"], correctAnswer: 0 }))
  ).flat();
  const fullExamAnswers = Object.fromEntries(questionBank.filter((question) => question.course <= 10 && question.id.endsWith("q0") || question.course <= 5 && question.id.endsWith("q1")).map((question) => [question.id, 0]));

  function examFixture(existing = []) {
    const db = { profiles: [{ id: "user", xp: 180, gold: 5, level: 1 }], chapter_exams: structuredClone(existing) };
    db.rpc = atomicRewardRpc(db);
    const exams = loadTs("lib/exams/exams.ts", {
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(db) },
      "@/lib/profile/economy": economy,
      "@/lib/courses/progress": { getUserCourseRoadmap: async () => ({ entries: [] }) },
      "@/lib/courses/chapters": { chapters: chapterDefinitions },
      "@/lib/placement/questions.json": { default: questionBank },
    });
    return { db, exams };
  }
  const examAttempts = examFixture();
  const examResults = await Promise.all([
    examAttempts.exams.recordChapterExam("user", 1, 12, 15),
    examAttempts.exams.recordChapterExam("user", 1, 15, 15),
  ]);
  assert.equal(examResults.filter((result) => result.firstPass).length, 1);
  assert.equal(examAttempts.db.profiles[0].xp, 340, "simultaneous first exam passes award once");
  assert.equal(examAttempts.db.profiles[0].gold, 17);
  assert.equal(examAttempts.db.chapter_exams[0].attempts, 2);
  assert.equal(examAttempts.db.chapter_exams[0].best_correct, 15);
  const retryResult = await examAttempts.exams.recordChapterExam("user", 1, 14, 15);
  assert.equal(retryResult.firstPass, false);
  assert.equal(retryResult.rewards.xp, 0);
  assert.equal(examAttempts.db.profiles[0].xp, 340);

  const mixedExam = examFixture();
  await Promise.all([
    mixedExam.exams.recordChapterExam("user", 1, 12, 15),
    server.grantProfileRewards(clientFor(mixedExam.db), "user", { xp: 25, gold: 2 }),
  ]);
  assert.equal(mixedExam.db.profiles[0].xp, 365, "exam and game increments must both survive");
  assert.equal(mixedExam.db.profiles[0].gold, 19);
  const invalidExam = await mixedExam.exams.recordChapterExam("user", 1, 100, 100);
  assert.equal(invalidExam.saved, false);

  const failedExam = examFixture([{ id: "exam", user_id: "user", chapter: 1, best_correct: 10, total: 15, attempts: 1, passed_at: null }]);
  failedExam.db.failRpc = () => new Error("Simulated exam reward write failure");
  const originalLogError = console.error;
  let failureResult;
  try {
    console.error = () => {};
    failureResult = await failedExam.exams.recordChapterExam("user", 1, 12, 15);
  } finally { console.error = originalLogError; }
  assert.equal(failureResult.saved, false);
  assert.equal(failureResult.firstPass, false);
  assert.equal(failedExam.db.chapter_exams[0].passed_at, null);
  assert.equal(failedExam.db.chapter_exams[0].attempts, 1, "failed transaction must preserve the previous attempt");
  assert.equal(failedExam.db.profiles[0].xp, 180);

  const scoped = examFixture();
  assert.equal(scoped.exams.gradeChapterExam(fullExamAnswers, 1).passed, true);
  assert.equal(scoped.exams.gradeChapterExam(fullExamAnswers, 2).valid, false, "exam answers from another chapter must be rejected");
  assert.equal(scoped.exams.gradeChapterExam(Object.fromEntries(Object.entries(fullExamAnswers).slice(0, 12)), 1).passed, false, "12 submitted answers are not a complete 15-question exam");
  assert.equal(scoped.exams.gradeChapterExam({ ...fullExamAnswers, "1-q0": 9 }, 1).valid, false);
  assert.equal(scoped.exams.gradeChapterExam(Object.fromEntries(questionBank.slice(0, 15).map((question) => [question.id, 0])), 1).valid, false, "the exam permits at most two questions per course");

  let placementWrites = 0;
  const placement = loadTs("lib/placement/placement.ts", {
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(scoped.db) },
    "@/lib/courses/chapters": { chapters: chapterDefinitions },
    "@/lib/courses/progress": { getUserCourseRoadmap: async () => ({ entries: [] }) },
    "./questions.json": { default: questionBank },
  });
  const placementAnswers = Object.fromEntries(questionBank.filter((question) => question.course <= 6 && question.id.endsWith("q0")).map((question) => [question.id, 0]));
  assert.equal(placement.gradePlacementStep(placementAnswers, 1).passed, true);
  assert.equal(placement.gradePlacementStep(placementAnswers, 2).valid, false);
  assert.equal(placement.gradePlacementStep(placementAnswers, 5).valid, false);
  assert.equal(placement.gradePlacementStep(Object.fromEntries(Object.entries(placementAnswers).slice(0, 4)), 1).passed, false);
  assert.equal(placement.gradePlacementStep({ ...placementAnswers, "1-q0": -1 }, 1).valid, false);
  const repeatedCourseAnswers = { ...placementAnswers, "1-q1": 0 };
  delete repeatedCourseAnswers["6-q0"];
  assert.equal(placement.gradePlacementStep(repeatedCourseAnswers, 1).valid, false, "placement needs six different courses");
  const serverAuth = { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user" } } }) } }) };
  const placementMocks = (auth) => ({
    "next/cache": { revalidatePath: () => {} },
    "@/lib/supabase/server": auth,
    "@/lib/courses/chapters": { chapters: chapterDefinitions },
    "@/lib/placement/placement-token": { createPlacementToken: (chapter) => `signed-${chapter}` },
    "@/lib/placement/placement": { ...placement, applyPlacement: async () => { placementWrites += 1; return {}; } },
  });
  const placementAction = loadTs("app/(public)/test-de-niveau/actions.ts", placementMocks(serverAuth));
  assert("error" in await placementAction.submitPlacementStepAction(2, placementAnswers));
  assert("error" in await placementAction.submitPlacementStepAction(1, Object.fromEntries(Object.entries(placementAnswers).slice(0, 4))));
  assert.equal(placementWrites, 0, "invalid placement submissions must never advance the curriculum");
  const placementPass = await placementAction.submitPlacementStepAction(1, placementAnswers);
  assert.equal(placementPass.next.chapter, 2);
  // Visiteur sans compte : résultat signé, aucune écriture avant l'inscription.
  const guestAuth = { createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }) };
  const guestPlacement = loadTs("app/(public)/test-de-niveau/actions.ts", placementMocks(guestAuth));
  const writesBeforeGuest = placementWrites;
  const failedAnswers = Object.fromEntries(Object.keys(placementAnswers).map((id) => [id, 1]));
  const guestDone = await guestPlacement.submitPlacementStepAction(1, failedAnswers);
  assert.equal(guestDone.placed.chapterId, 1);
  assert.equal(guestDone.guestToken, "signed-1");
  assert.equal(placementWrites, writesBeforeGuest, "a guest placement never writes to the database");
  let badgeSyncs = 0;
  const examAction = loadTs("app/(protected)/examen/[chapter]/actions.ts", {
    "next/cache": { revalidatePath: () => {} },
    "@/lib/supabase/server": serverAuth,
    "@/lib/exams/exams": { ...scoped.exams, isChapterCompleted: async () => true },
    "@/lib/profile/badges-server": { syncBadgesSafely: async () => { badgeSyncs += 1; return []; } },
  });
  assert("error" in await examAction.submitChapterExamAction(2, fullExamAnswers));
  assert("error" in await examAction.submitChapterExamAction(1, Object.fromEntries(Object.entries(fullExamAnswers).slice(0, 12))));
  assert.equal(scoped.db.chapter_exams.length, 0, "invalid exam submissions must not save or grant rewards");
  assert.equal(badgeSyncs, 0, "invalid exam submissions must not sync badges");
  // ---------- Sessions de partie (anti-triche) ----------
  const sessionRules = loadTs("lib/games/game-session-rules.ts");
  const plausibility = loadTs("lib/games/score-plausibility.ts", { "./grammar-rush": rush });
  const authAs = (userId) => ({ createSupabaseServerClient: async () => ({ auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) } }) });
  function sessionFixture(userId = "user") {
    const db = { game_sessions: [], games: [{ id: "game-flashback", slug: "flashback" }], game_scores: [] };
    const sessions = loadTs("lib/games/game-session-server.ts", {
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(db) },
      "@/lib/supabase/server": authAs(userId),
      "@/lib/games/game-session-rules": sessionRules,
    });
    return { db, sessions };
  }
  const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

  const guestSessions = sessionFixture(null);
  assert.equal((await guestSessions.sessions.startGameSession("wordfall")).ok, false, "guests get no session");
  assert.equal(guestSessions.db.game_sessions.length, 0);
  const { db: sessionDb, sessions } = sessionFixture();
  assert.equal((await sessions.startGameSession("tetris")).ok, false, "unknown game");
  sessionDb.game_sessions.push({ id: crypto.randomUUID(), user_id: "user", game_slug: "wordfall", started_at: new Date(Date.now() - 2 * 86_400_000).toISOString(), used_at: null });
  const started = await sessions.startGameSession("wordfall");
  assert.equal(started.ok, true);
  assert.ok(sessionRules.isSessionId(started.sessionId));
  assert.equal(sessionDb.game_sessions.length, 1, "sessions older than a day are cleaned up");
  const consume = (sessionId, extra = {}) => sessions.consumeGameSession({ sessionId, userId: "user", slug: "wordfall", claimedDurationMs: 0, ...extra });
  assert.deepEqual(await consume(started.sessionId), { ok: true });
  assert.equal((await consume(started.sessionId)).reason, "used", "a session counts once");
  assert.equal((await consume(null)).reason, "missing");
  assert.equal((await consume(crypto.randomUUID())).reason, "unknown");
  const raced = await sessions.startGameSession("wordfall");
  const race = await Promise.all([consume(raced.sessionId), consume(raced.sessionId), consume(raced.sessionId)]);
  assert.equal(race.filter((result) => result.ok).length, 1, "simultaneous submissions consume once");
  const foreign = { id: crypto.randomUUID(), user_id: "other", game_slug: "wordfall", started_at: minutesAgo(5), used_at: null };
  const wrongGame = { id: crypto.randomUUID(), user_id: "user", game_slug: "flashback", started_at: minutesAgo(5), used_at: null };
  const young = { id: crypto.randomUUID(), user_id: "user", game_slug: "wordfall", started_at: minutesAgo(0.5), used_at: null };
  const old = { id: crypto.randomUUID(), user_id: "user", game_slug: "wordfall", started_at: minutesAgo(121), used_at: null };
  sessionDb.game_sessions.push(foreign, wrongGame, young, old);
  assert.equal((await consume(foreign.id)).reason, "foreign");
  assert.equal((await consume(wrongGame.id)).reason, "wrong_game");
  assert.equal((await consume(young.id, { claimedDurationMs: 60_000 })).reason, "too_fast", "30 s of play cannot claim 60 s");
  assert.equal(young.used_at, null, "a rejected session stays unused");
  assert.deepEqual(await consume(young.id, { claimedDurationMs: 32_000 }), { ok: true }, "3 s of clock tolerance");
  assert.equal((await consume(old.id)).reason, "expired");
  const limited = sessionFixture("busy");
  for (let index = 0; index < 30; index += 1) assert.equal((await limited.sessions.startGameSession("flashback")).ok, true);
  const refused = await limited.sessions.startGameSession("flashback");
  assert.equal(refused.ok, false, "31st start within a minute");
  assert.match(refused.error, /Trop de parties/);
  limited.db.game_sessions.forEach((row) => { row.started_at = minutesAgo(2); });
  assert.equal((await limited.sessions.startGameSession("flashback")).ok, true, "the limit is per minute");

  // Une action de score exige une session valide (exemple : Flashback).
  const actionFixture = sessionFixture();
  const flashbackAction = loadTs("app/play/flashback/actions.ts", {
    "@/lib/profile/economy": economy,
    "@/lib/profile/economy-server": { countPlaysToday: async () => 0, grantProfileRewards: async () => ({ level: 1, previousLevel: 1 }) },
    "@/lib/courses/mission-auto-complete": { autoCompleteCourseMissionForGame: async () => null },
    "@/lib/profile/daily-challenge": { checkAndGrantDailyBonus: async () => ({ dailyPlayedGames: [], requiredGames: [], bonusGranted: false, xpBonus: 0, goldBonus: 0, dailyGoalReached: false }) },
    "@/lib/supabase/server": authAs("user"),
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(actionFixture.db) },
    "@/lib/games/game-session-server": actionFixture.sessions,
    "@/lib/games/score-plausibility": plausibility,
  });
  const noSession = await flashbackAction.submitEchoLexScore({ score: 12, durationMs: 30_000 });
  assert.equal(noSession.success, false, "logged-in score without a session");
  assert.match(noSession.error, /Partie introuvable/);
  const played = { id: crypto.randomUUID(), user_id: "user", game_slug: "flashback", started_at: minutesAgo(0.6), used_at: null };
  actionFixture.db.game_sessions.push(played);
  const implausible = await flashbackAction.submitEchoLexScore({ score: 900, durationMs: 30_000, sessionId: played.id });
  assert.equal(implausible.success, false, "900 answers in 30 s");
  assert.equal(played.used_at, null, "an implausible score does not burn the session");
  const saved = await flashbackAction.submitEchoLexScore({ score: 12, durationMs: 30_000, sessionId: played.id });
  assert.equal(saved.success, true, saved.error);
  assert.equal(actionFixture.db.game_scores.length, 1);
  const replayed = await flashbackAction.submitEchoLexScore({ score: 12, durationMs: 30_000, sessionId: played.id });
  assert.equal(replayed.success, false, "the same game cannot be submitted twice");
  assert.equal(actionFixture.db.game_scores.length, 1);
  const tooLong = { id: crypto.randomUUID(), user_id: "user", game_slug: "flashback", started_at: minutesAgo(0.2), used_at: null };
  actionFixture.db.game_sessions.push(tooLong);
  assert.equal((await flashbackAction.submitEchoLexScore({ score: 12, durationMs: 30_000, sessionId: tooLong.id })).success, false, "claimed duration longer than the session");

  for (const slug of sessionRules.GAME_SESSION_SLUGS) {
    const source = fs.readFileSync(path.resolve(__dirname, "..", "app/play", slug, "actions.ts"), "utf8");
    assert.match(source, /consumeGameSession\(/, `${slug} submit action must consume a game session`);
    assert.match(source, /score-plausibility/, `${slug} submit action must check plausibility`);
  }

  console.log("PASS: Game sessions (guest, unknown game, cleanup, single use, race, foreign, wrong game, too fast, expired, 30 per minute) and score actions requiring a valid session.");
  console.log("PASS: Grammar Rush bounds and scoring; Paris day boundaries in 3 host timezones; concurrent rewards; daily bonus deduplication; complete leaderboards and personal bests.");
  console.log("PASS: Concurrent course completion once; course + game rewards; blocked course; course reward failure restores claim.");
  console.log("PASS: Exam transaction calls; simultaneous first passes once; exam + game rewards; invalid result rejected; failed transaction retains no pass or reward.");
  console.log("PASS: Exam and placement chapter scope, complete question counts, option bounds, course distribution and invalid server submissions without writes.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
