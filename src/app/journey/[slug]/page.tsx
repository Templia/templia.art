import { notFound, redirect } from "next/navigation";
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

  const title = `${journey.locationName} · Tzolkin Journey · ${formatDateShort(new Date(journey.checkIn + "T12:00:00"))} – ${formatDateShort(new Date(journey.checkOut + "T12:00:00"))}`;
  const description = `Your personalized Tzolkin-guided journey at ${journey.locationName}. A sacred calendar experience in ${journey.locationSubtitle}.`;
  const url = `https://templia.art/journey/${slug}/`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "en": url,
        "es": `${url}?lang=es`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Templia Art",
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

function JourneyJsonLd({ journey }: { journey: ReturnType<typeof getJourneyBySlug> }) {
  if (!journey) return null;

  const checkIn = new Date(journey.checkIn + "T12:00:00");
  const checkOut = new Date(journey.checkOut + "T12:00:00");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: `Tzolkin-Guided Journey at ${journey.locationName}`,
    description: `A personalized sacred calendar journey at ${journey.locationName}, guided by ancestral Maya knowledge and the Tzolk'in calendar.`,
    touristType: "Cultural tourism",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: journey.days.length,
      itemListElement: journey.days.map((day, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: day.title,
        description: day.description,
      })),
    },
    provider: {
      "@id": "https://templia.art/#lodging",
    },
    startDate: checkIn.toISOString().split("T")[0],
    endDate: checkOut.toISOString().split("T")[0],
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".journey-description"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function BreadcrumbJsonLd({ slug, journey }: { slug: string; journey: NonNullable<ReturnType<typeof getJourneyBySlug>> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Templia Art",
        item: "https://templia.art/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Tzolkin Journey: ${journey.locationName}`,
        item: `https://templia.art/journey/${slug}/`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);
  if (!journey) redirect("/calendar/");

  return (
    <>
      <JourneyJsonLd journey={journey} />
      <BreadcrumbJsonLd slug={slug} journey={journey} />
      <JourneyContent journey={journey} slug={slug} />
    </>
  );
}
