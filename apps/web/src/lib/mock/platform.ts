import type { Channel } from "@/components/ui/channel";

/**
 * Mock data for the "AI Agent & Platform" module: Agent Studio, Automations,
 * Integrations and Settings. References ids from ./core (team u1..u4, contacts c1..c12).
 */

/* ------------------------------------------------------------------ */
/* AI Agent Studio                                                     */
/* ------------------------------------------------------------------ */

export type AgentMode = "off" | "copilot" | "autopilot";

export const agentProfile = {
  name: "Anvi",
  publishedVersion: 14,
  draftChanges: 3,
  model: "claude-sonnet-5-5",
  greeting:
    "Namaste! 👋 I'm Anvi from Smile Dental. I can help you book a visit, check prices or answer questions about treatments. How can I help today?",
  afterHoursMessage:
    "We're closed right now (clinic hours 9 AM–8 PM, Mon–Sat), but I can still book you a slot or answer questions. For dental emergencies call +91 20 6712 3400.",
};

export const channelModes: { channel: Channel; label: string; mode: AgentMode; note: string }[] = [
  { channel: "whatsapp", label: "WhatsApp", mode: "autopilot", note: "+91 20 6712 3400" },
  { channel: "webchat", label: "Website chat", mode: "autopilot", note: "smiledental.in" },
  { channel: "instagram", label: "Instagram DMs", mode: "autopilot", note: "@smiledental.pune" },
  { channel: "sms", label: "SMS", mode: "copilot", note: "SMLDNT sender" },
  { channel: "email", label: "Email", mode: "copilot", note: "hello@smiledental.in" },
  { channel: "google", label: "Google Business chat", mode: "copilot", note: "2 locations" },
  { channel: "voice", label: "Voice (missed calls)", mode: "off", note: "Beta: AI voice agent" },
];

export const agentKpis = [
  { label: "AI resolution rate", value: "82.4%", delta: 4.1, goodWhen: "up" as const, hint: "resolved without a human", spark: [71, 73, 72, 75, 77, 76, 79, 80, 82] },
  { label: "Escalation rate", value: "9.6%", delta: -2.3, goodWhen: "down" as const, hint: "handed to team", spark: [14, 13, 13, 12, 11, 11, 10, 10, 9.6] },
  { label: "CSAT (AI chats)", value: "4.7 / 5", delta: 2.2, goodWhen: "up" as const, hint: "from 312 ratings", spark: [4.4, 4.5, 4.5, 4.6, 4.5, 4.6, 4.7, 4.7, 4.7] },
  { label: "Bookings by AI", value: "318", delta: 24.6, goodWhen: "up" as const, hint: "62% of all bookings", spark: [22, 26, 31, 30, 34, 38, 41, 45, 51] },
];

export const languages = [
  { id: "en", label: "English", enabled: true, share: 46 },
  { id: "hi", label: "Hindi", enabled: true, share: 21 },
  { id: "hinglish", label: "Hinglish", enabled: true, share: 24 },
  { id: "mr", label: "Marathi", enabled: true, share: 7 },
  { id: "gu", label: "Gujarati", enabled: false, share: 1 },
  { id: "ta", label: "Tamil", enabled: false, share: 0.5 },
  { id: "te", label: "Telugu", enabled: false, share: 0.3 },
  { id: "kn", label: "Kannada", enabled: false, share: 0.2 },
  { id: "ml", label: "Malayalam", enabled: false, share: 0 },
  { id: "bn", label: "Bengali", enabled: false, share: 0 },
];

export type SourceKind = "website" | "pdf" | "faq" | "sheet" | "gbp";
export type SyncStatus = "synced" | "syncing" | "error" | "queued";

export interface KnowledgeSource {
  id: string;
  kind: SourceKind;
  name: string;
  detail: string;
  status: SyncStatus;
  lastSynced: string;
  chunks: number;
  autoSync?: string;
  usage: number;
}

export const knowledgeSources: KnowledgeSource[] = [
  { id: "k1", kind: "website", name: "smiledental.in", detail: "23 pages synced · 2 excluded", status: "synced", lastSynced: "Today, 6:00 AM", chunks: 412, autoSync: "Daily", usage: 38 },
  { id: "k2", kind: "sheet", name: "Price list 2026", detail: "Google Sheet · 64 rows · 2 tabs", status: "synced", lastSynced: "12 min ago", chunks: 64, autoSync: "Every 15 min", usage: 27 },
  { id: "k3", kind: "pdf", name: "Treatment brochure.pdf", detail: "18 pages · 2.4 MB", status: "synced", lastSynced: "Oct 14", chunks: 96, usage: 11 },
  { id: "k4", kind: "pdf", name: "Post-op care instructions.pdf", detail: "6 pages · 640 KB", status: "synced", lastSynced: "Oct 14", chunks: 28, usage: 6 },
  { id: "k5", kind: "faq", name: "Clinic FAQs", detail: "42 Q&A pairs · 6 added from gaps", status: "synced", lastSynced: "Yesterday", chunks: 42, usage: 14 },
  { id: "k6", kind: "gbp", name: "Google Business Profile", detail: "2 locations · hours, services, Q&A", status: "syncing", lastSynced: "Syncing…", chunks: 31, autoSync: "Hourly", usage: 3 },
  { id: "k7", kind: "pdf", name: "Insurance & TPA partners.pdf", detail: "3 pages · scanned, OCR failed on p.2", status: "error", lastSynced: "Oct 22", chunks: 4, usage: 1 },
];

export const faqs = [
  { id: "f1", q: "Do you accept insurance / cashless?", a: "Yes, cashless with Star Health, HDFC Ergo and ICICI Lombard at Koregaon Park. Other insurers: we give a detailed bill for reimbursement.", hits: 86 },
  { id: "f2", q: "Is parking available?", a: "Koregaon Park: free basement parking (2 hrs). Baner: paid street parking, 2-wheeler parking inside the building.", hits: 54 },
  { id: "f3", q: "Do you offer EMI?", a: "Yes, 0% EMI for 3/6 months on treatments above ₹15,000 via Bajaj Finserv and credit cards.", hits: 47 },
  { id: "f4", q: "Do you treat children?", a: "Yes, Dr. Kavya Iyer (pedodontist) is at Baner on Tue, Thu and Sat.", hits: 39 },
  { id: "f5", q: "How long does a root canal take?", a: "Usually 2 sittings of 45–60 min each, about a week apart. Crown fitting is a separate visit.", hits: 33 },
];

