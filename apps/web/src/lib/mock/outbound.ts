import type { Channel } from "@/components/ui/channel";

/**
 * Mock data for the Outbound module: Prospecting (Origami-style AI search),
 * Sequences (multi-step outreach) and Campaigns (broadcasts).
 * The B2B motion sells to agri-input dealers (Rahul Verma @ AgriGrow Inputs is c8 in core.ts);
 * the clinic motion (Smile Dental) uses campaigns for recalls and offers.
 */

/* ------------------------------------------------------------------ */
/* Prospecting                                                         */
/* ------------------------------------------------------------------ */

export const CREDITS_TOTAL = 10000;
export const CREDITS_USED_START = 3420;

export interface SavedSearch {
  id: string;
  name: string;
  prompt: string;
  rows: number;
  updated: string;
  status: "ready" | "running" | "monitoring";
  newRows?: number;
}

export const savedSearches: SavedSearch[] = [
  { id: "s1", name: "Agri-input dealers, Maharashtra", prompt: "Agri-input dealers in Maharashtra with a website and 4★+ rating, get owner contact", rows: 412, updated: "3h ago", status: "monitoring", newRows: 42 },
  { id: "s2", name: "Dental clinics Pune <4★", prompt: "Dental clinics in Pune with under 4★ Google rating and no online booking", rows: 186, updated: "Yesterday", status: "ready" },
  { id: "s3", name: "D2C brands hiring growth marketers", prompt: "Indian D2C brands on Shopify hiring a growth or performance marketer in the last 30 days", rows: 97, updated: "2d ago", status: "monitoring", newRows: 6 },
  { id: "s4", name: "Drip irrigation distributors, Gujarat", prompt: "Drip irrigation distributors in Gujarat with 10+ employees", rows: 143, updated: "5d ago", status: "ready" },
  { id: "s5", name: "Seed companies with new licences", prompt: "Seed companies that received a new state seed licence this quarter", rows: 38, updated: "1w ago", status: "ready" },
];

export const examplePrompts = [
  "Agri-input dealers in Maharashtra with 4★+ and a website, get owner contact",
  "Dental clinics in Pune under 4★ with no online booking",
  "D2C skincare brands hiring growth marketers",
  "Cold-storage operators in Nashik that raised funding",
];

export type SourceId = "maps" | "web" | "mca" | "indiamart" | "justdial" | "jobs" | "linkedin";

export const sources: { id: SourceId; label: string; description: string; costPerRow: number; defaultOn: boolean }[] = [
  { id: "maps", label: "Google Maps", description: "Places, ratings, reviews, hours", costPerRow: 1, defaultOn: true },
  { id: "web", label: "Web search", description: "Websites, product pages, news", costPerRow: 1, defaultOn: true },
  { id: "mca", label: "MCA company registry", description: "CIN, directors, incorporation date", costPerRow: 1, defaultOn: true },
  { id: "indiamart", label: "IndiaMART", description: "Supplier listings, product categories", costPerRow: 1, defaultOn: true },
  { id: "justdial", label: "Justdial", description: "Local listings & phone numbers", costPerRow: 1, defaultOn: false },
  { id: "jobs", label: "Job boards", description: "Naukri, Indeed, company careers pages", costPerRow: 1, defaultOn: false },
  { id: "linkedin", label: "LinkedIn (licensed provider)", description: "People & roles via licensed data partner", costPerRow: 2, defaultOn: true },
];

export const planFilters = [
  { key: "industry", label: "Industry", value: "Agri-input retail (seeds, fertiliser, crop protection)" },
  { key: "geo", label: "Location", value: "Maharashtra" },
  { key: "rating", label: "Rating", value: "≥ 4.0★" },
  { key: "website", label: "Website", value: "Has website" },
  { key: "size", label: "Employees", value: "5–200" },
  { key: "contact", label: "Contact", value: "Owner / Proprietor / Director" },
];

export type Verify = "verified" | "risky" | "not_found";
export type Signal = "hiring" | "new_outlet" | "funding" | "new_licence";

export interface ProspectRow {
  id: string;
  company: string;
  city: string;
  rating: number;
  reviews: number;
  website: string;
  employees: string;
  signals: Signal[];
  contact: string;
  role: string;
  email: string;
  emailStatus: Verify;
  emailSource: string;
  phone: string;
  phoneStatus: Verify;
  phoneSource: string;
  fit: number;
  inCrm?: boolean;
  /** Mocked answer for the AI column "Do they sell drip irrigation?" */
  aiAnswer: { value: "Yes" | "No" | "Unclear"; note: string; confidence: number };
}

