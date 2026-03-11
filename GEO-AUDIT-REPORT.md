# GEO Audit Report: Templia Art

**Audit Date:** March 11, 2026
**URL:** https://templia.art
**Business Type:** Hospitality / Lodging (Luxury Vacation Rental)
**Pages Analyzed:** 2 (homepage + 1 journey page)
**Location:** Luum Zama, Aldea Zama, Tulum, Quintana Roo, Mexico

---

## Executive Summary

**Overall GEO Score: 37/100 (Poor)**

Templia Art is a luxury vacation rental in Tulum offering a genuinely unique product -- personalized Mayan Tzolkin calendar-guided journeys for guests. The site has surprisingly strong AI infrastructure (permissive robots.txt, excellent llms.txt, correct schema markup) but is critically undermined by two structural problems: (1) the homepage contains zero text content, and (2) the brand has near-zero presence outside its own domain. The journey page content is rich and original (~3,000 words bilingual) but bails out to client-side rendering, making it invisible to AI crawlers that don't execute JavaScript. The site's biggest strength -- the llms.txt implementation -- is among the best-structured agent guides for a small hospitality property, partially compensating for the content delivery gaps.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 52/100 | 25% | 13.0 |
| Brand Authority | 12/100 | 20% | 2.4 |
| Content E-E-A-T | 38/100 | 20% | 7.6 |
| Technical GEO | 52/100 | 15% | 7.8 |
| Schema & Structured Data | 34/100 | 10% | 3.4 |
| Platform Optimization | 28/100 | 10% | 2.8 |
| **Overall GEO Score** | | | **37/100** |

### Platform Readiness

| Platform | Score | Key Gap |
|---|---|---|
| Google AI Overviews | 28/100 | No Google Business Profile, thin content |
| ChatGPT Web Search | 32/100 | No entity recognition, weak sameAs |
| Perplexity AI | 35/100 | No Reddit/community presence, undated content |
| Google Gemini | 22/100 | Zero Google ecosystem presence |
| Bing Copilot | 24/100 | No Bing Webmaster Tools, no LinkedIn |

---

## Critical Issues (Fix Immediately)

### 1. Journey page content invisible to AI crawlers
**Severity:** Critical
**Page:** `/journey/2026-02-10-to-2026-02-12/`
**Issue:** Next.js emits `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">` -- the entire ~3,000 words of journey content exists only in RSC streaming scripts and requires JavaScript to render. AI crawlers (GPTBot, ClaudeBot, PerplexityBot) see only the meta tags and JSON-LD schema, not the actual content.
**Fix:** Investigate why the App Router bails out of SSR. Common causes: `useSearchParams()`, `cookies()`, or `headers()` at the page level without a Suspense boundary. Ensure the main content component is a Server Component. Only interactive elements (theme toggle) should be Client Components.
**Impact:** Would make ~3,000 words of unique, citable content visible to all AI systems.

### 2. Homepage contains zero text content
**Severity:** Critical
**Page:** `/` (priority 1.0 in sitemap)
**Issue:** The homepage is a full-bleed background image with a logo and two icon links (Airbnb, Instagram). No H1, no paragraphs, no meta description, no OG tags, no structured data rendered in production. Search engines and AI crawlers cannot determine what this site is about.
**Fix:** Add a descriptive H1, a paragraph explaining the Templia Art concept, property highlights, location, and a value proposition. Add meta description, OG tags, and ensure the LodgingBusiness schema (present in source code) deploys to production.
**Impact:** Transforms the highest-priority page from invisible to indexable.

### 3. No About page exists
**Severity:** Critical
**Page:** `/about` returns 404
**Issue:** No host identity, no credentials, no story about why Templia exists. This is the single highest-impact gap for E-E-A-T. The Tzolkin journey experience is built on claimed cultural expertise, but there is zero evidence of who is behind it.
**Fix:** Create an About page with: host name and photo, background with Maya calendar practices, connection to Tulum and Maya culture, any training or credentials.
**Impact:** Addresses Experience, Expertise, Authoritativeness, and Trustworthiness simultaneously.

