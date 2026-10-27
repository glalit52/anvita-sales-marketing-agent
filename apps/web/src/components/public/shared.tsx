import { BadgeCheck, Lock, MapPin, ShieldCheck, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { business } from "@/lib/mock/public";

/** Smile Dental brand mark (brand colour is allowed for business marks). */
export function BusinessMonogram({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "size-8 text-xs rounded-lg", md: "size-11 text-sm rounded-xl", lg: "size-14 text-lg rounded-2xl" }[size];
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#0f9aa6] to-[#0b6f7a] font-bold tracking-tight text-white shadow-card", s, className)}
    >
      {business.monogram}
    </span>
  );
}

export function Stars({ value, size = "sm", className }: { value: number; size?: "xs" | "sm" | "md"; className?: string }) {
  const s = { xs: "size-3", sm: "size-3.5", md: "size-4" }[size];
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(s, i <= Math.round(value) ? "fill-accent text-accent" : "text-line-strong")} />
      ))}
    </span>
  );
}

export function RatingLine({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-fg-2", className)}>
      <Star className="size-3.5 fill-accent text-accent" aria-hidden />
      <span className="font-semibold text-fg">{business.rating}</span>
      <span className="text-muted">({formatNumber(business.reviewCount)} Google reviews)</span>
    </span>
  );
}

/** Compact business identity block used at the top of every public page. */
export function BusinessHeader({ action, compact }: { action?: ReactNode; compact?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <BusinessMonogram size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h1 className={cn("truncate font-semibold tracking-tight text-fg", compact ? "text-sm" : "text-base sm:text-lg")}>{business.name}</h1>
          <BadgeCheck className="size-4 shrink-0 text-info" aria-label="Verified business" />
        </div>
        <RatingLine className="mt-0.5" />
        {!compact && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{business.locations.map((l) => l.name).join(" · ")}<span className="hidden sm:inline">, Pune</span></span>
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PoweredBy({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-1.5 py-6 text-center text-[11px] text-muted", className)}>
      <a href="https://anvita.ai" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-medium text-fg-2 hover:border-line-strong">
        <span className="inline-flex size-4 items-center justify-center rounded bg-gradient-to-br from-primary to-ai text-[9px] font-bold text-white">A</span>
        Powered by Anvita
      </a>
      <span>
        <a className="hover:text-fg" href="#privacy">Privacy</a> · <a className="hover:text-fg" href="#terms">Terms</a> · {business.legalName}
      </span>
    </div>
  );
}

export function SecureBadges({ className }: { className?: string }) {
  const items = [
    { icon: Lock, label: "256-bit SSL encrypted" },
    { icon: ShieldCheck, label: "PCI DSS compliant" },
    { icon: BadgeCheck, label: "RBI-licensed gateway" },
  ];
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted", className)}>
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-1">
          <Icon className="size-3.5 text-success" aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

/** Centered column used by pay / feedback pages. */
export function PublicColumn({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-md px-4 pt-4 sm:pt-10", className)}>{children}</div>;
}

/** Big success / failure / info medallion. */
export function StatusMedallion({ tone, icon }: { tone: "success" | "danger" | "info" | "ai"; icon: ReactNode }) {
  const t = { success: "bg-success-soft text-success", danger: "bg-danger-soft text-danger", info: "bg-info-soft text-info", ai: "bg-ai-soft text-ai" }[tone];
  return (
    <div className={cn("mx-auto flex size-16 items-center justify-center rounded-full [&_svg]:size-8", t)}>
      <span className="animate-fade-in">{icon}</span>
    </div>
  );
}

/** Downloads a text file in the browser (receipts, .ics). */
export function downloadFile(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Loading placeholder for public pages while route params resolve. */
export function PublicSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg animate-pulse px-4 pt-4 sm:pt-10" aria-busy="true" aria-label="Loading">
      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-surface-3" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded bg-surface-3" />
            <div className="h-3 w-48 rounded bg-surface-2" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3 rounded-2xl border border-line bg-surface p-5">
        <div className="h-4 w-40 rounded bg-surface-3" />
        <div className="h-16 rounded-xl bg-surface-2" />
        <div className="h-16 rounded-xl bg-surface-2" />
        <div className="h-16 rounded-xl bg-surface-2" />
      </div>
    </div>
  );
}
