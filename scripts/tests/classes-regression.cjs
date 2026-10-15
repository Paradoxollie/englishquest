// Run with: node scripts/tests/classes-regression.cjs
// Espace classe : règles pures (codes, dates, statuts, tri, limite d'essais),
// retour après connexion, puis les vraies actions serveur et lectures sur une
// base factice en mémoire. Aucun réseau, aucun compte touché.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const crypto = require("node:crypto");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");

function compile(filename) {
  return ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
}

/** Charge un module TypeScript ; `resolve` fournit chaque import (vrai module ou doublure). */
function loadTs(relativePath, resolve) {
  const filename = path.join(root, relativePath);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.require = (name) => resolve(name, relativePath);
  mod._compile(compile(filename), filename);
  return mod.exports;
}

function pureResolver(name) {
  throw new Error(`Unexpected import ${name}`);
}

const classes = loadTs("lib/classes/classes.ts", pureResolver);
const safeNext = loadTs("lib/navigation/safe-next.ts", pureResolver);

let cases = 0;
async function test(name, run) {
  await run();
  cases += 1;
  console.log(`PASS ${name}`);
}

function bytesFrom(values) {
  let index = 0;
  return (length) => {
    const out = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) out[i] = values[index++ % values.length];
    return out;
  };
}

/* ------------------------------------------------------------------ base factice */

const UNIQUE_KEYS = {
  classes: [["code"], ["id"]],
  class_members: [["class_id", "user_id"]],
  class_assignments: [["id"]],
  class_join_attempts: [["id"]],
};

function createFakeDb(seed = {}) {
  const tables = {};
  for (const [name, rows] of Object.entries(seed)) tables[name] = rows.map((row) => ({ ...row }));
  const db = { tables, failNextInsert: null };

  function withDefaults(table, row) {
    const now = new Date().toISOString();
    const base = { ...row };
    if (["classes", "class_assignments", "class_join_attempts"].includes(table) && !base.id) base.id = crypto.randomUUID();
    if (["classes", "class_assignments", "class_join_attempts"].includes(table) && !base.created_at) base.created_at = now;
    if (table === "classes" && base.archived_at === undefined) base.archived_at = null;
    if (table === "class_members" && !base.joined_at) base.joined_at = now;
    return base;
  }

  function violatesUnique(table, row) {
    const rows = tables[table] ?? [];
    return (UNIQUE_KEYS[table] ?? []).some((keys) => rows.some((other) => keys.every((key) => other[key] === row[key])));
  }

  function execute(state) {
    const rows = (tables[state.table] ??= []);
    const matches = rows.filter((row) => state.filters.every((filter) => filter(row)));
    const finish = (data) => {
      if (state.single === "maybe") return { data: data[0] ?? null, error: null };
      if (state.single === "one") {
        return data.length === 1 ? { data: data[0], error: null } : { data: null, error: { code: "PGRST116", message: "not one row" } };
      }
      return { data, error: null };
    };

    if (state.op === "select") {
      if (state.head) return { data: null, count: matches.length, error: null };
      let data = matches.map((row) => ({ ...row }));
      if (state.range) data = data.slice(state.range[0], state.range[1] + 1);
      if (state.limit !== null) data = data.slice(0, state.limit);
      return finish(data);
    }

    if (state.op === "insert" || state.op === "upsert") {
      if (state.op === "insert" && db.failNextInsert) {
        const error = db.failNextInsert;
        db.failNextInsert = null;
        return { data: null, error };
      }
      const payload = (Array.isArray(state.payload) ? state.payload : [state.payload]).map((row) => withDefaults(state.table, row));
      const inserted = [];
      for (const row of payload) {
        if (violatesUnique(state.table, row)) {
          if (state.op === "upsert" && state.options?.ignoreDuplicates) continue;
          return { data: null, error: { code: "23505", message: "duplicate key" } };
        }
        rows.push(row);
        inserted.push({ ...row });
      }
      return state.returning ? finish(inserted) : { data: null, error: null };
    }

    if (state.op === "update") {
      if (state.table === "classes" && state.payload.code && rows.some((row) => row.code === state.payload.code && !matches.includes(row))) {
        return { data: null, error: { code: "23505", message: "duplicate key" } };
      }
      for (const row of matches) Object.assign(row, state.payload);
      return state.returning ? finish(matches.map((row) => ({ ...row }))) : { data: null, error: null };
    }

    if (state.op === "delete") {
      tables[state.table] = rows.filter((row) => !matches.includes(row));
      return state.returning ? finish(matches.map((row) => ({ ...row }))) : { data: null, error: null };
    }

    throw new Error(`Unsupported operation ${state.op}`);
  }

  function from(table) {
    const state = { table, op: "select", filters: [], head: false, single: null, limit: null, range: null, returning: false };
    const api = {
      select(_columns, options) {
        if (state.op === "select") state.head = Boolean(options?.head);
        else state.returning = true;
        return api;
      },
      insert(payload) {
        state.op = "insert";
        state.payload = payload;
        return api;
      },
      upsert(payload, options) {
        state.op = "upsert";
        state.payload = payload;
        state.options = options;
        return api;
      },
      update(payload) {
        state.op = "update";
        state.payload = payload;
        return api;
      },
      delete() {
        state.op = "delete";
        return api;
      },
      eq(column, value) {
        state.filters.push((row) => row[column] === value);
        return api;
      },
      neq(column, value) {
        state.filters.push((row) => row[column] !== value);
        return api;
      },
      in(column, values) {
        state.filters.push((row) => values.includes(row[column]));
        return api;
      },
      is(column, value) {
        state.filters.push((row) => (row[column] ?? null) === value);
        return api;
      },
      gte(column, value) {
        state.filters.push((row) => row[column] >= value);
        return api;
      },
      lt(column, value) {
        state.filters.push((row) => row[column] < value);
        return api;
      },
      order() {
        return api;
      },
      limit(count) {
        state.limit = count;
        return api;
      },
      range(fromIndex, toIndex) {
        state.range = [fromIndex, toIndex];
        return api;
      },
      maybeSingle() {
        state.single = "maybe";
        return api;
      },
      single() {
        state.single = "one";
        return api;
      },
      then(resolve, reject) {
        return Promise.resolve().then(() => execute(state)).then(resolve, reject);
      },
    };
    return api;
  }

  db.client = { from };
  return db;
}

