/**
 * Mock data for the AI demand-generation features of the Marketing module
 * (feature catalog M4 rows 4.6–4.10, inspired by Different / different.ai):
 * shared strategy & brand memory, campaign planner, multi-channel campaigns,
 * approval queue with audit log, AI landing pages and answer-engine optimisation (AEO).
 *
 * Two pipelines share the same AI "brain":
 * - clinic: Smile Dental (2 clinics in Pune) → patient bookings (default)
 * - b2b:    agri-input dealer outbound motion (Rahul Verma @ AgriGrow Inputs is c8 in core.ts) → demo calls
 */

export type Pipeline = "clinic" | "b2b";

export const pipelineMeta: Record<Pipeline, { label: string; short: string; outcome: string; outcomePlural: string }> = {
  clinic: { label: "Smile Dental · patients", short: "Smile Dental", outcome: "booking", outcomePlural: "bookings" },
  b2b: { label: "Agri dealers · B2B", short: "Agri dealers", outcome: "demo call", outcomePlural: "demo calls" },
};

export type DgChannel = "google" | "meta" | "linkedin" | "email" | "whatsapp" | "landing" | "aeo";

export const dgChannelMeta: Record<DgChannel, { label: string; short: string }> = {
  google: { label: "Google Ads", short: "Google" },
  meta: { label: "Meta Ads", short: "Meta" },
  linkedin: { label: "LinkedIn Ads", short: "LinkedIn" },
  email: { label: "Email", short: "Email" },
  whatsapp: { label: "WhatsApp", short: "WhatsApp" },
  landing: { label: "Landing page", short: "Landing" },
  aeo: { label: "AI search (AEO)", short: "AEO" },
};

/* ------------------------------------------------------------------ */
/* Strategy & brand memory                                             */
/* ------------------------------------------------------------------ */

export type MemoryKey = "icp" | "offers" | "voice" | "proof" | "winners" | "losers";

export interface MemoryGroup {
  key: MemoryKey;
  label: string;
  hint: string;
  items: string[];
}

export const strategyMemory: Record<Pipeline, MemoryGroup[]> = {
  clinic: [
    { key: "icp", label: "Ideal patients", hint: "Who we want more of", items: ["Working professionals 25–40, Koregaon Park & Baner", "Brides/grooms 3–6 months before the wedding", "Parents of kids 6–14 (braces, aligners)", "Implant seekers 45+, price-sensitive, want EMI"] },
    { key: "offers", label: "Offers", hint: "What we can promise", items: ["Whitening from ₹8,000 (60 min, 1 visit)", "Free consult + X-ray for implants", "0% EMI up to 9 months", "Same-day emergency slot"] },
    { key: "voice", label: "Brand voice", hint: "How we sound", items: ["Warm, reassuring, never salesy", "Bilingual: English + simple Hindi", "No “guaranteed” or “painless forever” claims", "Doctor-first: Dr. Mehta, Dr. Kulkarni"] },
    { key: "proof", label: "Proof points", hint: "What makes it believable", items: ["4.8★ from 1,240 Google reviews", "12,000+ patients since 2014", "ISO-certified sterilisation", "Before/after gallery (consented)"] },
    { key: "winners", label: "Past winners", hint: "Angles that worked", items: ["“Painless, 60 min” angle (2.1× CTR)", "WhatsApp-first CTA (+38% leads)", "Doctor video testimonial on Reels"] },
    { key: "losers", label: "Past losers", hint: "Angles to avoid", items: ["Discount-led “50% off” (low-quality leads)", "Broad match “dentist near me”", "Stock-photo smiles (CTR −40%)"] },
  ],
  b2b: [
    { key: "icp", label: "ICP", hint: "Accounts we target", items: ["Agri-input dealers, Maharashtra & Gujarat", "5–200 staff, 4★+ on Google Maps", "Owner/MD is the buyer", "Sells seeds, fertiliser, drip kits"] },
    { key: "offers", label: "Offers", hint: "What we can promise", items: ["WhatsApp ordering + UPI collections", "Free 14-day pilot with 1 outlet", "Kharif re-order reminders out of the box"] },
    { key: "voice", label: "Brand voice", hint: "How we sound", items: ["Practical, peer-to-peer, Marathi/Hindi greetings", "Numbers over adjectives", "Short emails, one ask"] },
    { key: "proof", label: "Proof points", hint: "What makes it believable", items: ["~30% faster re-orders in kharif", "Used by 140+ dealers in 6 districts", "Case study: Vidarbha Agri Mart"] },
    { key: "winners", label: "Past winners", hint: "Angles that worked", items: ["Season-timed subject lines (kharif/rabi)", "2-min demo video on WhatsApp", "Subsidy (PMKSY) help angle"] },
    { key: "losers", label: "Past losers", hint: "Angles to avoid", items: ["Generic “digital transformation” copy", "Calendly link in first email"] },
  ],
};

export interface Learning {
  id: string;
  when: string;
  source: DgChannel;
  sourceLabel: string;
  metric: string;
  applied: string;
  appliedTo: DgChannel[];
  result?: string;
}

export const learnings: Record<Pipeline, Learning[]> = {
  clinic: [
    { id: "l1", when: "2h ago", source: "meta", sourceLabel: "Whitening – Pune Meta ad", metric: "2.1× CTR vs account avg", applied: "Applied the ‘painless, 60 min’ angle to the whitening email and landing-page hero", appliedTo: ["email", "landing"], result: "Landing conversion 6.8% → 9.4%" },
    { id: "l2", when: "Yesterday", source: "whatsapp", sourceLabel: "Diwali recall broadcast", metric: "41% reply rate, 62 bookings", applied: "Moved the ‘Book on WhatsApp’ CTA above the fold on Google ads + landing page", appliedTo: ["google", "landing"] },
    { id: "l3", when: "3d ago", source: "google", sourceLabel: "Implants – Broad", metric: "₹5,333 per booked (worst)", applied: "Excluded ‘cheap/free implants’ intent from Meta lookalikes and paused broad match", appliedTo: ["meta"], result: "Cost per booked −18% in 3 days" },
    { id: "l4", when: "1w ago", source: "aeo", sourceLabel: "ChatGPT answer for ‘teeth whitening cost Pune’", metric: "Competitor cited, we weren't", applied: "Published price FAQ with schema; reused the same price ranges in ads to keep claims consistent", appliedTo: ["landing", "google"] },
    { id: "l5", when: "2w ago", source: "email", sourceLabel: "Aligner nurture email #2", metric: "Subject with doctor's name +27% opens", applied: "Using doctor names in WhatsApp templates and Meta primary text", appliedTo: ["whatsapp", "meta"] },
  ],
  b2b: [
    { id: "lb1", when: "5h ago", source: "email", sourceLabel: "Agri dealers: Maharashtra (kharif) step 1", metric: "Season subject line: 58% open", applied: "Applied kharif timing to LinkedIn ad headline and landing page hero", appliedTo: ["linkedin", "landing"] },
    { id: "lb2", when: "2d ago", source: "whatsapp", sourceLabel: "2-min demo video follow-up", metric: "3.4× more demo calls than PDF", applied: "Swapped PDF for the video in email step 3 and on the landing page", appliedTo: ["email", "landing"], result: "Demo-call rate 4.1% → 6.0%" },
    { id: "lb3", when: "1w ago", source: "linkedin", sourceLabel: "Owner/MD targeting test", metric: "CPL ₹2,100 vs ₹4,800 for ‘manager’ titles", applied: "Narrowed Google Ads audience to owner-led businesses; email persona set to Owner/MD", appliedTo: ["google", "email"] },
  ],
};

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export type Goal = "bookings" | "demo" | "webinar";

