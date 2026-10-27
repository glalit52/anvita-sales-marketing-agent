import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  Globe,
  IndianRupee,
  Megaphone,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, Badge, ChannelIcon } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Stylised product snippets for the alternating feature sections (HTML/CSS only). */

function Frame({ title, children, className, right }: { title: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-ai/10 to-transparent blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="truncate text-xs font-semibold text-fg-2">{title}</span>
          <span className="ml-auto">{right}</span>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function AgentVisual() {
  return (
    <Frame title="Anvi · AI Agent" right={<Badge tone="success" dot>Autopilot</Badge>}>
      <div className="space-y-2.5">
        <div className="flex items-start gap-2">
          <Avatar name="Fatima Shaikh" size="xs" />
          <div className="rounded-2xl rounded-tl-md border border-line bg-surface-2 px-3 py-2 text-[13px]">
            Daant mein bahut dard hai, aaj koi doctor mil sakta hai?
            <div className="mt-1 flex items-center gap-1 text-[10px] text-muted">
              <ChannelIcon channel="whatsapp" size="xs" /> 6:41 PM · Hindi detected
            </div>
          </div>
        </div>
        <div className="flex items-start justify-end gap-2">
          <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-[13px] text-primary-fg">
            Sorry to hear that, Fatima ji. Baner branch mein aaj 7:15 PM ka emergency slot khaali hai. Book kar doon?
            <div className="mt-1 text-right text-[10px] text-primary-fg/75">6:41 PM · 22s</div>
          </div>
          <Avatar ai name="Anvi" size="xs" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Playbook", v: "Book appt." },
          { k: "Confidence", v: "0.94" },
          { k: "Tools", v: "Calendar" },
        ].map((x) => (
          <div key={x.k} className="rounded-lg bg-surface-2 px-2 py-2">
            <div className="text-[10px] text-muted uppercase">{x.k}</div>
            <div className="text-xs font-semibold">{x.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["English", "हिन्दी", "Hinglish", "मराठी", "தமிழ்", "తెలుగు"].map((l) => (
          <span key={l} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-2">
            {l}
          </span>
        ))}
      </div>
    </Frame>
  );
}

export function ProspectingVisual() {
  const rows = [
    { name: "Kalyani Dental Lab", city: "Pune", rating: "3.8", ai: "No", score: 88 },
    { name: "Precision Ceramics", city: "Nashik", rating: "3.6", ai: "No", score: 84 },
    { name: "SmileCraft Lab", city: "Nagpur", rating: "3.9", ai: "Yes", score: 61 },
    { name: "Shree Dental Works", city: "Kolhapur", rating: "3.4", ai: "No", score: 79 },
  ];
  return (
    <Frame title="Prospecting · New search" right={<Badge tone="ai"><Sparkles /> 214 found</Badge>}>
      <div className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary-soft/40 px-3 py-2.5 text-[13px]">
        <Search className="size-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1">Dental labs in Maharashtra with under 4★ and no online booking</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
        {["Google Maps", "Websites", "MCA registry", "Email verify"].map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 font-medium text-success">
            <Check className="size-3" /> {s}
          </span>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[420px] text-left text-[12px]">
          <thead className="bg-surface-2 text-[10.5px] text-muted uppercase">
            <tr>
              <th className="px-2.5 py-2 font-medium">Business</th>
              <th className="px-2.5 py-2 font-medium">Rating</th>
              <th className="px-2.5 py-2 font-medium">
                <span className="inline-flex items-center gap-1 text-ai">
                  <Sparkles className="size-3" /> Online booking?
                </span>
              </th>
              <th className="px-2.5 py-2 text-right font-medium">Fit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <td className="px-2.5 py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-[10.5px] text-muted">{r.city}</div>
                </td>
                <td className="px-2.5 py-2 tabular">{r.rating}★</td>
                <td className="px-2.5 py-2">{r.ai}</td>
                <td className="px-2.5 py-2 text-right">
                  <span className={cn("tabular rounded-md px-1.5 py-0.5 font-semibold", r.score >= 75 ? "bg-success-soft text-success" : "bg-surface-2 text-fg-2")}>{r.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

export function MarketingVisual() {
  const steps = [
    { icon: Target, k: "Goal", v: "60 implant consults in Nov" },
    { icon: Users, k: "Audience", v: "35–60, 8 km of both branches" },
    { icon: Megaphone, k: "Channels", v: "Meta CTWA + Google Search + WhatsApp" },
    { icon: IndianRupee, k: "Budget", v: "₹45,000 · ₹750 target per consult" },
  ];
  return (
    <Frame title="Campaign planner · Diwali implants" right={<Badge tone="warning">Needs approval</Badge>}>
      <ol className="grid gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.k} className="flex gap-2.5 rounded-xl border border-line p-2.5">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <s.icon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[10.5px] text-muted uppercase">
                {i + 1}. {s.k}
              </div>
              <div className="text-[12.5px] font-medium">{s.v}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 rounded-xl border border-line p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Globe className="size-3.5 text-muted" /> Answer-engine visibility
          </span>
          <span className="inline-flex items-center gap-1 text-success">
            <TrendingUp className="size-3.5" /> +3 this month
          </span>
        </div>
        <p className="mt-1 text-[12px] text-fg-2">“Best dental implant clinic in Koregaon Park”: mentioned in 6 of 10 AI answers (ChatGPT, Perplexity, Google AI)</p>
        <div className="mt-2 flex gap-1" aria-hidden>
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < 6 ? "bg-primary" : "bg-surface-3")} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function ReviewsVisual() {
  return (
    <Frame title="Reviews & payments" right={<Badge tone="success" dot>4.8★ Google</Badge>}>
      <div className="rounded-xl border border-line p-3">
        <div className="flex items-center gap-2">
          <Avatar name="Meera Nair" size="xs" />
          <div className="text-xs font-semibold">Meera Nair</div>
          <span className="ml-auto flex text-accent" aria-label="5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-current" />
            ))}
          </span>
        </div>
        <p className="mt-2 text-[12.5px] text-fg-2">“Painless cleaning and the reminders on WhatsApp were so convenient. Dr. Iyer explained everything.”</p>
        <div className="mt-2.5 rounded-lg border border-ai/25 bg-ai-soft/60 p-2.5 text-[12px]">
          <div className="mb-1 inline-flex items-center gap-1 font-semibold text-ai">
            <Sparkles className="size-3" /> AI-drafted reply
          </div>
          <div className="text-fg-2">Thank you, Meera! We&rsquo;ll pass your kind words to Dr. Iyer. See you at your 6-month check-up.</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-muted uppercase">Pay link · Rohit Mehta</div>
          <div className="mt-1 text-lg font-semibold tabular">₹18,500</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-success">
            <CircleCheck className="size-3.5" /> Paid via UPI · GST invoice sent
          </div>
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-muted uppercase">Review requests (30d)</div>
          <div className="mt-1 text-lg font-semibold tabular">431 → 164 reviews</div>
          <div className="mt-1 text-[11px] text-muted">38% conversion · 9 unhappy routed to manager</div>
        </div>
      </div>
    </Frame>
  );
}

export function AnalyticsVisual() {
  const funnel = [
    { label: "Ad spend", value: "₹1,76,200", pct: 100 },
    { label: "Leads", value: "1,642", pct: 82 },
    { label: "Conversations", value: "1,508", pct: 70 },
    { label: "Booked", value: "512", pct: 44 },
    { label: "Paid", value: "468", pct: 38 },
  ];
  return (
    <Frame title="Analytics · Last 30 days" right={<Badge tone="primary">Closed loop</Badge>}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-gradient-to-br from-primary to-ai p-3 text-white">
          <div className="text-[10.5px] text-white/80 uppercase">Cost per booked customer</div>
          <div className="mt-1 text-2xl font-semibold tabular">₹344</div>
          <div className="text-[11px] text-white/80">↓ 18% vs Sep</div>
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-muted uppercase">Revenue attributed</div>
          <div className="mt-1 text-2xl font-semibold tabular">₹13.8L</div>
          <div className="text-[11px] text-success">7.9× return on ad spend</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {funnel.map((f) => (
          <div key={f.label} className="grid grid-cols-[96px_1fr_auto] items-center gap-2.5 text-[12px]">
            <span className="text-fg-2">{f.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${f.pct}%` }} />
            </span>
            <span className="tabular font-medium">{f.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-2 p-2.5 text-[12px] text-fg-2">
        <BadgeCheck className="mt-0.5 size-4 shrink-0 text-ai" />
        <span>
          Instagram CTWA books at ₹290 vs Google Search ₹412. <b className="text-fg">Shift ₹12k?</b>
        </span>
        <ArrowRight className="ml-auto size-4 shrink-0 text-muted" />
      </div>
    </Frame>
  );
}
