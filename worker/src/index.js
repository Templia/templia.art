// Templia edge Worker
//
// Routes all requests to templia.art/*. Two jobs right now:
//
//   1. /api/availability  — JSON availability window parsed from the
//      iCal feed at https://templia.art/availability.ics.
//
//   2. Markdown for Agents — when a client sends `Accept: text/markdown`,
//      we fetch the HTML from origin and convert it with Workers AI's
//      `toMarkdown` utility. All other requests pass through unchanged.
//
// The `templia.art/availability.ics` route is bound to a separate Worker
// (templia-availability-ics) and wins over our `templia.art/*` route because
// Cloudflare picks the more-specific route first — so we can safely fetch
// that URL from here without recursing into this Worker.
//
// New endpoints get a new `handle*` function plus a branch in `route()`.

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const BOOKING_URL = "https://stay.templia.art";
// We fetch Google Calendar directly rather than templia.art/availability.ics.
// Cloudflare's same-zone subrequest behavior bypasses the Worker layer when
// a Worker fetches a URL on its own zone, so hitting /availability.ics from
// here goes straight to GitHub Pages (404) instead of the
// templia-availability-ics proxy Worker. Going direct to Google Calendar is
// one hop shorter and the proxy itself adds nothing we need here.
const AVAILABILITY_SOURCE_URL =
  "https://calendar.google.com/calendar/ical/39oluc8fr5h07hvedpnfvob2krdgfoen%40import.calendar.google.com/public/basic.ics";
const AVAILABILITY_PUBLIC_URL = "https://templia.art/availability.ics";
const MIN_NIGHTS = 3;
const MAX_WINDOW_DAYS = 365;
const TZOLKIN_MAX_WINDOW_DAYS = 60;

/** Standard CORS + cache headers for JSON API responses. */
function jsonHeaders({ maxAge = 300 } = {}) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": `public, max-age=${maxAge}`,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
    Vary: "Accept",
  };
}

function jsonResponse(body, { status = 200, maxAge = 300, extraHeaders = {} } = {}) {
  const payload = JSON.stringify(body, null, 2);
  return new Response(payload, {
    status,
    headers: { ...jsonHeaders({ maxAge }), ...extraHeaders },
  });
}

function errorResponse(code, message, status = 400) {
  return jsonResponse({ error: { code, message } }, { status, maxAge: 0 });
}

// ---------------------------------------------------------------------------
// Date utilities — everything works in UTC on whole-day boundaries.
// iCal all-day events use DATE values (YYYYMMDD) with an exclusive DTEND,
// so we stick to the same semantics throughout.
// ---------------------------------------------------------------------------

/** YYYY-MM-DD -> Date at UTC midnight, or null if invalid. */
function parseIsoDate(str) {
  if (typeof str !== "string") return null;
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(mo) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return date;
}

/** YYYYMMDD (iCal DATE) -> Date at UTC midnight, or null if invalid. */
function parseIcalDate(str) {
  if (typeof str !== "string") return null;
  const m = str.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** UTC Date -> YYYY-MM-DD. */
function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Whole days between two UTC midnight Dates (to - from). */
function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function addDays(date, n) {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + n);
  return copy;
}

// ---------------------------------------------------------------------------
// Minimal iCal parser — just enough for Airbnb/Google VEVENT blocks.
// We handle line unfolding (RFC 5545 §3.1) and DTSTART/DTEND/SUMMARY/UID.
// ---------------------------------------------------------------------------

function unfoldIcalLines(text) {
  // RFC 5545: a line starting with SP or HTAB is a continuation of the previous.
  const raw = text.replace(/\r\n/g, "\n").split("\n");
  const lines = [];
  for (const line of raw) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

/**
 * Parse VEVENT blocks out of an iCal document and return
 * { start, end, summary, uid } entries. `end` is exclusive.
 * Only all-day (DATE) values are supported — that's what Airbnb sends.
 */
function parseIcalEvents(icsText) {
  const events = [];
  const lines = unfoldIcalLines(icsText);
  let current = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current && current.start && current.end) {
        events.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    // Split `NAME;PARAM=VAL:VALUE` into name, params, value.
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const left = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);
    const [name] = left.split(";");

    if (name === "DTSTART") current.start = parseIcalDate(value);
    else if (name === "DTEND") current.end = parseIcalDate(value);
    else if (name === "SUMMARY") current.summary = value;
    else if (name === "UID") current.uid = value;
  }
  return events;
}

// ---------------------------------------------------------------------------
// Availability handler
//   GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
//
// Semantics:
//   - A "night" is identified by its check-in date.
//   - The window [from, to) covers `to - from` nights.
//   - A night is blocked if its date falls inside any blocked range's
//     [start, end) interval (iCal DTEND is exclusive).
//   - `available` = no requested nights are blocked AND the window meets
//     the minimum-nights rule.
// ---------------------------------------------------------------------------