export const goalMeta: Record<Goal, { label: string; outcome: string; outcomeShort: string; description: string }> = {
  bookings: { label: "Patient bookings", outcome: "Booked appointments", outcomeShort: "Booked", description: "Appointments booked by the AI agent or front desk" },
  demo: { label: "Demo calls", outcome: "Demo calls held", outcomeShort: "Demos", description: "Qualified 15-min calls on your calendar" },
  webinar: { label: "Webinar sign-ups", outcome: "Webinar attendees", outcomeShort: "Attendees", description: "Registrations that actually attend live" },
};

export type CampaignStatus = "active" | "planned" | "completed";
export type RunStatus = "live" | "scheduled" | "in_review" | "done" | "paused";

export type AssetKind = "ad" | "email" | "landing" | "whatsapp" | "aeo";

export interface DgAsset {
  id: string;
  kind: AssetKind;
  channel: DgChannel;
  title: string;
  /** e.g. "Variant A" / "Subject" */
  label?: string;
  body: string;
  stat?: string;
}

export interface ChannelRun {
  channel: DgChannel;
  status: RunStatus;
  budget: number;
  spend: number;
  leads: number;
  outcomes: number;
  assets: DgAsset[];
  note?: string;
}

export interface DgCampaign {
  id: string;
  pipeline: Pipeline;
  name: string;
  goal: Goal;
  status: CampaignStatus;
  dates: string;
  owner: string;
  budget: number;
  target: number;
  audience: string[];
  channels: ChannelRun[];
  learningsApplied: { from: DgChannel; to: DgChannel; text: string }[];
  trend: number[];
  aiSummary: string;
}

const whiteningAssets = {
  adA: { id: "wa1", kind: "ad", channel: "meta", title: "Whiter smile in 60 minutes", label: "Variant A · winner", body: "Painless, 60-minute whitening at Smile Dental, Koregaon Park. From ₹8,000 · 0% EMI. Tap to book on WhatsApp.", stat: "CTR 2.4%" },
  adB: { id: "wa2", kind: "ad", channel: "google", title: "Teeth Whitening Pune | From ₹8,000", label: "Responsive search ad", body: "1 visit, 60 min, done by Dr. Mehta. 4.8★ from 1,240 reviews. Book on WhatsApp in 30 sec.", stat: "CTR 7.9%" },
  email: { id: "we1", kind: "email", channel: "email", title: "Your wedding-ready smile, in one 60-min visit", label: "Subject", body: "Hi {{first_name}}, Dr. Mehta here. Our painless whitening takes 60 minutes and starts at ₹8,000 (0% EMI). Reply or tap below to pick a slot.", stat: "Open 46% · Click 9.1%" },
  wa: { id: "ww1", kind: "whatsapp", channel: "whatsapp", title: "whitening_offer_nov (Utility)", label: "Template", body: "Namaste {{1}} 😊 Smile Dental here. Whitening slots this week: {{2}}. 60 min, from ₹8,000, 0% EMI. Reply 1 to book, 2 to talk to Dr. Mehta.", stat: "Reply 38%" },
  lp: { id: "wl1", kind: "landing", channel: "landing", title: "smile.anvita.site/whitening", label: "Landing page", body: "Hero: ‘A brighter smile in 60 painless minutes’ · Offer · 4.8★ proof · FAQ · WhatsApp booking form", stat: "Conv. 9.4%" },
  aeo: { id: "wo1", kind: "aeo", channel: "aeo", title: "Teeth whitening cost in Pune (2026 guide)", label: "AEO page", body: "FAQ page with price ranges, sessions, sensitivity and aftercare, marked up with FAQPage + Dentist schema.", stat: "Cited by Perplexity" },
} satisfies Record<string, DgAsset>;

