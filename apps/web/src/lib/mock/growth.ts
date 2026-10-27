/**
 * Mock data for the "Growth" modules: Marketing (ads co-pilot, SEO & content,
 * social), Reviews and Analytics. Names and ids line up with mock/core.ts
 * (Smile Dental, Pune: Koregaon Park + Baner clinics; outbound to agri-input dealers).
 */

/* ------------------------------------------------------------------ */
/* Marketing: ads co-pilot                                             */
/* ------------------------------------------------------------------ */

export type AdPlatform = "google" | "meta";

export interface AdAccount {
  id: string;
  platform: AdPlatform | "ga4" | "gsc" | "linkedin";
  name: string;
  account: string;
  status: "connected" | "attention" | "disconnected";
  detail: string;
}

export const adAccounts: AdAccount[] = [
  { id: "acc-g", platform: "google", name: "Google Ads", account: "Smile Dental · 412-889-2201", status: "connected", detail: "Synced 4 min ago · conversion import on" },
  { id: "acc-m", platform: "meta", name: "Meta Ads", account: "Smile Dental Pune · act_88120334", status: "connected", detail: "Synced 9 min ago · CAPI events on" },
  { id: "acc-ga", platform: "ga4", name: "Google Analytics 4", account: "smiledental.in", status: "attention", detail: "Missing ‘booking_completed’ key event" },
  { id: "acc-li", platform: "linkedin", name: "LinkedIn Ads", account: "Not connected", status: "disconnected", detail: "Useful for the agri-dealer outbound motion" },
];

export interface AdCampaign {
  id: string;
  name: string;
  platform: AdPlatform;
  objective: string;
  spend: number;
  leads: number;
  booked: number;
  revenue: number;
  dailyBudget: number;
  active: boolean;
  trend: number[];
}

export const adCampaigns: AdCampaign[] = [
  { id: "cmp1", name: "Implants – Broad", platform: "google", objective: "Search · Leads", spend: 48000, leads: 96, booked: 9, revenue: 210000, dailyBudget: 1600, active: true, trend: [14, 12, 15, 11, 9, 10, 8] },
  { id: "cmp2", name: "Whitening – Pune", platform: "google", objective: "Search · Leads", spend: 44000, leads: 142, booked: 19, revenue: 182000, dailyBudget: 1450, active: true, trend: [16, 18, 17, 21, 22, 24, 26] },
  { id: "cmp3", name: "Brand – Smile Dental", platform: "google", objective: "Search · Brand", spend: 9500, leads: 64, booked: 22, revenue: 158000, dailyBudget: 320, active: true, trend: [9, 9, 10, 9, 10, 11, 10] },
  { id: "cmp4", name: "Aligners – Lookalike 2%", platform: "meta", objective: "Lead form", spend: 36000, leads: 118, booked: 11, revenue: 420000, dailyBudget: 1200, active: true, trend: [12, 14, 13, 15, 16, 15, 17] },
  { id: "cmp5", name: "Kids dentistry – Baner 5 km", platform: "meta", objective: "Click-to-WhatsApp", spend: 14000, leads: 52, booked: 13, revenue: 52000, dailyBudget: 460, active: true, trend: [6, 7, 7, 8, 7, 9, 9] },
  { id: "cmp6", name: "Diwali smile makeover – Reels", platform: "meta", objective: "Click-to-WhatsApp", spend: 18500, leads: 74, booked: 8, revenue: 96000, dailyBudget: 900, active: true, trend: [4, 6, 9, 11, 12, 10, 13] },
  { id: "cmp7", name: "Retargeting – Site visitors", platform: "meta", objective: "Conversions", spend: 6200, leads: 21, booked: 2, revenue: 18000, dailyBudget: 200, active: false, trend: [5, 4, 3, 3, 2, 2, 1] },
];

/** 30-day spend and booked-lead series for the ads overview (cost per booked lead is a 7-day rolling value). */
const adDailyRaw = Array.from({ length: 36 }, (_, i) => {
  const day = new Date(2026, 8, 22 + i);
  const spend = Math.round(5200 + 900 * Math.sin(i / 3.2) + i * 28);
  const booked = Math.max(1, Math.round(2.4 + 1.1 * Math.sin(i / 2.7 + 1) + i * 0.035));
  return { date: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), spend, leads: Math.round(spend / 300 + (i % 4)), booked };
});

export const adDaily = adDailyRaw.slice(6).map((d, i) => {
  const win = adDailyRaw.slice(i, i + 7);
  const spend7 = win.reduce((a, x) => a + x.spend, 0);
  const booked7 = win.reduce((a, x) => a + x.booked, 0);
  return { ...d, costPerBooked: Math.round(spend7 / booked7) };
});

export type RecKind = "budget" | "pause" | "copy" | "keyword" | "schedule";

export interface AdRecommendation {
  id: string;
  kind: RecKind;
  title: string;
  rationale: string;
  impact: string;
  confidence: number;
  platform: AdPlatform;
}

