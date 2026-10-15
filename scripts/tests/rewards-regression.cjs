// Run with: node scripts/tests/rewards-regression.cjs
// Récompenses : semaine de Paris, badges, étoiles, ligue, entraînement ciblé,
// événements de célébration, migrations. Hors ligne : clients Supabase simulés.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");

/** Charge un fichier TypeScript du projet ; `stubs` remplace des imports (« @/… », « server-only »…). */
function loadSource(relativePath, stubs = {}) {
  const cache = new Map();
  function load(filename) {
    if (filename.endsWith(".json")) return JSON.parse(fs.readFileSync(filename, "utf8"));
    if (cache.has(filename)) return cache.get(filename).exports;
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    const mod = new Module(filename, module);
    cache.set(filename, mod);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    const originalRequire = mod.require.bind(mod);
    mod.require = (name) => {
      if (Object.hasOwn(stubs, name)) return stubs[name];
      if (name === "server-only") return {};
      if (name.startsWith("@/") || name.startsWith("./") || name.startsWith("../")) {
        const base = name.startsWith("@/") ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name);
        const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
        if (!resolved) throw new Error(`Unresolved import ${name}`);
        return load(resolved);
      }
      return originalRequire(name);
    };
    mod._compile(output, filename);
    return mod.exports;
  }
  return load(path.join(root, relativePath));
}

let cases = 0;
async function test(name, run) {
  await run();
  cases += 1;
  console.log(`PASS ${name}`);
}

/* Client Supabase simulé : filtres, comptages, upsert « on conflict do nothing ». */
class Query {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.filters = [];
  }
  select(_columns, options = {}) {
    this.head = Boolean(options.head);
    this.wantsCount = options.count === "exact";
    return this;
  }
  eq(key, value) { this.filters.push((row) => row[key] === value); return this; }
  in(key, values) { this.filters.push((row) => values.includes(row[key])); return this; }
  not(key, operator, value) {
    assert.equal(operator, "is");
    this.filters.push((row) => row[key] !== value && row[key] !== undefined);
    return this;
  }
  upsert(rows, options) { this.upsertRows = rows; this.upsertOptions = options; return this; }
  async execute(single) {
    await new Promise((resolve) => setImmediate(resolve));
    const failure = this.db.fail?.(this);
    if (failure) return { data: null, error: failure, count: null };
    const table = this.db[this.table];
    if (!table) return { data: null, error: { code: "42P01", message: `relation ${this.table} does not exist` }, count: null };
    if (this.upsertRows) {
      assert.equal(this.upsertOptions.ignoreDuplicates, true, "badge inserts must ignore duplicates");
      const inserted = [];
      for (const row of this.upsertRows) {
        if (table.some((existing) => existing.user_id === row.user_id && existing.badge_key === row.badge_key)) continue;
        const stored = { ...row, earned_at: new Date(Date.UTC(2026, 9, 16, 8, 0, table.length)).toISOString() };
        table.push(stored);
        inserted.push(stored);
      }
      return { data: inserted.map((row) => ({ ...row })), error: null, count: null };
    }
    const rows = table.filter((row) => this.filters.every((filter) => filter(row))).map((row) => structuredClone(row));
    if (this.head) return { data: null, error: null, count: rows.length };
    return { data: single ? rows[0] ?? null : rows, error: null, count: this.wantsCount ? rows.length : null };
  }
  maybeSingle() { return this.execute(true); }
  single() { return this.execute(true); }
  then(resolve, reject) { return this.execute(false).then(resolve, reject); }
}
const clientFor = (db) => ({
  from: (table) => new Query(db, table),
  rpc: (name, params) => (db.rpc ? db.rpc(name, params) : Promise.resolve({ data: null, error: { code: "PGRST202" } })),
});

const chapterDefinitions = [1, 2, 3, 4, 5].map((id) => ({ id, courseIds: Array.from({ length: 10 }, (_, index) => (id - 1) * 10 + index + 1) }));