export const dgCampaigns: DgCampaign[] = [
  {
    id: "dc1",
    pipeline: "clinic",
    name: "Wedding-season whitening",
    goal: "bookings",
    status: "active",
    dates: "12 Oct – 30 Nov",
    owner: "Priya Sharma",
    budget: 60000,
    target: 70,
    audience: ["Brides/grooms 3–6 months out", "Working professionals 25–40, KP & Baner", "Past patients: cleaning in last 12 mo"],
    channels: [
      { channel: "meta", status: "live", budget: 21000, spend: 11840, leads: 46, outcomes: 14, assets: [whiteningAssets.adA] },
      { channel: "google", status: "live", budget: 24000, spend: 13120, leads: 38, outcomes: 15, assets: [whiteningAssets.adB] },
      { channel: "email", status: "done", budget: 2000, spend: 2000, leads: 22, outcomes: 7, assets: [whiteningAssets.email], note: "Sent to 1,860 past patients" },
      { channel: "whatsapp", status: "live", budget: 6000, spend: 2950, leads: 31, outcomes: 9, assets: [whiteningAssets.wa] },
      { channel: "landing", status: "live", budget: 0, spend: 0, leads: 0, outcomes: 0, assets: [whiteningAssets.lp], note: "A/B: hero B leading (+2.6 pts)" },
      { channel: "aeo", status: "in_review", budget: 3000, spend: 1200, leads: 4, outcomes: 2, assets: [whiteningAssets.aeo], note: "FAQ page waiting for approval" },
    ],
    learningsApplied: [
      { from: "meta", to: "email", text: "‘Painless, 60 min’ angle (2.1× CTR on Meta) used as email subject → opens 31% → 46%" },
      { from: "meta", to: "landing", text: "Same angle in landing hero B → conversion 6.8% → 9.4%" },
      { from: "whatsapp", to: "google", text: "‘Book on WhatsApp’ CTA moved into Google ad descriptions → CTR +1.2 pts" },
      { from: "aeo", to: "google", text: "Price ranges aligned across ads and the AEO FAQ so AI answers match ad claims" },
    ],
    trend: [1, 2, 2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8],
    aiSummary: "On track for 70 bookings (47 so far, day 16 of 50). Meta brings cheaper leads, Google brings higher-intent bookings. Recommend shifting ₹4,000 from Meta to Google next week.",
  },
  {
    id: "dc2",
    pipeline: "clinic",
    name: "Implant consult month",
    goal: "bookings",
    status: "active",
    dates: "1 Oct – 31 Oct",
    owner: "Neha Kulkarni",
    budget: 45000,
    target: 24,
    audience: ["Implant seekers 45+", "Missing-tooth searchers, Pune West", "Lapsed patients 2+ yrs"],
    channels: [
      { channel: "google", status: "live", budget: 30000, spend: 27400, leads: 61, outcomes: 11, assets: [{ id: "ia1", kind: "ad", channel: "google", title: "Dental Implants Pune | Free Consult", label: "Responsive search ad", body: "Free consult + 3D X-ray. 0% EMI up to 9 months. Dr. Kulkarni, 14 yrs experience.", stat: "CTR 5.2%" }] },
      { channel: "meta", status: "paused", budget: 9000, spend: 6100, leads: 29, outcomes: 3, assets: [], note: "Paused by AI: cost per booked ₹2,033 > target" },
      { channel: "whatsapp", status: "live", budget: 4000, spend: 3300, leads: 18, outcomes: 6, assets: [] },
      { channel: "landing", status: "live", budget: 0, spend: 0, leads: 0, outcomes: 0, assets: [] },
    ],
    learningsApplied: [{ from: "google", to: "meta", text: "Excluded ‘cheap/free implants’ intent from Meta lookalikes" }],
    trend: [0, 1, 1, 0, 2, 1, 1, 2, 1, 2, 3, 2, 2, 2],
    aiSummary: "20 of 24 bookings with 4 days left. Meta paused after poor booking rate; Google + WhatsApp recall carrying the campaign.",
  },
  {
    id: "dc3",
    pipeline: "clinic",
    name: "Kids braces: back-to-school",
    goal: "bookings",
    status: "planned",
    dates: "1 Dec – 15 Jan",
    owner: "Priya Sharma",
    budget: 38000,
    target: 30,
    audience: ["Parents of kids 6–14, Baner & Aundh", "School partnerships list"],
    channels: [
      { channel: "meta", status: "scheduled", budget: 18000, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "email", status: "in_review", budget: 1000, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "whatsapp", status: "in_review", budget: 4000, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "landing", status: "in_review", budget: 0, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "aeo", status: "scheduled", budget: 3000, spend: 0, leads: 0, outcomes: 0, assets: [] },
    ],
    learningsApplied: [{ from: "email", to: "whatsapp", text: "Doctor's name in the opening line (+27% opens on email) applied to WhatsApp template" }],
    trend: [],
    aiSummary: "Assets drafted and waiting in Approvals. Launches 1 Dec if approved by 28 Nov.",
  },
  {
    id: "dc4",
    pipeline: "clinic",
    name: "Diwali smile check-up recall",
    goal: "bookings",
    status: "completed",
    dates: "1 Oct – 25 Oct",
    owner: "Arjun Patil",
    budget: 12000,
    target: 50,
    audience: ["Patients due for 6-month cleaning"],
    channels: [
      { channel: "whatsapp", status: "done", budget: 9000, spend: 8700, leads: 151, outcomes: 62, assets: [] },
      { channel: "email", status: "done", budget: 3000, spend: 2400, leads: 34, outcomes: 9, assets: [] },
    ],
    learningsApplied: [{ from: "whatsapp", to: "email", text: "Slot-picker reply buttons copied into email as 1-click links" }],
    trend: [4, 7, 9, 8, 6, 5, 6, 4, 3, 4, 2, 2, 1, 1],
    aiSummary: "Beat target by 42% (71 bookings). WhatsApp did 87% of the work at ₹140 per booking.",
  },
  {
    id: "dcb1",
    pipeline: "b2b",
    name: "Kharif dealer pilot push",
    goal: "demo",
    status: "active",
    dates: "5 Oct – 20 Nov",
    owner: "Priya Sharma",
    budget: 150000,
    target: 40,
    audience: ["Agri-input dealers, Maharashtra, 4★+", "Owners/MDs at 5–200 staff dealers", "Drip-kit sellers (Jain, Netafim)"],
    channels: [
      { channel: "email", status: "live", budget: 30000, spend: 18400, leads: 52, outcomes: 14, assets: [{ id: "be1", kind: "email", channel: "email", title: "Kharif re-orders on WhatsApp, {{company}}?", label: "Subject", body: "Hi {{first_name}}, {{ai_first_line}} Dealers in {{city}} using WhatsApp ordering saw ~30% faster kharif re-orders. Worth a 15-min call?", stat: "Open 58% · Reply 12%" }] },
      { channel: "linkedin", status: "live", budget: 40000, spend: 22600, leads: 11, outcomes: 4, assets: [] },
      { channel: "google", status: "live", budget: 45000, spend: 26100, leads: 17, outcomes: 3, assets: [] },
      { channel: "whatsapp", status: "live", budget: 15000, spend: 6900, leads: 23, outcomes: 7, assets: [] },
      { channel: "landing", status: "live", budget: 0, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "aeo", status: "scheduled", budget: 20000, spend: 0, leads: 0, outcomes: 0, assets: [] },
    ],
    learningsApplied: [
      { from: "email", to: "linkedin", text: "Kharif subject line (58% open) reused as LinkedIn headline" },
      { from: "whatsapp", to: "email", text: "2-min demo video replaced PDF in step 3 → demo rate 4.1% → 6.0%" },
    ],
    trend: [0, 1, 1, 2, 1, 2, 3, 2, 3, 2, 3, 4, 2, 2],
    aiSummary: "28 of 40 demo calls. Email + WhatsApp convert best; Google Ads cost per demo is ₹8,700, 2.6× the email rate.",
  },
  {
    id: "dcb2",
    pipeline: "b2b",
    name: "PMKSY subsidy webinar (Marathi)",
    goal: "webinar",
    status: "planned",
    dates: "18 Nov – 2 Dec",
    owner: "Vikram Joshi",
    budget: 60000,
    target: 120,
    audience: ["Drip distributors, Gujarat & Maharashtra", "Dealers who opened kharif emails"],
    channels: [
      { channel: "email", status: "in_review", budget: 10000, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "whatsapp", status: "scheduled", budget: 15000, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "meta", status: "scheduled", budget: 25000, spend: 0, leads: 0, outcomes: 0, assets: [] },
      { channel: "landing", status: "in_review", budget: 0, spend: 0, leads: 0, outcomes: 0, assets: [] },
    ],
    learningsApplied: [{ from: "email", to: "meta", text: "Subsidy angle from top-performing blog post used in Meta lead ad" }],
    trend: [],
    aiSummary: "Registration page and invite email are in Approvals.",
  },
];

/* ------------------------------------------------------------------ */
/* Planner                                                             */
/* ------------------------------------------------------------------ */

export interface MixRow {
  channel: DgChannel;
  pct: number;
  cpl: number;
  rate: number;
  why: string;
}

export interface PlanTemplate {
  segments: { name: string; size: string; why: string }[];
  mix: MixRow[];
  timeline: { when: string; what: string }[];
}

