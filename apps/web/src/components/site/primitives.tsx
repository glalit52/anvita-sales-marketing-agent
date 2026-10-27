import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Link styled like the design-system Button (Button itself renders a <button>). */
const linkVariants = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover shadow-card",
  ai: "bg-gradient-to-r from-primary to-ai text-white hover:opacity-95 shadow-card",
  outline: "border border-line bg-surface text-fg hover:bg-surface-2",
  ghost: "text-fg-2 hover:bg-surface-2 hover:text-fg",
  secondary: "bg-surface-2 text-fg hover:bg-surface-3",
};
const linkSizes = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-xl",
  xl: "h-12 px-6 text-base gap-2 rounded-xl",
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof linkVariants; size?: keyof typeof linkSizes }) {
  return (
    <Link
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
        linkVariants[variant],
        linkSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("bg-gradient-to-r from-primary to-ai bg-clip-text text-transparent", className)}>{children}</span>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase", className)}>
      <span className="h-px w-5 bg-gradient-to-r from-primary to-ai" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className={cn(center && "justify-center")}>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-base text-pretty text-fg-2 sm:text-lg">{lead}</p>}
    </div>
  );
}

export function FaqList({ items, className }: { items: { q: string; a: string }[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-line rounded-2xl border border-line bg-surface shadow-card", className)}>
      {items.map((f, i) => (
        <details key={f.q} className="site-faq group" open={i === 0}>
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-medium hover:text-primary sm:px-6">
            {f.q}
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition-transform group-open:rotate-45 group-open:bg-primary-soft group-open:text-primary">
              <Plus className="size-4" aria-hidden />
            </span>
          </summary>
          <p className="-mt-1 px-5 pb-5 text-sm leading-relaxed text-fg-2 sm:px-6">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({
  title = "Hire your AI sales & marketing team today",
  lead = "Paste your website, connect WhatsApp, and watch Anvita answer your next enquiry in under a minute. 14-day free trial, no card required.",
}: {
  title?: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-ai px-6 py-12 text-center text-white shadow-pop sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-10 size-72 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/85">{lead}</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-primary shadow-card transition hover:bg-white/90"
            >
              Start free <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 px-6 font-medium text-white transition hover:bg-white/10"
            >
              Explore the live demo
            </Link>
          </div>
          <p className="relative mt-5 text-xs text-white/70">Setup in under 30 minutes · Cancel anytime · Prices in ₹ + GST</p>
        </div>
      </Container>
    </section>
  );
}
