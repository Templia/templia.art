"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function normalizeDate(input: string): string | null {
  // Try ISO format first (2026-02-12)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const d = new Date(input + "T12:00:00");
    if (!isNaN(d.getTime())) return input;
  }

  // Try parsing as natural date string (Feb 12, 2026 / February 12, 2026)
  const d = new Date(input + " 12:00:00");
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function JourneyRedirector() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkinRaw = searchParams.get("checkin");
    const checkoutRaw = searchParams.get("checkout");

    if (!checkinRaw || !checkoutRaw) {
      window.location.replace("/calendar/");
      return;
    }

    const checkin = normalizeDate(checkinRaw);
    const checkout = normalizeDate(checkoutRaw);

    if (!checkin || !checkout) {
      window.location.replace("/calendar/");
      return;
    }

    window.location.replace(`/journey/${checkin}-to-${checkout}/`);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-gold/50 text-sm tracking-[0.3em] uppercase animate-pulse">
        Preparing your journey…
      </p>
    </div>
  );
}

export default function JourneyRedirectPage() {
  return (
    <>
      <meta name="robots" content="noindex" />
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-gold/50 text-sm tracking-[0.3em] uppercase animate-pulse">
              Preparing your journey…
            </p>
          </div>
        }
      >
        <JourneyRedirector />
      </Suspense>
    </>
  );
}
