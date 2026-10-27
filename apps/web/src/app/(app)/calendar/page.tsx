"use client";

import { Ban, CalendarDays, ChevronLeft, ChevronRight, Clock, IndianRupee, Plus, Settings2, Share2, Sparkles, TriangleAlert, UserCheck } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AiCallout, Button, Card, Page, PageHeader, Segmented, Tabs, useToast } from "@/components/ui";
import { AppointmentDrawer, NewAppointmentModal, apptTimeLabel } from "@/components/sell/appointment-drawer";
import { BookingSettings } from "@/components/sell/booking-settings";
import { AiBadge, providerColor } from "@/components/sell/shared";
import { cn } from "@/lib/cn";
import { appointments as seedAppointments, formatHour, NOW, providers, services, type Appointment, type Location } from "@/lib/mock/sell";

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_PX = 60;
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekDates(offset: number) {
  return Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 26 + offset * 7 + i));
}

function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

/** Lay out overlapping appointments side by side within a day column. */
function layoutDay(items: Appointment[]) {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.duration - a.duration);
  const result = new Map<string, { lane: number; lanes: number }>();
  let cluster: Appointment[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;
  const flush = () => {
    cluster.forEach((a) => result.set(a.id, { ...result.get(a.id)!, lanes: laneEnds.length }));
    cluster = [];
    laneEnds = [];
  };
  for (const a of sorted) {
    const end = a.start + a.duration / 60;
    if (a.start >= clusterEnd) flush();
    let lane = laneEnds.findIndex((e) => e <= a.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else laneEnds[lane] = end;
    result.set(a.id, { lane, lanes: 1 });
    cluster.push(a);
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();
  return result;
}

/** Other weeks reuse this week's pattern so navigation stays alive in the demo. */
function appointmentsForWeek(base: Appointment[], offset: number): Appointment[] {
  if (offset === 0) return base;
  return base
    .filter((_, i) => (i + offset * 2) % 4 !== 0)
    .map((a, i) => ({
      ...a,
      id: `${a.id}-w${offset}`,
      status: offset < 0 ? (i % 11 === 5 ? "no-show" : "completed") : i % 5 === 2 ? "unconfirmed" : "confirmed",
      bookedBy: (i + offset) % 3 === 0 ? "staff" : a.bookedBy,
      notes: undefined,
    }));
}

export default function CalendarPage() {
  const toast = useToast();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<"calendar" | "settings">("calendar");
  const [appts, setAppts] = useState<Appointment[]>(seedAppointments);
  const [offset, setOffset] = useState(0);
  const [viewPref, setViewPref] = useState<"day" | "week" | null>(null);
  const [day, setDay] = useState(NOW.dayIndex);
  const [location, setLocation] = useState<"all" | Location>("all");
  const [hidden, setHidden] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, Appointment>>({});

  const view = viewPref ?? (isMobile ? "day" : "week");
  const dates = weekDates(offset);
  const dayLabels = dates.map((d, i) => `${dayNames[i]}, ${d.getDate()} ${monthNames[d.getMonth()]}`);
  const rangeLabel = `${dates[0].getDate()} ${monthNames[dates[0].getMonth()]} – ${dates[6].getDate()} ${monthNames[dates[6].getMonth()]} ${dates[6].getFullYear()}`;
  const isThisWeek = offset === 0;

  const weekAppts = useMemo(() => appointmentsForWeek(appts, offset).map((a) => overrides[a.id] ?? a), [appts, offset, overrides]);
  const filtered = weekAppts.filter((a) => (location === "all" || a.location === location) && !hidden.includes(a.providerId));
  const visibleDays = view === "week" ? [0, 1, 2, 3, 4, 5, 6] : [day];

  const active = filtered.filter((a) => a.status !== "cancelled");
  const stats = {
    total: active.length,
    ai: active.filter((a) => a.bookedBy === "ai").length,
    depositsPending: active.filter((a) => a.deposit.status === "pending").length,
    unconfirmed: active.filter((a) => a.status === "unconfirmed").length,
  };
  const openAppt = weekAppts.find((a) => a.id === openId) ?? null;

  const toggleProvider = (id: string) => setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  return (
    <Page>
      <PageHeader
        title="Calendar"
        description="Appointments across both clinics. The AI books, confirms and reminds patients on WhatsApp."
        actions={
          <>
            <Button variant="outline" onClick={() => toast({ title: "Booking link copied", description: "https://smiledental.anvita.app/book", tone: "info" })}>
              <Share2 /> Share booking link
            </Button>
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> New appointment
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { value: "calendar", label: "Schedule", icon: <CalendarDays /> },
          { value: "settings", label: "Booking settings", icon: <Settings2 /> },
        ]}
      />

      {tab === "settings" ? (
        <BookingSettings />
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: CalendarDays, label: "Appointments · week", value: stats.total, tone: "text-primary" },
              { icon: Sparkles, label: "Booked by AI", value: `${stats.ai} · ${stats.total ? Math.round((stats.ai / stats.total) * 100) : 0}%`, tone: "text-ai" },
              { icon: IndianRupee, label: "Deposits pending", value: stats.depositsPending, tone: "text-warning" },
              { icon: Clock, label: "Unconfirmed", value: stats.unconfirmed, tone: "text-info" },
            ].map((s) => (
              <Card key={s.label} className="flex items-center gap-3 px-4 py-3">
                <s.icon className={cn("size-5 shrink-0", s.tone)} />
                <div className="min-w-0">
                  <div className="text-lg leading-tight font-semibold tabular">{s.value}</div>
                  <div className="truncate text-xs text-muted">{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon-sm" aria-label="Previous week" onClick={() => setOffset((o) => o - 1)}>
                    <ChevronLeft />
                  </Button>
                  <Button variant="outline" size="icon-sm" aria-label="Next week" onClick={() => setOffset((o) => o + 1)}>
                    <ChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOffset(0);
                      setDay(NOW.dayIndex);
                    }}
                  >
                    Today
                  </Button>
                </div>
                <h2 className="text-sm font-semibold sm:text-base">{view === "week" ? rangeLabel : `${dayLabels[day]} ${dates[day].getFullYear()}`}</h2>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <Segmented
                    value={location}
                    onChange={setLocation}
                    items={[
                      { value: "all", label: "All" },
                      { value: "kp", label: "Koregaon Park" },
                      { value: "baner", label: "Baner" },
                    ]}
                  />
                  <Segmented
                    value={view}
                    onChange={(v) => setViewPref(v)}
                    items={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by provider">
                {providers.map((p) => {
                  const on = !hidden.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProvider(p.id)}
                      aria-pressed={on}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                        on ? "border-line bg-surface text-fg" : "border-dashed border-line text-muted line-through",
                      )}
                    >
                      <span className="size-2.5 rounded-full" style={{ background: on ? providerColor(p.color) : "var(--line-strong)" }} />
                      {p.name}
                      <span className="hidden font-normal text-muted sm:inline">· {p.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {view === "day" && (
              <div className="scroll-thin flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
                {dates.map((d, i) => {
                  const count = weekAppts.filter((a) => a.day === i && a.status !== "cancelled" && (location === "all" || a.location === location)).length;
                  const isToday = isThisWeek && i === NOW.dayIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setDay(i)}
                      aria-pressed={day === i}
                      className={cn(
                        "relative flex min-w-10 flex-1 flex-col items-center rounded-lg py-1.5 text-xs transition-colors",
                        day === i ? "bg-primary text-primary-fg" : "text-fg-2 hover:bg-surface-2",
                      )}
                    >
                      <span className={cn(day === i ? "opacity-90" : "text-muted")}>{dayNames[i]}</span>
                      <span className="text-sm font-semibold">{d.getDate()}</span>
                      <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", isToday ? (day === i ? "bg-primary-fg" : "bg-danger") : "bg-transparent")} />
                      <span className="sr-only">{count} appointments</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="scroll-thin overflow-x-auto">
              <div className={cn(view === "week" && "min-w-[860px]")}>
                {/* Day headers */}
                {view === "week" && (
                  <div className="sticky top-0 z-10 flex border-b border-line bg-surface">
                    <div className="w-14 shrink-0" />
                    {visibleDays.map((i) => {
                      const isToday = isThisWeek && i === NOW.dayIndex;
                      const count = filtered.filter((a) => a.day === i && a.status !== "cancelled").length;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setDay(i);
                            setViewPref("day");
                          }}
                          className="flex flex-1 flex-col items-center border-l border-line py-2 hover:bg-surface-2"
                          aria-label={`Open ${dayLabels[i]} in day view`}
                        >
                          <span className={cn("text-[11px] font-medium uppercase", isToday ? "text-primary" : "text-muted")}>{dayNames[i]}</span>
                          <span className={cn("mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold", isToday ? "bg-primary text-primary-fg" : "text-fg")}>
                            {dates[i].getDate()}
                          </span>
                          <span className="text-[10px] text-muted">{count ? `${count} appt${count > 1 ? "s" : ""}` : "—"}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Grid */}
                <div className="relative flex">
                  <div className="w-14 shrink-0">
                    {hours.map((h) => (
                      <div key={h} className="relative border-b border-transparent" style={{ height: HOUR_PX }}>
                        <span className={cn("absolute right-2 text-[10px] text-muted tabular", h === START_HOUR ? "top-0.5" : "-top-2")}>{formatHour(h).replace(":00", "")}</span>
                      </div>
                    ))}
                  </div>
                  {visibleDays.map((i) => {
                    const items = filtered.filter((a) => a.day === i);
                    const layout = layoutDay(items.filter((a) => a.status !== "cancelled"));
                    const isToday = isThisWeek && i === NOW.dayIndex;
                    const closedSunday = i === 6 && location === "kp";
                    return (
                      <div key={i} className={cn("relative flex-1 border-l border-line", isToday && "bg-primary-soft/25")} style={{ height: hours.length * HOUR_PX }}>
                        {hours.map((h) => (
                          <div key={h} className="border-b border-line/70" style={{ height: HOUR_PX }}>
                            <div className="h-1/2 border-b border-dashed border-line/40" />
                          </div>
                        ))}
                        {(closedSunday || i === 6) && (
                          <div
                            className="pointer-events-none absolute inset-x-0 bg-surface-2/70"
                            style={{ top: closedSunday ? 0 : (13 - START_HOUR) * HOUR_PX, bottom: 0, backgroundImage: "repeating-linear-gradient(135deg, transparent 0 6px, var(--line) 6px 7px)" }}
                          >
                            <span className="absolute top-2 left-2 text-[10px] font-medium text-muted">{closedSunday ? "Closed" : "Closed after 1 PM"}</span>
                          </div>
                        )}
                        {items.map((a) => {
                          const pos = layout.get(a.id) ?? { lane: 0, lanes: 1 };
                          const provider = providers.find((p) => p.id === a.providerId)!;
                          const service = services.find((s) => s.id === a.serviceId)!;
                          const color = providerColor(provider.color);
                          const top = (a.start - START_HOUR) * HOUR_PX;
                          const height = Math.max(22, (a.duration / 60) * HOUR_PX - 2);
                          const cancelled = a.status === "cancelled";
                          const muted = a.status === "completed" || cancelled;
                          const compact = height < 40;
                          const StatusIcon = a.status === "no-show" ? TriangleAlert : a.status === "checked-in" ? UserCheck : cancelled ? Ban : a.status === "unconfirmed" ? Clock : null;
                          return (
                            <button
                              key={a.id}
                              onClick={() => setOpenId(a.id)}
                              aria-label={`${a.patient}, ${service.name}, ${apptTimeLabel(a)}, ${provider.name}, ${a.status}${a.bookedBy === "ai" ? ", booked by AI" : ""}`}
                              className={cn(
                                "absolute overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left shadow-card transition hover:z-20 hover:shadow-pop focus-visible:z-20",
                                muted && "opacity-60",
                                cancelled && "z-0 opacity-40",
                              )}
                              style={{
                                top: top + 1,
                                height,
                                left: cancelled ? "2px" : `calc(${(pos.lane / pos.lanes) * 100}% + 2px)`,
                                width: cancelled ? "calc(100% - 4px)" : `calc(${100 / pos.lanes}% - 4px)`,
                                borderLeftColor: color,
                                background: `color-mix(in srgb, ${color} 14%, var(--surface))`,
                              }}
                            >
                              <div className="flex items-start gap-1">
                                <span className={cn("min-w-0 flex-1 truncate text-[11px] leading-tight font-semibold text-fg", cancelled && "line-through")}>{a.patient}</span>
                                {StatusIcon && <StatusIcon className={cn("mt-px size-3 shrink-0", a.status === "no-show" || cancelled ? "text-danger" : a.status === "checked-in" ? "text-info" : "text-warning")} aria-hidden />}
                                {a.bookedBy === "ai" && <AiBadge />}
                              </div>
                              {!compact && (
                                <div className="mt-0.5 truncate text-[10px] leading-tight text-fg-2">
                                  {formatHour(a.start)} · {service.name}
                                </div>
                              )}
                              {height >= 70 && view === "day" && <div className="mt-0.5 truncate text-[10px] text-muted">{provider.name}</div>}
                            </button>
                          );
                        })}
                        {isToday && NOW.hour >= START_HOUR && NOW.hour <= END_HOUR && (
                          <div className="pointer-events-none absolute inset-x-0 z-30 flex items-center" style={{ top: (NOW.hour - START_HOUR) * HOUR_PX }} aria-label={`Now, ${formatHour(NOW.hour)}`}>
                            <span className="-ml-1 size-2 rounded-full bg-danger" />
                            <span className="h-0.5 flex-1 bg-danger" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <AiBadge /> Booked by AI
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3 text-warning" /> Awaiting confirmation
              </span>
              <span className="inline-flex items-center gap-1">
                <UserCheck className="size-3 text-info" /> Checked in
              </span>
              <span className="inline-flex items-center gap-1">
                <TriangleAlert className="size-3 text-danger" /> No-show
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-0.5 w-3 bg-danger" /> Now
              </span>
            </div>
          </Card>

          {isThisWeek && (
            <AiCallout
              className="mt-4"
              title="2 no-show risks today"
              action={
                <Button size="xs" variant="outline" onClick={() => toast({ title: "Confirmation nudges sent", description: "Rajesh Nambiar and Sneha Iyer got a WhatsApp “Reply 1 to confirm” message." })}>
                  Send confirmation nudge
                </Button>
              }
            >
              Rajesh Nambiar (3:00 PM, Baner) hasn&apos;t confirmed and has missed a visit before. Saturday is 85% booked; the AI is offering the waitlist Sat 2:30 PM.
            </AiCallout>
          )}
        </>
      )}

      <AppointmentDrawer appt={openAppt} dayLabels={dayLabels} onClose={() => setOpenId(null)} onUpdate={(a) => (offset === 0 ? setAppts((list) => list.map((x) => (x.id === a.id ? a : x))) : setOverrides((o) => ({ ...o, [a.id]: a })))} />
      <NewAppointmentModal open={newOpen} onClose={() => setNewOpen(false)} dayLabels={dayLabels} defaultDay={view === "day" ? day : NOW.dayIndex} onCreate={(a) => setAppts((list) => [...list, a])} />
    </Page>
  );
}
