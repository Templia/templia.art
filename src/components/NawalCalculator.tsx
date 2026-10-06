"use client";

import { useState } from "react";
import {
  getTzolkinDate,
  getGlyphPath,
  type TzolkinDate,
} from "@/lib/tzolkin";
import {
  type Locale,
  UI_STRINGS,
  DAY_SIGN_NAMES_ES,
  THEMES_ES,
} from "@/lib/i18n";

export function NawalCalculator({ locale }: { locale: Locale }) {
  const [birthdayInput, setBirthdayInput] = useState("");
  const [computedNawal, setComputedNawal] = useState<TzolkinDate | null>(null);

  const ui = UI_STRINGS[locale];

  function getDaySignNameLocalized(englishName: string): string {
    if (locale === "es") return DAY_SIGN_NAMES_ES[englishName] || englishName;
    return `The ${englishName}`;
  }

  function getThemeLocalized(theme: string): string {
    if (locale === "es") return THEMES_ES[theme] || theme;
    return theme;
  }

  if (computedNawal) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img
            src={getGlyphPath(computedNawal.daySign)}
            alt={computedNawal.daySign.name}
            className="w-36 h-36 md:w-44 md:h-44 opacity-60"
            style={{
              filter:
                "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)",
            }}
          />
        </div>

        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text mb-2">
          {computedNawal.displayName}
        </h2>
        <p className="text-lg tracking-[0.15em] uppercase text-foreground/55 mb-4">
          {getDaySignNameLocalized(computedNawal.daySign.englishName)}
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {computedNawal.daySign.themes.map((theme) => (
            <span
              key={theme}
              className="text-sm tracking-[0.2em] uppercase px-4 py-1.5 border border-gold/20 text-gold/60 rounded-full"
            >
              {getThemeLocalized(theme)}
            </span>
          ))}
        </div>

        <div className="mayan-divider w-24 mx-auto mb-10" />

        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <p className="text-sm tracking-[0.2em] text-foreground/55">
            {ui.nawalTone} {computedNawal.tone.number} (
            {computedNawal.tone.name}) &middot; {computedNawal.tone.meaning}
          </p>
          <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-foreground/90 italic">
            {computedNawal.tone.description}
          </p>

          <div className="mayan-divider w-16 mx-auto" />

          <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-foreground/90">
            {computedNawal.daySign.description}
          </p>

          <p className="text-sm tracking-[0.2em] text-foreground/45">
            {ui.nawalElement}: {computedNawal.daySign.element} &middot;{" "}
            {ui.nawalDirection}: {computedNawal.daySign.direction}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl leading-relaxed text-foreground/90 max-w-2xl mx-auto mb-10">
        {ui.nawalExplanation}
      </p>

      <p className="text-sm tracking-[0.2em] text-foreground/55 mb-6">
        {ui.nawalCta}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (birthdayInput) {
            const date = new Date(birthdayInput + "T12:00:00");
            setComputedNawal(getTzolkinDate(date));
          }
        }}
        className="flex flex-col items-center gap-4"
      >
        <input
          type="date"
          value={birthdayInput}
          onChange={(e) => setBirthdayInput(e.target.value)}
          className="bg-background border border-gold/30 text-foreground/90 px-4 py-3 rounded-lg text-center tracking-wider focus:outline-none focus:border-gold/60 transition-colors w-56"
          required
        />
        <button
          type="submit"
          className="text-sm tracking-[0.3em] uppercase px-8 py-3 border border-gold/30 text-gold/70 rounded-full hover:bg-gold/10 hover:border-gold/50 hover:text-gold transition-all"
        >
          {ui.nawalSubmit}
        </button>
      </form>
    </div>
  );
}
