// Offline tests for the journey visit counter.
// Run: node worker/test/visits.test.mjs
import assert from "node:assert/strict";
import { classifyVisitor, journeySlugFor, recordJourneyVisit, viaFor } from "../src/visits.js";
import { buildOwnerSummary } from "../src/owner-summary.js";

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
  assert.deepEqual(calls[0].args.slice(0, 5), ["2026-11-13-to-2026-11-17-anne", "2026-11-13", "person", "", "US"]);
  assert.equal(await recordJourneyVisit(req("https://templia.art/about/"), env), false);
  assert.equal(calls.length, 1);
});

await test("?me visits are not counted; ?via is recorded", async () => {
  const base = "https://templia.art/journey/2026-11-13-to-2026-11-17-anne/";
  assert.equal(journeySlugFor(req(base + "?me")), null);
  assert.equal(journeySlugFor(req(base + "?via=guest&me=1")), null);
  assert.equal(viaFor(req(base)), "");
  assert.equal(viaFor(req(base + "?via=Guest")), "guest");
  assert.equal(viaFor(req(base + "?via=<script>")), "other");
  const calls = [];
  const env = { DB: { prepare: (sql) => ({ bind: (...args) => ({ run: async () => calls.push(args) }) }) } };
  await recordJourneyVisit(req(base + "?via=guest", { "User-Agent": IPHONE }), env, new Date("2026-11-14T15:00:00Z"));
  assert.equal(calls[0][3], "guest");
});

const J = { slug: "2026-11-13-to-2026-11-17", guest: "Anne Marie", check_in: "2026-11-13", check_out: "2026-11-17" };

await test("summary: not opened, but previewed", () => {
  const s = buildOwnerSummary([J], new Map([[J.slug, [{ day: "2026-11-13", kind: "preview", via: "guest", hits: 2, first_at: "2026-11-13T20:00:00Z" }]]]), "2026-11-14");
  assert.equal(s.notOpened, 1);
  assert.match(s.subject, /Sat Nov 14 · 1 not opened yet/);
  assert.match(s.text, /Anne Marie · Nov 13–Nov 17 · day 2 of 5/);
  assert.match(s.text, /Not opened yet — but the link was previewed 2×/);
});

await test("summary: opens split by source, bots ignored", () => {
  const rows = [
    { day: "2026-11-13", kind: "person", via: "guest", hits: 2, first_at: "2026-11-13T23:20:00Z" },
    { day: "2026-11-13", kind: "person", via: "", hits: 1, first_at: "2026-11-14T01:00:00Z" },
    { day: "2026-11-12", kind: "person", via: "email", hits: 1, first_at: "2026-11-12T13:05:00Z" },
    { day: "2026-11-13", kind: "bot", via: "", hits: 40, first_at: "2026-11-13T10:00:00Z" },
  ];
  const s = buildOwnerSummary([J], new Map([[J.slug, rows]]), "2026-11-14");
  assert.equal(s.notOpened, 0);
  assert.doesNotMatch(s.subject, /not opened/);
  assert.match(s.text, /Yesterday: 3 opens \(2 from the guest link, 1 other\)/);
  assert.match(s.text, /So far: 4 opens \(2 from the guest link, 1 from the daily email, 1 other\)/);
  assert.match(s.text, /First opened: Nov 12, 8:05 AM/);
  assert.doesNotMatch(s.text, /40/);
});

await test("summary: phases before and after the stay", () => {
  assert.match(buildOwnerSummary([J], new Map(), "2026-11-12").text, /arrives tomorrow/);
  assert.match(buildOwnerSummary([J], new Map(), "2026-11-17").text, /checkout day/);
  assert.match(buildOwnerSummary([J], new Map(), "2026-11-18").text, /checked out/);
  assert.equal(buildOwnerSummary([], new Map(), "2026-11-14"), null);
});

process.exit(failures ? 1 : 0);