export const adRecommendations: AdRecommendation[] = [
  {
    id: "rec1",
    kind: "budget",
    platform: "google",
    title: "Shift ₹15,000 from ‘Implants – Broad’ to ‘Whitening – Pune’",
    rationale: "Whitening books at ₹2,316 per booked lead vs ₹5,333 for Implants – Broad (2.3× lower). Whitening is impression-share limited by budget (lost IS 38%).",
    impact: "+6–8 booked leads / month at the same spend",
    confidence: 91,
  },
  {
    id: "rec2",
    kind: "keyword",
    platform: "google",
    title: "Add 14 negative keywords to ‘Implants – Broad’",
    rationale: "‘free dental implant camp’, ‘implant course’, ‘dental implant jobs’ and 11 more drove 212 clicks and 0 bookings in 30 days.",
    impact: "Save ≈ ₹6,800 / month",
    confidence: 88,
  },
  {
    id: "rec3",
    kind: "schedule",
    platform: "meta",
    title: "Run ‘Aligners – Lookalike 2%’ only 7 PM – 11 PM",
    rationale: "71% of booked aligner leads came from WhatsApp chats started in the evening, when the AI agent replies instantly and books the 3D scan.",
    impact: "−18% cost per booked lead",
    confidence: 76,
  },
  {
    id: "rec4",
    kind: "pause",
    platform: "meta",
    title: "Keep ‘Retargeting – Site visitors’ paused and move ₹200/day to Kids dentistry",
    rationale: "Retargeting cost ₹3,100 per booked lead vs ₹1,077 for Kids dentistry – Baner 5 km, which still has headroom in the radius.",
    impact: "+5 booked kids appointments / month",
    confidence: 72,
  },
  {
    id: "rec5",
    kind: "copy",
    platform: "google",
    title: "Test 3 new headlines on ‘Whitening – Pune’ mentioning price and EMI",
    rationale: "Chats show ‘how much’ is the first question in 64% of whitening conversations. Ads that state ‘from ₹8,000’ pre-qualify leads.",
    impact: "+12% lead → booking rate (est.)",
    confidence: 68,
  },
];

export interface AuditEntry {
  id: string;
  when: string;
  actor: string;
  change: string;
  platform: AdPlatform;
  result?: string;
  reverted?: boolean;
}

export const adAuditLog: AuditEntry[] = [
  { id: "a1", when: "Today, 9:14 AM", actor: "Priya Sharma", change: "Raised ‘Brand – Smile Dental’ daily budget ₹250 → ₹320", platform: "google", result: "Impression share 81% → 94%" },
  { id: "a2", when: "Fri, 6:02 PM", actor: "Priya Sharma", change: "Paused ‘Retargeting – Site visitors’", platform: "meta", result: "Saved ₹1,400 so far" },
  { id: "a3", when: "Thu, 11:40 AM", actor: "Neha Kulkarni", change: "Published 2 AI ad variants to ‘Diwali smile makeover – Reels’", platform: "meta", result: "CTR 1.9% → 2.6%" },
  { id: "a4", when: "Mon, 10:05 AM", actor: "Priya Sharma", change: "Added 22 negative keywords to ‘Whitening – Pune’", platform: "google", result: "Wasted spend −₹4,100 / wk" },
];

export const adCopyVariants = {
  headlines: [
    "Whitening in Pune from ₹8,000",
    "1-Hour Laser Whitening, Pune",
    "Diwali Smile Offer · 0% EMI",
    "Book on WhatsApp in 30 Sec",
    "4.8★ Rated Dentists in Pune",
    "Free Shade Check This Weekend",
  ],
  descriptions: [
    "Laser whitening by expert dentists. Up to 8 shades brighter in 1 visit. Book on WhatsApp.",
    "Rated 4.8★ by 1,200+ patients. Clear pricing from ₹8,000 and 0% EMI. Slots this weekend.",
    "Painless whitening at Koregaon Park & Baner. Get an instant quote on WhatsApp now.",
  ],
};

/* ------------------------------------------------------------------ */
/* Marketing: SEO & content                                            */
/* ------------------------------------------------------------------ */

export const contentStages = ["Idea", "Brief", "Draft", "Review", "Published"] as const;
export type ContentStage = (typeof contentStages)[number];

export interface ContentItem {
  id: string;
  title: string;
  keyword: string;
  volume: number;
  difficulty: number;
  position: number | null;
  stage: ContentStage;
  /** Day of November 2026 the piece is planned for. */
  day: number;
  type: "Blog" | "Service page" | "FAQ" | "Location page";
  gap: string;
}

