// Tzolkin Calendar Engine
// The Tzolkin is a 260-day sacred calendar cycle consisting of 20 day signs × 13 tones

export interface DaySign {
  number: number; // 1-20
  name: string; // Mayan name
  englishName: string;
  glyph: string; // Unicode/emoji fallback
  svgFile: string; // SVG glyph filename in /public/glyphs/
  themes: string[];
  element: string;
  direction: string;
  description: string;
}

export interface Tone {
  number: number; // 1-13
  name: string; // Mayan name
  meaning: string;
  description: string;
}

export interface TzolkinDate {
  tone: Tone;
  daySign: DaySign;
  displayName: string; // e.g. "6 Kawoq"
}

export const DAY_SIGNS: DaySign[] = [
  {
    number: 1, name: "Imox", englishName: "Crocodile", glyph: "🐊", svgFile: "imox.svg",
    themes: ["Primordial Waters", "Intuition", "New Beginnings"],
    element: "Water", direction: "East",
    description: "Imox is the first day sign — the cosmic womb, the primordial waters from which all creation emerges. It governs intuition, the dream world, and the unconscious mind."
  },
  {
    number: 2, name: "Iq'", englishName: "Wind", glyph: "🌬️", svgFile: "iq.svg",
    themes: ["Breath of Life", "Communication", "Spirit"],
    element: "Air", direction: "North",
    description: "Iq' is the breath of life, the invisible force that moves through all things. It governs communication, inspiration, and the connection between the physical and spiritual worlds."
  },
  {
    number: 3, name: "Aq'ab'al", englishName: "Night", glyph: "🌑", svgFile: "aqabal.svg",
    themes: ["Dawn", "Darkness", "Renewal"],
    element: "Earth", direction: "West",
    description: "Aq'ab'al is the threshold between darkness and light, the moment before dawn. It governs renewal, inner reflection, and the courage to face the unknown."
  },
  {
    number: 4, name: "K'at", englishName: "Net", glyph: "🕸️", svgFile: "kat.svg",
    themes: ["Abundance", "Gathering", "Entanglement"],
    element: "Fire", direction: "South",
    description: "K'at is the sacred net that holds together all that we gather — blessings, memories, and lessons. It governs abundance but also warns of entanglement."
  },
  {
    number: 5, name: "Kan", englishName: "Serpent", glyph: "🐍", svgFile: "kan.svg",
    themes: ["Life Force", "Kundalini", "Transformation"],
    element: "Water", direction: "East",
    description: "Kan is the feathered serpent, Kukulkan — raw life force energy rising through the body. It governs vitality, sensuality, and the power of transformation."
  },
  {
    number: 6, name: "Kame", englishName: "Death", glyph: "💀", svgFile: "kame.svg",
    themes: ["Transformation", "Ancestors", "Rebirth"],
    element: "Air", direction: "North",
    description: "Kame is the sacred transformer — not an ending but a passage. It governs ancestral connection, the wisdom of letting go, and the rebirth that follows release."
  },
  {
    number: 7, name: "Kej", englishName: "Deer", glyph: "🦌", svgFile: "kej.svg",
    themes: ["Harmony", "Four Pillars", "Nature"],
    element: "Earth", direction: "West",
    description: "Kej is the deer, guardian of the four pillars that hold up the sky. It governs harmony with nature, leadership through grace, and the strength of gentleness."
  },
  {
    number: 8, name: "Q'anil", englishName: "Seed", glyph: "🌱", svgFile: "qanil.svg",
    themes: ["Fertility", "Creation", "Ripening"],
    element: "Fire", direction: "South",
    description: "Q'anil is the seed of life, the promise of harvest. It governs fertility, new projects, and the patient trust that what is planted will bloom."
  },
  {
    number: 9, name: "Toj", englishName: "Offering", glyph: "🔥", svgFile: "toj.svg",
    themes: ["Gratitude", "Payment", "Sacred Fire"],
    element: "Water", direction: "East",
    description: "Toj is the sacred offering, the fire ceremony. It governs gratitude, reciprocity with the cosmos, and the understanding that giving is the path to receiving."
  },
  {
    number: 10, name: "Tz'i'", englishName: "Dog", glyph: "🐕", svgFile: "tzi.svg",
    themes: ["Loyalty", "Justice", "Authority"],
    element: "Air", direction: "North",
    description: "Tz'i' is the faithful companion, guardian of justice and truth. It governs loyalty, the law of cause and effect, and the authority that comes from integrity."
  },
  {
    number: 11, name: "B'atz'", englishName: "Monkey", glyph: "🐒", svgFile: "batz.svg",
    themes: ["Weaving", "Art", "Time"],
    element: "Earth", direction: "West",
    description: "B'atz' is the cosmic weaver, the thread of time itself. It governs creativity, artistic expression, and the understanding that all of life is a tapestry being woven."
  },
  {
    number: 12, name: "E", englishName: "Road", glyph: "🛤️", svgFile: "e.svg",
    themes: ["Destiny", "Path", "Travel"],
    element: "Fire", direction: "South",
    description: "E is the sacred road, the path of destiny. It governs journeys both physical and spiritual, the courage to walk your path, and the guidance found along the way."
  },
  {
    number: 13, name: "Aj", englishName: "Reed", glyph: "🎋", svgFile: "aj.svg",
    themes: ["Home", "Authority", "Backbone"],
    element: "Water", direction: "East",
    description: "Aj is the reed, the backbone of the home and community. It governs domestic harmony, structural strength, and the authority that comes from standing tall."
  },
  {
    number: 14, name: "Ix", englishName: "Jaguar", glyph: "🐆", svgFile: "ix.svg",
    themes: ["Earth Force", "Feminine Power", "Mystery"],
    element: "Air", direction: "North",
    description: "Ix is the jaguar, the feminine power of the Earth. It governs the mysteries of nature, shamanic vision, and the deep intuitive wisdom of the wild."
  },
  {
    number: 15, name: "Tz'ikin", englishName: "Eagle", glyph: "🦅", svgFile: "tzikin.svg",
    themes: ["Vision", "Freedom", "Prosperity"],
    element: "Earth", direction: "West",
    description: "Tz'ikin is the eagle, the intermediary between heaven and earth. It governs expansive vision, spiritual freedom, and the abundance that comes from seeing the whole picture."
  },
  {
    number: 16, name: "Ajmaq", englishName: "Owl", glyph: "🦉", svgFile: "ajmaq.svg",
    themes: ["Forgiveness", "Wisdom", "Ancestors"],
    element: "Fire", direction: "South",
    description: "Ajmaq is the owl, keeper of ancestral wisdom. It governs forgiveness, the courage to face our shadow, and the deep wisdom that emerges from honest self-reflection."
  },
  {
    number: 17, name: "No'j", englishName: "Earthquake", glyph: "🧠", svgFile: "noj.svg",
    themes: ["Knowledge", "Mind", "Movement"],
    element: "Water", direction: "East",
    description: "No'j is the earthquake, the movement of thought. It governs the mind, knowledge, intellectual pursuit, and the understanding that true wisdom shakes the foundations."
  },
  {
    number: 18, name: "Tijax", englishName: "Obsidian", glyph: "🗡️", svgFile: "tijax.svg",
    themes: ["Healing", "Cutting Away", "Truth"],
    element: "Air", direction: "North",
    description: "Tijax is the obsidian blade, the healer's knife. It governs the power to cut away what no longer serves, truth that heals, and the precision of sacred medicine."
  },
  {
    number: 19, name: "Kawoq", englishName: "Storm", glyph: "⛈️", svgFile: "kawoq.svg",
    themes: ["Purification", "Community", "Divine Feminine"],
    element: "Earth", direction: "West",
    description: "Kawoq is the storm that purifies, the voice of the Divine Feminine. It governs community, fertility of the land, and the cleansing power that prepares new ground."
  },
  {
    number: 20, name: "Ajpu", englishName: "Sun", glyph: "☀️", svgFile: "ajpu.svg",
    themes: ["Illumination", "Heroism", "Divine Wholeness"],
    element: "Fire", direction: "South",
    description: "Ajpu is the Sun, the Lord of Light, the final day sign of the Tzolkin. It governs illumination, the hero's journey, and the divine wholeness that lives within each of us."
  },
];

