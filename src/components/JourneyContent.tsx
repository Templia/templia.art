"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { type GuestJourney } from "@/lib/journeys";
import { getTzolkinDate, getGlyphPath, getDaySignByName, type TzolkinDate } from "@/lib/tzolkin";
import { type Locale, UI_STRINGS, DAY_SIGN_NAMES_ES, THEMES_ES, formatDateShortLocale, formatDateShortMobileLocale, formatStayRange } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

function getInitialLocale(searchParams: URLSearchParams): Locale {
  const lang = searchParams.get("lang");
  if (lang === "es") return "es";
  return "en";
}

export function JourneyContent({ journey }: { journey: GuestJourney }) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale(searchParams));

  const [birthdayInput, setBirthdayInput] = useState("");
  const [computedNawal, setComputedNawal] = useState<TzolkinDate | null>(null);

  const ui = UI_STRINGS[locale];
  const hasEs = !!journey.es;
  const hasBirthday = !!journey.nawal.birthday;

  // Resolve locale-specific content
  const nawal = locale === "es" && journey.es ? journey.es.nawal : journey.nawal;
  const days = locale === "es" && journey.es ? journey.es.days : journey.days;
  const integration = locale === "es" && journey.es ? journey.es.integration : journey.integration;
  const rawWelcome = locale === "es" && journey.es?.welcomeMessage ? journey.es.welcomeMessage : journey.welcomeMessage;
  const welcomeMessage = rawWelcome || (journey.guestName ? ui.defaultWelcome.replace(/\{name\}/g, journey.guestName) : null);
  const recommendations = locale === "es" && journey.es?.recommendations ? journey.es.recommendations : journey.recommendations;

  const checkInDate = new Date(journey.checkIn + "T12:00:00");
  const checkOutDate = new Date(journey.checkOut + "T12:00:00");
  const today = new Date().toISOString().split("T")[0];

  function getDaySignNameLocalized(englishName: string): string {
    if (locale === "es") return DAY_SIGN_NAMES_ES[englishName] || englishName;
    return `The ${englishName}`;
  }

  function getThemeLocalized(theme: string): string {
    if (locale === "es") return THEMES_ES[theme] || theme;
    return theme;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {hasEs && <LanguageToggle locale={locale} onChange={setLocale} />}

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, var(--color-gold) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        <div className="mayan-divider-thick w-48 mb-12 animate-fade-in-up" />

        <p className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase text-gold/35 mb-4 animate-fade-in-up animation-delay-200">
          {journey.locationSubtitle}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-medium tracking-wide text-center gold-gradient-text animate-fade-in-up animation-delay-400">
          {journey.locationName}
        </h1>

        <div className="my-8 text-3xl opacity-40 animate-fade-in-up animation-delay-400">✦</div>

        {journey.guestName ? (
          <>
            <p className="text-sm tracking-[0.5em] uppercase text-gold/50 mb-3 animate-fade-in-up animation-delay-500">
              {ui.preparedFor}
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-foreground mb-4 animate-fade-in-up animation-delay-500">
              {journey.guestName}
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-light italic text-gold/60 mb-6 animate-fade-in-up animation-delay-600">
              {ui.subtitle}
            </p>
          </>
        ) : (
          <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light italic text-gold/80 mb-6 animate-fade-in-up animation-delay-600">
            {ui.subtitle}
          </p>
        )}

        <p className="text-sm tracking-[0.25em] uppercase text-foreground/80 animate-fade-in-up animation-delay-800">
          {formatStayRange(checkInDate, checkOutDate, locale)}
        </p>

        <div className="mayan-divider w-32 mt-12 animate-fade-in-up animation-delay-800" />
      </section>

      {/* ═══ WELCOME MESSAGE ═══ */}
      {welcomeMessage && (
        <section className="relative px-6 py-16 max-w-2xl mx-auto text-center space-y-6">
          {welcomeMessage.split("\n\n").map((paragraph, i) => (
            <p key={i} className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl leading-relaxed text-foreground/90 italic">
              {paragraph}
            </p>
          ))}
        </section>
      )}

      {/* ═══ YOUR NAWAL SECTION (only if birthday provided) ═══ */}
      {hasBirthday && (
        <section className="relative px-6 py-20 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl tracking-[0.15em] uppercase text-gold/70">{ui.yourNawal}</h2>
              <p className="font-[family-name:var(--font-cormorant)] text-base md:text-lg tracking-[0.15em] text-gold/50 mt-1">{ui.yourNawalAlt}</p>
            </div>

            {(() => {
              const nawalNameRaw = journey.nawal.displayName.split("·")[0].trim().split(" ").slice(1).join(" ").replace(/\u2019/g, "'");
              const nawalSign = getDaySignByName(nawalNameRaw);
              if (nawalSign) return (
                <div className="flex justify-center mb-6">
                  <img
                    src={getGlyphPath(nawalSign)}
                    alt={nawalSign.name}
                    className="w-36 h-36 md:w-44 md:h-44 opacity-60"
                    style={{ filter: "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)" }}
                  />
                </div>
              );
              return null;
            })()}

            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text mb-4">
              {nawal.displayName}
            </h2>
            <p className="text-sm tracking-[0.2em] text-foreground/55 mb-2">
              {nawal.toneName}
            </p>
            {nawal.birthday && (
              <p className="text-sm text-foreground/45 mt-1">
                {ui.birthday}: {nawal.birthday}
              </p>
            )}
          </div>

          <div className="mayan-divider w-24 mx-auto mb-10" />

          <div className="text-center mb-8">
            <p className="font-[family-name:var(--font-cormorant)] text-2xl italic text-gold/70">
              {nawal.poeticTitle}
            </p>
          </div>

          <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-foreground/90 text-center max-w-2xl mx-auto">
            {nawal.bodyText}
          </p>
        </section>
      )}

      {/* ═══ DAY-BY-DAY ITINERARY ═══ */}
      {days.map((day, dayIndex) => {
        const date = new Date(day.date + "T12:00:00");
        const tzolkin = getTzolkinDate(date);

        return (
          <section key={day.date} className="relative px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="mayan-divider-thick w-full mb-16" />

              <div className="text-center mb-12">
                <p className="text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase text-gold/70 mb-1">
                  {ui.day} {dayIndex + 1}
                </p>
                <p className="text-xs md:text-sm tracking-[0.3em] md:tracking-[0.5em] uppercase text-gold/50 mb-4">
                  {formatDateShortLocale(date, locale)}
                </p>

                <div className="flex items-center justify-center gap-6 md:gap-8 mb-4">
                  <img
                    src={getGlyphPath(tzolkin.daySign)}
                    alt={tzolkin.daySign.name}
                    className="w-48 h-48 md:w-64 md:h-64 opacity-70 shrink-0"
                    style={{ filter: "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)" }}
                  />
                  <div className="text-left">
                    <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text mb-1">
                      {tzolkin.tone.number} {tzolkin.daySign.name}
                    </h2>
                    <p className="text-lg tracking-[0.15em] uppercase text-foreground/55">
                      {getDaySignNameLocalized(tzolkin.daySign.englishName)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {tzolkin.daySign.themes.map((theme) => (
                    <span
                      key={theme}
                      className="text-sm tracking-[0.2em] uppercase px-4 py-1.5 border border-gold/20 text-gold/60 rounded-full"
                    >
                      {getThemeLocalized(theme)}
                    </span>
                  ))}
                </div>

                <p className="font-[family-name:var(--font-cormorant)] text-2xl italic text-gold/70 mb-6">
                  {day.title}
                </p>
              </div>

              <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-foreground/90 text-center max-w-2xl mx-auto mb-14">
                {day.description}
              </p>

              <details open={day.date === today || undefined} className="group max-w-2xl mx-auto">
                <summary className="cursor-pointer list-none flex items-center justify-center gap-3 py-4 select-none border border-gold/20 rounded-full px-6 hover:border-gold/40 transition-colors">
                  <svg className="w-3 h-3 text-gold/50 transition-transform group-open:rotate-90 shrink-0" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M4 2l4 4-4 4z" />
                  </svg>
                  <span className="text-sm tracking-[0.2em] uppercase text-gold/60">
                    {ui.activities.replace(/\{day\}/g, date.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", { weekday: "long" }))}
                  </span>
                </summary>
                <div className="space-y-8 mt-4">
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="relative pl-8 border-l border-gold/15">
                      <div className="absolute left-0 top-1 w-2 h-2 -translate-x-[5px] rounded-full bg-gold/40" />
                      <p className="text-sm tracking-[0.3em] uppercase text-gold/50 mb-2">
                        {activity.timeOfDay}
                      </p>
                      <p className="text-foreground/90 leading-relaxed">
                        {activity.activity}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </section>
        );
      })}

      {/* ═══ INTEGRATION SECTION ═══ */}
      <section className="relative px-6 py-24 max-w-3xl mx-auto">
        <div className="mayan-divider-thick w-full mb-16" />

        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.5em] uppercase text-gold/40 mb-6">{ui.integration}</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text mb-4">
            {integration.title}
          </h2>
          <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-foreground/55">
            {integration.bodyText}
          </p>
        </div>

        <div className="space-y-8 mb-16">
          {integration.dayThreads.map((thread, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="shrink-0 w-28 text-right">
                <p className="font-[family-name:var(--font-cormorant)] text-lg font-medium gold-gradient-text">
                  {thread.displayName}
                </p>
                <p className="text-sm text-foreground/45 uppercase tracking-wider">
                  {thread.englishName}
                </p>
              </div>
              <div className="w-px bg-gold/20 shrink-0 self-stretch" />
              <p className="text-foreground/90 leading-relaxed pt-0.5">
                {thread.summary}
              </p>
            </div>
          ))}
        </div>

        <div className="mayan-divider w-24 mx-auto mb-10" />
        <p className="font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-foreground/80 text-center italic max-w-2xl mx-auto">
          {integration.closingText}
        </p>

        <div className="text-center mt-16">
          <div className="text-2xl opacity-30 mb-4">✦ ✦ ✦</div>
          <p className="text-sm tracking-[0.4em] uppercase text-gold/30">
            {journey.locationName}
          </p>
        </div>
      </section>

      {/* ═══ NAWAL CTA SECTION (only if no birthday) ═══ */}
      {!hasBirthday && (
        <section className="relative px-6 py-20 max-w-3xl mx-auto">
          <div className="mayan-divider-thick w-full mb-16" />

          <div className="text-center mb-12">
            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl tracking-[0.15em] uppercase text-gold/70">{ui.yourNawal}</h2>
              <p className="font-[family-name:var(--font-cormorant)] text-base md:text-lg tracking-[0.15em] text-gold/50 mt-1">{ui.yourNawalAlt}</p>
            </div>

            {!computedNawal ? (
              <>
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
              </>
            ) : (
              <>
                <div className="flex justify-center mb-6">
                  <img
                    src={getGlyphPath(computedNawal.daySign)}
                    alt={computedNawal.daySign.name}
                    className="w-36 h-36 md:w-44 md:h-44 opacity-60"
                    style={{ filter: "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)" }}
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
                    {ui.nawalTone} {computedNawal.tone.number} ({computedNawal.tone.name}) · {computedNawal.tone.meaning}
                  </p>
                  <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-foreground/90 italic">
                    {computedNawal.tone.description}
                  </p>

                  <div className="mayan-divider w-16 mx-auto" />

                  <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-foreground/90">
                    {computedNawal.daySign.description}
                  </p>

                  <p className="text-sm tracking-[0.2em] text-foreground/45">
                    {ui.nawalElement}: {computedNawal.daySign.element} · {ui.nawalDirection}: {computedNawal.daySign.direction}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ═══ DISCOVER SECTION ═══ */}
      {recommendations && recommendations.length > 0 && (
        <section className="relative px-6 py-12 max-w-3xl mx-auto">
          <div className="mayan-divider-thick w-full mb-12" />

          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.5em] uppercase text-gold/40 mb-6">{ui.discover}</p>
          </div>

          <div className="max-w-2xl mx-auto mb-14 space-y-6">
            <p className="text-foreground/90 leading-relaxed">
              {ui.discoverSubtitle}
            </p>
            {ui.discoverIntro && (
              <p className="text-foreground/90 leading-relaxed">
                {ui.discoverIntro}
              </p>
            )}
          </div>

          <div className="space-y-16">
            {recommendations.map((rec, i) => {
              const pos = rec.logoPosition || "left";
              const hasLogo = !!rec.logo;

              return (
                <div key={i} className="max-w-2xl mx-auto">
                  {hasLogo ? (
                    <div className="overflow-hidden">
                      <img
                        src={`/logos/${rec.logo}`}
                        alt={rec.name}
                        className={`w-28 md:w-36 h-auto opacity-80 mb-2 ${
                          pos === "right"
                            ? "float-right ml-6 md:ml-8"
                            : "float-left mr-6 md:mr-8"
                        } ${
                          rec.logo?.includes("parque-del-jaguar")
                            ? "logo-screen"
                            : "logo-lighten"
                        }`}
                        style={
                          rec.logo?.includes("parque-del-jaguar")
                            ? { filter: "invert(1)" }
                            : {}
                        }
                      />
                      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-4">
                        {rec.name}
                      </h3>
                      <p className="text-foreground/90 leading-relaxed mb-3">
                        {rec.description}
                      </p>
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm tracking-[0.3em] uppercase text-gold/50 hover:text-gold/80 transition-colors border-b border-gold/20 hover:border-gold/50 pb-0.5"
                        >
                          {ui.visitWebsite} →
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-4">
                        {rec.name}
                      </h3>
                      <p className="text-foreground/90 leading-relaxed mb-3">
                        {rec.description}
                      </p>
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm tracking-[0.3em] uppercase text-gold/50 hover:text-gold/80 transition-colors border-b border-gold/20 hover:border-gold/50 pb-0.5"
                        >
                          {ui.visitWebsite} →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto mt-14">
            <blockquote className="border-l-2 border-gold/30 pl-6">
              <p className="font-[family-name:var(--font-cormorant)] text-lg md:text-xl italic text-foreground/80 leading-relaxed">
                {ui.discoverClosing}
              </p>
            </blockquote>
          </div>
        </section>
      )}

      <footer className="px-6 py-12 border-t border-gold/10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 max-w-3xl mx-auto">
          <div className="flex flex-row gap-5 shrink-0">
          <a
            href="https://www.instagram.com/templia.art/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/40 hover:text-gold/70 transition-colors"
            aria-label="Instagram"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <a
            href="https://stay.templia.art"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/40 hover:text-gold/70 transition-colors"
            aria-label="Airbnb"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 448 512">
              <path d="M224 373.12c-25.24-31.67-40.08-59.43-45-83.18-22.55-88 112.61-88 90.06 0-5.45 24.25-20.29 52-45 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.43-89.11-41.06-71.3-91.09 15.1-39.16 111.72-231.18 115.87-241.56 15.75-30.07 25.56-57.4 59.38-57.4 32.34 0 43.4 25.94 60.37 59.87 36 70.62 89.35 177.48 114.84 239.09 13.17 33.07-1.37 71.29-37.01 86.64zm47-136.12C280.27 35.93 273.13 32 224 32c-45.52 0-64.87 31.67-84.66 72.79C33.18 317.1 22.89 347.19 22 349.81-3.22 419.14 48.74 480 111.63 480c21.71 0 60.61-6.06 112.37-62.4 58.68 63.78 101.26 62.4 112.37 62.4 62.89.05 114.85-60.86 89.61-130.19.02-3.89-16.82-38.9-16.82-39.58z"/>
            </svg>
          </a>
          <a
            href="https://wa.me/525565429950"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/40 hover:text-[#25D366]/70 transition-colors"
            aria-label="WhatsApp Concierge"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 448 512">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
          </a>
          </div>
          <p className="text-sm text-foreground/35 tracking-[0.2em] text-left leading-relaxed">
            {ui.footerText.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        </div>
      </footer>
    </main>
  );
}
