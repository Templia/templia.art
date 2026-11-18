// GET /visits — the owner's private, live view of journey page visits.
//
// Two locks:
//  1. Cloudflare Access sits in front of templia.art/visits and asks for a
//     one-time code sent to the owner's email before the request reaches us.
//  2. This handler also verifies the Access token itself (signature, audience,
//     expiry, email = OWNER_EMAIL), so if the Access app were ever removed or
//     misconfigured the page answers 403 instead of opening up.
//
// Needs Worker secrets ACCESS_TEAM_DOMAIN (e.g. "templia.cloudflareaccess.com"),
// ACCESS_AUD (the Access application's audience tag) and OWNER_EMAIL.

import { addDaysIso, escapeHtml, tulumToday } from "./subscriptions.js";
import { daysBetween, shortDate, stayPhase, tally, tulumStamp } from "./owner-summary.js";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};

// ---------------------------------------------------------------------------
// Access token check
// ---------------------------------------------------------------------------

function b64urlBytes(s) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
const b64urlJson = (s) => JSON.parse(new TextDecoder().decode(b64urlBytes(s)));

/** Returns the signed-in email if the request carries a valid Access token for the owner, else null. */
export async function verifyAccess(request, env, now = Date.now()) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  const team = env.ACCESS_TEAM_DOMAIN;
  if (!token || !team || !env.ACCESS_AUD || !env.OWNER_EMAIL) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = b64urlJson(parts[0]);
    const payload = b64urlJson(parts[1]);
    if (header.alg !== "RS256") return null;

    const res = await fetch(`https://${team}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600 } });
    const { keys = [] } = await res.json();
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      b64urlBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!ok) return null;

    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (payload.iss !== `https://${team}`) return null;
    if (!payload.exp || payload.exp * 1000 < now) return null;
    const email = String(payload.email || "").toLowerCase();
    if (email !== String(env.OWNER_EMAIL).toLowerCase()) return null;
    return email;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function loadStays(env, today) {
  const { results: journeys } = await env.DB.prepare(
    `SELECT slug, guest, check_in, check_out FROM journeys ORDER BY check_in DESC`,
  ).all();
  const { results: visits } = await env.DB.prepare(
    `SELECT slug, day, kind, via, SUM(hits) AS hits, MIN(first_at) AS first_at, MAX(last_at) AS last_at
     FROM journey_visits GROUP BY slug, day, kind, via`,
  ).all();

  // Visits arrive on "<base>" or "<base>-<firstname>"; fold them onto the base slug.
  const byBase = new Map();
  for (const v of visits) {
    const base = v.slug.slice(0, 24); // YYYY-MM-DD-to-YYYY-MM-DD
    if (!byBase.has(base)) byBase.set(base, []);
    byBase.get(base).push(v);
  }

  const current = [];
  const past = [];
  for (const j of journeys) {
    const rows = byBase.get(j.slug) || [];
    const people = rows.filter((r) => r.kind === "person");
    const stay = {
      ...j,
      rows,
      total: tally(rows),
      firstOpen: people.map((r) => r.first_at).sort()[0],
      lastOpen: people.map((r) => r.last_at).sort().at(-1),
    };
    const isCurrent = j.check_out >= addDaysIso(today, -7) && j.check_in <= addDaysIso(today, 30);
    (isCurrent ? current : past).push(stay);
  }
  current.reverse(); // soonest first
  return { current, past };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function status(stay) {
  if (stay.total.people) return { label: "Opened", cls: "ok" };
  if (stay.total.previews) return { label: "Shared, not opened", cls: "warn" };
  return { label: "Not opened yet", cls: "none" };
}

function sources(t) {
  const items = [
    ["Guest link", t.guest],
    ["Daily email", t.email],
    ["Other", t.otherPeople],
    ["Link previews", t.previews],
  ];
  return `<dl class="src">${items
    .map(([k, n]) => `<div><dt>${k}</dt><dd>${n}</dd></div>`)
    .join("")}</dl>`;
}

// One bar per day from 3 days before check-in to the day after checkout (people only).
function dayChart(stay, today) {
  const start = addDaysIso(stay.check_in, -3);
  const end = addDaysIso(stay.check_out, 1);
  const days = [];
  for (let d = start; d <= end; d = addDaysIso(d, 1)) days.push(d);
  const counts = days.map((d) =>
    stay.rows.filter((r) => r.day === d && r.kind === "person").reduce((s, r) => s + r.hits, 0),
  );
  const max = Math.max(1, ...counts);
  const bars = days
    .map((d, i) => {
      const inStay = d >= stay.check_in && d <= stay.check_out;
      const h = counts[i] ? Math.max(8, Math.round((counts[i] / max) * 100)) : 0;
      const label = `${shortDate(d)}: ${counts[i]} open${counts[i] === 1 ? "" : "s"}`;
      return `<div class="bar${inStay ? " stay" : ""}${d === today ? " today" : ""}" title="${label}" aria-label="${label}">
<span style="height:${h}%"></span><i>${counts[i] || ""}</i><b>${new Date(d + "T12:00:00Z").getUTCDate()}</b></div>`;
    })
    .join("");
  return `<div class="chart" role="img" aria-label="Opens per day">${bars}</div>`;
}

function stayCard(stay, today) {
  const s = status(stay);
  const nights = daysBetween(stay.check_in, stay.check_out);
  const opened = stay.firstOpen
    ? `<p class="meta">First opened ${escapeHtml(tulumStamp(stay.firstOpen))} · last ${escapeHtml(tulumStamp(stay.lastOpen))} (Tulum time)</p>`
    : "";
  return `<article class="card">
<header>
  <div><h2>${escapeHtml(stay.guest)}</h2>
  <p class="meta">${shortDate(stay.check_in)} – ${shortDate(stay.check_out)} · ${nights} night${nights === 1 ? "" : "s"} · ${escapeHtml(stayPhase(stay, today))}</p></div>
  <span class="pill ${s.cls}">${s.label}</span>
</header>
<p class="big"><strong>${stay.total.people}</strong> open${stay.total.people === 1 ? "" : "s"} by people</p>
${sources(stay.total)}
${dayChart(stay, today)}
${opened}
<a class="link" href="/journey/${escapeHtml(stay.slug)}/?me" target="_blank" rel="noopener">Open page (not counted)</a>
</article>`;
}

function pastRow(stay) {
  const s = status(stay);
  return `<tr><td>${escapeHtml(stay.guest)}</td><td>${shortDate(stay.check_in)} – ${shortDate(stay.check_out)}</td>
<td class="num">${stay.total.people}</td><td class="num">${stay.total.guest}</td><td class="num">${stay.total.previews}</td>
<td><span class="pill ${s.cls}">${s.label}</span></td></tr>`;
}

export function renderVisitsPage({ current, past }, today, nowIso) {
  const cards = current.length
    ? current.map((s) => stayCard(s, today)).join("\n")
    : `<p class="empty">No stays in the last week or the next month.</p>`;
  const pastTable = past.length
    ? `<details><summary>Earlier stays (${past.length})</summary>
<p class="note">Counting started on Nov 14, 2026, so stays before then show no visits.</p>
<table><thead><tr><th>Guest</th><th>Dates</th><th class="num">Opens</th><th class="num">Guest link</th><th class="num">Previews</th><th>Status</th></tr></thead>
<tbody>${past.map(pastRow).join("")}</tbody></table></details>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Journey visits · Templia</title>
<style>
:root{--bg:#0a0a0a;--card:#141414;--line:#262626;--fg:#ededed;--muted:#9a9a9a;--gold:#c9a84c;--ok:#7fb77e;--warn:#d9a441;--none:#8a8a8a}
@media (prefers-color-scheme: light){:root{--bg:#f7f4ee;--card:#fff;--line:#e4ddd0;--fg:#1d1a16;--muted:#6b645a;--gold:#9a7a22;--ok:#3f7d3e;--warn:#a46f0e;--none:#7a746b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
main{max-width:880px;margin:0 auto;padding:28px 16px 48px}
.top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:20px}
h1{font:400 28px/1.2 Georgia,"Times New Roman",serif;color:var(--gold);margin:0}
.stamp{color:var(--muted);font-size:13px}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px}
.card header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
h2{font:400 22px/1.2 Georgia,"Times New Roman",serif;margin:0}
.meta{color:var(--muted);font-size:13px;margin:4px 0 0}
.pill{display:inline-block;white-space:nowrap;font-size:12px;padding:3px 10px;border-radius:999px;border:1px solid currentColor}
.pill.ok{color:var(--ok)}.pill.warn{color:var(--warn)}.pill.none{color:var(--none)}
.big{margin:14px 0 8px}.big strong{font-size:30px;font-weight:600;margin-right:4px}
.src{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:0 0 14px}
.src div{border:1px solid var(--line);border-radius:8px;padding:6px 8px}
.src dt{color:var(--muted);font-size:11px;line-height:1.3}.src dd{margin:2px 0 0;font-size:17px;font-variant-numeric:tabular-nums}
.chart{display:flex;align-items:flex-end;gap:3px;height:90px;padding-top:14px;border-bottom:1px solid var(--line);margin-bottom:22px}
.bar{flex:1;height:100%;position:relative;display:flex;align-items:flex-end;justify-content:center}
.bar span{display:block;width:100%;max-width:22px;background:var(--line);border-radius:3px 3px 0 0}
.bar.stay span{background:var(--gold)}
.bar i{position:absolute;bottom:calc(100% - 12px);font-style:normal;font-size:10px;color:var(--muted)}
.bar b{position:absolute;top:100%;font-weight:400;font-size:10px;color:var(--muted);padding-top:2px}
.bar.today b{color:var(--fg);font-weight:600}
.link{display:inline-block;margin-top:8px;color:var(--gold);font-size:13px}
.empty,.note{color:var(--muted)}
details{margin-top:28px}summary{cursor:pointer;color:var(--gold)}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px}
th,td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line)}th{color:var(--muted);font-weight:500}
.num{text-align:right;font-variant-numeric:tabular-nums}
.foot{margin-top:28px;color:var(--muted);font-size:12px}
@media (max-width:420px){.src{grid-template-columns:repeat(2,1fr)}table{font-size:13px}}
</style></head>
<body><main>
<div class="top"><h1>Journey visits</h1><span class="stamp">Live · ${escapeHtml(tulumStamp(nowIso))} Tulum time</span></div>
<section class="grid">${cards}</section>
${pastTable}
<p class="foot">Opens by people only; bots are left out. Gold bars are the nights of the stay. "Open page" links include ?me, so your own checks aren't counted.</p>
</main></body></html>`;
}

export async function handleVisitsPage(request, env) {
  // Local development only: the worker-dev launch config passes --var VISITS_LOCAL_NO_AUTH:1.
  // Never set this on the deployed Worker.
  const local = env.VISITS_LOCAL_NO_AUTH === "1" && env.TEST_CLOCK === "1";
  if (!local && !(await verifyAccess(request, env))) {
    return new Response("Forbidden", { status: 403, headers: { ...PRIVATE_HEADERS, "Content-Type": "text/plain" } });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: PRIVATE_HEADERS });
  }
  const now = new Date();
  const today = tulumToday(now);
  const html = renderVisitsPage(await loadStays(env, today), today, now.toISOString());
  return new Response(request.method === "HEAD" ? null : html, {
    headers: { ...PRIVATE_HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
}
