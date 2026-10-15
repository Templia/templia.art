import { type JourneyDay } from "@/lib/journeys";
import { DayCard, DayCardBack, type CardViz } from "./DayCard";
import { FlipCard } from "./FlipCard";

// A day card that turns over: the glyph face on the front, the day's
// reading on the back.
export function FlipDayCard({
  day,
  dayNumber,
  viz,
  rich,
  guestName,
  place,
  totalDays,
  href,
}: {
  day: JourneyDay;
  dayNumber: number;
  viz: CardViz;
  rich?: boolean;
  guestName?: string;
  place?: string;
  totalDays?: number;
  href?: string;
}) {
  return (
    <FlipCard
      label={`Day ${dayNumber}`}
      front={
        <DayCard
          day={day}
          dayNumber={dayNumber}
          viz={viz}
          rich={rich}
          href={href}
          flipHint
          guestName={guestName}
          place={place}
          totalDays={totalDays}
        />
      }
      back={<DayCardBack day={day} dayNumber={dayNumber} guestName={guestName} place={place} href={href} />}
    />
  );
}
