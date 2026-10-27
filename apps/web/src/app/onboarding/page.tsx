"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CircleCheck,
  Copy,
  Globe,
  Hand,
  Loader2,
  Pencil,
  Rocket,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/shell/logo";
import { Avatar, Badge, Button, Card, ChannelIcon, Input, Progress, Textarea, useToast, type Channel } from "@/components/ui";
import { cn } from "@/lib/cn";

const steps = [
  { title: "Your business", hint: "Import from your website" },
  { title: "Connect channels", hint: "Where customers reach you" },
  { title: "Goals", hint: "What the AI should achieve" },
  { title: "Test your AI", hint: "Chat with it before going live" },
  { title: "Go live", hint: "Choose how much control AI gets" },
];

const crawlLog = [
  "Reading smiledental.in",
  "Found 23 pages",
  "Services & treatments",
  "Price list (PDF)",
  "Opening hours for 2 locations",
  "FAQs and policies",
  "Doctors & team",
  "Tone of voice",
];

const extracted = {
  services: ["Teeth whitening", "Root canal", "Braces & aligners", "Implants", "Kids dentistry", "Cleaning & scaling"],
  hours: ["Koregaon Park: Mon–Sat 9:00–20:00", "Baner: Mon–Sat 10:00–19:00, Sun 10:00–14:00"],
  faqs: 18,
  tone: "Warm, reassuring, simple language. Uses the patient's first name.",
};

const channelCards: { channel: Channel; name: string; desc: string; recommended?: boolean }[] = [
  { channel: "whatsapp", name: "WhatsApp Business", desc: "Connect your number with Meta in 2 minutes", recommended: true },
  { channel: "webchat", name: "Website chat", desc: "Add a chat bubble to smiledental.in", recommended: true },
  { channel: "voice", name: "Missed-call text back", desc: "Text callers back when you can't pick up" },
  { channel: "google", name: "Google Business Profile", desc: "Messages and reviews from Google" },
  { channel: "instagram", name: "Instagram DMs", desc: "Reply to DMs and story replies" },
  { channel: "email", name: "Email inbox", desc: "Gmail or Outlook" },
];

const templates = [
  { id: "clinic", name: "Clinic / healthcare", desc: "Book appointments, deposits, reminders, reviews" },
  { id: "realestate", name: "Real estate", desc: "Qualify buyers, schedule site visits" },
  { id: "education", name: "Education / coaching", desc: "Counsel leads, book demo classes" },
  { id: "auto", name: "Auto dealership", desc: "Test drives, service bookings, trade-ins" },
  { id: "home", name: "Home services", desc: "Quotes, technician visits, payments" },
  { id: "b2b", name: "B2B sales", desc: "Prospect, run sequences, book demos" },
];

const goals = [
  "Book appointments automatically",
  "Answer FAQs 24/7",
  "Collect deposits by pay link",
  "Get more Google reviews",
  "Re-engage past customers",
  "Find new B2B leads",
];

type ChatMsg = { from: "user" | "ai"; text: string };

const sandboxScript: Record<string, string> = {
  default: "Hi! I'm Anvi from Smile Dental 😊 We offer whitening, braces, implants, root canals and more at Koregaon Park and Baner. How can I help?",
  price: "Laser whitening is ₹8,000–₹12,000 and takes about an hour. Want me to book a free consultation?",
  book: "I have Saturday 10:00 AM or 11:30 AM at Koregaon Park. Which works for you?",
  pain: "I'm sorry you're in pain. 😟 We keep emergency slots every day. I can book you today at 5:00 PM at Baner. Shall I?",
};

