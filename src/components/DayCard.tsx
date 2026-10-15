import type { ReactNode } from "react";
import { type JourneyDay } from "@/lib/journeys";
import { TzolkinDial } from "./TzolkinDial";
import { AnimatedGlyph } from "./AnimatedGlyph";
import {
  getTzolkinDate,
  getGlyphPath,
  DIRECTION_MEANINGS,
  type DaySign,
  type Tone,
} from "@/lib/tzolkin";

// Each day card is tinted by its day sign's direction — the four Maya
// directional colors (East red, North white, West black, South yellow),
// rendered as muted earth tones. Palettes live in globals.css (.day-card).
export type CardViz = "tone" | "kin" | "glyph";

export const CARD_VIZ: CardViz[] = ["tone", "kin", "glyph"];

/** Kin number (1–260) for a tone/sign pair: the n where n≡tone (mod 13) and n≡sign (mod 20). */
export function getKin(tone: number, sign: number): number {
  for (let n = 1; n <= 260; n++) {
    if ((n - 1) % 13 === tone - 1 && (n - 1) % 20 === sign - 1) return n;
  }
  return 1;
}

/** The card's dedication: "For Vitaly at Templia Art". */
export function dedication(guestName: string, place?: string): string {
  return place ? `For ${guestName} at ${place}` : `For ${guestName}`;
}

function formatEyebrowDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DayCard({
  day,
  dayNumber,
  viz,
  stayKins = [],
  isToday = false,
  rich = false,
  flipHint = false,
  guestName,
  place,
  totalDays,
  href,
  footer,
  children,
}: {
  day: JourneyDay;
  dayNumber: number;
  viz: CardViz;
  /** Kin numbers of every day in the stay — drawn faintly on the kin grid. */
  stayKins?: number[];
  isToday?: boolean;
  /** Full-width layout with direction text and sign/tone descriptions (glyph viz only). */
  rich?: boolean;
  /** Show a "turn the card" cue in the footer (used inside FlipDayCard). */
  flipHint?: boolean;
  /** Personalizes the card: shown as "For {name}" above the eyebrow. */
  guestName?: string;
  /** Where the stay is, completing the dedication ("at Templia Art"). */
  place?: string;
  /** Length of the stay, for "Day 2 of 7". */
  totalDays?: number;
  href?: string;
  /** Replaces the default footer ("Open day →"); pass null for none. */
  footer?: ReactNode;
  /** Extra content inside the card, below the visualization. */
  children?: ReactNode;
}) {
  const date = new Date(day.date + "T12:00:00");
  const { tone, daySign } = getTzolkinDate(date);
  const kin = getKin(tone.number, daySign.number);

  return (
    <article
      className="day-card group relative flex flex-col rounded-[14px] overflow-hidden"
      data-dir={daySign.direction.toLowerCase()}
    >
      {rich && <TzolkinDial daySign={daySign} tone={tone} className="day-card-dial" />}
      {guestName && <p className="day-card-guest">{dedication(guestName, place)}</p>}
      <header className={`flex items-center justify-between gap-3 ${guestName ? "mt-1.5" : ""}`}>
        <p className="day-card-eyebrow">
          Day {dayNumber}
          {totalDays && <> of {totalDays}</>} · {formatEyebrowDate(date)}
          {rich && <> · Kin {kin}</>}
        </p>
        {isToday && <span className="day-card-badge">Today</span>}
      </header>

      <h3 className="day-card-stat mt-4">
        {tone.number} {daySign.name}
      </h3>

      <p className="day-card-body mt-3 line-clamp-3">{day.title}</p>

      <div className="day-card-viz flex-1 mt-6 flex flex-col">
        {viz === "tone" && <ToneBars tone={tone} />}
        {viz === "kin" && <KinGrid kin={kin} stayKins={stayKins} />}
        {viz === "glyph" && !rich && <GlyphBlocks daySign={daySign} tone={tone} kin={kin} />}
        {viz === "glyph" && rich && <RichGlyph daySign={daySign} tone={tone} />}
      </div>

      {children}

      {footer !== undefined ? footer : (
      <footer className={`mt-6 flex items-center ${flipHint ? "justify-between" : "justify-end"}`}>
        {flipHint && <span className="day-card-meta opacity-70">Turn for the day ↻</span>}
        {href ? (
          <a href={href} className="day-card-pill">
            Open day <span aria-hidden>→</span>
          </a>
        ) : (
          <span className="day-card-pill">
            Open day <span aria-hidden>→</span>
          </span>
        )}
      </footer>
      )}
    </article>
  );
}

