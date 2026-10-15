import { type DaySign, getGlyphPath } from "@/lib/tzolkin";

// Codex-style art for the day cards: flat pictograms (solid ink shape with
// paper-colored cut-outs) and a carved-stone frieze. All drawn by hand in a
// 200×200 box; "cx-cut" parts take the card's paper color (see globals.css).
// Deterministic so server and client render the same SVG.

const f = (n: number) => n.toFixed(1);

function seeded(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* ─── Pictograms, one per day sign ───────────────────────────────────── */

function Eagle() {
  const wing = "M88 84 L26 74 L12 86 L28 90 L16 102 L34 104 L24 116 L44 116 L38 128 L88 116 Z";
  return (
    <>
      <path d={wing} />
      <path d={wing} transform="matrix(-1 0 0 1 200 0)" />
      <path d="M86 140 L72 180 L92 168 L100 186 L108 168 L128 180 L114 140 Z" />
      <ellipse cx="100" cy="112" rx="26" ry="36" />
      <circle cx="100" cy="64" r="19" />
      <rect x="87" y="38" width="7" height="12" rx="2" />
      <rect x="96.5" y="32" width="7" height="16" rx="2" />
      <rect x="106" y="38" width="7" height="12" rx="2" />
      <path d="M114 58 L132 64 L120 78 L112 70 Z" />
      <path d="M84 142 h10 v18 h6 v6 h-22 v-6 h6 Z" />
      <path d="M106 142 h10 v18 h6 v6 h-22 v-6 h6 Z" />
      <circle className="cx-cut" cx="104" cy="60" r="5.5" />
      <circle cx="105" cy="60" r="2.4" />
      <path className="cx-cut" d="M100 94 L114 112 L100 130 L86 112 Z" />
      <path d="M100 103 L107 112 L100 121 L93 112 Z" />
      <g className="cx-cut-line">
        <path d="M82 92 L40 85" />
        <path d="M82 104 L44 103" />
        <path d="M118 92 L160 85" />
        <path d="M118 104 L156 103" />
        <path d="M100 148 L100 172" />
      </g>
    </>
  );
}

function Owl() {
  return (
    <>
      <path d="M56 54 L68 18 L88 46 Z" />
      <path d="M144 54 L132 18 L112 46 Z" />
      <path d="M100 38 C152 38 158 90 154 120 C150 160 128 182 100 182 C72 182 50 160 46 120 C42 90 48 38 100 38 Z" />
      <path d="M78 178 h6 v12 h-6z M88 178 h6 v12 h-6z M106 178 h6 v12 h-6z M116 178 h6 v12 h-6z" />
      <circle className="cx-cut" cx="78" cy="84" r="21" />
      <circle className="cx-cut" cx="122" cy="84" r="21" />
      <circle cx="78" cy="84" r="10" />
      <circle cx="122" cy="84" r="10" />
      <circle className="cx-cut" cx="82" cy="80" r="3" />
      <circle className="cx-cut" cx="126" cy="80" r="3" />
      <path className="cx-cut" d="M92 104 L108 104 L100 120 Z" />
      <g className="cx-cut-line">
        <path d="M54 58 Q78 46 100 64 Q122 46 146 58" />
        <path d="M78 134 L89 142 L100 134 L111 142 L122 134" />
        <path d="M78 148 L89 156 L100 148 L111 156 L122 148" />
        <path d="M84 162 L92 168 L100 162 L108 168 L116 162" />
        <path d="M56 112 Q62 150 82 170" />
        <path d="M144 112 Q138 150 118 170" />
      </g>
    </>
  );
}

function Earthquake() {
  // No'j / Kaban: the earth sign's curl, set in a carved square spiral.
  return (
    <>
      <rect x="28" y="28" width="144" height="144" rx="26" />
      <path
        className="cx-cut-line cx-cut-line-heavy"
        d="M58 144 V56 H144 V144 H78 V76 H124 V124 H98 V98"
        strokeLinecap="square"
      />
      <circle className="cx-cut" cx="44" cy="44" r="5" />
      <circle className="cx-cut" cx="156" cy="44" r="5" />
      <circle className="cx-cut" cx="44" cy="156" r="5" />
      <circle className="cx-cut" cx="156" cy="156" r="5" />
      <path d="M10 186 L30 178 L46 190 L66 176 L84 190 L104 178 L122 190 L142 176 L160 190 L178 178 L194 186 V196 H10 Z" />
    </>
  );
}

function Obsidian() {
  // Tijax: a knapped obsidian blade, its facets cut in paper.
  return (
    <>
      <path d="M100 10 C134 48 142 100 122 148 L100 188 L78 148 C58 100 66 48 100 10 Z" />
      <g className="cx-cut-line">
        <path d="M100 32 L112 54 L90 76 L112 98 L90 120 L108 142 L100 162" />
        <path d="M84 60 L92 70" />
        <path d="M116 64 L108 74" />
        <path d="M80 104 L90 112" />
        <path d="M120 106 L110 114" />
        <path d="M86 150 H114" />
      </g>
      <path className="cx-cut" d="M100 168 L106 178 L100 184 L94 178 Z" />
    </>
  );
}

function Storm() {
  // Kawoq: scrolling rain clouds, rain and a lightning stroke.
  return (
    <>
      <circle cx="68" cy="68" r="28" />
      <circle cx="104" cy="52" r="34" />
      <circle cx="140" cy="70" r="26" />
      <rect x="40" y="66" width="128" height="32" rx="16" />
      <g className="cx-cut-line">
        <path d="M94 56 a11 11 0 1 1 11 11 a5.5 5.5 0 1 1 -5.5 -5.5" />
        <path d="M58 72 a9 9 0 1 1 9 9 a4.5 4.5 0 1 1 -4.5 -4.5" />
        <path d="M132 76 a8 8 0 1 1 8 8 a4 4 0 1 1 -4 -4" />
      </g>
      <g className="cx-ink-line">
        <path d="M54 112 l-8 22" />
        <path d="M78 112 l-8 22" />
        <path d="M150 112 l-8 22" />
        <path d="M66 146 l-8 22" />
        <path d="M162 146 l-8 22" />
        <path d="M140 150 l-8 22" />
      </g>
      <path d="M110 104 L92 142 L108 142 L90 190 L134 128 L116 128 L128 104 Z" />
    </>
  );
}

function Sun() {
  // Ajpu: the sun, rays as carved triangles.
  const rays = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const w = Math.PI / 16;
    const p = (r: number, t: number) => `${f(100 + Math.cos(t) * r)},${f(100 + Math.sin(t) * r)}`;
    rays.push(<path key={i} d={`M${p(44, a - w)} L${p(92, a)} L${p(44, a + w)} Z`} />);
  }
  return (
    <>
      {rays}
      <circle cx="100" cy="100" r="50" />
      <circle className="cx-cut" cx="100" cy="100" r="36" />
      <circle cx="100" cy="100" r="24" />
      <circle className="cx-cut" cx="100" cy="100" r="9" />
      <g className="cx-cut-line">
        <path d="M100 56 v6 M100 138 v6 M56 100 h6 M138 100 h6" />
      </g>
    </>
  );
}