async function handleAvailability(request, env, ctx) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders({ maxAge: 0 }) });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return errorResponse("method_not_allowed", "Use GET.", 405);
  }

  const url = new URL(request.url);
  const today = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  ));

  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const from = fromParam ? parseIsoDate(fromParam) : today;
  const to = toParam ? parseIsoDate(toParam) : addDays(today, 30);

  if (!from) return errorResponse("invalid_from", "`from` must be YYYY-MM-DD.");
  if (!to) return errorResponse("invalid_to", "`to` must be YYYY-MM-DD.");
  if (daysBetween(from, to) <= 0) {
    return errorResponse("invalid_range", "`to` must be after `from`.");
  }
  if (daysBetween(from, to) > MAX_WINDOW_DAYS) {
    return errorResponse(
      "window_too_large",
      `Maximum window is ${MAX_WINDOW_DAYS} days.`,
    );
  }

  // Fetch the canonical iCal feed. We go through templia.art's own
  // availability.ics, which is proxied from Google Calendar (which in turn
  // mirrors Airbnb). Use Cloudflare's cache to keep origin load down.
  let icsText;
  let feedFetchedAt;
  try {
    const icsResponse = await fetch(AVAILABILITY_SOURCE_URL, {
      cf: { cacheTtl: 300, cacheEverything: true },
      headers: { Accept: "text/calendar" },
    });
    if (!icsResponse.ok) {
      return errorResponse(
        "upstream_unavailable",
        `availability.ics returned HTTP ${icsResponse.status}.`,
        502,
      );
    }
    icsText = await icsResponse.text();
    feedFetchedAt = new Date().toISOString();
  } catch (err) {
    return errorResponse("upstream_fetch_failed", String(err).slice(0, 200), 502);
  }

  const allEvents = parseIcalEvents(icsText);

  // Keep only events that overlap the requested window.
  const overlapping = allEvents.filter(
    (e) => e.start < to && e.end > from,
  );

  // Clip each overlapping event to the requested window.
  const blockedRanges = overlapping
    .map((e) => {
      const start = e.start < from ? from : e.start;
      const end = e.end > to ? to : e.end;
      return {
        start: formatIsoDate(start),
        end: formatIsoDate(end),
        nights: daysBetween(start, end),
        summary: e.summary || null,
      };
    })
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  const nights = daysBetween(from, to);
  const blockedNights = blockedRanges.reduce((sum, r) => sum + r.nights, 0);
  const meetsMinNights = nights >= MIN_NIGHTS;
  const fullyOpen = blockedNights === 0;

  const body = {
    from: formatIsoDate(from),
    to: formatIsoDate(to),
    nights,
    available: fullyOpen && meetsMinNights,
    reason: !meetsMinNights
      ? `window is ${nights} night(s); minimum is ${MIN_NIGHTS}`
      : !fullyOpen
      ? `${blockedNights} of ${nights} night(s) are blocked`
      : null,
    minNights: MIN_NIGHTS,
    meetsMinNights,
    blockedRanges,
    bookingUrl: BOOKING_URL,
    source: {
      // Public-facing source URL (canonical for external callers).
      // We fetch Google Calendar directly internally, but agents should
      // point consumers at templia.art/availability.ics.
      url: AVAILABILITY_PUBLIC_URL,
      fetchedAt: feedFetchedAt,
    },
    disclaimer:
      "Calendar feeds can lag. Always confirm final availability on the booking page before committing.",
  };

  return jsonResponse(body, { maxAge: 300 });
}

// ---------------------------------------------------------------------------
// Markdown for Agents handler — original behavior, extracted into a function
// so we can route alongside other endpoints.
// ---------------------------------------------------------------------------

function acceptsMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  return acceptHeader
    .toLowerCase()
    .split(",")
    .some((part) => part.trim().startsWith("text/markdown"));
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.length / 4));
}