export const prospectPool: ProspectRow[] = [
  { id: "p1", company: "AgriGrow Inputs", city: "Nashik", rating: 4.6, reviews: 214, website: "agrigrow.in", employees: "25–50", signals: ["hiring", "new_outlet"], contact: "Rahul Verma", role: "Founder & MD", email: "rahul@agrigrow.in", emailStatus: "verified", emailSource: "Website contact page → ZeroBounce", phone: "+91 99230 66778", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 94, inCrm: true, aiAnswer: { value: "Yes", note: "Jain & Netafim drip kits listed on /products", confidence: 96 } },
  { id: "p2", company: "Krishi Seva Kendra", city: "Pune", rating: 4.4, reviews: 132, website: "krishisevakendra.co.in", employees: "10–25", signals: ["new_outlet"], contact: "Sanjay Pawar", role: "Proprietor", email: "sanjay@krishisevakendra.co.in", emailStatus: "verified", emailSource: "Pattern match → SMTP verify", phone: "+91 98221 40517", phoneStatus: "verified", phoneSource: "Justdial", fit: 91, aiAnswer: { value: "Yes", note: "Mentions 'drip & sprinkler systems' in services", confidence: 91 } },
  { id: "p3", company: "Shetkari Agro Agencies", city: "Ahmednagar", rating: 4.2, reviews: 88, website: "shetkariagro.com", employees: "5–10", signals: [], contact: "Vaishali Shinde", role: "Owner", email: "info@shetkariagro.com", emailStatus: "risky", emailSource: "Website footer (catch-all domain)", phone: "+91 94220 18830", phoneStatus: "verified", phoneSource: "IndiaMART listing", fit: 78, aiAnswer: { value: "No", note: "Only seeds & fertilisers listed", confidence: 84 } },
  { id: "p4", company: "Green Valley Fertilisers", city: "Kolhapur", rating: 4.7, reviews: 301, website: "greenvalleyfert.in", employees: "50–200", signals: ["hiring", "funding"], contact: "Amit Jadhav", role: "Director", email: "amit.jadhav@greenvalleyfert.in", emailStatus: "verified", emailSource: "Licensed provider → verified", phone: "+91 98903 22671", phoneStatus: "risky", phoneSource: "MCA filing (may be outdated)", fit: 88, inCrm: true, aiAnswer: { value: "Yes", note: "Dealer for Finolex drip", confidence: 88 } },
  { id: "p5", company: "Sahyadri Krishi Bhandar", city: "Satara", rating: 4.1, reviews: 57, website: "sahyadrikrishi.in", employees: "5–10", signals: ["new_licence"], contact: "Ganesh More", role: "Proprietor", email: "", emailStatus: "not_found", emailSource: "No public email found after 3 providers", phone: "+91 97640 51289", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 72, aiAnswer: { value: "Unclear", note: "Website is a single landing page", confidence: 52 } },
  { id: "p6", company: "Vidarbha Agri Mart", city: "Nagpur", rating: 4.5, reviews: 176, website: "vidarbhaagrimart.com", employees: "25–50", signals: ["hiring"], contact: "Prakash Wankhede", role: "CEO", email: "prakash@vidarbhaagrimart.com", emailStatus: "verified", emailSource: "Licensed provider → SMTP verify", phone: "+91 98220 77341", phoneStatus: "verified", phoneSource: "Website contact page", fit: 89, aiAnswer: { value: "Yes", note: "Drip irrigation subsidy help page", confidence: 93 } },
  { id: "p7", company: "Godavari Seeds & Pesticides", city: "Aurangabad", rating: 4.3, reviews: 94, website: "godavariseeds.in", employees: "10–25", signals: [], contact: "Suresh Kale", role: "Partner", email: "suresh.kale@godavariseeds.in", emailStatus: "verified", emailSource: "Pattern match → SMTP verify", phone: "+91 94231 66502", phoneStatus: "risky", phoneSource: "Justdial (shared line)", fit: 76, aiAnswer: { value: "No", note: "Seeds and crop protection only", confidence: 81 } },
  { id: "p8", company: "Kisan Agro Point", city: "Jalgaon", rating: 4.8, reviews: 412, website: "kisanagropoint.in", employees: "50–200", signals: ["new_outlet", "hiring"], contact: "Nilesh Patil", role: "Founder", email: "nilesh@kisanagropoint.in", emailStatus: "verified", emailSource: "Website team page → verified", phone: "+91 98500 31144", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 95, inCrm: true, aiAnswer: { value: "Yes", note: "'Jain Irrigation authorised dealer' badge", confidence: 98 } },
  { id: "p9", company: "Shree Ganesh Krishi Kendra", city: "Solapur", rating: 4.0, reviews: 41, website: "shreeganeshkrishi.in", employees: "5–10", signals: [], contact: "Mahesh Kulkarni", role: "Owner", email: "mahesh.k@gmail.com", emailStatus: "risky", emailSource: "IndiaMART listing (personal domain)", phone: "+91 90110 23456", phoneStatus: "verified", phoneSource: "IndiaMART listing", fit: 64, aiAnswer: { value: "Unclear", note: "No product catalogue on site", confidence: 47 } },
  { id: "p10", company: "Maha Agro Inputs Pvt Ltd", city: "Pune", rating: 4.5, reviews: 158, website: "mahaagroinputs.com", employees: "50–200", signals: ["funding"], contact: "Deepa Joshi", role: "Director", email: "deepa.joshi@mahaagroinputs.com", emailStatus: "verified", emailSource: "MCA director + pattern → verified", phone: "+91 98812 90876", phoneStatus: "verified", phoneSource: "Licensed provider", fit: 90, inCrm: true, aiAnswer: { value: "Yes", note: "Drip & mulching film category page", confidence: 90 } },
  { id: "p11", company: "Konkan Krushi Seva", city: "Ratnagiri", rating: 4.2, reviews: 63, website: "konkankrushi.in", employees: "5–10", signals: [], contact: "Rohan Sawant", role: "Proprietor", email: "rohan@konkankrushi.in", emailStatus: "verified", emailSource: "Website contact page", phone: "", phoneStatus: "not_found", phoneSource: "Not found in 3 providers", fit: 69, aiAnswer: { value: "No", note: "Focus on mango orchard inputs", confidence: 74 } },
  { id: "p12", company: "Annadata Agri Solutions", city: "Latur", rating: 4.6, reviews: 189, website: "annadataagri.com", employees: "25–50", signals: ["hiring", "new_licence"], contact: "Kavita Deshmukh", role: "Co-founder", email: "kavita@annadataagri.com", emailStatus: "verified", emailSource: "Licensed provider → verified", phone: "+91 97300 44120", phoneStatus: "verified", phoneSource: "Website", fit: 92, aiAnswer: { value: "Yes", note: "Blog on drip subsidy (PMKSY)", confidence: 89 } },
  { id: "p13", company: "Baliraja Krishi Udyog", city: "Beed", rating: 4.1, reviews: 52, website: "balirajakrishi.in", employees: "10–25", signals: [], contact: "Dattatray Gaikwad", role: "Owner", email: "contact@balirajakrishi.in", emailStatus: "risky", emailSource: "Generic inbox (role-based)", phone: "+91 94043 77621", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 67, inCrm: true, aiAnswer: { value: "Yes", note: "Sprinkler + drip on IndiaMART", confidence: 77 } },
  { id: "p14", company: "Nashik Agro Traders", city: "Nashik", rating: 4.4, reviews: 120, website: "nashikagrotraders.com", employees: "10–25", signals: ["new_outlet"], contact: "Yogesh Bhamre", role: "Managing Partner", email: "yogesh@nashikagrotraders.com", emailStatus: "verified", emailSource: "Pattern match → SMTP verify", phone: "+91 98230 55901", phoneStatus: "verified", phoneSource: "Justdial", fit: 86, aiAnswer: { value: "Yes", note: "Grape-vineyard drip kits", confidence: 92 } },
  { id: "p15", company: "Amravati Kisan Seva", city: "Amravati", rating: 4.3, reviews: 77, website: "amravatikisan.in", employees: "5–10", signals: [], contact: "Sunita Ingle", role: "Proprietor", email: "sunita@amravatikisan.in", emailStatus: "verified", emailSource: "Website contact page", phone: "+91 90960 11287", phoneStatus: "risky", phoneSource: "IndiaMART (unverified)", fit: 71, inCrm: true, aiAnswer: { value: "No", note: "Cotton seed specialist", confidence: 79 } },
  { id: "p16", company: "Sangli Fertiliser Depot", city: "Sangli", rating: 4.5, reviews: 143, website: "sanglifertdepot.in", employees: "25–50", signals: ["hiring"], contact: "Vijay Mane", role: "Owner", email: "vijay.mane@sanglifertdepot.in", emailStatus: "verified", emailSource: "Licensed provider → verified", phone: "+91 98224 66013", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 84, inCrm: true, aiAnswer: { value: "Yes", note: "Drip for sugarcane, product page", confidence: 87 } },
  { id: "p17", company: "Deccan Crop Care", city: "Pune", rating: 4.7, reviews: 266, website: "deccancropcare.com", employees: "50–200", signals: ["funding", "hiring"], contact: "Ajay Kulkarni", role: "CEO", email: "ajay@deccancropcare.com", emailStatus: "verified", emailSource: "Website team page → verified", phone: "+91 98811 70450", phoneStatus: "verified", phoneSource: "Licensed provider", fit: 93, aiAnswer: { value: "No", note: "Crop protection & drones; no irrigation", confidence: 85 } },
  { id: "p18", company: "Wardha Agri Centre", city: "Wardha", rating: 4.0, reviews: 39, website: "wardhaagri.in", employees: "5–10", signals: ["new_licence"], contact: "Pravin Thakre", role: "Proprietor", email: "", emailStatus: "not_found", emailSource: "No public email after 3 providers", phone: "+91 94221 08837", phoneStatus: "verified", phoneSource: "Justdial", fit: 62, aiAnswer: { value: "Unclear", note: "Site under construction", confidence: 41 } },
];

