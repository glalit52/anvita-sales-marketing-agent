import type { Channel } from "@/components/ui/channel";
import { channelMeta } from "@/components/ui/channel";
import { formatCurrency } from "@/lib/format";
import { conversations, type Contact } from "./core";
import { reviews } from "./growth";
import {
  allContacts,
  appointments,
  contactNotes,
  locationLabel,
  payments,
  providers,
  services,
  timelineFor,
  type Appointment,
} from "./sell";

/**
 * Mock data for app-wide screens: contact profile, tasks, notifications and
 * the help center. Demo "now" is Tue 27 Oct 2026, 11:20 AM IST.
 *
 * Time is modelled as a "stamp": minutes since 1 Jan 2026 00:00, so events
 * from different mocks (relative labels, dates, weekdays) sort together and
 * render identically on server and client (no Date/locale formatting).
 */

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Day number (days since 1 Jan 2026). `month` is 0-based; day overflow rolls forward. */
export const dayNum = (month: number, day: number) => MONTH_START[month] + day - 1;
export const TODAY = dayNum(9, 27);
export const NOW_MIN = 11 * 60 + 20;
export const NOW_STAMP = TODAY * 1440 + NOW_MIN;

export const stamp = (day: number, minutes = 9 * 60) => day * 1440 + minutes;
export const dayOf = (s: number) => Math.floor(s / 1440);
export const minOf = (s: number) => s - dayOf(s) * 1440;

/** 0 = Sun … 6 = Sat. 27 Oct 2026 is a Tuesday. */
export const weekdayOf = (day: number) => (((day - TODAY) % 7) + 7 + 2) % 7;

function monthDay(day: number) {
  let m = 11;
  while (m > 0 && MONTH_START[m] > day) m--;
  return { month: m, date: day - MONTH_START[m] + 1 };
}

export function dateLabel(day: number) {
  const { month, date } = monthDay(day);
  return `${WEEKDAYS[weekdayOf(day)]}, ${date} ${MONTHS[month]}`;
}

/** "Today" / "Yesterday" / "Tomorrow" / "Thu, 29 Oct" */
export function dayLabel(day: number) {
  if (day === TODAY) return "Today";
  if (day === TODAY - 1) return "Yesterday";
  if (day === TODAY + 1) return "Tomorrow";
  return dateLabel(day);
}

export function timeLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export const stampLabel = (s: number) => `${dayLabel(dayOf(s))}, ${timeLabel(minOf(s))}`;

/** Compact relative label: "Just now", "12m ago", "3h ago", "Yesterday", "Thu, 22 Oct". */
export function relativeLabel(s: number) {
  const diff = NOW_STAMP - s;
  if (diff < 0) return stampLabel(s);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (dayOf(s) === TODAY) return `${Math.floor(diff / 60)}h ago`;
  if (dayOf(s) === TODAY - 1) return `Yesterday, ${timeLabel(minOf(s))}`;
  return dateLabel(dayOf(s));
}

