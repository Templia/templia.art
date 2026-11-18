// Offline tests for the private /visits page: Access token check and rendering.
// Run: node worker/test/visits-page.test.mjs
import assert from "node:assert/strict";
import { verifyAccess, renderVisitsPage, handleVisitsPage } from "../src/visits-page.js";
import { tally } from "../src/owner-summary.js";

let failures = 0;
async function test(name, fn) {
  try { await fn(); console.log("ok  ", name); } catch (e) { failures++; console.log("FAIL", name, "\n    ", e.message); }
}

const TEAM = "templia.cloudflareaccess.com";
const AUD = "aud-tag-123";
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, OWNER_EMAIL: "owner@example.com" };

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true, ["sign", "verify"],
);
const jwk = { ...(await crypto.subtle.exportKey("jwk", publicKey)), kid: "k1", alg: "RS256" };
globalThis.fetch = async (u) => {
  assert.equal(String(u), `https://${TEAM}/cdn-cgi/access/certs`);
  return new Response(JSON.stringify({ keys: [jwk] }));
};

const b64url = (bytes) => Buffer.from(bytes).toString("base64url");
async function token(claims, { kid = "k1", key = privateKey } = {}) {
  const h = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", kid })));
  const p = b64url(new TextEncoder().encode(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64url(new Uint8Array(sig))}`;
}
const good = { aud: [AUD], iss: `https://${TEAM}`, email: "Owner@Example.com", exp: Math.floor(Date.now() / 1000) + 600 };
const withToken = (t) => new Request("https://templia.art/visits", { headers: t ? { "Cf-Access-Jwt-Assertion": t } : {} });

await test("accepts a valid token for the owner", async () => {
  assert.equal(await verifyAccess(withToken(await token(good)), env), "owner@example.com");
});

await test("rejects missing, wrong email, wrong audience, expired, wrong issuer", async () => {
  assert.equal(await verifyAccess(withToken(null), env), null);
  assert.equal(await verifyAccess(withToken(await token({ ...good, email: "guest@example.com" })), env), null);
  assert.equal(await verifyAccess(withToken(await token({ ...good, aud: ["other"] })), env), null);
  assert.equal(await verifyAccess(withToken(await token({ ...good, exp: 1 })), env), null);
  assert.equal(await verifyAccess(withToken(await token({ ...good, iss: "https://evil.example" })), env), null);
});

await test("rejects tampered payload and unknown key", async () => {
  const t = await token(good);
  const [h, , s] = t.split(".");
  const forged = b64url(new TextEncoder().encode(JSON.stringify({ ...good, email: "owner@example.com", exp: good.exp + 99999 })));
  assert.equal(await verifyAccess(withToken(`${h}.${forged}.${s}`), env), null);
  assert.equal(await verifyAccess(withToken(await token(good, { kid: "nope" })), env), null);
  const other = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign"]);
  assert.equal(await verifyAccess(withToken(await token(good, { key: other.privateKey })), env), null);
});

await test("rejects everything when Access isn't configured", async () => {
  assert.equal(await verifyAccess(withToken(await token(good)), { OWNER_EMAIL: "owner@example.com" }), null);
});

await test("handler answers 403 without a valid token, private headers", async () => {
  const res = await handleVisitsPage(withToken(null), { ...env, DB: {} });
  assert.equal(res.status, 403);
  assert.match(res.headers.get("Cache-Control"), /no-store/);
});

await test("renders cards with status, sources and escaped names", () => {
  const rows = [
    { day: "2026-11-14", kind: "person", via: "guest", hits: 2, first_at: "2026-11-14T15:00:00Z", last_at: "2026-11-14T18:00:00Z" },
    { day: "2026-11-14", kind: "preview", via: "guest", hits: 1, first_at: "2026-11-14T14:00:00Z", last_at: "2026-11-14T14:00:00Z" },
  ];
  const stay = { slug: "2026-11-13-to-2026-11-17", guest: "Anne <b>Marie</b>", check_in: "2026-11-13", check_out: "2026-11-17",
    rows, total: tally(rows), firstOpen: rows[0].first_at, lastOpen: rows[0].last_at };
  const quiet = { slug: "2026-11-20-to-2026-11-22", guest: "Sam", check_in: "2026-11-20", check_out: "2026-11-22",
    rows: [], total: tally([]), firstOpen: undefined, lastOpen: undefined };
  const html = renderVisitsPage({ current: [stay, quiet], past: [] }, "2026-11-18", "2026-11-18T15:00:00Z");
  assert.match(html, /Anne &lt;b&gt;Marie&lt;\/b&gt;/);
  assert.match(html, /class="pill ok">Opened/);
  assert.match(html, /class="pill none">Not opened yet/);
  assert.match(html, /<strong>2<\/strong> opens by people/);
  assert.match(html, /\/journey\/2026-11-13-to-2026-11-17\/\?me/);
  assert.match(html, /First opened Nov 14, 10:00 AM/);
  assert.match(html, /noindex/);
});

process.exit(failures ? 1 : 0);
