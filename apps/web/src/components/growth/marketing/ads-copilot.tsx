"use client";

import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  IndianRupee,
  Lightbulb,
  Pause,
  Plug,
  RefreshCw,
  RotateCcw,
  Scissors,
  Sparkles,
  Target,
  UserPlus,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AreaTrend, LineTrend, Sparkline } from "@/components/charts";
import {
  AiCallout,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Modal,
  Segmented,
  Select,
  StatCard,
  Switch,
  Textarea,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  adAccounts,
  adAuditLog,
  adCampaigns,
  adCopyVariants,
  adDaily,
  adRecommendations,
  type AdCampaign,
  type AdPlatform,
  type AdRecommendation,
  type AuditEntry,
  type RecKind,
} from "@/lib/mock/growth";
import { AdPlatformMark, ChartCard, Confidence } from "../shared";

const recIcon: Record<RecKind, typeof Lightbulb> = {
  budget: IndianRupee,
  keyword: Scissors,
  schedule: Clock,
  pause: Pause,
  copy: WandSparkles,
};

const accountStatus = {
  connected: { tone: "success" as const, label: "Connected", icon: CircleCheck },
  attention: { tone: "warning" as const, label: "Needs attention", icon: CircleAlert },
  disconnected: { tone: "neutral" as const, label: "Not connected", icon: Plug },
};

