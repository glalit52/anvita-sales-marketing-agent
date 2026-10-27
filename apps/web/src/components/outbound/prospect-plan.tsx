"use client";

import { Briefcase, Building, CircleCheck, Clock, Coins, Funnel, Globe, MapPin, Pencil, Plus, Rows3, Search, ShieldCheck, Sparkles, Store, X } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Switch } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { sources, type SourceId } from "@/lib/mock/outbound";
import { Spinner } from "./shared";

export interface PlanFilter {
  key: string;
  label: string;
  value: string;
}

export const sourceIcon: Record<SourceId, typeof Globe> = {
  maps: MapPin,
  web: Globe,
  mca: Building,
  indiamart: Store,
  justdial: Search,
  jobs: Briefcase,
  linkedin: Briefcase,
};

export function estimate(total: number, enabled: Record<SourceId, boolean>) {
  const on = sources.filter((s) => enabled[s.id]);
  const coverage = 0.55 + 0.45 * (on.length / sources.length);
  const rows = Math.round(total * coverage);
  const perRow = on.reduce((sum, s) => sum + s.costPerRow, 0);
  const credits = Math.round((rows * Math.max(perRow, 1) * 0.6) / 10) * 10;
  return { rows, low: Math.round(rows * 0.88), high: Math.round(rows * 1.08), credits, sources: on.length };
}

export function SearchPlanCard({
  filters,
  onFiltersChange,
  enabled,
  onToggleSource,
  total,
  creditsLeft,
  locked,
  onRun,
  onEditPrompt,
}: {
  filters: PlanFilter[];
  onFiltersChange: (f: PlanFilter[]) => void;
  enabled: Record<SourceId, boolean>;
  onToggleSource: (id: SourceId, on: boolean) => void;
  total: number;
  creditsLeft: number;
  locked: boolean;
  onRun: () => void;
  onEditPrompt: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const est = estimate(total, enabled);

  const commit = () => {
    if (!editing) return;
    onFiltersChange(filters.map((f) => (f.key === editing ? { ...f, value: draft.trim() || f.value } : f)).filter((f) => f.value));
    setEditing(null);
  };

  return (
    <Card className="animate-fade-in overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-ai-soft/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai text-white">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Search plan</div>
            <div className="text-xs text-muted">Planner agent · review before anything runs or spends credits</div>
          </div>
        </div>
        {locked ? (
          <Badge tone="success">
            <CircleCheck /> Approved
          </Badge>
        ) : (
          <Badge tone="ai">Awaiting your approval</Badge>
        )}
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
            <Funnel className="size-3.5" /> Interpreted ICP filters
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) =>
              editing === f.key ? (
                <span key={f.key} className="inline-flex items-center gap-1 rounded-lg border border-primary bg-surface py-0.5 pr-1 pl-2.5 text-sm">
                  <span className="text-muted">{f.label}:</span>
                  <input
                    autoFocus
                    aria-label={`Edit ${f.label}`}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commit();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    onBlur={commit}
                    className="w-40 bg-transparent py-0.5 text-sm text-fg outline-none"
                  />
                </span>
              ) : (
                <span key={f.key} className="group inline-flex items-center gap-1 rounded-lg border border-line bg-surface-2 py-1 pr-1 pl-2.5 text-sm">
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      setEditing(f.key);
                      setDraft(f.value);
                    }}
                    className="inline-flex items-center gap-1.5 text-left disabled:cursor-default"
                    aria-label={`Edit filter ${f.label}`}
                  >
                    <span className="text-muted">{f.label}:</span>
                    <span className="font-medium text-fg">{f.value}</span>
                    {!locked && <Pencil className="size-3 text-muted opacity-60 group-hover:opacity-100" />}
                  </button>
                  {!locked && (
                    <button
                      type="button"
                      onClick={() => onFiltersChange(filters.filter((x) => x.key !== f.key))}
                      className="rounded p-0.5 text-muted hover:bg-surface-3 hover:text-fg"
                      aria-label={`Remove filter ${f.label}`}
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ),
            )}
            {!locked && (
              <button
                type="button"
                onClick={() => {
                  const key = `custom-${filters.length}-${Date.now()}`;
                  onFiltersChange([...filters, { key, label: "Custom", value: "Exclude chains" }]);
                  setEditing(key);
                  setDraft("Exclude chains");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-strong px-2.5 py-1 text-sm text-muted hover:border-primary hover:text-primary"
              >
                <Plus className="size-3.5" /> Add filter
              </button>
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
              <Globe className="size-3.5" /> Sources to query
            </div>
            <span className="text-xs text-muted">{est.sources} of {sources.length} on</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {sources.map((s) => {
              const Icon = sourceIcon[s.id];
              const on = enabled[s.id];
              return (
                <div
                  key={s.id}
                  className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors", on ? "border-primary/30 bg-primary-soft/40" : "border-line bg-surface")}
                >
                  <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg", on ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted")}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{s.label}</div>
                    <div className="truncate text-xs text-muted">{s.description}</div>
                  </div>
                  <Switch size="sm" checked={on} disabled={locked} onChange={(v) => onToggleSource(s.id, v)} label={`Use ${s.label}`} />
                </div>
              );
            })}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5 text-success" /> LinkedIn data comes only from a licensed provider. No scraping of logged-in pages.
          </p>
        </section>

        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-4 text-sm sm:flex sm:gap-6">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <Rows3 className="size-3.5" /> Est. rows
              </div>
              <div className="font-semibold tabular">
                {formatNumber(est.low)}–{formatNumber(est.high)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <Coins className="size-3.5" /> Est. credits
              </div>
              <div className="font-semibold tabular">≈ {formatNumber(est.credits)}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <Clock className="size-3.5" /> Time
              </div>
              <div className="font-semibold">~2 min</div>
            </div>
          </div>
          {!locked && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEditPrompt}>
                Edit prompt
              </Button>
              <Button variant="ai" onClick={onRun} disabled={est.sources === 0 || est.credits > creditsLeft}>
                <Sparkles /> Run search
              </Button>
            </div>
          )}
        </div>
        {!locked && est.sources === 0 && <p className="text-xs text-danger">Turn on at least one source to run the search.</p>}
      </div>
    </Card>
  );
}

