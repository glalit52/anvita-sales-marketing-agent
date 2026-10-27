"use client";

import { CalendarCheck, Clock, Inbox, Mail, MailCheck, ShieldCheck, Sparkles, Split, TriangleAlert, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { BarCompare, ChartLegend } from "@/components/charts";
import {
  AiCallout,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ChannelIcon,
  Field,
  Input,
  Progress,
  Segmented,
  Select,
  StatCard,
  Switch,
  Textarea,
  useToast,
  type Channel,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { aiFirstLineSamples, mailboxes, personalisationVars, replyClasses, type Sequence, type SequenceStep, type StepType } from "@/lib/mock/outbound";
import { pct, useStreamText } from "./shared";

export const stepMeta: Record<StepType, { label: string; channel: Channel; manual?: boolean }> = {
  email: { label: "Email", channel: "email" },
  whatsapp: { label: "WhatsApp template", channel: "whatsapp" },
  linkedin: { label: "LinkedIn task", channel: "linkedin", manual: true },
  call: { label: "Call task", channel: "voice", manual: true },
  sms: { label: "SMS", channel: "sms" },
};

const aiCopy: Record<StepType, Record<string, string>> = {
  email: {
    Friendly:
      "Hi {{first_name}},\n\n{{ai_first_line}}\n\nMost dealers I speak to in {{city}} still take farmer re-orders over calls and a notebook. We built a simple WhatsApp ordering + UPI flow that {{company}} could switch on in a day, with no new app for farmers.\n\nWould a 15-minute walkthrough on Thursday or Friday work?\n\nCheers,\n{{sender_name}}",
    Direct:
      "{{first_name}}, {{ai_first_line}}\n\nOne question: how many repeat orders does {{company}} miss in peak season because the phone is busy?\n\nWe help dealers capture those on WhatsApp and collect via UPI automatically. 15 min to show you?\n\n{{sender_name}}",
    Hinglish:
      "Namaste {{first_name}} ji,\n\n{{ai_first_line}}\n\nKya {{company}} ke farmers abhi bhi phone pe order dete hain? Humne ek WhatsApp ordering + UPI system banaya hai jo dealers ke liye season mein bahut time bachata hai.\n\nIs hafte 15 minute ka demo karein?\n\n{{sender_name}}",
  },
  whatsapp: {
    Friendly: "Namaste {{first_name}} ji 🙏 {{sender_name}} here from AgriGrow. {{ai_first_line}} Can I share a 2-min video of how dealers in {{city}} take orders on WhatsApp?",
    Direct: "Hi {{first_name}}, {{sender_name}} from AgriGrow. Sent you an email about WhatsApp ordering for {{company}}. Want the 2-min demo video?",
    Hinglish: "Namaste {{first_name}} ji 🙏 {{company}} ke liye WhatsApp ordering ka 2 minute ka demo video bhejun?",
  },
  linkedin: {
    Friendly: "Hi {{first_name}}, {{ai_first_line}} I work with agri-input dealers across Maharashtra. Would love to connect.",
    Direct: "Hi {{first_name}}, helping dealers like {{company}} digitise farmer orders. Open to connecting?",
    Hinglish: "Namaste {{first_name}} ji, {{company}} ke baare mein padha. Connect karte hain?",
  },
  call: {
    Friendly: "Opener: mention {{ai_first_line}}.\nAsk: 1) How do farmers place repeat orders today? 2) Who chases credit payments?\nPitch: WhatsApp ordering + UPI reminders, live in 1 day.\nClose: book a 15-min demo with the owner.",
    Direct: "Ask for {{first_name}}. 30-sec pitch: WhatsApp orders + UPI. Qualify: >200 farmers? Credit sales? Book demo.",
    Hinglish: "Opener (Hindi/Marathi): {{ai_first_line}}. Puchein: farmers order kaise dete hain? Demo book karein.",
  },
  sms: {
    Friendly: "Hi {{first_name}}, {{sender_name}} from AgriGrow. Sent you a note on WhatsApp ordering for {{company}}. Reply YES for a demo. -AGRGRW",
    Direct: "{{first_name}}: WhatsApp ordering for dealers, live in 1 day. Reply YES for demo. -AGRGRW",
    Hinglish: "{{first_name}} ji, dealers ke liye WhatsApp ordering. Demo ke liye YES likhein. -AGRGRW",
  },
};

function renderPreview(body: string, sample: (typeof aiFirstLineSamples)[number]) {
  const first = sample.name.split(" ")[0];
  const city = sample.company.includes("Kisan") ? "Jalgaon" : sample.company.includes("Annadata") ? "Latur" : "Nashik";
  const values: Record<string, string> = {
    "{{first_name}}": first,
    "{{company}}": sample.company,
    "{{city}}": city,
    "{{ai_first_line}}": sample.line,
    "{{ai_pain_point}}": "peak-season order backlog",
    "{{sender_name}}": "Rahul",
  };
  return body.split(/(\{\{[a-z_]+\}\})/g).map((part, i) =>
    values[part] ? (
      <span key={i} className={cn("rounded px-0.5", part.includes("ai_") ? "bg-ai-soft text-ai" : "bg-primary-soft/70 text-fg")} title={part}>
        {values[part]}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function StepEditor({ step, onChange }: { step: SequenceStep; onChange: (patch: Partial<SequenceStep>) => void }) {
  const toast = useToast();
  const [variant, setVariant] = useState<"a" | "b">("a");
  const [tone, setTone] = useState("Friendly");
  const [sample, setSample] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);
  const stream = useStreamText(28);
  const meta = stepMeta[step.type];
  const editingB = step.abTest && variant === "b";
  const value = editingB ? (step.variantB ?? "") : step.body;
  const shown = stream.streaming ? stream.text : value;

  const setValue = (v: string) => onChange(editingB ? { variantB: v } : { body: v });

  const insertVar = (v: string) => {
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    setValue(value.slice(0, pos) + v + value.slice(pos));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos + v.length, pos + v.length);
    });
  };

  const write = () => {
    const target = editingB ? "b" : "a";
    stream.start(aiCopy[step.type][tone], (full) => {
      onChange(target === "b" ? { variantB: full } : { body: full });
      toast({ title: "AI drafted this step", description: `${tone} tone · uses ${(full.match(/\{\{/g) ?? []).length} personalisation variables`, tone: "info" });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ChannelIcon channel={meta.channel} size="md" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{meta.label}</div>
          <div className="text-xs text-muted">{meta.manual ? "Creates a task for the owner; Anvita reminds them" : "Sent automatically within business hours"}</div>
        </div>
        {step.type === "whatsapp" && (
          <Badge tone="success">
            <ShieldCheck /> Meta-approved
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Send on day">
          <Input type="number" min={0} value={step.day} onChange={(e) => onChange({ day: Math.max(0, Number(e.target.value)) })} />
        </Field>
        <Field label="Step name">
          <Input value={step.title} onChange={(e) => onChange({ title: e.target.value })} />
        </Field>
      </div>

      {step.type === "email" && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Split className="size-4 text-muted" /> A/B test this step
          </div>
          <Switch
            checked={Boolean(step.abTest)}
            onChange={(v) => {
              onChange({ abTest: v, variantB: step.variantB ?? step.body });
              setVariant(v ? "b" : "a");
            }}
            label="A/B test this step"
          />
        </div>
      )}
      {step.abTest && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Segmented
            size="xs"
            value={variant}
            onChange={setVariant}
            items={[
              { value: "a", label: "Variant A" },
              { value: "b", label: "Variant B" },
            ]}
          />
          <span className="text-xs text-muted">50/50 split · winner auto-picked by reply rate after 200 sends</span>
        </div>
      )}

      {step.type === "email" && (
        <Field label="Subject">
          <Input value={step.subject ?? ""} onChange={(e) => onChange({ subject: e.target.value })} />
        </Field>
      )}

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-fg-2">{meta.manual ? "Task notes / talk track" : step.type === "whatsapp" ? "Template body" : "Message"}</span>
          <div className="flex items-center gap-1.5">
            <Select value={tone} onChange={(e) => setTone(e.target.value)} className="h-7 w-auto py-0 text-xs" aria-label="Tone">
              <option>Friendly</option>
              <option>Direct</option>
              <option>Hinglish</option>
            </Select>
            <Button size="xs" variant="ai" onClick={write} disabled={stream.streaming}>
              <Wand2 /> {stream.streaming ? "Writing…" : "Write with AI"}
            </Button>
          </div>
        </div>
        <Textarea
          ref={ref}
          value={shown}
          readOnly={stream.streaming}
          onChange={(e) => setValue(e.target.value)}
          className={cn("min-h-48 font-mono text-[13px] leading-relaxed", stream.streaming && "border-ai")}
          aria-label="Step message"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {personalisationVars.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVar(v)}
              className={cn("rounded-md border px-1.5 py-0.5 font-mono text-[11px] transition-colors", v.includes("ai_") ? "border-ai/30 bg-ai-soft text-ai hover:border-ai" : "border-line bg-surface-2 text-fg-2 hover:border-primary")}
            >
              {v.includes("ai_") && <Sparkles className="mr-1 inline size-3" />}
              {v}
            </button>
          ))}
        </div>
        {step.type === "whatsapp" && <p className="mt-2 text-xs text-muted">Edits to an approved template are re-submitted to Meta (usually approved in under an hour). The live version keeps sending meanwhile.</p>}
      </div>

      <div className="rounded-xl border border-line bg-surface-2 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">Preview</span>
          <Segmented size="xs" value={String(sample)} onChange={(v) => setSample(Number(v))} items={aiFirstLineSamples.map((s, i) => ({ value: String(i), label: s.name.split(" ")[0] }))} />
        </div>
        {step.type === "email" && <div className="mb-2 text-sm font-medium">{renderPreview(step.subject ?? "", aiFirstLineSamples[sample])}</div>}
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-fg-2">{renderPreview(shown, aiFirstLineSamples[sample])}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Settings ------------------------------ */

export function SequenceSettings() {
  const toast = useToast();
  const [rotation, setRotation] = useState(true);
  const [stops, setStops] = useState({ reply: true, meeting: true, unsub: true, bounce: true, ooo: false });
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const [footer, setFooter] = useState("AgriGrow Inputs Pvt Ltd · Plot 14, MIDC Ambad, Nashik 422010\nNot interested? {{unsubscribe_link}}");

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Sending mailboxes"
          description="Rotated per lead to protect deliverability"
          action={
            <div className="flex items-center gap-2 text-xs text-fg-2">
              Rotate <Switch size="sm" checked={rotation} onChange={setRotation} label="Rotate mailboxes" />
            </div>
          }
        />
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-line bg-surface-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                <th className="px-5 py-2">Mailbox</th>
                <th className="px-3 py-2">Health</th>
                <th className="px-3 py-2">Warm-up</th>
                <th className="px-3 py-2">Today</th>
                <th className="px-3 py-2">Daily cap</th>
              </tr>
            </thead>
            <tbody>
              {mailboxes.map((m) => {
                const tone = m.health >= 85 ? "success" : m.health >= 70 ? "warning" : "danger";
                return (
                  <tr key={m.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Mail className="size-4 text-muted" />
                        {m.address}
                      </div>
                      <div className="pl-6 text-xs text-muted">{m.provider}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 font-medium tabular">{m.health}</span>
                        <Progress value={m.health} tone={tone} className="w-20" />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={tone}>
                        {tone === "danger" ? <TriangleAlert /> : <MailCheck />} {m.warmup}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-fg-2 tabular">
                      {m.sentToday} / {m.dailyCap}
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-20">
                        <Input type="number" defaultValue={m.dailyCap} aria-label={`Daily cap for ${m.address}`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <CardBody className="pt-3">
          <AiCallout title="team@agrigrow.co has a 4.1% bounce rate this week" action={<Button size="xs" variant="outline" onClick={() => toast({ title: "Mailbox paused & warm-up restarted", description: "team@agrigrow.co will be back in rotation in ~7 days." })}>Pause & re-warm</Button>}>
            Pausing it and re-warming for 7 days usually restores inbox placement. The other two mailboxes can absorb its 20/day.
          </AiCallout>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Schedule" description="When steps are allowed to send" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <Select defaultValue="10:00">
                {["09:00", "10:00", "11:00"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="End">
              <Select defaultValue="18:30">
                {["17:00", "18:30", "20:00"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Timezone">
            <Select defaultValue="lead">
              <option value="lead">Lead&apos;s timezone (fallback Asia/Kolkata)</option>
              <option value="ist">Asia/Kolkata (IST)</option>
            </Select>
          </Field>
          <div>
            <div className="mb-1.5 text-xs font-medium text-fg-2">Sending days</div>
            <div className="flex flex-wrap gap-1.5">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                const on = days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDays((ds) => (on ? ds.filter((x) => x !== d) : [...ds, d]))}
                    className={cn("h-8 w-11 rounded-lg border text-xs font-medium", on ? "border-primary bg-primary-soft text-primary" : "border-line text-muted hover:bg-surface-2")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="New leads / day">
              <Input type="number" defaultValue={40} />
            </Field>
            <Field label="Min gap between emails">
              <Select defaultValue="4">
                <option value="2">2 min</option>
                <option value="4">4 min (random ±60s)</option>
                <option value="8">8 min</option>
              </Select>
            </Field>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="size-3.5" /> Skips Indian public holidays (Diwali, Gudi Padwa…) automatically
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Stop conditions & compliance" description="When a lead exits the sequence" />
        <CardBody className="space-y-3">
          {(
            [
              ["reply", "Lead replies on any channel", Inbox],
              ["meeting", "Meeting is booked", CalendarCheck],
              ["unsub", "Lead unsubscribes or says STOP (suppressed everywhere)", ShieldCheck],
              ["bounce", "Email hard-bounces", TriangleAlert],
              ["ooo", "Out-of-office: pause & resume on return date", Clock],
            ] as const
          ).map(([k, label, Icon]) => (
            <div key={k} className="flex items-center gap-3 text-sm">
              <Icon className="size-4 shrink-0 text-muted" />
              <span className="flex-1">{label}</span>
              <Switch size="sm" checked={stops[k]} disabled={k === "unsub"} onChange={(v) => setStops((s) => ({ ...s, [k]: v }))} label={label} />
            </div>
          ))}
          <Field label="Compliance footer" hint="(required on every email)">
            <Textarea value={footer} onChange={(e) => setFooter(e.target.value)} className="min-h-16 text-xs" />
          </Field>
          {!footer.includes("{{unsubscribe_link}}") && (
            <p className="flex items-center gap-1.5 text-xs text-danger">
              <TriangleAlert className="size-3.5" /> Footer must include {"{{unsubscribe_link}}"}
            </p>
          )}
          <div className="flex justify-end">
            <Button size="sm" disabled={!footer.includes("{{unsubscribe_link}}")} onClick={() => toast({ title: "Sequence settings saved" })}>
              Save settings
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------ Stats ------------------------------ */

const recentReplies = [
  { name: "Nilesh Patil", company: "Kisan Agro Point", text: "Yes, send the demo video. Can we talk Thursday 4 pm?", cls: "Interested", tone: "success" as const, time: "18m" },
  { name: "Sunita Ingle", company: "Amravati Kisan Seva", text: "Abhi season chal raha hai, Diwali ke baad baat karte hain.", cls: "Not now", tone: "warning" as const, time: "1h" },
  { name: "Yogesh Bhamre", company: "Nashik Agro Traders", text: "I'm out till 2 Nov, please contact my brother Sachin.", cls: "OOO", tone: "neutral" as const, time: "3h" },
  { name: "Mahesh Kulkarni", company: "Shree Ganesh Krishi Kendra", text: "Please don't message again.", cls: "Unsubscribe", tone: "danger" as const, time: "5h" },
];

export function SequenceStats({ seq }: { seq: Sequence }) {
  const toast = useToast();
  const first = seq.steps[0]?.stats ?? { sent: 0, opened: 0, replied: 0, booked: 0 };
  const totals = seq.steps.reduce((a, s) => ({ sent: a.sent + s.stats.sent, opened: a.opened + s.stats.opened, replied: a.replied + s.stats.replied, booked: a.booked + s.stats.booked }), { sent: 0, opened: 0, replied: 0, booked: 0 });
  const emailSent = seq.steps.filter((s) => s.type === "email").reduce((a, s) => a + s.stats.sent, 0);
  const emailOpened = seq.steps.filter((s) => s.type === "email").reduce((a, s) => a + s.stats.opened, 0);
  const data = seq.steps.map((s) => ({ step: `D${s.day} ${stepMeta[s.type].label.split(" ")[0]}`, sent: s.stats.sent, opened: s.stats.opened, replied: s.stats.replied, booked: s.stats.booked }));
  const seriesDefs = [
    { key: "sent", label: "Sent / done" },
    { key: "opened", label: "Opened / read" },
    { key: "replied", label: "Replied" },
    { key: "booked", label: "Booked" },
  ];

  if (seq.status === "draft")
    return (
      <Card className="p-10 text-center text-sm text-muted">
        <Sparkles className="mx-auto mb-2 size-5 text-ai" />
        Stats appear once this sequence is launched and the first step sends.
      </Card>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Enrolled" value={formatNumber(seq.enrolled)} hint={`${seq.active} still active`} />
        <StatCard label="Email open rate" value={`${pct(emailOpened, emailSent).toFixed(1)}%`} delta={4.2} hint="vs last 30d" />
        <StatCard label="Reply rate" value={`${seq.replyRate}%`} delta={2.8} hint="any channel" />
        <StatCard label="Meetings booked" value={seq.meetings} delta={18.0} hint={`${pct(seq.meetings, seq.enrolled).toFixed(1)}% of enrolled`} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Per-step funnel" description="WhatsApp counts read receipts as opens; tasks count completions as sent" action={<ChartLegend items={seriesDefs} className="hidden sm:flex" />} />
          <CardBody>
            <ChartLegend items={seriesDefs} className="mb-3 sm:hidden" />
            <BarCompare data={data} xKey="step" series={seriesDefs} height={260} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Reply classification" description={`${replyClasses.reduce((a, r) => a + r.value, 0)} replies, classified by AI`} />
          <CardBody>
            <BarCompare data={replyClasses} xKey="label" series={[{ key: "value", label: "Replies" }]} height={220} horizontal />
            <p className="mt-2 text-xs text-muted">Interested replies are routed to the Inbox with demo slots suggested. Unsubscribes are suppressed across all channels.</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {seq.steps[0]?.abTest && (
          <Card>
            <CardHeader title="A/B test · Step 1" description="Intro email, 50/50 split" action={<Badge tone="ai">Running</Badge>} />
            <CardBody className="space-y-3">
              {[
                { v: "A", label: "Value pitch", sent: Math.round(first.sent / 2), reply: 8.7 },
                { v: "B", label: "Question opener", sent: Math.round(first.sent / 2), reply: 11.2 },
              ].map((x) => (
                <div key={x.v}>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2 text-sm">
                    <span>
                      <b>Variant {x.v}</b> <span className="text-muted">· {x.label}</span>
                    </span>
                    <span className="tabular">
                      {x.reply}% <span className="text-xs text-muted">reply · {x.sent} sent</span>
                    </span>
                  </div>
                  <Progress value={x.reply * 6} tone={x.v === "B" ? "success" : "primary"} />
                </div>
              ))}
              <AiCallout action={<Button size="xs" variant="outline" onClick={() => toast({ title: "Variant B promoted", description: "All new leads in Step 1 now get the question opener." })}>Promote B</Button>}>
                Variant B leads by 2.5 pts with 91% confidence. ~40 more sends to call it.
              </AiCallout>
            </CardBody>
          </Card>
        )}
        <Card className={cn(seq.steps[0]?.abTest ? "xl:col-span-2" : "xl:col-span-3")}>
          <CardHeader title="Latest replies" description="Classified automatically · open in Inbox to respond" />
          <ul className="divide-y divide-line">
            {recentReplies.map((r) => (
              <li key={r.name} className="flex items-start gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <b className="font-medium">{r.name}</b> <span className="text-muted">· {r.company}</span>
                  </div>
                  <div className="truncate text-sm text-fg-2">{r.text}</div>
                </div>
                <Badge tone={r.tone}>{r.cls}</Badge>
                <span className="w-8 text-right text-xs text-muted">{r.time}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-5 py-2.5 text-xs text-muted">
            Totals across steps: {formatNumber(totals.sent)} sent · {formatNumber(totals.replied)} replies · {totals.booked} booked
          </div>
        </Card>
      </div>
    </div>
  );
}
