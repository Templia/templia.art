import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About · Templia Art",
  description:
    "Templia Art is a Mayan-inspired luxury stay in Tulum offering personalized Tzolkin calendar-guided journeys. Learn about the host, the vision, and the sacred calendar experience.",
  alternates: { canonical: "https://templia.art/about/" },
  openGraph: {
    title: "About · Templia Art",
    description:
      "The story behind Templia Art's Tzolkin-guided journeys in Tulum, Mexico.",
    url: "https://templia.art/about/",
    siteName: "Templia Art",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Templia Art" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About · Templia Art",
    description:
      "The story behind Templia Art's Tzolkin-guided journeys in Tulum, Mexico.",
    images: ["/og-image.jpg"],
  },
};

function AboutJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://templia.art/about/#host",
    name: "Templia Art Host",
    jobTitle: "Host & Tzolkin Guide",
    worksFor: { "@id": "https://templia.art/#lodging" },
    knowsAbout: [
      "Tzolkin calendar",
      "Maya cosmology",
      "Sacred calendar journeys",
      "Cultural tourism",
      "Tulum hospitality",
    ],
    url: "https://templia.art/about/",
    sameAs: ["https://www.instagram.com/templia.art/"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function AboutPage() {
  return (
    <>
      <AboutJsonLd />
      <main className="min-h-screen bg-background text-foreground px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mayan-divider-thick w-32 mx-auto mb-12" />

          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text text-center mb-4">
            About Templia Art
          </h1>

          <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-gold/60 text-center mb-12">
            Where modern comfort meets ancestral wisdom
          </p>

          <div className="mayan-divider w-24 mx-auto mb-16" />

          {/* ── The Space ── */}
          <section className="mb-16">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-6">
              The Space
            </h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Templia Art is a luxury stay nestled in Luum Zama, within the
                Aldea Zama community of Tulum, Quintana Roo, Mexico. The
                property blends contemporary architecture with elements inspired
                by Maya civilization &mdash; from the private pool and jungle
                garden to the communal firepit designed for evening reflection.
              </p>
              <p>
                With two bedrooms, a fully equipped kitchen, dedicated workspace,
                and air conditioning throughout, Templia Art accommodates up to
                four guests in comfort. The property sits minutes from Tulum&apos;s
                Caribbean coastline, cenotes, and archaeological sites.
              </p>
            </div>
          </section>

          {/* ── The Tzolkin Journey ── */}
          <section className="mb-16">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-6">
              The Tzolkin Journey
            </h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Every stay at Templia Art includes a personalized journey page
                guided by the Tzolk&apos;in &mdash; the 260-day sacred calendar of
                the Maya civilization. The Tzolk&apos;in combines 13 tones with
                20 day signs (nawals) to create a cycle that has been
                continuously observed by Maya daykeepers for over two millennia.
              </p>
              <p>
                Your journey page maps the nawals of each day of your stay,
                connecting cultural activities, cenote visits, and local
                experiences to the energetic qualities of each day sign. If you
                share your birth date, the journey also reveals your personal
                nawal &mdash; the day sign and tone that accompanied your arrival
                into the world.
              </p>
              <p>
                The result is an itinerary that weaves modern travel with
                thousands of years of cultural wisdom &mdash; not as
                appropriation, but as an invitation to experience Tulum through
                the lens of the living Maya tradition.
              </p>
            </div>
          </section>

          {/* ── The Vision ── */}
          <section className="mb-16">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-6">
              The Vision
            </h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Templia Art was created with the belief that travel should be
                more than a change of scenery. In a region where Maya culture is
                often reduced to souvenir markets and ruins tours, we wanted to
                offer something deeper &mdash; a stay that honors the living
                intellectual heritage of the Maya people.
              </p>
              <p>
                The Tzolkin journey is our way of bridging that gap. By
                connecting each guest&apos;s dates to the sacred calendar, we
                create a framework for experiencing Tulum that is personal,
                culturally grounded, and unlike anything a guidebook can offer.
              </p>
            </div>
          </section>

          {/* ── Cultural Context ── */}
          <section className="mb-16">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-6">
              Cultural Context
            </h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                Tulum&apos;s ancient name was Zama, meaning &ldquo;dawn&rdquo;
                &mdash; it was one of the last cities built and inhabited by the
                Maya. Today, the region is home to ongoing cultural preservation
                efforts, including the Parque del Jaguar (a 1,000-hectare
                protected reserve) and the Museo Regional de la Costa Oriental,
                which houses over 300 original artifacts spanning Caribbean Maya
                history from prehistoric times to the present.
              </p>
              <p>
                We encourage every guest to explore these sites during their
                stay. Your Tzolkin journey page includes recommendations and
                context for visiting them.
              </p>
            </div>
          </section>

          {/* ── Contact ── */}
          <section className="mb-16">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-6">
              Get in Touch
            </h2>
            <div className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                <span className="text-sm tracking-[0.2em] uppercase text-gold/50">Email</span>
                <br />
                <a href="mailto:stay@templia.art" className="text-gold/70 hover:text-gold transition-colors">
                  stay@templia.art
                </a>
              </p>
              <p>
                <span className="text-sm tracking-[0.2em] uppercase text-gold/50">WhatsApp</span>
                <br />
                <a href="https://wa.me/525565429950" className="text-gold/70 hover:text-gold transition-colors">
                  +52 55 6542 9950
                </a>
              </p>
              <p>
                <span className="text-sm tracking-[0.2em] uppercase text-gold/50">Location</span>
                <br />
                Luum Zama, Aldea Zama, Tulum, Quintana Roo, Mexico
              </p>
            </div>
          </section>

          <div className="mayan-divider w-24 mx-auto mb-10" />

          <div className="text-center">
            <Link
              href="/"
              className="text-sm tracking-[0.3em] uppercase text-gold/40 hover:text-gold/70 transition-colors border-b border-gold/15 hover:border-gold/40 pb-0.5"
            >
              &larr; Return Home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
