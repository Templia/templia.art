// Owner's morning summary of guest journey pages.
//
// Runs from the 07:00 Tulum cron. For every stay that is about to start, in
// progress or just ended, says whether the guests have opened their page,
// using the counts in journey_visits. Sent to env.OWNER_EMAIL (a Worker
// secret — the repo is public). Without OWNER_EMAIL nothing is sent.

import { addDaysIso, escapeHtml, layout, sendEmail, tulumToday } from "./subscriptions.js";

const DAYS_BEFORE = 3; // start reporting this many days before check-in
const DAYS_AFTER = 1; // and stop the day after checkout

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shortDate(iso) {
  const d = new Date(iso + "T12:00:00Z");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400e3);
}

// "Nov 13, 6:20 PM" in Tulum time (UTC-5, no DST).
function tulumStamp(isoUtc) {
  const d = new Date(new Date(isoUtc).getTime() - 5 * 3600e3);
  let h = d.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${h}:${String(d.getUTCMinutes()).padStart(2, "0")} ${ampm}`;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function stayPhase(j, today) {
  const nights = daysBetween(j.check_in, j.check_out);
  if (today < j.check_in) {
    const n = daysBetween(today, j.check_in);
    return n === 1 ? "arrives tomorrow" : `arrives in ${n} days`;
  }
  if (today > j.check_out) return "checked out";
  if (today === j.check_out) return "checkout day";
  return `day ${daysBetween(j.check_in, today) + 1} of ${nights + 1}`;
}

// Sum visit rows ({day, kind, via, hits, first_at}) into the buckets the owner cares about.
function tally(rows) {
  const t = { guest: 0, email: 0, otherPeople: 0, previews: 0, people: 0 };
  for (const r of rows) {
    if (r.kind === "preview") t.previews += r.hits;
    if (r.kind !== "person") continue;
    t.people += r.hits;
    if (r.via === "guest") t.guest += r.hits;
    else if (r.via === "email") t.email += r.hits;
    else t.otherPeople += r.hits;
  }
  return t;
}

function describe(t) {
  const parts = [];
  if (t.guest) parts.push(`${t.guest} from the guest link`);
  if (t.email) parts.push(`${t.email} from the daily email`);
  if (t.otherPeople) parts.push(`${t.otherPeople} other`);
  let s = parts.length ? `${plural(t.people, "open")} (${parts.join(", ")})` : "no opens";
  if (t.previews) s += ` · link previewed ${t.previews}×`;
  return s;
}

/**
 * Pure: builds the summary from journeys and their visit rows.
 * @param {Array<{slug,guest,check_in,check_out}>} journeys
 * @param {Map<string, Array<{day,kind,via,hits,first_at}>>} visitsBySlug
 * @returns {{subject:string, text:string, html:string, notOpened:number} | null}
 */
export function buildOwnerSummary(journeys, visitsBySlug, today) {
  if (!journeys.length) return null;
  const yesterday = addDaysIso(today, -1);
  let notOpened = 0;
  const blocks = journeys.map((j) => {
    const rows = visitsBySlug.get(j.slug) || [];
    const total = tally(rows);
    const lastDay = tally(rows.filter((r) => r.day === yesterday));
    const firstOpen = rows
      .filter((r) => r.kind === "person")
      .map((r) => r.first_at)
      .sort()[0];
    const title = `${j.guest} · ${shortDate(j.check_in)}–${shortDate(j.check_out)} · ${stayPhase(j, today)}`;
    let lines;
    if (!total.people) {
      notOpened++;
      lines = [
        total.previews
          ? `Not opened yet — but the link was previewed ${total.previews}×, so it has been shared in a chat.`
          : "Not opened yet.",
      ];
    } else {
      lines = [
        `Yesterday: ${describe(lastDay)}`,
        `So far: ${describe(total)}`,
        `First opened: ${tulumStamp(firstOpen)}`,
      ];
    }
    return { title, lines };
  });

  const d = new Date(today + "T12:00:00Z");
  const dateLabel = `${WEEKDAYS[d.getUTCDay()]} ${shortDate(today)}`;
  const subject =
    `Journey pages · ${dateLabel}` + (notOpened ? ` · ${notOpened} not opened yet` : "");

  const text =
    blocks.map((b) => [b.title, ...b.lines.map((l) => `  ${l}`)].join("\n")).join("\n\n") +
    "\n\nCounts are people opening the page; bots are left out. Your own checks with ?me aren't counted.";

  const html = layout(
    blocks
      .map(
        (b) => `<tr><td style="padding:0 0 22px;">
<div style="font-size:19px;color:#c9a84c;padding-bottom:6px;">${escapeHtml(b.title)}</div>
${b.lines.map((l) => `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#d8d8d8;">${escapeHtml(l)}</div>`).join("\n")}
</td></tr>`,
      )
      .join("\n"),
    `<tr><td style="padding-top:8px;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a8a8a;">Counts are people opening the page; bots are left out. Your own checks with ?me aren't counted.</td></tr>`,
  );

  return { subject, text, html, notOpened };
}

export async function sendOwnerSummary(env, now = new Date()) {
  if (!env.DB) return { sent: false, reason: "no db" };
  const today = tulumToday(now);
  const { results: journeys } = await env.DB.prepare(
    `SELECT slug, guest, check_in, check_out FROM journeys
     WHERE check_in <= ?1 AND check_out >= ?2 ORDER BY check_in`,
  )
    .bind(addDaysIso(today, DAYS_BEFORE), addDaysIso(today, -DAYS_AFTER))
    .all();
  if (!journeys.length) return { sent: false, reason: "no current stays" };

  const visitsBySlug = new Map();
  for (const j of journeys) {
    // The page is reachable at the base slug and at "<base>-<firstname>".
    const { results } = await env.DB.prepare(
      `SELECT day, kind, via, SUM(hits) AS hits, MIN(first_at) AS first_at
       FROM journey_visits WHERE slug = ?1 OR slug LIKE ?1 || '-%'
       GROUP BY day, kind, via`,
    )
      .bind(j.slug)
      .all();
    visitsBySlug.set(j.slug, results);
  }

  const summary = buildOwnerSummary(journeys, visitsBySlug, today);
  if (!env.OWNER_EMAIL) {
    console.log(`[owner-summary] OWNER_EMAIL not set; would send:\n${summary.subject}\n${summary.text}`);
    return { sent: false, reason: "no OWNER_EMAIL", summary };
  }
  await sendEmail(env, { to: env.OWNER_EMAIL, subject: summary.subject, html: summary.html, text: summary.text });
  console.log(`[owner-summary] ${today}: sent (${journeys.length} stays, ${summary.notOpened} not opened)`);
  return { sent: true, summary };
}
