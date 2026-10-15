"use client";

import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

// Generic two-sided card that turns over on click/tap or Enter/Space.
// Both faces share one grid cell, so the card is as tall as the taller
// face and neither side needs to scroll. Styles: .day-card-flip* in globals.css.
export function FlipCard({
  front,
  back,
  label,
}: {
  front: ReactNode;
  back: ReactNode;
  /** Accessible name, e.g. "Day 2"; the turn direction is appended. */
  label: string;
}) {
  const [flipped, setFlipped] = useState(false);

  function onClick(e: MouseEvent) {
    // Links inside the card navigate instead of turning it.
    if ((e.target as HTMLElement).closest("a")) return;
    setFlipped((f) => !f);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((f) => !f);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${label}: ${flipped ? "show the front" : "show the day's reading"}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="day-card-flip"
      data-flipped={flipped}
    >
      <div className="day-card-flip-inner">
        <div className="day-card-face" aria-hidden={flipped}>
          {front}
        </div>
        <div className="day-card-face day-card-face-back" aria-hidden={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}