export const knowledgeGaps = [
  { id: "g1", q: "Do you do clear aligners for adults over 40?", asked: 7, lastAsked: "2h ago", channel: "whatsapp" as Channel, suggestion: "Yes. Invisalign and in-house aligners are suitable for adults of any age with healthy gums; a 3D scan consult (₹1,000, adjusted in treatment) confirms fit." },
  { id: "g2", q: "Kya Sunday ko clinic khula hai?", asked: 5, lastAsked: "Yesterday", channel: "webchat" as Channel, suggestion: "Sunday ko Koregaon Park branch 10 AM–2 PM khula rehta hai (sirf appointment se). Baner branch Sunday band rehti hai." },
  { id: "g3", q: "What is the cost of a full mouth implant (All-on-4)?", asked: 4, lastAsked: "Oct 25", channel: "instagram" as Channel, suggestion: "" },
  { id: "g4", q: "Can I get a teeth cleaning done during pregnancy?", asked: 3, lastAsked: "Oct 24", channel: "whatsapp" as Channel, suggestion: "" },
  { id: "g5", q: "Do you have a female dentist available?", asked: 2, lastAsked: "Oct 23", channel: "webchat" as Channel, suggestion: "Yes, Dr. Kavya Iyer and Dr. Sana Qureshi are available at both locations. You can pick your preferred dentist while booking." },
];

export const agentTools = [
  { id: "search_knowledge", label: "search_knowledge", description: "Search website, PDFs, FAQs and price list" },
  { id: "check_availability", label: "check_availability", description: "Read open slots in Google Calendar" },
  { id: "book_appointment", label: "book_appointment", description: "Book / reschedule / cancel (idempotent)" },
  { id: "create_payment_link", label: "create_payment_link", description: "Razorpay UPI / card link, bounded by limits" },
  { id: "update_contact", label: "update_contact", description: "Write whitelisted CRM fields" },
  { id: "create_task", label: "create_task", description: "Follow-up memory (\"call back Tuesday\")" },
  { id: "send_template", label: "send_template", description: "WhatsApp template outside 24h window" },
  { id: "handoff_to_human", label: "handoff_to_human", description: "Escalate with AI summary" },
] as const;

export type ToolId = (typeof agentTools)[number]["id"];

export interface Playbook {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  goal: string;
  requiredFields: string[];
  tools: ToolId[];
  mode: AgentMode;
  runs: number;
  successRate: number;
  instructions: string;
  maxDiscount?: number;
  maxPayment?: number;
}

export const playbooks: Playbook[] = [
  {
    id: "qualify", name: "Qualify lead", description: "Understand the need, urgency and budget before booking.", enabled: true,
    trigger: "New contact or unknown intent", goal: "Lead tagged with treatment + urgency", requiredFields: ["Name", "Treatment interest", "Preferred location", "Urgency"],
    tools: ["search_knowledge", "update_contact", "handoff_to_human"], mode: "autopilot", runs: 1124, successRate: 91,
    instructions: "Greet warmly in the customer's language. Ask at most 2 questions per message. Find out which treatment they need, which branch is closer (Koregaon Park or Baner) and how soon. If they mention pain or swelling, mark urgency = high and move to Book appointment.",
  },
  {
    id: "book", name: "Book appointment", description: "Offer 2–3 slots, confirm, send reminder.", enabled: true,
    trigger: "Intent = book / reschedule", goal: "Exactly one confirmed slot", requiredFields: ["Name", "Phone", "Treatment", "Location", "Slot"],
    tools: ["check_availability", "book_appointment", "create_payment_link", "update_contact", "handoff_to_human"], mode: "autopilot", runs: 512, successRate: 87, maxPayment: 2000,
    instructions: "Always call check_availability before offering times. Offer at most 3 slots. Never double-book: confirm the slot back to the customer before calling book_appointment. For whitening and implants consults, collect a ₹500 refundable deposit.",
  },
  {
    id: "faq", name: "Answer FAQ", description: "Grounded answers with citations from the knowledge base.", enabled: true,
    trigger: "Question about services, hours, location, policy", goal: "Question answered with a cited source", requiredFields: [],
    tools: ["search_knowledge", "handoff_to_human"], mode: "autopilot", runs: 2310, successRate: 94,
    instructions: "Only answer from search_knowledge results. If nothing relevant is found, say you'll check with the team and escalate with the question. Never give medical diagnoses.",
  },
  {
    id: "quote", name: "Quote price", description: "Share price ranges from the price list, not exact quotes.", enabled: true,
    trigger: "Intent = price / cost / EMI", goal: "Range shared + consult offered", requiredFields: ["Treatment"],
    tools: ["search_knowledge", "update_contact"], mode: "autopilot", runs: 688, successRate: 89, maxDiscount: 10,
    instructions: "Quote ranges from the 'Price list 2026' sheet only. Mention EMI for treatments above ₹15,000. You may offer the Diwali 10% consult discount; never more. Always follow up with an offer to book a consultation.",
  },
  {
    id: "deposit", name: "Collect deposit", description: "Send UPI pay link for deposits and pending dues.", enabled: true,
    trigger: "Booking needs deposit / invoice due", goal: "Payment received", requiredFields: ["Amount", "Purpose"],
    tools: ["create_payment_link", "update_contact", "handoff_to_human"], mode: "copilot", runs: 204, successRate: 78, maxPayment: 5000,
    instructions: "Send a Razorpay link with a clear purpose line. Remind once after 2 hours if unpaid. Never request card details in chat. Amounts above ₹5,000 must go to a human.",
  },
  {
    id: "review", name: "Request review", description: "Ask happy patients for a Google review.", enabled: true,
    trigger: "Appointment completed + 2h", goal: "Google review left", requiredFields: [],
    tools: ["send_template", "update_contact", "handoff_to_human"], mode: "autopilot", runs: 431, successRate: 38,
    instructions: "Ask how the visit went first. Only send the Google review link if the reply is positive. If negative, apologise and escalate to the clinic manager. Never offer incentives for reviews.",
  },
  {
    id: "reengage", name: "Re-engage", description: "Win back quiet leads and 6-month recall.", enabled: false,
    trigger: "No reply 3 days / last visit > 6 months", goal: "Lead replies or books", requiredFields: [],
    tools: ["send_template", "check_availability", "book_appointment"], mode: "copilot", runs: 96, successRate: 22,
    instructions: "Send one friendly nudge referencing their last conversation. Don't send more than 2 re-engagement messages in 30 days. Stop immediately on STOP or 'not interested'.",
  },
  {
    id: "complaint", name: "Handle complaint", description: "Acknowledge, gather facts, hand off fast.", enabled: true,
    trigger: "Negative sentiment / complaint / refund intent", goal: "Handed off with summary in < 2 min", requiredFields: ["Issue", "Visit date", "Doctor"],
    tools: ["update_contact", "create_task", "handoff_to_human"], mode: "autopilot", runs: 38, successRate: 97,
    instructions: "Apologise sincerely, don't argue or admit liability. Collect the visit date and what went wrong, then hand off to the clinic manager with a 3-line summary. Never promise refunds.",
  },
];

export type EscalationAction = "assign" | "notify" | "pause";

export interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  detail: string;
  enabled: boolean;
  routeTo: string;
  notify: ("inbox" | "whatsapp" | "email" | "slack")[];
  priority: "urgent" | "high" | "normal";
  firedThisWeek: number;
}

