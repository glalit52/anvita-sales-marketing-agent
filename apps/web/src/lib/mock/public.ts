/**
 * Mock data for the customer-facing pages Anvita generates for a business
 * (booking page, pay links, review requests, website + webchat).
 * Demo business: Smile Dental, Pune. "Now" is Tue 27 Oct 2026, 11:20 AM.
 */
import { NOW, providers, services, workingHours, type Location, type Provider, type Service } from "./sell";

/* ------------------------------------------------------------------ */
/* Business                                                            */
/* ------------------------------------------------------------------ */

export interface PublicLocation {
  id: Location;
  name: string;
  address: string;
  landmark: string;
  hours: string;
  phone: string;
  parking: string;
}

export const business = {
  slug: "smile-dental",
  name: "Smile Dental",
  tagline: "Gentle, modern dentistry in Pune",
  monogram: "SD",
  rating: 4.8,
  reviewCount: 1970,
  phone: "+91 98220 00000",
  whatsapp: "+91 98220 00000",
  email: "hello@smiledental.in",
  website: "smiledental.in",
  gstin: "27AAKFS4821M1Z6",
  legalName: "Smile Dental Clinics LLP",
  bookingUrl: "book.anvita.ai/smile-dental",
  since: 2014,
  locations: [
    {
      id: "kp",
      name: "Koregaon Park",
      address: "2nd floor, Lane 6, North Main Road, Koregaon Park, Pune 411001",
      landmark: "Above Kimaya, opposite German Bakery",
      hours: "Mon–Fri 9 AM–8 PM · Sat 9 AM–5 PM · Sun closed",
      phone: "+91 98220 00000",
      parking: "Valet parking in the building",
    },
    {
      id: "baner",
      name: "Baner",
      address: "Shop 4, Sai Square, Baner–Balewadi Road, Baner, Pune 411045",
      landmark: "Next to Starbucks, Balewadi High Street",
      hours: "Mon–Fri 10 AM–8 PM · Sat 10 AM–6 PM · Sun 10 AM–1 PM",
      phone: "+91 98220 00001",
      parking: "Free basement parking",
    },
  ] as PublicLocation[],
};

export const businessBySlug = (slug: string) => (slug === business.slug ? business : undefined);

/* ------------------------------------------------------------------ */
/* Booking                                                             */
/* ------------------------------------------------------------------ */

export const serviceInfo: Record<string, { blurb: string; popular?: boolean; providers: string[] }> = {
  sv1: { blurb: "Check-up, X-ray review and a treatment plan with clear pricing.", providers: ["p1", "p3"] },
  sv2: { blurb: "Shade check and a whitening plan. ₹500 is adjusted in your treatment.", popular: true, providers: ["p1"] },
  sv3: { blurb: "In-clinic laser session, up to 8 shades brighter in about an hour.", providers: ["p1"] },
  sv4: { blurb: "Scaling, polishing and a gum health check.", popular: true, providers: ["p1", "p4"] },
  sv6: { blurb: "Consultation with a 3D CBCT scan to plan your implant.", providers: ["p1"] },
  sv7: { blurb: "Braces and clear-aligner assessment with photos and a quote.", providers: ["p2"] },
  sv8: { blurb: "A friendly first visit for kids aged 2–14.", providers: ["p3"] },
  sv9: { blurb: "Toothache, swelling or a broken tooth. Same-day slots held daily.", providers: ["p1", "p3"] },
};

export const bookableServices: Service[] = services.filter((s) => s.online && serviceInfo[s.id]);

export function providersFor(serviceId: string, location: Location): Provider[] {
  const allowed = serviceInfo[serviceId]?.providers ?? providers.map((p) => p.id);
  return providers.filter((p) => allowed.includes(p.id) && p.locations.includes(location));
}

export const providerBio: Record<string, { years: number; languages: string; rating: number }> = {
  p1: { years: 12, languages: "English, Hindi, Marathi", rating: 4.9 },
  p2: { years: 9, languages: "English, Hindi", rating: 4.8 },
  p3: { years: 7, languages: "English, Hindi, Marathi", rating: 4.9 },
  p4: { years: 6, languages: "English, Marathi", rating: 4.8 },
};

export interface BookingDay {
  key: string;
  weekday: string;
  /** full weekday, matches workingHours rows */
  weekdayLong: string;
  date: number;
  month: string;
  label: string;
  offset: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 14 bookable days from "today" (Tue 27 Oct 2026). Computed in UTC so SSR and client agree. */
export const bookingDays: BookingDay[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 27 + i));
  const wd = d.getUTCDay();
  return {
    key: d.toISOString().slice(0, 10),
    weekday: i === 0 ? "Today" : i === 1 ? "Tmrw" : WEEKDAYS[wd],
    weekdayLong: WEEKDAYS_LONG[wd],
    date: d.getUTCDate(),
    month: MONTHS[d.getUTCMonth()],
    label: `${WEEKDAYS[wd]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`,
    offset: i,
  };
});

