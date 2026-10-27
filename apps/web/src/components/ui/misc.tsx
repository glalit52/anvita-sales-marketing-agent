import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/** Standard padded content area for app pages. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Progress({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "success" | "warning" | "danger" | "ai";
  className?: string;
}) {
  const color = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger", ai: "bg-ai" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)}>
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary [&_svg]:size-6">{icon}</div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted">{children}</kbd>
  );
}

/** Small label-value row used in side panels. */
export function MetaRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right text-fg">{children}</span>
    </div>
  );
}

/** Callout for AI suggestions / insights. */
export function AiCallout({
  title,
  children,
  action,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-ai/20 bg-ai-soft/60 p-3.5", className)}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai text-[10px] font-bold text-white">
          AI
        </span>
        <div className="min-w-0 flex-1 text-sm">
          {title && <div className="mb-0.5 font-semibold text-fg">{title}</div>}
          <div className="text-fg-2">{children}</div>
          {action && <div className="mt-2.5 flex flex-wrap gap-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}
