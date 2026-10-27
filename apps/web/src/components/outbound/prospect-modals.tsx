"use client";

import { ArrowRight, CircleCheck, Coins, Database, Mail, Phone, ShieldOff, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AiCallout, Badge, Button, Checkbox, Field, Input, Modal, Progress, Segmented, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { aiFirstLineSamples, enrichmentProviders, sequences, type ProspectRow } from "@/lib/mock/outbound";
import { Spinner } from "./shared";

/* ------------------------------ AI column ------------------------------ */

export function AiColumnModal({
  open,
  onClose,
  onAdd,
  suggestions,
  rowCount,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (question: string) => void;
  suggestions: string[];
  rowCount: number;
}) {
  if (!open) return null;
  return <AiColumnInner onClose={onClose} onAdd={onAdd} suggestions={suggestions} rowCount={rowCount} />;
}

function AiColumnInner({ onClose, onAdd, suggestions, rowCount }: { onClose: () => void; onAdd: (q: string) => void; suggestions: string[]; rowCount: number }) {
  const [question, setQuestion] = useState(suggestions[0]);
  const [format, setFormat] = useState<"yesno" | "text" | "number">("yesno");
  const [read, setRead] = useState({ website: true, reviews: true, listings: false });
  const perRow = 1 + Number(read.reviews) + Number(read.listings);
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={
        <span className="inline-flex items-center gap-2">
          <Sparkles className="size-4 text-ai" /> Add AI column
        </span>
      }
      description="An agent visits each company's website and listings, answers your question, and cites where it found the answer."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="ai"
            disabled={!question.trim()}
            onClick={() => {
              onAdd(question.trim());
              onClose();
            }}
          >
            <Sparkles /> Add column & run
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Your question">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Do they sell drip irrigation?" autoFocus />
        </Field>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuestion(s)}
              className={cn("rounded-full border px-3 py-1 text-xs transition-colors", question === s ? "border-ai bg-ai-soft text-ai" : "border-line text-fg-2 hover:bg-surface-2")}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Answer format">
            <Segmented
              value={format}
              onChange={setFormat}
              items={[
                { value: "yesno", label: "Yes / No" },
                { value: "text", label: "Short text" },
                { value: "number", label: "Number" },
              ]}
            />
          </Field>
          <Field label="Agent may read">
            <div className="space-y-1.5 text-sm">
              {(
                [
                  ["website", "Company website (up to 5 pages)"],
                  ["reviews", "Google Maps reviews"],
                  ["listings", "IndiaMART / Justdial listings"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2">
                  <Checkbox checked={read[k]} onChange={(v) => setRead((r) => ({ ...r, [k]: v }))} label={label} />
                  {label}
                </label>
              ))}
            </div>
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5 text-fg-2">
            <Coins className="size-4 text-warning" /> {perRow} credit{perRow > 1 && "s"} / row × {rowCount} rows
          </span>
          <span className="font-semibold tabular">≈ {formatNumber(perRow * rowCount)} credits</span>
        </div>
        <p className="text-xs text-muted">Each answer includes a confidence score. Low-confidence answers (&lt; 60%) are flagged as “Unclear” rather than guessed.</p>
      </div>
    </Modal>
  );
}

/* ------------------------------ Enrich ------------------------------ */

export interface EnrichFix {
  rowId: string;
  field: "email" | "phone";
  provider: string;
}

export function EnrichModal({ open, onClose, targets, onApply }: { open: boolean; onClose: () => void; targets: ProspectRow[]; onApply: (fixes: EnrichFix[], credits: number) => void }) {
  if (!open) return null;
  return <EnrichInner onClose={onClose} targets={targets} onApply={onApply} />;
}

