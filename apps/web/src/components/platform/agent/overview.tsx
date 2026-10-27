"use client";

import { CalendarCheck, Gauge, Languages, ShieldCheck, Smile, Sparkles, UserRoundCheck, Wand2 } from "lucide-react";
import { useState } from "react";
import { AreaTrend, ChartLegend } from "@/components/charts";
import { AiCallout, Avatar, Badge, Button, Card, CardBody, CardHeader, Field, Input, Segmented, Select, StatCard, Switch, Textarea, useToast } from "@/components/ui";
import { SettingRow, ToggleChip } from "@/components/platform/shared";
import { agentKpis, agentProfile, guardrails, languages } from "@/lib/mock/platform";

const kpiIcons = [<UserRoundCheck key="a" />, <Gauge key="b" />, <Smile key="c" />, <CalendarCheck key="d" />];

const outcomes = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 9, 14 + i);
  const base = 52 + Math.round(Math.sin(i / 2) * 6) + i * 2;
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    resolved: base,
    escalated: Math.max(3, 9 - Math.round(i / 3) + (i % 4 === 0 ? 2 : 0)),
    booked: Math.round(base * 0.34),
  };
});

const intents = [
  { label: "Book / reschedule", value: 34 },
  { label: "Price & EMI", value: 22 },
  { label: "Hours & location", value: 15 },
  { label: "Treatment questions", value: 14 },
  { label: "Insurance", value: 8 },
  { label: "Complaint", value: 2 },
];

