# GEO Audit Report — Templia Art
**Date:** 2026-03-19
**URL:** https://templia.art
**Business Type:** Boutique Spiritual Retreat / Luxury Hospitality
**Location:** Aldea Zama (Luum Zama), Tulum, Quintana Roo, Mexico

---

## Composite GEO Score: 38/100 — Poor

> Templia Art has a genuinely differentiated product and a technically open foundation, but the website functions as a near-invisible shell. The homepage has ~8 words of visible text and zero headings. The best content lives on ephemeral, date-specific URLs that cannot accumulate authority. No named person appears anywhere on the site. There is no About page, no privacy policy, and no brand presence on any platform AI models use as citation sources — except Airbnb (4.93 stars, 41 reviews). Fixing the homepage alone would lift the composite score by an estimated 12–15 points.

### Score Breakdown

| Category | Weight | Score | Weighted | Status |
|---|---|---|---|---|
| AI Citability & Visibility | 25% | 44/100 | 11.0 | Fair |
| Brand Authority Signals | 20% | 22/100 | 4.4 | Critical |
| Content Quality & E-E-A-T | 20% | 47/100 | 9.4 | Fair |
| Technical Foundations | 15% | 54/100 | 8.1 | Fair |
| Structured Data | 10% | 14/100 | 1.4 | Critical |
| Platform Optimization | 10% | 34/100 | 3.4 | Critical |
| **COMPOSITE GEO SCORE** | | | **37.7 → 38/100** | **Poor** |

### Scoring Scale
| Score | Status | Description |
|---|---|---|
| 81–100 | Excellent | Strong AI search visibility |
| 61–80 | Good | Solid presence with room to improve |
| 41–60 | Fair | Some visibility, significant gaps |
| 21–40 | Poor | Minimal AI discoverability |
| 0–20 | Critical | Virtually invisible to AI search |

---

## The Core Paradox

The site has two radically different technical tiers:

**Journey pages** (e.g., `/journey/2026-02-10-to-2026-02-12/`) are well-engineered: full SSR, meta descriptions, canonical tags, hreflang (en/es), Open Graph, JSON-LD schema, and substantive bilingual content with real Tzolkin calendar depth.

**The homepage** (`templia.art/`) is a static HTML file with a full-screen background image, an SVG logo, two icon links (Airbnb, Instagram), and approximately **8 words of visible text**. No title tag (confirmed absent). No meta description. No H1. No body copy. No schema. Invisible to every search engine and AI crawler on the planet.

The Tzolkin journey content is genuinely differentiated — no competitor in Tulum offers a structured, personalized Maya calendar-guided stay with a dedicated journey page. But this content sits on date-specific, ephemeral URLs (`/journey/YYYY-MM-DD-to-YYYY-MM-DD/`) tied to individual bookings. These pages cannot accumulate search authority because:
1. They are not linked from any permanent, indexable page
2. Their URLs change with every stay
3. There is no evergreen content hub for them to link back into

---

## Category Deep Dives

### 1. AI Citability & Visibility — 44/100

**Sub-scores:**

| Component | Score |
|---|---|
| Crawler Access | 100/100 |
| llms.txt Compliance | 70/100 |
| Citability (homepage) | 10/100 |
| Citability (journey page) | 65/100 |
| Brand Mentions | 22/100 |

**Crawler Access (100/100):** Perfect. `robots.txt` allows all AI crawlers with `User-agent: * Allow: /`. GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and all others are permitted. Sitemap is referenced. iCal feed at `/availability.ics` is live and machine-readable — an excellent forward-thinking signal for AI booking agents.

**llms.txt (70/100):** Present at both `/llms.txt` and `/.well-known/llms.txt`. Content is strong: property description, amenities, Tzolkin journey explanation, check-in/out times, capacity, iCal link, booking email, nearby attractions. Missing: pricing range, cancellation policy, seasonal guidance. Format deviates slightly from the emerging spec (should open with `# Templia Art` as H1, then `> description` blockquote).

**Citability:** Homepage scores 10/100 — there is nothing to cite. Journey page scores 65/100 — the day sign descriptions, three-day itinerary with named venues, and Museum Mureco details are all citation-ready passages. Top citable passage: the meta description ("Your personalized Tzolkin-guided journey at Templia Art. A sacred calendar experience in Tulum, Aldea Zama, Luum Zama.") scores 78/100.

