"use client";

import { useEffect, useState } from "react";
import { type Locale, UI_STRINGS } from "@/lib/i18n";

// Same-origin in production (the Cloudflare Worker serves /api/* on templia.art).
// Locally, point NEXT_PUBLIC_API_BASE at `wrangler dev` (e.g. http://localhost:8787).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const SYNC_EVENT = "templia:email-subscription";

type State = "idle" | "sending" | "subscribed" | "subscribedToday" | "active" | "invalid" | "tooEarly" | "full" | "error";

const ERROR_STATES: Record<string, State> = { invalid_email: "invalid", too_early: "tooEarly", journey_full: "full" };

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
        // Don't overwrite the "you're in" message in the panel that just subscribed.
        if (saved === "active") setState((prev) => (prev === "subscribed" || prev === "subscribedToday" ? prev : "active"));
      } catch {
        // storage unavailable — form still works, just not remembered
      }
    };
    read();
    window.addEventListener(SYNC_EVENT, read);
    return () => window.removeEventListener(SYNC_EVENT, read);
  }, [slug]);

  function remember() {
    try { window.localStorage.setItem(storageKey(slug), "active"); } catch {}
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
      if (res.ok && data.status === "active") {
        setState(data.sentToday ? "subscribedToday" : "subscribed");
        remember();
      } else {
        setState(ERROR_STATES[data.error] ?? "error");
      }
    } catch {
      setState("error");
    }
  }

  const doneMessage =
    state === "subscribed" ? ui.emailSubscribed
    : state === "subscribedToday" ? ui.emailSubscribedToday
    : state === "active" ? ui.emailAlreadyActive
    : null;
  if (doneMessage) {
    return (
      <p className="text-sm text-foreground/90 leading-relaxed" role="status">
        {doneMessage}
      </p>
    );
  }

  const errorMessage =
    state === "invalid" ? ui.emailInvalid
    : state === "tooEarly" ? ui.emailTooEarly
    : state === "full" ? ui.emailJourneyFull
    : state === "error" ? ui.emailError
    : null;

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
            if (errorMessage) setState("idle");
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
      {errorMessage && (
        <p className="mt-2 text-sm text-gold" role="alert">
          {errorMessage}
        </p>
      )}
      <p className="mt-2 text-xs text-foreground/60">{ui.emailPrivacy}</p>
    </div>
  );
}
