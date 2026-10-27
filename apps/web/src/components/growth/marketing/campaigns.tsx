"use client";

import {
  ArrowRight,
  Brain,
  CalendarClock,
  CircleCheck,
  Copy,
  Eye,
  IndianRupee,
  Layers,
  Pause,
  Pencil,
  Plus,
  Radio,
  Rocket,
  Sparkles,
  Target,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Sparkline } from "@/components/charts";
import {
  AiCallout,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  EmptyState,
  Input,
  Progress,
  Segmented,
  StatCard,
  useToast,
  type Tone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  dgChannelMeta,
  goalMeta,
  learnings,
  pipelineMeta,
  strategyMemory,
  type CampaignStatus,
  type DgCampaign,
  type MemoryGroup,
  type RunStatus,
} from "@/lib/mock/demand-gen";
import { AiPill } from "../shared";
import { CampaignPlanner } from "./campaign-planner";
import { DgChannelMark, PipelineSwitch, useDemandGen } from "./demand-gen-shared";

export const runStatusMeta: Record<RunStatus, { label: string; tone: Tone; icon: typeof Radio }> = {
  live: { label: "Live", tone: "success", icon: Radio },
  scheduled: { label: "Scheduled", tone: "info", icon: CalendarClock },
  in_review: { label: "In review", tone: "warning", icon: Eye },
  done: { label: "Done", tone: "neutral", icon: CircleCheck },
  paused: { label: "Paused", tone: "neutral", icon: Pause },
};

const campaignStatusMeta: Record<CampaignStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  planned: { label: "Planned", tone: "info" },
  completed: { label: "Completed", tone: "neutral" },
};

function totals(c: DgCampaign) {
  return c.channels.reduce(
    (acc, ch) => ({ spend: acc.spend + ch.spend, leads: acc.leads + ch.leads, outcomes: acc.outcomes + ch.outcomes }),
    { spend: 0, leads: 0, outcomes: 0 },
  );
}

