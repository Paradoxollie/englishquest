// Run with: node scripts/tests/auth-pagination-regression.cjs
// Real login/reset actions, mocked Supabase clients: no users or emails created.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const filename = path.resolve(__dirname, "../../app/(public)/auth/actions.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function harness({ users = [], profileEmail = null, pageError = null } = {}) {
  const calls = { pages: [], signIns: [], resetRequests: [] };
  const admin = {
    from: () => {
      const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: profileEmail ? { email: profileEmail } : null, error: null }) };
      return query;
    },
    auth: { admin: {
      listUsers: async ({ page, perPage }) => {
        calls.pages.push({ page, perPage });
        if (pageError && pageError.page === page) return { data: { users: [] }, error: { message: pageError.message } };
        return { data: { users: users.slice((page - 1) * perPage, page * perPage) }, error: null };
      },
    } },
  };
  const client = { auth: {
    signInWithPassword: async (params) => {
      calls.signIns.push(params);
      // Stop before session creation: this is a lookup test, not a real login.
      return { data: {}, error: { message: "Invalid login credentials" } };
    },
    resetPasswordForEmail: async (...params) => { calls.resetRequests.push(params); return { error: null }; },
  } };
  const mod = new Module(filename, module);
  mod.require = (name) => {
    if (name === "next/navigation") return { redirect: () => { throw new Error("Unexpected redirect"); } };
    if (name === "next/cache") return { revalidatePath: () => {} };
    if (name === "@/lib/supabase/server") return { createSupabaseServerClient: async () => client };
    if (name === "@/lib/supabase/admin") return { createSupabaseAdminClient: () => admin };
    if (name === "@/lib/site/config") return { SITE_URL: "https://example.invalid" };
    if (name === "@/lib/profile/economy") return { WELCOME_GOLD: 30 };
    if (name === "@/lib/navigation/safe-next") return { getSafeNextPath: () => null };
    // Le test de niveau sans compte n'intervient qu'à l'inscription, hors du périmètre de ce test.
    if (name === "@/lib/placement/placement") return { applyPlacement: async () => { throw new Error("Unexpected placement"); } };
    if (name === "@/lib/placement/placement-token") return { readPlacementToken: () => null };
    throw new Error(`Unexpected import ${name}`);
  };
  mod._compile(compiled, filename);
  return { actions: mod.exports, calls };
}
function form(login) { const data = new FormData(); data.set("login", login); data.set("password", "fake-password"); return data; }
function directory(length, targetIndex) {
  return Array.from({ length }, (_, index) => ({
    email: index === targetIndex ? "legacy@example.invalid" : `fixture-${index}@example.invalid`,
    user_metadata: { username: index === targetIndex ? "Legacy_Pupil" : `fixture_${index}` },
  }));
}
let cases = 0;
async function test(name, run) { await run(); cases += 1; console.log(`PASS ${name}`); }

(async () => {
  await test("Username login finds a legacy account beyond the first page", async () => {
    const h = harness({ users: directory(430, 420) });
    const result = await h.actions.loginAction({}, form(" LEGACY_PUPIL "));
    assert.match(result.error, /mot de passe incorrect/);
    assert.deepEqual(h.calls.pages.map((item) => item.page), [1, 2, 3]);
    assert.equal(h.calls.signIns[0].email, "legacy@example.invalid");
  });
  await test("Password reset uses the same paginated legacy lookup", async () => {
    const h = harness({ users: directory(250, 230) });
    const result = await h.actions.requestPasswordResetAction({}, form("Legacy_Pupil"));
    assert.ok(result.success);
    assert.deepEqual(h.calls.pages.map((item) => item.page), [1, 2]);
    assert.equal(h.calls.resetRequests[0][0], "legacy@example.invalid");
  });
  await test("Missing usernames exhaust full pages and stop at the empty page", async () => {
    const h = harness({ users: directory(400, -1) });
    const result = await h.actions.loginAction({}, form("missing"));
    assert.match(result.error, /Aucun compte/);
    assert.deepEqual(h.calls.pages.map((item) => item.page), [1, 2, 3]);
    assert.equal(h.calls.signIns.length, 0);
    assert.equal(h.calls.resetRequests.length, 0);
  });
  await test("Profiles with email bypass the directory fallback", async () => {
    const h = harness({ profileEmail: "PROFILE@EXAMPLE.INVALID" });
    await h.actions.loginAction({}, form("profile_user"));
    assert.equal(h.calls.pages.length, 0);
    assert.equal(h.calls.signIns[0].email, "profile@example.invalid");
  });
  await test("Direct email login bypasses username lookup", async () => {
    const h = harness();
    await h.actions.loginAction({}, form(" direct@example.invalid "));
    assert.equal(h.calls.pages.length, 0);
    assert.equal(h.calls.signIns[0].email, "direct@example.invalid");
  });
  await test("Pagination stops when the account is found and honors login_email", async () => {
    const users = directory(500, 210);
    users[210].user_metadata.login_email = "MIGRATED@EXAMPLE.INVALID";
    users[0].user_metadata.username = 123; // Malformed old metadata must not abort lookup.
    const h = harness({ users });
    await h.actions.loginAction({}, form("legacy_pupil"));
    assert.deepEqual(h.calls.pages.map((item) => item.page), [1, 2]);
    assert.equal(h.calls.signIns[0].email, "migrated@example.invalid");
  });
  await test("Directory failures return an actionable login error without attempting authentication", async () => {
    const h = harness({ users: directory(300, 250), pageError: { page: 2, message: "Offline fixture" } });
    const result = await h.actions.loginAction({}, form("legacy_pupil"));
    assert.match(result.error, /Impossible de vérifier/);
    assert.equal(h.calls.signIns.length, 0);
    assert.deepEqual(h.calls.pages.map((item) => item.page), [1, 2]);
  });
  console.log(`\n${cases} auth-pagination regression cases passed; all network clients mocked.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
