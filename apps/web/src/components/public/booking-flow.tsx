"use client";

import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronLeft,
  CircleCheck,
  Clock,
  Download,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Avatar, Badge, Button, Checkbox, Input, Modal, Progress, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import {
  bookableServices,
  bookingDays,
  business,
  formatSlot,
  isOpen,
  providerBio,
  providersFor,
  serviceInfo,
  slotsFor,
  type BookingDay,
} from "@/lib/mock/public";
import type { Location } from "@/lib/mock/sell";
import { PaymentMethods } from "./payment-methods";
import { BusinessHeader, downloadFile, PoweredBy, SecureBadges, StatusMedallion } from "./shared";
import { WebchatWidget } from "./webchat-widget";

type StepId = "location" | "service" | "provider" | "time" | "details" | "payment";

const stepTitles: Record<StepId, string> = {
  location: "Choose a clinic",
  service: "What do you need?",
  provider: "Choose your dentist",
  time: "Pick a date & time",
  details: "Your details",
  payment: "Pay deposit to confirm",
};

const BOOKING_REF = "SD-4821";

function icsDate(dayKey: string, hour: number) {
  // clinic is in IST (UTC+5:30)
  const [y, m, d] = dayKey.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d, 0, 0) + (hour - 5.5) * 3600 * 1000;
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function BookingFlow() {
  const toast = useToast();
  const [step, setStep] = useState<StepId>("location");
  const [location, setLocation] = useState<Location | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | "any" | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [details, setDetails] = useState({ name: "", phone: "", email: "", notes: "" });
  const [whatsapp, setWhatsapp] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [tried, setTried] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [paidWith, setPaidWith] = useState<string | null>(null);
  const [done, setDone] = useState<null | "booked" | "cancelled">(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const service = bookableServices.find((s) => s.id === serviceId) ?? null;
  const loc = business.locations.find((l) => l.id === location) ?? null;
  const eligible = location && serviceId ? providersFor(serviceId, location) : [];
  const provider = providerId && providerId !== "any" ? eligible.find((p) => p.id === providerId) ?? null : null;
  const assigned = provider ?? eligible[0] ?? null;

  const steps: StepId[] = ["location", "service", "provider", "time", "details", ...(service && service.deposit > 0 ? (["payment"] as StepId[]) : [])];
  const index = steps.indexOf(step);

  const daySlots = useMemo(() => {
    if (!location || !serviceId || !providerId) return new Map<string, number[]>();
    return new Map(bookingDays.map((d) => [d.key, slotsFor(d, location, serviceId, providerId)]));
  }, [location, serviceId, providerId]);

  const firstDay = bookingDays.find((d) => (daySlots.get(d.key)?.length ?? 0) > 0);
  const activeDayKey = dayKey ?? firstDay?.key ?? bookingDays[0].key;
  const activeDay = bookingDays.find((d) => d.key === activeDayKey)!;
  const slots = daySlots.get(activeDayKey) ?? [];

  const phoneDigits = details.phone.replace(/\D/g, "");
  const errors = {
    name: details.name.trim().length < 2 ? "Please enter your full name" : "",
    phone: !/^[6-9]\d{9}$/.test(phoneDigits) ? "Enter a 10-digit Indian mobile number" : "",
    email: details.email && !/^\S+@\S+\.\S+$/.test(details.email) ? "That email doesn't look right" : "",
  };
  const detailsValid = !errors.name && !errors.phone && !errors.email;

  const go = (s: StepId) => {
    setStep(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => {
    const n = steps[index + 1];
    if (n) go(n);
  };
  const back = () => {
    if (rescheduling) {
      setRescheduling(false);
      setDone("booked");
      return;
    }
    const p = steps[index - 1];
    if (p) go(p);
  };

  const confirmWithoutDeposit = () => {
    setProcessing("Confirming your slot…");
    setTimeout(() => {
      setProcessing(null);
      setDone("booked");
      window.scrollTo({ top: 0 });
    }, 1200);
  };

  const pay = (method: string) => {
    setProcessing(`Waiting for ${method.split(" · ")[0]} to confirm…`);
    setTimeout(() => {
      setProcessing(null);
      setPaidWith(method);
      setDone("booked");
      window.scrollTo({ top: 0 });
    }, 2200);
  };

  const firstName = details.name.trim().split(/\s+/)[0] || "there";
  const when = slot !== null ? `${activeDay.label} · ${formatSlot(slot)}` : "";

  /* -------------------------------- render ------------------------------- */

  const summary = (
    <Summary
      items={[
        !!loc && { icon: MapPin, label: "Clinic", value: `${business.name}, ${loc.name}`, step: "location" as StepId },
        !!service && { icon: Stethoscope, label: "Service", value: `${service.name} · ${service.duration} min`, step: "service" as StepId },
        !!providerId && { icon: User, label: "Dentist", value: provider ? provider.name : "Any available dentist", step: "provider" as StepId },
        slot !== null && { icon: CalendarDays, label: "When", value: when, step: "time" as StepId },
      ]}
      onEdit={done ? undefined : go}
      service={service}
      paid={Boolean(paidWith)}
    />
  );

  let body: ReactNode;
  if (done === "cancelled") {
    body = (
      <div className="px-5 py-10 text-center">
        <StatusMedallion tone="info" icon={<CalendarDays />} />
        <h2 className="mt-4 text-lg font-semibold text-fg">Booking cancelled</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          {paidWith ? `Your ${formatCurrency(service?.deposit ?? 0)} deposit will be refunded to your original payment method in 3–5 working days.` : "No charges were made."} We&apos;ve sent a note on {whatsapp ? "WhatsApp" : "SMS"}.
        </p>
        <Button
          className="mt-5"
          onClick={() => {
            setDone(null);
            setSlot(null);
            setPaidWith(null);
            go("time");
          }}
        >
          Book a new time
        </Button>
      </div>
    );
  } else if (done === "booked" && service && loc && slot !== null) {
    body = (
      <Confirmation
        firstName={firstName}
        serviceName={service.name}
        duration={service.duration}
        providerName={assigned?.name ?? "Dr. Aditi Kulkarni"}
        when={when}
        dayKey={activeDayKey}
        slot={slot}
        loc={loc}
        deposit={paidWith ? service.deposit : 0}
        balance={service.price - (paidWith ? service.deposit : 0)}
        paidWith={paidWith}
        whatsapp={whatsapp}
        phone={`+91 ${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`}
        onReschedule={() => {
          setRescheduling(true);
          setDone(null);
          go("time");
        }}
        onCancel={() => setCancelOpen(true)}
      />
    );
  } else {
    body = (
      <>
        <div className="border-b border-line px-4 pt-4 pb-3 sm:px-5">
          <div className="flex items-center gap-2">
            {(index > 0 || rescheduling) && (
              <Button variant="ghost" size="icon-sm" onClick={back} aria-label="Back" className="-ml-1.5">
                <ChevronLeft />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium tracking-wide text-muted uppercase">
                {rescheduling ? "Reschedule" : `Step ${index + 1} of ${steps.length}`}
              </div>
              <h2 className="truncate text-base font-semibold text-fg sm:text-lg">{rescheduling ? "Pick a new time" : stepTitles[step]}</h2>
            </div>
          </div>
          {!rescheduling && <Progress value={((index + 1) / steps.length) * 100} className="mt-3" />}
        </div>

        <div className="p-4 sm:p-5">
          {step === "location" && (
            <div className="space-y-3">
              {business.locations.map((l) => {
                const todayOpen = isOpen(bookingDays[0], l.id);
                return (
                  <OptionCard
                    key={l.id}
                    selected={location === l.id}
                    onClick={() => {
                      if (location !== l.id) {
                        setServiceId(null);
                        setProviderId(null);
                        setSlot(null);
                        setDayKey(null);
                      }
                      setLocation(l.id);
                      setTimeout(() => go("service"), 120);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <MapPin className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-fg">{l.name}</span>
                          {todayOpen && (
                            <Badge tone="success" dot>
                              Open now
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 text-sm text-fg-2">{l.address}</div>
                        <div className="mt-1 text-xs text-muted">{l.landmark}</div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="inline-flex items-start gap-1">
                            <Clock className="mt-px size-3.5 shrink-0" aria-hidden /> {l.hours}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="mt-2 size-4 shrink-0 text-muted" aria-hidden />
                    </div>
                  </OptionCard>
                );
              })}
            </div>
          )}

          {step === "service" && location && (
            <div className="space-y-2.5">
              {bookableServices
                .filter((s) => providersFor(s.id, location).length > 0)
                .map((s) => (
                  <OptionCard
                    key={s.id}
                    selected={serviceId === s.id}
                    onClick={() => {
                      if (serviceId !== s.id) {
                        setProviderId(null);
                        setSlot(null);
                        setDayKey(null);
                      }
                      setServiceId(s.id);
                      setTimeout(() => go("provider"), 120);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-fg">{s.name}</span>
                          {serviceInfo[s.id].popular && <Badge tone="primary">Popular</Badge>}
                        </div>
                        <p className="mt-0.5 text-sm text-fg-2">{serviceInfo[s.id].blurb}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden /> {s.duration} min
                          </span>
                          <span>{s.deposit > 0 ? `${formatCurrency(s.deposit)} deposit to book` : "No deposit · pay at clinic"}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-semibold text-fg tabular">{formatCurrency(s.price)}</div>
                        {s.id === "sv3" && <div className="text-[11px] text-muted">0% EMI</div>}
                      </div>
                    </div>
                  </OptionCard>
                ))}
              <p className="pt-1 text-xs text-muted">
                {location === "kp" ? "Braces & aligner assessments are at our Baner clinic." : "Kids check-ups are at our Koregaon Park clinic."} Root canal and other
                treatments are booked after a consultation.
              </p>
            </div>
          )}

          {step === "provider" && location && serviceId && (
            <div className="space-y-2.5">
              {eligible.length > 1 && (
                <OptionCard
                  selected={providerId === "any"}
                  onClick={() => {
                    setProviderId("any");
                    setSlot(null);
                    setDayKey(null);
                    setTimeout(() => go("time"), 120);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name="Any" ai size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-fg">Any available dentist</div>
                      <div className="text-sm text-fg-2">Most availability · we&apos;ll match you with the right specialist</div>
                      <NextAvailable location={location} serviceId={serviceId} providerId="any" />
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
                  </div>
                </OptionCard>
              )}
              {eligible.map((p) => (
                <OptionCard
                  key={p.id}
                  selected={providerId === p.id}
                  onClick={() => {
                    setProviderId(p.id);
                    setSlot(null);
                    setDayKey(null);
                    setTimeout(() => go("time"), 120);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name.replace("Dr. ", "")} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className="font-semibold text-fg">{p.name}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs text-fg-2">
                          <Star className="size-3 fill-accent text-accent" aria-hidden /> {providerBio[p.id].rating}
                        </span>
                      </div>
                      <div className="text-sm text-fg-2">
                        {p.role} · {providerBio[p.id].years} yrs
                      </div>
                      <div className="text-xs text-muted">Speaks {providerBio[p.id].languages}</div>
                      <NextAvailable location={location} serviceId={serviceId} providerId={p.id} />
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
                  </div>
                </OptionCard>
              ))}
            </div>
          )}

          {step === "time" && location && (
            <div>
              <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 scroll-thin">
                <div className="flex gap-2">
                  {bookingDays.map((d) => {
                    const count = daySlots.get(d.key)?.length ?? 0;
                    const closed = !isOpen(d, location);
                    const active = d.key === activeDayKey;
                    return (
                      <button
                        key={d.key}
                        disabled={count === 0}
                        onClick={() => {
                          setDayKey(d.key);
                          setSlot(null);
                        }}
                        aria-pressed={active}
                        aria-label={`${d.label}${closed ? ", closed" : `, ${count} slots`}`}
                        className={cn(
                          "flex w-[60px] shrink-0 flex-col items-center rounded-xl border py-2 transition-colors",
                          active ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-fg hover:border-line-strong",
                          count === 0 && "opacity-45",
                        )}
                      >
                        <span className={cn("text-[11px] font-medium", active ? "text-primary-fg/85" : "text-muted")}>{d.weekday}</span>
                        <span className="text-lg leading-6 font-semibold tabular">{d.date}</span>
                        <span className={cn("text-[10px]", active ? "text-primary-fg/85" : "text-muted")}>
                          {closed ? "Closed" : count === 0 ? "Full" : `${count} slots`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-fg">{activeDay.label}</div>
                <div className="text-xs text-muted">Times in IST</div>
              </div>
              {slots.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">
                  No slots left on this day.
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => toast({ title: "Added to waitlist", description: `We'll WhatsApp you if a slot opens on ${activeDay.label}.` })}
                  >
                    Join the waitlist
                  </Button>
                </div>
              ) : (
                <div className="mt-2 space-y-4">
                  {[
                    { label: "Morning", from: 0, to: 12 },
                    { label: "Afternoon", from: 12, to: 17 },
                    { label: "Evening", from: 17, to: 24 },
                  ].map((g) => {
                    const list = slots.filter((h) => h >= g.from && h < g.to);
                    if (!list.length) return null;
                    return (
                      <div key={g.label}>
                        <div className="mb-1.5 text-xs font-medium text-muted">{g.label}</div>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {list.map((h) => (
                            <button
                              key={h}
                              onClick={() => setSlot(h)}
                              aria-pressed={slot === h}
                              className={cn(
                                "h-11 rounded-xl border text-sm font-semibold tabular transition-colors",
                                slot === h ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-fg hover:border-primary hover:text-primary",
                              )}
                            >
                              {formatSlot(h)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "details" && (
            <form
              id="details-form"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!detailsValid) return;
                if (service && service.deposit > 0) next();
                else confirmWithoutDeposit();
              }}
            >
              <FormRow id="name" label="Full name" error={tried ? errors.name : ""}>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="e.g. Ananya Rao"
                  value={details.name}
                  onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                  className="h-11 text-base sm:text-sm"
                  aria-invalid={Boolean(tried && errors.name)}
                />
              </FormRow>
              <FormRow id="phone" label="Mobile number" error={tried ? errors.phone : ""}>
                <div className="flex">
                  <span className="inline-flex h-11 shrink-0 items-center gap-1 rounded-l-lg whitespace-nowrap border border-r-0 border-line bg-surface-2 px-3 text-sm text-fg-2">🇮🇳 +91</span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98220 11223"
                    value={details.phone}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setDetails((x) => ({ ...x, phone: d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d }));
                    }}
                    className="h-11 rounded-l-none text-base tabular sm:text-sm"
                    aria-invalid={Boolean(tried && errors.phone)}
                  />
                </div>
              </FormRow>
              <FormRow id="email" label="Email" hint="optional, for your receipt" error={tried ? errors.email : ""}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={details.email}
                  onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
                  className="h-11 text-base sm:text-sm"
                />
              </FormRow>
              <FormRow id="notes" label="Anything we should know?" hint="optional">
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="e.g. sensitive teeth, first visit, wedding in December"
                  value={details.notes}
                  onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                  className="text-base sm:text-sm"
                />
              </FormRow>

              <div className="space-y-3 rounded-xl border border-line bg-surface-2/60 p-3.5">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <span className="mt-0.5">
                    <Checkbox checked={whatsapp} onChange={setWhatsapp} label="WhatsApp updates" />
                  </span>
                  <span className="text-sm text-fg-2">
                    <span className="flex items-center gap-1.5 font-medium text-fg">
                      <MessageCircle className="size-4 text-success" aria-hidden /> Send my confirmation & reminders on WhatsApp
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      I agree to receive appointment messages from {business.name} on WhatsApp at the number above. Reply STOP anytime to opt out. If unticked, we&apos;ll send
                      an SMS.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <span className="mt-0.5">
                    <Checkbox checked={marketing} onChange={setMarketing} label="Check-up reminders and offers" />
                  </span>
                  <span className="text-xs text-muted">
                    Also send me 6-monthly check-up reminders and occasional offers (max 2 a month). <span className="text-fg-2">Optional.</span>
                  </span>
                </label>
              </div>
              <p className="text-[11px] text-muted">
                By booking you agree to {business.name}&apos;s <a href="#terms" className="underline">terms</a> and{" "}
                <a href="#privacy" className="underline">privacy policy</a>. Your data is processed under India&apos;s DPDP Act, 2023.
              </p>
            </form>
          )}

          {step === "payment" && service && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-line">
                <div className="flex justify-between gap-3 px-3.5 py-2.5 text-sm">
                  <span className="text-fg-2">{service.name}</span>
                  <span className="text-fg tabular">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-line px-3.5 py-2.5 text-sm">
                  <span className="text-fg-2">Balance at clinic</span>
                  <span className="text-fg tabular">{formatCurrency(service.price - service.deposit)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-line bg-surface-2 px-3.5 py-3">
                  <span className="font-semibold text-fg">Deposit due now</span>
                  <span className="text-lg font-semibold text-fg tabular">{formatCurrency(service.deposit)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-xs text-fg-2">
                <ShieldCheck className="mt-px size-4 shrink-0 text-success" aria-hidden />
                <span>
                  <span className="font-medium text-fg">Fully refundable</span> if you cancel or reschedule up to 24 hours before. The deposit is adjusted in your final bill.
                </span>
              </div>
              <PaymentMethods amount={service.deposit} onPay={pay} seed={`book-${serviceId}-${slot}`} />
              <SecureBadges className="pt-1" />
            </div>
          )}
        </div>

        {(step === "time" || step === "details") && (
          <div className="sticky bottom-0 z-10 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-5">
            {step === "time" ? (
              <Button
                size="lg"
                className="w-full"
                disabled={slot === null}
                onClick={() => {
                  if (rescheduling) {
                    setRescheduling(false);
                    setDone("booked");
                    toast({ title: "Appointment rescheduled", description: `New time: ${when}. Your deposit carries over.` });
                    window.scrollTo({ top: 0 });
                  } else next();
                }}
              >
                {slot === null ? "Select a time" : rescheduling ? `Move to ${formatSlot(slot)}, ${activeDay.label}` : `Continue · ${formatSlot(slot)}, ${activeDay.label}`}
              </Button>
            ) : (
              <Button size="lg" className="w-full" type="submit" form="details-form">
                {service && service.deposit > 0 ? (
                  <>
                    Continue to payment <ArrowRight />
                  </>
                ) : (
                  <>
                    <Check /> Confirm booking
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-6 sm:px-6 sm:pt-8">
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <BusinessHeader
          action={
            <Button variant="outline" size="sm" onClick={() => setChatOpen(true)} aria-label="Chat with us">
              <MessageCircle />
              <span className="sm:hidden">Chat</span>
              <span className="hidden sm:inline">Chat with us</span>
            </Button>
          }
        />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {!done && (step !== "location" || rescheduling) && (
            <SummaryChips
              className="mb-3 lg:hidden"
              onEdit={go}
              items={[
                !!loc && { label: "Clinic", value: loc.name, step: "location" as StepId },
                !!service && { label: "Service", value: service.name, step: "service" as StepId },
                !!providerId && { label: "Dentist", value: provider ? provider.name : "Any dentist", step: "provider" as StepId },
                slot !== null && { label: "When", value: `${activeDay.label}, ${formatSlot(slot)}`, step: "time" as StepId },
              ]}
            />
          )}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {body}
            {processing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface/95 px-6 text-center backdrop-blur-sm" role="status">
                <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden />
                <div className="text-sm font-semibold text-fg">{processing}</div>
                <div className="text-xs text-muted">Please don&apos;t close this page.</div>
              </div>
            )}
          </div>
        </div>
        <aside className="hidden space-y-4 lg:block">
          {summary}
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm shadow-card">
            <div className="flex items-center gap-2 font-semibold text-fg">
              <Sparkles className="size-4 text-ai" aria-hidden /> Questions before you book?
            </div>
            <p className="mt-1 text-xs text-muted">Anvi, our assistant, answers in seconds, 24/7, in English, Hindi or Marathi.</p>
            <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => setChatOpen(true)}>
              <MessageCircle /> Chat with us
            </Button>
          </div>
        </aside>
      </div>

      <PoweredBy />

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        size="sm"
        title="Cancel this appointment?"
        description={paidWith ? `Your ${formatCurrency(service?.deposit ?? 0)} deposit will be refunded in full (more than 24 hours' notice).` : "You can always book again."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setCancelOpen(false);
                setDone("cancelled");
              }}
            >
              Cancel appointment
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-2">
          Want a different time instead?{" "}
          <button
            className="font-medium text-primary hover:underline"
            onClick={() => {
              setCancelOpen(false);
              setRescheduling(true);
              setDone(null);
              go("time");
            }}
          >
            Reschedule
          </button>
        </p>
      </Modal>

      <WebchatWidget open={chatOpen} onOpenChange={setChatOpen} launcher={false} greetingDelay={0} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "block w-full rounded-xl border p-3.5 text-left transition-all hover:border-primary/60 hover:shadow-card",
        selected ? "border-primary bg-primary-soft/50 ring-1 ring-primary" : "border-line bg-surface",
      )}
    >
      {children}
    </button>
  );
}

function FormRow({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
        {label} {hint && <span className="font-normal text-muted">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function NextAvailable({ location, serviceId, providerId }: { location: Location; serviceId: string; providerId: string }) {
  let found: { day: BookingDay; hour: number } | null = null;
  for (const d of bookingDays) {
    const s = slotsFor(d, location, serviceId, providerId);
    if (s.length) {
      found = { day: d, hour: s[0] };
      break;
    }
  }
  if (!found) return null;
  const label = found.day.offset === 0 ? "Today" : found.day.offset === 1 ? "Tomorrow" : found.day.label;
  return (
    <div className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
      <CalendarDays className="size-3.5" aria-hidden /> Next: {label}, {formatSlot(found.hour)}
    </div>
  );
}

function SummaryChips({
  items,
  onEdit,
  className,
}: {
  items: ({ label: string; value: string; step: StepId } | false)[];
  onEdit: (s: StepId) => void;
  className?: string;
}) {
  const list = items.filter(Boolean) as { label: string; value: string; step: StepId }[];
  if (!list.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {list.map((i) => (
        <button
          key={i.label}
          onClick={() => onEdit(i.step)}
          aria-label={`Change ${i.label.toLowerCase()}: ${i.value}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-fg-2 shadow-card hover:border-line-strong"
        >
          <Check className="size-3 shrink-0 text-success" aria-hidden />
          <span className="truncate">{i.value}</span>
          <Pencil className="size-3 shrink-0 text-muted" aria-hidden />
        </button>
      ))}
    </div>
  );
}

type SummaryItem = { icon: typeof MapPin; label: string; value: string; step: StepId };

function Summary({
  items,
  onEdit,
  service,
  paid,
}: {
  items: (SummaryItem | null | false)[];
  onEdit?: (s: StepId) => void;
  service: { price: number; deposit: number } | null;
  paid?: boolean;
}) {
  const list = items.filter(Boolean) as SummaryItem[];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="text-xs font-semibold tracking-wide text-muted uppercase">Your booking</div>
      {list.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Pick a clinic to get started. It takes about a minute.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {list.map(({ icon: Icon, label, value, step }) => (
            <li key={label} className="flex items-center gap-2.5 py-2">
              <Icon className="size-4 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-muted">{label}</div>
                <div className="truncate text-sm font-medium text-fg">{value}</div>
              </div>
              {onEdit && (
                <button onClick={() => onEdit(step)} className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-fg" aria-label={`Change ${label.toLowerCase()}`}>
                  <Pencil className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {service && (
        <div className="mt-2 flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="text-muted">{service.deposit > 0 ? (paid ? "Deposit paid" : "Deposit today") : "Pay at clinic"}</span>
          <span className="font-semibold text-fg tabular">{formatCurrency(service.deposit > 0 ? service.deposit : service.price)}</span>
        </div>
      )}
    </div>
  );
}

function Confirmation({
  firstName,
  serviceName,
  duration,
  providerName,
  when,
  dayKey,
  slot,
  loc,
  deposit,
  balance,
  paidWith,
  whatsapp,
  phone,
  onReschedule,
  onCancel,
}: {
  firstName: string;
  serviceName: string;
  duration: number;
  providerName: string;
  when: string;
  dayKey: string;
  slot: number;
  loc: (typeof business.locations)[number];
  deposit: number;
  balance: number;
  paidWith: string | null;
  whatsapp: boolean;
  phone: string;
  onReschedule: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const start = icsDate(dayKey, slot);
  const end = icsDate(dayKey, slot + duration / 60);
  const title = `${serviceName} · ${business.name}`;
  const where = `${business.name}, ${loc.address}`;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&location=${encodeURIComponent(where)}&details=${encodeURIComponent(`With ${providerName}. Booking ${BOOKING_REF}.`)}`;

  const ics = () => {
    downloadFile(
      `smile-dental-${BOOKING_REF}.ics`,
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Anvita//Booking//EN",
        "BEGIN:VEVENT",
        `UID:${BOOKING_REF}@anvita.ai`,
        `DTSTAMP:${icsDate("2026-10-27", 11.33)}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `LOCATION:${where.replace(/,/g, "\\,")}`,
        `DESCRIPTION:With ${providerName}. Booking ${BOOKING_REF}.`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n"),
      "text/calendar",
    );
    toast({ title: "Calendar file downloaded", description: "Open it to add the visit to Apple or Outlook Calendar." });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="text-center">
        <StatusMedallion tone="success" icon={<CircleCheck />} />
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-fg">You&apos;re booked, {firstName}!</h2>
        <p className="mt-1 text-sm text-muted">
          Booking {BOOKING_REF} · confirmation sent on {whatsapp ? "WhatsApp" : "SMS"} to {phone}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-line">
        <div className="space-y-3 p-4">
          <Row icon={CalendarDays} title={when} sub={`${duration} min · please arrive 10 min early`} />
          <Row icon={Stethoscope} title={serviceName} sub={`with ${providerName}`} />
          <Row icon={MapPin} title={`${business.name}, ${loc.name}`} sub={`${loc.landmark} · ${loc.parking}`} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2 px-4 py-2.5 text-sm">
          {deposit > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-fg-2">
              <CircleCheck className="size-4 text-success" aria-hidden /> {formatCurrency(deposit)} deposit paid · {paidWith?.split(" · ")[0]}
            </span>
          ) : (
            <span className="text-fg-2">Nothing to pay now</span>
          )}
          <span className="text-muted">Balance at clinic: {formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <a
          href={gcal}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg hover:bg-surface-2"
        >
          <CalendarPlus className="size-4" aria-hidden /> Google Calendar
        </a>
        <Button variant="outline" className="h-10" onClick={ics}>
          <Download /> Apple / Outlook
        </Button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(where)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg hover:bg-surface-2"
        >
          <Navigation className="size-4" aria-hidden /> Directions
        </a>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
          <MessageCircle className="size-3.5" aria-hidden /> {whatsapp ? "Sent to your WhatsApp just now" : "Sent by SMS just now"}
        </div>
        <div className="rounded-2xl bg-surface-2 p-3">
          <div className="max-w-[340px] rounded-2xl rounded-tl-md border border-line bg-surface p-3 text-sm text-fg shadow-card">
            <div className="text-xs font-semibold text-success">{business.name}</div>
            <p className="mt-1 whitespace-pre-line">
              {`✅ Booking confirmed, ${firstName}!\n\n🦷 ${serviceName} with ${providerName}\n📅 ${when}\n📍 ${loc.name}: ${loc.landmark}${deposit ? `\n💳 ${formatCurrency(deposit)} deposit received` : ""}\n\nWe'll remind you a day before.`}
            </p>
            <div className="mt-1 text-right text-[10px] text-muted">11:2{whatsapp ? "4" : "3"} AM {whatsapp && "✓✓"}</div>
            {whatsapp && (
              <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-line pt-2 text-center text-xs font-medium text-info">
                <span className="rounded-md py-1">👍 Confirm</span>
                <span className="rounded-md py-1">🔁 Reschedule</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <button onClick={onReschedule} className="font-medium text-primary hover:underline">
          Reschedule
        </button>
        <span className="text-line-strong" aria-hidden>
          |
        </span>
        <button onClick={onCancel} className="font-medium text-fg-2 hover:text-danger hover:underline">
          Cancel appointment
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Free changes up to 24 hours before · {business.phone}</p>
    </div>
  );
}

function Row({ icon: Icon, title, sub }: { icon: typeof MapPin; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-fg">{title}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </div>
  );
}
