"use client";

import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    window.location.replace("/calendar/");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-gold/50 text-sm tracking-[0.3em] uppercase animate-pulse">
        Redirecting…
      </p>
    </div>
  );
}
