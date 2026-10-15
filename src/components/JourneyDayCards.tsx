"use client";

import { useEffect, useRef } from "react";
import { type JourneyDay } from "@/lib/journeys";
import { getTzolkinDate, getGlyphPath } from "@/lib/tzolkin";
import { type Locale, UI_STRINGS } from "@/lib/i18n";
import { DayCard } from "./DayCard";
import { RemindMe } from "./RemindMe";

// The journey's day-by-day section as Example 2's stone cards. One card is
// open at a time: the full card (dial, glyph, tone, direction) with the day's
// reading inside it; the other days are slim closed strips with an Open button.

export function JourneyDayCards({
  days,
  slug,
  locale,
  openDate,
  onToggle,
  todayStr,
  upcomingDays,
  guestName,
  place,
}: {
  days: JourneyDay[];
  slug: string;
  locale: Locale;
  openDate: string | null;
  onToggle: (date: string) => void;
  todayStr: string | null;
  upcomingDays: { day: JourneyDay; dayNumber: number }[];
  guestName?: string;
  place?: string;
}) {
  const ui = UI_STRINGS[locale];
  // Set only by the guest's own clicks, so the card chosen on page load
  // (today / #day-N / Day 1) never scrolls the page away from the welcome.
  const userToggled = useRef(false);

  function toggle(date: string) {
    userToggled.current = true;
    onToggle(date);
  }

  // When the guest opens a day, bring it into view and reflect it in the URL
  // (#day-N), so the link they share opens the same card.
  useEffect(() => {
    if (!userToggled.current) return;
    userToggled.current = false;
    if (!openDate) return;
    const n = days.findIndex((d) => d.date === openDate) + 1;
    if (n < 1) return;
    history.replaceState(null, "", `#day-${n}`);
    requestAnimationFrame(() => {
      document.getElementById(`day-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [openDate, days]);

  return (
    <section className="day-cards-stone relative px-4 md:px-6 max-w-3xl mx-auto flex flex-col gap-3 py-6">
      {days.map((day, i) => {
        const n = i + 1;
        const isOpen = openDate === day.date;
        const isToday = todayStr === day.date;
        const date = new Date(day.date + "T12:00:00");
        const { tone, daySign } = getTzolkinDate(date);

        if (isOpen) {
          return (
            <div key={day.date} id={`day-${n}`} className="scroll-mt-6">
              <div className="day-card-frame">
                <DayCard
                  day={day}
                  dayNumber={n}
                  viz="glyph"
                  rich
                  isToday={isToday}
                  guestName={guestName}
                  place={place}
                  totalDays={days.length}
                  footer={
                    <footer className="mt-6 flex items-center justify-end">
                      <button type="button" className="day-card-pill cursor-pointer" onClick={() => toggle(day.date)}>
                        Close <span aria-hidden>↑</span>
                      </button>
                    </footer>
                  }
                >
                  <div id={`day-${n}-content`} className="journey-reading">
                    <p className="day-card-back-text">{day.description}</p>
                    {day.activities.length > 0 && (
                      <ol className="journey-activities">
                        {day.activities.map((a, j) => (
                          <li key={j}>
                            <p className="day-card-meta opacity-70">{a.timeOfDay}</p>
                            <p className="journey-activity-text">{a.activity}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </DayCard>
              </div>
              {todayStr && day.date >= todayStr && (
                <RemindMe slug={slug} locale={locale} day={day} dayNumber={n} upcomingDays={upcomingDays} />
              )}
            </div>
          );
        }

        const glyph = getGlyphPath(daySign);
        return (
          <div key={day.date} id={`day-${n}`} className="scroll-mt-6">
            <button
              type="button"
              onClick={() => toggle(day.date)}
              aria-expanded={false}
              aria-controls={`day-${n}-content`}
              className="day-card journey-card-closed"
              data-dir={daySign.direction.toLowerCase()}
            >
              <span className="journey-closed-tile day-card-block-strong" aria-hidden>
                <span
                  className="journey-closed-glyph"
                  style={{ maskImage: `url(${glyph})`, WebkitMaskImage: `url(${glyph})` }}
                />
              </span>
              <span className="journey-closed-text">
                <span className="day-card-eyebrow">
                  {ui.day} {n} · {date.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric" })}
                  {isToday && <span className="day-card-badge ml-2 align-middle">{ui.today}</span>}
                </span>
                <span className="journey-closed-stat">
                  {tone.number} {daySign.name}
                </span>
                <span className="journey-closed-title">{day.title}</span>
              </span>
              <span className="day-card-pill journey-closed-open">
                Open <span aria-hidden>+</span>
              </span>
            </button>
          </div>
        );
      })}
    </section>
  );
}
