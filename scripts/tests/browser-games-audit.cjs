// Run: node scripts/tests/browser-games-audit.cjs [http://127.0.0.1:3000]
// Guest browser checks: never creates users or writes scores to Supabase.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function playwrightPath() {
  if (process.env.PLAYWRIGHT_MODULE) return process.env.PLAYWRIGHT_MODULE;
  try { return require.resolve('playwright'); } catch { /* npm tool cache fallback */ }
  const cache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
  for (const folder of fs.existsSync(cache) ? fs.readdirSync(cache) : []) {
    const candidate = path.join(cache, folder, 'node_modules', 'playwright');
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error('Install Playwright or set PLAYWRIGHT_MODULE to its module path.');
}
const { chromium } = require(playwrightPath());
function engine(name) {
  const file = path.join(root, 'lib/games', name + '.ts');
  const mod = new Module(file, module);
  mod.paths = Module._nodeModulePaths(path.dirname(file));
  const originalRequire = mod.require.bind(mod);
  mod.require = request => request.startsWith('./') ? engine(request.slice(2)) : originalRequire(request);
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, file);
  return mod.exports;
}
const vocabulary = new Map(engine('flashTranslation').VOCABULARY.map(w => [w.french, w.english]));
const verbs = engine('speed-verb-challenge').VERBS;
const freeWords = require('../../lib/games/words/wordfall-words.json').freeModeWords;
const base = process.argv[2] || 'http://127.0.0.1:3000';
const out = path.join(root, 'output/playwright/audit-2026-10-13');
fs.mkdirSync(out, { recursive: true });
const report = { base, checks: [], errors: [], screenshots: [] };
let browser;
async function scenario(name, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  try {
    await run(page);
    assert.deepEqual(errors, [], 'browser errors');
    report.checks.push({ name, ok: true });
    console.log('PASS ' + name);
  } catch (error) {
    report.checks.push({ name, ok: false, error: error.message });
    console.log('FAIL ' + name + ': ' + error.message);
    await page.screenshot({ path: path.join(out, name.replace(/[^a-z0-9-]/gi, '-') + '-failure.png'), fullPage: true }).catch(() => {});
  } finally {
    report.errors.push(...errors.map(message => ({ name, message })));
    await context.close();
  }
}
async function open(page, slug) {
  const response = await page.goto(base + '/play/' + slug);
  assert.equal(response.status(), 200);
  await page.locator('[data-testid="game-start"]:visible').waitFor();
  await page.waitForTimeout(180);
}
async function start(page) { await page.locator('[data-testid="game-start"]:visible').click(); }
async function shot(page, name) {
  const file = path.join(out, name + '.png');
  await page.screenshot({ path: file, fullPage: true });
  report.screenshots.push(file);
}
async function tick(page, milliseconds) {
  await page.clock.fastForward(milliseconds);
  await page.waitForTimeout(30);
}
async function stat(page, label) {
  return (await page.locator('.eq-game-stat').filter({ has: page.locator('small', { hasText: new RegExp('^' + label + '$') }) }).locator('b').innerText()).trim();
}
async function readyChoices(page) {
  for (let i = 0; i < 8; i++) {
    if (await page.getByTestId('game-choice').first().isEnabled().catch(() => false)) return;
    await tick(page, 1500);
  }
  throw new Error('Choices never became available');
}
(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined });
  const slugs = ['wordfall', 'enigma-scroll', 'space-lex', 'flash-translation', 'flashback', 'speed-verb-challenge', 'grammar-rush'];
  await scenario('all-routes-desktop-mobile', async page => {
    for (const slug of slugs) {
      await open(page, slug);
      assert.equal(await page.locator('.eq-game-title').count(), 1);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, slug + ' mobile overflow');
      await shot(page, slug + '-mobile-start');
      await start(page);
      await page.waitForTimeout(200);
      assert.equal(await page.locator('.eq-game-play').count(), 1, slug + ' starts');
      await shot(page, slug + '-mobile-playing');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await shot(page, slug + '-desktop-playing');
    }
  });
  await scenario('flash-translation-full-ten-rounds', async page => {
    await open(page, 'flash-translation');
    await page.clock.install();
    await start(page);
    for (let index = 0; index < 10; index++) {
      await readyChoices(page);
      const french = (await page.getByTestId('game-prompt').innerText()).trim();
      const english = vocabulary.get(french);
      assert.ok(english, french);
      const choices = await page.getByTestId('game-choice').allTextContents();
      const right = choices.findIndex(text => text.trim().endsWith(english));
      assert.ok(right >= 0, 'correct translation present');
      await page.getByTestId('game-choice').nth(index === 0 ? (right + 1) % 4 : right).click();
      if (index === 0) assert.equal(await stat(page, 'Erreurs'), '1');
      await tick(page, 1500);
    }
    await page.getByTestId('game-end').waitFor();
    assert.match(await page.getByTestId('game-end').innerText(), /1 erreur/);
    assert.ok(parseFloat((await page.locator('.eq-game-end-score').innerText()).replace(',', '.')) >= 5);
    await shot(page, 'flash-translation-ended');
    await page.getByRole('button', { name: 'Rejouer', exact: true }).click();
    assert.equal(await page.getByTestId('game-end').count(), 0);
  });
  await scenario('flashback-mistakes-memory-and-replay', async page => {
    await open(page, 'flashback');
    await page.clock.install();
    await start(page);
    const seen = new Set();
    const first = (await page.getByTestId('game-prompt').innerText()).trim();
    for (let i = 0; i < 3; i++) {
      const word = (await page.getByTestId('game-prompt').innerText()).trim();
      await page.getByTestId(seen.has(word) ? 'choice-new' : 'choice-seen').click();
      seen.add(word);
      await tick(page, 1800);
    }
    await page.getByTestId('game-end').waitFor();
    assert.ok((await page.locator('.eq-game-review').innerText()).includes(first), 'wrong first word is remembered');
    assert.equal(await page.locator('.eq-game-review li b').filter({ hasText: new RegExp('^' + first + '$') }).count(), 1);
    await shot(page, 'flashback-ended');
    await page.getByRole('button', { name: 'Rejouer', exact: true }).click();
    assert.equal(await stat(page, 'Erreurs'), '0 / 3');
    await page.getByTestId('choice-new').click();
    assert.equal(await stat(page, 'Score'), '1');
  });
  for (const [difficulty, fields] of [['Facile', 1], ['Moyen', 2], ['Difficile', 3]]) {
    await scenario('speed-verb-' + difficulty, async page => {
      await open(page, 'speed-verb-challenge');
      await page.getByRole('radio', { name: new RegExp('^' + difficulty) }).click();
      await page.clock.install();
      await start(page);
      assert.equal(await page.locator('.eq-game-field input').count(), fields);
      const infinitive = (await page.getByTestId('game-prompt').innerText()).trim().toLowerCase();
      const word = verbs.find(v => v.base.toLowerCase() === infinitive);
      assert.ok(word, infinitive);
      await page.getByLabel('Prétérit', { exact: true }).fill(word.pastSimple[0]);
      if (fields >= 2) await page.getByLabel('Participe passé', { exact: true }).fill(word.pastParticiple[0]);
      if (fields >= 3) await page.getByLabel('Traduction', { exact: true }).fill(word.translations[0]);
      await page.getByTestId('game-submit').click();
      assert.equal(await stat(page, 'Série'), '1');
      await tick(page, 1800);
      await page.getByRole('button', { name: 'Passer', exact: true }).click();
      assert.equal(await stat(page, 'Série'), '0');
      await tick(page, 100000);
      await page.getByTestId('game-end').waitFor();
      assert.match(await page.getByTestId('game-end').innerText(), /2/);
      await shot(page, 'speed-verb-' + difficulty + '-ended');
    });
  }
  await scenario('grammar-feedback-timeout-replay', async page => {
    await open(page, 'grammar-rush');
    await page.clock.install();
    await start(page);
    const prompt = await page.locator('.eq-game-prompt').innerText();
    const options = await page.getByTestId('game-choice').allTextContents();
    await page.getByTestId('game-choice').first().click();
    assert.equal(await page.locator('.eq-game-prompt').innerText(), prompt);
    assert.deepEqual(await page.getByTestId('game-choice').allTextContents(), options);
    await tick(page, 1700);
    assert.notEqual(await page.locator('.eq-game-prompt').innerText(), prompt);
    await tick(page, 61000);
    await page.getByTestId('game-end').waitFor();
    await shot(page, 'grammar-rush-ended');
    await page.getByRole('button', { name: 'Rejouer', exact: true }).click();
    await start(page);
    assert.equal(await stat(page, 'Score'), '0');
  });
  for (const letters of [4, 5, 6]) {
    await scenario('enigma-' + letters + '-letters', async page => {
      await open(page, 'enigma-scroll');
      await page.getByRole('radio', { name: new RegExp('^' + letters + ' lettres') }).click();
      await page.clock.install();
      await start(page);
      assert.equal(await page.locator('[role="row"]').first().locator('[role="gridcell"]').count(), letters);
      for (const letter of 'ABC'.slice(0, letters)) await page.getByRole('button', { name: letter, exact: true }).click();
      await page.getByRole('button', { name: 'Valider', exact: true }).click();
      assert.equal(await page.getByTestId('game-end').count(), 0, 'incomplete guess remains playable');
      await tick(page, 91000);
      await page.getByTestId('game-end').waitFor();
      await shot(page, 'enigma-' + letters + '-ended');
    });
  }
  await scenario('wordfall-exact-pause-miss-replay', async page => {
    await open(page, 'wordfall');
    await start(page);
    await page.locator('.eq-fall-card').first().waitFor();
    const card = page.locator('.eq-fall-card').first();
    const english = await card.locator('b').innerText();
    const french = await card.locator('span').innerText();
    await page.getByTestId('wordfall-input').fill(english + ' ' + french);
    await page.getByTestId('wordfall-input').press('Enter');
    assert.ok(Number((await stat(page, 'Score')).replace(/\s/g, '')) > 0, 'exact answer scores');
    await page.keyboard.press('Escape');
    assert.equal(await page.getByTestId('wordfall-input').isDisabled(), true);
    const words = await page.locator('.eq-fall-card').allTextContents();
    await page.waitForTimeout(350);
    assert.deepEqual(await page.locator('.eq-fall-card').allTextContents(), words);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByTestId('wordfall-input').isEnabled(), true);
    assert.equal(await page.evaluate(() => typeof window.advanceTime), 'function');
    for (let i = 0; i < 5 && await page.getByTestId('game-end').count() === 0; i++) {
      await page.evaluate(() => window.advanceTime(30000));
      await page.waitForTimeout(40);
    }
    await page.getByTestId('game-end').waitFor();
    await shot(page, 'wordfall-ended');
    await page.getByRole('button', { name: 'Rejouer', exact: true }).click();
    await start(page);
    assert.equal(await stat(page, 'Score'), '0');
  });
  await scenario('wordfall-free-input-and-repeat', async page => {
    await open(page, 'wordfall');
    await page.getByRole('radio', { name: /^Mot libre/ }).click();
    await start(page);
    await page.locator('.eq-fall-card').first().waitFor();
    const letter = (await page.locator('.eq-fall-card b').first().innerText()).trim();
    const word = freeWords.find(value => value.toUpperCase().startsWith(letter) && /^[a-z]{3,}$/i.test(value));
    assert.ok(word, letter);
    await page.getByTestId('wordfall-input').fill(word);
    await page.getByTestId('wordfall-input').press('Enter');
    const score = await stat(page, 'Score');
    assert.ok(Number(score.replace(/\s/g, '')) > 0);
    await page.getByTestId('wordfall-input').fill(word);
    await page.getByTestId('wordfall-input').press('Enter');
    assert.equal(await stat(page, 'Score'), score, 'repeated word cannot score again');
    await shot(page, 'wordfall-free-playing');
  });
  await scenario('space-pause-resume-controls', async page => {
    await open(page, 'space-lex');
    await start(page);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Reprendre', exact: true }).first().waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Pause (Échap)', exact: true }).waitFor();
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(250);
    await page.keyboard.press('Escape');
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('Escape');
    await shot(page, 'space-controls');
  });
  await scenario('general-pages-all-course-levels', async page => {
    for (const route of ['/', '/quest', '/tous-les-cours', '/about', '/auth/login', '/auth/signup', '/auth/forgot', '/cours/1', '/cours/10', '/cours/20', '/cours/30', '/cours/40', '/cours/50']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      await page.getByRole('heading', { level: 1 }).first().waitFor();
      assert.ok((await page.locator('body').innerText()).length > 150, route);
    }
    const unknown = await page.goto(base + '/play/unknown-game-audit');
    // Next can stream a not-found page with HTTP 200 after the layout starts.
    assert.ok([200, 404].includes(unknown.status()));
    assert.match(await page.locator('body').innerText(), /404/);
    assert.ok(await page.locator('meta[name="robots"][content*="noindex"]').count());
  });
  fs.writeFileSync(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  process.exitCode = report.checks.some(check => !check.ok) ? 1 : 0;
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
