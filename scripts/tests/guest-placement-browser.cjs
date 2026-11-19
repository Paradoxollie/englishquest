// Run against a local copy: node scripts/tests/guest-placement-browser.cjs http://127.0.0.1:3482
// Set AUDIT_PLAYWRIGHT_PACKAGE / CHROMIUM_PATH when Chromium is installed separately.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.AUDIT_PLAYWRIGHT_PACKAGE || "playwright");
const bank = require("../../lib/placement/questions.json");
const base = new URL(process.argv[2] ?? "http://localhost:3000");
assert.ok(["localhost","127.0.0.1","[::1]"].includes(base.hostname), "local site required");
const url = (path) => new URL(path,base).href;

async function verifyCourseVariant(browser, course, prompt, answer) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // Fix only the exercise draw so the target appears in the normal ten-question quiz.
  await page.addInitScript((draw) => {
    const original = Math.random;
    Math.random = () => new Error().stack?.includes("drawQuizSeries") ? draw : original();
  }, course === 1 ? 0.01 : 0.99);
  try {
    await page.goto(url(`/cours/${course}#quiz`));
    const quiz = page.getByTestId("quiz");
    for (let n = 0; n < 10; n++) {
      const text = await quiz.locator(".eq-quiz-question").innerText();
      const target = text.includes(prompt);
      const gap = quiz.getByRole("textbox");
      const tiles = quiz.getByRole("group", { name: "Mots à placer" });
      if (await gap.isVisible()) {
        await gap.fill(target ? answer : "test");
        await quiz.getByRole("button", { name: "Valider" }).click();
      } else if (await tiles.isVisible()) {
        const words = target ? answer : await tiles.getByRole("button").allTextContents();
        for (const word of words) {
          await tiles.getByRole("button", { name: word, exact: true }).first().click();
        }
        await quiz.getByRole("button", { name: "Valider" }).click();
      } else {
        await quiz.locator(".eq-quiz-option").first().click();
      }
      if (target) {
        await quiz.locator(".eq-quiz-verdict.is-right").waitFor();
        return;
      }
      if (n < 9) await quiz.getByRole("button", { name: "Question suivante" }).click();
    }
    assert.fail(`Course ${course} did not show ${prompt}`);
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const page = await context.newPage();
    await page.goto(url("/test-de-niveau"));
    await page.getByTestId("placement-start").click();
    for (const chapter of [1,2]) {
      for (let n=0;n<6;n++) {
        const text = (await page.locator(".eq-game-prompt-sub").innerText()).trim();
        const options = await page.getByRole("radio").locator("span").allTextContents();
        const q = bank.find((q) => q.course > (chapter-1)*10 && q.course <= chapter*10 && q.question === text &&
          q.options.join("|") === options.join("|"));
        assert.ok(q, text);
        const chosen = chapter === 1 ? q.correctAnswer : (q.correctAnswer+1)%q.options.length;
        await page.getByRole("radio").nth(chosen).click();
        await page.getByTestId("placement-confirm").click();
      }
      if (chapter === 1) await page.getByTestId("placement-step").getByRole("button").click();
    }
    await page.getByTestId("placement-done").waitFor();
    assert.ok(await page.getByRole("link",{name:"Ouvrir le cours 11"}).isVisible());
    const proof = (await context.cookies()).find((cookie) => cookie.name === "eq-placement");
    assert.ok(proof?.httpOnly);
    await page.getByRole("link",{name:"Voir ma carte"}).click();
    await page.getByRole("link",{name:"Continuer vers la mission 11"}).first().waitFor();
    assert.match(await page.locator(".eq-quest-progress").innerText(), /0 par quiz, 10 au test/);
    await page.reload();
    await page.getByRole("link",{name:"Continuer vers la mission 11"}).first().waitFor();
    await page.goto(url("/tous-les-cours"));
    await page.getByRole("link",{name:"Reprendre le cours 11"}).waitFor();
    for (const target of ["/leaderboard?game=speed-verb-challenge","/examen/1","/profile?objet=test"]) {
      await page.goto(url(target));
      await page.waitForURL((current) => current.pathname === "/auth/login");
      assert.equal(new URL(page.url()).searchParams.get("next"),target);
      const signup = page.getByRole("link",{name:"Créer un compte",exact:true}).last();
      assert.equal(new URL(await signup.getAttribute("href"),base).searchParams.get("next"),target);
    }
    await context.clearCookies();
    await page.evaluate((token) => window.localStorage.setItem("eq-placement-token",token),proof.value);
    await page.goto(url("/quest"));
    await page.getByRole("link",{name:"Continuer vers la mission 11"}).first().waitFor();
    await page.waitForFunction(() => window.localStorage.getItem("eq-placement-token") === null);
    console.log("PASS Guest test through both chapters, next lesson, map, library, refresh, legacy result and three login destinations");
    await verifyCourseVariant(browser, 1, "got blue eyes", "’s");
    await verifyCourseVariant(browser, 49, "Éteignez vos téléphones", ["turn", "your", "phones", "off", "please"]);
    console.log("PASS Course 1 accepts the contracted 's and course 49 accepts the polite request with please at the end in the browser");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode=1; });
