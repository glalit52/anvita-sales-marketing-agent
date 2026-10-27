"use client";

import { ArrowRight, BellRing, Clock, Lock, MessageCircle, Send, Star, Users } from "lucide-react";
import { useState } from "react";
import { FunnelBars } from "@/components/charts";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Checkbox, Field, Modal, Segmented, Select, StatCard, Switch, Textarea, useToast, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { recentVisitors, reviewRequestFunnel, reviewRequestRecent } from "@/lib/mock/growth";
import { ChartCard, ReviewPlatformMark } from "../shared";

type ReqStatus = (typeof reviewRequestRecent)[number]["status"];
const reqTone: Record<ReqStatus, Tone> = { Reviewed: "success", Clicked: "info", Sent: "neutral", "Private feedback": "warning" };

const defaultTemplate =
  "Hi {first_name}, thanks for visiting Smile Dental {location} today! 😊 How was your experience? Tap to rate us, it takes 20 seconds: {review_link}";

export function ReviewRequests() {
  const toast = useToast();
  const [enabled, setEnabled] = useState(true);
  const [delay, setDelay] = useState("2h");
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [template, setTemplate] = useState(defaultTemplate);
  const [reminder, setReminder] = useState(true);
  const [alertManager, setAlertManager] = useState(true);
  const [happyTarget, setHappyTarget] = useState("google");
  const [recent, setRecent] = useState(reviewRequestRecent);
  const [bulkOpen, setBulkOpen] = useState(false);

  const preview = template.replace("{first_name}", "Ananya").replace("{location}", "Koregaon Park").replace("{review_link}", "smdnt.in/r/a8k2");
  const sent = reviewRequestFunnel[0].value;
  const reviewed = reviewRequestFunnel[reviewRequestFunnel.length - 1].value;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Requests sent · 90d" value={sent.toLocaleString("en-IN")} delta={34.0} icon={<Send />} />
          <StatCard label="Request → review" value={`${((reviewed / sent) * 100).toFixed(1)}%`} delta={4.2} hint="target > 15%" icon={<Star />} />
          <StatCard label="Unhappy caught privately" value="61" hint="never reached Google" icon={<Lock />} />
          <StatCard label="Median time to review" value="38 min" delta={-12.0} goodWhen="down" icon={<Clock />} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Automation */}
        <Card className="xl:col-span-3">
          <CardHeader
            title="Automatic review requests"
            description="Sent after every completed appointment, from your WhatsApp Business number"
            action={
              <span className="inline-flex items-center gap-2 text-xs text-muted">
                {enabled ? "On" : "Off"}
                <Switch checked={enabled} onChange={setEnabled} label="Automatic review requests" />
              </span>
            }
          />
          <CardBody className={cn("space-y-5", !enabled && "pointer-events-none opacity-50")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="When">
                <Select value={delay} onChange={(e) => setDelay(e.target.value)}>
                  <option value="30m">30 minutes after visit</option>
                  <option value="2h">2 hours after visit</option>
                  <option value="evening">Same evening, 7 PM</option>
                  <option value="1d">Next day, 11 AM</option>
                </Select>
              </Field>
              <Field label="Channel">
                <Segmented
                  className="w-full"
                  value={channel}
                  onChange={setChannel}
                  items={[
                    { value: "whatsapp", label: "WhatsApp" },
                    { value: "sms", label: "SMS" },
                    { value: "email", label: "Email" },
                  ]}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Message" hint="{first_name} {location} {review_link}">
                <Textarea rows={5} value={template} onChange={(e) => setTemplate(e.target.value)} />
              </Field>
              <div>
                <div className="mb-1.5 text-xs font-medium text-fg-2">Preview</div>
                <div className="rounded-xl bg-surface-2 p-3">
                  <div className="ml-auto max-w-[260px] rounded-xl rounded-tr-sm bg-success-soft px-3 py-2 text-sm text-fg shadow-card">
                    {preview}
                    <div className="mt-1 text-right text-[10px] text-muted">12:10 PM ✓✓</div>
                  </div>
                  <div className="mt-2 flex justify-end gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="inline-flex size-7 items-center justify-center rounded-lg border border-line bg-surface text-xs font-medium">
                        {n}★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Routing */}
            <div>
              <div className="mb-2 text-xs font-medium text-fg-2">Smart routing</div>
              <div className="space-y-2">
                <div className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-center">
                  <Badge tone="success" className="self-start sm:self-auto">
                    <Star aria-hidden /> 4–5★ happy
                  </Badge>
                  <ArrowRight className="hidden size-4 text-muted sm:block" aria-hidden />
                  <span className="flex flex-1 items-center gap-2 text-sm">
                    <ReviewPlatformMark platform={happyTarget as "google"} size="xs" /> Ask for a public review on
                  </span>
                  <Select aria-label="Public review platform" className="h-8! text-xs! sm:w-52!" value={happyTarget} onChange={(e) => setHappyTarget(e.target.value)}>
                    <option value="google">Google (recommended)</option>
                    <option value="practo">Practo</option>
                    <option value="facebook">Facebook</option>
                    <option value="justdial">Justdial</option>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 rounded-lg border border-line p-3 sm:flex-row sm:items-center">
                  <Badge tone="warning" className="self-start sm:self-auto">
                    <Star aria-hidden /> 1–3★ unhappy
                  </Badge>
                  <ArrowRight className="hidden size-4 text-muted sm:block" aria-hidden />
                  <span className="flex flex-1 items-center gap-2 text-sm">
                    <Lock className="size-3.5 text-muted" aria-hidden /> Private feedback form, then AI apologises and offers a call
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">Everyone can still choose to leave a public review. Anvita never blocks or filters reviews (Google policy).</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="block font-medium">Remind once after 2 days</span>
                  <span className="block text-xs text-muted">Only if the link wasn’t opened</span>
                </span>
                <Switch checked={reminder} onChange={setReminder} label="Reminder" />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <BellRing className="size-3.5" aria-hidden /> Alert clinic manager on 1–3★ feedback
                  </span>
                  <span className="block text-xs text-muted">Neha Kulkarni · WhatsApp + push</span>
                </span>
                <Switch checked={alertManager} onChange={setAlertManager} label="Alert manager" />
              </label>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => toast({ title: "Review automation saved", description: `Sends ${delay === "2h" ? "2 hours" : delay} after each visit via ${channel === "whatsapp" ? "WhatsApp" : channel.toUpperCase()}.` })}>
                Save changes
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Funnel + recent */}
        <div className="space-y-4 xl:col-span-2">
          <ChartCard
            title="Request funnel"
            description="Last 90 days"
            table={{
              columns: [
                { key: "label", label: "Step" },
                { key: "value", label: "Count", align: "right", render: (r) => r.value.toLocaleString("en-IN") },
              ],
              rows: reviewRequestFunnel,
            }}
          >
            <FunnelBars steps={reviewRequestFunnel} />
          </ChartCard>

          <Card>
            <CardHeader
              title="Recent requests"
              action={
                <Button size="sm" onClick={() => setBulkOpen(true)}>
                  <Users /> Request reviews
                </Button>
              }
            />
            <ul className="divide-y divide-line border-t border-line">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Avatar name={r.name} size="xs" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="truncate text-xs text-muted">
                      {r.visit} · {r.sent}
                    </div>
                  </div>
                  <Badge tone={reqTone[r.status]}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <BulkRequestModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSend={(names) => {
          setRecent((r) => [...names.map((n, i) => ({ id: `q${Date.now()}${i}`, name: n.name, visit: n.visit, sent: "Just now", status: "Sent" as const })), ...r]);
          toast({ title: `${names.length} review requests sent`, description: "Via WhatsApp. Replies route automatically." });
        }}
      />
    </div>
  );
}

