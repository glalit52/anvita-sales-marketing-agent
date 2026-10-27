"use client";

import { ArrowLeft, CalendarCheck, ChevronRight, Copy, MessageSquareReply, Pause, Play, Plus, Rocket, Search, Send, Split, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkline, series } from "@/components/charts";
import { SequenceSettings, SequenceStats, StepEditor, stepMeta } from "@/components/outbound/sequence-parts";
import { AiCallout, Avatar, Badge, Button, Card, ChannelIcon, Drawer, Input, Page, PageHeader, Segmented, StatCard, Tabs, useToast, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { sequences as seed, type SeqStatus, type Sequence, type SequenceStep, type StepType } from "@/lib/mock/outbound";

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

const statusMeta: Record<SeqStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  paused: { label: "Paused", tone: "warning" },
  draft: { label: "Draft", tone: "neutral" },
};

const newStepTemplates: Record<StepType, Omit<SequenceStep, "id" | "day">> = {
  email: { type: "email", title: "Follow-up email", subject: "Re: {{company}}", body: "Hi {{first_name}},\n\nBumping this up in case it got buried.\n\n{{sender_name}}", stats: { sent: 0, opened: 0, replied: 0, booked: 0 } },
  whatsapp: { type: "whatsapp", title: "WhatsApp template: followup_v1", body: "Hi {{first_name}} ji, just checking if you saw my note about {{company}}?", stats: { sent: 0, opened: 0, replied: 0, booked: 0 } },
  sms: { type: "sms", title: "SMS nudge (DLT)", body: "Hi {{first_name}}, reply YES for a 15-min demo. -AGRGRW", stats: { sent: 0, opened: 0, replied: 0, booked: 0 } },
  linkedin: { type: "linkedin", title: "LinkedIn task: comment + DM", body: "Engage with a recent post, then DM {{first_name}}.", stats: { sent: 0, opened: 0, replied: 0, booked: 0 } },
  call: { type: "call", title: "Call task", body: "Call {{first_name}} and reference {{ai_first_line}}.", stats: { sent: 0, opened: 0, replied: 0, booked: 0 } },
};