export const contentItems: ContentItem[] = [
  { id: "ct1", title: "Teeth whitening cost in Pune (2026 price guide)", keyword: "teeth whitening cost pune", volume: 1900, difficulty: 28, position: 14, stage: "Review", day: 3, type: "Blog", gap: "Ranking #14 with 6,200 impressions, 1.1% CTR" },
  { id: "ct2", title: "Dental implants vs bridges: which is right for you?", keyword: "implant vs bridge", volume: 2400, difficulty: 41, position: 27, stage: "Draft", day: 6, type: "Blog", gap: "Competitor Sabka Dentist ranks #3" },
  { id: "ct3", title: "Clear aligners in Pune: cost, timeline, EMI options", keyword: "clear aligners pune", volume: 1300, difficulty: 33, position: null, stage: "Brief", day: 10, type: "Service page", gap: "Not ranking; 48 chat questions last month" },
  { id: "ct4", title: "Root canal treatment: does it hurt? (Dentist answers)", keyword: "does root canal hurt", volume: 3600, difficulty: 22, position: 31, stage: "Draft", day: 13, type: "FAQ", gap: "Page 4; high-intent informational query" },
  { id: "ct5", title: "Best dentist in Baner: what to look for", keyword: "dentist in baner", volume: 880, difficulty: 19, position: 8, stage: "Idea", day: 17, type: "Location page", gap: "Ranking #8, a location page could reach top 3" },
  { id: "ct6", title: "Kids' first dental visit: a parent's checklist", keyword: "first dental visit child", volume: 720, difficulty: 15, position: null, stage: "Idea", day: 20, type: "Blog", gap: "Supports Kids dentistry – Baner campaign" },
  { id: "ct7", title: "Wisdom tooth removal cost & recovery in Pune", keyword: "wisdom tooth removal cost pune", volume: 1600, difficulty: 26, position: 19, stage: "Idea", day: 24, type: "Blog", gap: "Ranking #19 from an old 2023 post" },
  { id: "ct8", title: "Smile makeover packages for weddings", keyword: "smile makeover before wedding", volume: 590, difficulty: 18, position: null, stage: "Idea", day: 27, type: "Service page", gap: "Seasonal: Nov–Feb wedding season" },
  { id: "ct9", title: "Bleeding gums: 7 causes and when to see a dentist", keyword: "bleeding gums causes", volume: 5400, difficulty: 37, position: 6, stage: "Published", day: 1, type: "Blog", gap: "Published 1 Nov · already #6" },
];

export const draftArticle = {
  id: "ct1",
  title: "Teeth Whitening Cost in Pune (2026 Price Guide)",
  slug: "teeth-whitening-cost-pune",
  meta: "How much does teeth whitening cost in Pune? Laser whitening at Smile Dental costs ₹8,000–₹12,000. Compare in-clinic vs take-home kits, results and EMI options.",
  keyword: "teeth whitening cost pune",
  outline: [
    "How much does teeth whitening cost in Pune?",
    "In-clinic laser whitening vs take-home kits",
    "What affects the price (shade goal, sensitivity, number of sessions)",
    "How long do results last?",
    "Is whitening safe? What dentists recommend",
    "EMI & payment options at Smile Dental",
    "FAQs",
  ],
  body: `Teeth whitening in Pune typically costs between ₹8,000 and ₹12,000 for a single in-clinic laser session, and ₹4,500 to ₹6,000 for dentist-supervised take-home kits.

At Smile Dental (Koregaon Park and Baner), most patients choose in-clinic laser whitening because it takes about 60 minutes and can brighten teeth by up to 8 shades in one visit.

## In-clinic laser whitening vs take-home kits

In-clinic whitening uses a professional-strength gel activated by a light source. It is faster and more predictable. Take-home kits use custom trays and a milder gel worn for 1–2 hours a day over two weeks.

## What affects the price?

The final price depends on your starting shade, your shade goal, tooth sensitivity, and whether a cleaning is needed first.`,
};

export interface SeoCheck {
  id: string;
  label: string;
  pass: boolean;
  hint: string;
}

export const seoChecks: SeoCheck[] = [
  { id: "s1", label: "Focus keyword in title", pass: true, hint: "“teeth whitening cost pune” appears in the H1" },
  { id: "s2", label: "Meta description 120–160 characters", pass: true, hint: "Currently in range" },
  { id: "s3", label: "Keyword in first 100 words", pass: true, hint: "Found in paragraph 1" },
  { id: "s4", label: "At least 1,200 words", pass: false, hint: "Draft is short: expand the sections below" },
  { id: "s5", label: "FAQ schema (FAQPage)", pass: false, hint: "Add 4–6 FAQs from real patient chats" },
  { id: "s6", label: "Internal links to service pages", pass: false, hint: "Link to /whitening and /book" },
  { id: "s7", label: "Image alt text", pass: true, hint: "2 of 2 images have alt text" },
];

/* ------------------------------------------------------------------ */
/* Marketing: social                                                   */
/* ------------------------------------------------------------------ */

export type SocialNetwork = "instagram" | "facebook" | "linkedin" | "gbp";

export interface SocialPost {
  id: string;
  networks: SocialNetwork[];
  caption: string;
  /** 0 = Monday of the visible week. */
  dayIndex: number;
  time: string;
  status: "scheduled" | "published" | "draft" | "failed";
  media: string;
  ai?: boolean;
}