export interface AgentRun {
  id: string;
  label: string;
  icon: typeof Globe;
  status: "queued" | "running" | "done";
  found: number;
  detail: string;
}

export function AgentProgress({ agents, done, totalRows, credits }: { agents: AgentRun[]; done: boolean; totalRows: number; credits: number }) {
  const [manual, setManual] = useState<boolean | null>(null);
  const open = manual ?? !done;
  const finished = agents.filter((a) => a.status === "done").length;
  return (
    <Card className="animate-fade-in overflow-hidden">
      <button type="button" onClick={() => setManual(!open)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5" aria-expanded={open}>
        <div className="flex items-center gap-2.5">
          {done ? <CircleCheck className="size-5 text-success" /> : <Spinner className="size-5 text-ai" />}
          <div>
            <div className="text-sm font-semibold">{done ? "Search complete" : "Agents are searching…"}</div>
            <div className="text-xs text-muted">
              {finished}/{agents.length} agents done · {formatNumber(totalRows)} rows · {formatNumber(credits)} credits used
            </div>
          </div>
        </div>
        <span className="text-xs font-medium text-primary">{open ? "Hide" : "Show"} details</span>
      </button>
      {open && (
        <ul className="-mb-px grid border-t border-line sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => (
            <li key={a.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5">
              <span className={cn("inline-flex size-7 shrink-0 items-center justify-center rounded-lg", a.status === "done" ? "bg-success-soft text-success" : a.status === "running" ? "bg-ai-soft text-ai" : "bg-surface-2 text-muted")}>
                <a.icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.label}</div>
                <div className="truncate text-xs text-muted">{a.status === "queued" ? "Queued" : a.detail}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                {a.status === "running" && <Spinner className="size-3.5 text-ai" />}
                {a.status === "done" && <CircleCheck className="size-3.5 text-success" aria-label="Done" />}
                <span className={cn("tabular", a.status === "queued" ? "text-muted" : "font-medium text-fg")}>{a.status === "queued" ? "–" : formatNumber(a.found)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
