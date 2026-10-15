"use client";

import { useEffect, useState } from "react";
import { type GuestJourney } from "@/lib/journeys";
import { getTzolkinDate } from "@/lib/tzolkin";
import { DayCard, CARD_VIZ, getKin, type CardViz } from "@/components/DayCard";
import { LabNav } from "./LabNav";

type VizMode = "auto" | CardViz;

const VIZ_LABELS: Record<VizMode, string> = {
  auto: "Rotate",
  tone: "Tone wave",
  kin: "Kin grid",
  glyph: "Glyph",
};

export function CardsLab({ journey, slug }: { journey: GuestJourney; slug: string }) {
  const [mode, setMode] = useState<VizMode>("glyph");
  // -1 outside the stay; the variants row then falls back to Day 3 as a sample.
  const [todayIndex, setTodayIndex] = useState<number>(-1);

  useEffect(() => {
    // Read the clock after hydration so the static HTML stays date-agnostic.
    const id = requestAnimationFrame(() => {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const i = journey.days.findIndex((day) => day.date === today);
      if (i >= 0) setTodayIndex(i);
    });
    return () => cancelAnimationFrame(id);
  }, [journey.days]);

  const stayKins = journey.days.map((day) => {
    const t = getTzolkinDate(new Date(day.date + "T12:00:00"));
    return getKin(t.tone.number, t.daySign.number);
  });

  const sampleIndex = todayIndex >= 0 ? todayIndex : Math.min(2, journey.days.length - 1);
  const sampleDay = journey.days[sampleIndex];

  return (
    <main className="min-h-screen bg-background text-foreground px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <LabNav current={1} />
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text">
            Day cards
          </h1>
          <p className="mt-3 text-sm text-foreground/70 max-w-xl leading-relaxed">
            Each day of a stay as a card, tinted by its day sign&apos;s direction. Sample data:{" "}
            {journey.guestName ?? "guest"}, {journey.days.length} days ({slug}).
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-8" role="radiogroup" aria-label="Card visualization">
          {(["auto", ...CARD_VIZ] as VizMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`text-xs tracking-[0.12em] uppercase px-4 py-2 rounded-full border transition-colors cursor-pointer ${
                mode === m
                  ? "bg-gold text-background border-gold"
                  : "border-gold/40 text-gold/90 hover:border-gold/70"
              }`}
            >
              {VIZ_LABELS[m]}
            </button>
          ))}
        </div>

        {/* ═══ The stay ═══ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {journey.days.map((day, i) => (
            <DayCard
              key={day.date}
              day={day}
              dayNumber={i + 1}
              viz={mode === "auto" ? CARD_VIZ[i % CARD_VIZ.length] : mode}
              stayKins={stayKins}
              isToday={i === todayIndex}
              href={`/journey/${slug}/#day-${i + 1}`}
            />
          ))}
        </section>

        {/* ═══ One day, three visualizations ═══ */}
        <section className="mt-20">
          <div className="mayan-divider w-full mb-10" />
          <h2 className="text-xs tracking-[0.3em] uppercase text-gold/80 mb-6">
            Variants · one day, three visualizations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CARD_VIZ.map((v) => (
              <DayCard
                key={v}
                day={sampleDay}
                dayNumber={sampleIndex + 1}
                viz={v}
                isToday
                stayKins={stayKins}
              />
            ))}
          </div>
        </section>

        {/* ═══ Palettes ═══ */}
        <section className="mt-20">
          <div className="mayan-divider w-full mb-10" />
          <h2 className="text-xs tracking-[0.3em] uppercase text-gold/80 mb-6">
            Palettes · the four directions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["east", "East · Red"],
              ["north", "North · White"],
              ["west", "West · Black"],
              ["south", "South · Yellow"],
            ].map(([dir, label]) => (
              <div key={dir} className="day-card rounded-[14px] p-4" data-dir={dir}>
                <p className="day-card-eyebrow mb-4">{label}</p>
                <div className="flex gap-1.5">
                  {["--card-bg", "--card-soft", "--card-strong", "--card-accent", "--card-ink"].map((t) => (
                    <div
                      key={t}
                      title={t}
                      className="h-10 flex-1 rounded-[4px]"
                      style={{ background: `var(${t})`, boxShadow: "0 0 0 1px rgba(0,0,0,0.12)" }}
                    />
                  ))}
                </div>
                <p className="day-card-meta mt-3 opacity-70">bg · soft · strong · accent · ink</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
