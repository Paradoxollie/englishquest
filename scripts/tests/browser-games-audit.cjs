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
const out = process.env.GAME_AUDIT_OUTPUT || path.join(root, 'output/playwright/audit-jeux');
const wordfallTranslations = require('../../lib/games/words/wordfall-words.json').manualWords.translations;
const grammarBank = require('../../lib/placement/questions.json');
fs.mkdirSync(out, { recursive: true });
const report = { base, checks: [], errors: [], screenshots: [] };
let browser;
async function scenario(name, run) {
  if (process.env.GAME_AUDIT_FILTER && !new RegExp(process.env.GAME_AUDIT_FILTER).test(name)) return;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  try {
    await run(page, errors);
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
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
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
  const slugs = ['wordfall', 'enigma-scroll', 'space-lex', 'flash-translation', 'flashback', 'speed-verb-challenge', 'grammar-rush', 'spell-strike', 'echo-signal'];
  await scenario('all-routes-desktop-mobile', async page => {
    for (const slug of slugs) {
      await open(page, slug);
      assert.equal(await page.locator('.eq-game-title').count(), 1);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, slug + ' mobile overflow');
      if (slug === 'space-lex') {
        const rules = await page.locator('.eq-game-main').textContent();
        assert.match(rules, /maintiens les flèches/);
        assert.match(rules, /Touche une cible/);
      }
      await shot(page, slug + '-mobile-start');
      await start(page);
      await page.waitForTimeout(200);
      assert.equal(await page.locator('.eq-game-play').count(), 1, slug + ' starts');
      if (slug === 'space-lex') {
        await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Activer le tir automatique', exact: true }).waitFor();
      }
      await shot(page, slug + '-mobile-playing');
      await page.setViewportSize({ width: 320, height: 540 });
      assert.equal(await page.evaluate(() => {
        const main = document.querySelector('.eq-game-main');
        return main.scrollWidth > main.clientWidth + 1;
      }), false, slug + ' controls fit a narrow phone');
      await page.setViewportSize({ width: 1440, height: 1000 });
      await shot(page, slug + '-desktop-playing');
    }
  });
  await scenario('spell-strike-and-echo-signal-play', async page => {
    // Mode écrit / lecture : coché s'il est proposé (il est imposé quand le navigateur n'a pas de voix anglaise).
    const tickTextMode = async label => {
      const box = page.getByLabel(label);
      if (await box.count()) await box.check();
    };
    await open(page, 'spell-strike');
    await tickTextMode(/Mode écrit/);
    await start(page);
    await page.getByTestId('spell-input').fill('zzzz');
    await page.getByTestId('game-submit').click();
    await page.locator('.eq-spell-feedback.is-wrong').waitFor();
    await page.locator('.eq-spell-diff').waitFor();
    await shot(page, 'spell-strike-feedback');
    await page.getByTestId('spell-continue').click();
    await page.getByTestId('spell-input').waitFor();
    assert.equal(await page.getByTestId('spell-input').inputValue(), '', 'next word starts empty');

    await open(page, 'echo-signal');
    await tickTextMode(/Mode lecture/);
    await start(page);
    await page.locator('.eq-echo-transcript').waitFor();
    await page.getByTestId('game-choice').first().click();
    await page.locator('.eq-spell-feedback').waitFor();
    await shot(page, 'echo-signal-feedback');
    await page.getByTestId('echo-continue').click();
    await page.getByTestId('game-choice').first().click();
    await page.getByTestId('echo-continue').waitFor();
  });
  await scenario('spell-clock-first-delivery-replay-and-fallback', async page => {
    await page.addInitScript(() => {
      if (window.speechSynthesis) Object.defineProperty(window.speechSynthesis, 'getVoices', {
        value: () => [{ name: 'French only', lang: 'fr-FR' }],
      });
      window.Audio = class {
        constructor(src) { this.src = src; this.currentTime = 0; this.duration = 2; }
        play() { window.testRecording = this; return Promise.resolve(); }
        pause() {}
      };
      document.addEventListener('submit', event => {
        if (event.target.querySelector('[data-testid="spell-input"]')) window.testSubmittedAt = performance.now();
      }, true);
    });
    await open(page, 'spell-strike');
    await page.clock.install();
    await page.evaluate(() => { Math.random = () => 0.314; });
    await start(page);
    const spell = engine('spellStrike');
    const input = page.getByTestId('spell-input');
    const submit = page.getByTestId('game-submit');
    const firstDelivery = () => page.evaluate(() => {
      const player = window.testRecording;
      const deliveredAt = performance.now();
      player.currentTime = player.duration;
      player.onended();
      return { id: new URL(player.src, location.href).pathname.split('/').pop().replace('.mp3', ''), deliveredAt };
    });
    for (const [streak, replay] of [[1, false], [2, true]]) {
      assert.equal(await input.isEditable(), false);
      await tick(page, 2500);
      assert.equal(await submit.isDisabled(), true, 'a delayed load cannot start the answer timer');
      const delivery = await firstDelivery();
      assert.equal(await input.isEditable(), true);
      const word = spell.SPELL_STRIKE_WORDS.find(item => item.id === delivery.id);
      assert.ok(word, delivery.id);
      if (replay) {
        await tick(page, 3000);
        await page.getByTestId('spell-play-word').click();
        await tick(page, 1000);
        await firstDelivery();
      }
      await input.fill(word.word);
      await submit.click();
      const submittedAt = await page.evaluate(() => window.testSubmittedAt);
      const expected = spell.computeSpellRoundPoints({
        difficulty: 2, correct: true, usedHint: false, reactionMs: submittedAt - delivery.deliveredAt, newStreak: streak,
      });
      const feedback = await page.locator('.eq-spell-feedback.is-right').innerText();
      const points = Number(feedback.match(/\+(\d+) pts/)[1]);
      assert.ok(Math.abs(points - expected) <= 1, feedback + ' expected ' + expected);
      await tick(page, 1150);
    }
    await page.evaluate(() => window.testRecording.onerror());
    await page.getByText(/^Phonétique ·/).waitFor();
    assert.equal(await input.isEditable(), true, 'written fallback unlocks the same answer field');
    await input.fill('test');
    assert.equal(await submit.isEnabled(), true);
  });
  await scenario('echo-recorded-message-pauses-and-resumes-in-place', async page => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'echo-signal');
    await page.evaluate(() => { Math.random = () => 0.314; });
    await start(page);
    const progress = page.getByRole('progressbar', { name: 'Progression du message' });
    await page.waitForFunction(() => document.querySelector('progress')?.value > 0.3);
    const control = page.getByTestId('echo-play-btn');
    assert.equal(await page.getByTestId('game-choice').first().isDisabled(), true);
    await control.click();
    assert.match(await control.innerText(), /Reprendre/);
    const pausedAt = await progress.evaluate(element => element.value);
    await page.waitForTimeout(450);
    assert.equal(await progress.evaluate(element => element.value), pausedAt);
    await shot(page, 'echo-progression-en-pause');
    await control.click();
    await page.waitForFunction(time => document.querySelector('progress')?.value > time + 0.15, pausedAt);
    await page.waitForFunction(() => {
      const choice = document.querySelector('[data-testid="game-choice"]');
      return choice && !choice.disabled;
    }, null, { timeout: 35000 });
    assert.match(await control.innerText(), /Réécouter \(1 restante\)/);
  });
  await scenario('flash-training-pace-and-unranked-results', async page => {
    await open(page, 'flash-translation');
    await page.getByLabel(/Entraînement sans attente/).check();
    await page.clock.install();
    await start(page);
    for (let round = 0; round < 10; round++) {
      // A 1.4–2.8 s ranked delay would leave this button unavailable.
      const choice = page.getByTestId('game-choice').first();
      await choice.waitFor({ timeout: 650 });
      assert.equal(await choice.isEnabled(), true);
      await choice.click();
      await tick(page, 1500);
    }
    await page.getByTestId('game-end').waitFor();
    await page.getByTestId('game-end').getByText(/hors classement/).waitFor();
    assert.equal(await page.getByTestId('game-end').getByRole('link', { name: 'Classement' }).count(), 0);
    await open(page, 'flashback');
    await page.getByLabel(/corrections à mon rythme/).check();
    await start(page);
    const prompt = page.getByTestId('game-prompt');
    const word = await prompt.innerText();
    await page.getByTestId('choice-seen').click();
    const next = page.getByRole('button', { name: 'Continuer au mot suivant' });
    await next.waitFor();
    await page.clock.install();
    await tick(page, 12000);
    assert.equal(await prompt.innerText(), word);
    await next.click();
    for (let i = 0; i < 2; i++) {
      await tick(page, 8000);
      if (i === 0) await next.click();
    }
    await page.getByTestId('game-end').getByText(/hors classement/).waitFor();
    assert.equal(await page.getByTestId('game-end').getByRole('link', { name: 'Classement' }).count(), 0);
  });
  await scenario('flash-translation-full-ten-rounds', async page => {
    await open(page, 'flash-translation');
    await page.clock.install();
    await start(page);
    let missedWord;
    for (let index = 0; index < 10; index++) {
      await readyChoices(page);
      const french = (await page.getByTestId('game-prompt').innerText()).trim();
      const english = vocabulary.get(french);
      assert.ok(english, french);
      if (index === 0) missedWord = { french, english };
      const choices = await page.getByTestId('game-choice').allTextContents();
      const right = choices.findIndex(text => text.replace(/^[1-4]\s*/, '').trim() === english);
      assert.ok(right >= 0, 'correct translation present');
      await page.getByTestId('game-choice').nth(index === 0 ? (right + 1) % 4 : right).click();
      if (index === 0) assert.equal(await stat(page, 'Erreurs'), '1');
      await tick(page, 1500);
    }
    await page.getByTestId('game-end').waitFor();
    assert.match(await page.getByTestId('game-end').innerText(), /1 erreur/);
    assert.ok(parseFloat((await page.locator('.eq-game-end-score').innerText()).replace(',', '.')) >= 5);
    await shot(page, 'flash-translation-ended');
    await page.getByRole('button', { name: 'Reprendre mes erreurs' }).click();
    const practice = page.getByTestId('mistake-practice');
    assert.equal(await practice.getByRole('heading').innerText(), missedWord.french);
    assert.equal(await practice.getByRole('textbox').inputValue(), '');
    await page.setViewportSize({ width: 375, height: 540 });
    await practice.getByRole('textbox').fill('xyz');
    await practice.getByRole('textbox').press('Enter');
    await practice.getByRole('status').filter({ hasText: missedWord.english }).waitFor();
    await practice.getByRole('button', { name: 'Voir mon bilan de révision' }).click();
    await page.getByRole('button', { name: 'Reprendre les réponses manquées' }).click();
    assert.equal(await practice.getByRole('heading').innerText(), missedWord.french);
    assert.equal(await practice.getByRole('textbox').inputValue(), '');
    assert.equal(await practice.getByRole('button', { name: missedWord.english, exact: true }).count(), 0);
    await shot(page, 'flash-translation-recall-narrow');
    await practice.getByRole('textbox').fill(missedWord.english);
    await practice.getByRole('button', { name: 'Vérifier' }).click();
    await practice.getByText(/Retrouvé !/).waitFor();
    await practice.getByRole('button', { name: 'Voir mon bilan de révision' }).click();
    await page.getByRole('heading', { name: 'Révision terminée' }).waitFor();
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
      await tick(page, 2300);
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
  await scenario('flashback-repeated-word-meaning-on-mobile', async page => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'flashback');
    await page.clock.install();
    await page.evaluate(() => { Math.random = () => 0.87; });
    await start(page);
    for (let i = 0; i < 2; i++) {
      assert.equal(await page.locator('.eq-game-prompt-meaning').count(), 0, 'meaning is not revealed while recalling');
      await page.getByTestId('choice-new').click();
      await page.locator('.eq-game-prompt-meaning').waitFor();
      await tick(page, 2300);
    }
    await page.getByTestId('choice-seen').click();
    assert.equal(await stat(page, 'Score'), '2', 'recognition alone did not score');
    const word = (await page.getByTestId('game-prompt').innerText()).trim();
    const correct = [...vocabulary].find(([,english]) => english.toLowerCase() === word.toLowerCase())[0];
    const choices = await page.getByTestId('meaning-choice').locator('span').allTextContents();
    assert.equal(new Set(choices).size, 3);
    await shot(page, 'flashback-meaning-mobile');
    await page.keyboard.press('Escape');
    const frozen = await stat(page, 'Temps');
    await tick(page, 19000);
    assert.equal(await stat(page, 'Temps'), frozen);
    await page.keyboard.press('Escape');
    await page.getByTestId('meaning-choice').nth(choices.indexOf(correct)).click();
    assert.equal(await stat(page, 'Score'), '3');
  });
  for (const [difficulty, fields] of [['Facile', 1], ['Moyen', 2], ['Difficile', 3]]) {
    await scenario('speed-verb-' + difficulty, async page => {
      await open(page, 'speed-verb-challenge');
      await page.getByRole('radio', { name: new RegExp('^' + difficulty) }).click();
      await page.clock.install();
      await start(page);
      assert.equal(await page.locator('.eq-game-field input').count(), fields);
      assert.deepEqual(await page.locator('.eq-game-field input').evaluateAll(inputs => inputs.map(el => el.placeholder)),
        ['Prétérit', 'Participe passé', 'Traduction'].slice(0, fields), 'inputs never display a form of the answer');
      const infinitive = (await page.getByTestId('game-prompt').innerText()).trim().toLowerCase();
      const word = verbs.find(v => v.base.toLowerCase() === infinitive);
      assert.ok(word, infinitive);
      await page.getByLabel('Prétérit', { exact: true }).fill(word.pastSimple[0]);
      if (fields >= 2) await page.getByLabel('Participe passé', { exact: true }).fill(word.pastParticiple[0]);
      if (fields >= 3) await page.getByLabel('Traduction', { exact: true }).fill(word.translations[0]);
      await page.getByTestId('game-submit').click();
      assert.equal(await stat(page, 'Série'), '1');
      await tick(page, 1800);
      const skipped = (await page.getByTestId('game-prompt').innerText()).trim();
      await page.getByRole('button', { name: 'Passer', exact: true }).click();
      assert.equal(await stat(page, 'Série'), '0');
      await tick(page, 100000);
      await page.getByTestId('game-end').waitFor();
      assert.match(await page.getByTestId('game-end').innerText(), /2/);
      await shot(page, 'speed-verb-' + difficulty + '-ended');
      await page.getByRole('button', { name: 'Reprendre mes erreurs' }).click();
      const practice = page.getByTestId('mistake-practice');
      assert.equal((await practice.getByRole('heading').innerText()).toLowerCase(), skipped.toLowerCase());
      const verb = verbs.find(v => v.base.toLowerCase() === skipped.toLowerCase());
      const solutions = { 'Prétérit': verb.pastSimple[0], 'Participe passé': verb.pastParticiple[0], 'Traduction française': verb.translations[0] };
      for (let i = 0; i < fields; i++) {
        const label = (await practice.locator('label span').innerText()).trim();
        await practice.getByRole('textbox').fill(solutions[label]);
        await practice.getByRole('button', { name: 'Vérifier' }).click();
        await practice.getByText(/Retrouvé !/).waitFor();
        await practice.getByRole('button', { name: /Continuer la révision|Voir mon bilan de révision/ }).click();
      }
      await page.getByRole('heading', { name: 'Révision terminée' }).waitFor();
    });
  }
  await scenario('grammar-feedback-timeout-replay', async page => {
    await open(page, 'grammar-rush');
    await page.clock.install();
    await start(page);
    const prompt = await page.locator('.eq-game-prompt').innerText();
    const options = await page.getByTestId('game-choice').allTextContents();
    const labels = await page.getByTestId('game-choice').locator('span').allTextContents();
    const item = grammarBank.find(q => q.question === prompt && q.options.every(o => labels.includes(o)));
    assert.ok(item, prompt);
    const right = item.options[item.correctAnswer];
    await page.getByTestId('game-choice').nth(labels.findIndex(label => label !== right)).click();
    assert.equal(await page.locator('.eq-game-prompt').innerText(), prompt);
    assert.deepEqual(await page.getByTestId('game-choice').allTextContents(), options);
    await tick(page, 1700);
    assert.notEqual(await page.locator('.eq-game-prompt').innerText(), prompt);
    await tick(page, 61000);
    await page.getByTestId('game-end').waitFor();
    await shot(page, 'grammar-rush-ended');
    await page.getByRole('button', { name: 'Reprendre mes erreurs' }).click();
    const practice = page.getByTestId('mistake-practice');
    assert.equal(await practice.getByRole('heading').innerText(), prompt);
    await practice.getByRole('button', { name: right, exact: true }).click();
    await practice.getByRole('button', { name: 'Voir mon bilan de révision' }).click();
    await page.getByRole('heading', { name: 'Révision terminée' }).waitFor();
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
      await page.getByRole('button', { name: 'Utiliser ce mot dans une phrase' }).click();
      const target = await page.getByTestId('enigma-reveal').locator('.eq-enigma-meaning b').innerText();
      const sentence = 'I wrote a story about ' + target.toLowerCase() + '.';
      await page.getByTestId('enigma-sentence').fill(sentence);
      await page.getByRole('button', { name: 'Garder dans le bilan' }).click();
      await page.getByText(sentence, { exact: true }).waitFor();
      await shot(page, 'enigma-' + letters + '-ended');
    });
  }
  await scenario('enigma-keyboard-sentence-and-next-word-mobile', async page => {
    await page.setViewportSize({ width: 320, height: 540 });
    await open(page, 'enigma-scroll');
    await page.getByRole('radio', { name: /^4 lettres/ }).click();
    await page.evaluate(() => { Math.random = () => 0; });
    await page.clock.install();
    await start(page);
    const expected = engine('enigma-scroll-targets').pickEnigmaTargetWord(4, 1, new Set(), () => 0);
    const hint = page.getByRole('button', { name: 'Indice FR' });
    await hint.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: /Indice.*livre/i }).waitFor();
    await page.keyboard.type(expected.toLowerCase());
    await page.keyboard.press('Enter');
    await page.getByTestId('next-word').waitFor();
    assert.equal(await page.getByRole('gridcell', { name: /bien placée/ }).count(), 4);
    const points = await stat(page, 'Score');
    await page.getByRole('button', { name: 'Utiliser ce mot dans une phrase' }).click();
    const field = page.getByTestId('enigma-sentence');
    await field.fill('A sentence without the target.');
    await field.press('Enter');
    await page.getByRole('status').filter({ hasText: /ajoute au moins un autre mot/ }).waitFor();
    const sentence = 'I packed this ' + expected.toLowerCase() + ' for the trip.';
    await field.fill(sentence);
    await field.press('Enter');
    await page.getByText(sentence, { exact: true }).waitFor();
    assert.equal(await stat(page, 'Score'), points);
    await shot(page, 'enigma-narrow-win-and-sentence');
    await page.getByTestId('next-word').click();
    await tick(page, 91000);
    await page.getByTestId('game-end').waitFor();
    await page.getByText(sentence, { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Modifier ma phrase' }).click();
    assert.equal(await page.getByTestId('enigma-sentence').inputValue(), sentence);
  });
  await scenario('wordfall-exact-pause-miss-replay', async page => {
    await open(page, 'wordfall');
    await start(page);
    await page.locator('.eq-fall-card').first().waitFor();
    const card = page.locator('.eq-fall-card').first();
    const french = (await card.locator('b').innerText()).trim().toLowerCase();
    const english = Object.keys(wordfallTranslations).find(word => wordfallTranslations[word].toLowerCase().split(',')[0] === french);
    assert.ok(english, french);
    await page.getByTestId('wordfall-input').fill(english[0]);
    assert.equal(await page.locator('.eq-fall-card.is-targeted').count(), 0, 'partial letters do not reveal a French cue’s spelling');
    await page.getByRole('button', { name: 'Indice', exact: true }).click();
    await page.getByRole('status').filter({ hasText: /commence par|une seule lettre/ }).waitFor();
    await page.getByTestId('wordfall-input').fill(english);
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
    assert.match(await page.getByTestId('mission-example').innerText(), /exemple de cible/i);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Reprendre', exact: true }).first().waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Pause (Échap)', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Passer', exact: true }).click();
    const ship = page.locator('.eq-space-ship-anchor');
    const shipPosition = () => ship.evaluate(element => parseFloat(element.style.left));
    const initialX = await shipPosition();
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(x => parseFloat(document.querySelector('.eq-space-ship-anchor')?.style.left) > x, initialX);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Reprendre', exact: true }).first().waitFor();
    const frozenX = await shipPosition();
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(150);
    assert.equal(await shipPosition(), frozenX);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.press('Escape');
    report.frameTiming = await page.evaluate(() => new Promise(done => {
      const samples = [];
      let last;
      function frame(time) {
        if (last !== undefined) samples.push(time - last);
        last = time;
        if (samples.length < 90) return requestAnimationFrame(frame);
        samples.sort((a, b) => a - b);
        done({ game: 'space-lex', frames: samples.length, medianMs: Math.round(samples[45]), p95Ms: Math.round(samples[85]) });
      }
      requestAnimationFrame(frame);
    }));
    await shot(page, 'space-controls');
  });
  await scenario('general-pages-all-course-levels', async (page, errors) => {
    for (const route of ['/', '/play', '/quest', '/tous-les-cours', '/about', '/auth/login', '/auth/signup', '/auth/forgot', '/cours/1', '/cours/10', '/cours/20', '/cours/30', '/cours/40', '/cours/50']) {
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      await page.getByRole('heading', { level: 1 }).first().waitFor();
      assert.ok((await page.locator('body').innerText()).length > 150, route);
    }
    assert.ok((await page.locator('a[href^="/leaderboard"]').count()) >= 2, 'header/footer leaderboard links present');
    await page.goto(base + '/play');
    assert.equal(await page.locator('.eq-games-grid a[href^="/play/"]').count(), 9, 'all 9 games listed on /play');
    assert.deepEqual(errors, [], 'browser errors on valid routes');
    const errorCountBeforeNotFound = errors.length;
    const unknown = await page.goto(base + '/play/unknown-game-audit');
    // Next can stream a not-found page with HTTP 200 after the layout starts.
    assert.ok([200, 404].includes(unknown.status()));
    assert.match(await page.locator('body').innerText(), /404/);
    assert.ok(await page.locator('meta[name="robots"][content*="noindex"]').count());
    if (unknown.status() === 404) {
      const extra = errors.splice(errorCountBeforeNotFound);
      assert.equal(extra.every(msg => msg.includes('status of 404')), true, extra.join('; '));
    }
  });
  assert.ok(report.checks.length, 'No browser scenarios matched');
  fs.writeFileSync(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  process.exitCode = report.checks.some(check => !check.ok) ? 1 : 0;
})().catch(async error => { console.error(error); if (browser) await browser.close(); process.exitCode = 1; });