export function AdsCopilot() {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(adCampaigns);
  const [platform, setPlatform] = useState<"all" | AdPlatform>("all");
  const [recs, setRecs] = useState<(AdRecommendation & { state?: "applied" | "dismissed" })[]>(adRecommendations);
  const [log, setLog] = useState<AuditEntry[]>(adAuditLog);
  const [copyOpen, setCopyOpen] = useState(false);
  const [confirmRec, setConfirmRec] = useState<AdRecommendation | null>(null);
  const [sortKey, setSortKey] = useState<"costPerBooked" | "spend" | "roas">("costPerBooked");

  const visible = useMemo(() => {
    const rows = campaigns
      .filter((c) => platform === "all" || c.platform === platform)
      .map((c) => ({ ...c, cpl: c.spend / c.leads, costPerBooked: c.spend / c.booked, roas: c.revenue / c.spend }));
    return rows.sort((a, b) => (sortKey === "costPerBooked" ? a.costPerBooked - b.costPerBooked : b[sortKey] - a[sortKey]));
  }, [campaigns, platform, sortKey]);

  const totals = visible.reduce((acc, c) => ({ spend: acc.spend + c.spend, leads: acc.leads + c.leads, booked: acc.booked + c.booked }), { spend: 0, leads: 0, booked: 0 });

  const pendingRecs = recs.filter((r) => !r.state);

  function logChange(change: string, p: AdPlatform, result?: string) {
    setLog((l) => [{ id: `a${Date.now()}`, when: "Just now", actor: "Priya Sharma", change, platform: p, result }, ...l]);
  }

  function approve(rec: AdRecommendation) {
    setRecs((rs) => rs.map((r) => (r.id === rec.id ? { ...r, state: "applied" } : r)));
    if (rec.id === "rec1") {
      setCampaigns((cs) =>
        cs.map((c) => (c.id === "cmp1" ? { ...c, dailyBudget: c.dailyBudget - 500 } : c.id === "cmp2" ? { ...c, dailyBudget: c.dailyBudget + 500 } : c)),
      );
    }
    logChange(rec.title, rec.platform, "Pending: results in ~7 days");
    setConfirmRec(null);
    toast({ title: "Change pushed to " + (rec.platform === "google" ? "Google Ads" : "Meta Ads"), description: "Logged in the audit trail. You can revert anytime." });
  }

  function toggleCampaign(c: AdCampaign, active: boolean) {
    setCampaigns((cs) => cs.map((x) => (x.id === c.id ? { ...x, active } : x)));
    logChange(`${active ? "Resumed" : "Paused"} ‘${c.name}’`, c.platform);
    toast({ title: `${c.name} ${active ? "resumed" : "paused"}`, tone: "info" });
  }

  return (
    <div className="space-y-4">
      {/* Connected accounts */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adAccounts.map((a) => {
          const st = accountStatus[a.status];
          return (
            <Card key={a.id} className="flex items-start gap-3 p-3.5">
              <AdPlatformMark platform={a.platform} size="md" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{a.name}</div>
                <div className="truncate text-xs text-fg-2">{a.account}</div>
                <div className="mt-0.5 truncate text-xs text-muted" title={a.detail}>
                  {a.detail}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <Badge tone={st.tone}>
                    <st.icon aria-hidden /> {st.label}
                  </Badge>
                  {a.status !== "connected" && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() =>
                        toast({
                          title: a.status === "attention" ? "Opening GA4 key-event setup" : "Redirecting to LinkedIn to authorise",
                          tone: "info",
                        })
                      }
                    >
                      {a.status === "attention" ? "Fix" : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ad spend · 30d" value={formatCurrency(totals.spend)} delta={6.4} goodWhen="down" hint="vs prev. 30d" icon={<IndianRupee />} />
        <StatCard label="Leads" value={formatNumber(totals.leads)} delta={14.8} hint="chats + forms" icon={<UserPlus />} />
        <StatCard label="Cost per lead" value={formatCurrency(totals.spend / Math.max(1, totals.leads))} delta={-7.3} goodWhen="down" hint="platform-reported" icon={<Target />} />
        <Card className="relative overflow-hidden p-4 ring-1 ring-ai/30">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">Cost per booked lead</span>
            <Badge tone="ai" className="hidden sm:inline-flex">
              Closed-loop
            </Badge>
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{formatCurrency(totals.spend / Math.max(1, totals.booked))}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
            <span className="inline-flex items-center font-medium text-success">↓ −11.2%</span>
            <span className="text-muted">{totals.booked} bookings from ads</span>
          </div>
        </Card>
      </div>

      <AiCallout
        title="Anvita sees past the click"
        action={
          <Button size="xs" variant="outline" onClick={() => document.getElementById("ai-recs")?.scrollIntoView({ behavior: "smooth" })}>
            Review {pendingRecs.length} recommendations <ArrowRight />
          </Button>
        }
      >
        Because the AI agent books the appointment in the same chat, every ad rupee is tied to a real booking and payment, not just a form fill.
        ‘Implants – Broad’ has a decent CPL (₹500) but the worst cost per booked lead (₹5,333).
      </AiCallout>

      {/* Trend charts: two separate charts, never dual-axis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily ad spend"
          description="Google + Meta, last 30 days"
          table={{
            columns: [
              { key: "date", label: "Date" },
              { key: "spend", label: "Spend", align: "right", render: (r) => formatCurrency(r.spend) },
              { key: "leads", label: "Leads", align: "right" },
            ],
            rows: adDaily,
          }}
        >
          <AreaTrend data={adDaily} xKey="date" series={[{ key: "spend", label: "Spend" }]} height={200} format={(v) => `₹${(v / 1000).toFixed(1)}k`} />
        </ChartCard>
        <ChartCard
          title="Cost per booked lead"
          description="7-day rolling: spend ÷ appointments booked by the AI or team"
          table={{
            columns: [
              { key: "date", label: "Date" },
              { key: "booked", label: "Booked", align: "right" },
              { key: "costPerBooked", label: "Cost / booked", align: "right", render: (r) => formatCurrency(r.costPerBooked) },
            ],
            rows: adDaily,
          }}
        >
          <LineTrend data={adDaily} xKey="date" series={[{ key: "costPerBooked", label: "Cost per booked lead" }]} height={200} format={(v) => `₹${(v / 1000).toFixed(1)}k`} />
        </ChartCard>
      </div>

      {/* Campaigns */}
      <Card>
        <CardHeader
          title="Campaigns"
          description="Sorted by what matters: cost per booked lead"
          action={
            <Button size="sm" variant="ai" onClick={() => setCopyOpen(true)}>
              <Sparkles /> Generate ad copy
            </Button>
          }
        />
        <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
          <Segmented
            size="xs"
            value={platform}
            onChange={setPlatform}
            items={[
              { value: "all", label: "All", count: campaigns.length },
              { value: "google", label: "Google", count: campaigns.filter((c) => c.platform === "google").length },
              { value: "meta", label: "Meta", count: campaigns.filter((c) => c.platform === "meta").length },
            ]}
          />
          <div className="ml-auto flex items-center gap-2 text-xs text-muted">
            <span>Sort</span>
            <Select aria-label="Sort campaigns" className="h-8! w-auto! text-xs!" value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)}>
              <option value="costPerBooked">Cost / booked (low → high)</option>
              <option value="spend">Spend (high → low)</option>
              <option value="roas">ROAS (high → low)</option>
            </Select>
          </div>
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-y border-line bg-surface-2 text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-2 text-left font-medium">Campaign</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Spend</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Leads</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Booked</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">CPL</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Cost / booked</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">ROAS</th>
                <th scope="col" className="w-28 px-3 py-2 text-left font-medium">Bookings 7d</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((c, i) => {
                const best = i === 0 && sortKey === "costPerBooked";
                const worst = c.costPerBooked > 4000;
                return (
                  <tr key={c.id} className={cn("hover:bg-surface-2/60", !c.active && "opacity-60")}>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <AdPlatformMark platform={c.platform} />
                        <div className="min-w-0">
                          <div className="font-medium text-fg">{c.name}</div>
                          <div className="text-xs text-muted">
                            {c.objective} · {formatCurrency(c.dailyBudget)}/day
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular">{formatCurrency(c.spend)}</td>
                    <td className="px-3 py-2.5 text-right tabular">{c.leads}</td>
                    <td className="px-3 py-2.5 text-right tabular">{c.booked}</td>
                    <td className="px-3 py-2.5 text-right text-fg-2 tabular">{formatCurrency(c.cpl)}</td>
                    <td className="px-3 py-2.5 text-right tabular">
                      <span className="font-semibold">{formatCurrency(c.costPerBooked)}</span>
                      {best && <Badge tone="success" className="ml-1.5">Best</Badge>}
                      {worst && <Badge tone="danger" className="ml-1.5">High</Badge>}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular">{c.roas.toFixed(1)}×</td>
                    <td className="px-3 py-2.5">
                      <Sparkline data={c.trend} height={24} />
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted">{c.active ? "Active" : "Paused"}</span>
                        <Switch size="sm" checked={c.active} onChange={(v) => toggleCampaign(c, v)} label={`${c.active ? "Pause" : "Resume"} ${c.name}`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recommendations + audit log */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" id="ai-recs">
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                AI recommendations <Badge tone="ai">{pendingRecs.length} to review</Badge>
              </span>
            }
            description="Nothing changes in your ad accounts until you approve"
            action={
              <Button size="sm" variant="ghost" onClick={() => toast({ title: "Re-analysing last 30 days", description: "New recommendations in ≈1 min.", tone: "info" })}>
                <RefreshCw /> Refresh
              </Button>
            }
          />
          {pendingRecs.length === 0 ? (
            <EmptyState icon={<CircleCheck />} title="You're all caught up" description="The co-pilot re-checks your accounts every 6 hours." />
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {pendingRecs.map((r) => {
                const Icon = recIcon[r.kind];
                return (
                  <li key={r.id} className="flex gap-3 px-5 py-4">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai-soft text-ai [&_svg]:size-4">
                      <Icon aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-fg">{r.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-fg-2">{r.rationale}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <Badge tone="success">
                          <Target aria-hidden /> {r.impact}
                        </Badge>
                        <Confidence value={r.confidence} />
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <AdPlatformMark platform={r.platform} size="xs" /> {r.platform === "google" ? "Google Ads" : "Meta Ads"}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => (r.kind === "budget" ? setConfirmRec(r) : approve(r))}>
                          <Check /> Approve
                        </Button>
                        {r.kind === "copy" && (
                          <Button size="sm" variant="outline" onClick={() => setCopyOpen(true)}>
                            <WandSparkles /> See variants
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRecs((rs) => rs.map((x) => (x.id === r.id ? { ...x, state: "dismissed" } : x)));
                            toast({ title: "Recommendation dismissed", description: "The co-pilot will learn from this.", tone: "info" });
                          }}
                        >
                          <X /> Dismiss
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Change log" description="Every change made through Anvita, with one-click revert" />
          <ul className="space-y-0 border-t border-line">
            {log.map((e) => (
              <li key={e.id} className="flex gap-3 border-b border-line px-5 py-3 last:border-0">
                <Avatar name={e.actor} size="xs" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm text-fg", e.reverted && "text-muted line-through")}>{e.change}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <AdPlatformMark platform={e.platform} size="xs" />
                    <span>{e.actor}</span>
                    <span>· {e.when}</span>
                  </div>
                  {e.result && !e.reverted && <div className="mt-1 text-xs text-fg-2">Result: {e.result}</div>}
                  {e.reverted && <Badge className="mt-1">Reverted</Badge>}
                </div>
                {!e.reverted && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setLog((l) => l.map((x) => (x.id === e.id ? { ...x, reverted: true } : x)));
                      toast({ title: "Change reverted", description: e.change, tone: "info" });
                    }}
                  >
                    <RotateCcw /> Revert
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal
        open={!!confirmRec}
        onClose={() => setConfirmRec(null)}
        title="Approve budget shift"
        description="Review the change before it goes live in Google Ads"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRec(null)}>
              Cancel
            </Button>
            <Button onClick={() => confirmRec && approve(confirmRec)}>
              <Check /> Approve & apply
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          {[
            { name: "Implants – Broad", from: 1600, to: 1100 },
            { name: "Whitening – Pune", from: 1450, to: 1950 },
          ].map((row) => (
            <div key={row.name} className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
              <span className="flex items-center gap-2 font-medium">
                <AdPlatformMark platform="google" size="xs" />
                {row.name}
              </span>
              <span className="tabular text-fg-2">
                {formatCurrency(row.from)}/day <ArrowRight className="inline size-3.5 text-muted" /> <b className="text-fg">{formatCurrency(row.to)}/day</b>
              </span>
            </div>
          ))}
          <p className="text-muted">≈ ₹15,000 moved over 30 days. Total spend stays the same. Anvita will report the impact on booked leads in 7 days.</p>
        </div>
      </Modal>

      <AdCopyModal
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        onPublish={(n, campaign) => {
          logChange(`Published ${n} AI ad variants to ‘${campaign}’`, "google", "A/B test running");
          toast({ title: `${n} variants sent to Google Ads`, description: "Added as a new responsive search ad. Logged in the change log." });
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AdCopyModal({ open, onClose, onPublish }: { open: boolean; onClose: () => void; onPublish: (count: number, campaign: string) => void }) {
  const toast = useToast();
  const [campaign, setCampaign] = useState("Whitening – Pune");
  const [tone, setTone] = useState<"friendly" | "premium" | "urgent">("friendly");
  const [usps, setUsps] = useState("From ₹8,000 · 0% EMI · Book on WhatsApp · 4.8★ Google");
  const [stage, setStage] = useState<"idle" | "loading" | "done">("idle");
  const [revealed, setRevealed] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const all = [...adCopyVariants.headlines.map((t) => ({ t, kind: "Headline" as const, max: 30 })), ...adCopyVariants.descriptions.map((t) => ({ t, kind: "Description" as const, max: 90 }))];

  function generate() {
    setStage("loading");
    setRevealed(0);
    setSelected([]);
    setTimeout(() => {
      setStage("done");
      let n = 0;
      const id = setInterval(() => {
        n += 1;
        setRevealed(n);
        if (n >= all.length) clearInterval(id);
      }, 110);
    }, 900);
  }

  function close() {
    onClose();
    setTimeout(() => setStage("idle"), 200);
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={
        <span className="inline-flex items-center gap-2">
          <WandSparkles className="size-4 text-ai" /> AI ad-copy generator
        </span>
      }
      description="Grounded in your price list, reviews and the questions patients actually ask in chat"
      footer={
        stage === "done" ? (
          <>
            <Button variant="ghost" onClick={generate}>
              <RefreshCw /> Regenerate
            </Button>
            <Button
              disabled={selected.length === 0}
              onClick={() => {
                onPublish(selected.length, campaign);
                close();
              }}
            >
              <Check /> Publish {selected.length || ""} selected
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="ai" onClick={generate} disabled={stage === "loading"}>
              <Sparkles /> {stage === "loading" ? "Generating…" : "Generate variants"}
            </Button>
          </>
        )
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Campaign">
          <Select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
            {adCampaigns.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tone">
          <Segmented
            className="w-full"
            value={tone}
            onChange={setTone}
            items={[
              { value: "friendly", label: "Friendly" },
              { value: "premium", label: "Premium" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
        </Field>
        <Field label="Selling points to include" className="sm:col-span-2">
          <Input value={usps} onChange={(e) => setUsps(e.target.value)} />
        </Field>
      </div>

      {stage === "idle" && (
        <div className="mt-4 rounded-lg border border-dashed border-line-strong p-4 text-sm text-muted">
          The co-pilot writes 6 headlines (≤30 chars) and 3 descriptions (≤90 chars), checks Google Ads policy for healthcare claims, and avoids
          words like “guaranteed” or “painless forever”.
        </div>
      )}

      {stage === "loading" && (
        <div className="mt-4 space-y-2" aria-busy="true" aria-label="Generating ad copy">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-2" />
          ))}
        </div>
      )}

      {stage === "done" && (
        <div className="mt-4 space-y-4">
          {(["Headline", "Description"] as const).map((kind) => (
            <div key={kind}>
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
                <span>{kind}s</span>
                <span>Select the ones to publish</span>
              </div>
              <ul className="space-y-1.5">
                {all
                  .map((v, i) => ({ ...v, i }))
                  .filter((v) => v.kind === kind && v.i < revealed)
                  .map((v) => {
                    const on = selected.includes(v.t);
                    return (
                      <li key={v.t} className={cn("animate-fade-in flex items-center gap-3 rounded-lg border p-2.5", on ? "border-primary bg-primary-soft/40" : "border-line")}>
                        <Checkbox checked={on} onChange={(c) => setSelected((s) => (c ? [...s, v.t] : s.filter((x) => x !== v.t)))} label={`Select ${v.t}`} />
                        <span className="min-w-0 flex-1 text-sm text-fg">{v.t}</span>
                        <span className={cn("text-xs tabular", v.t.length > v.max ? "text-danger" : "text-muted")}>
                          {v.t.length}/{v.max}
                        </span>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Copy"
                          onClick={() => {
                            navigator.clipboard?.writeText(v.t).catch(() => {});
                            toast({ title: "Copied to clipboard", tone: "info" });
                          }}
                        >
                          <Copy />
                        </Button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
          {revealed >= all.length && (
            <Field label="Final URL">
              <Textarea readOnly rows={1} className="min-h-0! resize-none text-xs!" value={`https://smiledental.in/whitening?utm_source=google&utm_medium=cpc&utm_campaign=${campaign.toLowerCase().replace(/[^a-z]+/g, "_")}`} />
            </Field>
          )}
        </div>
      )}
    </Modal>
  );
}
