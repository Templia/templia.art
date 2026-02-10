import Link from "next/link";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { formatDateShort } from "@/lib/tzolkin";

export default function Home() {
  const slugs = getAllJourneySlugs();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col items-center justify-center px-6 py-24">
      <div className="mayan-divider-thick w-32 mb-12" />

      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light gold-gradient-text mb-4 text-center">
        Templia Art
      </h1>
      <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c9a84c]/60 mb-12">
        Tzolkin-Guided Journeys
      </p>

      <div className="mayan-divider w-24 mb-12" />

      <div className="space-y-4 w-full max-w-md">
        {slugs.map((slug) => {
          const journey = getJourneyBySlug(slug)!;
          const checkIn = new Date(journey.checkIn + "T12:00:00");
          const checkOut = new Date(journey.checkOut + "T12:00:00");
          return (
            <Link
              key={slug}
              href={`/journey/${slug}`}
              className="block p-6 border border-[#c9a84c]/15 rounded-sm hover:border-[#c9a84c]/40 transition-colors group"
            >
              <p className="text-xs tracking-[0.3em] uppercase text-[#c9a84c]/40 mb-2">
                {journey.locationSubtitle}
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#ededed]/70 group-hover:text-[#ededed] transition-colors">
                {formatDateShort(checkIn)} – {formatDateShort(checkOut)}
              </p>
              {journey.guestName && (
                <p className="text-sm text-[#ededed]/30 mt-1">{journey.guestName}</p>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
