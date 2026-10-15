import type { Metadata } from "next";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { CardsLab } from "./CardsLab";

// Internal sandbox for the day-card design system. Not linked anywhere.
export const metadata: Metadata = {
  title: "Day Cards · Lab",
  robots: { index: false, follow: false },
};

export default function CardsLabPage() {
  const slugs = getAllJourneySlugs();
  // Prefer a long stay so the grid has enough cards to judge rhythm.
  const slug =
    slugs.find((s) => s.endsWith("-vitaly")) ??
    slugs.reduce((best, s) =>
      (getJourneyBySlug(s)?.days.length ?? 0) > (getJourneyBySlug(best)?.days.length ?? 0) ? s : best,
    );
  const journey = getJourneyBySlug(slug)!;

  return <CardsLab journey={journey} slug={slug} />;
}
