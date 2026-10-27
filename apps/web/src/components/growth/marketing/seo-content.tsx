"use client";

import {
  ArrowRight,
  Braces,
  CalendarDays,
  Check,
  CircleCheck,
  Circle,
  Expand,
  Eye,
  FileText,
  Globe,
  Kanban,
  List,
  MousePointerClick,
  PenLine,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  AiCallout,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Modal,
  Segmented,
  StatCard,
  Switch,
  Textarea,
  useToast,
  type Tone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { contentItems, contentStages, draftArticle, seoChecks, type ContentItem, type ContentStage } from "@/lib/mock/growth";
import { AiPill, useStream } from "../shared";

export const stageTone: Record<ContentStage, Tone> = {
  Idea: "neutral",
  Brief: "info",
  Draft: "warning",
  Review: "ai",
  Published: "success",
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// November 2026 starts on a Sunday → 6 leading blanks in a Mon-first grid.
const leadingBlanks = 6;
const daysInMonth = 30;

const aiAdditions = {
  expand: `\n\n## How long do whitening results last?\n\nWith good habits, in-clinic whitening results typically last 12–24 months. Tea, coffee, paan and smoking shorten this. A single take-home touch-up kit (₹2,500) every 6 months keeps your shade bright.`,
  faq: `\n\n## Frequently asked questions\n\n**Is teeth whitening safe?** Yes, when supervised by a dentist. We check for cavities and gum health first.\n\n**Does whitening hurt?** Some patients feel mild sensitivity for 24–48 hours. We use a desensitising gel.\n\n**Can I pay in EMI?** Yes, 0% EMI over 3 or 6 months on bills above ₹6,000.\n\n**How soon can I book?** Most weekends have same-week slots. Book on WhatsApp in 30 seconds.`,
};

export function SeoContent() {
  const toast = useToast();
  const [items, setItems] = useState<ContentItem[]>(contentItems);
  const [view, setView] = useState<"calendar" | "pipeline">("calendar");
  const [openId, setOpenId] = useState<string>("ct1");
  const open = items.find((i) => i.id === openId);

  const advance = (id: string) =>
    setItems((xs) =>
      xs.map((x) => {
        if (x.id !== id) return x;
        const next = contentStages[Math.min(contentStages.indexOf(x.stage) + 1, contentStages.length - 1)];
        toast({ title: `Moved to ${next}`, description: x.title, tone: "info" });
        return { ...x, stage: next };
      }),
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Organic clicks · 28d" value="6,412" delta={22.4} hint="Search Console" icon={<MousePointerClick />} />
        <StatCard label="Impressions" value="2.1L" delta={31.0} hint="vs prev. 28d" icon={<Eye />} />
        <StatCard label="Avg. position" value="14.2" delta={-9.6} goodWhen="down" hint="was 15.7" icon={<TrendingUp />} />
        <StatCard label="Leads from organic" value="88" delta={17.3} hint="21 booked" icon={<Search />} />
      </div>

      <AiCallout
        title="8 topic gaps found in Search Console for November"
        action={
          <>
            <Button
              size="xs"
              onClick={() => {
                setItems((xs) => xs.map((x) => (x.stage === "Idea" ? { ...x, stage: "Brief" } : x)));
                toast({ title: "4 ideas approved", description: "The SEO agent is writing briefs. Drafts in ≈10 min." });
              }}
            >
              <Check /> Approve all ideas
            </Button>
            <Button size="xs" variant="outline" onClick={() => toast({ title: "Pulling fresh Search Console data", tone: "info" })}>
              Re-scan
            </Button>
          </>
        }
      >
        Queries where you get impressions but rank on page 2+, plus questions patients asked the AI agent 20+ times that have no page on your site.
      </AiCallout>

      <Card>
        <CardHeader
          title="Content calendar · November 2026"
          description="AI-proposed topics move through Idea → Brief → Draft → Review → Published"
          action={
            <>
              <Segmented
                size="xs"
                value={view}
                onChange={setView}
                items={[
                  { value: "calendar", label: "Calendar", icon: <CalendarDays /> },
                  { value: "pipeline", label: "Pipeline", icon: <Kanban /> },
                ]}
              />
              <Button
                size="sm"
                variant="outline"
                aria-label="Add topic"
                onClick={() => {
                  const id = `ct${Date.now()}`;
                  setItems((xs) => [
                    ...xs,
                    { id, title: "Dental crown types and costs in Pune", keyword: "dental crown cost pune", volume: 1000, difficulty: 24, position: null, stage: "Idea", day: 29, type: "Blog", gap: "Added manually" },
                  ]);
                  toast({ title: "Topic added for 29 Nov", tone: "info" });
                }}
              >
                <Plus /> <span className="hidden sm:inline">Topic</span>
              </Button>
            </>
          }
        />
        {/* Stage legend + counts */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
          {contentStages.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <Badge tone={stageTone[s]}>
                {s} · {items.filter((x) => x.stage === s).length}
              </Badge>
              {i < contentStages.length - 1 && <ArrowRight className="size-3 text-muted" aria-hidden />}
            </span>
          ))}
        </div>

        {view === "calendar" ? (
          <>
            {/* Month grid on md+; list on phones */}
            <div className="hidden border-t border-line md:block">
              <div className="grid grid-cols-7 border-b border-line bg-surface-2 text-xs font-medium text-muted">
                {weekdays.map((d) => (
                  <div key={d} className="px-2 py-1.5">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: leadingBlanks + daysInMonth }).map((_, idx) => {
                  const day = idx - leadingBlanks + 1;
                  const dayItems = items.filter((x) => x.day === day);
                  return (
                    <div key={idx} className={cn("min-h-24 border-r border-b border-line p-1.5 [&:nth-child(7n)]:border-r-0", day < 1 && "bg-surface-2/50")}>
                      {day >= 1 && (
                        <>
                          <div className={cn("mb-1 text-xs tabular", "text-muted")}>{day}</div>
                          <div className="space-y-1">
                            {dayItems.map((x) => (
                              <button
                                key={x.id}
                                onClick={() => setOpenId(x.id)}
                                className={cn(
                                  "w-full rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight transition-colors hover:border-primary",
                                  openId === x.id ? "border-primary bg-primary-soft" : "border-line bg-surface",
                                )}
                              >
                                <span className="line-clamp-2 font-medium text-fg">{x.title}</span>
                                <span className="mt-0.5 block text-muted">{x.stage}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <ul className="divide-y divide-line border-t border-line md:hidden">
              {[...items].sort((a, b) => a.day - b.day).map((x) => (
                <li key={x.id}>
                  <button onClick={() => setOpenId(x.id)} className={cn("flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-surface-2", openId === x.id && "bg-primary-soft/50")}>
                    <span className="w-10 shrink-0 text-center">
                      <span className="block text-[10px] text-muted uppercase">Nov</span>
                      <span className="block text-lg leading-none font-semibold">{x.day}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{x.title}</span>
                      <span className="mt-1 flex items-center gap-2">
                        <Badge tone={stageTone[x.stage]}>{x.stage}</Badge>
                        <span className="text-xs text-muted">{x.type}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="scroll-thin overflow-x-auto border-t border-line">
            <div className="grid min-w-[900px] grid-cols-5 gap-3 p-4">
              {contentStages.map((s) => (
                <div key={s} className="rounded-xl bg-surface-2 p-2">
                  <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold text-fg-2">
                    {s}
                    <span className="text-muted">{items.filter((x) => x.stage === s).length}</span>
                  </div>
                  <div className="space-y-2">
                    {items
                      .filter((x) => x.stage === s)
                      .map((x) => (
                        <div key={x.id} className={cn("rounded-lg border bg-surface p-2.5 shadow-card", openId === x.id ? "border-primary" : "border-line")}>
                          <button onClick={() => setOpenId(x.id)} className="text-left text-xs font-medium text-fg hover:text-primary">
                            {x.title}
                          </button>
                          <div className="mt-1.5 text-[11px] text-muted">
                            {formatNumber(x.volume)}/mo · KD {x.difficulty} · {x.day} Nov
                          </div>
                          {s !== "Published" && (
                            <Button size="xs" variant="ghost" className="mt-1 -ml-1.5" onClick={() => advance(x.id)}>
                              Move to {contentStages[contentStages.indexOf(s) + 1]} <ArrowRight />
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <KeywordTable items={items} openId={openId} onOpen={setOpenId} />

      {open && (
        <Editor
          key={open.id}
          item={open}
          onPublish={() => {
            setItems((xs) => xs.map((x) => (x.id === open.id ? { ...x, stage: "Published" } : x)));
          }}
          onAdvance={() => advance(open.id)}
        />
      )}
    </div>
  );
}

function Difficulty({ value }: { value: number }) {
  const label = value < 25 ? "Easy" : value < 40 ? "Medium" : "Hard";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <span className="block h-full rounded-full bg-chart-1" style={{ width: `${value}%` }} />
      </span>
      <span className="tabular text-fg">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </span>
  );
}

function KeywordTable({ items, openId, onOpen }: { items: ContentItem[]; openId: string; onOpen: (id: string) => void }) {
  const [sort, setSort] = useState<"volume" | "difficulty" | "position">("volume");
  const rows = useMemo(
    () => [...items].sort((a, b) => (sort === "volume" ? b.volume - a.volume : sort === "difficulty" ? a.difficulty - b.difficulty : (a.position ?? 999) - (b.position ?? 999))),
    [items, sort],
  );
  return (
    <Card>
      <CardHeader
        title="Target keywords"
        description="Monthly search volume (India), keyword difficulty and your current Google position"
        action={
          <Segmented
            size="xs"
            value={sort}
            onChange={setSort}
            items={[
              { value: "volume", label: "Volume" },
              { value: "difficulty", label: "Easiest" },
              { value: "position", label: "Position" },
            ]}
          />
        }
      />
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-y border-line bg-surface-2 text-xs text-muted">
            <tr>
              <th scope="col" className="px-5 py-2 text-left font-medium">Keyword</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Volume</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Difficulty</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Position</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Why (AI)</th>
              <th scope="col" className="px-5 py-2 text-right font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((x) => (
              <tr key={x.id} className={cn("cursor-pointer hover:bg-surface-2/60", openId === x.id && "bg-primary-soft/40")} onClick={() => onOpen(x.id)}>
                <td className="px-5 py-2.5 font-medium text-fg">{x.keyword}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatNumber(x.volume)}</td>
                <td className="px-3 py-2.5">
                  <Difficulty value={x.difficulty} />
                </td>
                <td className="px-3 py-2.5 text-right tabular">{x.position ? `#${x.position}` : <span className="text-muted">Not ranking</span>}</td>
                <td className="max-w-xs truncate px-3 py-2.5 text-xs text-fg-2" title={x.gap}>
                  {x.gap}
                </td>
                <td className="px-5 py-2.5 text-right">
                  <Badge tone={stageTone[x.stage]}>{x.stage}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Editor({ item, onPublish, onAdvance }: { item: ContentItem; onPublish: () => void; onAdvance: () => void }) {
  const toast = useToast();
  const isMain = item.id === draftArticle.id;
  const [title, setTitle] = useState(isMain ? draftArticle.title : item.title);
  const [meta, setMeta] = useState(isMain ? draftArticle.meta : "");
  const [outline, setOutline] = useState<string[]>(isMain ? draftArticle.outline : []);
  const [body, setBody] = useState(isMain ? draftArticle.body : "");
  const [checks, setChecks] = useState(seoChecks);
  const [streamed, streaming, startStream] = useStream(24);
  const [busy, setBusy] = useState<string | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [socialSnippets, setSocialSnippets] = useState(true);

  const fullBody = body + (busy ? streamed : "");
  const words = fullBody.split(/\s+/).filter(Boolean).length;
  const liveChecks = checks.map((c) =>
    c.id === "s2" ? { ...c, pass: meta.length >= 120 && meta.length <= 160, hint: `${meta.length} characters` } : c.id === "s4" ? { ...c, pass: words >= 1200, hint: `${words} words so far` } : c,
  );
  const score = Math.round((liveChecks.filter((c) => c.pass).length / liveChecks.length) * 100);
  const scoreTone = score >= 80 ? "success" : score >= 55 ? "warning" : "danger";

  function runAi(action: "expand" | "rewrite" | "faq" | "draft") {
    if (streaming) return;
    setBusy(action);
    if (action === "rewrite") {
      const rewritten = body.replace(
        "Teeth whitening in Pune typically costs between ₹8,000 and ₹12,000 for a single in-clinic laser session, and ₹4,500 to ₹6,000 for dentist-supervised take-home kits.",
        "In Pune, professional teeth whitening costs ₹8,000–₹12,000 for one in-clinic laser session. Dentist-supervised take-home kits cost ₹4,500–₹6,000.",
      );
      setTimeout(() => {
        setBody(rewritten);
        setBusy(null);
        toast({ title: "Rewritten for readability", description: "Flesch score 52 → 67. Shorter sentences, same facts." });
      }, 900);
      return;
    }
    const text =
      action === "draft"
        ? `${item.title}\n\nThis is an AI first draft based on the brief for “${item.keyword}”, your price list and 48 related patient chats.\n\n## Overview\n\nPatients in Pune often ask us about this. Here's what you should know before your visit, explained by the dentists at Smile Dental.`
        : aiAdditions[action];
    startStream(text, (full) => {
      setBody((b) => (action === "draft" ? full : b + full));
      setBusy(null);
      if (action === "faq") {
        setChecks((cs) => cs.map((c) => (c.id === "s5" ? { ...c, pass: true, hint: "FAQPage schema with 4 questions added" } : c)));
        toast({ title: "FAQ section + FAQPage schema added", description: "Questions pulled from real patient chats." });
      }
      if (action === "draft") {
        setOutline(["Overview", "Costs & options", "What to expect", "FAQs"]);
        setMeta(`Everything Pune patients ask about ${item.keyword}: costs, what to expect and how to book with Smile Dental, Koregaon Park & Baner.`);
      }
    });
  }

  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <PenLine className="size-4 text-muted" /> Editor
            <Badge tone={stageTone[item.stage]}>{item.stage}</Badge>
            <AiPill>AI draft</AiPill>
          </span>
        }
        description={`Focus keyword: ${item.keyword} · ${formatNumber(item.volume)} searches/mo`}
        action={
          <div className="flex flex-wrap gap-2">
            {item.stage !== "Published" && item.stage !== "Review" && (
              <Button size="sm" variant="outline" onClick={onAdvance}>
                Send to {contentStages[contentStages.indexOf(item.stage) + 1]}
              </Button>
            )}
            <Button size="sm" disabled={item.stage === "Published"} onClick={() => setPublishOpen(true)}>
              <Globe /> {item.stage === "Published" ? "Published" : "Publish to WordPress"}
            </Button>
          </div>
        }
      />
      <CardBody>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Field label="Title (H1)" hint={`${title.length}/60`}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Meta description" hint={`${meta.length}/160`}>
              <Textarea rows={2} value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="Write or generate a 120–160 character summary" />
            </Field>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-fg-2">Outline</span>
                <Button size="xs" variant="ghost" onClick={() => setOutline((o) => [...o, "New section"])}>
                  <Plus /> Section
                </Button>
              </div>
              {outline.length === 0 ? (
                <p className="rounded-lg border border-dashed border-line-strong p-3 text-sm text-muted">No outline yet. Generate a draft to get one.</p>
              ) : (
                <ol className="space-y-1">
                  {outline.map((o, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-5 text-right text-xs text-muted tabular">H2</span>
                      <Input
                        aria-label={`Outline section ${i + 1}`}
                        className="h-8!"
                        value={o}
                        onChange={(e) => setOutline((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-fg-2">
                  Body <span className="font-normal text-muted">· {words} words · Markdown</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {body ? (
                    <>
                      <Button size="xs" variant="outline" onClick={() => runAi("expand")} disabled={!!busy}>
                        <Expand /> Expand
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => runAi("rewrite")} disabled={!!busy}>
                        <Sparkles /> Rewrite
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => runAi("faq")} disabled={!!busy || checks.find((c) => c.id === "s5")?.pass}>
                        <Braces /> Add FAQ schema
                      </Button>
                    </>
                  ) : (
                    <Button size="xs" variant="ai" onClick={() => runAi("draft")} disabled={!!busy}>
                      <Sparkles /> Write first draft
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                aria-label="Article body"
                rows={14}
                className={cn("text-sm leading-relaxed", busy && "ring-2 ring-ai/30")}
                value={fullBody}
                readOnly={!!busy}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start writing, or let the SEO agent write a first draft from the brief."
              />
              {busy && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-ai" aria-live="polite">
                  <Sparkles className="size-3.5 animate-pulse" /> AI is writing…
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-line p-4">
              <div className="flex items-center gap-4">
                <div
                  className="relative grid size-16 shrink-0 place-items-center rounded-full"
                  style={{ background: `conic-gradient(var(--${scoreTone}) ${score * 3.6}deg, var(--surface-3) 0)` }}
                  role="img"
                  aria-label={`SEO score ${score} out of 100`}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-surface text-lg font-semibold tabular">{score}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">SEO score</div>
                  <div className="text-xs text-muted">
                    {score >= 80 ? "Good to publish" : score >= 55 ? "Almost there: fix the items below" : "Needs work"}
                  </div>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {liveChecks.map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-sm">
                    {c.pass ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Pass" /> : <Circle className="mt-0.5 size-4 shrink-0 text-line-strong" aria-label="To do" />}
                    <span className="min-w-0">
                      <span className={cn("block", c.pass ? "text-fg-2" : "text-fg")}>{c.label}</span>
                      <span className="block text-xs text-muted">{c.hint}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line p-4 text-sm">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <FileText className="size-4 text-muted" /> Google preview
              </div>
              <div className="truncate text-xs text-fg-2">smiledental.in › blog › {draftArticle.slug}</div>
              <div className="mt-0.5 line-clamp-1 font-medium text-info">{title || "Untitled"}</div>
              <div className="mt-0.5 line-clamp-2 text-xs text-fg-2">{meta || "Add a meta description to control this snippet."}</div>
            </div>
            <div className="rounded-xl border border-line p-4">
              <div className="mb-1 text-sm font-semibold">Keyword metrics</div>
              <dl className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <dt className="text-[11px] text-muted">Volume</dt>
                  <dd className="font-semibold tabular">{formatNumber(item.volume)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">Difficulty</dt>
                  <dd className="font-semibold tabular">{item.difficulty}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-muted">Position</dt>
                  <dd className="font-semibold tabular">{item.position ? `#${item.position}` : "—"}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </CardBody>

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish to WordPress"
        description="smiledental.in · connected as priya@smiledental.in"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPublishOpen(false);
                onPublish();
                toast({
                  title: "Published to smiledental.in",
                  description: socialSnippets ? "3 social snippets queued in Social. Submitted to Google for indexing." : "Submitted to Google for indexing.",
                });
              }}
            >
              <Globe /> Publish now
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-line p-3">
            <span className="text-muted">URL</span>
            <span className="truncate font-medium">/blog/{draftArticle.slug}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-line p-3">
            <span className="text-muted">Category · Author</span>
            <span className="font-medium">Cosmetic dentistry · Dr. Neha Kulkarni</span>
          </div>
          {score < 80 && (
            <p className="rounded-lg bg-warning-soft p-3 text-warning">
              SEO score is {score}/100. You can still publish, but fixing the open checklist items usually improves ranking.
            </p>
          )}
          <label className="flex items-center justify-between gap-3 rounded-lg border border-line p-3">
            <span>
              <span className="block font-medium">Generate social snippets</span>
              <span className="block text-xs text-muted">Instagram, Facebook and Google Business posts from this article</span>
            </span>
            <Switch checked={socialSnippets} onChange={setSocialSnippets} label="Generate social snippets" />
          </label>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <List className="size-3.5" /> Schema: Article{checks.find((c) => c.id === "s5")?.pass ? " + FAQPage" : ""} · Canonical set · Sitemap updated
          </p>
        </div>
      </Modal>
    </Card>
  );
}
