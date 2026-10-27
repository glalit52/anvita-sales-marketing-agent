"use client";

import { Bolt, Clock, GitFork, Plus, Search, Sparkles, Trash2, Zap } from "lucide-react";
import { Fragment, useState } from "react";
import { Badge, Button, Drawer, Field, Input, Modal, Segmented, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { actionOptions, triggerOptions, type FlowNode, type NodeKind } from "@/lib/mock/platform";
import { uid } from "@/components/platform/shared";

export const nodeMeta: Record<NodeKind, { label: string; icon: typeof Zap; cls: string; ring: string }> = {
  trigger: { label: "Trigger", icon: Zap, cls: "bg-warning-soft text-warning", ring: "border-warning/40" },
  condition: { label: "Condition", icon: GitFork, cls: "bg-info-soft text-info", ring: "border-info/40" },
  delay: { label: "Delay", icon: Clock, cls: "bg-surface-3 text-fg-2", ring: "border-line-strong" },
  action: { label: "Action", icon: Bolt, cls: "bg-primary-soft text-primary", ring: "border-primary/30" },
  ai: { label: "AI step", icon: Sparkles, cls: "bg-ai-soft text-ai", ring: "border-ai/40" },
};

function NodeCard({ node, onClick, compact }: { node: FlowNode; onClick: () => void; compact?: boolean }) {
  const M = nodeMeta[node.kind];
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border bg-surface text-left shadow-card transition-shadow hover:shadow-pop focus-visible:shadow-pop",
        M.ring,
        compact ? "p-2.5" : "p-3.5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", M.cls)}>
          <M.icon />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold tracking-wide text-muted uppercase">{M.label}</div>
          <div className="text-sm font-medium text-fg">{node.title}</div>
          {node.detail && <div className="mt-0.5 text-xs text-muted">{node.detail}</div>}
        </div>
      </div>
    </button>
  );
}

