import fs from "fs";
import path from "path";
import { type GuestJourney, type JourneyDay, type GuestNawal, type JourneyIntegration, type Recommendation } from "./journeys";

const GUESTS_DIR = path.join(process.cwd(), "guests");

interface Frontmatter {
  guest: string;
  birthday: string;
  checkin: string;
  checkout: string;
  location: string;
  subtitle: string;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Invalid frontmatter");

  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  return {
    frontmatter: fm as unknown as Frontmatter,
    body: match[2],
  };
}

function extractSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = body.split(/^# /m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const title = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    sections[title] = content;
  }
  return sections;
}

function parseListField(text: string, field: string): string {
  const regex = new RegExp(`^- \\*\\*${field}\\*\\*:\\s*(.+)$`, "m");
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function parseNawal(text: string, birthday?: string): GuestNawal {
  return {
    displayName: parseListField(text, "Display"),
    toneName: parseListField(text, "Tone"),
    toneDescription: parseListField(text, "Tone meaning"),
    daySignDescription: parseListField(text, "Day sign"),
    poeticTitle: parseListField(text, "Poetic title"),
    bodyText: parseListField(text, "Body"),
    birthday,
  };
}

function parseActivities(text: string): { timeOfDay: string; activity: string }[] {
  const activities: { timeOfDay: string; activity: string }[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/^- \*\*(.+?)\*\*:\s*(.+)$/);
    if (match) {
      activities.push({ timeOfDay: match[1], activity: match[2] });
    }
  }
  return activities;
}

function parseDaySection(text: string, date: string): { en: JourneyDay; es?: JourneyDay } {
  // Split into EN and ES parts by looking for ## headings
  const subSections: { title: string; content: string }[] = [];
  const parts = text.split(/^## /m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const title = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    subSections.push({ title, content });
  }

  // EN: first subsection without (es), ES: subsection with (es)
  const enSection = subSections.find((s) => !s.title.endsWith("(es)"));
  const esSection = subSections.find(
    (s) => s.title.endsWith("(es)") && !s.title.startsWith("Activities")
  );

  function parseDayFromSubSection(section: { title: string; content: string }, isEs: boolean): JourneyDay {
    const title = section.title.replace(/\s*\(es\)\s*$/, "");
    // Split content into description and activities
    const activityHeader = isEs ? "### Activities (es)" : "### Activities";
    const actIdx = section.content.indexOf(activityHeader);

    let description: string;
    let activitiesText: string;

    if (actIdx >= 0) {
      description = section.content.slice(0, actIdx).trim();
      activitiesText = section.content.slice(actIdx + activityHeader.length).trim();
    } else {
      description = section.content;
      activitiesText = "";
    }

    return {
      date,
      title,
      description,
      activities: parseActivities(activitiesText),
    };
  }

  const en = enSection
    ? parseDayFromSubSection(enSection, false)
    : { date, title: "", description: "", activities: [] };

  const es = esSection ? parseDayFromSubSection(esSection, true) : undefined;

  return { en, es };
}

