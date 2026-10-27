"use client";

import { CircleCheck, CircleX, Copy, Hourglass, LayoutTemplate, ListChecks, Play, Plus, Search, Sparkles, Split, Workflow as WorkflowIcon } from "lucide-react";
import { useState } from "react";
import { nodeMeta, WorkflowCanvas } from "@/components/platform/automations/builder";
import { AiCallout, Badge, Button, Card, CardHeader, EmptyState, Input, Modal, Page, PageHeader, Segmented, Switch, Tabs, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { workflowRuns, workflows as seed, workflowTemplates, type Workflow } from "@/lib/mock/platform";
import { uid } from "@/components/platform/shared";

type Tab = "workflows" | "templates" | "runs";

export default function AutomationsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("workflows");
  const [items, setItems] = useState<Workflow[]>(seed);
  const [selectedId, setSelectedId] = useState(seed[0].id);
  const [q, setQ] = useState("");
  const [runFilter, setRunFilter] = useState<"all" | "failed">("all");
  const [testing, setTesting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("When someone pays a deposit, send a WhatsApp thank-you with clinic directions and remind them 2 hours before the visit");
  const [aiBuilding, setAiBuilding] = useState(false);

  const selected = items.find((w) => w.id === selectedId) ?? items[0];
  const update = (id: string, patch: Partial<Workflow>) => setItems((all) => all.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  const list = items.filter((w) => w.name.toLowerCase().includes(q.toLowerCase()));

  const createBlank = () => {
    const w: Workflow = {
      id: `w${uid()}`,
      name: "Untitled workflow",
      description: "Draft",
      enabled: false,
      runs: 0,
      lastRun: "Never",
      successRate: 0,
      category: "Custom",
      nodes: [{ id: "n1", kind: "trigger", title: "Message received", detail: "Click to choose a trigger" }],
    };
    setItems((all) => [w, ...all]);
    setSelectedId(w.id);
    setTab("workflows");
  };

  const buildWithAi = () => {
    setAiBuilding(true);
    setTimeout(() => {
      const w: Workflow = {
        id: `w${uid()}`,
        name: "Deposit paid → thank-you + reminder",
        description: "Built by AI from your description",
        enabled: false,
        runs: 0,
        lastRun: "Never",
        successRate: 0,
        category: "Payments",
        nodes: [
          { id: "a1", kind: "trigger", title: "Payment received", detail: "Razorpay · purpose contains “deposit”" },
          { id: "a2", kind: "ai", title: "AI: write message", detail: "Thank-you + directions to booked location, contact's language" },
          { id: "a3", kind: "action", title: "Send WhatsApp message", detail: "Inside 24h window, includes Google Maps link" },
          { id: "a4", kind: "delay", title: "Wait until 2 hours before appointment", detail: "Uses booking.start_time" },
          { id: "a5", kind: "action", title: "Send WhatsApp template", detail: "appointment_reminder_2h" },
        ],
      };
      setItems((all) => [w, ...all]);
      setSelectedId(w.id);
      setAiBuilding(false);
      setAiOpen(false);
      setTab("workflows");
      toast({ title: "Workflow drafted by AI", description: "Review each step, then turn it on." });
    }, 1400);
  };

  const testRun = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      toast({ title: "Test run passed", description: `${selected.nodes.length} steps executed against test contact “Ananya Rao”. No messages were sent.` });
    }, 1300);
  };

  const runs = workflowRuns.filter((r) => runFilter === "all" || r.status === "failed");

  return (
    <Page>
      <PageHeader
        title="Automations"
        description="Trigger → condition → action workflows that run 24/7 alongside your AI agent."
        actions={
          <>
            <Button variant="ai" onClick={() => setAiOpen(true)}>
              <Sparkles /> Describe with AI
            </Button>
            <Button onClick={createBlank}>
              <Plus /> New workflow
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Active workflows", value: `${items.filter((w) => w.enabled).length} / ${items.length}` },
          { label: "Runs (30 days)", value: items.reduce((a, w) => a + w.runs, 0).toLocaleString("en-IN") },
          { label: "Success rate", value: "98.6%" },
          { label: "Hours saved (est.)", value: "142 h" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-1 text-lg font-semibold tabular">{s.value}</div>
          </Card>
        ))}
      </div>

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "workflows", label: "Workflows", icon: <WorkflowIcon />, count: items.length },
          { value: "templates", label: "Templates", icon: <LayoutTemplate />, count: workflowTemplates.length },
          { value: "runs", label: "Run history", icon: <ListChecks /> },
        ]}
      />

      {tab === "workflows" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="h-fit">
            <div className="p-3">
              <Input icon={<Search />} placeholder="Search workflows…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <ul className="divide-y divide-line border-t border-line">
              {list.map((w) => (
                <li key={w.id} className={cn("relative", w.id === selected.id && "bg-primary-soft/50")}>
                  {w.id === selected.id && <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
                  <div className="flex items-start gap-3 px-4 py-3">
                    <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedId(w.id)}>
                      <div className="truncate text-sm font-medium">{w.name}</div>
                      <div className="mt-0.5 truncate text-xs text-muted">{w.description}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
                        <span>
                          <b className="font-semibold text-fg-2 tabular">{w.runs.toLocaleString("en-IN")}</b> runs
                        </span>
                        <span>Last: {w.lastRun}</span>
                        {!w.enabled && <Badge>Paused</Badge>}
                      </div>
                    </button>
                    <Switch
                      size="sm"
                      checked={w.enabled}
                      label={`Turn ${w.name} ${w.enabled ? "off" : "on"}`}
                      onChange={(v) => {
                        update(w.id, { enabled: v });
                        toast({ title: `${w.name} ${v ? "is live" : "paused"}`, tone: v ? "success" : "info" });
                      }}
                    />
                  </div>
                </li>
              ))}
              {list.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">No workflows match “{q}”.</li>}
            </ul>
          </Card>

          <Card className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0 flex-1">
                <input
                  value={selected.name}
                  onChange={(e) => update(selected.id, { name: e.target.value })}
                  aria-label="Workflow name"
                  className="w-full rounded-md bg-transparent text-base font-semibold text-fg hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
                />
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <Badge tone={selected.enabled ? "success" : "neutral"} dot>
                    {selected.enabled ? "Live" : "Off"}
                  </Badge>
                  <span>{selected.category}</span>·<span>{selected.nodes.length} steps</span>
                  {selected.runs > 0 && (
                    <>
                      ·<span>{selected.successRate}% success</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const copy = { ...selected, id: `w${uid()}`, name: `${selected.name} (copy)`, enabled: false, runs: 0, lastRun: "Never" };
                    setItems((all) => [copy, ...all]);
                    setSelectedId(copy.id);
                    toast({ title: "Workflow duplicated" });
                  }}
                >
                  <Copy /> Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={testRun} disabled={testing}>
                  <Play /> {testing ? "Testing…" : "Test run"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    update(selected.id, { enabled: true });
                    toast({ title: "Workflow saved & live", description: "New runs use this version immediately." });
                  }}
                >
                  Save & turn on
                </Button>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-muted">
                {(Object.keys(nodeMeta) as (keyof typeof nodeMeta)[]).map((k) => {
                  const M = nodeMeta[k];
                  return (
                    <span key={k} className="inline-flex items-center gap-1.5">
                      <span className={cn("inline-flex size-4 items-center justify-center rounded [&_svg]:size-2.5", M.cls)}>
                        <M.icon />
                      </span>
                      {M.label}
                    </span>
                  );
                })}
                <span className="ml-auto hidden sm:inline">Click a step to edit · “+” to insert</span>
              </div>
              <WorkflowCanvas key={selected.id} nodes={selected.nodes} onChange={(nodes) => update(selected.id, { nodes })} />
            </div>
          </Card>
        </div>
      )}

      {tab === "templates" && (
        <>
          <AiCallout className="mb-4" title="Recommended for dental clinics" action={<Button size="xs" variant="ai" onClick={() => setAiOpen(true)}><Sparkles /> Describe your own</Button>}>
            Clinics like yours that turned on <b>Payment reminder</b> and <b>Negative review alert</b> recovered ₹38k/month on average.
          </AiCallout>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {workflowTemplates.map((t) => (
              <Card key={t.id} className="flex flex-col p-4">
                <div className="flex items-center justify-between">
                  <Badge tone="primary">{t.category}</Badge>
                  <span className="text-[11px] text-muted">{t.installs.toLocaleString("en-IN")} installs</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{t.name}</h3>
                <p className="mt-1 flex-1 text-xs text-muted">{t.description}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    const w: Workflow = {
                      id: `w${uid()}`,
                      name: t.name,
                      description: t.description,
                      enabled: false,
                      runs: 0,
                      lastRun: "Never",
                      successRate: 0,
                      category: t.category,
                      nodes: [
                        { id: "t1", kind: "trigger", title: t.category === "Payments" ? "Payment link created" : t.category === "Reviews" ? "Review received" : "Tag added", detail: "From template" },
                        { id: "t2", kind: "delay", title: "Wait 2 hours", detail: "" },
                        { id: "t3", kind: "ai", title: "AI: write message", detail: "Personalised, contact's language" },
                        { id: "t4", kind: "action", title: "Send WhatsApp template", detail: "Pick an approved template" },
                      ],
                    };
                    setItems((all) => [w, ...all]);
                    setSelectedId(w.id);
                    setTab("workflows");
                    toast({ title: `“${t.name}” added`, description: "It's off until you review and save it." });
                  }}
                >
                  <Plus /> Use template
                </Button>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "runs" && (
        <Card>
          <CardHeader
            title="Run history"
            description="Every execution, step by step. Failed runs retry 3× with backoff."
            action={
              <Segmented
                size="xs"
                value={runFilter}
                onChange={setRunFilter}
                items={[
                  { value: "all", label: "All" },
                  { value: "failed", label: "Failed", count: workflowRuns.filter((r) => r.status === "failed").length },
                ]}
              />
            }
          />
          {runs.length === 0 ? (
            <EmptyState icon={<CircleCheck />} title="No failed runs" description="Everything ran smoothly." />
          ) : (
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="px-5 py-2 font-medium">Workflow</th>
                    <th className="px-3 py-2 font-medium">Contact</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Steps</th>
                    <th className="px-3 py-2 font-medium">Duration</th>
                    <th className="px-5 py-2 font-medium">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {runs.map((r) => (
                    <tr key={r.id} className="align-top">
                      <td className="px-5 py-2.5 font-medium">
                        {r.workflow}
                        {"error" in r && r.error && (
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-normal text-danger">
                            {r.error}
                            <button className="font-medium text-primary hover:underline" onClick={() => toast({ title: "Retry queued", description: `Re-running for ${r.contact}`, tone: "info" })}>
                              Retry
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-fg-2">{r.contact}</td>
                      <td className="px-3 py-2.5">
                        {r.status === "success" && (
                          <Badge tone="success">
                            <CircleCheck /> Success
                          </Badge>
                        )}
                        {r.status === "failed" && (
                          <Badge tone="danger">
                            <CircleX /> Failed
                          </Badge>
                        )}
                        {r.status === "waiting" && (
                          <Badge tone="info">
                            <Hourglass /> Waiting
                          </Badge>
                        )}
                        {r.status === "branched" && (
                          <Badge tone="warning">
                            <Split /> “No” branch
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted tabular">{r.steps}</td>
                      <td className="px-3 py-2.5 text-muted tabular">{r.duration}</td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-muted">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Describe a workflow"
        description="Anvita drafts the trigger, conditions and actions. You review before anything goes live."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAiOpen(false)}>
              Cancel
            </Button>
            <Button variant="ai" onClick={buildWithAi} disabled={aiBuilding || !aiPrompt.trim()}>
              <Sparkles /> {aiBuilding ? "Drafting…" : "Draft workflow"}
            </Button>
          </>
        }
      >
        <Textarea rows={4} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Thank patients after payment", "Alert me when a VIP messages", "Follow up dealers who opened the catalogue"].map((s) => (
            <button key={s} onClick={() => setAiPrompt(s)} className="rounded-full border border-line px-2.5 py-1 text-xs text-fg-2 hover:border-primary hover:text-primary">
              {s}
            </button>
          ))}
        </div>
      </Modal>
    </Page>
  );
}
