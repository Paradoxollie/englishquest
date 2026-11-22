// Run with the site's URL. AUDIT_PLAYWRIGHT_PACKAGE and CHROMIUM_PATH can point to a local install.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.AUDIT_PLAYWRIGHT_PACKAGE || "playwright");
const base = new URL(process.argv[2] || "http://127.0.0.1:3000");
const trial = "Essayer l’aventure BD";

async function verifyChapterBookmark(page, path, chapter) {
  await page.goto(path + "#chapitre-" + chapter);
  await page.waitForFunction(id => {
    const nodes = document.querySelectorAll("#chapitre-" + id);
    if (nodes.length !== 1 || !nodes[0].getClientRects().length) return false;
    const top = nodes[0].getBoundingClientRect().top;
    return scrollY > 0 && top >= 0 && top < 180;
  }, chapter);
  assert.equal(new URL(page.url()).pathname, path);
}

async function verify(browser, width) {
  const context = await browser.newContext({
    baseURL: base.origin,
    viewport: { width, height: 844 },
    locale: "fr-FR",
    reducedMotion: "reduce",
    hasTouch: width < 600,
    isMobile: width < 600,
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    if (process.env.ATLAS_SHARE_URL) await page.goto(process.env.ATLAS_SHARE_URL);
    const link = name => page.getByRole("link", { name, exact: true });
    const button = name => page.getByRole("button", { name });
    await page.goto("/");
    assert.equal(await link(trial).getAttribute("href"), "/quest/atlas");
    assert.equal(await link("Commencer la mission 1").getAttribute("href"), "/cours/1");
    await verifyChapterBookmark(page, "/quest", 3);
    assert.equal(await page.locator(".eq-map-chapter").count(), 5);
    assert.equal(await button(/^Mission \d+,/).count(), 50);
    await link(trial).click();
    await page.locator("#atlas-name").waitFor();
    assert.equal(new URL(page.url()).pathname, "/quest/atlas");
    assert.equal(await page.locator(".atlas-stops > li").count(), 15);
    await page.getByRole("link", { name: /Commencer l’aventure/ }).click();
    await button(/Ouvrir la BD/).click();
    await button(/Lire la bulle/).click();
    assert.equal(await page.locator(".comic-balloon strong").innerText(), "Maya");
    await page.getByRole("link", { name: /Carte des mondes/ }).click();
    await page.locator("#atlas-name").waitFor();
    assert.equal(new URL(page.url()).pathname, "/quest/atlas");
    await page.goto("/quest");
    await link(trial).click();
    await page.locator(".atlas-cover-copy .atlas-cta").click();
    await page.locator(".comic-balloon").waitFor();
    assert.equal(await page.locator(".comic-balloon strong").innerText(), "Maya");
    await page.goto("/quest#atlas");
    await page.waitForURL(url => url.pathname === "/quest/atlas");
    await link("Retrouver ma carte des 50 cours").click();
    await page.locator(".eq-quest-progress").waitFor();
    assert.equal(new URL(page.url()).pathname, "/tous-les-cours/parcours");
    assert.match(await page.locator(".eq-quest-progress").innerText(), /0\s*\/\s*50/);
    await verifyChapterBookmark(page, "/tous-les-cours/parcours", 5);
    await page.goto("/contact?escale=1");
    assert.equal(await page.locator("#subject").inputValue(), "Avis sur l’aventure BD · Escale 1 · Le robot du quai 7");
    await page.goto("/contact?cours=1&exercice=x9");
    assert.equal(await page.locator("#subject").inputValue(), "Question du cours 1 (exercice x9)");
    assert.deepEqual(errors, []);
    console.log(width + " px: classic map, optional comic, guest resume, bookmarks and feedback verified.");
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  try {
    await Promise.all([390, 1366].map(width => verify(browser, width)));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
