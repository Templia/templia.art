-- Privacy-light visit counter for guest journey pages.
-- Aggregated per (page, Tulum day, visitor kind, country). No IPs, no
-- user agents, no cookies — just counts and first/last timestamps.
CREATE TABLE IF NOT EXISTS journey_visits (
  slug      TEXT NOT NULL,     -- e.g. 2026-11-13-to-2026-11-17-anne
  day       TEXT NOT NULL,     -- YYYY-MM-DD in Tulum time
  kind      TEXT NOT NULL,     -- person | preview | bot
  country   TEXT NOT NULL,     -- Cloudflare country code, or 'XX'
  hits      INTEGER NOT NULL DEFAULT 0,
  first_at  TEXT NOT NULL,     -- ISO timestamp (UTC)
  last_at   TEXT NOT NULL,
  PRIMARY KEY (slug, day, kind, country)
);