export const dentalPool: ProspectRow[] = [
  { id: "d1", company: "Pearl Dental Care", city: "Kothrud, Pune", rating: 3.6, reviews: 84, website: "pearldentalpune.in", employees: "5–10", signals: [], contact: "Dr. Nikhil Apte", role: "Owner, BDS", email: "nikhil@pearldentalpune.in", emailStatus: "verified", emailSource: "Website contact page → verified", phone: "+91 98220 61204", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 91, aiAnswer: { value: "No", note: "Phone-only booking, no widget", confidence: 94 } },
  { id: "d2", company: "SmileCraft Clinic", city: "Wakad, Pune", rating: 3.8, reviews: 126, website: "smilecraft.co.in", employees: "10–25", signals: ["hiring"], contact: "Dr. Ritu Saxena", role: "Founder", email: "ritu@smilecraft.co.in", emailStatus: "verified", emailSource: "Licensed provider → verified", phone: "+91 97650 23019", phoneStatus: "verified", phoneSource: "Practo listing", fit: 88, aiAnswer: { value: "Yes", note: "Practo widget only", confidence: 71 } },
  { id: "d3", company: "Dentique Multispeciality", city: "Aundh, Pune", rating: 3.4, reviews: 59, website: "dentique.in", employees: "10–25", signals: ["new_outlet"], contact: "Dr. Sameer Kale", role: "Director", email: "info@dentique.in", emailStatus: "risky", emailSource: "Generic inbox (role-based)", phone: "+91 90110 88342", phoneStatus: "verified", phoneSource: "Justdial", fit: 84, aiAnswer: { value: "No", note: "Contact form only", confidence: 89 } },
  { id: "d4", company: "32 Pearls Family Dentistry", city: "Hadapsar, Pune", rating: 3.9, reviews: 211, website: "32pearlspune.com", employees: "5–10", signals: [], contact: "Dr. Anjali Rao", role: "Owner", email: "anjali@32pearlspune.com", emailStatus: "verified", emailSource: "Pattern match → SMTP verify", phone: "+91 98903 11876", phoneStatus: "risky", phoneSource: "Google Maps (clinic landline)", fit: 79, inCrm: true, aiAnswer: { value: "No", note: "WhatsApp link, no booking flow", confidence: 82 } },
  { id: "d5", company: "Tooth Fairy Kids Dental", city: "Baner, Pune", rating: 3.7, reviews: 47, website: "toothfairykids.in", employees: "5–10", signals: ["new_licence"], contact: "Dr. Pallavi Shetty", role: "Pedodontist & Owner", email: "", emailStatus: "not_found", emailSource: "No public email after 3 providers", phone: "+91 97300 66120", phoneStatus: "verified", phoneSource: "Google Maps listing", fit: 73, aiAnswer: { value: "Unclear", note: "Site not reachable", confidence: 40 } },
  { id: "d6", company: "Align Dental Studio", city: "Viman Nagar, Pune", rating: 3.5, reviews: 93, website: "aligndentalstudio.com", employees: "10–25", signals: ["hiring"], contact: "Dr. Harsh Mehta", role: "Co-founder", email: "harsh@aligndentalstudio.com", emailStatus: "verified", emailSource: "Website team page → verified", phone: "+91 98811 40922", phoneStatus: "verified", phoneSource: "Licensed provider", fit: 86, aiAnswer: { value: "No", note: "Calls only, 10 AM–7 PM", confidence: 90 } },
];