function BulkRequestModal({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: (people: typeof recentVisitors) => void }) {
  const [picked, setPicked] = useState<string[]>(recentVisitors.slice(0, 4).map((v) => v.id));
  const [skipRecent, setSkipRecent] = useState(true);
  const all = picked.length === recentVisitors.length;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request reviews"
      description="Patients seen in the last 48 hours who haven't been asked yet"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={picked.length === 0}
            onClick={() => {
              onSend(recentVisitors.filter((v) => picked.includes(v.id)));
              onClose();
            }}
          >
            <MessageCircle /> Send to {picked.length}
          </Button>
        </>
      }
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-muted">
        <Checkbox
          checked={all}
          indeterminate={!all && picked.length > 0}
          onChange={(v) => setPicked(v ? recentVisitors.map((x) => x.id) : [])}
          label="Select all"
        />
        {picked.length} of {recentVisitors.length} selected
      </div>
      <ul className="divide-y divide-line rounded-lg border border-line">
        {recentVisitors.map((v) => (
          <li key={v.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-surface-2">
              <Checkbox checked={picked.includes(v.id)} onChange={(c) => setPicked((p) => (c ? [...p, v.id] : p.filter((x) => x !== v.id)))} label={`Select ${v.name}`} />
              <Avatar name={v.name} size="xs" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{v.name}</span>
                <span className="block truncate text-xs text-muted">
                  {v.visit} · {v.location}
                </span>
              </span>
              <span className="text-xs whitespace-nowrap text-muted">{v.when}</span>
            </label>
          </li>
        ))}
      </ul>
      <label className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span>Skip anyone asked in the last 90 days</span>
        <Switch checked={skipRecent} onChange={setSkipRecent} label="Skip recently asked" />
      </label>
    </Modal>
  );
}
