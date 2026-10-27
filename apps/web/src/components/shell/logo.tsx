import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-ai shadow-card", className)}>
      <svg viewBox="0 0 24 24" className="size-[60%] text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 20 12 4l8 16" />
        <path d="M7.5 13.5h9" />
        <circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

export function Logo({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight">Anvita</span>}
    </span>
  );
}