function Crocodile() {
  // Imox: the earth-crocodile floating on the primordial waters.
  const scutes = [];
  for (let x = 78; x <= 168; x += 15) {
    const y = 86 + (x - 78) * 0.12;
    scutes.push(<path key={x} d={`M${x} ${f(y + 4)} L${x + 6} ${f(y - 10)} L${x + 12} ${f(y + 4)} Z`} />);
  }
  return (
    <>
      <path d="M8 100 L68 86 C112 78 154 84 200 106 C154 118 112 126 68 122 L8 112 Z" />
      {scutes}
      <path d="M78 118 L68 144 L86 144 L92 120 Z" />
      <path d="M140 116 L150 140 L132 140 L126 118 Z" />
      <path className="cx-cut-line" d="M12 106 L18 100 L24 106 L30 100 L36 106 L42 100 L48 106 L54 100 L60 106" />
      <circle className="cx-cut" cx="72" cy="96" r="6" />
      <circle cx="73" cy="96" r="2.6" />
      <circle className="cx-cut" cx="100" cy="104" r="3.5" />
      <circle className="cx-cut" cx="118" cy="102" r="3.5" />
      <circle className="cx-cut" cx="136" cy="104" r="3.5" />
      <circle className="cx-cut" cx="154" cy="106" r="3" />
      <g className="cx-ink-line">
        <path d="M20 160 q15 -10 30 0 t30 0 t30 0 t30 0 t30 0" />
        <path d="M44 178 q15 -10 30 0 t30 0 t30 0 t30 0" />
      </g>
    </>
  );
}

const PICTOGRAMS: Record<string, () => React.ReactElement> = {
  "Tz'ikin": Eagle,
  Ajmaq: Owl,
  "No'j": Earthquake,
  Tijax: Obsidian,
  Kawoq: Storm,
  Ajpu: Sun,
  Imox: Crocodile,
};

export function hasPictogram(daySign: DaySign): boolean {
  return daySign.name in PICTOGRAMS;
}

