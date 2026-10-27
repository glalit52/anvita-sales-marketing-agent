"use client";

import {
  ArrowRightLeft,
  Bot,
  CalendarCheck,
  IndianRupee,
  ListTodo,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Star,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ActivityKind, TaskType } from "@/lib/mock/app";

export const activityMeta: Record<ActivityKind, { label: string; icon: LucideIcon; className: string }> = {
  message: { label: "Messages", icon: MessageCircle, className: "bg-info-soft text-info" },
  ai: { label: "AI actions", icon: Sparkles, className: "bg-ai-soft text-ai" },
  booking: { label: "Bookings", icon: CalendarCheck, className: "bg-success-soft text-success" },
  payment: { label: "Payments", icon: IndianRupee, className: "bg-primary-soft text-primary" },
  review: { label: "Reviews", icon: Star, className: "bg-accent-soft text-warning" },
  sequence: { label: "Sequences", icon: Send, className: "bg-surface-3 text-fg-2" },
  note: { label: "Notes", icon: StickyNote, className: "bg-warning-soft text-warning" },
  stage: { label: "Stage", icon: ArrowRightLeft, className: "bg-surface-3 text-fg-2" },
  task: { label: "Tasks", icon: ListTodo, className: "bg-primary-soft text-primary" },
};

export const taskTypeIcon: Record<TaskType, { icon: LucideIcon; className: string }> = {
  call: { icon: Phone, className: "bg-success-soft text-success" },
  whatsapp: { icon: MessageCircle, className: "bg-[#25d366]/15 text-[#128c4a] dark:text-[#3ddc84]" },
  email: { icon: Mail, className: "bg-accent-soft text-warning" },
  review: { icon: Star, className: "bg-accent-soft text-warning" },
  payment: { icon: IndianRupee, className: "bg-primary-soft text-primary" },
};

export function TaskTypeIcon({ type, size = "sm" }: { type: TaskType; size?: "xs" | "sm" | "md" }) {
  const meta = taskTypeIcon[type];
  const box = { xs: "size-5 [&_svg]:size-3 rounded", sm: "size-7 [&_svg]:size-3.5 rounded-lg", md: "size-9 [&_svg]:size-4 rounded-lg" }[size];
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", box, meta.className)} aria-hidden>
      <meta.icon />
    </span>
  );
}

/** Round icon used on activity timelines. */
export function ActivityDot({ kind, className }: { kind: ActivityKind; className?: string }) {
  const meta = activityMeta[kind];
  return (
    <span className={cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-surface", meta.className, className)} aria-hidden>
      <meta.icon className="size-3.5" />
    </span>
  );
}

/** Small uppercase section heading used in side columns. */
export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-2 flex items-center justify-between gap-2", className)}>
      <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">{children}</h4>
      {action}
    </div>
  );
}

/** "AI" pill shown next to AI-created items. */
export function AiTag({ label = "AI" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ai-soft px-1.5 py-0.5 text-[10px] leading-3 font-semibold text-ai">
      <Bot className="size-3" />
      {label}
    </span>
  );
}

/** Chip used for filters (pressed state carries a check-like border + bg, not color alone). */
export function FilterChip({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors [&_svg]:size-3.5",
        active ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
      {count !== undefined && <span className={cn("tabular", active ? "text-primary" : "text-muted")}>{count}</span>}
    </button>
  );
}
