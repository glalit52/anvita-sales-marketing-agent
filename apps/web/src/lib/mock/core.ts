import type { Channel } from "@/components/ui/channel";

/**
 * Shared mock data for the demo workspace "Smile Dental" (a 2-location clinic
 * in Pune) plus a B2B outbound motion. Module-specific mocks live in sibling
 * files (e.g. mock/prospecting.ts) and reference these ids.
 */

export type Stage = "new" | "qualified" | "booked" | "customer" | "lost" | "prospect";

export interface TeamMember {
  id: string;
  name: string;
  role: "Owner" | "Admin" | "Manager" | "Agent";
  email: string;
  online: boolean;
}

export const team: TeamMember[] = [
  { id: "u1", name: "Priya Sharma", role: "Owner", email: "priya@smiledental.in", online: true },
  { id: "u2", name: "Arjun Patil", role: "Agent", email: "arjun@smiledental.in", online: true },
  { id: "u3", name: "Neha Kulkarni", role: "Manager", email: "neha@smiledental.in", online: false },
  { id: "u4", name: "Vikram Joshi", role: "Agent", email: "vikram@smiledental.in", online: true },
];

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  city: string;
  stage: Stage;
  source: string;
  channel: Channel;
  tags: string[];
  ownerId: string | "ai";
  score: number;
  value: number;
  lastActivity: string;
  createdAt: string;
  language: string;
}

export const contacts: Contact[] = [
  { id: "c1", name: "Ananya Rao", phone: "+91 98220 11223", email: "ananya.rao@gmail.com", city: "Pune", stage: "booked", source: "Google Ads", channel: "whatsapp", tags: ["whitening", "new patient"], ownerId: "ai", score: 86, value: 12000, lastActivity: "2m ago", createdAt: "2026-10-26", language: "English" },
  { id: "c2", name: "Rohit Mehta", phone: "+91 99700 44556", email: "rohit.m@outlook.com", city: "Pune", stage: "customer", source: "Walk-in", channel: "sms", tags: ["root canal", "complaint"], ownerId: "u2", score: 64, value: 18500, lastActivity: "6m ago", createdAt: "2026-09-12", language: "Hindi" },
  { id: "c3", name: "Sneha Iyer", phone: "+91 90110 77889", email: "sneha.iyer@yahoo.com", city: "Pune", stage: "qualified", source: "Website chat", channel: "webchat", tags: ["braces", "teen"], ownerId: "ai", score: 78, value: 45000, lastActivity: "14m ago", createdAt: "2026-10-27", language: "English" },
  { id: "c4", name: "Karan Desai", phone: "+91 98500 22334", city: "Pune", stage: "new", source: "Instagram ad", channel: "instagram", tags: ["implants"], ownerId: "ai", score: 71, value: 60000, lastActivity: "32m ago", createdAt: "2026-10-27", language: "English" },
  { id: "c5", name: "Meera Nair", phone: "+91 97300 55667", email: "meera.nair@gmail.com", city: "Pune", stage: "customer", source: "Referral", channel: "whatsapp", tags: ["cleaning", "vip"], ownerId: "u3", score: 92, value: 8000, lastActivity: "1h ago", createdAt: "2026-03-02", language: "Malayalam" },
  { id: "c6", name: "Aditya Kulkarni", phone: "+91 98810 99001", email: "aditya.k@gmail.com", city: "Mumbai", stage: "lost", source: "Google Business", channel: "google", tags: ["price shopper"], ownerId: "u4", score: 22, value: 15000, lastActivity: "1d ago", createdAt: "2026-10-10", language: "Marathi" },
  { id: "c7", name: "Fatima Shaikh", phone: "+91 90290 33445", city: "Pune", stage: "booked", source: "Missed call", channel: "voice", tags: ["toothache", "urgent"], ownerId: "ai", score: 81, value: 3500, lastActivity: "2h ago", createdAt: "2026-10-27", language: "Hindi" },
  { id: "c8", name: "Rahul Verma", phone: "+91 99230 66778", email: "rahul@agrigrow.in", company: "AgriGrow Inputs", city: "Nashik", stage: "prospect", source: "Prospecting", channel: "email", tags: ["b2b", "dealer"], ownerId: "u1", score: 74, value: 240000, lastActivity: "3h ago", createdAt: "2026-10-20", language: "English" },
  { id: "c9", name: "Pooja Bhatt", phone: "+91 98670 12121", email: "pooja.bhatt@gmail.com", city: "Pune", stage: "qualified", source: "Facebook", channel: "facebook", tags: ["aligners"], ownerId: "ai", score: 69, value: 85000, lastActivity: "5h ago", createdAt: "2026-10-25", language: "Gujarati" },
  { id: "c10", name: "Suresh Reddy", phone: "+91 90000 34343", email: "suresh@kisanmart.co", company: "Kisan Mart", city: "Hyderabad", stage: "prospect", source: "Prospecting", channel: "linkedin", tags: ["b2b"], ownerId: "u1", score: 58, value: 180000, lastActivity: "1d ago", createdAt: "2026-10-21", language: "Telugu" },
  { id: "c11", name: "Divya Menon", phone: "+91 97650 88990", email: "divya.menon@gmail.com", city: "Pune", stage: "customer", source: "Google Ads", channel: "email", tags: ["whitening"], ownerId: "u2", score: 88, value: 12000, lastActivity: "2d ago", createdAt: "2026-07-18", language: "English" },
  { id: "c12", name: "Imran Khan", phone: "+91 98234 56565", city: "Pune", stage: "new", source: "Website chat", channel: "webchat", tags: ["kids dentistry"], ownerId: "ai", score: 55, value: 4000, lastActivity: "2d ago", createdAt: "2026-10-25", language: "Hindi" },
];

