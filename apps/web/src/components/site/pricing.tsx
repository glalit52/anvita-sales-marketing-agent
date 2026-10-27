"use client";

import { ArrowRight, Bot, Check, IndianRupee, MessageCircle, Mic, Minus, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge, Segmented, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { creditPacks } from "@/lib/mock/platform";
import { plans, pricingFaqs, pricingMatrix, usageCredits, type Cell } from "@/lib/mock/site";
import { Container, CtaBand, FaqList, GradientText, LinkButton, SectionHeading } from "./primitives";

type Cycle = "monthly" | "yearly";

/** Same rule as in-app billing: yearly = pay 10 months, get 12. */
const monthlyEquivalent = (price: number, cycle: Cycle) => (cycle === "yearly" ? Math.round((price * 10) / 12) : price);

const creditIcons = { ai: Bot, prospect: Search, voice: Mic, wa: MessageCircle } as const;

export function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const toast = useToast();

  return (
    <>
      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-20">
        <div aria-hidden className="site-grid-bg pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <Container className="relative text-center">
          <Badge tone="primary" className="mx-auto">
            <IndianRupee /> Transparent ₹ pricing
          </Badge>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            One flat plan. <GradientText>Pay for usage, not seats.</GradientText>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-fg-2">
            Every plan includes the AI agent, unified inbox and WhatsApp. Add usage credits only when you need more. Start with a 14-day Growth trial,
            no card required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Segmented
              items={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              value={cycle}
              onChange={setCycle}
            />
            <Badge tone="success">2 months free yearly</Badge>
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((p) => {
              const popular = p.id === "growth";
              const price = monthlyEquivalent(p.price, cycle);
              return (
                <div
                  key={p.id}
                  id={p.id}
                  className={cn(
                    "relative flex scroll-mt-24 flex-col rounded-2xl border bg-surface p-6 shadow-card",
                    popular ? "border-primary shadow-pop ring-1 ring-primary" : "border-line",
                  )}
                >
                  {popular && (
                    <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-primary to-ai px-3 py-1 text-xs font-semibold text-white shadow-card">
                      Most popular
                    </span>
                  )}
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted">{p.who}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight tabular">{formatCurrency(price)}</span>
                    <span className="text-sm text-muted">/mo</span>
                  </div>
                  <p className="mt-1 h-4 text-xs text-muted">
                    {cycle === "yearly" ? (
                      <>
                        billed {formatCurrency(p.price * 10)}/yr · <span className="text-success">save {formatCurrency(p.price * 2)}</span>
                      </>
                    ) : (
                      "+ 18% GST, billed monthly"
                    )}
                  </p>
                  {p.id === "agency" ? (
                    <button
                      type="button"
                      onClick={() => toast({ title: "Our partnerships team will WhatsApp you", description: "Usually within 2 working hours. Meanwhile, try the demo workspace.", tone: "info" })}
                      className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface font-medium hover:bg-surface-2"
                    >
                      Talk to partnerships
                    </button>
                  ) : (
                    <LinkButton href={`/onboarding?plan=${p.id}`} variant={popular ? "ai" : "outline"} size="lg" className="mt-6 w-full">
                      Start free trial <ArrowRight />
                    </LinkButton>
                  )}
                  <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-sm">
                        <Check className={cn("mt-0.5 size-4 shrink-0", popular ? "text-primary" : "text-success")} />
                        <span className={cn(f.startsWith("Everything") ? "font-medium text-fg" : "text-fg-2")}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            All plans: unlimited contacts · Copilot mode · DPDP consent tools · Hindi & regional languages · Prices exclude GST
          </p>
        </Container>
      </section>

      <Estimator cycle={cycle} />

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading center eyebrow="Compare plans" title="Everything, module by module" />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="sticky top-0">
                <tr className="border-b border-line bg-surface">
                  <th className="w-[40%] px-5 py-4 text-left font-medium text-muted">Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} className={cn("px-3 py-4 text-center", p.id === "growth" && "bg-primary-soft/60")}>
                      <div className={cn("font-semibold", p.id === "growth" && "text-primary")}>{p.name}</div>
                      <div className="text-xs font-normal text-muted tabular">{formatCurrency(monthlyEquivalent(p.price, cycle))}/mo</div>
                    </th>
                  ))}
                </tr>
              </thead>
              {pricingMatrix.map((m) => (
                <tbody key={m.module}>
                  <tr className="bg-surface-2">
                    <th colSpan={5} scope="colgroup" className="px-5 py-2.5 text-left text-xs font-semibold tracking-wider text-fg-2 uppercase">
                      {m.module}
                    </th>
                  </tr>
                  {m.rows.map((r) => (
                    <tr key={r.label} className="border-t border-line">
                      <td className="px-5 py-3 text-fg-2">{r.label}</td>
                      {r.values.map((v, i) => (
                        <td key={i} className={cn("px-3 py-3 text-center", i === 1 && "bg-primary-soft/60")}>
                          <MatrixCell v={v} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Usage credits"
            title="Credits only for what the AI actually does"
            lead="Your plan includes a monthly quota. Go over and Anvita keeps working: top up with a pack or pay overage at pack rates. Credits never expire while your plan is active."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageCredits.map((c) => {
              const Icon = creditIcons[c.id as keyof typeof creditIcons];
              return (
                <div key={c.id} className="flex flex-col rounded-2xl border border-line bg-bg p-5">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{c.label}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-fg-2">{c.body}</p>
                  <div className="mt-4 border-t border-line pt-3 text-sm font-semibold">{c.rate}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-surface-2 text-xs text-muted uppercase">
                <tr>
                  <th className="px-5 py-2.5 text-left font-medium">Credit pack</th>
                  <th className="px-5 py-2.5 text-right font-medium">Price (+ GST)</th>
                </tr>
              </thead>
              <tbody>
                {creditPacks.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-5 py-3">{p.label}</td>
                    <td className="px-5 py-3 text-right font-medium tabular">{formatCurrency(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="Pricing FAQ" title="Billing, GST and credits" lead="Questions about a custom plan or 10+ locations? Our team replies on WhatsApp within a couple of hours." />
          <FaqList items={pricingFaqs} />
        </Container>
      </section>

      <CtaBand title="Start your 14-day Growth trial" />
    </>
  );
}

function MatrixCell({ v }: { v: Cell }) {
  if (v === true)
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-success-soft text-success">
        <Check className="size-3.5" aria-label="Included" />
      </span>
    );
  if (v === false)
    return (
      <span className="inline-flex size-6 items-center justify-center text-muted/60">
        <Minus className="size-4" aria-label="Not included" />
      </span>
    );
  return <span className="text-[13px] font-medium">{v}</span>;
}

/** Interactive plan recommender based on monthly volume. */
function Estimator({ cycle }: { cycle: Cycle }) {
  const [enquiries, setEnquiries] = useState(1200);
  const [prospects, setProspects] = useState(0);
  const [locations, setLocations] = useState(1);

  const aiConvs = Math.round(enquiries * 0.87);
  const planId =
    locations > 3 || aiConvs > 2000 * 1.5 ? "scale" : locations > 1 || aiConvs > 500 || prospects > 0 ? "growth" : "starter";
  const plan = plans.find((p) => p.id === planId)!;
  const quota = { starter: 500, growth: 2000, scale: 6000 }[planId as "starter" | "growth" | "scale"];
  const prospectQuota = planId === "starter" ? 0 : 1000;
  const extraConvPacks = Math.max(0, Math.ceil((aiConvs - quota) / 500));
  const extraProspectPacks = Math.max(0, Math.ceil((prospects - prospectQuota) / 1000));
  const extras = extraConvPacks * 1499 + extraProspectPacks * 2999;
  const total = monthlyEquivalent(plan.price, cycle) + extras;

  return (
    <section className="pb-4">
      <Container>
        <div className="grid gap-6 overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-ai">
              <Sparkles className="size-4" /> Estimate your bill
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Which plan fits your volume?</h2>
            <div className="mt-6 space-y-6">
              <Slider label="Enquiries per month" value={enquiries} min={100} max={8000} step={100} onChange={setEnquiries} hint={`≈ ${formatNumber(aiConvs)} handled fully by AI (87%)`} />
              <Slider label="New prospect rows per month" value={prospects} min={0} max={5000} step={250} onChange={setProspects} hint={prospects ? "Verified, enriched lead rows" : "Not doing outbound yet"} />
              <Slider label="Locations" value={locations} min={1} max={10} step={1} onChange={setLocations} />
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-primary to-ai p-6 text-white">
            <div className="text-sm text-white/80">Recommended</div>
            <div className="mt-1 text-3xl font-semibold">{plan.name}</div>
            <div className="mt-4 space-y-2 text-sm">
              <Line label={`${plan.name} plan`} value={formatCurrency(monthlyEquivalent(plan.price, cycle))} />
              {extraConvPacks > 0 && <Line label={`${extraConvPacks} × 500 AI conversations`} value={formatCurrency(extraConvPacks * 1499)} />}
              {extraProspectPacks > 0 && <Line label={`${extraProspectPacks} × 1,000 prospecting credits`} value={formatCurrency(extraProspectPacks * 2999)} />}
              <Line label="WhatsApp fees" value="at cost" muted />
            </div>
            <div className="mt-auto pt-6">
              <div className="flex items-baseline justify-between border-t border-white/25 pt-4">
                <span className="text-sm text-white/80">Estimated / month</span>
                <span className="text-3xl font-semibold tabular">{formatCurrency(total)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-white/70">+ 18% GST{cycle === "yearly" ? " · billed yearly" : ""}</p>
              <LinkButton href={`/onboarding?plan=${plan.id}`} className="mt-5 w-full bg-white text-primary hover:bg-white/90" size="lg">
                Start with {plan.name} <ArrowRight />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-3", muted && "text-white/70")}>
      <span>{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-semibold tabular">{formatNumber(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--primary)]"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
