"use client";

import { CalendarClock, Clock, GripVertical, Kanban, List, Plus, Search, Sparkles, TriangleAlert } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";
import { AiCallout, Avatar, Badge, Button, Card, ChannelIcon, EmptyState, Input, Page, PageHeader, Segmented, Select, useToast } from "@/components/ui";
import { DealDrawer, NewDealModal, dealStageTone } from "@/components/sell/deal-drawer";
import { ownerName } from "@/components/sell/shared";
import { cn } from "@/lib/cn";
import { formatCompact, formatCurrency } from "@/lib/format";
import { CURRENT_USER_ID, dealStages, deals as seedDeals, pipelines, sellContactById, stageProbability, type Deal, type DealStage, type PipelineId } from "@/lib/mock/sell";

type ViewMode = "board" | "list";
type OwnerFilter = "all" | "ai" | "me";

const stageAccent: Record<DealStage, string> = {
  new: "bg-muted",
  qualified: "bg-info",
  booked: "bg-primary",
  proposal: "bg-ai",
  won: "bg-success",
  lost: "bg-danger",
};

export default function PipelinePage() {
  const toast = useToast();
  const [deals, setDeals] = useState<Deal[]>(seedDeals);
  const [pipeline, setPipeline] = useState<PipelineId>("patients");
  const [mode, setMode] = useState<ViewMode>("board");
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const stages = pipelines[pipeline].stages;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (d.pipeline !== pipeline) return false;
      if (ownerFilter === "ai" && d.ownerId !== "ai") return false;
      if (ownerFilter === "me" && d.ownerId !== CURRENT_USER_ID) return false;
      if (!q) return true;
      const c = sellContactById(d.contactId);
      return [d.title, c?.name, c?.company].some((f) => f?.toLowerCase().includes(q));
    });
  }, [deals, pipeline, ownerFilter, query]);

  const open = visible.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const openValue = open.reduce((s, d) => s + d.value, 0);
  const weighted = open.reduce((s, d) => s + (d.value * stageProbability[d.stage]) / 100, 0);
  const won = visible.filter((d) => d.stage === "won");
  const lost = visible.filter((d) => d.stage === "lost");
  const winRate = won.length + lost.length ? (won.length / (won.length + lost.length)) * 100 : 0;
  const stale = open.filter((d) => d.daysInStage >= 5);

  const moveDeal = (id: string, stage: DealStage) => {
    const deal = deals.find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, stage, daysInStage: 0 } : d)));
    const contact = sellContactById(deal.contactId);
    toast({
      title: `${deal.title} → ${stages[stage]}`,
      description:
        stage === "won"
          ? `🎉 ${formatCurrency(deal.value)} won. AI will send ${contact?.name.split(" ")[0]} a thank-you and an invoice.`
          : stage === "lost"
            ? "AI will ask for a reason and schedule a win-back."
            : `${contact?.name} · probability now ${stageProbability[stage]}%`,
      tone: stage === "lost" ? "warning" : "success",
    });
  };

  const onDrop = (e: DragEvent, stage: DealStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    if (id) moveDeal(id, stage);
    setDragId(null);
    setOverStage(null);
  };

  const openDeal = deals.find((d) => d.id === openId) ?? null;

  return (
    <Page>
      <PageHeader
        title="Pipeline"
        description={`${pipelines[pipeline].description}. Drag cards between stages.`}
        actions={
          <>
            <div className="w-full sm:w-56">
            <Select value={pipeline} onChange={(e) => setPipeline(e.target.value as PipelineId)} aria-label="Pipeline">
              {(Object.keys(pipelines) as PipelineId[]).map((p) => (
                <option key={p} value={p}>
                  {pipelines[p].label}
                </option>
              ))}
            </Select>
            </div>
            <Segmented
              value={mode}
              onChange={setMode}
              items={[
                { value: "board", label: "Board", icon: <Kanban /> },
                { value: "list", label: "List", icon: <List /> },
              ]}
            />
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> New deal
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open pipeline", value: formatCurrency(openValue), hint: `${open.length} deal${open.length === 1 ? "" : "s"}` },
          { label: "Weighted forecast", value: formatCurrency(Math.round(weighted)), hint: "by stage probability" },
          { label: "Won", value: formatCurrency(won.reduce((s, d) => s + d.value, 0)), hint: `${won.length} deal${won.length === 1 ? "" : "s"}` },
          { label: "Win rate", value: `${winRate.toFixed(0)}%`, hint: `${won.length} won · ${lost.length} lost` },
        ].map((m) => (
          <Card key={m.label} className="px-4 py-3">
            <div className="text-xs text-muted">{m.label}</div>
            <div className="mt-1 text-lg font-semibold tracking-tight tabular">{m.value}</div>
            <div className="text-xs text-muted">{m.hint}</div>
          </Card>
        ))}
      </div>

      {stale.length > 0 && (
        <AiCallout
          className="mb-4"
          title={`${stale.length} deal${stale.length > 1 ? "s are" : " is"} going cold`}
          action={
            <Button size="xs" variant="outline" onClick={() => toast({ title: `Follow-ups drafted for ${stale.length} deals`, description: "Review them in the inbox before they send.", tone: "info" })}>
              <Sparkles /> Draft follow-ups
            </Button>
          }
        >
          {stale.map((d) => d.title).join(", ")} {stale.length > 1 ? "have" : "has"} been in the same stage for 5+ days. Deals that get a follow-up within a week close 2.4× more often.
        </AiCallout>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input icon={<Search />} placeholder="Search deals or contacts" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-72" />
        <Segmented
          value={ownerFilter}
          onChange={setOwnerFilter}
          items={[
            { value: "all", label: "Everyone" },
            { value: "ai", label: "AI-owned" },
            { value: "me", label: "Mine" },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <Card>
          <EmptyState icon={<Kanban />} title="No deals match" description="Try another search or owner filter." />
        </Card>
      ) : mode === "board" ? (
        <div className="scroll-thin -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-3">
            {dealStages.map((stage) => {
              const items = visible.filter((d) => d.stage === stage);
              const total = items.reduce((s, d) => s + d.value, 0);
              const isOver = overStage === stage && dragId !== null;
              return (
                <section
                  key={stage}
                  aria-label={`${stages[stage]} column`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (overStage !== stage) setOverStage(stage);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null);
                  }}
                  onDrop={(e) => onDrop(e, stage)}
                  className={cn(
                    "flex w-[272px] shrink-0 flex-col rounded-xl border bg-surface-2/60 transition-colors",
                    isOver ? "border-primary bg-primary-soft/50" : "border-line",
                  )}
                >
                  <header className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", stageAccent[stage])} />
                      <h2 className="text-sm font-semibold">{stages[stage]}</h2>
                      <span className="rounded-full bg-surface px-1.5 text-[11px] font-medium text-muted">{items.length}</span>
                      <span className="ml-auto text-xs font-medium text-fg-2 tabular">{formatCurrency(total)}</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-surface-3">
                      <div className={cn("h-full rounded-full", stageAccent[stage])} style={{ width: `${stageProbability[stage]}%` }} />
                    </div>
                  </header>
                  <div className="flex min-h-40 flex-1 flex-col gap-2 px-2 pb-2">
                    {items.map((d) => (
                      <DealCard
                        key={d.id}
                        deal={d}
                        dragging={dragId === d.id}
                        onOpen={() => setOpenId(d.id)}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", d.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(d.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className={cn("flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center text-xs", isOver ? "border-primary text-primary" : "border-line-strong text-muted")}>
                        {isOver ? "Drop here" : "No deals. Drag one here."}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  {["Deal", "Stage", "Value", "Owner", "Next step", "In stage", "Close"].map((h, i) => (
                    <th key={h} className={cn("px-3 py-2.5 font-medium", i === 0 && "pl-4", i === 2 ? "text-right" : "text-left")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((d) => {
                  const c = sellContactById(d.contactId);
                  return (
                    <tr key={d.id} onClick={() => setOpenId(d.id)} className="cursor-pointer hover:bg-surface-2">
                      <td className="px-3 py-2.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <ChannelIcon channel={d.channel} />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{d.title}</div>
                            <div className="truncate text-xs text-muted">
                              {c?.name}
                              {c?.company && ` · ${c.company}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={dealStageTone(d.stage)} dot>
                          {stages[d.stage]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular">{formatCurrency(d.value)}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-fg-2">
                          <Avatar name={ownerName(d.ownerId)} ai={d.ownerId === "ai"} size="xs" />
                          {d.ownerId === "ai" ? "AI agent" : ownerName(d.ownerId).split(" ")[0]}
                        </span>
                      </td>
                      <td className="max-w-64 truncate px-3 py-2.5 text-fg-2">{d.nextStep}</td>
                      <td className={cn("px-3 py-2.5 whitespace-nowrap", d.daysInStage >= 5 && d.stage !== "won" && d.stage !== "lost" ? "text-warning" : "text-muted")}>
                        {d.daysInStage === 0 ? "Today" : `${d.daysInStage}d`}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted">{d.expectedClose}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <DealDrawer deal={openDeal} onClose={() => setOpenId(null)} onUpdate={(d) => setDeals((ds) => ds.map((x) => (x.id === d.id ? d : x)))} />
      <NewDealModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        pipeline={pipeline}
        onCreate={(d) => {
          setDeals((ds) => [d, ...ds]);
          setPipeline(d.pipeline);
        }}
      />
    </Page>
  );
}

function DealCard({
  deal,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  deal: Deal;
  dragging: boolean;
  onOpen: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}) {
  const contact = sellContactById(deal.contactId);
  const stale = deal.daysInStage >= 5 && deal.stage !== "won" && deal.stage !== "lost";
  const urgent = deal.nextStepDue === "Now" || deal.nextStepDue === "Today";
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
      aria-label={`${deal.title}, ${formatCurrency(deal.value)}`}
      className={cn(
        "group cursor-grab rounded-lg border border-line bg-surface p-3 shadow-card transition-all hover:border-line-strong active:cursor-grabbing",
        dragging && "rotate-1 opacity-50",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-fg">{deal.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className="truncate">
              {contact?.name}
              {contact?.company && ` · ${contact.company}`}
            </span>
          </div>
        </div>
        <GripVertical className="mt-0.5 size-4 shrink-0 text-line-strong opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tabular" title={formatCurrency(deal.value)}>
          {deal.value >= 100000 ? `₹${formatCompact(deal.value)}` : formatCurrency(deal.value)}
        </span>
        <div className="flex items-center gap-1.5">
          <ChannelIcon channel={deal.channel} size="xs" />
          <span title={ownerName(deal.ownerId)}>
            <Avatar name={ownerName(deal.ownerId)} ai={deal.ownerId === "ai"} size="xs" />
          </span>
        </div>
      </div>
      <div className="mt-2.5 flex items-start gap-1.5 border-t border-line pt-2 text-xs">
        <CalendarClock className={cn("mt-px size-3.5 shrink-0", urgent ? "text-primary" : "text-muted")} />
        <span className="min-w-0 flex-1 text-fg-2">{deal.nextStep}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className={cn("inline-flex items-center gap-1", stale ? "font-medium text-warning" : "text-muted")}>
          {stale ? <TriangleAlert className="size-3" /> : <Clock className="size-3" />}
          {deal.daysInStage === 0 ? "Today" : `${deal.daysInStage}d in stage`}
        </span>
        {deal.ownerId === "ai" && <Badge tone="ai">AI</Badge>}
        {urgent && deal.ownerId !== "ai" && <Badge tone="primary">Due {deal.nextStepDue.toLowerCase()}</Badge>}
      </div>
    </article>
  );
}
