// Daily journey emails.
//
//   POST /api/subscribe            { slug, email, locale }  → subscribes and sends a welcome
//                                                           (or today's message, mid-stay)
//   GET  /api/unsubscribe          ?token=…                 → unsubscribes, redirects to the journey
//   POST /api/unsubscribe          ?token=…                 → RFC 8058 one-click unsubscribe
//   scheduled()                                             → 12:00 UTC = 07:00 Tulum, sends today's day
//
// Day content comes from the static digest the site publishes at
// /digest/<slug>/data.json. Without RESEND_API_KEY, emails are logged instead
// of sent (local development).

const TULUM_OFFSET_HOURS = -5; // Quintana Roo stays on UTC-5 all year
const SLUG_RE = /^\d{4}-\d{2}-\d{2}-to-\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_EMAILS_PER_JOURNEY = 4;
// After this hour (Tulum), a mid-stay signup starts tomorrow instead of getting a "good morning" at night.
const LATE_SIGNUP_HOUR = 18;
const SIGNUP_OPENS_DAYS_BEFORE = 14;
const RETENTION_DAYS_AFTER_CHECKOUT = 7;
const ALLOWED_ORIGINS = ["https://templia.art", "http://localhost:3000"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function tulumToday(now = new Date()) {
  return new Date(now.getTime() + TULUM_OFFSET_HOURS * 3600e3).toISOString().slice(0, 10);
}

function tulumHour(now) {
  return new Date(now.getTime() + TULUM_OFFSET_HOURS * 3600e3).getUTCHours();
}

// Local testing only: wrangler dev sets TEST_CLOCK=1, so an X-Test-Now header can fake the time.
function requestNow(request, env) {
  const fake = env.TEST_CLOCK === "1" && request.headers.get("X-Test-Now");
  return fake ? new Date(fake) : new Date();
}

function addDaysIso(iso, n) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(request) },
  });
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function siteBase(env) {
  return (env.SITE_URL || "https://templia.art").replace(/\/$/, "");
}

async function fetchDigest(env, slug) {
  const base = (env.DIGEST_BASE || siteBase(env)).replace(/\/$/, "");
  const res = await fetch(`${base}/digest/${slug}/data.json`, { cf: { cacheTtl: 300 } });
  if (!res.ok) return null;
  return res.json();
}

function journeyUrl(env, digest, locale, dayNumber) {
  const u = new URL(`${siteBase(env)}/journey/${digest.slug}/`);
  if (locale === "es" && digest.locales.es) u.searchParams.set("lang", "es");
  return u.toString() + (dayNumber ? `#day-${dayNumber}` : "");
}

function formatLongDate(iso, locale) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
  });
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