export const escalationRules: EscalationRule[] = [
  { id: "r1", name: "Negative sentiment", condition: "Sentiment is negative", detail: "2 consecutive negative messages (score < −0.4)", enabled: true, routeTo: "Neha Kulkarni", notify: ["inbox", "whatsapp"], priority: "high", firedThisWeek: 6 },
  { id: "r2", name: "Complaint or refund intent", condition: "Intent is complaint / refund", detail: "Classifier confidence ≥ 0.7", enabled: true, routeTo: "Neha Kulkarni", notify: ["inbox", "whatsapp", "email"], priority: "urgent", firedThisWeek: 3 },
  { id: "r3", name: "Low confidence answer", condition: "Answer confidence < 0.6", detail: "Agent says it will confirm, then hands off", enabled: true, routeTo: "Front desk (round robin)", notify: ["inbox"], priority: "normal", firedThisWeek: 11 },
  { id: "r4", name: "VIP contact", condition: "Contact has tag “vip”", detail: "Copilot only, human approves every reply", enabled: true, routeTo: "Priya Sharma", notify: ["inbox", "whatsapp"], priority: "high", firedThisWeek: 2 },
  { id: "r5", name: "Sensitive keywords", condition: "Message contains “doctor”, “lawyer”, “emergency”, “consumer court”", detail: "Case-insensitive, Hindi transliterations included", enabled: true, routeTo: "Arjun Patil", notify: ["inbox", "whatsapp"], priority: "urgent", firedThisWeek: 4 },
  { id: "r6", name: "Asks for a human", condition: "Explicit human request", detail: "“talk to someone”, “call me”, “insaan se baat”", enabled: true, routeTo: "Front desk (round robin)", notify: ["inbox"], priority: "high", firedThisWeek: 9 },
  { id: "r7", name: "Repeated misunderstanding", condition: "3 failed attempts", detail: "Same question rephrased 3× or 3 tool errors", enabled: true, routeTo: "Front desk (round robin)", notify: ["inbox"], priority: "normal", firedThisWeek: 2 },
  { id: "r8", name: "High-value treatment", condition: "Quoted value > ₹50,000", detail: "Implants, full-mouth rehab, aligners", enabled: false, routeTo: "Vikram Joshi", notify: ["inbox", "email"], priority: "normal", firedThisWeek: 0 },
];

export const guardrails = [
  { id: "ground", label: "Grounding required", description: "Prices, hours and policies must come from knowledge or tools", on: true },
  { id: "medical", label: "No medical advice", description: "Refuses diagnosis/prescriptions, suggests a consult", on: true },
  { id: "human", label: "Pause when a human replies", description: "AI stays paused on that thread for 30 min", on: true },
  { id: "pii", label: "PII redaction in logs", description: "Aadhaar, PAN, card numbers masked", on: true },
  { id: "inject", label: "Prompt-injection defence", description: "Customer & web content treated as data only", on: true },
];

export interface ScenarioTest {
  id: string;
  name: string;
  turns: number;
  asserts: string;
  last: "pass" | "fail";
}

export const scenarioTests: ScenarioTest[] = [
  { id: "t1", name: "Books exactly one slot", turns: 5, asserts: "book_appointment called once · slot confirmed", last: "pass" },
  { id: "t2", name: "Refuses medical advice", turns: 2, asserts: "No diagnosis · offers consult · judge ≥ 4", last: "pass" },
  { id: "t3", name: "Escalates refund request", turns: 3, asserts: "handoff_to_human called · summary present", last: "pass" },
  { id: "t4", name: "Quotes from price list only", turns: 2, asserts: "Cites “Price list 2026” · no invented numbers", last: "pass" },
  { id: "t5", name: "Replies in Hinglish when asked in Hinglish", turns: 3, asserts: "Language detector = hinglish", last: "pass" },
  { id: "t6", name: "Never discounts above 10%", turns: 4, asserts: "Max discount ≤ 10%", last: "fail" },
  { id: "t7", name: "Stops on STOP keyword", turns: 2, asserts: "No message after opt-out", last: "pass" },
  { id: "t8", name: "Ignores prompt injection in message", turns: 2, asserts: "No system prompt leak · judge ≥ 4", last: "pass" },
];

export const agentVersions = [
  { v: 14, current: true, author: "Priya Sharma", date: "Oct 26, 7:12 PM", changes: "Diwali offer: 10% off consults until Nov 5; added Sunday hours for Koregaon Park", diff: { prompt: 2, playbooks: 1, kb: 6 }, score: 4.6, tests: "8/8" },
  { v: 13, author: "Neha Kulkarni", date: "Oct 21, 11:05 AM", changes: "Handle complaint playbook now collects doctor name; stricter refund escalation", diff: { prompt: 0, playbooks: 1, kb: 0 }, score: 4.5, tests: "8/8" },
  { v: 12, author: "Priya Sharma", date: "Oct 14, 4:40 PM", changes: "Added treatment brochure + post-op PDFs; Marathi enabled", diff: { prompt: 1, playbooks: 0, kb: 124 }, score: 4.4, tests: "7/8" },
  { v: 11, author: "Anvita (auto)", date: "Oct 9, 2:00 AM", changes: "Model upgrade to claude-sonnet-5-5 (shadow-tested 72h, +3% resolution)", diff: { prompt: 0, playbooks: 0, kb: 0 }, score: 4.3, tests: "7/7" },
  { v: 10, author: "Arjun Patil", date: "Oct 2, 6:18 PM", changes: "Deposit collection moved to Copilot after ₹5k mis-quote", diff: { prompt: 1, playbooks: 2, kb: 0 }, score: 4.1, tests: "7/7" },
];

export const qaQueue = [
  { id: "q1", contactId: "c1", channel: "whatsapp" as Channel, summary: "Whitening enquiry → consult booked Sat 10:00, ₹500 deposit paid", score: 4.9, flags: [] as string[], playbook: "Book appointment", time: "2h ago" },
  { id: "q2", contactId: "c9", channel: "facebook" as Channel, summary: "Aligner price asked; AI quoted ₹85,000 flat without range", score: 3.1, flags: ["Hallucination risk"], playbook: "Quote price", time: "5h ago" },
  { id: "q3", contactId: "c12", channel: "webchat" as Channel, summary: "Parent asked for kids dentist on Sunday; AI answered but didn't offer a slot", score: 3.4, flags: ["Missed booking"], playbook: "Answer FAQ", time: "Yesterday" },
  { id: "q4", contactId: "c7", channel: "voice" as Channel, summary: "Missed call → text back, toothache, urgent slot booked same day", score: 4.8, flags: [], playbook: "Book appointment", time: "Yesterday" },
  { id: "q5", contactId: "c6", channel: "google" as Channel, summary: "Price shopper compared with another clinic; AI stayed polite, no discount", score: 4.2, flags: ["Tone: slightly formal"], playbook: "Quote price", time: "Oct 25" },
];

/** Scripted sandbox replies, keyed by detected intent. */
export interface SandboxStep {
  kind: "retrieval" | "tool" | "guardrail" | "model";
  label: string;
  detail: string;
  ms: number;
  status?: "ok" | "warn";
}

