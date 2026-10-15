import { type JourneyDay } from "@/lib/journeys";
import { getTzolkinDate, DIRECTION_MEANINGS } from "@/lib/tzolkin";
import { DayCardBack, dedication, getKin } from "./DayCard";
import { FlipCard } from "./FlipCard";
import { CompositionWheel } from "./CompositionWheel";
import { SpinningWheel } from "./SpinningWheel";

// Example 4: the card is composed around a large Tzolk'in wheel that spins
// into place. The day's tone/sign/direction form one spoke pointing at the
// text, and the text wraps the wheel's curve (CSS shape-outside).
// On narrow cards the wheel moves to the top and points down at the text.

function formatEyebrowDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function WheelFront({
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
  const date = new Date(day.date + "T12:00:00");
  const { tone, daySign } = getTzolkinDate(date);
  const kin = getKin(tone.number, daySign.number);
  const dir = DIRECTION_MEANINGS[daySign.direction];

  return (
    <article className="day-card wheel-card relative rounded-[14px] overflow-hidden" data-dir={daySign.direction.toLowerCase()}>
      <SpinningWheel className="wheel-art">
        <CompositionWheel daySign={daySign} tone={tone} point={180} arcId={`wheel-${kin}-wide`} className="wheel-svg wheel-svg-wide" />
        <CompositionWheel daySign={daySign} tone={tone} point={90} arcId={`wheel-${kin}-narrow`} className="wheel-svg wheel-svg-narrow" />
      </SpinningWheel>

      <div className="wheel-text">
        {/* Invisible float shaped like the wheel; the text flows around it */}
        <div className="wheel-float" aria-hidden />
        {guestName && <p className="day-card-guest">{dedication(guestName, place)}</p>}
        <p className="day-card-eyebrow mt-1.5">
          Day {dayNumber}
          {totalDays && <> of {totalDays}</>} · {formatEyebrowDate(date)} · Kin {kin}
        </p>
        <h3 className="day-card-stat wheel-stat mt-4">
          {tone.number} {daySign.name}
        </h3>
        <p className="day-card-body mt-3">{day.title}</p>

        <div className="wheel-facts">
          <p className="day-card-meta opacity-70">Tone {tone.number}</p>
          <p className="day-card-meta-value">
            {tone.name} · {tone.meaning}
          </p>
          <p className="day-card-meta opacity-70 mt-4">The {daySign.englishName}</p>
          <p className="day-card-meta-value">{dir?.title}</p>
          <p className="day-card-small mt-1">{dir?.text}</p>
        </div>
      </div>

      <footer className="wheel-footer flex items-center justify-between">
        <span className="day-card-meta opacity-70">Turn for the day ↻</span>
        {href && (
          <a href={href} className="day-card-pill">
            Open day <span aria-hidden>→</span>
          </a>
        )}
      </footer>
    </article>
  );
}

export function WheelCard({
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
      front={<WheelFront day={day} dayNumber={dayNumber} totalDays={totalDays} guestName={guestName} place={place} href={href} />}
      back={<DayCardBack day={day} dayNumber={dayNumber} guestName={guestName} place={place} href={href} compact />}
    />
  );
}
