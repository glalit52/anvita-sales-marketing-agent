"use client";

import { BadgeCheck, CalendarCheck, Check, CheckCheck, Clock, IndianRupee, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Avatar, Badge, ChannelIcon } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Stylised, looping product demo for the hero: a WhatsApp enquiry that the AI
 * answers, books and collects a deposit for. Pure HTML/CSS + timers.
 */

type Beat =
  | { kind: "in"; text: string; time: string }
  | { kind: "typing" }
  | { kind: "ai"; text: ReactNode; time: string; cite?: string }
  | { kind: "slots" }
  | { kind: "booked" }
  | { kind: "paylink" }
  | { kind: "paid" };

const script: { beat: Beat; delay: number }[] = [
  { beat: { kind: "in", text: "Hi, do you do teeth whitening? Kitna cost hoga?", time: "11:02 PM" }, delay: 700 },
  { beat: { kind: "typing" }, delay: 900 },
  {
    beat: {
      kind: "ai",
      time: "11:02 PM",
      cite: "Price list 2026",
      text: (
        <>
          Hi Ananya! Haan, in-clinic whitening is <b>₹8,000–12,000</b> depending on shades. This month the consult is 10% off. Shall I book a free shade check?
        </>
      ),
    },
    delay: 1600,
  },
  { beat: { kind: "in", text: "Haan please, Saturday morning Koregaon Park?", time: "11:03 PM" }, delay: 1800 },
  { beat: { kind: "typing" }, delay: 800 },
  { beat: { kind: "slots" }, delay: 1300 },
  { beat: { kind: "in", text: "10 baje works", time: "11:03 PM" }, delay: 1900 },
  { beat: { kind: "typing" }, delay: 800 },
  { beat: { kind: "booked" }, delay: 1300 },
  { beat: { kind: "paylink" }, delay: 1300 },
  { beat: { kind: "paid" }, delay: 2200 },
];

const inbox = [
  { name: "Ananya Rao", preview: "10 baje works", channel: "whatsapp" as const, active: true },
  { name: "Sneha Iyer", preview: "Braces EMI options?", channel: "webchat" as const },
  { name: "Karan Desai", preview: "Implant consult kab?", channel: "instagram" as const },
  { name: "Fatima Shaikh", preview: "Missed call → texted", channel: "voice" as const },
  { name: "Imran Khan", preview: "Kids dentist Sunday?", channel: "webchat" as const },
];

