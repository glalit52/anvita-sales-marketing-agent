import type { Channel } from "@/components/ui/channel";
import { formatCurrency } from "@/lib/format";
import { contacts as coreContacts, type Contact } from "./core";

/**
 * Mock data for the "Sell" modules: Contacts, Pipeline, Calendar, Payments.
 * Builds on the shared contacts in core.ts (ids c1..c12) and adds more.
 * Demo "now" is Tue 27 Oct 2026, 11:20 AM IST.
 */

export const NOW = { dayIndex: 1, hour: 11 + 20 / 60, label: "Tue, 27 Oct" };
export const CURRENT_USER_ID = "u1";

/* ------------------------------------------------------------------ */
/* Contacts                                                            */
/* ------------------------------------------------------------------ */

export const extraContacts: Contact[] = [
  { id: "c13", name: "Tanvi Gokhale", phone: "+91 98901 45612", email: "tanvi.gokhale@gmail.com", city: "Pune", stage: "booked", source: "Google Business", channel: "whatsapp", tags: ["cleaning", "new patient"], ownerId: "ai", score: 77, value: 2500, lastActivity: "25m ago", createdAt: "2026-10-26", language: "Marathi" },
  { id: "c14", name: "Kunal Shah", phone: "+91 99225 78123", email: "kunal.shah@icloud.com", city: "Pune", stage: "qualified", source: "Google Ads", channel: "whatsapp", tags: ["implants", "emi"], ownerId: "u2", score: 83, value: 120000, lastActivity: "48m ago", createdAt: "2026-10-22", language: "Gujarati" },
  { id: "c15", name: "Riya Kapoor", phone: "+91 97640 33218", email: "riya.kapoor@gmail.com", city: "Pune", stage: "customer", source: "Instagram ad", channel: "instagram", tags: ["aligners", "vip"], ownerId: "u3", score: 90, value: 92000, lastActivity: "3h ago", createdAt: "2026-06-14", language: "Hindi" },
  { id: "c16", name: "Vivek Bhosale", phone: "+91 98221 90876", city: "Pune", stage: "new", source: "Missed call", channel: "voice", tags: ["toothache"], ownerId: "ai", score: 62, value: 3500, lastActivity: "4h ago", createdAt: "2026-10-27", language: "Marathi" },
  { id: "c17", name: "Zoya Mirza", phone: "+91 90960 11290", email: "zoya.mirza@outlook.com", city: "Pune", stage: "qualified", source: "Website chat", channel: "webchat", tags: ["whitening", "wedding"], ownerId: "ai", score: 80, value: 14000, lastActivity: "6h ago", createdAt: "2026-10-24", language: "Hindi" },
  { id: "c18", name: "Lakshmi Narayanan", phone: "+91 94440 21876", email: "lakshmi.n@gmail.com", city: "Pune", stage: "customer", source: "Referral", channel: "sms", tags: ["root canal"], ownerId: "u4", score: 71, value: 21000, lastActivity: "1d ago", createdAt: "2026-08-03", language: "Tamil" },
  { id: "c19", name: "Aarav Joshi", phone: "+91 98508 66104", city: "Pune", stage: "lost", source: "Facebook", channel: "facebook", tags: ["braces", "price shopper"], ownerId: "ai", score: 31, value: 45000, lastActivity: "4d ago", createdAt: "2026-10-05", language: "Marathi" },
  { id: "c20", name: "Ishita Sen", phone: "+91 98300 45091", email: "ishita.sen@gmail.com", city: "Pune", stage: "booked", source: "Google Ads", channel: "whatsapp", tags: ["kids dentistry"], ownerId: "ai", score: 76, value: 1600, lastActivity: "1d ago", createdAt: "2026-10-23", language: "Bengali" },
  { id: "c21", name: "Sanjay Patil", phone: "+91 98230 77412", email: "sanjay@krishisevakendra.in", company: "Krishi Seva Kendra", city: "Ahmednagar", stage: "qualified", source: "Prospecting", channel: "whatsapp", tags: ["b2b", "dealer", "fertiliser"], ownerId: "u1", score: 81, value: 320000, lastActivity: "2h ago", createdAt: "2026-10-14", language: "Marathi" },
  { id: "c22", name: "Manoj Jadhav", phone: "+91 97302 18845", email: "manoj@shetkariagro.com", company: "Shetkari Agro", city: "Kolhapur", stage: "prospect", source: "Prospecting", channel: "email", tags: ["b2b", "dealer"], ownerId: "ai", score: 66, value: 150000, lastActivity: "5h ago", createdAt: "2026-10-21", language: "Marathi" },
  { id: "c23", name: "Kavita Deshmukh", phone: "+91 94220 63390", email: "kavita@greenfieldagro.in", company: "GreenField Agro", city: "Chh. Sambhajinagar", stage: "booked", source: "Webinar", channel: "email", tags: ["b2b", "seeds"], ownerId: "u1", score: 79, value: 275000, lastActivity: "1d ago", createdAt: "2026-10-08", language: "Marathi" },
  { id: "c24", name: "Harish Gupta", phone: "+91 98260 55107", email: "harish@bharatkrishi.in", company: "Bharat Krishi Kendra", city: "Indore", stage: "customer", source: "Referral", channel: "whatsapp", tags: ["b2b", "dealer", "annual plan"], ownerId: "u1", score: 87, value: 410000, lastActivity: "2d ago", createdAt: "2026-07-29", language: "Hindi" },
  { id: "c25", name: "Nitin Shinde", phone: "+91 90110 42277", email: "nitin@jaikisaninputs.com", company: "Jai Kisan Inputs", city: "Solapur", stage: "prospect", source: "Prospecting", channel: "linkedin", tags: ["b2b"], ownerId: "ai", score: 49, value: 120000, lastActivity: "3d ago", createdAt: "2026-10-19", language: "Marathi" },
  { id: "c26", name: "Ganesh Pawar", phone: "+91 98812 30419", email: "ganesh@sahyadriagri.in", company: "Sahyadri Agri Traders", city: "Satara", stage: "lost", source: "Trade show", channel: "voice", tags: ["b2b", "budget"], ownerId: "u1", score: 28, value: 95000, lastActivity: "6d ago", createdAt: "2026-09-16", language: "Marathi" },
];