export interface SandboxScript {
  match: RegExp;
  reply: string;
  tools: { name: string; args: string; result: string }[];
  sources: string[];
  steps: SandboxStep[];
  tokens: { input: number; output: number };
  confidence: number;
  escalate?: boolean;
}

export const sandboxScripts: SandboxScript[] = [
  {
    match: /book|slot|appointment|available|saturday|kal|tomorrow/i,
    reply:
      "Sure! Here are the open slots for a whitening consultation at Koregaon Park this Saturday:\n• 10:00 AM\n• 11:30 AM\n• 4:00 PM\nWhich one works for you? A ₹500 refundable deposit holds the slot.",
    tools: [
      { name: "check_availability", args: "service=\"whitening_consult\", date=\"Sat 1 Nov\", location=\"KP\"", result: "3 slots" },
    ],
    sources: ["Services › Whitening", "Booking policy"],
    steps: [
      { kind: "guardrail", label: "Pre-checks", detail: "Opt-out: none · PII: none · Business hours: open", ms: 18, status: "ok" },
      { kind: "model", label: "Intent → Book appointment", detail: "claude-haiku-5-5 · confidence 0.94", ms: 220 },
      { kind: "retrieval", label: "search_knowledge", detail: "4 chunks · top: Services › Whitening (0.89), Booking policy (0.81)", ms: 140 },
      { kind: "tool", label: "check_availability", detail: "Google Calendar “KP – Chair 2” → 3 open slots", ms: 410 },
      { kind: "model", label: "Generate reply", detail: "claude-sonnet-5-5 · cached prompt 92%", ms: 1180 },
      { kind: "guardrail", label: "Post-checks", detail: "Grounded ✓ · Policy ✓ · Confidence 0.91 · No escalation", ms: 35, status: "ok" },
    ],
    tokens: { input: 3420, output: 96 },
    confidence: 0.91,
  },
  {
    match: /price|cost|kitna|charges|rate|emi|₹/i,
    reply:
      "Teeth whitening at Smile Dental costs ₹8,000–₹12,000 depending on the shade you want, and takes about 60 minutes. We also have a Diwali offer: 10% off the consultation until 5 Nov. 0% EMI is available above ₹15,000. Would you like me to book a free consultation?",
    tools: [],
    sources: ["Price list 2026 › Cosmetic", "Offers › Diwali 2026"],
    steps: [
      { kind: "guardrail", label: "Pre-checks", detail: "Opt-out: none · PII: none · Business hours: open", ms: 16, status: "ok" },
      { kind: "model", label: "Intent → Quote price", detail: "claude-haiku-5-5 · confidence 0.97", ms: 190 },
      { kind: "retrieval", label: "search_knowledge", detail: "5 chunks · top: Price list 2026 › Cosmetic (0.93), Offers › Diwali (0.86)", ms: 152 },
      { kind: "model", label: "Generate reply", detail: "claude-sonnet-5-5 · cached prompt 92%", ms: 1040 },
      { kind: "guardrail", label: "Post-checks", detail: "Grounded ✓ (2 citations) · Discount 10% ≤ max 10% ✓", ms: 31, status: "ok" },
    ],
    tokens: { input: 3610, output: 88 },
    confidence: 0.95,
  },
  {
    match: /refund|complain|worst|bad|pain after|angry|consumer/i,
    reply:
      "I'm really sorry to hear this, that's not the experience we want for you. I've shared the details with Neha, our clinic manager, and she'll call you within 30 minutes. Could you tell me the date of your visit so she has everything ready?",
    tools: [
      { name: "update_contact", args: "tags+=[\"complaint\"]", result: "ok" },
      { name: "handoff_to_human", args: "to=\"Neha Kulkarni\", reason=\"refund_request\"", result: "assigned" },
    ],
    sources: ["Refund & complaints policy"],
    steps: [
      { kind: "guardrail", label: "Pre-checks", detail: "Sentiment −0.72 (negative) · Keywords: refund", ms: 21, status: "warn" },
      { kind: "model", label: "Intent → Handle complaint", detail: "claude-haiku-5-5 · confidence 0.92", ms: 205 },
      { kind: "retrieval", label: "search_knowledge", detail: "2 chunks · top: Refund & complaints policy (0.88)", ms: 128 },
      { kind: "tool", label: "update_contact", detail: "tag “complaint” added", ms: 64 },
      { kind: "tool", label: "handoff_to_human", detail: "Rule “Complaint or refund intent” → Neha Kulkarni · WhatsApp + email notified", ms: 92 },
      { kind: "model", label: "Generate reply", detail: "claude-sonnet-5-5 · no refund promised ✓", ms: 980 },
      { kind: "guardrail", label: "Post-checks", detail: "Policy ✓ · Escalated · AI paused on thread", ms: 29, status: "ok" },
    ],
    tokens: { input: 3880, output: 74 },
    confidence: 0.88,
    escalate: true,
  },
  {
    match: /medicine|painkiller|antibiotic|swelling|bleeding|tablet|dawai/i,
    reply:
      "I'm not able to recommend medicines, as that needs a dentist to examine you. Swelling or bleeding should be checked soon: I can book you an urgent slot today at 5:30 PM in Baner. If the pain is severe or you have a fever, please call +91 20 6712 3400 right away.",
    tools: [{ name: "check_availability", args: "service=\"emergency\", date=\"today\"", result: "2 slots" }],
    sources: ["Emergency care policy", "Post-op care instructions.pdf p.3"],
    steps: [
      { kind: "guardrail", label: "Pre-checks", detail: "Medical-advice classifier: triggered (0.86)", ms: 24, status: "warn" },
      { kind: "model", label: "Intent → Medical question", detail: "claude-haiku-5-5 · confidence 0.89", ms: 210 },
      { kind: "retrieval", label: "search_knowledge", detail: "3 chunks · top: Emergency care policy (0.91)", ms: 133 },
      { kind: "tool", label: "check_availability", detail: "Baner emergency chair → 5:30 PM, 6:15 PM", ms: 380 },
      { kind: "model", label: "Generate reply", detail: "claude-sonnet-5-5 · refusal template applied", ms: 1010 },
      { kind: "guardrail", label: "Post-checks", detail: "No medication named ✓ · Consult offered ✓", ms: 30, status: "ok" },
    ],
    tokens: { input: 3540, output: 92 },
    confidence: 0.9,
  },
];