export const planTemplates: Record<Pipeline, PlanTemplate> = {
  clinic: {
    segments: [
      { name: "Brides & grooms, 3–6 months out", size: "≈ 18k in Pune (Meta)", why: "Highest whitening intent; ‘wedding-ready’ angle converted 2.1× last season" },
      { name: "Professionals 25–40, Koregaon Park/Baner", size: "≈ 42k", why: "Live within 4 km of both clinics; lowest cost per booked lead on Google" },
      { name: "Past patients, cleaning in last 12 months", size: "1,860 contacts", why: "Already trust you; WhatsApp + email reach at near-zero cost" },
    ],
    mix: [
      { channel: "google", pct: 40, cpl: 420, rate: 0.36, why: "High-intent ‘teeth whitening cost Pune’ searches" },
      { channel: "meta", pct: 32, cpl: 300, rate: 0.22, why: "Wedding-season lookalikes + Reels" },
      { channel: "whatsapp", pct: 12, cpl: 120, rate: 0.35, why: "Template to past patients, slot picker" },
      { channel: "email", pct: 6, cpl: 100, rate: 0.3, why: "Doctor-signed note to 1,860 patients" },
      { channel: "aeo", pct: 10, cpl: 250, rate: 0.4, why: "Get cited in ChatGPT/Perplexity price answers" },
      { channel: "landing", pct: 0, cpl: 0, rate: 0, why: "Included: A/B hero + WhatsApp booking form" },
    ],
    timeline: [
      { when: "Week 1", what: "Approve assets · launch landing page + Google search" },
      { when: "Week 1–2", what: "Meta Reels + WhatsApp template to past patients" },
      { when: "Week 2", what: "Email from Dr. Mehta · publish AEO price FAQ" },
      { when: "Week 3–4", what: "AI shifts budget to the channel with lowest cost per booked" },
    ],
  },
  b2b: {
    segments: [
      { name: "Owner-led agri-input dealers, Maharashtra", size: "412 accounts", why: "Monitored list from Prospecting; 94 fit score avg" },
      { name: "Drip-kit distributors, Gujarat", size: "143 accounts", why: "Subsidy season → active buying window" },
      { name: "Engaged but no demo yet", size: "68 contacts", why: "Opened 2+ kharif emails in the last 30 days" },
    ],
    mix: [
      { channel: "email", pct: 25, cpl: 700, rate: 0.14, why: "Personalised sequence; best cost per demo so far" },
      { channel: "linkedin", pct: 25, cpl: 2600, rate: 0.2, why: "Owner/MD titles; account-matched audience" },
      { channel: "google", pct: 25, cpl: 1800, rate: 0.12, why: "‘WhatsApp ordering for dealers’ searches" },
      { channel: "whatsapp", pct: 15, cpl: 900, rate: 0.16, why: "2-min demo video follow-up" },
      { channel: "aeo", pct: 10, cpl: 1500, rate: 0.25, why: "Show up in ‘best dealer ordering app’ AI answers" },
      { channel: "landing", pct: 0, cpl: 0, rate: 0, why: "Included: demo-booking page with case study" },
    ],
    timeline: [
      { when: "Week 1", what: "Approve assets · launch email + LinkedIn" },
      { when: "Week 2", what: "Google search + WhatsApp video follow-ups" },
      { when: "Week 3", what: "Publish AEO comparison page" },
      { when: "Week 4–6", what: "AI re-weights spend toward cost per demo held" },
    ],
  },
};

export interface BundleAsset {
  id: string;
  kind: AssetKind;
  channel: DgChannel;
  title: string;
  body: string;
}

export const assetBundles: Record<Pipeline, BundleAsset[]> = {
  clinic: [
    { id: "ba1", kind: "ad", channel: "meta", title: "Meta ad · Variant A (‘Painless, 60 min’)", body: "Headline: A whiter smile in 60 painless minutes\nPrimary text: Getting married this season? Dr. Mehta's whitening takes one 60-minute visit, starts at ₹8,000 and comes with 0% EMI. 4.8★ from 1,240 Pune patients.\nCTA: Book on WhatsApp" },
    { id: "ba2", kind: "ad", channel: "google", title: "Google search ad · Variant B (price-led)", body: "Headlines: Teeth Whitening Pune | From ₹8,000 | 1 Visit, 60 Minutes\nDescription: Done by Dr. Mehta at Koregaon Park & Baner. 0% EMI. Book on WhatsApp in 30 seconds.\nFinal URL: smile.anvita.site/whitening?utm_source=google&utm_campaign=whitening_nov" },
    { id: "ba3", kind: "email", channel: "email", title: "Email to 1,860 past patients", body: "Subject: Your wedding-ready smile, in one visit\nHi {{first_name}}, Dr. Mehta here. Our painless whitening takes 60 minutes and starts at ₹8,000 (0% EMI on request). Since you've visited us before, your consult is on us. Tap below to pick a slot. Warmly, Smile Dental" },
    { id: "ba4", kind: "landing", channel: "landing", title: "Landing page · smile.anvita.site/whitening", body: "Hero: A brighter smile in 60 painless minutes · Offer: from ₹8,000, 0% EMI, free consult · Proof: 4.8★, 1,240 reviews, before/after · FAQ: sensitivity, how long it lasts, cost · Form: name + WhatsApp number → AI books the slot" },
    { id: "ba5", kind: "whatsapp", channel: "whatsapp", title: "WhatsApp template · whitening_offer_nov", body: "Namaste {{1}} 😊 Smile Dental here. We have whitening slots this week: {{2}}. 60 min, from ₹8,000, 0% EMI. Reply 1 to book, 2 to ask Dr. Mehta a question." },
  ],
  b2b: [
    { id: "bb1", kind: "ad", channel: "linkedin", title: "LinkedIn ad · Variant A (kharif timing)", body: "Headline: Take kharif re-orders on WhatsApp\nIntro: Agri-input dealers in Maharashtra cut re-order time by ~30% last kharif. No app for farmers to install. UPI collections built in.\nCTA: Book a 15-min demo" },
    { id: "bb2", kind: "ad", channel: "google", title: "Google search ad · Variant B (problem-led)", body: "Headlines: WhatsApp Ordering for Agri Dealers | UPI Collections Built In | Free 14-Day Pilot\nDescription: Farmers order on WhatsApp, you get paid on UPI. Used by 140+ dealers across 6 districts." },
    { id: "bb3", kind: "email", channel: "email", title: "Email step 1 to 412 dealers", body: "Subject: Kharif re-orders on WhatsApp, {{company}}?\nHi {{first_name}}, {{ai_first_line}} Dealers like Vidarbha Agri Mart take farmer orders on WhatsApp and get paid via UPI without extra staff. Can I send a 2-min video?" },
    { id: "bb4", kind: "landing", channel: "landing", title: "Landing page · agri.anvita.site/dealers", body: "Hero: Farmer orders on WhatsApp, payments on UPI · Proof: Vidarbha Agri Mart case study · FAQ: Marathi support, Tally sync · Form: book a 15-min demo" },
    { id: "bb5", kind: "whatsapp", channel: "whatsapp", title: "WhatsApp template · dealer_demo_video", body: "Namaste {{1}} ji 🙏 Sharing the 2-min demo of WhatsApp ordering for {{2}}. Reply DEMO to book a 15-min call, or STOP to opt out." },
  ],
};

/* ------------------------------------------------------------------ */
/* Approvals                                                           */
/* ------------------------------------------------------------------ */

export type ApprovalKind = "ad" | "email" | "landing" | "budget" | "aeo" | "whatsapp";
export type CheckStatus = "pass" | "warn" | "fail";

export interface ApprovalItem {
  id: string;
  pipeline: Pipeline;
  kind: ApprovalKind;
  channel: DgChannel;
  title: string;
  campaign: string;
  when: string;
  isEdit: boolean;
  summary: string;
  preview: { heading?: string; body: string; footer?: string };
  diff?: { before: string; after: string }[];
  budget?: { line: string; from: number; to: number }[];
  checks: { label: string; status: CheckStatus; detail: string }[];
  risk: "low" | "medium" | "high";
  confidence: number;
  impact: string;
}