export const TONES: Tone[] = [
  { number: 1, name: "Jun", meaning: "Unity", description: "The beginning, the point of origin. Pure potential, undivided wholeness." },
  { number: 2, name: "Ka'", meaning: "Duality", description: "The creative tension of opposites. Polarity, balance, and the dance of complementary forces." },
  { number: 3, name: "Ox", meaning: "Action", description: "The catalyst of movement. Rhythm, communication, and the spark that sets things in motion." },
  { number: 4, name: "Kaj", meaning: "Stability", description: "The four pillars, the four directions. Structure, form, and the foundation upon which all is built." },
  { number: 5, name: "Jo'", meaning: "Empowerment", description: "The center point. Taking command, empowerment, and the peak of the first wave." },
  { number: 6, name: "Waq", meaning: "Flow", description: "Organic flow and dynamic equilibrium. Stability in motion, the rhythm of give and receive." },
  { number: 7, name: "Wuq", meaning: "Mystical Center", description: "The mystic column, the center of the Tzolkin. Reflection, purpose, and the portal between worlds." },
  { number: 8, name: "Wajxaq", meaning: "Harmony", description: "Harmony, abundance, and integration. The number of justice, balance achieved through wholeness." },
  { number: 9, name: "B'elej", meaning: "Patience", description: "The completion of cycles, perseverance. Greater patience brings greater realization." },
  { number: 10, name: "Lajuj", meaning: "Manifestation", description: "Manifestation in the material world. Challenge met, intention made real." },
  { number: 11, name: "Jun Lajuj", meaning: "Resolution", description: "Dissolution and resolution. Simplification, letting go of what is not essential." },
  { number: 12, name: "Ka' Lajuj", meaning: "Understanding", description: "Complex understanding, shared knowledge. Community wisdom and collective purpose." },
  { number: 13, name: "Oxlajuj", meaning: "Transcendence", description: "The highest tone. Cosmic completion, ascension, and the doorway to the next cycle." },
];

