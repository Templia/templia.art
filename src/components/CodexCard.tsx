import { type JourneyDay } from "@/lib/journeys";
import { getTzolkinDate } from "@/lib/tzolkin";
import { DayCardBack, dedication, getKin } from "./DayCard";
import { FlipCard } from "./FlipCard";
import { Frieze, Pictogram } from "./CodexArt";

// Codex deck: a tarot-like paper card with a carved frieze, a large
// pictogram for the day sign that breaks out of the ink frame, and the
// sign's name set in capitals. Turns over to the day's reading.

function formatEyebrowDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CodexFront({
  day,
  dayNumber,
  totalDays,
  guestName,
  place,
}: {
  day: JourneyDay;
  dayNumber: number;
  totalDays?: number;
  guestName?: string;
  place?: string;
}) {
  const date = new Date(day.date + "T12:00:00");
  const { tone, daySign } = getTzolkinDate(date);
  const kin = getKin(tone.number, daySign.number);

  return (
    <article
      className="day-card codex-card flex flex-col rounded-[14px] overflow-hidden"
      data-dir={daySign.direction.toLowerCase()}
      data-bleed={dayNumber % 2 ? "right" : "left"}
    >
      <Frieze kin={kin} tone={tone.number} className="codex-frieze" />

      <div className="codex-body flex flex-col flex-1">
        <header>
          {guestName && <p className="day-card-guest">{dedication(guestName, place)}</p>}
          <p className="day-card-eyebrow mt-1.5">
            Day {dayNumber}
            {totalDays && <> of {totalDays}</>} · {formatEyebrowDate(date)} · Kin {kin}
          </p>
        </header>

        <div className="codex-art flex-1">
          <Pictogram daySign={daySign} className="codex-pictogram" />
        </div>

        <footer className="codex-plate">
          <p className="codex-name">
            {tone.number} {daySign.name}
          </p>
          <p className="codex-sub">
            The {daySign.englishName} · {tone.meaning}
          </p>
          <p className="day-card-body mt-2 mx-auto">{day.title}</p>
        </footer>
      </div>
    </article>
  );
}

export function CodexCard({
  day,
  dayNumber,
  totalDays,
  guestName,
  place,
  href,
}: {
  day: JourneyDay;
  dayNumber: number;
  totalDays?: number;
  guestName?: string;
  place?: string;
  href?: string;
}) {
  return (
    <FlipCard
      label={`Day ${dayNumber}`}
      front={<CodexFront day={day} dayNumber={dayNumber} totalDays={totalDays} guestName={guestName} place={place} />}
      back={<DayCardBack day={day} dayNumber={dayNumber} guestName={guestName} place={place} href={href} compact />}
    />
  );
}