export function OverviewTab({ onChange }: { onChange: () => void }) {
  const toast = useToast();
  const [name, setName] = useState(agentProfile.name);
  const [tone, setTone] = useState<"friendly" | "professional" | "concise">("friendly");
  const [langs, setLangs] = useState(languages);
  const [autoDetect, setAutoDetect] = useState(true);
  const [hours, setHours] = useState("book");
  const [greeting, setGreeting] = useState(agentProfile.greeting);
  const [afterHours, setAfterHours] = useState(agentProfile.afterHoursMessage);
  const [emoji, setEmoji] = useState(true);
  const [rails, setRails] = useState(guardrails);
  const [rewriting, setRewriting] = useState(false);

  const rewrite = () => {
    setRewriting(true);
    setTimeout(() => {
      setGreeting(
        tone === "concise"
          ? "Hi! I'm Anvi from Smile Dental. Book, check prices or ask anything 🙂"
          : tone === "professional"
            ? "Good day, and welcome to Smile Dental. I'm Anvi, your virtual front desk. I can book appointments, share treatment costs and answer your questions."
            : "Namaste! 😊 I'm Anvi from Smile Dental. Want to book a check-up, know a price, or ask about a treatment? I'm here 24/7!",
      );
      setRewriting(false);
      onChange();
    }, 900);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {agentKpis.map((k, i) => (
          <StatCard key={k.label} label={k.label} value={k.value} delta={k.delta} goodWhen={k.goodWhen} hint={k.hint} icon={kpiIcons[i]} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Conversation outcomes"
            description="Last 14 days, all channels"
            action={
              <ChartLegend
                items={[
                  { key: "resolved", label: "Resolved by AI" },
                  { key: "booked", label: "Booked by AI" },
                  { key: "escalated", label: "Escalated" },
                ]}
              />
            }
          />
          <CardBody>
            <AreaTrend
              data={outcomes}
              xKey="date"
              height={300}
              series={[
                { key: "resolved", label: "Resolved by AI" },
                { key: "booked", label: "Booked by AI" },
                { key: "escalated", label: "Escalated" },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top intents" description="Share of AI conversations, 30 days" />
          <CardBody className="space-y-2.5">
            {intents.map((it) => (
              <div key={it.label} className="flex items-center gap-3 text-sm">
                <span className="w-36 shrink-0 truncate text-fg-2">{it.label}</span>
                <div className="h-2 flex-1 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-chart-1" style={{ width: `${(it.value / 34) * 100}%` }} />
                </div>
                <span className="w-9 text-right font-medium tabular">{it.value}%</span>
              </div>
            ))}
            <AiCallout className="mt-4" title="Opportunity">
              71 people asked about <b>Sunday hours</b> this month. Adding Sunday slots to Koregaon Park could convert ~18 more bookings.
            </AiCallout>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Persona" description="How Anvi introduces itself and sounds to your customers" />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Agent name">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    onChange();
                  }}
                />
              </Field>
              <Field label="Tone of voice">
                <Segmented
                  className="flex w-full [&>button]:flex-1 [&>button]:justify-center"
                  value={tone}
                  onChange={(t) => {
                    setTone(t);
                    onChange();
                  }}
                  items={[
                    { value: "friendly", label: "Friendly" },
                    { value: "professional", label: "Professional" },
                    { value: "concise", label: "Concise" },
                  ]}
                />
              </Field>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-2">
                  <Languages className="size-3.5" /> Languages ({langs.filter((l) => l.enabled).length} enabled)
                </span>
                <label className="inline-flex items-center gap-2 text-xs text-fg-2">
                  <Switch size="sm" checked={autoDetect} onChange={setAutoDetect} label="Auto-detect language" />
                  Auto-detect & reply in customer&apos;s language
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {langs.map((l) => (
                  <ToggleChip
                    key={l.id}
                    active={l.enabled}
                    onClick={() => {
                      setLangs((ls) => ls.map((x) => (x.id === l.id ? { ...x, enabled: !x.enabled } : x)));
                      onChange();
                    }}
                  >
                    {l.label}
                    {l.share > 0 && <span className="text-muted tabular">{l.share}%</span>}
                  </ToggleChip>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted">Percentages show the share of last month&apos;s conversations in each language.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Outside business hours" hint="(Mon–Sat 9 AM–8 PM)">
                <Select
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    onChange();
                  }}
                >
                  <option value="book">Keep replying & booking 24/7</option>
                  <option value="answer">Answer questions, offer callback next morning</option>
                  <option value="message">Send after-hours message only</option>
                </Select>
              </Field>
              <Field label="Style">
                <div className="flex h-9 items-center justify-between rounded-lg border border-line px-3 text-sm">
                  Use emojis sparingly
                  <Switch size="sm" checked={emoji} onChange={setEmoji} label="Use emojis" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Field
                label={
                  <span className="flex w-full items-center justify-between">
                    Greeting message
                    <button onClick={rewrite} className="inline-flex items-center gap-1 text-[11px] font-medium text-ai hover:underline" disabled={rewriting}>
                      <Wand2 className="size-3" /> {rewriting ? "Rewriting…" : `Rewrite as ${tone}`}
                    </button>
                  </span>
                }
              >
                <Textarea
                  rows={4}
                  value={greeting}
                  onChange={(e) => {
                    setGreeting(e.target.value);
                    onChange();
                  }}
                />
              </Field>
              <Field label="After-hours message">
                <Textarea rows={4} value={afterHours} onChange={(e) => setAfterHours(e.target.value)} disabled={hours === "book"} />
                {hours === "book" && <p className="mt-1 text-[11px] text-muted">Not used: Anvi keeps booking 24/7.</p>}
              </Field>
            </div>

            <div className="rounded-xl bg-surface-2 p-4">
              <div className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">Preview · WhatsApp</div>
              <div className="flex items-end gap-2">
                <Avatar name={name || "Anvi"} ai size="xs" />
                <div className="max-w-md rounded-2xl rounded-bl-sm bg-surface px-3.5 py-2.5 text-sm shadow-card">
                  {greeting}
                  <div className="mt-1 text-right text-[10px] text-muted">{name || "Anvi"} · AI · 9:41 AM</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Guardrails"
            description="Always-on safety checks around every reply"
            action={
              <Badge tone="success">
                <ShieldCheck /> {rails.filter((r) => r.on).length}/{rails.length} on
              </Badge>
            }
          />
          <CardBody className="divide-y divide-line pb-3">
            {rails.map((r) => (
              <SettingRow key={r.id} title={r.label} description={r.description}>
                <Switch
                  checked={r.on}
                  label={r.label}
                  onChange={(v) => {
                    setRails((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: v } : x)));
                    onChange();
                    if (!v) toast({ title: `${r.label} turned off`, description: "This will apply after you publish.", tone: "warning" });
                  }}
                />
              </SettingRow>
            ))}
            <div className="pt-3">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => toast({ title: "Red-team test started", description: "Running 40 adversarial prompts against the draft…", tone: "info" })}>
                <Sparkles /> Run AI red-team test
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
