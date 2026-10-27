"use client";

import {
  Ban,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Stethoscope,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { AiCallout, Avatar, Badge, Button, ChannelIcon, Drawer, Field, MetaRow, Modal, Select, useToast } from "@/components/ui";
import { channelMeta } from "@/components/ui/channel";
import { formatCurrency } from "@/lib/format";
import {
  allContacts,
  formatHour,
  locationLabel,
  providers,
  sellContactById,
  services,
  type Appointment,
  type AppointmentStatus,
  type Location,
  type ReminderStatus,
} from "@/lib/mock/sell";
import { PayLinkModal } from "./pay-link-modal";
import { AiBadge, providerColor } from "./shared";

export const apptStatusMeta: Record<AppointmentStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" | "info" | "primary"; icon: typeof Check }> = {
  confirmed: { label: "Confirmed", tone: "success", icon: CheckCircle2 },
  unconfirmed: { label: "Awaiting confirmation", tone: "warning", icon: Clock },
  completed: { label: "Completed", tone: "neutral", icon: Check },
  "checked-in": { label: "Checked in", tone: "info", icon: UserCheck },
  "no-show": { label: "No-show", tone: "danger", icon: TriangleAlert },
  cancelled: { label: "Cancelled", tone: "danger", icon: Ban },
};

const reminderMeta: Record<ReminderStatus, { label: string; tone: "success" | "info" | "neutral" | "danger"; icon: typeof Check }> = {
  read: { label: "Read", tone: "success", icon: CheckCheck },
  delivered: { label: "Delivered", tone: "info", icon: CheckCheck },
  sent: { label: "Sent", tone: "neutral", icon: Check },
  scheduled: { label: "Scheduled", tone: "neutral", icon: Clock },
  failed: { label: "Failed", tone: "danger", icon: TriangleAlert },
};

export function apptTimeLabel(a: Pick<Appointment, "start" | "duration">) {
  return `${formatHour(a.start)} – ${formatHour(a.start + a.duration / 60)}`;
}

export function AppointmentDrawer({
  appt,
  dayLabels,
  onClose,
  onUpdate,
}: {
  appt: Appointment | null;
  dayLabels: string[];
  onClose: () => void;
  onUpdate: (a: Appointment) => void;
}) {
  return (
    <Drawer open={Boolean(appt)} onClose={onClose} title="Appointment" width="max-w-md">
      {appt && <AppointmentBody key={appt.id} appt={appt} dayLabels={dayLabels} onUpdate={onUpdate} onClose={onClose} />}
    </Drawer>
  );
}

