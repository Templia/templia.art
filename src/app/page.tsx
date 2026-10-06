import Link from "next/link";
import { getAllJourneySlugs, getJourneyBySlug } from "@/lib/journeys";
import { formatDateShort } from "@/lib/tzolkin";
import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templia Art · Tzolkin-Guided Journeys in Tulum, Mexico",
  description:
    "Templia Art is a luxury stay in Tulum, Mexico where each guest receives a personalized Tzolkin-guided journey mapped to the 260-day sacred Maya calendar. Located in Luum Zama, Aldea Zama.",
  alternates: {
    canonical: "https://templia.art/",
  },
  openGraph: {
    title: "Templia Art · Tzolkin-Guided Journeys in Tulum",
    description:
      "Luxury stay in Tulum with personalized sacred calendar journeys guided by ancestral Maya knowledge.",
    url: "https://templia.art/",
    siteName: "Templia Art",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Templia Art · Tzolkin-Guided Journeys in Tulum, Mexico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Templia Art · Tzolkin-Guided Journeys in Tulum",
    description:
      "Luxury stay in Tulum with personalized sacred calendar journeys guided by ancestral Maya knowledge.",
    images: ["/og-image.jpg"],
  },
};

function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": "https://templia.art/#lodging",
        name: "Templia Art",
        description:
          "Luxury vacation rental in Tulum offering personalized Mayan Tzolkin calendar-guided journeys for guests. Each stay includes a sacred calendar itinerary mapped to the Maya day signs of your travel dates.",
        url: "https://templia.art",
        image: "https://templia.art/og-image.jpg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Luum Zama, Aldea Zama",
          addressLocality: "Tulum",
          addressRegion: "Quintana Roo",
          postalCode: "77760",
          addressCountry: "MX",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 20.2067,
          longitude: -87.4382,
        },
        telephone: "+525565429950",
        email: "stay@templia.art",
        priceRange: "$$$",
        checkinTime: "16:00",
        checkoutTime: "11:00",
        numberOfRooms: 2,
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Private Pool", value: true },
          { "@type": "LocationFeatureSpecification", name: "Air Conditioning", value: true },
          { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
          { "@type": "LocationFeatureSpecification", name: "Kitchen", value: true },
          { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
          { "@type": "LocationFeatureSpecification", name: "Workspace", value: true },
        ],
        sameAs: [
          "https://www.instagram.com/templia.art/",
          "https://stay.templia.art",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "reservations",
          telephone: "+525565429950",
          email: "stay@templia.art",
          availableLanguage: ["English", "Spanish"],
        },
        knowsLanguage: ["en", "es"],
        currenciesAccepted: "MXN, USD",
      },
      {
        "@type": "WebSite",
        "@id": "https://templia.art/#website",
        url: "https://templia.art",
        name: "Templia Art",
        description:
          "Tzolkin-guided journeys at a luxury stay in Tulum, Mexico.",
        publisher: { "@id": "https://templia.art/#lodging" },
        inLanguage: ["en", "es"],
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
        <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-gold/60 mb-8">
          Tzolkin-Guided Journeys
        </p>

        {/* Descriptive content for AI crawlers and visitors */}
        <div className="max-w-xl mx-auto text-center mb-12 space-y-4">
          <p className="text-foreground/60 leading-relaxed">
            A luxury stay in Luum Zama, Aldea Zama, Tulum, where every guest
            experience is guided by the Tzolk&apos;in &mdash; the 260-day sacred
            calendar of the Maya civilization. Each stay includes a personalized
            journey page mapping the ancestral day signs to your travel dates.
          </p>
          <p className="text-xs tracking-[0.25em] uppercase text-gold/30">
            Tulum &middot; Quintana Roo &middot; Mexico
          </p>
        </div>

        <div className="mayan-divider w-24 mb-12" />

        {/* Journey cards */}
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
                  <p className="text-sm text-foreground/30 mt-1">
                    {journey.guestName}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {/* Navigation */}
        <nav className="mt-16 flex flex-wrap justify-center gap-6 text-sm tracking-[0.2em] uppercase">
          <Link
            href="/about"
            className="text-foreground/30 hover:text-gold/60 transition-colors"
          >
            About
          </Link>
          <Link
            href="/calendar"
            className="text-foreground/30 hover:text-gold/60 transition-colors"
          >
            Tzolkin
          </Link>
          <Link
            href="/privacy"
            className="text-foreground/30 hover:text-gold/60 transition-colors"
          >
            Privacy
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
