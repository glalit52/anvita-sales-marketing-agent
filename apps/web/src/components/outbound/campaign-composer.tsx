"use client";

import { ArrowLeft, ArrowRight, CircleCheck, CircleX, Clock, ImagePlus, Plus, Rocket, ShieldCheck, Sparkles, TriangleAlert, Users, Wand2, X, Zap } from "lucide-react";
import { useState } from "react";
import { AiCallout, Badge, Button, ChannelIcon, Checkbox, Field, Input, MetaRow, Modal, Segmented, Select, Switch, Textarea, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { aiSegments, segmentFields, waTemplates, type Campaign, type WaTemplate } from "@/lib/mock/outbound";
import { EmailPreview, SmsPreview, WhatsAppPreview } from "./phone-preview";
import { Stepper, useStreamText } from "./shared";

type SegField = (typeof segmentFields)[number];
interface Rule {
  id: number;
  field: SegField;
  op: string;
  value: string;
}

const fieldOptions: Record<SegField, { ops: string[]; values: string[] }> = {
  Stage: { ops: ["is", "is not"], values: ["Customer", "Qualified", "Booked", "New lead", "Lost"] },
  "Last visit": { ops: ["more than", "less than"], values: ["3 months ago", "6 months ago", "9 months ago", "12 months ago"] },
  "WhatsApp opt-in": { ops: ["is"], values: ["Yes", "No"] },
  Tag: { ops: ["has", "doesn't have"], values: ["whitening", "aligners", "implants", "vip", "kids dentistry"] },
  Location: { ops: ["is"], values: ["Koregaon Park", "Baner", "Any clinic"] },
  "Lifetime value": { ops: ["more than", "less than"], values: ["₹5,000", "₹15,000", "₹50,000"] },
  Language: { ops: ["is"], values: ["English", "Hindi", "Marathi"] },
};

const factor = (r: Rule) => {
  const table: Record<string, number> = {
    "Customer": 0.58, "Qualified": 0.21, "Booked": 0.09, "New lead": 0.14, "Lost": 0.07,
    "3 months ago": 0.55, "6 months ago": 0.36, "9 months ago": 0.22, "12 months ago": 0.12,
    "Yes": 0.88, "No": 0.12,
    "whitening": 0.18, "aligners": 0.09, "implants": 0.06, "vip": 0.04, "kids dentistry": 0.11,
    "Koregaon Park": 0.61, "Baner": 0.39, "Any clinic": 1,
    "₹5,000": 0.52, "₹15,000": 0.24, "₹50,000": 0.06,
    "English": 0.54, "Hindi": 0.27, "Marathi": 0.19,
  };
  const f = table[r.value] ?? 0.5;
  return r.op.startsWith("is not") || r.op.startsWith("doesn't") || r.op === "less than" ? 1 - f : f;
};

const BASE_CONTACTS = 4860;
const defaultRules: Rule[] = [
  { id: 1, field: "Stage", op: "is", value: "Customer" },
  { id: 2, field: "Last visit", op: "more than", value: "6 months ago" },
  { id: 3, field: "WhatsApp opt-in", op: "is", value: "Yes" },
];

const templateTone: Record<WaTemplate["status"], { tone: Tone; label: string; icon: typeof CircleCheck }> = {
  approved: { tone: "success", label: "Approved", icon: CircleCheck },
  pending: { tone: "warning", label: "In review", icon: Clock },
  rejected: { tone: "danger", label: "Rejected", icon: CircleX },
};

const aiWa: Record<string, string> = {
  Friendly: "Hi {{1}} 😊 It's been a while since your last check-up at Smile Dental {{2}}. A quick cleaning keeps gums healthy and stains away. We've kept {{3}} slots this week just for our patients. Tap below to grab one!",
  Festive: "Namaste {{1}}! 🪔 This Diwali, let your smile shine brightest ✨ Book your cleaning + polish at Smile Dental {{2}} and get *20% off whitening*. Only {{3}} festive slots left!",
  Premium: "Dear {{1}}, your 6-month dental review at Smile Dental {{2}} is now due. Dr. Kulkarni has {{3}} priority appointments available this week. Reserve yours below.",
  Hinglish: "Hi {{1}} ji! 🦷 Aapki last cleaning ko 6 mahine ho gaye. Smile Dental {{2}} mein is hafte sirf {{3}} slots bache hain. Neeche tap karke book karein!",
};

const sampleVars: Record<string, string> = { first_name: "Ananya", clinic: "Koregaon Park", slots: "6", offer_end: "15 Nov" };

export function CampaignComposer({ open, onClose, onLaunch }: { open: boolean; onClose: () => void; onLaunch: (c: Campaign) => void }) {
  if (!open) return null;
  return <Composer onClose={onClose} onLaunch={onLaunch} />;
}

function Composer({ onClose, onLaunch }: { onClose: () => void; onLaunch: (c: Campaign) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("6-month cleaning recall · Nov");
  const [rules, setRules] = useState<Rule[]>(defaultRules);
  const [nextId, setNextId] = useState(4);
  const [excl, setExcl] = useState({ unsub: true, recent: true, open: true });
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [templateId, setTemplateId] = useState("t1");
  const [vars, setVars] = useState<Record<string, string>>({ "1": "first_name", "2": "clinic", "3": "slots" });
  const [media, setMedia] = useState(false);
  const [tone, setTone] = useState("Festive");
  const [aiBody, setAiBody] = useState<string | null>(null);
  const [dlt, setDlt] = useState("1107169845123456789");
  const [smsBody, setSmsBody] = useState("Hi {#var#}, your 6-month dental cleaning is due at Smile Dental. Book: smld.in/b/{#var#} -SMLDNT");
  const [subject, setSubject] = useState("Ananya, your 6-month check-up is due 🦷");
  const [preheader, setPreheader] = useState("Book in 10 seconds. Saturday slots available.");
  const [emailBody, setEmailBody] = useState("Hi Ananya,\n\nIt's been 6 months since your last cleaning at Smile Dental Koregaon Park. Regular cleanings prevent 80% of gum problems, and take just 30 minutes.\n\nBook your slot: smiledental.in/book\n\nSee you soon,\nDr. Neha Kulkarni");
  const [when, setWhen] = useState<"now" | "later" | "smart">("smart");
  const [date, setDate] = useState("2026-10-29");
  const [time, setTime] = useState("10:30");
  const [quiet, setQuiet] = useState(true);
  const [throttle, setThrottle] = useState("60");
  const stream = useStreamText(30);

  const template = waTemplates.find((t) => t.id === templateId)!;
  const raw = Math.round(rules.reduce((n, r) => n * factor(r), BASE_CONTACTS));
  const excluded = (excl.unsub ? Math.round(raw * 0.03) : 0) + (excl.recent ? Math.round(raw * 0.06) : 0) + (excl.open ? Math.round(raw * 0.02) : 0);
  const audience = Math.max(0, raw - excluded);
  const hasOptIn = rules.some((r) => r.field === "WhatsApp opt-in" && r.value === "Yes" && r.op === "is");
  const optInExcluded = channel === "whatsapp" && !hasOptIn ? Math.round(audience * 0.12) : 0;
  const reach = audience - optInExcluded;

  const waBodyRaw = stream.streaming ? stream.text : (aiBody ?? template.body);
  const waBody = waBodyRaw.replace(/\{\{(\d+)\}\}/g, (m, n) => (vars[n] ? sampleVars[vars[n]] : m));
  const varCount = new Set(waBodyRaw.match(/\{\{\d+\}\}/g) ?? []).size;
  const costPer = channel === "whatsapp" ? 0.88 : channel === "sms" ? 0.18 : 0.02;
  const templateOk = channel !== "whatsapp" || (aiBody === null && template.status === "approved");
  const dltOk = channel !== "sms" || /^\d{19}$/.test(dlt);
  const unsubOk = channel === "whatsapp" ? (aiBody !== null || template.buttons.some((b) => /stop/i.test(b))) : channel === "sms" ? true : true;

  const checks: { label: string; detail: string; state: "pass" | "warn" | "fail" }[] = [
    { label: "Opt-in contacts only", detail: hasOptIn || channel !== "whatsapp" ? `All ${formatNumber(reach)} recipients have a recorded opt-in` : `${optInExcluded} without WhatsApp opt-in will be skipped automatically`, state: hasOptIn || channel !== "whatsapp" ? "pass" : "warn" },
    ...(channel === "whatsapp"
      ? [{ label: "Meta-approved template", detail: aiBody ? "AI copy will be submitted as a new template; sends once approved (~1h)" : template.status === "approved" ? `${template.name} · ${template.category}` : template.status === "pending" ? "Template still in Meta review" : "Template was rejected by Meta", state: (templateOk ? "pass" : aiBody || template.status === "pending" ? "warn" : "fail") as "pass" | "warn" | "fail" }]
      : []),
    ...(channel === "sms" ? [{ label: "DLT template registered", detail: dltOk ? `Template ID ${dlt} · header SMLDNT` : "Enter a valid 19-digit DLT template ID", state: (dltOk ? "pass" : "fail") as "pass" | "fail" }] : []),
    { label: "Unsubscribe option", detail: channel === "whatsapp" ? "“Stop” quick reply + STOP keyword auto-suppresses" : channel === "sms" ? "STOP keyword handled; DND numbers scrubbed" : "One-click unsubscribe link in footer", state: unsubOk ? "pass" : "fail" },
    { label: "Quiet hours (TRAI / Meta)", detail: quiet ? "No sends between 9 PM and 9 AM" : "Quiet hours off: messages may arrive late at night", state: quiet ? "pass" : "warn" },
    { label: "Frequency cap", detail: excl.recent ? "Skips anyone messaged in the last 7 days" : "Some contacts may get 2 campaigns this week", state: excl.recent ? "pass" : "warn" },
  ];
  const blocked = checks.some((c) => c.state === "fail") || reach === 0;

  const steps = ["Audience", "Message", "Schedule", "Review"];
  const canNext = step === 0 ? reach > 0 && name.trim() : step === 1 ? !stream.streaming && (channel !== "sms" || dltOk) : true;

  const launch = () => {
    onLaunch({
      id: `cp-new-${name}`,
      name,
      channel,
      segment: rules.map((r) => `${r.field} ${r.op} ${r.value}`).join(" · "),
      audience: reach,
      status: when === "now" ? "sending" : "scheduled",
      when: when === "now" ? "Today · sending now" : when === "smart" ? "Smart send · next 24h" : `${new Date(`${date}T${time}`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · ${time}`,
      delivered: 0,
      read: 0,
      replied: 0,
      booked: 0,
      revenue: 0,
      template: channel === "whatsapp" ? template.name : channel === "sms" ? dlt : subject,
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title="New campaign"
      description={`Step ${step + 1} of 4 · ${steps[step]}`}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm text-fg-2">
            <Users className="size-4 text-muted" /> <b className="tabular">{formatNumber(reach)}</b> recipients · ≈ {formatCurrency(Math.round(reach * costPer))}
          </span>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft /> Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Next <ArrowRight />
              </Button>
            ) : (
              <Button onClick={launch} disabled={blocked}>
                <Rocket /> {when === "now" ? "Launch now" : "Schedule campaign"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="-mx-5 -mt-4 mb-4 border-b border-line px-4 py-2">
        <Stepper steps={steps} current={step} onSelect={setStep} />
      </div>
      {step === 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_248px]">
          <div className="space-y-4">
            <Field label="Campaign name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div>
              <div className="mb-2 text-xs font-medium text-fg-2">Include contacts where</div>
              <div className="space-y-2">
                {rules.map((r, i) => (
                  <div key={r.id} className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/50 p-2">
                    <span className="w-9 shrink-0 text-center text-[10px] font-semibold text-muted">{i === 0 ? "WHERE" : "AND"}</span>
                    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 sm:grid-cols-[10.5rem_9rem_minmax(0,1fr)]">
                    <Select
                      value={r.field}
                      aria-label="Field"
                      onChange={(e) => {
                        const field = e.target.value as SegField;
                        setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, field, op: fieldOptions[field].ops[0], value: fieldOptions[field].values[0] } : x)));
                      }}
                      className="col-span-2 min-w-0 sm:col-span-1"
                    >
                      {segmentFields.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </Select>
                    <Select value={r.op} aria-label="Operator" onChange={(e) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, op: e.target.value } : x)))} className="min-w-0">
                      {fieldOptions[r.field].ops.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </Select>
                    <Select value={r.value} aria-label="Value" onChange={(e) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))} className="min-w-0">
                      {fieldOptions[r.field].values.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </Select>
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label="Remove rule" onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}>
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  setRules((rs) => [...rs, { id: nextId, field: "Tag", op: "has", value: "whitening" }]);
                  setNextId((n) => n + 1);
                }}
              >
                <Plus /> Add rule
              </Button>
            </div>
            <div className="rounded-lg border border-line p-3">
              <div className="mb-2 text-xs font-medium text-fg-2">Always exclude</div>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                {(
                  [
                    ["unsub", "Unsubscribed / DND"],
                    ["recent", "Messaged in last 7 days"],
                    ["open", "Open conversation in Inbox"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2">
                    <Checkbox checked={excl[k]} onChange={(v) => setExcl((e) => ({ ...e, [k]: v }))} label={label} /> {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-primary/30 bg-primary-soft/50 p-4 text-center">
              <div className="text-xs font-medium text-muted">Live audience</div>
              <div key={reach} className="animate-fade-in mt-1 text-3xl font-semibold tracking-tight tabular">{formatNumber(reach)}</div>
              <div className="mt-1 text-xs text-muted">
                of {formatNumber(BASE_CONTACTS)} contacts · {formatNumber(excluded + optInExcluded)} excluded
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
              <Sparkles className="size-3.5 text-ai" /> AI-suggested segments
            </div>
            {aiSegments.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  setName(s.name);
                  setRules(
                    s.name.startsWith("Due")
                      ? [
                          { id: 11, field: "Last visit", op: "more than", value: "6 months ago" },
                          { id: 12, field: "Lifetime value", op: "more than", value: "₹15,000" },
                          { id: 13, field: "WhatsApp opt-in", op: "is", value: "Yes" },
                        ]
                      : s.name.startsWith("Likely")
                        ? [
                            { id: 21, field: "Stage", op: "is", value: "Customer" },
                            { id: 22, field: "Last visit", op: "more than", value: "9 months ago" },
                            { id: 23, field: "WhatsApp opt-in", op: "is", value: "Yes" },
                          ]
                        : [
                            { id: 31, field: "Tag", op: "has", value: "whitening" },
                            { id: 32, field: "Stage", op: "is not", value: "Customer" },
                            { id: 33, field: "WhatsApp opt-in", op: "is", value: "Yes" },
                          ],
                  );
                }}
                className="w-full rounded-lg border border-line p-3 text-left transition-colors hover:border-ai hover:bg-ai-soft/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge tone="ai">{s.count}</Badge>
                </div>
                <div className="mt-0.5 text-xs text-muted">{s.rule}</div>
                <div className="mt-1 text-xs text-fg-2">{s.why}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4">
            <Segmented
              value={channel}
              onChange={setChannel}
              items={[
                { value: "whatsapp", label: "WhatsApp", icon: <ChannelIcon channel="whatsapp" size="xs" /> },
                { value: "sms", label: "SMS", icon: <ChannelIcon channel="sms" size="xs" /> },
                { value: "email", label: "Email", icon: <ChannelIcon channel="email" size="xs" /> },
              ]}
            />

            {channel === "whatsapp" && (
              <>
                <div>
                  <div className="mb-1.5 text-xs font-medium text-fg-2">Template</div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {waTemplates.map((t) => {
                      const st = templateTone[t.status];
                      const active = t.id === templateId && aiBody === null;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setTemplateId(t.id);
                            setAiBody(null);
                          }}
                          className={cn("rounded-lg border p-3 text-left transition-colors", active ? "border-primary bg-primary-soft/40 ring-2 ring-[var(--ring)]" : "border-line hover:border-line-strong")}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-mono text-xs font-medium">{t.name}</span>
                            <Badge tone={st.tone}>
                              <st.icon /> {st.label}
                            </Badge>
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs text-muted">{t.body}</div>
                          <div className="mt-1.5 text-[11px] text-muted">
                            {t.category} · {t.language}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-ai/25 bg-ai-soft/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <Sparkles className="size-4 text-ai" /> Write with AI
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Segmented size="xs" value={tone} onChange={setTone} items={Object.keys(aiWa).map((k) => ({ value: k, label: k }))} />
                      <Button size="xs" variant="ai" disabled={stream.streaming} onClick={() => stream.start(aiWa[tone], (full) => setAiBody(full))}>
                        <Wand2 /> {stream.streaming ? "Writing…" : "Write message"}
                      </Button>
                    </div>
                  </div>
                  {(aiBody !== null || stream.streaming) && (
                    <Textarea className="mt-2 min-h-24 text-sm" value={waBodyRaw} readOnly={stream.streaming} onChange={(e) => setAiBody(e.target.value)} aria-label="AI-written message" />
                  )}
                  <p className="mt-2 text-xs text-muted">
                    {aiBody !== null ? "This copy will be submitted to Meta as a new Marketing template. We'll send once it's approved (usually < 1 hour)." : "Uses your past campaign results and brand voice. Output is submitted as a new template for Meta approval."}
                  </p>
                </div>

                {varCount > 0 && (
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-fg-2">Variables</div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Array.from({ length: varCount }, (_, i) => String(i + 1)).map((n) => (
                        <div key={n} className="flex items-center gap-2">
                          <span className="rounded bg-surface-2 px-1.5 py-1 font-mono text-xs">{`{{${n}}}`}</span>
                          <Select value={vars[n] ?? ""} onChange={(e) => setVars((v) => ({ ...v, [n]: e.target.value }))} aria-label={`Variable ${n}`} className="min-w-0 flex-1">
                            <option value="">Choose…</option>
                            <option value="first_name">First name</option>
                            <option value="clinic">Clinic location</option>
                            <option value="slots">Slots left (live)</option>
                            <option value="offer_end">Offer end date</option>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-fg-2">Media header</div>
                    <Button variant="outline" size="sm" onClick={() => setMedia((m) => !m)}>
                      <ImagePlus /> {media || template.media === "image" ? "diwali-smile-banner.jpg ✓" : "Upload image or video"}
                    </Button>
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-fg-2">Quick-reply buttons</div>
                    <div className="flex flex-wrap gap-1.5">
                      {template.buttons.map((b) => (
                        <Badge key={b} tone={/stop/i.test(b) ? "neutral" : "primary"}>
                          {b}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-muted">“Book” replies open the AI booking flow in Inbox.</p>
                  </div>
                </div>
              </>
            )}

            {channel === "sms" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="DLT template ID" hint="(TRAI)">
                    <Input value={dlt} onChange={(e) => setDlt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
                  </Field>
                  <Field label="Sender header">
                    <Select defaultValue="SMLDNT">
                      <option>SMLDNT</option>
                      <option>SMLDBN</option>
                    </Select>
                  </Field>
                </div>
                <Field label="Message" hint="({#var#} must match the registered DLT template)">
                  <Textarea value={smsBody} onChange={(e) => setSmsBody(e.target.value)} className="min-h-28" />
                </Field>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted tabular">
                    {smsBody.length} chars · {Math.ceil(smsBody.length / 160)} SMS
                  </span>
                  {dltOk ? (
                    <Badge tone="success">
                      <CircleCheck /> Matches DLT template
                    </Badge>
                  ) : (
                    <Badge tone="danger">
                      <CircleX /> Invalid DLT ID
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {channel === "email" && (
              <div className="space-y-3">
                <Field label="Subject">
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </Field>
                <Field label="Preview text">
                  <Input value={preheader} onChange={(e) => setPreheader(e.target.value)} />
                </Field>
                <Field label="Body">
                  <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-40" />
                </Field>
                <AiCallout title="Subject line test">Adding the patient&apos;s first name lifted open rates by 22% in your last 3 email campaigns.</AiCallout>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-0 lg:self-start">
            <div className="mb-2 text-center text-xs font-medium text-muted">Preview · sample: Ananya Rao</div>
            {channel === "whatsapp" && <WhatsAppPreview header={aiBody === null ? template.header : undefined} body={waBody} buttons={aiBody === null ? template.buttons : ["Book now", "Stop"]} media={media ? "image" : template.media} />}
            {channel === "sms" && <SmsPreview sender="JD-SMLDNT" body={smsBody.replace("{#var#}", "Ananya").replace("{#var#}", "x7Kp2")} />}
            {channel === "email" && <EmailPreview subject={subject} preheader={preheader} body={emailBody} />}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            {(
              [
                ["now", "Send now", "Starts immediately, throttled", Zap],
                ["later", "Schedule", "Pick a date & time (IST)", Clock],
                ["smart", "Smart send time", "AI picks each contact's best hour", Sparkles],
              ] as const
            ).map(([v, label, desc, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setWhen(v)}
                aria-pressed={when === v}
                className={cn("flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors", when === v ? "border-primary bg-primary-soft/40 ring-2 ring-[var(--ring)]" : "border-line hover:border-line-strong")}
              >
                <Icon className={cn("mt-0.5 size-4", v === "smart" ? "text-ai" : "text-muted")} />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="text-xs text-muted">{desc}</span>
                </span>
                {v === "smart" && <Badge tone="ai">Recommended</Badge>}
              </button>
            ))}
            {when === "later" && (
              <div className="animate-fade-in grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Time (IST)">
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </Field>
              </div>
            )}
            {when === "smart" && (
              <AiCallout title="Most of this audience reads WhatsApp at 10–11 AM and 7–8 PM">
                Sends spread over the next 24h at each contact&apos;s most active hour. Past recalls sent this way got 18% more bookings.
              </AiCallout>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-xl border border-line p-3">
              <div>
                <div className="text-sm font-medium">Quiet hours</div>
                <div className="text-xs text-muted">Hold messages between 9:00 PM and 9:00 AM; resume next morning</div>
              </div>
              <Switch checked={quiet} onChange={setQuiet} label="Quiet hours" />
            </div>
            <Field label="Throttling">
              <Select value={throttle} onChange={(e) => setThrottle(e.target.value)}>
                <option value="20">20 messages / minute (gentle)</option>
                <option value="60">60 messages / minute (recommended)</option>
                <option value="250">250 messages / minute (max for your tier)</option>
              </Select>
            </Field>
            <p className="text-xs text-muted">
              At this rate {formatNumber(reach)} messages take ~{Math.max(1, Math.ceil(reach / Number(throttle)))} min. Throttling keeps the front desk from being flooded with replies and protects your WhatsApp quality rating (currently <b className="text-success">High</b>).
            </p>
            <Field label="Send from">
              <Select defaultValue="both">
                <option value="both">Nearest clinic number (Koregaon Park / Baner)</option>
                <option value="kp">+91 20 4000 1122 · Koregaon Park</option>
                <option value="bn">+91 20 4000 3344 · Baner</option>
              </Select>
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <div className="rounded-xl border border-line p-4">
              <div className="mb-2 flex items-center gap-2">
                <ChannelIcon channel={channel} />
                <span className="font-semibold">{name}</span>
              </div>
              <MetaRow label="Audience">{formatNumber(reach)} contacts</MetaRow>
              <MetaRow label="Segment">
                <span className="text-xs">{rules.map((r) => `${r.field} ${r.op} ${r.value}`).join(" AND ")}</span>
              </MetaRow>
              <MetaRow label="Message">{channel === "whatsapp" ? (aiBody ? "AI draft (new template)" : template.name) : channel === "sms" ? `DLT ${dlt}` : subject}</MetaRow>
              <MetaRow label="When">{when === "now" ? "Immediately" : when === "smart" ? "Smart send · next 24h" : `${date} · ${time} IST`}</MetaRow>
              <MetaRow label="Throttle">{throttle}/min{quiet ? " · quiet hours on" : ""}</MetaRow>
              <MetaRow label="Est. cost">{formatCurrency(Math.round(reach * costPer))} <span className="text-xs text-muted">({channel === "whatsapp" ? "₹0.88 / marketing conv." : channel === "sms" ? "₹0.18 / SMS" : "₹0.02 / email"})</span></MetaRow>
              <MetaRow label="Expected">~{Math.round(reach * 0.12)} bookings · {formatCurrency(Math.round(reach * 0.12 * 2000))}</MetaRow>
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="size-4 text-success" /> Compliance checklist
            </div>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.label} className={cn("flex items-start gap-2.5 rounded-lg border p-2.5", c.state === "fail" ? "border-danger/40 bg-danger-soft/50" : c.state === "warn" ? "border-warning/40 bg-warning-soft/50" : "border-line")}>
                  {c.state === "pass" ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Pass" /> : c.state === "warn" ? <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-label="Warning" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-danger" aria-label="Fails" />}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{c.label}</span>
                    <span className="text-xs text-fg-2">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            {blocked && <p className="mt-2 text-xs text-danger">Fix the failing checks to launch. Go back to the Message step to choose an approved template.</p>}
          </div>
        </div>
      )}
    </Modal>
  );
}
