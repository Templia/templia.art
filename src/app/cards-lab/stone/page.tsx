import type { Metadata } from "next";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { FlipDayCard } from "@/components/FlipDayCard";
import { LabNav } from "../LabNav";

// Second lab example: greyed "stone" palettes, one full-width card per row.
export const metadata: Metadata = {
  title: "Day Cards · Stone",
  robots: { index: false, follow: false },
};

export default function StoneCardsPage() {
  const slugs = getAllJourneySlugs();
  const slug = slugs.find((s) => s.endsWith("-vitaly")) ?? slugs[0];
  const journey = getJourneyBySlug(slug)!;

  return (
    <main className="min-h-screen bg-background text-foreground px-4 md:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <LabNav current={2} />
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text">
            Day cards · Stone
          </h1>
          <p className="mt-3 text-sm text-foreground/70 max-w-xl leading-relaxed">
            The same four directions in greyed, stone-like tones, one card per row. Tap a card to turn it over
            and read the day. Sample data: {journey.guestName ?? "guest"}, {journey.days.length} days.
          </p>
        </header>

        <section className="day-cards-stone flex flex-col gap-5">
          {journey.days.map((day, i) => (
            <div key={day.date} className="day-card-frame">
              <FlipDayCard
                day={day}
                dayNumber={i + 1}
                viz="glyph"
                rich
                guestName={journey.guestName}
                place={journey.locationName}
                totalDays={journey.days.length}
                href={`/journey/${slug}/#day-${i + 1}`}
              />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
