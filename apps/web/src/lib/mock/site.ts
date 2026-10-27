import {
  Bot,
  Briefcase,
  CalendarCheck,
  Car,
  ChartColumn,
  Database,
  FileCheck,
  GraduationCap,
  House,
  Lock,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Repeat,
  Search,
  ShieldCheck,
  Star,
  Stethoscope,
  Wrench,
} from "lucide-react";
import { plans } from "./platform";

/**
 * Mock content for Anvita's public marketing site (/, /pricing, /solutions/*).
 * Plans and credit packs are re-used from the in-app billing mock so prices match.
 */

export { plans };

export const productNav = [
  { id: "agent", label: "AI Agent", description: "24/7 replies, bookings and deposits on WhatsApp", href: "/#agent", icon: Bot },
  { id: "prospecting", label: "Prospecting", description: "Find leads with a plain-English search", href: "/#prospecting", icon: Search },
  { id: "marketing", label: "AI marketing", description: "Campaign planner, ads co-pilot and AEO", href: "/#marketing", icon: Megaphone },
  { id: "reviews", label: "Reviews & payments", description: "Google reviews, UPI pay links, invoices", href: "/#reviews", icon: Star },
  { id: "analytics", label: "Analytics", description: "Cost per booked customer, not per click", href: "/#analytics", icon: ChartColumn },
] as const;

export interface Industry {
  id: string;
  label: string;
  blurb: string;
  examples: string;
  icon: typeof Bot;
  href?: string;
}

export const industries: Industry[] = [
  { id: "clinics", label: "Clinics & healthcare", blurb: "Answer every patient on WhatsApp, book consults, cut no-shows with deposits and reminders.", examples: "Dental, derma, physio, IVF, eye care", icon: Stethoscope, href: "/solutions/clinics" },
  { id: "real-estate", label: "Real estate", blurb: "Qualify portal and ad leads in seconds, share brochures, book site visits.", examples: "Developers, brokers, co-living", icon: House },
  { id: "education", label: "Education", blurb: "Handle admission enquiries in Hindi or English, book counselling, collect fees.", examples: "Coaching, schools, ed-tech, study abroad", icon: GraduationCap },
  { id: "auto", label: "Auto dealers", blurb: "Book test drives and service slots, send quotes and EMI options instantly.", examples: "Car & two-wheeler dealers, service centres", icon: Car },
  { id: "home-services", label: "Home services", blurb: "Quote, schedule technicians and collect UPI payments right in the chat.", examples: "AC repair, pest control, interiors, cleaning", icon: Wrench },
  { id: "b2b", label: "B2B & distribution", blurb: "Build dealer lists from a prompt, run WhatsApp + email sequences, book demos.", examples: "Agri-inputs, SaaS, manufacturing", icon: Briefcase },
];

export const customerLogos = [
  { name: "Smile Dental", mono: "SD", city: "Pune" },
  { name: "Deshpande Realty", mono: "DR", city: "Nashik" },
  { name: "BrightPath Academy", mono: "BP", city: "Lucknow" },
  { name: "Sandhu Motors", mono: "SM", city: "Ludhiana" },
  { name: "CoolCare Services", mono: "CC", city: "Chennai" },
  { name: "Nirmal Physio", mono: "NP", city: "Indore" },
  { name: "UrbanNest Homes", mono: "UN", city: "Bengaluru" },
  { name: "Glow Skin Clinic", mono: "GS", city: "Jaipur" },
];

export const journey = [
  { id: "find", step: "Find", title: "Build lead lists from a sentence", module: "Prospecting", body: "“Dental labs in Maharashtra with under 4★ and no online booking.” Anvita searches Maps, the web and registries, enriches and scores every row.", icon: Search },
  { id: "attract", step: "Attract", title: "Plan and run campaigns", module: "AI marketing", body: "A campaign planner drafts the audience, channels, budget and creatives. Ads, broadcasts and AEO, all approval-first.", icon: Megaphone },
  { id: "engage", step: "Engage", title: "Answer every enquiry in seconds", module: "Inbox + AI Agent", body: "WhatsApp, Instagram, SMS, email and webchat in one inbox. The AI replies 24/7 in Hindi, English or Hinglish.", icon: MessagesSquare },
  { id: "convert", step: "Convert", title: "Book, quote and get paid in-chat", module: "Booking, pipeline & payments", body: "Real calendar slots, deal stages and UPI deposit links, so an enquiry turns into a paid booking without a phone call.", icon: CalendarCheck },
  { id: "retain", step: "Retain", title: "Reviews, recalls and win-backs", module: "Reviews & automations", body: "Ask happy customers for Google reviews, route unhappy ones to you, and bring people back when they're due.", icon: Repeat },
];