export const sandboxFallback: SandboxScript = {
  match: /.*/,
  reply:
    "Smile Dental is open 9 AM–8 PM, Monday to Saturday, at Koregaon Park and Baner. Koregaon Park is also open on Sundays 10 AM–2 PM by appointment. Is there a treatment you'd like to know more about?",
  tools: [],
  sources: ["Google Business Profile › Hours", "Contact page"],
  steps: [
    { kind: "guardrail", label: "Pre-checks", detail: "Opt-out: none · PII: none", ms: 15, status: "ok" },
    { kind: "model", label: "Intent → Answer FAQ", detail: "claude-haiku-5-5 · confidence 0.81", ms: 198 },
    { kind: "retrieval", label: "search_knowledge", detail: "3 chunks · top: GBP › Hours (0.84)", ms: 141 },
    { kind: "model", label: "Generate reply", detail: "claude-sonnet-5-5 · cached prompt 92%", ms: 920 },
    { kind: "guardrail", label: "Post-checks", detail: "Grounded ✓ · Confidence 0.82", ms: 28, status: "ok" },
  ],
  tokens: { input: 3300, output: 70 },
  confidence: 0.82,
};

/* ------------------------------------------------------------------ */
/* Automations                                                         */
/* ------------------------------------------------------------------ */

export type NodeKind = "trigger" | "condition" | "delay" | "action" | "ai";

export interface FlowNode {
  id: string;
  kind: NodeKind;
  title: string;
  detail: string;
  /** For condition nodes: actions on the "no" branch. */
  no?: FlowNode[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  runs: number;
  lastRun: string;
  successRate: number;
  category: string;
  nodes: FlowNode[];
}

export const workflows: Workflow[] = [
  {
    id: "w1", name: "Missed call → text back", description: "WhatsApp the caller within 30s when nobody picks up", enabled: true, runs: 1284, lastRun: "4 min ago", successRate: 99, category: "Speed to lead",
    nodes: [
      { id: "n1", kind: "trigger", title: "Missed call", detail: "Exotel · +91 20 6712 3400 (both locations)" },
      { id: "n2", kind: "condition", title: "Is it within business hours?", detail: "Mon–Sat 9 AM–8 PM IST", no: [{ id: "n2a", kind: "action", title: "Send WhatsApp template", detail: "missed_call_after_hours (Hindi/English)" }] },
      { id: "n3", kind: "delay", title: "Wait 30 seconds", detail: "Skip if the caller calls back" },
      { id: "n4", kind: "action", title: "Send WhatsApp template", detail: "missed_call_textback: “Sorry we missed you! How can we help?”" },
      { id: "n5", kind: "ai", title: "AI: hand conversation to Anvi", detail: "Playbook: Qualify lead → Book appointment" },
    ],
  },
  {
    id: "w2", name: "Post-visit review request", description: "Ask happy patients for a Google review 2 hours after the visit", enabled: true, runs: 431, lastRun: "1 h ago", successRate: 96, category: "Reviews",
    nodes: [
      { id: "n1", kind: "trigger", title: "Appointment completed", detail: "Any service · both locations" },
      { id: "n2", kind: "delay", title: "Wait 2 hours", detail: "Only between 10 AM and 8 PM" },
      { id: "n3", kind: "action", title: "Send WhatsApp template", detail: "visit_feedback: “How was your visit today?”" },
      { id: "n4", kind: "ai", title: "AI: classify reply sentiment", detail: "positive / neutral / negative" },
      { id: "n5", kind: "condition", title: "Sentiment is positive?", detail: "Confidence ≥ 0.7", no: [{ id: "n5a", kind: "action", title: "Create task", detail: "Clinic manager calls back within 1 hour" }] },
      { id: "n6", kind: "action", title: "Send Google review link", detail: "Per-location GBP short link" },
    ],
  },
  {
    id: "w3", name: "No-show follow-up", description: "Rebook patients who missed their appointment", enabled: true, runs: 86, lastRun: "Yesterday", successRate: 92, category: "Retention",
    nodes: [
      { id: "n1", kind: "trigger", title: "Appointment marked no-show", detail: "Google Calendar status / front desk" },
      { id: "n2", kind: "delay", title: "Wait 1 hour", detail: "" },
      { id: "n3", kind: "ai", title: "AI: write message", detail: "Friendly rebooking note, contact's language" },
      { id: "n4", kind: "action", title: "Send WhatsApp message", detail: "Includes 3 next available slots" },
      { id: "n5", kind: "action", title: "Add tag", detail: "no-show" },
    ],
  },
  {
    id: "w4", name: "6-month recall", description: "Remind patients for their routine cleaning", enabled: true, runs: 2140, lastRun: "Today, 10:00 AM", successRate: 97, category: "Retention",
    nodes: [
      { id: "n1", kind: "trigger", title: "Date reached", detail: "Last visit + 6 months, 10:00 AM" },
      { id: "n2", kind: "condition", title: "Contact has not opted out?", detail: "Consent: marketing = yes", no: [{ id: "n2a", kind: "action", title: "End workflow", detail: "Logged in audit" }] },
      { id: "n3", kind: "action", title: "Send WhatsApp template", detail: "recall_6m with booking button" },
      { id: "n4", kind: "delay", title: "Wait 3 days", detail: "" },
      { id: "n5", kind: "action", title: "Send SMS", detail: "Fallback if WhatsApp not read" },
    ],
  },
  {
    id: "w5", name: "New lead → assign + notify", description: "Round-robin new leads and ping the team on WhatsApp", enabled: true, runs: 642, lastRun: "18 min ago", successRate: 100, category: "Routing",
    nodes: [
      { id: "n1", kind: "trigger", title: "Form submitted", detail: "Website · Meta lead ads · Google Ads lead form" },
      { id: "n2", kind: "action", title: "Assign to", detail: "Round robin: Arjun, Vikram (online only)" },
      { id: "n3", kind: "action", title: "Update stage", detail: "New lead" },
      { id: "n4", kind: "action", title: "Notify team", detail: "WhatsApp to assignee with lead summary" },
    ],
  },
  {
    id: "w6", name: "Lead score > 80 → notify owner", description: "Hot B2B leads go straight to Priya", enabled: false, runs: 37, lastRun: "Oct 24", successRate: 100, category: "Routing",
    nodes: [
      { id: "n1", kind: "trigger", title: "Lead score changed", detail: "Any contact" },
      { id: "n2", kind: "condition", title: "Score > 80 and value > ₹1,00,000?", detail: "", no: [{ id: "n2a", kind: "action", title: "Do nothing", detail: "" }] },
      { id: "n3", kind: "ai", title: "AI: summarise conversation", detail: "3 bullet summary + next best action" },
      { id: "n4", kind: "action", title: "Send email", detail: "To priya@smiledental.in" },
      { id: "n5", kind: "action", title: "Create task", detail: "Call within 2 hours" },
    ],
  },
];

export const triggerOptions = [
  { id: "message", label: "Message received", detail: "Any channel, optional keyword" },
  { id: "form", label: "Form submitted", detail: "Website, Meta, Google lead forms" },
  { id: "booked", label: "Appointment booked", detail: "From any calendar" },
  { id: "completed", label: "Appointment completed", detail: "Marked done or checked out" },
  { id: "payment", label: "Payment received", detail: "Razorpay, Stripe, PhonePe" },
  { id: "tag", label: "Tag added", detail: "Specific tag on a contact" },
  { id: "review", label: "Review received", detail: "Google, Practo, Facebook" },
  { id: "missed", label: "Missed call", detail: "Exotel / Twilio number" },
];

export const actionOptions = [
  { id: "wa", label: "Send WhatsApp template", group: "Messaging" },
  { id: "sms", label: "Send SMS", group: "Messaging" },
  { id: "email", label: "Send email", group: "Messaging" },
  { id: "assign", label: "Assign to", group: "CRM" },
  { id: "tag", label: "Add tag", group: "CRM" },
  { id: "task", label: "Create task", group: "CRM" },
  { id: "stage", label: "Update stage", group: "CRM" },
  { id: "webhook", label: "Send webhook", group: "Developer" },
  { id: "ai-classify", label: "AI: classify", group: "AI" },
  { id: "ai-summarise", label: "AI: summarise", group: "AI" },
  { id: "ai-write", label: "AI: write message", group: "AI" },
  { id: "delay", label: "Delay", group: "Logic" },
  { id: "condition", label: "If / else condition", group: "Logic" },
];

export const workflowTemplates = [
  { id: "tp1", name: "Birthday wishes + offer", category: "Retention", installs: 2140, description: "WhatsApp greeting with a 10% voucher on the contact's birthday" },
  { id: "tp2", name: "Abandoned booking rescue", category: "Speed to lead", installs: 1830, description: "If a slot was viewed but not booked in 30 min, AI follows up" },
  { id: "tp3", name: "Payment reminder", category: "Payments", installs: 1610, description: "Unpaid pay link → reminders at 2h, 24h, then task" },
  { id: "tp4", name: "Negative review alert", category: "Reviews", installs: 1475, description: "≤ 3★ review → AI drafts reply + notify manager" },
  { id: "tp5", name: "Webinar / event reminders", category: "Marketing", installs: 920, description: "Registration → reminders T-24h and T-1h with join link" },
  { id: "tp6", name: "Dealer onboarding drip", category: "B2B", installs: 410, description: "New agri dealer → 5-step WhatsApp + email onboarding" },
];

export const workflowRuns = [
  { id: "run1", workflow: "Missed call → text back", contact: "Fatima Shaikh", status: "success" as const, steps: "5/5", duration: "31.2s", time: "4 min ago" },
  { id: "run2", workflow: "New lead → assign + notify", contact: "Karan Desai", status: "success" as const, steps: "4/4", duration: "1.1s", time: "18 min ago" },
  { id: "run3", workflow: "Post-visit review request", contact: "Meera Nair", status: "waiting" as const, steps: "2/6", duration: "Waiting 2h", time: "1 h ago" },
  { id: "run4", workflow: "6-month recall", contact: "Divya Menon", status: "success" as const, steps: "3/5", duration: "0.8s", time: "Today 10:00" },
  { id: "run5", workflow: "Post-visit review request", contact: "Rohit Mehta", status: "branched" as const, steps: "5/6", duration: "2h 4m", time: "Today 9:12" },
  { id: "run6", workflow: "No-show follow-up", contact: "Imran Khan", status: "failed" as const, steps: "3/5", duration: "2.4s", time: "Yesterday", error: "WhatsApp template “rebook_v2” paused by Meta (quality)" },
  { id: "run7", workflow: "Missed call → text back", contact: "Sneha Iyer", status: "success" as const, steps: "5/5", duration: "30.9s", time: "Yesterday" },
];

/* ------------------------------------------------------------------ */
/* Integrations                                                        */
/* ------------------------------------------------------------------ */

export type IntegrationCategory = "Messaging" | "CRM" | "Calendar" | "Payments" | "Marketing" | "Website & commerce" | "Automation" | "Data";

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  /** Brand-ish monogram color (brand-specific marks are allowed raw hex). */
  color: string;
  connected: boolean;
  account?: string;
  health?: "healthy" | "warning" | "error";
  lastSync?: string;
  permissions: string[];
  popular?: boolean;
}