export const socialPosts: SocialPost[] = [
  { id: "sp1", networks: ["instagram", "facebook"], caption: "✨ Diwali is almost here! Light up your smile with 1-hour laser whitening. Book on WhatsApp → link in bio. #PuneDentist #DiwaliSmile", dayIndex: 0, time: "7:30 PM", status: "published", media: "Reel · before/after", ai: true },
  { id: "sp2", networks: ["gbp"], caption: "Now open Sundays at our Baner clinic, 10 AM – 2 PM. Walk-ins welcome for emergencies.", dayIndex: 1, time: "10:00 AM", status: "published", media: "Photo · clinic front" },
  { id: "sp3", networks: ["instagram"], caption: "Myth vs fact: ‘Whitening damages enamel.’ ❌ Dentist-supervised whitening is safe. Dr. Kulkarni explains in 30 seconds 👇", dayIndex: 2, time: "6:00 PM", status: "scheduled", media: "Reel · 30s", ai: true },
  { id: "sp4", networks: ["linkedin"], caption: "Agri-input dealers lose 6–9% of season revenue to stock-outs. Here's how AgriGrow Inputs (Nashik) cut theirs in half. 🧵", dayIndex: 3, time: "9:00 AM", status: "scheduled", media: "Carousel · 6 slides", ai: true },
  { id: "sp5", networks: ["facebook", "gbp"], caption: "Kids' dental check-up camp this Saturday at Baner! Free fluoride application for under-12s. Reply ‘KIDS’ on WhatsApp to reserve.", dayIndex: 4, time: "11:00 AM", status: "scheduled", media: "Poster" },
  { id: "sp6", networks: ["instagram", "facebook"], caption: "Meet the team 👋 Dr. Neha Kulkarni has been straightening smiles in Pune for 12 years.", dayIndex: 5, time: "12:30 PM", status: "draft", media: "Photo · portrait", ai: true },
  { id: "sp7", networks: ["gbp"], caption: "Clear aligners from ₹85,000 with 0% EMI. Free 3D scan this month.", dayIndex: 6, time: "10:00 AM", status: "failed", media: "Photo · aligners" },
];

export const captionIdeas: Record<SocialNetwork, string[]> = {
  instagram: [
    "Your smile is the first thing people notice this festive season ✨ 1-hour laser whitening at Koregaon Park & Baner. DM ‘SMILE’ or tap the link in bio to book. #PuneDentist #SmileDental #DiwaliReady",
    "POV: you finally fixed that chipped tooth before the wedding 💍😁 Cosmetic bonding in a single visit. Book on WhatsApp in 30 seconds.",
  ],
  facebook: [
    "Planning a smile makeover before the wedding season? Our dentists at Koregaon Park and Baner offer whitening, bonding and aligners with 0% EMI. Message us on WhatsApp to get a quote in minutes.",
    "Parents of Baner! 🦷 Free kids' dental check-up camp this Saturday. Reply ‘KIDS’ on WhatsApp and our assistant will reserve your slot.",
  ],
  linkedin: [
    "Most agri-input dealers plan stock on gut feel. Last kharif season, AgriGrow Inputs used demand forecasts to cut stock-outs by 48% across 6 outlets. Here's what changed (and what didn't).",
    "3 questions we ask every agri-input dealer before a pilot: Which SKUs stock out first? How far ahead do you order? Who decides? The answers predict ROI better than outlet count.",
  ],
  gbp: [
    "Teeth whitening from ₹8,000 at Smile Dental, Koregaon Park. 60-minute in-clinic session, up to 8 shades brighter. Book online or on WhatsApp.",
    "Open this Sunday 10 AM – 2 PM at Baner for dental emergencies. Call or WhatsApp +91 98220 00000.",
  ],
};

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export type ReviewPlatform = "google" | "facebook" | "practo" | "justdial";

export const reviewPlatformMeta: Record<ReviewPlatform, { label: string; mark: string; className: string }> = {
  google: { label: "Google", mark: "G", className: "bg-[#4285f4]/15 text-[#4285f4]" },
  facebook: { label: "Facebook", mark: "f", className: "bg-[#1877f2]/15 text-[#3b8cf5]" },
  practo: { label: "Practo", mark: "P", className: "bg-[#5a64e0]/15 text-[#5a64e0]" },
  justdial: { label: "Justdial", mark: "Jd", className: "bg-[#f57c00]/15 text-[#e67300]" },
};

export const reviewPlatformStats: { platform: ReviewPlatform; rating: number; count: number; newThisMonth: number; responseRate: number }[] = [
  { platform: "google", rating: 4.8, count: 1214, newThisMonth: 46, responseRate: 98 },
  { platform: "practo", rating: 4.7, count: 386, newThisMonth: 12, responseRate: 91 },
  { platform: "facebook", rating: 4.6, count: 142, newThisMonth: 5, responseRate: 80 },
  { platform: "justdial", rating: 4.3, count: 228, newThisMonth: 7, responseRate: 64 },
];

