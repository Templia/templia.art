#!/usr/bin/env node
// Copies the guest stays from guests/*.md into the private D1 `journeys`
// table, so the Worker's morning summary knows which pages to report on.
// Only guest first name and dates are sent; nothing here is published.
//
//   node scripts/register-journeys.mjs           # live database
//   node scripts/register-journeys.mjs --local   # wrangler dev database
//
// Run it after adding or changing a guest file (part of deploying a journey).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import url from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const guestsDir = path.join(root, "guests");
const target = process.argv.includes("--local") ? "--local" : "--remote";

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const now = new Date().toISOString();

const rows = [];
for (const f of fs.readdirSync(guestsDir).sort()) {
  if (!f.endsWith(".md") || f.startsWith("_")) continue;
  const fm = frontmatter(fs.readFileSync(path.join(guestsDir, f), "utf8"));
  if (!fm || !DATE.test(fm.checkin || "") || !DATE.test(fm.checkout || "")) {
    console.warn(`skipped ${f}: missing checkin/checkout`);
    continue;
  }
  rows.push({ slug: `${fm.checkin}-to-${fm.checkout}`, guest: fm.guest || "Guest", ...fm });
}

// Two guest files can share dates (e.g. three people, one stay): keep one row per stay.
const bySlug = new Map();
for (const r of rows) {
  const prev = bySlug.get(r.slug);
  bySlug.set(r.slug, prev ? { ...prev, guest: `${prev.guest} & ${r.guest}` } : r);
}

const sql = [...bySlug.values()]
  .map(
    (r) =>
      `INSERT INTO journeys (slug, guest, check_in, check_out, updated_at) VALUES (${sqlStr(r.slug)}, ${sqlStr(r.guest)}, ${sqlStr(r.checkin)}, ${sqlStr(r.checkout)}, ${sqlStr(now)})
  ON CONFLICT (slug) DO UPDATE SET guest = excluded.guest, check_in = excluded.check_in, check_out = excluded.check_out, updated_at = excluded.updated_at;`,
  )
  .join("\n");

const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "journeys-")), "journeys.sql");
fs.writeFileSync(tmp, sql + "\n");
execFileSync("npx", ["wrangler", "d1", "execute", "templia-subscriptions", target, "--file", tmp, "--yes"], {
  cwd: path.join(root, "worker"),
  stdio: ["ignore", "ignore", "inherit"],
});
fs.rmSync(path.dirname(tmp), { recursive: true });
console.log(`registered ${bySlug.size} stays (${target.slice(2)})`);
