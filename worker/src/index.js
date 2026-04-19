// Markdown for Agents — Cloudflare Worker
//
// When a client sends `Accept: text/markdown` (and optionally other types),
// the Worker fetches the normal HTML response from origin and converts it
// to Markdown using Cloudflare Workers AI's built-in `toMarkdown` utility.
// All other requests pass through unchanged.
//
// Why a Worker: Markdown for Agents on the Pro plan does this natively.
// On Free we reproduce the contract with a small Worker, keeping the
// response headers compatible (Content-Type: text/markdown, Vary: Accept,
// x-markdown-tokens).

/**
 * Parse the Accept header and return true if the client prefers markdown.
 * We accept an explicit `text/markdown` token anywhere in the list.
 * This mirrors Cloudflare's documented behavior — any q-value is fine.
 */
function acceptsMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  return acceptHeader
    .toLowerCase()
    .split(",")
    .some((part) => part.trim().startsWith("text/markdown"));
}

/** Rough token estimate: ~4 chars per token for English-ish text. */
function estimateTokens(text) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export default {
  async fetch(request, env, ctx) {
    // Fast path — client didn't ask for markdown, pass through.
    if (!acceptsMarkdown(request.headers.get("Accept"))) {
      return fetch(request);
    }

    // Only GET/HEAD are safe to transform.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return fetch(request);
    }

    // Fetch the normal (HTML) response from origin via Cloudflare's cache.
    // We drop the Accept header on the subrequest so origin doesn't get
    // confused by our custom value, and explicitly ask for HTML.
    const originRequest = new Request(request, {
      headers: { ...Object.fromEntries(request.headers), Accept: "text/html" },
    });
    const originResponse = await fetch(originRequest);

    // Only convert HTML — anything else (images, JSON, calendars, etc.)
    // passes through as-is.
    const contentType = (
      originResponse.headers.get("Content-Type") || ""
    ).toLowerCase();
    if (!contentType.includes("text/html")) {
      return originResponse;
    }

    // Hard cap mirroring Cloudflare's native feature: 2 MiB origin payload.
    const MAX_BYTES = 2 * 1024 * 1024;
    const contentLength = Number(
      originResponse.headers.get("Content-Length") || "0",
    );
    if (contentLength > MAX_BYTES) {
      return originResponse;
    }

    // Buffer the HTML body, conversion expects a Blob.
    const html = await originResponse.text();
    if (html.length > MAX_BYTES) {
      // Fall back to HTML if the response is bigger than we'll convert.
      return new Response(html, {
        status: originResponse.status,
        headers: originResponse.headers,
      });
    }

    // Run Cloudflare's HTML → Markdown conversion. This is the same
    // utility that powers the native Markdown for Agents feature.
    let markdown;
    try {
      const results = await env.AI.toMarkdown([
        {
          name: "page.html",
          blob: new Blob([html], { type: "text/html" }),
        },
      ]);
      markdown = results?.[0]?.data ?? "";
      if (!markdown) throw new Error("empty markdown");
    } catch (err) {
      // If conversion fails for any reason, fall back to HTML and surface
      // the error in a header for debugging.
      const fallbackHeaders = new Headers(originResponse.headers);
      fallbackHeaders.set("x-markdown-error", String(err).slice(0, 200));
      return new Response(html, {
        status: originResponse.status,
        headers: fallbackHeaders,
      });
    }

    // Build the markdown response, preserving cache-relevant headers from
    // origin and replacing anything that describes the body.
    const newHeaders = new Headers();
    // Carry forward headers that still describe the response semantics.
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
    // Content signal matching Cloudflare's default for the native feature.
    newHeaders.set(
      "Content-Signal",
      "ai-train=yes, search=yes, ai-input=yes",
    );

    return new Response(request.method === "HEAD" ? null : markdown, {
      status: originResponse.status,
      headers: newHeaders,
    });
  },
};