export const d2cPool: ProspectRow[] = [
  { id: "b1", company: "Bombay Botanics", city: "Mumbai", rating: 4.5, reviews: 1820, website: "bombaybotanics.in", employees: "25–50", signals: ["hiring", "funding"], contact: "Tanya Kapoor", role: "Co-founder & CEO", email: "tanya@bombaybotanics.in", emailStatus: "verified", emailSource: "Licensed provider → verified", phone: "+91 98201 33490", phoneStatus: "risky", phoneSource: "MCA filing", fit: 93, aiAnswer: { value: "Yes", note: "Shopify Plus (theme + checkout)", confidence: 97 } },
  { id: "b2", company: "Desi Crunch Foods", city: "Bengaluru", rating: 4.3, reviews: 640, website: "desicrunch.com", employees: "10–25", signals: ["hiring"], contact: "Arvind Nair", role: "Founder", email: "arvind@desicrunch.com", emailStatus: "verified", emailSource: "Website team page → verified", phone: "+91 99001 22871", phoneStatus: "verified", phoneSource: "Licensed provider", fit: 87, aiAnswer: { value: "Yes", note: "Shopify storefront detected", confidence: 95 } },
  { id: "b3", company: "Kosha Living", city: "Pune", rating: 4.6, reviews: 412, website: "koshaliving.in", employees: "10–25", signals: ["hiring", "new_outlet"], contact: "Ishita Bhosale", role: "Head of Growth", email: "ishita@koshaliving.in", emailStatus: "verified", emailSource: "Pattern match → SMTP verify", phone: "", phoneStatus: "not_found", phoneSource: "Not found in 3 providers", fit: 89, aiAnswer: { value: "No", note: "WooCommerce store", confidence: 88 } },
  { id: "b4", company: "TrueBrew Coffee Co.", city: "Chikmagalur", rating: 4.7, reviews: 2210, website: "truebrew.coffee", employees: "25–50", signals: ["funding"], contact: "Karthik Gowda", role: "CEO", email: "karthik@truebrew.coffee", emailStatus: "risky", emailSource: "Catch-all domain", phone: "+91 94480 77612", phoneStatus: "verified", phoneSource: "Website", fit: 81, aiAnswer: { value: "Yes", note: "Shopify + Razorpay checkout", confidence: 92 } },
  { id: "b5", company: "Mitti Handloom", city: "Jaipur", rating: 4.4, reviews: 389, website: "mittihandloom.com", employees: "5–10", signals: ["hiring"], contact: "Riya Singhal", role: "Founder", email: "riya@mittihandloom.com", emailStatus: "verified", emailSource: "Website contact page", phone: "+91 98290 51173", phoneStatus: "verified", phoneSource: "IndiaMART listing", fit: 76, aiAnswer: { value: "Yes", note: "Shopify (Dawn theme)", confidence: 90 } },
  { id: "b6", company: "FitFuel Nutrition", city: "Gurugram", rating: 4.1, reviews: 960, website: "fitfuel.in", employees: "50–200", signals: ["hiring"], contact: "Varun Malhotra", role: "VP Marketing", email: "varun.m@fitfuel.in", emailStatus: "verified", emailSource: "Licensed provider → verified", phone: "+91 98100 64288", phoneStatus: "verified", phoneSource: "Licensed provider", fit: 84, inCrm: true, aiAnswer: { value: "No", note: "Custom Next.js storefront", confidence: 79 } },
];