export const ratingDistribution = [
  { stars: 5, count: 1532 },
  { stars: 4, count: 268 },
  { stars: 3, count: 74 },
  { stars: 2, count: 38 },
  { stars: 1, count: 58 },
];

export const reviewTrend = [
  { month: "Nov", avg: 4.42, count: 31 },
  { month: "Dec", avg: 4.45, count: 28 },
  { month: "Jan", avg: 4.48, count: 34 },
  { month: "Feb", avg: 4.5, count: 30 },
  { month: "Mar", avg: 4.51, count: 37 },
  { month: "Apr", avg: 4.55, count: 41 },
  { month: "May", avg: 4.58, count: 44 },
  { month: "Jun", avg: 4.6, count: 52 },
  { month: "Jul", avg: 4.64, count: 58 },
  { month: "Aug", avg: 4.68, count: 63 },
  { month: "Sep", avg: 4.71, count: 66 },
  { month: "Oct", avg: 4.74, count: 70 },
];

export type ReviewTopic = "staff" | "pain" | "price" | "wait time" | "cleanliness" | "results" | "booking";
export type Sentiment = "positive" | "neutral" | "negative";

export interface Review {
  id: string;
  author: string;
  platform: ReviewPlatform;
  rating: number;
  when: string;
  location: "Koregaon Park" | "Baner";
  text: string;
  sentiment: Sentiment;
  topics: ReviewTopic[];
  reply?: string;
  aiDraft: string;
  confidence: number;
  flagged?: string;
}

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Meera Nair",
    platform: "google",
    rating: 5,
    when: "1h ago",
    location: "Koregaon Park",
    text: "Dr. Kulkarni and the whole team were so gentle with my cleaning. Booked on WhatsApp at midnight and got a slot the next morning. Super convenient!",
    sentiment: "positive",
    topics: ["staff", "booking"],
    aiDraft: "Thank you so much, Meera! 🙏 We're delighted the cleaning was comfortable and that booking on WhatsApp was easy. Dr. Kulkarni and the team look forward to seeing you at your next check-up.",
    confidence: 96,
  },
  {
    id: "r2",
    author: "Rohit Mehta",
    platform: "google",
    rating: 2,
    when: "3h ago",
    location: "Koregaon Park",
    text: "Root canal was fine but my temporary filling came off twice. Had to wait 40 minutes past my appointment time too. Expected better for the price.",
    sentiment: "negative",
    topics: ["wait time", "price", "results"],
    aiDraft: "Hi Rohit, we're truly sorry about the filling and the wait. That's not the experience we want for anyone. Arjun from our front desk has reserved a priority slot with Dr. Kulkarni at no charge. Please call us on +91 98220 00000 so we can make this right.",
    confidence: 82,
    flagged: "Complaint: AI will not auto-post. Needs human approval.",
  },
  {
    id: "r3",
    author: "Ananya Rao",
    platform: "practo",
    rating: 5,
    when: "Yesterday",
    location: "Koregaon Park",
    text: "Clear pricing upfront, no surprises. The whitening results are amazing and the staff explained everything.",
    sentiment: "positive",
    topics: ["price", "results", "staff"],
    reply: "Thank you, Ananya! We're so glad you love your results. Transparent pricing matters to us. See you at your 6-month check-up! 😊",
    aiDraft: "Thank you, Ananya! We're so glad you love your results. Transparent pricing matters to us. See you at your 6-month check-up! 😊",
    confidence: 97,
  },
  {
    id: "r4",
    author: "Sanjay Gupta",
    platform: "justdial",
    rating: 3,
    when: "2 days ago",
    location: "Baner",
    text: "Treatment was good, doctor is knowledgeable. But Saturday was very crowded, waited almost an hour. Parking is also difficult.",
    sentiment: "neutral",
    topics: ["wait time", "staff"],
    aiDraft: "Thank you for the honest feedback, Sanjay. We're glad the treatment went well. Saturdays at Baner have been busy, so we've added a second dentist on weekends and now send live wait-time updates on WhatsApp. Hope to give you a quicker visit next time!",
    confidence: 88,
  },
  {
    id: "r5",
    author: "Fatima Shaikh",
    platform: "google",
    rating: 5,
    when: "2 days ago",
    location: "Baner",
    text: "Called at 8 AM with terrible tooth pain, they texted back immediately (in Hindi!) and saw me the same evening. Painless extraction. Bahut shukriya!",
    sentiment: "positive",
    topics: ["booking", "pain", "staff"],
    aiDraft: "Fatima ji, aapka bahut shukriya! 🙏 We're relieved you're out of pain and glad we could see you the same day. Take care, and reach out on WhatsApp anytime.",
    confidence: 93,
  },
  {
    id: "r6",
    author: "Vivek Deshpande",
    platform: "facebook",
    rating: 1,
    when: "4 days ago",
    location: "Baner",
    text: "Quoted ₹45k for implant, final bill was ₹58k. Nobody told me the crown was extra.",
    sentiment: "negative",
    topics: ["price"],
    aiDraft: "Hi Vivek, we're sorry the final amount was a surprise. You should always get a complete written estimate. Our clinic manager Neha will call you today to walk through the bill and make it right.",
    confidence: 74,
    flagged: "Billing dispute: route to manager",
  },
  {
    id: "r7",
    author: "Kavita Joshi",
    platform: "google",
    rating: 4,
    when: "5 days ago",
    location: "Koregaon Park",
    text: "Very clean clinic and modern equipment. Kids loved the play corner. Slight wait but worth it.",
    sentiment: "positive",
    topics: ["cleanliness", "wait time"],
    reply: "Thank you, Kavita! The play corner is a favourite. We're working on shorter waits too. See you and the kids soon!",
    aiDraft: "Thank you, Kavita! The play corner is a favourite. We're working on shorter waits too. See you and the kids soon!",
    confidence: 95,
  },
  {
    id: "r8",
    author: "Arvind Kumar",
    platform: "practo",
    rating: 5,
    when: "1 week ago",
    location: "Baner",
    text: "Got my aligners here. Dr. Mehra was patient with all my questions and the EMI option made it affordable.",
    sentiment: "positive",
    topics: ["staff", "price", "results"],
    aiDraft: "Thank you, Arvind! Dr. Mehra is happy to answer every question. That's what we're here for. Enjoy the aligner journey! 😁",
    confidence: 95,
  },
];