(async () => {
  const economy = loadSource("lib/profile/economy.ts");
  const economyServer = loadSource("lib/profile/economy-server.ts");

  await test("Paris week starts on Monday 00:00 across DST, in 3 host time zones", () => {
    const weeks = [
      // [instant, lundi 00:00 Paris, lundi suivant 00:00 Paris]
      ["2026-10-15T10:00:00Z", "2026-10-11T22:00:00.000Z", "2026-10-18T22:00:00.000Z"],
      // Dimanche du passage à l'heure d'hiver : la semaine a commencé en heure d'été.
      ["2026-10-25T12:00:00Z", "2026-10-18T22:00:00.000Z", "2026-10-25T23:00:00.000Z"],
      // Lundi 00:30 heure d'hiver : nouvelle semaine.
      ["2026-10-25T23:30:00Z", "2026-10-25T23:00:00.000Z", "2026-11-01T23:00:00.000Z"],
      // Dimanche 23:59 Paris : encore la semaine précédente.
      ["2026-10-25T22:59:00Z", "2026-10-18T22:00:00.000Z", "2026-10-25T23:00:00.000Z"],
      // Dimanche du passage à l'heure d'été.
      ["2026-03-29T12:00:00Z", "2026-03-22T23:00:00.000Z", "2026-03-29T22:00:00.000Z"],
      ["2026-03-29T22:00:00Z", "2026-03-29T22:00:00.000Z", "2026-04-05T22:00:00.000Z"],
      // Changement d'année au milieu de la semaine.
      ["2027-01-01T09:00:00Z", "2026-12-27T23:00:00.000Z", "2027-01-03T23:00:00.000Z"],
      // Lundi midi.
      ["2026-07-13T10:00:00Z", "2026-07-12T22:00:00.000Z", "2026-07-19T22:00:00.000Z"],
    ];
    const previousTZ = process.env.TZ;
    try {
      for (const tz of ["UTC", "Europe/Paris", "America/Los_Angeles"]) {
        process.env.TZ = tz;
        for (const [instant, start, next] of weeks) {
          assert.equal(economyServer.getParisWeekStart(new Date(instant)).toISOString(), start, `${tz} ${instant}`);
          assert.equal(economyServer.getNextParisWeekStart(new Date(instant)).toISOString(), next, `${tz} ${instant} next`);
        }
        // La journée reste correcte après l'extraction du calcul de minuit.
        assert.equal(economyServer.getParisDayStart(new Date("2026-10-25T12:00:00Z")).toISOString(), "2026-10-24T22:00:00.000Z");
      }
    } finally {
      if (previousTZ == null) delete process.env.TZ;
      else process.env.TZ = previousTZ;
    }
  });

  const badges = loadSource("lib/profile/badges.ts");

  await test("Badge catalogue: about 25 unique, short French badges without dashes", () => {
    assert.ok(badges.BADGES.length >= 24 && badges.BADGES.length <= 30, `${badges.BADGES.length} badges`);
    assert.equal(new Set(badges.BADGES.map((badge) => badge.key)).size, badges.BADGES.length, "unique keys");
    for (const badge of badges.BADGES) {
      assert.match(badge.key, /^[a-z0-9_]{1,64}$/, badge.key);
      assert.ok(["bronze", "argent", "or"].includes(badge.tier), badge.key);
      assert.ok(badge.name.length > 0 && badge.name.length <= 24, `${badge.key}: short name`);
      assert.ok(badge.target >= 1, badge.key);
      for (const text of [badge.name, badge.description]) {
        assert.ok(!/[–—]/.test(text), `${badge.key}: no en or em dash in "${text}"`);
        assert.ok(!/\p{Extended_Pictographic}/u.test(text), `${badge.key}: no emoji in "${text}"`);
      }
    }
    for (const tier of ["bronze", "argent", "or"]) assert.ok(badges.BADGES.some((badge) => badge.tier === tier), tier);
    const config = loadSource("lib/games/config.ts");
    assert.deepEqual(
      badges.BADGE_GAMES.map((game) => game.slug).sort(),
      config.games.map((game) => game.slug).sort(),
      "one badge per game of the catalogue"
    );
  });

  await test("evaluateBadges awards thresholds, per-game badges, explorer and levels", () => {
    assert.deepEqual(badges.evaluateBadges(badges.emptyBadgeStats()), []);
    const stats = {
      ...badges.emptyBadgeStats(),
      missionsCompleted: 5,
      chaptersCompleted: [1],
      examsPassed: 1,
      gamesPlayed: 12,
      gamesPlayedBySlug: { "grammar-rush": 10, wordfall: 2 },
      dailyStreak: 3,
      totalXp: 820,
      level: 1,
      perfectQuizzes: 1,
      placementTaken: true,
    };
    const earned = badges.evaluateBadges(stats);
    for (const key of ["mission_1", "missions_5", "chapter_1", "exam_1", "games_10", "game_grammar_rush", "streak_3", "level_5", "perfect_quiz", "placement"]) {
      assert.ok(earned.includes(key), `${key} expected`);
    }
    for (const key of ["missions_25", "chapter_2", "games_100", "game_wordfall", "all_games", "streak_7", "level_10"]) {
      assert.ok(!earned.includes(key), `${key} not yet earned`);
    }
    const explorer = badges.getBadgeDefinition("all_games");
    const allGames = Object.fromEntries(badges.BADGE_GAMES.map((game) => [game.slug, 1]));
    assert.equal(badges.getBadgeProgress(explorer, { ...stats, gamesPlayedBySlug: allGames }).earned, true);
    const progress = badges.getBadgeProgress(badges.getBadgeDefinition("missions_25"), stats);
    assert.deepEqual([progress.current, progress.target, progress.percent], [5, 25, 20]);
    const capped = badges.getBadgeProgress(badges.getBadgeDefinition("missions_5"), { ...stats, missionsCompleted: 40 });
    assert.equal(capped.current, 5, "progress is capped at the target");
    // Une meilleure série passée compte même si la série du jour est retombée.
    assert.ok(badges.evaluateBadges({ ...stats, dailyStreak: 0, bestDailyStreak: 8 }).includes("streak_7"));
  });

  const telemetry = loadSource("lib/courses/mission-telemetry.ts");
  const stars = loadSource("lib/courses/stars.ts");

  await test("Mission telemetry round-trips and matches the placement skip mark", () => {
    const encoded = telemetry.encodeCourseMissionTelemetry({ readingCheckpointReached: true, quizScore: 9, quizTotal: 10 });
    assert.equal(encoded, 10_010_009);
    assert.deepEqual(telemetry.decodeCourseMissionTelemetry(encoded), { readingCheckpointReached: true, quizScore: 9, quizTotal: 10 });
    assert.deepEqual(telemetry.decodeCourseMissionTelemetry(null), { readingCheckpointReached: false, quizScore: 0, quizTotal: 0 });
    const placement = loadSource("lib/placement/placement.ts", {
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => { throw new Error("no database in tests"); } },
      "@/lib/courses/progress": { getUserCourseRoadmap: async () => ({ entries: [] }) },
    });
    assert.equal(telemetry.COURSE_PLACEMENT_SKIP_MARK, placement.PLACEMENT_SKIP_MARK);
    assert.equal(telemetry.isCoursePlacementSkip(placement.PLACEMENT_SKIP_MARK), true);
    // La migration de récompense des missions ne touche pas à best_score : le quiz survit à la validation.
    const rpc = fs.readFileSync(path.join(root, "supabase/migrations/2026-10-13_02_atomic_course_rewards.sql"), "utf8");
    assert.ok(!/best_score/.test(rpc), "course completion RPC keeps the quiz telemetry");
  });

  await test("Stars: validated, perfect quiz and targeted practice", () => {
    const encode = (score, total) => telemetry.encodeCourseMissionTelemetry({ readingCheckpointReached: true, quizScore: score, quizTotal: total });
    const s = (status, best, practice) => stars.getMissionStars({ status, missionTelemetry: best }, practice);
    assert.deepEqual(s("completed", encode(8, 10), 0), { validated: true, perfectQuiz: false, practice: false, count: 1 });
    assert.deepEqual(s("completed", encode(10, 10), 5), { validated: true, perfectQuiz: true, practice: true, count: 3 });
    assert.equal(s("completed", 8_000_000, 0).count, 0, "placement skip is not a played mission");
    assert.equal(s("completed", 8_000_000, 6).count, 1, "practice still counts on a placed course");
    assert.equal(s("completed", null, 0).validated, true, "legacy completion without quiz telemetry");
    assert.equal(s("completed", encode(6, 10), 0).validated, false, "a failed quiz over a placement skip does not validate");
    assert.deepEqual(s("in_progress", encode(7, 10), 4), { validated: false, perfectQuiz: false, practice: false, count: 0 });
    assert.equal(s("in_progress", encode(0, 0), 5).count, 1, "practice star before validation");
    assert.equal(stars.sumStars([s("completed", encode(10, 10), 5), s("completed", encode(8, 10), 0)]), 4);
    assert.equal(stars.describeMissionStars(s("completed", encode(10, 10), 0)), "2 étoiles sur 3 : mission validée, quiz 10 sur 10");
    assert.equal(stars.describeMissionStars(stars.NO_MISSION_STARS), "0 étoile sur 3");
  });

  const league = loadSource("lib/profile/league.ts");

  await test("Weekly league keeps the top 20 and the player's own rank", () => {
    const rows = Array.from({ length: 20 }, (_, index) => ({ user_id: `u${index + 1}`, xp: String(1000 - index * 10), rank: index + 1, total_players: 42 }));
    rows.push({ user_id: "me", xp: 35, rank: "37", total_players: "42" });
    const shaped = league.shapeLeagueRows(rows, "me", 20);
    assert.equal(shaped.top.length, 20);
    assert.deepEqual(shaped.me, { userId: "me", xp: 35, rank: 37 });
    assert.equal(shaped.meInTop, false);
    assert.equal(shaped.totalPlayers, 42);
    const inTop = league.shapeLeagueRows(rows, "u3", 20);
    assert.equal(inTop.meInTop, true);
    assert.equal(inTop.me.rank, 3);
    const absent = league.shapeLeagueRows(rows.slice(0, 3), "nobody", 20);
    assert.equal(absent.me, null);
    assert.equal(league.shapeLeagueRows(null, "me").top.length, 0);
    assert.equal(league.formatRank(1), "1re");
    assert.equal(league.formatRank(2), "2e");
    const monday = new Date("2026-10-18T22:00:00Z");
    assert.equal(league.formatLeagueReset(new Date("2026-10-18T10:00:00Z"), monday), "cette nuit à minuit");
    assert.equal(league.formatLeagueReset(new Date("2026-10-17T08:00:00Z"), monday), "demain soir à minuit");
    assert.equal(league.formatLeagueReset(new Date("2026-10-15T10:00:00Z"), monday), "dans 4 jours");
  });

  const rush = loadSource("lib/games/grammar-rush.ts");

  await test("Grammar Rush counts targeted correct answers and bounds them", () => {
    const queue = Array.from({ length: 30 }, (_, index) => ({
      id: String(index),
      course: index % 3 === 1 ? 7 : 2,
      question: "Q",
      options: ["a", "b"],
      correctAnswer: 0,
    }));
    let state = rush.createRushState(queue);
    for (let index = 0; index < 16; index += 1) {
      // Rate la première question ciblée (index 1), réussit tout le reste.
      state = rush.answerRush(state, index === 1 ? 1 : 0, 500).state;
    }
    assert.equal(rush.countFocusCorrect(state, 7), 4);
    assert.equal(rush.countFocusCorrect(state, null), 0);
    assert.equal(rush.isValidFocusResult({ focusCorrect: 4, correct: state.correct, attempts: state.attempts }), true);
    assert.equal(rush.isValidFocusResult({ focusCorrect: 5, correct: 15, attempts: 14 }), true);
    assert.equal(rush.isValidFocusResult({ focusCorrect: 6, correct: 5, attempts: 30 }), false, "more than the correct answers");
    assert.equal(rush.isValidFocusResult({ focusCorrect: 5, correct: 10, attempts: 12 }), false, "one question in three at most");
    assert.equal(rush.isValidFocusResult({ focusCorrect: 11, correct: 40, attempts: 40 }), false, "ten questions per course");
    assert.equal(rush.isValidFocusResult({ focusCorrect: 1.5, correct: 10, attempts: 10 }), false);
  });

  const events = loadSource("lib/profile/reward-events.ts");

  await test("Game end celebration sums game, daily challenge and mission rewards", () => {
    const detail = events.buildGameRewardDetail({
      xpEarned: 25,
      goldEarned: 2,
      newLevel: 3,
      dailyChallenge: { bonusGranted: true, xpBonus: 45, goldBonus: 3 },
      courseCompleted: { courseNumber: 4, rewards: { xp: 80, gold: 6 }, newLevel: 4 },
      newBadges: [{ key: "mission_1", name: "Premier pas", tier: "bronze" }],
      practice: { courseId: 4, newlyEarned: true },
    });
    assert.deepEqual(detail, {
      xp: 150,
      gold: 11,
      newLevel: 4,
      badges: [{ key: "mission_1", name: "Premier pas", tier: "bronze" }],
      stars: 2,
      label: "Mission 4 validée",
    });
    const plain = events.buildGameRewardDetail({ xpEarned: 10, goldEarned: 0, dailyChallenge: { bonusGranted: false, xpBonus: 45, goldBonus: 3 } });
    assert.equal(plain.xp, 10);
    assert.equal(plain.gold, 0);
    assert.equal(plain.newLevel, null);
    assert.equal(plain.label, "Partie enregistrée");
    assert.equal(events.hasRewardContent({}), false);
    assert.equal(events.hasRewardContent({ xp: 0, badges: [] }), false);
    assert.equal(events.hasRewardContent({ badges: [{ key: "a", name: "A" }] }), true);
    const clean = events.normalizeRewardDetail({ xp: -5, gold: "3", newLevel: 0, badges: [{ key: 1 }, { key: "k", name: "N" }], label: "  " });
    assert.deepEqual(clean, { xp: 0, gold: 3, newLevel: null, badges: [{ key: "k", name: "N" }], stars: 0, label: null });
    assert.equal(events.dispatchReward({ xp: 5 }), false, "no window on the server");
  });

  function badgeDb() {
    const progress = [];
    for (let course = 1; course <= 10; course += 1) {
      progress.push({ user_id: "user", status: "completed", best_score: course === 3 ? 10_010_010 : 9_000_000 + 1_010_008, courses: { course_number: course } });
    }
    progress.push({ user_id: "user", status: "completed", best_score: 8_000_000, courses: { course_number: 11 } });
    progress.push({ user_id: "user", status: "in_progress", best_score: null, courses: { course_number: 12 } });
    const games = [
      { id: "g-rush", slug: "grammar-rush" },
      { id: "g-word", slug: "wordfall" },
    ];
    const scores = [
      ...Array.from({ length: 10 }, (_, index) => ({ id: `r${index}`, user_id: "user", game_id: "g-rush" })),
      { id: "w1", user_id: "user", game_id: "g-word" },
      { id: "other", user_id: "someone-else", game_id: "g-word" },
    ];
    return {
      profiles: [{ id: "user", xp: 450, level: 3, daily_streak: 3, placement_at: "2026-10-10T10:00:00Z" }],
      user_course_progress: progress,
      games,
      game_scores: scores,
      chapter_exams: [{ id: "e1", user_id: "user", chapter: 1, passed_at: "2026-10-12T10:00:00Z" }],
      user_badges: [{ user_id: "user", badge_key: "mission_1", earned_at: "2026-10-01T10:00:00.000Z" }],
    };
  }
  const loadBadgesServer = (db) =>
    loadSource("lib/profile/badges-server.ts", {
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(db) },
      "@/lib/courses/chapters": { chapters: chapterDefinitions },
    });

  await test("Badge stats and sync: placement skips excluded, only new keys inserted", async () => {
    const db = badgeDb();
    const server = loadBadgesServer(db);
    const stats = await server.computeBadgeStats("user");
    assert.equal(stats.missionsCompleted, 10, "the placement-skipped course is not a played mission");
    assert.deepEqual(stats.chaptersCompleted, [1]);
    assert.equal(stats.examsPassed, 1);
    assert.equal(stats.gamesPlayed, 11);
    assert.deepEqual(stats.gamesPlayedBySlug["grammar-rush"], 10);
    assert.equal(stats.perfectQuizzes, 1);
    assert.equal(stats.placementTaken, true);
    const result = await server.syncBadges("user");
    const newKeys = result.newlyEarned.map((badge) => badge.key);
    assert.ok(!newKeys.includes("mission_1"), "already owned badges are not new");
    for (const key of ["missions_5", "chapter_1", "exam_1", "games_10", "game_grammar_rush", "streak_3", "perfect_quiz", "placement"]) {
      assert.ok(newKeys.includes(key), `${key} newly earned`);
    }
    assert.equal(result.all.length, 1 + newKeys.length);
    assert.equal(db.user_badges.filter((row) => row.badge_key === "missions_5").length, 1);
    const again = await server.syncBadges("user");
    assert.deepEqual(again.newlyEarned, [], "a second sync earns nothing new");
  });

  await test("Simultaneous badge syncs celebrate each badge once", async () => {
    const db = badgeDb();
    db.user_badges = [];
    const server = loadBadgesServer(db);
    const [first, second] = await Promise.all([server.syncBadges("user"), server.syncBadges("user")]);
    const announced = [...first.newlyEarned, ...second.newlyEarned].map((badge) => badge.key);
    assert.equal(new Set(announced).size, announced.length, "no badge announced twice");
    assert.equal(new Set(db.user_badges.map((row) => row.badge_key)).size, db.user_badges.length, "no duplicate row");
  });

  await test("A badge failure never breaks a score submission", async () => {
    const db = badgeDb();
    db.fail = (query) => (query.table === "user_badges" ? { code: "42501", message: "permission denied" } : null);
    const server = loadBadgesServer(db);
    const originalError = console.error;
    console.error = () => {};
    try {
      assert.deepEqual(await server.syncBadgesSafely("user"), []);
      const page = await server.loadBadgesWithSync("user");
      assert.deepEqual(page.newlyEarned, []);
      assert.deepEqual(page.all, []);
      // Table absente (migration pas encore passée) : lecture vide, sans exception.
      delete db.user_badges;
      db.fail = null;
      assert.deepEqual(await server.getUserBadges("user"), []);
      assert.deepEqual(await server.syncBadgesSafely("user"), []);
    } finally {
      console.error = originalError;
    }
  });

  await test("Targeted practice: open course only, coherent numbers, star once", async () => {
    const calls = [];
    let best = 3;
    const db = {
      rpc: async (name, params) => {
        calls.push({ name, params });
        const previousBest = best;
        best = Math.max(best, params.p_focus_correct);
        return { data: { previousBest, best }, error: null };
      },
    };
    const entries = [
      { courseId: 4, status: "completed" },
      { courseId: 5, status: "in_progress" },
      { courseId: 6, status: "locked" },
    ];
    const practice = loadSource("lib/courses/practice-server.ts", {
      "@/lib/supabase/admin": { createSupabaseAdminClient: () => clientFor(db) },
      "@/lib/courses/progress": { getUserCourseRoadmap: async () => ({ entries }) },
    });
    assert.equal(await practice.recordGrammarRushPractice("user", { focusCourseId: 6, focusCorrect: 5, correct: 15, attempts: 15 }), null, "locked course");
    assert.equal(await practice.recordGrammarRushPractice("user", { focusCourseId: 99, focusCorrect: 5, correct: 15, attempts: 15 }), null, "unknown course");
    assert.equal(await practice.recordGrammarRushPractice("user", { focusCourseId: 5, focusCorrect: 9, correct: 8, attempts: 30 }), null, "more than correct");
    assert.equal(await practice.recordGrammarRushPractice("user", { focusCourseId: "5; drop", focusCorrect: 5, correct: 15, attempts: 15 }), null);
    assert.equal(calls.length, 0, "invalid results never reach the database");
    const first = await practice.recordGrammarRushPractice("user", { focusCourseId: 5, focusCorrect: 5, correct: 15, attempts: 15 });
    assert.deepEqual(first, { courseId: 5, focusCorrect: 5, best: 5, target: 5, starReached: true, newlyEarned: true });
    assert.deepEqual(calls[0], { name: "record_course_practice", params: { p_user_id: "user", p_course_id: 5, p_focus_correct: 5 } });
    const second = await practice.recordGrammarRushPractice("user", { focusCourseId: 4, focusCorrect: 6, correct: 18, attempts: 20 });
    assert.equal(second.starReached, true);
    assert.equal(second.newlyEarned, false, "the star is celebrated once");
    const short = await practice.recordGrammarRushPractice("user", { focusCourseId: 4, focusCorrect: 2, correct: 10, attempts: 12 });
    assert.equal(short.starReached, false);
    assert.equal(short.best, 6, "the best result is kept");
  });

  await test("New accounts receive the welcome gold everywhere a profile is created", () => {
    assert.equal(economy.WELCOME_GOLD, 30);
    for (const file of ["app/(public)/auth/actions.ts", "app/(protected)/layout.tsx"]) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(!/gold:\s*0\b/.test(source), `${file}: no profile created with 0 gold`);
      assert.ok(/gold:\s*WELCOME_GOLD/.test(source), `${file}: uses WELCOME_GOLD`);
    }
  });

  await test("Reward migrations follow the security conventions", () => {
    const read = (name) => fs.readFileSync(path.join(root, "supabase/migrations", name), "utf8");
    const xp = read("2026-10-16_10_xp_events.sql");
    const badgesSql = read("2026-10-16_11_badges.sql");
    const shop = read("2026-10-16_12_starter_shop.sql");
    const practiceSql = read("2026-10-16_13_course_practice.sql");
    for (const [name, sql] of [["xp", xp], ["badges", badgesSql], ["practice", practiceSql]]) {
      assert.match(sql, /enable row level security/, `${name}: RLS`);
      assert.match(sql, /revoke all on table public\.\w+ from public, anon/, `${name}: no anonymous access`);
    }
    for (const sql of [xp, practiceSql]) {
      const functions = sql.match(/create or replace function[\s\S]*?\$\$;/g) ?? [];
      assert.ok(functions.length > 0);
      for (const fn of functions) assert.match(fn, /set search_path = ''/, "functions pin search_path");
      assert.match(sql, /revoke all on function [\s\S]*? from public, anon, authenticated;/);
    }
    assert.match(xp, /security definer/);
    assert.match(xp, /after update of xp on public\.profiles/);
    assert.match(xp, /new\.xp, 0\) - coalesce\(old\.xp, 0\)/);
    assert.match(xp, /exception when others/, "an XP history failure never cancels a reward");
    assert.match(xp, /on public\.xp_events \(created_at, user_id\)/);
    assert.match(badgesSql, /primary key \(user_id, badge_key\)/);
    assert.match(badgesSql, /for select/);
    assert.ok(!/for (insert|update|delete|all)/.test(badgesSql), "no client write policy on badges");
    assert.ok(!/\b(delete|drop|truncate)\b/i.test(shop), "the starter shop migration never deletes");
    for (const key of ["title_apprentice", "title_explorer", "title_grammarian", "title_polyglot"]) assert.ok(shop.includes(`'${key}'`), key);
    assert.match(shop, /set required_level = 1, updated_at = now\(\)\s*where item_key = 'title_student'/);
    assert.match(shop, /set required_level = 1, price_gold = 20, updated_at = now\(\)\s*where item_key in \('bg_forest', 'bg_ocean'\)/);
    assert.match(shop, /set required_level = 2, price_gold = 40, updated_at = now\(\)\s*where item_key in \('avatar_warrior', 'avatar_mage'\)/);
    assert.match(shop, /on conflict \(item_key\) do nothing/);
  });

  await test("Reward interface copy has no en or em dashes", () => {
    const files = [
      "components/rewards/reward-celebrations.tsx",
      "components/rewards/welcome-gold-notice.tsx",
      "components/rewards/weekly-league.tsx",
      "components/rewards/badges-section.tsx",
      "components/rewards/mission-stars.tsx",
      "components/home/home-view.tsx",
      "components/play/game-screens.tsx",
      "lib/profile/league.ts",
      "lib/courses/stars.ts",
      "app/(protected)/leaderboard/page.tsx",
    ];
    for (const file of files) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(!/[–—]/.test(source), `${file}: no en or em dash`);
    }
  });

  console.log(`${cases} reward regression cases passed; Supabase clients mocked.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