export const stats = [
  { id: "frt", value: 38, suffix: "s", label: "median first response", detail: "vs 4h+ for a busy front desk" },
  { id: "res", value: 87, suffix: "%", label: "of enquiries resolved by AI", detail: "the rest handed to your team with a summary" },
  { id: "noshow", value: 41, suffix: "%", prefix: "−", label: "fewer no-shows", detail: "with deposits + WhatsApp reminders" },
];

/** Comparison vs the stack Anvita replaces. Based on docs/01 §4 (publicly documented features). */
export type Support = "yes" | "partial" | "no" | "varies";

export interface CompareRow {
  label: string;
  anvita: Support;
  podium: Support;
  origami: Support;
  different: Support;
  agency: Support;
}

export const compareRows: CompareRow[] = [
  { label: "Natural-language lead search", anvita: "yes", podium: "no", origami: "yes", different: "no", agency: "varies" },
  { label: "Contact enrichment & verification", anvita: "yes", podium: "no", origami: "yes", different: "no", agency: "varies" },
  { label: "Outbound sequences (email, WhatsApp)", anvita: "yes", podium: "no", origami: "partial", different: "partial", agency: "varies" },
  { label: "Campaign planner + brand memory", anvita: "yes", podium: "no", origami: "no", different: "yes", agency: "varies" },
  { label: "SEO content & answer-engine optimisation", anvita: "yes", podium: "no", origami: "no", different: "yes", agency: "varies" },
  { label: "Unified inbox (WhatsApp, SMS, email, social)", anvita: "yes", podium: "yes", origami: "no", different: "no", agency: "no" },
  { label: "Inbound AI agent, 24/7", anvita: "yes", podium: "yes", origami: "no", different: "no", agency: "no" },
  { label: "Appointment booking", anvita: "yes", podium: "yes", origami: "no", different: "no", agency: "no" },
  { label: "Reviews: request + AI reply", anvita: "yes", podium: "yes", origami: "no", different: "no", agency: "varies" },
  { label: "Text-to-pay / UPI links", anvita: "yes", podium: "yes", origami: "no", different: "no", agency: "no" },
  { label: "Attribution: ad → conversation → revenue", anvita: "yes", podium: "partial", origami: "no", different: "partial", agency: "varies" },
  { label: "Self-serve, transparent pricing", anvita: "yes", podium: "no", origami: "yes", different: "no", agency: "no" },
  { label: "WhatsApp-first, Hindi & regional languages", anvita: "yes", podium: "no", origami: "no", different: "no", agency: "varies" },
];

export const testimonials = [
  { name: "Priya Sharma", role: "Owner, Smile Dental · Pune", quote: "Patients message us at 11 PM asking about whitening. Anvi replies in Hinglish, books the Saturday slot and collects the ₹500 deposit before I wake up.", metric: "+54% new patients / month" },
  { name: "Sunita Deshpande", role: "Founder, Deshpande Realty · Nashik", quote: "Our 99acres and Meta leads used to go cold in an hour. Now every one gets a brochure and a site-visit slot within a minute, even on Sundays.", metric: "3.1× site visits booked" },
  { name: "Farhan Qureshi", role: "Director, BrightPath Academy · Lucknow", quote: "Admission season means 600 enquiries a week. The AI answers fee and batch questions in Hindi and only sends my counsellors the serious parents.", metric: "71% enquiries fully handled" },
  { name: "Gurpreet Sandhu", role: "MD, Sandhu Motors · Ludhiana", quote: "Test drives, service reminders, EMI quotes, it's all one WhatsApp number now. I finally know which ad actually sold a car.", metric: "₹412 cost per test drive" },
];

export const compliance = [
  { id: "dpdp", label: "DPDP Act 2023", body: "Consent records, purpose limitation and one-click data-principal requests (export, correct, delete).", icon: ShieldCheck },
  { id: "gdpr", label: "GDPR-ready", body: "DPA, sub-processor list and EU data handling for customers serving Europe.", icon: FileCheck },
  { id: "wa", label: "WhatsApp Business Platform", body: "Official Cloud API via Meta, approved templates, opt-in and quality-rating monitoring.", icon: MessageCircle },
  { id: "dlt", label: "TRAI DLT for SMS", body: "Registered headers and templates, so transactional and promotional SMS actually deliver.", icon: Lock },
  { id: "data", label: "Data stays yours", body: "Encrypted at rest and in transit, India-region hosting, full audit log and export anytime.", icon: Database },
];