export type PoolKey = "agri" | "dental" | "d2c";

export const pools: Record<PoolKey, { rows: ProspectRow[]; total: number; filters: { key: string; label: string; value: string }[]; aiQuestion: string; sampleQuestions: string[] }> = {
  agri: { rows: prospectPool, total: 412, filters: planFilters, aiQuestion: "Do they sell drip irrigation?", sampleQuestions: ["Do they sell drip irrigation?", "Are they an authorised Jain Irrigation dealer?", "Do they offer credit to farmers?"] },
  dental: {
    rows: dentalPool,
    total: 186,
    filters: [
      { key: "industry", label: "Industry", value: "Dental clinics" },
      { key: "geo", label: "Location", value: "Pune (PMC + PCMC)" },
      { key: "rating", label: "Rating", value: "< 4.0★" },
      { key: "booking", label: "Online booking", value: "Not detected" },
      { key: "contact", label: "Contact", value: "Owner dentist" },
    ],
    aiQuestion: "Do they have online booking?",
    sampleQuestions: ["Do they have online booking?", "Do they reply to Google reviews?", "Do they offer aligners?"],
  },
  d2c: {
    rows: d2cPool,
    total: 97,
    filters: [
      { key: "industry", label: "Industry", value: "D2C consumer brands" },
      { key: "geo", label: "Location", value: "India" },
      { key: "signal", label: "Signal", value: "Hiring growth / performance marketer (30d)" },
      { key: "size", label: "Employees", value: "5–200" },
      { key: "contact", label: "Contact", value: "Founder / Head of Growth" },
    ],
    aiQuestion: "Are they on Shopify?",
    sampleQuestions: ["Are they on Shopify?", "Do they run Meta ads?", "Do they sell on Amazon too?"],
  },
};

