"use client";

// WebMCP — registers browser-native tools for in-page AI agents.
//
// Spec: https://webmachinelearning.github.io/webmcp/
// Feature-detected: in browsers without navigator.modelContext (the common
// case today) this component mounts to a harmless no-op. Same tool surface
// as the HTTP MCP server at /mcp, plus a navigation helper that only makes
// sense in-browser.

import { useEffect } from "react";

// Minimal typing that matches the W3C WebMCP IDL (see §4.2 of the spec).
// Declared locally so we don't take a dependency on experimental TS libs.
type ModelContextTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: unknown, client: unknown) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
};
type ModelContextRegisterToolOptions = { signal?: AbortSignal };
type ModelContext = {
  registerTool: (
    tool: ModelContextTool,
    options?: ModelContextRegisterToolOptions,
  ) => void;
};

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

const BOOKING_URL = "https://stay.templia.art";
const DATE_SCHEMA = {
  type: "string",
  format: "date",
  description: "ISO date YYYY-MM-DD",
} as const;

async function fetchJson(path: string, params?: Record<string, string>) {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} → ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export function WebMCPProvider() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.modelContext) {
      return; // feature not available in this browser — quietly opt out
    }
    const controller = new AbortController();
    const mc = navigator.modelContext;

    const tools: ModelContextTool[] = [
      {
        name: "check_availability",
        title: "Check availability at Templia",
        description:
          "Check whether Templia is available for a given stay window. Returns a JSON object with 'available', 'nights', 'minNights', 'blockedRanges', and 'bookingUrl'. Source is the Airbnb-synced iCal feed; calendar lag is possible — always confirm on the booking page before committing.",
        inputSchema: {
          type: "object",
          properties: {
            from: { ...DATE_SCHEMA, description: "Arrival (YYYY-MM-DD)." },
            to: {
              ...DATE_SCHEMA,
              description: "Departure (YYYY-MM-DD, exclusive).",
            },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        async execute(input) {
          const args = (input ?? {}) as { from?: string; to?: string };
          return fetchJson("/api/availability", {
            from: args.from ?? "",
            to: args.to ?? "",
          });
        },
      },
      {
        name: "get_property_info",
        title: "Get property information",
        description:
          "Return canonical information about Templia: name, location, description, amenities, pricing signals, policies, booking URL, contact, and images.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        async execute() {
          return fetchJson("/api/property.json");
        },
      },
      {
        name: "get_tzolkin_reading",
        title: "Get Tzolk'in reading for a stay window",
        description:
          "Return the Tzolk'in (Maya sacred calendar) day-sign and tone for arrival, each full day, and departure of a stay window. Deterministic from anchor 2026-02-10 = 6 Kawoq. Window capped at 60 days.",
        inputSchema: {
          type: "object",
          properties: {
            from: { ...DATE_SCHEMA, description: "Arrival (YYYY-MM-DD)." },
            to: {
              ...DATE_SCHEMA,
              description: "Departure (YYYY-MM-DD, exclusive).",
            },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        async execute(input) {
          const args = (input ?? {}) as { from?: string; to?: string };
          return fetchJson("/api/tzolkin/journey", {
            from: args.from ?? "",
            to: args.to ?? "",
          });
        },
      },
      {
        name: "open_booking_page",
        title: "Open booking page",
        description:
          "Open Templia's booking page (stay.templia.art) in the current tab, optionally with arrival and departure dates prefilled. This performs a full-page navigation — the agent should only call this when the user has confirmed intent to book.",
        inputSchema: {
          type: "object",
          properties: {
            from: { ...DATE_SCHEMA, description: "Prefilled arrival date." },
            to: { ...DATE_SCHEMA, description: "Prefilled departure date." },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        async execute(input) {
          const args = (input ?? {}) as { from?: string; to?: string };
          const url = new URL(BOOKING_URL);
          if (args.from) url.searchParams.set("from", args.from);
          if (args.to) url.searchParams.set("to", args.to);
          window.location.href = url.toString();
          return { navigatedTo: url.toString() };
        },
      },
    ];

    for (const tool of tools) {
      try {
        mc.registerTool(tool, { signal: controller.signal });
      } catch (err) {
        // Never let a tool-registration error break the page.
        console.warn(`WebMCP: failed to register ${tool.name}:`, err);
      }
    }

    return () => controller.abort();
  }, []);

  return null;
}