export const homeFaqs = [
  { q: "Will the AI say something wrong to my customers?", a: "Anvita only answers from your knowledge base (website, price list, FAQs) and cites the source. Guardrails block medical or legal advice, discounts beyond your limit and invented prices. Anything uncertain, angry or high-value is handed to a human with a summary." },
  { q: "Do I need the WhatsApp Business API? I only have the WhatsApp Business app.", a: "We connect you to the official WhatsApp Business Platform during onboarding (about 10 minutes with your Facebook Business account). You can keep your existing number, and your team replies from the Anvita inbox or mobile app." },
  { q: "Does it really speak Hindi and Hinglish?", a: "Yes. The agent detects the customer's language and replies in the same one: English, Hindi, Hinglish, Marathi, Tamil, Telugu, Bengali, Gujarati and more. You can lock it to specific languages per channel." },
  { q: "Can I start in Copilot mode before letting the AI reply on its own?", a: "Absolutely. In Copilot mode the AI drafts every reply and your team sends it. Switch individual playbooks (FAQ, booking, deposits) to Autopilot when you trust them. Most teams go live on Autopilot for FAQs within a week." },
  { q: "Which calendars, payment gateways and CRMs does it work with?", a: "Google and Outlook calendars, Razorpay, Stripe and UPI for payments, and HubSpot, Zoho, Salesforce, Pipedrive, Google Sheets and Shopify via integrations, plus Zapier/Make, webhooks and a REST API." },
  { q: "How long does setup take?", a: "Paste your website URL and Anvita drafts your services, hours, FAQs, prices and tone in about two minutes. Connecting WhatsApp, your calendar and Razorpay takes most businesses under 30 minutes." },
];

/* ---------------- Pricing ---------------- */

export type Cell = boolean | string;

export interface PricingModule {
  module: string;
  rows: { label: string; values: [Cell, Cell, Cell, Cell] }[];
}

/** Values are [Starter, Growth, Scale, Agency], consistent with plans in mock/platform.ts. */
export const pricingMatrix: PricingModule[] = [
  {
    module: "Inbox & channels",
    rows: [
      { label: "Unified inbox + website webchat", values: [true, true, true, true] },
      { label: "WhatsApp Business, SMS, email", values: [true, true, true, true] },
      { label: "Instagram, Facebook & Google messages", values: [false, true, true, true] },
      { label: "Locations / users", values: ["1 / 3", "3 / 10", "Unlimited", "Unlimited"] },
    ],
  },
  {
    module: "AI Agent",
    rows: [
      { label: "AI conversations included / mo", values: ["500", "2,000", "6,000", "6,000 per client"] },
      { label: "Copilot mode (AI drafts, you send)", values: [true, true, true, true] },
      { label: "Autopilot playbooks (book, quote, deposit)", values: [false, true, true, true] },
      { label: "Agent Studio: test scenarios & evals", values: [false, false, true, true] },
      { label: "AI voice agent minutes", values: [false, false, "500 min", "500 min"] },
    ],
  },
  {
    module: "Convert & retain",
    rows: [
      { label: "Booking page + calendar sync", values: [false, true, true, true] },
      { label: "Deals pipeline", values: [false, true, true, true] },
      { label: "UPI / Razorpay pay links", values: [false, true, true, true] },
      { label: "Review requests + AI replies", values: [false, true, true, true] },
    ],
  },
  {
    module: "Marketing & prospecting",
    rows: [
      { label: "Broadcast campaigns & segments", values: [false, true, true, true] },
      { label: "Campaign planner, ads co-pilot, AEO", values: [false, true, true, true] },
      { label: "Prospecting credits / mo", values: [false, "1,000", "1,000", "1,000 per client"] },
      { label: "Multi-step outbound sequences", values: [false, false, true, true] },
    ],
  },
  {
    module: "Platform",
    rows: [
      { label: "Analytics & weekly AI growth report", values: ["Basic", true, true, true] },
      { label: "CRM integrations, REST API & webhooks", values: [false, false, true, true] },
      { label: "White-label, custom domain, client workspaces", values: [false, false, false, true] },
      { label: "Rebilling & margins", values: [false, false, false, true] },
      { label: "Support", values: ["Email", "Chat + WhatsApp", "Priority", "Priority + CSM"] },
    ],
  },
];

