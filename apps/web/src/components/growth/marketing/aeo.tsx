"use client";

import { Check, CircleCheck, CircleX, Eye, FileText, Plus, RefreshCw, Search, Send, Sparkles, Star, Store, Code, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ChartLegend, LineTrend, Sparkline } from "@/components/charts";
import { AiCallout, Badge, Button, Card, CardBody, CardHeader, Input, Modal, Segmented, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  aeoActions,
  aeoDraft,
  aeoEngineScores,
  aeoPrompts,
  aeoTrend,
  engineMeta,
  pipelineMeta,
  type AeoAction,
  type AeoPrompt,
  type Engine,
  type EngineResult,
  type Pipeline,
} from "@/lib/mock/demand-gen";
import { AiPill, ChartCard, RankBars, useStream } from "../shared";
import { EngineMark, useDemandGen } from "./demand-gen-shared";

const engines = Object.keys(engineMeta) as Engine[];

const actionIcon: Record<AeoAction["kind"], typeof FileText> = { page: FileText, listing: Store, schema: Code, reviews: Star };

function EngineCell({ r }: { r: EngineResult }) {
  if (r.cited)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <CircleCheck className="size-3.5" aria-hidden /> #{r.rank} · cited
      </span>
    );
  if (r.mentioned)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-info">
        <Eye className="size-3.5" aria-hidden /> #{r.rank} · mentioned
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <CircleX className="size-3.5" aria-hidden /> Missing
    </span>
  );
}