export const integrations: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business", category: "Messaging", description: "Official Cloud API: templates, catalogs, click-to-WhatsApp ads", color: "#25d366", connected: true, account: "+91 20 6712 3400", health: "healthy", lastSync: "Live", permissions: ["Send & receive messages", "Manage message templates", "Read phone number quality rating"], popular: true },
  { id: "twilio", name: "Twilio", category: "Messaging", description: "SMS and voice numbers worldwide", color: "#f22f46", connected: false, permissions: ["Send & receive SMS", "Receive call webhooks", "Buy numbers"] },
  { id: "exotel", name: "Exotel", category: "Messaging", description: "Indian cloud telephony: virtual numbers, missed calls, IVR", color: "#1f6feb", connected: true, account: "SmileDental-Pune", health: "healthy", lastSync: "Live", permissions: ["Receive call events", "Call recordings", "Click-to-call"], popular: true },
  { id: "gmail", name: "Gmail", category: "Messaging", description: "Shared inbox for hello@ and appointments@", color: "#ea4335", connected: true, account: "hello@smiledental.in", health: "healthy", lastSync: "2 min ago", permissions: ["Read & send email", "Manage labels"] },
  { id: "outlook", name: "Outlook", category: "Messaging", description: "Microsoft 365 mailboxes", color: "#0a64ad", connected: false, permissions: ["Read & send email", "Read contacts"] },
  { id: "hubspot", name: "HubSpot", category: "CRM", description: "Two-way sync of contacts, deals and activities", color: "#ff7a59", connected: true, account: "smiledental.hubspot.com", health: "warning", lastSync: "1 h ago · 3 conflicts", permissions: ["Read & write contacts", "Read & write deals", "Log activities"], popular: true },
  { id: "salesforce", name: "Salesforce", category: "CRM", description: "Leads, opportunities and tasks", color: "#00a1e0", connected: false, permissions: ["Read & write leads", "Read & write opportunities", "Create tasks"] },
  { id: "zoho", name: "Zoho CRM", category: "CRM", description: "Popular with Indian SMBs: leads, deals, modules", color: "#e42527", connected: false, permissions: ["Read & write leads", "Read & write deals"], popular: true },
  { id: "pipedrive", name: "Pipedrive", category: "CRM", description: "Pipeline-first CRM for B2B teams", color: "#017737", connected: false, permissions: ["Read & write persons", "Read & write deals"] },
  { id: "gcal", name: "Google Calendar", category: "Calendar", description: "Real-time availability and booking for each chair/doctor", color: "#4285f4", connected: true, account: "6 calendars", health: "healthy", lastSync: "Live", permissions: ["Read free/busy", "Create & update events"], popular: true },
  { id: "ocal", name: "Outlook Calendar", category: "Calendar", description: "Microsoft 365 calendars", color: "#0078d4", connected: false, permissions: ["Read free/busy", "Create events"] },
  { id: "calendly", name: "Calendly", category: "Calendar", description: "Use existing Calendly event types", color: "#006bff", connected: false, permissions: ["Read event types", "Receive booking webhooks"] },
  { id: "razorpay", name: "Razorpay", category: "Payments", description: "UPI, cards and netbanking pay links", color: "#0c2451", connected: true, account: "acc_SmileDental", health: "healthy", lastSync: "Live", permissions: ["Create payment links", "Read payments", "Issue refunds (human only)"], popular: true },
  { id: "stripe", name: "Stripe", category: "Payments", description: "International cards and subscriptions", color: "#635bff", connected: false, permissions: ["Create checkout sessions", "Read payments"] },
  { id: "phonepe", name: "PhonePe", category: "Payments", description: "PhonePe PG and UPI intent", color: "#5f259f", connected: false, permissions: ["Create payment requests", "Read payments"] },
  { id: "gads", name: "Google Ads", category: "Marketing", description: "Ads co-pilot, offline conversion upload", color: "#fbbc04", connected: true, account: "123-456-7890", health: "healthy", lastSync: "3 h ago", permissions: ["Read campaigns & spend", "Upload offline conversions", "Edit budgets (with approval)"] },
  { id: "meta", name: "Meta Ads", category: "Marketing", description: "Facebook & Instagram ads, lead forms, CAPI", color: "#0866ff", connected: true, account: "Smile Dental Pune", health: "error", lastSync: "Token expired 2d ago", permissions: ["Read campaigns", "Receive lead forms", "Send Conversions API events"] },
  { id: "ga4", name: "GA4", category: "Marketing", description: "Website analytics and attribution", color: "#e37400", connected: true, account: "smiledental.in", health: "healthy", lastSync: "6 h ago", permissions: ["Read reports"] },
  { id: "gsc", name: "Search Console", category: "Marketing", description: "SEO queries, pages and gaps", color: "#458cf5", connected: false, permissions: ["Read search analytics"] },
  { id: "gbp", name: "Google Business Profile", category: "Marketing", description: "Reviews, Q&A, posts and chat for both locations", color: "#34a853", connected: false, permissions: ["Read & reply to reviews", "Manage posts", "Read insights"], popular: true },
  { id: "wordpress", name: "WordPress", category: "Website & commerce", description: "Publish SEO posts, install webchat", color: "#21759b", connected: true, account: "smiledental.in", health: "healthy", lastSync: "Yesterday", permissions: ["Create & publish posts", "Install plugin"] },
  { id: "shopify", name: "Shopify", category: "Website & commerce", description: "Orders, abandoned carts, customers", color: "#5e8e3e", connected: false, permissions: ["Read orders", "Read customers", "Read checkouts"] },
  { id: "woo", name: "WooCommerce", category: "Website & commerce", description: "Orders and customers from WordPress stores", color: "#7f54b3", connected: false, permissions: ["Read orders", "Read customers"] },
  { id: "webflow", name: "Webflow", category: "Website & commerce", description: "Form submissions and CMS publishing", color: "#146ef5", connected: false, permissions: ["Read form submissions", "Publish CMS items"] },
  { id: "zapier", name: "Zapier", category: "Automation", description: "Connect 6,000+ apps with Anvita triggers", color: "#ff4f00", connected: false, permissions: ["Use Anvita triggers & actions"] },
  { id: "make", name: "Make", category: "Automation", description: "Visual scenarios with Anvita modules", color: "#6d00cc", connected: false, permissions: ["Use Anvita modules"] },
  { id: "webhooks", name: "Webhooks", category: "Automation", description: "Push events to your own endpoints", color: "#475569", connected: true, account: "2 endpoints", health: "healthy", lastSync: "5 min ago", permissions: ["Send signed event payloads"] },
  { id: "gsheets", name: "Google Sheets", category: "Data", description: "Import price lists, export leads, live sync", color: "#0f9d58", connected: true, account: "3 sheets", health: "healthy", lastSync: "12 min ago", permissions: ["Read selected sheets", "Append rows"] },
];

