export type Locale = "en" | "es";

// UI labels that don't come from journey data
export const UI_STRINGS: Record<Locale, {
  yourNawal: string;
  birthday: string;
  day: string;
  the: string;
  integration: string;
  subtitle: string;
  preparedFor: string;
  discover: string;
  discoverSubtitle: string;
  discoverIntro: string;
  discoverClosing: string;
  visitWebsite: string;
  footerText: string;
  nawalExplanation: string;
  nawalCta: string;
  nawalSubmit: string;
  nawalTone: string;
  nawalElement: string;
  nawalDirection: string;
  defaultWelcome: string;
  nights: string;
  activities: string;
}> = {
  en: {
    yourNawal: "Your Nawal",
    birthday: "Birthday",
    day: "Day",
    the: "The",
    integration: "Integration",
    subtitle: "A Tzolkin-Guided Journey",
    preparedFor: "For",
    discover: "Discover",
    discoverSubtitle: "Templia\u2019s integration into Mayan cultural preservation aligns with several initiatives in Tulum aimed at promoting Mayan heritage.",
    discoverIntro: "Nearby, two of the most significant expressions of this effort \u2014 Parque del Jaguar and the Museo Regional de la Costa Oriental \u2014 offer direct access to the land, history, and worldview that shaped this region.",
    discoverClosing: "These projects, among others, demonstrate a unified effort in Tulum to preserve and promote Mayan heritage, providing both residents and visitors with opportunities to engage deeply with the region\u2019s cultural legacy.",
    visitWebsite: "Learn more",
    footerText: "This journey is shaped by ancestral Maya knowledge\nand conveyed through the sacred timing of the Tzolk\u2019in calendar.",
    nawalExplanation: "In the Tzolk\u2019in, the 260-day sacred calendar of the Maya, each person is born under a unique combination of energy \u2014 a Nawal. Your Nawal reveals the qualities, strengths, and purpose woven into your life from the moment of your birth.",
    nawalCta: "Enter your date of birth",
    nawalSubmit: "Discover Your Nawal",
    nawalTone: "Tone",
    nawalElement: "Element",
    nawalDirection: "Direction",
    defaultWelcome: "You have arrived at Templia at a meaningful moment in your journey, {name}. It is not a coincidence. The Maya understood that every day carries its own living energy \u2014 and the days of your stay were chosen long before you were.\n\nWhat follows is a guide to the energies present during your time at Templia \u2014 a map of the influences, symbols, and intentions that accompany you while you are in the land of the Maya.",
    nights: "nights",
    activities: "Explore {day}'s activities",
  },
  es: {
    yourNawal: "Tu Nawal",
    birthday: "Cumpleaños",
    day: "Día",
    the: "El/La",
    integration: "Integración",
    subtitle: "Un Viaje Guiado por el Tzolkin",
    preparedFor: "Para",
    discover: "Descubre",
    discoverSubtitle: "La integración de Templia en la preservación cultural maya se alinea con varias iniciativas en Tulum orientadas a promover el patrimonio maya.",
    discoverIntro: "Cerca de aquí, dos de las expresiones más significativas de este esfuerzo \u2014 el Parque del Jaguar y el Museo Regional de la Costa Oriental \u2014 ofrecen acceso directo a la tierra, la historia y la cosmovisión que dieron forma a esta región.",
    discoverClosing: "Estos proyectos, entre otros, demuestran un esfuerzo unificado en Tulum por preservar y promover el patrimonio maya, brindando tanto a residentes como a visitantes oportunidades para conectar profundamente con el legado cultural de la región.",
    visitWebsite: "Conoce más",
    footerText: "Este viaje est\u00e1 moldeado por el conocimiento ancestral maya\ny transmitido a trav\u00e9s de la cadencia sagrada del calendario Tzolk\u2019in.",
    nawalExplanation: "En el Tzolk\u2019in, el calendario sagrado de 260 d\u00edas de los mayas, cada persona nace bajo una combinaci\u00f3n \u00fanica de energ\u00eda \u2014 un Nawal. Tu Nawal revela las cualidades, fortalezas y prop\u00f3sito tejidos en tu vida desde el momento de tu nacimiento.",
    nawalCta: "Ingresa tu fecha de nacimiento",
    nawalSubmit: "Descubre Tu Nawal",
    nawalTone: "Tono",
    nawalElement: "Elemento",
    nawalDirection: "Dirección",
    defaultWelcome: "Has llegado a Templia en un momento significativo de tu camino, {name}. No es una coincidencia. Los mayas entend\u00edan que cada d\u00eda lleva su propia energ\u00eda viva \u2014 y los d\u00edas de tu estad\u00eda fueron elegidos mucho antes que t\u00fa.\n\nLo que sigue es una gu\u00eda de las energ\u00edas presentes durante tu tiempo en Templia \u2014 un mapa de las influencias, s\u00edmbolos e intenciones que te acompa\u00f1an mientras est\u00e1s en la tierra de los mayas.",
    nights: "noches",
    activities: "Explora las actividades del {day}",
  },
};