async function handleMarkdownOrPassthrough(request, env, ctx) {
  // Fast path — client didn't ask for markdown, pass through.
  if (!acceptsMarkdown(request.headers.get("Accept"))) {
    return fetch(request);
  }

  // Only GET/HEAD are safe to transform.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return fetch(request);
  }

  // Fetch the normal (HTML) response from origin via Cloudflare's cache.
  // For HEAD requests we upgrade to GET on the subrequest so we actually
  // get the body to convert — we'll drop the body again before responding.
  // Without this, origin returns an empty body to our HEAD and toMarkdown
  // sees an empty input, which falls back to HTML with x-markdown-error.
  const originRequest = new Request(request.url, {
    method: "GET",
    headers: { ...Object.fromEntries(request.headers), Accept: "text/html" },
    redirect: "follow",
  });
  const originResponse = await fetch(originRequest);

  // Only convert HTML.
  const contentType = (originResponse.headers.get("Content-Type") || "").toLowerCase();
  if (!contentType.includes("text/html")) {
    return originResponse;
  }

  // Hard cap mirroring Cloudflare's native feature: 2 MiB origin payload.
  const MAX_BYTES = 2 * 1024 * 1024;
  const contentLength = Number(originResponse.headers.get("Content-Length") || "0");
  if (contentLength > MAX_BYTES) {
    return originResponse;
  }

  const html = await originResponse.text();
  if (html.length > MAX_BYTES) {
    return new Response(html, {
      status: originResponse.status,
      headers: originResponse.headers,
    });
  }

  let markdown;
  try {
    const results = await env.AI.toMarkdown([
      { name: "page.html", blob: new Blob([html], { type: "text/html" }) },
    ]);
    markdown = results?.[0]?.data ?? "";
    if (!markdown) throw new Error("empty markdown");
  } catch (err) {
    const fallbackHeaders = new Headers(originResponse.headers);
    fallbackHeaders.set("x-markdown-error", String(err).slice(0, 200));
    fallbackHeaders.set(
      "x-markdown-debug",
      `inboundMethod=${request.method},originStatus=${originResponse.status},originCT=${originResponse.headers.get("Content-Type") || ""},htmlLen=${html.length}`,
    );
    return new Response(html, {
      status: originResponse.status,
      headers: fallbackHeaders,
    });
  }

  const newHeaders = new Headers();
  for (const [k, v] of originResponse.headers) {
    const lk = k.toLowerCase();
    if (
      lk === "content-type" ||
      lk === "content-length" ||
      lk === "content-encoding" ||
      lk === "transfer-encoding" ||
      lk === "etag"
    ) {
      continue;
    }
    newHeaders.set(k, v);
  }
  newHeaders.set("Content-Type", "text/markdown; charset=utf-8");
  newHeaders.set("Vary", "Accept");
  newHeaders.set("x-markdown-tokens", String(estimateTokens(markdown)));
  newHeaders.set(
    "Content-Length",
    String(new TextEncoder().encode(markdown).length),
  );
  newHeaders.set("Content-Signal", "ai-train=yes, search=yes, ai-input=yes");

  return new Response(request.method === "HEAD" ? null : markdown, {
    status: originResponse.status,
    headers: newHeaders,
  });
}

// ---------------------------------------------------------------------------
// Tzolk'in Journey handler
//   GET /api/tzolkin/journey?from=YYYY-MM-DD&to=YYYY-MM-DD
//
// The Tzolk'in is the 260-day Maya sacred calendar — 20 day signs × 13 tones.
// Given a check-in and check-out, we return the day sign/tone for:
//   - arrival (from)
//   - departure (to)
//   - each "full day" in between (from+1 .. to-1)
//
// Anchor: 2026-02-10 = 6 Kawoq. This matches the engine in src/lib/tzolkin.ts
// used by the Next.js app, so the Worker and the app agree on every date.
// ---------------------------------------------------------------------------