function pickReply(text: string) {
  const t = text.toLowerCase();
  if (/(price|cost|how much|kitna)/.test(t)) return sandboxScript.price;
  if (/(book|appointment|slot|saturday)/.test(t)) return sandboxScript.book;
  if (/(pain|dard|hurt|emergency)/.test(t)) return sandboxScript.pain;
  return sandboxScript.default;
}

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);

  // Step 1
  const [url, setUrl] = useState("smiledental.in");
  const [crawl, setCrawl] = useState<"idle" | "running" | "done">("idle");
  const [crawlStep, setCrawlStep] = useState(0);
  // Step 2
  const [connected, setConnected] = useState<Channel[]>([]);
  const [connecting, setConnecting] = useState<Channel | null>(null);
  // Step 3
  const [template, setTemplate] = useState("clinic");
  const [chosenGoals, setChosenGoals] = useState<string[]>(goals.slice(0, 4));
  // Step 4
  const [chat, setChat] = useState<ChatMsg[]>([{ from: "ai", text: sandboxScript.default }]);
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  // Step 5
  const [mode, setMode] = useState<"copilot" | "autopilot">("copilot");

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "end" });
  }, [chat, aiTyping]);

  const startCrawl = () => {
    setCrawl("running");
    setCrawlStep(0);
    crawlLog.forEach((_, i) => timers.current.push(setTimeout(() => setCrawlStep(i + 1), 450 * (i + 1))));
    timers.current.push(setTimeout(() => setCrawl("done"), 450 * (crawlLog.length + 1)));
  };

  const connect = (c: Channel) => {
    setConnecting(c);
    timers.current.push(
      setTimeout(() => {
        setConnected((prev) => [...prev, c]);
        setConnecting(null);
        toast({ title: "Channel connected", description: channelCards.find((x) => x.channel === c)?.name });
      }, 1200),
    );
  };

  const sendChat = (text: string) => {
    if (!text.trim()) return;
    setChat((c) => [...c, { from: "user", text }]);
    setChatInput("");
    setAiTyping(true);
    timers.current.push(
      setTimeout(() => {
        setAiTyping(false);
        setChat((c) => [...c, { from: "ai", text: pickReply(text) }]);
      }, 1100),
    );
  };

  const canNext = [crawl === "done", connected.length > 0, chosenGoals.length > 0, chat.length > 2, true][step];

  const finish = () => {
    toast({ title: "Anvita is live 🚀", description: mode === "autopilot" ? "Anvi is now replying to customers." : "Anvi will draft replies for your approval." });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg lg:flex-row">
      {/* Stepper rail */}
      <aside className="border-b border-line bg-surface px-5 py-5 lg:w-80 lg:shrink-0 lg:border-r lg:border-b-0 lg:px-8 lg:py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold">Anvita</span>
        </Link>
        <div className="mt-2 hidden text-sm text-muted lg:block">Set up your AI sales & marketing team in about 10 minutes.</div>
        <ol className="mt-6 flex gap-2 overflow-x-auto lg:mt-10 lg:flex-col lg:gap-0">
          {steps.map((s, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={s.title} className="relative flex shrink-0 gap-3 lg:pb-8 lg:last:pb-0">
                {i < steps.length - 1 && <span className="absolute top-8 bottom-0 left-[15px] hidden w-px bg-line lg:block" />}
                <span
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    state === "done" && "border-success bg-success text-white",
                    state === "current" && "border-primary bg-primary text-primary-fg",
                    state === "todo" && "border-line-strong bg-surface text-muted",
                  )}
                >
                  {state === "done" ? <Check className="size-4" /> : i + 1}
                </span>
                <span className="hidden lg:block">
                  <span className={cn("block text-sm font-medium", state === "todo" ? "text-muted" : "text-fg")}>{s.title}</span>
                  <span className="block text-xs text-muted">{s.hint}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 text-sm font-medium lg:hidden">
          Step {step + 1} of {steps.length}: {steps[step].title}
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8 lg:py-14">
          {step === 0 && (
            <section className="animate-fade-in">
              <h1 className="text-2xl font-semibold tracking-tight">Let&apos;s get to know your business</h1>
              <p className="mt-1 text-sm text-muted">Paste your website. Anvita reads it and drafts your business profile, knowledge base and tone of voice.</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Input icon={<Globe />} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourbusiness.com" className="flex-1" />
                <Button onClick={startCrawl} disabled={!url || crawl === "running"} variant="ai">
                  {crawl === "running" ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {crawl === "done" ? "Re-import" : "Import with AI"}
                </Button>
              </div>
              <button className="mt-2 text-xs text-muted underline-offset-2 hover:underline">No website? Describe your business instead</button>

              {crawl !== "idle" && (
                <Card className="mt-6 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{crawl === "done" ? "Import complete" : "Reading your website…"}</span>
                    <span className="text-muted tabular">{Math.round((crawlStep / crawlLog.length) * 100)}%</span>
                  </div>
                  <Progress value={(crawlStep / crawlLog.length) * 100} tone="ai" className="mt-2" />
                  <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                    {crawlLog.map((l, i) => (
                      <li key={l} className={cn("flex items-center gap-2 text-sm", i < crawlStep ? "text-fg" : "text-muted")}>
                        {i < crawlStep ? <CircleCheck className="size-4 text-success" /> : i === crawlStep && crawl === "running" ? <Loader2 className="size-4 animate-spin text-ai" /> : <span className="size-4 rounded-full border border-line-strong" />}
                        {l}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {crawl === "done" && (
                <div className="animate-fade-in mt-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-ai" /> Here&apos;s what we found. Edit anything that&apos;s off.
                  </div>
                  <Card className="p-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <div className="mb-2 text-xs font-semibold text-muted uppercase">Business</div>
                        <Input defaultValue="Smile Dental Care" />
                        <div className="mt-2 flex gap-2">
                          <Badge tone="primary">Dental clinic</Badge>
                          <Badge>Pune, India</Badge>
                          <Badge>2 locations</Badge>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold text-muted uppercase">Opening hours</div>
                        {extracted.hours.map((h) => (
                          <div key={h} className="text-sm text-fg-2">{h}</div>
                        ))}
                      </div>
                      <div className="sm:col-span-2">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted uppercase">
                          Services <span className="font-normal normal-case">{extracted.services.length} found, with prices from your PDF</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {extracted.services.map((s) => (
                            <Badge key={s} tone="neutral" className="py-1 text-xs">{s}</Badge>
                          ))}
                          <button className="rounded-full border border-dashed border-line-strong px-2.5 text-xs text-muted">+ Add</button>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="mb-2 text-xs font-semibold text-muted uppercase">Tone of voice</div>
                        <Textarea defaultValue={extracted.tone} rows={2} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
                      <CircleCheck className="size-4 text-success" /> {extracted.faqs} FAQs and 23 pages added to the knowledge base
                    </div>
                  </Card>
                </div>
              )}
            </section>
          )}

          {step === 1 && (
            <section className="animate-fade-in">
              <h1 className="text-2xl font-semibold tracking-tight">Where do customers reach you?</h1>
              <p className="mt-1 text-sm text-muted">Connect at least one channel. Every conversation lands in one inbox, and the AI can answer on all of them.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {channelCards.map((c) => {
                  const isOn = connected.includes(c.channel);
                  return (
                    <Card key={c.channel} className={cn("flex items-start gap-3 p-4", isOn && "border-success/40")}>
                      <ChannelIcon channel={c.channel} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {c.name}
                          {c.recommended && !isOn && <Badge tone="primary">Recommended</Badge>}
                        </div>
                        <div className="mt-0.5 text-xs text-muted">{c.desc}</div>
                        <div className="mt-3">
                          {isOn ? (
                            <Badge tone="success">
                              <Check /> Connected
                            </Badge>
                          ) : (
                            <Button size="xs" variant="outline" onClick={() => connect(c.channel)} disabled={connecting !== null}>
                              {connecting === c.channel ? <><Loader2 className="animate-spin" /> Connecting…</> : "Connect"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {connected.includes("webchat") && (
                <Card className="animate-fade-in mt-4 p-4">
                  <div className="mb-2 text-sm font-medium">Paste this before &lt;/body&gt; on your website</div>
                  <div className="flex items-start gap-2 rounded-lg bg-surface-2 p-3 font-mono text-xs text-fg-2">
                    <code className="flex-1 break-all">{`<script src="https://cdn.anvita.ai/w.js" data-id="smile-dental" async></script>`}</code>
                    <button aria-label="Copy snippet" onClick={() => toast({ title: "Snippet copied" })} className="text-muted hover:text-fg">
                      <Copy className="size-4" />
                    </button>
                  </div>
                </Card>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="animate-fade-in">
              <h1 className="text-2xl font-semibold tracking-tight">What should your AI focus on?</h1>
              <p className="mt-1 text-sm text-muted">We&apos;ll install the right playbooks, reminders and escalation rules. You can change these anytime.</p>
              <div className="mt-6 text-xs font-semibold text-muted uppercase">Industry template</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={cn(
                      "rounded-xl border p-3.5 text-left transition-colors",
                      template === t.id ? "border-primary bg-primary-soft/60 ring-1 ring-primary" : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      {t.name}
                      {template === t.id && <CircleCheck className="size-4 text-primary" />}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{t.desc}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 text-xs font-semibold text-muted uppercase">Goals</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {goals.map((g) => {
                  const on = chosenGoals.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => setChosenGoals((prev) => (on ? prev.filter((x) => x !== g) : [...prev, g]))}
                      className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm", on ? "border-primary bg-surface" : "border-line bg-surface text-fg-2")}
                    >
                      <span className={cn("flex size-5 items-center justify-center rounded-md border", on ? "border-primary bg-primary text-primary-fg" : "border-line-strong")}>
                        {on && <Check className="size-3.5" />}
                      </span>
                      {g}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="animate-fade-in">
              <h1 className="text-2xl font-semibold tracking-tight">Meet Anvi, your AI agent</h1>
              <p className="mt-1 text-sm text-muted">Chat as if you were a customer. Anything wrong? Fix the answer and Anvi learns it.</p>
              <Card className="mt-6 flex h-[420px] flex-col overflow-hidden">
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <Avatar name="Anvi" ai />
                  <div>
                    <div className="text-sm font-semibold">Anvi · Smile Dental</div>
                    <div className="text-xs text-success">Sandbox: nothing is sent to real customers</div>
                  </div>
                </div>
                <div className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-bg p-4">
                  {chat.map((m, i) => (
                    <div key={i} className={cn("flex", m.from === "user" && "justify-end")}>
                      <div className={cn("group max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", m.from === "user" ? "rounded-br-md bg-fg text-bg" : "rounded-bl-md border border-line bg-surface")}>
                        {m.text}
                        {m.from === "ai" && i > 0 && (
                          <button onClick={() => toast({ title: "Correction saved", description: "Added to the knowledge base for review." })} className="mt-1 flex items-center gap-1 text-[11px] text-muted hover:text-primary">
                            <Pencil className="size-3" /> Improve this answer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {aiTyping && (
                    <div className="flex gap-1 rounded-2xl border border-line bg-surface px-4 py-3" style={{ width: "fit-content" }}>
                      <span className="typing-dot size-1.5 rounded-full bg-muted" />
                      <span className="typing-dot size-1.5 rounded-full bg-muted" />
                      <span className="typing-dot size-1.5 rounded-full bg-muted" />
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>
                <div className="border-t border-line p-3">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {["How much is whitening?", "Book Saturday morning", "bahut dard ho raha hai"].map((s) => (
                      <button key={s} onClick={() => sendChat(s)} className="rounded-full border border-line px-2.5 py-1 text-xs text-fg-2 hover:bg-surface-2">
                        {s}
                      </button>
                    ))}
                  </div>
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChat(chatInput);
                    }}
                  >
                    <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask anything a customer would…" className="flex-1" />
                    <Button type="submit" size="icon" aria-label="Send">
                      <Send />
                    </Button>
                  </form>
                </div>
              </Card>
            </section>
          )}

          {step === 4 && (
            <section className="animate-fade-in">
              <h1 className="text-2xl font-semibold tracking-tight">How should Anvi work?</h1>
              <p className="mt-1 text-sm text-muted">Start in Copilot to build trust, then switch to Autopilot. You can choose per channel later.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { id: "copilot", icon: Hand, title: "Copilot", desc: "Anvi drafts every reply. Your team reviews and sends.", points: ["Full control", "Great for week 1", "Learns from your edits"] },
                    { id: "autopilot", icon: Bot, title: "Autopilot", desc: "Anvi replies instantly, 24/7, and escalates when needed.", points: ["< 1 min response", "Books & collects deposits", "Escalation rules protect you"] },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setMode(o.id)}
                    className={cn("rounded-2xl border p-5 text-left transition-colors", mode === o.id ? "border-primary bg-surface ring-1 ring-primary" : "border-line bg-surface hover:border-line-strong")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <o.icon className="size-5" />
                      </span>
                      {mode === o.id && <CircleCheck className="size-5 text-primary" />}
                    </div>
                    <div className="mt-3 font-semibold">{o.title}</div>
                    <div className="mt-1 text-sm text-muted">{o.desc}</div>
                    <ul className="mt-3 space-y-1">
                      {o.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm text-fg-2">
                          <Check className="size-3.5 text-success" /> {p}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <Card className="mt-4 p-4 text-sm">
                <div className="mb-2 font-medium">Summary</div>
                <div className="grid gap-1 text-fg-2 sm:grid-cols-2">
                  <span>✓ Business profile from {url}</span>
                  <span>✓ {connected.length} channel{connected.length === 1 ? "" : "s"} connected</span>
                  <span>✓ {templates.find((t) => t.id === template)?.name} template</span>
                  <span>✓ {chosenGoals.length} goals, {chat.filter((c) => c.from === "user").length} test messages</span>
                </div>
              </Card>
            </section>
          )}
        </div>

        <footer className="sticky bottom-0 border-t border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step < steps.length - 1 && (
                <Button variant="ghost" onClick={() => setStep((s) => s + 1)} className="hidden sm:inline-flex">
                  Skip for now
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button variant="ai" onClick={finish}>
                  <Rocket /> Go live
                </Button>
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
