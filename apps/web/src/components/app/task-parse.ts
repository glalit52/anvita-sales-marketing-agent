import { NOW_MIN, TODAY, stamp, weekdayOf, type TaskPriority, type TaskType } from "@/lib/mock/app";
import { team, type Contact } from "@/lib/mock/core";
import { allContacts } from "@/lib/mock/sell";

export interface ParsedTask {
  title: string;
  type: TaskType;
  typeMatched: boolean;
  contact?: Contact;
  day: number;
  minutes: number;
  hasTime: boolean;
  dateMatched: boolean;
  assigneeId: string;
  assigneeMatched: boolean;
  priority: TaskPriority;
}

const typeWords: [TaskType, RegExp][] = [
  ["call", /\b(call|ring|phone)\b/i],
  ["whatsapp", /\b(whatsapp|wa|message|text|msg)\b/i],
  ["email", /\b(email|e-mail|mail)\b/i],
  ["review", /\b(review|rating)\b/i],
  ["payment", /\b(pay|payment|invoice|collect|balance|deposit|dues?)\b|₹/i],
];

const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const monthStart = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/**
 * Tiny natural-language parser for the quick-add demo:
 * "Call Rohit tomorrow 4pm" → { type: call, contact: Rohit Mehta, day: Wed, 4:00 PM }.
 */
export function parseTask(input: string, currentUser = "u1"): ParsedTask {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Type: the earliest keyword wins ("Call Rohit about payment" → call)
  let type: TaskType = "whatsapp";
  let typeMatched = false;
  let best = Infinity;
  for (const [t, re] of typeWords) {
    const m = re.exec(text);
    if (m && m.index < best) {
      best = m.index;
      type = t;
      typeMatched = true;
    }
  }

  // Contact: full name first, then unique first name
  let contact = allContacts.find((c) => lower.includes(c.name.toLowerCase()));
  if (!contact) {
    contact = allContacts.find((c) => new RegExp(`\\b${c.name.split(" ")[0].toLowerCase()}\\b`).test(lower));
  }

  // Date
  let day = TODAY;
  let dateMatched = false;
  let m: RegExpExecArray | null;
  if (/\bday after tomorrow\b/.test(lower)) {
    day = TODAY + 2;
    dateMatched = true;
  } else if (/\b(tomorrow|tmrw|tmr|kal)\b/.test(lower)) {
    day = TODAY + 1;
    dateMatched = true;
  } else if (/\b(today|tonight|aaj|eod)\b/.test(lower)) {
    dateMatched = true;
  } else if ((m = /\bin (\d+) days?\b/.exec(lower))) {
    day = TODAY + Number(m[1]);
    dateMatched = true;
  } else if ((m = /\bnext week\b/.exec(lower))) {
    day = TODAY + ((1 - weekdayOf(TODAY) + 7) % 7 || 7);
    dateMatched = true;
  } else if ((m = /\b(next )?(sun|mon|tue|wed|thu|fri|sat)[a-z]*\b/.exec(lower))) {
    const target = weekdays.indexOf(m[2]);
    let ahead = (target - weekdayOf(TODAY) + 7) % 7 || 7;
    if (m[1] && ahead < 7) ahead += 7;
    day = TODAY + ahead;
    dateMatched = true;
  } else if ((m = /\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/.exec(lower)) || (m = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})\b/.exec(lower))) {
    const [d, mon] = /^\d/.test(m[1]) ? [Number(m[1]), m[2]] : [Number(m[2]), m[1]];
    day = monthStart[months.indexOf(mon)] + d - 1;
    dateMatched = true;
  }

  // Time
  let minutes = 18 * 60;
  let hasTime = false;
  if ((m = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/.exec(lower))) {
    let h = Number(m[1]) % 12;
    if (m[3] === "pm") h += 12;
    minutes = h * 60 + Number(m[2] ?? 0);
    hasTime = true;
  } else if ((m = /\bat (\d{1,2})(?::(\d{2}))?\b/.exec(lower))) {
    let h = Number(m[1]);
    if (h >= 1 && h <= 7) h += 12;
    minutes = h * 60 + Number(m[2] ?? 0);
    hasTime = true;
  } else if (/\bmorning\b/.test(lower)) {
    minutes = 10 * 60;
    hasTime = true;
  } else if (/\bafternoon\b/.test(lower)) {
    minutes = 15 * 60;
    hasTime = true;
  } else if (/\b(evening|tonight)\b/.test(lower)) {
    minutes = 18 * 60;
    hasTime = true;
  }
  if (!dateMatched && hasTime && minutes <= NOW_MIN) day = TODAY + 1;
  if (!dateMatched && hasTime) dateMatched = true;

  // Assignee: "@Arjun", "for Neha", "assign to Vikram"
  let assigneeId = currentUser;
  let assigneeMatched = false;
  for (const member of team) {
    const firstName = member.name.split(" ")[0].toLowerCase();
    if (new RegExp(`(@${firstName}\\b|\\b(for|to|assign(ed)? to) ${firstName}\\b)`).test(lower)) {
      assigneeId = member.id;
      assigneeMatched = true;
    }
  }
  if (/@ai\b|\bfor ai\b/.test(lower)) {
    assigneeId = "ai";
    assigneeMatched = true;
  }

  const priority: TaskPriority = /\b(urgent|asap|important)\b|!/.test(lower) ? "high" : /\blow priority\b|\bsomeday\b/.test(lower) ? "low" : "normal";

  // Clean title: drop @mentions and priority markers, keep the rest as written
  const title = text
    .replace(/@\w+/g, "")
    .replace(/!+/g, "")
    .replace(/\b(urgent|asap)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { title: title || "New task", type, typeMatched, contact, day, minutes, hasTime, dateMatched, assigneeId, assigneeMatched, priority };
}

export const parsedStamp = (p: ParsedTask) => stamp(p.day, p.minutes);