export const approvalItems: ApprovalItem[] = [
  {
    id: "ap1", pipeline: "clinic", kind: "ad", channel: "meta", title: "New Meta ad: ‘A whiter smile in 60 painless minutes’", campaign: "Wedding-season whitening", when: "12 min ago", isEdit: false,
    summary: "New Reels ad variant built from the ‘painless, 60 min’ winner. Targets brides/grooms lookalike (≈18k).",
    preview: { heading: "A whiter smile in 60 painless minutes", body: "Getting married this season? Dr. Mehta's whitening takes one 60-minute visit, from ₹8,000 with 0% EMI. 4.8★ from 1,240 Pune patients.", footer: "CTA: Book on WhatsApp · smile.anvita.site/whitening" },
    checks: [
      { label: "Brand voice", status: "pass", detail: "Warm, no hard-sell words" },
      { label: "Healthcare ad policy", status: "warn", detail: "‘Painless’ may need softening for Meta health policy: suggest ‘comfortable’" },
      { label: "Price matches memory", status: "pass", detail: "₹8,000 matches the price list" },
    ],
    risk: "medium", confidence: 86, impact: "+9–12 bookings/mo",
  },
  {
    id: "ap2", pipeline: "clinic", kind: "budget", channel: "google", title: "Shift ₹4,000/wk from Meta to Google search", campaign: "Wedding-season whitening", when: "40 min ago", isEdit: true,
    summary: "Google brings ₹874 per booked vs ₹846 on Meta, but Meta's lead quality fell 18% this week. Total budget unchanged.",
    preview: { body: "Budget shift for 14 days. Anvita reports the impact on booked appointments after 7 days." },
    budget: [
      { line: "Meta · Wedding lookalikes", from: 3000, to: 2430 },
      { line: "Google · Whitening exact", from: 3400, to: 3970 },
    ],
    checks: [
      { label: "Within monthly cap", status: "pass", detail: "₹60,000 cap unchanged" },
      { label: "Spend guardrail", status: "pass", detail: "Change < 20% of channel budget" },
    ],
    risk: "low", confidence: 81, impact: "−₹90 cost per booked",
  },
  {
    id: "ap3", pipeline: "clinic", kind: "email", channel: "email", title: "Edit: whitening email subject + opening", campaign: "Wedding-season whitening", when: "1h ago", isEdit: true,
    summary: "Rewrote the subject with the winning Meta angle and added the doctor's name (learned +27% opens).",
    preview: { heading: "Your wedding-ready smile, in one 60-min visit", body: "Hi {{first_name}}, Dr. Mehta here. Our painless whitening takes 60 minutes and starts at ₹8,000…" },
    diff: [
      { before: "Subject: Special whitening offer this month", after: "Subject: Your wedding-ready smile, in one 60-min visit" },
      { before: "Hi {{first_name}}, we have a special offer on whitening.", after: "Hi {{first_name}}, Dr. Mehta here. Our painless whitening takes 60 minutes and starts at ₹8,000." },
      { before: "Book now before slots run out!", after: "Tap below to pick a slot. Your consult is on us." },
    ],
    checks: [
      { label: "Brand voice", status: "pass", detail: "Removed urgency pressure" },
      { label: "Unsubscribe + clinic address", status: "pass", detail: "Present in footer" },
      { label: "Consent", status: "pass", detail: "1,860 recipients opted in" },
    ],
    risk: "low", confidence: 92, impact: "Open rate 31% → ~44%",
  },
  {
    id: "ap4", pipeline: "clinic", kind: "landing", channel: "landing", title: "Landing page hero: variant B", campaign: "Wedding-season whitening", when: "2h ago", isEdit: true,
    summary: "Start an A/B test on the whitening page hero. B uses the ‘60 painless minutes’ angle and moves WhatsApp CTA above the fold.",
    preview: { heading: "A brighter smile in 60 painless minutes", body: "One visit with Dr. Mehta. From ₹8,000, 0% EMI. Book on WhatsApp in 30 seconds.", footer: "smile.anvita.site/whitening · 50/50 split" },
    diff: [
      { before: "Professional Teeth Whitening in Pune", after: "A brighter smile in 60 painless minutes" },
      { before: "Book a consultation", after: "Book on WhatsApp in 30 seconds" },
    ],
    checks: [
      { label: "Brand voice", status: "pass", detail: "Matches memory" },
      { label: "Claim check", status: "warn", detail: "‘Painless’: add ‘most patients feel little to no sensitivity’ footnote" },
      { label: "Page speed", status: "pass", detail: "LCP 1.4s on 4G" },
    ],
    risk: "medium", confidence: 84, impact: "+2–3 pts conversion",
  },
  {
    id: "ap5", pipeline: "clinic", kind: "aeo", channel: "aeo", title: "Publish AEO page: ‘Teeth whitening cost in Pune (2026)’", campaign: "Wedding-season whitening", when: "3h ago", isEdit: false,
    summary: "FAQ page with price ranges and FAQPage + Dentist schema so ChatGPT, Perplexity and AI Overviews can cite Smile Dental.",
    preview: { heading: "How much does teeth whitening cost in Pune?", body: "In-clinic whitening in Pune typically costs ₹6,000–₹15,000. At Smile Dental, it starts at ₹8,000 for a single 60-minute session…", footer: "smiledental.in/whitening-cost-pune · FAQPage schema" },
    checks: [
      { label: "Factual vs price list", status: "pass", detail: "All prices verified" },
      { label: "Medical claim review", status: "pass", detail: "Reviewed against IDA guidance" },
      { label: "Competitor mentions", status: "warn", detail: "Mentions ‘other clinics’ generically: OK" },
    ],
    risk: "low", confidence: 89, impact: "Cited in 2–3 AI engines in ~3 wks",
  },
  {
    id: "ap6", pipeline: "clinic", kind: "whatsapp", channel: "whatsapp", title: "New WhatsApp template: kids_braces_checkup", campaign: "Kids braces: back-to-school", when: "5h ago", isEdit: false,
    summary: "Marketing template to 640 parents. Needs Meta template approval after yours (~2h).",
    preview: { body: "Namaste {{1}} 😊 Dr. Kulkarni from Smile Dental here. Winter break is a great time for {{2}}'s braces check-up. Free assessment this December. Reply 1 to book.", footer: "Category: Marketing · Quick replies: Book / Ask a question / Stop" },
    checks: [
      { label: "Opt-in", status: "pass", detail: "640 of 702 parents opted in" },
      { label: "Template category", status: "pass", detail: "Correctly marked Marketing" },
      { label: "Children's data", status: "warn", detail: "Uses child's first name: confirm consent text" },
    ],
    risk: "medium", confidence: 78, impact: "≈ 25 bookings",
  },
  {
    id: "ap7", pipeline: "clinic", kind: "ad", channel: "google", title: "Pause keyword ‘free dental implants’", campaign: "Implant consult month", when: "Yesterday", isEdit: true,
    summary: "₹6,200 spent, 14 leads, 0 bookings in 30 days. The AI agent saw 9 of 14 asking for free treatment.",
    preview: { body: "Add ‘free’ as a negative keyword on Implants – Broad." },
    diff: [{ before: "+free dental implants (broad)", after: "−free (negative, campaign level)" }],
    checks: [{ label: "Spend guardrail", status: "pass", detail: "Reduces spend only" }],
    risk: "low", confidence: 95, impact: "Save ≈ ₹6,000/mo",
  },
  {
    id: "ap8", pipeline: "b2b", kind: "email", channel: "email", title: "Webinar invite: PMKSY subsidy (Marathi)", campaign: "PMKSY subsidy webinar (Marathi)", when: "2h ago", isEdit: false,
    summary: "Invite to 555 dealers + distributors. Subject reuses the subsidy angle from the top blog post.",
    preview: { heading: "PMKSY drip subsidy: 45-min live session in Marathi", body: "Namaskar {{first_name}}, farmers keep asking you about the drip subsidy. Join our live session on 26 Nov…" },
    checks: [
      { label: "Brand voice", status: "pass", detail: "Peer-to-peer, numbers-first" },
      { label: "Govt scheme claims", status: "warn", detail: "Cite pmksy.gov.in for subsidy percentages" },
      { label: "Sending domain", status: "pass", detail: "agrigrow-mail.in warmed" },
    ],
    risk: "medium", confidence: 83, impact: "≈ 120 registrations",
  },
  {
    id: "ap9", pipeline: "b2b", kind: "budget", channel: "linkedin", title: "Move ₹12,000 from Google to email + WhatsApp", campaign: "Kharif dealer pilot push", when: "6h ago", isEdit: true,
    summary: "Google cost per demo is ₹8,700 vs ₹1,314 on email. Re-allocate for the last 3 weeks.",
    preview: { body: "Re-allocation for remaining 3 weeks of the campaign." },
    budget: [
      { line: "Google · Dealer ordering app", from: 45000, to: 33000 },
      { line: "Email · Sending + enrichment credits", from: 30000, to: 37000 },
      { line: "WhatsApp · Conversation fees", from: 15000, to: 20000 },
    ],
    checks: [{ label: "Within campaign budget", status: "pass", detail: "₹1,50,000 unchanged" }],
    risk: "low", confidence: 88, impact: "+6 demo calls",
  },
];

