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
  visitWebsite: string;
  footerText: string;
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
    discoverSubtitle: "Places that deepen your connection to this land",
    visitWebsite: "Learn more",
    footerText: "This journey is shaped by ancestral Maya knowledge and conveyed through the sacred timing of the Tzolk\u2019in calendar.",
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
    discoverSubtitle: "Lugares que profundizan tu conexión con esta tierra",
    visitWebsite: "Conoce más",
    footerText: "Este viaje est\u00e1 moldeado por el conocimiento ancestral maya y transmitido a trav\u00e9s de la cadencia sagrada del calendario Tzolk\u2019in.",
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

export function formatDateShortLocale(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "es" ? "es-MX" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
