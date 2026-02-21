"use client";

import { type Locale } from "@/lib/i18n";

export function LanguageToggle({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="fixed top-6 right-16 z-50 flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-gold/15 rounded-full px-1 py-1">
      <button
        onClick={() => onChange("en")}
        className={`text-xs tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-300 ${
          locale === "en"
            ? "bg-gold/15 text-gold"
            : "text-foreground/30 hover:text-foreground/50"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange("es")}
        className={`text-xs tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-300 ${
          locale === "es"
            ? "bg-gold/15 text-gold"
            : "text-foreground/30 hover:text-foreground/50"
        }`}
      >
        ES
      </button>
    </div>
  );
}
