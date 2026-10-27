"use client";

import { Database, ExternalLink, Sparkles, Star, X } from "lucide-react";
import { Badge, Checkbox, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { signalMeta, type ProspectRow } from "@/lib/mock/outbound";
import { FitScore, Spinner, Tip, VerifyBadge } from "./shared";

export interface AiAnswer {
  value: string;
  note: string;
  confidence: number;
}

export interface AiColumn {
  id: string;
  question: string;
  filled: number;
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic mock "agent read the website" answer for any question. */
export function answerFor(question: string, row: ProspectRow, primaryQuestion: string): AiAnswer {
  const q = question.toLowerCase();
  if (q === primaryQuestion.toLowerCase() || /drip|irrigat|booking|shopify/.test(q)) return row.aiAnswer;
  if (/owner|founder|who/.test(q)) return { value: row.contact.split(" ").slice(-1)[0] + " family", note: `From ${row.website}/about`, confidence: 70 + (hash(row.id + q) % 25) };
  if (/how many|count|number/.test(q)) return { value: String(2 + (hash(row.id + q) % 9)), note: "Counted from Google Maps listings", confidence: 62 + (hash(row.id) % 30) };
  const h = hash(row.id + q);
  const options: AiAnswer["value"][] = ["Yes", "Yes", "No", "Unclear"];
  const value = options[h % options.length];
  const notes = { Yes: `Mentioned on ${row.website}`, No: "No evidence on website or listings", Unclear: "Conflicting signals across sources" } as Record<string, string>;
  return { value, note: notes[value], confidence: value === "Unclear" ? 40 + (h % 15) : 70 + (h % 28) };
}

const answerTone = (v: string): Tone => (v === "Yes" ? "success" : v === "No" ? "neutral" : v === "Unclear" ? "warning" : "ai");

export function ResultsTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  aiCols,
  onRemoveCol,
  primaryQuestion,
  streaming,
}: {
  rows: ProspectRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (on: boolean) => void;
  aiCols: AiColumn[];
  onRemoveCol: (id: string) => void;
  primaryQuestion: string;
  streaming: boolean;
}) {
  const all = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const some = rows.some((r) => selected.has(r.id));
  const th = "px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide text-muted uppercase whitespace-nowrap";
  const td = "px-3 py-2.5 align-top";

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr className="border-b border-line">
            <th className="w-10 px-3 py-2.5">
              <Checkbox checked={all} indeterminate={some && !all} onChange={onToggleAll} label="Select all rows" />
            </th>
            <th className={th}>Company</th>
            <th className={th}>Rating</th>
            <th className={th}>Employees</th>
            <th className={th}>Signals</th>
            <th className={th}>Contact</th>
            <th className={th}>Email</th>
            <th className={th}>Phone</th>
            <th className={th}>ICP fit</th>
            {aiCols.map((c) => (
              <th key={c.id} className={cn(th, "bg-ai-soft/50")}>
                <span className="inline-flex max-w-[220px] items-center gap-1.5 normal-case">
                  <Sparkles className="size-3.5 shrink-0 text-ai" />
                  <span className="truncate text-fg-2" title={c.question}>
                    {c.question}
                  </span>
                  {c.filled < rows.length && <Spinner className="size-3 text-ai" />}
                  <button type="button" onClick={() => onRemoveCol(c.id)} className="rounded p-0.5 text-muted hover:text-fg" aria-label={`Remove column ${c.question}`}>
                    <X className="size-3" />
                  </button>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const isSel = selected.has(r.id);
            return (
              <tr key={r.id} className={cn("animate-fade-in border-b border-line transition-colors", isSel ? "bg-primary-soft/40" : "hover:bg-surface-2/60")}>
                <td className={td}>
                  <Checkbox checked={isSel} onChange={() => onToggle(r.id)} label={`Select ${r.company}`} />
                </td>
                <td className={td}>
                  <div className="flex items-center gap-1.5 font-medium whitespace-nowrap text-fg">
                    {r.company}
                    {r.inCrm && (
                      <Badge tone="neutral" title="Already in your CRM">
                        <Database /> In CRM
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs whitespace-nowrap text-muted">
                    <a href={`https://${r.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      {r.website} <ExternalLink className="size-3" />
                    </a>
                    · {r.city}
                  </div>
                </td>
                <td className={cn(td, "whitespace-nowrap")}>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Star className="size-3.5 fill-current text-accent" aria-hidden />
                    {r.rating.toFixed(1)}
                  </span>
                  <div className="text-xs text-muted">{r.reviews} reviews</div>
                </td>
                <td className={cn(td, "whitespace-nowrap text-fg-2")}>{r.employees}</td>
                <td className={td}>
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {r.signals.length === 0 && <span className="text-xs text-muted">–</span>}
                    {r.signals.map((s) => (
                      <Badge key={s} tone={signalMeta[s].tone}>
                        {signalMeta[s].label}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className={cn(td, "whitespace-nowrap")}>
                  <div className="font-medium">{r.contact}</div>
                  <div className="text-xs text-muted">{r.role}</div>
                </td>
                <td className={td}>
                  <div className="max-w-[230px] truncate text-fg-2">{r.email || <span className="text-muted">No email</span>}</div>
                  <div className="mt-1">
                    <VerifyBadge status={r.emailStatus} source={r.emailSource} kind="Email" />
                  </div>
                </td>
                <td className={cn(td, "whitespace-nowrap")}>
                  <div className="text-fg-2 tabular">{r.phone || <span className="text-muted">No phone</span>}</div>
                  <div className="mt-1">
                    <VerifyBadge status={r.phoneStatus} source={r.phoneSource} kind="Phone" />
                  </div>
                </td>
                <td className={td}>
                  <FitScore value={r.fit} />
                </td>
                {aiCols.map((c) => {
                  if (idx >= c.filled)
                    return (
                      <td key={c.id} className={cn(td, "bg-ai-soft/20")}>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                          <Spinner className="size-3 text-ai" /> Reading site…
                        </span>
                      </td>
                    );
                  const a = answerFor(c.question, r, primaryQuestion);
                  return (
                    <td key={c.id} className={cn(td, "bg-ai-soft/20")}>
                      <Tip
                        content={
                          <>
                            <div className="mb-1 font-semibold text-fg">
                              {a.value} · {a.confidence}% confidence
                            </div>
                            <div>{a.note}</div>
                            <div className="mt-1 text-muted">Sources: {r.website}, Google Maps listing</div>
                          </>
                        }
                      >
                        <span className="flex max-w-[220px] items-start gap-2">
                          <Badge tone={answerTone(a.value)}>{a.value}</Badge>
                          <span className="min-w-0">
                            <span className="block truncate text-xs text-fg-2">{a.note}</span>
                            <span className="text-[11px] text-muted tabular">{a.confidence}% conf.</span>
                          </span>
                        </span>
                      </Tip>
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {streaming &&
            [0, 1].map((i) => (
              <tr key={`sk-${i}`} className="border-b border-line" aria-hidden>
                <td className={td} />
                {Array.from({ length: 8 + aiCols.length }).map((_, j) => (
                  <td key={j} className={td}>
                    <div className="h-3 animate-pulse rounded bg-surface-3" style={{ width: `${50 + ((i + j) % 3) * 20}%` }} />
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
