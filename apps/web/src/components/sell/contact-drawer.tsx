"use client";

import {
  ArrowRightLeft,
  ArrowUpRight,
  Bot,
  Briefcase,
  CalendarCheck,
  CalendarPlus,
  CircleSlash,
  CheckCircle2,
  CircleHelp,
  IndianRupee,
  MessageCircle,
  Phone,
  Plus,
  Send,
  Sparkles,
  Star,
  StickyNote,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiCallout, Avatar, Badge, Button, ChannelIcon, Drawer, EmptyState, Input, MetaRow, Select, Switch, Tabs, Textarea, useToast } from "@/components/ui";
import { channelMeta } from "@/components/ui/channel";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { stageMeta, team, type Contact, type Stage } from "@/lib/mock/core";
import {
  aiSummaryFor,
  consentFor,
  contactNotes,
  deals,
  formatIsoDate,
  pipelines,
  timelineFor,
  type ConsentRecord,
  type ContactNote,
  type TimelineType,
} from "@/lib/mock/sell";
import { PayLinkModal } from "./pay-link-modal";
import { OwnerChip, ScoreBar, ownerName } from "./shared";

type Tab = "overview" | "activity" | "deals" | "notes";

const timelineIcon: Record<TimelineType, { icon: typeof Bot; className: string }> = {
  message: { icon: MessageCircle, className: "bg-info-soft text-info" },
  booking: { icon: CalendarCheck, className: "bg-success-soft text-success" },
  payment: { icon: IndianRupee, className: "bg-primary-soft text-primary" },
  review: { icon: Star, className: "bg-accent-soft text-warning" },
  sequence: { icon: Send, className: "bg-surface-3 text-fg-2" },
  stage: { icon: ArrowRightLeft, className: "bg-surface-3 text-fg-2" },
  note: { icon: StickyNote, className: "bg-warning-soft text-warning" },
  ai: { icon: Sparkles, className: "bg-ai-soft text-ai" },
};

const consentMeta: Record<ConsentRecord["status"], { label: string; tone: "success" | "danger" | "neutral"; icon: typeof Bot }> = {
  opted_in: { label: "Opted in", tone: "success", icon: CheckCircle2 },
  opted_out: { label: "Opted out", tone: "danger", icon: CircleSlash },
  unknown: { label: "No consent", tone: "neutral", icon: CircleHelp },
};

export function ContactDrawer({
  contact,
  onClose,
  onUpdate,
}: {
  contact: Contact | null;
  onClose: () => void;
  onUpdate: (contact: Contact) => void;
}) {
  return (
    <Drawer open={Boolean(contact)} onClose={onClose} title="Contact" width="max-w-xl">
      {contact && <ContactProfile key={contact.id} contact={contact} onUpdate={onUpdate} />}
    </Drawer>
  );
}

