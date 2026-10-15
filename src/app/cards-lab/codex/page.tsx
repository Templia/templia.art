import type { Metadata } from "next";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { CodexCard } from "@/components/CodexCard";
import { LabNav } from "../LabNav";

// Third lab example: a codex deck — paper cards, carved friezes, pictograms.
export const metadata: Metadata = {
  title: "Day Cards · Codex",
  robots: { index: false, follow: false },
};


export default function CodexCardsPage() {
  const slugs = getAllJourneySlugs();
  const slug = slugs.find((s) => s.endsWith("-vitaly")) ?? slugs[0];
  const journey = getJourneyBySlug(slug)!;

  return (
    <main className="min-h-screen bg-background text-foreground px-4 md:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <LabNav current={3} />
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text">
            Day cards · Codex
          </h1>
          <p className="mt-3 text-sm text-foreground/70 max-w-xl leading-relaxed">
            A deck for the stay: each day a paper card with its own carved frieze and pictogram, colored by the
            sign&apos;s direction. Tap a card to turn it over. Sample data: {journey.guestName ?? "guest"},{" "}
            {journey.days.length} days.
          </p>
        </header>

        <section className="codex-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {journey.days.map((day, i) => (
            <div key={day.date} className="day-card-frame">
              <CodexCard
                day={day}
                dayNumber={i + 1}
                totalDays={journey.days.length}
                guestName={journey.guestName}
                place={journey.locationName}
                href={`/journey/${slug}/#day-${i + 1}`}
              />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
