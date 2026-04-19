# templia-markdown-for-agents

Cloudflare Worker that reproduces the native [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) feature on the Free plan.

When a client sends `Accept: text/markdown`, the Worker intercepts, fetches the HTML version from origin, converts it with Workers AI's `toMarkdown()` utility, and returns `Content-Type: text/markdown; charset=utf-8` plus `x-markdown-tokens` and `Vary: Accept`. All other requests pass through unchanged.

## Files

- `src/index.js` — Worker source.
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

- `Accept: text/markdown` not in header → pass-through (no extra cost).
- Method not `GET`/`HEAD` → pass-through.
- Origin response not `text/html` → pass-through.
- Origin response larger than 2 MiB → pass-through (matches native feature limits).
- Conversion fails → falls back to HTML and sets `x-markdown-error` for debugging.

## Why Workers AI `toMarkdown`

It's the same conversion engine Cloudflare uses for the native paid feature, so output is consistent with what Pro/Business/Enterprise sites serve. Free Workers AI tier (10k neurons/day) is plenty for a low-traffic site — and `toMarkdown` is a utility call with minimal/no neuron cost for typical pages.

## Coexistence with the Transform Rule

The existing Cloudflare Transform Rule that injects the `Link:` discovery header runs *after* the Worker returns, so that header still ships on markdown responses. No action needed.