export default function SequencesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Sequence[]>(seed);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | SeqStatus>("all");
  const [query, setQuery] = useState("");

  const open = items.find((s) => s.id === openId);
  const update = (id: string, patch: Partial<Sequence>) => setItems((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  if (open) return <SequenceDetail key={open.id} seq={open} onBack={() => setOpenId(null)} onUpdate={(p) => update(open.id, p)} />;

  const rows = items.filter((s) => (filter === "all" || s.status === filter) && s.name.toLowerCase().includes(query.toLowerCase()));
  const active = items.filter((s) => s.status === "active");
  const enrolled = items.reduce((a, s) => a + s.active, 0);
  const meetings = items.reduce((a, s) => a + s.meetings, 0);

  const createNew = () => {
    const id = nextId("qnew");
    const fresh: Sequence = {
      id,
      name: "Untitled sequence",
      status: "draft",
      owner: "Priya Sharma",
      audience: "Not selected",
      enrolled: 0,
      active: 0,
      replyRate: 0,
      meetings: 0,
      trend: Array(12).fill(0),
      updated: "Just now",
      steps: [{ id: `${id}-1`, day: 0, ...newStepTemplates.email, title: "Intro email", subject: "Quick idea for {{company}}", body: "Hi {{first_name}},\n\n{{ai_first_line}}\n\n" }],
    };
    setItems((l) => [fresh, ...l]);
    setOpenId(id);
  };

  return (
    <Page>
      <PageHeader
        title="Sequences"
        description="Multi-step outreach across email, WhatsApp, LinkedIn and calls, personalised per lead by AI. Auto-pauses on reply."
        actions={
          <>
            <Button variant="outline" onClick={() => toast({ title: "Copilot is drafting a sequence", description: "Based on your best-performing steps and the “Agri-input dealers” ICP.", tone: "info" })}>
              <Split /> Generate with AI
            </Button>
            <Button onClick={createNew}>
              <Plus /> New sequence
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active sequences" value={active.length} hint={`${items.length} total`} icon={<Send />} />
        <StatCard label="Leads in progress" value={formatNumber(enrolled)} delta={14.1} hint="vs last week" icon={<Users />} />
        <StatCard label="Avg. reply rate" value={`${(active.reduce((a, s) => a + s.replyRate, 0) / Math.max(1, active.length)).toFixed(1)}%`} delta={2.3} hint="active sequences" icon={<MessageSquareReply />} />
        <StatCard label="Meetings booked" value={meetings} delta={31.0} hint="last 30 days" icon={<CalendarCheck />} />
      </div>

      <AiCallout
        className="mt-4"
        title="WhatsApp step at D2 is your best performer"
        action={
          <Button size="xs" variant="outline" onClick={() => toast({ title: "Suggestion applied to 2 sequences", description: "WhatsApp step moved to D2 in Drip distributors & Seed licence holders." })}>
            Apply to other sequences
          </Button>
        }
      >
        It gets a 16% reply rate vs 10% for email-only follow-ups. Adding it to “Drip distributors: Gujarat” could add ~4 meetings/month.
      </AiCallout>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <Segmented
            value={filter}
            onChange={setFilter}
            items={[
              { value: "all", label: "All", count: items.length },
              { value: "active", label: "Active", count: items.filter((s) => s.status === "active").length },
              { value: "paused", label: "Paused" },
              { value: "draft", label: "Drafts" },
            ]}
          />
          <Input icon={<Search />} placeholder="Search sequences…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-64" aria-label="Search sequences" />
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                <th className="px-4 py-2.5">Sequence</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Steps</th>
                <th className="px-3 py-2.5 text-right">Enrolled</th>
                <th className="px-3 py-2.5 text-right">Reply rate</th>
                <th className="px-3 py-2.5 text-right">Meetings</th>
                <th className="w-32 px-3 py-2.5">Replies, 12 wks</th>
                <th className="px-3 py-2.5">Owner</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => setOpenId(s.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2/60">
                  <td className="min-w-[260px] px-4 py-3">
                    <button className="text-left font-medium text-fg hover:text-primary" onClick={() => setOpenId(s.id)}>
                      {s.name}
                    </button>
                    <div className="text-xs text-muted">
                      {s.audience} · updated {s.updated}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={statusMeta[s.status].tone} dot>
                      {statusMeta[s.status].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex -space-x-1">
                      {s.steps.map((st) => (
                        <ChannelIcon key={st.id} channel={stepMeta[st.type].channel} size="xs" className="ring-2 ring-surface" />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular">{formatNumber(s.enrolled)}</td>
                  <td className="px-3 py-3 text-right font-medium tabular">{s.status === "draft" ? "–" : `${s.replyRate}%`}</td>
                  <td className="px-3 py-3 text-right tabular">{s.meetings}</td>
                  <td className="px-3 py-3">
                    <Sparkline data={s.trend} color={series[0]} height={28} />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Avatar name={s.owner} size="xs" />
                      <span className="text-fg-2">{s.owner.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="pr-3">
                    <ChevronRight className="size-4 text-muted" />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted">
                    No sequences match. <button className="text-primary hover:underline" onClick={() => { setFilter("all"); setQuery(""); }}>Clear filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
}

function SequenceDetail({ seq, onBack, onUpdate }: { seq: Sequence; onBack: () => void; onUpdate: (patch: Partial<Sequence>) => void }) {
  const toast = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<"steps" | "settings" | "stats">("steps");
  const [stepId, setStepId] = useState<string | null>(seq.steps[0]?.id ?? null);
  const [drawer, setDrawer] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(seq.name);
  const step = seq.steps.find((s) => s.id === stepId) ?? null;

  const updateStep = (id: string, patch: Partial<SequenceStep>) => onUpdate({ steps: seq.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)).sort((a, b) => a.day - b.day) });

  const selectStep = (id: string) => {
    setStepId(id);
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1024px)").matches) setDrawer(true);
  };

  const addStep = (type: StepType) => {
    const last = seq.steps[seq.steps.length - 1];
    const id = nextId(`${seq.id}-step`);
    onUpdate({ steps: [...seq.steps, { id, day: (last?.day ?? 0) + 2, ...newStepTemplates[type] }] });
    setAdding(false);
    selectStep(id);
  };

  const removeStep = (id: string) => {
    onUpdate({ steps: seq.steps.filter((s) => s.id !== id) });
    if (stepId === id) setStepId(seq.steps.find((s) => s.id !== id)?.id ?? null);
    toast({ title: "Step removed" });
  };

  const statusAction =
    seq.status === "active" ? (
      <Button variant="outline" onClick={() => { onUpdate({ status: "paused" }); toast({ title: "Sequence paused", description: "Scheduled steps are on hold. Replies still arrive in Inbox.", tone: "warning" }); }}>
        <Pause /> Pause
      </Button>
    ) : seq.status === "paused" ? (
      <Button onClick={() => { onUpdate({ status: "active" }); toast({ title: "Sequence resumed" }); }}>
        <Play /> Resume
      </Button>
    ) : (
      <Button onClick={() => { onUpdate({ status: "active", updated: "Just now" }); toast({ title: "Sequence launched 🚀", description: "First step sends tomorrow at 10:00 AM in each lead's timezone." }); }} disabled={seq.steps.length === 0}>
        <Rocket /> Launch
      </Button>
    );

  const editor = step ? (
    <StepEditor key={step.id} step={step} onChange={(p) => updateStep(step.id, p)} />
  ) : (
    <div className="py-10 text-center text-sm text-muted">Select a step to edit it.</div>
  );

  return (
    <Page>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> All sequences
      </button>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => onUpdate({ name: name.trim() || seq.name })}
              aria-label="Sequence name"
              className="max-w-full min-w-0 rounded-md bg-transparent px-1 -mx-1 outline-none [field-sizing:content] hover:bg-surface-2 focus:bg-surface-2"
            />
            <Badge tone={statusMeta[seq.status].tone} dot>
              {statusMeta[seq.status].label}
            </Badge>
          </span>
        }
        description={`${seq.audience} · ${formatNumber(seq.enrolled)} enrolled · ${seq.active} active · owner ${seq.owner}`}
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Duplicate sequence" onClick={() => toast({ title: "Sequence duplicated", description: `“${seq.name} (copy)” saved as draft.` })}>
              <Copy />
            </Button>
            <Button variant="outline" onClick={() => router.push("/prospecting")}>
              <UserPlus /> Enroll leads
            </Button>
            {statusAction}
          </>
        }
      >
        <Tabs
          className="mt-5"
          value={tab}
          onChange={setTab}
          items={[
            { value: "steps", label: "Steps", count: seq.steps.length },
            { value: "settings", label: "Settings" },
            { value: "stats", label: "Stats" },
          ]}
        />
      </PageHeader>

      {tab === "steps" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div>
            <ol className="relative">
              {seq.steps.map((s, i) => {
                const meta = stepMeta[s.type];
                const prev = seq.steps[i - 1];
                const gap = prev ? s.day - prev.day : 0;
                const active = s.id === stepId;
                return (
                  <li key={s.id}>
                    {i > 0 && (
                      <div className="flex items-center gap-3 py-1.5 pl-[18px]">
                        <span className="h-6 w-px bg-line-strong" aria-hidden />
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">{gap === 0 ? "Same day" : `Wait ${gap} day${gap > 1 ? "s" : ""}`} · if no reply</span>
                      </div>
                    )}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => selectStep(s.id)}
                      onKeyDown={(e) => e.key === "Enter" && selectStep(s.id)}
                      className={cn("group flex cursor-pointer gap-3 rounded-xl border bg-surface p-3 shadow-card transition-colors sm:p-4", active ? "border-primary ring-2 ring-[var(--ring)]" : "border-line hover:border-line-strong")}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <ChannelIcon channel={meta.channel} size="md" />
                        <span className="text-[11px] font-semibold text-muted">D{s.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{s.title}</span>
                          {meta.manual && <Badge tone="neutral">Manual task</Badge>}
                          {s.abTest && (
                            <Badge tone="ai">
                              <Split /> A/B
                            </Badge>
                          )}
                        </div>
                        {s.subject && <div className="mt-0.5 truncate text-xs text-fg-2">Subject: {s.subject}</div>}
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{s.body}</p>
                        {seq.status !== "draft" && s.stats.sent > 0 && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-2 tabular">
                            <span>{formatNumber(s.stats.sent)} {meta.manual ? "done" : "sent"}</span>
                            {s.stats.opened > 0 && <span>{((s.stats.opened / s.stats.sent) * 100).toFixed(0)}% {s.type === "whatsapp" ? "read" : "opened"}</span>}
                            <span>{((s.stats.replied / s.stats.sent) * 100).toFixed(1)}% replied</span>
                            <span>{s.stats.booked} booked</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(s.id);
                        }}
                        className="self-start rounded-md p-1 text-muted opacity-100 hover:bg-surface-2 hover:text-danger lg:opacity-0 lg:group-hover:opacity-100"
                        aria-label={`Remove step ${s.title}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-3 pl-[18px]">
              <span className="block h-4 w-px bg-line-strong" aria-hidden />
              {adding ? (
                <div className="animate-fade-in mt-1 flex flex-wrap gap-2 rounded-xl border border-dashed border-line-strong p-3">
                  {(Object.keys(stepMeta) as StepType[]).map((t) => (
                    <Button key={t} size="sm" variant="outline" onClick={() => addStep(t)}>
                      <ChannelIcon channel={stepMeta[t].channel} size="xs" /> {stepMeta[t].label}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="mt-1" onClick={() => setAdding(true)}>
                  <Plus /> Add step
                </Button>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2.5 text-xs text-muted">
              <span className="font-medium text-fg-2">Exit:</span> reply on any channel · meeting booked · unsubscribe · hard bounce
            </div>
          </div>

          <Card className="hidden self-start p-4 lg:sticky lg:top-4 lg:block">{editor}</Card>
        </div>
      )}

      {tab === "settings" && <SequenceSettings />}
      {tab === "stats" && <SequenceStats seq={seq} />}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={step ? `Edit: ${step.title}` : "Edit step"} footer={<Button onClick={() => setDrawer(false)}>Done</Button>}>
        <div className="p-4">{editor}</div>
      </Drawer>
    </Page>
  );
}
