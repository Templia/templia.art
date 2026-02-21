"use client";

import { Suspense, useEffect, useState } from "react";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkinRaw = searchParams.get("checkin");
    const checkoutRaw = searchParams.get("checkout");

    if (!checkinRaw || !checkoutRaw) {
      setError(true);
      return;
    }

    const checkin = normalizeDate(checkinRaw);
    const checkout = normalizeDate(checkoutRaw);

    if (!checkin || !checkout) {
      setError(true);
      return;
    }

    window.location.replace(`/journey/${checkin}-to-${checkout}/`);
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#c9a84c] mb-4">
            Journey Not Found
          </h1>
          <p className="text-[#ededed]/60 text-sm leading-relaxed">
            We couldn&apos;t locate your journey. Please check the link you received or contact your host.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-[#c9a84c]/50 text-sm tracking-[0.3em] uppercase animate-pulse">
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
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <p className="text-[#c9a84c]/50 text-sm tracking-[0.3em] uppercase animate-pulse">
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
