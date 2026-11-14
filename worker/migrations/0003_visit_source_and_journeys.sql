-- 1. Record where a journey page visit came from (?via=guest, ?via=email, …).
--    `via` joins the primary key, so the table is rebuilt (SQLite can't alter a PK).
CREATE TABLE journey_visits_new (
  slug      TEXT NOT NULL,
  day       TEXT NOT NULL,     -- YYYY-MM-DD in Tulum time
  kind      TEXT NOT NULL,     -- person | preview | bot
  via       TEXT NOT NULL DEFAULT '',  -- link tag from ?via=…, '' when absent
  country   TEXT NOT NULL,
  hits      INTEGER NOT NULL DEFAULT 0,
  first_at  TEXT NOT NULL,
  last_at   TEXT NOT NULL,
  PRIMARY KEY (slug, day, kind, via, country)
);
INSERT INTO journey_visits_new (slug, day, kind, via, country, hits, first_at, last_at)
  SELECT slug, day, kind, '', country, hits, first_at, last_at FROM journey_visits;
DROP TABLE journey_visits;
ALTER TABLE journey_visits_new RENAME TO journey_visits;

-- 2. Private list of guest stays, so the owner's morning summary knows which
--    pages to report on (including ones nobody has opened yet). Filled from
--    guests/*.md by scripts/register-journeys.mjs; never published.
CREATE TABLE IF NOT EXISTS journeys (
  slug       TEXT PRIMARY KEY,  -- base slug: YYYY-MM-DD-to-YYYY-MM-DD
  guest      TEXT NOT NULL,
  check_in   TEXT NOT NULL,
  check_out  TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