const DAY_SIGNS = [
  { number: 1, name: "Imox", englishName: "Crocodile", glyph: "imox.svg",
    themes: ["Primordial Waters", "Intuition", "New Beginnings"],
    element: "Water", direction: "East",
    description: "Imox is the first day sign — the cosmic womb, the primordial waters from which all creation emerges. It governs intuition, the dream world, and the unconscious mind." },
  { number: 2, name: "Iq'", englishName: "Wind", glyph: "iq.svg",
    themes: ["Breath of Life", "Communication", "Spirit"],
    element: "Air", direction: "North",
    description: "Iq' is the breath of life, the invisible force that moves through all things. It governs communication, inspiration, and the connection between the physical and spiritual worlds." },
  { number: 3, name: "Aq'ab'al", englishName: "Night", glyph: "aqabal.svg",
    themes: ["Dawn", "Darkness", "Renewal"],
    element: "Earth", direction: "West",
    description: "Aq'ab'al is the threshold between darkness and light, the moment before dawn. It governs renewal, inner reflection, and the courage to face the unknown." },
  { number: 4, name: "K'at", englishName: "Net", glyph: "kat.svg",
    themes: ["Abundance", "Gathering", "Entanglement"],
    element: "Fire", direction: "South",
    description: "K'at is the sacred net that holds together all that we gather — blessings, memories, and lessons. It governs abundance but also warns of entanglement." },
  { number: 5, name: "Kan", englishName: "Serpent", glyph: "kan.svg",
    themes: ["Life Force", "Kundalini", "Transformation"],
    element: "Water", direction: "East",
    description: "Kan is the feathered serpent, Kukulkan — raw life force energy rising through the body. It governs vitality, sensuality, and the power of transformation." },
  { number: 6, name: "Kame", englishName: "Death", glyph: "kame.svg",
    themes: ["Transformation", "Ancestors", "Rebirth"],
    element: "Air", direction: "North",
    description: "Kame is the sacred transformer — not an ending but a passage. It governs ancestral connection, the wisdom of letting go, and the rebirth that follows release." },
  { number: 7, name: "Kej", englishName: "Deer", glyph: "kej.svg",
    themes: ["Harmony", "Four Pillars", "Nature"],
    element: "Earth", direction: "West",
    description: "Kej is the deer, guardian of the four pillars that hold up the sky. It governs harmony with nature, leadership through grace, and the strength of gentleness." },
  { number: 8, name: "Q'anil", englishName: "Seed", glyph: "qanil.svg",
    themes: ["Fertility", "Creation", "Ripening"],
    element: "Fire", direction: "South",
    description: "Q'anil is the seed of life, the promise of harvest. It governs fertility, new projects, and the patient trust that what is planted will bloom." },
  { number: 9, name: "Toj", englishName: "Offering", glyph: "toj.svg",
    themes: ["Gratitude", "Payment", "Sacred Fire"],
    element: "Water", direction: "East",
    description: "Toj is the sacred offering, the fire ceremony. It governs gratitude, reciprocity with the cosmos, and the understanding that giving is the path to receiving." },
  { number: 10, name: "Tz'i'", englishName: "Dog", glyph: "tzi.svg",
    themes: ["Loyalty", "Justice", "Authority"],
    element: "Air", direction: "North",
    description: "Tz'i' is the faithful companion, guardian of justice and truth. It governs loyalty, the law of cause and effect, and the authority that comes from integrity." },
  { number: 11, name: "B'atz'", englishName: "Monkey", glyph: "batz.svg",
    themes: ["Weaving", "Art", "Time"],
    element: "Earth", direction: "West",
    description: "B'atz' is the cosmic weaver, the thread of time itself. It governs creativity, artistic expression, and the understanding that all of life is a tapestry being woven." },
  { number: 12, name: "E", englishName: "Road", glyph: "e.svg",
    themes: ["Destiny", "Path", "Travel"],
    element: "Fire", direction: "South",
    description: "E is the sacred road, the path of destiny. It governs journeys both physical and spiritual, the courage to walk your path, and the guidance found along the way." },
  { number: 13, name: "Aj", englishName: "Reed", glyph: "aj.svg",
    themes: ["Home", "Authority", "Backbone"],
    element: "Water", direction: "East",
    description: "Aj is the reed, the backbone of the home and community. It governs domestic harmony, structural strength, and the authority that comes from standing tall." },
  { number: 14, name: "Ix", englishName: "Jaguar", glyph: "ix.svg",
    themes: ["Earth Force", "Feminine Power", "Mystery"],
    element: "Air", direction: "North",
    description: "Ix is the jaguar, the feminine power of the Earth. It governs the mysteries of nature, shamanic vision, and the deep intuitive wisdom of the wild." },
  { number: 15, name: "Tz'ikin", englishName: "Eagle", glyph: "tzikin.svg",
    themes: ["Vision", "Freedom", "Prosperity"],
    element: "Earth", direction: "West",
    description: "Tz'ikin is the eagle, the intermediary between heaven and earth. It governs expansive vision, spiritual freedom, and the abundance that comes from seeing the whole picture." },
  { number: 16, name: "Ajmaq", englishName: "Owl", glyph: "ajmaq.svg",
    themes: ["Forgiveness", "Wisdom", "Ancestors"],
    element: "Fire", direction: "South",
    description: "Ajmaq is the owl, keeper of ancestral wisdom. It governs forgiveness, the courage to face our shadow, and the deep wisdom that emerges from honest self-reflection." },
  { number: 17, name: "No'j", englishName: "Earthquake", glyph: "noj.svg",
    themes: ["Knowledge", "Mind", "Movement"],
    element: "Water", direction: "East",
    description: "No'j is the earthquake, the movement of thought. It governs the mind, knowledge, intellectual pursuit, and the understanding that true wisdom shakes the foundations." },
  { number: 18, name: "Tijax", englishName: "Obsidian", glyph: "tijax.svg",
    themes: ["Healing", "Cutting Away", "Truth"],
    element: "Air", direction: "North",
    description: "Tijax is the obsidian blade, the healer's knife. It governs the power to cut away what no longer serves, truth that heals, and the precision of sacred medicine." },
  { number: 19, name: "Kawoq", englishName: "Storm", glyph: "kawoq.svg",
    themes: ["Purification", "Community", "Divine Feminine"],
    element: "Earth", direction: "West",
    description: "Kawoq is the storm that purifies, the voice of the Divine Feminine. It governs community, fertility of the land, and the cleansing power that prepares new ground." },
  { number: 20, name: "Ajpu", englishName: "Sun", glyph: "ajpu.svg",
    themes: ["Illumination", "Heroism", "Divine Wholeness"],
    element: "Fire", direction: "South",
    description: "Ajpu is the Sun, the Lord of Light, the final day sign of the Tzolkin. It governs illumination, the hero's journey, and the divine wholeness that lives within each of us." },
];

