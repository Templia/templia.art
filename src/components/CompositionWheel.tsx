import { DAY_SIGNS, TONES, DIRECTION_MEANINGS, getGlyphPath, type DaySign, type Tone } from "@/lib/tzolkin";
import { Numeral, at, f, sector } from "./TzolkinDial";

// The large Tzolk'in wheel that Example 4's cards are composed around.
// From the center outward: the 13 tones, the 20 day signs, and a ring giving
// each sign's direction color — the real red/white/black/yellow cycle. The day's tone,
// sign and direction line up into one spoke pointing at `point` degrees
// (clockwise from +x), where the text sits. viewBox is centered; radius 500.

const SIGN_STEP = 360 / 20;
const TONE_STEP = 360 / 13;

// The label runs on its own track (sign1–dir0) so it always sits on the card
// color, never on a dark direction segment.
// Only the wheel's outer band ever shows on the card, so the rings sit in the
// outer half of the radius; the center (inner) circle is never in view.
const R = { inner: 240, tone0: 248, tone1: 314, sign0: 322, sign1: 412, dir0: 458, dir1: 494 };
const LABEL_R = 435;

/** Arc for text to run along, centered on `point`. Reads left-to-right/upright either way. */
function labelArc(r: number, point: number, span: number): string {
  // Text sits upright on a clockwise arc above the center line and on a
  // counter-clockwise one below it.
  const below = Math.sin((point * Math.PI) / 180) > 0.5;
  const a0 = below ? point + span : point - span;
  const a1 = below ? point - span : point + span;
  const [x0, y0] = at(r, a0);
  const [x1, y1] = at(r, a1);
  return `M${f(x0)},${f(y0)} A${r},${r} 0 0 ${below ? 0 : 1} ${f(x1)},${f(y1)}`;
}

export function CompositionWheel({
  daySign,
  tone,
  point,
  arcId,
  className,
}: {
  daySign: DaySign;
  tone: Tone;
  point: number;
  /** Unique id for the label's text path within the page. */
  arcId: string;
  className?: string;
}) {
  const dir = DIRECTION_MEANINGS[daySign.direction];
  const label = `${daySign.direction} · ${dir?.color ?? ""} · ${daySign.element}`;

  return (
    <svg viewBox="-500 -500 1000 1000" className={className} aria-hidden focusable="false">
      <defs>
        <path id={arcId} d={labelArc(LABEL_R, point, 42)} />
      </defs>

      {/* Each ring is its own group so it can spin with its own timing
          (see .wheel-ring-* in globals.css); they converge on the day. */}

      {/* Direction ring: each sign's segment in its direction's color */}
      <g className="wheel-ring wheel-ring-dir">
      {DAY_SIGNS.map((s, i) => {
        const offset = i - (daySign.number - 1);
        const a = point + offset * SIGN_STEP;
        return (
          <path
            key={`dir${s.number}`}
            className={`wheel-dir wheel-dir-${s.direction.toLowerCase()}`}
            data-selected={offset === 0 || undefined}
            d={sector(R.dir0, R.dir1, a - SIGN_STEP / 2 + 0.6, a + SIGN_STEP / 2 - 0.6)}
          />
        );
      })}
      <text className="wheel-label">
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          {label}
        </textPath>
      </text>
      </g>

      {/* Sign ring */}
      <g className="wheel-ring wheel-ring-sign">
      {DAY_SIGNS.map((s, i) => {
        const offset = i - (daySign.number - 1);
        const a = point + offset * SIGN_STEP;
        const selected = offset === 0;
        const [x, y] = at((R.sign0 + R.sign1) / 2, a);
        const [lx0, ly0] = at(R.sign0, a - SIGN_STEP / 2);
        const [lx1, ly1] = at(R.sign1, a - SIGN_STEP / 2);
        return (
          <g key={s.number}>
            {selected && <path className="dial-selected" d={sector(R.sign0, R.sign1, a - SIGN_STEP / 2, a + SIGN_STEP / 2)} />}
            <line className="dial-line" x1={f(lx0)} y1={f(ly0)} x2={f(lx1)} y2={f(ly1)} />
            <image
              href={getGlyphPath(s)}
              x={f(x - (selected ? 34 : 30))}
              y={f(y - (selected ? 44 : 38.8))}
              width={selected ? 68 : 60}
              height={selected ? 88 : 77.6}
              className={selected ? "dial-glyph-selected" : "wheel-glyph-muted"}
            />
          </g>
        );
      })}
      </g>

      {/* Tone ring */}
      <g className="wheel-ring wheel-ring-tone">
      {TONES.map((t, i) => {
        const offset = i - (tone.number - 1);
        const a = point + offset * TONE_STEP;
        const selected = offset === 0;
        const [x, y] = at((R.tone0 + R.tone1) / 2, a);
        const [lx0, ly0] = at(R.tone0, a - TONE_STEP / 2);
        const [lx1, ly1] = at(R.tone1, a - TONE_STEP / 2);
        return (
          <g key={t.number}>
            {selected && <path className="dial-selected" d={sector(R.tone0, R.tone1, a - TONE_STEP / 2, a + TONE_STEP / 2)} />}
            <line className="dial-line" x1={f(lx0)} y1={f(ly0)} x2={f(lx1)} y2={f(ly1)} />
            <g
              transform={`translate(${f(x)} ${f(y)}) scale(1.7) translate(${f(-x)} ${f(-y)})`}
              className={selected ? undefined : "wheel-numeral-muted"}
            >
              <Numeral n={t.number} cx={x} cy={y} className={selected ? "dial-numeral-selected" : "dial-numeral"} />
            </g>
          </g>
        );
      })}
      </g>

      {/* Ring outlines (static) */}
      <g className="dial-line">
        <circle r={R.dir1} />
        <circle r={R.dir0} />
        <circle r={R.sign1} />
        <circle r={R.tone1} />
        <circle r={R.inner} />
      </g>
    </svg>
  );
}
