export type Locale = "en" | "es";

// UI labels that don't come from journey data
export const UI_STRINGS: Record<Locale, {
  yourNawal: string;
  yourNawalAlt: string;
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
  welcomeLabel: string;
  expandAllDays: string;
  collapseAllDays: string;
  today: string;
  emailTitle: string;
  emailBody: string;
  emailPlaceholder: string;
  emailSubmit: string;
  emailSending: string;
  emailCheckInbox: string;
  emailAlreadyActive: string;
  emailInvalid: string;
  emailError: string;
  emailPrivacy: string;
  subscribedBanner: string;
  unsubscribedBanner: string;
  remindMe: string;
  calendarTitle: string;
  calendarBody: string;
  calendarThisDay: string;
  calendarAllDays: string;
}> = {
  en: {
    yourNawal: "Your Nawal",
    yourNawalAlt: "( Nagual · Nahual )",
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
    defaultWelcome: "Your time at Templia begins at a meaningful point in your journey, {name}. This is not a coincidence. In Maya tradition, every day holds its own living energy. The days of your stay are not random \u2014 they are part of a deeper pattern that was already unfolding before your arrival.\n\nWhat follows is a guide to the energies present during your time at Templia \u2014 a map of the influences, symbols, and intentions that accompany you while you are in the land of the Maya.",
    nights: "nights",
    activities: "Explore {day}'s activities",
    welcomeLabel: "Welcome",
    expandAllDays: "Show all days",
    collapseAllDays: "Collapse all days",
    today: "Today",
    emailTitle: "Email each morning",
    emailBody: "Each morning at 7:00 (Tulum time) we'll send that day's Tzolkin energy and one suggestion, from your first day to your last.",
    emailPlaceholder: "Your email",
    emailSubmit: "Send me each day",
    emailSending: "Sending…",
    emailCheckInbox: "Almost there — check your inbox and tap the confirmation link.",
    emailAlreadyActive: "You're already subscribed. Your next message arrives at 7:00 AM.",
    emailInvalid: "Please enter a valid email address.",
    emailError: "Something went wrong. Please try again in a moment.",
    emailPrivacy: "Used only for these daily messages, and deleted a week after your stay.",
    subscribedBanner: "You're subscribed — each day's message arrives at 7:00 AM Tulum time.",
    unsubscribedBanner: "You've been unsubscribed and won't receive more daily emails.",
    remindMe: "Remind me",
    calendarTitle: "Add to your calendar",
    calendarBody: "A 7:00 AM reminder with the day's energy and a link back here.",
    calendarThisDay: "This day",
    calendarAllDays: "All {n} days",
  },
  es: {
    yourNawal: "Tu Nawal",
    yourNawalAlt: "( Nagual · Nahual )",
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
    defaultWelcome: "Tu tiempo en Templia comienza en un punto significativo de tu camino, {name}. Esto no es una coincidencia. En la tradici\u00f3n maya, cada d\u00eda sostiene su propia energ\u00eda viva. Los d\u00edas de tu estad\u00eda no son aleatorios \u2014 son parte de un patr\u00f3n m\u00e1s profundo que ya se estaba desplegando antes de tu llegada.\n\nLo que sigue es una gu\u00eda de las energ\u00edas presentes durante tu tiempo en Templia \u2014 un mapa de las influencias, s\u00edmbolos e intenciones que te acompa\u00f1an mientras est\u00e1s en la tierra de los mayas.",
    nights: "noches",
    activities: "Explora las actividades del {day}",
    welcomeLabel: "Bienvenida",
    expandAllDays: "Mostrar todos los días",
    collapseAllDays: "Ocultar todos los días",
    today: "Hoy",
    emailTitle: "Correo cada mañana",
    emailBody: "Cada mañana a las 7:00 (hora de Tulum) te enviaremos la energía del Tzolkin del día y una sugerencia, desde tu primer día hasta el último.",
    emailPlaceholder: "Tu correo",
    emailSubmit: "Envíenme cada día",
    emailSending: "Enviando…",
    emailCheckInbox: "Casi listo — revisa tu correo y toca el enlace de confirmación.",
    emailAlreadyActive: "Ya estás suscrito. Tu próximo mensaje llega a las 7:00 AM.",
    emailInvalid: "Escribe un correo válido, por favor.",
    emailError: "Algo salió mal. Inténtalo de nuevo en un momento.",
    emailPrivacy: "Solo se usa para estos mensajes diarios y se borra una semana después de tu estadía.",
    subscribedBanner: "Suscripción confirmada — el mensaje de cada día llega a las 7:00 AM hora de Tulum.",
    unsubscribedBanner: "Cancelaste la suscripción y no recibirás más correos diarios.",
    remindMe: "Recuérdamelo",
    calendarTitle: "Agregar a tu calendario",
    calendarBody: "Un recordatorio a las 7:00 AM con la energía del día y un enlace de regreso aquí.",
    calendarThisDay: "Este día",
    calendarAllDays: "Los {n} días",
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