export const poolForPrompt = (prompt: string): PoolKey =>
  /dental|clinic|dentist/i.test(prompt) ? "dental" : /d2c|brand|shopify|skincare|growth market/i.test(prompt) ? "d2c" : "agri";

export const signalMeta: Record<Signal, { label: string; tone: "info" | "success" | "ai" | "primary" }> = {
  hiring: { label: "Hiring", tone: "info" },
  new_outlet: { label: "New outlet", tone: "success" },
  funding: { label: "Funding", tone: "ai" },
  new_licence: { label: "New licence", tone: "primary" },
};

export const enrichmentProviders = [
  { id: "e1", label: "Website & contact pages", detail: "Crawl site, team & contact pages", hitRate: 46, cost: 0 },
  { id: "e2", label: "Licensed B2B data provider", detail: "Work email + direct dial", hitRate: 31, cost: 2 },
  { id: "e3", label: "Pattern match + SMTP verify", detail: "firstname@domain, catch-all check", hitRate: 12, cost: 1 },
];

/* ------------------------------------------------------------------ */
/* Sequences                                                           */
/* ------------------------------------------------------------------ */

export type SeqStatus = "active" | "paused" | "draft";
export type StepType = "email" | "whatsapp" | "linkedin" | "call" | "sms";

export interface SequenceStep {
  id: string;
  type: StepType;
  day: number;
  title: string;
  subject?: string;
  body: string;
  abTest?: boolean;
  variantB?: string;
  stats: { sent: number; opened: number; replied: number; booked: number };
}

export interface Sequence {
  id: string;
  name: string;
  status: SeqStatus;
  owner: string;
  audience: string;
  enrolled: number;
  active: number;
  replyRate: number;
  meetings: number;
  trend: number[];
  updated: string;
  steps: SequenceStep[];
}

const agriSteps: SequenceStep[] = [
  {
    id: "st1",
    type: "email",
    day: 0,
    title: "Intro email",
    subject: "{{company}} + faster dealer re-orders",
    body: "Hi {{first_name}},\n\n{{ai_first_line}}\n\nWe help agri-input dealers like {{company}} take farmer orders on WhatsApp and get paid via UPI, without extra staff. Dealers in {{city}} see ~30% faster re-orders in the kharif season.\n\nWorth a 15-min call this week?\n\nRahul\nAgriGrow Inputs",
    abTest: true,
    variantB: "Hi {{first_name}},\n\n{{ai_first_line}}\n\nQuick one: how do farmers place repeat orders with {{company}} today? Most dealers we talk to still take them on calls and notebooks.\n\nWe built a WhatsApp ordering + UPI payment flow for exactly this. Open to a 15-min look?\n\nRahul",
    stats: { sent: 412, opened: 268, replied: 41, booked: 9 },
  },
  {
    id: "st2",
    type: "whatsapp",
    day: 2,
    title: "WhatsApp template: dealer_intro_v2",
    body: "Namaste {{first_name}} ji 🙏 Rahul from AgriGrow here. Sent you an email about WhatsApp ordering for {{company}}. Can I share a 2-min demo video?",
    stats: { sent: 356, opened: 331, replied: 58, booked: 7 },
  },
  {
    id: "st3",
    type: "linkedin",
    day: 4,
    title: "LinkedIn task: connect + note",
    body: "Hi {{first_name}}, came across {{company}} while researching dealers in {{city}}. Would love to connect.",
    stats: { sent: 190, opened: 0, replied: 14, booked: 2 },
  },
  {
    id: "st4",
    type: "call",
    day: 5,
    title: "Call task: 3-min discovery",
    body: "Talk track: reference {{ai_first_line}}. Ask how many farmer orders come via WhatsApp today and who handles credit follow-ups. Goal: book demo.",
    stats: { sent: 142, opened: 0, replied: 37, booked: 6 },
  },
  {
    id: "st5",
    type: "email",
    day: 7,
    title: "Break-up email",
    subject: "Closing the loop, {{first_name}}",
    body: "Hi {{first_name}},\n\nI'll stop here. If WhatsApp ordering becomes a priority before rabi sowing, just reply 'yes' and I'll send the demo.\n\nRahul",
    stats: { sent: 248, opened: 139, replied: 16, booked: 2 },
  },
];

