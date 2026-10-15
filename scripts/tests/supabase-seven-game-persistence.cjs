/* Opt-in live test: creates one email-confirmed disposable account, exercises
 * the actual seven score actions, then deletes ONLY its returned Auth user ID.
 * Credentials are generated in memory and never written or logged.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { createClient } = require("@supabase/supabase-js");

if (!process.argv.includes("--run-live")) {
  console.log("Live persistence test is opt-in; use --run-live.");
  process.exit(0);
}
const root = path.resolve(__dirname, "../..");
process.loadEnvFile(path.join(root, ".env.local"));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(url && anonKey && adminKey, "Missing Supabase configuration");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, adminKey, options);
const authenticated = createClient(url, anonKey, options);
const outputDir = path.join(root, "output", "audit-2026-10-13");
fs.mkdirSync(outputDir, { recursive: true });
const nativeOnly = process.argv.includes("--native-only");
const resultPath = path.join(outputDir, nativeOnly ? "disposable-native-auth.json" : "seven-game-persistence.json");
const recoveryPath = path.join(outputDir, "disposable-account-cleanup-id.json");
assert.ok(!fs.existsSync(recoveryPath), "An earlier disposable account still requires cleanup; do not create another");
const results = {
  scope: "one_new_disposable_account", noEmailSent: true,
  integration: { scoreActions: "actual", rewardEngine: "actual", profileRewardUpdate: "actual", dailyBonus: "stubbed", missionCompletion: "stubbed", routeRevalidation: "stubbed" },
  auth: {}, games: [], browser: { attempted: false }, cleanup: {},
};
const report = value => process.stdout.write(`${JSON.stringify(value)}\n`);
const cache = new Map();
const stubs = {
  "@/lib/supabase/server": { createSupabaseServerClient: async () => authenticated },
  "@/lib/supabase/admin": { createSupabaseAdminClient: () => admin },
  "@/lib/courses/mission-auto-complete": { autoCompleteCourseMissionForGame: async () => null },
  "@/lib/profile/daily-challenge": { checkAndGrantDailyBonus: async () => ({ dailyPlayedGames: [], requiredGames: [], bonusGranted: false, xpBonus: 0, goldBonus: 0, dailyGoalReached: false }) },
  "@/lib/profile/badges-server": { syncBadgesSafely: async () => [] },
  "@/lib/courses/practice-server": { recordGrammarRushPractice: async () => null },
  "next/cache": { revalidatePath: () => {} },
  "server-only": {},
  // Sessions de partie : vérifiées hors ligne par scripts/test-game-backend.cjs.
  "@/lib/games/game-session-server": { consumeGameSession: async () => ({ ok: true }) },
};
function loadSource(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  cache.set(filename, loaded);
  loaded.require = request => {
    if (Object.hasOwn(stubs, request)) return stubs[request];
    if (request.startsWith("@/") || request.startsWith(".")) {
      const base = request.startsWith("@/") ? path.join(root, request.slice(2)) : path.resolve(path.dirname(filename), request);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, "index.ts")].find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!resolved) throw new Error("Unresolved local module");
      if (/\.tsx?$/.test(resolved)) return loadSource(resolved);
      return Module.prototype.require.call(loaded, resolved);
    }
    return Module.prototype.require.call(loaded, request);
  };
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  loaded._compile(output, filename);
  return loaded.exports;
}
const scenarios = [
  { slug: "wordfall", action: "submitWordfallScore", params: { mode: "exact", score: 29, wordsCompleted: 2, durationMs: 30_000 }, score: 29, maxScore: 2, durationMs: 30_000, difficulty: "easy" },
  { slug: "enigma-scroll", action: "submitEnigmaScrollScore", params: { wordLength: 5, totalScore: 40, wordsFound: 1, durationMs: 30_000 }, score: 40, maxScore: 1, durationMs: 30_000, difficulty: "medium" },
  { slug: "space-lex", action: "submitLexiconBlasterScore", params: { score: 20, wave: 1, maxCombo: 2, wordsMastered: 2, wordsMissed: 0, durationMs: 30_000 }, score: 20, maxScore: 1, durationMs: 30_000, difficulty: "medium" },
  { slug: "flashback", action: "submitEchoLexScore", params: { score: 3, durationMs: 30_000 }, score: 3, durationMs: 30_000, difficulty: "medium" },
  { slug: "flash-translation", action: "submitFlashTranslationScore", params: { totalTimeMs: 30_000, averageReactionTimeMs: 3_000, wrongAnswers: 0, roundsCompleted: 10, durationMs: 40_000 }, score: 30_000, maxScore: 10, durationMs: 30_000, difficulty: "medium" },
  { slug: "speed-verb-challenge", action: "submitSpeedVerbScore", params: { difficulty: 1, score: 4, correctCount: 2, totalRounds: 2, durationMs: 30_000 }, score: 4, maxScore: 2, durationMs: 30_000, difficulty: "easy" },
  { slug: "grammar-rush", action: "submitGrammarRushScore", params: { score: 31, correct: 2, attempts: 2, durationMs: 60_000 }, score: 31, maxScore: 2, durationMs: 60_000, difficulty: "medium" },
];

async function browserCheck(email, password) {
  const baseUrlArg = process.argv.find(value => value.startsWith("--base-url="));
  if (!baseUrlArg) return;
  results.browser.attempted = true;
  const baseUrl = baseUrlArg.slice("--base-url=".length);
  const packagePath = process.env.AUDIT_PLAYWRIGHT_PACKAGE || path.join(process.env.USERPROFILE, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules", "playwright");
  const { chromium } = require(packagePath);
  const executablePath = path.join(process.env.LOCALAPPDATA, "ms-playwright", "chromium-1208", "chrome-win64", "chrome.exe");
  const browser = await chromium.launch({ headless: true, executablePath });
  let page;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    page = await context.newPage();
    results.browser.phase = "open_login";
    await page.goto(`${baseUrl}/auth/login`, { waitUntil: "domcontentloaded" });
    results.browser.phase = "fill_login";
    await page.locator("#login-identifier").fill(email);
    await page.locator("#login-password").fill(password);
    results.browser.phase = "submit_login";
    await Promise.all([
      page.waitForURL(target => !target.pathname.startsWith("/auth/"), { timeout: 60_000 }),
      page.getByRole("button", { name: "Se connecter", exact: true }).click(),
    ]);
    results.browser.nativeLogin = true;
    for (const route of ["/home", "/profile"]) {
      results.browser.phase = route.slice(1);
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      assert.equal(new URL(page.url()).pathname, route);
      assert.equal(response.status(), 200);
      assert.ok((await page.locator("main").innerText()).length > 50);
      await page.screenshot({ path: path.join(outputDir, `disposable-auth-${route.slice(1)}.png`), fullPage: true });
      results.browser[route.slice(1)] = { status: 200, protectedRouteLoaded: true };
    }
  } catch (error) {
    const scrub = value => String(value).replaceAll(password, "[redacted]").replaceAll(email, "[audit-email]");
    results.browser.error = scrub(error.message).slice(0, 1_000);
    if (page) {
      results.browser.pathname = new URL(page.url()).pathname;
      results.browser.alerts = (await page.getByRole("alert").allTextContents()).map(scrub);
      await page.screenshot({ path: path.join(outputDir, "disposable-auth-failure.png"), fullPage: true }).catch(() => {});
    }
    throw error;
  } finally {
    await browser.close();
  }
}

let disposableId;
let phase = "create_disposable_account";
let failure;
const originalConsole = { log: console.log, warn: console.warn, error: console.error, info: console.info };
// Action diagnostics may include request details; all test output is scrubbed.
console.log = console.warn = console.error = console.info = () => {};
(async () => {
  try {
    const nonce = crypto.randomUUID().replace(/-/g, "");
    const email = `codex-audit-${nonce}@example.invalid`;
    const password = `Audit-${crypto.randomBytes(24).toString("base64url")}!aA1`;
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username: `audit_${nonce.slice(0, 16)}` } });
    assert.equal(created.error, null, "Disposable account creation failed");
    disposableId = created.data.user.id;
    assert.ok(disposableId);
    fs.writeFileSync(recoveryPath, JSON.stringify({ createdBy: "supabase-seven-game-persistence.cjs", exactDisposableUserId: disposableId }));
    results.auth.accountCreated = true;
    report({ phase: "disposable_account_created", noEmailSent: true });

    phase = "anon_password_signin";
    const signedIn = await authenticated.auth.signInWithPassword({ email, password });
    assert.equal(signedIn.error, null, "Password sign-in failed");
    assert.equal(signedIn.data.user.id, disposableId);
    results.auth.anonPasswordSignin = true;
    const baseline = await admin.from("profiles").select("xp,gold,level").eq("id", disposableId).single();
    assert.equal(baseline.error, null, "Disposable profile was not created");
    let xp = baseline.data.xp ?? 0;
    let gold = baseline.data.gold ?? 0;

    for (const scenario of nativeOnly ? [] : scenarios) {
      phase = `submit_${scenario.slug}`;
      const actions = loadSource(path.join(root, "app", "play", scenario.slug, "actions.ts"));
      const result = await actions[scenario.action](scenario.params);
      assert.equal(result.success, true, `Score action failed for ${scenario.slug}`);
      const game = await admin.from("games").select("id").eq("slug", scenario.slug).single();
      assert.equal(game.error, null);
      const row = await admin.from("game_scores").select("score,max_score,duration_ms,difficulty").eq("user_id", disposableId).eq("game_id", game.data.id).single();
      assert.equal(row.error, null);
      assert.equal(row.data.score, scenario.score);
      assert.equal(row.data.duration_ms, scenario.durationMs);
      assert.equal(row.data.difficulty, scenario.difficulty);
      if (scenario.maxScore !== undefined) assert.equal(row.data.max_score, scenario.maxScore);
      xp += result.rewards.xpEarned;
      gold += result.rewards.goldEarned;
      const balance = await admin.from("profiles").select("xp,gold").eq("id", disposableId).single();
      assert.equal(balance.error, null);
      assert.equal(balance.data.xp, xp, `${scenario.slug} XP persisted incorrectly`);
      assert.equal(balance.data.gold, gold, `${scenario.slug} gold persisted incorrectly`);
      results.games.push({ slug: scenario.slug, score: scenario.score, actualActionSucceeded: true, databaseRowMatches: true, rewardsPersisted: true });
      report({ phase: "score_persisted", slug: scenario.slug, score: scenario.score, rewardsPersisted: true });
    }
    phase = "authenticated_score_read";
    const ownRows = await authenticated.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", disposableId);
    assert.equal(ownRows.error, null);
    assert.equal(ownRows.count, nativeOnly ? 0 : scenarios.length);
    results.auth.ownScoreCountMatches = true;
    results.auth.ownScoresRead = ownRows.count;
    phase = "native_browser_auth";
    await browserCheck(email, password);
  } catch (error) {
    failure = { phase, category: error.name ?? "Error" };
    results.failure = failure;
    process.exitCode = 1;
  } finally {
    if (disposableId) {
      try {
        await authenticated.auth.signOut({ scope: "global" }).catch(() => {});
        const deleted = await admin.auth.admin.deleteUser(disposableId);
        assert.equal(deleted.error, null, "Disposable account cleanup failed");
        results.cleanup.exactNewAccountDeleted = true;
        const [scores, profile, account, progress, exams] = await Promise.all([
          admin.from("game_scores").select("id", { count: "exact", head: true }).eq("user_id", disposableId),
          admin.from("profiles").select("id", { count: "exact", head: true }).eq("id", disposableId),
          admin.auth.admin.getUserById(disposableId),
          admin.from("user_course_progress").select("user_id", { count: "exact", head: true }).eq("user_id", disposableId),
          admin.from("chapter_exams").select("user_id", { count: "exact", head: true }).eq("user_id", disposableId),
        ]);
        assert.equal(scores.error, null);
        assert.equal(profile.error, null);
        assert.equal(progress.error, null);
        assert.equal(exams.error, null);
        assert.equal(scores.count, 0);
        assert.equal(profile.count, 0);
        assert.equal(progress.count, 0);
        assert.equal(exams.count, 0);
        assert.equal(account.data.user, null);
        assert.ok(account.error);
        results.cleanup.scoresRemovedByCascade = true;
        results.cleanup.profileRemovedByCascade = true;
        results.cleanup.accountAbsent = true;
        results.cleanup.exactAccountScoreCount = scores.count;
        results.cleanup.exactAccountProfileCount = profile.count;
        results.cleanup.exactAccountProgressCount = progress.count;
        results.cleanup.exactAccountChapterExamCount = exams.count;
        fs.unlinkSync(recoveryPath);
      } catch (error) {
        results.cleanup.failed = true;
        results.cleanup.category = error.name ?? "Error";
        results.cleanup.recoveryFile = path.relative(root, recoveryPath);
        process.exitCode = 1;
      }
    }
    Object.assign(console, originalConsole);
    results.success = !failure && results.games.length === (nativeOnly ? 0 : 7) && results.cleanup.accountAbsent === true;
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    report(results);
  }
})().catch(() => { process.exitCode = 1; report({ success: false, category: "UnexpectedHarnessFailure" }); });