export function Campaigns() {
  const toast = useToast();
  const { pipeline, campaigns, pendingCount, setTab } = useDemandGen();
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const mine = campaigns.filter((c) => c.pipeline === pipeline);
  const visible = mine.filter((c) => filter === "all" || c.status === filter);
  const open = campaigns.find((c) => c.id === openId) ?? null;

  const kpis = (() => {
    const active = mine.filter((c) => c.status === "active");
    const t = active.reduce(
      (acc, c) => {
        const x = totals(c);
        return { spend: acc.spend + x.spend, leads: acc.leads + x.leads, outcomes: acc.outcomes + x.outcomes };
      },
      { spend: 0, leads: 0, outcomes: 0 },
    );
    const channels = new Set(active.flatMap((c) => c.channels.filter((ch) => ch.status === "live").map((ch) => ch.channel)));
    return { ...t, active: active.length, channels: channels.size };
  })();

  const outcomeLabel = pipeline === "clinic" ? "Bookings" : "Demo calls";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted">Pipeline</span>
          <PipelineSwitch />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setTab("approvals")}>
            <CircleCheck /> {pendingCount} waiting for approval
          </Button>
          <Button size="sm" variant="ai" onClick={() => setPlannerOpen(true)}>
            <Sparkles /> Plan a campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active campaigns" value={kpis.active} hint={`${kpis.channels} channels live`} icon={<Layers />} />
        <StatCard label="Spend · active" value={formatCurrency(kpis.spend)} hint="across all channels" icon={<IndianRupee />} />
        <StatCard label={`${outcomeLabel} · active`} value={formatNumber(kpis.outcomes)} delta={pipeline === "clinic" ? 18.2 : 9.6} hint={`from ${formatNumber(kpis.leads)} leads`} icon={<Target />} />
        <Card className="relative overflow-hidden p-4 ring-1 ring-ai/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">Cost per {pipelineMeta[pipeline].outcome}</span>
            <Badge tone="ai" className="hidden sm:inline-flex">
              Closed-loop
            </Badge>
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(kpis.spend / Math.max(1, kpis.outcomes))}</div>
          <div className="mt-1 text-xs text-muted">Optimised on real {pipelineMeta[pipeline].outcomePlural}, not clicks</div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <MemoryCard key={pipeline} />
        <LearningsCard />
      </div>

      <Card>
        <CardHeader
          title="Campaigns"
          description="Every campaign runs across channels from one plan. Click a campaign to see each channel's assets and results."
        />
        <div className="scroll-thin overflow-x-auto px-5 pb-3">
            <Segmented
              size="xs"
              value={filter}
              onChange={setFilter}
              items={[
                { value: "all", label: "All", count: mine.length },
                { value: "active", label: "Active", count: mine.filter((c) => c.status === "active").length },
                { value: "planned", label: "Planned", count: mine.filter((c) => c.status === "planned").length },
                { value: "completed", label: "Done", count: mine.filter((c) => c.status === "completed").length },
              ]}
            />
        </div>
        {visible.length === 0 ? (
          <EmptyState
            icon={<Rocket />}
            title="No campaigns here yet"
            description="Tell the AI your goal and budget; it drafts the plan and every asset for you to approve."
            action={
              <Button size="sm" variant="ai" onClick={() => setPlannerOpen(true)}>
                <Sparkles /> Plan a campaign
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {visible.map((c) => (
              <CampaignRow key={c.id} c={c} onOpen={() => setOpenId(c.id)} />
            ))}
          </ul>
        )}
      </Card>

      {plannerOpen && <CampaignPlanner open onClose={() => setPlannerOpen(false)} />}

      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        width="max-w-3xl"
        title={
          open && (
            <span className="flex flex-wrap items-center gap-2">
              {open.name} <Badge tone={campaignStatusMeta[open.status].tone}>{campaignStatusMeta[open.status].label}</Badge>
            </span>
          )
        }
        footer={
          open && (
            <>
              <Button
                variant="ghost"
                onClick={() => toast({ title: `Duplicated ‘${open.name}’`, description: "Saved as a draft plan. Assets will be regenerated from the latest memory.", tone: "info" })}
              >
                <Copy /> Duplicate
              </Button>
              {open.status === "active" && (
                <Button variant="outline" onClick={() => toast({ title: "Pause request sent to Approvals", description: "All live channels pause once you approve.", tone: "info" })}>
                  <Pause /> Pause all
                </Button>
              )}
              <Button
                variant="ai"
                onClick={() => {
                  toast({ title: "Optimisation pass started", description: "New budget and copy suggestions will appear in Approvals in ≈1 min." });
                }}
              >
                <WandSparkles /> Optimise now
              </Button>
            </>
          )
        }
      >
        {open && <CampaignDetail c={open} />}
      </Drawer>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CampaignRow({ c, onOpen }: { c: DgCampaign; onOpen: () => void }) {
  const t = totals(c);
  const pct = c.target ? (t.outcomes / c.target) * 100 : 0;
  const st = campaignStatusMeta[c.status];
  return (
    <li>
      <button onClick={onOpen} className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-2/60 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1fr)_96px] md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-fg">{c.name}</span>
            <Badge tone={st.tone}>{st.label}</Badge>
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {goalMeta[c.goal].label} · {c.dates} · {c.owner}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.channels.map((ch) => {
            const rs = runStatusMeta[ch.status];
            return (
              <span
                key={ch.channel}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-0.5 pr-2 pl-0.5 text-[11px] text-fg-2"
                title={`${dgChannelMeta[ch.channel].label}: ${rs.label}`}
              >
                <DgChannelMark channel={ch.channel} size="xs" />
                <rs.icon
                  className={cn("size-3", rs.tone === "success" ? "text-success" : rs.tone === "warning" ? "text-warning" : rs.tone === "info" ? "text-info" : "text-muted")}
                  aria-hidden
                />
                {rs.label}
              </span>
            );
          })}
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-muted">
              {goalMeta[c.goal].outcomeShort} {t.outcomes}/{c.target}
            </span>
            <span className="text-fg-2 tabular">
              {formatCurrency(t.spend)} / {formatCurrency(c.budget)}
            </span>
          </div>
          <Progress value={pct} tone={pct >= 100 ? "success" : "primary"} />
          <div className="mt-1 text-xs text-muted">
            {t.outcomes ? `${formatCurrency(t.spend / t.outcomes)} per ${goalMeta[c.goal].outcomeShort.toLowerCase().replace(/s$/, "")}` : "Not started"}
          </div>
        </div>
        <div className="hidden md:block">{c.trend.length ? <Sparkline data={c.trend} height={28} /> : <span className="text-xs text-muted">Starts {c.dates.split("–")[0]}</span>}</div>
      </button>
    </li>
  );
}