/* ─── Back face: the day's reading ─────────────────────────────────── */
function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : text;
}

export function DayCardBack({
  day,
  dayNumber,
  guestName,
  place,
  compact = false,
  href,
}: {
  day: JourneyDay;
  dayNumber: number;
  guestName?: string;
  place?: string;
  /** Description only, no activity list — for narrow (tarot-sized) cards. */
  compact?: boolean;
  href?: string;
}) {
  const date = new Date(day.date + "T12:00:00");
  const { tone, daySign } = getTzolkinDate(date);

  return (
    <article
      className="day-card day-card-back relative flex flex-col rounded-[14px] overflow-hidden"
      data-dir={daySign.direction.toLowerCase()}
    >
      <span
        className="day-card-back-glyph"
        style={{ maskImage: `url(${getGlyphPath(daySign)})`, WebkitMaskImage: `url(${getGlyphPath(daySign)})` }}
        aria-hidden
      />
      <header>
        <p className="day-card-eyebrow">
          {guestName && <>{dedication(guestName, place)} · </>}Day {dayNumber} · {formatEyebrowDate(date)} · {tone.number}{" "}
          {daySign.name}
        </p>
        <h3 className="day-card-back-title mt-3">{day.title}</h3>
      </header>

      <p className="day-card-back-text mt-4">{day.description}</p>

      {!compact && day.activities.length > 0 && (
        <ol className="mt-6 day-card-back-rhythm">
          {day.activities.map((a, i) => (
            <li key={i}>
              <p className="day-card-meta opacity-70">{a.timeOfDay}</p>
              <p className="day-card-small mt-0.5">{firstSentence(a.activity)}</p>
            </li>
          ))}
        </ol>
      )}

      <footer className="mt-auto pt-6 flex items-center justify-between">
        <span className="day-card-meta opacity-70">↺ Turn back</span>
        {href && (
          <a href={href} className="day-card-pill">
            Open day <span aria-hidden>→</span>
          </a>
        )}
      </footer>
    </article>
  );
}

