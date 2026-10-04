-- Daily journey emails. One row per (journey, email).
CREATE TABLE IF NOT EXISTS subscriptions (
  token           TEXT PRIMARY KEY,          -- random; used in confirm/unsubscribe links
  slug            TEXT NOT NULL,
  email           TEXT NOT NULL,
  locale          TEXT NOT NULL DEFAULT 'en',
  check_in        TEXT NOT NULL,             -- YYYY-MM-DD
  check_out       TEXT NOT NULL,             -- YYYY-MM-DD
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | active | unsubscribed
  created_at      TEXT NOT NULL,
  confirmed_at    TEXT,
  last_sent_date  TEXT,                      -- YYYY-MM-DD (Tulum) of the last daily email
  UNIQUE (slug, email)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_active
  ON subscriptions (status, check_in, check_out);