/* ------------------------------------------------------------------ chargement des vraies actions */

function loadServer(db, session) {
  const revalidated = [];
  const realModules = new Map();
  const mocks = {
    "server-only": {},
    react: { cache: (fn) => fn },
    "next/cache": {
      unstable_cache: (fn) => fn,
      revalidatePath: (pathName) => revalidated.push(pathName),
    },
    "@/lib/supabase/admin": { createSupabaseAdminClient: () => db.client },
    "@/lib/supabase/server": {
      createSupabaseServerClient: async () => ({
        auth: { getUser: async () => ({ data: { user: session.userId ? { id: session.userId } : null } }) },
      }),
    },
    "@/lib/courses/cache": { COURSE_CATALOG_TAG: "course-catalog" },
    "@/lib/courses/campaign": {},
    "@/lib/courses/mission-progress": {},
    "@/lib/courses/progress": {},
  };
  const files = {
    "./classes": "lib/classes/classes.ts",
    "./classes-data": "lib/classes/classes-data.ts",
    "@/lib/courses/data": "lib/courses/data.ts",
    "@/lib/courses/chapters": "lib/courses/chapters.ts",
    "@/lib/courses/mission-state": "lib/courses/mission-state.ts",
    "./quiz-score": "lib/courses/quiz-score.ts",
  };
  function resolve(name) {
    if (name in mocks) return mocks[name];
    const file = files[name];
    if (!file) throw new Error(`Unexpected import ${name}`);
    if (!realModules.has(file)) realModules.set(file, loadTs(file, resolve));
    return realModules.get(file);
  }
  const actions = loadTs("lib/classes/classes-server.ts", resolve);
  const data = resolve("./classes-data");
  return { actions, data, revalidated };
}