export const sequences: Sequence[] = [
  { id: "q1", name: "Agri dealers: Maharashtra (kharif)", status: "active", owner: "Priya Sharma", audience: "Agri-input dealers, Maharashtra", enrolled: 412, active: 186, replyRate: 12.4, meetings: 26, trend: [4, 6, 5, 8, 9, 7, 11, 12, 10, 14, 13, 16], updated: "2h ago", steps: agriSteps },
  { id: "q2", name: "Drip distributors: Gujarat", status: "active", owner: "Vikram Joshi", audience: "Drip irrigation distributors, Gujarat", enrolled: 143, active: 91, replyRate: 9.8, meetings: 8, trend: [2, 3, 3, 4, 3, 5, 6, 5, 6, 7, 6, 8], updated: "Yesterday", steps: agriSteps.slice(0, 4) },
  { id: "q3", name: "Clinics under 4★: reputation pitch", status: "paused", owner: "Neha Kulkarni", audience: "Dental clinics Pune <4★", enrolled: 186, active: 0, replyRate: 6.1, meetings: 4, trend: [5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0, 0], updated: "4d ago", steps: agriSteps.slice(0, 3) },
  { id: "q4", name: "D2C growth hires: founder note", status: "draft", owner: "Priya Sharma", audience: "D2C brands hiring growth marketers", enrolled: 0, active: 0, replyRate: 0, meetings: 0, trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], updated: "Just now", steps: agriSteps.slice(0, 2) },
  { id: "q5", name: "Seed licence holders: welcome", status: "active", owner: "Arjun Patil", audience: "Seed companies with new licences", enrolled: 38, active: 22, replyRate: 15.8, meetings: 5, trend: [0, 1, 1, 2, 2, 3, 3, 4, 3, 5, 5, 6], updated: "5h ago", steps: agriSteps },
];

export const mailboxes = [
  { id: "mb1", address: "rahul@agrigrow.in", provider: "Google Workspace", health: 96, warmup: "Warmed", dailyCap: 60, sentToday: 41 },
  { id: "mb2", address: "rahul.v@agrigrow-mail.in", provider: "Google Workspace", health: 88, warmup: "Warming · day 18/21", dailyCap: 30, sentToday: 22 },
  { id: "mb3", address: "team@agrigrow.co", provider: "Outlook 365", health: 64, warmup: "Needs attention", dailyCap: 20, sentToday: 6 },
];

export const replyClasses = [
  { label: "Interested", value: 38 },
  { label: "Not now", value: 27 },
  { label: "Wrong person", value: 12 },
  { label: "OOO", value: 9 },
  { label: "Unsubscribe", value: 7 },
];

export const personalisationVars = ["{{first_name}}", "{{company}}", "{{city}}", "{{ai_first_line}}", "{{ai_pain_point}}", "{{sender_name}}"];

export const aiFirstLineSamples = [
  { name: "Rahul Verma", company: "AgriGrow Inputs", line: "Saw AgriGrow just opened a second outlet in Pimpalgaon, congrats on the expansion before rabi season." },
  { name: "Nilesh Patil", company: "Kisan Agro Point", line: "412 Google reviews at 4.8★ is rare for a dealer; farmers clearly trust Kisan Agro Point." },
  { name: "Kavita Deshmukh", company: "Annadata Agri Solutions", line: "Loved your blog explaining the PMKSY drip subsidy in Marathi; super useful for Latur farmers." },
];

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export type CampaignStatus = "scheduled" | "sending" | "sent" | "draft";

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  segment: string;
  audience: number;
  status: CampaignStatus;
  when: string;
  delivered: number;
  read: number;
  replied: number;
  booked: number;
  revenue: number;
  template: string;
}