**Brand Mentions (22/100):**

| Platform | Status |
|---|---|
| Airbnb | ✅ Confirmed — 4.93 stars, 41 reviews |
| Instagram | ✅ Inferred (@templia.art) |
| Wikipedia | ❌ No article |
| LinkedIn | ❌ No company page (404) |
| YouTube | ❌ No channel found |
| TripAdvisor | ❓ Unknown (403 blocked) |
| Booking.com | ❓ Unknown (WAF blocked) |
| Reddit | ❓ Unknown (blocked) |
| Google Maps | ❓ Unknown (JS-rendered) |

---

### 2. Brand Authority Signals — 22/100

"Templia Art" is not a recognized entity in any AI knowledge base. The brand name is distinctive (good for disambiguation), but there is no Wikipedia article, no Wikidata entry, no press coverage, and no LinkedIn page — the three sources AI models weight most heavily for entity construction.

The Airbnb listing with 41 reviews and 4.93 stars is the strongest external signal, but Airbnb authority is not easily attributed back to `templia.art` without schema `sameAs` linking.

The highest-opportunity semantic cluster is **"Tzolkin calendar experience Tulum"** — specific, low-competition, and unique to this property. No major competitor offers this. A single editorial mention from a travel publication or cultural tourism site would immediately create a citation-quality source AI models could use.

---

### 3. Content Quality & E-E-A-T — 47/100

**E-E-A-T Breakdown:**

| Dimension | Score | Key Issue |
|---|---|---|
| Experience | 11/25 | No guest testimonials, no owner narrative, no before/after outcomes |
| Expertise | 10/25 | Genuine Tzolkin depth but no named author, no credentials, no cultural attribution |
| Authoritativeness | 8/25 | No About page, no press coverage, no organizational identity |
| Trustworthiness | 9/25 | HTTPS present; no privacy policy, no terms, no cancellation policy on site |

**Content metrics:**

| Page | Word Count | Assessment |
|---|---|---|
| Homepage | ~8 words | Critical — extreme thin content |
| Journey page | ~2,800 words | Good for the topic |

No internal links exist anywhere on the site. Each journey page is an island. The homepage has zero headings.

The journey page content demonstrates real Tzolkin knowledge (correct nawal assignments, tonal system, cultural context, specific named venues) and is likely human-edited AI output — above the floor for AI-generated content, but needs author attribution and experience signals to be trustworthy.

---

### 4. Technical Foundations — 54/100

| Category | Score | Status |
|---|---|---|
| Server-Side Rendering | 45/100 | Warning |
| Meta Tags & Indexability | 55/100 | Warning |
| Crawlability | 65/100 | Fair |
| Security Headers | 40/100 | Poor |
| Core Web Vitals Risk | 50/100 | Warning |
| Mobile Optimization | 80/100 | Good |
| URL Structure | 85/100 | Good |

**Critical findings:**
- Homepage is static HTML (not Next.js) with no `<title>`, no meta description, no canonical, no viewport confirmed
- Hero image uses CSS `background-image` — not preloadable, high LCP risk
- Sitemap has no `<lastmod>` dates
- Hreflang uses `?lang=es` query parameters (functional but non-ideal; no `x-default` declared)
- Security headers unconfirmed (Vercel deployment likely includes some defaults)
- `stay.templia.art` → Airbnb 301 redirect passes link equity to Airbnb, not to `templia.art`

**Positive findings:**
- URL structure is clean and readable
- Journey pages are SSR with full meta tag coverage
- No AI crawler blocks in robots.txt
- Mobile viewport confirmed on journey pages

---

### 5. Structured Data — 14/100

**Current schema inventory:**

| Page | Schema Found |
|---|---|
| Homepage (`/`) | None |
| Journey page | 1× TouristTrip JSON-LD (partial) |

The homepage has zero structured data. The journey page has a TouristTrip schema that is missing its `itinerary` block (present in earlier versions, absent in current live response), has no `offers`, no `image`, no `speakable`, and a severely under-specified `provider`.

Critically: the `sameAs` property is entirely absent across all pages. The Airbnb listing URL and Instagram profile are present as raw HTML links but have never been connected to the entity via schema — meaning AI knowledge graphs cannot resolve "Templia Art" to its external platform presences.