function EnrichInner({ onClose, targets, onApply }: { onClose: () => void; targets: ProspectRow[]; onApply: (fixes: EnrichFix[], credits: number) => void }) {
  const [want, setWant] = useState({ email: true, phone: true });
  const missing = useMemo(
    () =>
      targets.flatMap((r) => [
        ...(want.email && r.emailStatus !== "verified" ? [{ rowId: r.id, field: "email" as const }] : []),
        ...(want.phone && r.phoneStatus !== "verified" ? [{ rowId: r.id, field: "phone" as const }] : []),
      ]),
    [targets, want],
  );

  // Waterfall plan: each provider resolves a share of what is still missing.
  const plan = useMemo(() => {
    const shares = [0.4, 0.5, 0.45];
    const out: ((typeof enrichmentProviders)[number] & { tried: number; found: number; credits: number })[] = [];
    for (let i = 0; i < enrichmentProviders.length; i++) {
      const tried = i === 0 ? missing.length : out[i - 1].tried - out[i - 1].found;
      const found = Math.floor(tried * shares[i]);
      out.push({ ...enrichmentProviders[i], tried, found, credits: found * enrichmentProviders[i].cost + (i === 2 ? tried : 0) });
    }
    return out;
  }, [missing.length]);

  const [stage, setStage] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState([0, 0, 0]);

  useEffect(() => {
    if (stage !== "running") return;
    const id = setInterval(() => {
      setProgress((prev) => {
        const next = [...prev];
        const i = next.findIndex((v) => v < 100);
        if (i === -1) return prev;
        next[i] = Math.min(100, next[i] + 12);
        return next;
      });
    }, 110);
    return () => clearInterval(id);
  }, [stage]);

  const allDone = progress.every((v) => v === 100);
  const totalCredits = plan.reduce((s, p) => s + p.credits, 0);
  const foundSoFar = plan.reduce((s, p, i) => s + Math.round((p.found * progress[i]) / 100), 0);
  const creditsSoFar = plan.reduce((s, p, i) => s + Math.round((p.credits * progress[i]) / 100), 0);

  const finish = () => {
    let cursor = 0;
    const fixes: EnrichFix[] = [];
    plan.forEach((p) => {
      missing.slice(cursor, cursor + p.found).forEach((m) => fixes.push({ ...m, provider: p.label }));
      cursor += p.found;
    });
    onApply(fixes, totalCredits);
    setStage("done");
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Waterfall enrichment"
      description={`${targets.length} rows · tries each provider in order and only pays for what's found`}
      footer={
        stage === "idle" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => setStage("running")} disabled={missing.length === 0}>
              Start enrichment · ≈ {formatNumber(totalCredits)} credits
            </Button>
          </>
        ) : stage === "running" ? (
          <Button onClick={finish} disabled={!allDone}>
            {allDone ? "Apply results" : "Enriching…"}
          </Button>
        ) : (
          <Button onClick={onClose}>Done</Button>
        )
      }
    >
      <div className="space-y-4">
        {stage === "idle" && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-fg-2">Find &amp; verify:</span>
            <label className="flex items-center gap-2">
              <Checkbox checked={want.email} onChange={(v) => setWant((w) => ({ ...w, email: v }))} label="Work email" />
              <Mail className="size-4 text-muted" /> Work email
            </label>
            <label className="flex items-center gap-2">
              <Checkbox checked={want.phone} onChange={(v) => setWant((w) => ({ ...w, phone: v }))} label="Mobile / direct dial" />
              <Phone className="size-4 text-muted" /> Mobile / direct dial
            </label>
            <Badge tone="neutral">{missing.length} fields missing or unverified</Badge>
          </div>
        )}

        <ol className="space-y-3">
          {plan.map((p, i) => {
            const prog = progress[i];
            const status = prog === 0 ? "queued" : prog < 100 ? "running" : "done";
            return (
              <li key={p.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                      status === "done" ? "bg-success-soft text-success" : status === "running" ? "bg-ai-soft text-ai" : "bg-surface-2 text-muted",
                    )}
                  >
                    {status === "done" ? <CircleCheck className="size-4" aria-label="done" /> : status === "running" ? <Spinner className="size-3.5" /> : i + 1}
                  </span>
                  {i < plan.length - 1 && <span className="mt-1 h-8 w-px bg-line-strong" aria-hidden />}
                </div>
                <div className="min-w-0 flex-1 rounded-lg border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{p.label}</div>
                      <div className="text-xs text-muted">
                        {p.detail} · {p.cost === 0 ? "free" : `${p.cost} credit${p.cost > 1 ? "s" : ""} per hit`}
                      </div>
                    </div>
                    <div className="text-right text-xs text-fg-2 tabular">
                      {status === "queued" ? (
                        <span className="text-muted">{stage === "idle" ? `tries ${p.tried}` : "waiting"}</span>
                      ) : (
                        <>
                          <b className="text-fg">{Math.round((p.found * prog) / 100)}</b> found of {p.tried}
                        </>
                      )}
                    </div>
                  </div>
                  {stage !== "idle" && <Progress className="mt-2" value={prog} tone={status === "done" ? "success" : "ai"} />}
                </div>
              </li>
            );
          })}
        </ol>

        {stage !== "idle" && (
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-surface-2 p-3 text-center text-sm">
            <div>
              <div className="text-lg font-semibold tabular">{foundSoFar}</div>
              <div className="text-xs text-muted">fields found</div>
            </div>
            <div>
              <div className="text-lg font-semibold tabular">{Math.max(0, missing.length - foundSoFar)}</div>
              <div className="text-xs text-muted">still missing</div>
            </div>
            <div>
              <div className="text-lg font-semibold tabular">{creditsSoFar}</div>
              <div className="text-xs text-muted">credits used</div>
            </div>
          </div>
        )}
        {stage === "done" && (
          <AiCallout title="Enrichment applied">
            Every new value carries its provider and verification time. Hover any status badge in the table to see provenance.
          </AiCallout>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------ Add to sequence ------------------------------ */

export function AddToSequenceModal({
  open,
  onClose,
  targets,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  targets: ProspectRow[];
  onConfirm: (sequenceName: string, enrolled: number) => void;
}) {
  const [seqId, setSeqId] = useState(sequences[0].id);
  const [skipCrm, setSkipCrm] = useState(true);
  if (!open) return null;
  const inCrm = targets.filter((t) => t.inCrm).length;
  const noEmail = targets.filter((t) => t.emailStatus === "not_found").length;
  const suppressed = targets.length > 3 ? 1 : 0;
  const enrolled = targets.length - (skipCrm ? inCrm : 0) - suppressed;
  const seq = sequences.find((s) => s.id === seqId)!;
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Add to sequence"
      description={`${targets.length} selected prospects`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={enrolled <= 0}
            onClick={() => {
              onConfirm(seq.name, enrolled);
              onClose();
            }}
          >
            Enroll {enrolled} <ArrowRight />
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Sequence">
          <Select value={seqId} onChange={(e) => setSeqId(e.target.value)}>
            {sequences
              .filter((s) => s.status !== "paused")
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status}, {s.steps.length} steps)
                </option>
              ))}
          </Select>
        </Field>

        <ul className="space-y-2 rounded-xl border border-line p-3 text-sm">
          <li className="flex items-start gap-2">
            <Database className="mt-0.5 size-4 shrink-0 text-info" />
            <span className="flex-1">
              <b>{inCrm} already in CRM.</b> <span className="text-fg-2">{skipCrm ? "They'll be skipped to avoid double outreach." : "They'll be enrolled using the existing CRM record."}</span>
            </span>
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-fg-2">
              <Checkbox checked={skipCrm} onChange={setSkipCrm} label="Skip contacts already in CRM" /> Skip
            </label>
          </li>
          {suppressed > 0 && (
            <li className="flex items-start gap-2">
              <ShieldOff className="mt-0.5 size-4 shrink-0 text-danger" />
              <span>
                <b>{suppressed} on do-not-contact list</b> <span className="text-fg-2">(unsubscribed 12 Sep). Always skipped.</span>
              </span>
            </li>
          )}
          {noEmail > 0 && (
            <li className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>
                <b>{noEmail} without an email.</b> <span className="text-fg-2">They&apos;ll get only the WhatsApp and call steps.</span>
              </span>
            </li>
          )}
        </ul>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
            <Sparkles className="size-3.5 text-ai" /> AI first lines (sample)
          </div>
          <ul className="space-y-2">
            {aiFirstLineSamples.map((s) => (
              <li key={s.name} className="rounded-lg bg-ai-soft/50 px-3 py-2 text-sm">
                <div className="text-xs text-muted">
                  {s.name} · {s.company}
                </div>
                <div className="text-fg">“{s.line}”</div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Generated from each lead&apos;s website, reviews and signals. You can review every line before the first send.</p>
        </div>
      </div>
    </Modal>
  );
}