const TONES = [
  { number: 1, name: "Jun", meaning: "Unity", description: "The beginning, the point of origin. Pure potential, undivided wholeness." },
  { number: 2, name: "Ka'", meaning: "Duality", description: "The creative tension of opposites. Polarity, balance, and the dance of complementary forces." },
  { number: 3, name: "Ox", meaning: "Action", description: "The catalyst of movement. Rhythm, communication, and the spark that sets things in motion." },
  { number: 4, name: "Kaj", meaning: "Stability", description: "The four pillars, the four directions. Structure, form, and the foundation upon which all is built." },
  { number: 5, name: "Jo'", meaning: "Empowerment", description: "The center point. Taking command, empowerment, and the peak of the first wave." },
  { number: 6, name: "Waq", meaning: "Flow", description: "Organic flow and dynamic equilibrium. Stability in motion, the rhythm of give and receive." },
  { number: 7, name: "Wuq", meaning: "Mystical Center", description: "The mystic column, the center of the Tzolkin. Reflection, purpose, and the portal between worlds." },
  { number: 8, name: "Wajxaq", meaning: "Harmony", description: "Harmony, abundance, and integration. The number of justice, balance achieved through wholeness." },
  { number: 9, name: "B'elej", meaning: "Patience", description: "The completion of cycles, perseverance. Greater patience brings greater realization." },
  { number: 10, name: "Lajuj", meaning: "Manifestation", description: "Manifestation in the material world. Challenge met, intention made real." },
  { number: 11, name: "Jun Lajuj", meaning: "Resolution", description: "Dissolution and resolution. Simplification, letting go of what is not essential." },
  { number: 12, name: "Ka' Lajuj", meaning: "Understanding", description: "Complex understanding, shared knowledge. Community wisdom and collective purpose." },
  { number: 13, name: "Oxlajuj", meaning: "Transcendence", description: "The highest tone. Cosmic completion, ascension, and the doorway to the next cycle." },
];

// Anchor: Feb 10, 2026 = 6 Kawoq. Same as src/lib/tzolkin.ts.
const TZOLKIN_ANCHOR_DATE = Date.UTC(2026, 1, 10);
const TZOLKIN_ANCHOR_TONE = 6;        // 1-based
const TZOLKIN_ANCHOR_DAY_SIGN = 19;   // Kawoq, 1-based

function mod(n, m) {
  return ((n % m) + m) % m;
}

/** Given a UTC-midnight Date, return { date, displayName, tone, daySign }. */
function tzolkinDateFor(date) {
  const diff = Math.round((date.getTime() - TZOLKIN_ANCHOR_DATE) / 86400000);
  const toneIndex = mod((TZOLKIN_ANCHOR_TONE - 1) + diff, 13);
  const daySignIndex = mod((TZOLKIN_ANCHOR_DAY_SIGN - 1) + diff, 20);
  const tone = TONES[toneIndex];
  const daySign = DAY_SIGNS[daySignIndex];
  return {
    date: formatIsoDate(date),
    displayName: `${tone.number} ${daySign.name}`,
    tone,
    daySign,
  };
}

