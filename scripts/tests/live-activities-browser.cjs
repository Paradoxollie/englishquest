// Use a running LOCAL build or dev server. No accounts, scores, or class records are created.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const origin = new URL(process.argv[2] || "http://127.0.0.1:4327").origin;
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname)) throw Error("Local fixture only");
const screenshots = path.resolve("output/playwright/direct-activites");
const games = ["grammar-rush", "speed-verb-challenge", "flash-translation", "flashback", "wordfall", "enigma-scroll", "space-lex", "spell-strike", "echo-signal"];

async function run() {
  fs.mkdirSync(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const errors = [];
  const writes = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => {
    if (request.method() === "POST" && !request.url().includes("/_next/")) writes.push(request.url());
  });
  try {
    await page.route(origin + "/fixture", route => route.fulfill({ contentType: "text/html", body: `
      <!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
      <style>*{box-sizing:border-box}body{margin:0}iframe{border:0;width:100%;height:90dvh}</style>
      <main></main><script>
      let frame;window.checkpoints=[];
      window.openFixture=(path,progress)=>{window.checkpoints=[];window.activityPath=path;window.baseline=progress;window.ready=false;
        frame=document.createElement('iframe');frame.title="Class activity";frame.src='/activite-classe/'+path;document.querySelector('main').replaceChildren(frame)};
      window.signal=(type)=>frame.contentWindow.postMessage({channel:window.channel,type,path:activityPath,runKey:'fixture-session-1',progress:baseline},location.origin);
      addEventListener('message',event=>{
        if(event.origin!==location.origin || event.source!==frame.contentWindow || event.data.path!==activityPath)return;
        const message=event.data;
        if(message.type==='ready'){window.channel=message.channel;window.ready=true;window.signal('hold')};
        if(message.type==='progress')window.checkpoints.push(message.progress);
      });
      </script>` }));
    await page.goto(origin + "/fixture");
    const frame = page.frameLocator("iframe");
    async function open(activity, progress = { score: 0, answered: 0, correct: 0 }) {
      await page.evaluate(([path, initial]) => window.openFixture(path, initial), [activity, progress]);
      await page.waitForFunction(() => window.ready, undefined, {timeout: 50000});
      // The local Next.js dev badge can cover the bottom-left keys of a telephone.
      await frame.locator("body").evaluate(body => {
        const style = body.ownerDocument.createElement("style");
        style.textContent = "nextjs-portal {display:none!important}";
        body.append(style);
      });
      assert.equal(await frame.locator(".eq-game-play,.eq-live-course").count(), 0, "the activity waits for the teacher");
      await page.evaluate(() => window.signal("activate"));
    }
    async function didAnswer(summary) {
      await page.waitForFunction(() => window.checkpoints.length > 0, undefined, { timeout: 12000 });
      const last = await page.evaluate(() => window.checkpoints.at(-1));
      assert.equal(last.score, last.correct * 100, summary);
      return last;
    }
    const selected = process.env.LIVE_ACTIVITY_FILTER;
    for (const slug of games.filter(slug => !selected || slug === selected)) {
      await open("jeu/" + slug);
      await frame.locator(".eq-game-play").first().waitFor({ timeout: 50000 });
      assert.equal(await frame.getByTestId("game-start").count(), 0, slug + " auto-started");
      assert.equal(await frame.locator("body").evaluate(body => body.scrollWidth > body.clientWidth + 1), false, slug + " fits the telephone");
      if (slug === "grammar-rush" || slug === "flash-translation") await frame.getByTestId("game-choice").first().click();
      if (slug === "speed-verb-challenge") await frame.getByRole("button", { name: "Passer", exact: true }).click();
      if (slug === "spell-strike") {
        await frame.getByTestId("spell-play-word").click();
        await frame.getByTestId("spell-input").fill("myanswer", { timeout: 15000 });
        await frame.getByTestId("game-submit").click();
      }
      if (slug === "flashback") {
        await page.waitForTimeout(5500);
        assert.equal(await page.evaluate(() => window.checkpoints.length), 0, "a timeout alone is never pupil activity");
        await frame.getByTestId("choice-new").click();
        const choice = frame.getByTestId("meaning-choice").first();
        if (await choice.isVisible()) await choice.click();
      }
      if (slug === "wordfall") {
        const input = frame.getByTestId("wordfall-input");
        await input.fill("incorrectword");
        await input.press("Enter");
        const first = await didAnswer("wordfall");
        assert.deepEqual([first.answered, first.correct], [1, 0]);
        const clue = (await frame.locator(".eq-fall-card b").first().innerText()).trim().toLowerCase();
        const translations = require("../../lib/games/words/wordfall-words.json").manualWords.translations;
        const word = Object.keys(translations).find(key => translations[key].toLowerCase().split(",")[0] === clue);
        assert.ok(word, "Wordfall clue: " + clue);
        await input.fill(word);
        await input.press("Enter");
        await page.waitForFunction(() => window.checkpoints.at(-1)?.correct === 1);
        for (let tick = 0; tick < 8 && !await frame.locator(".eq-game-end").count(); tick++) {
          await page.evaluate(() => document.querySelector("iframe").contentWindow.advanceTime(30000));
          await page.waitForTimeout(75);
        }
        await frame.getByText("La manche continue.", { exact: false }).waitFor();
        await input.waitFor({ timeout: 10000 });
        await input.fill("incorrectword");
        await input.press("Enter");
        await page.waitForFunction(() => window.checkpoints.at(-1)?.answered === 3);
        assert.equal((await didAnswer("continued Wordfall")).score, 100);
      }
      if (slug === "enigma-scroll") {
        for (const letter of "HOUSE") await frame.getByRole("button", { name: letter, exact: true }).click();
        await frame.getByRole("button", { name: "Valider", exact: true }).click();
      }
      if (slug === "echo-signal") {
        const audio = frame.getByTestId("echo-play-btn");
        const hasAudio = () => {
          const doc = document.querySelector("iframe").contentDocument;
          if (doc.querySelector('progress[aria-label="Progression du message"]')?.value > .1) return "playing";
          if (doc.querySelector('[data-testid="echo-play-btn"]')?.textContent.trim() === "Écouter le message") return "tap";
          return false;
        };
        const mode = await (await page.waitForFunction(hasAudio, undefined, {timeout: 20000})).jsonValue();
        if (mode === "tap") await audio.click();
        await page.waitForFunction(() => document.querySelector("iframe").contentDocument.querySelector('progress[aria-label="Progression du message"]')?.value > .1, undefined, {timeout: 15000});
        await frame.getByTestId("game-choice").first().click({ timeout: 45000 });
      }
      if (slug === "space-lex") {
        await frame.getByRole("button", { name: "Passer", exact: true }).click();
        const stage = frame.getByTestId("space-stage");
        await page.waitForFunction(() => {
          const word = document.querySelector("iframe").contentDocument.querySelector("[data-enemy-id]");
          return word && parseFloat(word.style.top) > 26;
        }, undefined, { timeout: 20000 });
        await page.screenshot({ path: path.join(screenshots, "blaster-mobile.png") });
        const word = frame.locator("[data-enemy-id]").first();
        const text = await word.textContent();
        const box = await word.boundingBox();
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        const feedback = stage.locator(".eq-space-feedback-chip").filter({ hasText: text });
        await feedback.waitFor();
        const correct = await feedback.evaluate(el => Number(el.classList.contains("is-success")));
        const progress = await didAnswer(slug);
        assert.equal(progress.answered, 1, "one tap counts as one answer for the teacher");
        assert.equal(progress.correct, correct);
      }
      const result = await didAnswer(slug);
      assert.ok(result.answered > 0);
      console.log("PASS activity", slug, "auto-start and classroom progress");
    }
    await open("cours/1");
    await frame.getByRole("button", { name: "Passer aux exercices" }).click();
    const exercise = frame.locator(".eq-live-exercise");
    if (await exercise.locator("input").count()) {
      await exercise.locator("input").fill("I am");
      await exercise.getByRole("button", { name: "Valider" }).click();
    } else await exercise.locator(".eq-live-course-choices button").first().click();
    const result = await didAnswer("course");
    assert.equal(result.courseId, 1);
    assert.equal(result.answers.length, 1);
    const exerciseId = await exercise.getAttribute("data-exercise");
    await page.screenshot({ path: path.join(screenshots, "cours-mobile.png") });
    await open("cours/1", result);
    await frame.locator(".eq-live-exercise").waitFor();
    assert.notEqual(await exercise.getAttribute("data-exercise"), exerciseId);
    assert.equal((await page.evaluate(() => window.checkpoints.length)), 0);
    // Reprendre juste avant x9 permet de vérifier l'énoncé reçu par un téléphone et le relevé envoyé au professeur.
    const native = require("../../lib/placement/questions.json").filter(q => q.course === 1)
      .map(q => ({ id: q.id.split("-")[1], choice: q.correctAnswer }));
    const extras = require("../../lib/courses/exercises/course1.json").items.filter(q => q.id !== "x9")
      .map(q => q.type === "mcq" ? { id: q.id, choice: q.correctAnswer } : { id: q.id, text: q.answers[0] });
    const earlier = [...native, ...extras];
    const baseline = { courseId: 1, answers: earlier, answered: earlier.length, correct: earlier.length, score: 100 * earlier.length };
    for (const [text, right] of [["has got", true], ["have got", false]]) {
      await open("cours/1", baseline);
      await frame.getByRole("heading", { name: /She ___ blue eyes/ }).waitFor();
      await exercise.getByRole("textbox").fill(text);
      await exercise.getByRole("button", { name: "Valider" }).click();
      await frame.getByText(right ? "Bonne réponse !" : "Réponse attendue", { exact: true }).waitFor();
      const checkpoint = await didAnswer("course 1 x9");
      assert.deepEqual(checkpoint.answers.at(-1), { id: "x9", text, revision: 2 });
      assert.equal(checkpoint.correct, earlier.length + Number(right));
      await open("cours/1", checkpoint);
      await frame.getByText(`${checkpoint.correct} bonnes réponses sur ${earlier.length + 1}.`, { exact: true }).waitFor();
    }
    assert.deepEqual(writes, [], "embedded public activities never write standalone rewards");
    assert.deepEqual(errors, [], "client rendering");
    console.log("PASS lesson, real answer, correction and resume without duplicate credit");
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
