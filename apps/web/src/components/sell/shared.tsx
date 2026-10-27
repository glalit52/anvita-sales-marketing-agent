"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Clock, CreditCard, Landmark, RotateCcw, Smartphone, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, Badge } from "@/components/ui";
import { series } from "@/components/charts";
import { cn } from "@/lib/cn";
import { memberById } from "@/lib/mock/core";
import type { PaymentMethod, PaymentStatus } from "@/lib/mock/sell";

/** AI lead score: number + mini bar. Tone by band, number always shown. */
export function ScoreBar({ score, className }: { score: number; className?: string }) {
  const tone = score >= 75 ? "bg-success" : score >= 50 ? "bg-primary" : "bg-line-strong";
  return (
    <div className={cn("flex items-center gap-2", className)} title={`AI lead score ${score}/100`}>
      <span className="w-6 text-right text-sm font-medium tabular text-fg">{score}</span>
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-3">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function ownerName(ownerId: string) {
  return ownerId === "ai" ? "Anvita AI" : (memberById(ownerId)?.name ?? "Unassigned");
}

export function OwnerChip({ ownerId, size = "xs", showName = true }: { ownerId: string; size?: "xs" | "sm"; showName?: boolean }) {
  const name = ownerName(ownerId);
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5" title={name}>
      <Avatar name={name} ai={ownerId === "ai"} size={size} />
      {showName && <span className="truncate text-sm text-fg-2">{ownerId === "ai" ? "AI agent" : name.split(" ")[0]}</span>}
    </span>
  );
}

export const paymentStatusMeta: Record<PaymentStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral"; icon: typeof Clock }> = {
  paid: { label: "Paid", tone: "success", icon: CheckCircle2 },
  pending: { label: "Pending", tone: "warning", icon: Clock },
  overdue: { label: "Overdue", tone: "danger", icon: TriangleAlert },
  refunded: { label: "Refunded", tone: "neutral", icon: RotateCcw },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = paymentStatusMeta[status];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone}>
      <Icon /> {meta.label}
    </Badge>
  );
}

export const methodMeta: Record<PaymentMethod, { label: string; icon: typeof Clock }> = {
  upi: { label: "UPI", icon: Smartphone },
  card: { label: "Card", icon: CreditCard },
  netbanking: { label: "Netbanking", icon: Landmark },
};

export function MethodLabel({ method }: { method?: PaymentMethod }) {
  if (!method) return <span className="text-sm text-muted">—</span>;
  const meta = methodMeta[method];
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-fg-2">
      <Icon className="size-3.5 text-muted" /> {meta.label}
    </span>
  );
}

/** Token-based provider color (categorical chart slot in fixed order). */
export function providerColor(index: number) {
  return series[index % series.length];
}

export function SortHeader<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: ReactNode;
  sortKey: K;
  sort: { key: K; dir: "asc" | "desc" };
  onSort: (key: K) => void;
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn("inline-flex items-center gap-1 font-medium hover:text-fg", active ? "text-fg" : "text-muted", className)}
      aria-label={`Sort by ${typeof label === "string" ? label : sortKey}`}
    >
      {label}
      <Icon className={cn("size-3", !active && "opacity-50")} />
    </button>
  );
}

/** Small "AI" pill used on AI-created records. */
export function AiBadge({ label = "AI", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded bg-gradient-to-r from-primary to-ai px-1 py-px text-[9px] leading-3 font-bold tracking-wide text-white",
        className,
      )}
    >
      {label}
    </span>
  );
}
