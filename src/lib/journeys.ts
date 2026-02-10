// Guest Journey Configuration System
// Each guest stay is defined here. To create a new journey:
// 1. Add a new entry to the JOURNEYS object
// 2. The key becomes the URL slug (e.g., "2026-02-10-to-2026-02-12")
// 3. Fill in guest details, nawal, and day-by-day activities

export interface DayActivity {
  timeOfDay: string;
  activity: string;
}

export interface JourneyDay {
  date: string;
  title: string;
  description: string;
  activities: DayActivity[];
}

export interface GuestNawal {
  displayName: string;
  toneName: string;
  toneDescription: string;
  daySignDescription: string;
  birthday?: string;
  poeticTitle: string;
  bodyText: string;
}

export interface JourneyIntegration {
  title: string;
  bodyText: string;
  dayThreads: { displayName: string; englishName: string; summary: string }[];
  closingText: string;
}

export interface Recommendation {
  name: string;
  description: string;
  url?: string;
}

export interface GuestJourney {
  guestName?: string;
  locationName: string;
  locationSubtitle: string;
  checkIn: string;
  checkOut: string;
  welcomeMessage?: string;
  nawal: GuestNawal;
  days: JourneyDay[];
  integration: JourneyIntegration;
  recommendations?: Recommendation[];
  // Spanish translations
  es?: {
    welcomeMessage?: string;
    nawal: GuestNawal;
    days: JourneyDay[];
    integration: JourneyIntegration;
    recommendations?: Recommendation[];
  };
}

import { loadAllGuests } from "./parse-guest";

// Journeys loaded from guests/*.md files at build time
const GUEST_JOURNEYS = loadAllGuests();

