"use client";

import {
  CircleHelp,
  FileText,
  Globe,
  Link2,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sheet,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ChannelIcon, Field, Input, Modal, Segmented, Textarea, useToast } from "@/components/ui";
import { HealthBadge, uid } from "@/components/platform/shared";
import { cn } from "@/lib/cn";
import { faqs as faqSeed, knowledgeGaps, knowledgeSources, type KnowledgeSource, type SourceKind } from "@/lib/mock/platform";

const kindMeta: Record<SourceKind, { icon: typeof Globe; label: string; cls: string }> = {
  website: { icon: Globe, label: "Website", cls: "bg-primary-soft text-primary" },
  pdf: { icon: FileText, label: "PDF", cls: "bg-danger-soft text-danger" },
  faq: { icon: CircleHelp, label: "Q&A", cls: "bg-ai-soft text-ai" },
  sheet: { icon: Sheet, label: "Google Sheet", cls: "bg-success-soft text-success" },
  gbp: { icon: MapPin, label: "Google Business", cls: "bg-info-soft text-info" },
};

type AddKind = "url" | "upload" | "qa" | "sheet";

export function KnowledgeTab({ onChange }: { onChange: () => void }) {
  const toast = useToast();
  const [sources, setSources] = useState<KnowledgeSource[]>(knowledgeSources);
  const [faqs, setFaqs] = useState(faqSeed);
  const [gaps, setGaps] = useState(knowledgeGaps);
  const [addOpen, setAddOpen] = useState(false);
  const [addKind, setAddKind] = useState<AddKind>("url");
  const [addValue, setAddValue] = useState("");
  const [qaQ, setQaQ] = useState("");
  const [qaA, setQaA] = useState("");
  const [gapAnswer, setGapAnswer] = useState<{ id: string; q: string; a: string } | null>(null);
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const resync = (id: string) => {
    setSources((s) => s.map((x) => (x.id === id ? { ...x, status: "syncing", lastSynced: "Syncing…" } : x)));
    setTimeout(() => {
      setSources((s) => s.map((x) => (x.id === id ? { ...x, status: "synced", lastSynced: "Just now" } : x)));
      toast({ title: "Source re-synced", description: "Embeddings updated. Changes go live on next publish." });
      onChange();
    }, 1800);
  };

  const addSource = () => {
    const id = `k${uid()}`;
    const map: Record<AddKind, Pick<KnowledgeSource, "kind" | "name" | "detail">> = {
      url: { kind: "website", name: addValue || "smiledental.in/blog", detail: "Crawling up to 50 pages…" },
      upload: { kind: "pdf", name: addValue || "Aligner FAQ.pdf", detail: "Extracting text & OCR…" },
      qa: { kind: "faq", name: qaQ || "New Q&A", detail: "1 Q&A pair" },
      sheet: { kind: "sheet", name: addValue || "Inventory sheet", detail: "Reading tabs…" },
    };
    if (addKind === "qa" && qaQ) setFaqs((f) => [{ id, q: qaQ, a: qaA, hits: 0 }, ...f]);
    if (addKind !== "qa") {
      setSources((s) => [{ id, ...map[addKind], status: "syncing", lastSynced: "Syncing…", chunks: 0, usage: 0 }, ...s]);
      setTimeout(() => {
        setSources((s) => s.map((x) => (x.id === id ? { ...x, status: "synced", lastSynced: "Just now", chunks: 37, detail: x.detail.replace(/…$/, " done") } : x)));
      }, 2500);
    }
    setAddOpen(false);
    setAddValue("");
    setQaQ("");
    setQaA("");
    onChange();
    toast({ title: addKind === "qa" ? "Q&A added" : "Source added", description: addKind === "qa" ? "Anvi can use it in the draft version." : "We'll index it in the background." });
  };

  const saveGap = () => {
    if (!gapAnswer) return;
    setFaqs((f) => [{ id: gapAnswer.id, q: gapAnswer.q, a: gapAnswer.a, hits: 0 }, ...f]);
    setGaps((g) => g.filter((x) => x.id !== gapAnswer.id));
    setGapAnswer(null);
    onChange();
    toast({ title: "Answer added to Clinic FAQs", description: "Anvi will use it after you publish." });
  };

  const filteredFaqs = faqs.filter((f) => (f.q + f.a).toLowerCase().includes(query.toLowerCase()));
  const totalChunks = sources.reduce((a, s) => a + s.chunks, 0);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <Card>
          <CardHeader
            title="Sources"
            description={`${sources.length} sources · ${totalChunks.toLocaleString("en-IN")} chunks indexed · multilingual embeddings`}
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus /> Add source
              </Button>
            }
          />
          <ul className="divide-y divide-line border-t border-line">
            {sources.map((s) => {
              const M = kindMeta[s.kind];
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", M.cls)}>
                    <M.icon />
                  </span>
                  <div className="min-w-0 flex-1 basis-56">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{s.name}</span>
                      <Badge>{M.label}</Badge>
                      {s.autoSync && <span className="text-[11px] text-muted">Auto-sync: {s.autoSync}</span>}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted">
                      {s.detail} · {s.chunks} chunks · cited in {s.usage}% of answers
                    </div>
                  </div>
                  <div className="ml-12 flex items-center gap-3 sm:ml-0">
                    <div className="text-right">
                      <HealthBadge
                        status={s.status === "synced" ? "healthy" : s.status === "error" ? "error" : "syncing"}
                        label={s.status === "synced" ? "Synced" : s.status === "error" ? "Failed" : "Syncing"}
                      />
                      <div className="mt-0.5 text-[11px] text-muted">{s.lastSynced}</div>
                    </div>
                    <Button variant="outline" size="xs" onClick={() => resync(s.id)} disabled={s.status === "syncing"}>
                      <RefreshCw className={cn(s.status === "syncing" && "animate-spin")} /> Resync
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="FAQ editor"
            description="Exact answers always win over retrieved website text"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAddKind("qa");
                  setAddOpen(true);
                }}
              >
                <MessageSquarePlus /> New Q&A
              </Button>
            }
          />
          <CardBody>
            <Input icon={<Search />} placeholder="Search FAQs…" value={query} onChange={(e) => setQuery(e.target.value)} className="mb-3" />
            <ul className="space-y-2">
              {filteredFaqs.map((f) => (
                <li key={f.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-start gap-2">
                    <CircleHelp className="mt-0.5 size-4 shrink-0 text-ai" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{f.q}</div>
                      {editingFaq === f.id ? (
                        <Textarea
                          className="mt-2"
                          autoFocus
                          value={f.a}
                          onChange={(e) => setFaqs((all) => all.map((x) => (x.id === f.id ? { ...x, a: e.target.value } : x)))}
                        />
                      ) : (
                        <p className="mt-1 text-sm text-fg-2">{f.a || <span className="text-muted italic">No answer yet</span>}</p>
                      )}
                      <div className="mt-1.5 text-[11px] text-muted">Used {f.hits}× in the last 30 days</div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {editingFaq === f.id ? (
                        <Button
                          size="xs"
                          onClick={() => {
                            setEditingFaq(null);
                            onChange();
                            toast({ title: "FAQ updated" });
                          }}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button size="icon-sm" variant="ghost" aria-label="Edit FAQ" onClick={() => setEditingFaq(f.id)}>
                          <Pencil />
                        </Button>
                      )}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Delete FAQ"
                        onClick={() => {
                          setFaqs((all) => all.filter((x) => x.id !== f.id));
                          onChange();
                          toast({ title: "FAQ deleted", tone: "info" });
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
              {filteredFaqs.length === 0 && <li className="py-6 text-center text-sm text-muted">No FAQs match “{query}”.</li>}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Knowledge gaps"
            description="Questions Anvi couldn't answer confidently (last 14 days)"
            action={<Badge tone="warning">{gaps.length} open</Badge>}
          />
          <ul className="divide-y divide-line border-t border-line">
            {gaps.map((g) => (
              <li key={g.id} className="px-5 py-3">
                <div className="flex items-start gap-2">
                  <ChannelIcon channel={g.channel} size="xs" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">“{g.q}”</div>
                    <div className="mt-0.5 text-xs text-muted">
                      Asked {g.asked}× · last {g.lastAsked} · escalated to team
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 pl-6">
                  <Button size="xs" onClick={() => setGapAnswer({ id: g.id, q: g.q, a: g.suggestion })}>
                    <Plus /> Add answer
                  </Button>
                  {g.suggestion && (
                    <Badge tone="ai">
                      <Sparkles /> AI draft ready
                    </Badge>
                  )}
                  <button
                    className="text-xs text-muted hover:text-fg"
                    onClick={() => {
                      setGaps((all) => all.filter((x) => x.id !== g.id));
                      toast({ title: "Gap dismissed", description: "Anvi will keep escalating this question.", tone: "info" });
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            ))}
            {gaps.length === 0 && <li className="px-5 py-10 text-center text-sm text-muted">No open gaps. Anvi answered everything 🎉</li>}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Link2 className="size-4" />
            </span>
            <div className="text-sm">
              <div className="font-medium">Citations are on</div>
              <p className="mt-0.5 text-xs text-muted">
                Every factual answer links to the source chunk. Answers without a source drop below the 0.6 confidence threshold and escalate.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add knowledge source"
        description="Anvi only answers from sources you approve."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addSource} disabled={addKind === "qa" && !qaQ}>
              {addKind === "qa" ? "Add Q&A" : "Add & index"}
            </Button>
          </>
        }
      >
        <Segmented
          className="mb-4 flex w-full flex-wrap [&>button]:flex-1 [&>button]:justify-center"
          value={addKind}
          onChange={setAddKind}
          items={[
            { value: "url", label: "URL", icon: <Globe /> },
            { value: "upload", label: "Upload", icon: <Upload /> },
            { value: "qa", label: "Q&A", icon: <CircleHelp /> },
            { value: "sheet", label: "Sheet", icon: <Sheet /> },
          ]}
        />
        {addKind === "url" && (
          <div className="space-y-3">
            <Field label="Page or sitemap URL">
              <Input icon={<Globe />} placeholder="https://smiledental.in/treatments" value={addValue} onChange={(e) => setAddValue(e.target.value)} />
            </Field>
            <p className="text-xs text-muted">We follow links on the same domain (max 50 pages) and re-crawl daily. Pages behind login are skipped.</p>
          </div>
        )}
        {addKind === "upload" && (
          <button
            onClick={() => setAddValue("Aligner treatment guide.pdf")}
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-strong px-6 py-10 text-center hover:bg-surface-2"
          >
            <Upload className="mb-2 size-6 text-muted" />
            <span className="text-sm font-medium">{addValue || "Drop PDF, DOCX, TXT or CSV, or click to browse"}</span>
            <span className="mt-1 text-xs text-muted">Up to 25 MB each · scanned PDFs are OCR&apos;d (Hindi & Marathi supported)</span>
          </button>
        )}
        {addKind === "qa" && (
          <div className="space-y-3">
            <Field label="Question">
              <Input placeholder="Do you offer free check-ups for senior citizens?" value={qaQ} onChange={(e) => setQaQ(e.target.value)} />
            </Field>
            <Field label="Answer">
              <Textarea rows={4} placeholder="Write the exact answer Anvi should give…" value={qaA} onChange={(e) => setQaA(e.target.value)} />
            </Field>
          </div>
        )}
        {addKind === "sheet" && (
          <div className="space-y-3">
            <Field label="Google Sheet link">
              <Input icon={<Sheet />} placeholder="https://docs.google.com/spreadsheets/d/…" value={addValue} onChange={(e) => setAddValue(e.target.value)} />
            </Field>
            <p className="text-xs text-muted">Best for price lists and inventory. Each row becomes a record; we re-read the sheet every 15 minutes.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!gapAnswer}
        onClose={() => setGapAnswer(null)}
        title="Add answer"
        description="Saved to Clinic FAQs and used by Anvi after publish."
        footer={
          <>
            <Button variant="ghost" onClick={() => setGapAnswer(null)}>
              Cancel
            </Button>
            <Button onClick={saveGap} disabled={!gapAnswer?.a}>
              Save answer
            </Button>
          </>
        }
      >
        {gapAnswer && (
          <div className="space-y-3">
            <div className="rounded-lg bg-surface-2 p-3 text-sm font-medium">“{gapAnswer.q}”</div>
            <Field label={gapAnswer.a ? "Answer (AI draft from similar sources, please verify)" : "Answer"}>
              <Textarea rows={5} value={gapAnswer.a} onChange={(e) => setGapAnswer({ ...gapAnswer, a: e.target.value })} placeholder="Type the answer…" />
            </Field>
            {!gapAnswer.a && (
              <Button
                variant="ai"
                size="sm"
                onClick={() =>
                  setGapAnswer({
                    ...gapAnswer,
                    a: "Please check with our team for an exact quote. Ranges from the price list: All-on-4 implants ₹2,80,000–₹4,50,000 per arch including the fixed bridge. Consultation with CBCT scan: ₹1,500.",
                  })
                }
              >
                <Sparkles /> Draft with AI
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