export const reviewTopicStats: { topic: ReviewTopic; positive: number; negative: number }[] = [
  { topic: "staff", positive: 412, negative: 9 },
  { topic: "results", positive: 268, negative: 14 },
  { topic: "booking", positive: 190, negative: 6 },
  { topic: "cleanliness", positive: 144, negative: 2 },
  { topic: "pain", positive: 121, negative: 11 },
  { topic: "price", positive: 88, negative: 26 },
  { topic: "wait time", positive: 12, negative: 31 },
];

export const reviewRequestFunnel = [
  { label: "Requests sent", value: 1240 },
  { label: "Link clicked", value: 612 },
  { label: "Rated 4–5★ → Google", value: 418 },
  { label: "Review posted", value: 236 },
];

export const reviewRequestRecent = [
  { id: "q1", name: "Ananya Rao", visit: "Whitening consult", sent: "Today, 12:10 PM", status: "Reviewed" as const },
  { id: "q2", name: "Meera Nair", visit: "Cleaning", sent: "Today, 12:08 PM", status: "Reviewed" as const },
  { id: "q3", name: "Imran Khan", visit: "Kids check-up", sent: "Today, 11:30 AM", status: "Clicked" as const },
  { id: "q4", name: "Sneha Iyer", visit: "Ortho assessment", sent: "Yesterday", status: "Sent" as const },
  { id: "q5", name: "Rohit Mehta", visit: "Root canal follow-up", sent: "Yesterday", status: "Private feedback" as const },
  { id: "q6", name: "Divya Menon", visit: "Whitening", sent: "2 days ago", status: "Reviewed" as const },
];

export const recentVisitors = [
  { id: "c1", name: "Ananya Rao", visit: "Whitening consult", when: "Sat, 10:00 AM", location: "Koregaon Park" },
  { id: "c7", name: "Fatima Shaikh", visit: "Emergency consult", when: "Today, 5:00 PM", location: "Baner" },
  { id: "c11", name: "Divya Menon", visit: "Whitening touch-up", when: "Today, 2:30 PM", location: "Koregaon Park" },
  { id: "c12", name: "Imran Khan", visit: "Kids check-up", when: "Today, 11:00 AM", location: "Baner" },
  { id: "c9", name: "Pooja Bhatt", visit: "Aligner 3D scan", when: "Yesterday, 6:00 PM", location: "Koregaon Park" },
  { id: "c3", name: "Sneha Iyer", visit: "Ortho assessment", when: "Yesterday, 5:30 PM", location: "Baner" },
  { id: "c5", name: "Meera Nair", visit: "Cleaning", when: "Yesterday, 12:00 PM", location: "Koregaon Park" },
];

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export type Range = "7d" | "30d" | "90d";

export const overviewKpis: Record<Range, { leads: number; bookings: number; revenue: number; adSpend: number; aiResolution: number; frt: string; deltas: number[] }> = {
  "7d": { leads: 412, bookings: 128, revenue: 342000, adSpend: 41200, aiResolution: 71.4, frt: "34s", deltas: [9.1, 12.3, 8.4, 2.1, 3.2, -8.1] },
  "30d": { leads: 1642, bookings: 512, revenue: 1384000, adSpend: 176200, aiResolution: 68.2, frt: "38s", deltas: [18.2, 24.6, 12.4, 6.4, 7.9, -71.3] },
  "90d": { leads: 4410, bookings: 1288, revenue: 3612000, adSpend: 498000, aiResolution: 63.5, frt: "52s", deltas: [31.0, 38.4, 27.6, 14.2, 21.3, -64.0] },
};

