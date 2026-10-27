"use client";

import { ArrowRight, Bell, Mail, MessageCircle, Plus, Hash, Trash2, UserRound, Inbox } from "lucide-react";
import { useState } from "react";
import { AiCallout, Badge, Button, Card, CardBody, CardHeader, Checkbox, Field, Input, Modal, Select, Switch, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { team } from "@/lib/mock/core";
import { escalationRules, type EscalationRule } from "@/lib/mock/platform";
import { uid } from "@/components/platform/shared";

const notifyMeta = {
  inbox: { icon: Inbox, label: "Inbox" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  email: { icon: Mail, label: "Email" },
  slack: { icon: Hash, label: "Slack" },
} as const;

const priorityTone = { urgent: "danger", high: "warning", normal: "neutral" } as const;

const conditionOptions = [
  { id: "sentiment", label: "Sentiment", ops: ["is negative", "drops below"], placeholder: "−0.4" },
  { id: "intent", label: "Intent", ops: ["is", "is not"], placeholder: "complaint, refund" },
  { id: "confidence", label: "Answer confidence", ops: ["is below"], placeholder: "0.6" },
  { id: "tag", label: "Contact tag", ops: ["includes"], placeholder: "vip" },
  { id: "keyword", label: "Message contains", ops: ["any of", "all of"], placeholder: "doctor, lawyer, emergency" },
  { id: "attempts", label: "Failed attempts", ops: ["≥"], placeholder: "3" },
  { id: "value", label: "Deal value", ops: [">", "<"], placeholder: "50000" },
  { id: "channel", label: "Channel", ops: ["is"], placeholder: "voice" },
];

export function EscalationTab({ onChange }: { onChange: () => void }) {
  const toast = useToast();
  const [rules, setRules] = useState<EscalationRule[]>(escalationRules);
  const [open, setOpen] = useState(false);
  const [conds, setConds] = useState([{ field: "keyword", op: "any of", value: "" }]);
  const [action, setAction] = useState("assign");
  const [assignee, setAssignee] = useState("Neha Kulkarni");
  const [notify, setNotify] = useState<EscalationRule["notify"]>(["inbox", "whatsapp"]);
  const [ruleName, setRuleName] = useState("");
  const [priority, setPriority] = useState<EscalationRule["priority"]>("high");

  const create = () => {
    const c = conds[0];
    const meta = conditionOptions.find((o) => o.id === c.field)!;
    const rule: EscalationRule = {
      id: `r${uid()}`,
      name: ruleName || `${meta.label} ${c.op} ${c.value}`.trim(),
      condition: conds.map((x) => `${conditionOptions.find((o) => o.id === x.field)!.label} ${x.op} ${x.value || "…"}`).join(" AND "),
      detail: action === "assign" ? "Hand off with AI summary" : action === "pause" ? "Switch thread to Copilot" : "Notify only, AI continues",
      enabled: true,
      routeTo: action === "notify" ? "AI continues" : assignee,
      notify,
      priority,
      firedThisWeek: 0,
    };
    setRules((r) => [...r, rule]);
    setOpen(false);
    setConds([{ field: "keyword", op: "any of", value: "" }]);
    setRuleName("");
    onChange();
    toast({ title: "Escalation rule added", description: "It'll apply to the draft version; test it in the sandbox." });
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Escalation rules"
          description="Evaluated on every message, top to bottom. First match hands the thread to a human and pauses Anvi."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus /> Add rule
            </Button>
          }
        />
        <ul className="divide-y divide-line border-t border-line">
          {rules.map((r, i) => (
            <li key={r.id} className={cn("flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center", !r.enabled && "opacity-60")}>
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded bg-surface-2 text-[11px] font-semibold text-muted tabular">{i + 1}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{r.name}</span>
                    <Badge tone={priorityTone[r.priority]}>{r.priority}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded bg-info-soft px-1.5 py-0.5 font-semibold text-info">IF</span>
                    <span className="text-fg-2">{r.condition}</span>
                    <ArrowRight className="size-3 text-muted" />
                    <span className="rounded bg-ai-soft px-1.5 py-0.5 font-semibold text-ai">THEN</span>
                    <span className="inline-flex items-center gap-1 text-fg-2">
                      <UserRound className="size-3" /> {r.routeTo}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{r.detail}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-8 sm:pl-0">
                <div className="flex w-20 items-center justify-end gap-1" aria-label={`Notifies via ${r.notify.join(", ")}`}>
                  {r.notify.map((n) => {
                    const N = notifyMeta[n];
                    return (
                      <span key={n} title={N.label} className="inline-flex size-6 items-center justify-center rounded-md bg-surface-2 text-fg-2">
                        <N.icon className="size-3.5" />
                      </span>
                    );
                  })}
                </div>
                <span className="w-16 text-right text-xs text-muted">
                  <b className="font-semibold text-fg tabular">{r.firedThisWeek}</b> this wk
                </span>
                <Switch
                  checked={r.enabled}
                  label={`Enable ${r.name}`}
                  onChange={(v) => {
                    setRules((all) => all.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)));
                    onChange();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader title="Handoff behaviour" description="What happens when a rule fires" />
          <CardBody className="space-y-3 text-sm">
            {[
              { label: "Tell the customer a teammate will reply", on: true },
              { label: "Pause AI on the thread until a human resolves", on: true },
              { label: "If no human replies in 10 min, AI sends a holding message", on: true },
              { label: "Escalate to owner if unanswered for 30 min", on: false },
            ].map((s) => (
              <HandoffToggle key={s.label} label={s.label} initial={s.on} />
            ))}
          </CardBody>
        </Card>
        <AiCallout title="Every handoff includes an AI summary">
          <span className="mt-1 block rounded-lg bg-surface p-2.5 text-xs text-fg-2 shadow-card">
            <b className="text-fg">Rohit Mehta · Complaint · Negative</b>
            <br />• Root canal on Oct 12 (Dr. Shah), pain persists after 2 weeks
            <br />• Asked for a refund of ₹6,500; AI did not promise one
            <br />• Next step: call back, offer free review visit today 4:30 PM
          </span>
        </AiCallout>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="size-4 text-muted" /> 41 escalations this week
          </div>
          <p className="mt-1 text-xs text-muted">Median time to human reply: 4m 12s. Low-confidence escalations are down 28% since 6 knowledge gaps were answered.</p>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="New escalation rule"
        description="IF the conditions match, THEN route the conversation."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create}>Add rule</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Rule name">
            <Input placeholder="e.g. Medical emergency keywords" value={ruleName} onChange={(e) => setRuleName(e.target.value)} />
          </Field>
          <div className="rounded-xl border border-line p-3">
            <div className="mb-2 text-xs font-semibold text-info">IF</div>
            <div className="space-y-2">
              {conds.map((c, i) => {
                const meta = conditionOptions.find((o) => o.id === c.field)!;
                return (
                  <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {i > 0 && <span className="w-10 text-xs font-semibold text-muted">AND</span>}
                    <Select
                      aria-label="Condition field"
                      className="sm:w-48"
                      value={c.field}
                      onChange={(e) => {
                        const m = conditionOptions.find((o) => o.id === e.target.value)!;
                        setConds((all) => all.map((x, j) => (j === i ? { field: m.id, op: m.ops[0], value: "" } : x)));
                      }}
                    >
                      {conditionOptions.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                    <Select aria-label="Operator" className="sm:w-36" value={c.op} onChange={(e) => setConds((all) => all.map((x, j) => (j === i ? { ...x, op: e.target.value } : x)))}>
                      {meta.ops.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </Select>
                    <Input
                      aria-label="Value"
                      className="flex-1"
                      placeholder={meta.placeholder}
                      value={c.value}
                      onChange={(e) => setConds((all) => all.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    />
                    {conds.length > 1 && (
                      <Button size="icon-sm" variant="ghost" aria-label="Remove condition" onClick={() => setConds((all) => all.filter((_, j) => j !== i))}>
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <Button size="xs" variant="ghost" className="mt-2" onClick={() => setConds((all) => [...all, { field: "sentiment", op: "is negative", value: "" }])}>
              <Plus /> Add condition
            </Button>
          </div>

          <div className="rounded-xl border border-line p-3">
            <div className="mb-2 text-xs font-semibold text-ai">THEN</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Action">
                <Select value={action} onChange={(e) => setAction(e.target.value)}>
                  <option value="assign">Hand off to</option>
                  <option value="pause">Switch thread to Copilot</option>
                  <option value="notify">Notify only (AI continues)</option>
                </Select>
              </Field>
              <Field label="Route to">
                <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} disabled={action === "notify"}>
                  {team.map((m) => (
                    <option key={m.id}>{m.name}</option>
                  ))}
                  <option>Front desk (round robin)</option>
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={priority} onChange={(e) => setPriority(e.target.value as EscalationRule["priority"])}>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                </Select>
              </Field>
            </div>
            <div className="mt-3 text-xs font-medium text-fg-2">Notify via</div>
            <div className="mt-1.5 flex flex-wrap gap-4">
              {(Object.keys(notifyMeta) as (keyof typeof notifyMeta)[]).map((n) => (
                <label key={n} className="inline-flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={notify.includes(n)}
                    onChange={(v) => setNotify((all) => (v ? [...all, n] : all.filter((x) => x !== n)))}
                    label={notifyMeta[n].label}
                  />
                  {notifyMeta[n].label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function HandoffToggle({ label, initial }: { label: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fg-2">{label}</span>
      <Switch checked={on} onChange={setOn} label={label} />
    </div>
  );
}