function toHour(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
}

export function formatSlot(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/** Free start times (decimal hours) for a day/location/service/provider. Deterministic. */
export function slotsFor(day: BookingDay, location: Location, serviceId: string, providerId: string | "any"): number[] {
  const row = workingHours[location].find((r) => r.day === day.weekdayLong);
  if (!row || !row.open) return [];
  const service = services.find((s) => s.id === serviceId);
  const duration = (service?.duration ?? 30) / 60;
  const from = toHour(row.from);
  const to = toHour(row.to);
  const salt = (location === "kp" ? 3 : 7) + (providerId === "any" ? 0 : Number(providerId.slice(1)) * 11);
  const busyRate = providerId === "any" ? 0.32 : 0.5;
  const out: number[] = [];
  for (let h = from; h + duration <= to + 1e-6; h += 0.5) {
    if (h >= 13 && h < 14) continue; // lunch
    if (day.offset === 0 && h <= NOW.hour + 0.5) continue;
    // Sat 31 Oct at KP matches the webchat script (10:30 / 11:30 / 12:30 free; 10:00 is Ananya's slot)
    const satKp = day.key === "2026-10-31" && location === "kp" && (providerId === "any" || providerId === "p1");
    if (satKp && h === 10) continue;
    if (!(satKp && [10.5, 11.5, 12.5].includes(h)) && seeded(day.offset * 97 + h * 13 + salt) < busyRate) continue;
    out.push(h);
  }
  return out;
}

export function isOpen(day: BookingDay, location: Location) {
  return Boolean(workingHours[location].find((r) => r.day === day.weekdayLong)?.open);
}

/* ------------------------------------------------------------------ */
/* Pay links                                                           */
/* ------------------------------------------------------------------ */

export interface InvoiceLine {
  description: string;
  sac: string;
  qty: number;
  rate: number;
  /** GST % (healthcare services are exempt; products carry 18%) */
  gst: number;
}

export interface PayLink {
  id: string;
  kind: "deposit" | "invoice";
  customer: string;
  phone: string;
  purpose: string;
  note: string;
  amount: number;
  created: string;
  expires: string;
  location: Location;
  appointment?: string;
  invoice?: {
    number: string;
    issued: string;
    due: string;
    lines: InvoiceLine[];
  };
}

const invoiceLines: InvoiceLine[] = [
  { description: "Scaling & polishing (full mouth)", sac: "999312", qty: 1, rate: 2500, gst: 0 },
  { description: "Intraoral periapical X-ray", sac: "999312", qty: 2, rate: 350, gst: 0 },
  { description: "Fluoride varnish application", sac: "999312", qty: 1, rate: 600, gst: 0 },
  { description: "Oral-B Pro 3 electric toothbrush", sac: "85098040", qty: 1, rate: 3390, gst: 18 },
  { description: "Sensodyne Repair & Protect (100 g)", sac: "33061020", qty: 2, rate: 190, gst: 18 },
];

export function invoiceTotals(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const taxable = lines.filter((l) => l.gst > 0).reduce((s, l) => s + l.qty * l.rate, 0);
  const gst = lines.reduce((s, l) => s + (l.qty * l.rate * l.gst) / 100, 0);
  return { subtotal, taxable, cgst: gst / 2, sgst: gst / 2, total: Math.round(subtotal + gst) };
}

export const payLinks: PayLink[] = [
  {
    id: "8KD2",
    kind: "deposit",
    customer: "Ananya Rao",
    phone: "+91 98220 11223",
    purpose: "Whitening consultation deposit",
    note: "Holds your Sat, 31 Oct · 10:00 AM slot with Dr. Aditi Kulkarni. Adjusted in your final bill.",
    amount: 500,
    created: "Mon, 26 Oct · 11:43 PM",
    expires: "Fri, 30 Oct · 10:00 AM",
    location: "kp",
    appointment: "Sat, 31 Oct · 10:00 AM · Koregaon Park",
  },
  {
    id: "INV-1042",
    kind: "invoice",
    customer: "Meera Nair",
    phone: "+91 97300 55667",
    purpose: "Invoice INV-1042 · Cleaning visit",
    note: "Thank you for visiting Smile Dental today. Healthcare services are GST-exempt; oral-care products carry 18% GST.",
    amount: invoiceTotals(invoiceLines).total,
    created: "Tue, 27 Oct · 11:52 AM",
    expires: "Tue, 3 Nov",
    location: "kp",
    invoice: { number: "INV-1042", issued: "27 Oct 2026", due: "3 Nov 2026", lines: invoiceLines },
  },
];

export const payLinkById = (id: string) => payLinks.find((p) => p.id === id);

export const upiApps = [
  { id: "gpay", name: "Google Pay", mark: "G", className: "bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#1a2a44] dark:text-[#8ab4f8]" },
  { id: "phonepe", name: "PhonePe", mark: "Pe", className: "bg-[#f1e8fd] text-[#5f259f] dark:bg-[#2a1a40] dark:text-[#c3a0f0]" },
  { id: "paytm", name: "Paytm", mark: "P", className: "bg-[#e5f6fd] text-[#00a0e3] dark:bg-[#0f2a38] dark:text-[#6fd0f5]" },
  { id: "bhim", name: "BHIM", mark: "B", className: "bg-[#fff1e0] text-[#e06b00] dark:bg-[#3a240a] dark:text-[#f5b066]" },
];

export const banks = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Bank of Maharashtra"];

/* ------------------------------------------------------------------ */
/* Review requests                                                     */
/* ------------------------------------------------------------------ */

export interface FeedbackRequest {
  id: string;
  customer: string;
  firstName: string;
  phone: string;
  provider: string;
  providerShort: string;
  service: string;
  visit: string;
  location: Location;
  manager: string;
  suggestions: Record<"short" | "detailed" | "hinglish", string>;
  highlights: string[];
}

export const feedbackRequests: FeedbackRequest[] = [
  {
    id: "r-meera",
    customer: "Meera Nair",
    firstName: "Meera",
    phone: "+91 97300 •••67",
    provider: "Dr. Aditi Kulkarni",
    providerShort: "Dr. Kulkarni",
    service: "Cleaning & polishing",
    visit: "Today, 11:00 AM",
    location: "kp",
    manager: "Neha Kulkarni",
    suggestions: {
      short: "Gentle, quick and spotless clinic. Dr. Kulkarni explained everything and the cleaning was painless. Booking on WhatsApp took two minutes. Highly recommend Smile Dental!",
      detailed:
        "I've been going to Smile Dental in Koregaon Park for a while and today's cleaning was the best yet. Dr. Kulkarni and Ritu were very gentle, explained what they were doing at every step and didn't push any extra treatment. I booked on WhatsApp late at night and got a slot the next morning, and they were right on time. The clinic is spotless and the billing was clear. Highly recommended if you're looking for a dentist in Pune.",
      hinglish:
        "Bahut accha experience! Dr. Kulkarni ne cleaning bahut gently ki aur sab kuch clearly explain kiya. WhatsApp pe booking 2 minute mein ho gayi aur time pe call kiya. Clinic ekdum clean hai. Pune mein best dentist!",
    },
    highlights: ["Gentle care", "On time", "Spotless clinic", "Easy WhatsApp booking", "Clear pricing", "Explained everything"],
  },
];

export const feedbackById = (id: string) => feedbackRequests.find((f) => f.id === id);

export const feedbackIssues = ["Wait time", "Pain or discomfort", "Price or billing", "Staff behaviour", "Other"];

/* ------------------------------------------------------------------ */
/* Website (site-demo)                                                 */
/* ------------------------------------------------------------------ */

export const siteServices = [
  { id: "sv2", name: "Teeth whitening", from: 8000, blurb: "Laser whitening, up to 8 shades brighter in one 60-minute visit." },
  { id: "sv7", name: "Braces & aligners", from: 45000, blurb: "Metal, ceramic or clear aligners. 0% EMI for 12 months." },
  { id: "sv6", name: "Dental implants", from: 28000, blurb: "Swiss implants planned on a 3D CBCT scan. Lifetime warranty." },
  { id: "sv4", name: "Cleaning & polishing", from: 2500, blurb: "Scaling, polishing and a gum check every 6 months." },
  { id: "sv5", name: "Root canal", from: 6500, blurb: "Single-sitting rotary RCT under local anaesthesia." },
  { id: "sv8", name: "Kids dentistry", from: 800, blurb: "A calm, playful first visit with our paediatric dentist." },
];

export const testimonials = [
  { name: "Meera Nair", when: "1 hour ago", rating: 5, text: "Dr. Kulkarni and the whole team were so gentle with my cleaning. Booked on WhatsApp at midnight and got a slot the next morning. Super convenient!" },
  { name: "Arvind Joshi", when: "2 days ago", rating: 5, text: "Got my implant done at the Baner clinic. They showed me the 3D scan, gave a fixed quote and there were no surprises on the bill." },
  { name: "Ishita Sen", when: "1 week ago", rating: 5, text: "My 6-year-old was scared of dentists. Dr. Nisha Shah made it a game and now he asks when he can go back!" },
];
