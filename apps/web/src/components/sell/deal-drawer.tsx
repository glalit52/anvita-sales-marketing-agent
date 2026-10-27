"use client";

import { CalendarClock, CheckCircle2, Clock, IndianRupee, MessageCircle, Sparkles, Trophy, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AiCallout, Avatar, Badge, Button, ChannelIcon, Drawer, Field, Input, MetaRow, Modal, Progress, Select, Textarea, useToast } from "@/components/ui";
import { channelMeta } from "@/components/ui/channel";
import { formatCurrency } from "@/lib/format";
import { team } from "@/lib/mock/core";
import { allContacts, dealStages, formatIsoDate, pipelines, sellContactById, stageProbability, type Deal, type DealStage, type PipelineId } from "@/lib/mock/sell";
import { PayLinkModal } from "./pay-link-modal";
import { ownerName } from "./shared";

export function dealStageTone(stage: DealStage) {
  return stage === "won" ? "success" : stage === "lost" ? "danger" : stage === "proposal" ? "ai" : stage === "booked" ? "primary" : stage === "qualified" ? "info" : "neutral";
}

export function DealDrawer({ deal, onClose, onUpdate }: { deal: Deal | null; onClose: () => void; onUpdate: (deal: Deal) => void }) {
  return (
    <Drawer
      open={Boolean(deal)}
      onClose={onClose}
      width="max-w-lg"
      title={
        deal ? (
          <span className="flex items-center gap-2">
            Deal <span className="text-xs font-normal text-muted">#{deal.id.toUpperCase()}</span>
          </span>
        ) : (
          "Deal"
        )
      }
    >
      {deal && <DealBody key={deal.id} deal={deal} onUpdate={onUpdate} onClose={onClose} />}
    </Drawer>
  );
}