async function handleTzolkinJourney(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: jsonHeaders({ maxAge: 0 }) });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return errorResponse("method_not_allowed", "Use GET.", 405);
  }

  const url = new URL(request.url);
  const today = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  ));
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const from = fromParam ? parseIsoDate(fromParam) : today;
  const to = toParam ? parseIsoDate(toParam) : addDays(today, 3);

  if (!from) return errorResponse("invalid_from", "`from` must be YYYY-MM-DD.");
  if (!to) return errorResponse("invalid_to", "`to` must be YYYY-MM-DD.");
  const nights = daysBetween(from, to);
  if (nights <= 0) {
    return errorResponse("invalid_range", "`to` must be after `from`.");
  }
  if (nights > TZOLKIN_MAX_WINDOW_DAYS) {
    return errorResponse(
      "window_too_large",
      `Maximum window is ${TZOLKIN_MAX_WINDOW_DAYS} days.`,
    );
  }

  const arrival = tzolkinDateFor(from);
  const departure = tzolkinDateFor(to);
  const fullDays = [];
  // Full days are the nights you actually spend inside the stay:
  //   from+1 .. to-1 (inclusive).
  for (let i = 1; i < nights; i++) {
    fullDays.push(tzolkinDateFor(addDays(from, i)));
  }

  const body = {
    from: formatIsoDate(from),
    to: formatIsoDate(to),
    nights,
    arrival,
    fullDays,
    departure,
    anchor: {
      date: "2026-02-10",
      tzolkin: "6 Kawoq",
      note: "All Tzolk'in dates in this response are computed from this anchor.",
    },
    credit: "Tzolk'in interpretations are adapted from the Mayan calendar tradition and are intended for contemplative use.",
  };

  return jsonResponse(body, { maxAge: 86400 });
}

// ---------------------------------------------------------------------------
// /.well-known/api-catalog — RFC 9727 API Catalog (Linkset per RFC 9264)
// ---------------------------------------------------------------------------
//
// Publishes a machine-readable index of the public APIs on this origin so that
// agents can discover them without scraping HTML. Each linkset entry anchors
// one API endpoint and points to the OpenAPI description (`service-desc`) and
// the documentation (`service-doc`).
//
// Spec: https://www.rfc-editor.org/rfc/rfc9727  (api-catalog well-known URI)
//       https://www.rfc-editor.org/rfc/rfc9264  (application/linkset+json)

const API_CATALOG = {
  linkset: [
    {
      anchor: "https://templia.art/api/property.json",
      "service-desc": [
        {
          href: "https://templia.art/.well-known/openapi.json",
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: "https://templia.art/llms.txt",
          type: "text/plain",
        },
      ],
    },
    {
      anchor: "https://templia.art/api/availability",
      "service-desc": [
        {
          href: "https://templia.art/.well-known/openapi.json",
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: "https://templia.art/llms.txt",
          type: "text/plain",
        },
      ],
    },
    {
      anchor: "https://templia.art/api/tzolkin/journey",
      "service-desc": [
        {
          href: "https://templia.art/.well-known/openapi.json",
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: "https://templia.art/llms.txt",
          type: "text/plain",
        },
      ],
    },
    {
      anchor: "https://templia.art/mcp",
      "service-desc": [
        {
          href: "https://templia.art/.well-known/mcp-server-card",
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: "https://templia.art/llms.txt",
          type: "text/plain",
        },
      ],
    },
  ],
};

const API_CATALOG_BODY = JSON.stringify(API_CATALOG, null, 2);

function apiCatalogHeaders() {
  return {
    "Content-Type":
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept",
    // Self-reference so HEAD callers can discover the catalog via Link header
    // alone (per RFC 9727 §2).
    Link: '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  };
}

function handleApiCatalog(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Accept",
      },
    });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return errorResponse("method_not_allowed", "Use GET or HEAD.", 405);
  }
  return new Response(request.method === "HEAD" ? null : API_CATALOG_BODY, {
    status: 200,
    headers: apiCatalogHeaders(),
  });
}

// ---------------------------------------------------------------------------
// /mcp — Model Context Protocol server (Streamable HTTP, stateless)
// ---------------------------------------------------------------------------
//
// Single JSON-RPC 2.0 request per HTTP POST → single response. No sessions,
// no SSE stream, no server-initiated notifications. The three tools wrap the
// existing public APIs in-process (no re-entry through the Workers layer).
//
// Spec: https://modelcontextprotocol.io/specification/2025-11-25
// Card: https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127

const MCP_LATEST_PROTOCOL_VERSION = "2025-11-25";
const MCP_SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18"];
const MCP_SERVER_NAME = "art.templia/templia";
const MCP_SERVER_TITLE = "Templia";
const MCP_SERVER_VERSION = "0.1.0";
const MCP_SERVER_DESCRIPTION =
  "Public API server for Templia, a Mayan-inspired luxury vacation rental in Tulum, Mexico. Exposes live availability, canonical property information, and a Tzolk'in (Maya sacred calendar) reading tool for planning contemplative stays.";
const MCP_SERVER_WEBSITE = "https://templia.art";
const MCP_ENDPOINT_URL = "https://templia.art/mcp";
const MCP_SERVER_INSTRUCTIONS =
  "Templia is a 3-bedroom private villa in Tulum, Mexico. Use check_availability to gate any date-specific suggestions, get_property_info for amenities/policies/booking link, and get_tzolkin_reading for the ceremonial Maya-calendar context of a given stay window. Minimum stay is 3 nights. Bookings are completed on https://stay.templia.art — this server does not accept bookings, payments, or personal data.";

