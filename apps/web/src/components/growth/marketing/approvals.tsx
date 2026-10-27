"use client";

import {
  ArrowRight,
  Check,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  IndianRupee,
  LayoutTemplate,
  Megaphone,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  AiCallout,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Drawer,
  EmptyState,
  Field,
  Modal,
  Segmented,
  Select,
  StatCard,
  Textarea,
  useToast,
  type Tone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { dgChannelMeta, pipelineMeta, type ApprovalKind, type AuditAction, type CheckStatus, type Pipeline } from "@/lib/mock/demand-gen";
import { Confidence } from "../shared";
import { DgChannelMark, useDemandGen, type QueueItem } from "./demand-gen-shared";

const kindMeta: Record<ApprovalKind, { label: string; icon: typeof Megaphone }> = {
  ad: { label: "Ad", icon: Megaphone },
  email: { label: "Email", icon: FileText },
  landing: { label: "Landing page", icon: LayoutTemplate },
  budget: { label: "Budget change", icon: IndianRupee },
  aeo: { label: "AEO page", icon: Sparkles },
  whatsapp: { label: "WhatsApp", icon: MessageSquareText },
};

const checkMeta: Record<CheckStatus, { icon: typeof CircleCheck; className: string; label: string }> = {
  pass: { icon: CircleCheck, className: "text-success", label: "Pass" },
  warn: { icon: TriangleAlert, className: "text-warning", label: "Review" },
  fail: { icon: CircleX, className: "text-danger", label: "Fail" },
};

const riskTone: Record<QueueItem["risk"], Tone> = { low: "success", medium: "warning", high: "danger" };

const auditMeta: Record<AuditAction, { label: string; tone: Tone }> = {
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  changes: { label: "Changes requested", tone: "warning" },
  auto: { label: "Auto (guardrail)", tone: "ai" },
  reverted: { label: "Reverted", tone: "neutral" },
};

const stateMeta = {
  approved: { label: "Approved", tone: "success" as Tone, icon: CircleCheck },
  rejected: { label: "Rejected", tone: "danger" as Tone, icon: CircleX },
  changes: { label: "Changes requested", tone: "warning" as Tone, icon: CircleAlert },
};

export function Approvals() {
  const toast = useToast();
  const { queue, decide, audit, revert } = useDemandGen();
  const [view, setView] = useState<"pending" | "decided">("pending");
  const [kind, setKind] = useState<"all" | ApprovalKind>("all");
  const [pipe, setPipe] = useState<"all" | Pipeline>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(queue.find((q) => q.state === "pending")?.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commentFor, setCommentFor] = useState<{ ids: string[]; mode: "changes" | "rejected" } | null>(null);
  const [comment, setComment] = useState("");

  const list = queue.filter(
    (q) => (view === "pending" ? q.state === "pending" : q.state !== "pending") && (kind === "all" || q.kind === kind) && (pipe === "all" || q.pipeline === pipe),
  );
  const pending = queue.filter((q) => q.state === "pending");
  const active = queue.find((q) => q.id === activeId) ?? null;
  const lowRisk = pending.filter((q) => q.risk === "low" && q.checks.every((c) => c.status === "pass"));
  const allSelected = list.length > 0 && list.every((q) => selected.includes(q.id));

  function act(ids: string[], action: "approved" | "rejected" | "changes", note?: string) {
    decide(ids, action, note);
    setSelected((s) => s.filter((x) => !ids.includes(x)));
    const remaining = pending.filter((q) => !ids.includes(q.id));
    if (activeId && ids.includes(activeId)) setActiveId(remaining[0]?.id ?? null);
    setMobileOpen(false);
    const n = ids.length;
    if (action === "approved") toast({ title: n > 1 ? `${n} items approved` : "Approved and scheduled", description: "Going live on the next sync (≈2 min). Logged in the audit trail." });
    if (action === "rejected") toast({ title: n > 1 ? `${n} items rejected` : "Rejected", description: "The AI will learn from your reason and avoid this next time.", tone: "info" });
    if (action === "changes") toast({ title: "Changes requested", description: "The AI is revising the draft. It will come back to this queue.", tone: "info" });
  }

  function openItem(id: string) {
    setActiveId(id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) setMobileOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Waiting for you" value={pending.length} hint={`${lowRisk.length} low-risk`} icon={<Clock />} />
        <StatCard label="Approved · 30d" value={86} delta={22} hint="assets & changes" icon={<CircleCheck />} />
        <StatCard label="Median time to approve" value="38 min" delta={-31} goodWhen="down" hint="was 55 min" icon={<Clock />} />
        <StatCard label="Caught by brand check" value={7} hint="before they reached you" icon={<ShieldCheck />} />
      </div>

      <AiCallout
        title={`${lowRisk.length} items passed every check`}
        action={
          lowRisk.length > 0 && (
            <Button size="xs" variant="outline" onClick={() => act(lowRisk.map((q) => q.id), "approved")}>
              <CheckCheck /> Approve all low-risk ({lowRisk.length})
            </Button>
          )
        }
      >
        Budget shifts stay within your ₹ caps and copy edits match brand memory. Anything touching health claims, children’s data or government schemes stays for manual review.
      </AiCallout>

      <div className="grid gap-4 lg:grid-cols-5 lg:items-start">
        <Card className="min-w-0 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
            <Segmented
              size="xs"
              value={view}
              onChange={(v) => {
                setView(v);
                setSelected([]);
              }}
              items={[
                { value: "pending", label: "Pending", count: pending.length },
                { value: "decided", label: "Decided", count: queue.length - pending.length },
              ]}
            />
            <div className="ml-auto flex gap-2">
              <Select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="h-8 w-auto text-xs">
                <option value="all">All types</option>
                {(Object.keys(kindMeta) as ApprovalKind[]).map((k) => (
                  <option key={k} value={k}>
                    {kindMeta[k].label}
                  </option>
                ))}
              </Select>
              <Select aria-label="Filter by pipeline" value={pipe} onChange={(e) => setPipe(e.target.value as typeof pipe)} className="h-8 w-auto text-xs">
                <option value="all">All pipelines</option>
                <option value="clinic">{pipelineMeta.clinic.short}</option>
                <option value="b2b">{pipelineMeta.b2b.short}</option>
              </Select>
            </div>
          </div>

          {view === "pending" && list.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2/50 px-4 py-2">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && selected.length > 0}
                onChange={(c) => setSelected(c ? list.map((q) => q.id) : [])}
                label="Select all"
              />
              <span className="text-xs text-muted">{selected.length ? `${selected.length} selected` : "Select all"}</span>
              {selected.length > 0 && (
                <div className="ml-auto flex gap-1.5">
                  <Button size="xs" variant="ghost" onClick={() => setCommentFor({ ids: selected, mode: "rejected" })}>
                    <X /> Reject
                  </Button>
                  <Button size="xs" onClick={() => act(selected, "approved")}>
                    <CheckCheck /> Approve {selected.length}
                  </Button>
                </div>
              )}
            </div>
          )}

          {list.length === 0 ? (
            <EmptyState
              icon={<CheckCheck />}
              title={view === "pending" ? "Queue is clear" : "Nothing decided yet"}
              description={view === "pending" ? "New AI drafts and spend changes show up here. Nothing ships without you." : "Approved, rejected and returned items appear here."}
            />
          ) : (
            <ul className="scroll-thin divide-y divide-line lg:max-h-[640px] lg:overflow-y-auto">
              {list.map((q) => {
                const K = kindMeta[q.kind];
                const warns = q.checks.filter((c) => c.status !== "pass").length;
                return (
                  <li key={q.id} className={cn("flex gap-3 px-4 py-3", activeId === q.id && "bg-primary-soft/40")}>
                    {view === "pending" && (
                      <div className="pt-0.5">
                        <Checkbox checked={selected.includes(q.id)} onChange={(c) => setSelected((s) => (c ? [...s, q.id] : s.filter((x) => x !== q.id)))} label={`Select ${q.title}`} />
                      </div>
                    )}
                    <button onClick={() => openItem(q.id)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted">
                        <DgChannelMark channel={q.channel} size="xs" />
                        <K.icon className="size-3" aria-hidden /> {K.label}
                        {q.isEdit && <span>· edit</span>}
                        <span className="ml-auto shrink-0">{q.when}</span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm font-medium text-fg">{q.title}</div>
                      <div className="mt-0.5 truncate text-xs text-muted">{q.campaign}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone={riskTone[q.risk]}>{q.risk} risk</Badge>
                        {warns > 0 ? (
                          <Badge tone="warning">
                            <TriangleAlert aria-hidden /> {warns} flag{warns > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge tone="success">
                            <ShieldCheck aria-hidden /> All checks pass
                          </Badge>
                        )}
                        {q.pipeline === "b2b" && <Badge tone="info">B2B</Badge>}
                        {q.state !== "pending" && (
                          <Badge tone={stateMeta[q.state].tone}>
                            {(() => {
                              const I = stateMeta[q.state].icon;
                              return <I aria-hidden />;
                            })()}
                            {stateMeta[q.state].label}
                          </Badge>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="hidden min-w-0 lg:sticky lg:top-4 lg:col-span-3 lg:block">
          {active ? (
            <ApprovalDetail item={active} onAct={act} onComment={(mode) => setCommentFor({ ids: [active.id], mode })} />
          ) : (
            <EmptyState icon={<CheckCheck />} title="Select an item to review" description="You'll see a preview, what changed, and every brand and policy check." />
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Audit log" description="Every decision and automatic change, with one-click revert" />
        <ul className="border-t border-line">
          {audit.map((e) => (
            <li key={e.id} className="flex flex-wrap items-start gap-3 border-b border-line px-5 py-3 last:border-0 sm:flex-nowrap">
              {e.actor === "Anvita AI" ? <Avatar name="Anvita AI" ai size="xs" className="mt-0.5" /> : <Avatar name={e.actor} size="xs" className="mt-0.5" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Badge tone={auditMeta[e.action].tone}>{auditMeta[e.action].label}</Badge>
                  <span className={cn("text-sm text-fg", e.reverted && "text-muted line-through")}>{e.item}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  <DgChannelMark channel={e.channel} size="xs" />
                  <span>{dgChannelMeta[e.channel].label}</span>
                  <span>· {e.actor}</span>
                  <span>· {e.when}</span>
                </div>
                {e.comment && <div className="mt-1 text-xs text-fg-2">“{e.comment}”</div>}
              </div>
              {!e.reverted && e.action !== "reverted" && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    revert(e.id);
                    toast({ title: "Reverted", description: `${e.item}: restored to the previous version.`, tone: "info" });
                  }}
                >
                  <RotateCcw /> Revert
                </Button>
              )}
              {e.reverted && <Badge className="shrink-0">Reverted</Badge>}
            </li>
          ))}
        </ul>
      </Card>

      <Drawer open={mobileOpen && !!active} onClose={() => setMobileOpen(false)} title="Review" width="max-w-xl">
        {active && <ApprovalDetail item={active} onAct={act} onComment={(mode) => setCommentFor({ ids: [active.id], mode })} />}
      </Drawer>

      <Modal
        open={!!commentFor}
        onClose={() => setCommentFor(null)}
        title={commentFor?.mode === "changes" ? "Request changes" : `Reject ${commentFor && commentFor.ids.length > 1 ? `${commentFor.ids.length} items` : "item"}`}
        description="Your note goes to the AI and is saved to brand memory so it learns."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCommentFor(null)}>
              Cancel
            </Button>
            <Button
              variant={commentFor?.mode === "rejected" ? "danger" : "primary"}
              disabled={commentFor?.mode === "changes" && !comment.trim()}
              onClick={() => {
                if (commentFor) act(commentFor.ids, commentFor.mode, comment.trim() || undefined);
                setCommentFor(null);
                setComment("");
              }}
            >
              {commentFor?.mode === "changes" ? "Send to AI" : "Reject"}
            </Button>
          </>
        }
      >
        <Field label={commentFor?.mode === "changes" ? "What should change?" : "Reason (optional)"}>
          <Textarea
            autoFocus
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={commentFor?.mode === "changes" ? "e.g. Say ‘comfortable’ instead of ‘painless’ and mention the free consult." : "e.g. We don't run discount-led ads."}
          />
        </Field>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Too salesy", "Wrong price", "Avoid medical claims", "Use Hindi too"].map((s) => (
            <button key={s} onClick={() => setComment((c) => (c ? `${c} ${s}.` : `${s}.`))} className="rounded-full border border-line px-2 py-0.5 text-xs text-fg-2 hover:bg-surface-2">
              {s}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ApprovalDetail({
  item,
  onAct,
  onComment,
}: {
  item: QueueItem;
  onAct: (ids: string[], action: "approved" | "rejected" | "changes") => void;
  onComment: (mode: "changes" | "rejected") => void;
}) {
  const [tab, setTab] = useState<"preview" | "diff">("preview");
  const hasDiff = !!item.diff?.length;
  const K = kindMeta[item.kind];
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <DgChannelMark channel={item.channel} size="xs" /> {dgChannelMeta[item.channel].label} · <K.icon className="size-3" aria-hidden /> {K.label}
          {item.isEdit ? " (edit)" : " (new)"} · {item.when}
        </div>
        <h3 className="mt-1 text-base font-semibold text-fg">{item.title}</h3>
        <p className="mt-1 text-sm text-fg-2">{item.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Badge tone="success">Impact: {item.impact}</Badge>
          <Confidence value={item.confidence} />
          <span className="text-xs text-muted">Campaign: {item.campaign}</span>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {hasDiff && (
          <Segmented
            size="xs"
            value={tab}
            onChange={setTab}
            items={[
              { value: "preview", label: "Preview" },
              { value: "diff", label: `What changed (${item.diff!.length})` },
            ]}
          />
        )}

        {item.budget ? (
          <div className="space-y-2">
            {item.budget.map((b) => {
              const up = b.to > b.from;
              return (
                <div key={b.line} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-3 text-sm">
                  <span className="font-medium">{b.line}</span>
                  <span className="tabular text-fg-2">
                    {formatCurrency(b.from)} <ArrowRight className="inline size-3.5 text-muted" aria-label="to" /> <b className="text-fg">{formatCurrency(b.to)}</b>
                    <span className={cn("ml-2 text-xs font-medium", up ? "text-success" : "text-fg-2")}>
                      {up ? "▲ +" : "▼ "}
                      {formatCurrency(b.to - b.from).replace("-", "−")}
                    </span>
                  </span>
                </div>
              );
            })}
            <p className="text-xs text-muted">{item.preview.body}</p>
          </div>
        ) : tab === "diff" && hasDiff ? (
          <ul className="space-y-2 text-sm">
            {item.diff!.map((d, i) => (
              <li key={i} className="overflow-hidden rounded-lg border border-line">
                <div className="flex gap-2 bg-danger-soft/60 px-3 py-2 text-fg-2">
                  <span className="font-mono text-danger" aria-label="removed">
                    −
                  </span>
                  <span className="line-through decoration-danger/50">{d.before}</span>
                </div>
                <div className="flex gap-2 bg-success-soft/60 px-3 py-2 text-fg">
                  <span className="font-mono text-success" aria-label="added">
                    +
                  </span>
                  <span>{d.after}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-line bg-surface-2 p-4">
            {item.kind === "whatsapp" ? (
              <div className="max-w-sm rounded-xl rounded-tl-sm bg-surface p-3 text-sm text-fg shadow-card">{item.preview.body}</div>
            ) : (
              <>
                {item.preview.heading && <div className="text-base font-semibold text-fg">{item.preview.heading}</div>}
                <p className="mt-1 text-sm text-fg-2">{item.preview.body}</p>
              </>
            )}
            {item.preview.footer && <div className="mt-3 text-xs text-muted">{item.preview.footer}</div>}
          </div>
        )}

        <div>
          <div className="mb-2 text-xs font-semibold text-fg">Brand & risk checks</div>
          <ul className="space-y-1.5">
            {item.checks.map((c) => {
              const m = checkMeta[c.status];
              return (
                <li key={c.label} className="flex items-start gap-2 text-sm">
                  <m.icon className={cn("mt-0.5 size-4 shrink-0", m.className)} aria-hidden />
                  <span className="min-w-0">
                    <span className="font-medium text-fg">{c.label}</span> <span className="text-xs text-muted">({m.label})</span>
                    <span className="block text-xs text-fg-2">{c.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {item.state !== "pending" && item.comment && <div className="rounded-lg bg-surface-2 p-3 text-xs text-fg-2">Your note: “{item.comment}”</div>}
      </div>

      {item.state === "pending" ? (
        <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">
          <Button variant="ghost" onClick={() => onComment("rejected")}>
            <X /> Reject
          </Button>
          <Button variant="outline" onClick={() => onComment("changes")}>
            <MessageSquareText /> Request changes
          </Button>
          <Button onClick={() => onAct([item.id], "approved")}>
            <Check /> Approve
          </Button>
        </div>
      ) : (
        <div className="mt-auto border-t border-line px-5 py-3 text-sm text-muted">
          {stateMeta[item.state].label}. Use the audit log below to revert.
        </div>
      )}
    </div>
  );
}
