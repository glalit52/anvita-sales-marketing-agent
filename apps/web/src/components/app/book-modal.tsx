"use client";

import { CalendarCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, Field, Modal, Segmented, Select, Switch, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { TODAY, dateLabel, dayLabel } from "@/lib/mock/app";
import type { Contact } from "@/lib/mock/core";
import { formatHour, locationLabel, providers, services, type Location } from "@/lib/mock/sell";

export interface BookedSlot {
  id: string;
  serviceId: string;
  providerId: string;
  location: Location;
  day: number;
  start: number;
}

const slots = [9.5, 10, 11, 12.5, 15, 16.5, 17.5, 18.5];

/** Lightweight booking modal for a known contact (the calendar's modal picks a patient). */
export function BookModal({ open, contact, onClose, onBooked }: { open: boolean; contact: Contact; onClose: () => void; onBooked: (slot: BookedSlot) => void }) {
  if (!open) return null;
  return <BookForm contact={contact} onClose={onClose} onBooked={onBooked} />;
}

function BookForm({ contact, onClose, onBooked }: { contact: Contact; onClose: () => void; onBooked: (slot: BookedSlot) => void }) {
  const toast = useToast();
  const first = contact.name.split(" ")[0];
  const guess = contact.tags.includes("whitening") ? "sv2" : contact.tags.includes("implants") ? "sv6" : contact.tags.some((t) => t.includes("braces") || t.includes("aligner")) ? "sv7" : contact.tags.includes("kids dentistry") ? "sv8" : "sv1";
  const [serviceId, setServiceId] = useState(guess);
  const [location, setLocation] = useState<Location>("kp");
  const eligible = providers.filter((p) => p.locations.includes(location));
  const [providerId, setProviderId] = useState(eligible[0].id);
  const days = Array.from({ length: 6 }, (_, i) => TODAY + 1 + i).filter((d) => dateLabel(d).slice(0, 3) !== "Sun");
  const [day, setDay] = useState(days[0]);
  const [start, setStart] = useState<number | null>(slots[1]);
  const [deposit, setDeposit] = useState(true);
  const [notify, setNotify] = useState(true);
  const service = services.find((s) => s.id === serviceId)!;
  const busy = (d: number, s: number) => (d * 7 + s * 3) % 5 === 0;

  const confirm = () => {
    if (start === null) return;
    onBooked({ id: `bk-${Date.now()}`, serviceId, providerId: eligible.some((p) => p.id === providerId) ? providerId : eligible[0].id, location, day, start });
    toast({
      title: `${service.name} booked for ${first}`,
      description: `${dayLabel(day)}, ${formatHour(start)} · ${locationLabel[location]}${notify ? ". WhatsApp confirmation sent" : ""}${deposit && service.deposit ? ` with ${formatCurrency(service.deposit)} deposit link` : ""}.`,
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={`Book ${first}`}
      description={`${contact.phone} · prefers ${contact.language}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={start === null}>
            <CalendarCheck /> Confirm booking
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Service">
            <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.duration} min · {formatCurrency(s.price)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Provider">
            <Select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
              {eligible.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.role}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Location">
          <Segmented
            value={location}
            onChange={(v) => {
              setLocation(v);
              const next = providers.filter((p) => p.locations.includes(v));
              if (!next.some((p) => p.id === providerId)) setProviderId(next[0].id);
            }}
            items={[
              { value: "kp", label: "Koregaon Park" },
              { value: "baner", label: "Baner" },
            ]}
          />
        </Field>
        <Field label="Day">
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                aria-pressed={d === day}
                className={cn("rounded-lg border px-3 py-1.5 text-sm", d === day ? "border-primary bg-primary-soft font-medium text-primary" : "border-line hover:bg-surface-2")}
              >
                {dayLabel(d)}
                {d !== TODAY + 1 && <span className="ml-1 text-xs text-muted">{dateLabel(d).split(", ")[1]}</span>}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Time" hint="Free slots for the chosen provider">
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s) => {
              const taken = busy(day, s);
              return (
                <button
                  key={s}
                  disabled={taken}
                  onClick={() => setStart(s)}
                  aria-pressed={start === s}
                  className={cn(
                    "rounded-lg border py-1.5 text-sm tabular disabled:cursor-not-allowed disabled:text-muted disabled:line-through",
                    start === s ? "border-primary bg-primary-soft font-medium text-primary" : "border-line hover:bg-surface-2",
                  )}
                >
                  {formatHour(s)}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="space-y-2 rounded-lg border border-line p-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Collect deposit{" "}
              <span className="text-muted">{service.deposit ? formatCurrency(service.deposit) : "(none for this service)"}</span>
            </span>
            <Switch checked={deposit && service.deposit > 0} disabled={!service.deposit} onChange={setDeposit} label="Collect deposit" size="sm" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Send WhatsApp confirmation + T-24h / T-2h reminders</span>
            <Switch checked={notify} onChange={setNotify} label="Send confirmation" size="sm" />
          </label>
        </div>
        <p className="flex items-start gap-2 text-xs text-muted">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ai" />
          AI suggests {formatHour(slots[1])} on {dayLabel(days[0])}: {first} replied fastest in the mornings.
        </p>
      </div>
    </Modal>
  );
}
