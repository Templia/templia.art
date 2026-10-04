import { getAllJourneySlugs, getJourneyBySlug, type JourneyDay } from "@/lib/journeys";
import { getTzolkinDate } from "@/lib/tzolkin";
import { DAY_SIGN_NAMES_ES } from "@/lib/i18n";

// Per-journey feed read by the Cloudflare Worker to build the daily emails.
export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllJourneySlugs().map((slug) => ({ slug }));
}

function digestDays(days: JourneyDay[], locale: "en" | "es") {
  return days.map((day, i) => {
    const tz = getTzolkinDate(new Date(day.date + "T12:00:00"));
    const signName = locale === "es"
      ? DAY_SIGN_NAMES_ES[tz.daySign.englishName] ?? tz.daySign.englishName
      : `The ${tz.daySign.englishName}`;
    return {
      date: day.date,
      dayNumber: i + 1,
      tzolkin: `${tz.tone.number} ${tz.daySign.name}`,
      signName,
      title: day.title,
      description: day.description,
      activities: day.activities.map((a) => ({ timeOfDay: a.timeOfDay, text: a.activity })),
    };
  });
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourneyBySlug(slug);
  if (!journey) return Response.json({ error: "not_found" }, { status: 404 });

  return Response.json({
    slug,
    guestName: journey.guestName ?? null,
    checkIn: journey.checkIn,
    checkOut: journey.checkOut,
    url: `https://templia.art/journey/${slug}/`,
    totalDays: journey.days.length,
    locales: {
      en: digestDays(journey.days, "en"),
      ...(journey.es ? { es: digestDays(journey.es.days, "es") } : {}),
    },
  });
}