### 4. No privacy policy
**Severity:** Critical
**Page:** `/privacy` returns 404
**Issue:** The site collects guest birth dates for nawal calculations -- this is personal data requiring disclosure under GDPR and Mexico's LFPDPPP. A privacy policy is a baseline trust requirement.
**Fix:** Create a privacy policy page disclosing data collection, usage, and retention practices.

---

## High Priority Issues

### 5. Brand has near-zero external presence
**Score:** Brand Authority 12/100
**Issue:** "Templia Art" has no Wikipedia page, no Reddit mentions, no YouTube content, no LinkedIn page, no TripAdvisor listing, no Google Business Profile, no travel blog coverage. The Airbnb listing (4.93/5, 40 reviews) does not include "Templia Art" in its title, severing the brand connection.
**Fix:** Create Google Business Profile, LinkedIn page, seed 2-3 Reddit discussions in r/tulum, create a YouTube property walkthrough, and update Airbnb listing title to include "Templia Art."

### 6. Missing security headers
**Score:** Security 40/100
**Issue:** No Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy headers. HSTS present but missing `includeSubDomains`.
**Fix:** Configure via Cloudflare dashboard or `_headers` file for GitHub Pages.

### 7. LodgingBusiness schema critically incomplete
**Score:** Schema 34/100
**Issue:** Missing: geo coordinates, telephone, email, priceRange, checkinTime/checkoutTime, amenityFeature, numberOfRooms, aggregateRating, logo. sameAs has only Instagram (the `stay.templia.art` redirect doesn't count as a platform profile).
**Fix:** Expand schema with all missing properties. Add direct Airbnb URL, Google Business Profile, and other platform links to sameAs.

### 8. No Person schema for host/curator
**Issue:** The Tzolkin journey experience is built on cultural expertise, but there is no structured identity for the person behind it. AI models cannot evaluate authority without a Person entity.
**Fix:** Add Person schema with name, jobTitle, knowsAbout, worksFor (linked to LodgingBusiness via @id), and sameAs links.

### 9. Sitemap missing lastmod dates
**Issue:** Both URLs in sitemap.xml lack `<lastmod>` timestamps. Search engines cannot determine content freshness.
**Fix:** Add lastmod dates to all sitemap entries.

### 10. No contact page visible on site
**Issue:** Email (stay@templia.art) exists in llms.txt but is not visible on the website. No phone number, no physical address displayed.
**Fix:** Add a contact section or page with email, phone, and address.

---

## Medium Priority Issues

### 11. No educational/informational content
**Issue:** The site has zero query-answerable content. No "What is the Tzolkin calendar?" page, no FAQ, no Tulum guide. AI systems answering questions about Mayan calendar experiences have nothing to cite.
**Fix:** Create a "What is a Tzolkin Journey?" page with FAQPage schema and question-based H2 headings.

### 12. No author attribution on journey content
**Issue:** Journey pages have no byline, no "curated by" credit. E-E-A-T requires identifiable authorship.
**Fix:** Add a byline linking to the About page.

### 13. Zero internal linking structure
**Issue:** Homepage doesn't link to journey pages. Journey pages don't link back. No navigation exists.
**Fix:** Build navigation and cross-linking between all pages.

### 14. Missing speakable schema
**Issue:** No speakable property on any schema. Journey descriptions are ideal candidates for voice assistant consumption.
**Fix:** Add speakable CSS selectors to TouristTrip schema.

### 15. Missing BreadcrumbList schema
**Issue:** No breadcrumb navigation or schema on journey pages.
**Fix:** Add BreadcrumbList: Home > Journeys > [Specific Journey].

### 16. No visible publication/modification dates
**Issue:** No dates on any page. All 5 AI platforms favor dated content.
**Fix:** Add both meta dates and visible human-readable dates.

### 17. Homepage missing canonical tag
**Issue:** Potential duplicate content risk between www and non-www.
**Fix:** Add self-referencing canonical.

---

## Low Priority Issues

### 18. Homepage logo image missing width/height attributes
Risks CLS (Cumulative Layout Shift).

### 19. No `<link rel="preconnect">` for Font Awesome CDN
Render-blocking third-party stylesheet on homepage.

### 20. Fixed-position social icons may overlap on small mobile screens
`bottom: 60px; right: 50px` positioning not responsive.

### 21. Font-display property not confirmed
Fonts preloaded via WOFF2 but no visible `font-display: swap`.

### 22. No Bing Webmaster Tools registration
Missing msvalidate.01 meta tag and IndexNow implementation.

---

## Category Deep Dives

### AI Citability (52/100)

**Homepage: 0/100** -- Zero text content. Nothing to cite.

**Journey Page: 72/100** -- Strong citability with several well-structured passages:
- Tzolkin Journey concept description (78/100) -- clear, factual, self-contained
- Day activity descriptions (74/100) -- specific, actionable recommendations
- Museum/park recommendations (71/100) -- factual with hours and links
- Maya calendar explanations (68/100) -- educational, quotable

**Weaknesses:**
- Personalized content (addresses "Galii" by name) reduces general citability
- Poetic/spiritual prose is evocative but less quotable than factual statements
- Spanish translations provide bilingual coverage but are duplicate content

### Brand Authority (12/100)

| Platform | Present? | Notes |
|---|---|---|
| Airbnb | Yes | 4.93/5, 40 reviews, but title omits "Templia Art" |
| Instagram | Yes | @templia.art |
| Google Business Profile | No | Critical gap |
| Wikipedia | No | |
| Reddit | No | |
| YouTube | No | |
| LinkedIn | No | |
| TripAdvisor | No | |
| Travel blogs | No | |

AI models cannot recognize "Templia Art" as an entity. The single strongest external signal (Airbnb reviews) is disconnected from the brand name.

### Content E-E-A-T (38/100)

| Dimension | Score | Key Evidence |
|---|---|---|
| Experience | 14/25 | Specific local knowledge (restaurants, cenotes, property features) but no photos, testimonials, or first-person narrative |
| Expertise | 12/25 | Correct K'iche' Maya terminology, accurate Tzolkin system, but no author credentials or cited sources |
| Authoritativeness | 5/25 | No about page, no team page, no press coverage, no institutional backing |
| Trustworthiness | 9/25 | HTTPS present, Airbnb reviews exist, but no privacy policy, no contact page, no editorial transparency |

**Content Assessment:** Likely human-edited AI. The journey content combines computational calendar data with curated interpretive text. Specificity of local recommendations suggests real human input. Quality is above typical unedited AI output.

**Topical Authority:** Minimal. 2 pages covering ~5-10% of expected subtopics for a luxury cultural experience property. No content hub, no blog, no FAQ, no educational content.

### Technical GEO (52/100)

| Category | Score | Status |
|---|---|---|
| Server-Side Rendering | 35/100 | CRITICAL -- CSR bailout on journey page |
| Meta Tags & Indexability | 45/100 | Mixed -- journey excellent, homepage empty |
| Crawlability | 80/100 | Good -- open robots.txt, llms.txt excellent |
| Security Headers | 40/100 | Poor -- missing CSP, X-Frame-Options, etc. |
| Core Web Vitals Risk | 55/100 | Medium -- CSR bailout is main concern |
| Mobile Optimization | 60/100 | Partial -- viewport set, but fixed positioning issues |
| URL Structure | 75/100 | Good -- clean, readable URLs |
| Response & Status | 85/100 | Good -- 200 OK, HTTP/2, CDN |

**Strongest technical asset:** The llms.txt implementation is excellent -- dual paths (/llms.txt + /.well-known/llms.txt), `<link rel="llms">` discovery tags, robots.txt LLMS directives, and comprehensive agent-actionable content including iCal availability feed.

**Biggest technical liability:** The BAILOUT_TO_CLIENT_SIDE_RENDERING on the journey page means the site's most valuable content is invisible to non-JS crawlers.

### Schema & Structured Data (34/100)

| Schema Type | Page | Status |
|---|---|---|
| LodgingBusiness | Homepage | Present but incomplete (missing geo, phone, email, priceRange, amenities, reviews) |
| TouristTrip | Journey | Present with correct itinerary structure, but missing image, offers, speakable |
| Person | -- | Missing entirely |
| BreadcrumbList | -- | Missing entirely |
| WebSite | -- | Missing entirely |
| FAQPage | -- | Missing entirely |

**Format:** JSON-LD exclusively (correct choice). Static export ensures schemas are in HTML, not JS-dependent.

**Entity Linking:** Only 1 meaningful sameAs link (Instagram). AI models have almost no ability to cross-reference "Templia Art" as an entity.

### Platform Optimization (28/100)

All platforms suffer from the same two root causes: content thinness (2 pages) and entity invisibility (zero presence outside own domain + Airbnb).

- **Perplexity** (35) is the best-positioned platform due to llms.txt and open crawler access
- **Gemini** (22) is the worst-positioned due to zero Google ecosystem presence

---

## Quick Wins (Implement This Week)

1. **Add text content to the homepage** -- H1, descriptive paragraph, meta description, OG tags. Transforms the highest-priority page from invisible to indexable. (Effort: Low, Impact: Critical)

2. **Create a Google Business Profile** -- Establishes entity in Google's Knowledge Graph, enables reviews, feeds Gemini and Google AI Overviews. (Effort: Low, Impact: High)

3. **Update Airbnb listing title to include "Templia Art"** -- Connects the 40 reviews (4.93/5) to the brand name for AI entity recognition. (Effort: Low, Impact: High)

4. **Add lastmod dates to sitemap.xml** -- Signals content freshness to all crawlers. (Effort: Low, Impact: Medium)

5. **Expand LodgingBusiness sameAs array** -- Add direct Airbnb URL, Google Business Profile URL, and any other platform profiles. Each link strengthens entity resolution. (Effort: Low, Impact: High)

## 30-Day Action Plan

### Week 1: Fix Critical Content Gaps
- [ ] Fix BAILOUT_TO_CLIENT_SIDE_RENDERING on journey pages (investigate Suspense boundaries)
- [ ] Add text content, meta description, OG tags, and canonical to homepage
- [ ] Verify LodgingBusiness schema deploys to production on homepage
- [ ] Create About page with host identity, photo, and credentials
- [ ] Create Privacy Policy page
- [ ] Add contact information visible on the website

### Week 2: Build Entity Presence
- [ ] Create Google Business Profile with complete information
- [ ] Create LinkedIn company page
- [ ] Update Airbnb listing title to include "Templia Art"
- [ ] Add all platform profile URLs to sameAs in LodgingBusiness schema
- [ ] Add Person schema for host/curator
- [ ] Register with Bing Webmaster Tools, implement IndexNow

### Week 3: Expand Content & Schema
- [ ] Create "What is a Tzolkin Journey?" educational page with FAQPage schema
- [ ] Add BreadcrumbList schema to journey pages
- [ ] Add speakable property to TouristTrip schema
- [ ] Add author attribution/byline to journey pages
- [ ] Build internal linking between all pages
- [ ] Add visible publication/modification dates to all pages
- [ ] Add lastmod dates to sitemap.xml

### Week 4: Community & Platform Seeding
- [ ] Seed 2-3 organic Reddit discussions in r/tulum or r/TravelMexico
- [ ] Create a YouTube property walkthrough or Tzolkin explainer video
- [ ] Configure security headers via Cloudflare (CSP, X-Frame-Options, etc.)
- [ ] Add explicit AI bot rules in robots.txt (GPTBot, OAI-SearchBot, PerplexityBot)
- [ ] Fix mobile responsiveness issues (social icon positioning)
- [ ] Add width/height to all images, confirm font-display settings

---

## Appendix: Pages Analyzed

| URL | Title | Key GEO Issues |
|---|---|---|
| `https://templia.art/` | "Templia" | Zero text content, no meta description, no OG tags, no canonical, no visible schema in production |
| `https://templia.art/journey/2026-02-10-to-2026-02-12/` | "Templia Art . Tzolkin Journey . February 10, 2026 -- February 12, 2026" | CSR bailout hides content from AI crawlers, no author attribution, no visible dates |
| `https://templia.art/llms.txt` | (machine-readable) | Excellent quality -- comprehensive agent guide with booking flow and iCal feed |
| `https://templia.art/robots.txt` | (machine-readable) | Fully permissive, includes LLMS directives |
| `https://templia.art/sitemap.xml` | (machine-readable) | Only 2 URLs, missing lastmod dates |
