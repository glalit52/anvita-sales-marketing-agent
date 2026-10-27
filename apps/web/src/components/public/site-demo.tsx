"use client";

import { ArrowRight, Award, Baby, CalendarCheck, Clock, Menu, MapPin, MessageCircle, Navigation, Phone, ShieldCheck, Sparkles, Star, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, Button, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { business, providerBio, siteServices, testimonials } from "@/lib/mock/public";
import { providers } from "@/lib/mock/sell";
import { BusinessMonogram, Stars } from "./shared";
import { WebchatWidget } from "./webchat-widget";

const BOOK = `/book/${business.slug}`;
const nav = [
  { href: "#services", label: "Services" },
  { href: "#doctors", label: "Doctors" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function SiteDemo() {
  const toast = useToast();
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-dvh bg-surface">
      {/* demo ribbon */}
      <div className="flex items-center justify-center gap-2 bg-fg px-4 py-1.5 text-center text-[11px] text-bg">
        <Sparkles className="size-3.5 shrink-0" aria-hidden />
        <span>
          Demo website. The chat bubble is the live <span className="font-semibold">Anvita webchat</span> widget.
        </span>
        <Link href="/dashboard" className="hidden font-semibold underline sm:inline">
          Back to Anvita
        </Link>
      </div>

      {/* nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <BusinessMonogram size="sm" />
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-fg">{business.name}</span>
              <span className="block text-[11px] text-muted">Koregaon Park · Baner</span>
            </span>
          </a>
          <nav className="ml-6 hidden items-center gap-6 text-sm text-fg-2 md:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-fg">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="hidden items-center gap-1.5 text-sm font-medium text-fg-2 hover:text-fg lg:inline-flex">
              <Phone className="size-4" aria-hidden /> {business.phone}
            </a>
            <Link href={BOOK} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-fg shadow-card hover:bg-primary-hover">
              Book now
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
              {menu ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menu && (
          <nav className="border-t border-line px-4 py-2 md:hidden">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="block rounded-lg px-2 py-2.5 text-sm font-medium text-fg-2 hover:bg-surface-2">
                {n.label}
              </a>
            ))}
            <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-fg-2">
              <Phone className="size-4" aria-hidden /> {business.phone}
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        {/* hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-soft/70 to-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg-2 shadow-card">
                <Star className="size-3.5 fill-accent text-accent" aria-hidden /> {business.rating} on Google · {formatNumber(business.reviewCount)} reviews
              </span>
              <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-fg sm:text-5xl">
                Gentle, modern dentistry in&nbsp;Pune.
              </h1>
              <p className="mt-4 max-w-md text-base text-fg-2 sm:text-lg">
                Whitening, aligners, implants and family check-ups at Koregaon Park and Baner. Clear prices, 0% EMI, and slots 7 days a week.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={BOOK} className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-primary-fg shadow-card hover:bg-primary-hover">
                  <CalendarCheck className="size-5" aria-hidden /> Book online
                </Link>
                <button
                  onClick={() => toast({ title: "Opening WhatsApp", description: `Chat with ${business.name} on ${business.whatsapp}`, tone: "info" })}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-base font-medium text-fg hover:bg-surface-2"
                >
                  <MessageCircle className="size-5 text-success" aria-hidden /> WhatsApp us
                </button>
              </div>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-4 text-sm">
                {[
                  ["12+ yrs", "caring for Pune"],
                  ["2 clinics", "KP & Baner"],
                  ["0% EMI", "on treatments"],
                ].map(([a, b]) => (
                  <div key={a}>
                    <div className="text-lg font-semibold text-fg">{a}</div>
                    <div className="text-xs text-muted">{b}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="aspect-[4/3.6] rounded-[2rem] bg-gradient-to-br from-[#0f9aa6] to-[#0b6f7a] p-6 shadow-pop">
                <div className="flex h-full flex-col text-white">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/85">
                    <ShieldCheck className="size-4" aria-hidden /> ISO-certified sterilisation
                  </div>
                  <div className="mt-4 text-2xl font-semibold">Smile brighter this Diwali</div>
                  <div className="mt-1 text-sm text-white/85">Free whitening consultation till 15 Nov</div>
                  <div className="flex flex-1 items-center justify-center text-[6rem] leading-none" aria-hidden>
                    🦷
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 w-56 rounded-2xl border border-line bg-surface p-3 shadow-pop sm:-left-8">
                <div className="flex items-center gap-2 text-xs font-medium text-success">
                  <span className="size-2 rounded-full bg-success" aria-hidden /> Next available
                </div>
                <div className="mt-1 text-sm font-semibold text-fg">Today, 4:30 PM</div>
                <div className="text-xs text-muted">Dr. Aditi Kulkarni · Baner</div>
              </div>
              <div className="absolute -right-2 -bottom-5 hidden w-52 rounded-2xl border border-line bg-surface p-3 shadow-pop sm:block">
                <Stars value={5} size="xs" />
                <p className="mt-1 line-clamp-2 text-xs text-fg-2">&ldquo;Booked on WhatsApp at midnight and got a slot the next morning.&rdquo;</p>
                <div className="mt-1 text-[11px] text-muted">Meera N. · Google</div>
              </div>
            </div>
          </div>
        </section>

        {/* services */}
        <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <SectionTitle eyebrow="Treatments" title="Everything your smile needs, under one roof" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siteServices.map((s) => (
              <div key={s.id} className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-pop">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  {s.id === "sv8" ? <Baby className="size-5" aria-hidden /> : <Sparkles className="size-5" aria-hidden />}
                </div>
                <h3 className="mt-4 font-semibold text-fg">{s.name}</h3>
                <p className="mt-1 flex-1 text-sm text-fg-2">{s.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted">
                    from <span className="font-semibold text-fg">{formatCurrency(s.from)}</span>
                  </span>
                  <Link href={BOOK} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Book <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* doctors */}
        <section id="doctors" className="scroll-mt-20 bg-bg">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionTitle eyebrow="Our team" title="Dentists who explain, not upsell" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {providers.map((p) => (
                <div key={p.id} className="rounded-2xl border border-line bg-surface p-5 text-center">
                  <Avatar name={p.name.replace("Dr. ", "")} size="lg" className="mx-auto" />
                  <div className="mt-3 font-semibold text-fg">{p.name}</div>
                  <div className="text-sm text-fg-2">{p.role}</div>
                  <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Award className="size-3.5" aria-hidden /> {providerBio[p.id].years} yrs
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-accent text-accent" aria-hidden /> {providerBio[p.id].rating}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{providerBio[p.id].languages}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* reviews */}
        <section id="reviews" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Reviews" title="Loved by 1,970+ patients" />
            <div className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3">
              <span className="text-3xl font-semibold text-fg">{business.rating}</span>
              <div>
                <Stars value={5} />
                <div className="text-xs text-muted">{formatNumber(business.reviewCount)} Google reviews</div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
                <Stars value={t.rating} />
                <blockquote className="mt-3 flex-1 text-sm text-fg-2">&ldquo;{t.text}&rdquo;</blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-fg">{t.name}</div>
                    <div className="text-[11px] text-muted">Google · {t.when}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="scroll-mt-20 bg-bg">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionTitle eyebrow="Visit us" title="Two clinics, open 7 days" />
            <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <MapMock />
              <div className="space-y-4">
                {business.locations.map((l) => (
                  <div key={l.id} className="rounded-2xl border border-line bg-surface p-5">
                    <div className="flex items-center gap-2 font-semibold text-fg">
                      <MapPin className="size-4 text-primary" aria-hidden /> {l.name}
                    </div>
                    <p className="mt-1 text-sm text-fg-2">{l.address}</p>
                    <p className="text-xs text-muted">{l.landmark} · {l.parking}</p>
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-fg-2">
                      <Clock className="mt-px size-3.5 shrink-0 text-muted" aria-hidden /> {l.hours}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${l.address}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg hover:bg-surface-2"
                      >
                        <Navigation className="size-4" aria-hidden /> Directions
                      </a>
                      <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-fg-2 hover:bg-surface-2">
                        <Phone className="size-4" aria-hidden /> {l.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-primary to-ai p-8 text-white sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ready for your check-up?</h2>
              <p className="mt-1 text-white/85">Book in under a minute. Free cancellation up to 24 hours before.</p>
            </div>
            <Link href={BOOK} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-5 font-medium text-[#3b2a9c] hover:bg-white/90">
              Book an appointment <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 pb-24 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-8">
          <div className="flex items-center gap-2">
            <BusinessMonogram size="sm" />
            <span>
              © 2026 {business.legalName} · GSTIN {business.gstin}
            </span>
          </div>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-fg">
              Privacy
            </a>
            <a href="#terms" className="hover:text-fg">
              Terms
            </a>
            <a href={`mailto:${business.email}`} className="hover:text-fg">
              {business.email}
            </a>
          </div>
        </div>
      </footer>

      <WebchatWidget />
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</div>
      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{title}</h2>
    </div>
  );
}

function MapMock() {
  const pins = [
    { name: "Koregaon Park", x: "68%", y: "58%" },
    { name: "Baner", x: "22%", y: "30%" },
  ];
  return (
    <div
      className="relative min-h-72 overflow-hidden rounded-2xl border border-line bg-surface-2"
      role="img"
      aria-label="Map showing the Koregaon Park and Baner clinics in Pune"
      style={{
        backgroundImage:
          "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    >
      {/* roads & river */}
      <div className="absolute top-[44%] -left-10 h-3 w-[130%] -rotate-12 bg-surface shadow-card" />
      <div className="absolute top-0 left-[48%] h-full w-3 rotate-6 bg-surface shadow-card" />
      <div className="absolute top-[72%] -left-10 h-6 w-[130%] rotate-3 rounded-full bg-info-soft" />
      <span className="absolute top-[78%] left-[8%] text-[10px] font-medium text-info">Mula–Mutha river</span>
      <span className="absolute top-[38%] left-[56%] text-[10px] font-medium text-muted">Pune University Rd</span>
      {pins.map((p) => (
        <div key={p.name} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: p.x, top: p.y }}>
          <div className="flex flex-col items-center">
            <span className="rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-fg shadow-pop">
              Smile Dental · {p.name}
            </span>
            <MapPin className="mt-0.5 size-7 fill-primary text-surface" aria-hidden />
          </div>
        </div>
      ))}
      <div className={cn("absolute right-3 bottom-3 rounded-md bg-surface/90 px-2 py-1 text-[10px] text-muted")}>Map data © Pune</div>
    </div>
  );
}