/** Revenue by source, in ₹ for each range. Bars = booked revenue vs ad cost (same unit). */
export const revenueBySource = [
  { source: "Google Ads", revenue: 550000, cost: 101500 },
  { source: "Meta Ads", revenue: 586000, cost: 74700 },
  { source: "Organic / SEO", revenue: 212000, cost: 0 },
  { source: "Google Business", revenue: 174000, cost: 0 },
  { source: "Referral", revenue: 138000, cost: 0 },
  { source: "Walk-in / calls", revenue: 96000, cost: 0 },
];

export const rangeFactor: Record<Range, number> = { "7d": 0.247, "30d": 1, "90d": 2.61 };

export const weeklyRevenue = [
  { week: "W32", revenue: 268000, bookings: 98 },
  { week: "W33", revenue: 281000, bookings: 104 },
  { week: "W34", revenue: 274000, bookings: 101 },
  { week: "W35", revenue: 296000, bookings: 109 },
  { week: "W36", revenue: 288000, bookings: 106 },
  { week: "W37", revenue: 305000, bookings: 112 },
  { week: "W38", revenue: 318000, bookings: 117 },
  { week: "W39", revenue: 312000, bookings: 115 },
  { week: "W40", revenue: 329000, bookings: 121 },
  { week: "W41", revenue: 335000, bookings: 124 },
  { week: "W42", revenue: 351000, bookings: 130 },
  { week: "W43", revenue: 342000, bookings: 128 },
];

export const attributionFunnel = [
  { label: "Ad clicks", value: 18420 },
  { label: "Leads (conversation started)", value: 1642 },
  { label: "Qualified conversation", value: 1124 },
  { label: "Booking", value: 512 },
  { label: "Paid", value: 391 },
];

export type AttributionModel = "first" | "last" | "linear";

export interface AttributionRow {
  id: string;
  source: string;
  campaign: string;
  utm: string;
  leads: number;
  bookings: number;
  revenue: number;
  cost: number;
}

const attributionBase: AttributionRow[] = [
  { id: "at1", source: "Google Ads", campaign: "Whitening – Pune", utm: "google / cpc / whitening_pune", leads: 142, bookings: 19, revenue: 182000, cost: 44000 },
  { id: "at2", source: "Google Ads", campaign: "Implants – Broad", utm: "google / cpc / implants_broad", leads: 96, bookings: 9, revenue: 210000, cost: 48000 },
  { id: "at3", source: "Google Ads", campaign: "Brand – Smile Dental", utm: "google / cpc / brand", leads: 64, bookings: 22, revenue: 158000, cost: 9500 },
  { id: "at4", source: "Meta Ads", campaign: "Aligners – Lookalike 2%", utm: "facebook / paid_social / aligners_lal", leads: 118, bookings: 11, revenue: 420000, cost: 36000 },
  { id: "at5", source: "Meta Ads", campaign: "Kids dentistry – Baner 5 km", utm: "instagram / ctwa / kids_baner", leads: 52, bookings: 13, revenue: 52000, cost: 14000 },
  { id: "at6", source: "Meta Ads", campaign: "Diwali smile makeover – Reels", utm: "instagram / ctwa / diwali_reels", leads: 74, bookings: 8, revenue: 96000, cost: 18500 },
  { id: "at7", source: "Organic / SEO", campaign: "Blog: bleeding gums causes", utm: "google / organic / —", leads: 88, bookings: 21, revenue: 112000, cost: 0 },
  { id: "at8", source: "Google Business", campaign: "GBP profile & posts", utm: "google / gbp / profile", leads: 142, bookings: 47, revenue: 174000, cost: 0 },
  { id: "at9", source: "Referral", campaign: "Patient referral card", utm: "referral / whatsapp / card", leads: 46, bookings: 24, revenue: 138000, cost: 0 },
];

const modelShift: Record<AttributionModel, Record<string, number>> = {
  first: { "Google Ads": 1.14, "Meta Ads": 1.22, "Organic / SEO": 1.18, "Google Business": 0.82, Referral: 0.7 },
  last: { "Google Ads": 1, "Meta Ads": 1, "Organic / SEO": 1, "Google Business": 1, Referral: 1 },
  linear: { "Google Ads": 1.06, "Meta Ads": 1.09, "Organic / SEO": 1.1, "Google Business": 0.92, Referral: 0.86 },
};

export function attributionRows(model: AttributionModel): AttributionRow[] {
  return attributionBase.map((r) => {
    const f = modelShift[model][r.source] ?? 1;
    return { ...r, bookings: Math.round(r.bookings * f), revenue: Math.round((r.revenue * f) / 100) * 100 };
  });
}

export const aiResolutionTrend = [
  { week: "W32", resolution: 48.2, escalation: 21.4 },
  { week: "W33", resolution: 51.0, escalation: 19.8 },
  { week: "W34", resolution: 53.6, escalation: 18.1 },
  { week: "W35", resolution: 55.1, escalation: 17.6 },
  { week: "W36", resolution: 58.4, escalation: 15.9 },
  { week: "W37", resolution: 60.2, escalation: 14.7 },
  { week: "W38", resolution: 62.8, escalation: 13.2 },
  { week: "W39", resolution: 63.9, escalation: 12.8 },
  { week: "W40", resolution: 65.5, escalation: 12.1 },
  { week: "W41", resolution: 66.7, escalation: 11.4 },
  { week: "W42", resolution: 68.0, escalation: 10.9 },
  { week: "W43", resolution: 71.4, escalation: 9.8 },
];