No `LodgingBusiness` schema exists as a standalone top-level entity, which means Google has no structured anchor to build a Knowledge Panel or LodgingBusiness rich card from.

---

### 6. Platform Optimization — 34/100

| Platform | Score | Status |
|---|---|---|
| Google AI Overviews | 28/100 | Critical |
| ChatGPT Web Search | 32/100 | Critical |
| Perplexity AI | 38/100 | Poor |
| Google Gemini | 35/100 | Poor |
| Bing Copilot | 38/100 | Poor |

All five platforms are penalized by the same root cause: the homepage delivers no crawlable text content. Google AI Overviews scores lowest (28) because it requires semantic headings, answer-target patterns, and E-E-A-T signals that the site entirely lacks.

No Google Business Profile confirmed → Gemini cannot source local intent queries.
No Bing Webmaster Tools verification → IndexNow is unavailable.
No LinkedIn page → Copilot entity corroboration absent.

---

## Action Plan

### Quick Wins (1–3 hours each, critical impact)

**1. Add content to the homepage — Estimated impact: +12–15 GEO points**

The homepage needs at minimum:
- A `<title>` tag: `Templia Art — Maya-Inspired Luxury Retreat in Tulum, Mexico`
- A `<meta name="description">`: 150-character description of the property
- An `<h1>` heading: e.g., `Templia Art · Tulum`
- A 150–200 word paragraph describing the Tzolkin journey concept, location, capacity, and how to book
- A visible email or booking CTA
- Open Graph tags for social sharing

This single change affects all 6 scoring categories simultaneously.

**2. Add LodgingBusiness JSON-LD to the homepage — Estimated impact: +5–7 GEO points**

Deploy the following schema block in `<head>` of `index.html`:

```json
{
  "@context": "https://schema.org",
  "@type": ["LodgingBusiness", "LocalBusiness"],
  "@id": "https://templia.art/#lodging",
  "name": "Templia Art",
  "url": "https://templia.art",
  "description": "A Mayan-inspired luxury stay in Aldea Zama, Tulum. Private pool, jungle garden, and Mayan firepit. Maya Tzolk'in sacred calendar-guided experiences for each stay.",
  "image": "https://templia.art/og-image.jpg",
  "logo": "https://templia.art/assets/images/logo.svg",
  "email": "stay@templia.art",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tulum",
    "addressRegion": "Quintana Roo",
    "postalCode": "77760",
    "addressCountry": "MX"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[your latitude]",
    "longitude": "[your longitude]"
  },
  "priceRange": "$$$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.93",
    "reviewCount": "41",
    "bestRating": "5"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Private Pool", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Full Kitchen", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Mayan Firepit", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Steam Shower", "value": true }
  ],
  "numberOfRooms": 2,
  "checkinTime": "16:00",
  "checkoutTime": "11:00",
  "tourBookingPage": "https://stay.templia.art",
  "sameAs": [
    "https://www.airbnb.com/h/templia-art",
    "https://www.instagram.com/templia.art/"
  ]
}
```

Also add a `WebSite` + `FAQPage` block (see Schema Report for complete templates).

**3. Create a Google Business Profile — Estimated impact: +4–6 GEO points**

Free, 30-minute setup. Add: business name "Templia Art", address in Aldea Zama, category "Vacation Rental", photos, link to `templia.art`. This feeds directly into Gemini, Google AI Overviews, and Google Maps. The GBP URL then becomes a `sameAs` value in your schema.

**4. Update llms.txt — Estimated impact: +2–3 GEO points**

Add to the existing `llms.txt`:
- Approximate nightly rate (even a range: "typically $X–$Y USD/night depending on season")
- Cancellation policy summary
- Seasonal guidance (high season: Dec–Apr; wet season: Jun–Oct)
- Update the opening to: `# Templia Art` followed by `> Mayan-inspired luxury stay in Tulum with personalized Tzolkin calendar journeys.`
- Create `/llms-full.txt` with full property narrative and a sample journey excerpt

**5. Create a LinkedIn company page — Estimated impact: +2 GEO points**