function parseTime(text: string): number | null {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(text);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

/**
 * Turns the many time labels used across the mocks into a stamp:
 * "Just now", "2m", "3h ago", "2 days ago", "1 week ago", "Yesterday",
 * "Today, 10:05 AM", "Mon, 6:40 PM", "Mon 9:00 AM", "26 Oct, 11:43 PM",
 * "18 Sep", "2026-10-26", "11:40 PM" (relative to `baseDay`).
 */
export function parseWhen(label: string, baseDay = TODAY): number | null {
  const text = label.trim();
  if (/^just now$/i.test(text)) return NOW_STAMP;
  let m = /^(\d+)\s*(m|min|h|d|days?|weeks?)(\s+ago)?$/i.exec(text);
  if (m) {
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    const mins = unit.startsWith("m") ? n : unit === "h" ? n * 60 : unit.startsWith("w") ? n * 7 * 1440 : n * 1440;
    return NOW_STAMP - mins;
  }
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (m) return stamp(dayNum(Number(m[2]) - 1, Number(m[3])));
  const time = parseTime(text);
  m = /^(today|yesterday|tomorrow)\b/i.exec(text);
  if (m) {
    const off = { today: 0, yesterday: -1, tomorrow: 1 }[m[1].toLowerCase() as "today"] ?? 0;
    return stamp(TODAY + off, time ?? 18 * 60);
  }
  m = /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/.exec(text);
  if (m) {
    const target = WEEKDAYS.indexOf(m[1]);
    let back = (weekdayOf(baseDay) - target + 7) % 7;
    if (back === 0) back = 7;
    return stamp(baseDay - back, time ?? 10 * 60);
  }
  m = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.exec(text);
  if (m) return stamp(dayNum(MONTHS.indexOf(m[2]), Number(m[1])), time ?? 10 * 60);
  if (time !== null) {
    const s = stamp(baseDay, time);
    return baseDay === TODAY && s > NOW_STAMP ? s - 1440 : s;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Contact profile                                                     */
/* ------------------------------------------------------------------ */

export const contactIds = allContacts.map((c) => c.id);
export const profileContactById = (id: string) => allContacts.find((c) => c.id === id);

export type ActivityKind = "message" | "ai" | "booking" | "payment" | "review" | "sequence" | "note" | "stage" | "task";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  at: number;
  channel?: Channel;
  actor?: string;
  /** e.g. "Inbound", "Overdue", "Cited Price list 2026" */
  meta?: string;
  href?: string;
}

/** Appointment day index (0 = Mon 26 Oct) → day number. */
export const apptDay = (a: Pick<Appointment, "day">) => dayNum(9, 26 + a.day);
export const apptStamp = (a: Pick<Appointment, "day" | "start">) => stamp(apptDay(a), Math.round(a.start * 60));

export function appointmentsFor(contactId: string) {
  return appointments.filter((a) => a.contactId === contactId);
}

export function conversationsFor(contactId: string) {
  return conversations.filter((c) => c.contactId === contactId);
}

const truncate = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Merges conversations, bookings, payments, reviews, sequences, notes, AI actions and tasks into one feed. */
export function activityFor(contact: Contact): ActivityEvent[] {
  const first = contact.name.split(" ")[0];
  const events: ActivityEvent[] = [];
  const created = stamp(dayNum(Number(contact.createdAt.slice(5, 7)) - 1, Number(contact.createdAt.slice(8, 10))), 9 * 60 + 5);

  // 1. Conversations (every channel)
  for (const conv of conversationsFor(contact.id)) {
    const rel = /^(\d+)d$/.exec(conv.time);
    const baseDay = rel ? TODAY - Number(rel[1]) : TODAY;
    const href = `/inbox?c=${conv.id}`;
    for (const msg of conv.messages) {
      const at = parseWhen(msg.time, baseDay) ?? NOW_STAMP;
      const id = `${conv.id}-${msg.id}`;
      if (msg.card?.type === "payment") continue; // covered by payments
      if (msg.author === "contact") {
        events.push({ id, kind: "message", title: `“${truncate(msg.body, 110)}”`, at, channel: conv.channel, actor: first, meta: `Inbound · ${channelMeta[conv.channel].label}`, href });
      } else if (msg.author === "ai") {
        const draft = msg.body.startsWith("Draft");
        events.push({
          id,
          kind: "ai",
          title: draft ? "Copilot drafted a reply, awaiting approval" : "AI agent replied",
          detail: truncate(msg.body.replace(/^Draft \(Copilot\):\s*/, "")),
          at,
          channel: conv.channel,
          actor: "AI",
          meta: msg.sources ? `Cited ${msg.sources.join(", ")}` : undefined,
          href,
        });
      } else if (msg.author === "human") {
        events.push(
          msg.note
            ? { id, kind: "note", title: `${msg.authorName ?? "Team"} added an internal note`, detail: msg.body, at, actor: msg.authorName, href }
            : { id, kind: "message", title: `${msg.authorName ?? "Team"} replied`, detail: truncate(msg.body), at, channel: conv.channel, actor: msg.authorName, meta: `Outbound · ${channelMeta[conv.channel].label}`, href },
        );
      } else if (!msg.card) {
        events.push({ id, kind: "ai", title: msg.body, at, channel: conv.channel, actor: "AI", href });
      }
      if (msg.card?.type === "booking") {
        events.push({ id: `${id}-bk`, kind: "booking", title: `${msg.card.title} booked by AI`, detail: msg.card.subtitle, at, channel: conv.channel, actor: "AI", meta: msg.card.status, href: "/calendar" });
      }
      if (msg.card?.type === "review") {
        events.push({ id: `${id}-rv`, kind: "review", title: "Review request sent", detail: `${msg.card.title} · ${msg.card.subtitle}`, at, channel: conv.channel, actor: "AI", href: "/reviews" });
      }
    }
  }

  // 2. Past visits (upcoming ones are listed separately)
  for (const a of appointmentsFor(contact.id)) {
    const at = apptStamp(a);
    if (at > NOW_STAMP) continue;
    const sv = services.find((s) => s.id === a.serviceId)!;
    const pr = providers.find((p) => p.id === a.providerId)!;
    const label = a.status === "no-show" ? "missed (no-show)" : a.status === "checked-in" ? "checked in" : "completed";
    events.push({ id: `ap-${a.id}`, kind: "booking", title: `${sv.name} ${label}`, detail: `${locationLabel[a.location]} · ${pr.name}${a.notes ? ` · ${a.notes}` : ""}`, at: at + sv.duration, href: "/calendar" });
  }

  // 3. Payments
  for (const p of payments.filter((x) => x.contactId === contact.id)) {
    const createdAt = parseWhen(p.created) ?? created;
    events.push({
      id: `pl-${p.id}`,
      kind: "payment",
      title: `Pay link sent: ${formatCurrency(p.amount)} for ${p.purpose}`,
      detail: `${p.id} · ${p.gateway}${p.invoice ? ` · ${p.invoice}` : ""}`,
      at: createdAt,
      channel: p.channel,
      actor: p.createdByAi ? "AI" : undefined,
      meta: p.status === "overdue" ? `Overdue ${p.days} days` : p.status === "pending" ? "Awaiting payment" : undefined,
      href: "/payments",
    });
    if (p.paidAt) {
      const paidAt = parseWhen(p.paidAt) ?? createdAt + 5;
      events.push({ id: `pp-${p.id}`, kind: "payment", title: `${formatCurrency(p.amount)} paid`, detail: `${p.purpose} · ${p.method?.toUpperCase() ?? "UPI"} via ${p.gateway}`, at: paidAt === createdAt ? paidAt + 4 : paidAt, href: "/payments" });
    }
    if (p.status === "refunded") {
      events.push({ id: `pr-${p.id}`, kind: "payment", title: `${formatCurrency(p.amount)} refunded`, detail: p.purpose, at: (parseWhen(p.paidAt ?? p.created) ?? createdAt) + 1440 * 2, href: "/payments" });
    }
  }

  // 4. Reviews
  // Only customers who have visited can have reviewed (keeps the demo story consistent).
  for (const r of reviews.filter((x) => x.author === contact.name && contact.stage === "customer")) {
    const at = parseWhen(r.when) ?? NOW_STAMP - 120;
    events.push({
      id: `rv-${r.id}`,
      kind: "review",
      title: `Left a ${r.rating}★ review on ${r.platform[0].toUpperCase()}${r.platform.slice(1)}`,
      detail: `“${truncate(r.text, 160)}”`,
      at,
      meta: r.reply ? "Replied" : r.rating <= 3 ? "Needs reply" : "AI reply drafted",
      href: "/reviews",
    });
  }

  // 5. Sequence steps & stage changes from the Sell timeline
  for (const t of timelineFor(contact)) {
    if (t.type !== "sequence" && t.type !== "stage" && t.type !== "booking" && t.type !== "payment") continue;
    if (t.id === "g5") continue; // generic "contact created" (added below)
    const at = parseWhen(t.time.replace(/^Today, (\d{1,2}:\d{2} PM)$/, "Yesterday, $1"));
    if (at === null) continue;
    // Historic visits/payments only when nothing else already covers that day.
    if ((t.type === "booking" || t.type === "payment") && events.some((e) => e.kind === t.type && dayOf(e.at) === dayOf(at))) continue;
    if ((t.type === "booking" || t.type === "payment") && dayOf(at) >= TODAY - 1) continue;
    events.push({ id: `tl-${t.id}`, kind: t.type, title: t.title, detail: t.detail, at, channel: t.channel, actor: t.actor });
  }
  if (contact.tags.includes("b2b") && !events.some((e) => e.kind === "sequence")) {
    const seq = "Agri dealers: Maharashtra (kharif)";
    const steps: [number, string, string, Channel][] = [
      [1, `Enrolled in sequence “${seq}”`, "By Priya Sharma · 5 steps over 7 days", "email"],
      [1, "Step 1 · Intro email sent", "Subject: “{{company}} + faster dealer re-orders” · opened 2×", "email"],
      [3, "Step 2 · WhatsApp template dealer_intro_v2 delivered", "Read · no reply yet", "whatsapp"],
      [5, "Step 3 · LinkedIn connection request", "Task for Priya Sharma", "linkedin"],
    ];
    steps.forEach(([d, title, detail, ch], i) => {
      const at = created + d * 1440 + i * 3;
      if (at <= NOW_STAMP) events.push({ id: `sq-${i}`, kind: "sequence", title, detail, at, channel: ch, actor: i === 0 ? "Priya Sharma" : "AI" });
    });
  }

  // 6. Notes
  for (const n of contactNotes[contact.id] ?? []) {
    events.push({ id: `nt-${n.id}`, kind: "note", title: `${n.author} added a note`, detail: n.body, at: parseWhen(n.time) ?? NOW_STAMP - 60, actor: n.author });
  }

  // 7. AI actions
  events.push({ id: "ai-q", kind: "ai", title: `AI qualified the lead · score ${contact.score}/100`, detail: `Intent, budget and urgency detected · replies in ${contact.language}`, at: created + 6, actor: "AI" });
  if (contact.stage !== "lost")
    events.push({ id: "ai-s", kind: "ai", title: "AI summary refreshed", detail: "Based on all conversations, bookings and payments", at: Math.max(created + 30, NOW_STAMP - 15), actor: "AI" });

  // 8. Tasks
  for (const t of tasks.filter((x) => x.contactId === contact.id)) {
    events.push({
      id: `tk-${t.id}`,
      kind: "task",
      title: `${t.createdBy === "ai" ? "AI created a task" : "Task created"}: ${t.title}`,
      detail: t.aiContext ?? `Assigned to ${assigneeName(t.assigneeId)}`,
      at: t.createdAt,
      actor: t.createdBy === "ai" ? "AI" : assigneeName(t.createdBy),
      meta: t.done ? "Done" : `Due ${dayLabel(dayOf(t.due))}${t.hasTime ? `, ${timeLabel(minOf(t.due))}` : ""}`,
      href: "/tasks",
    });
  }

  // 9. Created
  if (!events.some((e) => e.kind === "stage" && dayOf(e.at) === dayOf(created) && /Added|created/i.test(e.title)))
    events.push({ id: "created", kind: "stage", title: "Contact created", detail: `Source: ${contact.source} · first channel ${channelMeta[contact.channel].label}`, at: created });

  return events.sort((a, b) => b.at - a.at);
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export type TaskType = "call" | "whatsapp" | "email" | "review" | "payment";
export type TaskPriority = "high" | "normal" | "low";

export const taskTypeMeta: Record<TaskType, { label: string; channel: Channel }> = {
  call: { label: "Call", channel: "voice" },
  whatsapp: { label: "WhatsApp", channel: "whatsapp" },
  email: { label: "Email", channel: "email" },
  review: { label: "Review", channel: "google" },
  payment: { label: "Payment follow-up", channel: "sms" },
};

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  contactId?: string;
  conversationId?: string;
  assigneeId: string;
  /** "ai" or a team member id */
  createdBy: string;
  createdAt: number;
  due: number;
  hasTime: boolean;
  priority: TaskPriority;
  done: boolean;
  doneAt?: number;
  /** Why the AI created it, quoted from the conversation. */
  aiContext?: string;
  aiConfidence?: number;
  notes?: string;
}

export function assigneeName(id: string) {
  return { ai: "Anvita AI", u1: "Priya Sharma", u2: "Arjun Patil", u3: "Neha Kulkarni", u4: "Vikram Joshi" }[id] ?? "Unassigned";
}

const T = (offset: number, h: number, m = 0) => stamp(TODAY + offset, h * 60 + m);

export const tasks: Task[] = [
  { id: "k1", title: "Call Rohit Mehta: confirm 4:30 PM priority slot", type: "call", contactId: "c2", conversationId: "v2", assigneeId: "u2", createdBy: "ai", createdAt: T(0, 10, 2), due: T(0, 12, 0), hasTime: true, priority: "high", done: false, aiContext: "Escalation rule “Complaint + negative sentiment”. Rohit: “This is the second time the filling has come off.”", aiConfidence: 94 },
  { id: "k2", title: "Approve Copilot reply to Rahul Verma with Thursday slots", type: "email", contactId: "c8", conversationId: "v7", assigneeId: "u1", createdBy: "ai", createdAt: T(0, 7, 16), due: T(0, 11, 0), hasTime: true, priority: "high", done: false, aiContext: "Rahul replied “Can we talk Thursday afternoon?”. Draft offers 2:00, 3:30 or 4:30 PM IST.", aiConfidence: 91 },
  { id: "k3", title: "WhatsApp Karan Desai the implant EMI calculator", type: "whatsapp", contactId: "c4", conversationId: "v4", assigneeId: "ai", createdBy: "ai", createdAt: T(0, 9, 28), due: T(0, 13, 0), hasTime: true, priority: "normal", done: false, aiContext: "Karan asked “Is implant EMI available?” and hasn't replied in 30 min.", aiConfidence: 88 },
  { id: "k4", title: "Chase ₹8,500 root canal balance (25 days overdue)", type: "payment", contactId: "c2", assigneeId: "u3", createdBy: "u3", createdAt: T(-6, 15, 0), due: T(-2, 18, 0), hasTime: false, priority: "normal", done: false, notes: "Hold off until the complaint is resolved today. Then resend link with a soft note." },
  { id: "k5", title: "Call Kunal Shah about Bajaj Finserv EMI approval", type: "call", contactId: "c14", assigneeId: "u2", createdBy: "ai", createdAt: T(-1, 17, 40), due: T(-1, 17, 0), hasTime: true, priority: "high", done: false, aiContext: "Kunal on WhatsApp: “Call me back after 5, I'll have the EMI approval by then.” Treatment plan ₹1.2L has been open 6 days.", aiConfidence: 90 },
  { id: "k6", title: "Reply to Rohit Mehta's 2★ Google review", type: "review", contactId: "c2", assigneeId: "u1", createdBy: "ai", createdAt: T(0, 8, 20), due: T(0, 17, 0), hasTime: true, priority: "high", done: false, aiContext: "New 2★ review mentions the failed filling. Reply within 24h; AI draft ready (confidence 72%, needs a human).", aiConfidence: 72 },
  { id: "k7", title: "Call back Lakshmi Narayanan about sitting 2 payment", type: "payment", contactId: "c18", assigneeId: "u4", createdBy: "ai", createdAt: T(-3, 11, 5), due: T(-1, 11, 0), hasTime: true, priority: "normal", done: false, aiContext: "Lakshmi on SMS: “Will pay after salary on the 25th, please call me then.”", aiConfidence: 86 },
  { id: "k8", title: "Send revised 3-outlet pricing to Sanjay Patil", type: "email", contactId: "c21", assigneeId: "u1", createdBy: "u1", createdAt: T(-4, 16, 0), due: T(0, 16, 0), hasTime: true, priority: "high", done: false, notes: "Anchor on Rabi-season ROI. Include the Krishi Seva case study." },
  { id: "k9", title: "Call Rahul Verma: discovery call", type: "call", contactId: "c8", conversationId: "v7", assigneeId: "u1", createdBy: "ai", createdAt: T(0, 7, 16), due: T(2, 15, 30), hasTime: true, priority: "normal", done: false, aiContext: "Rahul: “Can we talk Thursday afternoon?” Pending your approval of the slot email.", aiConfidence: 89 },
  { id: "k10", title: "Follow up with Pooja Bhatt on the aligner brochure", type: "whatsapp", contactId: "c9", conversationId: "v8", assigneeId: "ai", createdBy: "ai", createdAt: T(0, 5, 10), due: T(2, 11, 0), hasTime: true, priority: "normal", done: false, aiContext: "Pooja opened the brochure twice. AI scheduled a 2-day follow-up offering a free 3D scan.", aiConfidence: 84 },
  { id: "k11", title: "Re-engage Imran Khan with Saturday kids slots", type: "whatsapp", contactId: "c12", conversationId: "v9", assigneeId: "ai", createdBy: "ai", createdAt: T(-2, 18, 5), due: T(1, 10, 0), hasTime: true, priority: "low", done: false, aiContext: "Asked about a kids dentist on Sunday, no booking yet.", aiConfidence: 78 },
  { id: "k12", title: "Call Suresh Reddy (Kisan Mart): book demo with ops head", type: "call", contactId: "c10", assigneeId: "u1", createdBy: "ai", createdAt: T(-1, 10, 0), due: T(6, 11, 0), hasTime: true, priority: "normal", done: false, aiContext: "Suresh on LinkedIn: “Ping me next Monday, our ops head is back then.”", aiConfidence: 87 },
  { id: "k13", title: "Ask Riya Kapoor for a referral after tray 6", type: "whatsapp", contactId: "c15", assigneeId: "u3", createdBy: "u3", createdAt: T(-5, 12, 0), due: T(16, 10, 0), hasTime: false, priority: "low", done: false },
  { id: "k14", title: "Send Zoya Mirza the wedding whitening timeline", type: "whatsapp", contactId: "c17", assigneeId: "ai", createdBy: "ai", createdAt: T(-1, 19, 30), due: T(3, 12, 0), hasTime: true, priority: "normal", done: false, aiContext: "Zoya: “My wedding is on 12 Dec, is that enough time?”", aiConfidence: 92 },
  { id: "k15", title: "Collect ₹300 deposit from Fatima Shaikh before 5 PM visit", type: "payment", contactId: "c7", conversationId: "v5", assigneeId: "ai", createdBy: "ai", createdAt: T(0, 8, 22), due: T(0, 15, 0), hasTime: true, priority: "normal", done: false, aiContext: "Emergency slot booked via missed-call text-back. Deposit link sent 8:22 AM, unpaid.", aiConfidence: 95 },
  { id: "k16", title: "Thank Meera Nair for her 5★ review", type: "review", contactId: "c5", conversationId: "v6", assigneeId: "u3", createdBy: "ai", createdAt: T(0, 10, 25), due: T(0, 10, 45), hasTime: true, priority: "low", done: true, doneAt: T(0, 10, 40) },
  { id: "k17", title: "Call Vivek Bhosale back about toothache", type: "call", contactId: "c16", assigneeId: "u4", createdBy: "ai", createdAt: T(0, 7, 15), due: T(0, 9, 0), hasTime: true, priority: "high", done: true, doneAt: T(0, 9, 12), aiContext: "Missed call at 7:14 AM; caller didn't reply to the AI text-back.", aiConfidence: 81 },
  { id: "k18", title: "Email GreenField Agro the demo agenda", type: "email", contactId: "c23", assigneeId: "u1", createdBy: "u1", createdAt: T(-2, 10, 0), due: T(-1, 12, 0), hasTime: false, priority: "normal", done: true, doneAt: T(-1, 11, 30) },
  { id: "k19", title: "Confirm Sneha Iyer's Wed 6:30 PM ortho assessment", type: "call", contactId: "c3", conversationId: "v3", assigneeId: "u2", createdBy: "ai", createdAt: T(0, 9, 50), due: T(1, 12, 0), hasTime: true, priority: "normal", done: false, aiContext: "Appointment still unconfirmed and ₹500 deposit pending.", aiConfidence: 83 },
  { id: "k20", title: "Remind Ishita Sen about the ₹800 kids check-up link", type: "payment", contactId: "c20", assigneeId: "ai", createdBy: "ai", createdAt: T(-3, 13, 0), due: T(1, 10, 0), hasTime: true, priority: "low", done: false, aiContext: "Pay link opened but not completed (3 days).", aiConfidence: 80 },
];

export type TaskGroup = "overdue" | "today" | "upcoming" | "done";

export function taskGroup(t: Pick<Task, "done" | "due" | "hasTime">): TaskGroup {
  if (t.done) return "done";
  const d = dayOf(t.due);
  if (d < TODAY || (d === TODAY && t.hasTime && t.due < NOW_STAMP)) return "overdue";
  if (d === TODAY) return "today";
  return "upcoming";
}

export function dueLabel(t: Pick<Task, "due" | "hasTime">) {
  const d = dayOf(t.due);
  const day = dayLabel(d);
  return t.hasTime ? `${day}, ${timeLabel(minOf(t.due))}` : day;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationTab = "mentions" | "escalations" | "ai" | "system";
export type NotificationIcon = "escalation" | "mention" | "booking" | "payment" | "review" | "ai" | "system" | "campaign" | "integration" | "billing" | "task" | "prospect";

export type NotificationAction =
  | { kind: "open"; label: string; href: string }
  | { kind: "approve"; label: string; done: string }
  | { kind: "payment"; label: string; href: string };

export interface AppNotification {
  id: string;
  tab: NotificationTab;
  icon: NotificationIcon;
  title: string;
  body: string;
  actor?: string;
  contactId?: string;
  at: number;
  unread: boolean;
  priority?: boolean;
  actions: NotificationAction[];
}

const N = (offset: number, h: number, m = 0) => stamp(TODAY + offset, h * 60 + m);

export const notifications: AppNotification[] = [
  { id: "n1", tab: "escalations", icon: "escalation", title: "Escalated: unhappy patient", body: "Rohit Mehta (SMS): “This is the second time the filling has come off.” AI apologised and handed off after negative sentiment + complaint intent.", contactId: "c2", at: N(0, 10, 2), unread: true, priority: true, actions: [{ kind: "open", label: "Open conversation", href: "/inbox?c=v2" }, { kind: "approve", label: "Approve free 4:30 PM slot", done: "Slot offered to Rohit" }] },
  { id: "n2", tab: "mentions", icon: "mention", title: "Arjun mentioned you", body: "“@Priya can we waive today's visit fee for Rohit? Second time the temp filling failed.”", actor: "Arjun Patil", contactId: "c2", at: N(0, 10, 6), unread: true, actions: [{ kind: "open", label: "Reply in thread", href: "/inbox?c=v2" }] },
  { id: "n3", tab: "ai", icon: "ai", title: "Copilot draft needs approval", body: "Reply to Rahul Verma (AgriGrow) proposing Thu 2:00, 3:30 or 4:30 PM. Confidence 91%.", contactId: "c8", at: N(0, 7, 16), unread: true, actions: [{ kind: "approve", label: "Approve & send", done: "Reply sent to Rahul" }, { kind: "open", label: "Edit draft", href: "/inbox?c=v7" }] },
  { id: "n4", tab: "ai", icon: "booking", title: "AI booked an emergency visit", body: "Fatima Shaikh · Today 5:00 PM, Baner. Missed call → text-back in Hindi → booked in 9 min.", contactId: "c7", at: N(0, 8, 21), unread: true, actions: [{ kind: "open", label: "Open conversation", href: "/inbox?c=v5" }, { kind: "payment", label: "View deposit", href: "/payments" }] },
  { id: "n5", tab: "system", icon: "payment", title: "Payment received ₹2,500", body: "Meera Nair paid “Cleaning & polishing” via UPI (GPay). Invoice INV-1044 sent automatically.", contactId: "c5", at: N(0, 11, 52) - 1440, unread: false, actions: [{ kind: "payment", label: "View payment", href: "/payments" }] },
  { id: "n6", tab: "escalations", icon: "review", title: "New 2★ Google review needs a human reply", body: "Rohit Mehta: “Filling came off twice in a month…”. AI draft confidence 72%, below your 85% auto-publish threshold.", contactId: "c2", at: N(0, 8, 20), unread: true, actions: [{ kind: "open", label: "Review draft", href: "/reviews" }] },
  { id: "n7", tab: "ai", icon: "ai", title: "AI answered 14 FAQs on webchat", body: "Top topics: whitening price, Sunday hours at Baner, EMI options. 2 low-confidence answers flagged for review.", at: N(0, 10, 45), unread: false, actions: [{ kind: "open", label: "Review answers", href: "/agent" }] },
  { id: "n8", tab: "mentions", icon: "mention", title: "Neha mentioned you on Kunal Shah", body: "“@Priya Kunal's EMI is approved by Bajaj. Can you OK the ₹40k first instalment link?”", actor: "Neha Kulkarni", contactId: "c14", at: N(0, 9, 34), unread: false, actions: [{ kind: "approve", label: "Approve pay link", done: "Pay link sent to Kunal" }, { kind: "open", label: "Open contact", href: "/contacts/c14" }] },
  { id: "n9", tab: "system", icon: "integration", title: "Google Analytics 4 needs attention", body: "Key event ‘booking_completed’ is missing, so ad conversions are under-reported.", at: N(0, 6, 30), unread: true, actions: [{ kind: "open", label: "Fix in Integrations", href: "/integrations" }] },
  { id: "n10", tab: "ai", icon: "task", title: "AI created 3 follow-up tasks", body: "From conversations: “call me back after 5” (Kunal Shah), “pay after salary on the 25th” (Lakshmi N.), “ping me next Monday” (Suresh Reddy).", at: N(-1, 17, 41), unread: false, actions: [{ kind: "open", label: "Open tasks", href: "/tasks" }] },
  { id: "n11", tab: "ai", icon: "prospect", title: "42 new prospects found", body: "Agent “Agri dealers, Maharashtra” added 42 verified dealers. 18 have WhatsApp Business.", at: N(-1, 15, 10), unread: false, actions: [{ kind: "open", label: "Review prospects", href: "/prospecting" }] },
  { id: "n12", tab: "escalations", icon: "payment", title: "Payment overdue 25 days", body: "Rohit Mehta · ₹8,500 root canal balance. 2 automatic reminders sent, no response.", contactId: "c2", at: N(-1, 10, 0), unread: false, actions: [{ kind: "payment", label: "View payment", href: "/payments" }] },
  { id: "n13", tab: "system", icon: "campaign", title: "Diwali campaign is waiting for approval", body: "WhatsApp broadcast to 1,240 opted-in patients, scheduled Thu 29 Oct 6:00 PM. Template approved by Meta.", at: N(-1, 12, 30), unread: false, actions: [{ kind: "approve", label: "Approve campaign", done: "Campaign scheduled" }, { kind: "open", label: "Preview", href: "/campaigns" }] },
  { id: "n14", tab: "ai", icon: "review", title: "5★ review auto-replied", body: "Meera Nair on Google. AI reply published (confidence 96%).", contactId: "c5", at: N(0, 10, 32), unread: false, actions: [{ kind: "open", label: "View review", href: "/reviews" }] },
  { id: "n15", tab: "system", icon: "billing", title: "64% of monthly AI conversations used", body: "1,284 of 2,000 on the Growth plan. At this pace you'll reach the limit around 12 Nov.", at: N(-2, 9, 0), unread: false, actions: [{ kind: "open", label: "Plan & billing", href: "/settings?tab=billing" }] },
  { id: "n16", tab: "mentions", icon: "mention", title: "Vikram assigned you a deal", body: "“Kisan Mart: 5 stores” (₹1.8L). “Suresh prefers Telugu collateral.”", actor: "Vikram Joshi", contactId: "c10", at: N(-2, 16, 20), unread: false, actions: [{ kind: "open", label: "Open pipeline", href: "/pipeline" }] },
  { id: "n17", tab: "system", icon: "system", title: "WhatsApp template approved", body: "“diwali_offer_2026_hi” approved by Meta in the Marketing category.", at: N(-3, 14, 5), unread: false, actions: [{ kind: "open", label: "View templates", href: "/campaigns" }] },
  { id: "n18", tab: "ai", icon: "booking", title: "AI booked 3 appointments overnight", body: "Ananya Rao (Sat 10:00), Tanvi Gokhale (Thu 9:30), Ishita Sen (Sat 11:30). Saturday at Koregaon Park is now 80% full.", at: N(-1, 23, 46), unread: true, actions: [{ kind: "open", label: "Open calendar", href: "/calendar" }] },
  { id: "n19", tab: "system", icon: "system", title: "Weekly growth report is ready", body: "Leads +18%, bookings +24%, no-shows −41%. 3 recommendations inside.", at: N(-4, 8, 0), unread: false, actions: [{ kind: "open", label: "Read report", href: "/analytics" }] },
];

/* ------------------------------------------------------------------ */
/* Help center                                                         */
/* ------------------------------------------------------------------ */

export interface HelpGuide {
  id: string;
  module: string;
  href: string;
  description: string;
  articles: string[];
}

export const helpGuides: HelpGuide[] = [
  { id: "inbox", module: "Inbox", href: "/inbox", description: "One inbox for WhatsApp, Instagram, SMS, email, webchat and calls.", articles: ["Assign, snooze and close conversations", "When the AI hands off to a human", "Copilot drafts and approvals", "Internal notes and @mentions"] },
  { id: "agent", module: "AI Agent", href: "/agent", description: "Teach your AI agent, set rules and test it safely.", articles: ["Import knowledge from your website", "Write playbooks for bookings and pricing", "Escalation rules and confidence thresholds", "Test in the sandbox before going live"] },
  { id: "contacts", module: "Contacts", href: "/contacts", description: "Every lead and customer with consent and AI summaries.", articles: ["Import contacts from CSV or Excel", "Lead scoring explained", "Recording WhatsApp & SMS consent (DPDP)", "Merging duplicates"] },
  { id: "pipeline", module: "Pipeline", href: "/pipeline", description: "Track treatments and B2B deals by stage.", articles: ["Set up stages for your business", "Next-best-action suggestions", "Win/loss reasons"] },
  { id: "calendar", module: "Calendar", href: "/calendar", description: "Online booking, reminders and no-show protection.", articles: ["Connect Google Calendar", "Booking pages and deposits", "T-24h and T-2h WhatsApp reminders"] },
  { id: "payments", module: "Payments", href: "/payments", description: "UPI pay links, GST invoices and payouts.", articles: ["Connect Razorpay or Stripe", "Send a pay link in chat", "GST invoices and refunds"] },
  { id: "prospecting", module: "Prospecting", href: "/prospecting", description: "Find B2B leads with AI search agents.", articles: ["Describe your ideal customer", "Credits and enrichment sources", "Export to a sequence"] },
  { id: "sequences", module: "Sequences", href: "/sequences", description: "Multi-step outreach across email, WhatsApp and LinkedIn.", articles: ["Build your first sequence", "A/B testing steps", "Reply classification"] },
  { id: "campaigns", module: "Campaigns", href: "/campaigns", description: "WhatsApp, SMS and email broadcasts with templates.", articles: ["Get a WhatsApp template approved", "Segments and opt-outs", "DLT registration for SMS"] },
  { id: "reviews", module: "Reviews", href: "/reviews", description: "Ask for reviews and reply with AI.", articles: ["Automate review requests after visits", "Auto-reply thresholds", "Handling negative reviews"] },
  { id: "analytics", module: "Analytics", href: "/analytics", description: "Funnel, attribution and AI performance.", articles: ["Reading the funnel", "Ad attribution with GA4", "Exporting reports"] },
  { id: "automations", module: "Automations", href: "/automations", description: "Trigger → action workflows without code.", articles: ["Start from a recipe", "Conditions and delays", "Testing a workflow"] },
];

export const shortcuts: { group: string; items: { keys: string[]; label: string }[] }[] = [
  {
    group: "Global",
    items: [
      { keys: ["⌘", "K"], label: "Search pages, contacts or ask AI" },
      { keys: ["?"], label: "Show keyboard shortcuts" },
      { keys: ["G", "H"], label: "Go to Home" },
      { keys: ["G", "I"], label: "Go to Inbox" },
      { keys: ["G", "T"], label: "Go to Tasks" },
      { keys: ["G", "C"], label: "Go to Contacts" },
    ],
  },
  {
    group: "Inbox",
    items: [
      { keys: ["J"], label: "Next conversation" },
      { keys: ["K"], label: "Previous conversation" },
      { keys: ["R"], label: "Reply" },
      { keys: ["N"], label: "Internal note" },
      { keys: ["E"], label: "Close conversation" },
      { keys: ["⌘", "↵"], label: "Send / approve AI draft" },
    ],
  },
  {
    group: "Tasks",
    items: [
      { keys: ["Q"], label: "Quick-add task" },
      { keys: ["X"], label: "Complete selected task" },
      { keys: ["S"], label: "Snooze until tomorrow" },
      { keys: ["Esc"], label: "Close drawer or modal" },
    ],
  },
];

export const changelog: { id: string; date: string; tag: "New" | "Improved" | "Fixed"; title: string; body: string }[] = [
  { id: "w1", date: "26 Oct 2026", tag: "New", title: "Tasks & follow-up memory", body: "When a customer says “call me back Tuesday”, the AI now creates a task with the conversation linked, assigned to the right person." },
  { id: "w2", date: "22 Oct 2026", tag: "New", title: "Notification center", body: "Mentions, escalations and AI activity in one place, with one-click approve and per-channel preferences." },
  { id: "w3", date: "18 Oct 2026", tag: "Improved", title: "Hinglish & Marathi replies", body: "The AI agent matches the customer's language mid-conversation, including Hinglish written in Roman script." },
  { id: "w4", date: "11 Oct 2026", tag: "Improved", title: "Faster missed-call text-back", body: "Median text-back time dropped from 42s to 9s on Exotel and Knowlarity numbers." },
  { id: "w5", date: "04 Oct 2026", tag: "Fixed", title: "Razorpay payouts reconciliation", body: "Payouts with partial refunds now match invoices correctly in Payments → Payouts." },
];

export type StatusLevel = "operational" | "degraded" | "outage";

export const systemStatus: { name: string; status: StatusLevel; note?: string; uptime: number; history: StatusLevel[] }[] = [
  { name: "Web app & API", status: "operational", uptime: 99.98, history: Array.from({ length: 30 }, () => "operational" as StatusLevel) },
  { name: "AI agent (replies)", status: "operational", uptime: 99.95, history: Array.from({ length: 30 }, (_, i) => (i === 19 ? "degraded" : "operational") as StatusLevel) },
  { name: "WhatsApp (Meta Cloud API)", status: "degraded", note: "Meta is reporting delayed template delivery in India (≈2 min). Messages are queued, none lost.", uptime: 99.71, history: Array.from({ length: 30 }, (_, i) => (i === 29 || i === 11 ? "degraded" : "operational") as StatusLevel) },
  { name: "SMS (DLT routes)", status: "operational", uptime: 99.9, history: Array.from({ length: 30 }, (_, i) => (i === 6 ? "outage" : "operational") as StatusLevel) },
  { name: "Payments (Razorpay, Stripe)", status: "operational", uptime: 100, history: Array.from({ length: 30 }, () => "operational" as StatusLevel) },
  { name: "Calendar sync", status: "operational", uptime: 99.96, history: Array.from({ length: 30 }, () => "operational" as StatusLevel) },
];

export const faqAnswers: { match: RegExp; question: string; answer: string; links: { label: string; href: string }[] }[] = [
  {
    match: /whatsapp|template|connect/i,
    question: "How do I connect WhatsApp and get templates approved?",
    answer:
      "Go to Settings → Channels and click “Connect WhatsApp”. You'll log in with Facebook, pick your Business Manager and verify your number with an OTP; it takes about 2 minutes. Your existing WhatsApp Business app number can be migrated without losing chats.\n\nFor marketing broadcasts you need approved templates. In Campaigns → Templates, write the message (Anvita suggests Hindi/English variants), choose the Marketing category and submit. Meta usually approves within 15 minutes to 24 hours. Tip: avoid ALL-CAPS and too many emojis; it speeds up approval.",
    links: [
      { label: "Channel settings", href: "/settings?tab=channels" },
      { label: "Campaign templates", href: "/campaigns" },
    ],
  },
  {
    match: /hand ?off|escalat|human|takeover/i,
    question: "When does the AI hand a conversation to my team?",
    answer:
      "The AI escalates when any escalation rule matches: negative sentiment, a complaint, a refund request, a medical emergency keyword, or when its confidence drops below your threshold (currently 70%). The assignee gets a push and WhatsApp alert with a 3-line AI summary, and the AI tells the customer a human is joining.\n\nYou can change rules and thresholds in AI Agent → Rules, and test them in the sandbox first.",
    links: [
      { label: "Escalation rules", href: "/agent" },
      { label: "Open inbox", href: "/inbox" },
    ],
  },
  {
    match: /pay|upi|razorpay|invoice/i,
    question: "How do pay links work?",
    answer:
      "Anvita creates Razorpay (or Stripe) pay links that customers can pay by UPI, card or netbanking. The AI can send a deposit link automatically when it books a slot. You can also send one from any contact or conversation with the ₹ button.\n\nPaid links update the booking and create a GST invoice automatically. Unpaid links get polite reminders after 24h and 72h, and overdue ones appear in your Tasks.",
    links: [
      { label: "Payments", href: "/payments" },
      { label: "Tasks", href: "/tasks" },
    ],
  },
];

export const defaultAiAnswer = {
  answer:
    "Here's how to get set up quickly:\n\n1. Import your business from your website (services, prices, hours, FAQs).\n2. Connect WhatsApp and website chat, the two channels most of your leads use.\n3. Test your AI agent in the sandbox with a few real questions.\n4. Go live in Copilot mode first: the AI drafts, your team approves. Switch to Autopilot once you're confident.\n\nMost clinics are live in under 30 minutes.",
  links: [
    { label: "Resume setup", href: "/onboarding" },
    { label: "AI agent sandbox", href: "/agent?tab=sandbox" },
  ],
};
