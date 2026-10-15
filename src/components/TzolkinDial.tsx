import { DAY_SIGNS, TONES, getGlyphPath, type DaySign, type Tone } from "@/lib/tzolkin";

// A Tzolk'in dial for a card corner: the 20 day signs on the outer ring, the
// 13 tones on the inner ring, turned so the day's sign and tone point into
// the card. Centered on the card's corner, only a quarter of it shows.
// viewBox is centered on the dial (0,0); radius 200.

export const f = (n: number) => n.toFixed(2);
const rad = (deg: number) => (deg * Math.PI) / 180;
export const at = (r: number, deg: number) => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r];

/** Annular sector between radii r0–r1 and angles a0–a1 (degrees, clockwise from +x). */
export function sector(r0: number, r1: number, a0: number, a1: number): string {
  const [x0, y0] = at(r1, a0);
  const [x1, y1] = at(r1, a1);
  const [x2, y2] = at(r0, a1);
  const [x3, y3] = at(r0, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${f(x0)},${f(y0)} A${r1},${r1} 0 ${large} 1 ${f(x1)},${f(y1)} L${f(x2)},${f(y2)} A${r0},${r0} 0 ${large} 0 ${f(x3)},${f(y3)} Z`;
}

/** Maya bar-and-dot numeral centered on (cx, cy). */
export function Numeral({ n, cx, cy, className }: { n: number; cx: number; cy: number; className?: string }) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const h = bars * 6 + (dots ? 8 : 0) - (bars && !dots ? 2 : 0);
  const top = cy - h / 2;
  return (
    <g className={className}>
      {Array.from({ length: dots }, (_, i) => (
        <circle key={`d${i}`} cx={f(cx + (i - (dots - 1) / 2) * 7)} cy={f(top + 2.8)} r="2.8" />
      ))}
      {Array.from({ length: bars }, (_, i) => (
        <rect key={`b${i}`} x={f(cx - 13)} y={f(top + (dots ? 8 : 0) + i * 6)} width="26" height="4" rx="1.5" />
      ))}
    </g>
  );
}

// The day points toward the card's interior: down-left from a top-right corner.
const POINT = 135;
const SIGN_STEP = 360 / 20;
const TONE_STEP = 360 / 13;

export function TzolkinDial({ daySign, tone, className }: { daySign: DaySign; tone: Tone; className?: string }) {
  return (
    <svg viewBox="-200 -200 400 400" className={className} aria-hidden focusable="false">
      {/* Ring outlines */}
      <g className="dial-line">
        <circle r="197" />
        <circle r="150" />
        <circle r="102" />
        <circle r="64" />
      </g>

      {/* Outer ring: day signs */}
      {DAY_SIGNS.map((s, i) => {
        const offset = i - (daySign.number - 1);
        const a = POINT + offset * SIGN_STEP;
        const selected = offset === 0;
        const [x, y] = at(174, a);
        const [lx0, ly0] = at(150, a - SIGN_STEP / 2);
        const [lx1, ly1] = at(197, a - SIGN_STEP / 2);
        // Neighbors fade with distance from the day
        const fade = Math.max(0.12, 0.6 - Math.min(Math.abs(offset), 20 - Math.abs(offset)) * 0.12);
        return (
          <g key={s.number}>
            {selected && <path className="dial-selected" d={sector(150, 197, a - SIGN_STEP / 2, a + SIGN_STEP / 2)} />}
            <line className="dial-line" x1={f(lx0)} y1={f(ly0)} x2={f(lx1)} y2={f(ly1)} />
            <image
              href={getGlyphPath(s)}
              x={f(x - 13)}
              y={f(y - 16.8)}
              width="26"
              height="33.6"
              className={selected ? "dial-glyph-selected" : "dial-glyph"}
              style={selected ? undefined : { opacity: fade }}
            />
          </g>
        );
      })}

      {/* Inner ring: tones */}
      {TONES.map((t, i) => {
        const offset = i - (tone.number - 1);
        const a = POINT + offset * TONE_STEP;
        const selected = offset === 0;
        const [x, y] = at(126, a);
        const [lx0, ly0] = at(102, a - TONE_STEP / 2);
        const [lx1, ly1] = at(150, a - TONE_STEP / 2);
        const fade = Math.max(0.15, 0.65 - Math.min(Math.abs(offset), 13 - Math.abs(offset)) * 0.16);
        return (
          <g key={t.number}>
            {selected && <path className="dial-selected" d={sector(102, 150, a - TONE_STEP / 2, a + TONE_STEP / 2)} />}
            <line className="dial-line" x1={f(lx0)} y1={f(ly0)} x2={f(lx1)} y2={f(ly1)} />
            <g style={selected ? undefined : { opacity: fade }}>
              <Numeral n={t.number} cx={x} cy={y} className={selected ? "dial-numeral-selected" : "dial-numeral"} />
            </g>
          </g>
        );
      })}

      {/* Pointer from the hub toward the day */}
      {(() => {
        const [x0, y0] = at(64, POINT);
        const [x1, y1] = at(100, POINT);
        return <line className="dial-pointer" x1={f(x0)} y1={f(y0)} x2={f(x1)} y2={f(y1)} />;
      })()}
    </svg>
  );
}
