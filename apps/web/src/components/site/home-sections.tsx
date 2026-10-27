import { ArrowRight, Check, CircleCheck, Minus, Play, Quote, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  compareRows,
  compliance,
  customerLogos,
  homeFaqs,
  industries,
  journey,
  testimonials,
  type Support,
} from "@/lib/mock/site";
import { AgentVisual, AnalyticsVisual, MarketingVisual, ProspectingVisual, ReviewsVisual } from "./feature-visuals";
import { HeroDemo } from "./hero-demo";
import { Container, CtaBand, FaqList, GradientText, LinkButton, SectionHeading } from "./primitives";
import { StatsBand } from "./stats-band";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16">
      <div aria-hidden className="site-grid-bg pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <Link
            href="/solutions/clinics"
            className="group inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-xs font-medium text-fg-2 shadow-card hover:border-line-strong"
          >
            <span className="rounded-full bg-gradient-to-r from-primary to-ai px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
            <span className="truncate">How Smile Dental cut no-shows by 41%</span>
            <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <h1 className="mt-6 text-[2.5rem] leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.1rem] xl:text-[3.35rem]">
            Your AI sales & marketing team: <GradientText>finds customers, answers every enquiry,</GradientText> books and gets paid.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-fg-2">
            Anvita replies on WhatsApp in Hindi and English within seconds, 24/7. It books real calendar slots, collects UPI deposits,
            asks for reviews and fills your pipeline with new leads. One tool, one customer record, one bill.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/onboarding" variant="ai" size="xl">
              Start free, set up in 30 min <ArrowRight />
            </LinkButton>
            <LinkButton href="/dashboard" variant="outline" size="xl">
              <Play /> Explore the live demo
            </LinkButton>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-2">
            {["14-day free trial", "No card required", "Official WhatsApp API"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CircleCheck className="size-4 text-success" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Already a customer?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in to your workspace →
            </Link>
          </p>
        </div>
        <HeroDemo />
      </Container>
    </section>
  );
}

