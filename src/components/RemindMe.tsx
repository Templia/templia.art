"use client";

import { useState } from "react";
import { type Locale, UI_STRINGS } from "@/lib/i18n";
import type { JourneyDay } from "@/lib/journeys";
import { buildJourneyIcs, downloadIcs } from "@/lib/calendar";
import { DailyEmailSignup } from "./DailyEmailSignup";

interface Props {
  slug: string;
  locale: Locale;
  day: JourneyDay;
  dayNumber: number;
  upcomingDays: { day: JourneyDay; dayNumber: number }[];
}

export function RemindMe({ slug, locale, day, dayNumber, upcomingDays }: Props) {
  const ui = UI_STRINGS[locale];
  const [open, setOpen] = useState(false);
  const panelId = `remind-${dayNumber}`;

  function dayUrl(n: number) {
    const u = new URL(`/journey/${slug}/`, window.location.origin);
    if (locale === "es") u.searchParams.set("lang", "es");
    return `${u.toString()}#day-${n}`;
  }

  function addToCalendar(items: { day: JourneyDay; dayNumber: number }[], filename: string) {
    const ics = buildJourneyIcs(
      slug,
      items.map((x) => ({ ...x, url: dayUrl(x.dayNumber) })),
      { day: ui.day },
    );
    downloadIcs(filename, ics);
  }

  const calendarButton =
    "text-sm tracking-[0.08em] uppercase px-4 py-2 rounded-full border border-gold/50 text-gold/90 hover:border-gold hover:text-gold transition-colors cursor-pointer";

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="text-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-2 text-sm tracking-[0.12em] uppercase text-gold/90 hover:text-gold underline underline-offset-4 decoration-gold/30 hover:decoration-gold/70 transition-colors cursor-pointer py-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinejoin="round" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
          </svg>
          {ui.remindMe}
        </button>
      </div>

      {open && (
        <div id={panelId} className="mt-4 border border-gold/30 rounded-2xl px-5 py-5 space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gold/90 mb-2">{ui.emailTitle}</p>
            <DailyEmailSignup slug={slug} locale={locale} />
          </div>

          <div className="border-t border-gold/20 pt-5">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gold/90 mb-2">{ui.calendarTitle}</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{ui.calendarBody}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                className={calendarButton}
                onClick={() => addToCalendar([{ day, dayNumber }], `templia-day-${dayNumber}.ics`)}
              >
                {ui.calendarThisDay}
              </button>
              {upcomingDays.length > 1 && (
                <button
                  type="button"
                  className={calendarButton}
                  onClick={() => addToCalendar(upcomingDays, "templia-journey.ics")}
                >
                  {ui.calendarAllDays.replace("{n}", String(upcomingDays.length))}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