export const crmFieldMapping = [
  { anvita: "Full name", crm: "firstname + lastname", direction: "both" as const },
  { anvita: "Phone (E.164)", crm: "phone", direction: "both" as const },
  { anvita: "Email", crm: "email", direction: "both" as const },
  { anvita: "Stage", crm: "lifecyclestage", direction: "to" as const },
  { anvita: "Lead score", crm: "anvita_score (custom)", direction: "to" as const },
  { anvita: "Treatment interest", crm: "service_interest (custom)", direction: "both" as const },
  { anvita: "Owner", crm: "hubspot_owner_id", direction: "from" as const },
  { anvita: "AI summary", crm: "Note (timeline)", direction: "to" as const },
];

export const apiKeys = [
  { id: "ak1", name: "Website booking form", prefix: "anv_live_7Hq2", created: "Aug 12, 2026", lastUsed: "3 min ago", scopes: ["contacts:write", "conversations:write"] },
  { id: "ak2", name: "Practice management sync", prefix: "anv_live_K9xd", created: "Sep 30, 2026", lastUsed: "Yesterday", scopes: ["contacts:read", "appointments:read"] },
];

export const webhookEvents = [
  "contact.created",
  "contact.updated",
  "conversation.escalated",
  "message.received",
  "appointment.booked",
  "appointment.cancelled",
  "payment.received",
  "review.received",
  "agent_run.completed",
];

export const webhookEndpoints = [
  { id: "wh1", url: "https://pms.smiledental.in/hooks/anvita", events: ["appointment.booked", "appointment.cancelled", "payment.received"], status: "healthy" as const, success: 99.8, lastDelivery: "5 min ago" },
  { id: "wh2", url: "https://hooks.slack.com/services/T0…/B0…", events: ["conversation.escalated"], status: "failing" as const, success: 62.5, lastDelivery: "Failed 1h ago (410 Gone)" },
];

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const businessProfile = {
  name: "Smile Dental",
  legalName: "Smile Dental Care Pvt. Ltd.",
  industry: "Dental clinic",
  website: "https://smiledental.in",
  timezone: "Asia/Kolkata (IST, UTC+5:30)",
  gstin: "27AACCS4821K1ZP",
  phone: "+91 20 6712 3400",
  currency: "INR (₹)",
};

export const locations = [
  { id: "l1", name: "Koregaon Park", address: "Lane 6, North Main Rd, Koregaon Park, Pune 411001", hours: "Mon–Sat 9–8 · Sun 10–2", chairs: 4, phone: "+91 20 6712 3400", primary: true },
  { id: "l2", name: "Baner", address: "2nd floor, Pancard Club Rd, Baner, Pune 411045", hours: "Mon–Sat 10–8", chairs: 2, phone: "+91 20 6712 3411", primary: false },
];

export const memberAccess: Record<string, { locations: string[]; lastActive: string; twoFA: boolean }> = {
  u1: { locations: ["All locations"], lastActive: "Now", twoFA: true },
  u2: { locations: ["Koregaon Park"], lastActive: "Now", twoFA: true },
  u3: { locations: ["Koregaon Park", "Baner"], lastActive: "3h ago", twoFA: false },
  u4: { locations: ["Baner"], lastActive: "Now", twoFA: true },
};

export const pendingInvites = [{ email: "dr.kavya@smiledental.in", role: "Viewer", sent: "2 days ago" }];

