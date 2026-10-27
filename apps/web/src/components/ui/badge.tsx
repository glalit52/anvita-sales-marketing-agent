import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info" | "ai" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-fg-2 border-line",
  primary: "bg-primary-soft text-primary border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
  ai: "bg-ai-soft text-ai border-transparent",
  accent: "bg-accent-soft text-warning border-transparent",
};

const dots: Record<Tone, string> = {
  neutral: "bg-muted",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  ai: "bg-ai",
  accent: "bg-accent",
};

export function Badge({
  tone = "neutral",
  dot,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap [&_svg]:size-3",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}
