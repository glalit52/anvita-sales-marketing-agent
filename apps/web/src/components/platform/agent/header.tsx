"use client";

import { ChevronDown, CircleCheck, CircleX, FlaskConical, Hand, Pause, Rocket, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Card, ChannelIcon, Checkbox, Field, Modal, PageHeader, Segmented, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { agentProfile, channelModes, scenarioTests, type AgentMode } from "@/lib/mock/platform";

const modeMeta: Record<AgentMode, { label: string; icon: typeof Zap; explain: string; tone: "neutral" | "warning" | "success" }> = {
  off: { label: "Off", icon: Pause, explain: "Anvi doesn't reply. Every conversation goes to your team's inbox.", tone: "neutral" },
  copilot: {
    label: "Copilot",
    icon: Hand,
    explain: "Anvi drafts every reply with sources; a human reviews and taps Send. Good for the first week or sensitive channels.",
    tone: "warning",
  },
  autopilot: {
    label: "Autopilot",
    icon: Zap,
    explain: "Anvi replies on its own in < 60s, 24/7, books and collects deposits, and hands off to your team when escalation rules fire.",
    tone: "success",
  },
};

export function AgentHeader({ drafts, onPublished, onOpenSandbox }: { drafts: number; onPublished: () => void; onOpenSandbox: () => void }) {
  const toast = useToast();
  const [mode, setMode] = useState<AgentMode>("autopilot");
  const [channels, setChannels] = useState(channelModes);
  const [showChannels, setShowChannels] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [version, setVersion] = useState(agentProfile.publishedVersion);
  const [shadow, setShadow] = useState(true);
  const [notes, setNotes] = useState("Diwali offer copy tweaks; Sunday hours FAQ; stricter discount cap in Quote price.");
  const [publishing, setPublishing] = useState(false);

  const Meta = modeMeta[mode];
  const overrides = channels.filter((c) => c.mode !== mode).length;
  const failing = scenarioTests.filter((t) => t.last === "fail");

  const publish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublishOpen(false);
      setVersion((v) => v + 1);
      onPublished();
      toast({
        title: `Anvi v${version + 1} published`,
        description: shadow ? "Running in shadow mode for 24h before taking live traffic." : "Live on all Autopilot channels now.",
      });
    }, 1200);
  };

  return (
    <>
      <PageHeader
        title="AI Agent Studio"
        description="Train, test and ship your AI employee. Every change is versioned and tested before it talks to customers."
        actions={
          <>
            <Button variant="outline" onClick={onOpenSandbox}>
              <FlaskConical /> Test in sandbox
            </Button>
            <Button onClick={() => setPublishOpen(true)} disabled={drafts === 0}>
              <Rocket /> Publish changes
              {drafts > 0 && <span className="rounded-full bg-white/20 px-1.5 text-[11px]">{drafts}</span>}
            </Button>
          </>
        }
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-3.5 lg:w-80 lg:shrink-0">
            <Avatar name={agentProfile.name} ai size="lg" online={mode !== "off"} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">{agentProfile.name}</span>
                <Badge tone="success">
                  <CircleCheck /> v{version} published
                </Badge>
              </div>
              <div className="mt-0.5 text-xs text-muted">
                AI front desk · Smile Dental
                <span className="block font-mono text-[11px]">{agentProfile.model}</span>
              </div>
              {drafts > 0 ? (
                <div className="mt-1 text-xs font-medium text-warning">
                  {drafts} unpublished change{drafts > 1 ? "s" : ""} in draft
                </div>
              ) : (
                <div className="mt-1 text-xs text-success">Draft matches live version</div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 border-line lg:border-l lg:pl-5">
            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                value={mode}
                onChange={(m) => {
                  setMode(m);
                  setChannels((cs) => cs.map((c) => ({ ...c, mode: m })));
                  toast({ title: `Agent mode: ${modeMeta[m].label}`, description: "Applied to all channels. Fine-tune per channel below.", tone: "info" });
                }}
                items={(Object.keys(modeMeta) as AgentMode[]).map((m) => {
                  const I = modeMeta[m].icon;
                  return { value: m, label: modeMeta[m].label, icon: <I /> };
                })}
              />
              <button
                onClick={() => setShowChannels((s) => !s)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                aria-expanded={showChannels}
              >
                Per-channel modes{overrides > 0 && ` · ${overrides} override${overrides > 1 ? "s" : ""}`}
                <ChevronDown className={cn("size-3.5 transition-transform", showChannels && "rotate-180")} />
              </button>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-sm text-fg-2">
              <Meta.icon className="mt-0.5 size-4 shrink-0 text-muted" />
              <span>
                <b className="font-semibold text-fg">{Meta.label}:</b> {Meta.explain}
              </span>
            </p>
          </div>
        </div>

        {showChannels && (
          <div className="animate-fade-in mt-4 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-2 xl:grid-cols-3">
            {channels.map((c, i) => (
              <div key={c.channel} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2/50 px-3 py-2">
                <ChannelIcon channel={c.channel} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.label}</div>
                  <div className="truncate text-[11px] text-muted">{c.note}</div>
                </div>
                <Segmented
                  size="xs"
                  value={c.mode}
                  onChange={(m) => {
                    setChannels((cs) => cs.map((x, j) => (j === i ? { ...x, mode: m } : x)));
                    toast({ title: `${c.label}: ${modeMeta[m].label}`, tone: "info" });
                  }}
                  items={[
                    { value: "off", label: "Off" },
                    { value: "copilot", label: "Copilot" },
                    { value: "autopilot", label: "Auto" },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title={`Publish Anvi v${version + 1}`}
        description="Review what changes before it talks to customers."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button onClick={publish} disabled={publishing}>
              <Rocket /> {publishing ? "Publishing…" : shadow ? "Publish to shadow" : "Publish live"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Prompt & persona", value: 1 },
              { label: "Playbooks", value: 1 },
              { label: "Knowledge chunks", value: Math.max(0, drafts - 2) + 6 },
            ].map((d) => (
              <div key={d.label} className="rounded-lg bg-surface-2 p-2.5">
                <div className="text-lg font-semibold tabular">{d.value}</div>
                <div className="text-[11px] text-muted">{d.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-line">
            <div className="flex items-center justify-between border-b border-line px-3 py-2 text-xs font-medium">
              <span>Scenario tests</span>
              <span className={failing.length ? "text-warning" : "text-success"}>
                {scenarioTests.length - failing.length}/{scenarioTests.length} passing
              </span>
            </div>
            <ul className="divide-y divide-line text-sm">
              {failing.map((t) => (
                <li key={t.id} className="flex items-center gap-2 px-3 py-2">
                  <CircleX className="size-4 shrink-0 text-danger" />
                  <span className="flex-1">{t.name}</span>
                  <Badge tone="danger">Fail</Badge>
                </li>
              ))}
              <li className="flex items-center gap-2 px-3 py-2 text-muted">
                <CircleCheck className="size-4 shrink-0 text-success" />
                {scenarioTests.length - failing.length} other scenarios passed
              </li>
            </ul>
          </div>
          <Field label="Changelog">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox checked={shadow} onChange={setShadow} label="Shadow mode" />
            <span>
              <b className="font-medium">Run in shadow mode for 24h first</b>
              <span className="block text-xs text-muted">v{version + 1} answers live traffic silently; we compare its replies with v{version} before switching.</span>
            </span>
          </label>
          <div className="flex items-start gap-2 rounded-lg bg-ai-soft/60 p-3 text-xs text-fg-2">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ai" />
            AI judge predicts quality 4.6 → 4.7 and no change in escalation rate. 1 failing test (“Never discounts above 10%”) is pre-existing in v14.
          </div>
        </div>
      </Modal>
    </>
  );
}