const TEACHER = "11111111-1111-4111-8111-111111111111";
const OTHER_TEACHER = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
const PUPIL = "44444444-4444-4444-8444-444444444444";
const PUPIL_2 = "55555555-5555-4555-8555-555555555555";
const CLASS_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const CLASS_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function courseUuid(number) {
  return `c0000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
}

function telemetry(score, total, read = true) {
  return 9_000_000 + (read ? 1_000_000 : 0) + total * 1_000 + score;
}

function baseSeed() {
  return {
    profiles: [
      { id: TEACHER, role: "teacher", username: "m_marienne", xp: 0, email: "prof@example.invalid" },
      { id: OTHER_TEACHER, role: "teacher", username: "mme_autre", xp: 0 },
      { id: ADMIN, role: "admin", username: "admin", xp: 0 },
      { id: PUPIL, role: "student", username: "renardgris", xp: 420, last_game_date: "2026-10-10", email: "eleve@example.invalid" },
      { id: PUPIL_2, role: "student", username: "élodie_b", xp: 90, last_game_date: null },
    ],
    courses: Array.from({ length: 50 }, (_, index) => ({ id: courseUuid(index + 1), course_number: index + 1 })),
    classes: [
      { id: CLASS_A, teacher_id: TEACHER, name: "4e B", code: "KM47RT", created_at: "2026-09-01T08:00:00.000Z", archived_at: null },
      { id: CLASS_B, teacher_id: OTHER_TEACHER, name: "3e A", code: "PQ29XZ", created_at: "2026-09-01T08:00:00.000Z", archived_at: null },
    ],
    class_members: [],
    class_assignments: [],
    class_join_attempts: [],
    user_course_progress: [],
  };
}

function inDays(days) {
  return classes.addDaysToDateString(classes.parisDateString(), days);
}

(async () => {
  /* ---------------------------------------------------------------- codes */

  await test("Class codes use six unambiguous characters", async () => {
    assert.equal(classes.CLASS_CODE_ALPHABET.length, 31);
    for (const forbidden of ["O", "0", "I", "1", "L"]) assert.ok(!classes.CLASS_CODE_ALPHABET.includes(forbidden), forbidden);
    const seen = new Set();
    for (let index = 0; index < 4000; index += 1) {
      const code = classes.generateClassCode();
      assert.match(code, /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
      for (const character of code) seen.add(character);
    }
    assert.equal(seen.size, 31, "every character of the alphabet is reachable");
  });

  await test("Code generation rejects biased bytes and stays deterministic for a fixed source", async () => {
    // 248 et plus sont rejetés (256 % 31 = 8) ; 31 donne de nouveau « A ».
    const code = classes.generateClassCode(bytesFrom([255, 248, 0, 1, 31, 30, 62, 9, 250]));
    // 0 → A, 1 → B, 31 → A, 30 → 9, 62 → A, 9 → K.
    assert.equal(code, "ABA9AK");
    assert.throws(() => classes.generateClassCode(bytesFrom([255])), /usable bytes/);
  });

  await test("Typed codes are normalised before validation", async () => {
    assert.equal(classes.normalizeClassCode(" km4 7rt "), "KM47RT");
    assert.equal(classes.normalizeClassCode("KM4-7RT"), "KM47RT");
    assert.equal(classes.normalizeClassCode("km4.7rt"), "KM47RT");
    assert.equal(classes.normalizeClassCode(42), "");
    assert.ok(classes.isValidClassCode("KM47RT"));
    for (const bad of ["KM47R", "KM47RTX", "KM47R0", "KMI7RT", "km47rt", "KM 7RT"]) {
      assert.equal(classes.isValidClassCode(bad), false, bad);
    }
    assert.equal(classes.formatClassCode("KM47RT"), "KM4 7RT");
  });

  /* ---------------------------------------------------------------- validation */

  await test("Class names are trimmed, cleaned and limited to 60 characters", async () => {
    assert.deepEqual(classes.validateClassName("  4e   B "), { ok: true, value: "4e B" });
    assert.deepEqual(classes.validateClassName("4e\nB" + String.fromCharCode(0x200b)), { ok: true, value: "4e B" });
    assert.equal(classes.validateClassName("   ").ok, false);
    assert.equal(classes.validateClassName(null).ok, false);
    assert.equal(classes.validateClassName("é".repeat(60)).ok, true);
    assert.equal(classes.validateClassName("x".repeat(61)).ok, false);
  });

  await test("Assignment notes, course ids and due dates are validated", async () => {
    assert.deepEqual(classes.validateAssignmentNote("  "), { ok: true, value: null });
    assert.equal(classes.validateAssignmentNote("a".repeat(200)).ok, true);
    assert.equal(classes.validateAssignmentNote("a".repeat(201)).ok, false);
    assert.deepEqual(classes.validateCourseId("12"), { ok: true, value: 12 });
    for (const bad of [0, 51, 1.5, "abc", null, undefined, "", NaN]) assert.equal(classes.validateCourseId(bad).ok, false, String(bad));

    const today = "2026-10-15";
    assert.deepEqual(classes.validateDueDate("", today), { ok: true, value: null });
    assert.deepEqual(classes.validateDueDate("2026-10-15", today), { ok: true, value: "2026-10-15" });
    assert.match(classes.validateDueDate("2026-10-14", today).error, /passée/);
    assert.match(classes.validateDueDate("2026-02-30", today).error, /pas valide/);
    assert.match(classes.validateDueDate("15/10/2026", today).error, /pas valide/);
    assert.equal(classes.validateDueDate("2027-10-16", today).ok, true);
    assert.match(classes.validateDueDate("2027-10-17", today).error, /plus d'un an/);
  });

  await test("Paris dates and day arithmetic cross midnight, months, years and leap days", async () => {
    assert.equal(classes.parisDateString(new Date("2026-10-15T22:30:00Z")), "2026-10-16");
    assert.equal(classes.parisDateString(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
    assert.equal(classes.parisDateString(new Date("2026-12-31T22:30:00Z")), "2026-12-31");
    assert.equal(classes.addDaysToDateString("2026-10-28", 7), "2026-11-04");
    assert.equal(classes.addDaysToDateString("2028-02-28", 1), "2028-02-29");
    assert.equal(classes.daysBetween("2026-12-30", "2027-01-02"), 3);
    assert.equal(classes.daysBetween("2026-10-15", "2026-10-10"), -5);
  });

  /* ---------------------------------------------------------------- statuts */

  await test("Homework status: done wins, due date is inclusive, late the day after", async () => {
    const today = "2026-10-15";
    assert.equal(classes.getAssignmentStatus({ completed: true, dueDate: "2026-10-01", today }), "fait");
    assert.equal(classes.getAssignmentStatus({ completed: false, dueDate: "2026-10-15", today }), "a_faire");
    assert.equal(classes.getAssignmentStatus({ completed: false, dueDate: "2026-10-14", today }), "en_retard");
    assert.equal(classes.getAssignmentStatus({ completed: false, dueDate: null, today }), "a_faire");
    assert.deepEqual(classes.ASSIGNMENT_STATUS_LABELS, { fait: "Fait", en_retard: "En retard", a_faire: "À faire" });
  });

  await test("Pending homework lists late work first, then nearest due date, undated last", async () => {
    const list = [
      { status: "a_faire", dueDate: null, courseId: 3 },
      { status: "a_faire", dueDate: "2026-10-20", courseId: 9 },
      { status: "en_retard", dueDate: "2026-10-10", courseId: 7 },
      { status: "a_faire", dueDate: "2026-10-16", courseId: 12 },
    ].sort(classes.compareHomework);
    assert.deepEqual(list.map((item) => item.courseId), [7, 12, 9, 3]);
  });

  await test("Labels for activity and due dates", async () => {
    const today = "2026-10-15";
    assert.equal(classes.formatLastActivity(null, today), "Jamais");
    assert.equal(classes.formatLastActivity("2026-10-15", today), "Aujourd'hui");
    assert.equal(classes.formatLastActivity("2026-10-14", today), "Hier");
    assert.equal(classes.formatLastActivity("2026-10-11", today), "Il y a 4 jours");
    assert.equal(classes.formatLastActivity("2026-09-03", today), "3 sept.");
    assert.equal(classes.formatDueDate(null, today), "Sans date limite");
    assert.equal(classes.formatDueDate("2026-10-15", today), "Pour aujourd'hui");
    assert.equal(classes.formatDueDate("2026-10-16", today), "Pour demain");
    assert.equal(classes.formatDueDate("2026-11-02", today), "Pour le 2 nov.");
    assert.equal(classes.formatDueDate("2026-10-12", today), "Prévu pour le 12 oct.");
    assert.equal(classes.formatShortDate("2026-08-01", true), "1 août 2026");
  });

  /* ---------------------------------------------------------------- limite d'essais */

  await test("Ten wrong codes in a sliding hour block joining until the window frees a slot", async () => {
    const now = new Date("2026-10-15T10:00:00Z");
    const minutesAgo = (minutes) => new Date(now.getTime() - minutes * 60_000).toISOString();
    assert.deepEqual(classes.evaluateJoinAttempts([], now), { blocked: false, remaining: 10 });
    const nine = Array.from({ length: 9 }, (_, index) => minutesAgo(index + 1));
    assert.deepEqual(classes.evaluateJoinAttempts(nine, now), { blocked: false, remaining: 1 });
    const ten = [...nine, minutesAgo(50)];
    assert.deepEqual(classes.evaluateJoinAttempts(ten, now), { blocked: true, retryInMinutes: 10 });
    // Les échecs de plus d'une heure ne comptent plus.
    const stale = [...nine, minutesAgo(61), minutesAgo(90)];
    assert.equal(classes.evaluateJoinAttempts(stale, now).blocked, false);
    // Douze échecs : il faut attendre que le troisième plus ancien sorte de l'heure.
    const twelve = [minutesAgo(59), minutesAgo(58), minutesAgo(40), ...Array.from({ length: 9 }, (_, index) => minutesAgo(index + 1))];
    assert.deepEqual(classes.evaluateJoinAttempts(twelve, now), { blocked: true, retryInMinutes: 20 });
  });

  /* ---------------------------------------------------------------- suivi */

  await test("Struggling notions rank attempted courses by lowest average best score", async () => {
    const ranked = classes.rankStrugglingCourses([
      { courseId: 5, accuracy: 40 },
      { courseId: 5, accuracy: 60 },
      { courseId: 2, accuracy: 50 },
      { courseId: 9, accuracy: 100 },
      { courseId: 3, accuracy: 30 },
      { courseId: 7, accuracy: 120 },
    ]);
    assert.deepEqual(ranked, [
      { courseId: 3, average: 30, attempts: 1 },
      { courseId: 5, average: 50, attempts: 2 },
      { courseId: 2, average: 50, attempts: 1 },
      { courseId: 7, average: 100, attempts: 1 },
      { courseId: 9, average: 100, attempts: 1 },
    ]);
    assert.equal(classes.rankStrugglingCourses([{ courseId: 1, accuracy: 10 }, { courseId: 2, accuracy: 20 }], 1).length, 1);
    assert.deepEqual(classes.rankStrugglingCourses([]), []);
    assert.equal(classes.averageOf([]), null);
    assert.equal(classes.averageOf([70, 81]), 76);
  });

  await test("Pupil table sorts by any column and keeps missing values at the bottom", async () => {
    const row = (username, extra) => ({
      userId: username,
      username,
      completedCount: 0,
      currentCourseId: null,
      currentCourseLabel: null,
      lastActivity: null,
      xp: 0,
      quizAverage: null,
      quizCount: 0,
      ...extra,
    });
    const rows = [
      row("zoe", { xp: 300, quizAverage: 90, lastActivity: "2026-10-01" }),
      row("Élodie", { xp: 300, quizAverage: null }),
      row("adam", { xp: 50, quizAverage: 40, lastActivity: "2026-10-14" }),
    ];
    const names = (list) => list.map((item) => item.username);
    assert.deepEqual(names(classes.sortPupilRows(rows, "username", "asc")), ["adam", "Élodie", "zoe"]);
    assert.deepEqual(names(classes.sortPupilRows(rows, "username", "desc")), ["zoe", "Élodie", "adam"]);
    assert.deepEqual(names(classes.sortPupilRows(rows, "xp", "desc")), ["Élodie", "zoe", "adam"]);
    assert.deepEqual(names(classes.sortPupilRows(rows, "quizAverage", "desc")), ["zoe", "adam", "Élodie"]);
    assert.deepEqual(names(classes.sortPupilRows(rows, "quizAverage", "asc")), ["adam", "zoe", "Élodie"]);
    assert.deepEqual(names(classes.sortPupilRows(rows, "lastActivity", "desc")), ["adam", "zoe", "Élodie"]);
    assert.equal(classes.defaultSortDirection("username"), "asc");
    assert.equal(classes.defaultSortDirection("xp"), "desc");
    assert.deepEqual(names(rows), ["zoe", "Élodie", "adam"], "sorting never mutates the input");
  });

  /* ---------------------------------------------------------------- retour après connexion */

  await test("Return paths after login stay on the site", async () => {
    assert.equal(safeNext.getSafeNextPath("/rejoindre?code=KM47RT"), "/rejoindre?code=KM47RT");
    assert.equal(safeNext.getSafeNextPath("/teachers"), "/teachers");
    for (const bad of [
      "//evil.example",
      "https://evil.example/x",
      "/\\evil.example",
      "rejoindre",
      "/auth/login",
      "/rejoindre\n?code=1",
      "",
      null,
      "/" + "a".repeat(400),
    ]) {
      assert.equal(safeNext.getSafeNextPath(bad), null, String(bad));
    }
    assert.equal(safeNext.withNextParam("/auth/signup", "/rejoindre?code=KM47RT"), "/auth/signup?next=%2Frejoindre%3Fcode%3DKM47RT");
    assert.equal(safeNext.withNextParam("/auth/signup", null), "/auth/signup");
  });

  /* ---------------------------------------------------------------- actions serveur */

  await test("Only teacher and admin accounts create classes, with a fresh valid code", async () => {
    const db = createFakeDb(baseSeed());
    const session = { userId: PUPIL };
    const { actions } = loadServer(db, session);
    const refused = await actions.createClass("6e A");
    assert.equal(refused.ok, false);
    assert.match(refused.error, /réservé aux comptes professeur/);

    session.userId = null;
    assert.match((await actions.createClass("6e A")).error, /session a expiré/);

    session.userId = TEACHER;
    assert.match((await actions.createClass("   ")).error, /Donnez un nom/);
    // Une collision de code (très rare) est réessayée avec un autre code.
    db.failNextInsert = { code: "23505", message: "duplicate key value violates unique constraint" };
    const created = await actions.createClass("  6e   A ");
    assert.equal(created.ok, true, created.error);
    const row = db.tables.classes.find((item) => item.id === created.data.id);
    assert.equal(row.name, "6e A");
    assert.equal(row.teacher_id, TEACHER);
    assert.ok(classes.isValidClassCode(row.code));
  });

  await test("Teachers manage only their own classes; admins manage all", async () => {
    const db = createFakeDb(baseSeed());
    const session = { userId: OTHER_TEACHER };
    const { actions } = loadServer(db, session);
    assert.match((await actions.renameClass(CLASS_A, "Piratée")).error, /introuvable/);
    assert.match((await actions.archiveClass(CLASS_A)).error, /introuvable/);
    assert.match((await actions.regenerateCode(CLASS_A)).error, /introuvable/);
    assert.match((await actions.renameClass("not-a-uuid", "X")).error, /introuvable/);
    assert.equal(db.tables.classes.find((item) => item.id === CLASS_A).name, "4e B");

    session.userId = ADMIN;
    assert.equal((await actions.renameClass(CLASS_A, "4e B anglais")).ok, true);
    session.userId = TEACHER;
    const regenerated = await actions.regenerateCode(CLASS_A);
    assert.equal(regenerated.ok, true);
    assert.notEqual(regenerated.data.code, "KM47RT");
    assert.equal(db.tables.classes.find((item) => item.id === CLASS_A).code, regenerated.data.code);
    assert.equal((await actions.archiveClass(CLASS_A)).ok, true);
    assert.ok(db.tables.classes.find((item) => item.id === CLASS_A).archived_at);
    assert.equal((await actions.restoreClass(CLASS_A)).ok, true);
    assert.equal(db.tables.classes.find((item) => item.id === CLASS_A).archived_at, null);
  });

  await test("Joining: format errors are free, wrong codes are counted, ten per hour at most", async () => {
    const db = createFakeDb(baseSeed());
    const session = { userId: PUPIL };
    const { actions } = loadServer(db, session);

    assert.match((await actions.joinClass("KM4")).error, /six caractères/);
    assert.equal(db.tables.class_join_attempts.length, 0, "malformed input is not an attempt");

    const wrong = await actions.joinClass("ZZZ222");
    assert.match(wrong.error, /aucune classe/);
    assert.equal(db.tables.class_join_attempts.length, 1);

    // Neuf autres échecs récents : le dixième bloque, même avec le bon code.
    const recent = new Date(Date.now() - 5 * 60_000).toISOString();
    for (let index = 0; index < 9; index += 1) db.tables.class_join_attempts.push({ id: `x${index}`, user_id: PUPIL, created_at: recent });
    const blocked = await actions.joinClass("km4 7rt");
    assert.match(blocked.error, /Trop de codes erronés/);
    assert.equal(db.tables.class_members.length, 0);

    // Un autre élève n'est pas concerné.
    session.userId = PUPIL_2;
    const joined = await actions.joinClass("km4-7rt");
    assert.equal(joined.ok, true, joined.error);
    assert.equal(joined.data.className, "4e B");
    assert.deepEqual(db.tables.class_members.map((row) => [row.class_id, row.user_id]), [[CLASS_A, PUPIL_2]]);
    const again = await actions.joinClass("KM47RT");
    assert.match(again.message, /déjà dans la classe/);
    assert.equal(db.tables.class_members.length, 1);
  });

  await test("Joining refuses archived classes, the class's own teacher and a sixth class", async () => {
    const seed = baseSeed();
    seed.classes.push({ id: crypto.randomUUID(), teacher_id: TEACHER, name: "Vieille classe", code: "ARCH22", archived_at: "2026-06-30T00:00:00.000Z" });
    const extra = Array.from({ length: 5 }, (_, index) => ({
      id: crypto.randomUUID(),
      teacher_id: OTHER_TEACHER,
      name: `Groupe ${index}`,
      code: `GRP${["A", "B", "C", "D", "E"][index]}22`,
      archived_at: null,
    }));
    seed.classes.push(...extra);
    const db = createFakeDb(seed);
    const session = { userId: PUPIL };
    const { actions } = loadServer(db, session);

    assert.match((await actions.joinClass("ARCH22")).error, /aucune classe/);
    assert.equal(db.tables.class_join_attempts.length, 1, "an archived code counts as a wrong code");

    session.userId = TEACHER;
    assert.match((await actions.joinClass("KM47RT")).error, /C'est votre classe/);

    session.userId = PUPIL;
    for (const group of extra) assert.equal((await actions.joinClass(group.code)).ok, true);
    const sixth = await actions.joinClass("KM47RT");
    assert.match(sixth.error, /déjà dans 5 classes/);

    // Une classe archivée ne compte plus dans la limite.
    db.tables.classes.find((item) => item.id === extra[0].id).archived_at = new Date().toISOString();
    assert.equal((await actions.joinClass("KM47RT")).ok, true);
  });

  await test("Pupils leave only their own membership; teachers remove pupils only from their classes", async () => {
    const seed = baseSeed();
    seed.class_members.push(
      { class_id: CLASS_A, user_id: PUPIL, joined_at: "2026-09-02T08:00:00.000Z" },
      { class_id: CLASS_A, user_id: PUPIL_2, joined_at: "2026-09-02T08:00:00.000Z" }
    );
    const db = createFakeDb(seed);
    const session = { userId: OTHER_TEACHER };
    const { actions } = loadServer(db, session);
    assert.match((await actions.removePupil(CLASS_A, PUPIL)).error, /introuvable/);
    assert.equal(db.tables.class_members.length, 2);

    session.userId = TEACHER;
    assert.equal((await actions.removePupil(CLASS_A, PUPIL)).ok, true);
    assert.match((await actions.removePupil(CLASS_A, PUPIL)).error, /n'est plus/);

    session.userId = PUPIL_2;
    assert.match((await actions.leaveClass(CLASS_B)).error, /plus dans cette classe/);
    assert.equal((await actions.leaveClass(CLASS_A)).ok, true);
    assert.equal(db.tables.class_members.length, 0);
  });

  await test("Assigning a mission validates input and opens the locked mission for class members only", async () => {
    const seed = baseSeed();
    seed.class_members.push({ class_id: CLASS_A, user_id: PUPIL, joined_at: "2026-09-02T08:00:00.000Z" });
    seed.user_course_progress.push(
      { id: "p1", user_id: PUPIL, course_id: courseUuid(20), status: "locked", best_score: 0 },
      { id: "p2", user_id: PUPIL_2, course_id: courseUuid(20), status: "locked", best_score: 0 },
      { id: "p3", user_id: PUPIL, course_id: courseUuid(4), status: "completed", best_score: 0 }
    );
    const db = createFakeDb(seed);
    const session = { userId: TEACHER };
    const { actions } = loadServer(db, session);

    assert.match((await actions.assignMission(CLASS_A, 51, "", "")).error, /Choisissez une mission/);
    assert.match((await actions.assignMission(CLASS_A, 20, inDays(-1), "")).error, /déjà passée/);
    assert.match((await actions.assignMission(CLASS_A, 20, "", "x".repeat(201))).error, /200 caractères/);

    session.userId = OTHER_TEACHER;
    assert.match((await actions.assignMission(CLASS_A, 20, "", "")).error, /introuvable/);

    session.userId = TEACHER;
    const assigned = await actions.assignMission(CLASS_A, 20, inDays(7), "  Quiz à 80 %  ");
    assert.equal(assigned.ok, true, assigned.error);
    assert.equal(db.tables.class_assignments.length, 1);
    assert.equal(db.tables.class_assignments[0].note, "Quiz à 80 %");
    assert.equal(db.tables.user_course_progress.find((row) => row.id === "p1").status, "unlocked");
    assert.equal(db.tables.user_course_progress.find((row) => row.id === "p2").status, "locked", "non-members untouched");
    assert.equal(db.tables.user_course_progress.find((row) => row.id === "p3").status, "completed", "never re-locks or downgrades");

    assert.match((await actions.assignMission(CLASS_A, 20, "", "")).error, /déjà en devoir/);

    // Un élève qui arrive ensuite voit aussi la mission s'ouvrir.
    db.tables.user_course_progress.find((row) => row.id === "p2").status = "locked";
    session.userId = PUPIL_2;
    assert.equal((await actions.joinClass("KM47RT")).ok, true);
    assert.equal(db.tables.user_course_progress.find((row) => row.id === "p2").status, "unlocked");

    session.userId = OTHER_TEACHER;
    assert.match((await actions.deleteAssignment(db.tables.class_assignments[0].id)).error, /introuvable/);
    session.userId = TEACHER;
    assert.equal((await actions.archiveClass(CLASS_A)).ok, true);
    assert.match((await actions.assignMission(CLASS_A, 21, "", "")).error, /archivée/);
    assert.equal((await actions.deleteAssignment(db.tables.class_assignments[0].id)).ok, true);
    assert.equal(db.tables.class_assignments.length, 0);
  });

  /* ---------------------------------------------------------------- lectures */

  await test("Teacher follow-up aggregates progress, homework statuses and struggling notions without e-mails", async () => {
    const seed = baseSeed();
    const yesterday = inDays(-1);
    seed.class_members.push(
      { class_id: CLASS_A, user_id: PUPIL, joined_at: "2026-09-02T08:00:00.000Z" },
      { class_id: CLASS_A, user_id: PUPIL_2, joined_at: "2026-09-03T08:00:00.000Z" }
    );
    seed.class_assignments.push(
      { id: "a1", class_id: CLASS_A, course_id: 1, due_date: yesterday, note: null, created_at: "2026-10-01T08:00:00.000Z" },
      { id: "a2", class_id: CLASS_A, course_id: 3, due_date: null, note: "Relire", created_at: "2026-10-02T08:00:00.000Z" }
    );
    seed.user_course_progress.push(
      { id: "p1", user_id: PUPIL, course_id: courseUuid(1), status: "completed", best_score: telemetry(9, 10), completed_at: "2026-10-12T10:00:00.000Z", updated_at: "2026-10-12T10:00:00.000Z" },
      { id: "p2", user_id: PUPIL, course_id: courseUuid(2), status: "completed", best_score: telemetry(8, 10), completed_at: "2026-10-13T10:00:00.000Z", updated_at: "2026-10-13T10:00:00.000Z" },
      { id: "p3", user_id: PUPIL, course_id: courseUuid(3), status: "in_progress", best_score: telemetry(5, 10), completed_at: null, updated_at: "2026-10-14T10:00:00.000Z" },
      // Ouverture automatique (devoir) : ce n'est pas une activité de l'élève.
      { id: "p4", user_id: PUPIL_2, course_id: courseUuid(20), status: "unlocked", best_score: 0, completed_at: null, updated_at: new Date().toISOString() },
      { id: "p5", user_id: PUPIL_2, course_id: courseUuid(1), status: "unlocked", best_score: telemetry(3, 10), completed_at: null, updated_at: "2026-10-05T10:00:00.000Z" }
    );
    const db = createFakeDb(seed);
    const { data } = loadServer(db, { userId: TEACHER });
    const teacher = { id: TEACHER, role: "teacher", username: "m_marienne" };

    assert.equal(await data.getTeacherClassDetail({ id: OTHER_TEACHER, role: "teacher", username: "x" }, CLASS_A), null);
    assert.equal(await data.getTeacherClassDetail({ id: PUPIL, role: "student", username: "x" }, CLASS_A), null);

    const detail = await data.getTeacherClassDetail(teacher, CLASS_A);
    assert.ok(detail);
    assert.ok(!JSON.stringify(detail).includes("@example.invalid"), "no e-mail reaches the teacher view");

    const fox = detail.pupils.find((pupil) => pupil.userId === PUPIL);
    assert.equal(fox.username, "renardgris");
    assert.equal(fox.completedCount, 2);
    assert.equal(fox.currentCourseId, 3);
    assert.match(fox.currentCourseLabel, /^Mission 3 · /);
    assert.equal(fox.quizAverage, 73);
    assert.equal(fox.quizCount, 3);
    assert.equal(fox.xp, 420);
    assert.equal(fox.lastActivity, classes.parisDateString(new Date("2026-10-14T10:00:00.000Z")));

    const elodie = detail.pupils.find((pupil) => pupil.userId === PUPIL_2);
    assert.equal(elodie.currentCourseId, 1);
    assert.equal(elodie.lastActivity, "2026-10-05", "automatic unlocks are not activity");

    const late = detail.assignments.find((assignment) => assignment.id === "a1");
    assert.deepEqual(late.counts, { fait: 1, en_retard: 1, a_faire: 0 });
    assert.deepEqual(
      late.pupils.map((pupil) => [pupil.username, pupil.status]),
      [["élodie_b", "en_retard"], ["renardgris", "fait"]]
    );
    const open = detail.assignments.find((assignment) => assignment.id === "a2");
    assert.deepEqual(open.counts, { fait: 0, en_retard: 0, a_faire: 2 });
    assert.deepEqual(detail.assignments.map((assignment) => assignment.id), ["a2", "a1"], "upcoming or undated before past due");

    assert.deepEqual(detail.struggling.map((course) => [course.courseId, course.average, course.attempts]), [
      [3, 50, 1],
      [1, 60, 2],
      [2, 80, 1],
    ]);

    const list = await data.getTeacherClasses(teacher);
    assert.deepEqual(list.map((item) => [item.name, item.pupilCount]), [["4e B", 2]]);
    const all = await data.getTeacherClasses({ id: ADMIN, role: "admin", username: "admin" });
    assert.equal(all.length, 2);
    assert.equal(all.find((item) => item.id === CLASS_B).teacherName, "mme_autre");
  });

  await test("Pupil overview hides archived classes and lists only pending homework, late first", async () => {
    const seed = baseSeed();
    const archivedId = crypto.randomUUID();
    seed.classes.push({ id: archivedId, teacher_id: TEACHER, name: "Ancienne", code: "QRDC22", archived_at: "2026-06-30T00:00:00.000Z" });
    seed.class_members.push(
      { class_id: CLASS_A, user_id: PUPIL, joined_at: "2026-09-02T08:00:00.000Z" },
      { class_id: archivedId, user_id: PUPIL, joined_at: "2026-01-02T08:00:00.000Z" }
    );
    seed.class_assignments.push(
      { id: "a1", class_id: CLASS_A, course_id: 2, due_date: inDays(3), note: null, created_at: "2026-10-01T08:00:00.000Z" },
      { id: "a2", class_id: CLASS_A, course_id: 5, due_date: inDays(-2), note: "Avant le contrôle", created_at: "2026-10-02T08:00:00.000Z" },
      { id: "a3", class_id: CLASS_A, course_id: 1, due_date: inDays(-5), note: null, created_at: "2026-10-03T08:00:00.000Z" },
      { id: "a4", class_id: archivedId, course_id: 9, due_date: null, note: null, created_at: "2026-03-03T08:00:00.000Z" }
    );
    seed.user_course_progress.push({ id: "p1", user_id: PUPIL, course_id: courseUuid(1), status: "completed", best_score: 0 });
    const db = createFakeDb(seed);
    const { data } = loadServer(db, { userId: PUPIL });

    const overview = await data.getPupilClassOverview(PUPIL);
    assert.deepEqual(overview.classes.map((item) => [item.name, item.teacherName]), [["4e B", "m_marienne"]]);
    assert.deepEqual(overview.pending.map((item) => [item.courseId, item.status]), [
      [5, "en_retard"],
      [2, "a_faire"],
    ]);
    assert.equal(overview.pending[0].note, "Avant le contrôle");

    const empty = await data.getPupilClassOverview(PUPIL_2);
    assert.deepEqual(empty, { classes: [], pending: [], today: classes.parisDateString() });
  });

  /* ---------------------------------------------------------------- invariants */

  await test("Class space copy has no em or en dashes; migration locks writes and enables RLS", async () => {
    const files = [
      "app/(protected)/teachers/page.tsx",
      "app/(protected)/teachers/classe/[id]/page.tsx",
      "app/(protected)/teachers/classe/[id]/code/page.tsx",
      "app/(public)/profs/page.tsx",
      "app/(public)/rejoindre/page.tsx",
      "lib/classes/classes.ts",
      "lib/classes/classes-server.ts",
      "lib/classes/classes-data.ts",
      ...fs.readdirSync(path.join(root, "components/classes")).map((file) => `components/classes/${file}`),
    ];
    const DASHES = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
    for (const file of files) {
      const text = fs.readFileSync(path.join(root, file), "utf8");
      assert.ok(!DASHES.test(text), `${file} contains an em or en dash`);
    }

    const sql = fs.readFileSync(path.join(root, "supabase/migrations/2026-10-16_30_classes.sql"), "utf8");
    for (const table of ["classes", "class_members", "class_assignments", "class_join_attempts"]) {
      assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
    }
    assert.match(sql, /revoke all on public\.classes, public\.class_members, public\.class_assignments, public\.class_join_attempts\s+from public, anon, authenticated/);
    assert.match(sql, /grant select on public\.classes, public\.class_members, public\.class_assignments to authenticated/);
    assert.ok(!/for (insert|update|delete|all)/i.test(sql), "no client write policy");
  });

  console.log(`\n${cases} class space cases passed; database and network mocked.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
