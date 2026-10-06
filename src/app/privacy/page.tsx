import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy · Templia Art",
  description:
    "Privacy policy for Templia Art. How we handle your data, including birth dates used for personalized Tzolkin nawal calculations.",
  alternates: { canonical: "https://templia.art/privacy/" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-background text-foreground px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="mayan-divider-thick w-32 mx-auto mb-12" />

          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text text-center mb-4">
            Privacy Policy
          </h1>

          <p className="text-sm text-foreground/40 text-center mb-12">
            Last updated: March 2026
          </p>

          <div className="mayan-divider w-24 mx-auto mb-16" />

          <div className="space-y-12 text-foreground/80 leading-relaxed">
            {/* ── Overview ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Overview
              </h2>
              <p>
                Templia Art (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                &ldquo;our&rdquo;) operates the website templia.art and provides
                luxury accommodation services in Tulum, Mexico. This privacy
                policy explains how we collect, use, and protect your personal
                information when you use our website or stay at our property.
              </p>
            </section>

            {/* ── Birth Date & Nawal Data ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Birth Date &amp; Nawal Calculations
              </h2>
              <div className="space-y-3">
                <p>
                  Our website includes a feature that calculates your personal
                  Maya nawal (day sign and tone) based on your birth date. This
                  is how we handle that data:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>
                    <strong>On-page calculator:</strong> When you enter your
                    birth date into the nawal calculator on a journey page, the
                    calculation happens entirely in your browser. Your birth date
                    is never sent to our servers.
                  </li>
                  <li>
                    <strong>Pre-booking:</strong> If you share your birth date
                    with us before your stay (via email or messaging), we use it
                    solely to generate your personalized Tzolkin journey page. We
                    store this information only for the duration of your stay and
                    delete it within 30 days after checkout unless you request
                    otherwise.
                  </li>
                  <li>
                    <strong>No sharing:</strong> We never share birth dates or
                    nawal data with third parties, advertisers, or analytics
                    services.
                  </li>
                </ul>
              </div>
            </section>

            {/* ── Information We Collect ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Information We Collect
              </h2>
              <div className="space-y-3">
                <p>We may collect the following types of information:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>
                    <strong>Booking information:</strong> Name, email address,
                    phone number, and travel dates provided through Airbnb or
                    direct communication.
                  </li>
                  <li>
                    <strong>Birth date:</strong> Optionally provided for Tzolkin
                    nawal calculation (see above).
                  </li>
                  <li>
                    <strong>Communication records:</strong> Messages exchanged
                    via email or WhatsApp regarding your stay.
                  </li>
                </ul>
              </div>
            </section>

            {/* ── How We Use Your Information ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>To manage your reservation and communicate about your stay</li>
                <li>To generate your personalized Tzolkin journey page</li>
                <li>To provide concierge recommendations during your visit</li>
                <li>To respond to inquiries and support requests</li>
              </ul>
            </section>

            {/* ── Third-Party Services ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Third-Party Services
              </h2>
              <div className="space-y-3">
                <p>Our website and booking process involve the following third parties:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>
                    <strong>Airbnb:</strong> Bookings made through Airbnb are
                    subject to{" "}
                    <a
                      href="https://www.airbnb.com/terms/privacy_policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold/60 hover:text-gold transition-colors underline"
                    >
                      Airbnb&apos;s privacy policy
                    </a>
                    .
                  </li>
                  <li>
                    <strong>WhatsApp:</strong> Messages sent via WhatsApp are
                    subject to{" "}
                    <a
                      href="https://www.whatsapp.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold/60 hover:text-gold transition-colors underline"
                    >
                      WhatsApp&apos;s privacy policy
                    </a>
                    .
                  </li>
                  <li>
                    <strong>Resend:</strong> Daily journey emails are delivered
                    through Resend, which processes your email address to send
                    them.
                  </li>
                  <li>
                    <strong>Cloudflare:</strong> Our website is served through
                    Cloudflare&apos;s CDN, which may process basic request data
                    (IP address, user agent) for security and performance.
                  </li>
                </ul>
              </div>
            </section>

            {/* ── Daily Journey Emails ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Daily Journey Emails
              </h2>
              <p>
                If you choose &ldquo;Remind me&rdquo; on your journey page, we
                store your email address, your stay dates, and your language
                preference so we can send one email each morning of your stay.
                The emails stop on their own after checkout. Every email
                includes an unsubscribe link that takes effect immediately, and
                you can ask us to delete your address at any time by writing to
                stay@templia.art.
              </p>
            </section>

            {/* ── Cookies & Analytics ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Cookies &amp; Analytics
              </h2>
              <p>
                Our website uses only essential cookies for theme preference
                (light/dark mode) stored in your browser&apos;s localStorage. We
                do not use analytics trackers, advertising cookies, or
                third-party tracking scripts.
              </p>
            </section>

            {/* ── Data Retention ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Data Retention
              </h2>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  Booking and communication records are retained for up to 12
                  months after your stay for operational purposes.
                </li>
                <li>
                  Birth dates shared for nawal calculations are deleted within 30
                  days of checkout.
                </li>
                <li>
                  Journey pages may remain accessible at their URL unless you
                  request removal.
                </li>
              </ul>
            </section>

            {/* ── Your Rights ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Your Rights
              </h2>
              <div className="space-y-3">
                <p>
                  Under applicable privacy laws, including Mexico&apos;s Federal
                  Law on Protection of Personal Data Held by Private Parties
                  (LFPDPPP) and the EU General Data Protection Regulation
                  (GDPR), you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your data</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>
                <p>
                  To exercise any of these rights, contact us at{" "}
                  <a
                    href="mailto:stay@templia.art"
                    className="text-gold/60 hover:text-gold transition-colors underline"
                  >
                    stay@templia.art
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* ── Contact ── */}
            <section>
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-light gold-gradient-text mb-4">
                Contact
              </h2>
              <p>
                For questions about this privacy policy or your personal data,
                contact us at{" "}
                <a
                  href="mailto:stay@templia.art"
                  className="text-gold/60 hover:text-gold transition-colors underline"
                >
                  stay@templia.art
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mayan-divider w-24 mx-auto mt-16 mb-10" />

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
