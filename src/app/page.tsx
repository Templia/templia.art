import Link from "next/link";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { formatDateShort } from "@/lib/tzolkin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templia Art · Tzolkin-Guided Journeys",
  description: "Personalized sacred calendar journeys at Templia Art in Tulum, Mexico. Each stay is guided by ancestral Maya knowledge and the Tzolk'in calendar.",
  alternates: {
    canonical: "https://templia.art/",
  },
  openGraph: {
    title: "Templia Art · Tzolkin-Guided Journeys",
    description: "Personalized sacred calendar journeys at Templia Art in Tulum, Mexico.",
    url: "https://templia.art/",
    siteName: "Templia Art",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Templia Art · Tzolkin-Guided Journeys" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Templia Art · Tzolkin-Guided Journeys",
    description: "Personalized sacred calendar journeys at Templia Art in Tulum, Mexico.",
    images: ["/og-image.jpg"],
  },
};

function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "Templia Art",
    description: "Personalized sacred calendar journeys guided by ancestral Maya knowledge and the Tzolk'in calendar.",
    url: "https://templia.art",
    image: "https://templia.art/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tulum",
      addressRegion: "Quintana Roo",
      addressCountry: "MX",
    },
    sameAs: [
      "https://www.instagram.com/templia.art/",
      "https://stay.templia.art",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function Home() {
  const slugs = getAllJourneySlugs();

  return (
    <>
      <HomeJsonLd />
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-24">
        <div className="mayan-divider-thick w-32 mb-12" />

        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-6xl font-light gold-gradient-text mb-4 text-center">
          Templia Art
        </h1>
        <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-gold/60 mb-12">
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
                className="block p-6 border border-gold/15 rounded-sm hover:border-gold/40 transition-colors group"
              >
                <p className="text-xs tracking-[0.3em] uppercase text-gold/40 mb-2">
                  {journey.locationSubtitle}
                </p>
                <p className="font-[family-name:var(--font-cormorant)] text-lg text-foreground/70 group-hover:text-foreground transition-colors">
                  {formatDateShort(checkIn)} – {formatDateShort(checkOut)}
                </p>
                {journey.guestName && (
                  <p className="text-sm text-foreground/30 mt-1">{journey.guestName}</p>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