// Hardcoded fallback (kept for reference — .md files take priority)
const HARDCODED_JOURNEYS: Record<string, GuestJourney> = {
  "2026-02-10-to-2026-02-12": {
    guestName: "Galii",
    locationName: "Templia Art",
    locationSubtitle: "Aldea Zama",
    checkIn: "2026-02-10",
    checkOut: "2026-02-12",
    welcomeMessage: "You have arrived at Templia at a meaningful moment in your journey, Galii. It is not a coincidence. The Maya understood that every day carries its own living energy — and the days of your stay were chosen long before you were.\n\nWhat follows is a guide to the energies present during your time at Templia — a map of the influences, symbols, and intentions that accompany you while you are in the land of the Maya.",
    nawal: {
      displayName: "1 Iq' · Wind",
      toneName: "Tone 1 (Jun) · The Breath of Life",
      toneDescription: "Unity — the beginning, the point of origin. Pure potential, undivided wholeness.",
      daySignDescription: "Iq' is the Wind — the invisible breath that moves through all things, the communication between worlds, the spirit made audible in rustling leaves and sudden gusts.",
      birthday: "August 20, 1994",
      poeticTitle: "The Breath That Guides You",
      bodyText: "Your nawal, 1 Iq', carries the energy of pure origin meeting the breath of life. Wind is the messenger — it carries prayers upward, scatters seeds across the earth, and whispers truths that the rational mind cannot hear. Throughout your journey at Templia, notice the wind. When it touches your skin, pause. It is speaking to you.",
    },
    days: [
      {
        date: "2026-02-10",
        title: "Arrival & Purification",
        description: "Kawoq channels the Divine Feminine — the storm that washes clean, the rain that nourishes new growth. The number 6 (Waq) brings stability and flow, a gentle equilibrium between releasing what you carried and opening to what awaits.",
        activities: [
          { timeOfDay: "Late Afternoon", activity: "Arrive at Templia. Walk the jungle garden barefoot, letting the earth receive the weight of your travel. Sit by the Mayan firepit and listen to the sounds of the jungle settling into evening." },
          { timeOfDay: "Evening", activity: "Dinner in Aldea Zama — Mamazul Mezcalería for ceremonial mezcal and contemporary Mexican cuisine, ARCA for wood-fired dishes and natural wine, or Safari Comedor Zama for jungle-set dining." },
          { timeOfDay: "Night", activity: "Steam shower ritual at Templia. Let the water carry away anything you no longer need. Before sleep, set a single intention for your stay. Keep a dream journal by your bed — tomorrow's sign will listen." },
        ],
      },
      {
        date: "2026-02-11",
        title: "Illumination & Heroism",
        description: "Ajpu is the final day sign of the Tzolkin — the Lord, the Sun, the Hero who has walked through all twenty faces of creation and emerged whole. The number 7 (Wuq) is the mystical center, the column of light at the heart of the sacred calendar. This is the core of your journey.",
        activities: [
          { timeOfDay: "Sunrise", activity: "Rise before dawn. Stand facing east and take seven deep breaths — one for each level of the heavens. Nourish yourself with a slow, intentional breakfast." },
          { timeOfDay: "Morning", activity: "Tulum Ruins — El Castillo at dawn. This clifftop temple was called Zama, meaning \"dawn.\" Walk slowly among the structures, honoring the ancestors who built a solar temple where the first light touches the continent." },
          { timeOfDay: "Midday", activity: "Sacred cenote swim — Gran Cenote or Cenote Calavera. Descend into the earth's memory. The Maya believed cenotes were portals to Xibalba, the underworld where the Hero Twins proved their light could survive the darkness." },
          { timeOfDay: "Afternoon", activity: "Cacao ceremony or Temazcal sweat lodge. Let the heart-opening medicine of ceremonial cacao guide your afternoon, or enter the womb of the Temazcal to be reborn through fire, stone, and prayer." },
          { timeOfDay: "Evening", activity: "Light the Mayan firepit at Templia. Reflect by the flames on what the day illuminated. Cook an intentional meal — simple, nourishing, prepared with presence." },
        ],
      },
      {
        date: "2026-02-12",
        title: "Primordial Waters & Departure",
        description: "Imox is the first day sign — the cosmic womb, the primordial waters from which all creation emerges. On your final morning, you return to the beginning. The number 8 (Wajxaq) brings harmony and abundance — a sense that everything received is enough, and more than enough.",
        activities: [
          { timeOfDay: "Early Morning", activity: "Write down your dreams immediately upon waking. Imox is the day sign most deeply connected to the dream world — whatever visited you in the night carries a message." },
          { timeOfDay: "Water Ritual", activity: "Step into Templia's pool, or simply hold water in both hands. Thank the land, the cenotes, and the sea for holding space for your transformation. Let the water receive one final offering of gratitude." },
          { timeOfDay: "Departure", activity: "Light breakfast, pack with intention. Before you leave, stand once more in Templia's double-height living space. Look up at where the jungle canopy meets the architecture. Carry this threshold with you." },
        ],
      },
    ],
    integration: {
      title: "The Thread of Wind",
      bodyText: "How the energies wove through your journey",
      dayThreads: [
        {
          displayName: "6 Kawoq",
          englishName: "The Storm",
          summary: "Cleansed and prepared you, washing away what you carried from home. The Divine Feminine held space for your arrival.",
        },
        {
          displayName: "7 Ajpu",
          englishName: "The Sun",
          summary: "Illuminated the core of your journey — sacred sites, waters, fire — and asked you to meet your own light at the mystical center.",
        },
        {
          displayName: "8 Imox",
          englishName: "The Crocodile",
          summary: "Gathered everything into the primordial waters of intuition, sending you forward with deeper trust in what you cannot see.",
        },
      ],
      closingText: "Through it all, your nawal 1 Iq' (Wind) was the invisible thread — the breath connecting each moment, the unseen force that makes the jungle sway. You arrived on Storm, were illuminated by Sun, and departed through the Primordial Waters. The Wind carried you through every passage.",
    },
    es: {
      welcomeMessage: "Has llegado a Templia en un momento significativo de tu camino, Galii. No es una coincidencia. Los mayas entendían que cada día lleva su propia energía viva — y los días de tu estadía fueron elegidos mucho antes que tú.\n\nLo que sigue es una guía de las energías presentes durante tu tiempo en Templia — un mapa de las influencias, símbolos e intenciones que te acompañan mientras estás en la tierra de los mayas.",
      nawal: {
        displayName: "1 Iq' · Viento",
        toneName: "Tono 1 (Jun) · El Soplo de Vida",
        toneDescription: "Unidad — el comienzo, el punto de origen. Potencial puro, totalidad indivisa.",
        daySignDescription: "Iq' es el Viento — el soplo invisible que se mueve a través de todas las cosas, la comunicación entre mundos, el espíritu hecho audible en el susurro de las hojas y las ráfagas repentinas.",
        birthday: "20 de agosto de 1994",
        poeticTitle: "El Aliento Que Te Guía",
        bodyText: "Tu nawal, 1 Iq', lleva la energía del origen puro encontrándose con el soplo de vida. El Viento es el mensajero — lleva las plegarias hacia lo alto, esparce semillas por la tierra y susurra verdades que la mente racional no puede escuchar. A lo largo de tu viaje en Templia, observa el viento. Cuando toque tu piel, haz una pausa. Te está hablando.",
      },
      days: [
        {
          date: "2026-02-10",
          title: "Llegada y Purificación",
          description: "Kawoq canaliza el Femenino Divino — la tormenta que limpia, la lluvia que nutre nuevos brotes. El número 6 (Waq) trae estabilidad y flujo, un equilibrio suave entre soltar lo que cargabas y abrirte a lo que te espera.",
          activities: [
            { timeOfDay: "Tarde", activity: "Llega a Templia. Camina descalzo por el jardín de la selva, dejando que la tierra reciba el peso de tu viaje. Siéntate junto al fogón maya y escucha los sonidos de la selva al caer la noche." },
            { timeOfDay: "Noche", activity: "Cena en Aldea Zama — Mamazul Mezcalería para mezcal ceremonial y cocina mexicana contemporánea, ARCA para platillos al fuego de leña y vino natural, o Safari Comedor Zama para cenar entre la selva." },
            { timeOfDay: "Antes de Dormir", activity: "Ritual de vapor en la regadera de Templia. Deja que el agua se lleve todo lo que ya no necesitas. Antes de dormir, establece una sola intención para tu estadía. Mantén un diario de sueños junto a tu cama — el signo de mañana escuchará." },
          ],
        },
        {
          date: "2026-02-11",
          title: "Iluminación y Heroísmo",
          description: "Ajpu es el último signo del Tzolkin — el Señor, el Sol, el Héroe que ha recorrido las veinte caras de la creación y ha emergido completo. El número 7 (Wuq) es el centro místico, la columna de luz en el corazón del calendario sagrado. Este es el núcleo de tu viaje.",
          activities: [
            { timeOfDay: "Amanecer", activity: "Levántate antes del alba. De pie mirando al este, toma siete respiraciones profundas — una por cada nivel de los cielos. Nutre tu cuerpo con un desayuno lento e intencional." },
            { timeOfDay: "Mañana", activity: "Ruinas de Tulum — El Castillo al amanecer. Este templo sobre el acantilado fue llamado Zama, que significa «amanecer». Camina lentamente entre las estructuras, honrando a los ancestros que construyeron un templo solar donde la primera luz toca el continente." },
            { timeOfDay: "Mediodía", activity: "Nado sagrado en cenote — Gran Cenote o Cenote Calavera. Desciende a la memoria de la tierra. Los mayas creían que los cenotes eran portales a Xibalbá, el inframundo donde los Héroes Gemelos demostraron que su luz podía sobrevivir la oscuridad." },
            { timeOfDay: "Tarde", activity: "Ceremonia de cacao o Temazcal. Deja que la medicina del cacao ceremonial, que abre el corazón, guíe tu tarde, o entra al vientre del Temazcal para renacer a través del fuego, la piedra y la oración." },
            { timeOfDay: "Noche", activity: "Enciende el fogón maya en Templia. Reflexiona junto a las llamas sobre lo que el día iluminó. Prepara una comida intencional — simple, nutritiva, preparada con presencia." },
          ],
        },
        {
          date: "2026-02-12",
          title: "Aguas Primordiales y Partida",
          description: "Imox es el primer signo — el vientre cósmico, las aguas primordiales de las que toda creación emerge. En tu última mañana, regresas al principio. El número 8 (Wajxaq) trae armonía y abundancia — la sensación de que todo lo recibido es suficiente, y más que suficiente.",
          activities: [
            { timeOfDay: "Temprano", activity: "Escribe tus sueños inmediatamente al despertar. Imox es el signo más profundamente conectado con el mundo onírico — lo que te visitó en la noche lleva un mensaje." },
            { timeOfDay: "Ritual de Agua", activity: "Entra a la piscina de Templia, o simplemente sostén agua en ambas manos. Agradece a la tierra, a los cenotes y al mar por sostener el espacio para tu transformación. Deja que el agua reciba una última ofrenda de gratitud." },
            { timeOfDay: "Partida", activity: "Desayuno ligero, empaca con intención. Antes de irte, párate una vez más en el espacio de doble altura de Templia. Mira hacia donde la selva se encuentra con la arquitectura. Llévate este umbral contigo." },
          ],
        },
      ],
      integration: {
        title: "El Hilo del Viento",
        bodyText: "Cómo las energías se tejieron a lo largo de tu viaje",
        dayThreads: [
          {
            displayName: "6 Kawoq",
            englishName: "La Tormenta",
            summary: "Te limpió y preparó, lavando lo que traías de casa. El Femenino Divino sostuvo el espacio para tu llegada.",
          },
          {
            displayName: "7 Ajpu",
            englishName: "El Sol",
            summary: "Iluminó el corazón de tu viaje — sitios sagrados, aguas, fuego — y te pidió encontrarte con tu propia luz en el centro místico.",
          },
          {
            displayName: "8 Imox",
            englishName: "El Cocodrilo",
            summary: "Reunió todo en las aguas primordiales de la intuición, enviándote hacia adelante con una confianza más profunda en lo que no puedes ver.",
          },
        ],
        closingText: "A lo largo de todo, tu nawal 1 Iq' (Viento) fue el hilo invisible — el aliento conectando cada momento, la fuerza invisible que hace mecer la selva. Llegaste con la Tormenta, fuiste iluminado por el Sol, y partiste a través de las Aguas Primordiales. El Viento te llevó por cada pasaje.",
      },
    },
  },
};

// Merge: .md files override hardcoded entries
const JOURNEYS: Record<string, GuestJourney> = { ...HARDCODED_JOURNEYS, ...GUEST_JOURNEYS };

export function getJourneyBySlug(slug: string): GuestJourney | undefined {
  return JOURNEYS[slug];
}

export function getAllJourneySlugs(): string[] {
  return Object.keys(JOURNEYS);
}