function ContactProfile({ contact, onUpdate }: { contact: Contact; onUpdate: (c: Contact) => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [consent, setConsent] = useState(() => consentFor(contact));
  const [notes, setNotes] = useState<ContactNote[]>(() => contactNotes[contact.id] ?? []);
  const [draft, setDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const contactDeals = deals.filter((d) => d.contactId === contact.id);
  const timeline = timelineFor(contact);
  const first = contact.name.split(" ")[0];
  const waConsent = consent.find((c) => c.channel === "whatsapp")?.status;

  const toggleConsent = (channel: ConsentRecord["channel"], on: boolean) => {
    setConsent((prev) =>
      prev.map((c) =>
        c.channel === channel
          ? { ...c, status: on ? "opted_in" : "opted_out", source: on ? "Recorded manually by Priya Sharma (verbal consent at reception)" : "Opt-out recorded manually by Priya Sharma", date: "27 Oct 2026, 11:20 AM" }
          : c,
      ),
    );
    toast({ title: `${channelMeta[channel].label} marketing ${on ? "opt-in" : "opt-out"} recorded`, description: "Saved to the consent log with timestamp (DPDP audit trail).", tone: "info" });
  };

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (t && !contact.tags.includes(t)) onUpdate({ ...contact, tags: [...contact.tags, t] });
    setTagDraft("");
    setAddingTag(false);
  };

  return (
    <div>
      <div className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <Avatar name={contact.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold">{contact.name}</h2>
              <Badge tone={stageMeta[contact.stage].tone} dot>
                {stageMeta[contact.stage].label}
              </Badge>
            </div>
            <div className="mt-0.5 text-sm text-muted">
              {contact.company ? `${contact.company} · ` : ""}
              {contact.city} · {contact.language}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ScoreBar score={contact.score} />
              <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                <ChannelIcon channel={contact.channel} size="xs" /> via {contact.source}
              </span>
            </div>
          </div>
          <Link
            href={`/contacts/${contact.id}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-fg-2 hover:bg-surface-2 hover:text-fg"
          >
            Open full profile <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            {
              label: "WhatsApp",
              icon: MessageCircle,
              onClick: () =>
                waConsent === "opted_out"
                  ? toast({ title: `${first} opted out of WhatsApp`, description: "Only service messages within the 24h window are allowed.", tone: "warning" })
                  : toast({ title: `Opened WhatsApp chat with ${first}`, description: "Continuing in the unified inbox.", tone: "info" }),
            },
            { label: "Call", icon: Phone, onClick: () => toast({ title: `Calling ${contact.phone}…`, description: "Call is recorded and summarised by AI.", tone: "info" }) },
            { label: "Book", icon: CalendarPlus, onClick: () => toast({ title: "Booking link sent", description: `smiledental.anvita.app/book sent to ${first} on WhatsApp.` }) },
            { label: "Pay link", icon: IndianRupee, onClick: () => setPayOpen(true) },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex flex-col items-center gap-1 rounded-lg border border-line py-2 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <a.icon className="size-4" />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs
        className="px-3"
        value={tab}
        onChange={setTab}
        items={[
          { value: "overview", label: "Overview" },
          { value: "activity", label: "Activity", count: timeline.length },
          { value: "deals", label: "Deals", count: contactDeals.length },
          { value: "notes", label: "Notes", count: notes.length },
        ]}
      />

      <div className="px-5 py-4">
        {tab === "overview" && (
          <div className="space-y-5">
            <AiCallout
              title="AI summary"
              action={
                <>
                  <Button size="xs" variant="outline" onClick={() => toast({ title: "Follow-up drafted", description: "Copilot draft added to the inbox for review.", tone: "info" })}>
                    <Sparkles /> Draft follow-up
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => toast({ title: "Summary refreshed", description: "Based on 14 messages, 2 bookings and 1 payment.", tone: "info" })}>
                    Refresh
                  </Button>
                </>
              }
            >
              {aiSummaryFor(contact)}
            </AiCallout>

            <section>
              <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Details</h4>
              <div className="divide-y divide-line">
                <MetaRow label="Phone">{contact.phone}</MetaRow>
                <MetaRow label="Email">{contact.email ?? <span className="text-muted">—</span>}</MetaRow>
                {contact.company && <MetaRow label="Company">{contact.company}</MetaRow>}
                <MetaRow label="Stage">
                  <Select
                    aria-label="Change stage"
                    value={contact.stage}
                    onChange={(e) => {
                      onUpdate({ ...contact, stage: e.target.value as Stage });
                      toast({ title: `Stage updated to ${stageMeta[e.target.value as Stage].label}` });
                    }}
                    className="h-7! w-36! py-0! text-xs"
                  >
                    {(Object.keys(stageMeta) as Stage[]).map((s) => (
                      <option key={s} value={s}>
                        {stageMeta[s].label}
                      </option>
                    ))}
                  </Select>
                </MetaRow>
                <MetaRow label="Owner">
                  <Select
                    aria-label="Change owner"
                    value={contact.ownerId}
                    onChange={(e) => {
                      onUpdate({ ...contact, ownerId: e.target.value });
                      toast({ title: `Assigned to ${ownerName(e.target.value)}` });
                    }}
                    className="h-7! w-36! py-0! text-xs"
                  >
                    <option value="ai">AI agent</option>
                    {team.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                </MetaRow>
                <MetaRow label="Source">{contact.source}</MetaRow>
                <MetaRow label="Preferred language">{contact.language}</MetaRow>
                <MetaRow label="Lifetime / deal value">{formatCurrency(contact.value)}</MetaRow>
                <MetaRow label="Created">{formatIsoDate(contact.createdAt)}</MetaRow>
              </div>
            </section>

            <section>
              <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Tags</h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {contact.tags.map((t) => (
                  <Badge key={t} className="pr-1">
                    <Tag /> {t}
                    <button aria-label={`Remove tag ${t}`} className="rounded hover:text-danger" onClick={() => onUpdate({ ...contact, tags: contact.tags.filter((x) => x !== t) })}>
                      <X />
                    </button>
                  </Badge>
                ))}
                {addingTag ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addTag();
                    }}
                  >
                    <Input autoFocus value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onBlur={addTag} placeholder="New tag" className="h-7! w-28! text-xs" />
                  </form>
                ) : (
                  <Button size="xs" variant="ghost" onClick={() => setAddingTag(true)}>
                    <Plus /> Add tag
                  </Button>
                )}
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">Marketing consent</h4>
                <span className="text-[11px] text-muted">DPDP Act 2023 · TRAI DLT</span>
              </div>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {consent.map((c) => {
                  const meta = consentMeta[c.status];
                  return (
                    <li key={c.channel} className="flex items-start gap-3 px-3 py-2.5">
                      <ChannelIcon channel={c.channel} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{channelMeta[c.channel].label} marketing</span>
                          <Badge tone={meta.tone}>
                            <meta.icon /> {meta.label}
                          </Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-muted">
                          {c.source}
                          {c.date !== "—" && ` · ${c.date}`}
                        </div>
                      </div>
                      <Switch checked={c.status === "opted_in"} onChange={(v) => toggleConsent(c.channel, v)} label={`${channelMeta[c.channel].label} marketing consent`} size="sm" />
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {tab === "activity" && (
          <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-px before:bg-line">
            {timeline.map((e) => {
              const meta = timelineIcon[e.type];
              return (
                <li key={e.id} className="relative flex gap-3">
                  <span className={cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-surface", meta.className)}>
                    <meta.icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="font-medium text-fg">{e.title}</span>
                      {e.actor === "AI" && <Badge tone="ai">AI</Badge>}
                    </div>
                    {e.detail && <div className="mt-0.5 text-xs text-muted">{e.detail}</div>}
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                      {e.channel && <ChannelIcon channel={e.channel} size="xs" />}
                      {e.time}
                      {e.actor && e.actor !== "AI" && ` · ${e.actor}`}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {tab === "deals" && (
          <div className="space-y-3">
            {contactDeals.length === 0 ? (
              <EmptyState
                icon={<Briefcase />}
                title="No deals yet"
                description={`Create a deal to track ${first}'s treatment or purchase in the pipeline.`}
                action={
                  <Button size="sm" onClick={() => toast({ title: "Deal created", description: `New lead · ${first} added to Patients – Pune clinics.` })}>
                    <Plus /> New deal
                  </Button>
                }
              />
            ) : (
              contactDeals.map((d) => (
                <div key={d.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{d.title}</div>
                      <div className="text-xs text-muted">{pipelines[d.pipeline].label}</div>
                    </div>
                    <span className="text-sm font-semibold tabular">{formatCurrency(d.value)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={d.stage === "won" ? "success" : d.stage === "lost" ? "danger" : "primary"}>{pipelines[d.pipeline].stages[d.stage]}</Badge>
                    <OwnerChip ownerId={d.ownerId} />
                    <span className="text-xs text-muted">· Next: {d.nextStep}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="space-y-4">
            <div>
              <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Add an internal note about ${first}… use @ to mention a teammate`} />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  disabled={!draft.trim()}
                  onClick={() => {
                    setNotes((n) => [{ id: `n${n.length + 10}`, author: "Priya Sharma", body: draft.trim(), time: "Just now" }, ...n]);
                    setDraft("");
                    toast({ title: "Note added", description: "Only your team can see notes." });
                  }}
                >
                  Add note
                </Button>
              </div>
            </div>
            {notes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No notes yet. Notes are visible to your team only.</p>
            ) : (
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-warning/20 bg-warning-soft/50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <Avatar name={n.author} size="xs" />
                      <span className="font-medium text-fg">{n.author}</span>
                      <span className="text-muted">· {n.time}</span>
                    </div>
                    <p className="text-sm text-fg-2">
                      {n.body.split(/(@\w+)/g).map((part, i) =>
                        part.startsWith("@") ? (
                          <span key={i} className="font-medium text-primary">
                            {part}
                          </span>
                        ) : (
                          part
                        ),
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <PayLinkModal open={payOpen} onClose={() => setPayOpen(false)} defaultContactId={contact.id} />
    </div>
  );
}