export function Pictogram({ daySign, className }: { daySign: DaySign; className?: string }) {
  const Art = PICTOGRAMS[daySign.name];
  if (!Art) {
    // Signs not yet illustrated fall back to their glyph, in the same ink.
    const url = getGlyphPath(daySign);
    return (
      <span
        className={`${className ?? ""} cx-glyph-fallback`}
        style={{ maskImage: `url(${url})`, WebkitMaskImage: `url(${url})` }}
        role="img"
        aria-label={daySign.englishName}
      />
    );
  }
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={daySign.englishName}>
      <g fill="currentColor">
        <Art />
      </g>
    </svg>
  );
}

/* ─── Carved frieze: five stone tiles, the tone numeral at the center ── */

type TileKind = "spiral" | "pyramid" | "sun" | "scroll" | "fret";
const TILE_KINDS: TileKind[] = ["spiral", "pyramid", "sun", "scroll", "fret"];

function Tile({ kind, x }: { kind: TileKind; x: number }) {
  const t = `translate(${x} 0)`;
  switch (kind) {
    case "spiral":
      return <path transform={t} className="cx-relief-line" d="M8 33 V7 H33 V33 H14 V13 H27 V27 H20 V20" />;
    case "pyramid":
      return (
        <g transform={t}>
          <path className="cx-relief" d="M5 35 H35 V29 H31 V23 H27 V17 H24 V9 H16 V17 H13 V23 H9 V29 H5 Z" />
          <path className="cx-stone-line" d="M17 35 V17 H23 V35 M17 23 H23 M17 29 H23" />
        </g>
      );
    case "sun": {
      const rays = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const p = (r: number, d: number) => `${f(20 + Math.cos(a + d) * r)},${f(20 + Math.sin(a + d) * r)}`;
        rays.push(<path key={i} className="cx-relief" d={`M${p(9, -0.28)} L${p(16, 0)} L${p(9, 0.28)} Z`} />);
      }
      return (
        <g transform={t}>
          {rays}
          <circle className="cx-relief" cx="20" cy="20" r="9" />
          <circle className="cx-stone" cx="20" cy="20" r="4.5" />
        </g>
      );
    }
    case "scroll":
      return (
        <g transform={t} className="cx-relief-line">
          <path d="M6 33 C2 22 10 12 18 16 C24 19 20 27 15 24" />
          <path d="M34 7 C38 18 30 28 22 24 C16 21 20 13 25 16" />
        </g>
      );
    case "fret":
      return <path transform={t} className="cx-relief-line" d="M6 34 V8 H20 V22 H13 V15 M20 34 V28 H26 V22 H32 V8" />;
  }
}

function ToneTile({ n, x }: { n: number; x: number }) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const shapes = [];
  const top = 20 - (bars * 6 + (dots ? 8 : 0)) / 2;
  for (let i = 0; i < dots; i++) {
    shapes.push(<circle key={`d${i}`} className="cx-relief" cx={f(20 + (i - (dots - 1) / 2) * 7)} cy={f(top + 3)} r="2.6" />);
  }
  for (let i = 0; i < bars; i++) {
    shapes.push(<rect key={`b${i}`} className="cx-relief" x="7" y={f(top + (dots ? 8 : 0) + i * 6)} width="26" height="4" rx="1" />);
  }
  return <g transform={`translate(${x} 0)`}>{shapes}</g>;
}

export function Frieze({ kin, tone, className }: { kin: number; tone: number; className?: string }) {
  // Pick four tiles in a kin-seeded order; the day's tone sits in the middle.
  const rand = seeded(kin);
  const pool = [...TILE_KINDS];
  const picks: TileKind[] = [];
  for (let i = 0; i < 4; i++) picks.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return (
    <svg viewBox="0 0 200 48" className={className} aria-hidden focusable="false">
      <rect className="cx-stone" x="0" y="0" width="200" height="48" />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} className="cx-relief" x={i * 10 + 3} y="0" width="4" height="3" />
      ))}
      <g transform="translate(0 5)">
        <Tile kind={picks[0]} x={0} />
        <Tile kind={picks[1]} x={40} />
        <ToneTile n={tone} x={80} />
        <Tile kind={picks[2]} x={120} />
        <Tile kind={picks[3]} x={160} />
        {[40, 80, 120, 160].map((x) => (
          <rect key={x} className="cx-relief" x={x - 0.75} y="0" width="1.5" height="40" opacity="0.5" />
        ))}
      </g>
      <rect className="cx-relief" x="0" y="45" width="200" height="3" />
    </svg>
  );
}
