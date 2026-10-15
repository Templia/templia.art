import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { JourneyContent } from "@/components/JourneyContent";

// Lab: any journey with its day-by-day section as Example 2's stone cards,
// e.g. /cards-lab/journey/2026-10-16-to-2026-10-23-katya/
export function generateStaticParams() {
  return getAllJourneySlugs().map((slug) => ({ slug }));
}

export const metadata: Metadata = {
  title: "Journey · Day Cards",
  robots: { index: false, follow: false },
};

export default async function JourneyCardsBySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);
  if (!journey) notFound();
  return <JourneyContent journey={journey} slug={slug} layout="cards" />;
}
