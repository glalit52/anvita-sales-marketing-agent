"use client";

import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Circle,
  CircleAlert,
  Keyboard,
  LifeBuoy,
  Mail,
  MessageCircle,
  PhoneCall,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Kbd, Modal, Page, PageHeader, Progress, Segmented, Select, Textarea, useToast } from "@/components/ui";
import { HelpChat } from "@/components/app/help-chat";
import { cn } from "@/lib/cn";
import { changelog, helpGuides, shortcuts, systemStatus, type StatusLevel } from "@/lib/mock/app";

const checklistSeed = [
  { id: "profile", label: "Import your business from smiledental.in", hint: "Services, prices, hours, 18 FAQs", href: "/onboarding", done: true },
  { id: "channels", label: "Connect WhatsApp and website chat", hint: "Your two busiest channels", href: "/settings?tab=channels", done: true },
  { id: "goals", label: "Set goals for the AI agent", hint: "Book appointments, qualify leads", href: "/agent", done: true },
  { id: "test", label: "Test your AI in the sandbox", hint: "Try 5 real questions", href: "/agent?tab=sandbox", done: true },
  { id: "calendar", label: "Connect your calendar", hint: "So the AI books real slots", href: "/integrations", done: true },
  { id: "gbp", label: "Connect Google Business Profile", hint: "Messages + reviews from Google", href: "/integrations", done: false },
  { id: "team", label: "Invite your front desk team", hint: "Escalations need a human", href: "/settings?tab=team", done: false },
  { id: "prospect", label: "Start your first prospect search", hint: "Find B2B leads with AI", href: "/prospecting", done: false },
];

const statusMeta: Record<StatusLevel, { label: string; dot: string; tone: "success" | "warning" | "danger" }> = {
  operational: { label: "Operational", dot: "bg-success", tone: "success" },
  degraded: { label: "Degraded", dot: "bg-warning", tone: "warning" },
  outage: { label: "Outage", dot: "bg-danger", tone: "danger" },
};

const supportSlots = ["Today, 2:00–3:00 PM", "Today, 4:00–5:00 PM", "Tomorrow, 10:00–11:00 AM", "Tomorrow, 3:00–4:00 PM"];

