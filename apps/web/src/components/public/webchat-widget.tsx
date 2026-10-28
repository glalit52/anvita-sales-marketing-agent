"use client";

import { ArrowRight, CalendarCheck, Clock, Info, MapPin, MessageCircle, Minus, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Button, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { LIVE } from "@/lib/live/config";
import { liveWidget, type WidgetMessage } from "@/lib/live/widget";
import { business } from "@/lib/mock/public";
import { MockQr } from "./payment-methods";

/* ------------------------------------------------------------------ */
/* Script                                                              */
/* ------------------------------------------------------------------ */

type Card =
  | { type: "prices" }
  | { type: "booking"; service: string; provider: string; day: string; price: number; deposit: number; slots: string[]; picked?: string }
  | { type: "confirm"; summary: string }
  | { type: "hours" }
  | { type: "whatsapp" };

interface Msg {
  id: number;
  from: "ai" | "user" | "human" | "system";
  /** Display name for team replies (live mode). */
  name?: string;
  text?: string;
  card?: Card;
  time: string;
}

type Step = { delay: number; msg: Omit<Msg, "id" | "time"> } | { delay: number; typing: "ai" | "human" };

const QUICK_REPLIES = ["Book an appointment", "Teeth whitening price", "Clinic timings", "Talk to a person", "Continue on WhatsApp"];

const whiteningBooking: Card = {
  type: "booking",
  service: "Whitening consultation · 30 min",
  provider: "Dr. Aditi Kulkarni · Koregaon Park",
  day: "Sat, 31 Oct",
  price: 500,
  deposit: 500,
  slots: ["10:30 AM", "11:30 AM", "12:30 PM"],
};

function script(input: string): Step[] {
  const t = input.toLowerCase();
  if (/whatsapp/.test(t)) {
    return [
      { delay: 700, msg: { from: "ai", text: "Sure! Tap below to continue on WhatsApp. This chat moves with you, so you won't need to repeat anything." } },
      { delay: 300, msg: { from: "ai", card: { type: "whatsapp" } } },
    ];
  }
  if (/(person|human|agent|call me|someone|staff|real)/.test(t)) {
    return [
      { delay: 800, msg: { from: "ai", text: "Of course. I've passed our chat to Arjun at the front desk with a quick summary so you don't have to repeat yourself." } },
      { delay: 900, msg: { from: "system", text: "Arjun Patil (front desk) joined the chat" } },
      { delay: 400, typing: "human" },
      { delay: 1800, msg: { from: "human", text: "Hi! Arjun here 👋 I have your chat in front of me. Would you like me to call you, or shall we sort it out here?" } },
    ];
  }
  if (/(pain|bleed|swell|swollen|broken|toothache|medicine|antibiotic|emergency)/.test(t)) {
    return [
      {
        delay: 1100,
        msg: {
          from: "ai",
          text: "I'm sorry you're in discomfort. I can't give medical advice over chat, but a dentist can see you today. If the swelling is spreading or you have a fever, please call us right away on " + business.phone + ".",
        },
      },
      {
        delay: 500,
        msg: {
          from: "ai",
          card: { type: "booking", service: "Emergency visit · 30 min", provider: "Dr. Aditi Kulkarni · Baner", day: "Today, 27 Oct", price: 1000, deposit: 300, slots: ["4:30 PM", "5:00 PM", "6:30 PM"] },
        },
      },
    ];
  }
  if (/(kitna|kitne|kya|hai|chahiye|daant)/.test(t)) {
    return [
      { delay: 1100, msg: { from: "ai", text: "Ji bilkul! Laser whitening ₹12,000 mein hoti hai (60 min, 8 shades tak brighter). Pehle ₹500 ka consultation hota hai jo final bill mein adjust ho jaata hai. Saturday ka slot dekhu?" } },
      { delay: 400, msg: { from: "ai", card: whiteningBooking } },
    ];
  }
  if (/(whiten|price|cost|how much|charges|fee|rate)/.test(t)) {
    return [
      { delay: 1100, msg: { from: "ai", text: "Yes, we do! Here's our whitening pricing. Most patients start with a consultation so Dr. Kulkarni can check the shade and sensitivity first." } },
      { delay: 300, msg: { from: "ai", card: { type: "prices" } } },
      { delay: 700, msg: { from: "ai", text: "Want me to book a consultation? Saturday mornings are popular, and there are 3 slots left this week." } },
    ];
  }
  if (/(time|timing|hour|open|close|sunday|when)/.test(t)) {
    return [{ delay: 900, msg: { from: "ai", text: "Here are our hours for both clinics:", card: { type: "hours" } } }];
  }
  if (/(where|address|location|parking|direction|baner|koregaon)/.test(t)) {
    return [
      {
        delay: 900,
        msg: {
          from: "ai",
          text: `We have two clinics:\n\n📍 Koregaon Park: ${business.locations[0].landmark}. ${business.locations[0].parking}.\n📍 Baner: ${business.locations[1].landmark}. ${business.locations[1].parking}.\n\nWhich one is closer for you?`,
        },
      },
    ];
  }
  if (/(book|appointment|slot|saturday|consult|yes|ok|sure|available)/.test(t)) {
    return [
      { delay: 1000, msg: { from: "ai", text: "Here are the next openings for a whitening consultation with Dr. Kulkarni. Tap a time to hold it:" } },
      { delay: 300, msg: { from: "ai", card: whiteningBooking } },
    ];
  }
  if (/(thank|thanks|great|perfect)/.test(t)) {
    return [{ delay: 700, msg: { from: "ai", text: "You're welcome! 😊 Anything else I can help with?" } }];
  }
  return [
    {
      delay: 1200,
      msg: {
        from: "ai",
        text: "Good question. I don't want to guess on that, so I've noted it for our team and someone will reply here (or on WhatsApp) within 30 minutes. Meanwhile, can I help you book a visit?",
      },
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Widget                                                              */
/* ------------------------------------------------------------------ */

function stamp(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

const GREETING = "Hi there 👋 I'm Anvi, Smile Dental's assistant. Looking for a whitening quote or a slot this week? I can book you in under a minute.";

export function WebchatWidget({
  open: openProp,
  onOpenChange,
  launcher = true,
  greetingDelay = 2500,
  bookingHref = `/book/${business.slug}`,
  orgSlug = process.env.NEXT_PUBLIC_WIDGET_ORG_SLUG || business.slug,
}: {
  /** Workspace the chat belongs to (live mode). */
  orgSlug?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** show the floating bubble (hide it when the page has its own "Chat with us" button) */
  launcher?: boolean;
  /** ms before the proactive greeting pops up; 0 disables it */
  greetingDelay?: number;
  bookingHref?: string;
}) {
  const toast = useToast();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = useCallback(
    (v: boolean) => {
      setOpenState(v);
      onOpenChange?.(v);
    },
    [onOpenChange],
  );

  const [greeting, setGreeting] = useState(false);
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([{ id: 1, from: "ai", text: GREETING, time: LIVE ? "Just now" : "11:20 AM" }]);
  const [typing, setTyping] = useState<null | "ai" | "human">(null);
  const [draft, setDraft] = useState("");
  const [usedChips, setUsedChips] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(2);
  const clock = useRef(11 * 60 + 20);
  const timers = useRef<number[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!launcher || !greetingDelay) return;
    const t = window.setTimeout(() => {
      setGreeting(true);
      setUnread(1);
    }, greetingDelay);
    return () => window.clearTimeout(t);
  }, [launcher, greetingDelay]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const push = useCallback((m: Omit<Msg, "id" | "time">) => {
    const id = nextId.current++;
    const time = LIVE ? new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : stamp(clock.current);
    setMessages((prev) => [...prev, { ...m, id, time }]);
  }, []);

  const run = useCallback(
    (steps: Step[]) => {
      let at = 0;
      setTyping("ai");
      setBusy(true);
      steps.forEach((s, i) => {
        at += s.delay;
        const t = window.setTimeout(() => {
          if ("typing" in s) setTyping(s.typing);
          else {
            push(s.msg);
            setTyping(i < steps.length - 1 ? (s.msg.from === "system" ? null : (s.msg.from as "ai" | "human")) : null);
          }
          if (i === steps.length - 1) setBusy(false);
        }, at);
        timers.current.push(t);
      });
    },
    [push],
  );

  // Live mode: messages go to the workspace inbox; replies (AI or team) are polled while the panel is open.
  const seen = useRef(new Set<string>());
  const pending = useRef<string[]>([]); // sent this session, shown before the server echoes them back
  const waitingSince = useRef<number | null>(null);
  const showLive = useCallback(
    (list: WidgetMessage[]) => {
      for (const m of list) {
        if (seen.current.has(m.id)) continue;
        seen.current.add(m.id);
        if (m.author === "visitor") {
          const i = pending.current.indexOf(m.body);
          if (i >= 0) pending.current.splice(i, 1);
          else push({ from: "user", text: m.body }); // earlier messages, e.g. after a page reload
          continue;
        }
        push({ from: m.author, name: m.authorName ?? undefined, text: m.body });
        if (m.author !== "system") {
          waitingSince.current = null;
          setTyping(null);
        }
      }
    },
    [push],
  );
  useEffect(() => {
    if (!LIVE || !open) return;
    const chat = liveWidget(orgSlug);
    let stopped = false;
    const tick = () => {
      if (!chat.hasSession()) return;
      chat.poll().then((list) => !stopped && showLive(list), () => {});
      if (waitingSince.current && Date.now() - waitingSince.current > 90_000) setTyping(null);
    };
    tick();
    const t = window.setInterval(tick, 2500);
    return () => {
      stopped = true;
      window.clearInterval(t);
    };
  }, [open, orgSlug, showLive]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    clock.current += 1;
    push({ from: "user", text: value });
    setDraft("");
    if (!LIVE) {
      run(script(value));
      return;
    }
    setTyping("ai");
    waitingSince.current = Date.now();
    pending.current.push(value);
    liveWidget(orgSlug)
      .send(value)
      .then((m) => seen.current.add(m.id))
      .catch(() => {
        setTyping(null);
        push({ from: "system", text: "Message not delivered. Check your connection and try again." });
      });
  };

  const openPanel = () => {
    setOpen(true);
    setGreeting(false);
    setUnread(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const pickSlot = (msgId: number, slot: string) => {
    const found = messages.find((m) => m.id === msgId)?.card;
    if (!found || found.type !== "booking" || busy) return;
    setMessages((prev) => prev.map((m) => (m.id === msgId && m.card?.type === "booking" ? { ...m, card: { ...m.card, picked: slot } } : m)));
    clock.current += 1;
    push({ from: "user", text: `${found.day}, ${slot}` });
    run([
      {
        delay: 1100,
        msg: {
          from: "ai",
          text: `Done! I'm holding ${found.day} at ${slot} for you for 10 minutes. ${found.deposit ? `Add your name and pay the ${formatCurrency(found.deposit)} refundable deposit to confirm.` : "Add your name to confirm."}`,
          card: { type: "confirm", summary: `${found.service.split(" · ")[0]} · ${found.day}, ${slot}` },
        },
      },
    ]);
  };

  const continueOnWhatsApp = () => {
    push({ from: "system", text: `Chat moved to WhatsApp · ${business.whatsapp}` });
    toast({ title: "Opening WhatsApp", description: "Your conversation continues with Smile Dental on WhatsApp.", tone: "info" });
  };

  const chips = QUICK_REPLIES.filter((c) => !usedChips.includes(c));

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={`Chat with ${business.name}`}
          className={cn(
            "animate-fade-in fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface sm:inset-auto sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[384px] sm:rounded-2xl sm:border sm:border-line sm:shadow-pop",
            launcher ? "sm:bottom-24" : "sm:bottom-6",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-ai px-4 py-3 text-white">
            <span className="relative">
              <span className="flex size-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                <Sparkles className="size-5" aria-hidden />
              </span>
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-success" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">Anvi · {business.name}</div>
              <div className="flex items-center gap-1 text-xs text-white/85">
                <span className="size-1.5 rounded-full bg-white" aria-hidden />
                Online · Typically replies instantly
              </div>
            </div>
            <button
              onClick={() => send("Continue on WhatsApp")}
              className="rounded-lg p-2 text-white/90 hover:bg-white/15 hover:text-white"
              aria-label="Continue on WhatsApp"
              title="Continue on WhatsApp"
            >
              <MessageCircle className="size-4" />
            </button>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/90 hover:bg-white/15 hover:text-white" aria-label="Minimise chat">
              <Minus className="hidden size-4 sm:block" />
              <X className="size-5 sm:hidden" />
            </button>
          </div>

          {/* Messages */}
          <div ref={bodyRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-bg px-3 py-4" aria-live="polite">
            <div className="mx-auto flex max-w-[300px] items-start gap-1.5 rounded-lg bg-surface-2 px-2.5 py-2 text-[11px] leading-snug text-muted">
              <ShieldCheck className="mt-px size-3.5 shrink-0 text-success" aria-hidden />
              <span>
                You&apos;re chatting with Anvi, an AI assistant. A team member may join. Chats are stored to help serve you, per our{" "}
                <a href="#privacy" className="underline hover:text-fg">
                  privacy policy
                </a>
                .
              </span>
            </div>
            <div className="text-center text-[11px] font-medium text-muted">Today</div>
            {messages.map((m) => (
              <MessageRow key={m.id} m={m} onPick={pickSlot} bookingHref={bookingHref} onWhatsApp={continueOnWhatsApp} />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                {typing === "human" ? <Avatar name="Arjun Patil" size="xs" /> : <Avatar name="Anvi" ai size="xs" />}
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2.5" aria-label="Typing">
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {chips.length > 0 && (
            <div className="scroll-thin flex gap-1.5 overflow-x-auto border-t border-line bg-surface px-3 pt-2.5 pb-1">
              {chips.map((c) => (
                <button
                  key={c}
                  disabled={busy}
                  onClick={() => {
                    setUsedChips((u) => [...u, c]);
                    send(c);
                  }}
                  className="shrink-0 rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            className="flex items-center gap-2 bg-surface px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message… (English / हिंदी)"
              aria-label="Message"
              className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 text-base text-fg placeholder:text-muted focus:border-primary focus:outline-none sm:text-sm"
            />
            <Button type="submit" size="icon" className="size-11 rounded-full" disabled={!draft.trim() || busy} aria-label="Send message">
              <Send />
            </Button>
          </form>
          <div className="bg-surface pb-2 text-center text-[10px] text-muted">
            Powered by <span className="font-semibold text-fg-2">Anvita</span> · AI replies can make mistakes
          </div>
        </div>
      )}

      {/* Proactive greeting */}
      {launcher && greeting && !open && (
        <div className="animate-fade-in fixed right-4 bottom-24 z-40 w-[min(300px,calc(100vw-2rem))] sm:right-6">
          <div className="relative rounded-2xl border border-line bg-surface p-3.5 pr-8 shadow-pop">
            <button
              onClick={() => setGreeting(false)}
              className="absolute top-2 right-2 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Dismiss message"
            >
              <X className="size-3.5" />
            </button>
            <button onClick={openPanel} className="flex items-start gap-2.5 text-left">
              <Avatar name="Anvi" ai size="sm" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-fg">Anvi from {business.name}</span>
                <span className="mt-0.5 block text-sm text-fg-2">Hi 👋 Looking for a whitening quote or a slot this week? I can book you in under a minute.</span>
              </span>
            </button>
            <div className="mt-2.5 flex flex-wrap gap-1.5 pl-10">
              {["Book a visit", "Whitening price"].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    openPanel();
                    send(c);
                  }}
                  className="rounded-full border border-primary/30 bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary hover:border-primary"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Launcher */}
      {launcher && (
        <button
          onClick={() => (open ? setOpen(false) : openPanel())}
          aria-label={open ? "Close chat" : unread ? `Open chat, ${unread} unread message` : "Open chat"}
          className={cn(
            "fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-ai text-white shadow-pop transition-transform hover:scale-105 sm:right-6 sm:bottom-6",
            open && "hidden sm:flex",
          )}
        >
          {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
          {unread > 0 && !open && (
            <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-surface bg-danger text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </button>
      )}
    </>
  );
}

function MessageRow({
  m,
  onPick,
  bookingHref,
  onWhatsApp,
}: {
  m: Msg;
  onPick: (id: number, slot: string) => void;
  bookingHref: string;
  onWhatsApp: () => void;
}) {
  if (m.from === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-muted">{m.text}</span>
      </div>
    );
  }
  if (m.from === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-fg">{m.text}</div>
          <div className="mt-0.5 text-right text-[10px] text-muted">{m.time} · Seen</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2">
      {m.from === "human" ? <Avatar name={m.name ?? "Arjun Patil"} size="xs" /> : <Avatar name="Anvi" ai size="xs" />}
      <div className="max-w-[85%] min-w-0 space-y-1.5">
        {m.text && (
          <div className="rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2 text-sm break-words whitespace-pre-line text-fg">
            {m.text.split(/(https?:\/\/\S+)/g).map((part, i) =>
              /^https?:\/\//.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noreferrer" className="text-primary underline">
                  {part}
                </a>
              ) : (
                part
              ),
            )}
          </div>
        )}
        {m.card && <ChatCard card={m.card} onPick={(slot) => onPick(m.id, slot)} bookingHref={bookingHref} onWhatsApp={onWhatsApp} />}
        <div className="text-[10px] text-muted">
          {m.from === "human" ? (m.name ? `${m.name.split(" ")[0]} · Team` : "Arjun · Front desk") : "Anvi · AI"} · {m.time}
        </div>
      </div>
    </div>
  );
}

function ChatCard({ card, onPick, bookingHref, onWhatsApp }: { card: Card; onPick: (slot: string) => void; bookingHref: string; onWhatsApp: () => void }) {
  if (card.type === "prices") {
    const rows = [
      ["Whitening consultation", "₹500", "Adjusted in treatment"],
      ["Laser whitening (in-clinic)", "₹12,000", "60 min · up to 8 shades"],
      ["Take-home kit", "₹8,000", "Custom trays + gel"],
    ];
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-3 py-2 text-xs font-semibold text-fg">Teeth whitening · Smile Dental</div>
        {rows.map(([name, price, note]) => (
          <div key={name} className="flex items-start justify-between gap-3 border-b border-line px-3 py-2 last:border-0">
            <div className="min-w-0">
              <div className="text-sm text-fg">{name}</div>
              <div className="text-[11px] text-muted">{note}</div>
            </div>
            <div className="text-sm font-semibold text-fg tabular">{price}</div>
          </div>
        ))}
        <div className="bg-surface-2 px-3 py-1.5 text-[11px] text-muted">0% EMI on Bajaj Finserv · prices incl. taxes</div>
      </div>
    );
  }
  if (card.type === "booking") {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-start gap-2.5 px-3 pt-3 pb-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <CalendarCheck className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-fg">{card.service}</div>
            <div className="text-xs text-muted">{card.provider}</div>
          </div>
        </div>
        <div className="px-3 pb-1 text-xs font-medium text-fg-2">{card.day}</div>
        <div className="flex flex-wrap gap-1.5 px-3 pb-3">
          {card.slots.map((s) => (
            <button
              key={s}
              disabled={Boolean(card.picked)}
              onClick={() => onPick(s)}
              aria-pressed={card.picked === s}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular transition-colors",
                card.picked === s ? "border-primary bg-primary text-primary-fg" : "border-line text-fg hover:border-primary hover:text-primary disabled:opacity-40",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2 px-3 py-2 text-[11px] text-muted">
          <span>
            {formatCurrency(card.price)}
            {card.deposit > 0 && ` · ${formatCurrency(card.deposit)} deposit`}
          </span>
          <Link href={bookingHref} className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
            More times <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }
  if (card.type === "confirm") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary-soft/60 p-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Clock className="size-3.5" aria-hidden /> Held for 10 minutes
        </div>
        <div className="mt-1 text-sm font-medium text-fg">{card.summary}</div>
        <Link
          href={bookingHref}
          className="mt-2.5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg hover:bg-primary-hover"
        >
          Confirm booking <ArrowRight className="size-4" aria-hidden />
        </Link>
        <div className="mt-1.5 text-center text-[11px] text-muted">Opens {business.bookingUrl}</div>
      </div>
    );
  }
  if (card.type === "hours") {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {business.locations.map((l) => (
          <div key={l.id} className="border-b border-line px-3 py-2.5 last:border-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-fg">
              <MapPin className="size-3.5 text-muted" aria-hidden /> {l.name}
            </div>
            <div className="mt-0.5 text-xs text-fg-2">{l.hours}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-3">
        <div className="hidden rounded-lg border border-line bg-white p-1 sm:block">
          <MockQr seed="wa-smile" size={72} />
        </div>
        <div className="min-w-0 text-xs text-fg-2">
          <div className="text-sm font-semibold text-fg">WhatsApp · {business.whatsapp}</div>
          <span className="hidden sm:inline">Scan with your phone, or tap below.</span>
          <span className="sm:hidden">Opens WhatsApp with your chat history.</span>
        </div>
      </div>
      <Button className="mt-2.5 w-full bg-[#1fa855] text-white hover:bg-[#178a45]" onClick={onWhatsApp}>
        <MessageCircle /> Open WhatsApp
      </Button>
      <div className="mt-1.5 flex items-start gap-1 text-[10px] leading-snug text-muted">
        <Info className="mt-px size-3 shrink-0" aria-hidden />
        By continuing you agree to receive messages about this enquiry from {business.name} on WhatsApp. Reply STOP anytime.
      </div>
    </div>
  );
}
