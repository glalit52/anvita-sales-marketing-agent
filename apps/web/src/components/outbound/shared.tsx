"use client";

import { CircleAlert, CircleCheck, CircleHelp, Coins, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Badge, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { Verify } from "@/lib/mock/outbound";

/** Simulated token streaming: reveals `full` word by word via setInterval. */
export function useStreamText(speed = 35) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const start = useCallback(
    (full: string, onDone?: (value: string) => void) => {
      clear();
      const parts = full.split(/(\s+)/);
      let i = 0;
      setText("");
      setStreaming(true);
      timer.current = setInterval(() => {
        i += 2;
        setText(parts.slice(0, i).join(""));
        if (i >= parts.length) {
          clear();
          setStreaming(false);
          onDone?.(full);
        }
      }, speed);
    },
    [speed],
  );

  useEffect(() => clear, []);

  return { text, setText, streaming, start };
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} aria-hidden />;
}

export function CreditsMeter({ used, total }: { used: number; total: number }) {
  const left = total - used;
  const pct = (used / total) * 100;
  return (
    <div className="flex h-9 items-center gap-2.5 rounded-lg border border-line bg-surface px-3" title={`${formatNumber(used)} of ${formatNumber(total)} credits used this month`}>
      <Coins className="size-4 text-warning" aria-hidden />
      <div className="w-24 sm:w-28">
        <div className="flex items-baseline justify-between text-[11px] leading-3">
          <span className="font-semibold text-fg tabular">{formatNumber(left)}</span>
          <span className="text-muted">credits left</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
          <div className={cn("h-full rounded-full transition-all duration-500", pct > 85 ? "bg-danger" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/** Hover/focus tooltip rendered in a portal so it is never clipped by scroll containers. */
export function Tip({ content, children, className }: { content: ReactNode; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const above = r.bottom + 120 > window.innerHeight;
    const left = Math.min(Math.max(r.left + r.width / 2 - 128, 8), window.innerWidth - 264);
    setPos(above ? { left, bottom: window.innerHeight - r.top + 6 } : { left, top: r.bottom + 6 });
  };
  return (
    <span
      ref={ref}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={() => setPos(null)}
      onFocus={show}
      onBlur={() => setPos(null)}
      className={cn("inline-flex cursor-help rounded focus-visible:outline-2", className)}
    >
      {children}
      {pos &&
        createPortal(
          <span
            role="tooltip"
            className="animate-fade-in pointer-events-none fixed z-[70] w-64 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-fg-2 shadow-pop"
            style={pos}
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}

export const verifyMeta: Record<Verify, { label: string; tone: Tone; icon: typeof CircleCheck }> = {
  verified: { label: "Verified", tone: "success", icon: CircleCheck },
  risky: { label: "Risky", tone: "warning", icon: CircleAlert },
  not_found: { label: "Not found", tone: "neutral", icon: CircleHelp },
};

export function VerifyBadge({ status, source, kind }: { status: Verify; source: string; kind: "Email" | "Phone" }) {
  const meta = verifyMeta[status];
  const Icon = meta.icon;
  return (
    <Tip
      content={
        <>
          <div className="mb-1 font-semibold text-fg">
            {kind} · {meta.label}
          </div>
          <div>
            <span className="text-muted">Source: </span>
            {source}
          </div>
          <div className="mt-1 text-muted">
            {status === "verified" ? "Deliverability checked in the last 24h." : status === "risky" ? "Catch-all, role-based or unconfirmed; may bounce." : "Run Enrich to try more providers."}
          </div>
        </>
      }
    >
      <Badge tone={meta.tone}>
        <Icon /> {meta.label}
      </Badge>
    </Tip>
  );
}

export function FitScore({ value }: { value: number }) {
  const tone = value >= 85 ? "bg-success" : value >= 70 ? "bg-primary" : "bg-warning";
  const label = value >= 85 ? "Strong fit" : value >= 70 ? "Good fit" : "Weak fit";
  return (
    <div className="flex items-center gap-2" title={`${label}: ${value}/100`}>
      <span className="w-6 text-right text-sm font-semibold tabular">{value}</span>
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-3">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Mini stepper header used by the campaign composer. */
export function Stepper({ steps, current, onSelect }: { steps: string[]; current: number; onSelect?: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto scroll-thin">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={i > current}
              onClick={() => onSelect?.(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors disabled:cursor-default",
                active ? "text-fg" : done ? "text-fg-2 hover:bg-surface-2" : "text-muted",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-primary text-primary-fg" : done ? "bg-success-soft text-success" : "bg-surface-2 text-muted",
                )}
              >
                {done ? <CircleCheck className="size-3.5" aria-label="done" /> : i + 1}
              </span>
              {s}
            </button>
            {i < steps.length - 1 && <span className="h-px w-4 bg-line-strong sm:w-8" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/** Simple percentage helper safe for zero denominators. */
export const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);
