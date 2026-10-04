import { getTzolkinDate } from "./tzolkin";
import type { JourneyDay } from "./journeys";

// Tulum is UTC-5 all year, so 07:00 local is always 12:00 UTC.
const LOCAL_7AM_UTC = "120000Z";
const EVENT_END_UTC = "121500Z";

export interface CalendarDayInput {
  day: JourneyDay;
  dayNumber: number;
  url: string;
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

// RFC 5545 lines must be folded at 75 octets.
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    if (size + len > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += len;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function firstSentence(text: string): string {
  return (text.match(/^[^.!?]+[.!?]/)?.[0] ?? text).trim();
}

export function buildJourneyIcs(slug: string, items: CalendarDayInput[], label: { day: string }): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Templia Art//Tzolkin Journey//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const { day, dayNumber, url } of items) {
    const date = day.date.replace(/-/g, "");
    const tz = getTzolkinDate(new Date(day.date + "T12:00:00"));
    const summary = `${label.day} ${dayNumber} · ${tz.tone.number} ${tz.daySign.name} — ${day.title}`;
    const description = `${firstSentence(day.description)}\n\n${url}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${slug}-day${dayNumber}@templia.art`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${date}T${LOCAL_7AM_UTC}`,
      `DTEND:${date}T${EVENT_END_UTC}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `URL:${url}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(summary)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