export const escalationReasons = [
  { reason: "Complaint / negative sentiment", count: 64 },
  { reason: "Insurance & billing question", count: 41 },
  { reason: "Clinical question (needs dentist)", count: 37 },
  { reason: "Asked for a human", count: 29 },
  { reason: "Low-confidence answer", count: 22 },
  { reason: "Reschedule outside rules", count: 14 },
];

export const aiVsHumanBookings = [
  { week: "W38", ai: 68, human: 49 },
  { week: "W39", ai: 71, human: 44 },
  { week: "W40", ai: 76, human: 45 },
  { week: "W41", ai: 79, human: 45 },
  { week: "W42", ai: 84, human: 46 },
  { week: "W43", ai: 82, human: 46 },
];

export const unansweredQuestions = [
  { id: "uq1", question: "Do you accept Star Health / ICICI Lombard dental insurance?", count: 23, channel: "whatsapp" as const, lastAsked: "2h ago" },
  { id: "uq2", question: "Is parking available at the Koregaon Park clinic?", count: 17, channel: "webchat" as const, lastAsked: "5h ago" },
  { id: "uq3", question: "Can I get whitening done while pregnant?", count: 11, channel: "instagram" as const, lastAsked: "Yesterday" },
  { id: "uq4", question: "Do you do zirconia crowns, and what's the warranty?", count: 9, channel: "whatsapp" as const, lastAsked: "Yesterday" },
  { id: "uq5", question: "Is there a dentist who speaks Kannada?", count: 6, channel: "voice" as const, lastAsked: "2 days ago" },
];

export const sequenceStats = [
  { name: "Agri dealers, Maharashtra", sent: 842, open: 61.2, reply: 11.8, meetings: 19 },
  { name: "Agri dealers, Telangana", sent: 410, open: 57.4, reply: 9.3, meetings: 7 },
  { name: "Seed distributors, Gujarat", sent: 365, open: 52.1, reply: 6.4, meetings: 4 },
  { name: "Re-engage: last season pilots", sent: 96, open: 72.9, reply: 18.7, meetings: 6 },
  { name: "Fertiliser co-ops, Karnataka", sent: 288, open: 44.8, reply: 4.2, meetings: 2 },
];

export const prospectFunnel = [
  { label: "Prospects found", value: 3120 },
  { label: "Verified contact", value: 1840 },
  { label: "Enrolled in sequence", value: 1612 },
  { label: "Replied", value: 158 },
  { label: "Positive reply", value: 71 },
  { label: "Meeting booked", value: 38 },
];

export const teamStats = [
  { id: "ai", name: "Anvita AI", role: "AI agent", conversations: 1256, frt: "6s", resolution: 71, bookings: 318, csat: 4.6 },
  { id: "u2", name: "Arjun Patil", role: "Front desk", conversations: 284, frt: "3m 40s", resolution: 88, bookings: 92, csat: 4.7 },
  { id: "u4", name: "Vikram Joshi", role: "Front desk", conversations: 196, frt: "5m 12s", resolution: 84, bookings: 61, csat: 4.5 },
  { id: "u3", name: "Neha Kulkarni", role: "Clinic manager", conversations: 88, frt: "11m 05s", resolution: 93, bookings: 23, csat: 4.8 },
  { id: "u1", name: "Priya Sharma", role: "Owner · outbound", conversations: 64, frt: "18m 30s", resolution: 79, bookings: 18, csat: 4.9 },
];

export const growthReport = {
  week: "Week 43 · 20 – 26 Oct 2026",
  headline: "Best week of the quarter: ₹3.42L collected, 128 bookings, cost per booked lead down 11%.",
  narrative: [
    "Leads rose 9% to 412, driven by the Diwali smile makeover reels (74 leads) and Whitening – Pune, which is now your most efficient paid campaign at ₹2,316 per booked lead.",
    "Your AI agent resolved 71.4% of conversations without a human (up from 68.0%) and booked 82 appointments, 64% of the week's total. Median first response was 34 seconds.",
    "Reviews: 18 new reviews at 4.74★ average. Wait time appears in 18% of negative reviews, concentrated on Saturdays at Baner.",
  ],
  recommendations: [
    { title: "Shift ₹15,000 from Implants – Broad to Whitening – Pune", impact: "+6–8 booked leads / month", href: "/marketing" },
    { title: "Add an answer about dental insurance (Star Health, ICICI Lombard) to the knowledge base", impact: "−23 escalations / month", href: "/analytics" },
    { title: "Add a second dentist on Saturdays at Baner and send live wait-time updates", impact: "Protect 4.7★+ rating", href: "/reviews" },
  ],
};