export const usageCredits = [
  { id: "ai", label: "AI conversations", unit: "conversation", body: "One customer thread handled by the AI within 24 hours, however many messages it takes. Above your quota: packs of 500 for ₹1,499.", rate: "≈ ₹3 / conversation" },
  { id: "prospect", label: "Prospecting rows", unit: "row", body: "One credit per verified lead row with enrichment (email, phone, firmographics). AI columns cost 1 credit per row answered. Packs of 1,000 for ₹2,999.", rate: "≈ ₹3 / row" },
  { id: "voice", label: "Voice minutes", unit: "minute", body: "Inbound and outbound AI calls, billed per connected minute. Scale includes 500 minutes; packs of 250 for ₹1,999.", rate: "≈ ₹8 / minute" },
  { id: "wa", label: "WhatsApp & SMS pass-through", unit: "message", body: "Meta's per-conversation fees and DLT SMS charges, passed through at cost from a prepaid wallet. No markup.", rate: "At cost" },
];

export const pricingFaqs = [
  { q: "Is there a free trial?", a: "Yes, 14 days of Growth, no card required. You keep everything you set up when you pick a plan." },
  { q: "Are prices inclusive of GST?", a: "Prices are in INR and exclude 18% GST. You'll get a GST invoice with your GSTIN every month." },
  { q: "What happens if I run out of AI conversations?", a: "The AI keeps replying and we notify you at 80% and 100%. Top up with a pack, or we bill overage at pack rates on your next invoice. You can also set a hard cap." },
  { q: "How does yearly billing work?", a: "Pay for 10 months, get 12. Yearly plans are paid upfront via UPI, card or bank transfer and can be upgraded anytime (prorated)." },
  { q: "Can I change plans later?", a: "Upgrade instantly with a prorated charge, or downgrade at the end of your billing cycle. No lock-in on monthly plans." },
  { q: "Do you offer discounts for agencies or NGOs?", a: "The Agency plan includes rebilling so you can set your own margin. Registered non-profits and early-stage startups get 30% off. Write to sales." },
];

/* ---------------- Solutions: clinics ---------------- */

export const clinicCase = {
  business: "Smile Dental",
  location: "2 locations · Pune",
  owner: "Priya Sharma",
  period: "First 90 days on Anvita (Jul–Oct 2026)",
  metrics: [
    { label: "First response time", before: "4h 12m", after: "38s", delta: "−99%" },
    { label: "After-hours enquiries answered", before: "12%", after: "100%", delta: "+88 pts" },
    { label: "No-show rate", before: "22%", after: "13%", delta: "−41%" },
    { label: "New patients / month", before: "96", after: "148", delta: "+54%" },
    { label: "Google rating", before: "4.3★ (212)", after: "4.8★ (389)", delta: "+177 reviews" },
    { label: "Cost per booked patient", before: "₹910", after: "₹344", delta: "−62%" },
  ],
  journey: [
    { step: "Ad click or Google search", detail: "Click-to-WhatsApp ad, GBP message or website chat", icon: Megaphone },
    { step: "AI answers in 38s", detail: "Treatment info and price range from your price list, in Hinglish", icon: Bot },
    { step: "Books a real slot", detail: "Checks the dentist's calendar at the right branch", icon: CalendarCheck },
    { step: "Collects a deposit", detail: "₹500 refundable UPI link for whitening & implant consults", icon: Lock },
    { step: "Reminds and confirms", detail: "WhatsApp reminders 24h and 2h before, reschedule by chat", icon: MessageCircle },
    { step: "Asks for a review", detail: "Happy patients get the Google link; unhappy ones reach the manager", icon: Star },
    { step: "6-month recall", detail: "Cleaning due? Anvita re-books automatically", icon: Repeat },
  ],
};

export const clinicFeatures = [
  { title: "Speaks your patients' language", body: "Hindi, English, Hinglish, Marathi and more. Detects the language and replies in kind." },
  { title: "No medical advice, ever", body: "Guardrails refuse diagnosis and prescriptions, and suggest a consult instead." },
  { title: "Multi-branch, multi-doctor calendars", body: "Books the right dentist at the right location, respecting chair time and breaks." },
  { title: "Deposits that cut no-shows", body: "Refundable UPI deposits for high-value consults, adjusted in the final bill." },
  { title: "Practo, Google & Justdial reviews", body: "Monitor every platform; AI drafts replies in your clinic's tone for approval." },
  { title: "Recall & treatment-plan follow-ups", body: "Cleaning recalls, aligner check-ins and unfinished treatment plans, automated." },
];