export function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = step >= script.length;
    const wait = done ? 5200 : script[step].delay;
    const t = setTimeout(() => setStep(done ? 0 : step + 1), wait);
    return () => clearTimeout(t);
  }, [step]);

  // Typing beats only show while they are the latest beat.
  const beats = script
    .slice(0, step)
    .map((s, i) => ({ ...s.beat, i }))
    .filter((b, idx, arr) => b.kind !== "typing" || idx === arr.length - 1);

  const answered = step >= 3;
  const booked = step >= 9;
  const paid = step >= 11;

  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-ai/15 to-transparent blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-pop" role="img" aria-label="Animated demo: the Anvita AI answers a WhatsApp enquiry in Hinglish, books a Saturday slot and collects a ₹500 UPI deposit">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="ml-2 truncate text-xs font-medium text-muted">Anvita · Inbox · Smile Dental</span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
            <span className="relative flex size-2">
              <span className="site-ping absolute inset-0 rounded-full bg-success" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            AI on Autopilot
          </span>
        </div>

        <div className="flex">
          {/* conversation list */}
          <div className="hidden w-[38%] shrink-0 border-r border-line sm:block">
            {inbox.map((c) => (
              <div key={c.name} className={cn("flex items-center gap-2.5 border-b border-line px-3 py-2.5", c.active && "bg-primary-soft/60")}>
                <Avatar name={c.name} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    <span className="truncate">{c.name}</span>
                    <ChannelIcon channel={c.channel} size="xs" className="ml-auto" />
                  </div>
                  <div className="truncate text-[11px] text-muted">{c.active && step === 0 ? "…" : c.preview}</div>
                </div>
              </div>
            ))}
            <div className="p-3">
              <div className="rounded-lg border border-dashed border-line p-2.5 text-[11px] text-muted">
                <span className="font-semibold text-fg-2">Today</span> · 46 chats · 41 resolved by AI
              </div>
            </div>
          </div>

          {/* thread */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
              <Avatar name="Ananya Rao" size="xs" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">Ananya Rao</div>
                <div className="text-[10px] text-muted">via Google Ads · Click-to-WhatsApp</div>
              </div>
              <ChannelIcon channel="whatsapp" size="sm" className="ml-auto" />
            </div>

            <div className="relative flex h-[380px] flex-col justify-end gap-2 overflow-hidden bg-surface-2/60 px-3 py-3 sm:h-[400px]">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-surface-2 to-transparent" />
              {beats.map((b) => (
                <BeatView key={b.i} beat={b} />
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
              <div className="flex-1 truncate rounded-full bg-surface-2 px-3 py-1.5 text-[11px] text-muted">AI is handling this conversation…</div>
              <Badge tone="ai">
                <Sparkles /> Book appointment
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* floating outcome chips */}
      <FloatChip className="site-float -top-8 left-2 sm:-top-4 sm:-left-6" show={answered} icon={<Clock className="size-3.5" />} tone="primary">
        Replied in 38s · 11:02 PM
      </FloatChip>
      <FloatChip className="site-float-delay top-1/3 -right-1 sm:-right-8" show={booked} icon={<CalendarCheck className="size-3.5" />} tone="ai">
        Booked: Sat 10:00 AM
      </FloatChip>
      <FloatChip className="site-float -bottom-4 left-6 sm:left-10" show={paid} icon={<IndianRupee className="size-3.5" />} tone="success">
        ₹500 deposit collected
      </FloatChip>
    </div>
  );
}

function FloatChip({
  show,
  icon,
  children,
  className,
  tone,
}: {
  show: boolean;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  tone: "primary" | "ai" | "success";
}) {
  const toneCls = { primary: "bg-primary-soft text-primary", ai: "bg-ai-soft text-ai", success: "bg-success-soft text-success" }[tone];
  return (
    <div
      className={cn(
        "absolute z-20 transition-all duration-500",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pr-3 pl-1.5 text-xs font-semibold shadow-pop">
        <span className={cn("inline-flex size-6 items-center justify-center rounded-lg", toneCls)}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

function AiBubble({ children, time, cite }: { children: ReactNode; time?: string; cite?: string }) {
  return (
    <div className="site-pop flex max-w-[88%] items-end gap-1.5 self-end">
      <div className="rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[12.5px] leading-snug text-primary-fg shadow-card">
        {children}
        <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-primary-fg/75">
          {cite && <span className="mr-auto inline-flex items-center gap-1 rounded bg-white/15 px-1.5 py-px">Source: {cite}</span>}
          {time}
          <CheckCheck className="size-3" />
        </div>
      </div>
      <Avatar ai name="Anvi" size="xs" />
    </div>
  );
}

function BeatView({ beat }: { beat: Beat }) {
  switch (beat.kind) {
    case "in":
      return (
        <div className="site-pop max-w-[80%] self-start rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2 text-[12.5px] leading-snug shadow-card">
          {beat.text}
          <div className="mt-0.5 text-right text-[10px] text-muted">{beat.time}</div>
        </div>
      );
    case "typing":
      return (
        <div className="site-pop flex items-center gap-1.5 self-end">
          <div className="flex gap-1 rounded-2xl rounded-br-md bg-primary-soft px-3 py-2.5">
            <span className="typing-dot size-1.5 rounded-full bg-primary" />
            <span className="typing-dot size-1.5 rounded-full bg-primary" />
            <span className="typing-dot size-1.5 rounded-full bg-primary" />
          </div>
          <Avatar ai name="Anvi" size="xs" />
        </div>
      );
    case "ai":
      return (
        <AiBubble time={beat.time} cite={beat.cite}>
          {beat.text}
        </AiBubble>
      );
    case "slots":
      return (
        <AiBubble time="11:03 PM">
          Koregaon Park, Sat 1 Nov, open slots:
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["10:00 AM", "11:30 AM", "12:15 PM"].map((s, i) => (
              <span key={s} className={cn("rounded-full border px-2 py-0.5 text-[11px] font-medium", i === 0 ? "border-white bg-white text-primary" : "border-white/40")}>
                {s}
              </span>
            ))}
          </div>
        </AiBubble>
      );
    case "booked":
      return (
        <div className="site-pop w-[86%] self-end rounded-xl border border-line bg-surface p-2.5 shadow-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <BadgeCheck className="size-4" /> Appointment confirmed
          </div>
          <div className="mt-1.5 grid gap-0.5 text-[11.5px] text-fg-2">
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="size-3 text-muted" /> Sat 1 Nov · 10:00 AM · Shade check
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3 text-muted" /> Koregaon Park · Dr. Kavya Iyer
            </span>
          </div>
        </div>
      );
    case "paylink":
      return (
        <AiBubble time="11:03 PM">
          Done! To hold the slot, a refundable ₹500 deposit (adjusted in your bill):
          <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg bg-white/15 px-2 py-1.5 text-[11px]">
            <span className="font-medium">rzp.io/smile/ananya</span>
            <span className="rounded bg-white px-1.5 py-px font-semibold text-primary">Pay ₹500 UPI</span>
          </div>
        </AiBubble>
      );
    case "paid":
      return (
        <div className="site-pop mx-auto inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[11px] font-semibold text-success">
          <Check className="size-3.5" /> ₹500 received via UPI · reminder set for Fri 6 PM
        </div>
      );
  }
}
