"use client";

import { useEffect, useState } from "react";
import { type Locale, UI_STRINGS } from "@/lib/i18n";

// Same-origin in production (the Cloudflare Worker serves /api/* on templia.art).
// Locally, point NEXT_PUBLIC_API_BASE at `wrangler dev` (e.g. http://localhost:8787).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const SYNC_EVENT = "templia:email-subscription";

type State = "idle" | "sending" | "pending" | "active" | "invalid" | "error";

function storageKey(slug: string) {
  return `templia:emailSub:${slug}`;
}

// Embeddable form; several instances (one per day) share status via localStorage + an event.
export function DailyEmailSignup({ slug, locale }: { slug: string; locale: Locale }) {
  const ui = UI_STRINGS[locale];
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const read = () => {
      try {
        const saved = window.localStorage.getItem(storageKey(slug));
        if (saved === "pending" || saved === "active") setState(saved);
      } catch {
        // storage unavailable — form still works, just not remembered
      }
    };
    read();
    if (new URLSearchParams(window.location.search).get("subscribed") === "1") {
      try { window.localStorage.setItem(storageKey(slug), "active"); } catch {}
      setState("active");
    }
    window.addEventListener(SYNC_EVENT, read);
    return () => window.removeEventListener(SYNC_EVENT, read);
  }, [slug]);

  function remember(s: "pending" | "active") {
    try { window.localStorage.setItem(storageKey(slug), s); } catch {}
    window.dispatchEvent(new Event(SYNC_EVENT));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: email.trim(), locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data.status === "pending" || data.status === "active")) {
        setState(data.status);
        remember(data.status);
      } else {
        setState(data.error === "invalid_email" ? "invalid" : "error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "pending" || state === "active") {
    return (
      <p className="text-sm text-foreground/90 leading-relaxed" role="status">
        {state === "active" ? ui.emailAlreadyActive : ui.emailCheckInbox}
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground/80 leading-relaxed">{ui.emailBody}</p>
      <form onSubmit={submit} className="mt-3 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "invalid" || state === "error") setState("idle");
          }}
          placeholder={ui.emailPlaceholder}
          aria-label={ui.emailPlaceholder}
          className="flex-1 min-w-0 bg-background border border-gold/30 text-foreground px-4 py-2.5 rounded-full focus:outline-none focus:border-gold/70 transition-colors"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="text-sm tracking-[0.1em] uppercase px-5 py-2.5 rounded-full bg-gold text-background font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer whitespace-nowrap"
        >
          {state === "sending" ? ui.emailSending : ui.emailSubmit}
        </button>
      </form>
      {(state === "invalid" || state === "error") && (
        <p className="mt-2 text-sm text-gold" role="alert">
          {state === "invalid" ? ui.emailInvalid : ui.emailError}
        </p>
      )}
      <p className="mt-2 text-xs text-foreground/60">{ui.emailPrivacy}</p>
    </div>
  );
}
