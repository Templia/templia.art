// Smoke-test the MCP server offline by importing the Worker module and
// driving handleMcp directly with constructed Request objects. Network calls
// to upstream APIs are stubbed with globalThis.fetch.
//
// Run: node worker/test/mcp.test.mjs
//
// Exits 0 on all-pass, 1 on any failure.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// Stub globalThis.fetch for property.json upstream calls. The availability
// handler also uses fetch() for the iCal feed; stub that too.
const FIXTURE_PROPERTY = {
  name: "Templia",
  location: "Tulum, Mexico",
  type: "villa",
  bedrooms: 3,
  bookingUrl: "https://stay.templia.art",
};
const FIXTURE_ICAL = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Test//EN",
  "BEGIN:VEVENT",
  "DTSTART;VALUE=DATE:20260610",
  "DTEND;VALUE=DATE:20260615",
  "SUMMARY:Reserved",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

globalThis.fetch = async (input) => {
  const u = typeof input === "string" ? input : input.url;
  if (u.includes("/api/property.json")) {
    return new Response(JSON.stringify(FIXTURE_PROPERTY), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (u.includes(".ics") || u.includes("calendar.google.com")) {
    return new Response(FIXTURE_ICAL, {
      status: 200,
      headers: { "Content-Type": "text/calendar" },
    });
  }
  throw new Error(`Unexpected upstream fetch: ${u}`);
};

// Import the Worker module. Its default export is { fetch: async (req, env, ctx) }.
const here = path.dirname(url.fileURLToPath(import.meta.url));
const workerUrl = url.pathToFileURL(path.join(here, "..", "src", "index.js"));
const worker = (await import(workerUrl.href)).default;

async function mcpCall(body, extraHeaders = {}) {
  const req = new Request("https://templia.art/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  const res = await worker.fetch(req, {}, { waitUntil: () => {}, passThroughOnException: () => {} });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}
  return { status: res.status, headers: Object.fromEntries(res.headers), body: text, json };
}

async function plainFetch(url, init = {}) {
  const req = new Request(url, init);
  const res = await worker.fetch(req, {}, { waitUntil: () => {}, passThroughOnException: () => {} });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, headers: Object.fromEntries(res.headers), body: text, json };
}

let pass = 0;
let fail = 0;
function check(name, cond, details) {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}`);
    if (details !== undefined) console.log("        →", JSON.stringify(details).slice(0, 300));
  }
}

console.log("\n=== /mcp OPTIONS (CORS preflight) ===");
{
  const r = await plainFetch("https://templia.art/mcp", { method: "OPTIONS" });
  check("status 204", r.status === 204);
  check("CORS allow-origin *", r.headers["access-control-allow-origin"] === "*");
}

console.log("\n=== /mcp GET (should be 405) ===");
{
  const r = await plainFetch("https://templia.art/mcp", { method: "GET" });
  check("status 405", r.status === 405, r.status);
  check("Allow header present", (r.headers["allow"] || "").includes("POST"));
}

console.log("\n=== initialize ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "0" } },
  });
  check("status 200", r.status === 200);
  check("jsonrpc 2.0", r.json?.jsonrpc === "2.0");
  check("id echoed", r.json?.id === 1);
  check("has result.protocolVersion", typeof r.json?.result?.protocolVersion === "string");
  check("echoes client protocolVersion 2025-11-25", r.json?.result?.protocolVersion === "2025-11-25");
  check("capabilities.tools present", r.json?.result?.capabilities?.tools !== undefined);
  check("serverInfo.name reverse-DNS", /^[a-z0-9.]+\/[a-z0-9-]+$/i.test(r.json?.result?.serverInfo?.name || ""));
  check("instructions present", typeof r.json?.result?.instructions === "string" && r.json.result.instructions.length > 0);
  check("Mcp-Protocol-Version header", r.headers["mcp-protocol-version"] === "2025-11-25");
}

console.log("\n=== initialize with unsupported version ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 2,
    method: "initialize",
    params: { protocolVersion: "1999-01-01", capabilities: {}, clientInfo: { name: "test", version: "0" } },
  });
  check("falls back to latest", r.json?.result?.protocolVersion === "2025-11-25");
}

console.log("\n=== notifications/initialized (202, no body) ===");
{
  const r = await mcpCall({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
  check("status 202", r.status === 202);
  check("empty body", r.body === "");
}

console.log("\n=== tools/list ===");
{
  const r = await mcpCall({ jsonrpc: "2.0", id: 3, method: "tools/list", params: {} });
  check("status 200", r.status === 200);
  const tools = r.json?.result?.tools || [];
  check("3 tools", tools.length === 3, tools.map(t => t.name));
  const names = tools.map((t) => t.name).sort();
  check(
    "names match",
    JSON.stringify(names) ===
      JSON.stringify(["check_availability", "get_property_info", "get_tzolkin_reading"]),
    names,
  );
  check(
    "all have inputSchema",
    tools.every((t) => t.inputSchema?.type === "object"),
  );
  check(
    "all have descriptions",
    tools.every((t) => typeof t.description === "string" && t.description.length > 20),
  );
}

console.log("\n=== tools/call → get_property_info ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "get_property_info", arguments: {} },
  });
  check("status 200", r.status === 200);
  const result = r.json?.result;
  check("no isError", !result?.isError);
  check("content[0] is text", result?.content?.[0]?.type === "text");
  check("structuredContent matches fixture", result?.structuredContent?.name === "Templia");
}

console.log("\n=== tools/call → get_tzolkin_reading (anchor check) ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: {
      name: "get_tzolkin_reading",
      arguments: { from: "2026-02-10", to: "2026-02-13" },
    },
  });
  check("status 200", r.status === 200);
  check("no isError", !r.json?.result?.isError);
  check(
    "arrival is 6 Kawoq",
    r.json?.result?.structuredContent?.arrival?.displayName === "6 Kawoq",
    r.json?.result?.structuredContent?.arrival,
  );
  check("nights === 3", r.json?.result?.structuredContent?.nights === 3);
  check("fullDays.length === 2", r.json?.result?.structuredContent?.fullDays?.length === 2);
}

console.log("\n=== tools/call → check_availability (clear window) ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 6,
    method: "tools/call",
    params: {
      name: "check_availability",
      arguments: { from: "2026-07-01", to: "2026-07-05" },
    },
  });
  check("status 200", r.status === 200);
  const sc = r.json?.result?.structuredContent;
  check("nights === 4", sc?.nights === 4);
  check("available === true", sc?.available === true);
  check("blockedRanges empty", Array.isArray(sc?.blockedRanges) && sc.blockedRanges.length === 0);
}

console.log("\n=== tools/call → check_availability (overlapping block) ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 7,
    method: "tools/call",
    params: {
      name: "check_availability",
      arguments: { from: "2026-06-12", to: "2026-06-16" },
    },
  });
  check("status 200", r.status === 200);
  const sc = r.json?.result?.structuredContent;
  check("available === false", sc?.available === false);
  check("blockedRanges non-empty", Array.isArray(sc?.blockedRanges) && sc.blockedRanges.length > 0);
}

console.log("\n=== tools/call with invalid dates → isError ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 8,
    method: "tools/call",
    params: {
      name: "get_tzolkin_reading",
      arguments: { from: "not-a-date", to: "2026-02-13" },
    },
  });
  check("status 200", r.status === 200);
  check("result.isError === true", r.json?.result?.isError === true, r.json?.result);
}

console.log("\n=== tools/call with unknown tool → JSON-RPC -32602 ===");
{
  const r = await mcpCall({
    jsonrpc: "2.0",
    id: 9,
    method: "tools/call",
    params: { name: "does_not_exist", arguments: {} },
  });
  check("error.code -32602", r.json?.error?.code === -32602, r.json);
}

console.log("\n=== unknown method → -32601 ===");
{
  const r = await mcpCall({ jsonrpc: "2.0", id: 10, method: "banana", params: {} });
  check("error.code -32601", r.json?.error?.code === -32601);
}

console.log("\n=== ping ===");
{
  const r = await mcpCall({ jsonrpc: "2.0", id: 11, method: "ping", params: {} });
  check("status 200", r.status === 200);
  check("empty result object", r.json?.result && Object.keys(r.json.result).length === 0);
}

console.log("\n=== /.well-known/mcp-server-card (SEP-2127 path) ===");
{
  const r = await plainFetch("https://templia.art/.well-known/mcp-server-card", { method: "GET" });
  check("status 200", r.status === 200);
  check(
    "content-type application/json",
    (r.headers["content-type"] || "").startsWith("application/json"),
  );
  check("name reverse-DNS", /^[a-z0-9.]+\/[a-z0-9-]+$/i.test(r.json?.name || ""));
  check("version present", typeof r.json?.version === "string");
  check("description present", typeof r.json?.description === "string");
  check("remotes[0].type streamable-http", r.json?.remotes?.[0]?.type === "streamable-http");
  check("remotes[0].url === /mcp", r.json?.remotes?.[0]?.url === "https://templia.art/mcp");
  check(
    "supportedProtocolVersions includes 2025-11-25",
    (r.json?.remotes?.[0]?.supportedProtocolVersions || []).includes("2025-11-25"),
  );
  check("CORS allow-origin *", r.headers["access-control-allow-origin"] === "*");
}

console.log("\n=== /.well-known/mcp/server-card.json (legacy path) ===");
{
  const r = await plainFetch("https://templia.art/.well-known/mcp/server-card.json", {
    method: "GET",
  });
  check("status 200", r.status === 200);
  check("same name", r.json?.name === "art.templia/templia");
}

console.log("\n=== parse error ===");
{
  const req = new Request("https://templia.art/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: "not valid json",
  });
  const res = await worker.fetch(req, {}, { waitUntil: () => {}, passThroughOnException: () => {} });
  const json = await res.json();
  check("status 400", res.status === 400);
  check("error.code -32700", json?.error?.code === -32700);
}

console.log("\n=== batch request (should be rejected) ===");
{
  const r = await mcpCall([{ jsonrpc: "2.0", id: 1, method: "ping" }]);
  check("status 400", r.status === 400);
  check("error.code -32600", r.json?.error?.code === -32600);
}

console.log(`\n--- ${pass} passed, ${fail} failed ---`);
process.exit(fail === 0 ? 0 : 1);