async function sendEmail(env, { to, subject, html, text, unsubscribeUrl }) {
  const headers = unsubscribeUrl
    ? { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
    : undefined;

  if (!env.RESEND_API_KEY) {
    console.log(`[email:dry-run] to=${to} subject=${JSON.stringify(subject)}\n${text}`);
    return { dryRun: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM || "Aluxes of Templia <journey@templia.art>", to, subject, html, text, headers }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

// The daily messages are voiced by the Aluxes — the small guardian spirits of the land in
// Yucatec Maya tradition. They frame each day (greeting + sign-off); the Tzolkin text is unchanged.
const COPY = {
  en: {
    signature: "The Aluxes of Templia",
    welcomeSubject: "Welcome from the Aluxes of Templia",
    welcomeIntro: (name) =>
      `${name ? `Hello, ${name}. ` : ""}We are the Aluxes of Templia — the small guardians who, in Maya tradition, watch over this land and everyone who stays on it.`,
    welcomeBody: (from, to) =>
      `From the morning of ${from} until ${to}, we'll leave you each day's message at 7:00, Tulum time. Until then, rest well — we're already looking after the place.`,
    welcomeBodyTomorrow: (to) =>
      `Starting tomorrow morning, and every morning until ${to}, we'll leave you each day's message at 7:00, Tulum time. Tonight, rest well — we're looking after the place.`,
    notYou: "Not you, or changed your mind?",
    greetingFirst: (name, tz) =>
      `Good morning${name ? `, ${name}` : ""}. We are the Aluxes of Templia, the small keepers of this land. We were awake before the sun, as always, and today has a name: ${tz}.`,
    greetings: [
      (name, tz) => `Good morning${name ? `, ${name}` : ""}. We were up before the sun, as always. Today carries a name: ${tz}.`,
      (name, tz) => `Good morning${name ? `, ${name}` : ""}. The garden is still cool, and we've been listening. Today's sign is ${tz}.`,
      (name, tz) => `Good morning${name ? `, ${name}` : ""}. We walked the grounds at first light. The day that greets you is ${tz}.`,
      (name, tz) => `Good morning${name ? `, ${name}` : ""}. Before the birds, we were here. Today the sacred count reads ${tz}.`,
    ],
    greetingLast: (name, tz) =>
      `Good morning${name ? `, ${name}` : ""}. This is your last morning with us. Today's sign is ${tz}.`,
    signoffs: [
      "We'll be in the garden. Leave us a little something if you like — we notice.",
      "We keep watch while you wander. Come back to us tonight.",
      "If you hear a rustle in the jungle at dusk, that's only us.",
      "Walk gently today. We're never far.",
    ],
    signoffLast: "Travel well. A little of this land goes with you, and we'll keep your place warm.",
    dayLabel: "Day",
    viewOnline: "View this day on the website",
    footer: "You're receiving this because you asked for daily messages during your stay at Templia Art.",
    unsubscribe: "Unsubscribe",
  },
  es: {
    signature: "Los Aluxes de Templia",
    welcomeSubject: "Bienvenida de los Aluxes de Templia",
    welcomeIntro: (name) =>
      `${name ? `Hola, ${name}. ` : ""}Somos los Aluxes de Templia — los pequeños guardianes que, en la tradición maya, cuidan esta tierra y a todos los que se quedan en ella.`,
    welcomeBody: (from, to) =>
      `Desde la mañana del ${from} hasta el ${to}, te dejaremos el mensaje de cada día a las 7:00, hora de Tulum. Mientras tanto, descansa — ya estamos cuidando el lugar.`,
    welcomeBodyTomorrow: (to) =>
      `A partir de mañana por la mañana, y cada mañana hasta el ${to}, te dejaremos el mensaje de cada día a las 7:00, hora de Tulum. Esta noche, descansa — estamos cuidando el lugar.`,
    notYou: "¿No eres tú, o cambiaste de idea?",
    greetingFirst: (name, tz) =>
      `Buenos días${name ? `, ${name}` : ""}. Somos los Aluxes de Templia, los pequeños guardianes de esta tierra. Despertamos antes que el sol, como siempre, y hoy tiene nombre: ${tz}.`,
    greetings: [
      (name, tz) => `Buenos días${name ? `, ${name}` : ""}. Despertamos antes que el sol, como siempre. Hoy tiene nombre: ${tz}.`,
      (name, tz) => `Buenos días${name ? `, ${name}` : ""}. El jardín aún está fresco, y hemos estado escuchando. El signo de hoy es ${tz}.`,
      (name, tz) => `Buenos días${name ? `, ${name}` : ""}. Recorrimos el terreno con la primera luz. El día que los recibe es ${tz}.`,
      (name, tz) => `Buenos días${name ? `, ${name}` : ""}. Antes que los pájaros, ya estábamos aquí. Hoy el recuento sagrado dice ${tz}.`,
    ],
    greetingLast: (name, tz) =>
      `Buenos días${name ? `, ${name}` : ""}. Esta es su última mañana con nosotros. El signo de hoy es ${tz}.`,
    signoffs: [
      "Estaremos en el jardín. Déjennos algo pequeño si quieren — lo notamos.",
      "Cuidamos mientras ustedes recorren. Vuelvan a nosotros esta noche.",
      "Si escuchan un susurro en la selva al anochecer, solo somos nosotros.",
      "Caminen con suavidad hoy. Nunca estamos lejos.",
    ],
    signoffLast: "Buen viaje. Un poco de esta tierra va con ustedes, y les guardaremos el lugar.",
    dayLabel: "Día",
    viewOnline: "Ver este día en el sitio web",
    footer: "Recibes este correo porque pediste mensajes diarios durante tu estadía en Templia Art.",
    unsubscribe: "Cancelar suscripción",
  },
};

const SANS = "Helvetica,Arial,sans-serif";

function layout(inner, footerHtml = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#0a0a0a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Georgia,'Times New Roman',serif;color:#ededed;">
<tr><td align="center" style="padding-bottom:24px;font-family:${SANS};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;">Templia Art</td></tr>
${inner}
${footerHtml}
</table></td></tr></table></body></html>`;
}

function button(href, label) {
  return `<tr><td align="center" style="padding:28px 0 8px;">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;border:1px solid #c9a84c;border-radius:999px;color:#c9a84c;text-decoration:none;font-family:${SANS};font-size:13px;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(label)}</a>
</td></tr>`;
}

function signatureRow(c, signoff) {
  return `<tr><td style="padding-top:32px;font-size:18px;line-height:1.6;font-style:italic;color:#d8d8d8;">${escapeHtml(signoff)}</td></tr>
<tr><td style="padding-top:10px;font-size:18px;color:#c9a84c;">— ${escapeHtml(c.signature)}</td></tr>`;
}

export function renderWelcomeEmail(env, digest, locale, unsubscribeUrl, { fromTomorrow = false } = {}) {
  const c = COPY[locale] ?? COPY.en;
  const intro = c.welcomeIntro(digest.guestName);
  const body = fromTomorrow
    ? c.welcomeBodyTomorrow(formatLongDate(digest.checkOut, locale))
    : c.welcomeBody(formatLongDate(digest.checkIn, locale), formatLongDate(digest.checkOut, locale));
  const html = layout(
    `<tr><td style="font-size:19px;line-height:1.6;">${escapeHtml(intro)}</td></tr>
<tr><td style="padding-top:16px;font-size:19px;line-height:1.6;">${escapeHtml(body)}</td></tr>
<tr><td style="padding-top:24px;font-size:18px;color:#c9a84c;">— ${escapeHtml(c.signature)}</td></tr>`,
    `<tr><td align="center" style="padding-top:32px;font-family:${SANS};font-size:12px;line-height:1.6;color:#8a8a8a;">${escapeHtml(c.notYou)} <a href="${escapeHtml(unsubscribeUrl)}" style="color:#8a8a8a;">${escapeHtml(c.unsubscribe)}</a></td></tr>`,
  );
  const text = `${intro}\n\n${body}\n\n— ${c.signature}\n\n${c.notYou} ${c.unsubscribe}: ${unsubscribeUrl}`;
  return { subject: c.welcomeSubject, html, text };
}

function aluxVoice(c, digest, day, isFirst) {
  const isLast = day.dayNumber === digest.totalDays;
  const pick = (list) => list[(day.dayNumber - 1) % list.length];
  // A guest's first email always introduces the Aluxes, even on the last morning.
  const greeting = isFirst
    ? c.greetingFirst(digest.guestName, day.tzolkin)
    : isLast
      ? c.greetingLast(digest.guestName, day.tzolkin)
      : pick(c.greetings)(digest.guestName, day.tzolkin);
  const signoff = isLast ? c.signoffLast : pick(c.signoffs);
  return { greeting, signoff };
}

export function renderDailyEmail(env, digest, day, locale, unsubscribeUrl, { isFirst = false } = {}) {
  const c = COPY[locale] ?? COPY.en;
  const url = journeyUrl(env, digest, locale, day.dayNumber);
  const eyebrow = `${c.dayLabel} ${day.dayNumber} · ${formatLongDate(day.date, locale)}`;
  const subject = `${c.dayLabel} ${day.dayNumber} · ${day.tzolkin} — ${day.title}`;
  const { greeting, signoff } = aluxVoice(c, digest, day, isFirst);

  const activitiesHtml = day.activities
    .map(
      (a) => `<tr><td style="padding-top:22px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #8a6d1b;">
<tr><td style="padding:2px 0 2px 18px;">
<div style="font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;padding-bottom:6px;">${escapeHtml(a.timeOfDay)}</div>
<div style="font-family:${SANS};font-size:15px;line-height:1.65;color:#ededed;">${escapeHtml(a.text)}</div>
</td></tr></table></td></tr>`,
    )
    .join("\n");

  const html = layout(
    `<tr><td style="font-size:19px;line-height:1.6;font-style:italic;color:#d8d8d8;padding-bottom:28px;">${escapeHtml(greeting)}</td></tr>
<tr><td align="center" style="font-family:${SANS};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;">${escapeHtml(eyebrow)}</td></tr>
<tr><td align="center" style="padding-top:14px;font-size:40px;color:#e8d48b;">${escapeHtml(day.tzolkin)}</td></tr>
<tr><td align="center" style="font-family:${SANS};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#bdbdbd;">${escapeHtml(day.signName)}</td></tr>
<tr><td align="center" style="padding-top:18px;font-size:22px;font-style:italic;color:#c9a84c;">${escapeHtml(day.title)}</td></tr>
<tr><td style="padding-top:22px;font-size:18px;line-height:1.65;">${escapeHtml(day.description)}</td></tr>
${activitiesHtml}
${signatureRow(c, signoff)}`,
    `<tr><td align="center" style="padding-top:32px;font-family:${SANS};font-size:13px;"><a href="${escapeHtml(url)}" style="color:#c9a84c;">${escapeHtml(c.viewOnline)}</a></td></tr>
<tr><td align="center" style="padding-top:20px;font-family:${SANS};font-size:12px;line-height:1.6;color:#8a8a8a;">${escapeHtml(c.footer)}<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:#8a8a8a;">${escapeHtml(c.unsubscribe)}</a></td></tr>`,
  );

  const text = [
    greeting,
    "",
    eyebrow,
    `${day.tzolkin} · ${day.signName}`,
    day.title,
    "",
    day.description,
    "",
    ...day.activities.map((a) => `${a.timeOfDay.toUpperCase()}\n${a.text}\n`),
    signoff,
    `— ${c.signature}`,
    "",
    `${c.viewOnline}: ${url}`,
    "",
    `${c.footer}\n${c.unsubscribe}: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

function pickDay(digest, locale, date) {
  const days = digest.locales[locale] ?? digest.locales.en;
  return days.find((d) => d.date === date) ?? null;
}

async function sendDayToRow(env, row, digest, today, { isFirst = false } = {}) {
  const day = pickDay(digest, row.locale, today);
  if (!day) return false;
  const unsubscribeUrl = `${siteBase(env)}/api/unsubscribe?token=${row.token}`;
  const email = renderDailyEmail(env, digest, day, row.locale, unsubscribeUrl, { isFirst });
  await sendEmail(env, { to: row.email, ...email, unsubscribeUrl });
  await env.DB.prepare("UPDATE subscriptions SET last_sent_date = ? WHERE token = ?").bind(today, row.token).run();
  return true;
}

// ---------------------------------------------------------------------------
// HTTP handlers
// ---------------------------------------------------------------------------

export async function handleSubscribe(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (request.method !== "POST") return json(request, { error: "method_not_allowed" }, 405);
  if (!env.DB) return json(request, { error: "not_configured" }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json(request, { error: "invalid_json" }, 400);
  }
  const slug = String(body.slug ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const locale = body.locale === "es" ? "es" : "en";

  if (!SLUG_RE.test(slug)) return json(request, { error: "invalid_slug" }, 400);
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(request, { error: "invalid_email" }, 400);

  const digest = await fetchDigest(env, slug);
  if (!digest) return json(request, { error: "journey_not_found" }, 404);
  const now = requestNow(request, env);
  const today = tulumToday(now);
  const late = tulumHour(now) >= LATE_SIGNUP_HOUR;
  if (digest.checkOut < today || (digest.checkOut === today && late)) return json(request, { error: "stay_ended" }, 410);

  if (today < addDaysIso(digest.checkIn, -SIGNUP_OPENS_DAYS_BEFORE)) return json(request, { error: "too_early" }, 409);

  const existing = await env.DB.prepare("SELECT status FROM subscriptions WHERE slug = ? AND email = ?").bind(slug, email).first();
  if (existing?.status === "active") return json(request, { status: "active" });

  const { n } = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM subscriptions WHERE slug = ? AND status = 'active' AND email <> ?",
  ).bind(slug, email).first();
  if (n >= MAX_EMAILS_PER_JOURNEY) return json(request, { error: "journey_full" }, 409);

  const token = newToken();
  const createdAt = now.toISOString();
  await env.DB.prepare(
    `INSERT INTO subscriptions (token, slug, email, locale, check_in, check_out, status, created_at, confirmed_at)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
     ON CONFLICT (slug, email) DO UPDATE SET
       token = excluded.token, locale = excluded.locale, check_in = excluded.check_in,
       check_out = excluded.check_out, status = 'active', created_at = excluded.created_at,
       confirmed_at = excluded.confirmed_at, last_sent_date = NULL`,
  ).bind(token, slug, email, locale, digest.checkIn, digest.checkOut, createdAt, createdAt).run();

  // Mid-stay: today's message doubles as the welcome (its greeting introduces the Aluxes).
  const row = { token, email, locale, last_sent_date: null };
  const inStay = today >= digest.checkIn && today <= digest.checkOut;
  const midStay = inStay && !late && pickDay(digest, locale, today);
  try {
    if (midStay) {
      await sendDayToRow(env, row, digest, today, { isFirst: true });
    } else {
      const unsubscribeUrl = `${siteBase(env)}/api/unsubscribe?token=${token}`;
      await sendEmail(env, { to: email, ...renderWelcomeEmail(env, digest, locale, unsubscribeUrl, { fromTomorrow: inStay }), unsubscribeUrl });
    }
  } catch (err) {
    console.error("welcome email failed", err);
    return json(request, { error: "email_failed" }, 502);
  }
  return json(request, { status: "active", sentToday: Boolean(midStay) });
}

export async function handleUnsubscribe(request, env) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const row = env.DB && token ? await env.DB.prepare("SELECT slug, locale FROM subscriptions WHERE token = ?").bind(token).first() : null;
  if (row) await env.DB.prepare("UPDATE subscriptions SET status = 'unsubscribed' WHERE token = ?").bind(token).run();

  if (request.method === "POST") return new Response("Unsubscribed", { status: 200 });
  if (!row) return Response.redirect(`${siteBase(env)}/`, 302);
  const url = new URL(`${siteBase(env)}/journey/${row.slug}/`);
  if (row.locale === "es") url.searchParams.set("lang", "es");
  url.searchParams.set("unsubscribed", "1");
  return Response.redirect(url.toString(), 302);
}

// ---------------------------------------------------------------------------
// Daily cron
// ---------------------------------------------------------------------------

export async function sendDailyEmails(env, now = new Date()) {
  if (!env.DB) return { sent: 0, skipped: 0 };
  const today = tulumToday(now);

  const { results } = await env.DB.prepare(
    `SELECT * FROM subscriptions
     WHERE status = 'active' AND check_in <= ?1 AND check_out >= ?1
       AND (last_sent_date IS NULL OR last_sent_date <> ?1)`,
  ).bind(today).all();

  const digests = new Map();
  let sent = 0;
  let skipped = 0;
  for (const row of results) {
    try {
      if (!digests.has(row.slug)) digests.set(row.slug, await fetchDigest(env, row.slug));
      const digest = digests.get(row.slug);
      if (digest && (await sendDayToRow(env, row, digest, today))) sent++;
      else skipped++;
    } catch (err) {
      skipped++;
      console.error(`daily send failed for ${row.slug}`, err);
    }
  }

  // Don't keep guest emails longer than needed.
  await env.DB.prepare("DELETE FROM subscriptions WHERE check_out < ?")
    .bind(addDaysIso(today, -RETENTION_DAYS_AFTER_CHECKOUT)).run();

  console.log(`[daily] ${today}: sent=${sent} skipped=${skipped}`);
  return { sent, skipped };
}