export function LogoStrip() {
  const row = [...customerLogos, ...customerLogos];
  return (
    <section className="py-10" aria-label="Example customers">
      <Container>
        <p className="text-center text-sm text-muted">Growing businesses across India run on Anvita (example workspaces)</p>
      </Container>
      <div className="site-marquee-wrap relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
        <div className="site-marquee flex w-max gap-4">
          {row.map((c, i) => (
            <div key={`${c.name}-${i}`} aria-hidden={i >= customerLogos.length} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-card">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold tracking-tight text-fg-2">{c.mono}</span>
              <span>
                <span className="block text-sm font-semibold whitespace-nowrap">{c.name}</span>
                <span className="block text-[11px] text-muted">{c.city}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="How it works"
          title={
            <>
              One agent across the whole funnel, <GradientText>from stranger to repeat customer</GradientText>
            </>
          }
          lead="The agent that found the lead is the one that answers the reply, books the visit and asks for the review, all on one customer record."
        />
        <ol className="relative mt-14 grid gap-4 md:grid-cols-5">
          <div aria-hidden className="absolute top-7 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-primary via-ai to-primary md:block" />
          {journey.map((j, i) => (
            <li key={j.id} className="relative flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card md:flex-col md:gap-0 md:border-0 md:bg-transparent md:p-0 md:text-center md:shadow-none">
              <span className="relative inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-ai text-white shadow-pop md:mx-auto">
                <j.icon className="size-6" />
                <span className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full border-2 border-bg bg-surface text-[10px] font-bold text-fg">{i + 1}</span>
              </span>
              <div className="md:mt-5">
                <div className="text-xs font-semibold tracking-wider text-primary uppercase">{j.step}</div>
                <h3 className="mt-1 font-semibold">{j.title}</h3>
                <p className="mt-1.5 text-sm text-fg-2">{j.body}</p>
                <Badge tone="neutral" className="mt-3">
                  {j.module}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function FeatureRow({
  id,
  eyebrow,
  title,
  body,
  bullets,
  visual,
  flip,
  cta,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  bullets: string[];
  visual: ReactNode;
  flip?: boolean;
  cta: { label: string; href: string };
}) {
  return (
    <div id={id} className="scroll-mt-24 grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
      <div className={cn(flip && "lg:order-2")}>
        <SectionHeading eyebrow={eyebrow} title={title} lead={body} />
        <ul className="mt-6 grid gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[15px]">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Check className="size-3" />
              </span>
              <span className="text-fg-2">{b}</span>
            </li>
          ))}
        </ul>
        <Link href={cta.href} className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 [&]:transition-all">
          {cta.label} <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className={cn("min-w-0", flip && "lg:order-1")}>{visual}</div>
    </div>
  );
}

export function Features() {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <SectionHeading
          center
          eyebrow="The product"
          title={
            <>
              Four tools&rsquo; worth of work, <GradientText>done by one AI team</GradientText>
            </>
          }
          lead="Inbound agent, prospecting, marketing and analytics share the same memory of your business and every customer."
        />
        <FeatureRow
          id="agent"
          eyebrow="AI Agent"
          title="Every enquiry answered in seconds, at 11 PM and on Sundays"
          body="Anvi, your AI employee, replies on WhatsApp, Instagram, SMS, email and webchat in the customer's own language. It doesn't just chat: it books, quotes and collects."
          bullets={[
            "Replies 24/7 in Hindi, English, Hinglish and 8 regional languages",
            "Books real slots in Google or Outlook calendars, reschedules by chat",
            "Collects refundable UPI deposits via Razorpay to cut no-shows",
            "Hands angry, unsure or high-value chats to your team with a summary",
          ]}
          visual={<AgentVisual />}
          cta={{ label: "See the AI Agent Studio", href: "/agent" }}
        />
        <FeatureRow
          id="prospecting"
          flip
          eyebrow="Prospecting"
          title="Describe your ideal customer. Get a verified lead list."
          body="Type what you want in plain English. Anvita plans the search across Google Maps, websites and company registries, then enriches, verifies and scores every row."
          bullets={[
            "AI columns answer questions per lead: “Do they offer implants?”",
            "Email and phone verification waterfall, deduped against your CRM",
            "Push straight into WhatsApp + email sequences that stop on reply",
          ]}
          visual={<ProspectingVisual />}
          cta={{ label: "Try a prospecting search", href: "/prospecting" }}
        />
        <FeatureRow
          id="marketing"
          eyebrow="AI marketing"
          title="An AI marketing team that plans, launches and learns"
          body="Set a goal; the campaign planner drafts audience, channels, budget and creatives from your brand memory. Nothing goes live or spends a rupee without your approval."
          bullets={[
            "Meta & Google ads co-pilot: copy, budgets and shift suggestions",
            "WhatsApp, SMS and email broadcasts to AI-built segments",
            "Answer-engine optimisation: show up in ChatGPT, Perplexity and Google AI answers",
          ]}
          visual={<MarketingVisual />}
          cta={{ label: "Open the campaign planner", href: "/marketing" }}
        />
        <FeatureRow
          id="reviews"
          flip
          eyebrow="Reviews & payments"
          title="More 5-star reviews. Faster payments. Zero chasing."
          body="After every visit Anvita checks in, sends happy customers your Google review link and routes unhappy ones to you. Invoices and pay links go out over WhatsApp."
          bullets={[
            "Review monitoring for Google, Facebook, Practo and Justdial with AI-drafted replies",
            "UPI, card and net-banking links with GST invoices and receipts",
            "Automatic reminders for dues and deposits",
          ]}
          visual={<ReviewsVisual />}
          cta={{ label: "See reviews & payments", href: "/reviews" }}
        />
        <FeatureRow
          id="analytics"
          eyebrow="Analytics"
          title="Know your cost per booked customer, not just cost per click"
          body="Because Anvita owns the ad, the conversation, the booking and the payment, it closes the loop: you see which campaign actually produced paying customers."
          bullets={[
            "Funnel attribution: ad → conversation → booking → payment",
            "AI resolution rate, response time and revenue per channel",
            "A weekly AI-written growth report with what to change next",
          ]}
          visual={<AnalyticsVisual />}
          cta={{ label: "Explore analytics", href: "/analytics" }}
        />
      </Container>
    </section>
  );
}

export function Solutions() {
  return (
    <section id="solutions" className="scroll-mt-20 py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Solutions"
          title="Built for businesses that run on WhatsApp"
          lead="Industry templates come with playbooks, knowledge-base starters and automations tuned for how your customers buy."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => {
            const content = (
              <>
                <div className="flex items-start justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ind.icon className="size-5" />
                  </span>
                  {ind.href ? <Badge tone="success">Case study</Badge> : <Badge>Coming soon</Badge>}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{ind.label}</h3>
                <p className="mt-1.5 text-sm text-fg-2">{ind.blurb}</p>
                <p className="mt-3 text-xs text-muted">{ind.examples}</p>
                {ind.href && (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    See the clinic playbook <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </>
            );
            return ind.href ? (
              <Link
                key={ind.id}
                href={ind.href}
                className="group rounded-2xl border border-line bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
              >
                {content}
              </Link>
            ) : (
              <div key={ind.id} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                {content}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function SupportCell({ v, strong }: { v: Support; strong?: boolean }) {
  if (v === "yes")
    return (
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full", strong ? "bg-primary text-primary-fg" : "bg-success-soft text-success")}>
        <Check className="size-3.5" aria-label="Yes" />
      </span>
    );
  if (v === "partial") return <span className="text-xs font-medium text-warning">Partial</span>;
  if (v === "varies") return <span className="text-xs text-muted">Varies</span>;
  return (
    <span className="inline-flex size-6 items-center justify-center text-muted/60">
      <Minus className="size-4" aria-label="No" />
    </span>
  );
}

export function Comparison() {
  const cols: { key: keyof Omit<(typeof compareRows)[number], "label">; label: string; sub: string }[] = [
    { key: "anvita", label: "Anvita", sub: "One platform" },
    { key: "podium", label: "Podium", sub: "Inbox & AI employee" },
    { key: "origami", label: "Origami", sub: "Lead search" },
    { key: "different", label: "Different", sub: "AI demand gen" },
    { key: "agency", label: "Agency", sub: "Retainer" },
  ];
  return (
    <section id="compare" className="scroll-mt-20 bg-surface py-16 sm:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="One tool vs four"
          title={
            <>
              Replace the stack, <GradientText>keep one customer record</GradientText>
            </>
          }
          lead="Most teams stitch together an inbox tool, a lead-search tool, an AI marketing tool and an agency. Anvita does the jobs of all four, and they share context."
        />
        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-bg shadow-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="sticky left-0 z-10 bg-bg px-4 py-4 text-left font-medium text-muted">Capability</th>
                {cols.map((c) => (
                  <th key={c.key} className={cn("px-3 py-4 text-center", c.key === "anvita" && "bg-primary-soft/60")}>
                    <div className={cn("font-semibold", c.key === "anvita" ? "text-primary" : "text-fg")}>{c.label}</div>
                    <div className="text-[11px] font-normal text-muted">{c.sub}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.label} className="border-b border-line last:border-0">
                  <td className="sticky left-0 z-10 max-w-[180px] bg-bg px-4 py-3 text-fg-2 sm:max-w-none">{r.label}</td>
                  {cols.map((c) => (
                    <td key={c.key} className={cn("px-3 py-3 text-center", c.key === "anvita" && "bg-primary-soft/60")}>
                      <SupportCell v={r[c.key]} strong={c.key === "anvita"} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Based on each vendor&rsquo;s publicly documented features as of October 2026. “Partial” means basic or limited support; agency services vary by
          provider. Trademarks belong to their owners; no affiliation implied.
        </p>
      </Container>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Customer stories" title="Owners who stopped missing enquiries" />
          <Badge tone="neutral" className="self-start sm:self-auto">
            Illustrative examples · names fictional
          </Badge>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={cn(
                "flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-card",
                i === 0 && "md:bg-gradient-to-br md:from-primary-soft md:to-surface",
              )}
            >
              <div className="flex items-center justify-between">
                <Quote className="size-6 text-primary/50" aria-hidden />
                <span className="flex text-accent" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="size-4 fill-current" />
                  ))}
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-fg">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={t.name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
                <Badge tone="success" className="hidden sm:inline-flex">
                  {t.metric}
                </Badge>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Security() {
  return (
    <section className="border-y border-line bg-surface py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-center">
          <SectionHeading
            eyebrow="Security & compliance"
            title="Built for Indian rules, ready for global ones"
            lead="Your customer data is yours. Every AI action is logged, every opt-out is honoured, and guardrails keep the agent on-script."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {compliance.map((c, i) => (
              <div key={c.id} className={cn("flex gap-3 rounded-xl border border-line bg-bg p-4", i === compliance.length - 1 && "sm:col-span-2")}>
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
                  <c.icon className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">{c.label}</div>
                  <div className="mt-0.5 text-sm text-fg-2">{c.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function HomeFaq() {
  return (
    <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionHeading eyebrow="FAQ" title="Questions owners ask us" lead="Can't find yours? Message us on WhatsApp; our own Anvita agent replies in under a minute." />
          <LinkButton href="/pricing" variant="outline" className="mt-6">
            <Sparkles /> See pricing & credits
          </LinkButton>
        </div>
        <FaqList items={homeFaqs} />
      </Container>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <LogoStrip />
      <HowItWorks />
      <Features />
      <StatsBand />
      <Solutions />
      <Comparison />
      <Testimonials />
      <Security />
      <HomeFaq />
      <CtaBand />
    </>
  );
}
