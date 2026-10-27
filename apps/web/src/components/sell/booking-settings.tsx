"use client";

import { Copy, ExternalLink, Globe, MapPin, Plus, QrCode, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ChannelIcon, Input, Segmented, Select, Switch, useToast } from "@/components/ui";
import type { Channel } from "@/components/ui/channel";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { locationLabel, services as seedServices, workingHours, type Location, type Service } from "@/lib/mock/sell";

interface ReminderRule {
  id: string;
  label: string;
  detail: string;
  channel: Channel;
  on: boolean;
}

export function BookingSettings() {
  const toast = useToast();
  const [services, setServices] = useState<Service[]>(seedServices);
  const [loc, setLoc] = useState<Location>("kp");
  const [hours, setHours] = useState(workingHours);
  const [buffer, setBuffer] = useState({ before: "0", after: "10", notice: "2", advance: "30" });
  const [reminders, setReminders] = useState<ReminderRule[]>([
    { id: "r1", label: "Booking confirmation", detail: "Immediately, with directions + Google Maps pin", channel: "whatsapp", on: true },
    { id: "r2", label: "T-24h reminder", detail: "Asks the patient to confirm or reschedule by reply", channel: "whatsapp", on: true },
    { id: "r3", label: "T-2h reminder", detail: "Short nudge with clinic address", channel: "whatsapp", on: true },
    { id: "r4", label: "SMS fallback", detail: "If WhatsApp is not delivered within 15 min", channel: "sms", on: true },
    { id: "r5", label: "Email reminder (T-24h)", detail: "For patients without WhatsApp consent", channel: "email", on: false },
    { id: "r6", label: "Post-visit review request", detail: "2 hours after the visit is marked complete", channel: "google", on: true },
  ]);
  const [aiReschedule, setAiReschedule] = useState(true);
  const bookingUrl = "smiledental.anvita.app/book";

  const updateService = (id: string, patch: Partial<Service>) => setServices((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="min-w-0 space-y-4 xl:col-span-2">
        <Card>
          <CardHeader
            title="Services"
            description="What patients and the AI agent can book. Deposits are collected with a pay link at booking."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setServices((s) => [...s, { id: `sv${s.length + 10}`, name: "New service", duration: 30, price: 1000, deposit: 0, online: false }]);
                  toast({ title: "Service added", description: "Rename it and set the price, then turn on online booking." });
                }}
              >
                <Plus /> Add service
              </Button>
            }
          />
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-y border-line bg-surface-2/50">
                  <th className="px-5 py-2 text-left font-medium">Service</th>
                  <th className="px-3 py-2 text-left font-medium">Duration</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="px-3 py-2 text-right font-medium">Deposit</th>
                  <th className="px-3 py-2 text-center font-medium">Online</th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-2">
                      <Input value={s.name} onChange={(e) => updateService(s.id, { name: e.target.value })} className="h-8! border-transparent bg-transparent px-2! hover:border-line" aria-label="Service name" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="w-28">
                        <Select value={s.duration} onChange={(e) => updateService(s.id, { duration: Number(e.target.value) })} className="h-8! text-xs" aria-label={`${s.name} duration`}>
                          {[15, 20, 30, 45, 60, 90, 120].map((d) => (
                            <option key={d} value={d}>
                              {d} min
                            </option>
                          ))}
                        </Select>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular">{formatCurrency(s.price)}</td>
                    <td className="px-3 py-2 text-right tabular">{s.deposit ? formatCurrency(s.deposit) : <span className="text-muted">None</span>}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center">
                        <Switch size="sm" checked={s.online} onChange={(v) => updateService(s.id, { online: v })} label={`${s.name} bookable online`} />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${s.name}`}
                        onClick={() => {
                          setServices((list) => list.filter((x) => x.id !== s.id));
                          toast({ title: `${s.name} removed`, tone: "warning" });
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader title="Working hours" description="Per location. The AI only offers slots inside these hours." />
            <CardBody className="space-y-1.5">
              <Segmented
                size="xs"
                className="mb-2"
                value={loc}
                onChange={setLoc}
                items={[
                  { value: "kp", label: "Koregaon Park" },
                  { value: "baner", label: "Baner" },
                ]}
              />
              {hours[loc].map((h, i) => (
                <div key={h.day} className="flex items-center gap-2 text-sm">
                  <Switch
                    size="sm"
                    checked={h.open}
                    label={`${h.day} open`}
                    onChange={(v) => setHours((all) => ({ ...all, [loc]: all[loc].map((x, j) => (j === i ? { ...x, open: v } : x)) }))}
                  />
                  <span className={cn("w-9 shrink-0", h.open ? "text-fg" : "text-muted")}>{h.day.slice(0, 3)}</span>
                  {h.open ? (
                    <div className="flex items-center gap-1">
                      <Input type="time" value={h.from} aria-label={`${h.day} opens`} className="h-8! w-[106px]! px-2! text-xs" onChange={(e) => setHours((all) => ({ ...all, [loc]: all[loc].map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) }))} />
                      <span className="text-muted">–</span>
                      <Input type="time" value={h.to} aria-label={`${h.day} closes`} className="h-8! w-[106px]! px-2! text-xs" onChange={(e) => setHours((all) => ({ ...all, [loc]: all[loc].map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) }))} />
                    </div>
                  ) : (
                    <span className="text-xs text-muted">Closed</span>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="min-w-0">
            <CardHeader title="Buffers & limits" description="Keep chairs sterilised and the schedule realistic." />
            <CardBody className="space-y-3">
              {[
                { key: "before", label: "Buffer before", options: ["0", "5", "10", "15"], unit: "min" },
                { key: "after", label: "Buffer after (sterilisation)", options: ["0", "5", "10", "15", "20"], unit: "min" },
                { key: "notice", label: "Minimum notice", options: ["0", "1", "2", "4", "24"], unit: "hours" },
                { key: "advance", label: "Book up to", options: ["7", "14", "30", "60", "90"], unit: "days ahead" },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-fg-2">{f.label}</span>
                  <div className="w-40 shrink-0">
                    <Select value={buffer[f.key as keyof typeof buffer]} onChange={(e) => setBuffer((b) => ({ ...b, [f.key]: e.target.value }))} className="h-8! text-xs" aria-label={f.label}>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o} {f.unit}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                <div>
                  <div className="text-fg">Let AI reschedule by chat</div>
                  <div className="text-xs text-muted">Patients reply “can we move to 5pm?”</div>
                </div>
                <Switch checked={aiReschedule} onChange={setAiReschedule} label="AI reschedule by chat" />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Reminder schedule" description="No-shows dropped 41% after turning these on." />
          <ul className="divide-y divide-line border-t border-line">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <ChannelIcon channel={r.channel} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-xs text-muted">{r.detail}</div>
                </div>
                <Switch
                  checked={r.on}
                  label={r.label}
                  onChange={(v) => {
                    setReminders((list) => list.map((x) => (x.id === r.id ? { ...x, on: v } : x)));
                    toast({ title: `${r.label} ${v ? "on" : "off"}`, tone: v ? "success" : "info" });
                  }}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="min-w-0 space-y-4">
        <Card>
          <CardHeader title="Booking page" description="Share on Instagram bio, Google Business Profile and WhatsApp." />
          <CardBody className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
              <Globe className="size-4 shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate font-medium">{bookingUrl}</span>
              <Button size="icon-sm" variant="ghost" aria-label="Copy booking link" onClick={() => toast({ title: "Booking link copied", description: `https://${bookingUrl}`, tone: "info" })}>
                <Copy />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "Opening booking page preview", tone: "info" })}>
                <ExternalLink /> Open
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "QR code downloaded", description: "smile-dental-booking-qr.png (print for reception)", tone: "info" })}>
                <QrCode /> QR code
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-line shadow-card">
              <div className="bg-gradient-to-br from-primary to-ai px-4 py-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">SD</span>
                  <div>
                    <div className="text-sm font-semibold">Smile Dental</div>
                    <div className="flex items-center gap-1 text-[11px] opacity-90">
                      <Star className="size-3 fill-current" /> 4.8 · 1,214 Google reviews
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="size-3.5" /> {locationLabel[loc]}, Pune
                </div>
                <div>
                  <div className="mb-1.5 text-xs font-medium text-fg-2">Choose a service</div>
                  <div className="space-y-1.5">
                    {services.filter((s) => s.online).slice(0, 3).map((s, i) => (
                      <div key={s.id} className={cn("flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs", i === 0 ? "border-primary bg-primary-soft/50" : "border-line")}>
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted">
                          {s.duration}m · {formatCurrency(s.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-xs font-medium text-fg-2">Wed, 28 Oct</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["10:00", "11:30", "12:20", "3:00", "4:40", "6:30"].map((t, i) => (
                      <span key={t} className={cn("rounded-md border py-1 text-center text-xs", i === 1 ? "border-primary bg-primary text-primary-fg" : "border-line text-fg-2")}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-primary py-2 text-center text-xs font-medium text-primary-fg">Book & pay ₹500 deposit</div>
                <div className="text-center text-[10px] text-muted">Confirmation on WhatsApp · Powered by Anvita</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Connected calendars</div>
            <Badge tone="success" dot>
              Synced 2 min ago
            </Badge>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-fg-2">
            <li>Google Calendar · priya@smiledental.in</li>
            <li>Google Calendar · dr.kulkarni@smiledental.in</li>
            <li>Outlook · reception.baner@smiledental.in</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
