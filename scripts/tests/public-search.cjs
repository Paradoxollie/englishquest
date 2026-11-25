// Run against a local production build. Use --sample for a short check on Omega.
const assert = require("node:assert/strict");
const { parse } = require("next/dist/compiled/node-html-parser");

const base = new URL(process.argv[2] || "http://127.0.0.1:3000");
const sample = process.argv.includes("--sample");
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://englishquest-omega.vercel.app").origin;
const headers = { "User-Agent": "EnglishQuest-Search-Check", Purpose: "prefetch" };

async function read(path) {
  const response = await fetch(new URL(path, base), { headers, redirect: "manual" });
  assert.equal(response.status, 200, path);
  return parse(await response.text());
}

function hrefs(doc) {
  return new Set(doc.querySelectorAll("a[href]").map(link => link.getAttribute("href")));
}

async function run() {
  const sitemap = await read("/sitemap.xml");
  const paths = sitemap.querySelectorAll("loc").map(node => {
    const url = new URL(node.textContent);
    assert.equal(url.origin, canonicalOrigin);
    return url.pathname;
  });
  assert.equal(new Set(paths).size, paths.length, "duplicate sitemap entry");
  assert.deepEqual(paths.filter(path => path.startsWith("/quest/atlas/")), ["/quest/atlas/1"]);
  assert.ok(paths.every(path => !/^\/(auth|teachers|dashboard|rejoindre|direct|profile|messages)(\/|$)/.test(path)));

  const landmarks = ["/", "/play", "/tous-les-cours", "/cours/1", "/cours/11", "/cours/19", "/play/speed-verb-challenge", "/play/space-lex", "/quest/atlas", "/quest/atlas/1", "/test-de-niveau", "/profs"];
  landmarks.forEach(path => assert.ok(paths.includes(path), path));
  const selected = sample ? landmarks : paths;
  const documents = new Map();
  const titles = new Set();
  const descriptions = new Set();
  for (let start = 0; start < selected.length; start += 4) {
    await Promise.all(selected.slice(start, start + 4).map(async path => {
      const doc = await read(path);
      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
      assert.equal(canonical && new URL(canonical).href, new URL(path, canonicalOrigin).href, path);
      assert.equal(doc.querySelectorAll("h1").length, 1, path);
      assert.ok(doc.querySelector("h1").textContent.trim(), path);
      assert.ok(!doc.querySelectorAll('meta[name="robots"]').some(tag => /noindex/i.test(tag.getAttribute("content"))), path);
      const title = doc.querySelector("title")?.textContent.trim();
      const description = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim();
      assert.ok(title && !titles.has(title), "missing or duplicate title on " + path);
      assert.ok(description && !descriptions.has(description), "missing or duplicate description on " + path);
      titles.add(title);
      descriptions.add(description);
      if (landmarks.includes(path)) documents.set(path, doc);
    }));
  }

  for (const [directory, prefix] of [["/tous-les-cours", "/cours/"], ["/play", "/play/"]]) {
    const fromDirectory = [...hrefs(documents.get(directory))].filter(path => path.startsWith(prefix)).sort();
    assert.deepEqual(fromDirectory, paths.filter(path => path.startsWith(prefix)).sort(), directory);
  }
  const home = documents.get("/");
  const site = home.querySelectorAll('script[type="application/ld+json"]').map(node => JSON.parse(node.textContent))
    .find(data => data["@type"] === "WebSite");
  assert.equal(site?.name, "English Quest");
  assert.equal(new URL(site.url).origin, canonicalOrigin);
  assert.ok(hrefs(home).has("/play"));
  assert.ok(hrefs(documents.get("/cours/1")).has("/quest/atlas/1"));

  const verbs = "/play/speed-verb-challenge";
  const section = "section-quelques-verbes-irreguliers";
  assert.ok(hrefs(documents.get("/cours/11")).has(verbs));
  assert.ok(documents.get("/cours/11").getElementById(section));
  assert.ok(hrefs(documents.get(verbs)).has("/cours/11#" + section));
  const first = documents.get("/quest/atlas/1");
  const image = new URL(first.querySelector('meta[property="og:image"]').getAttribute("content"));
  assert.equal(image.pathname, "/art/passage/quai.webp");
  const picture = await fetch(new URL(image.pathname, base), { method: "HEAD", headers });
  assert.equal(picture.status, 200);
  assert.match(picture.headers.get("content-type"), /image\/webp/);
  const second = await read("/quest/atlas/2");
  assert.match(second.querySelector('meta[name="robots"]').getAttribute("content"), /noindex/);
  assert.ok(hrefs(second).has("/quest/atlas/1"));
  const missing = await fetch(new URL("/quest/atlas/9999", base), { headers, redirect: "manual" });
  // Next can start streaming the Atlas layout before it discovers an unknown episode.
  assert.ok([200, 404].includes(missing.status));
  const errorPage = parse(await missing.text());
  assert.ok(errorPage.querySelectorAll('meta[name="robots"]').some(tag => /noindex/i.test(tag.getAttribute("content"))));
  console.log(paths.length + " sitemap entries, " + selected.length + " public pages checked, guest routes and links verified.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