export const rolePermissions = [
  { perm: "Reply to conversations", Owner: true, Admin: true, Manager: true, Agent: true, Viewer: false },
  { perm: "Edit AI agent & publish", Owner: true, Admin: true, Manager: true, Agent: false, Viewer: false },
  { perm: "Run campaigns", Owner: true, Admin: true, Manager: true, Agent: false, Viewer: false },
  { perm: "Export contacts", Owner: true, Admin: true, Manager: false, Agent: false, Viewer: false },
  { perm: "Billing & plan", Owner: true, Admin: false, Manager: false, Agent: false, Viewer: false },
];

export const plans = [
  { id: "starter", name: "Starter", price: 2499, who: "Solo / single location", features: ["Unified inbox + webchat", "WhatsApp Business", "AI agent (Copilot)", "500 AI conversations / mo", "1 location, 3 users"] },
  { id: "growth", name: "Growth", price: 7999, who: "SMB, multi-user", features: ["Everything in Starter", "AI Autopilot + booking", "Reviews, payments, campaigns", "2,000 AI conversations / mo", "1,000 prospecting credits", "Up to 3 locations, 10 users"] },
  { id: "scale", name: "Scale", price: 19999, who: "Multi-location / B2B teams", features: ["Everything in Growth", "Sequences & Agent Studio evals", "CRM integrations + API", "6,000 AI conversations / mo", "500 voice minutes", "Unlimited locations"] },
  { id: "agency", name: "Agency", price: 49999, who: "Agencies managing clients", features: ["Everything in Scale", "White-label & custom domain", "Client workspaces", "Rebilling & margins", "Priority support + CSM"] },
];

export const usageMeters = [
  { id: "ai", label: "AI conversations", used: 1284, limit: 2000, unit: "", resets: "Nov 1" },
  { id: "prospect", label: "Prospecting credits", used: 1580, limit: 5000, unit: "", resets: "Nov 1" },
  { id: "voice", label: "Voice minutes", used: 96, limit: 100, unit: "min", resets: "Nov 1" },
  { id: "wa", label: "WhatsApp conversations", used: 3412, limit: 5000, unit: "", resets: "Nov 1" },
];

export const creditPacks = [
  { id: "cp1", label: "500 AI conversations", price: 1499 },
  { id: "cp2", label: "1,000 prospecting credits", price: 2999 },
  { id: "cp3", label: "250 voice minutes", price: 1999 },
  { id: "cp4", label: "₹5,000 WhatsApp wallet top-up", price: 5000 },
];

export const invoices = [
  { id: "INV-2026-0418", date: "Oct 1, 2026", amount: 9438, status: "paid" as const, items: "Growth plan + 18% GST" },
  { id: "INV-2026-0387", date: "Sep 18, 2026", amount: 3538, status: "paid" as const, items: "1,000 prospecting credits + GST" },
  { id: "INV-2026-0341", date: "Sep 1, 2026", amount: 9438, status: "paid" as const, items: "Growth plan + 18% GST" },
  { id: "INV-2026-0296", date: "Aug 1, 2026", amount: 9438, status: "paid" as const, items: "Growth plan + 18% GST" },
  { id: "INV-2026-0255", date: "Jul 1, 2026", amount: 2949, status: "refunded" as const, items: "Starter plan (upgraded mid-cycle)" },
];

export const auditLog = [
  { id: "a1", actor: "Anvi (AI)", ai: true, action: "Booked appointment", target: "Ananya Rao · Sat 1 Nov 10:00", time: "Today 11:42 PM", ip: "—" },
  { id: "a2", actor: "Anvi (AI)", ai: true, action: "Escalated to human", target: "Rohit Mehta → Arjun Patil (complaint)", time: "Today 11:18 PM", ip: "—" },
  { id: "a3", actor: "Priya Sharma", ai: false, action: "Published agent version", target: "Anvi v14", time: "Oct 26, 7:12 PM", ip: "49.36.12.8" },
  { id: "a4", actor: "Anvi (AI)", ai: true, action: "Created payment link", target: "₹500 · Ananya Rao", time: "Oct 26, 11:44 PM", ip: "—" },
  { id: "a5", actor: "Neha Kulkarni", ai: false, action: "Exported contacts (CSV)", target: "312 contacts · Koregaon Park", time: "Oct 25, 5:02 PM", ip: "103.21.4.77" },
  { id: "a6", actor: "System", ai: false, action: "Honoured opt-out", target: "+91 98234 56565 sent STOP", time: "Oct 25, 9:31 AM", ip: "—" },
  { id: "a7", actor: "Anvi (AI)", ai: true, action: "Updated contact", target: "Sneha Iyer · tags + braces, teen", time: "Oct 25, 9:02 AM", ip: "—" },
  { id: "a8", actor: "Priya Sharma", ai: false, action: "Processed deletion request", target: "DSR-0012 · Aditya Kulkarni", time: "Oct 24, 6:40 PM", ip: "49.36.12.8" },
  { id: "a9", actor: "Arjun Patil", ai: false, action: "Changed role", target: "Vikram Joshi: Viewer → Agent", time: "Oct 22, 1:15 PM", ip: "103.21.4.80" },
];

export const dataRequests = [
  { id: "DSR-0014", type: "Export", subject: "Meera Nair", status: "In progress", due: "Nov 3" },
  { id: "DSR-0013", type: "Delete", subject: "+91 90000 11111", status: "Awaiting verification", due: "Nov 2" },
  { id: "DSR-0012", type: "Delete", subject: "Aditya Kulkarni", status: "Completed", due: "Oct 24" },
];

export const notificationEvents = [
  { id: "escalation", label: "Conversation escalated to me", group: "Conversations", inApp: true, email: true, whatsapp: true, push: true },
  { id: "assigned", label: "Conversation assigned to me", group: "Conversations", inApp: true, email: false, whatsapp: false, push: true },
  { id: "draft", label: "AI draft waiting for approval (Copilot)", group: "Conversations", inApp: true, email: false, whatsapp: true, push: true },
  { id: "booking", label: "New appointment booked by AI", group: "Bookings & payments", inApp: true, email: false, whatsapp: false, push: false },
  { id: "payment", label: "Payment received", group: "Bookings & payments", inApp: true, email: true, whatsapp: false, push: false },
  { id: "review", label: "New review (≤ 3★)", group: "Reviews", inApp: true, email: true, whatsapp: true, push: true },
  { id: "hotlead", label: "Hot lead (score > 80)", group: "Sales", inApp: true, email: true, whatsapp: false, push: true },
  { id: "digest", label: "Daily AI digest (8 AM)", group: "Reports", inApp: false, email: true, whatsapp: true, push: false },
  { id: "usage", label: "Usage above 80% of plan", group: "Billing", inApp: true, email: true, whatsapp: false, push: false },
  { id: "integration", label: "Integration disconnected / failing", group: "Billing", inApp: true, email: true, whatsapp: false, push: false },
];
