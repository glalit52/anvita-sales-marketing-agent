"use client";

import {
  CalendarCheck,
  CircleDollarSign,
  HandCoins,
  HeartHandshake,
  MessageCircleQuestion,
  Plus,
  RotateCcw,
  Settings2,
  Star,
  Target,
  UserSearch,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Checkbox, Drawer, Field, Input, Segmented, Switch, Textarea, useToast } from "@/components/ui";
import { ToolChip } from "@/components/platform/shared";
import { cn } from "@/lib/cn";
import { agentTools, playbooks as seed, type AgentMode, type Playbook, type ToolId } from "@/lib/mock/platform";

const icons: Record<string, typeof Target> = {
  qualify: UserSearch,
  book: CalendarCheck,
  faq: MessageCircleQuestion,
  quote: CircleDollarSign,
  deposit: HandCoins,
  review: Star,
  reengage: RotateCcw,
  complaint: HeartHandshake,
};

export function PlaybooksTab({ onChange }: { onChange: () => void }) {
  const toast = useToast();
  const [items, setItems] = useState<Playbook[]>(seed);
  const [editing, setEditing] = useState<Playbook | null>(null);
  const [newField, setNewField] = useState("");

  const update = (id: string, patch: Partial<Playbook>) => setItems((all) => all.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const save = () => {
    if (!editing) return;
    update(editing.id, editing);
    setEditing(null);
    onChange();
    toast({ title: `“${editing.name}” saved to draft`, description: "Run the sandbox tests, then publish." });
  };

  const toggleTool = (t: ToolId) =>
    editing && setEditing({ ...editing, tools: editing.tools.includes(t) ? editing.tools.filter((x) => x !== t) : [...editing.tools, t] });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Playbooks are goal-driven skills. Anvi picks one from the detected intent, collects required fields and may only call the tools you allow.
        </p>
        <Button size="sm" variant="outline" onClick={() => toast({ title: "Template gallery", description: "Playbook templates for clinics, real estate, education and agri-dealers are coming in v15.", tone: "info" })}>
          <Plus /> New playbook
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((p) => {
          const Icon = icons[p.id] ?? Target;
          return (
            <Card key={p.id} className={cn("flex flex-col p-4 transition-opacity", !p.enabled && "opacity-70")}>
              <div className="flex items-start justify-between gap-2">
                <span className={cn("inline-flex size-9 items-center justify-center rounded-lg [&_svg]:size-4", p.enabled ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted")}>
                  <Icon />
                </span>
                <Switch
                  checked={p.enabled}
                  label={`Enable ${p.name}`}
                  onChange={(v) => {
                    update(p.id, { enabled: v });
                    onChange();
                    toast({ title: `${p.name} ${v ? "enabled" : "disabled"}`, tone: v ? "success" : "info" });
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold">{p.name}</h3>
                <Badge tone={p.mode === "autopilot" ? "success" : p.mode === "copilot" ? "warning" : "neutral"}>
                  {p.mode === "autopilot" ? "Autopilot" : p.mode === "copilot" ? "Copilot" : "Off"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{p.description}</p>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div>
                  <dt className="inline text-muted">Trigger: </dt>
                  <dd className="inline text-fg-2">{p.trigger}</dd>
                </div>
                <div>
                  <dt className="inline text-muted">Goal: </dt>
                  <dd className="inline text-fg-2">{p.goal}</dd>
                </div>
                {p.requiredFields.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {p.requiredFields.map((f) => (
                      <Badge key={f}>{f}</Badge>
                    ))}
                  </div>
                )}
              </dl>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.tools.slice(0, 3).map((t) => (
                  <ToolChip key={t} name={t} />
                ))}
                {p.tools.length > 3 && <span className="self-center text-[11px] text-muted">+{p.tools.length - 3}</span>}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 text-xs">
                <span className="text-muted">
                  <b className="font-semibold text-fg tabular">{p.runs.toLocaleString("en-IN")}</b> runs · <b className="font-semibold text-fg">{p.successRate}%</b> goal met
                </span>
                <Button size="xs" variant="ghost" onClick={() => setEditing({ ...p })}>
                  <Settings2 /> Edit
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        width="max-w-xl"
        title={editing ? `Edit playbook · ${editing.name}` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save to draft</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Trigger">
                <Input value={editing.trigger} onChange={(e) => setEditing({ ...editing, trigger: e.target.value })} />
              </Field>
              <Field label="Goal (success = )">
                <Input value={editing.goal} onChange={(e) => setEditing({ ...editing, goal: e.target.value })} />
              </Field>
            </div>
            <Field label="Mode for this playbook">
              <Segmented
                value={editing.mode}
                onChange={(m: AgentMode) => setEditing({ ...editing, mode: m })}
                items={[
                  { value: "off", label: "Off" },
                  { value: "copilot", label: "Copilot" },
                  { value: "autopilot", label: "Autopilot" },
                ]}
              />
            </Field>
            <Field label="Instructions" hint="(plain language, Anvi follows these step by step)">
              <Textarea rows={7} value={editing.instructions} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} />
            </Field>

            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Required fields before goal is met</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {editing.requiredFields.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 rounded-full bg-primary-soft py-0.5 pr-1 pl-2.5 text-xs font-medium text-primary">
                    {f}
                    <button
                      aria-label={`Remove ${f}`}
                      className="rounded-full p-0.5 hover:bg-primary/10"
                      onClick={() => setEditing({ ...editing, requiredFields: editing.requiredFields.filter((x) => x !== f) })}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
                <form
                  className="inline-flex"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newField.trim()) return;
                    setEditing({ ...editing, requiredFields: [...editing.requiredFields, newField.trim()] });
                    setNewField("");
                  }}
                >
                  <input
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="+ Add field"
                    aria-label="Add required field"
                    className="h-6 w-28 rounded-full border border-dashed border-line-strong bg-transparent px-2.5 text-xs text-fg placeholder:text-muted focus:border-primary focus:outline-none"
                  />
                </form>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Tool permissions</div>
              <div className="divide-y divide-line rounded-lg border border-line">
                {agentTools.map((t) => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-surface-2">
                    <Checkbox checked={editing.tools.includes(t.id)} onChange={() => toggleTool(t.id)} label={t.label} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs text-fg">{t.label}</span>
                      <span className="block text-[11px] text-muted">{t.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Action limits</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Max discount %" hint="(hard cap)">
                  <Input type="number" min={0} max={50} value={editing.maxDiscount ?? 0} onChange={(e) => setEditing({ ...editing, maxDiscount: Number(e.target.value) })} />
                </Field>
                <Field label="Max payment link (₹)" hint="(above → human)">
                  <Input type="number" min={0} step={500} value={editing.maxPayment ?? 0} onChange={(e) => setEditing({ ...editing, maxPayment: Number(e.target.value) })} />
                </Field>
              </div>
              <p className="mt-2 text-[11px] text-muted">Limits are enforced server-side on the tool, not just in the prompt, so the model can&apos;t talk its way past them.</p>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
