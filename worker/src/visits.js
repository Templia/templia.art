// Journey page visit counter.
//
// Counts page loads of /journey/<slug>/ (and the legacy
// /journey/?checkin=…&checkout=… form) into the D1 table journey_visits,
// aggregated per page, Tulum day, visitor kind and country. Nothing that
// identifies a person is stored: no IP, no user agent, no cookie.
//
// Query it with:
//   npx wrangler d1 execute templia-subscriptions --remote \
//     --command "SELECT * FROM journey_visits ORDER BY last_at DESC"

import { tulumToday } from "./subscriptions.js";

// Link unfurlers: a hit from one of these means the link was pasted into a
// chat or post (WhatsApp, iMessage, Slack, …), not that it was opened.
const PREVIEW_UA =
  /whatsapp|facebookexternalhit|facebot|twitterbot|slackbot|telegrambot|discordbot|linkedinbot|skypeuripreview|embedly|iframely|google-pagerenderer|redditbot/i;

const BOT_UA =
  /bot\b|bot\/|crawl|spider|slurp|curl|wget|python|httpx|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|headless|lighthouse|pagespeed|monitor|uptime|pingdom|checkly|scanner|preview|fetch|archive|claude|gpt|anthropic|openai|perplexity/i;

export function classifyVisitor(userAgent) {
  const ua = userAgent || "";
  if (!ua.trim()) return "bot";
  if (PREVIEW_UA.test(ua)) return "preview";
  if (BOT_UA.test(ua)) return "bot";
  return "person";
}

// Returns the journey slug for a page-load request, or null if this request
// isn't a journey page load (assets, RSC payloads, other pages, non-GET).
export function journeySlugFor(request) {
  if (request.method !== "GET") return null;
  const url = new URL(request.url);
  const path = url.pathname;

  // The owner's own checks: open any journey link with ?me to leave it uncounted.
  if (url.searchParams.has("me")) return null;

  // Only count document loads, not Next.js prefetches / RSC fetches.
  const dest = request.headers.get("Sec-Fetch-Dest");
  if (dest && dest !== "document") return null;
  if (request.headers.get("RSC") || request.headers.get("Next-Router-Prefetch")) return null;

  const m = path.match(/^\/journey\/([a-z0-9-]+?)(?:\/|\/index\.html|\.html)?$/i);
  if (m) return m[1].toLowerCase();

  if (path === "/journey" || path === "/journey/" || path === "/journey/index.html") {
    const ci = url.searchParams.get("checkin");
    const co = url.searchParams.get("checkout");
    if (/^\d{4}-\d{2}-\d{2}$/.test(ci || "") && /^\d{4}-\d{2}-\d{2}$/.test(co || "")) {
      return `${ci}-to-${co}`;
    }
  }
  return null;
}

// Link tag from ?via=…: lets the owner tell "opened from the guest message"
// (?via=guest) from other visits. Anything malformed is recorded as "other".
export function viaFor(request) {
  const raw = new URL(request.url).searchParams.get("via");
  if (raw === null || raw === "") return "";
  const v = raw.toLowerCase();
  return /^[a-z0-9-]{1,24}$/.test(v) ? v : "other";
}

export async function recordJourneyVisit(request, env, now = new Date()) {
  const slug = journeySlugFor(request);
  if (!slug || !env.DB) return false;
  const kind = classifyVisitor(request.headers.get("User-Agent"));
  const country = (request.cf && request.cf.country) || "XX";
  const at = now.toISOString();
  await env.DB.prepare(
    `INSERT INTO journey_visits (slug, day, kind, via, country, hits, first_at, last_at)
     VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6, ?6)
     ON CONFLICT (slug, day, kind, via, country)
     DO UPDATE SET hits = hits + 1, last_at = excluded.last_at`
  )
    .bind(slug, tulumToday(now), kind, viaFor(request), country, at)
    .run();
  return true;
}