const MCP_TOOLS = [
  {
    name: "check_availability",
    title: "Check availability",
    description:
      "Check whether Templia is available for a stay window. Returns whether the window is bookable, the minimum-nights requirement (3), any blocked ranges inside the window, and the booking URL. Source is the Airbnb-synced iCal feed; calendar lag is possible — always confirm on the booking page before committing.",
    inputSchema: {
      type: "object",
      properties: {
        from: {
          type: "string",
          format: "date",
          description: "Arrival date (YYYY-MM-DD). Defaults to today.",
        },
        to: {
          type: "string",
          format: "date",
          description: "Departure date (YYYY-MM-DD, exclusive). Defaults to today + 30.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_property_info",
    title: "Get property information",
    description:
      "Return canonical information about Templia: name, location, description, amenities, pricing signals, policies, booking URL, contact, and images. Stable; safe to cache.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "get_tzolkin_reading",
    title: "Get Tzolk'in reading for a stay window",
    description:
      "Return the Tzolk'in (Maya sacred calendar) day-sign and tone for arrival, each full day, and departure of a stay window. Deterministic from anchor 2026-02-10 = 6 Kawoq. Window capped at 60 days.",
    inputSchema: {
      type: "object",
      properties: {
        from: {
          type: "string",
          format: "date",
          description: "Arrival date (YYYY-MM-DD). Defaults to today.",
        },
        to: {
          type: "string",
          format: "date",
          description: "Departure date (YYYY-MM-DD, exclusive). Defaults to today + 3.",
        },
      },
      additionalProperties: false,
    },
  },
];

function mcpCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
    "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
    "Access-Control-Max-Age": "3600",
  };
}

function rpcError(id, code, message, data) {
  const err = { code, message };
  if (data !== undefined) err.data = data;
  return { jsonrpc: "2.0", id: id ?? null, error: err };
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

async function callToolCheckAvailability(args) {
  const url = new URL("https://templia.art/api/availability");
  if (args?.from) url.searchParams.set("from", args.from);
  if (args?.to) url.searchParams.set("to", args.to);
  const res = await handleAvailability(
    new Request(url.toString(), { method: "GET" }),
  );
  return await res.json();
}

async function callToolGetPropertyInfo() {
  // property.json is a static file served by Cloudflare Pages. Same-zone
  // subrequests from Workers on templia.art/* bypass the Workers layer, so
  // this hits origin directly — no loop risk.
  const res = await fetch("https://templia.art/api/property.json", {
    cf: { cacheTtl: 300 },
  });
  if (!res.ok) {
    throw new Error(`Upstream property.json returned ${res.status}`);
  }
  return await res.json();
}

async function callToolGetTzolkinReading(args) {
  const url = new URL("https://templia.art/api/tzolkin/journey");
  if (args?.from) url.searchParams.set("from", args.from);
  if (args?.to) url.searchParams.set("to", args.to);
  const res = await handleTzolkinJourney(
    new Request(url.toString(), { method: "GET" }),
  );
  return await res.json();
}

async function dispatchToolCall(name, args) {
  if (name === "check_availability") return callToolCheckAvailability(args);
  if (name === "get_property_info") return callToolGetPropertyInfo();
  if (name === "get_tzolkin_reading") return callToolGetTzolkinReading(args);
  const err = new Error(`Unknown tool: ${name}`);
  err.code = "tool_not_found";
  throw err;
}

function toolResultFromData(data) {
  // If the underlying API signalled an error (e.g. invalid_range), surface it
  // through MCP's isError flag rather than JSON-RPC error — the caller still
  // gets structured data they can read and retry.
  const isError = data && typeof data === "object" && !!data.error;
  return {
    isError: isError || undefined,
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

async function handleMcpRpc(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return rpcError(message?.id ?? null, -32600, "Invalid Request");
  }
  const { id, method, params } = message;
  const isNotification = !("id" in message);

  try {
    if (method === "initialize") {
      const clientVersion = params?.protocolVersion;
      const protocolVersion = MCP_SUPPORTED_PROTOCOL_VERSIONS.includes(clientVersion)
        ? clientVersion
        : MCP_LATEST_PROTOCOL_VERSION;
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: {
          name: MCP_SERVER_NAME,
          title: MCP_SERVER_TITLE,
          version: MCP_SERVER_VERSION,
          description: MCP_SERVER_DESCRIPTION,
          websiteUrl: MCP_SERVER_WEBSITE,
        },
        instructions: MCP_SERVER_INSTRUCTIONS,
      });
    }

    if (method === "ping") return rpcResult(id, {});

    if (method === "tools/list") return rpcResult(id, { tools: MCP_TOOLS });

    if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      if (!toolName) return rpcError(id, -32602, "Invalid params: missing 'name'");
      try {
        const data = await dispatchToolCall(toolName, toolArgs);
        return rpcResult(id, toolResultFromData(data));
      } catch (e) {
        if (e && e.code === "tool_not_found") {
          return rpcError(id, -32602, `Invalid params: unknown tool '${toolName}'`);
        }
        return rpcResult(id, {
          isError: true,
          content: [
            { type: "text", text: `Tool call failed: ${e?.message || e}` },
          ],
        });
      }
    }

    if (
      method === "notifications/initialized" ||
      method === "notifications/cancelled" ||
      isNotification
    ) {
      return null; // notifications get no response
    }

    return rpcError(id, -32601, `Method not found: ${method}`);
  } catch (e) {
    return rpcError(id, -32603, `Internal error: ${e?.message || e}`);
  }
}