function CampaignDetail({ c }: { c: DgCampaign }) {
  const { setTab } = useDemandGen();
  const t = totals(c);
  return (
    <div className="space-y-5 p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Spend", value: `${formatCurrency(t.spend)}`, sub: `of ${formatCurrency(c.budget)}` },
          { label: "Leads", value: formatNumber(t.leads), sub: "all channels" },
          { label: goalMeta[c.goal].outcomeShort, value: `${t.outcomes}`, sub: `target ${c.target}` },
          { label: "Cost per outcome", value: t.outcomes ? formatCurrency(t.spend / t.outcomes) : "–", sub: "closed-loop" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-line p-3">
            <div className="text-xs text-muted">{k.label}</div>
            <div className="mt-1 text-lg font-semibold tabular">{k.value}</div>
            <div className="text-xs text-muted">{k.sub}</div>
          </div>
        ))}
      </div>

      <AiCallout title="Campaign summary">{c.aiSummary}</AiCallout>

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Users className="size-4 text-muted" aria-hidden /> Audience segments
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {c.audience.map((a) => (
            <Badge key={a}>{a}</Badge>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Channels</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {c.channels.map((ch) => {
            const rs = runStatusMeta[ch.status];
            return (
              <div key={ch.channel} className="rounded-xl border border-line p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                    <DgChannelMark channel={ch.channel} />
                    <span className="truncate">{dgChannelMeta[ch.channel].label}</span>
                  </span>
                  <Badge tone={rs.tone}>
                    <rs.icon aria-hidden /> {rs.label}
                  </Badge>
                </div>
                {ch.budget > 0 ? (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>
                        {formatCurrency(ch.spend)} of {formatCurrency(ch.budget)}
                      </span>
                      <span>{Math.round((ch.spend / ch.budget) * 100)}%</span>
                    </div>
                    <Progress value={(ch.spend / ch.budget) * 100} />
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-muted">No media spend · included</div>
                )}
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted">Leads</dt>
                    <dd className="font-semibold text-fg tabular">{ch.leads || "–"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">{goalMeta[c.goal].outcomeShort}</dt>
                    <dd className="font-semibold text-fg tabular">{ch.outcomes || "–"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Cost / outcome</dt>
                    <dd className="font-semibold text-fg tabular">{ch.outcomes ? formatCurrency(ch.spend / ch.outcomes) : "–"}</dd>
                  </div>
                </dl>
                {ch.note && <p className="mt-2 text-xs text-fg-2">{ch.note}</p>}
                {ch.assets.length > 0 && (
                  <ul className="mt-3 space-y-2 border-t border-line pt-3">
                    {ch.assets.map((a) => (
                      <li key={a.id} className="rounded-lg bg-surface-2 p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-muted">{a.label}</span>
                          {a.stat && <span className="text-[11px] font-medium text-fg-2 tabular">{a.stat}</span>}
                        </div>
                        <div className="mt-0.5 text-sm font-medium text-fg">{a.title}</div>
                        <p className="mt-0.5 line-clamp-3 text-xs text-fg-2">{a.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {ch.assets.length === 0 && ch.status === "in_review" && (
                  <Button size="xs" variant="outline" className="mt-3" onClick={() => setTab("approvals")}>
                    Review drafts <ArrowRight />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Zap className="size-4 text-ai" aria-hidden /> Cross-channel learnings applied
        </h3>
        <ul className="space-y-2">
          {c.learningsApplied.map((l, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-line p-3">
              <span className="flex shrink-0 items-center gap-1 pt-0.5">
                <DgChannelMark channel={l.from} size="xs" />
                <ArrowRight className="size-3 text-muted" aria-label="applied to" />
                <DgChannelMark channel={l.to} size="xs" />
              </span>
              <span className="text-sm text-fg-2">{l.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brand & strategy memory                                             */
/* ------------------------------------------------------------------ */

function MemoryCard() {
  const toast = useToast();
  const { pipeline } = useDemandGen();
  const [groups, setGroups] = useState<MemoryGroup[]>(strategyMemory[pipeline]);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function remove(key: string, item: string) {
    setGroups((gs) => gs.map((g) => (g.key === key ? { ...g, items: g.items.filter((i) => i !== item) } : g)));
    toast({ title: "Removed from memory", description: `All agents will stop using “${item}”.`, tone: "info" });
  }

  function add(key: string) {
    const v = draft.trim();
    if (!v) return setAdding(null);
    setGroups((gs) => gs.map((g) => (g.key === key ? { ...g, items: [...g.items, v] } : g)));
    setDraft("");
    setAdding(null);
    toast({ title: "Added to memory", description: "Ads, email, landing pages and the inbox AI will use it from now on." });
  }

  const chipTone: Record<string, string> = {
    winners: "border-success/30 bg-success-soft text-success",
    losers: "border-danger/30 bg-danger-soft text-danger",
  };

  return (
    <Card className="flex flex-col xl:col-span-3">
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Brain className="size-4 text-ai" aria-hidden /> Brand & strategy memory
          </span>
        }
        description={`What the AI knows about ${pipelineMeta[pipeline].short}. Shared by every Anvita agent: ads, email, landing pages, outbound and inbox.`}
        action={
          <Button size="sm" variant={editing ? "primary" : "outline"} onClick={() => setEditing((e) => !e)}>
            {editing ? (
              <>
                <CircleCheck /> Done
              </>
            ) : (
              <>
                <Pencil /> Edit
              </>
            )}
          </Button>
        }
      />
      <CardBody className="grid gap-4 pt-0 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.key} className="min-w-0">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-fg">{g.label}</span>
              <span className="truncate text-[11px] text-muted">{g.hint}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <span
                  key={item}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                    chipTone[g.key] ?? "border-line bg-surface-2 text-fg-2",
                  )}
                >
                  {g.key === "winners" && <span aria-hidden>▲</span>}
                  {g.key === "losers" && <span aria-hidden>▼</span>}
                  <span className="truncate">{item}</span>
                  {editing && (
                    <button onClick={() => remove(g.key, item)} aria-label={`Remove ${item}`} className="-mr-0.5 rounded-full p-0.5 hover:bg-surface-3">
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))}
              {adding === g.key ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    add(g.key);
                  }}
                  className="flex w-full items-center gap-1.5"
                >
                  <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Add to ${g.label.toLowerCase()}…`} className="h-7 text-xs" aria-label={`Add to ${g.label}`} />
                  <Button size="xs" type="submit">
                    Add
                  </Button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setAdding(g.key);
                    setDraft("");
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2 py-0.5 text-xs text-muted hover:text-fg"
                >
                  <Plus className="size-3" aria-hidden /> Add
                </button>
              )}
            </div>
          </div>
        ))}
      </CardBody>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 text-xs text-muted">
        <span>Learned from 14 campaigns, 1,240 reviews and 3,812 conversations · updated 2h ago</span>
        <Button size="xs" variant="ghost" onClick={() => toast({ title: "Re-reading your website, reviews and last 90 days of results", description: "Memory suggestions will appear here in ≈2 min.", tone: "info" })}>
          <Sparkles /> Refresh from data
        </Button>
      </div>
    </Card>
  );
}

function LearningsCard() {
  const { pipeline } = useDemandGen();
  const toast = useToast();
  const [all, setAll] = useState(false);
  const items = all ? learnings[pipeline] : learnings[pipeline].slice(0, 3);
  return (
    <Card className="flex flex-col xl:col-span-2">
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            Last learned from <AiPill>Cross-channel</AiPill>
          </span>
        }
        description="What worked on one channel, applied to the others"
      />
      <ol className="relative mx-5 mb-4 space-y-4 border-l border-line pl-5">
        {items.map((l) => (
          <li key={l.id} className="relative">
            <span className="absolute top-0.5 -left-[31px] rounded-full bg-surface p-0.5">
              <DgChannelMark channel={l.source} size="xs" />
            </span>
            <div className="text-xs text-muted">{l.when}</div>
            <div className="mt-0.5 text-sm">
              <span className="font-semibold text-fg">{l.sourceLabel}:</span> <span className="text-fg-2">{l.metric}</span>
            </div>
            <div className="mt-1 flex items-start gap-1.5 text-sm text-fg-2">
              <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-ai" aria-hidden />
              <span>{l.applied}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {l.appliedTo.map((ch) => (
                <span key={ch} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pr-2 pl-0.5 text-[11px] text-fg-2">
                  <DgChannelMark channel={ch} size="xs" /> {dgChannelMeta[ch].short}
                </span>
              ))}
              {l.result && (
                <Badge tone="success">
                  <Target aria-hidden /> {l.result}
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ol>
      {learnings[pipeline].length > 3 && (
        <div className="-mt-1 mb-3 px-5">
          <Button size="xs" variant="ghost" onClick={() => setAll((a) => !a)}>
            {all ? "Show fewer" : `Show all ${learnings[pipeline].length} learnings`}
          </Button>
        </div>
      )}
      <div className="mt-auto border-t border-line px-5 py-3">
        <Button size="xs" variant="ghost" onClick={() => toast({ title: "Learning loop settings", description: "Auto-apply is on for copy angles; budget changes always need approval.", tone: "info" })}>
          Auto-apply: copy angles on · budget needs approval
        </Button>
      </div>
    </Card>
  );
}