export type AuditAction = "approved" | "rejected" | "changes" | "auto" | "reverted";

export interface ApprovalAuditEntry {
  id: string;
  when: string;
  actor: string;
  action: AuditAction;
  item: string;
  channel: DgChannel;
  comment?: string;
  reverted?: boolean;
}

export const approvalAudit: ApprovalAuditEntry[] = [
  { id: "au1", when: "Today, 10:42", actor: "Priya Sharma", action: "approved", item: "Google RSA: ‘Teeth Whitening Pune | From ₹8,000’", channel: "google" },
  { id: "au2", when: "Today, 09:15", actor: "Anvita AI", action: "auto", item: "Paused Meta ad set ‘Implants 45+’ (guardrail: cost per booked > ₹2,000)", channel: "meta", comment: "Auto-pause rule set by Priya on 2 Oct" },
  { id: "au3", when: "Yesterday, 18:20", actor: "Neha Kulkarni", action: "changes", item: "Landing page: implant FAQ", channel: "landing", comment: "Mention 3D X-ray is included, not extra." },
  { id: "au4", when: "Yesterday, 12:05", actor: "Priya Sharma", action: "rejected", item: "Meta ad: ‘50% off whitening this week’", channel: "meta", comment: "We don't do discount-led ads. Added to ‘past losers’." },
  { id: "au5", when: "Mon, 16:30", actor: "Priya Sharma", action: "approved", item: "WhatsApp template ‘whitening_offer_nov’", channel: "whatsapp" },
  { id: "au6", when: "Mon, 11:10", actor: "Vikram Joshi", action: "approved", item: "LinkedIn ad: ‘Take kharif re-orders on WhatsApp’", channel: "linkedin" },
];

/* ------------------------------------------------------------------ */
/* Landing pages                                                       */
/* ------------------------------------------------------------------ */

export interface LandingPage {
  id: string;
  pipeline: Pipeline;
  name: string;
  url: string;
  status: "live" | "testing" | "draft";
  campaign: string;
  views: number;
  conversion: number;
  outcomes: number;
  updated: string;
  trend: number[];
}

export const landingPages: LandingPage[] = [
  { id: "lp1", pipeline: "clinic", name: "Smile Dental Teeth Whitening Pune", url: "smile.anvita.site/whitening", status: "testing", campaign: "Wedding-season whitening", views: 4820, conversion: 9.4, outcomes: 118, updated: "2h ago", trend: [5.8, 6.1, 6.4, 6.8, 7.2, 8.1, 8.8, 9.4] },
  { id: "lp2", pipeline: "clinic", name: "Dental Implants: Free Consult", url: "smile.anvita.site/implants", status: "live", campaign: "Implant consult month", views: 3110, conversion: 5.2, outcomes: 41, updated: "Yesterday", trend: [4.1, 4.4, 4.8, 4.6, 5.0, 5.1, 5.3, 5.2] },
  { id: "lp3", pipeline: "clinic", name: "Kids Braces Assessment", url: "smile.anvita.site/kids-braces", status: "draft", campaign: "Kids braces: back-to-school", views: 0, conversion: 0, outcomes: 0, updated: "5h ago", trend: [] },
  { id: "lp4", pipeline: "clinic", name: "Emergency Dentist Pune (same day)", url: "smile.anvita.site/emergency", status: "live", campaign: "Always-on", views: 2240, conversion: 12.1, outcomes: 96, updated: "1w ago", trend: [10.2, 11.0, 11.4, 11.9, 12.4, 12.0, 12.3, 12.1] },
  { id: "lp5", pipeline: "b2b", name: "WhatsApp ordering for agri dealers", url: "agri.anvita.site/dealers", status: "live", campaign: "Kharif dealer pilot push", views: 1380, conversion: 3.8, outcomes: 28, updated: "3d ago", trend: [2.4, 2.8, 3.1, 3.3, 3.5, 3.6, 3.9, 3.8] },
  { id: "lp6", pipeline: "b2b", name: "PMKSY subsidy webinar (Marathi)", url: "agri.anvita.site/pmksy-webinar", status: "draft", campaign: "PMKSY subsidy webinar (Marathi)", views: 0, conversion: 0, outcomes: 0, updated: "2h ago", trend: [] },
];

export type SectionId = "hero" | "offer" | "proof" | "faq" | "form";

export interface SectionVariant {
  heading: string;
  body: string;
  bullets?: string[];
  cta?: string;
}

export interface LpSection {
  id: SectionId;
  label: string;
  enabled: boolean;
  variants: { A: SectionVariant; B?: SectionVariant };
  /** Alternative rewrites the AI cycles through. */
  rewrites: SectionVariant[];
  stat?: string;
}