15-minute setup. Business name: Templia Art. Location: Tulum, Quintana Roo. Category: Hospitality. Link back to `templia.art`. This creates an entity anchor that feeds Bing Copilot and ChatGPT entity corroboration.

**6. Submit to Bing Webmaster Tools — Estimated impact: +1–2 GEO points**

Add `<meta name="msvalidate.01" content="[key]">` to homepage. Submit sitemap. Enables IndexNow for instant indexation of new journey pages.

---

### Medium Term (days to weeks)

**7. Create an About page at `/about/`**

Name the owner. Tell the story of how Templia Art was built and why the Tzolkin calendar is central to the experience. Even 300 words with a photo of the host transforms the site from an anonymous property listing to an authoritative source. This is the single highest-impact E-E-A-T fix available.

**8. Create an evergreen `/tzolkin-journey/` page**

A permanent, non-date-specific page explaining:
- What the Maya Tzolkin calendar is
- How the nawal system works
- What a personalized journey looks like (use an anonymized past example)
- Why this makes Templia Art unique in Tulum

This page becomes the internal link target for every journey page, creating topical authority that accumulates over time. It is also the primary page AI models would cite for "Maya calendar experience Tulum" queries.

**9. Add Privacy Policy and Terms of Service**

These are baseline legal requirements (GDPR for EU guests, LFPDPPP for Mexico). Their absence signals low trustworthiness to both human visitors and AI models evaluating the site.

**10. Build internal links**

- Homepage → `/about/`, `/tzolkin-journey/`, booking CTA
- Each journey page → `/tzolkin-journey/`, `/about/`
- Currently: zero internal links exist anywhere on the site

**11. Add `<lastmod>` dates and new pages to sitemap.xml**

Dynamically add each new journey page URL to the sitemap as it is created. Add `<lastmod>` for both existing URLs.

**12. Fix hreflang implementation**

Add `x-default` hreflang. Consider migrating from `?lang=es` to `/es/journey/...` subdirectory for proper Spanish indexation.

---

### Strategic (weeks to months)

**13. Earn one editorial mention on a high-authority travel site**

Target: Condé Nast Traveler Mexico, Travel + Leisure, Vogue Mexico, Lonely Planet Tulum guide, or a travel blog with DR 50+. The "Tzolkin calendar experience" angle is a genuinely novel story — it has never been covered. A single well-placed article mentioning "Templia Art" by name and linking to `templia.art` would immediately create a citation-quality source for all five AI platforms.

**14. Claim TripAdvisor listing**

TripAdvisor is one of the highest-weight hospitality sources in AI travel responses. A claimed listing cross-promoting the 41 Airbnb reviews would significantly improve brand mention score.

**15. Create a YouTube property video**

A 2–3 minute walkthrough video uploaded to a named Templia Art YouTube channel provides platform-indexed presence and a shareable asset for travel writers.

**16. Add guest testimonials to the website**

3–5 testimonials (first name + stay date, sourced from Airbnb reviews with permission) directly on the site would dramatically improve the Experience dimension of E-E-A-T.

---

## What's Already Working

| Strength | Value |
|---|---|
| Unique differentiator | Personalized Tzolkin journey concept has no direct competitor in Tulum |
| Crawler access | Perfect robots.txt — all AI bots welcome |
| llms.txt existence | Forward-thinking; one of few Tulum properties with this file |
| iCal feed | Machine-readable availability at `/availability.ics` — excellent for AI booking agents |
| Journey page quality | Well-structured SSR, full meta tags, bilingual, genuine Tzolkin depth |
| Airbnb signal | 4.93/5 stars, 41 reviews — strong social proof awaiting schema integration |
| Domain name | `templia.art` — memorable, distinctive, .art TLD reinforces cultural positioning |

---

## Files Generated

- `GEO-AUDIT-REPORT.md` — This report

## Recommended Next Steps

1. Run `/geo schema templia.art` — for complete production-ready JSON-LD to deploy today
2. Run `/geo llmstxt templia.art` — for an updated llms.txt with pricing and full spec compliance
3. Run `/geo report-pdf templia.art` — for a client-ready PDF version of this report

---

*GEO Audit generated by Claude Code — 2026-03-19*
*Methodology: 5 parallel specialized agents — AI Visibility, Platform Analysis, Technical SEO, Content Quality, Schema Markup*
