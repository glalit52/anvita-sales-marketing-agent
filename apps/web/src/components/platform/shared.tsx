"use client";

import { CheckCircle2, CircleAlert, Loader2, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Colored letter monogram (stand-in for brand logos, which aren't bundled). */
export function Monogram({ name, color, size = "md", className }: { name: string; color: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const letters = name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const box = { sm: "size-7 text-[11px] rounded-md", md: "size-10 text-sm rounded-xl", lg: "size-12 text-base rounded-xl" }[size];
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center font-bold text-white shadow-card", box, className)}
      style={{ background: color }}
    >
      {letters}
    </span>
  );
}

/** Small toggleable pill (languages, events, chips). */
export function ToggleChip({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors [&_svg]:size-3.5",
        active ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      {active && <CheckCircle2 />}
      {children}
    </button>
  );
}

export type Health = "healthy" | "warning" | "error" | "syncing";

/** Status badge that always pairs color with an icon + label. */
export function HealthBadge({ status, label }: { status: Health; label?: string }) {
  const meta = {
    healthy: { tone: "success" as const, icon: <CheckCircle2 />, text: "Healthy" },
    warning: { tone: "warning" as const, icon: <TriangleAlert />, text: "Needs attention" },
    error: { tone: "danger" as const, icon: <CircleAlert />, text: "Error" },
    syncing: { tone: "info" as const, icon: <Loader2 className="animate-spin" />, text: "Syncing" },
  }[status];
  return (
    <Badge tone={meta.tone}>
      {meta.icon}
      {label ?? meta.text}
    </Badge>
  );
}

/** Label + description on the left, control on the right. */
export function SettingRow({ title, description, children, className }: { title: ReactNode; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-3", className)}>
      <div className="min-w-0">
        <div className="text-sm font-medium text-fg">{title}</div>
        {description && <div className="mt-0.5 text-xs text-muted">{description}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

/** Monospace tool-call chip, e.g. ⚙ check_availability(...). */
export function ToolChip({ name, args, className }: { name: string; args?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border border-ai/20 bg-ai-soft px-1.5 py-0.5 font-mono text-[11px] text-ai",
        className,
      )}
    >
      <span aria-hidden>⚙</span>
      <span className="truncate">
        {name}
        {args !== undefined && <span className="text-fg-2">({args})</span>}
      </span>
    </span>
  );
}

/** Horizontal usage meter with label + numbers. */
export function UsageMeter({ label, used, limit, unit, footer }: { label: ReactNode; used: number; limit: number; unit?: string; footer?: ReactNode }) {
  const pct = Math.round((used / limit) * 100);
  const tone = pct >= 90 ? "danger" : pct >= 75 ? "warning" : "primary";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-fg">{label}</span>
        <span className="tabular text-xs text-muted">
          <b className="font-semibold text-fg">{used.toLocaleString("en-IN")}</b> / {limit.toLocaleString("en-IN")} {unit}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div
            className={cn("h-full rounded-full", { primary: "bg-primary", warning: "bg-warning", danger: "bg-danger" }[tone])}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <span className={cn("tabular w-10 text-right text-xs font-medium", { primary: "text-fg-2", warning: "text-warning", danger: "text-danger" }[tone])}>
          {pct >= 90 && <span className="sr-only">Near limit: </span>}
          {pct}%
        </span>
      </div>
      {footer && <div className="mt-1.5 text-xs text-muted">{footer}</div>}
    </div>
  );
}

let seq = 0;
/** Monotonic id for client-created mock records (avoids impure Date.now in handlers). */
export function uid() {
  seq += 1;
  return `new${seq}`;
}