// Reference date: We need a known Tzolkin date to calculate from.
// February 10, 2026 = 6 Kawoq (from the PPTX)
// Day sign index: Kawoq = 19 (1-based), Tone = 6
// We'll use this as our anchor point.
const REFERENCE_DATE = new Date(2026, 1, 10); // Feb 10, 2026
const REFERENCE_TONE = 6;       // Tone 6
const REFERENCE_DAY_SIGN = 19;  // Kawoq (19th of 20)

function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function getTzolkinDate(date: Date): TzolkinDate {
  const diff = daysBetween(REFERENCE_DATE, date);

  // Tone cycles every 13 days (1-based, so we use 0-based internally)
  const toneIndex = mod((REFERENCE_TONE - 1) + diff, 13);
  const tone = TONES[toneIndex];

  // Day sign cycles every 20 days (1-based, so we use 0-based internally)
  const daySignIndex = mod((REFERENCE_DAY_SIGN - 1) + diff, 20);
  const daySign = DAY_SIGNS[daySignIndex];

  return {
    tone,
    daySign,
    displayName: `${tone.number} ${daySign.name}`,
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getGlyphPath(daySign: DaySign): string {
  return `/glyphs/${daySign.svgFile}`;
}

export function getDaySignByName(name: string): DaySign | undefined {
  return DAY_SIGNS.find((ds) => ds.name.toLowerCase() === name.toLowerCase());
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
