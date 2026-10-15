import type { Metadata } from "next";
import { getJourneyBySlug } from "@/lib/journeys";
import { JourneyContent } from "@/components/JourneyContent";

// Lab: the full journey page with its day-by-day section rebuilt from
// Example 2's stone cards — one day open, the rest closed strips.
const SLUG = "2026-04-27-to-2026-05-03-vitaly";

export const metadata: Metadata = {
  title: "Journey · Day Cards",
  robots: { index: false, follow: false },
};

export default function JourneyCardsPage() {
  const journey = getJourneyBySlug(SLUG)!;
  return <JourneyContent journey={journey} slug={SLUG} layout="cards" />;
}