export const contactById = (id: string) => contacts.find((c) => c.id === id);
export const memberById = (id: string) => team.find((m) => m.id === id);

export const stageMeta: Record<Stage, { label: string; tone: "neutral" | "info" | "primary" | "success" | "danger" | "ai" }> = {
  prospect: { label: "Prospect", tone: "neutral" },
  new: { label: "New lead", tone: "info" },
  qualified: { label: "Qualified", tone: "primary" },
  booked: { label: "Booked", tone: "ai" },
  customer: { label: "Customer", tone: "success" },
  lost: { label: "Lost", tone: "danger" },
};

export type MessageAuthor = "contact" | "ai" | "human" | "system";

export interface Message {
  id: string;
  author: MessageAuthor;
  authorName?: string;
  body: string;
  time: string;
  /** Internal note: visible only to the team. */
  note?: boolean;
  /** Rich card attached to the message. */
  card?: { type: "booking" | "payment" | "review"; title: string; subtitle: string; status?: string };
  /** KB sources the AI cited. */
  sources?: string[];
}

export interface Conversation {
  id: string;
  contactId: string;
  channel: Channel;
  status: "open" | "pending" | "closed";
  assignee: "ai" | string;
  escalated?: { reason: string };
  unread: number;
  preview: string;
  time: string;
  intent: string;
  sentiment: "positive" | "neutral" | "negative";
  aiSummary: string;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: "v1",
    contactId: "c1",
    channel: "whatsapp",
    status: "open",
    assignee: "ai",
    unread: 2,
    preview: "Perfect, see you Saturday at 10!",
    time: "2m",
    intent: "Book appointment",
    sentiment: "positive",
    aiSummary: "New patient asking about teeth whitening. Shared price range ₹8k–12k, booked consultation Sat 10:00 AM at Koregaon Park, ₹500 deposit paid via UPI.",
    messages: [
      { id: "m1", author: "contact", body: "Hi, do you do teeth whitening? How much does it cost?", time: "11:40 PM" },
      { id: "m2", author: "ai", body: "Hi Ananya! 😊 Yes, we offer in-clinic laser whitening. It usually costs ₹8,000–₹12,000 depending on the shade you want, and takes about 60 minutes. Would you like to book a free consultation first?", time: "11:40 PM", sources: ["Price list 2026", "Services › Whitening"] },
      { id: "m3", author: "contact", body: "Yes please. Saturday morning works", time: "11:42 PM" },
      { id: "m4", author: "ai", body: "Great! I have 10:00 AM or 11:30 AM this Saturday at our Koregaon Park clinic. Which works better?", time: "11:42 PM" },
      { id: "m5", author: "contact", body: "10 is good", time: "11:43 PM" },
      { id: "m6", author: "ai", body: "You're booked ✅ To confirm your slot, please pay a refundable ₹500 deposit:", time: "11:43 PM", card: { type: "booking", title: "Whitening consultation", subtitle: "Sat, 31 Oct · 10:00 AM · Koregaon Park", status: "Confirmed" } },
      { id: "m7", author: "system", body: "Payment link sent · ₹500 deposit", time: "11:43 PM", card: { type: "payment", title: "₹500 deposit", subtitle: "UPI · Paid 11:45 PM", status: "Paid" } },
      { id: "m8", author: "contact", body: "Done, paid. Perfect, see you Saturday at 10!", time: "11:46 PM" },
    ],
  },
  {
    id: "v2",
    contactId: "c2",
    channel: "sms",
    status: "open",
    assignee: "u2",
    escalated: { reason: "Negative sentiment · complaint" },
    unread: 1,
    preview: "This is the second time the filling has come off.",
    time: "6m",
    intent: "Complaint",
    sentiment: "negative",
    aiSummary: "Existing patient (root canal, Sept). Temporary filling came off for the 2nd time; frustrated. AI apologised and escalated to the front desk per the complaint rule. Needs a priority slot today.",
    messages: [
      { id: "m1", author: "contact", body: "My temporary filling came off again. This is the second time the filling has come off.", time: "10:02 AM" },
      { id: "m2", author: "ai", body: "I'm really sorry about this, Rohit. That shouldn't happen. I'm bringing in Arjun from our front desk right now to get you a priority appointment today.", time: "10:02 AM" },
      { id: "m3", author: "system", body: "Escalated to Arjun Patil: negative sentiment + complaint intent", time: "10:02 AM" },
      { id: "m4", author: "human", authorName: "Arjun Patil", body: "Note: Dr. Kulkarni can see him at 4:30 PM today. Offer it, no charge.", time: "10:05 AM", note: true },
    ],
  },
  {
    id: "v3",
    contactId: "c3",
    channel: "webchat",
    status: "open",
    assignee: "ai",
    unread: 0,
    preview: "AI: Braces for teens usually take 12–18 months…",
    time: "14m",
    intent: "Pricing question",
    sentiment: "neutral",
    aiSummary: "Parent asking about braces for 14-year-old. Interested in ceramic. Qualified: budget OK, wants weekday evening slot.",
    messages: [
      { id: "m1", author: "contact", body: "How long do braces take for a 14 year old? And do you have the clear ones?", time: "9:48 AM" },
      { id: "m2", author: "ai", body: "Braces for teens usually take 12–18 months. Yes, we offer ceramic (tooth-coloured) braces from ₹45,000 and clear aligners from ₹85,000. Shall I book an orthodontic assessment with Dr. Mehra?", time: "9:48 AM", sources: ["Orthodontics FAQ", "Price list 2026"] },
    ],
  },
  {
    id: "v4",
    contactId: "c4",
    channel: "instagram",
    status: "open",
    assignee: "ai",
    unread: 3,
    preview: "Is implant EMI available?",
    time: "32m",
    intent: "Financing",
    sentiment: "neutral",
    aiSummary: "Asked about implant cost and EMI. AI shared 0% EMI over 6 months via Bajaj Finserv. Awaiting reply.",
    messages: [
      { id: "m1", author: "contact", body: "Saw your reel. How much for a single implant?", time: "9:20 AM" },
      { id: "m2", author: "ai", body: "Thanks for reaching out, Karan! A single implant with crown is ₹45,000–₹60,000 depending on the implant brand.", time: "9:20 AM", sources: ["Price list 2026"] },
      { id: "m3", author: "contact", body: "Is implant EMI available?", time: "9:27 AM" },
    ],
  },
  {
    id: "v5",
    contactId: "c7",
    channel: "voice",
    status: "pending",
    assignee: "ai",
    unread: 0,
    preview: "Missed call → AI text-back → booked 5:00 PM today",
    time: "2h",
    intent: "Urgent care",
    sentiment: "neutral",
    aiSummary: "Missed call at 8:12 AM. AI texted back within 30s, triaged toothache as urgent, booked 5 PM today.",
    messages: [
      { id: "m1", author: "system", body: "Missed call from +91 90290 33445 · AI texted back", time: "8:12 AM" },
      { id: "m2", author: "ai", body: "Hi! Sorry we missed your call. This is Smile Dental. How can we help?", time: "8:12 AM" },
      { id: "m3", author: "contact", body: "bahut dard ho raha hai daant mein, aaj mil sakta hai?", time: "8:20 AM" },
      { id: "m4", author: "ai", body: "Main samajh sakti hoon, dard bahut takleef deta hai. 😟 Aaj shaam 5:00 baje Baner clinic mein slot available hai. Book kar doon?", time: "8:20 AM" },
      { id: "m5", author: "contact", body: "haan please", time: "8:21 AM" },
      { id: "m6", author: "ai", body: "Booked ✅ Aaj 5:00 PM, Baner clinic. Address aur directions bhej rahi hoon.", time: "8:21 AM", card: { type: "booking", title: "Emergency consultation", subtitle: "Today · 5:00 PM · Baner", status: "Confirmed" } },
    ],
  },
  {
    id: "v6",
    contactId: "c5",
    channel: "whatsapp",
    status: "closed",
    assignee: "u3",
    unread: 0,
    preview: "Thank you! Left a review 🙏",
    time: "1h",
    intent: "Review",
    sentiment: "positive",
    aiSummary: "VIP patient, cleaning completed. AI sent review request; patient left a 5★ Google review.",
    messages: [
      { id: "m1", author: "ai", body: "Hi Meera, thanks for visiting today! Would you mind sharing your experience? It really helps us 🙏", time: "12:10 PM", card: { type: "review", title: "Review us on Google", subtitle: "Takes 30 seconds" } },
      { id: "m2", author: "contact", body: "Thank you! Left a review 🙏", time: "12:31 PM" },
    ],
  },
  {
    id: "v7",
    contactId: "c8",
    channel: "email",
    status: "open",
    assignee: "u1",
    unread: 1,
    preview: "Re: Cutting stockouts for agri-input dealers: interested, can we talk Thu?",
    time: "3h",
    intent: "Interested (outbound reply)",
    sentiment: "positive",
    aiSummary: "Reply to sequence ‘Agri dealers, Maharashtra’ step 2. Interested; asked for a call Thursday. AI proposed 3 slots.",
    messages: [
      { id: "m1", author: "human", authorName: "Priya Sharma (sequence)", body: "Hi Rahul, noticed AgriGrow added 2 new outlets in Nashik this year. Congrats! We help dealers cut stock-outs with demand forecasting…", time: "Mon 9:00 AM" },
      { id: "m2", author: "contact", body: "Interesting. Can we talk Thursday afternoon?", time: "7:15 AM" },
      { id: "m3", author: "ai", body: "Draft (Copilot): Absolutely, Rahul! Here are a few Thursday slots: 2:00, 3:30 or 4:30 PM IST. Pick one and I'll send an invite.", time: "7:16 AM", note: true },
    ],
  },
  {
    id: "v8",
    contactId: "c9",
    channel: "facebook",
    status: "open",
    assignee: "ai",
    unread: 0,
    preview: "AI: Sure! I've sent the aligner brochure…",
    time: "5h",
    intent: "Information",
    sentiment: "positive",
    aiSummary: "Interested in aligners; AI shared brochure and before/after gallery. Suggested follow-up in 2 days.",
    messages: [
      { id: "m1", author: "contact", body: "Can you send details about invisible aligners?", time: "5:10 AM" },
      { id: "m2", author: "ai", body: "Sure! I've sent the aligner brochure and some before/after results. Clear aligners start at ₹85,000 with 0% EMI. Would you like a free 3D scan?", time: "5:10 AM", sources: ["Aligners brochure.pdf"] },
    ],
  },
  {
    id: "v9",
    contactId: "c12",
    channel: "webchat",
    status: "closed",
    assignee: "ai",
    unread: 0,
    preview: "AI: Our paediatric dentist is available on…",
    time: "2d",
    intent: "Kids dentistry",
    sentiment: "neutral",
    aiSummary: "Asked about kids' dentist availability. Shared schedule; no booking yet. Re-engagement queued.",
    messages: [
      { id: "m1", author: "contact", body: "Do you have a kids dentist?", time: "Sun 6:02 PM" },
      { id: "m2", author: "ai", body: "Yes! Our paediatric dentist Dr. Shah is available on Tuesdays and Saturdays. Want me to check a slot?", time: "Sun 6:02 PM" },
    ],
  },
];

/** 30-day daily series for dashboard trends. */
export const dailyTrend = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(2026, 8, 28 + i);
  const base = 40 + Math.round(18 * Math.sin(i / 4) + i * 0.9);
  return {
    date: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    leads: base,
    aiHandled: Math.round(base * (0.58 + i * 0.006)),
    booked: Math.round(base * 0.31 + (i % 3)),
    revenue: Math.round((base * 0.31 + (i % 3)) * 2400 + (i % 5) * 1800),
  };
});