async function handleMcp(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: mcpCors() });
  }
  if (request.method === "GET" || request.method === "HEAD") {
    // Streamable HTTP permits servers to refuse the server→client SSE stream.
    return new Response(null, {
      status: 405,
      headers: { ...mcpCors(), Allow: "POST, OPTIONS" },
    });
  }
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { ...mcpCors(), Allow: "POST, OPTIONS" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify(rpcError(null, -32700, "Parse error")), {
      status: 400,
      headers: { "Content-Type": "application/json", ...mcpCors() },
    });
  }

  // Single-message only; 2025-11-25 dropped batch requests.
  if (Array.isArray(body)) {
    return new Response(
      JSON.stringify(rpcError(null, -32600, "Batch requests are not supported")),
      { status: 400, headers: { "Content-Type": "application/json", ...mcpCors() } },
    );
  }

  const response = await handleMcpRpc(body);

  if (response === null) {
    // Notification — spec says return 202 Accepted with empty body.
    return new Response(null, { status: 202, headers: mcpCors() });
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Mcp-Protocol-Version": MCP_LATEST_PROTOCOL_VERSION,
      ...mcpCors(),
    },
  });
}

// ---------------------------------------------------------------------------
// /.well-known/mcp-server-card (SEP-2127)  +  /.well-known/mcp/server-card.json
// ---------------------------------------------------------------------------
//
// The canonical path per SEP-2127 is `/.well-known/mcp-server-card`. We also
// serve the legacy path `/.well-known/mcp/server-card.json` so existing
// scanners (e.g. isitagentready.com) can discover us. Same body, same headers.

const MCP_SERVER_CARD = {
  $schema:
    "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  name: MCP_SERVER_NAME,
  title: MCP_SERVER_TITLE,
  version: MCP_SERVER_VERSION,
  description: MCP_SERVER_DESCRIPTION,
  websiteUrl: MCP_SERVER_WEBSITE,
  remotes: [
    {
      type: "streamable-http",
      url: MCP_ENDPOINT_URL,
      supportedProtocolVersions: MCP_SUPPORTED_PROTOCOL_VERSIONS,
    },
  ],
  _meta: {
    "art.templia/tools": MCP_TOOLS.map((t) => ({
      name: t.name,
      title: t.title,
      description: t.description,
    })),
  },
};
const MCP_SERVER_CARD_BODY = JSON.stringify(MCP_SERVER_CARD, null, 2);

function handleMcpServerCard(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: mcpCors() });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return errorResponse("method_not_allowed", "Use GET or HEAD.", 405);
  }
  return new Response(request.method === "HEAD" ? null : MCP_SERVER_CARD_BODY, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      Link: '</.well-known/mcp-server-card>; rel="mcp-server-card"; type="application/json"',
      ...mcpCors(),
    },
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function route(request) {
  const { pathname } = new URL(request.url);
  if (pathname === "/api/availability" || pathname === "/api/availability/") {
    return handleAvailability;
  }
  if (pathname === "/api/tzolkin/journey" || pathname === "/api/tzolkin/journey/") {
    return handleTzolkinJourney;
  }
  if (pathname === "/.well-known/api-catalog" || pathname === "/.well-known/api-catalog/") {
    return handleApiCatalog;
  }
  if (pathname === "/mcp" || pathname === "/mcp/") {
    return handleMcp;
  }
  if (
    pathname === "/.well-known/mcp-server-card" ||
    pathname === "/.well-known/mcp-server-card/" ||
    pathname === "/.well-known/mcp/server-card.json"
  ) {
    return handleMcpServerCard;
  }
  return handleMarkdownOrPassthrough;
}

export default {
  async fetch(request, env, ctx) {
    const handler = route(request);
    return handler(request, env, ctx);
  },
};