export const campaigns: Campaign[] = [
  { id: "cp1", name: "Diwali offer: 20% off whitening", channel: "whatsapp", segment: "All patients with WhatsApp opt-in", audience: 2840, status: "scheduled", when: "Thu, 29 Oct · 10:30 AM", delivered: 0, read: 0, replied: 0, booked: 0, revenue: 0, template: "diwali_whitening_offer" },
  { id: "cp2", name: "6-month cleaning reminder", channel: "whatsapp", segment: "Last visit > 6 months, customers", audience: 612, status: "sent", when: "Mon, 19 Oct · 11:00 AM", delivered: 598, read: 541, replied: 132, booked: 74, revenue: 148000, template: "cleaning_recall_6m" },
  { id: "cp3", name: "Aligner webinar invite", channel: "email", segment: "Aligner leads, last 90 days", audience: 1180, status: "sent", when: "Fri, 9 Oct · 6:00 PM", delivered: 1142, read: 506, replied: 61, booked: 23, revenue: 391000, template: "aligner_webinar" },
  { id: "cp4", name: "Kids' dental camp: Baner", channel: "sms", segment: "Parents, Baner pin codes", audience: 920, status: "sending", when: "Today · started 9:40 AM", delivered: 548, read: 0, replied: 19, booked: 11, revenue: 22000, template: "1107169845123456789" },
  { id: "cp5", name: "Implant EMI awareness", channel: "whatsapp", segment: "Implant enquiries, not booked", audience: 214, status: "draft", when: "—", delivered: 0, read: 0, replied: 0, booked: 0, revenue: 0, template: "implant_emi_0pct" },
  { id: "cp6", name: "Google review thank-you", channel: "whatsapp", segment: "5★ reviewers, Oct", audience: 86, status: "sent", when: "Thu, 1 Oct · 4:00 PM", delivered: 86, read: 82, replied: 29, booked: 6, revenue: 18000, template: "review_thanks_referral" },
];

export const campaignTrend = [
  { day: "D0", read: 380, replied: 61, booked: 22 },
  { day: "D1", read: 112, replied: 38, booked: 24 },
  { day: "D2", read: 28, replied: 17, booked: 14 },
  { day: "D3", read: 12, replied: 9, booked: 8 },
  { day: "D4", read: 6, replied: 4, booked: 4 },
  { day: "D5", read: 3, replied: 3, booked: 2 },
];

export interface WaTemplate {
  id: string;
  name: string;
  category: "Marketing" | "Utility";
  language: string;
  status: "approved" | "pending" | "rejected";
  header?: string;
  body: string;
  buttons: string[];
  media?: "image" | "video" | "none";
}

export const waTemplates: WaTemplate[] = [
  { id: "t1", name: "cleaning_recall_6m", category: "Utility", language: "English", status: "approved", media: "none", body: "Hi {{1}}, it's been 6 months since your last visit at Smile Dental {{2}}. Time for your routine cleaning! 🦷 Book a slot in 10 seconds below.", buttons: ["Book cleaning", "Remind me later", "Stop"] },
  { id: "t2", name: "diwali_whitening_offer", category: "Marketing", language: "English + Hindi", status: "approved", media: "image", header: "✨ Diwali Smile Offer", body: "Namaste {{1}}! This Diwali, light up your smile ✨ Get 20% off laser whitening at Smile Dental {{2}} till 15 Nov. Only {{3}} slots left this week.", buttons: ["Book now", "Know more", "Stop"] },
  { id: "t3", name: "implant_emi_0pct", category: "Marketing", language: "English", status: "pending", media: "none", body: "Hi {{1}}, implants now on 0% EMI from ₹2,999/month at Smile Dental. Want our coordinator to call you?", buttons: ["Call me", "Not now"] },
  { id: "t4", name: "aligner_webinar_wa", category: "Marketing", language: "English", status: "rejected", media: "video", body: "Hi {{1}}, join Dr. Kulkarni's free webinar on invisible aligners this Saturday. Limited seats!", buttons: ["Register"] },
];

export const segmentFields = ["Stage", "Last visit", "WhatsApp opt-in", "Tag", "Location", "Lifetime value", "Language"] as const;

export const aiSegments = [
  { name: "Due for cleaning, high LTV", rule: "Last visit > 6 months · LTV > ₹15k", count: 329, why: "Highest rebooking rate (41%) in past recalls" },
  { name: "Likely to churn", rule: "Customer · last visit > 9 months · AI churn score > 0.7", count: 486, why: "Win-back offer recommended" },
  { name: "Whitening interest, not booked", rule: "Asked about whitening · no booking", count: 288, why: "Matches Diwali offer intent" },
];
