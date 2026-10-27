import { ArrowRight, Check, Play, Quote, Stethoscope, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { clinicCase, clinicFeatures, industries } from "@/lib/mock/site";
import { AgentVisual, ReviewsVisual } from "./feature-visuals";
import { Container, CtaBand, GradientText, LinkButton, SectionHeading } from "./primitives";

export function ClinicsPage() {
  const c = clinicCase;
  return (
    <>
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-20">
        <div aria-hidden className="site-grid-bg pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/3 size-[560px] rounded-full bg-primary/15 blur-3xl" />
        <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
              <Link href="/#solutions" className="hover:text-fg">
                Solutions
              </Link>
              <span>/</span>
              <span className="text-fg-2">Clinics & healthcare</span>
            </nav>
            <Badge tone="primary" className="mt-5">
              <Stethoscope /> For dental, derma, physio, IVF & eye clinics
            </Badge>
            <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
              The AI front desk that <GradientText>never puts a patient on hold</GradientText>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-fg-2">
              Anvita answers every WhatsApp, call-back and Instagram DM in seconds, books the right doctor at the right branch, collects deposits and
              brings patients back for recalls, while your front desk focuses on the people in the clinic.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/onboarding?industry=clinic" variant="ai" size="xl">
                Start with the clinic template <ArrowRight />
              </LinkButton>
              <LinkButton href="/dashboard" variant="outline" size="xl">
                <Play /> Open Smile Dental demo
              </LinkButton>
            </div>
          </div>
          <AgentVisual />
        </Container>
      </section>

      {/* Case study */}
      <section className="border-y border-line bg-surface py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Case study"
              title={
                <>
                  {c.business}: 90 days from missed calls to <GradientText>+54% new patients</GradientText>
                </>
              }
              lead={`${c.location}. ${c.period}. Before Anvita, two receptionists juggled phones, WhatsApp on a shared phone and Practo enquiries; after 7 PM nobody replied.`}
            />
            <Badge tone="neutral" className="self-start lg:self-auto">
              Demo workspace · illustrative figures
            </Badge>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.metrics.map((m) => {
              const down = m.delta.startsWith("−");
              return (
                <div key={m.label} className="rounded-2xl border border-line bg-bg p-5">
                  <div className="text-sm text-muted">{m.label}</div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted">Before</div>
                      <div className="text-lg font-medium text-fg-2 tabular line-through decoration-muted/50">{m.before}</div>
                    </div>
                    <ArrowRight className="mb-1.5 size-4 text-muted" />
                    <div className="text-right">
                      <div className="text-xs text-muted">After</div>
                      <div className="text-2xl font-semibold tabular">{m.after}</div>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                    {down ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
                    {m.delta}
                  </div>
                </div>
              );
            })}
          </div>

          <figure className="mt-8 grid gap-6 rounded-2xl bg-gradient-to-br from-primary to-ai p-6 text-white sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
            <Quote className="size-10 text-white/50" aria-hidden />
            <div>
              <blockquote className="text-lg leading-relaxed text-pretty sm:text-xl">
                “We used to lose the 10 PM enquiries to whichever clinic replied first. Now Anvi replies in Hinglish in under a minute, books the
                Saturday slot and takes the ₹500 deposit. Our no-shows dropped and my receptionists finally take lunch breaks.”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar name={c.owner} size="md" />
                <div>
                  <div className="font-semibold">{c.owner}</div>
                  <div className="text-sm text-white/80">Owner, {c.business} · Pune</div>
                </div>
              </figcaption>
            </div>
          </figure>
        </Container>
      </section>

      {/* Patient journey */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading center eyebrow="The patient journey" title="From ad click to 6-month recall, on autopilot" />
          <ol className="relative mx-auto mt-12 max-w-3xl">
            <div aria-hidden className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-primary via-ai to-primary sm:left-1/2" />
            {c.journey.map((j, i) => (
              <li key={j.step} className={cn("relative mb-6 flex gap-4 last:mb-0 sm:w-1/2", i % 2 ? "sm:ml-auto sm:pl-10" : "sm:flex-row-reverse sm:pr-10 sm:text-right")}>
                <span
                  className={cn(
                    "relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-ai text-white shadow-pop",
                    i % 2 ? "sm:absolute sm:top-2 sm:-left-5" : "sm:absolute sm:top-2 sm:-right-5",
                  )}
                >
                  <j.icon className="size-4" />
                </span>
                <div className="flex-1 rounded-2xl border border-line bg-surface p-4 shadow-card">
                  <div className="text-xs font-semibold text-primary">Step {i + 1}</div>
                  <div className="mt-0.5 font-semibold">{j.step}</div>
                  <div className="mt-1 text-sm text-fg-2">{j.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-surface py-16 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Made for clinics" title="Everything a busy front desk does, minus the hold music" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {clinicFeatures.map((f) => (
                <div key={f.title} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Check className="size-3.5" />
                  </span>
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="mt-0.5 text-sm text-fg-2">{f.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ReviewsVisual />
        </Container>
      </section>

      {/* Other industries */}
      <section className="py-16">
        <Container>
          <h2 className="text-center text-sm font-semibold tracking-wider text-muted uppercase">More industry playbooks</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {industries.map((ind) =>
              ind.href ? (
                <span key={ind.id} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary-soft px-3.5 py-2 text-sm font-medium text-primary">
                  <ind.icon className="size-4" /> {ind.label}
                </span>
              ) : (
                <span key={ind.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-fg-2">
                  <ind.icon className="size-4 text-muted" /> {ind.label}
                  <span className="text-xs text-muted">· soon</span>
                </span>
              ),
            )}
          </div>
        </Container>
      </section>

      <CtaBand title="Give every patient an answer in under a minute" lead="Start from the clinic template: playbooks, price-list import, recall automations and review requests are pre-configured. 14 days free." />
    </>
  );
}