export const allContacts: Contact[] = [...coreContacts, ...extraContacts];
export const sellContactById = (id: string) => allContacts.find((c) => c.id === id);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-10-26" → "26 Oct 2026" */
export function formatIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${months[m - 1]} ${y}`;
}

/** "2m ago" / "3h ago" / "2d ago" → minutes, for sorting. */
export function minutesAgo(label: string) {
  const m = /(\d+)\s*([mhd])/.exec(label);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const n = Number(m[1]);
  return m[2] === "m" ? n : m[2] === "h" ? n * 60 : n * 1440;
}

export type ConsentStatus = "opted_in" | "opted_out" | "unknown";
export interface ConsentRecord {
  channel: "whatsapp" | "sms" | "email";
  status: ConsentStatus;
  source: string;
  date: string;
}

const consentOverrides: Record<string, Partial<Record<ConsentRecord["channel"], Omit<ConsentRecord, "channel">>>> = {
  c1: {
    whatsapp: { status: "opted_in", source: "Click-to-WhatsApp ad · replied “Yes” to opt-in prompt", date: "26 Oct 2026, 11:40 PM" },
    sms: { status: "opted_in", source: "Booking form checkbox", date: "26 Oct 2026, 11:43 PM" },
    email: { status: "unknown", source: "No marketing consent captured yet", date: "—" },
  },
  c2: {
    whatsapp: { status: "unknown", source: "Not asked", date: "—" },
    sms: { status: "opted_in", source: "Paper consent form at Koregaon Park reception", date: "12 Sep 2026" },
    email: { status: "opted_out", source: "Unsubscribed from “Monsoon smile” newsletter", date: "02 Oct 2026" },
  },
  c6: {
    whatsapp: { status: "opted_out", source: "Replied “STOP” to Diwali offer", date: "20 Oct 2026" },
    sms: { status: "opted_out", source: "DND registry (TRAI NCPR) match", date: "10 Oct 2026" },
    email: { status: "unknown", source: "Not asked", date: "—" },
  },
  c8: {
    whatsapp: { status: "unknown", source: "B2B: no WhatsApp opt-in, email-first", date: "—" },
    sms: { status: "unknown", source: "Not asked", date: "—" },
    email: { status: "opted_in", source: "Legitimate interest (B2B outreach) · unsubscribe link in every email", date: "20 Oct 2026" },
  },
};

export function consentFor(contact: Contact): ConsentRecord[] {
  const o = consentOverrides[contact.id];
  const channels: ConsentRecord["channel"][] = ["whatsapp", "sms", "email"];
  return channels.map((channel) => {
    if (o?.[channel]) return { channel, ...o[channel]! };
    const isB2b = contact.tags.includes("b2b");
    if (channel === "whatsapp")
      return contact.channel === "whatsapp" || contact.channel === "voice"
        ? { channel, status: "opted_in", source: contact.channel === "voice" ? "Missed-call text-back · replied to opt-in" : "Inbound WhatsApp chat · opt-in prompt accepted", date: formatIsoDate(contact.createdAt) }
        : { channel, status: "unknown", source: "Not asked", date: "—" };
    if (channel === "sms")
      return contact.stage === "customer" || contact.stage === "booked"
        ? { channel, status: "opted_in", source: "Booking form checkbox", date: formatIsoDate(contact.createdAt) }
        : { channel, status: "unknown", source: "Not asked", date: "—" };
    return contact.email
      ? { channel, status: isB2b ? "opted_in" : "unknown", source: isB2b ? "Legitimate interest (B2B outreach)" : "Transactional only", date: isB2b ? formatIsoDate(contact.createdAt) : "—" }
      : { channel, status: "unknown", source: "No email on file", date: "—" };
  });
}

export const aiSummaries: Record<string, string> = {
  c1: "New patient from the Google Ads whitening campaign. Price-checked ₹8k–12k, booked a whitening consult Sat 31 Oct 10:00 at Koregaon Park and paid the ₹500 deposit by UPI within 2 min. High intent; likely to convert to the ₹12,000 laser package.",
  c2: "Existing root-canal patient (Sept). Temporary filling came off twice; frustrated and escalated to Arjun. Priority slot today 4:30 PM with Dr. Kulkarni, no charge. Handle with care: churn and bad-review risk.",
  c3: "Parent enquiring for her 14-year-old. Interested in ceramic braces (₹45,000), budget confirmed, prefers weekday evenings. Waiting to book an ortho assessment with Dr. Mehra.",
  c4: "Came from an Instagram implant reel. Asked for single-implant price and EMI. AI shared 0% EMI over 6 months. Awaiting reply for 30 min; suggest a WhatsApp follow-up with EMI calculator.",
  c5: "Loyal VIP since March, 4 visits, always pays on time. Left a 5★ Google review today. Good candidate for the family referral programme.",
  c8: "Owner of AgriGrow Inputs (Nashik), 2 new outlets this year. Replied to sequence step 2: interested, wants a call Thursday afternoon. Pain point: stock-outs during kharif season.",
  c14: "Wants full-arch implants, quoted ₹1.2L. Asked about Bajaj Finserv EMI and the warranty. Visited the Baner clinic for a CBCT scan last week; treatment plan sent, awaiting decision.",
  c21: "Fertiliser and seed dealer in Ahmednagar with ~1,800 farmer customers. Demo done 22 Oct, wants pricing for 3 outlets. Decision before Rabi season starts (mid-Nov).",
};

export function aiSummaryFor(contact: Contact) {
  return (
    aiSummaries[contact.id] ??
    `${contact.name.split(" ")[0]} came in via ${contact.source} and prefers ${contact.language}. Interested in ${contact.tags.filter((t) => t !== "b2b").join(", ") || "our services"}. Lead score ${contact.score}/100 based on engagement, budget signals and response speed.`
  );
}

export type TimelineType = "message" | "booking" | "payment" | "review" | "sequence" | "stage" | "note" | "ai";
export interface TimelineEvent {
  id: string;
  type: TimelineType;
  title: string;
  detail?: string;
  time: string;
  channel?: Channel;
  actor?: string;
}

const timelines: Record<string, TimelineEvent[]> = {
  c1: [
    { id: "t1", type: "message", title: "Replied: “Done, paid. See you Saturday at 10!”", time: "Today, 11:46 PM", channel: "whatsapp" },
    { id: "t2", type: "payment", title: "₹500 deposit paid", detail: "UPI · pay_Nx81kQ2 · Razorpay", time: "Today, 11:45 PM" },
    { id: "t3", type: "booking", title: "Whitening consultation booked by AI", detail: "Sat 31 Oct · 10:00 AM · Koregaon Park · Dr. Aditi Kulkarni", time: "Today, 11:43 PM", actor: "AI" },
    { id: "t4", type: "stage", title: "Stage changed: New lead → Booked", time: "Today, 11:43 PM", actor: "AI" },
    { id: "t5", type: "ai", title: "AI answered pricing question", detail: "Cited “Price list 2026”. Confidence 96%", time: "Today, 11:40 PM", channel: "whatsapp" },
    { id: "t6", type: "message", title: "First message: “Do you do teeth whitening?”", detail: "Source: Google Ads · Whitening Pune · UTM campaign=diwali-smile", time: "Today, 11:40 PM", channel: "whatsapp" },
  ],
  c2: [
    { id: "t1", type: "note", title: "Arjun: Dr. Kulkarni can see him at 4:30 PM today. Offer it, no charge.", time: "Today, 10:05 AM", actor: "Arjun Patil" },
    { id: "t2", type: "ai", title: "Escalated to Arjun Patil", detail: "Negative sentiment + complaint intent", time: "Today, 10:02 AM", actor: "AI" },
    { id: "t3", type: "message", title: "“My temporary filling came off again.”", time: "Today, 10:02 AM", channel: "sms" },
    { id: "t4", type: "payment", title: "₹18,500 paid: Root canal (molar)", detail: "Card · Invoice INV-0987", time: "18 Sep" },
    { id: "t5", type: "booking", title: "Root canal, sitting 2 of 2", detail: "Koregaon Park · Dr. Aditi Kulkarni", time: "18 Sep" },
    { id: "t6", type: "sequence", title: "Post-treatment care sequence · step 1 sent", detail: "SMS: aftercare instructions", time: "18 Sep", channel: "sms" },
  ],
  c5: [
    { id: "t1", type: "review", title: "Left a 5★ Google review", detail: "“Painless cleaning and super friendly staff at Koregaon Park!”", time: "Today, 12:31 PM", channel: "google" },
    { id: "t2", type: "message", title: "AI sent review request", time: "Today, 12:10 PM", channel: "whatsapp", actor: "AI" },
    { id: "t3", type: "payment", title: "₹2,500 paid: Cleaning & polishing", detail: "UPI · GPay", time: "Today, 11:52 AM" },
    { id: "t4", type: "booking", title: "Cleaning & polishing completed", detail: "Koregaon Park · Hygienist Ritu Pawar", time: "Today, 11:00 AM" },
    { id: "t5", type: "sequence", title: "6-month recall reminder sent", time: "02 Oct", channel: "whatsapp", actor: "AI" },
  ],
  c8: [
    { id: "t1", type: "ai", title: "AI drafted reply with 3 Thursday slots", detail: "Copilot draft awaiting approval", time: "Today, 7:16 AM", actor: "AI" },
    { id: "t2", type: "message", title: "Replied: “Can we talk Thursday afternoon?”", detail: "Classified: Interested · 94%", time: "Today, 7:15 AM", channel: "email" },
    { id: "t3", type: "sequence", title: "Sequence “Agri dealers, Maharashtra” · step 2 sent", detail: "Email · opened 3× · clicked case study", time: "Mon, 9:00 AM", channel: "email" },
    { id: "t4", type: "sequence", title: "Step 1 · LinkedIn connection request accepted", time: "22 Oct", channel: "linkedin" },
    { id: "t5", type: "stage", title: "Added from prospect search", detail: "“Agri-input dealers in Maharashtra, 4★+, with website”", time: "20 Oct", actor: "AI" },
  ],
};

export function timelineFor(contact: Contact): TimelineEvent[] {
  if (timelines[contact.id]) return timelines[contact.id];
  const first = contact.name.split(" ")[0];
  const events: TimelineEvent[] = [
    { id: "g1", type: "message", title: `Last message from ${first}`, detail: `via ${contact.source}`, time: contact.lastActivity, channel: contact.channel },
  ];
  if (contact.stage === "booked" || contact.stage === "customer")
    events.push({ id: "g2", type: "booking", title: "Appointment booked", detail: contact.tags[0] ? `${contact.tags[0][0].toUpperCase()}${contact.tags[0].slice(1)} · Koregaon Park` : "Consultation", time: "Earlier", actor: contact.ownerId === "ai" ? "AI" : undefined });
  if (contact.stage === "customer")
    events.push({ id: "g3", type: "payment", title: `${formatCurrency(contact.value)} paid`, detail: "UPI · Razorpay", time: "Earlier" });
  events.push({ id: "g4", type: "ai", title: "AI qualified the lead", detail: `Score ${contact.score}/100 · language ${contact.language}`, time: "Earlier", actor: "AI" });
  events.push({ id: "g5", type: "stage", title: "Contact created", detail: `Source: ${contact.source}`, time: formatIsoDate(contact.createdAt) });
  return events;
}

export interface ContactNote {
  id: string;
  author: string;
  body: string;
  time: string;
}

export const contactNotes: Record<string, ContactNote[]> = {
  c1: [{ id: "n1", author: "Priya Sharma", body: "Mentioned a wedding in Dec. Offer the bridal whitening package if the consult goes well.", time: "Today, 8:10 AM" }],
  c2: [
    { id: "n1", author: "Arjun Patil", body: "@Neha please waive today's visit fee. Second time the temp filling failed.", time: "Today, 10:06 AM" },
    { id: "n2", author: "Neha Kulkarni", body: "Approved. Also flag for Dr. Kulkarni to use GIC this time.", time: "Today, 10:20 AM" },
  ],
  c8: [{ id: "n1", author: "Priya Sharma", body: "Decision-maker. Brother runs the Malegaon outlet; possible 3-outlet deal.", time: "Mon, 6:40 PM" }],
};

export const savedSequences = [
  { id: "s1", name: "New patient nurture (7 days)", steps: 4, channel: "whatsapp" as Channel },
  { id: "s2", name: "Implant EMI follow-up", steps: 3, channel: "whatsapp" as Channel },
  { id: "s3", name: "6-month recall", steps: 2, channel: "sms" as Channel },
  { id: "s4", name: "Agri dealers, Maharashtra", steps: 5, channel: "email" as Channel },
];

export const sources = ["Google Ads", "Instagram ad", "Facebook", "Website chat", "Google Business", "Missed call", "Walk-in", "Referral", "Prospecting", "Webinar", "Trade show"];

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

export type PipelineId = "patients" | "b2b";
export type DealStage = "new" | "qualified" | "booked" | "proposal" | "won" | "lost";

export const pipelines: Record<PipelineId, { label: string; description: string; stages: Record<DealStage, string> }> = {
  patients: {
    label: "Patients – Pune clinics",
    description: "Treatment deals across Koregaon Park & Baner",
    stages: { new: "New lead", qualified: "Qualified", booked: "Booked", proposal: "Treatment plan", won: "Won", lost: "Lost" },
  },
  b2b: {
    label: "B2B – Agri dealers",
    description: "Annual plans for agri-input dealers",
    stages: { new: "New lead", qualified: "Qualified", booked: "Demo booked", proposal: "Proposal", won: "Won", lost: "Lost" },
  },
};

export const dealStages: DealStage[] = ["new", "qualified", "booked", "proposal", "won", "lost"];

export const stageProbability: Record<DealStage, number> = { new: 10, qualified: 30, booked: 50, proposal: 70, won: 100, lost: 0 };

export interface Deal {
  id: string;
  pipeline: PipelineId;
  title: string;
  contactId: string;
  value: number;
  stage: DealStage;
  ownerId: string | "ai";
  nextStep: string;
  nextStepDue: string;
  daysInStage: number;
  channel: Channel;
  expectedClose: string;
  nba: { title: string; body: string; cta: string };
  lostReason?: string;
}

export const deals: Deal[] = [
  { id: "d1", pipeline: "patients", title: "Laser whitening package", contactId: "c1", value: 12000, stage: "booked", ownerId: "ai", nextStep: "Consult Sat 10:00, KP", nextStepDue: "Sat", daysInStage: 0, channel: "whatsapp", expectedClose: "31 Oct", nba: { title: "Send pre-visit shade guide", body: "Patients who receive the shade guide before the consult convert to the full package 34% more often. AI can send it Friday 6 PM with the T-24h reminder.", cta: "Schedule with reminder" } },
  { id: "d2", pipeline: "patients", title: "Ceramic braces (teen)", contactId: "c3", value: 45000, stage: "qualified", ownerId: "ai", nextStep: "Offer Wed 6:30 PM ortho slot", nextStepDue: "Today", daysInStage: 1, channel: "webchat", expectedClose: "15 Nov", nba: { title: "Offer a weekday-evening slot now", body: "Parent prefers weekday evenings. Dr. Mehra has Wed 6:30 PM free at Baner. Offering a specific slot lifts booking rate from 41% to 63%.", cta: "Send slot on WhatsApp" } },
  { id: "d3", pipeline: "patients", title: "Single implant + crown", contactId: "c4", value: 60000, stage: "new", ownerId: "ai", nextStep: "Answer EMI question", nextStepDue: "Now", daysInStage: 0, channel: "instagram", expectedClose: "30 Nov", nba: { title: "Reply with the EMI calculator", body: "Karan asked about EMI 32 min ago. Share 0% EMI (6 × ₹10,000 via Bajaj Finserv) and offer a free CBCT scan this week.", cta: "Draft reply" } },
  { id: "d4", pipeline: "patients", title: "Clear aligners", contactId: "c9", value: 85000, stage: "qualified", ownerId: "ai", nextStep: "Follow up on brochure", nextStepDue: "Thu", daysInStage: 2, channel: "facebook", expectedClose: "20 Nov", nba: { title: "Book a free 3D scan", body: "Pooja opened the aligner brochure twice. Leads offered a free 3D scan book within 48h 2.1× more often.", cta: "Offer 3D scan" } },
  { id: "d5", pipeline: "patients", title: "Full-arch implants", contactId: "c14", value: 120000, stage: "proposal", ownerId: "u2", nextStep: "Call about EMI approval", nextStepDue: "Today", daysInStage: 6, channel: "whatsapp", expectedClose: "05 Nov", nba: { title: "Treatment plan is going cold", body: "No reply in 6 days after the plan was sent. Similar patients respond to a call from the doctor. Suggest Dr. Kulkarni calls today 6 PM; AI has drafted talking points.", cta: "Create call task" } },
  { id: "d6", pipeline: "patients", title: "Wedding whitening", contactId: "c17", value: 14000, stage: "qualified", ownerId: "ai", nextStep: "Confirm date before 12 Dec wedding", nextStepDue: "Fri", daysInStage: 3, channel: "webchat", expectedClose: "10 Nov", nba: { title: "Create urgency with the wedding date", body: "Whitening needs 2 sittings 10 days apart. Suggest booking by 15 Nov to be ready for 12 Dec.", cta: "Send timeline" } },
  { id: "d7", pipeline: "patients", title: "Emergency consult", contactId: "c7", value: 3500, stage: "booked", ownerId: "ai", nextStep: "Visit today 5:00 PM, Baner", nextStepDue: "Today", daysInStage: 0, channel: "voice", expectedClose: "27 Oct", nba: { title: "Collect deposit to cut no-show risk", body: "Same-day emergency slots no-show 18% of the time without a deposit. Send a ₹300 UPI link with the directions.", cta: "Send ₹300 pay link" } },
  { id: "d8", pipeline: "patients", title: "Cleaning & polishing", contactId: "c13", value: 2500, stage: "booked", ownerId: "ai", nextStep: "Visit Thu 9:30 AM", nextStepDue: "Thu", daysInStage: 1, channel: "whatsapp", expectedClose: "29 Oct", nba: { title: "Upsell whitening at checkout", body: "62% of cleaning patients aged 25–35 accept a whitening offer at checkout. Prepare a 10% bundle offer.", cta: "Add offer to visit" } },
  { id: "d9", pipeline: "patients", title: "Kids check-up", contactId: "c12", value: 4000, stage: "new", ownerId: "ai", nextStep: "Re-engage: no booking for 2 days", nextStepDue: "Today", daysInStage: 2, channel: "webchat", expectedClose: "08 Nov", nba: { title: "Re-engage with Saturday slots", body: "Dr. Shah has 3 Saturday slots. Parents respond best to weekend offers on WhatsApp after 7 PM.", cta: "Queue re-engagement" } },
  { id: "d10", pipeline: "patients", title: "Root canal re-treatment", contactId: "c2", value: 0, stage: "won", ownerId: "u2", nextStep: "Priority visit 4:30 PM (free)", nextStepDue: "Today", daysInStage: 40, channel: "sms", expectedClose: "18 Sep", nba: { title: "Protect this relationship", body: "Complaint today. After the visit, send a personal note from Dr. Kulkarni and hold the review request for 7 days.", cta: "Schedule note" } },
  { id: "d11", pipeline: "patients", title: "Aligners (Invisalign Lite)", contactId: "c15", value: 92000, stage: "won", ownerId: "u3", nextStep: "Tray 6 check-in", nextStepDue: "12 Nov", daysInStage: 120, channel: "instagram", expectedClose: "14 Jun", nba: { title: "Ask for a referral", body: "Riya rated the treatment 10/10. Offer ₹2,000 credit for each friend who books a consult.", cta: "Send referral offer" } },
  { id: "d12", pipeline: "patients", title: "Braces", contactId: "c19", value: 45000, stage: "lost", ownerId: "ai", nextStep: "Win-back in 60 days", nextStepDue: "Dec", daysInStage: 9, channel: "facebook", expectedClose: "—", lostReason: "Chose a cheaper clinic", nba: { title: "Plan a win-back", body: "Lost on price. In 60 days, AI can share the new 0% EMI plan, which brings monthly cost below the competitor's.", cta: "Schedule win-back" } },
  { id: "d13", pipeline: "patients", title: "Kids check-up + fluoride", contactId: "c20", value: 1600, stage: "booked", ownerId: "ai", nextStep: "Visit Sat 11:30 AM", nextStepDue: "Sat", daysInStage: 3, channel: "whatsapp", expectedClose: "31 Oct", nba: { title: "Send a kid-friendly prep video", body: "Parents who get the 60-second “first visit” video have 40% fewer reschedules.", cta: "Send video" } },
  { id: "d14", pipeline: "patients", title: "Toothache consult", contactId: "c16", value: 3500, stage: "new", ownerId: "ai", nextStep: "AI texting back after missed call", nextStepDue: "Now", daysInStage: 0, channel: "voice", expectedClose: "28 Oct", nba: { title: "Offer today 6:15 PM at Baner", body: "Pain mentioned. Prioritise a same-day slot; Baner has 6:15 PM free.", cta: "Offer slot" } },
  { id: "d15", pipeline: "patients", title: "Whitening", contactId: "c11", value: 12000, stage: "won", ownerId: "u2", nextStep: "Touch-up reminder", nextStepDue: "Jan", daysInStage: 70, channel: "email", expectedClose: "18 Jul", nba: { title: "Touch-up in January", body: "Whitening touch-ups at 6 months keep results. Schedule an automatic reminder.", cta: "Schedule reminder" } },

  { id: "d21", pipeline: "b2b", title: "AgriGrow: 3-outlet annual plan", contactId: "c8", value: 240000, stage: "booked", ownerId: "u1", nextStep: "Discovery call Thu 3:30 PM", nextStepDue: "Thu", daysInStage: 0, channel: "email", expectedClose: "30 Nov", nba: { title: "Approve the AI reply and lock Thursday", body: "Rahul asked for Thursday afternoon. Copilot drafted 3 slots. Approving now keeps the response under 4h (reply-to-meeting rate drops 30% after a day).", cta: "Approve draft" } },
  { id: "d22", pipeline: "b2b", title: "Krishi Seva Kendra: 3 outlets", contactId: "c21", value: 320000, stage: "proposal", ownerId: "u1", nextStep: "Send revised pricing", nextStepDue: "Today", daysInStage: 4, channel: "whatsapp", expectedClose: "12 Nov", nba: { title: "Anchor on Rabi-season ROI", body: "Sanjay compared us to a spreadsheet. Share the AgriGrow case study (stock-outs −38%) and a 3-outlet bundle at ₹2.9L.", cta: "Generate proposal" } },
  { id: "d23", pipeline: "b2b", title: "Shetkari Agro: pilot", contactId: "c22", value: 150000, stage: "new", ownerId: "ai", nextStep: "Sequence step 3 (WhatsApp)", nextStepDue: "Wed", daysInStage: 5, channel: "email", expectedClose: "15 Dec", nba: { title: "Switch channel to WhatsApp", body: "2 emails opened, no reply. Dealers in Kolhapur reply 3× more on WhatsApp in Marathi.", cta: "Send Marathi WhatsApp" } },
  { id: "d24", pipeline: "b2b", title: "GreenField Agro: seeds module", contactId: "c23", value: 275000, stage: "booked", ownerId: "u1", nextStep: "Demo Fri 11:00 AM (Meet)", nextStepDue: "Fri", daysInStage: 2, channel: "email", expectedClose: "25 Nov", nba: { title: "Prep a tailored demo", body: "Kavita's website lists 40+ seed SKUs. AI prepared a demo dataset with her catalogue.", cta: "Open demo prep" } },
  { id: "d25", pipeline: "b2b", title: "Bharat Krishi Kendra: renewal", contactId: "c24", value: 410000, stage: "won", ownerId: "u1", nextStep: "Kick-off for 2nd outlet", nextStepDue: "05 Nov", daysInStage: 12, channel: "whatsapp", expectedClose: "15 Oct", nba: { title: "Expansion opportunity", body: "Harish mentioned a new Dewas outlet. Propose adding it at 15% off the list price.", cta: "Draft upsell" } },
  { id: "d26", pipeline: "b2b", title: "Jai Kisan Inputs: intro", contactId: "c25", value: 120000, stage: "new", ownerId: "ai", nextStep: "LinkedIn follow-up", nextStepDue: "Thu", daysInStage: 8, channel: "linkedin", expectedClose: "20 Dec", nba: { title: "Find a warmer contact", body: "No response in 8 days. Enrichment found the operations head, Pradeep Shinde, with a verified phone number.", cta: "Add to sequence" } },
  { id: "d27", pipeline: "b2b", title: "Kisan Mart: 5 stores", contactId: "c10", value: 180000, stage: "qualified", ownerId: "u1", nextStep: "Book demo with ops head", nextStepDue: "Mon", daysInStage: 3, channel: "linkedin", expectedClose: "10 Dec", nba: { title: "Send Telugu one-pager", body: "Suresh shared the deck with his ops head. A Telugu one-pager can speed up the internal buy-in.", cta: "Generate one-pager" } },
  { id: "d28", pipeline: "b2b", title: "Sahyadri Agri: annual plan", contactId: "c26", value: 95000, stage: "lost", ownerId: "u1", nextStep: "Revisit after harvest", nextStepDue: "Feb", daysInStage: 21, channel: "voice", expectedClose: "—", lostReason: "No budget this season", nba: { title: "Revisit in February", body: "Budget freed after the Rabi harvest. AI will re-engage on 1 Feb with a seasonal offer.", cta: "Schedule re-engage" } },
];

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

export type Location = "kp" | "baner";
export const locationLabel: Record<Location, string> = { kp: "Koregaon Park", baner: "Baner" };

export interface Provider {
  id: string;
  name: string;
  role: string;
  /** index into the chart series palette, used for appointment color */
  color: number;
  locations: Location[];
}

export const providers: Provider[] = [
  { id: "p1", name: "Dr. Aditi Kulkarni", role: "General & cosmetic", color: 0, locations: ["kp", "baner"] },
  { id: "p2", name: "Dr. Sameer Mehra", role: "Orthodontist", color: 1, locations: ["baner"] },
  { id: "p3", name: "Dr. Nisha Shah", role: "Paediatric dentist", color: 2, locations: ["kp"] },
  { id: "p4", name: "Ritu Pawar", role: "Hygienist", color: 3, locations: ["kp", "baner"] },
];

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  deposit: number;
  online: boolean;
}

export const services: Service[] = [
  { id: "sv1", name: "Consultation", duration: 20, price: 500, deposit: 0, online: true },
  { id: "sv2", name: "Whitening consultation", duration: 30, price: 500, deposit: 500, online: true },
  { id: "sv3", name: "Laser whitening", duration: 60, price: 12000, deposit: 2000, online: true },
  { id: "sv4", name: "Cleaning & polishing", duration: 45, price: 2500, deposit: 0, online: true },
  { id: "sv5", name: "Root canal (per sitting)", duration: 90, price: 8500, deposit: 1000, online: false },
  { id: "sv6", name: "Implant consultation + CBCT", duration: 45, price: 1500, deposit: 500, online: true },
  { id: "sv7", name: "Ortho assessment", duration: 45, price: 1000, deposit: 500, online: true },
  { id: "sv8", name: "Kids check-up", duration: 30, price: 800, deposit: 0, online: true },
  { id: "sv9", name: "Emergency visit", duration: 30, price: 1000, deposit: 300, online: true },
];

export type ReminderStatus = "read" | "delivered" | "sent" | "scheduled" | "failed";
export type AppointmentStatus = "confirmed" | "unconfirmed" | "completed" | "no-show" | "cancelled" | "checked-in";

export interface Appointment {
  id: string;
  contactId?: string;
  patient: string;
  phone: string;
  serviceId: string;
  providerId: string;
  location: Location;
  /** 0 = Monday … 6 = Sunday, in the week of 26 Oct 2026 */
  day: number;
  /** start hour as a decimal, e.g. 10.5 = 10:30 */
  start: number;
  duration: number;
  bookedBy: "ai" | "staff" | "online";
  bookedVia?: Channel;
  status: AppointmentStatus;
  deposit: { amount: number; status: "paid" | "pending" | "none" | "refunded" };
  reminders: { label: "T-24h" | "T-2h"; channel: Channel; status: ReminderStatus; at: string }[];
  notes?: string;
}

export const weekDays = [
  { short: "Mon", date: 26 },
  { short: "Tue", date: 27 },
  { short: "Wed", date: 28 },
  { short: "Thu", date: 29 },
  { short: "Fri", date: 30 },
  { short: "Sat", date: 31 },
  { short: "Sun", date: 1 },
];

type ApptSeed = [
  id: string,
  contactId: string | undefined,
  patient: string,
  serviceId: string,
  providerId: string,
  location: Location,
  day: number,
  start: number,
  bookedBy: Appointment["bookedBy"],
  channel: Channel | undefined,
  status?: AppointmentStatus,
  notes?: string,
];

const seeds: ApptSeed[] = [
  ["a1", "c5", "Meera Nair", "sv4", "p4", "kp", 1, 11, "staff", undefined, "completed", "VIP. Prefers the window chair."],
  ["a2", "c2", "Rohit Mehta", "sv1", "p1", "kp", 1, 16.5, "staff", "sms", "confirmed", "Priority slot after complaint. Fee waived. Use GIC for the filling."],
  ["a3", "c7", "Fatima Shaikh", "sv9", "p1", "baner", 1, 17, "ai", "voice", "confirmed", "Severe toothache (lower left). Booked by AI via missed-call text-back, conversation in Hindi."],
  ["a4", "c1", "Ananya Rao", "sv2", "p1", "kp", 5, 10, "ai", "whatsapp", "confirmed", "Mentioned a December wedding."],
  ["a5", "c13", "Tanvi Gokhale", "sv4", "p4", "baner", 3, 9.5, "ai", "whatsapp", "confirmed"],
  ["a6", "c20", "Ishita Sen", "sv8", "p3", "kp", 5, 11.5, "ai", "whatsapp", "confirmed", "First visit for 6-year-old Arjun."],
  ["a7", "c3", "Sneha Iyer", "sv7", "p2", "baner", 2, 18.5, "ai", "webchat", "unconfirmed", "For daughter (14). Interested in ceramic braces."],
  ["a8", "c14", "Kunal Shah", "sv6", "p1", "baner", 0, 12, "staff", "whatsapp", "completed"],
  ["a9", undefined, "Siddharth Rane", "sv5", "p1", "kp", 0, 9, "staff", undefined, "completed"],
  ["a10", undefined, "Neelam Chawla", "sv3", "p1", "kp", 0, 15, "online", "webchat", "completed"],
  ["a11", undefined, "Omkar Kale", "sv1", "p1", "baner", 0, 17.5, "ai", "whatsapp", "no-show"],
  ["a12", undefined, "Parth Agarwal", "sv8", "p3", "kp", 0, 10.5, "ai", "instagram", "completed"],
  ["a13", undefined, "Rekha Iyer", "sv4", "p4", "kp", 0, 14, "staff", undefined, "completed"],
  ["a14", undefined, "Sakshi Jain", "sv7", "p2", "baner", 0, 16, "online", "webchat", "completed"],
  ["a15", undefined, "Devendra Patil", "sv5", "p1", "kp", 1, 9, "staff", undefined, "completed"],
  ["a16", undefined, "Ayesha Qureshi", "sv8", "p3", "kp", 1, 10, "ai", "whatsapp", "checked-in"],
  ["a17", undefined, "Mihir Thakkar", "sv3", "p1", "kp", 1, 12, "ai", "whatsapp", "confirmed"],
  ["a18", undefined, "Shreya Ghosh", "sv7", "p2", "baner", 1, 14.5, "online", "google", "confirmed"],
  ["a19", undefined, "Rajesh Nambiar", "sv4", "p4", "baner", 1, 15, "ai", "sms", "unconfirmed"],
  ["a20", undefined, "Pallavi Deshpande", "sv1", "p1", "kp", 2, 10, "ai", "whatsapp", "confirmed"],
  ["a21", undefined, "Gaurav Malhotra", "sv5", "p1", "kp", 2, 11, "staff", undefined, "confirmed"],
  ["a22", undefined, "Nikita Rao", "sv8", "p3", "kp", 2, 15.5, "ai", "instagram", "confirmed"],
  ["a23", undefined, "Farhan Ali", "sv7", "p2", "baner", 2, 17, "online", "webchat", "confirmed"],
  ["a24", undefined, "Swati Kamat", "sv4", "p4", "kp", 2, 12.5, "ai", "whatsapp", "confirmed"],
  ["a25", undefined, "Harsh Vardhan", "sv6", "p1", "baner", 3, 11, "ai", "google", "confirmed"],
  ["a26", undefined, "Ira Banerjee", "sv8", "p3", "kp", 3, 16, "ai", "whatsapp", "unconfirmed"],
  ["a27", undefined, "Yash Kulkarni", "sv7", "p2", "baner", 3, 18, "staff", undefined, "confirmed"],
  ["a28", undefined, "Ritika Saxena", "sv3", "p1", "kp", 3, 14, "ai", "whatsapp", "confirmed"],
  ["a29", undefined, "Anil Hegde", "sv5", "p1", "baner", 4, 10, "staff", undefined, "confirmed"],
  ["a30", undefined, "Sonal Mistry", "sv4", "p4", "kp", 4, 12, "ai", "sms", "confirmed"],
  ["a31", undefined, "Kabir Chopra", "sv7", "p2", "baner", 4, 16.5, "ai", "instagram", "confirmed"],
  ["a32", undefined, "Maya Pillai", "sv8", "p3", "kp", 4, 17, "online", "webchat", "confirmed"],
  ["a33", undefined, "Rohan Bhatia", "sv9", "p1", "kp", 4, 18.5, "ai", "voice", "unconfirmed"],
  ["a34", undefined, "Alisha D'Souza", "sv3", "p1", "kp", 5, 12, "ai", "whatsapp", "confirmed"],
  ["a35", undefined, "Tejas Wagh", "sv4", "p4", "baner", 5, 10.5, "ai", "whatsapp", "confirmed"],
  ["a36", undefined, "Naina Arora", "sv7", "p2", "baner", 5, 13, "online", "google", "confirmed"],
  ["a37", undefined, "Arnav Kulkarni", "sv8", "p3", "kp", 5, 9.5, "ai", "whatsapp", "confirmed"],
  ["a38", undefined, "Preeti Sinha", "sv1", "p1", "baner", 5, 15, "staff", undefined, "confirmed"],
  ["a39", undefined, "Rhea Fernandes", "sv4", "p4", "kp", 1, 13, "ai", "whatsapp", "confirmed"],
  ["a40", undefined, "Akash Pandey", "sv1", "p1", "baner", 3, 12.5, "ai", "voice", "confirmed"],
];

function hhmm(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}
export const formatHour = hhmm;

function phoneFor(i: number) {
  const a = (98000 + ((i * 7919) % 1999)).toString();
  const b = (10000 + ((i * 104729) % 89999)).toString();
  return `+91 ${a} ${b}`;
}

export const appointments: Appointment[] = seeds.map((s, i) => {
  const [id, contactId, patient, serviceId, providerId, location, day, start, bookedBy, channel, status = "confirmed", notes] = s;
  const service = services.find((sv) => sv.id === serviceId)!;
  const isPast = day < NOW.dayIndex || (day === NOW.dayIndex && start + service.duration / 60 <= NOW.hour);
  const reminderChannel: Channel = channel === "sms" ? "sms" : "whatsapp";
  const dayLabel = weekDays[day];
  const prevDay = weekDays[Math.max(0, day - 1)];
  const t24Due = day - 1 < NOW.dayIndex || (day - 1 === NOW.dayIndex && start <= NOW.hour);
  const t2Due = day < NOW.dayIndex || (day === NOW.dayIndex && start - 2 <= NOW.hour);
  const depositStatus: Appointment["deposit"]["status"] =
    service.deposit === 0 ? "none" : status === "unconfirmed" ? "pending" : status === "no-show" ? "paid" : i % 7 === 3 ? "pending" : "paid";
  return {
    id,
    contactId,
    patient,
    phone: contactId ? "" : phoneFor(i + 3),
    serviceId,
    providerId,
    location,
    day,
    start,
    duration: service.duration,
    bookedBy,
    bookedVia: channel,
    status: isPast && status === "confirmed" ? "completed" : status,
    deposit: { amount: service.deposit, status: depositStatus },
    reminders: [
      {
        label: "T-24h",
        channel: reminderChannel,
        status: t24Due ? (i % 9 === 4 ? "failed" : i % 3 === 0 ? "delivered" : "read") : "scheduled",
        at: `${day === 0 ? "Sun 25" : `${prevDay.short} ${prevDay.date}`} · ${hhmm(start)}`,
      },
      {
        label: "T-2h",
        channel: reminderChannel,
        status: t2Due ? (i % 4 === 1 ? "delivered" : "read") : "scheduled",
        at: `${dayLabel.short} ${dayLabel.date} · ${hhmm(start - 2)}`,
      },
    ],
    notes,
  };
});

export const workingHours: Record<Location, { day: string; open: boolean; from: string; to: string }[]> = {
  kp: [
    { day: "Monday", open: true, from: "09:00", to: "20:00" },
    { day: "Tuesday", open: true, from: "09:00", to: "20:00" },
    { day: "Wednesday", open: true, from: "09:00", to: "20:00" },
    { day: "Thursday", open: true, from: "09:00", to: "20:00" },
    { day: "Friday", open: true, from: "09:00", to: "20:00" },
    { day: "Saturday", open: true, from: "09:00", to: "17:00" },
    { day: "Sunday", open: false, from: "10:00", to: "14:00" },
  ],
  baner: [
    { day: "Monday", open: true, from: "10:00", to: "20:00" },
    { day: "Tuesday", open: true, from: "10:00", to: "20:00" },
    { day: "Wednesday", open: true, from: "10:00", to: "20:00" },
    { day: "Thursday", open: true, from: "10:00", to: "20:00" },
    { day: "Friday", open: true, from: "10:00", to: "20:00" },
    { day: "Saturday", open: true, from: "10:00", to: "18:00" },
    { day: "Sunday", open: true, from: "10:00", to: "13:00" },
  ],
};

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export type PaymentStatus = "paid" | "pending" | "overdue" | "refunded";
export type PaymentMethod = "upi" | "card" | "netbanking";

export interface Payment {
  id: string;
  contactId: string;
  amount: number;
  purpose: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  channel: Channel;
  gateway: "Razorpay" | "Stripe";
  created: string;
  paidAt?: string;
  /** days the link has been open (pending/overdue) or took to pay */
  days: number;
  createdByAi?: boolean;
  invoice?: string;
}

export const payments: Payment[] = [
  { id: "PL-2291", contactId: "c1", amount: 500, purpose: "Whitening consult deposit", status: "paid", method: "upi", channel: "whatsapp", gateway: "Razorpay", created: "26 Oct, 11:43 PM", paidAt: "26 Oct, 11:45 PM", days: 0, createdByAi: true },
  { id: "PL-2290", contactId: "c5", amount: 2500, purpose: "Cleaning & polishing", status: "paid", method: "upi", channel: "whatsapp", gateway: "Razorpay", created: "27 Oct, 11:48 AM", paidAt: "27 Oct, 11:52 AM", days: 0, invoice: "INV-1044" },
  { id: "PL-2289", contactId: "c7", amount: 300, purpose: "Emergency visit deposit", status: "pending", channel: "sms", gateway: "Razorpay", created: "27 Oct, 8:22 AM", days: 0, createdByAi: true },
  { id: "PL-2288", contactId: "c14", amount: 40000, purpose: "Full-arch implants: 1st instalment", status: "pending", channel: "whatsapp", gateway: "Razorpay", created: "21 Oct", days: 6, invoice: "INV-1041" },
  { id: "PL-2287", contactId: "c24", amount: 205000, purpose: "Annual plan renewal (50%)", status: "paid", method: "netbanking", channel: "email", gateway: "Razorpay", created: "15 Oct", paidAt: "17 Oct", days: 2, invoice: "INV-1036" },
  { id: "PL-2286", contactId: "c18", amount: 10500, purpose: "Root canal: sitting 2", status: "overdue", channel: "sms", gateway: "Razorpay", created: "09 Oct", days: 18, invoice: "INV-1033" },
  { id: "PL-2285", contactId: "c15", amount: 23000, purpose: "Aligners: EMI 3 of 4", status: "paid", method: "card", channel: "whatsapp", gateway: "Razorpay", created: "14 Oct", paidAt: "14 Oct", days: 0, invoice: "INV-1035" },
  { id: "PL-2284", contactId: "c11", amount: 12000, purpose: "Laser whitening", status: "refunded", method: "card", channel: "email", gateway: "Stripe", created: "06 Oct", paidAt: "06 Oct", days: 0, invoice: "INV-1029" },
  { id: "PL-2283", contactId: "c20", amount: 800, purpose: "Kids check-up", status: "pending", channel: "whatsapp", gateway: "Razorpay", created: "24 Oct", days: 3, createdByAi: true },
  { id: "PL-2282", contactId: "c2", amount: 8500, purpose: "Root canal: balance", status: "overdue", channel: "sms", gateway: "Razorpay", created: "02 Oct", days: 25, invoice: "INV-1027" },
  { id: "PL-2281", contactId: "c13", amount: 2500, purpose: "Cleaning & polishing (prepaid)", status: "paid", method: "upi", channel: "whatsapp", gateway: "Razorpay", created: "26 Oct", paidAt: "26 Oct", days: 0, createdByAi: true },
  { id: "PL-2280", contactId: "c3", amount: 500, purpose: "Ortho assessment deposit", status: "pending", channel: "webchat", gateway: "Razorpay", created: "27 Oct, 9:50 AM", days: 0, createdByAi: true },
  { id: "PL-2279", contactId: "c21", amount: 25000, purpose: "Pilot setup fee", status: "paid", method: "netbanking", channel: "whatsapp", gateway: "Razorpay", created: "12 Oct", paidAt: "15 Oct", days: 3, invoice: "INV-1032" },
  { id: "PL-2278", contactId: "c9", amount: 1500, purpose: "3D scan booking", status: "paid", method: "upi", channel: "facebook", gateway: "Razorpay", created: "11 Oct", paidAt: "11 Oct", days: 0, createdByAi: true },
  { id: "PL-2277", contactId: "c4", amount: 1500, purpose: "Implant consult + CBCT", status: "overdue", channel: "instagram", gateway: "Razorpay", created: "08 Oct", days: 19, createdByAi: true },
  { id: "PL-2276", contactId: "c17", amount: 2000, purpose: "Whitening deposit", status: "paid", method: "upi", channel: "webchat", gateway: "Razorpay", created: "24 Oct", paidAt: "24 Oct", days: 0, createdByAi: true },
  { id: "PL-2275", contactId: "c8", amount: 1200, purpose: "Pilot onboarding (USD card)", status: "paid", method: "card", channel: "email", gateway: "Stripe", created: "05 Oct", paidAt: "07 Oct", days: 2 },
  { id: "PL-2274", contactId: "c12", amount: 800, purpose: "Kids check-up", status: "refunded", method: "upi", channel: "webchat", gateway: "Razorpay", created: "03 Oct", paidAt: "03 Oct", days: 0, createdByAi: true },
];

export const revenueTrend = Array.from({ length: 30 }, (_, i) => {
  const day = 28 + i;
  const date = day <= 30 ? `${day} Sep` : `${day - 30} Oct`;
  const weekday = (i + 0) % 7; // 28 Sep 2026 is a Monday
  const sunday = weekday === 6;
  const base = sunday ? 0.62 : 1;
  const payLinks = Math.round((18000 + 9000 * Math.sin(i / 3.2) + i * 650) * base);
  const inClinic = Math.round((14000 + 5000 * Math.cos(i / 4) + (i % 4) * 1500) * base);
  return { date, payLinks, inClinic };
});

export interface Invoice {
  id: string;
  contactId: string;
  items: string;
  amount: number;
  gst: number;
  status: "paid" | "sent" | "overdue" | "draft";
  issued: string;
  due: string;
}

export const invoices: Invoice[] = [
  { id: "INV-1044", contactId: "c5", items: "Cleaning & polishing", amount: 2500, gst: 0, status: "paid", issued: "27 Oct", due: "27 Oct" },
  { id: "INV-1043", contactId: "c1", items: "Whitening consultation (deposit adjusted)", amount: 500, gst: 0, status: "draft", issued: "—", due: "31 Oct" },
  { id: "INV-1041", contactId: "c14", items: "Full-arch implants: instalment 1 of 3", amount: 40000, gst: 0, status: "sent", issued: "21 Oct", due: "04 Nov" },
  { id: "INV-1036", contactId: "c24", items: "Anvita Agri annual plan (2 outlets) · 50%", amount: 205000, gst: 36900, status: "paid", issued: "15 Oct", due: "30 Oct" },
  { id: "INV-1035", contactId: "c15", items: "Aligners: EMI 3 of 4", amount: 23000, gst: 0, status: "paid", issued: "14 Oct", due: "14 Oct" },
  { id: "INV-1033", contactId: "c18", items: "Root canal: sitting 2 + crown prep", amount: 10500, gst: 0, status: "overdue", issued: "09 Oct", due: "16 Oct" },
  { id: "INV-1032", contactId: "c21", items: "Pilot setup fee", amount: 25000, gst: 4500, status: "paid", issued: "12 Oct", due: "19 Oct" },
  { id: "INV-1029", contactId: "c11", items: "Laser whitening (refunded)", amount: 12000, gst: 0, status: "paid", issued: "06 Oct", due: "06 Oct" },
  { id: "INV-1027", contactId: "c2", items: "Root canal: balance", amount: 8500, gst: 0, status: "overdue", issued: "02 Oct", due: "09 Oct" },
];

export interface Payout {
  id: string;
  gateway: "Razorpay" | "Stripe";
  utr: string;
  date: string;
  gross: number;
  fees: number;
  tax: number;
  count: number;
  status: "settled" | "processing" | "scheduled";
  account: string;
}

export const payouts: Payout[] = [
  { id: "setl_PN28", gateway: "Razorpay", utr: "—", date: "28 Oct (T+1)", gross: 41800, fees: 836, tax: 150, count: 9, status: "scheduled", account: "HDFC ••4821" },
  { id: "setl_PN27", gateway: "Razorpay", utr: "HDFCN26300127745", date: "27 Oct", gross: 38450, fees: 769, tax: 138, count: 11, status: "processing", account: "HDFC ••4821" },
  { id: "setl_PN26", gateway: "Razorpay", utr: "HDFCN26299118204", date: "26 Oct", gross: 52300, fees: 1046, tax: 188, count: 14, status: "settled", account: "HDFC ••4821" },
  { id: "po_1QxS", gateway: "Stripe", utr: "po_1QxS7fLk2", date: "24 Oct", gross: 101400, fees: 3042, tax: 548, count: 1, status: "settled", account: "HDFC ••4821" },
  { id: "setl_PN24", gateway: "Razorpay", utr: "HDFCN26297104411", date: "24 Oct", gross: 33900, fees: 678, tax: 122, count: 8, status: "settled", account: "HDFC ••4821" },
  { id: "setl_PN23", gateway: "Razorpay", utr: "HDFCN26296099172", date: "23 Oct", gross: 47250, fees: 945, tax: 170, count: 12, status: "settled", account: "HDFC ••4821" },
  { id: "setl_PN22", gateway: "Razorpay", utr: "HDFCN26295087630", date: "22 Oct", gross: 229100, fees: 4582, tax: 825, count: 10, status: "settled", account: "HDFC ••4821" },
  { id: "setl_PN21", gateway: "Razorpay", utr: "HDFCN26294071925", date: "21 Oct", gross: 29800, fees: 596, tax: 107, count: 7, status: "settled", account: "HDFC ••4821" },
];
