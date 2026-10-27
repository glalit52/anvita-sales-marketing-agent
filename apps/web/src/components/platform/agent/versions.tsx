"use client";

import { CircleCheck, Eye, FileDiff, History, RotateCcw, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Card, CardHeader, ChannelIcon, Modal, Segmented, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { contactById } from "@/lib/mock/core";
import { agentVersions, qaQueue } from "@/lib/mock/platform";

function scoreTone(score: number) {
  return score >= 4.5 ? "success" : score >= 4 ? "primary" : "warning";
}

export function VersionsTab() {
  const toast = useToast();
  const [current, setCurrent] = useState(14);
  const [rollback, setRollback] = useState<number | null>(null);
  const [diffFor, setDiffFor] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<string, "up" | "down">>({});
  const [filter, setFilter] = useState<"all" | "flagged">("flagged");

  const queue = qaQueue.filter((q) => filter === "all" || q.flags.length > 0);
  const diffVersion = agentVersions.find((v) => v.v === diffFor);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Version history" description="Each version snapshots prompt, playbooks, knowledge and model" action={<History className="size-4 text-muted" />} />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">Changelog</th>
                <th className="px-3 py-2 font-medium">Diff</th>
                <th className="px-3 py-2 font-medium">QA</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {agentVersions.map((v) => (
                <tr key={v.v} className={cn(v.v === current && "bg-primary-soft/40")}>
                  <td className="px-5 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular">v{v.v}</span>
                      {v.v === current && (
                        <Badge tone="success">
                          <CircleCheck /> Live
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] whitespace-nowrap text-muted">{v.date}</div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="text-fg-2">{v.changes}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                      <Avatar name={v.author} size="xs" className="scale-75" /> {v.author}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-xs whitespace-nowrap text-muted">
                    <div>Prompt {v.diff.prompt > 0 ? `±${v.diff.prompt}` : "–"}</div>
                    <div>Playbooks {v.diff.playbooks > 0 ? `±${v.diff.playbooks}` : "–"}</div>
                    <div>KB {v.diff.kb > 0 ? `+${v.diff.kb}` : "–"}</div>
                  </td>
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <Badge tone={scoreTone(v.score)}>{v.score.toFixed(1)} / 5</Badge>
                    <div className="mt-1 text-[11px] text-muted">Tests {v.tests}</div>
                  </td>
                  <td className="px-5 py-3 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <Button size="xs" variant="ghost" onClick={() => setDiffFor(v.v)}>
                        <FileDiff /> Diff
                      </Button>
                      {v.v !== current && (
                        <Button size="xs" variant="outline" onClick={() => setRollback(v.v)}>
                          <RotateCcw /> Rollback
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="QA review queue"
          description="Nightly sample of live conversations graded by an AI judge"
          action={
            <Segmented
              size="xs"
              value={filter}
              onChange={setFilter}
              items={[
                { value: "flagged", label: "Flagged", count: qaQueue.filter((q) => q.flags.length).length },
                { value: "all", label: "All", count: qaQueue.length },
              ]}
            />
          }
        />
        <ul className="divide-y divide-line border-t border-line">
          {queue.map((q) => {
            const c = contactById(q.contactId);
            const vote = votes[q.id];
            return (
              <li key={q.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <Avatar name={c?.name ?? "Contact"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium">{c?.name}</span>
                      <ChannelIcon channel={q.channel} size="xs" />
                      <span className="text-[11px] text-muted">
                        {q.playbook} · {q.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-fg-2">{q.summary}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={scoreTone(q.score)}>Judge {q.score.toFixed(1)}</Badge>
                      {q.flags.map((f) => (
                        <Badge key={f} tone="warning">
                          <TriangleAlert /> {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Good response"
                        aria-pressed={vote === "up"}
                        className={cn(vote === "up" && "bg-success-soft text-success hover:bg-success-soft")}
                        onClick={() => {
                          setVotes((v) => ({ ...v, [q.id]: "up" }));
                          toast({ title: "Marked as good", description: "Added to the golden set for future tests." });
                        }}
                      >
                        <ThumbsUp />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label="Bad response"
                        aria-pressed={vote === "down"}
                        className={cn(vote === "down" && "bg-danger-soft text-danger hover:bg-danger-soft")}
                        onClick={() => {
                          setVotes((v) => ({ ...v, [q.id]: "down" }));
                          toast({ title: "Marked as needs work", description: "A scenario test was drafted from this conversation.", tone: "info" });
                        }}
                      >
                        <ThumbsDown />
                      </Button>
                    </div>
                    <button className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline" onClick={() => toast({ title: "Opening transcript", tone: "info" })}>
                      <Eye className="size-3" /> Open
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-line px-5 py-3 text-xs text-muted">
          Org quality score this week: <b className="text-fg">4.6 / 5</b> · {Object.keys(votes).length} of {qaQueue.length} reviewed by you
        </div>
      </Card>

      <Modal
        open={rollback !== null}
        onClose={() => setRollback(null)}
        title={`Roll back to v${rollback}?`}
        description="Live traffic switches immediately. Your current draft is kept."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRollback(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setCurrent(rollback!);
                toast({ title: `Rolled back to v${rollback}`, description: "Anvi is now answering with the older version.", tone: "warning" });
                setRollback(null);
              }}
            >
              <RotateCcw /> Roll back
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-2">
          {agentVersions.find((v) => v.v === rollback)?.changes}. Knowledge added after this version will stay indexed but won&apos;t be used.
        </p>
      </Modal>

      <Modal open={diffFor !== null} onClose={() => setDiffFor(null)} size="lg" title={`v${diffFor} vs v${(diffFor ?? 1) - 1}`} description={diffVersion?.changes}>
        <div className="space-y-3 font-mono text-xs">
          <div className="rounded-lg border border-line">
            <div className="border-b border-line px-3 py-1.5 font-sans font-medium text-muted">system_prompt.md</div>
            <div className="space-y-0.5 p-3">
              <div className="text-fg-2">  You are Anvi, the front desk of Smile Dental, Pune.</div>
              <div className="rounded bg-danger-soft px-1 text-danger">- Offer no discounts.</div>
              <div className="rounded bg-success-soft px-1 text-success">+ You may offer the Diwali 10% consult discount until 5 Nov. Never more than 10%.</div>
              <div className="text-fg-2">  Always confirm the slot before calling book_appointment.</div>
            </div>
          </div>
          <div className="rounded-lg border border-line">
            <div className="border-b border-line px-3 py-1.5 font-sans font-medium text-muted">playbooks/quote_price.yaml</div>
            <div className="space-y-0.5 p-3">
              <div className="rounded bg-danger-soft px-1 text-danger">- max_discount_pct: 0</div>
              <div className="rounded bg-success-soft px-1 text-success">+ max_discount_pct: 10</div>
            </div>
          </div>
          <div className="rounded-lg border border-line font-sans">
            <div className="border-b border-line px-3 py-1.5 font-medium text-muted">Knowledge</div>
            <div className="p-3 text-fg-2">+{diffVersion?.diff.kb ?? 0} chunks (Offers › Diwali 2026, GBP › Sunday hours)</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