export default function HelpPage() {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [checklist, setChecklist] = useState(checklistSeed);
  const [support, setSupport] = useState<"whatsapp" | "email" | "callback">("whatsapp");
  const [callback, setCallback] = useState({ phone: "+91 98220 41200", slot: supportSlots[1], topic: "WhatsApp setup", note: "" });
  const [callbackBooked, setCallbackBooked] = useState<string | null>(null);
  const [email, setEmail] = useState({ subject: "", body: "" });
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState<{ text: string; n: number } | undefined>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select")) return;
      if (e.key === "?") setShortcutsOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: { title: string; module: string; href: string }[] = [];
    for (const g of helpGuides) {
      if (g.module.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)) out.push({ title: `${g.module}: overview`, module: g.module, href: g.href });
      for (const a of g.articles) if (a.toLowerCase().includes(q)) out.push({ title: a, module: g.module, href: g.href });
    }
    return out.slice(0, 8);
  }, [query]);

  const doneCount = checklist.filter((c) => c.done).length;
  const degraded = systemStatus.filter((s) => s.status !== "operational");

  const askAi = (text: string) => {
    setChatSeed((s) => ({ text, n: (s?.n ?? 0) + 1 }));
    document.getElementById("ask-ai")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <Page>
      <PageHeader
        title="Help center"
        description="Guides, answers and a real human when you need one. Most questions are answered by Anvita AI in seconds."
        actions={
          <>
            <Button variant="outline" onClick={() => setShortcutsOpen(true)}>
              <Keyboard /> Shortcuts
            </Button>
            <Button variant="ai" onClick={() => askAi("How do I get set up quickly?")}>
              <Sparkles /> Ask Anvita AI
            </Button>
          </>
        }
      />

      {/* Search */}
      <Card className="relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-ai-soft blur-2xl" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 className="text-base font-semibold">How can we help, Priya?</h2>
          <p className="mt-0.5 text-sm text-muted">Search 140+ articles, or ask in plain words.</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim() && results.length === 0) askAi(query);
            }}
          >
            <Input icon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. WhatsApp templates, refunds, escalation rules" aria-label="Search help" className="flex-1" />
          </form>
          {query.trim() && (
            <div className="mt-2 rounded-xl border border-line bg-surface shadow-pop">
              {results.length > 0 ? (
                <ul className="divide-y divide-line">
                  {results.map((r) => (
                    <li key={r.title}>
                      <Link href={r.href} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-2">
                        <BookOpen className="size-4 shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 truncate">{r.title}</span>
                        <Badge>{r.module}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button onClick={() => askAi(query)} className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-sm font-medium text-ai first:border-t-0 hover:bg-surface-2">
                <Sparkles className="size-4" /> Ask Anvita AI: “{query.trim()}”
              </button>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            {["WhatsApp templates", "Escalation", "Pay links", "Import contacts"].map((s) => (
              <button key={s} onClick={() => setQuery(s)} className="rounded-full border border-line bg-surface px-2.5 py-1 text-fg-2 hover:border-line-strong hover:text-fg">
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Checklist */}
        <Card className="self-start">
          <CardHeader
            title="Getting started"
            description={`${doneCount} of ${checklist.length} steps complete · mirrors your onboarding`}
            action={
              <Link href="/onboarding" className="text-xs font-medium text-primary hover:underline">
                Resume setup
              </Link>
            }
          />
          <CardBody>
            <Progress value={(doneCount / checklist.length) * 100} tone="success" />
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {checklist.map((c) => (
                <li key={c.id} className={cn("flex items-start gap-3 rounded-lg border p-3", c.done ? "border-line bg-surface-2/40" : "border-line-strong border-dashed")}>
                  <button
                    onClick={() => setChecklist((list) => list.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)))}
                    aria-label={c.done ? `Mark “${c.label}” as not done` : `Mark “${c.label}” as done`}
                    className={cn("mt-0.5 shrink-0", c.done ? "text-success" : "text-line-strong hover:text-success")}
                  >
                    {c.done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm font-medium", c.done && "text-muted line-through")}>{c.label}</div>
                    <div className="text-xs text-muted">{c.hint}</div>
                  </div>
                  {!c.done && (
                    <Link href={c.href} aria-label={`Go to: ${c.label}`} className="shrink-0 rounded-md p-1 text-primary hover:bg-primary-soft">
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-3">
              <PlayCircle className="size-8 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">Watch: Anvita in 4 minutes</div>
                <div className="text-xs text-muted">Inbox, AI agent and pay links, in Hindi or English</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Video opened", description: "Playing “Anvita in 4 minutes” (English).", tone: "info" })}>
                Play
              </Button>
            </div>
          </CardBody>
        </Card>

        <div id="ask-ai">
          <HelpChat seed={chatSeed} />
        </div>
      </div>

      {/* Guides */}
      <div className="mt-6 mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Guides by module</h2>
          <p className="text-sm text-muted">Step-by-step articles for every part of Anvita</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {helpGuides.map((g) => (
          <Card key={g.id} className="flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{g.module}</h3>
              <span className="text-xs text-muted">{g.articles.length + 6} articles</span>
            </div>
            <p className="mt-1 text-xs text-muted">{g.description}</p>
            <ul className="mt-3 flex-1 space-y-1.5">
              {g.articles.slice(0, 3).map((a) => (
                <li key={a}>
                  <button onClick={() => toast({ title: a, description: `Opened in the ${g.module} guide.`, tone: "info" })} className="flex w-full items-start gap-1.5 text-left text-sm text-fg-2 hover:text-primary">
                    <BookOpen className="mt-0.5 size-3.5 shrink-0 text-muted" />
                    <span>{a}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Link href={g.href} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Open {g.module} <ArrowRight className="size-3" />
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Contact support */}
        <Card>
          <CardHeader title="Contact support" description="Real people in Pune, Mon–Sat 9 AM–9 PM IST" action={<LifeBuoy className="size-4 text-muted" />} />
          <CardBody className="space-y-4">
            <Segmented
              value={support}
              onChange={setSupport}
              items={[
                { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle /> },
                { value: "email", label: "Email", icon: <Mail /> },
                { value: "callback", label: "Call back", icon: <PhoneCall /> },
              ]}
            />
            {support === "whatsapp" && (
              <div className="space-y-3">
                <p className="text-sm text-fg-2">Chat with our team on WhatsApp at <span className="font-medium text-fg">+91 80 4718 2290</span>. Median first reply: <b>6 min</b>.</p>
                <Button onClick={() => toast({ title: "WhatsApp opened", description: "Your workspace ID and plan were attached so we can help faster.", tone: "info" })}>
                  <MessageCircle /> Chat on WhatsApp
                </Button>
              </div>
            )}
            {support === "email" && (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast({ title: "Ticket #48213 created", description: "We reply within 4 business hours to priya@smiledental.in." });
                  setEmail({ subject: "", body: "" });
                }}
              >
                <Field label="Subject">
                  <Input value={email.subject} onChange={(e) => setEmail((x) => ({ ...x, subject: e.target.value }))} placeholder="e.g. Template rejected by Meta" />
                </Field>
                <Field label="Message">
                  <Textarea value={email.body} onChange={(e) => setEmail((x) => ({ ...x, body: e.target.value }))} placeholder="What happened, and what did you expect?" />
                </Field>
                <Button type="submit" disabled={!email.subject.trim() || !email.body.trim()}>
                  <Mail /> Send to support@anvita.ai
                </Button>
              </form>
            )}
            {support === "callback" &&
              (callbackBooked ? (
                <div className="rounded-xl border border-success/30 bg-success-soft/50 p-4 text-sm">
                  <div className="flex items-center gap-2 font-medium text-success">
                    <CheckCircle2 className="size-4" /> Call-back booked
                  </div>
                  <p className="mt-1 text-fg-2">
                    Sneha from Anvita support will call <b>{callback.phone}</b> {callbackBooked} about {callback.topic.toLowerCase()}.
                  </p>
                  <button onClick={() => setCallbackBooked(null)} className="mt-2 text-xs font-medium text-primary hover:underline">
                    Change time
                  </button>
                </div>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCallbackBooked(callback.slot);
                    toast({ title: "Call-back booked", description: `${callback.slot} · confirmation sent on WhatsApp.` });
                  }}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Phone">
                      <Input value={callback.phone} onChange={(e) => setCallback((x) => ({ ...x, phone: e.target.value }))} />
                    </Field>
                    <Field label="Topic">
                      <Select value={callback.topic} onChange={(e) => setCallback((x) => ({ ...x, topic: e.target.value }))}>
                        {["WhatsApp setup", "AI agent training", "Payments & invoices", "Billing", "Something else"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Preferred time">
                    <div className="grid grid-cols-2 gap-2">
                      {supportSlots.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setCallback((x) => ({ ...x, slot: s }))}
                          aria-pressed={callback.slot === s}
                          className={cn("rounded-lg border px-2 py-1.5 text-xs", callback.slot === s ? "border-primary bg-primary-soft font-medium text-primary" : "border-line hover:bg-surface-2")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Button type="submit">
                    <PhoneCall /> Request call-back
                  </Button>
                </form>
              ))}
          </CardBody>
        </Card>

        {/* Shortcuts */}
        <Card>
          <CardHeader
            title="Keyboard shortcuts"
            description={
              <>
                Press <Kbd>?</Kbd> anywhere on this page to see them all
              </>
            }
            action={
              <Button size="xs" variant="ghost" onClick={() => setShortcutsOpen(true)}>
                View all
              </Button>
            }
          />
          <CardBody>
            <ul className="divide-y divide-line">
              {[...shortcuts[0].items.slice(0, 3), ...shortcuts[1].items.slice(0, 3), shortcuts[2].items[0]].map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="text-fg-2">{s.label}</span>
                  <span className="flex shrink-0 gap-1">
                    {s.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Status */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader
            title="System status"
            description="Last 30 days · updated 2 min ago"
            action={
              degraded.length ? (
                <Badge tone="warning" dot>
                  Minor delays
                </Badge>
              ) : (
                <Badge tone="success" dot>
                  All systems operational
                </Badge>
              )
            }
          />
          <CardBody className="space-y-3">
            {degraded.map((d) => (
              <div key={d.name} className="flex gap-2 rounded-lg border border-warning/30 bg-warning-soft/50 p-3 text-xs text-fg-2">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>
                  <b className="text-fg">{d.name}:</b> {d.note}
                </span>
              </div>
            ))}
            <ul className="space-y-2.5">
              {systemStatus.map((s) => (
                <li key={s.name}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("size-2 shrink-0 rounded-full", statusMeta[s.status].dot)} aria-hidden />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      <span className={cn(s.status !== "operational" && "font-medium text-warning")}>{statusMeta[s.status].label}</span> · {s.uptime}%
                    </span>
                  </div>
                  <div className="mt-1 flex gap-[2px]" aria-label={`${s.name}: ${s.uptime}% uptime over 30 days`}>
                    {s.history.map((h, i) => (
                      <span key={i} title={`${30 - i} days ago: ${statusMeta[h].label}`} className={cn("h-4 flex-1 rounded-[2px]", h === "operational" ? "bg-success/60" : h === "degraded" ? "bg-warning" : "bg-danger")} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Changelog */}
      <Card className="mt-6">
        <CardHeader
          title="What's new"
          description="Product updates from the Anvita team"
          action={
            <Button size="xs" variant="outline" onClick={() => toast({ title: "Subscribed", description: "Monthly product updates will arrive on WhatsApp.", tone: "info" })}>
              Get updates on WhatsApp
            </Button>
          }
        />
        <ol className="divide-y divide-line border-t border-line">
          {changelog.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
              <div className="flex shrink-0 items-center gap-2 sm:w-40 sm:flex-col sm:items-start">
                <span className="text-xs text-muted">{c.date}</span>
                <Badge tone={c.tag === "New" ? "ai" : c.tag === "Improved" ? "info" : "success"}>{c.tag}</Badge>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {c.tag === "New" && <Bot className="size-4 text-ai" />}
                  {c.title}
                </div>
                <p className="mt-0.5 text-sm text-fg-2">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts" description="On Windows, use Ctrl instead of ⌘." size="lg">
        <div className="grid gap-6 sm:grid-cols-2">
          {shortcuts.map((g) => (
            <section key={g.group} className={cn(g.group === "Tasks" && "sm:col-span-2")}>
              <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{g.group}</h3>
              <ul className="divide-y divide-line">
                {g.items.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="text-fg-2">{s.label}</span>
                    <span className="flex shrink-0 gap-1">
                      {s.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Modal>
    </Page>
  );
}
