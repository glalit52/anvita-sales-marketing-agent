"use client";

import {
  ArrowLeft,
  Bot,
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronDown,
  CircleCheck,
  Clock,
  FileText,
  Hand,
  IndianRupee,
  Info,
  Link2,
  ListFilter,
  MoreHorizontal,
  Paperclip,
  PanelRight,
  Search,
  Send,
  Smile,
  Sparkles,
  Star,
  StickyNote,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  AiCallout,
  Avatar,
  Badge,
  Button,
  ChannelIcon,
  Drawer,
  MetaRow,
  Segmented,
  Select,
  channelMeta,
  useToast,
  type Channel,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { contactById, conversations as seed, memberById, stageMeta, team, type Conversation, type Message } from "@/lib/mock/core";

type View = "all" | "mine" | "ai" | "escalated";
type StatusFilter = "open" | "pending" | "closed";

const savedReplies = [
  { title: "Clinic address", body: "Koregaon Park: Lane 6, North Main Road, Pune 411001. Here's the map: https://maps.app.goo.gl/smile-kp" },
  { title: "Insurance", body: "We're cashless with Star Health, HDFC ERGO and ICICI Lombard. Please bring your policy card." },
  { title: "Post-op care", body: "Avoid hot food for 24 hours, take the prescribed painkiller after meals, and rinse gently with salt water from tomorrow." },
];

const aiSuggestions: Record<string, string> = {
  v2: "I completely understand, Rohit, and I'm sorry for the trouble. Dr. Kulkarni can see you today at 4:30 PM at Koregaon Park to fix this permanently, at no charge. Shall I confirm it?",
  v4: "Yes, Karan! We offer 0% EMI for 6 months through Bajaj Finserv, so a ₹48,000 implant would be ₹8,000/month. Would you like to book a free implant consultation this week?",
  v7: "Absolutely, Rahul! Here are a few Thursday slots: 2:00, 3:30 or 4:30 PM IST. Pick one and I'll send a calendar invite with a Google Meet link.",
};

function MessageBubble({ m, contactName }: { m: Message; contactName: string }) {
  if (m.author === "system") {
    return (
      <div className="flex flex-col items-center gap-2 py-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-[11px] text-muted">
          <Info className="size-3" /> {m.body} · {m.time}
        </span>
        {m.card && <RichCard card={m.card} />}
      </div>
    );
  }
  const outbound = m.author !== "contact";
  if (m.note) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl border border-dashed border-warning/40 bg-warning-soft px-3.5 py-2.5 text-sm sm:max-w-[70%]">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-warning">
            {m.author === "ai" ? <Sparkles className="size-3" /> : <StickyNote className="size-3" />}
            {m.author === "ai" ? "AI draft (not sent)" : `Internal note · ${m.authorName}`}
          </div>
          <p className="whitespace-pre-wrap text-fg">{m.body.replace(/^Draft \(Copilot\): /, "")}</p>
          <div className="mt-1 text-right text-[10px] text-muted">{m.time}</div>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("flex items-end gap-2", outbound && "flex-row-reverse")}>
      {outbound ? (
        <Avatar name={m.authorName ?? "Anvi"} ai={m.author === "ai"} size="xs" />
      ) : (
        <Avatar name={contactName} size="xs" />
      )}
      <div className={cn("flex max-w-[85%] flex-col gap-1.5 sm:max-w-[70%]", outbound && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm shadow-card",
            outbound
              ? m.author === "ai"
                ? "rounded-br-md bg-primary text-primary-fg"
                : "rounded-br-md bg-fg text-bg"
              : "rounded-bl-md border border-line bg-surface text-fg",
          )}
        >
          <p className="whitespace-pre-wrap">{m.body}</p>
        </div>
        {m.card && <RichCard card={m.card} />}
        <div className="flex flex-wrap items-center gap-1.5 px-1 text-[10px] text-muted">
          {m.author === "ai" && (
            <span className="inline-flex items-center gap-1 font-medium text-ai">
              <Sparkles className="size-3" /> Anvi (AI)
            </span>
          )}
          {m.author === "human" && <span className="font-medium">{m.authorName}</span>}
          <span>{m.time}</span>
          {outbound && <CheckCheck className="size-3 text-info" aria-label="Read" />}
        </div>
        {m.sources && (
          <div className="flex flex-wrap gap-1 px-1">
            {m.sources.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] text-muted">
                <FileText className="size-2.5" /> {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RichCard({ card }: { card: NonNullable<Message["card"]> }) {
  const Icon = { booking: CalendarPlus, payment: IndianRupee, review: Star }[card.type];
  return (
    <div className="flex w-72 max-w-full items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left shadow-card">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm leading-snug font-medium text-fg">{card.title}</div>
        <div className="truncate text-xs text-muted">{card.subtitle}</div>
      </div>
      {card.status && (
        <Badge tone="success">
          <Check /> {card.status}
        </Badge>
      )}
    </div>
  );
}

function ContactPanel({ convo, onAssign }: { convo: Conversation; onAssign: (assignee: string) => void }) {
  const contact = contactById(convo.contactId)!;
  const stage = stageMeta[contact.stage];
  const toast = useToast();
  const sentimentTone = { positive: "success", neutral: "neutral", negative: "danger" } as const;
  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-col items-center text-center">
        <Avatar name={contact.name} size="lg" />
        <div className="mt-2 font-semibold">{contact.name}</div>
        <div className="text-xs text-muted">
          {contact.company ? `${contact.company} · ` : ""}
          {contact.city}
        </div>
        <div className="mt-2 flex gap-1.5">
          <Badge tone={stage.tone}>{stage.label}</Badge>
          <Badge tone="neutral">Score {contact.score}</Badge>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="xs" variant="outline" onClick={() => toast({ title: "Booking link sent", description: `Sent to ${contact.name} on ${channelMeta[convo.channel].label}` })}>
            <CalendarPlus /> Book
          </Button>
          <Button size="xs" variant="outline" onClick={() => toast({ title: "Pay link created", description: "₹500 deposit link added to composer" })}>
            <IndianRupee /> Pay link
          </Button>
        </div>
      </div>

      <AiCallout title="AI summary">{convo.aiSummary}</AiCallout>

      <div>
        <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Conversation</div>
        <div className="mb-2">
          <Select aria-label="Assignee" value={convo.assignee} onChange={(e) => onAssign(e.target.value)} className="h-8 text-xs">
            <option value="ai">Assigned to Anvi (AI)</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                Assigned to {m.name}
              </option>
            ))}
          </Select>
        </div>
        <MetaRow label="Intent">{convo.intent}</MetaRow>
        <MetaRow label="Sentiment">
          <Badge tone={sentimentTone[convo.sentiment]} dot>
            {convo.sentiment}
          </Badge>
        </MetaRow>
        <MetaRow label="Channel">{channelMeta[convo.channel].label}</MetaRow>
        <MetaRow label="Language">{contact.language}</MetaRow>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Contact</div>
        <MetaRow label="Phone">{contact.phone}</MetaRow>
        {contact.email && <MetaRow label="Email"><span className="break-all">{contact.email}</span></MetaRow>}
        <MetaRow label="Source">{contact.source}</MetaRow>
        <MetaRow label="Deal value">{formatCurrency(contact.value)}</MetaRow>
        <MetaRow label="Owner">{contact.ownerId === "ai" ? "Anvi (AI)" : memberById(contact.ownerId)?.name}</MetaRow>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Tags</div>
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          <button className="rounded-full border border-dashed border-line-strong px-2 text-[11px] text-muted hover:text-fg">+ Add</button>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Consent</div>
        <div className="space-y-1.5 text-sm">
          {["WhatsApp: service & marketing", "SMS: service only", "Email: marketing"].map((c, i) => (
            <div key={c} className="flex items-center gap-2">
              {i < 2 ? <CircleCheck className="size-4 text-success" /> : <Clock className="size-4 text-muted" />}
              <span className={cn(i === 2 && "text-muted")}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InboxInner() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [items, setItems] = useState<Conversation[]>(seed);
  const [view, setView] = useState<View>("all");
  const [status, setStatus] = useState<StatusFilter>("open");
  const [channel, setChannel] = useState<Channel | "any">("any");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(params.get("c"));
  const [mobilePane, setMobilePane] = useState<"list" | "thread">(params.get("c") ? "thread" : "list");
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [draft, setDraft] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const filtered = useMemo(
    () =>
      items.filter((c) => {
        const contact = contactById(c.contactId)!;
        if (status !== c.status) return false;
        if (channel !== "any" && c.channel !== channel) return false;
        if (view === "mine" && c.assignee !== "u1") return false;
        if (view === "ai" && c.assignee !== "ai") return false;
        if (view === "escalated" && !c.escalated) return false;
        if (query && !(contact.name + c.preview).toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [items, status, channel, view, query],
  );

  const active = items.find((c) => c.id === activeId) ?? filtered[0] ?? null;
  const contact = active ? contactById(active.contactId)! : null;
  const aiActive = active?.assignee === "ai";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages.length, typing, active?.id]);

  const counts = {
    all: items.filter((c) => c.status === status).length,
    mine: items.filter((c) => c.status === status && c.assignee === "u1").length,
    ai: items.filter((c) => c.status === status && c.assignee === "ai").length,
    escalated: items.filter((c) => c.status === status && c.escalated).length,
  };

  const update = (id: string, patch: Partial<Conversation> | ((c: Conversation) => Partial<Conversation>)) =>
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...(typeof patch === "function" ? patch(c) : patch) } : c)));

  const open = (id: string) => {
    setActiveId(id);
    setMobilePane("thread");
    setDraft("");
    update(id, { unread: 0 });
    router.replace(`/inbox?c=${id}`, { scroll: false });
  };

  const now = () => new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

  const send = () => {
    if (!active || !draft.trim()) return;
    const msg: Message = { id: crypto.randomUUID(), author: "human", authorName: "Priya Sharma", body: draft.trim(), time: now(), note: mode === "note" };
    update(active.id, (c) => ({
      messages: [...c.messages, msg],
      preview: mode === "note" ? c.preview : draft.trim(),
      time: "now",
      // A human reply pauses the AI on this thread (human-in-control guardrail).
      assignee: mode === "reply" && c.assignee === "ai" ? "u1" : c.assignee,
    }));
    if (mode === "reply" && active.assignee === "ai") toast({ title: "AI paused on this conversation", description: "You replied, so Anvi will stay quiet until you hand it back.", tone: "info" });
    setDraft("");
    if (mode === "reply" && active.id === "v4") {
      setTyping(true);
      timers.current.push(
        setTimeout(() => {
          setTyping(false);
          update(active.id, (c) => ({ messages: [...c.messages, { id: crypto.randomUUID(), author: "contact", body: "Great, can I come Thursday evening?", time: now() }], preview: "Great, can I come Thursday evening?" }));
        }, 2200),
      );
    }
  };

  const suggest = () => {
    if (!active) return;
    const text = aiSuggestions[active.id] ?? "Thanks for reaching out! Let me check that for you and get back in a moment.";
    setSuggesting(true);
    setMode("reply");
    setDraft("");
    let i = 0;
    const tick = () => {
      i += 3;
      setDraft(text.slice(0, i));
      if (i < text.length) timers.current.push(setTimeout(tick, 18));
      else setSuggesting(false);
    };
    timers.current.push(setTimeout(tick, 350));
  };

  const toggleAi = () => {
    if (!active) return;
    if (aiActive) {
      update(active.id, { assignee: "u1" });
      toast({ title: "You took over", description: "Anvi is paused on this conversation.", tone: "info" });
    } else {
      update(active.id, { assignee: "ai", escalated: undefined });
      toast({ title: "Handed back to AI", description: "Anvi will continue from here using the conversation context." });
    }
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0">
      {/* Conversation list */}
      <section className={cn("flex w-full min-w-0 flex-col border-r border-line bg-surface md:w-[340px] md:shrink-0", mobilePane === "thread" && "hidden md:flex")}>
        <div className="space-y-3 border-b border-line p-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Inbox</h1>
            <Segmented
              size="xs"
              value={status}
              onChange={setStatus}
              items={[
                { value: "open", label: "Open" },
                { value: "pending", label: "Pending" },
                { value: "closed", label: "Closed" },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="h-8 w-full rounded-lg border border-line bg-surface-2 pr-2 pl-8 text-sm outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
            <div className="relative">
              <ListFilter className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted" />
              <select
                aria-label="Channel filter"
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel | "any")}
                className="h-8 w-[104px] cursor-pointer appearance-none rounded-lg border border-line bg-surface-2 pr-2 pl-7 text-xs outline-none"
              >
                <option value="any">All</option>
                {(Object.keys(channelMeta) as Channel[]).map((c) => (
                  <option key={c} value={c}>
                    {channelMeta[c].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="scroll-thin -mx-1 flex gap-1 overflow-x-auto px-1">
            {(
              [
                ["all", "All", counts.all],
                ["ai", "AI handling", counts.ai],
                ["escalated", "Escalated", counts.escalated],
                ["mine", "Mine", counts.mine],
              ] as [View, string, number][]
            ).map(([v, label, n]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                  view === v ? "border-primary bg-primary-soft text-primary" : "border-line text-fg-2 hover:bg-surface-2",
                )}
              >
                {v === "ai" && <Sparkles className="size-3" />}
                {v === "escalated" && <TriangleAlert className="size-3" />}
                {label}
                <span className="text-muted">{n}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="scroll-thin flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const ct = contactById(c.contactId)!;
            const isActive = active?.id === c.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => open(c.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-line px-3 py-3 text-left transition-colors",
                    isActive ? "bg-primary-soft/60" : "hover:bg-surface-2",
                  )}
                >
                  <span className="relative">
                    <Avatar name={ct.name} size="md" />
                    <ChannelIcon channel={c.channel} size="xs" className="absolute -right-1 -bottom-1 ring-2 ring-surface" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("truncate text-sm", c.unread ? "font-semibold" : "font-medium")}>{ct.name}</span>
                      <span className="ml-auto shrink-0 text-[11px] text-muted">{c.time}</span>
                    </span>
                    <span className={cn("mt-0.5 block truncate text-xs", c.unread ? "text-fg" : "text-muted")}>{c.preview}</span>
                    <span className="mt-1.5 flex items-center gap-1.5">
                      {c.assignee === "ai" ? (
                        <Badge tone="ai">
                          <Sparkles /> AI
                        </Badge>
                      ) : (
                        <Badge tone="neutral">{memberById(c.assignee)?.name.split(" ")[0]}</Badge>
                      )}
                      {c.escalated && (
                        <Badge tone="danger">
                          <TriangleAlert /> Escalated
                        </Badge>
                      )}
                      <span className="truncate text-[11px] text-muted">{c.intent}</span>
                      {c.unread > 0 && (
                        <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-fg">
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-6 py-16 text-center text-sm text-muted">
              <CircleCheck className="mx-auto mb-2 size-8 text-success" />
              Inbox zero. Nothing matches these filters.
            </li>
          )}
        </ul>
      </section>

      {/* Thread */}
      {active && contact ? (
        <section className={cn("flex min-w-0 flex-1 flex-col bg-bg", mobilePane === "list" && "hidden md:flex")}>
          <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2.5 sm:px-4">
            <button onClick={() => setMobilePane("list")} className="rounded-lg p-1.5 text-muted hover:bg-surface-2 md:hidden" aria-label="Back to list">
              <ArrowLeft className="size-5" />
            </button>
            <Avatar name={contact.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{contact.name}</span>
                <ChannelIcon channel={active.channel} size="xs" />
              </div>
              <div className="truncate text-xs text-muted">
                {contact.phone} · {channelMeta[active.channel].label}
              </div>
            </div>
            <div className="hidden items-center gap-2 2xl:flex">
              <Select
                aria-label="Assignee"
                value={active.assignee}
                onChange={(e) => update(active.id, { assignee: e.target.value })}
                className="h-8 w-40 text-xs"
              >
                <option value="ai">Anvi (AI)</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button size="sm" variant={aiActive ? "outline" : "ai"} onClick={toggleAi}>
              {aiActive ? <Hand /> : <Bot />}
              <span className="hidden sm:inline">{aiActive ? "Take over" : "Hand to AI"}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                update(active.id, { status: active.status === "closed" ? "open" : "closed" });
                toast({ title: active.status === "closed" ? "Conversation reopened" : "Conversation closed" });
              }}
            >
              <Check /> <span className="hidden lg:inline">{active.status === "closed" ? "Reopen" : "Close"}</span>
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Contact details" onClick={() => setPanelOpen(true)} className="xl:hidden">
              <PanelRight />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="More actions" className="hidden 2xl:inline-flex">
              <MoreHorizontal />
            </Button>
          </header>

          {active.escalated && (
            <div className="flex items-center gap-2 border-b border-danger/20 bg-danger-soft px-4 py-2 text-sm text-danger">
              <TriangleAlert className="size-4 shrink-0" />
              <span className="flex-1">
                <b>Escalated by AI:</b> {active.escalated.reason}
              </span>
              <button className="text-xs font-medium underline" onClick={() => update(active.id, { escalated: undefined })}>
                Resolve
              </button>
            </div>
          )}

          <div className="scroll-thin flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-6">
            <div className="text-center text-[11px] font-medium text-muted">Today</div>
            {active.messages.map((m) => (
              <MessageBubble key={m.id} m={m} contactName={contact.name} />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <Avatar name={contact.name} size="xs" />
                <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-line bg-surface p-3 sm:px-4">
            {aiActive && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-ai-soft px-3 py-2 text-xs text-ai">
                <Sparkles className="size-3.5 shrink-0" />
                <span className="flex-1">Anvi is handling this conversation on Autopilot. Replying will pause the AI.</span>
              </div>
            )}
            {active.channel === "whatsapp" && (
              <div className="mb-2 flex items-center gap-1.5 text-[11px] text-muted">
                <Clock className="size-3" /> WhatsApp service window open for 23h 14m. After that, only approved templates can be sent.
              </div>
            )}
            <div className={cn("rounded-xl border bg-surface transition-colors focus-within:border-primary", mode === "note" ? "border-warning/50 bg-warning-soft/40" : "border-line")}>
              <div className="flex items-center gap-1 border-b border-line px-2 pt-1.5">
                {(["reply", "note"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "-mb-px border-b-2 px-2.5 pb-1.5 text-xs font-medium",
                      mode === m ? (m === "note" ? "border-warning text-warning" : "border-primary text-fg") : "border-transparent text-muted hover:text-fg",
                    )}
                  >
                    {m === "reply" ? `Reply via ${channelMeta[active.channel].label}` : "Internal note"}
                  </button>
                ))}
                <button onClick={suggest} disabled={suggesting} className="ml-auto mb-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ai hover:bg-ai-soft disabled:opacity-60">
                  <Sparkles className="size-3.5" /> {suggesting ? "Writing…" : "AI suggest"}
                </button>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={3}
                placeholder={mode === "note" ? "Write a note for your team. Use @ to mention…" : "Type a message, or press AI suggest…"}
                className="block w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted"
              />
              <div className="relative flex items-center gap-0.5 px-2 pb-2">
                <Button size="icon-sm" variant="ghost" aria-label="Attach file">
                  <Paperclip />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Emoji">
                  <Smile />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Saved replies" onClick={() => setShowSaved((s) => !s)}>
                  <Zap />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Insert booking link" onClick={() => setDraft((d) => `${d}${d ? " " : ""}Book here: https://book.anvita.ai/smile-dental`)}>
                  <Link2 />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Insert payment link" onClick={() => setDraft((d) => `${d}${d ? " " : ""}Pay securely: https://pay.anvita.ai/r/8KD2`)}>
                  <IndianRupee />
                </Button>
                {showSaved && (
                  <div className="animate-fade-in absolute bottom-full left-2 z-10 mb-2 w-72 rounded-xl border border-line bg-surface p-1 shadow-pop">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-muted uppercase">Saved replies</div>
                    {savedReplies.map((r) => (
                      <button
                        key={r.title}
                        onClick={() => {
                          setDraft(r.body);
                          setShowSaved(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-surface-2"
                      >
                        <div className="text-sm font-medium">{r.title}</div>
                        <div className="truncate text-xs text-muted">{r.body}</div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <span className="hidden text-[11px] text-muted sm:inline">Enter to send · Shift+Enter for a new line</span>
                  <Button size="sm" onClick={send} disabled={!draft.trim()} variant={mode === "note" ? "secondary" : "primary"}>
                    <Send /> {mode === "note" ? "Add note" : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="hidden flex-1 items-center justify-center text-sm text-muted md:flex">Select a conversation</section>
      )}

      {/* Contact panel (desktop) */}
      {active && (
        <aside className="scroll-thin hidden w-[320px] shrink-0 overflow-y-auto border-l border-line bg-surface xl:block">
          <ContactPanel convo={active} onAssign={(a) => update(active.id, { assignee: a })} />
        </aside>
      )}
      {active && (
        <Drawer open={panelOpen} onClose={() => setPanelOpen(false)} title="Contact details" width="max-w-sm">
          <ContactPanel convo={active} onAssign={(a) => update(active.id, { assignee: a })} />
        </Drawer>
      )}
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center text-sm text-muted">
          <ChevronDown className="mr-2 size-4 animate-bounce" /> Loading inbox…
        </div>
      }
    >
      <InboxInner />
    </Suspense>
  );
}
