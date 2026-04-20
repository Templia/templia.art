# templia-edge worker (deployed as `templia-markdown-for-agents`)

Cloudflare Worker bound to `templia.art/*`. Five jobs today:

1. **`/api/availability`** — JSON availability window parsed from the Airbnb-synced iCal feed at `https://templia.art/availability.ics`.
2. **`/api/tzolkin/journey`** — Tzolk'in (Maya sacred calendar) reading for an arrival/departure window. Deterministic from the anchor `2026-02-10 = 6 Kawoq`; matches `src/lib/tzolkin.ts` used by the app.
3. **`/.well-known/api-catalog`** — [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727) API Catalog published as an [RFC 9264](https://www.rfc-editor.org/rfc/rfc9264) linkset (`application/linkset+json`). One entry per public API; each anchors the endpoint URL and links to `service-desc` (`/.well-known/openapi.json`) and `service-doc` (`/llms.txt`).
4. **`/mcp` + `/.well-known/mcp-server-card`** — Model Context Protocol server (Streamable HTTP, stateless, protocol version `2025-11-25`). Three tools wrap the APIs above: `check_availability`, `get_property_info`, `get_tzolkin_reading`. The card is also served at the legacy SEP-1649 path `/.well-known/mcp/server-card.json` so current discovery scanners find it.
5. **Markdown for Agents** — when a client sends `Accept: text/markdown`, the Worker intercepts, fetches the HTML version from origin, converts it with Workers AI's `toMarkdown()` utility, and returns `Content-Type: text/markdown; charset=utf-8` plus `x-markdown-tokens` and `Vary: Accept`. Reproduces the native [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) feature on the Free plan.

All other requests pass through unchanged. The `templia.art/availability.ics` route is owned by a separate Worker (`templia-availability-ics`) that proxies Google Calendar — Cloudflare picks the more-specific route first, so we can safely fetch that URL from here without recursing.

## Files

- `src/index.js` — Worker source (router + handlers).
- `wrangler.toml` — route binding (`templia.art/*`), AI binding, compatibility date.
- `package.json` — pulls in `wrangler` for deploys.

## One-time setup

```bash
cd worker
npm install
npx wrangler login   # opens browser, pick Vitaly@yuxt.com's Account
```

## Deploy

```bash
cd worker
npx wrangler deploy
```

After the first deploy, any subsequent push deploys just re-runs `npx wrangler deploy`.

## Verify

### `/api/availability`

```bash
# Default window (today → today+30)
curl -s https://templia.art/api/availability | head -40

# Explicit range
curl -s 'https://templia.art/api/availability?from=2026-06-01&to=2026-06-05' | python3 -m json.tool

# Invalid request — should return 400 with error body
curl -sI 'https://templia.art/api/availability?from=nope' | head -3
```

Expected shape:

```json
{
  "from": "2026-06-01",
  "to": "2026-06-05",
  "nights": 4,
  "available": true,
  "reason": null,
  "minNights": 3,
  "meetsMinNights": true,
  "blockedRanges": [],
  "bookingUrl": "https://stay.templia.art",
  "source": {
    "url": "https://templia.art/availability.ics",
    "fetchedAt": "2026-04-19T22:54:36.542Z"
  },
  "disclaimer": "Calendar feeds can lag. Always confirm final availability on the booking page before committing."
}
```

### `/api/tzolkin/journey`

```bash
# Default window (today → today+3)
curl -s https://templia.art/api/tzolkin/journey | python3 -m json.tool | head -30

# Explicit window — should return 4 nights with full days for Jun 2/3/4
curl -s 'https://templia.art/api/tzolkin/journey?from=2026-06-01&to=2026-06-05' | python3 -m json.tool

# Anchor check — arrival should be `6 Kawoq`
curl -s 'https://templia.art/api/tzolkin/journey?from=2026-02-10&to=2026-02-13' | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["arrival"]["displayName"])'
```

Expected shape:

```json
{
  "from": "2026-06-01",
  "to": "2026-06-05",
  "nights": 4,
  "arrival": {
    "date": "2026-06-01",
    "displayName": "13 Tz'i'",
    "tone": { "number": 13, "name": "Oxlajuj", "meaning": "Transcendence", "description": "..." },
    "daySign": { "number": 10, "name": "Tz'i'", "englishName": "Dog", "element": "Air", "direction": "North", "themes": ["Loyalty","Justice","Authority"], "description": "..." }
  },
  "fullDays": [ { "date": "2026-06-02", "displayName": "1 B'atz'", "...": "..." } ],
  "departure": { "date": "2026-06-05", "displayName": "4 Ix", "...": "..." },
  "anchor": { "date": "2026-02-10", "tzolkin": "6 Kawoq", "note": "..." },
  "credit": "..."
}
```

### `/mcp` + `/.well-known/mcp-server-card`

```bash
# Server card (SEP-2127 canonical path)
curl -s https://templia.art/.well-known/mcp-server-card | python3 -m json.tool

# Legacy / scanner path — same body
curl -s https://templia.art/.well-known/mcp/server-card.json | python3 -m json.tool

# Initialize handshake
curl -s -X POST https://templia.art/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}' \
  | python3 -m json.tool

# tools/list
curl -s -X POST https://templia.art/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
  | python3 -m json.tool

# tools/call — Tzolk'in reading at the anchor (should return "6 Kawoq")
curl -s -X POST https://templia.art/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_tzolkin_reading","arguments":{"from":"2026-02-10","to":"2026-02-13"}}}' \
  | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["result"]["structuredContent"]["arrival"]["displayName"])'
```

Offline unit tests (no network, stubbed fetch):

```bash
cd worker && npm test
```

### `/.well-known/api-catalog`

```bash
# Should be 200 with application/linkset+json
curl -sI https://templia.art/.well-known/api-catalog | grep -iE 'content-type|link|cache-control'

# Body — three linkset entries (property.json, availability, tzolkin/journey)
curl -s https://templia.art/.well-known/api-catalog | python3 -m json.tool

# OPTIONS preflight — should be 204 with CORS headers
curl -sI -X OPTIONS https://templia.art/.well-known/api-catalog | head -5
```

Expected on GET:

```
content-type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"
cache-control: public, max-age=3600
link: </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"
```

Validate with the public scanner:

```bash
curl -s -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://templia.art"}' \
  | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["checks"]["discovery"]["apiCatalog"])'
```

### Markdown negotiation

```bash
# HTML (default) — should still be text/html
curl -sI https://templia.art/ | grep -i content-type

# Markdown negotiation — should be text/markdown + x-markdown-tokens
curl -sI https://templia.art/ -H 'Accept: text/markdown' | grep -iE 'content-type|x-markdown-tokens|vary'

# Full markdown body
curl -s https://templia.art/ -H 'Accept: text/markdown'
```

Expected on the markdown request:

```
content-type: text/markdown; charset=utf-8
vary: Accept
x-markdown-tokens: <number>
```

## Behavior

### `/api/availability`

- `from`, `to` are `YYYY-MM-DD`. Defaults: `from=today`, `to=today+30`.
- `to` must be strictly after `from`. Window capped at 365 days.
- Blocked ranges are clipped to the requested window; `end` is exclusive (matches iCal).
- Minimum stay is enforced (`minNights = 3`); sub-3-night windows return `available: false` with a reason.
- Upstream iCal is fetched with `cacheTtl: 300` (5 minutes at Cloudflare's edge) to keep origin load down.

### `/api/tzolkin/journey`

- `from`, `to` are `YYYY-MM-DD`. Defaults: `from=today`, `to=today+3`. `to` is exclusive (departure date).
- Window capped at 60 days (reading a year of Tzolk'in doesn't help anyone make trip decisions).
- `fullDays.length === nights - 1` (0 for a 1-night stay).
- Purely computational; no upstream fetch. Response is cached `max-age=86400`.
- Anchor date is `2026-02-10 = 6 Kawoq`, matching `src/lib/tzolkin.ts` so the app and the API agree on every date.

### `/mcp` + `/.well-known/mcp-server-card`

- **Transport:** Streamable HTTP, stateless. One JSON-RPC request per POST → one response. No sessions, no SSE stream, no server-initiated notifications. GET/HEAD return `405` with `Allow: POST, OPTIONS`.
- **Protocol version advertised:** `2025-11-25` (primary) + `2025-06-18` (compat). Initialize echoes the client's requested version if supported; otherwise falls back to `2025-11-25`. Every POST response includes `Mcp-Protocol-Version: 2025-11-25`.
- **Tools:** `check_availability`, `get_property_info`, `get_tzolkin_reading` — each calls the existing handler in-process (no network re-entry). `get_property_info` fetches `templia.art/api/property.json` from origin (same-zone subrequests bypass the Workers layer, so no loop).
- **Result shape:** each tool call returns both `content: [{type: "text", text: <JSON>}]` and `structuredContent: <parsed JSON>`. Upstream validation errors (e.g. malformed dates) surface as `isError: true` with the original error payload — clients can read it and retry without a JSON-RPC transport error.
- **Notifications:** `notifications/initialized` and `notifications/cancelled` accepted; response is `202` with empty body.
- **CORS:** `Access-Control-Allow-Origin: *`, all MCP custom headers exposed; OPTIONS returns 204.
- **Card paths:** `/.well-known/mcp-server-card` (SEP-2127 canonical) and `/.well-known/mcp/server-card.json` (SEP-1649 / current discovery scanners). Same body, `Cache-Control: public, max-age=3600`.
- **Adding a tool:** add to `MCP_TOOLS`, add a `callToolX` helper, add a branch to `dispatchToolCall`, add an entry to `API_CATALOG` if it becomes a separately-anchored endpoint, update `test/mcp.test.mjs`.

### `/.well-known/api-catalog`

- Static JSON — no upstream fetch; serialized once at module load. Response is cached `max-age=3600`.
- `Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"` per RFC 9727 §2.
- `Link: </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"` on every response so HEAD callers can discover it via header alone.
- CORS: `Access-Control-Allow-Origin: *`. OPTIONS returns 204.
- Add new endpoints by editing `API_CATALOG` in `src/index.js` — keep it in sync with `/.well-known/openapi.json` paths.

### Markdown negotiation

- `Accept: text/markdown` not in header → pass-through (no extra cost).
- Method not `GET`/`HEAD` → pass-through.
- Origin response not `text/html` → pass-through.
- Origin response larger than 2 MiB → pass-through (matches native feature limits).
- Conversion fails → falls back to HTML and sets `x-markdown-error` for debugging.

## Why Workers AI `toMarkdown`

It's the same conversion engine Cloudflare uses for the native paid feature, so output is consistent with what Pro/Business/Enterprise sites serve. Free Workers AI tier (10k neurons/day) is plenty for a low-traffic site — and `toMarkdown` is a utility call with minimal/no neuron cost for typical pages.

## Coexistence with the Transform Rule

The existing Cloudflare Transform Rule that injects the `Link:` discovery header runs *after* the Worker returns, so that header still ships on markdown responses and on `/api/availability` JSON responses. No action needed.