/* ─── Viz 1: the 13-tone wave as a bar chart ─────────────────────────── */
function ToneBars({ tone }: { tone: Tone }) {
  // Tones rise toward 7 (the mystic center) and resolve at 13 — a gentle arch
  // with a lift at the end, so the shape reads as a wave rather than a ramp.
  const heights = [34, 46, 58, 68, 78, 88, 100, 90, 80, 70, 62, 74, 92];
  return (
    <div className="flex flex-col flex-1">
      <div className="relative flex-1 flex items-end gap-[3px]">
        {/* Gridlines, as in the reference */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-px day-card-rule" />
          ))}
        </div>
        {heights.map((h, i) => {
          const n = i + 1;
          const state = n === tone.number ? "now" : n < tone.number ? "past" : "next";
          return (
            <div
              key={n}
              className="day-card-bar relative flex-1"
              data-state={state}
              style={{ height: `${h}%` }}
              title={`Tone ${n}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex justify-between day-card-meta">
        <span>Tone {tone.number} of 13</span>
        <span>{tone.meaning}</span>
      </div>
    </div>
  );
}

/* ─── Viz 2: the 260-day Tzolkin as a pixel grid ────────────────────── */
function KinGrid({ kin, stayKins }: { kin: number; stayKins: number[] }) {
  // Classic layout: 20 rows (day signs) × 13 columns, read column by column.
  const stay = new Set(stayKins);
  const cells = [];
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 13; col++) {
      const n = col * 20 + row + 1;
      const state = n === kin ? "now" : stay.has(n) ? "stay" : "base";
      // Base cells are shaded by their own tone, so the texture is the real
      // 13-tone rhythm of the calendar rather than decoration.
      const toneShade = ((n - 1) % 13) / 12;
      cells.push(
        <div
          key={n}
          className="day-card-cell"
          data-state={state}
          style={state === "base" ? { opacity: 0.35 + toneShade * 0.4 } : undefined}
        />,
      );
    }
  }
  return (
    <div className="flex flex-col flex-1">
      <div
        className="grid gap-[2px] flex-1 min-h-[200px]"
        style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))", gridTemplateRows: "repeat(20, minmax(0, 1fr))" }}
        aria-label={`Kin ${kin} of 260`}
      >
        {cells}
      </div>
      <div className="mt-3 flex justify-between day-card-meta">
        <span>Kin {kin}</span>
        <span>of 260</span>
      </div>
    </div>
  );
}

/* ─── Viz 3: glyph in a treemap of blocks ───────────────────────────── */
// Three blocks, each carrying one fact about the day:
//   large  — the day sign's glyph
//   accent — the tone, written in Maya bar-and-dot numerals
//   rule   — the sign's element and direction
function GlyphBlocks({ daySign, tone, kin }: { daySign: DaySign; tone: Tone; kin: number }) {
  const glyph = getGlyphPath(daySign);
  return (
    <div className="flex flex-col flex-1">
      <div className="day-card-blocks flex flex-1 gap-[3px]">
        <div className="day-card-block-strong flex-[2] relative flex items-center justify-center rounded-[4px]">
          <AnimatedGlyph
            src={glyph}
            label={daySign.englishName}
            className="block h-[80%] max-w-[85%] aspect-[612/792]"
          />
        </div>
        <div className="flex-1 flex flex-col gap-[3px]">
          <div className="day-card-block-accent flex-[3] rounded-[4px] p-2.5 flex flex-col justify-between">
            <p className="day-card-meta day-card-on-accent">Tone</p>
            <BarDot n={tone.number} className="day-card-on-accent w-full max-w-[64px] self-center" />
            <p className="day-card-on-accent day-card-meta-value text-right">{tone.number}</p>
          </div>
          <div className="flex-[2] rounded-[4px] border day-card-rule-border p-2.5 flex flex-col justify-between">
            <p className="day-card-meta opacity-70">{daySign.direction}</p>
            <p className="day-card-meta-value">{daySign.element}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 day-card-meta">
        <div>
          <p className="opacity-70">Sign</p>
          <p className="day-card-meta-value">{daySign.englishName}</p>
        </div>
        <div>
          <p className="opacity-70">Tone</p>
          <p className="day-card-meta-value">{tone.meaning}</p>
        </div>
        <div className="text-right">
          <p className="opacity-70">Kin</p>
          <p className="day-card-meta-value">{kin}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Viz 3, rich: glyph + tone + direction ─────────────────────────── */
// Grid areas keep the blocks side by side on wide cards and drop the
// direction box below the glyph on narrow ones (see .day-card-rich-blocks).
function RichGlyph({ daySign, tone }: { daySign: DaySign; tone: Tone }) {
  const glyph = getGlyphPath(daySign);
  const dir = DIRECTION_MEANINGS[daySign.direction];
  return (
    <div className="flex flex-col flex-1">
      <div className="day-card-rich-blocks">
        <div className="day-card-block-strong [grid-area:glyph] flex items-center justify-center rounded-[4px]">
          <AnimatedGlyph
            src={glyph}
            label={daySign.englishName}
            className="block h-[80%] max-w-[85%] aspect-[612/792]"
          />
        </div>
        <div className="[grid-area:tone] flex items-center gap-3">
          <div className="day-card-block-accent day-card-rich-tone rounded-[4px] flex items-center justify-center shrink-0">
            <BarDot n={tone.number} className="day-card-on-accent w-[62%]" />
          </div>
          <div className="min-w-0">
            <p className="day-card-meta opacity-70">Tone {tone.number}</p>
            <p className="day-card-meta-value truncate">{tone.name} · {tone.meaning}</p>
          </div>
        </div>
        <div className="[grid-area:dir] rounded-[4px] border day-card-rule-border day-card-rich-dir flex flex-col justify-between gap-4">
          <p className="day-card-meta opacity-70">
            {daySign.direction} · {dir?.color} · {daySign.element}
          </p>
          <div>
            <p className="day-card-meta-value">{dir?.title}</p>
            <p className="day-card-small mt-1.5">{dir?.text}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

/** Maya numeral 1–13: dots (ones) stacked above bars (fives). */
function BarDot({ n, className }: { n: number; className?: string }) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const W = 60;
  const barH = 7;
  const gap = 5;
  const dotR = 4.5;
  const dotRow = dots ? dotR * 2 + gap : 0;
  const H = dotRow + bars * barH + Math.max(0, bars - 1) * gap;
  const dotSpacing = W / (dots + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-label={`${n} in Maya numerals`} role="img">
      {Array.from({ length: dots }, (_, i) => (
        <circle key={`d${i}`} cx={dotSpacing * (i + 1)} cy={dotR} r={dotR} fill="currentColor" />
      ))}
      {Array.from({ length: bars }, (_, i) => (
        <rect key={`b${i}`} x={0} y={dotRow + i * (barH + gap)} width={W} height={barH} rx={2} fill="currentColor" />
      ))}
    </svg>
  );
}