export const whiteningSections: LpSection[] = [
  {
    id: "hero", label: "Hero", enabled: true, stat: "B leads: 9.4% vs 6.8% conv.",
    variants: {
      A: { heading: "Professional Teeth Whitening in Pune", body: "Safe, dentist-led whitening at our Koregaon Park and Baner clinics.", cta: "Book a consultation" },
      B: { heading: "A brighter smile in 60 painless minutes", body: "One visit with Dr. Mehta. From ₹8,000 with 0% EMI. Most patients feel little to no sensitivity.", cta: "Book on WhatsApp" },
    },
    rewrites: [
      { heading: "Wedding-ready smile, in a single visit", body: "Dentist-led whitening in 60 minutes, from ₹8,000. Pick a slot on WhatsApp in 30 seconds.", cta: "Pick a slot on WhatsApp" },
      { heading: "Up to 8 shades whiter. One 60-min visit.", body: "Done by Dr. Mehta at Koregaon Park & Baner. 0% EMI available.", cta: "Book on WhatsApp" },
    ],
  },
  {
    id: "offer", label: "Offer", enabled: true,
    variants: {
      A: { heading: "What's included", body: "Everything you need for a brighter smile, at a clear price.", bullets: ["In-clinic whitening, 60 min", "Free consult + shade check", "Take-home touch-up kit", "From ₹8,000 · 0% EMI"] },
    },
    rewrites: [{ heading: "One price, no surprises", body: "From ₹8,000, with everything included.", bullets: ["Free consult + shade check", "60-min in-clinic session", "Touch-up kit to take home", "0% EMI up to 9 months"] }],
  },
  {
    id: "proof", label: "Social proof", enabled: true,
    variants: {
      A: { heading: "Loved by 12,000+ Pune patients", body: "“Was nervous about sensitivity, but it was super comfortable. Done before lunch!” · Ananya R., Koregaon Park", bullets: ["4.8★ · 1,240 Google reviews", "Since 2014", "ISO-certified sterilisation"] },
      B: { heading: "4.8★ from 1,240 Google reviews", body: "“Dr. Mehta explained everything in Hindi for my mother too. Results lasted well past the wedding.” · Divya M., Baner", bullets: ["12,000+ patients", "2 clinics in Pune", "Before/after gallery"] },
    },
    rewrites: [{ heading: "Pune trusts Smile Dental", body: "“Booked on WhatsApp at 11pm, whitened by 11am the next day.” · Rohit M., Aundh", bullets: ["4.8★ Google", "12,000+ patients", "Doctors with 14+ yrs"] }],
  },
  {
    id: "faq", label: "FAQ", enabled: true,
    variants: {
      A: { heading: "Questions patients ask us", body: "", bullets: ["Does whitening hurt? Most patients feel little to no sensitivity.", "How long does it last? 1–2 years with good care.", "How much does it cost? From ₹8,000; EMI available.", "Is it safe for enamel? Yes, it's dentist-supervised."] },
    },
    rewrites: [{ heading: "Before you book", body: "", bullets: ["How long is the visit? About 60 minutes.", "Can I eat after? Avoid tea/coffee for 48 hours.", "Is EMI available? Yes, 0% up to 9 months.", "Which clinic? Koregaon Park or Baner, your choice."] }],
    stat: "Answers pulled from 312 real WhatsApp questions",
  },
  {
    id: "form", label: "Booking form", enabled: true,
    variants: {
      A: { heading: "Book your whitening slot", body: "Leave your WhatsApp number. Our AI assistant shares open slots in under a minute.", cta: "Get slots on WhatsApp" },
    },
    rewrites: [{ heading: "See this week's slots", body: "Share your number and we'll send available times on WhatsApp right away.", cta: "Send me slots" }],
    stat: "Captures UTM + gclid/fbclid",
  },
];

/* ------------------------------------------------------------------ */
/* AEO: answer-engine optimisation                                     */
/* ------------------------------------------------------------------ */

export type Engine = "chatgpt" | "perplexity" | "gemini" | "aio";

export const engineMeta: Record<Engine, { label: string; mark: string }> = {
  chatgpt: { label: "ChatGPT", mark: "C" },
  perplexity: { label: "Perplexity", mark: "P" },
  gemini: { label: "Gemini", mark: "G" },
  aio: { label: "Google AI Overviews", mark: "AI" },
};

export const aeoEngineScores: Record<Engine, { score: number; delta: number; prompts: number; mentioned: number }> = {
  chatgpt: { score: 38, delta: 6, prompts: 12, mentioned: 5 },
  perplexity: { score: 52, delta: 11, prompts: 12, mentioned: 7 },
  gemini: { score: 29, delta: -3, prompts: 12, mentioned: 4 },
  aio: { score: 44, delta: 4, prompts: 12, mentioned: 6 },
};

export const aeoTrend = [
  { week: "1 Sep", chatgpt: 22, perplexity: 31, gemini: 27, aio: 34 },
  { week: "8 Sep", chatgpt: 24, perplexity: 33, gemini: 30, aio: 35 },
  { week: "15 Sep", chatgpt: 25, perplexity: 36, gemini: 31, aio: 36 },
  { week: "22 Sep", chatgpt: 27, perplexity: 38, gemini: 33, aio: 38 },
  { week: "29 Sep", chatgpt: 30, perplexity: 41, gemini: 32, aio: 39 },
  { week: "6 Oct", chatgpt: 32, perplexity: 44, gemini: 31, aio: 40 },
  { week: "13 Oct", chatgpt: 33, perplexity: 47, gemini: 30, aio: 41 },
  { week: "20 Oct", chatgpt: 36, perplexity: 50, gemini: 30, aio: 43 },
  { week: "27 Oct", chatgpt: 38, perplexity: 52, gemini: 29, aio: 44 },
];

export interface EngineResult {
  mentioned: boolean;
  cited: boolean;
  rank: number | null;
}

export interface AeoPrompt {
  id: string;
  pipeline: Pipeline;
  prompt: string;
  volume: "High" | "Medium" | "Low";
  results: Record<Engine, EngineResult>;
  competitors: string[];
  trend: number[];
  answer: string;
  why: string;
  actions: string[];
}

const r = (mentioned: boolean, cited: boolean, rank: number | null): EngineResult => ({ mentioned, cited, rank });