function Connector({ onAdd, label }: { onAdd: () => void; label?: string }) {
  return (
    <div className="relative flex h-12 flex-col items-center justify-center">
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong" />
      {label && <span className="absolute top-1 left-1/2 ml-3 text-[10px] font-semibold text-success">{label}</span>}
      <button
        onClick={onAdd}
        aria-label="Add step here"
        className="relative z-10 inline-flex size-6 items-center justify-center rounded-full border border-line-strong bg-surface text-muted shadow-card transition-colors hover:border-primary hover:bg-primary hover:text-primary-fg"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function WorkflowCanvas({ nodes, onChange }: { nodes: FlowNode[]; onChange: (nodes: FlowNode[]) => void }) {
  const [pickerAt, setPickerAt] = useState<{ index: number; mode: "trigger" | "step" } | null>(null);
  const [pickerTab, setPickerTab] = useState<"all" | "Messaging" | "CRM" | "AI" | "Logic" | "Developer">("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<FlowNode | null>(null);

  const insert = (label: string, id: string) => {
    if (!pickerAt) return;
    let node: FlowNode;
    if (pickerAt.mode === "trigger") {
      const t = triggerOptions.find((x) => x.id === id)!;
      node = { id: `n${uid()}`, kind: "trigger", title: t.label, detail: t.detail };
      onChange([node, ...nodes.slice(1)]);
    } else {
      const kind: NodeKind = id === "delay" ? "delay" : id === "condition" ? "condition" : id.startsWith("ai-") ? "ai" : "action";
      node = {
        id: `n${uid()}`,
        kind,
        title: id === "delay" ? "Wait 1 hour" : id === "condition" ? "If contact has tag…" : label,
        detail: kind === "ai" ? "Uses Anvi's knowledge + contact profile" : "Click to configure",
        no: kind === "condition" ? [] : undefined,
      };
      const next = [...nodes];
      next.splice(pickerAt.index, 0, node);
      onChange(next);
    }
    setPickerAt(null);
    setQ("");
  };

  const saveNode = (n: FlowNode) => {
    onChange(nodes.map((x) => (x.id === n.id ? n : x)));
    setEditing(null);
  };

  const options =
    pickerAt?.mode === "trigger"
      ? triggerOptions.map((t) => ({ id: t.id, label: t.label, group: "Triggers", detail: t.detail }))
      : actionOptions.map((a) => ({ ...a, detail: "" })).filter((a) => pickerTab === "all" || a.group === pickerTab);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div
        className="@container scroll-thin overflow-x-auto rounded-xl border border-line bg-surface-2/60 px-4 py-6"
        style={{ backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      >
        <div className="mx-auto w-full max-w-md @2xl:max-w-[680px]">
          <div className="w-full @2xl:w-[58%]">
          {nodes.map((n, i) => (
            <Fragment key={n.id}>
              {i > 0 && <Connector onAdd={() => setPickerAt({ index: i, mode: "step" })} label={nodes[i - 1].kind === "condition" ? "YES" : undefined} />}
              <div className="relative">
                <NodeCard node={n} onClick={() => (n.kind === "trigger" ? setPickerAt({ index: 0, mode: "trigger" }) : setEditing(n))} />
                {n.kind === "condition" && (
                  <div className="mt-2 ml-6 border-l-2 border-dashed border-line-strong pl-4 @2xl:absolute @2xl:top-0 @2xl:left-full @2xl:mt-0 @2xl:ml-0 @2xl:w-[70%] @2xl:border-0 @2xl:pl-6">
                    <div className="mb-1 text-[10px] font-semibold text-danger @2xl:hidden">NO</div>
                    <div className="relative hidden @2xl:block">
                      <div className="absolute top-6 -left-6 h-px w-6 border-t-2 border-dashed border-line-strong" />
                      <span className="absolute top-1 -left-5 text-[10px] font-semibold text-danger">NO</span>
                    </div>
                    {(n.no ?? []).length > 0 ? (
                      <div className="space-y-2">
                        {n.no!.map((b) => (
                          <NodeCard key={b.id} node={b} compact onClick={() => setEditing(b)} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-line-strong bg-surface/60 p-2.5 text-xs text-muted">End: no action</div>
                    )}
                  </div>
                )}
              </div>
            </Fragment>
          ))}
          <Connector onAdd={() => setPickerAt({ index: nodes.length, mode: "step" })} />
          <div className="mx-auto w-fit rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted shadow-card">End of workflow</div>
          </div>
        </div>
      </div>

      <Modal
        open={!!pickerAt}
        onClose={() => setPickerAt(null)}
        title={pickerAt?.mode === "trigger" ? "Change trigger" : "Add a step"}
        description={pickerAt?.mode === "trigger" ? "What starts this workflow?" : "Actions run in order, top to bottom."}
        size="lg"
      >
        <Input icon={<Search />} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
        {pickerAt?.mode === "step" && (
          <div className="scroll-thin mb-3 overflow-x-auto">
            <Segmented
              size="xs"
              value={pickerTab}
              onChange={setPickerTab}
              items={(["all", "Messaging", "CRM", "AI", "Logic", "Developer"] as const).map((g) => ({ value: g, label: g === "all" ? "All" : g }))}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((o) => {
            const kind: NodeKind = pickerAt?.mode === "trigger" ? "trigger" : o.id === "delay" ? "delay" : o.id === "condition" ? "condition" : o.id.startsWith("ai-") ? "ai" : "action";
            const M = nodeMeta[kind];
            return (
              <button key={o.id} onClick={() => insert(o.label, o.id)} className="flex items-start gap-3 rounded-xl border border-line p-3 text-left hover:border-primary hover:bg-primary-soft/40">
                <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", M.cls)}>
                  <M.icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="block text-xs text-muted">{o.detail || o.group}</span>
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="col-span-full py-6 text-center text-sm text-muted">Nothing matches “{q}”.</p>}
        </div>
      </Modal>

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={
          editing && (
            <span className="flex items-center gap-2">
              {nodeMeta[editing.kind].label} <Badge>{editing.title}</Badge>
            </span>
          )
        }
        footer={
          editing && (
            <>
              <Button
                variant="ghost"
                className="mr-auto text-danger! hover:text-danger!"
                onClick={() => {
                  onChange(nodes.filter((x) => x.id !== editing.id));
                  setEditing(null);
                }}
              >
                <Trash2 /> Delete step
              </Button>
              <Button onClick={() => saveNode(editing)}>Save step</Button>
            </>
          )
        }
      >
        {editing && (
          <div className="space-y-4 p-5">
            <Field label="Step name">
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </Field>
            <Field label={editing.kind === "delay" ? "Wait rule" : editing.kind === "condition" ? "Condition" : "Configuration"}>
              <Textarea rows={4} value={editing.detail} onChange={(e) => setEditing({ ...editing, detail: e.target.value })} />
            </Field>
            {editing.kind === "ai" && (
              <div className="rounded-lg bg-ai-soft/60 p-3 text-xs text-fg-2">
                AI steps use the published agent (v14) with this workflow&apos;s context. Output is available to later steps as <code className="font-mono text-ai">{"{{ai.output}}"}</code>.
              </div>
            )}
            {editing.kind === "action" && editing.title.toLowerCase().includes("whatsapp") && (
              <div className="rounded-lg border border-line p-3 text-xs text-muted">
                Approved templates only outside the 24-hour window. Variables: <code className="font-mono">{"{{contact.first_name}}"}</code>, <code className="font-mono">{"{{location.name}}"}</code>, <code className="font-mono">{"{{booking.link}}"}</code>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
