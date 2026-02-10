"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { type GuestJourney } from "@/lib/journeys";
import { getTzolkinDate, getGlyphPath, getDaySignByName } from "@/lib/tzolkin";
import { type Locale, UI_STRINGS, DAY_SIGN_NAMES_ES, THEMES_ES, formatDateShortLocale } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

function getInitialLocale(searchParams: URLSearchParams): Locale {
  const lang = searchParams.get("lang");
  if (lang === "es") return "es";
  return "en";
}

export function JourneyContent({ journey }: { journey: GuestJourney }) {
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale(searchParams));

  const ui = UI_STRINGS[locale];
  const hasEs = !!journey.es;

  // Resolve locale-specific content
  const nawal = locale === "es" && journey.es ? journey.es.nawal : journey.nawal;
  const days = locale === "es" && journey.es ? journey.es.days : journey.days;
  const integration = locale === "es" && journey.es ? journey.es.integration : journey.integration;
  const welcomeMessage = locale === "es" && journey.es?.welcomeMessage ? journey.es.welcomeMessage : journey.welcomeMessage;
  const recommendations = locale === "es" && journey.es?.recommendations ? journey.es.recommendations : journey.recommendations;

  const checkInDate = new Date(journey.checkIn + "T12:00:00");
  const checkOutDate = new Date(journey.checkOut + "T12:00:00");

  function getDaySignNameLocalized(englishName: string): string {
    if (locale === "es") return DAY_SIGN_NAMES_ES[englishName] || englishName;
    return `The ${englishName}`;
  }

  function getThemeLocalized(theme: string): string {
    if (locale === "es") return THEMES_ES[theme] || theme;
    return theme;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed]">
      {hasEs && <LanguageToggle locale={locale} onChange={setLocale} />}

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #c9a84c 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        <div className="mayan-divider-thick w-48 mb-12 animate-fade-in-up" />

        <p className="text-sm tracking-[0.4em] uppercase text-[#c9a84c]/60 mb-4 animate-fade-in-up animation-delay-200">
          {journey.locationSubtitle}
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-light tracking-wide text-center gold-gradient-text animate-fade-in-up animation-delay-400">
          {journey.locationName}
        </h1>

        <div className="my-8 text-3xl opacity-40 animate-fade-in-up animation-delay-400">✦</div>

        {journey.guestName ? (
          <>
            <p className="text-sm tracking-[0.5em] uppercase text-[#c9a84c]/50 mb-3 animate-fade-in-up animation-delay-500">
              {ui.preparedFor}
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#ededed] mb-4 animate-fade-in-up animation-delay-500">
              {journey.guestName}
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl font-light italic text-[#c9a84c]/60 mb-6 animate-fade-in-up animation-delay-600">
              {ui.subtitle}
            </p>
          </>
        ) : (
          <p className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light italic text-[#c9a84c]/80 mb-6 animate-fade-in-up animation-delay-600">
            {ui.subtitle}
          </p>
        )}

        <p className="text-sm tracking-[0.25em] uppercase text-[#ededed]/65 animate-fade-in-up animation-delay-800">
          {formatDateShortLocale(checkInDate, locale)} – {formatDateShortLocale(checkOutDate, locale)}
        </p>

        <div className="mayan-divider w-32 mt-12 animate-fade-in-up animation-delay-800" />
      </section>

      {/* ═══ WELCOME MESSAGE ═══ */}
      {welcomeMessage && (
        <section className="relative px-6 py-16 max-w-2xl mx-auto text-center space-y-6">
          {welcomeMessage.split("\n\n").map((paragraph, i) => (
            <p key={i} className="font-[family-name:var(--font-cormorant)] text-xl md:text-2xl leading-relaxed text-[#ededed]/75 italic">
              {paragraph}
            </p>
          ))}
        </section>
      )}

      {/* ═══ YOUR NAWAL SECTION ═══ */}
      <section className="relative px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.5em] uppercase text-[#c9a84c]/50 mb-6">{ui.yourNawal}</p>

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
          <p className="text-sm tracking-[0.2em] text-[#ededed]/55 mb-2">
            {nawal.toneName}
          </p>
          {nawal.birthday && (
            <p className="text-sm text-[#ededed]/45 mt-1">
              {ui.birthday}: {nawal.birthday}
            </p>
          )}
        </div>

        <div className="mayan-divider w-24 mx-auto mb-10" />

        <div className="text-center mb-8">
          <p className="font-[family-name:var(--font-cormorant)] text-2xl italic text-[#c9a84c]/70">
            {nawal.poeticTitle}
          </p>
        </div>

        <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-[#ededed]/80 text-center max-w-2xl mx-auto">
          {nawal.bodyText}
        </p>
      </section>

      {/* ═══ DAY-BY-DAY ITINERARY ═══ */}
      {days.map((day, dayIndex) => {
        const date = new Date(day.date + "T12:00:00");
        const tzolkin = getTzolkinDate(date);

        return (
          <section key={day.date} className="relative px-6 py-20">
            <div className="max-w-3xl mx-auto">
              <div className="mayan-divider-thick w-full mb-16" />

              <div className="text-center mb-12">
                <p className="text-sm tracking-[0.5em] uppercase text-[#c9a84c]/70 mb-4">
                  {ui.day} {dayIndex + 1} · {formatDateShortLocale(date, locale)}
                </p>

                <div className="flex justify-center mb-4">
                  <img
                    src={getGlyphPath(tzolkin.daySign)}
                    alt={tzolkin.daySign.name}
                    className="w-32 h-32 md:w-40 md:h-40 opacity-70"
                    style={{ filter: "invert(78%) sepia(30%) saturate(600%) hue-rotate(5deg) brightness(90%)" }}
                  />
                </div>

                <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text mb-2">
                  {tzolkin.tone.number} {tzolkin.daySign.name}
                </h2>
                <p className="text-lg tracking-[0.15em] uppercase text-[#ededed]/55 mb-4">
                  {getDaySignNameLocalized(tzolkin.daySign.englishName)}
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {tzolkin.daySign.themes.map((theme) => (
                    <span
                      key={theme}
                      className="text-sm tracking-[0.2em] uppercase px-4 py-1.5 border border-[#c9a84c]/20 text-[#c9a84c]/60 rounded-full"
                    >
                      {getThemeLocalized(theme)}
                    </span>
                  ))}
                </div>

                <p className="font-[family-name:var(--font-cormorant)] text-2xl italic text-[#c9a84c]/70 mb-6">
                  {day.title}
                </p>
              </div>

              <p className="font-[family-name:var(--font-cormorant)] text-lg leading-relaxed text-[#ededed]/75 text-center max-w-2xl mx-auto mb-14">
                {day.description}
              </p>

              <div className="space-y-8 max-w-2xl mx-auto">
                {day.activities.map((activity, actIndex) => (
                  <div key={actIndex} className="relative pl-8 border-l border-[#c9a84c]/15">
                    <div className="absolute left-0 top-1 w-2 h-2 -translate-x-[5px] rounded-full bg-[#c9a84c]/40" />
                    <p className="text-sm tracking-[0.3em] uppercase text-[#c9a84c]/50 mb-2">
                      {activity.timeOfDay}
                    </p>
                    <p className="text-[#ededed]/75 leading-relaxed">
                      {activity.activity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ INTEGRATION SECTION ═══ */}
      <section className="relative px-6 py-24 max-w-3xl mx-auto">
        <div className="mayan-divider-thick w-full mb-16" />

        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.5em] uppercase text-[#c9a84c]/40 mb-6">{ui.integration}</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light gold-gradient-text mb-4">
            {integration.title}
          </h2>
          <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#ededed]/55">
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
                <p className="text-sm text-[#ededed]/45 uppercase tracking-wider">
                  {thread.englishName}
                </p>
              </div>
              <div className="w-px bg-[#c9a84c]/20 shrink-0 self-stretch" />
              <p className="text-[#ededed]/75 leading-relaxed pt-0.5">
                {thread.summary}
              </p>
            </div>
          ))}
        </div>

        <div className="mayan-divider w-24 mx-auto mb-10" />
        <p className="font-[family-name:var(--font-cormorant)] text-xl leading-relaxed text-[#ededed]/65 text-center italic max-w-2xl mx-auto">
          {integration.closingText}
        </p>

        <div className="text-center mt-16">
          <div className="text-2xl opacity-30 mb-4">✦ ✦ ✦</div>
          <p className="text-sm tracking-[0.4em] uppercase text-[#c9a84c]/30">
            {journey.locationName}
          </p>
        </div>
      </section>

      {/* ═══ DISCOVER SECTION ═══ */}
      {recommendations && recommendations.length > 0 && (
        <section className="relative px-6 py-20 max-w-3xl mx-auto">
          <div className="mayan-divider w-24 mx-auto mb-12" />

          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.5em] uppercase text-[#c9a84c]/40 mb-6">{ui.discover}</p>
            <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#ededed]/55">
              {ui.discoverSubtitle}
            </p>
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
                        }`}
                        style={
                          rec.logo?.includes("parque-del-jaguar")
                            ? { filter: "invert(1)", mixBlendMode: "screen" as const }
                            : { mixBlendMode: "lighten" as const }
                        }
                      />
                      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl md:text-3xl font-light gold-gradient-text mb-4">
                        {rec.name}
                      </h3>
                      <p className="text-[#ededed]/75 leading-relaxed mb-3">
                        {rec.description}
                      </p>
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm tracking-[0.3em] uppercase text-[#c9a84c]/50 hover:text-[#c9a84c]/80 transition-colors border-b border-[#c9a84c]/20 hover:border-[#c9a84c]/50 pb-0.5"
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
                      <p className="text-[#ededed]/75 leading-relaxed mb-3">
                        {rec.description}
                      </p>
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-sm tracking-[0.3em] uppercase text-[#c9a84c]/50 hover:text-[#c9a84c]/80 transition-colors border-b border-[#c9a84c]/20 hover:border-[#c9a84c]/50 pb-0.5"
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
        </section>
      )}

      <footer className="px-6 py-12 text-center border-t border-[#c9a84c]/10">
        <p className="text-sm text-[#ededed]/35 tracking-[0.2em]">
          {ui.footerText}
        </p>
      </footer>
    </main>
  );
}