export const aeoPrompts: AeoPrompt[] = [
  {
    id: "q1", pipeline: "clinic", prompt: "best dentist in Koregaon Park", volume: "High",
    results: { chatgpt: r(true, false, 3), perplexity: r(true, true, 2), gemini: r(false, false, null), aio: r(true, true, 2) },
    competitors: ["Sabka Dentist", "Clove Dental", "Pearl Dental Studio"],
    trend: [20, 25, 25, 38, 44, 50, 56, 63],
    answer: "Highly rated options in Koregaon Park include Pearl Dental Studio (4.9★), Clove Dental, and Smile Dental (4.8★, 1,240 reviews), which is known for same-day appointments…",
    why: "You're mentioned but rarely ranked #1 because Pearl Dental Studio has a detailed Practo profile with 300+ reviews and a ‘Koregaon Park’ page. Gemini doesn't mention you because your Google Business Profile lacks service descriptions.",
    actions: ["Add services + descriptions to Google Business Profile", "Get 50 more reviews mentioning ‘Koregaon Park’", "Create a ‘Dentist in Koregaon Park’ location page with LocalBusiness schema"],
  },
  {
    id: "q2", pipeline: "clinic", prompt: "teeth whitening cost Pune", volume: "High",
    results: { chatgpt: r(false, false, null), perplexity: r(true, false, 4), gemini: r(false, false, null), aio: r(false, false, null) },
    competitors: ["Clove Dental", "Sabka Dentist", "Practo price guide"],
    trend: [0, 0, 0, 12, 12, 25, 25, 25],
    answer: "Teeth whitening in Pune typically costs ₹5,000–₹20,000 depending on the method. Clove Dental lists in-office whitening from ₹7,500; Practo's price guide shows an average of ₹9,800…",
    why: "AI engines quote clinics that publish prices in plain text. Your price is only inside an image on smiledental.in/whitening, so it can't be read or cited. Clove Dental and Practo have structured price FAQs.",
    actions: ["Publish a ‘Teeth whitening cost in Pune’ FAQ page with prices in text", "Add FAQPage + Dentist schema", "Update Practo profile with whitening price"],
  },
  {
    id: "q3", pipeline: "clinic", prompt: "painless root canal Pune", volume: "Medium",
    results: { chatgpt: r(true, true, 1), perplexity: r(true, true, 1), gemini: r(true, false, 2), aio: r(true, true, 1) },
    competitors: ["Dr. Joshi's Dental Clinic"],
    trend: [38, 44, 50, 63, 69, 75, 81, 88],
    answer: "Smile Dental in Pune is frequently recommended for comfortable root canal treatment, with patients mentioning rotary endodontics and single-sitting RCT…",
    why: "You're winning here: 140+ reviews mention ‘painless’ and ‘root canal’, and your blog post on single-sitting RCT is cited by 3 engines.",
    actions: ["Keep requesting reviews after RCT visits", "Refresh the RCT blog post with 2026 prices"],
  },
  {
    id: "q4", pipeline: "clinic", prompt: "dental implants with EMI Pune", volume: "Medium",
    results: { chatgpt: r(false, false, null), perplexity: r(true, true, 3), gemini: r(false, false, null), aio: r(true, false, 4) },
    competitors: ["Clove Dental", "Sabka Dentist"],
    trend: [0, 0, 12, 12, 25, 25, 31, 38],
    answer: "Several Pune clinics offer EMI on implants. Clove Dental and Sabka Dentist advertise no-cost EMI through Bajaj Finserv…",
    why: "EMI is mentioned only in your ads, not on your website. Listings on Justdial and Practo don't mention EMI either.",
    actions: ["Add an ‘Implants on EMI’ section to the implants page", "Add EMI to Justdial + Practo listings"],
  },
  {
    id: "q5", pipeline: "clinic", prompt: "kids dentist Baner open Sunday", volume: "Low",
    results: { chatgpt: r(false, false, null), perplexity: r(false, false, null), gemini: r(true, false, 3), aio: r(true, true, 2) },
    competitors: ["Tooth Fairy Kids Dental", "Little Smiles Baner"],
    trend: [12, 12, 12, 25, 25, 25, 38, 44],
    answer: "For Sunday appointments in Baner, Tooth Fairy Kids Dental and Little Smiles are open 10am–2pm…",
    why: "Your Sunday hours exist on Google Business Profile but not on your website or Practo, so ChatGPT and Perplexity don't know you're open.",
    actions: ["Add opening hours with OpeningHoursSpecification schema", "Sync hours to Practo and Justdial"],
  },
  {
    id: "qb1", pipeline: "b2b", prompt: "WhatsApp ordering app for agri input dealers", volume: "Low",
    results: { chatgpt: r(false, false, null), perplexity: r(true, true, 2), gemini: r(false, false, null), aio: r(false, false, null) },
    competitors: ["BharatAgri", "Khatabook", "Zoko"],
    trend: [0, 0, 0, 12, 12, 25, 25, 31],
    answer: "Dealers often use general WhatsApp commerce tools like Zoko or bookkeeping apps like Khatabook for orders…",
    why: "There's no comparison page explaining why a dealer-specific tool beats generic WhatsApp commerce apps. The Vidarbha Agri Mart case study is a PDF, which engines rarely cite.",
    actions: ["Publish the case study as an HTML page", "Create a ‘Best WhatsApp ordering tools for agri dealers’ comparison page", "Get listed on IndiaMART software directory"],
  },
  {
    id: "qb2", pipeline: "b2b", prompt: "how agri dealers collect payments from farmers UPI", volume: "Medium",
    results: { chatgpt: r(false, false, null), perplexity: r(false, false, null), gemini: r(false, false, null), aio: r(true, false, 5) },
    competitors: ["Paytm for Business", "PhonePe Business", "Khatabook"],
    trend: [0, 0, 0, 0, 6, 6, 12, 12],
    answer: "Most agri-input dealers use UPI QR codes from PhonePe or Paytm, and track credit in Khatabook…",
    why: "You have no content on farmer credit + UPI reminders, the #1 pain point dealers mention on discovery calls.",
    actions: ["Write a Marathi + English guide on UPI collections for dealers", "Answer the question on Quora/Reddit India with a link"],
  },
];

export interface AeoAction {
  id: string;
  title: string;
  detail: string;
  impact: "High" | "Medium" | "Low";
  effort: string;
  kind: "page" | "listing" | "schema" | "reviews";
}

export const aeoActions: AeoAction[] = [
  { id: "aa1", title: "Create a whitening-cost FAQ page", detail: "Fixes ‘teeth whitening cost Pune’ (0/4 engines). Prices in text + FAQPage schema.", impact: "High", effort: "AI drafts in 1 min", kind: "page" },
  { id: "aa2", title: "Get cited on Practo & Justdial", detail: "Practo is quoted in 7 of 12 answers. Complete services, prices, EMI and Sunday hours on both.", impact: "High", effort: "15 min · checklist", kind: "listing" },
  { id: "aa3", title: "Add Dentist + FAQ schema site-wide", detail: "Structured data for services, hours, price ranges and doctors on smiledental.in.", impact: "Medium", effort: "1-click via WordPress plugin", kind: "schema" },
  { id: "aa4", title: "Ask for reviews that mention the area", detail: "Prompt patients to mention ‘Koregaon Park’ or ‘Baner’; engines pick up location phrases.", impact: "Medium", effort: "Auto via review requests", kind: "reviews" },
];

export const aeoDraft = `# How much does teeth whitening cost in Pune? (2026 guide)

**Short answer:** In-clinic teeth whitening in Pune usually costs ₹6,000–₹15,000. At Smile Dental (Koregaon Park & Baner), professional whitening starts at ₹8,000 for a single 60-minute session, with 0% EMI available.

## What affects the price?
- **Method:** in-clinic (LED/laser-activated) vs take-home trays
- **Number of shades:** most patients go 4–8 shades lighter in one visit
- **Sensitivity care:** desensitising gel is included at Smile Dental

## Is it painful?
Most patients feel little to no sensitivity. Your dentist checks your enamel first and adjusts the gel strength.

## How long do results last?
1–2 years with good care. Avoid tea, coffee and turmeric-heavy food for 48 hours.

## Where can I get it done?
Smile Dental, Koregaon Park and Baner, Pune. Rated 4.8★ from 1,240 Google reviews. Book on WhatsApp: +91 98220 00000.

---
Schema added: FAQPage · Dentist · Offer (priceRange ₹8,000–₹15,000)`;
