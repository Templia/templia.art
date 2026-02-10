import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getJourneyBySlug, getAllJourneySlugs } from "@/lib/journeys";
import { formatDateShort } from "@/lib/tzolkin";
import { JourneyContent } from "@/components/JourneyContent";

export function generateStaticParams() {
  return getAllJourneySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);
  if (!journey) return { title: "Journey Not Found" };
  return {
    title: `${journey.locationName} · Tzolkin Journey · ${formatDateShort(new Date(journey.checkIn + "T12:00:00"))} – ${formatDateShort(new Date(journey.checkOut + "T12:00:00"))}`,
    description: `Your personalized Tzolkin-guided journey at ${journey.locationName}`,
  };
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);
  if (!journey) notFound();

  return (
    <Suspense>
      <JourneyContent journey={journey} />
    </Suspense>
  );
}