// Spanish translations for day sign english names
export const DAY_SIGN_NAMES_ES: Record<string, string> = {
  "Crocodile": "El Cocodrilo",
  "Wind": "El Viento",
  "Night": "La Noche",
  "Net": "La Red",
  "Serpent": "La Serpiente",
  "Death": "La Muerte",
  "Deer": "El Venado",
  "Seed": "La Semilla",
  "Offering": "La Ofrenda",
  "Dog": "El Perro",
  "Monkey": "El Mono",
  "Road": "El Camino",
  "Reed": "La Caña",
  "Jaguar": "El Jaguar",
  "Eagle": "El Águila",
  "Owl": "El Búho",
  "Earthquake": "El Terremoto",
  "Obsidian": "La Obsidiana",
  "Storm": "La Tormenta",
  "Sun": "El Sol",
};

// Spanish translations for day sign themes
export const THEMES_ES: Record<string, string> = {
  "Primordial Waters": "Aguas Primordiales",
  "Intuition": "Intuición",
  "New Beginnings": "Nuevos Comienzos",
  "Breath of Life": "Soplo de Vida",
  "Communication": "Comunicación",
  "Spirit": "Espíritu",
  "Dawn": "Amanecer",
  "Darkness": "Oscuridad",
  "Renewal": "Renovación",
  "Abundance": "Abundancia",
  "Gathering": "Recolección",
  "Entanglement": "Enredo",
  "Life Force": "Fuerza Vital",
  "Kundalini": "Kundalini",
  "Transformation": "Transformación",
  "Ancestors": "Ancestros",
  "Rebirth": "Renacimiento",
  "Harmony": "Armonía",
  "Four Pillars": "Cuatro Pilares",
  "Nature": "Naturaleza",
  "Fertility": "Fertilidad",
  "Creation": "Creación",
  "Ripening": "Maduración",
  "Gratitude": "Gratitud",
  "Payment": "Ofrenda",
  "Sacred Fire": "Fuego Sagrado",
  "Loyalty": "Lealtad",
  "Justice": "Justicia",
  "Authority": "Autoridad",
  "Weaving": "Tejido",
  "Art": "Arte",
  "Time": "Tiempo",
  "Destiny": "Destino",
  "Path": "Sendero",
  "Travel": "Viaje",
  "Home": "Hogar",
  "Backbone": "Columna",
  "Earth Force": "Fuerza Terrestre",
  "Feminine Power": "Poder Femenino",
  "Mystery": "Misterio",
  "Vision": "Visión",
  "Freedom": "Libertad",
  "Prosperity": "Prosperidad",
  "Forgiveness": "Perdón",
  "Wisdom": "Sabiduría",
  "Knowledge": "Conocimiento",
  "Mind": "Mente",
  "Movement": "Movimiento",
  "Healing": "Sanación",
  "Cutting Away": "Cortar lo Innecesario",
  "Truth": "Verdad",
  "Purification": "Purificación",
  "Community": "Comunidad",
  "Divine Feminine": "Femenino Divino",
  "Illumination": "Iluminación",
  "Heroism": "Heroísmo",
  "Divine Wholeness": "Plenitud Divina",
};

export function formatStayRange(checkin: Date, checkout: Date, locale: Locale): string {
  const nights = Math.round((checkout.getTime() - checkin.getTime()) / 86400000);
  const nightsLabel = UI_STRINGS[locale].nights;
  const loc = locale === "es" ? "es-MX" : "en-US";
  const monthIn = checkin.toLocaleDateString(loc, { month: "short" });
  const dayIn = checkin.getDate();
  const dayOut = checkout.getDate();

  if (checkin.getMonth() === checkout.getMonth()) {
    // Same month: "4 nights · Feb 21 – 25"
    return `${nights} ${nightsLabel} · ${monthIn} ${dayIn} – ${dayOut}`;
  }
  // Different months: "4 nights · Jan 30 – Feb 3"
  const monthOut = checkout.toLocaleDateString(loc, { month: "short" });
  return `${nights} ${nightsLabel} · ${monthIn} ${dayIn} – ${monthOut} ${dayOut}`;
}

export function formatDateShortLocale(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShortMobileLocale(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
