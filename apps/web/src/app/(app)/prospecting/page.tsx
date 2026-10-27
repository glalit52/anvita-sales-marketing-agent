"use client";

import {
  ArrowUp,
  BellRing,
  Bot,
  Building,
  Database,
  Download,
  ListChecks,
  Plus,
  Radar,
  Search,
  Send,
  Sparkles,
  Table2,
  Target,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AgentProgress, SearchPlanCard, estimate, sourceIcon, type AgentRun, type PlanFilter } from "@/components/outbound/prospect-plan";
import { AddToSequenceModal, AiColumnModal, EnrichModal, type EnrichFix } from "@/components/outbound/prospect-modals";
import { ResultsTable, answerFor, type AiColumn } from "@/components/outbound/prospect-table";
import { CreditsMeter } from "@/components/outbound/shared";
import { AiCallout, Avatar, Badge, Button, Card, CardHeader, Input, Page, PageHeader, Segmented, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import {
  CREDITS_TOTAL,
  CREDITS_USED_START,
  examplePrompts,
  poolForPrompt,
  pools,
  savedSearches,
  sources,
  type PoolKey,
  type ProspectRow,
  type SourceId,
} from "@/lib/mock/outbound";

type Phase = "idle" | "thinking" | "plan" | "running";

const defaultSources = () => Object.fromEntries(sources.map((s) => [s.id, s.defaultOn])) as Record<SourceId, boolean>;

/** Share of the total each source agent contributes (mock). */
const sourceShare: Record<SourceId, number> = { maps: 0.65, web: 0.47, mca: 0.37, indiamart: 0.3, justdial: 0.24, jobs: 0.08, linkedin: 0.43 };
const sourceDetail: Record<SourceId, [string, string]> = {
  maps: ["Scanning Places across 36 districts", "places matched"],
  web: ["Reading websites, product pages & news", "sites read"],
  mca: ["Matching CIN & directors", "registry matches"],
  indiamart: ["Searching supplier listings", "listings matched"],
  justdial: ["Searching local listings", "listings matched"],
  jobs: ["Scanning Naukri, Indeed & careers pages", "hiring signals"],
  linkedin: ["Finding owners & decision makers", "people found"],
};

const ROW_START = 3;
const ROW_EVERY = 1.3;
const TICK_MS = 220;

function timeline(sourceCount: number, rowCount: number) {
  const rowsEnd = Math.ceil(ROW_START + rowCount * ROW_EVERY);
  const sourcesEnd = 8 + (sourceCount - 1) * 2;
  const end = Math.max(rowsEnd, sourcesEnd) + 5;
  return { rowsEnd, end };
}

export default function ProspectingPage() {
  const toast = useToast();
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [savedFilter, setSavedFilter] = useState("");
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState("");
  const [poolKey, setPoolKey] = useState<PoolKey>("agri");
  const [phase, setPhase] = useState<Phase>("idle");
  const [filters, setFilters] = useState<PlanFilter[]>([]);
  const [enabled, setEnabled] = useState<Record<SourceId, boolean>>(defaultSources);
  const [rows, setRows] = useState<ProspectRow[]>([]);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [aiCols, setAiCols] = useState<AiColumn[]>([]);
  const [committed, setCommitted] = useState(CREDITS_USED_START);
  const [view, setView] = useState<"all" | "verified" | "fit">("all");
  const [notice, setNotice] = useState<string | null>(null);
  const [modal, setModal] = useState<"ai" | "enrich" | "seq" | null>(null);

  const pool = pools[poolKey];
  const est = estimate(pool.total, enabled);
  const enabledSources = sources.filter((s) => enabled[s.id]);
  const { rowsEnd, end } = timeline(enabledSources.length, rows.length);
  const running = phase === "running" && tick < end;
  const finished = phase === "running" && tick >= end;
  const visibleCount = phase === "running" ? Math.min(rows.length, Math.max(0, Math.floor((tick - ROW_START) / ROW_EVERY))) : 0;
  const progress = phase === "running" ? Math.min(1, tick / end) : 0;
  const liveSearchCredits = Math.round(est.credits * progress);
  const creditsUsed = committed + liveSearchCredits;

  // Drive the search agents.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  // Fill AI columns progressively, one row at a time.
  const needsFill = aiCols.some((c) => c.filled < visibleCount);
  useEffect(() => {
    if (!needsFill) return;
    const id = setInterval(() => {
      setAiCols((cols) => {
        const i = cols.findIndex((c) => c.filled < visibleCount);
        if (i === -1) return cols;
        return cols.map((c, j) => (j === i ? { ...c, filled: c.filled + 1 } : c));
      });
    }, 160);
    return () => clearInterval(id);
  }, [needsFill, visibleCount]);

  const agents: AgentRun[] = (() => {
    const list: AgentRun[] = enabledSources.map((s, i) => {
      const start = 1 + i;
      const stop = 8 + i * 2;
      const final = Math.round(pool.total * sourceShare[s.id]);
      const status = tick < start ? "queued" : tick < stop ? "running" : "done";
      const p = Math.min(1, Math.max(0, (tick - start) / (stop - start)));
      return { id: s.id, label: s.label, icon: sourceIcon[s.id], status, found: Math.round(final * p), detail: status === "done" ? sourceDetail[s.id][1] : sourceDetail[s.id][0] };
    });
    const dedupeStart = rowsEnd - 4;
    list.push({
      id: "dedupe",
      label: "Dedupe vs CRM & suppression",
      icon: Database,
      status: tick < dedupeStart ? "queued" : tick < end - 2 ? "running" : "done",
      found: tick >= end - 2 ? pool.rows.filter((r) => r.inCrm).length : 0,
      detail: tick >= end - 2 ? "already in CRM, flagged" : "Merging duplicates across sources",
    });
    list.push({
      id: "scorer",
      label: "ICP fit scorer",
      icon: Target,
      status: tick < dedupeStart + 1 ? "queued" : tick < end ? "running" : "done",
      found: Math.round(est.rows * Math.min(1, Math.max(0, (tick - dedupeStart - 1) / (end - dedupeStart - 1)))),
      detail: tick < end ? "Scoring fit + intent" : "rows scored",
    });
    return list;
  })();

  const commitLive = () => setCommitted((c) => c + liveSearchCredits);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value) return;
    commitLive();
    const key = poolForPrompt(value);
    setPrompt(value);
    setDraft("");
    setPoolKey(key);
    setFilters(pools[key].filters);
    setEnabled(defaultSources());
    setRows([]);
    setTick(0);
    setAiCols([]);
    setSelected(new Set());
    setNotice(null);
    setActiveSearch(null);
    setPhase("thinking");
    setTimeout(() => setPhase((p) => (p === "thinking" ? "plan" : p)), 1500);
  };

  const run = () => {
    setRows(pool.rows.map((r) => ({ ...r })));
    setTick(0);
    setPhase("running");
  };

  const openSaved = (id: string) => {
    const s = savedSearches.find((x) => x.id === id)!;
    commitLive();
    const key = poolForPrompt(s.prompt);
    const p = pools[key];
    setActiveSearch(id);
    setPrompt(s.prompt);
    setPoolKey(key);
    setFilters(p.filters);
    setEnabled(defaultSources());
    const r = p.rows.map((x) => ({ ...x }));
    setRows(r);
    setTick(999);
    setPhase("running");
    setAiCols([{ id: `ai-${id}`, question: p.aiQuestion, filled: r.length }]);
    setSelected(new Set());
    setNotice(null);
    // Saved results are already paid for: do not charge the estimate again.
    setCommitted((c) => c - estimate(p.total, defaultSources()).credits);
  };

  const reset = () => {
    commitLive();
    setPhase("idle");
    setPrompt("");
    setRows([]);
    setTick(0);
    setAiCols([]);
    setSelected(new Set());
    setActiveSearch(null);
    setNotice(null);
  };

  const visibleRows = rows.slice(0, visibleCount);
  const shownRows = visibleRows.filter((r) => (view === "verified" ? r.emailStatus === "verified" : view === "fit" ? r.fit >= 85 : true));
  const selectedRows = visibleRows.filter((r) => selected.has(r.id));
  const enrichTargets = selectedRows.length ? selectedRows : visibleRows;

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const addToCrm = () => {
    const dup = selectedRows.filter((r) => r.inCrm).length;
    const added = selectedRows.length - dup;
    setRows((rs) => rs.map((r) => (selected.has(r.id) ? { ...r, inCrm: true } : r)));
    setNotice(`${added} added to CRM as Prospects · ${dup} already in CRM, skipped (no duplicates created)`);
    toast({ title: `${added} prospects added to CRM`, description: dup ? `${dup} already in CRM, skipped` : "Owner: Priya Sharma · stage: Prospect" });
    setSelected(new Set());
  };

  const exportCsv = () => {
    const target = selectedRows.length ? selectedRows : visibleRows;
    const header = ["Company", "City", "Rating", "Reviews", "Website", "Employees", "Contact", "Role", "Email", "Email status", "Phone", "Phone status", "ICP fit", ...aiCols.map((c) => c.question)];
    const lines = target.map((r) =>
      [r.company, r.city, r.rating, r.reviews, r.website, r.employees, r.contact, r.role, r.email, r.emailStatus, r.phone, r.phoneStatus, r.fit, ...aiCols.map((c) => answerFor(c.question, r, pool.aiQuestion).value)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anvita-prospects.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${target.length} rows`, description: "anvita-prospects.csv · provenance columns included" });
  };

  const applyEnrich = (fixes: EnrichFix[], credits: number) => {
    setRows((rs) =>
      rs.map((r) => {
        const mine = fixes.filter((f) => f.rowId === r.id);
        if (!mine.length) return r;
        const next = { ...r };
        mine.forEach((f) => {
          if (f.field === "email") {
            next.email = next.email && !next.email.endsWith("gmail.com") && !next.email.startsWith("info@") && !next.email.startsWith("contact@") ? next.email : `${r.contact.replace(/^Dr\. /, "").split(" ")[0].toLowerCase()}@${r.website}`;
            next.emailStatus = "verified";
            next.emailSource = `${f.provider} → verified just now`;
          } else {
            next.phone = next.phone || `+91 98${r.id.length}${(r.reviews * 7919).toString().slice(0, 3)} ${(r.reviews * 104729).toString().slice(0, 5)}`;
            next.phoneStatus = "verified";
            next.phoneSource = `${f.provider} → verified just now`;
          }
        });
        return next;
      }),
    );
    setCommitted((c) => c + credits);
    toast({ title: `Enriched ${fixes.length} fields`, description: `${credits} credits used` });
  };

  const searches = savedSearches.filter((s) => s.name.toLowerCase().includes(savedFilter.toLowerCase()));
  const verifiedCount = visibleRows.filter((r) => r.emailStatus === "verified").length;
  const hasResults = phase === "running";

  return (
    <Page>
      <PageHeader
        title="Prospecting"
        description="Describe who you want to sell to. AI agents search maps, registries, directories and the web, then build an enriched, scored lead list."
        actions={
          <>
            <CreditsMeter used={creditsUsed} total={CREDITS_TOTAL} />
            <Button variant="outline" onClick={() => toast({ title: "Signal alerts are on", description: "We'll notify you on WhatsApp when new businesses match your saved searches.", tone: "info" })}>
              <BellRing /> Alerts
            </Button>
            <Button onClick={reset}>
              <Plus /> New search
            </Button>
          </>
        }
      />

      {/* Mobile: saved searches as a chip row */}
      <div className={cn("scroll-thin -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8", hasResults ? "2xl:hidden" : "lg:hidden")}>
        {savedSearches.map((s) => (
          <button
            key={s.id}
            onClick={() => openSaved(s.id)}
            className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm", activeSearch === s.id ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-fg-2")}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className={cn("grid grid-cols-1 gap-4", hasResults ? "2xl:grid-cols-[264px_minmax(0,1fr)]" : "lg:grid-cols-[264px_minmax(0,1fr)]")}>
        <aside className={cn("hidden", hasResults ? "2xl:block" : "lg:block")}>
          <Card className="sticky top-4">
            <CardHeader title="Saved searches" description="Tables that keep updating" />
            <div className="px-3 pb-2">
              <Input icon={<Search />} placeholder="Filter…" value={savedFilter} onChange={(e) => setSavedFilter(e.target.value)} aria-label="Filter saved searches" />
            </div>
            <ul className="space-y-0.5 px-2 pb-3">
              {searches.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => openSaved(s.id)}
                    className={cn("flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors", activeSearch === s.id ? "bg-primary-soft" : "hover:bg-surface-2")}
                  >
                    <Table2 className={cn("mt-0.5 size-4 shrink-0", activeSearch === s.id ? "text-primary" : "text-muted")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        {formatNumber(s.rows)} rows · {s.updated}
                      </span>
                      {s.newRows && (
                        <Badge tone="success" className="mt-1">
                          <Radar /> +{s.newRows} new
                        </Badge>
                      )}
                    </span>
                  </button>
                </li>
              ))}
              {searches.length === 0 && <li className="px-2.5 py-3 text-sm text-muted">No saved searches match.</li>}
            </ul>
            <div className="border-t border-line px-4 py-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Radar className="size-3.5 text-success" /> 2 searches are monitoring for new matches daily
              </span>
            </div>
          </Card>
        </aside>

        <div className="min-w-0 space-y-4">
          {phase === "idle" ? (
            <>
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-b from-ai-soft/70 to-transparent px-4 pt-8 pb-6 text-center sm:px-8 sm:pt-10">
                  <span className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-ai text-white shadow-card">
                    <Sparkles className="size-5" />
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Who do you want to sell to?</h2>
                  <p className="mx-auto mt-1 max-w-lg text-sm text-muted">Ask in plain English or Hinglish. The planner shows you sources, filters and the credit estimate before anything runs.</p>
                  <form
                    className="mx-auto mt-5 max-w-2xl"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit(draft);
                    }}
                  >
                    <div className="relative rounded-2xl border border-line-strong bg-surface p-2 text-left shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-[var(--ring)]">
                      <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submit(draft);
                          }
                        }}
                        placeholder="e.g. Agri-input dealers in Maharashtra with 4★+ rating and a website, get the owner's contact"
                        aria-label="Describe your ideal customer"
                        className="min-h-20 resize-none border-0 bg-transparent shadow-none hover:border-0 focus:ring-0"
                      />
                      <div className="flex items-center justify-between gap-2 px-1">
                        <span className="text-xs text-muted">Enter to plan · Shift+Enter for a new line</span>
                        <Button type="submit" size="icon-sm" variant="ai" aria-label="Plan search" disabled={!draft.trim()}>
                          <ArrowUp />
                        </Button>
                      </div>
                    </div>
                  </form>
                  <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
                    {examplePrompts.map((p) => (
                      <button key={p} onClick={() => submit(p)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-left text-xs text-fg-2 transition-colors hover:border-primary hover:text-primary">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { icon: Wand2, title: "1 · Plan", text: "A planner agent turns your prompt into ICP filters and a multi-source query plan with a credit estimate." },
                  { icon: Bot, title: "2 · Search in parallel", text: "Agents query Google Maps, MCA, IndiaMART, Justdial, job boards and the web. Rows stream in live." },
                  { icon: ListChecks, title: "3 · Enrich & act", text: "Add AI columns, verify emails & phones via waterfall, dedupe against CRM, then send to a sequence." },
                ].map((s) => (
                  <Card key={s.title} className="p-4">
                    <s.icon className="size-5 text-primary" />
                    <div className="mt-2 text-sm font-semibold">{s.title}</div>
                    <p className="mt-1 text-sm text-muted">{s.text}</p>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader title="New signals on your saved searches" description="Matching businesses discovered since yesterday" action={<Badge tone="success" dot>Live</Badge>} />
                <ul className="divide-y divide-line">
                  {[
                    { text: "Kisan Agro Point opened a 3rd outlet in Bhusawal", tag: "New outlet", tone: "success" as const, search: "s1" },
                    { text: "Annadata Agri Solutions is hiring 2 field sales officers", tag: "Hiring", tone: "info" as const, search: "s1" },
                    { text: "Bombay Botanics posted a 'Performance Marketing Lead' role", tag: "Hiring", tone: "info" as const, search: "s3" },
                    { text: "Deccan Crop Care raised ₹18 Cr Series A", tag: "Funding", tone: "ai" as const, search: "s1" },
                  ].map((s) => (
                    <li key={s.text}>
                      <button onClick={() => openSaved(s.search)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-2">
                        <Building className="size-4 shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 text-sm">{s.text}</span>
                        <Badge tone={s.tone}>{s.tag}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          ) : (
            <>
              {/* Conversation */}
              <div className="flex items-start gap-3">
                <Avatar name="Priya Sharma" />
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-2.5 text-sm shadow-card">{prompt}</div>
              </div>

              {phase === "thinking" && (
                <div className="flex items-center gap-3">
                  <Avatar name="Anvita" ai />
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-ai-soft px-4 py-3 text-sm text-fg-2">
                    Planning your search
                    <span className="flex gap-1" aria-hidden>
                      <span className="typing-dot size-1.5 rounded-full bg-ai" />
                      <span className="typing-dot size-1.5 rounded-full bg-ai" />
                      <span className="typing-dot size-1.5 rounded-full bg-ai" />
                    </span>
                  </div>
                </div>
              )}

              {phase === "plan" && (
                <SearchPlanCard
                  filters={filters}
                  onFiltersChange={setFilters}
                  enabled={enabled}
                  onToggleSource={(id, on) => setEnabled((e) => ({ ...e, [id]: on }))}
                  total={pool.total}
                  creditsLeft={CREDITS_TOTAL - creditsUsed}
                  locked={false}
                  onRun={run}
                  onEditPrompt={() => {
                    setDraft(prompt);
                    setPhase("idle");
                  }}
                />
              )}

              {hasResults && (
                <>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="mr-1 inline-flex items-center gap-1 font-medium text-muted">
                      <Sparkles className="size-3.5 text-ai" /> Plan
                    </span>
                    {filters.map((f) => (
                      <span key={f.key} className="rounded-md bg-surface-2 px-2 py-0.5 text-fg-2">
                        <span className="text-muted">{f.label}:</span> {f.value}
                      </span>
                    ))}
                  </div>
                  {!activeSearch && <AgentProgress agents={agents} done={finished} totalRows={finished ? est.rows : visibleCount} credits={liveSearchCredits} />}

                  <Card className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{activeSearch ? savedSearches.find((s) => s.id === activeSearch)?.name : "Results"}</div>
                        <div className="text-xs text-muted">
                          {running ? `Streaming… ${visibleCount} rows so far` : `${formatNumber(est.rows)} matches · showing top ${visibleRows.length} by ICP fit · ${verifiedCount} verified emails`}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Segmented
                          size="xs"
                          value={view}
                          onChange={setView}
                          items={[
                            { value: "all", label: "All", count: visibleRows.length },
                            { value: "verified", label: "Verified email" },
                            { value: "fit", label: "Fit ≥ 85" },
                          ]}
                        />
                        <Button size="sm" variant="ai" onClick={() => setModal("ai")} disabled={!visibleRows.length}>
                          <Sparkles /> Add AI column
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setModal("enrich")} disabled={!visibleRows.length || running}>
                          <Wand2 /> Enrich{selectedRows.length ? ` ${selectedRows.length}` : ""}
                        </Button>
                      </div>
                    </div>

                    {selectedRows.length > 0 && (
                      <div className="animate-fade-in flex flex-wrap items-center gap-2 border-b border-line bg-primary-soft/50 px-4 py-2">
                        <span className="text-sm font-medium">{selectedRows.length} selected</span>
                        <span className="text-xs text-muted">({selectedRows.filter((r) => r.inCrm).length} already in CRM)</span>
                        <div className="ml-auto flex flex-wrap gap-2">
                          <Button size="xs" onClick={() => setModal("seq")}>
                            <Send /> Add to sequence
                          </Button>
                          <Button size="xs" variant="outline" onClick={addToCrm}>
                            <Database /> Add to CRM
                          </Button>
                          <Button size="xs" variant="outline" onClick={exportCsv}>
                            <Download /> Export CSV
                          </Button>
                          <Button size="xs" variant="ghost" onClick={() => setSelected(new Set())}>
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}

                    {notice && (
                      <div className="flex items-center gap-2 border-b border-line bg-info-soft/60 px-4 py-2 text-sm text-fg-2">
                        <Database className="size-4 shrink-0 text-info" />
                        <span className="flex-1">{notice}</span>
                        <button onClick={() => setNotice(null)} className="text-muted hover:text-fg" aria-label="Dismiss notice">
                          <X className="size-4" />
                        </button>
                      </div>
                    )}

                    {visibleRows.length === 0 && running ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted">
                        <Bot className="size-4 text-ai" /> Agents are warming up; first rows arrive in a few seconds…
                      </div>
                    ) : (
                      <ResultsTable
                        rows={shownRows}
                        selected={selected}
                        onToggle={toggle}
                        onToggleAll={(on) => setSelected(on ? new Set(shownRows.map((r) => r.id)) : new Set())}
                        aiCols={aiCols}
                        onRemoveCol={(id) => setAiCols((c) => c.filter((x) => x.id !== id))}
                        primaryQuestion={pool.aiQuestion}
                        streaming={running && visibleCount < rows.length}
                      />
                    )}
                    {!running && visibleRows.length > 0 && (
                      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted">
                        <span>
                          {formatNumber(est.rows - visibleRows.length)} more rows ready. Hover any status badge to see where a value came from.
                        </span>
                        <Button size="xs" variant="ghost" onClick={() => toast({ title: "Loading next 50 rows", description: "Already paid for in this search: no extra credits.", tone: "info" })}>
                          Load more
                        </Button>
                      </div>
                    )}
                  </Card>

                  {finished && (
                    <AiCallout
                      title={`${visibleRows.filter((r) => r.fit >= 85).length} strong-fit leads ready for outreach`}
                      action={
                        <>
                          <Button
                            size="xs"
                            variant="ai"
                            onClick={() => {
                              setSelected(new Set(visibleRows.filter((r) => r.fit >= 85 && !r.inCrm).map((r) => r.id)));
                            }}
                          >
                            Select new strong-fit leads
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => toast({ title: "Search saved & monitoring", description: "New matches will be added daily and flagged in Alerts." })}>
                            Save & monitor daily
                          </Button>
                        </>
                      }
                    >
                      {poolKey === "agri"
                        ? "Dealers with a new outlet or hiring signal reply 2.1× more often. Start with them in “Agri dealers: Maharashtra (kharif)”, which already has a 12.4% reply rate."
                        : poolKey === "dental"
                          ? "Clinics with no online booking and under 4★ are the best fit for a reputation + booking pitch. Lead with their review count in the first line."
                          : "Brands hiring a growth marketer this month are 3× more likely to reply. Mention the open role in your first line."}
                    </AiCallout>
                  )}

                  {/* Follow-up prompt */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit(draft);
                    }}
                    className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 pl-3 shadow-card focus-within:border-primary"
                  >
                    <Sparkles className="size-4 shrink-0 text-ai" />
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Start another search, e.g. “cold storage operators in Nashik”"
                      aria-label="New search prompt"
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                    />
                    <Button type="submit" size="icon-sm" variant="ai" aria-label="Plan search" disabled={!draft.trim()}>
                      <ArrowUp />
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <AiColumnModal
        open={modal === "ai"}
        onClose={() => setModal(null)}
        suggestions={pool.sampleQuestions}
        rowCount={visibleRows.length}
        onAdd={(q) => {
          setAiCols((c) => [...c, { id: `ai-${c.length}-${q}`, question: q, filled: 0 }]);
          setCommitted((c) => c + visibleRows.length * 2);
          toast({ title: "AI column added", description: `Agents are reading ${visibleRows.length} websites…`, tone: "info" });
        }}
      />
      <EnrichModal open={modal === "enrich"} onClose={() => setModal(null)} targets={enrichTargets} onApply={applyEnrich} />
      <AddToSequenceModal
        open={modal === "seq"}
        onClose={() => setModal(null)}
        targets={selectedRows}
        onConfirm={(name, n) => {
          toast({ title: `${n} prospects enrolled`, description: `in “${name}”. First emails go out tomorrow 10:00 AM IST.` });
          setSelected(new Set());
        }}
      />
    </Page>
  );
}
