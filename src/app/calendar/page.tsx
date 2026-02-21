import type { Metadata } from "next";
import TzolkinWheel from "@/components/TzolkinWheel";

export const metadata: Metadata = {
  title: "Tzolkin Calendar · Templia Art",
  description:
    "Interactive Maya Tzolkin sacred calendar. Explore the 260-day cycle of 13 tones and 20 day signs through rotating concentric wheels.",
  alternates: {
    canonical: "https://templia.art/calendar",
  },
  openGraph: {
    title: "Tzolkin Calendar · Templia Art",
    description:
      "Interactive Maya Tzolkin sacred calendar wheel at Templia Art.",
    url: "https://templia.art/calendar",
    siteName: "Templia Art",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tzolkin Calendar · Templia Art",
      },
    ],
  },
};

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-12 md:py-20">
      <div className="mayan-divider-thick w-32 mb-8" />

      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-5xl font-light gold-gradient-text mb-2 text-center">
        Tzolkin Calendar
      </h1>
      <p className="font-[family-name:var(--font-cormorant)] text-base md:text-lg italic text-gold/50 mb-10 text-center max-w-lg">
        The 260-day sacred cycle — 13 tones × 20 day signs
      </p>

      <TzolkinWheel />
    </main>
  );
}