function parseIntegration(text: string): { en: JourneyIntegration; es?: JourneyIntegration } {
  const subSections: { title: string; content: string }[] = [];
  const parts = text.split(/^## /m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const title = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();
    subSections.push({ title, content });
  }

  const enSection = subSections.find((s) => !s.title.endsWith("(es)"));
  const esSection = subSections.find((s) => s.title.endsWith("(es)"));

  function parseIntegrationSection(section: { title: string; content: string }): JourneyIntegration {
    const title = section.title.replace(/\s*\(es\)\s*$/, "");
    const lines = section.content.split("\n");

    // First line(s) before the bullet list = bodyText
    const bodyLines: string[] = [];
    const threadLines: string[] = [];
    let closingText = "";
    let inClosing = false;
    let closingIsEs = false;

    for (const line of lines) {
      if (line.match(/^###\s+Closing(\s+\(es\))?/)) {
        inClosing = true;
        closingIsEs = line.includes("(es)");
        continue;
      }
      if (inClosing) {
        if (line.trim()) closingText += (closingText ? " " : "") + line.trim();
        continue;
      }
      if (line.startsWith("- **")) {
        threadLines.push(line);
      } else if (threadLines.length === 0 && line.trim()) {
        bodyLines.push(line.trim());
      }
    }

    const dayThreads = threadLines.map((line) => {
      const match = line.match(/^- \*\*(.+?)\*\*\s*\((.+?)\):\s*(.+)$/);
      if (match) {
        return { displayName: match[1], englishName: match[2], summary: match[3] };
      }
      return { displayName: "", englishName: "", summary: line };
    });

    return {
      title,
      bodyText: bodyLines.join(" "),
      dayThreads,
      closingText,
    };
  }

  const en = enSection
    ? parseIntegrationSection(enSection)
    : { title: "", bodyText: "", dayThreads: [], closingText: "" };

  const es = esSection ? parseIntegrationSection(esSection) : undefined;

  return { en, es };
}

function parseRecommendations(text: string): Recommendation[] {
  const recommendations: Recommendation[] = [];
  // Split by ## headings to get individual recommendations
  const parts = text.split(/^## /m).filter(Boolean);
  for (const part of parts) {
    const newline = part.indexOf("\n");
    const name = part.slice(0, newline).trim();
    const content = part.slice(newline + 1).trim();

    // Extract URL if present (line starting with - **URL**: ...)
    const urlMatch = content.match(/^- \*\*URL\*\*:\s*(.+)$/m);
    const url = urlMatch ? urlMatch[1].trim() : undefined;

    // Extract Logo if present (line starting with - **Logo**: ...)
    const logoMatch = content.match(/^- \*\*Logo\*\*:\s*(.+)$/m);
    const logo = logoMatch ? logoMatch[1].trim() : undefined;

    // Extract Logo Position if present (line starting with - **Logo Position**: ...)
    const posMatch = content.match(/^- \*\*Logo Position\*\*:\s*(.+)$/m);
    const logoPosition = posMatch ? (posMatch[1].trim() as "left" | "right") : undefined;

    // Description is everything except the URL, Logo, and Logo Position lines
    const description = content
      .split("\n")
      .filter((line) => !line.match(/^- \*\*(URL|Logo|Logo Position)\*\*/))
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");

    recommendations.push({ name, description, url, logo, logoPosition });
  }
  return recommendations;
}

function parseWelcome(text: string): string {
  // Convert paragraph breaks to \n\n
  return text
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function parseGuestFile(filename: string): { slug: string; journey: GuestJourney } {
  const content = fs.readFileSync(path.join(GUESTS_DIR, filename), "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);
  const sections = extractSections(body);

  const slug = `${frontmatter.checkin}-to-${frontmatter.checkout}`;

  // Welcome messages
  const welcomeEn = sections["Welcome"] ? parseWelcome(sections["Welcome"]) : undefined;
  const welcomeEs = sections["Welcome (es)"] ? parseWelcome(sections["Welcome (es)"]) : undefined;

  // Nawal
  const nawalEn = parseNawal(sections["Your Nawal"] || "", frontmatter.birthday);
  const nawalEs = sections["Your Nawal (es)"]
    ? parseNawal(
        sections["Your Nawal (es)"],
        // Localize birthday for Spanish
        frontmatter.birthday
          ? new Date(frontmatter.birthday + " 12:00:00").toLocaleDateString("es-MX", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : undefined
      )
    : undefined;

  // Days
  const dayKeys = Object.keys(sections)
    .filter((k) => k.match(/^Day \d+/))
    .sort();

  const enDays: JourneyDay[] = [];
  const esDays: JourneyDay[] = [];

  for (const key of dayKeys) {
    const dateMatch = key.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : frontmatter.checkin;
    const parsed = parseDaySection(sections[key], date);
    enDays.push(parsed.en);
    if (parsed.es) esDays.push(parsed.es);
  }

  // Integration
  const integrationData = sections["Integration"]
    ? parseIntegration(sections["Integration"])
    : { en: { title: "", bodyText: "", dayThreads: [], closingText: "" } };

  // Recommendations
  const recsEn = sections["Recommendations"] ? parseRecommendations(sections["Recommendations"]) : undefined;
  const recsEs = sections["Recommendations (es)"] ? parseRecommendations(sections["Recommendations (es)"]) : undefined;

  const journey: GuestJourney = {
    guestName: frontmatter.guest,
    locationName: frontmatter.location,
    locationSubtitle: frontmatter.subtitle,
    checkIn: frontmatter.checkin,
    checkOut: frontmatter.checkout,
    welcomeMessage: welcomeEn,
    nawal: nawalEn,
    days: enDays,
    integration: integrationData.en,
    recommendations: recsEn,
  };

  // Add Spanish if available
  if (nawalEs && esDays.length > 0 && integrationData.es) {
    journey.es = {
      welcomeMessage: welcomeEs,
      nawal: nawalEs,
      days: esDays,
      integration: integrationData.es,
      recommendations: recsEs,
    };
  }

  return { slug, journey };
}

export function loadAllGuests(): Record<string, GuestJourney> {
  const journeys: Record<string, GuestJourney> = {};

  if (!fs.existsSync(GUESTS_DIR)) return journeys;

  const files = fs.readdirSync(GUESTS_DIR).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_")
  );

  for (const file of files) {
    try {
      const { slug, journey } = parseGuestFile(file);
      journeys[slug] = journey;
    } catch (e) {
      console.error(`Error parsing guest file ${file}:`, e);
    }
  }

  return journeys;
}
