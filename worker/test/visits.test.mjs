// Offline tests for the journey visit counter.
// Run: node worker/test/visits.test.mjs
import assert from "node:assert/strict";
import { classifyVisitor, journeySlugFor, recordJourneyVisit } from "../src/visits.js";

let failures = 0;
function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log("ok  ", name))
    .catch((e) => { failures++; console.log("FAIL", name, "\n    ", e.message); });
}

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const req = (url, headers = {}, method = "GET") => new Request(url, { method, headers });

await test("classifies people, previews and bots", () => {
  assert.equal(classifyVisitor(IPHONE), "person");
  assert.equal(classifyVisitor("Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36 Line/14.0"), "person");
  assert.equal(classifyVisitor("WhatsApp/2.24.1 A"), "preview");
  assert.equal(classifyVisitor("facebookexternalhit/1.1 Facebot Twitterbot/1.0"), "preview");
  assert.equal(classifyVisitor("Googlebot/2.1"), "bot");
  assert.equal(classifyVisitor("curl/8.7.1"), "bot");
  assert.equal(classifyVisitor(""), "bot");
});

await test("finds the slug for page loads only", () => {
  const base = "https://templia.art/journey/2026-11-13-to-2026-11-17-anne";
  assert.equal(journeySlugFor(req(base + "/")), "2026-11-13-to-2026-11-17-anne");
  assert.equal(journeySlugFor(req(base)), "2026-11-13-to-2026-11-17-anne");
  assert.equal(journeySlugFor(req(base + "/index.html")), "2026-11-13-to-2026-11-17-anne");
  assert.equal(journeySlugFor(req(base + ".html")), "2026-11-13-to-2026-11-17-anne");
  assert.equal(journeySlugFor(req("https://templia.art/journey/?checkin=2026-10-16&checkout=2026-10-23&guest=Katya")), "2026-10-16-to-2026-10-23");
  assert.equal(journeySlugFor(req(base + "/__next._full.txt")), null);
  assert.equal(journeySlugFor(req(base + "/", { RSC: "1" })), null);
  assert.equal(journeySlugFor(req(base + "/", { "Sec-Fetch-Dest": "empty" })), null);
  assert.equal(journeySlugFor(req(base + "/", { "Sec-Fetch-Dest": "document" })), "2026-11-13-to-2026-11-17-anne");
  assert.equal(journeySlugFor(req(base + "/", {}, "HEAD")), null);
  assert.equal(journeySlugFor(req("https://templia.art/journey/")), null);
  assert.equal(journeySlugFor(req("https://templia.art/about/")), null);
});

await test("writes one aggregated upsert with Tulum day and country", async () => {
  const calls = [];
  const env = { DB: { prepare: (sql) => ({ bind: (...args) => ({ run: async () => calls.push({ sql, args }) }) }) } };
  const r = req("https://templia.art/journey/2026-11-13-to-2026-11-17-anne/", { "User-Agent": IPHONE });
  Object.defineProperty(r, "cf", { value: { country: "US" } });
  // 03:00 UTC on Nov 14 is still Nov 13 in Tulum.
  assert.equal(await recordJourneyVisit(r, env, new Date("2026-11-14T03:00:00Z")), true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /ON CONFLICT/);
  assert.deepEqual(calls[0].args.slice(0, 4), ["2026-11-13-to-2026-11-17-anne", "2026-11-13", "person", "US"]);
  assert.equal(await recordJourneyVisit(req("https://templia.art/about/"), env), false);
  assert.equal(calls.length, 1);
});

process.exit(failures ? 1 : 0);