function AppointmentBody({ appt, dayLabels, onUpdate, onClose }: { appt: Appointment; dayLabels: string[]; onUpdate: (a: Appointment) => void; onClose: () => void }) {
  const toast = useToast();
  const [rescheduling, setRescheduling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [newDay, setNewDay] = useState(String(appt.day));
  const [newTime, setNewTime] = useState(String(appt.start));
  const [payOpen, setPayOpen] = useState(false);
  const service = services.find((s) => s.id === appt.serviceId)!;
  const provider = providers.find((p) => p.id === appt.providerId)!;
  const contact = appt.contactId ? sellContactById(appt.contactId) : undefined;
  const phone = contact?.phone ?? appt.phone;
  const status = apptStatusMeta[appt.status];
  const first = appt.patient.split(" ")[0];
  const closed = appt.status === "cancelled" || appt.status === "completed" || appt.status === "no-show";
  const times = Array.from({ length: 23 }, (_, i) => 8 + i * 0.5).filter((t) => t + appt.duration / 60 <= 20);

  return (
    <div>
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-start gap-3">
          <Avatar name={appt.patient} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">{appt.patient}</h2>
              {appt.bookedBy === "ai" && <AiBadge label="AI-BOOKED" />}
            </div>
            <div className="text-sm text-muted">{phone}</div>
          </div>
          <Badge tone={status.tone}>
            <status.icon /> {status.label}
          </Badge>
        </div>
        <div className="mt-4 rounded-lg border-l-[3px] bg-surface-2 px-3 py-2.5" style={{ borderLeftColor: providerColor(provider.color) }}>
          <div className="text-sm font-semibold">{service.name}</div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-2">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5 text-muted" /> {dayLabels[appt.day]} · {apptTimeLabel(appt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5 text-muted" /> {locationLabel[appt.location]}
            </span>
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="size-3.5 text-muted" /> {provider.name}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        {appt.bookedBy === "ai" && (
          <AiCallout title={`Booked by AI via ${appt.bookedVia ? channelMeta[appt.bookedVia].label : "chat"}`}>
            {appt.notes ?? `${first} asked for a slot and the AI offered 2 options from live availability, confirmed the booking and sent directions.`} Confidence 97%.
          </AiCallout>
        )}
        {appt.bookedBy !== "ai" && appt.notes && (
          <div className="rounded-lg border border-warning/20 bg-warning-soft/50 px-3 py-2 text-sm text-fg-2">
            <span className="font-medium text-fg">Note: </span>
            {appt.notes}
          </div>
        )}

        <section>
          <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Details</h4>
          <div className="divide-y divide-line">
            <MetaRow label="Service price">{formatCurrency(service.price)}</MetaRow>
            <MetaRow label="Deposit">
              {appt.deposit.status === "none" ? (
                <span className="text-muted">Not required</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {formatCurrency(appt.deposit.amount)}
                  {appt.deposit.status === "paid" ? (
                    <Badge tone="success">
                      <CheckCircle2 /> Paid · UPI
                    </Badge>
                  ) : appt.deposit.status === "refunded" ? (
                    <Badge>
                      <RotateCcw /> Refunded
                    </Badge>
                  ) : (
                    <Badge tone="warning">
                      <Clock /> Pending
                    </Badge>
                  )}
                </span>
              )}
            </MetaRow>
            <MetaRow label="Booked by">
              {appt.bookedBy === "ai" ? "Anvita AI" : appt.bookedBy === "online" ? "Patient (booking page)" : "Front desk"}
              {appt.bookedVia && (
                <span className="ml-1.5 inline-flex align-middle">
                  <ChannelIcon channel={appt.bookedVia} size="xs" />
                </span>
              )}
            </MetaRow>
            <MetaRow label="Duration">{appt.duration} min</MetaRow>
          </div>
          {appt.deposit.status === "pending" && !closed && (
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => setPayOpen(true)}>
              <IndianRupee /> Resend deposit link
            </Button>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Reminders</h4>
          <ul className="space-y-2">
            {appt.reminders.map((r) => {
              const meta = reminderMeta[r.status];
              return (
                <li key={r.label} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2">
                  <ChannelIcon channel={r.channel} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">
                      {r.label} reminder <span className="font-normal text-muted">· {channelMeta[r.channel].label}</span>
                    </div>
                    <div className="text-xs text-muted">{r.at}</div>
                  </div>
                  <Badge tone={meta.tone}>
                    <meta.icon /> {meta.label}
                  </Badge>
                  {r.status === "failed" && (
                    <Button size="xs" variant="outline" onClick={() => toast({ title: "Reminder resent by SMS", description: "WhatsApp failed (number not on WhatsApp). Fallback SMS delivered." })}>
                      Retry
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {rescheduling && (
          <section className="animate-fade-in rounded-lg border border-primary/30 bg-primary-soft/40 p-3">
            <div className="mb-2 text-sm font-medium">Reschedule</div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={newDay} onChange={(e) => setNewDay(e.target.value)} aria-label="New day">
                {dayLabels.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </Select>
              <Select value={newTime} onChange={(e) => setNewTime(e.target.value)} aria-label="New time">
                {times.map((t) => (
                  <option key={t} value={t}>
                    {formatHour(t)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button size="xs" variant="ghost" onClick={() => setRescheduling(false)}>
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  onUpdate({ ...appt, day: Number(newDay), start: Number(newTime), status: "confirmed" });
                  setRescheduling(false);
                  toast({ title: "Appointment rescheduled", description: `${dayLabels[Number(newDay)]} · ${formatHour(Number(newTime))}. AI sent the new time to ${first} on WhatsApp.` });
                }}
              >
                Save & notify
              </Button>
            </div>
          </section>
        )}

        {confirmCancel && (
          <section className="animate-fade-in rounded-lg border border-danger/30 bg-danger-soft/50 p-3 text-sm">
            <div className="font-medium">Cancel this appointment?</div>
            <p className="mt-0.5 text-fg-2">
              {first} gets a WhatsApp message with a link to rebook.{appt.deposit.status === "paid" && ` The ${formatCurrency(appt.deposit.amount)} deposit will be refunded to UPI.`}
            </p>
            <div className="mt-2 flex justify-end gap-2">
              <Button size="xs" variant="ghost" onClick={() => setConfirmCancel(false)}>
                Keep it
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => {
                  onUpdate({ ...appt, status: "cancelled", deposit: appt.deposit.status === "paid" ? { ...appt.deposit, status: "refunded" } : appt.deposit });
                  setConfirmCancel(false);
                  toast({ title: "Appointment cancelled", description: "Slot reopened on the booking page. Waitlist patient notified.", tone: "warning" });
                }}
              >
                Cancel appointment
              </Button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: `Opened chat with ${first}`, tone: "info" })}>
            <MessageCircle /> Message
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: `Calling ${phone}…`, tone: "info" })}>
            <Phone /> Call
          </Button>
          {!closed && (
            <>
              <Button variant="outline" size="sm" onClick={() => { setRescheduling(true); setConfirmCancel(false); }}>
                <CalendarClock /> Reschedule
              </Button>
              <Button variant="outline" size="sm" className="text-danger" onClick={() => { setConfirmCancel(true); setRescheduling(false); }}>
                <Ban /> Cancel
              </Button>
            </>
          )}
        </div>
        {!closed && (
          <Button
            className="w-full"
            onClick={() => {
              const next: AppointmentStatus = appt.status === "checked-in" ? "completed" : "checked-in";
              onUpdate({ ...appt, status: next });
              toast({ title: next === "checked-in" ? `${first} checked in` : "Visit completed", description: next === "completed" ? "AI will send the invoice and a review request in 2 hours." : `${provider.name} has been notified.` });
              if (next === "completed") onClose();
            }}
          >
            {appt.status === "checked-in" ? <><CheckCircle2 /> Mark visit complete</> : <><UserCheck /> Check in</>}
          </Button>
        )}
      </div>
      <PayLinkModal open={payOpen} onClose={() => setPayOpen(false)} defaultContactId={appt.contactId} defaultAmount={appt.deposit.amount} defaultPurpose="Consultation deposit" />
    </div>
  );
}

export function NewAppointmentModal({
  open,
  onClose,
  dayLabels,
  defaultDay,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  dayLabels: string[];
  defaultDay: number;
  onCreate: (a: Appointment) => void;
}) {
  if (!open) return null;
  return <NewAppointmentForm onClose={onClose} dayLabels={dayLabels} defaultDay={defaultDay} onCreate={onCreate} />;
}

function NewAppointmentForm({ onClose, dayLabels, defaultDay, onCreate }: { onClose: () => void; dayLabels: string[]; defaultDay: number; onCreate: (a: Appointment) => void }) {
  const toast = useToast();
  const patients = allContacts.filter((c) => !c.tags.includes("b2b"));
  const [contactId, setContactId] = useState(patients[0].id);
  const [serviceId, setServiceId] = useState(services[0].id);
  const [location, setLocation] = useState<Location>("kp");
  const eligible = providers.filter((p) => p.locations.includes(location));
  const [providerId, setProviderId] = useState(eligible[0].id);
  const [day, setDay] = useState(String(defaultDay));
  const [time, setTime] = useState("15");
  const service = services.find((s) => s.id === serviceId)!;
  const contact = patients.find((c) => c.id === contactId)!;
  const effectiveProvider = eligible.some((p) => p.id === providerId) ? providerId : eligible[0].id;

  return (
    <Modal
      open
      onClose={onClose}
      title="New appointment"
      description="The patient gets a WhatsApp confirmation and automatic reminders."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onCreate({
                id: `a${100 + Number(day) * 30 + Number(time) * 2}`,
                contactId,
                patient: contact.name,
                phone: contact.phone,
                serviceId,
                providerId: effectiveProvider,
                location,
                day: Number(day),
                start: Number(time),
                duration: service.duration,
                bookedBy: "staff",
                status: "confirmed",
                deposit: { amount: service.deposit, status: service.deposit ? "pending" : "none" },
                reminders: [
                  { label: "T-24h", channel: "whatsapp", status: "scheduled", at: "24h before" },
                  { label: "T-2h", channel: "whatsapp", status: "scheduled", at: "2h before" },
                ],
              });
              toast({ title: "Appointment booked", description: `${contact.name} · ${dayLabels[Number(day)]} ${formatHour(Number(time))} · confirmation sent on WhatsApp` });
              onClose();
            }}
          >
            Book appointment
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient" className="sm:col-span-2">
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            {patients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Service" className="sm:col-span-2">
          <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.duration} min · {formatCurrency(s.price)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Location">
          <Select value={location} onChange={(e) => setLocation(e.target.value as Location)}>
            <option value="kp">Koregaon Park</option>
            <option value="baner">Baner</option>
          </Select>
        </Field>
        <Field label="Provider">
          <Select value={effectiveProvider} onChange={(e) => setProviderId(e.target.value)}>
            {eligible.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Day">
          <Select value={day} onChange={(e) => setDay(e.target.value)}>
            {dayLabels.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Time">
          <Select value={time} onChange={(e) => setTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => 8 + i * 0.5)
              .filter((t) => t + service.duration / 60 <= 20)
              .map((t) => (
                <option key={t} value={t}>
                  {formatHour(t)}
                </option>
              ))}
          </Select>
        </Field>
      </div>
      {service.deposit > 0 && (
        <p className="mt-3 text-xs text-muted">
          A {formatCurrency(service.deposit)} deposit link will be sent with the confirmation.
        </p>
      )}
    </Modal>
  );
}
