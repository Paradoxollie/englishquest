const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const filename = path.join(__dirname, "../../lib/classes/live-ceremony.ts");
const mod = new Module(filename, module);
mod._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { ceremonyStep, CEREMONY_SETTLE_MS, CEREMONY_INTRO_MS, CEREMONY_REVEAL_MS, CEREMONY_WINNER_MS } = mod.exports;
const room = { createdAt: 0, startsAt: 1000, endsAt: 61_000, stoppedAt: null };
const settle = room.endsAt + CEREMONY_SETTLE_MS;
const third = settle + CEREMONY_INTRO_MS;
const second = third + CEREMONY_REVEAL_MS;
const first = second + CEREMONY_REVEAL_MS;
const places = [1, 1, 2, 3, 4, 5];
assert.equal(ceremonyStep(room, settle-1, places).phase,"settling");
assert.deepEqual(ceremonyStep(room, settle, places).revealed,[]);
assert.deepEqual(ceremonyStep(room, third, places).revealed,[3]);
assert.deepEqual(ceremonyStep(room, second, places).revealed,[3,2]);
assert.deepEqual(ceremonyStep(room, first, places).revealed,[3,2,1]);
assert.equal(ceremonyStep(room, first+CEREMONY_WINNER_MS, places).phase,"complete");
assert.deepEqual(ceremonyStep(room, third, [1,1,3]).revealed,[3]);
assert.equal(ceremonyStep(room, second, [1,1,3]).spotlight,1);
assert.equal(ceremonyStep(room, third, [1]).spotlight,1);
assert.equal(ceremonyStep(room, settle, []).phase,"complete");
assert.equal(ceremonyStep({...room,stoppedAt:700},700,[]).phase,"complete");
assert.equal(ceremonyStep({...room,stoppedAt:20_000},28_000,[1]).phase,"intro");
console.log("PASS Shared podium clock: settle, bronze, silver, gold, ties, empty rooms, late arrivals and early stops");
