import type { Metadata } from "next";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { WheelCard } from "@/components/WheelCard";
import { LabNav } from "../LabNav";

// Fourth lab example: Example 2's layout composed around a large wheel, in Example 1's palette.
export const metadata: Metadata = {
  title: "Day Cards · Wheel",
  robots: { index: false, follow: false },
};

export default function WheelCardsPage() {
  const slugs = getAllJourneySlugs();
  const slug = slugs.find((s) => s.endsWith("-vitaly")) ?? slugs[0];
  const journey = getJourneyBySlug(slug)!;

  return (
    <main className="min-h-screen bg-background text-foreground px-4 md:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <LabNav current={4} />
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text">
            Day cards · Wheel
          </h1>
          <p className="mt-3 text-sm text-foreground/70 max-w-xl leading-relaxed">
            Day cards composed around the Tzolk&apos;in itself, in Example 1&apos;s colors: the day&apos;s tone, sign and
            direction lined up into one spoke, the text wrapping the wheel. Tap a card to turn it over. Sample data:{" "}
            {journey.guestName ?? "guest"}, {journey.days.length} days.
          </p>
        </header>

        <section className="flex flex-col gap-5">
          {journey.days.map((day, i) => (
            <div key={day.date} className="day-card-frame">
              <WheelCard
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