function DealBody({ deal, onUpdate, onClose }: { deal: Deal; onUpdate: (d: Deal) => void; onClose: () => void }) {
  const toast = useToast();
  const contact = sellContactById(deal.contactId);
  const stages = pipelines[deal.pipeline].stages;
  const [draft, setDraft] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const first = contact?.name.split(" ")[0] ?? "there";
  const runAction = () => {
    const text =
      deal.pipeline === "b2b"
        ? `Hi ${first}, thanks for your time so far! Following up on ${deal.title.split(":")[0]}. Dealers like AgriGrow cut stock-outs by 38% in their first season with us. Would a 20-minute call this week work to walk through pricing for your outlets? Happy to share a short demo on your own SKU list.`
        : `Hi ${first} 😊 Priya from Smile Dental here. Just checking in about your ${deal.title.toLowerCase()}. Do you have any questions I can help with? We offer 0% EMI for 6 months, and I can hold a slot for you this week at Koregaon Park or Baner.`;
    setStreaming(true);
    setDraft("");
    let i = 0;
    timer.current = setInterval(() => {
      i += 3;
      setDraft(text.slice(0, i));
      if (i >= text.length) {
        if (timer.current) clearInterval(timer.current);
        setStreaming(false);
      }
    }, 16);
  };

  const move = (stage: DealStage) => {
    onUpdate({ ...deal, stage, daysInStage: 0 });
    toast({ title: `Moved to ${stages[stage]}`, description: deal.title, tone: stage === "lost" ? "warning" : "success" });
  };

  return (
    <div>
      <div className="border-b border-line px-5 py-4">
        <div className="text-lg font-semibold">{deal.title}</div>
        <div className="mt-0.5 text-xs text-muted">{pipelines[deal.pipeline].label}</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight tabular">{formatCurrency(deal.value)}</div>
            <div className="text-xs text-muted">
              {stageProbability[deal.stage]}% probability · weighted {formatCurrency((deal.value * stageProbability[deal.stage]) / 100)}
            </div>
          </div>
          <Select value={deal.stage} onChange={(e) => move(e.target.value as DealStage)} aria-label="Deal stage" className="h-8! w-44! text-sm">
            {dealStages.map((s) => (
              <option key={s} value={s}>
                {stages[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex gap-1" aria-label={`Stage ${stages[deal.stage]}`}>
          {dealStages.slice(0, 5).map((s, i) => {
            const reached = deal.stage !== "lost" && dealStages.indexOf(deal.stage) >= i;
            return <div key={s} className={reached ? "h-1.5 flex-1 rounded-full bg-primary" : "h-1.5 flex-1 rounded-full bg-surface-3"} title={stages[s]} />;
          })}
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        <AiCallout
          title={`Next best action: ${deal.nba.title}`}
          action={
            <>
              <Button size="xs" variant="ai" onClick={runAction} disabled={streaming}>
                <Sparkles /> {deal.nba.cta}
              </Button>
              <Button size="xs" variant="outline" onClick={() => toast({ title: "Suggestion dismissed", description: "AI will learn from this.", tone: "info" })}>
                Not now
              </Button>
            </>
          }
        >
          {deal.nba.body}
        </AiCallout>

        {draft !== null && (
          <div className="animate-fade-in rounded-xl border border-line p-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-fg-2">
                <ChannelIcon channel={deal.channel} size="xs" /> Copilot draft · {channelMeta[deal.channel].label}
              </span>
              {streaming ? <span className="text-ai">Writing…</span> : <Badge tone="ai">Confidence 91%</Badge>}
            </div>
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} />
            <div className="mt-2 flex justify-end gap-2">
              <Button size="xs" variant="ghost" onClick={() => setDraft(null)}>
                Discard
              </Button>
              <Button
                size="xs"
                disabled={streaming}
                onClick={() => {
                  toast({ title: `Sent to ${first}`, description: `via ${channelMeta[deal.channel].label} · logged on the deal` });
                  setDraft(null);
                }}
              >
                <MessageCircle /> Send
              </Button>
            </div>
          </div>
        )}

        <section>
          <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Details</h4>
          <div className="divide-y divide-line">
            <MetaRow label="Contact">
              {contact ? (
                <span className="inline-flex items-center gap-2">
                  <Avatar name={contact.name} size="xs" /> {contact.name}
                  {contact.company && <span className="text-muted">· {contact.company}</span>}
                </span>
              ) : (
                "—"
              )}
            </MetaRow>
            <MetaRow label="Owner">
              <span className="inline-flex items-center gap-2">
                <Avatar name={ownerName(deal.ownerId)} ai={deal.ownerId === "ai"} size="xs" /> {ownerName(deal.ownerId)}
              </span>
            </MetaRow>
            <MetaRow label="Channel">
              <span className="inline-flex items-center gap-1.5">
                <ChannelIcon channel={deal.channel} size="xs" /> {channelMeta[deal.channel].label}
              </span>
            </MetaRow>
            <MetaRow label="Next step">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5 text-muted" /> {deal.nextStep} <Badge>{deal.nextStepDue}</Badge>
              </span>
            </MetaRow>
            <MetaRow label="Time in stage">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted" /> {deal.daysInStage === 0 ? "Today" : `${deal.daysInStage} days`}
              </span>
            </MetaRow>
            <MetaRow label="Expected close">{deal.expectedClose}</MetaRow>
            {deal.lostReason && <MetaRow label="Lost reason">{deal.lostReason}</MetaRow>}
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Win probability (AI)</h4>
          <Progress value={stageProbability[deal.stage]} tone="ai" />
          <p className="mt-1.5 text-xs text-muted">Based on stage, response speed, channel engagement and 1,240 similar deals in your workspace.</p>
        </section>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => setPayOpen(true)}>
            <IndianRupee /> Pay link
          </Button>
          <Button variant="outline" size="sm" onClick={() => move("won")} disabled={deal.stage === "won"}>
            <Trophy /> Won
          </Button>
          <Button variant="outline" size="sm" onClick={() => move("lost")} disabled={deal.stage === "lost"}>
            <XCircle /> Lost
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
          <CheckCircle2 /> Done
        </Button>
      </div>
      <PayLinkModal open={payOpen} onClose={() => setPayOpen(false)} defaultContactId={deal.contactId} defaultAmount={deal.value || undefined} defaultPurpose={deal.pipeline === "b2b" ? "Annual plan (B2B)" : "Treatment instalment"} />
    </div>
  );
}

export function NewDealModal({ open, onClose, pipeline, onCreate }: { open: boolean; onClose: () => void; pipeline: PipelineId; onCreate: (d: Deal) => void }) {
  if (!open) return null;
  return <NewDealForm onClose={onClose} pipeline={pipeline} onCreate={onCreate} />;
}

function NewDealForm({ onClose, pipeline: initialPipeline, onCreate }: { onClose: () => void; pipeline: PipelineId; onCreate: (d: Deal) => void }) {
  const toast = useToast();
  const [pipeline, setPipeline] = useState<PipelineId>(initialPipeline);
  const candidates = allContacts.filter((c) => (pipeline === "b2b" ? c.tags.includes("b2b") : !c.tags.includes("b2b")));
  const [contactId, setContactId] = useState(candidates[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<DealStage>("new");
  const [owner, setOwner] = useState(pipeline === "b2b" ? "u1" : "ai");
  const [close, setClose] = useState("2026-11-30");
  const contact = sellContactById(contactId);
  const valid = Boolean(contact) && title.trim().length > 1;

  return (
    <Modal
      open
      onClose={onClose}
      title="New deal"
      description="Deals track revenue from first enquiry to payment. Payment status syncs automatically."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const d: Deal = {
                id: `d${100 + title.length + contactId.length}`,
                pipeline,
                title: title.trim(),
                contactId,
                value: Number(value) || 0,
                stage,
                ownerId: owner,
                nextStep: "AI to qualify and propose next step",
                nextStepDue: "Today",
                daysInStage: 0,
                channel: contact!.channel,
                expectedClose: formatIsoDate(close).replace(/ \d{4}$/, ""),
                nba: {
                  title: "Send a personalised intro",
                  body: `AI suggests a ${contact!.language} message on ${channelMeta[contact!.channel].label} referencing ${contact!.tags[0] ?? "their enquiry"}. Leads contacted within 5 minutes convert 3× more often.`,
                  cta: "Draft intro",
                },
              };
              onCreate(d);
              toast({ title: "Deal created", description: `${d.title} · ${pipelines[pipeline].stages[stage]}` });
              onClose();
            }}
          >
            Create deal
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pipeline" className="sm:col-span-2">
          <Select
            value={pipeline}
            onChange={(e) => {
              const p = e.target.value as PipelineId;
              setPipeline(p);
              const first = allContacts.find((c) => (p === "b2b" ? c.tags.includes("b2b") : !c.tags.includes("b2b")));
              setContactId(first?.id ?? "");
            }}
          >
            {(Object.keys(pipelines) as PipelineId[]).map((p) => (
              <option key={p} value={p}>
                {pipelines[p].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Contact" className="sm:col-span-2">
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` · ${c.company}` : ""} ({c.phone})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Deal name" className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={pipeline === "b2b" ? "e.g. Shetkari Agro: 2-outlet plan" : "e.g. Single implant + crown"} autoFocus />
        </Field>
        <Field label="Value (₹)">
          <Input icon={<IndianRupee />} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))} placeholder="45000" />
        </Field>
        <Field label="Stage">
          <Select value={stage} onChange={(e) => setStage(e.target.value as DealStage)}>
            {dealStages.map((s) => (
              <option key={s} value={s}>
                {pipelines[pipeline].stages[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Owner">
          <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="ai">AI agent</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Expected close">
          <Input type="date" value={close} onChange={(e) => setClose(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
