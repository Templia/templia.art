"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { DAY_SIGNS, TONES, getTzolkinDate, getGlyphPath } from "@/lib/tzolkin";

/* ------------------------------------------------------------------ */
/*  Maya dot-bar numeral renderer (1-13)                              */
/* ------------------------------------------------------------------ */
function MayaNumeral({ n, size = 6 }: { n: number; size?: number }) {
  const bars = Math.floor(n / 5);
  const dots = n % 5;
  const barH = Math.max(2, size * 0.4);
  const barW = size * 2.4;
  const dotR = size * 0.35;
  const gap = size * 0.4;

  const totalH =
    (bars > 0 ? bars * (barH + gap) - gap : 0) +
    (dots > 0 ? dotR * 2 : 0) +
    (bars > 0 && dots > 0 ? gap : 0);

  return (
    <svg
      width={barW + 2}
      height={totalH + 2}
      viewBox={`0 0 ${barW + 2} ${totalH + 2}`}
      className="block mx-auto"
    >
      {/* Dots on top */}
      {dots > 0 &&
        Array.from({ length: dots }).map((_, i) => {
          const totalW = dots * dotR * 2 + (dots - 1) * (gap * 0.6);
          const startX = (barW + 2 - totalW) / 2 + dotR;
          return (
            <circle
              key={`d${i}`}
              cx={startX + i * (dotR * 2 + gap * 0.6)}
              cy={dotR + 1}
              r={dotR}
              fill="currentColor"
            />
          );
        })}
      {/* Bars below */}
      {Array.from({ length: bars }).map((_, i) => {
        const yOff = (dots > 0 ? dotR * 2 + gap : 0) + 1;
        return (
          <rect
            key={`b${i}`}
            x={1}
            y={yOff + i * (barH + gap)}
            width={barW}
            height={barH}
            rx={barH / 2}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Wheel segment positioned on a circle                              */
/* ------------------------------------------------------------------ */
function RingItem({
  angle,
  radius,
  children,
}: {
  angle: number; // degrees, 0 = top
  radius: number;
  children: React.ReactNode;
}) {
  const rad = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main wheel                                                        */
/* ------------------------------------------------------------------ */
export default function TzolkinWheel() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [dateInput, setDateInput] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const tzolkinDate = useMemo(
    () => getTzolkinDate(selectedDate),
    [selectedDate],
  );

  const daySignIndex = tzolkinDate.daySign.number - 1;
  const toneIndex = tzolkinDate.tone.number - 1;

  // Rotate rings so the active item sits at top (0°)
  const outerRotation = -(daySignIndex * (360 / 20));
  const innerRotation = -(toneIndex * (360 / 13));

  const handleDateChange = useCallback((value: string) => {
    setDateInput(value);
    const parsed = new Date(value + "T12:00:00");
    if (!isNaN(parsed.getTime())) setSelectedDate(parsed);
  }, []);

  const handleToday = useCallback(() => {
    const now = new Date();
    setSelectedDate(now);
    setDateInput(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    );
  }, []);

  // Ring radii – no gaps, rings touch each other
  const centerR = 80;
  const bandW = 58; // (318 - 88) / 2 / 2 ≈ 58
  const innerR = centerR + 8 + bandW; // 146 → band: 204 to 88
  const outerR = innerR + bandW + bandW; // 262 → band: 320 to 204
  const size = (outerR + bandW + 36) * 2;

  return (
    <div className="flex flex-col items-center w-full">
      {/* ── Responsive wrapper ─────────────────────────────────── */}
      <div className="w-full max-w-[700px] aspect-square relative mx-auto pointer-events-none">
        <div
          className="absolute inset-0 origin-center"
          style={{
            width: size,
            height: size,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${700 / size})`,
          }}
        >
          {/* ── Ring tracks (visual circles) ─────────────────── */}
          {/* Outer track fill */}
          <div
            className="absolute rounded-full"
            style={{ ...centered(outerR + bandW), background: "var(--color-ring-fill)" }}
          />
          {/* Inner track fill */}
          <div
            className="absolute rounded-full"
            style={{ ...centered(innerR + bandW), background: "var(--color-ring-fill)" }}
          />
          {/* Center punch-out */}
          <div
            className="absolute rounded-full"
            style={{ ...centered(innerR - bandW), background: "var(--color-background)" }}
          />

          {/* Border circles */}
          <div
            className="absolute rounded-full border-2 border-gold/20"
            style={centered(outerR + bandW)}
          />
          <div
            className="absolute rounded-full border border-gold/15"
            style={centered(outerR - bandW)}
          />
          <div
            className="absolute rounded-full border border-gold/15"
            style={centered(innerR - bandW)}
          />

          {/* ── Outer ring: 20 day signs (rotates) ───────────── */}
          <div
            className="absolute inset-0"
            style={{
              transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: `rotate(${outerRotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {DAY_SIGNS.map((ds, i) => {
              const angle = i * 18; // 360/20
              const isActive = i === daySignIndex;
              return (
                <RingItem key={ds.name} angle={angle} radius={outerR}>
                  <div
                    className="flex flex-col items-center"
                    style={{
                      // Counter-rotate so glyphs stay upright
                      transform: `rotate(${-outerRotation}deg)`,
                      transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Image
                      src={getGlyphPath(ds)}
                      alt={ds.name}
                      width={isActive ? 42 : 32}
                      height={isActive ? 42 : 32}
                      className={`block transition-all duration-500 ${
                        isActive
                          ? "drop-shadow-[0_0_10px_rgba(201,168,76,0.5)]"
                          : "opacity-60"
                      }`}
                      style={{
                        filter:
                          "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)",
                      }}
                    />
                    <span
                      className={`mt-0.5 leading-none font-[family-name:var(--font-cormorant)] whitespace-nowrap transition-all duration-500 ${
                        isActive
                          ? "text-[13px] text-gold"
                          : "text-[10px] text-gold/55"
                      }`}
                    >
                      {ds.name}
                    </span>
                  </div>
                </RingItem>
              );
            })}
          </div>

          {/* ── Inner ring: 13 tones (rotates) ───────────────── */}
          <div
            className="absolute inset-0"
            style={{
              transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: `rotate(${innerRotation}deg)`,
              transformOrigin: "center center",
            }}
          >
            {TONES.map((tone, i) => {
              const angle = i * (360 / 13);
              const isActive = i === toneIndex;
              return (
                <RingItem key={tone.number} angle={angle} radius={innerR}>
                  <div
                    className="flex flex-col items-center"
                    style={{
                      transform: `rotate(${-innerRotation}deg)`,
                      transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div
                      className={`transition-all duration-500 ${
                        isActive
                          ? "text-gold drop-shadow-[0_0_8px_rgba(201,168,76,0.4)]"
                          : "text-gold/50"
                      }`}
                    >
                      <MayaNumeral n={tone.number} size={isActive ? 18 : 13} />
                    </div>
                    <span
                      className={`mt-0.5 leading-none font-[family-name:var(--font-cormorant)] whitespace-nowrap transition-all duration-500 ${
                        isActive
                          ? "text-[16px] text-gold"
                          : "text-[13px] text-gold/45"
                      }`}
                    >
                      {tone.name}
                    </span>
                  </div>
                </RingItem>
              );
            })}
          </div>

          {/* ── Center disc ──────────────────────────────────── */}
          <div
            className="absolute rounded-full bg-background flex flex-col items-center justify-center"
            style={{
              ...centered(centerR),
              zIndex: 10,
            }}
          >
            <Image
              src={getGlyphPath(tzolkinDate.daySign)}
              alt={tzolkinDate.daySign.name}
              width={80}
              height={80}
              style={{
                filter:
                  "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)",
              }}
            />
            <p className="font-[family-name:var(--font-cormorant)] text-lg gold-gradient-text font-semibold mt-1 leading-tight">
              {tzolkinDate.displayName}
            </p>
            <p className="text-[10px] text-foreground/40 leading-tight">
              {tzolkinDate.daySign.englishName}
            </p>
          </div>

          {/* ── Top marker ───────────────────────────────────── */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ top: 6 }}
          >
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[12px] border-t-gold/70" />
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-6 relative z-10 pointer-events-auto">
        <input
          type="date"
          value={dateInput}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-obsidian border border-gold/20 text-foreground/80 text-sm px-3 py-1.5 rounded-sm focus:outline-none focus:border-gold/50"
        />
        <button
          onClick={handleToday}
          className="px-4 py-1.5 text-xs tracking-widest uppercase border border-gold/30 text-gold/70 hover:text-gold hover:border-gold/60 transition-colors rounded-sm cursor-pointer"
        >
          Today
        </button>
      </div>

      {/* ── Info panel ───────────────────────────────────────── */}
      <div className="mt-10 max-w-lg w-full text-center px-4">
        <div className="mayan-divider w-24 mx-auto mb-6" />

        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl gold-gradient-text font-light mb-1">
          {tzolkinDate.displayName}
        </h2>
        <p className="text-sm text-foreground/40 mb-4">
          {tzolkinDate.daySign.englishName} · {tzolkinDate.tone.meaning}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {tzolkinDate.daySign.themes.map((theme) => (
            <span
              key={theme}
              className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase border border-gold/20 rounded-full text-gold/60"
            >
              {theme}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs tracking-[0.2em] uppercase text-gold/40 mb-1">
            Tone {tzolkinDate.tone.number} · {tzolkinDate.tone.name}
          </p>
          <p className="text-sm text-foreground/60 leading-relaxed">
            {tzolkinDate.tone.description}
          </p>
        </div>

        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gold/40 mb-1">
            {tzolkinDate.daySign.name} · {tzolkinDate.daySign.englishName}
          </p>
          <p className="text-sm text-foreground/60 leading-relaxed">
            {tzolkinDate.daySign.description}
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-5">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/30">
              Element
            </p>
            <p className="text-sm text-foreground/50">
              {tzolkinDate.daySign.element}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/30">
              Direction
            </p>
            <p className="text-sm text-foreground/50">
              {tzolkinDate.daySign.direction}
            </p>
          </div>
        </div>

        <div className="mayan-divider w-24 mx-auto mt-8" />
      </div>
    </div>
  );
}

/* ── Helper: centered circle styles ──────────────────────────────── */
function centered(radius: number): React.CSSProperties {
  return {
    width: radius * 2,
    height: radius * 2,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  };
}