export function Aeo() {
  const toast = useToast();
  const { enqueue } = useDemandGen();
  const [pipe, setPipe] = useState<Pipeline>("clinic");
  const [prompts, setPrompts] = useState<AeoPrompt[]>(aeoPrompts);
  const [selectedId, setSelectedId] = useState("q2");
  const [newPrompt, setNewPrompt] = useState("");
  const [why, whyStreaming, startWhy] = useStream(20);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, drafting, startDraft] = useStream(14);
  const [done, setDone] = useState<string[]>([]);

  const list = prompts.filter((p) => p.pipeline === pipe);
  const selected = prompts.find((p) => p.id === selectedId) ?? list[0];

  useEffect(() => {
    if (selected) startWhy(selected.why);
  }, [selected, startWhy]);

  const overall = Math.round(engines.reduce((s, e) => s + aeoEngineScores[e].score, 0) / engines.length);

  function generatePage() {
    setDraftOpen(true);
    startDraft(aeoDraft);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Card className="col-span-2 p-4 ring-1 ring-ai/30 md:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted">AI visibility score</span>
            <AiPill>AEO</AiPill>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight tabular">{overall}</span>
            <span className="text-sm text-muted">/100</span>
          </div>
          <div className="mt-1 text-xs">
            <span className="font-medium text-success">▲ +5 pts</span> <span className="text-muted">in 30 days · 12 prompts tracked</span>
          </div>
        </Card>
        {engines.map((e) => {
          const s = aeoEngineScores[e];
          return (
            <Card key={e} className="p-4">
              <div className="flex items-center gap-2">
                <EngineMark engine={e} />
                <span className="truncate text-xs font-medium text-muted">{engineMeta[e].label}</span>
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight tabular">{s.score}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
                <span className={cn("font-medium", s.delta >= 0 ? "text-success" : "text-danger")}>
                  {s.delta >= 0 ? "▲ +" : "▼ "}
                  {s.delta}
                </span>
                <span className="text-muted">
                  in {s.mentioned}/{s.prompts} answers
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title="Visibility by AI engine"
          description="Share of tracked prompts where Smile Dental is mentioned, weighted by rank"
          legend={<ChartLegend items={engines.map((e) => ({ key: e, label: engineMeta[e].label }))} />}
          table={{
            columns: [{ key: "week", label: "Week" }, ...engines.map((e) => ({ key: e, label: engineMeta[e].label, align: "right" as const }))],
            rows: aeoTrend,
          }}
        >
          <LineTrend data={aeoTrend} xKey="week" series={engines.map((e) => ({ key: e, label: engineMeta[e].label }))} height={220} />
        </ChartCard>
        <Card className="lg:col-span-2">
          <CardHeader title="Share of AI answers" description="Clinics named across all 4 engines, last 7 days" />
          <CardBody className="pt-0">
            <RankBars
              format={(v) => `${v}%`}
              rows={[
                { key: "clove", label: "Clove Dental", value: 58 },
                { key: "smile", label: "Smile Dental (you)", value: 46, note: "▲ 9" },
                { key: "sabka", label: "Sabka Dentist", value: 41 },
                { key: "pearl", label: "Pearl Dental Studio", value: 33 },
                { key: "practo", label: "Practo listings", value: 29 },
              ]}
            />
            <p className="mt-3 text-xs text-muted">Engines most often cite Practo, Justdial and clinic FAQ pages as sources.</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Tracked prompts"
          description="What people ask AI assistants, and whether you show up. Re-checked daily."
          action={
            <Segmented
              size="xs"
              value={pipe}
              onChange={(p) => {
                setPipe(p);
                setSelectedId(prompts.find((x) => x.pipeline === p)?.id ?? "");
              }}
              items={[
                { value: "clinic", label: pipelineMeta.clinic.short },
                { value: "b2b", label: pipelineMeta.b2b.short },
              ]}
            />
          }
        />
        <form
          className="flex gap-2 px-5 pb-3"
          onSubmit={(e) => {
            e.preventDefault();
            const v = newPrompt.trim();
            if (!v) return;
            const id = `qn-${Date.now()}`;
            const miss = { mentioned: false, cited: false, rank: null };
            setPrompts((ps) => [
              ...ps,
              {
                id,
                pipeline: pipe,
                prompt: v,
                volume: "Low",
                results: { chatgpt: miss, perplexity: miss, gemini: miss, aio: miss },
                competitors: ["Checking…"],
                trend: [],
                answer: "First check runs in ≈5 minutes.",
                why: "We haven't checked this prompt yet. Anvita will ask all 4 engines from a Pune location and report back within 5 minutes.",
                actions: [],
              },
            ]);
            setNewPrompt("");
            setSelectedId(id);
            toast({ title: "Prompt added", description: "Checking ChatGPT, Perplexity, Gemini and AI Overviews…", tone: "info" });
          }}
        >
          <Input icon={<Search />} value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} placeholder={pipe === "clinic" ? "Track a prompt, e.g. “invisalign price Pune”" : "Track a prompt, e.g. “agri dealer billing software”"} className="flex-1" aria-label="New prompt to track" />
          <Button type="submit" variant="outline" size="md">
            <Plus /> Track
          </Button>
        </form>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-y border-line bg-surface-2 text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-2 text-left font-medium">Prompt</th>
                {engines.map((e) => (
                  <th key={e} scope="col" className="px-3 py-2 text-left font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <EngineMark engine={e} size="xs" /> {engineMeta[e].label.replace("Google ", "")}
                    </span>
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 text-left font-medium">Mentioned instead</th>
                <th scope="col" className="w-24 px-5 py-2 text-left font-medium whitespace-nowrap">8-wk trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn("cursor-pointer hover:bg-surface-2/60", selected?.id === p.id && "bg-primary-soft/40")}
                  aria-selected={selected?.id === p.id}
                >
                  <td className="px-5 py-3">
                    <button className="text-left font-medium text-fg" onClick={() => setSelectedId(p.id)}>
                      “{p.prompt}”
                    </button>
                    <div className="text-xs text-muted">{p.volume} volume</div>
                  </td>
                  {engines.map((e) => (
                    <td key={e} className="px-3 py-3 whitespace-nowrap">
                      <EngineCell r={p.results[e]} />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-xs text-fg-2">{p.competitors.slice(0, 2).join(", ")}{p.competitors.length > 2 && ` +${p.competitors.length - 2}`}</td>
                  <td className="px-5 py-3">{p.trend.length ? <Sparkline data={p.trend} height={24} /> : <span className="text-xs text-muted">New</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader
              title={<span className="break-words">“{selected.prompt}”</span>}
              description="What the engines answer today, and why"
              action={
                <Button size="sm" variant="ghost" onClick={() => toast({ title: "Re-checking 4 engines", description: "Fresh answers in ≈1 min.", tone: "info" })}>
                  <RefreshCw /> Re-check
                </Button>
              }
            />
            <CardBody className="space-y-4 pt-0">
              <div className="rounded-xl border border-line bg-surface-2 p-3.5">
                <div className="mb-1.5 flex items-center gap-2 text-xs text-muted">
                  <EngineMark engine="chatgpt" size="xs" /> ChatGPT answer (Pune, today)
                </div>
                <p className="text-sm text-fg-2">{selected.answer}</p>
              </div>
              <AiCallout title={selected.results.chatgpt.cited && selected.results.perplexity.cited ? "Why you're winning" : "Why you're missing"}>
                <span aria-live="polite">
                  {why}
                  {whyStreaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-ai align-middle" aria-hidden />}
                </span>
              </AiCallout>
              {selected.actions.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold text-fg">Fix it</div>
                  <ul className="space-y-1.5">
                    {selected.actions.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-sm text-fg-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden /> {a}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="ai" onClick={generatePage}>
                      <WandSparkles /> Generate AEO page
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "Added to this week's marketing tasks", tone: "info" })}>
                      <Plus /> Add to tasks
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Recommended actions" description="Ranked by expected lift in AI visibility" />
            <ul className="divide-y divide-line border-t border-line">
              {aeoActions.map((a) => {
                const Icon = actionIcon[a.kind];
                const isDone = done.includes(a.id);
                return (
                  <li key={a.id} className="flex gap-3 px-5 py-3.5">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-ai-soft text-ai [&_svg]:size-4">
                      <Icon aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className={cn("text-sm font-semibold", isDone && "text-muted line-through")}>{a.title}</div>
                      <p className="mt-0.5 text-xs text-fg-2">{a.detail}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={a.impact === "High" ? "success" : "info"}>{a.impact} impact</Badge>
                        <span className="text-xs text-muted">{a.effort}</span>
                        {isDone ? (
                          <Badge tone="success" className="ml-auto">
                            <CircleCheck aria-hidden /> Done
                          </Badge>
                        ) : (
                          <Button
                            size="xs"
                            variant={a.kind === "page" ? "ai" : "outline"}
                            className="ml-auto"
                            onClick={() => {
                              if (a.kind === "page") return generatePage();
                              setDone((d) => [...d, a.id]);
                              toast({
                                title: a.kind === "listing" ? "Listing checklist opened" : a.kind === "schema" ? "Schema queued for approval" : "Review prompt updated",
                                description: a.kind === "listing" ? "Practo + Justdial: 9 fields to complete." : undefined,
                              });
                            }}
                          >
                            {a.kind === "page" ? (
                              <>
                                <Sparkles /> Generate
                              </>
                            ) : a.kind === "listing" ? (
                              "Open checklist"
                            ) : a.kind === "schema" ? (
                              "Add schema"
                            ) : (
                              "Turn on"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}

      <Modal
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        size="lg"
        title={
          <span className="inline-flex items-center gap-2">
            <WandSparkles className="size-4 text-ai" aria-hidden /> AEO page draft
          </span>
        }
        description="Written to be quoted by AI engines: direct answer first, facts in plain text, FAQ schema."
        footer={
          <>
            <Button variant="ghost" disabled={drafting} onClick={() => startDraft(aeoDraft)}>
              <RefreshCw /> Regenerate
            </Button>
            <Button
              disabled={drafting}
              onClick={() => {
                enqueue([
                  {
                    id: `aeo-${Date.now()}`,
                    pipeline: "clinic",
                    kind: "aeo",
                    channel: "aeo",
                    title: "Publish AEO page: ‘How much does teeth whitening cost in Pune?’",
                    campaign: "Always-on AEO",
                    when: "Just now",
                    isEdit: false,
                    summary: "Generated from the AI search tab to win ‘teeth whitening cost Pune’ (currently 0/4 engines).",
                    preview: { heading: "How much does teeth whitening cost in Pune? (2026 guide)", body: aeoDraft.split("\n").slice(2, 3).join(" ").replace(/\*\*/g, ""), footer: "FAQPage · Dentist · Offer schema" },
                    checks: [
                      { label: "Factual vs price list", status: "pass", detail: "₹8,000 verified" },
                      { label: "Medical claim review", status: "warn", detail: "‘Most patients feel little to no sensitivity’: confirm with Dr. Mehta" },
                    ],
                    risk: "low",
                    confidence: 88,
                    impact: "Cited in 2–3 engines in ~3 wks",
                  },
                ]);
                setDraftOpen(false);
                toast({ title: "Sent to Approvals", description: "Publishes to smiledental.in/whitening-cost-pune once approved." });
              }}
            >
              <Send /> Send to Approvals
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-line bg-surface-2 p-4 text-sm" aria-live="polite" aria-busy={drafting}>
          {draft.split("\n").map((line, i) => {
            const clean = line.replace(/\*\*/g, "");
            if (line.startsWith("# ")) return <h3 key={i} className="mb-2 text-base font-semibold text-fg">{clean.slice(2)}</h3>;
            if (line.startsWith("## ")) return <h4 key={i} className="mt-3 mb-1 text-sm font-semibold text-fg">{clean.slice(3)}</h4>;
            if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc text-fg-2">{clean.slice(2)}</li>;
            if (line.startsWith("---")) return <hr key={i} className="my-3 border-line" />;
            if (!line.trim()) return <div key={i} className="h-1" />;
            return (
              <p key={i} className={cn("text-fg-2", line.startsWith("Schema") && "text-xs text-muted")}>
                {clean}
              </p>
            );
          })}
          {drafting && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-ai align-middle" aria-hidden />}
        </div>
      </Modal>
    </div>
  );
}
