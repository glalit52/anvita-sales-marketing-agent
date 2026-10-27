"use client";

import { Bot, LayoutTemplate } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ChannelIcon, Segmented } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  approvalAudit,
  approvalItems,
  dgCampaigns,
  dgChannelMeta,
  engineMeta,
  pipelineMeta,
  type ApprovalAuditEntry,
  type ApprovalItem,
  type AuditAction,
  type DgCampaign,
  type DgChannel,
  type Engine,
  type Pipeline,
} from "@/lib/mock/demand-gen";
import { AdPlatformMark } from "../shared";

/* ------------------------------------------------------------------ */
/* Shared demand-gen state (approvals, audit log, campaigns, pipeline) */
/* ------------------------------------------------------------------ */

export type ApprovalState = "pending" | "approved" | "rejected" | "changes";
export type QueueItem = ApprovalItem & { state: ApprovalState; comment?: string };
export type MarketingTab = "campaigns" | "approvals" | "landing" | "aeo" | "ads" | "seo" | "social";

interface DemandGenCtx {
  pipeline: Pipeline;
  setPipeline: (p: Pipeline) => void;
  queue: QueueItem[];
  pendingCount: number;
  audit: ApprovalAuditEntry[];
  campaigns: DgCampaign[];
  decide: (ids: string[], action: Exclude<ApprovalState, "pending">, comment?: string) => void;
  revert: (auditId: string) => void;
  enqueue: (items: ApprovalItem[]) => void;
  addCampaign: (c: DgCampaign) => void;
  tab: MarketingTab;
  setTab: (t: MarketingTab) => void;
}

const Ctx = createContext<DemandGenCtx | null>(null);

export function useDemandGen() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemandGen must be used inside <DemandGenProvider>");
  return ctx;
}

const actionFor: Record<Exclude<ApprovalState, "pending">, AuditAction> = { approved: "approved", rejected: "rejected", changes: "changes" };

function nowLabel() {
  return "Just now";
}

export function DemandGenProvider({ children }: { children: ReactNode }) {
  const [pipeline, setPipeline] = useState<Pipeline>("clinic");
  const [tab, setTab] = useState<MarketingTab>("campaigns");
  const [queue, setQueue] = useState<QueueItem[]>(() => approvalItems.map((a) => ({ ...a, state: "pending" })));
  const [audit, setAudit] = useState<ApprovalAuditEntry[]>(approvalAudit);
  const [campaigns, setCampaigns] = useState<DgCampaign[]>(dgCampaigns);

  const decide = useCallback(
    (ids: string[], action: Exclude<ApprovalState, "pending">, comment?: string) => {
      const touched = queue.filter((x) => ids.includes(x.id));
      const stamp = Date.now();
      setAudit((a) => [
        ...touched.map((t, i) => ({
          id: `au-${stamp}-${i}`,
          when: nowLabel(),
          actor: "Priya Sharma",
          action: actionFor[action],
          item: t.title,
          channel: t.channel,
          comment,
        })),
        ...a,
      ]);
      setQueue((q) => q.map((x) => (ids.includes(x.id) ? { ...x, state: action, comment } : x)));
    },
    [queue],
  );

  const revert = useCallback(
    (auditId: string) => {
      const entry = audit.find((e) => e.id === auditId);
      if (!entry) return;
      // Reverting a decision puts the item back in the queue when it came from it.
      setQueue((q) => q.map((x) => (x.title === entry.item && x.state !== "pending" ? { ...x, state: "pending", comment: undefined } : x)));
      const stamp = Date.now();
      setAudit((a) => [
        { id: `au-${stamp}`, when: nowLabel(), actor: "Priya Sharma", action: "reverted" as const, item: entry.item, channel: entry.channel },
        ...a.map((e) => (e.id === auditId ? { ...e, reverted: true } : e)),
      ]);
    },
    [audit],
  );

  const enqueue = useCallback((items: ApprovalItem[]) => {
    setQueue((q) => [...items.map((i) => ({ ...i, state: "pending" as const })), ...q]);
  }, []);

  const addCampaign = useCallback((c: DgCampaign) => setCampaigns((cs) => [c, ...cs]), []);

  const value = useMemo<DemandGenCtx>(
    () => ({
      pipeline,
      setPipeline,
      queue,
      pendingCount: queue.filter((q) => q.state === "pending").length,
      audit,
      campaigns,
      decide,
      revert,
      enqueue,
      addCampaign,
      tab,
      setTab,
    }),
    [pipeline, queue, audit, campaigns, decide, revert, enqueue, addCampaign, tab],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ------------------------------------------------------------------ */
/* Marks & small pieces                                                */
/* ------------------------------------------------------------------ */

const box = {
  xs: "size-4 rounded [&_svg]:size-2.5",
  sm: "size-6 rounded-md [&_svg]:size-3.5",
  md: "size-8 rounded-lg [&_svg]:size-4",
};

export function DgChannelMark({ channel, size = "sm" }: { channel: DgChannel; size?: "xs" | "sm" | "md" }) {
  if (channel === "google" || channel === "meta") return <AdPlatformMark platform={channel} size={size} />;
  if (channel === "email" || channel === "whatsapp" || channel === "linkedin") return <ChannelIcon channel={channel} size={size} />;
  const Icon = channel === "landing" ? LayoutTemplate : Bot;
  return (
    <span
      title={dgChannelMeta[channel].label}
      className={cn("inline-flex shrink-0 items-center justify-center", box[size], channel === "landing" ? "bg-primary-soft text-primary" : "bg-ai-soft text-ai")}
    >
      <Icon aria-hidden />
    </span>
  );
}

export function EngineMark({ engine, size = "sm" }: { engine: Engine; size?: "xs" | "sm" | "md" }) {
  const sizes = { xs: "size-4 text-[7px] rounded", sm: "size-6 text-[9px] rounded-md", md: "size-8 text-[11px] rounded-lg" };
  return (
    <span title={engineMeta[engine].label} className={cn("inline-flex shrink-0 items-center justify-center bg-surface-3 font-bold text-fg", sizes[size])}>
      {engineMeta[engine].mark}
    </span>
  );
}

export function PipelineSwitch({ className }: { className?: string }) {
  const { pipeline, setPipeline } = useDemandGen();
  return (
    <Segmented
      size="xs"
      className={className}
      value={pipeline}
      onChange={setPipeline}
      items={[
        { value: "clinic", label: pipelineMeta.clinic.label },
        { value: "b2b", label: pipelineMeta.b2b.label },
      ]}
    />
  );
}
